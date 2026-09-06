# Openhead Threat Model

## Asset Classification

- **User Documents**: Content, financial calculations, slides, metadata, embedded images.
- **Local Machine Integrity**: File system, executing processes, network interfaces.
- **AI Context & Prompts**: Private document snippets processed by local or remote inference engines.

## Threat Vectors & Mitigations

| Threat Vector | Potential Impact | Openhead Mitigation |
|---|---|---|
| Malformed DOCX/XLSX XML bomb / XXE | Denial of Service / File extraction | Defensive XML parsing with disabled external entity resolution; strict depth limits. |
| Embedded VBA / Macro Exploits | Arbitrary Code Execution | Macros disabled by default; isolated execution sandbox with explicit opt-in. |
| Formula Injection in CSV / Sum | Unexpected system command execution | Formulas evaluated exclusively in isolated pure-JS formula interpreter; no system shell calls. |
| Accidental AI Data Leakage | Sensitive data sent to third-party LLMs | Local-first AI model abstraction; zero network requests without explicit per-action user authorization. |
| Malicious Hyperlinks / Action Buttons | Phishing / Untrusted navigation | Strict URL scheme validation (`http:`, `https:`, `mailto:` only; `javascript:`, `file:`, `data:` blocked). |
