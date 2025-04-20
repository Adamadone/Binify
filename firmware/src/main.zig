pub const picoSdk = @cImport({
    @cInclude("pico.h");
    @cInclude("stdio.h");
    @cInclude("pico/stdlib.h");
    @cInclude("pico/cyw43_arch.h");
    @cInclude("lwip/pbuf.h");
    @cInclude("lwip/tcp.h");
});

const wifiName = "rpi-hotspot";
const wifiPassword = "password";
const wifiAuthType: u32 = picoSdk.CYW43_AUTH_WPA2_AES_PSK;

const hubHost = "10.42.0.1";
const hubPort = 3000;

export fn main() c_int {
    comptime {
        if (wifiName.len == 0 or wifiPassword.len == 0) {
            @compileError("Wifi name and password must be specified");
        }
    }

    _ = picoSdk.stdio_init_all();

    picoSdk.sleep_ms(1000);

    const wifiInitResult = picoSdk.cyw43_arch_init();

    if (wifiInitResult != 0) {
        _ = picoSdk.printf("Error initiating wifi - %u. Exiting...", wifiInitResult);
        return 1;
    }
    defer picoSdk.cyw43_arch_deinit();

    picoSdk.cyw43_arch_enable_sta_mode();
    defer picoSdk.cyw43_arch_disable_sta_mode();

    const wifi_connection_result = picoSdk.cyw43_arch_wifi_connect_timeout_ms(wifiName, wifiPassword, wifiAuthType, 10000);

    if (wifi_connection_result != 0) {
        _ = picoSdk.printf("Failed to connect to wifi %d\n", wifi_connection_result);
        picoSdk.cyw43_arch_deinit();
        return 1;
    }

    _ = picoSdk.printf("Wifi connected!\n");

    run_tcp_client_test();

    return 0;
}

const TCP_CLIENT_T = extern struct { tcp_pcb: *picoSdk.tcp_pcb, remote_addr: picoSdk.ip_addr_t, buffer: [2048]picoSdk.u_int8_t, buffer_len: c_int, sent_len: c_int, complete: bool, run_count: c_int, connected: bool, dataSent: bool, dataReceived: bool, finnished: bool };

export fn tcp_client_err(arg: ?*anyopaque, err: picoSdk.err_t) void {
    _ = arg;

    if (err != picoSdk.ERR_ABRT) {
        _ = picoSdk.printf("tcp_client_err %d\n", err);
    }
}

export fn tcp_client_connected(arg: ?*anyopaque, tcp_pcb: [*c]picoSdk.tcp_pcb, err: picoSdk.err_t) picoSdk.err_t {
    _ = tcp_pcb;
    const state: *TCP_CLIENT_T = @alignCast(@ptrCast(arg));

    if (err != picoSdk.ERR_OK) {
        _ = picoSdk.printf("Connection failed %d\n", err);
        return err;
    }

    _ = picoSdk.printf("Connection success\n");

    state.*.connected = true;
    return picoSdk.ERR_OK;
}

fn tcp_client_open(state: *TCP_CLIENT_T) bool {
    _ = picoSdk.printf("Connecting to %s port %u\n", picoSdk.ip4addr_ntoa(&state.remote_addr), @as(i32, hubPort));

    const tcp_state: [*c]picoSdk.struct_tcp_pcb = picoSdk.tcp_new_ip_type(picoSdk.IP_GET_TYPE(&state.remote_addr));

    if (tcp_state == null) {
        _ = picoSdk.printf("Failed to create pcb\n");
        return false;
    }

    state.tcp_pcb = tcp_state;
    state.buffer_len = 0;

    picoSdk.tcp_arg(state.tcp_pcb, state);
    picoSdk.tcp_err(state.tcp_pcb, tcp_client_err);
    picoSdk.tcp_recv(state.tcp_pcb, tcp_data_received);

    const err: picoSdk.err_t = picoSdk.tcp_connect(state.tcp_pcb, &state.remote_addr, hubPort, tcp_client_connected);

    _ = picoSdk.printf("Tcp connection return code: %d\n", err);

    return err == picoSdk.ERR_OK;
}

fn tcp_client_init() ?*TCP_CLIENT_T {
    const state_opaque: *anyopaque = picoSdk.calloc(@sizeOf(TCP_CLIENT_T), 1) orelse {
        _ = picoSdk.printf("Failed to allocate state\n");
        return null;
    };

    const state: [*c]TCP_CLIENT_T = @alignCast(@ptrCast(state_opaque));

    _ = picoSdk.ip4addr_aton(hubHost, &state.*.remote_addr);

    return state;
}

fn send_data(state: *TCP_CLIENT_T) picoSdk.err_t {
    _ = picoSdk.printf("Sending request\n");

    const request_content = "GET / HTTP/1.1\r\nHost: example.com:3000\r\n\r\n";

    const err = picoSdk.tcp_write(state.tcp_pcb, request_content, request_content.len, 0x01);

    if (err != picoSdk.ERR_OK) {
        _ = picoSdk.printf("Error writing data to connection: %d\n", err);
        return err;
    }

    _ = picoSdk.tcp_output(state.tcp_pcb);

    state.dataSent = true;

    return picoSdk.ERR_OK;
}

export fn tcp_data_received(state_opaque: ?*anyopaque, tcp_pcb: [*c]picoSdk.struct_tcp_pcb, buffer: [*c]picoSdk.struct_pbuf, err: picoSdk.err_t) picoSdk.err_t {
    _ = picoSdk.printf("receiving data\n");

    const state: [*c]TCP_CLIENT_T = @alignCast(@ptrCast(state_opaque));

    if (buffer == null) {
        return -1;
    }

    if (buffer.*.tot_len > 0) {
        _ = picoSdk.printf("recieving %d err %d\n", buffer.*.tot_len, err);

        var local_buffer = buffer;

        while (local_buffer != null) : (local_buffer = local_buffer.*.next) {
            _ = picoSdk.printf("%s", local_buffer.*.payload);
        }
    }

    _ = picoSdk.printf("\n");

    picoSdk.tcp_recved(tcp_pcb, buffer.*.tot_len);
    state.*.complete = true;

    return picoSdk.ERR_OK;
}

fn tcp_close(state: *TCP_CLIENT_T) void {
    _ = picoSdk.printf("Closing TCP connection\n");

    picoSdk.tcp_arg(state.tcp_pcb, null);
    picoSdk.tcp_err(state.tcp_pcb, null);
    picoSdk.tcp_recv(state.tcp_pcb, null);

    const err = picoSdk.tcp_close(state.tcp_pcb);

    if (err != picoSdk.ERR_OK) {
        _ = picoSdk.printf("close failed %d, calling abort\n", err);
        picoSdk.tcp_abort(state.tcp_pcb);
    }

    state.complete = true;
}

fn run_tcp_client_test() void {
    const state = tcp_client_init();
    defer picoSdk.free(state);

    if (state == null) {
        return;
    }

    if (!tcp_client_open(state.?)) {
        return;
    }
    defer tcp_close(state.?);

    while (!state.?.connected) {
        picoSdk.cyw43_arch_poll();
    }

    if (send_data(state.?) != picoSdk.ERR_OK) {
        return;
    }

    while (!state.?.complete) {
        picoSdk.cyw43_arch_poll();
    }
}
