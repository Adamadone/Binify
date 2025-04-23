const std = @import("std");
const http = @import("http_client.zig");

const Header = http.Header;
const HttpVerb = http.HttpVerb;

// TODO: this probably leaks memory... oh well (maybe not, actually)
pub fn build_raw_request(allocator: std.mem.Allocator, http_verb: HttpVerb, path: []const u8, headers: []const Header, body: ?[]const u8) anyerror![]u8 {
    var req_str = try std.fmt.allocPrint(allocator, "{s} {s} HTTP/1.1\r\n", .{ @tagName(http_verb), path });

    // Format headers and append them to request content
    for (headers) |header| {
        const formated_header = try std.fmt.allocPrint(allocator, "{s}: {s}\r\n", .{ header.key, header.value });
        const req_str_tmp = try std.mem.concat(allocator, u8, &[_][]u8{ req_str, formated_header });

        allocator.free(formated_header);
        allocator.free(req_str);

        req_str = req_str_tmp;
    }

    // Append body and content-length to request if body is not null
    if (body) |non_null_body| {
        const formated_size_header = try std.fmt.allocPrint(allocator, "Content-Length: {d}\r\n", .{non_null_body.len});
        const req_str_tmp = try std.mem.concat(allocator, u8, &[_][]const u8{ req_str, formated_size_header, "\r\n", non_null_body });

        allocator.free(formated_size_header);
        allocator.free(req_str);

        req_str = req_str_tmp;
    }

    const req_str_tmp = try std.mem.concat(allocator, u8, &[_][]const u8{ req_str, "\r\n" });

    allocator.free(req_str);

    req_str = req_str_tmp;

    return req_str;
}
