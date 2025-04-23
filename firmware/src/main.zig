pub const picoSdk = @cImport({
    @cInclude("pico.h");
    @cInclude("stdio.h");
    @cInclude("pico/stdlib.h");
    @cInclude("pico/cyw43_arch.h");
    @cInclude("lwip/pbuf.h");
    @cInclude("lwip/tcp.h");
});

const std = @import("std");
const http = @import("http_client.zig");

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

    // Since pico sdk ships with a c allocator, we can leverage the Zig wrapper for raw C allocators
    // Maybe we could be more fancy and use it as a backing allocator for some better debug allocator, but that is to much work for now
    const allocator = std.heap.raw_c_allocator;

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

    const http_client = http.HttpClient(hubHost, hubPort).open(&allocator) catch |err| {
        _ = picoSdk.printf("HTTP Error: %s\n", @errorName(err).ptr);
        return 1;
    };
    defer http_client.close();

    const response = http_client.send(http.HttpVerb.GET, "/", &[_]http.Header{.{ .key = "Host", .value = "example.com:3000" }}, null) catch |err| {
        _ = picoSdk.printf("Error sending request: %s\n", @errorName(err).ptr);
        return 1;
    };
    defer allocator.free(response);

    return 0;
}
