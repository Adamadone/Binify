const picoSdk = @cImport({
    @cInclude("pico.h");
    @cInclude("stdio.h");
    @cInclude("pico/stdlib.h");
    @cInclude("pico/cyw43_arch.h");
    @cInclude("lwip/pbuf.h");
    @cInclude("lwip/tcp.h");
});

const std = @import("std");
const requestBuilder = @import("http_request_builder.zig");

// TODO: Add timeouts to connect() and send() ?
pub fn HttpClient(comptime host_ip: []const u8, comptime host_port: u16) type {
    if (host_ip.len == 0 or host_port <= 0) {
        @compileError("Incorrect IP address or port");
    }

    return struct {
        const self = @This();

        // Allocators should normally be passed by value, but we have to pass it by reference here, since we need a pointer to
        // an allocator that has a longer lifetime that the open() function's closure. We will be passing a pointer
        // to this allocator to lwIP's callback on receiving data, so we can concat all the data into a single slice inside the callback. (Or am i tripping?)
        allocator: *const std.mem.Allocator,
        conn_state: *ConnState,
        remote_ip: picoSdk.ip_addr_t,

        pub fn open(allocator: *const std.mem.Allocator) HttpError!*self {
            _ = printf("Creating TCP connection\n");

            var remote_ip: picoSdk.ip4_addr_t = .{};

            // Convert IP string into an IP struct describing the target host
            const ip_result = picoSdk.ip4addr_aton(host_ip.ptr, &remote_ip);

            // the function above returns 1 on success..... WTF?
            if (ip_result == 0) {
                return HttpError.IpParsingError;
            }

            // Create internal state for lwIP for this connection
            const tcp_pcb = picoSdk.tcp_new_ip_type(picoSdk.IP_GET_TYPE(remote_ip));

            if (tcp_pcb == null) {
                return HttpError.TcpPcbCreationError;
            }

            const conn_state = allocator.create(ConnState) catch return HttpError.OutOfMemory;
            conn_state.* = .{ .tcp_pcb = tcp_pcb, .allocator = allocator };

            const http_client = allocator.create(self) catch return HttpError.OutOfMemory;
            http_client.* = .{ .allocator = allocator, .conn_state = conn_state, .remote_ip = remote_ip };

            // Set callbacks and arg for lwIP
            // arg pointer will be passed into all lwIP callbacks as our state
            picoSdk.tcp_arg(http_client.conn_state.tcp_pcb, http_client.conn_state);
            picoSdk.tcp_err(http_client.conn_state.tcp_pcb, tcp_err_callback);
            picoSdk.tcp_recv(http_client.conn_state.tcp_pcb, tcp_data_received_callback);

            const conn_err = picoSdk.tcp_connect(http_client.conn_state.tcp_pcb, &http_client.remote_ip, host_port, tcp_connected_callback);

            if (conn_err != picoSdk.ERR_OK and conn_err != picoSdk.ERR_ISCONN) {
                return map_code_to_error(conn_err);
            }

            // We need to poll lwIP for work until it connects, otherwise it will just do nothing
            while (http_client.conn_state.connected == 0) {
                picoSdk.cyw43_arch_poll();
            }

            if (http_client.conn_state.err != 0) {
                return map_code_to_error(http_client.conn_state.err);
            }

            return http_client;
        }

        pub fn send(this: *self, http_verb: HttpVerb, path: []const u8, headers: []const Header, body: ?[]const u8) HttpError![]u8 {
            _ = printf("Sending data\n");

            const request_string = requestBuilder.build_raw_request(this.allocator.*, http_verb, path, headers, body) catch return HttpError.OutOfMemory;
            defer this.allocator.free(request_string);

            const write_err = picoSdk.tcp_write(this.conn_state.tcp_pcb, request_string.ptr, @intCast(request_string.len), 0x01); // 0x01 tells lwIP how to handle the data string - https://www.nongnu.org/lwip/2_1_x/group__tcp__raw.html#ga6b2aa0efbf10e254930332b7c89cd8c5

            if (write_err != picoSdk.ERR_OK) {
                return map_code_to_error(write_err);
            }

            while (this.conn_state.received == 0) {
                picoSdk.cyw43_arch_poll();
            }

            if (this.conn_state.err != 0) {
                return map_code_to_error(this.conn_state.err);
            }

            if (this.conn_state.recv_data) |data| {
                return data[0..this.conn_state.recv_data_size_bytes];
            } else {
                return HttpError.UnknownError;
            }
        }

        pub fn close(this: *self) void {
            _ = printf("Closing TCP connection\n");

            picoSdk.tcp_arg(this.conn_state.tcp_pcb, null);
            picoSdk.tcp_err(this.conn_state.tcp_pcb, null);
            picoSdk.tcp_recv(this.conn_state.tcp_pcb, null);

            const err = picoSdk.tcp_close(this.conn_state.tcp_pcb);

            if (err != picoSdk.ERR_OK) {
                _ = printf("close failed %d, calling abort\n", err);
                picoSdk.tcp_abort(this.conn_state.tcp_pcb);
            }

            this.allocator.destroy(this.conn_state);
            this.allocator.destroy(this);

            _ = printf("TCP Connection closed\n");
        }
    };
}

export fn tcp_connected_callback(arg: ?*anyopaque, tcp_pcb: [*c]picoSdk.tcp_pcb, err: picoSdk.err_t) picoSdk.err_t {
    _ = printf("Connection opened\n");

    _ = tcp_pcb;
    const state: [*c]ConnState = @alignCast(@ptrCast(arg));

    if (err != picoSdk.ERR_OK) {
        _ = picoSdk.printf("Connection failed %d\n", err);
        state.*.err = err;
        return err;
    }

    state.*.connected = 1;

    return picoSdk.ERR_OK;
}

export fn tcp_data_received_callback(state_opaque: ?*anyopaque, tcp_pcb: [*c]picoSdk.struct_tcp_pcb, buffer: [*c]picoSdk.struct_pbuf, err: picoSdk.err_t) picoSdk.err_t {
    _ = printf("Receiving data\n");

    const state: *ConnState = @alignCast(@ptrCast(state_opaque));

    if (buffer == null) {
        return -1;
    }

    if (buffer.*.tot_len > 0) {
        _ = picoSdk.printf("Recieving %d err %d\n", buffer.*.len, err);

        const response_buffer: []u8 = state.*.allocator.alloc(u8, buffer.*.tot_len) catch return picoSdk.ERR_MEM;

        // This copies the entire pbuf data into our own contiguous buffer for better handling, but it forces us to free it ourselves later... too bad!
        _ = picoSdk.pbuf_copy_partial(buffer, response_buffer.ptr, buffer.*.tot_len, 0);

        state.recv_data = response_buffer.ptr;
        state.recv_data_size_bytes = @intCast(response_buffer.len);
    }

    picoSdk.tcp_recved(tcp_pcb, buffer.*.tot_len);
    _ = picoSdk.pbuf_free(buffer);
    state.received = 1;

    _ = picoSdk.printf("All data received\n");

    return picoSdk.ERR_OK;
}

export fn tcp_err_callback(arg: ?*anyopaque, err: picoSdk.err_t) void {
    _ = arg;

    if (err != picoSdk.ERR_ABRT) {
        _ = picoSdk.printf("tcp_client_err %d\n", err);
    }
}

const printf = picoSdk.printf;
const calloc = picoSdk.calloc;
const free = picoSdk.free;

const ConnState = extern struct {
    tcp_pcb: *picoSdk.tcp_pcb,
    // C cannot work with Zig-style errors, so we have to use it's number representation instead... bummer
    err: i8 = 0,
    connected: u8 = 0,
    received: u8 = 0,
    recv_data: ?[*]u8 = null,
    recv_data_size_bytes: u16 = 0,
    // We need an allocator in the receive callback, but we cannot pass it by value because
    // Zig allocators are probably not C ABI compatible, so we store a pointer to it.
    // We also need it to live longer than the connect() function.
    allocator: *const std.mem.Allocator,
};

pub const Header = struct { key: []const u8, value: []const u8 };

pub const HttpVerb = enum { GET, POST };

// Stuff to map lwIP errors to Zig errors (with some added custom errors) - https://www.nongnu.org/lwip/2_0_x/group__infrastructure__errors.html
const HttpError = error{ OutOfMemory, BufferError, Timeout, RoutingProblem, OperationInProgress, IllegalValue, OperationWouldBlock, AddressInUse, AlreadyConnecting, ConnAlreadyEstablished, NotConnected, LowLevelNetifError, ConnAborted, ConnReset, ConnClosed, IllegalArgument, UnknownError, TcpPcbCreationError, IpParsingError, BodyNotPermited };

fn map_code_to_error(err_code: picoSdk.err_t) HttpError {
    return switch (err_code) {
        -1 => HttpError.OutOfMemory,
        -2 => HttpError.BufferError,
        -3 => HttpError.Timeout,
        -4 => HttpError.RoutingProblem,
        -5 => HttpError.OperationInProgress,
        -6 => HttpError.IllegalValue,
        -7 => HttpError.OperationWouldBlock,
        -8 => HttpError.AddressInUse,
        -9 => HttpError.AlreadyConnecting,
        -10 => HttpError.ConnAlreadyEstablished,
        -11 => HttpError.NotConnected,
        -12 => HttpError.LowLevelNetifError,
        -13 => HttpError.ConnAborted,
        -14 => HttpError.ConnReset,
        -15 => HttpError.ConnClosed,
        -16 => HttpError.IllegalArgument,
        else => HttpError.UnknownError,
    };
}

const result = struct {
    data: [*]u8,
    data_length: u16,
};
