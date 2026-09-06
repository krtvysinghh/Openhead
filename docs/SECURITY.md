# Openhead Office — Security & Isolation Architecture

## 1. Zero-Trust Security Invariants

Openhead is built with strict privacy and defensive security guarantees:

1. **Zero Outgoing Telemetry**: No user document content, metadata, keystrokes, or diagnostics are ever transmitted to third-party servers. All telemetry channels are structurally blocked by `ZeroTelemetryPolicy`.
2. **Local-First AI Execution**: AI features run against local LLMs (e.g. Ollama, llama.cpp, LocalAI) or strictly user-configured endpoints. No silent background prompt dispatch occurs.
3. **No VBA / Dynamic Code Execution**: Openhead rejects VBA macros, malicious binary controls, ActiveX components, and external DDE formulas.
4. **Sandboxed OpenXML Parsing**: All DOCX, XLSX, and PPTX imports pass through XML depth, entity expansion, and path traversal sanitizers (`sanitizeXmlInput`, `ZipTraversalGuard`).
5. **Sandboxed Extensibility**: Plugins operate under explicit, user-granted granular permissions (`document:read`, `document:write`, `commands:register`, `formulas:register`). File system, outbound network, and raw process access are blocked by default.

## 2. Threat Vector Mitigation Matrix

| Threat Vector | Attack Scenario | Openhead Defense Mechanism |
| :--- | :--- | :--- |
| **Billion Laughs / XML Bomb** | Recursive entity expansion (`&lol9;`) in document.xml | XML Entity Expansion limiter blocks nested declarations before DOM parse. |
| **Zip Slip / Path Traversal** | Malicious archive entries (e.g., `../../etc/passwd`) | `ZipTraversalGuard` normalizes and validates all ZIP part names before extraction. |
| **Formula Injection (CSV/XLSX)** | Injected commands like `=cmd|' /C calc'!A0` | Unsafe DDE and shell formula calls return `#NAME?` or `#REF!` and are not evaluated. |
| **Hostile Hyperlinks** | `javascript:...` or `data:...` URIs disguised as links | Strict protocol allowlist (`http:`, `https:`, `mailto:`) in Pen and Glimpse rendering. |
| **Plugin Privilege Escalation** | Plugin calling arbitrary system APIs | `PluginManager` enforces granular permission checks on all command and formula registrations. |
| **Crash & Data Loss** | Sudden OS shutdown or power outage | `StorageManager` uses atomic temp-file swaps and SHA-256 integrity checksums. |

## 3. Sandboxed Storage & Checksum Verification

Every document save operation writes to an atomic journal entry with an SHA-256 integrity hash:
```
Document State -> Serialize -> Calculate Checksum -> Atomic Write -> Verify -> Commit
```
If corruption or tampering is detected upon read, `StorageManager` quarantines the damaged entry and alerts the user without crashing the application.
