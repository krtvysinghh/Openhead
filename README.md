# Openhead Office Suite

<div align="center">

**The Sovereign, Local-First, High-Performance Office Suite.**

*Open Source · Zero Telemetry · Office OpenXML Interoperable · Local-First AI · Cross-Platform Desktop · Blazing Fast*

[![CI](https://github.com/krtvysinghh/Openhead/actions/workflows/ci.yml/badge.svg)](https://github.com/krtvysinghh/Openhead/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-291%20passing-brightgreen.svg)](https://github.com/krtvysinghh/Openhead)

</div>

---

## 🌟 Overview

Openhead is a modern, privacy-first office productivity suite designed as a serious Microsoft Office alternative. Built from first principles, Openhead delivers uncompromising performance, rich visual fidelity, and local-first AI without corporate lock-in or background telemetry.

Openhead contains three flagship applications unified in a cohesive office shell:

| Product | Role | Key Capabilities |
|---|---|---|
| **Pen** | Document Processor | Rich-text typesetting, AST-driven styling, sections, multi-level lists, tables, footnotes/endnotes, headers/footers, search/replace, and bi-directional DOCX import/export. |
| **Sum** | Spreadsheet Engine | DAG-based topological recalculation, 90+ Excel-compatible functions, dynamic arrays, spill ranges, AutoFilter, defined names, merged cells, styles, and high-fidelity XLSX import/export. |
| **Glimpse** | Presentation Engine | Scene-graph slide canvas, vector shapes, connectors, theme palettes, DrawingML charts, tables, slide transitions, presenter notes, and PPTX round-trip fidelity. |

---

## 🚀 Unified Office Architecture (Phases 10–13)

- **Unified Studio Shell**: Seamless document switcher, recent files browser, and crash-recovery document restoration.
- **Office Command Palette (`Ctrl+K`)**: Instant keyboard-driven navigation and command execution.
- **Cross-App Clipboard Engine**: Copy tabular data between Sum, Pen, and Glimpse with smart structural translation.
- **Local-First AI (`@openhead/ai`)**: Connects to local Ollama (`localhost:11434`) and LM Studio (`localhost:1234`) with structured word-level Diff Previews, explicit permission scopes, and local audit logging.
- **Zero-Telemetry Invariant**: Strict policy blocking background tracking, analytics beacons, or unauthorized outbound network calls.
- **Hostile Document Defenses**: Strict denial of VBA/VBScript macros, DDE/formula injection sanitization, Zip Slip protection, and XML expansion limits.
- **Cross-Platform Desktop (Tauri 2.0)**: Native desktop shell for macOS, Windows, and Linux (<15 MB footprint, ~40 MB RAM).

---

## 🛠️ Monorepo Architecture

```
openhead/
├── apps/
│   └── studio/             # Unified Openhead Studio Application (React 18 + Vite + Tailwind)
├── packages/
│   ├── core/               # Shared document types, clipboard, commands, storage, themes, telemetry
│   ├── formula/            # Pratt parser, lexer, AST evaluation, 90+ built-in spreadsheet functions
│   ├── pen/                # Word processing AST engine & DOCX OpenXML serializer
│   ├── sum/                # Spreadsheet workbook engine, dependency DAG & XLSX serializer
│   ├── glimpse/            # Presentation scene graph engine & PPTX serializer
│   ├── ai/                 # Local-first AI providers, diff engine, sandboxing & audit logger
│   └── ui/                 # Glassmorphic UI components, design tokens & icons
├── src-tauri/              # Native Tauri 2.0 desktop shell configuration
├── tests/                  # Monorepo integration, fidelity, and hostile security test suites
└── docs/                   # Architectural Decision Records (ADRs), audits, and performance reports
```

---

## 🏁 Getting Started

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
pnpm install

# Run the complete test suite (291 passing tests)
pnpm test

# Build all workspace packages
pnpm run build

# Start Openhead Studio in development mode
pnpm dev
```

---

## 📊 Verification & Test Suite

The Openhead repository maintains a rigorous automated testing corpus:

- **291 Automated Tests** passing across 78 test suites.
- **Fidelity Roundtrip Tests**: DOCX, XLSX, and PPTX round-trip compatibility suites.
- **Structural Regression Tests**: AST snapshot comparisons verifying deterministic output.
- **Hostile Security Corpus**: Hardened against macro execution, formula injection, Zip Slip, and XML expansion attacks.

---

## 📄 License

Openhead is open-source software licensed under the [MIT License](LICENSE).
