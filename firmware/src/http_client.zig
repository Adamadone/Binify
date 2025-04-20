// const picoSdk = @cImport({
//     @cInclude("pico.h");
//     @cInclude("stdio.h");
//     @cInclude("pico/stdlib.h");
//     @cInclude("pico/cyw43_arch.h");
//     @cInclude("lwip/pbuf.h");
//     @cInclude("lwip/tcp.h");
// });
// const std = @import("std");

// fn printf(string: []const u8) void {
//     _ = picoSdk.printf(string);
// }

// pub const ConnectionError = error{couldNotConnect};
// pub const SendError = error{bodyNotSpecified};

// pub const Header = struct {
//     key: []const u8,
//     value: []const u8,
// };

// pub const HTTPVerb = enum { GET, POST };

// pub const responseHandler: type = fn () void;
// pub const errorHandler: type = fn () void;

// const POLL_TIME_MS: u32 = 1000;

// fn connectedCallback(arg: ?*anyopaque, tcp_pcb: [*c]picoSdk.struct_tcp_pcb, err: picoSdk.err_t) callconv(.C) i8 {
//     _ = arg;
//     _ = tcp_pcb;
//     _ = err;

//     _ = picoSdk.printf("Connection callback called.");

//     return picoSdk.ERR_OK;
// }

// pub fn HttpClient(comptime host: []const u8, comptime port: picoSdk.u16_t) type {
//     if (host.len == 0 or port == 0) {
//         @compileError("Host and port must be specified");
//     }

//     return struct {
//         const Self = @This();

//         remoteAddr: picoSdk.ip_addr_t,
//         connState: picoSdk.tcp_pcb,
//         connectionSuccess: bool,
//         remainingConnTimeout: i64,

//         pub fn open(timeoutMs: u32) ConnectionError!Self {
//             var self = std.mem.zeroInit(Self, .{});

//             self.connectionSuccess = false;
//             self.remainingConnTimeout = @intCast(timeoutMs);
//             _ = picoSdk.ip4addr_aton(host.ptr, &self.remoteAddr);
//             self.connState = picoSdk.tcp_new_ip_type(picoSdk.IP_GET_TYPE(&self.remoteAddr)).*;

//             picoSdk.cyw43_arch_lwip_begin();
//             _ = picoSdk.tcp_connect(&self.connState, &self.remoteAddr, port, &connectedCallback);
//             picoSdk.cyw43_arch_lwip_end();

//             // if (err == picoSdk.err_t) {
//             //     return ConnectionError.couldNotConnect;
//             // }

//             _ = picoSdk.printf("Waiting for connection\n");
//             picoSdk.sleep_ms(POLL_TIME_MS);

//             while (true) {
//                 if (self.connectionSuccess == true) {
//                     return self;
//                 }

//                 self.remainingConnTimeout -= @intCast(POLL_TIME_MS);
//                 _ = picoSdk.printf("Waiting for connection\n");
//                 picoSdk.cyw43_arch_wait_for_work_until(picoSdk.make_timeout_time_ms(POLL_TIME_MS));
//             }

//             return ConnectionError.couldNotConnect;
//         }

//         pub fn send(self: *Self, method: HTTPVerb, path: []const u8, headers: ?[]const Header, body: ?[]const u8, onResponse: responseHandler, onError: errorHandler) !void {
//             if (method == HTTPVerb.POST and body == null) {
//                 return SendError.bodyNotSpecified;
//             }

//             _ = headers;
//             _ = self;
//             _ = path;
//             _ = onResponse;
//             _ = onError;
//         }
//     };
// }
