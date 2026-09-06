# Openhead

<div align="center">

**The Open-Source, Privacy-First, Cross-Platform Office Suite.**

*Open source · Free · Secure · Private · Offline-first · Cross-platform · Office-compatible · Local-AI capable · Fast · Beautiful*

</div>

---

## 🌟 Overview

Openhead is a modern office productivity suite built from the ground up to deliver uncompromising performance, seamless document fidelity, and a refined glassmorphic user experience without privacy compromises or mandatory cloud lock-in.

Openhead includes three core applications:

| Product | Role | Key Capabilities |
|---|---|---|
| **Pen** | Document Editor | Rich-text typesetting, AST-driven styling, sections, tables, math formulas, markdown & DOCX compatibility, live statistics, and distraction-free editing. |
| **Sum** | Spreadsheet Engine | High-performance calculation DAG, topological recalculation, dynamic arrays, cell formatting, and 50+ built-in Excel-compatible functions. |
| **Glimpse** | Presentation Editor | Scene-graph slide canvas, vector shapes, master layouts, typography tokens, transitions, presenter display, and deck export. |

---

## 🔒 Privacy & Security Philosophy

1. **100% Offline-First by Default**: Openhead runs completely locally on your hardware. No mandatory telemetry, no hidden phone-home tracking, no cloud account requirements.
2. **Untrusted File Sandboxing**: Foreign office files (DOCX, XLSX, PPTX, ODT, CSV) are treated as untrusted inputs with defensive AST parsing and no automatic macro execution.
3. **Local AI Model Abstraction**: Integrated AI features run on local inference engines (e.g. Ollama, WebLLM, Local Llama) or explicitly configured user endpoints. Zero document data is transmitted without explicit consent.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.0.0

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/openhead/openhead.git
cd openhead

# Install monorepo dependencies
pnpm install

# Run the test suite across all packages
pnpm test

# Launch the Openhead Studio development server
pnpm dev
```

---

## 🏛 Architecture

Openhead uses a shared-core architecture that separates business logic from platform presentation shells:

```text
                         OPENHEAD
                            │
                     Shared Core
                            │
       ┌────────────┬───────┼───────┬────────────┐
       │            │       │       │            │
   Document      Spreadsheet Presentation  Graphics  AI Provider
    Engine         Engine      Engine       Engine   Abstraction
    (Pen)          (Sum)      (Glimpse)      (UI)     (Core)
       │            │       │       │            │
       └────────────┴───────┼───────┴────────────┘
                            │
                  Platform Abstraction
                            │
      ┌──────────┬──────────┼──────────┬──────────┐
      ↓          ↓          ↓          ↓          ↓
   Windows     macOS      Linux     Android      iOS
                            │
                         Docker
```

For in-depth architectural details, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [docs/adr/](./docs/adr/).

---

## ⌨️ Keyboard Shortcuts & Command Palette

Press `Cmd + K` (macOS) or `Ctrl + K` (Windows/Linux) anytime in Openhead to open the **Command Palette**.

Common shortcuts:
- `Cmd/Ctrl + S`: Save active document/workbook/presentation
- `Cmd/Ctrl + Z` / `Cmd/Ctrl + Shift + Z`: Undo / Redo
- `Cmd/Ctrl + B` / `I` / `U`: Bold / Italic / Underline
- `Cmd/Ctrl + F`: Search & Replace
- `F2`: Edit active cell in Sum

Full shortcuts reference: [docs/shortcuts.md](./docs/shortcuts.md).

---

## 📜 Documentation & Governance

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design and package topology
- [ROADMAP.md](./ROADMAP.md) — Product milestones and feature targets
- [SECURITY.md](./SECURITY.md) — Security policy and vulnerability disclosure
- [THREAT_MODEL.md](./THREAT_MODEL.md) — Security boundaries and untrusted file handling
- [COMPATIBILITY.md](./COMPATIBILITY.md) — Microsoft Office format parity matrix
- [CONTRIBUTING.md](./CONTRIBUTING.md) — Contribution guidelines and code standards
- [GOVERNANCE.md](./GOVERNANCE.md) — Open-source project governance model
- [DEVELOPMENT.md](./DEVELOPMENT.md) — Developer setup and testing guide

---

## 📄 License

Openhead is licensed under the [Apache License 2.0](./LICENSE).
