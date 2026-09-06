<div align="center">

# 🌌 Openhead Office Suite

**The Sovereign, Local-First, High-Performance Office Suite.**

*Completely Open Source · Zero Telemetry · Office OpenXML Interoperable · Local-First AI · Cross-Platform Desktop & Mobile · Blazing Fast*

---

[![CI](https://github.com/krtvysinghh/Openhead/actions/workflows/ci.yml/badge.svg)](https://github.com/krtvysinghh/Openhead/actions)
[![Release](https://github.com/krtvysinghh/Openhead/actions/workflows/release.yml/badge.svg)](https://github.com/krtvysinghh/Openhead/actions)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-325%20passing-brightgreen.svg)](https://github.com/krtvysinghh/Openhead)
[![Release](https://img.shields.io/badge/Release-v1.0.0-indigo.svg)](https://github.com/krtvysinghh/Openhead/releases/tag/v1.0.0)

[**Download v1.0.0**](https://github.com/krtvysinghh/Openhead/releases/tag/v1.0.0) • [**Documentation**](docs/) • [**Self-Hosting**](docs/SELF_HOSTING.md) • [**Security & Threat Model**](docs/SECURITY.md)

</div>

---

## 🌟 Overview

**Openhead** is a modern, privacy-first office productivity suite engineered from first principles as an uncompromising, open-source alternative to Microsoft Office and Google Workspace. Openhead runs completely offline, enforces an invariant **Zero-Telemetry Policy**, delivers bi-directional Office OpenXML fidelity, and integrates local-first AI without cloud lock-in.

The suite unifies three core applications in a seamless desktop and web workspace:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 OPENHEAD STUDIO SHELL                   │
                  │  (Unified Switcher · Command Palette · Safe Automation) │
                  └───────┬───────────────────┬───────────────────┬─────────┘
                          │                   │                   │
                          ▼                   ▼                   ▼
                  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
                  │   🖋️ PEN     │    │   📊 SUM     │    │  📽️ GLIMPSE  │
                  │  (Documents) │    │(Spreadsheets)│    │(Presentations│
                  │  .docx / .odt│    │ .xlsx / .ods │    │ .pptx / .odp │
                  └──────────────┘    └──────────────┘    └──────────────┘
                          │                   │                   │
                          └───────────────────┴───────────────────┘
                                              │
                                              ▼
                                 ┌─────────────────────────┐
                                 │   SHARED CORE ENGINES   │
                                 │  • Formula Pratt Parser │
                                 │  • Dependency DAG Graph │
                                 │  • Local AI Provider    │
                                 │  • Atomic Checksums     │
                                 │  • Zero-Telemetry Guard │
                                 └─────────────────────────┘
```

---

## 🚀 The Three Flagship Engines

| Product | Focus | Key Capabilities |
|---|---|---|
| **🖋️ Pen** | Document Processor | Rich-text typesetting, AST-driven styling, multi-section page layouts, multi-level lists, nested tables, footnotes/endnotes, threaded comments, tracked revisions, offline spellchecker, search/replace, and bi-directional **DOCX** import/export. |
| **📊 Sum** | Spreadsheet Engine | Topological DAG recalculation, 90+ Excel-compatible formula functions, dynamic array spill engine (`FILTER`, `SORT`, `UNIQUE`, `SEQUENCE`), AutoFilter, defined names, merged cells, cell comments, auto-fill series, and high-fidelity **XLSX** import/export. |
| **📽️ Glimpse** | Presentation Engine | Vector scene-graph canvas, slide masters, keyframe animations, connectors with auto-routing, theme palettes, DrawingML charts (`bar`, `column`, `line`, `pie`, `area`), slide tables, Presenter Mode with notes, and **PPTX** round-trip fidelity. |

---

## 📥 Official Download & Distribution (v1.0.0)

All releases are cryptographically hashed. Verify integrity using [`Openhead-1.0.0-checksums.txt`](https://github.com/krtvysinghh/Openhead/releases/download/v1.0.0/Openhead-1.0.0-checksums.txt) and [`Openhead-1.0.0-manifest.json`](https://github.com/krtvysinghh/Openhead/releases/download/v1.0.0/Openhead-1.0.0-manifest.json).

| Platform / Target | Download Link | Format | Details |
|---|---|---|---|
| **macOS (Apple Silicon)** | [**Openhead-1.0.0-macOS-arm64.dmg**](https://github.com/krtvysinghh/Openhead/releases/download/v1.0.0/Openhead-1.0.0-macOS-arm64.dmg) | `.dmg` | Native Apple Silicon (M1/M2/M3/M4) drag-and-drop installer. |
| **macOS App Bundle** | [**Openhead-1.0.0-macOS-arm64.app.tar.gz**](https://github.com/krtvysinghh/Openhead/releases/download/v1.0.0/Openhead-1.0.0-macOS-arm64.app.tar.gz) | `.tar.gz` | Direct standalone `.app` archive. |
| **Web Studio (Offline)** | [**Openhead-1.0.0-WebStudio-Standalone.zip**](https://github.com/krtvysinghh/Openhead/releases/download/v1.0.0/Openhead-1.0.0-WebStudio-Standalone.zip) | `.zip` | Pure static SPA for offline browser use or static web hosting. |
| **Docker Self-Hosted** | [**Openhead-1.0.0-Docker-SelfHosted.tar.gz**](https://github.com/krtvysinghh/Openhead/releases/download/v1.0.0/Openhead-1.0.0-Docker-SelfHosted.tar.gz) | `.tar.gz` | Dockerfile + docker-compose + hardened Nginx configuration. |
| **Windows / Linux** | [**Automated CI Releases**](https://github.com/krtvysinghh/Openhead/actions) | `.msi` / `.AppImage` / `.deb` | Automated cross-platform release builds via GitHub Actions. |
| **Source Code** | [**v1.0.0.zip**](https://github.com/krtvysinghh/Openhead/archive/refs/tags/v1.0.0.zip) | `.zip` | Full reproducible source tree. |

---

## 🛡️ Security, Privacy & Zero-Telemetry Guarantee

Openhead is built on a strict **zero-telemetry, offline-first security model**:

1. **No External Telemetry**: Zero background beacons, Google Analytics, Sentry, or third-party phone-home scripts. Outbound requests are blocked at runtime.
2. **Local-First AI Sandboxing**: AI capabilities connect strictly to local inference engines (Ollama on `127.0.0.1:11434`, LM Studio on `127.0.0.1:1234`). All edits provide word-level diff previews and require explicit user acceptance.
3. **Hostile Document Hardening**:
   - **VBA Macro Quarantine**: Macros are stripped upon import; binary macro execution is permanently disabled.
   - **Formula Injection Defense**: CSV and formula imports neutralize command execution triggers (`=`, `+`, `-`, `@`).
   - **XML Expansion Defense**: Hardened parsers reject Billion Laughs and XXE payloads.
   - **Zip Slip Mitigation**: Archive extractors sanitize all entry paths and enforce decompression size boundaries.
4. **Atomic Storage & Checksum Verification**: Every document write is verified with a CRC checksum journal to prevent silent file corruption.

---

## 🐳 Self-Hosting with Docker

Deploy your private Openhead Office instance in a single command:

```bash
docker run -d \
  --name openhead \
  -p 8080:8080 \
  --restart unless-stopped \
  ghcr.io/krtvysinghh/openhead:1.0.0
```

Access the suite in your browser at `http://localhost:8080`.

Or with Docker Compose:

```yaml
version: "3.8"
services:
  openhead:
    image: ghcr.io/krtvysinghh/openhead:1.0.0
    container_name: openhead-office
    restart: unless-stopped
    ports:
      - "8080:8080"
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/cache/nginx
      - /var/run
```

See [`docs/SELF_HOSTING.md`](docs/SELF_HOSTING.md) for reverse proxy and TLS setup.

---

## ⌨️ Global Keyboard Shortcuts

| Shortcut | Action | Scope |
|---|---|---|
| `Ctrl+K` / `Cmd+K` | Open Universal Command Palette | Global |
| `Ctrl+T` / `Cmd+T` | Open Office Template Picker | Global |
| `Ctrl+Shift+F` | Unified Full-Text Document Search | Global |
| `F1` or `?` | Help & Keyboard Shortcuts Reference | Global |
| `Ctrl+S` / `Cmd+S` | Save Document to Local Storage / Disk | Global |
| `Ctrl+Z` / `Ctrl+Y` | Undo / Redo Transaction | Pen, Sum, Glimpse |
| `F2` | Enter Cell Edit Mode | Sum (Sheets) |
| `F5` | Launch Fullscreen Presenter Mode | Glimpse (Slides) |

---

## 🛠️ Building from Source

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`
- **Rust**: `>= 1.75` (Required for native desktop binaries)

```bash
# 1. Clone the repository
git clone https://github.com/krtvysinghh/Openhead.git
cd Openhead

# 2. Install workspace dependencies
pnpm install --frozen-lockfile

# 3. Run the comprehensive test suite (325 passing tests)
pnpm test

# 4. Build all packages and the web application
pnpm run build

# 5. Launch Openhead Studio in development mode
pnpm dev

# 6. Build native desktop installer (macOS / Windows / Linux)
pnpm tauri build
```

---

## 📊 Verification & Automated Testing

Openhead enforces rigorous automated quality gates:

- **325 Automated Tests** passing across 86 test suites (`pnpm test`).
- **Real-World Office Interoperability**: Validated against comprehensive DOCX, XLSX, and PPTX compatibility corpora.
- **Structural Regression Testing**: AST snapshot comparisons verifying deterministic, loss-free roundtrip serialization.
- **Security Corpus**: 12 attack vectors tested including Zip Slip, Billion Laughs, formula injection, and macro quarantine.

---

## 📄 License

Openhead is open-source software licensed under the **[Apache-2.0 License](LICENSE)**.
