pub const picoSdk = @cImport({
    @cInclude("pico.h");
    @cInclude("stdio.h");
    @cInclude("pico/stdlib.h");
    @cInclude("pico/cyw43_arch.h");
    @cInclude("lwip/pbuf.h");
    @cInclude("lwip/tcp.h");
    @cInclude("hardware/adc.h");
});

const builtin = @import("builtin");

const std = @import("std");
const DistanceSensor = @import("distance_sensor.zig").DistanceSensor;
const AirSensor = @import("air_sensor.zig").AirSensor;
const http = @import("http_client.zig");

const wifiName = "rpi-hotspot";
const wifiPassword = "password";
const wifiAuthType: u32 = picoSdk.CYW43_AUTH_WPA2_AES_PSK;

const hubHost = "10.42.0.1";
const hubPort = 3000;

const distance_trigger_pin: u8 = 1;
const distance_echo_pin: u8 = 0;
const air_gpio_pin = 28;
const air_adc_pin = 2;
const measured_min = 0.14;
const measured_max = 0.40;
const out_min = 1.0;
const out_max = 2500.0;

const device_id = "8090b8b7-5778-4e29-8c49-a2336d3fb20d";

const req_body_template =
    \\  {{
    \\      "deviceId": "{s}",
    \\      "measurment": {{
    \\          "distanceCentimeters": {d},
    \\          "airQualityPpm": {d}
    \\      }}
    \\  }}
;

export fn main() c_int {
    comptime {
        if (wifiName.len == 0 or wifiPassword.len == 0) {
            @compileError("Wifi name and password must be specified");
        }
    }

    _ = picoSdk.stdio_init_all();

    // Since pico sdk ships with a c allocator, we can leverage the Zig wrapper for raw C allocators
    // Maybe we could be more fancy and use it as a backing allocator for some better debug allocator, but that is too much work for now
    const allocator = std.heap.raw_c_allocator;

    picoSdk.sleep_ms(12000);

    const air_sensor: AirSensor = AirSensor{ .gpio_pin = air_gpio_pin, .adc_pin = air_adc_pin };
    const distance_sensor: DistanceSensor = DistanceSensor{ .trigger_pin = distance_trigger_pin, .echo_pin = distance_echo_pin };

    while (true) {
        defer {
            _ = picoSdk.printf("Sleeping...\n");
            picoSdk.sleep_ms(1000 * 60 * 5);
        }

        _ = picoSdk.printf("Measuring ADC voltage\n");

        const air_quality_voltage = air_sensor.measure_voltage();
        picoSdk.sleep_ms(100);
        const air_quality_voltage2 = air_sensor.measure_voltage();
        picoSdk.sleep_ms(100);
        const air_quality_voltage3 = air_sensor.measure_voltage();

        const air_quality_avg = (air_quality_voltage + air_quality_voltage2 + air_quality_voltage3) / 3.0;

        const air_quality_scaled = out: {
            const scaled_quality = scale(air_quality_avg, measured_min, measured_max, out_min, out_max);
            if (scaled_quality > out_max) {
                break :out out_max;
            } else if (scaled_quality < out_min) {
                break :out out_min;
            }
            break :out scaled_quality;
        };

        _ = picoSdk.printf("Voltage: %f V\n", air_quality_scaled);

        const distance_cm = distance_sensor.measure_distance_cm() catch {
            _ = picoSdk.printf("Max measure time exceeded\n");
            return 1;
        };
        picoSdk.sleep_ms(100);

        const distance_cm2 = distance_sensor.measure_distance_cm() catch {
            _ = picoSdk.printf("Max measure time exceeded\n");
            return 1;
        };
        picoSdk.sleep_ms(100);

        const distance_cm3 = distance_sensor.measure_distance_cm() catch {
            _ = picoSdk.printf("Max measure time exceeded\n");
            return 1;
        };

        const distance_cm_avg = (distance_cm + distance_cm2 + distance_cm3) / 3.0;

        _ = picoSdk.printf("Distance: %f cm\n", distance_cm_avg);

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

        const body = std.fmt.allocPrint(allocator, req_body_template, .{ device_id, distance_cm_avg, air_quality_scaled }) catch {
            _ = picoSdk.printf("Out of memory\n");
            return 1;
        };
        defer allocator.free(body);

        const response = http_client.send(http.HttpVerb.POST, "/measurments", &[_]http.Header{ .{ .key = "Host", .value = "example.com:3000" }, .{ .key = "Content-Type", .value = "application/json" } }, body) catch |err| {
            _ = picoSdk.printf("Error sending request: %s\n", @errorName(err).ptr);
            return 1;
        };
        defer allocator.free(response);

        _ = picoSdk.printf("%s", response.ptr);
    }

    _ = picoSdk.printf("Exiting...\n");

    return 0;
}

fn scale(number: f32, inMin: f32, inMax: f32, outMin: f32, outMax: f32) f32 {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
