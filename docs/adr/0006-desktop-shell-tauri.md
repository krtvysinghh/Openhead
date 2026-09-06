# ADR 0006: Tauri 2.0 Desktop Shell Architecture

## Status
Accepted

## Context
Users require a native, high-performance desktop experience on macOS, Windows, and Linux without the massive memory overhead, background telemetry, or bundle bloat associated with legacy Electron runtimes.

## Decision
Adopt **Tauri 2.0** as the official desktop runtime shell for Openhead Office:
1. Use Rust for the native OS integration layer, providing minimal binary footprint (<15 MB installer vs >150 MB for Electron).
2. Utilize native OS webviews (WebKit on macOS, WebView2 on Windows, WebKitGTK on Linux).
3. Enforce strict Content Security Policy (`CSP`) restricting network communication to local endpoints (`localhost`, `127.0.0.1`) only.
4. Manage cross-platform dialogs, native file system access, and window controls via granular Tauri capabilities.

## Consequences
- Ultra-low memory consumption (~40 MB baseline RAM vs ~200 MB+).
- Rapid cold-start startup latency (<200 ms).
- Native OS look-and-feel with zero bundled browser engine vulnerabilities.
