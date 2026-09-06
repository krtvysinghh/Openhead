# Openhead Office Suite

<div align="center">

**The Sovereign, Local-First, High-Performance Office Suite.**

*Open Source · Zero Telemetry · Office OpenXML Interoperable · Local-First AI · Cross-Platform Desktop · Blazing Fast*

[![CI](https://github.com/krtvysinghh/Openhead/actions/workflows/ci.yml/badge.svg)](https://github.com/krtvysinghh/Openhead/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-322%20passing-brightgreen.svg)](https://github.com/krtvysinghh/Openhead)

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

## 🚀 Unified Office Architecture & Capabilities

- **Unified Studio Shell**: Seamless document switcher, recent files browser, editable template picker, and crash-recovery document restoration.
- **Office Command Palette (`Ctrl+K` / `Cmd+K`)**: Instant keyboard-driven navigation and command execution.
- **Cross-App Ecosystem Bridge (`OfficeEcosystemBridge`)**: Copy and convert tabular data between Sum, Pen, and Glimpse with smart structural translation.
- **Office Template Library (`OfficeTemplateLibrary`)**: Production-grade templates for business letters, executive reports, financial budgets, milestone trackers, and pitch decks.
- **Sandboxed Extensibility (`PluginManager`)**: Default-deny plugin host with granular permission scopes (`document:read`, `commands:register`, `formulas:register`).
- **Safe Automation Engine (`AutomationEngine`)**: Batch document AST transformations and spreadsheet batch scripting without native code execution vulnerabilities.
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

# Run the complete test suite (322 passing tests)
pnpm test

# Build all workspace packages
pnpm run build

# Start Openhead Studio in development mode
pnpm dev
```

---

## 📊 Verification & Test Suite

The Openhead repository maintains a rigorous automated testing corpus:

- **322 Automated Tests** passing across 85 test suites.
- **Real-World Office Interop Tests**: DOCX, XLSX, and PPTX round-trip compatibility suites.
- **Structural Regression Tests**: AST snapshot comparisons verifying deterministic output.
- **Hostile Security Corpus**: 12 attack vectors tested including Zip Slip, Billion Laughs, formula injection, and macro quarantine.
- **Hostile Security Corpus**: Hardened against macro execution, formula injection, Zip Slip, and XML expansion attacks.

---

## 📄 License

Openhead is open-source software licensed under the [MIT License](LICENSE).
