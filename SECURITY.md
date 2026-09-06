# Security Policy

## Reporting Security Vulnerabilities

We take the security and privacy of Openhead users very seriously. If you discover a security vulnerability, please report it via private disclosure rather than opening a public issue.

Email security reports to: **security@openhead.org** (or use GitHub Private Vulnerability Reporting).

## Security Philosophy

1. **Untrusted Office Input**: All imported documents (DOCX, XLSX, PPTX, CSV) are treated as untrusted data. Parsers operate in sandboxed memory spaces and reject malformed structures.
2. **No Macro Execution by Default**: VBA and embedded macros are never automatically executed.
3. **Zero Telemetry**: Openhead does not transmit document contents, analytics, or behavioral telemetry to external servers.
4. **Cryptographic Integrity**: Official release artifacts are cryptographically signed and accompanied by Software Bill of Materials (SBOM).
