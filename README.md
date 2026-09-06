# Openhead Office Suite

<div align="center">

**The Sovereign, Local-First, High-Performance Office Suite.**

*Open Source · Zero Telemetry · Office OpenXML Interoperable · Local-First AI · Cross-Platform Desktop & Mobile · Blazing Fast*

[![CI](https://github.com/krtvysinghh/Openhead/actions/workflows/ci.yml/badge.svg)](https://github.com/krtvysinghh/Openhead/actions)
[![Release](https://github.com/krtvysinghh/Openhead/actions/workflows/release.yml/badge.svg)](https://github.com/krtvysinghh/Openhead/actions)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-324%20passing-brightgreen.svg)](https://github.com/krtvysinghh/Openhead)

</div>

---

## 🌟 Overview

Openhead is a modern, privacy-first office productivity suite designed as a serious Microsoft Office alternative. Built from first principles, Openhead delivers uncompromising performance, rich visual fidelity, and local-first AI without corporate lock-in or background telemetry.

Openhead contains three flagship applications unified in a cohesive office shell:

| Product | Role | Key Capabilities |
|---|---|---|
| **Pen** | Document Processor | Rich-text typesetting, AST-driven styling, sections, multi-level lists, tables, footnotes/endnotes, headers/footers, threaded comments, tracked changes, search/replace, and bi-directional DOCX import/export. |
| **Sum** | Spreadsheet Engine | DAG-based topological recalculation, 90+ Excel-compatible functions, dynamic arrays, spill ranges, AutoFilter, defined names, merged cells, cell comments, auto-fill series, styles, and high-fidelity XLSX import/export. |
| **Glimpse** | Presentation Engine | Scene-graph slide canvas, vector shapes, master layouts, keyframe animations, connectors, theme palettes, DrawingML charts, tables, slide transitions, presenter notes, and PPTX round-trip fidelity. |

---

## 📥 Download & Distribution (v1.0.0)

Every official release artifact is accompanied by cryptographic SHA-256 checksums in [`Openhead-1.0.0-checksums.txt`](https://github.com/krtvysinghh/Openhead/releases) and machine-readable metadata in [`Openhead-1.0.0-manifest.json`](https://github.com/krtvysinghh/Openhead/releases).

| Platform | Format / Target | Distribution Channel | Status / Signing |
|---|---|---|---|
| **Windows (x64)** | `.msi` / `.exe` | [GitHub Releases](https://github.com/krtvysinghh/Openhead/releases) | Standalone Installer (Code-signing pipeline ready) |
| **macOS (Universal)** | `.dmg` (Apple Silicon & Intel) | [GitHub Releases](https://github.com/krtvysinghh/Openhead/releases) | Drag-and-drop DMG (Notarization pipeline ready) |
| **Linux (x86_64)** | `.AppImage` / `.deb` / `.rpm` | [GitHub Releases](https://github.com/krtvysinghh/Openhead/releases) | Direct execution / APT & RPM package |
| **Android** | `.apk` (Direct) / `.aab` (Store) | [GitHub Releases](https://github.com/krtvysinghh/Openhead/releases) / Play Store | Direct APK download (Keystore signing pipeline ready) |
| **iOS / iPadOS** | `.ipa` / TestFlight | Apple TestFlight / App Store | Archive build pipeline (Apple Provisioning ready) |
| **Docker (Self-Hosted)** | Multi-arch OCI Image | `ghcr.io/krtvysinghh/openhead:1.0.0` | Minimal, non-root hardened container |
| **Source** | Full Monorepo | `git clone https://github.com/krtvysinghh/Openhead.git` | Build from source (`pnpm install && pnpm build`) |

> *Note on Credentials*: Where vendor-specific signing secrets (Apple Notarization, Windows Authenticode, Google Play Keystore) are required for store publishing, Openhead includes fully configured CI/CD pipeline definitions consuming environment secrets.

---

## 🚀 Unified Office Architecture & Capabilities

- **Unified Studio Shell**: Seamless document switcher, recent files browser, editable template picker, and crash-recovery document restoration.
- **Office Command Palette (`Ctrl+K` / `Cmd+K`)**: Instant keyboard-driven navigation and command execution.
- **Global Help & Shortcuts (`F1` / `?`)**: Interactive shortcut and help reference across all office engines.
- **Cross-App Ecosystem Bridge (`OfficeEcosystemBridge`)**: Copy and convert tabular data between Sum, Pen, and Glimpse with smart structural translation and 2D matrix-to-chart generation.
- **Office Template Library (`OfficeTemplateLibrary`)**: Production-grade templates for business letters, executive reports, financial budgets, milestone trackers, and pitch decks.
- **Sandboxed Extensibility (`PluginManager`)**: Default-deny plugin host with granular permission scopes (`document:read`, `commands:register`, `formulas:register`).
- **Safe Automation Engine (`AutomationEngine`)**: Batch document AST transformations and spreadsheet batch scripting without native code execution vulnerabilities.
- **Local-First AI (`@openhead/ai`)**: Connects to local Ollama (`localhost:11434`) and LM Studio (`localhost:1234`) with structured word-level Diff Previews, explicit permission scopes, and local audit logging.
- **Zero-Telemetry Invariant**: Strict policy blocking background tracking, analytics beacons, or unauthorized outbound network calls.
- **Hostile Document Defenses**: Strict denial of VBA/VBScript macros, DDE/formula injection sanitization, Zip Slip protection, and XML expansion limits.
- **Cross-Platform Desktop (Tauri 2.0)**: Native desktop shell for macOS, Windows, and Linux (<15 MB footprint, ~40 MB RAM).

---

## 🐳 Self-Hosting with Docker

Deploy your private, isolated Openhead Office instance in seconds:

```bash
docker run -d \
  --name openhead \
  -p 8080:8080 \
  --restart unless-stopped \
  ghcr.io/krtvysinghh/openhead:1.0.0
```

Or using Docker Compose:
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

See [`docs/SELF_HOSTING.md`](docs/SELF_HOSTING.md) for full self-hosting instructions and reverse proxy configurations.

---

## 🛠️ Monorepo Architecture

```
openhead/
├── apps/
│   └── studio/             # Unified Openhead Studio Application (React 18 + Vite + Tailwind)
├── packages/
│   ├── core/               # Shared document types, clipboard, commands, templates, plugins, storage, telemetry
│   ├── formula/            # Pratt parser, lexer, AST evaluation, 90+ built-in spreadsheet functions
│   ├── pen/                # Word processing AST engine, comments, tracked changes, DOCX serializer
│   ├── sum/                # Spreadsheet workbook engine, dependency DAG, comments, autofill, XLSX serializer
│   ├── glimpse/            # Presentation scene graph engine, masters, animations, connectors, PPTX serializer
│   ├── ai/                 # Local-first AI providers, diff engine, sandboxing & audit logger
│   └── ui/                 # Glassmorphic UI components, design tokens & icons
├── src-tauri/              # Native Tauri 2.0 desktop shell configuration
├── tests/                  # Monorepo integration, fidelity, real-world office interop, and hostile security test suites
└── docs/                   # Architectural Decision Records (ADRs), audits, and performance reports
```

---

## 🏁 Getting Started from Source

### Prerequisites

- **Node.js**: `>= 20.0.0`
- **pnpm**: `>= 9.0.0`
- **Rust**: `>= 1.75` (Optional, for building native desktop binaries)

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/krtvysinghh/Openhead.git
cd Openhead

# Install monorepo dependencies
pnpm install --frozen-lockfile

# Run the complete test suite (324 passing tests)
pnpm test

# Build all workspace packages
pnpm run build

# Start Openhead Studio in development mode
pnpm dev
```

---

## 📊 Verification & Test Suite

The Openhead repository maintains a rigorous automated testing corpus:

- **324 Automated Tests** passing across 86 test suites.
- **Real-World Office Interop Tests**: DOCX, XLSX, and PPTX round-trip compatibility suites.
- **Structural Regression Tests**: AST snapshot comparisons verifying deterministic output.
- **Hostile Security Corpus**: 12 attack vectors tested including Zip Slip, Billion Laughs, formula injection, and macro quarantine.
- **Release Verification**: Checksum calculations and manifest schema validation.

---

## 📄 License

Openhead is open-source software licensed under the [Apache-2.0 License](LICENSE).
