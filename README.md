<div align="center">

<img src="apps/studio/public/logo.png" alt="Openhead Logo" width="120" height="120" />

# Openhead Office Suite

**The Sovereign, Local-First, Open-Source Office Suite.**

*Privacy-First · Zero Telemetry · Office OpenXML Compatible · Local AI · Cross-Platform*

<br/>

[![CI](https://github.com/krtvysinghh/Openhead/actions/workflows/ci.yml/badge.svg)](https://github.com/krtvysinghh/Openhead/actions/workflows/ci.yml)
[![Release](https://github.com/krtvysinghh/Openhead/actions/workflows/release.yml/badge.svg)](https://github.com/krtvysinghh/Openhead/actions/workflows/release.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-343%20passing-brightgreen.svg)](#-testing)
[![Version](https://img.shields.io/badge/Version-v1.0.0-6366f1.svg)](https://github.com/krtvysinghh/Openhead/releases/tag/v1.0.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6.svg)](tsconfig.base.json)
[![pnpm](https://img.shields.io/badge/pnpm-Monorepo-f69220.svg)](pnpm-workspace.yaml)

<br/>

[**⬇ Download v1.0.0**](https://github.com/krtvysinghh/Openhead/releases/tag/v1.0.0) &nbsp;·&nbsp; [**📖 Documentation**](docs/) &nbsp;·&nbsp; [**🔒 Security Model**](docs/SECURITY.md) &nbsp;·&nbsp; [**🐳 Self-Hosting**](docs/SELF_HOSTING.md) &nbsp;·&nbsp; [**🗺 Roadmap**](ROADMAP.md)

</div>

---

## Table of Contents

1. [What is Openhead?](#-what-is-openhead)
2. [Core Applications](#-core-applications)
3. [Feature Overview](#-feature-overview)
4. [Architecture](#-architecture)
5. [Download & Install](#-download--install)
6. [Building from Source](#-building-from-source)
7. [Local AI Integration](#-local-ai-integration)
8. [Template Library](#-template-library)
9. [Office Compatibility](#-office-openxml-compatibility)
10. [Security & Privacy](#-security--privacy)
11. [Keyboard Shortcuts](#️-keyboard-shortcuts)
12. [Self-Hosting with Docker](#-self-hosting-with-docker)
13. [Testing](#-testing)
14. [Project Structure](#-project-structure)
15. [Contributing](#-contributing)
16. [License](#-license)

---

## 🌐 What is Openhead?

**Openhead** is a production-grade, open-source office productivity suite built from the ground up as a genuine alternative to Microsoft Office and Google Workspace — with zero compromise on privacy, capability, or compatibility.

Every document you create stays on your machine. No accounts. No subscriptions. No telemetry. No cloud lock-in. Openhead is yours.

### Why Openhead?

| | Microsoft Office | Google Workspace | **Openhead** |
|---|:---:|:---:|:---:|
| 100% Offline | ⚠️ Partial | ❌ | ✅ |
| Zero Telemetry | ❌ | ❌ | ✅ |
| Open Source | ❌ | ❌ | ✅ |
| Local AI | ❌ | ❌ | ✅ |
| DOCX / XLSX / PPTX | ✅ | ✅ | ✅ |
| Free Forever | ❌ | ❌ | ✅ |
| Self-Hostable | ❌ | ❌ | ✅ |
| No Account Required | ❌ | ❌ | ✅ |

---

## 📦 Core Applications

Openhead Studio unifies three flagship office engines in a single, seamless workspace:

```
┌─────────────────────────────────────────────────────────────────┐
│                     OPENHEAD STUDIO                             │
│        Unified Shell · Command Palette · AI Sidebar             │
└────────────────┬──────────────────┬──────────────────┬──────────┘
                 │                  │                  │
        ┌────────▼──────┐  ┌────────▼──────┐  ┌───────▼────────┐
        │   🖋️  PEN      │  │   📊  SUM     │  │  📽️  GLIMPSE   │
        │  Word-Class   │  │ Excel-Class   │  │  PowerPoint-   │
        │  Documents    │  │ Spreadsheets  │  │   Class Decks  │
        │               │  │               │  │                │
        │  .docx / .odt │  │ .xlsx / .ods  │  │ .pptx / .odp   │
        └───────────────┘  └───────────────┘  └────────────────┘
                 │                  │                  │
                 └──────────────────┴──────────────────┘
                                    │
              ┌─────────────────────▼──────────────────────┐
              │              SHARED CORE                    │
              │  • Formula Pratt Parser & Evaluator         │
              │  • Workbook Dependency DAG                  │
              │  • Local-First AI Provider (Ollama / LM)    │
              │  • Atomic Checksum Storage                  │
              │  • Zero-Telemetry Runtime Guard             │
              │  • Cross-App Clipboard & Paste Pipeline     │
              │  • Crash Recovery & Session Journal         │
              └─────────────────────────────────────────────┘
```

### 🖋️ Pen — Word-Class Document Processor

Pen is a full-featured rich-text document editor with deep `.docx` round-trip fidelity.

**Rich Text & Typography**
- Bold, italic, underline, strikethrough, superscript, subscript
- Font family, size, color, and highlight selection
- Paragraph alignment: left, center, right, justify
- Line spacing: single, 1.5×, double, and exact point values
- Indentation, first-line indent, hanging indent

**Document Structure**
- Multi-section documents with independent page settings per section
- Heading styles: H1–H6 with automatic outline numbering
- Multi-level ordered and unordered lists with custom bullet characters
- Nested tables with cell merging, borders, and column width control
- Page headers, footers, and automatic page numbering
- Footnotes and endnotes with auto-referencing
- Threaded comments and tracked change annotations

**Advanced Features**
- Multi-column page layouts (2, 3, 4 columns with gutter control)
- Image insertion with captions (JPEG, PNG, WEBP, GIF, SVG)
- Watermark overlay (diagonal text with opacity and color)
- Page size and orientation switching (A4, Letter, Legal, Landscape)
- Offline spellchecker with language selection
- Find & Replace with case sensitivity and whole-word options
- Word count, character count, reading time estimate

**Export & Import**
- Full `.docx` export and import (Office OpenXML)
- `.odt` compatibility (OpenDocument Text)
- Plain text and HTML clipboard paste with style normalization

---

### 📊 Sum — Excel-Class Spreadsheet Engine

Sum is a topological formula engine with high-fidelity `.xlsx` interoperability.

**Formula Engine**
- 90+ Excel-compatible functions across all categories:
  - **Math**: `SUM`, `AVERAGE`, `SUMIF`, `SUMIFS`, `PRODUCT`, `MOD`, `ROUND`, `FLOOR`, `CEILING`, `ABS`, `POWER`, `SQRT`, `LOG`, `LN`, `EXP`, `PI`, `RAND`, `RANDBETWEEN`
  - **Statistical**: `COUNT`, `COUNTA`, `COUNTBLANK`, `COUNTIF`, `COUNTIFS`, `MAX`, `MIN`, `LARGE`, `SMALL`, `MEDIAN`, `MODE`, `STDEV`, `VAR`, `CORREL`, `PERCENTILE`, `QUARTILE`, `RANK`
  - **Logical**: `IF`, `IFS`, `AND`, `OR`, `NOT`, `XOR`, `IFERROR`, `IFNA`, `SWITCH`, `TRUE`, `FALSE`
  - **Lookup**: `VLOOKUP`, `HLOOKUP`, `XLOOKUP`, `INDEX`, `MATCH`, `OFFSET`, `INDIRECT`, `CHOOSE`, `LOOKUP`
  - **Text**: `CONCAT`, `CONCATENATE`, `LEFT`, `RIGHT`, `MID`, `LEN`, `FIND`, `SEARCH`, `REPLACE`, `SUBSTITUTE`, `TRIM`, `UPPER`, `LOWER`, `PROPER`, `TEXT`, `VALUE`, `CHAR`, `CODE`, `REPT`, `TEXTJOIN`
  - **Date & Time**: `NOW`, `TODAY`, `DATE`, `TIME`, `YEAR`, `MONTH`, `DAY`, `HOUR`, `MINUTE`, `SECOND`, `WEEKDAY`, `WEEKNUM`, `EOMONTH`, `EDATE`, `DATEDIF`, `NETWORKDAYS`, `WORKDAY`, `DATEVALUE`, `TIMEVALUE`
  - **Financial**: `PMT`, `PV`, `FV`, `NPV`, `IRR`, `XIRR`, `RATE`, `NPER`, `IPMT`, `PPMT`, `DB`, `SLN`, `SYD`
  - **Dynamic Arrays**: `FILTER`, `SORT`, `SORTBY`, `UNIQUE`, `SEQUENCE`, `RANDARRAY`
- Pratt-parser expression compiler for correct operator precedence
- Full dependency DAG with topological recalculation order
- Circular reference detection and reporting
- Array formulas and spill range engine

**Spreadsheet Features**
- Multi-sheet workbooks with tab management (add, rename, delete, reorder, color)
- Cell formatting: number formats, date formats, custom format codes
- Borders, fill colors, font styling, text rotation, wrap text
- Merged cell groups with merge/unmerge operations
- AutoFilter with multi-criteria column filtering
- Freeze panes: freeze top row, freeze first column, freeze custom ranges
- Auto-fill series: numbers, dates, weekdays, months, custom lists
- Data validation: dropdown lists, whole number, decimal, date range rules
- Defined names and named ranges
- Cell comments with author tracking
- Conditional formatting: highlight rules, color scales, data bars, icon sets
- Sort by single or multiple columns (ascending / descending)

**Power Tools**
- **Goal Seek**: Backsolve for a target cell value by varying a changing cell
- **Text to Columns**: Split delimited cell content by comma, tab, space, or custom delimiter
- **Remove Duplicates**: Deduplicate rows by selected column criteria
- **AutoSum**: One-click `SUM`, `AVERAGE`, `COUNT`, `MAX`, `MIN` insertion
- **Pivot Table** (basic): row/column/value aggregation across data sets

**Export & Import**
- Full `.xlsx` export and import (OOXML SpreadsheetML)
- `.csv` import with formula injection defense
- `.ods` compatibility (OpenDocument Spreadsheet)

---

### 📽️ Glimpse — PowerPoint-Class Presentation Engine

Glimpse is a vector-based slide engine with complete `.pptx` round-trip fidelity.

**Slide Design**
- Slide masters and layouts with theme inheritance
- Background: solid color, gradients, image fills, pattern fills
- Theme palette switching (10 built-in themes, custom color definitions)
- Slide aspect ratio: 16:9, 4:3, A4 Portrait, A4 Landscape, Custom
- Slide templates with pre-built professional layouts

**Content Blocks**
- Rich text frames with full formatting control
- Image blocks with aspect-ratio locking and caption
- Shape library: rectangles, circles, triangles, arrows, stars, callouts
- Connector lines with auto-routing and directional arrowheads
- Smart tables with header row, banded rows, column totals
- Chart objects: Bar, Column, Line, Area, Pie, Donut — all with live data binding
- Code block frames with syntax highlighting (30+ languages)
- Equation blocks with LaTeX rendering

**Editing Tools**
- Multi-select with marquee drag selection
- Alignment guides: snap-to-grid, snap-to-object, smart distribution
- Z-order control: bring to front, send to back, forward, backward
- Group and ungroup object sets
- Copy / Paste style transfer across objects
- Slide thumbnails panel with drag-and-drop reordering
- Slide hide/unhide for presentation branching
- Slide duplication and deletion
- Section dividers for deck organization

**Animations & Transitions**
- Per-element entrance, exit, and emphasis animations
- Keyframe-based animation timeline editor
- Slide transition effects: fade, push, wipe, zoom, flip
- Animation preview playback

**Presenter Mode**
- Full-screen presentation with slide navigation
- Presenter notes panel (speaker view)
- Laser pointer simulation overlay
- Elapsed time and clock display
- Next slide preview

**Export & Import**
- Full `.pptx` export and import (OOXML PresentationML)
- `.odp` compatibility (OpenDocument Presentation)
- PNG / JPEG / SVG slide export (per-slide or batch)

---

## 🎛️ Feature Overview

### Universal Studio Shell

| Feature | Description |
|---|---|
| **Command Palette** | `Cmd+K` / `Ctrl+K` — search and execute every available action |
| **Unified Search** | `Ctrl+Shift+F` — full-text search across documents, sheets, and slides |
| **Template Picker** | `Cmd+T` — browse and apply 16+ professional templates |
| **AI Sidebar** | Local-only AI for writing, analysis, and formula explanation |
| **Cross-App Clipboard** | Paste tables from Sum directly into Pen or Glimpse with fidelity |
| **Autosave** | Debounced autosave every 2 seconds to local storage |
| **Manual Save** | `Cmd+S` — force-saves to disk via Tauri filesystem API |
| **Crash Recovery** | Session journal survives unexpected quits; restore on next launch |
| **Undo / Redo** | Full transaction history stack across all three apps |
| **Keyboard Shortcuts** | Comprehensive shortcut reference (`F1` or `?` key) |
| **Help System** | In-app help panel with searchable reference |
| **Recent Files** | Quick-access panel with timestamps and type badges |
| **Settings Panel** | Privacy, AI configuration, spellcheck language, autosave interval |

---

## 🏗️ Architecture

Openhead is a **pnpm monorepo** with strict TypeScript throughout.

```
openhead/
├── apps/
│   └── studio/                  # React 18 + Vite + Tailwind CSS desktop app
│       ├── src/
│       │   ├── views/           # PenView, SumView, GlimpseView
│       │   ├── components/      # Header, HomeScreen, AI sidebar, modals
│       │   └── main.tsx         # Entry point
│       └── public/              # Static assets (logo, favicon)
│
├── packages/
│   ├── core/                    # @openhead/core — templates, storage, crash recovery
│   ├── pen/                     # @openhead/pen — document AST, DOCX serializer
│   ├── sum/                     # @openhead/sum — workbook, formula DAG, XLSX
│   ├── glimpse/                 # @openhead/glimpse — scene graph, PPTX, animations
│   ├── formula/                 # @openhead/formula — Pratt parser + 90+ functions
│   ├── ai/                      # @openhead/ai — local-only AI provider + safety layer
│   └── ui/                      # @openhead/ui — shared design tokens, glass styles
│
├── src-tauri/                   # Rust + Tauri 2 native desktop shell
│   ├── src/main.rs              # Tauri entry point
│   └── icons/                   # Platform icons (PNG, ICNS, ICO)
│
├── tests/                       # 87 test suites — 337 assertions
├── docs/                        # Documentation, audits, security, formula reference
├── scripts/                     # Icon generator, release automation
├── compatibility-corpus/        # Real DOCX / XLSX / PPTX test fixtures
└── release-artifacts/           # Release checksums and manifests
```

### Technology Stack

| Layer | Technology |
|---|---|
| **UI Framework** | React 18, TypeScript 5 (strict), Tailwind CSS 3 |
| **Build Tool** | Vite 6, pnpm Workspaces |
| **Desktop Shell** | Tauri 2 (Rust) — macOS, Windows, Linux |
| **Test Runner** | Vitest with coverage |
| **Formula Engine** | Custom Pratt parser, topological DAG (zero dependencies) |
| **AI Backend** | Ollama (`localhost:11434`), LM Studio (`localhost:1234`) |
| **Storage** | Local filesystem (Tauri) + IndexedDB (browser) — no cloud |
| **Serialization** | Custom OOXML serializers/deserializers for DOCX/XLSX/PPTX |
| **Icons** | Lucide React |
| **Linting** | ESLint + TypeScript strict checks |

---

## ⬇️ Download & Install

All release artifacts are available at **[GitHub Releases → v1.0.0](https://github.com/krtvysinghh/Openhead/releases/tag/v1.0.0)**.

Verify integrity against the official checksum manifest: [`Openhead-1.0.0-checksums.txt`](https://github.com/krtvysinghh/Openhead/releases/download/v1.0.0/Openhead-1.0.0-checksums.txt)

| Platform | Download | Format | Notes |
|---|---|---|---|
| **macOS (Apple Silicon)** | [Openhead-1.0.0-macOS-arm64.dmg](https://github.com/krtvysinghh/Openhead/releases/download/v1.0.0/Openhead-1.0.0-macOS-arm64.dmg) | `.dmg` | M1/M2/M3/M4 — drag to Applications |
| **macOS App Bundle** | [Openhead-1.0.0-macOS-arm64.app.tar.gz](https://github.com/krtvysinghh/Openhead/releases/download/v1.0.0/Openhead-1.0.0-macOS-arm64.app.tar.gz) | `.tar.gz` | Standalone `.app` — extract and run |
| **Web Studio (Offline)** | [Openhead-1.0.0-WebStudio-Standalone.zip](https://github.com/krtvysinghh/Openhead/releases/download/v1.0.0/Openhead-1.0.0-WebStudio-Standalone.zip) | `.zip` | Pure static SPA — works in any browser, no server |
| **Docker (Self-Hosted)** | [Openhead-1.0.0-Docker-SelfHosted.tar.gz](https://github.com/krtvysinghh/Openhead/releases/download/v1.0.0/Openhead-1.0.0-Docker-SelfHosted.tar.gz) | `.tar.gz` | Docker image + compose + Nginx config |
| **Windows / Linux** | [GitHub Actions CI](https://github.com/krtvysinghh/Openhead/actions) | `.msi` / `.AppImage` / `.deb` | Cross-platform automated builds |
| **Source Code** | [v1.0.0.zip](https://github.com/krtvysinghh/Openhead/archive/refs/tags/v1.0.0.zip) | `.zip` | Full reproducible source tree |

### macOS Installation

```bash
# Option 1: Mount the DMG and drag to Applications
open Openhead-1.0.0-macOS-arm64.dmg

# Option 2: Extract the app bundle directly
tar -xzf Openhead-1.0.0-macOS-arm64.app.tar.gz
mv Openhead.app /Applications/
```

> **First launch on macOS**: If Gatekeeper blocks the app, right-click → Open, or:
> ```bash
> xattr -dr com.apple.quarantine /Applications/Openhead.app
> ```

### Web Studio (Browser)

```bash
# Extract and open locally — no server needed
unzip Openhead-1.0.0-WebStudio-Standalone.zip
cd Openhead-WebStudio
open index.html        # macOS
# or: xdg-open index.html   (Linux)
# or: start index.html      (Windows)
```

---

## 🛠️ Building from Source

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | ≥ 20.0.0 | JavaScript runtime |
| **pnpm** | ≥ 9.0.0 | Package manager & workspace orchestrator |
| **Rust** | ≥ 1.75.0 | Required for Tauri native desktop build |
| **Git** | Any | Source control |

Install `pnpm` if not already available:
```bash
npm install -g pnpm
# or via Homebrew:
brew install pnpm
```

Install Rust via rustup:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Clone and Run

```bash
# 1. Clone the repository
git clone https://github.com/krtvysinghh/Openhead.git
cd Openhead

# 2. Install all workspace dependencies (frozen lockfile for reproducibility)
pnpm install --frozen-lockfile

# 3. Run the full test suite — should show 337 tests passing
pnpm test

# 4. Build all packages and the web application
pnpm run build

# 5. Start Openhead Studio in development mode (hot-reload)
pnpm dev
```

### Native Desktop Build

```bash
# Build native installers for your current platform
pnpm tauri build

# Artifacts are placed in:
# macOS:   src-tauri/target/release/bundle/dmg/
# Windows: src-tauri/target/release/bundle/msi/
# Linux:   src-tauri/target/release/bundle/appimage/
```

### Development Workflow

```bash
# Run tests in watch mode
pnpm test --watch

# Run tests with coverage report
pnpm test --coverage

# Type-check all packages
pnpm tsc --noEmit

# Lint all packages
pnpm lint

# Regenerate platform icons from a source PNG
python3 scripts/generate_icons.py path/to/your-logo.png
```

---

## 🤖 Local AI Integration

Openhead includes a fully local AI assistant that **never sends your data to the cloud**.

### Supported Backends

| Backend | Default Port | Setup |
|---|---|---|
| **Ollama** | `localhost:11434` | `brew install ollama && ollama pull llama3` |
| **LM Studio** | `localhost:1234` | Download from [lmstudio.ai](https://lmstudio.ai), load a model, start server |

### AI Capabilities

| Feature | Description |
|---|---|
| **Document Writing** | Draft paragraphs, rewrite selections, adjust tone |
| **Summarization** | Summarize long documents into bullet points or abstracts |
| **Formula Explanation** | Explain any cell formula in plain English |
| **Formula Generation** | Describe what you want in English, get a formula |
| **Data Insights** | Analyze a selected range and surface key patterns |
| **Slide Copy** | Generate presentation slide text from a topic prompt |
| **Grammar & Tone** | Polish language, fix passive voice, change formality level |

### AI Safety Model

- All AI suggestions are presented as **word-level diffs** — you see exactly what will change before accepting
- **Explicit accept / reject** required for every suggestion — no silent auto-editing
- AI is sandboxed to `127.0.0.1` only — cannot call external APIs
- AI toggle is off by default — enable it in Settings → AI

---

## 📋 Template Library

Openhead ships **16 professionally designed templates** across all three apps.

### Pen Templates (7)

| Template | Use Case |
|---|---|
| Business Letter | Formal correspondence with letterhead layout |
| Executive Report | Multi-section report with cover page and TOC |
| Meeting Notes | Agenda, attendees, action items, decisions |
| Business Proposal | Executive summary, scope, pricing, terms |
| Non-Disclosure Agreement | Legal NDA with signature blocks |
| APA Research Paper | Academic formatting with citations and abstract |
| Professional Resume | Single-page resume with skills, experience, education |

### Sum Templates (5)

| Template | Use Case |
|---|---|
| Annual Budget | Monthly revenue and expense tracking with YTD totals |
| Milestone Tracker | Project milestones with status, owner, and date columns |
| DCF Valuation Model | 5-year discounted cash flow with WACC and terminal value |
| Payroll Calculator | Employee payroll with tax, deductions, and net pay |
| Sales CRM Pipeline | Deal stages, ARR, probability-weighted forecast |

### Glimpse Templates (4)

| Template | Use Case |
|---|---|
| Pitch Deck | Startup investor presentation (problem, solution, market, team) |
| Quarterly Business Review | QBR with metrics, highlights, and roadmap |
| Product Launch | Launch strategy with timeline, positioning, and GTM |
| Technical Architecture | System architecture with diagrams and component specs |

### Using Templates

1. Open the **Command Palette** (`Cmd+K`) and type "template"
2. — or — click **Templates** in the header bar
3. Filter by product (Pen / Sum / Glimpse) or search by keyword
4. Click any template to apply it as the starting document

---

## 📄 Office OpenXML Compatibility

Openhead achieves high-fidelity round-trip compatibility with the Office OpenXML format family.

### DOCX (Pen)

| Feature | Import | Export |
|---|---|---|
| Paragraphs & Runs | ✅ | ✅ |
| Heading Styles (H1–H6) | ✅ | ✅ |
| Bold, Italic, Underline | ✅ | ✅ |
| Font, Size, Color | ✅ | ✅ |
| Lists (ordered, unordered, nested) | ✅ | ✅ |
| Tables with borders | ✅ | ✅ |
| Images (embedded) | ✅ | ✅ |
| Page Settings (size, orientation, margins) | ✅ | ✅ |
| Headers & Footers | ✅ | ✅ |
| Comments | ✅ | ✅ |
| Footnotes & Endnotes | ✅ | ✅ |
| VBA Macros | 🚫 Quarantined | — |

### XLSX (Sum)

| Feature | Import | Export |
|---|---|---|
| Cell Values & Types | ✅ | ✅ |
| Formulas | ✅ | ✅ |
| Multiple Sheets | ✅ | ✅ |
| Cell Formatting (number, date, custom) | ✅ | ✅ |
| Merged Cells | ✅ | ✅ |
| Borders & Fill Colors | ✅ | ✅ |
| AutoFilter | ✅ | ✅ |
| Defined Names | ✅ | ✅ |
| Cell Comments | ✅ | ✅ |
| Conditional Formatting | ✅ | ✅ |
| Charts | ✅ | ✅ |
| Pivot Tables | ⚠️ Basic | ✅ |
| Dynamic Array Spill | ✅ | ✅ |
| VBA Macros | 🚫 Quarantined | — |

### PPTX (Glimpse)

| Feature | Import | Export |
|---|---|---|
| Slides & Layouts | ✅ | ✅ |
| Text Frames | ✅ | ✅ |
| Images | ✅ | ✅ |
| Shapes | ✅ | ✅ |
| Tables | ✅ | ✅ |
| Charts (DrawingML) | ✅ | ✅ |
| Slide Masters | ✅ | ✅ |
| Animations | ✅ | ✅ |
| Transitions | ✅ | ✅ |
| Speaker Notes | ✅ | ✅ |
| Theme Colors | ✅ | ✅ |
| Embedded Media | ⚠️ Placeholder | ⚠️ Placeholder |

> ✅ Full support &nbsp; ⚠️ Partial / basic &nbsp; 🚫 Disabled for security

---

## 🔒 Security & Privacy

### Zero-Telemetry Policy

Openhead enforces a **strict, invariant zero-telemetry policy**:

- Zero analytics beacons, event trackers, or error reporters
- Zero third-party JavaScript SDKs (no Google Analytics, Sentry, Mixpanel, etc.)
- Zero outbound HTTP requests at runtime — the application makes no network calls unless you explicitly trigger an AI request to `127.0.0.1`
- Source code is fully auditable — no obfuscated bundles in production

### Local-First Storage

All documents are stored **exclusively on your local machine**:

- **Desktop (Tauri)**: Filesystem via Tauri's secure `tauri-plugin-fs` API
- **Browser**: IndexedDB in-browser storage
- **No syncing** without your explicit action (e.g. manual export)
- **Atomic writes**: Every document write is checksummed (CRC journal) to prevent silent corruption

### Hostile Document Hardening

Openhead treats every imported file as potentially hostile:

| Attack Vector | Defense |
|---|---|
| **VBA Macro Execution** | Macros are stripped and permanently quarantined on import |
| **Formula Injection (CSV)** | Leading `=`, `+`, `-`, `@` characters are neutralized in cell values |
| **XML Billion Laughs (XXE)** | Hardened XML parser with entity expansion limits |
| **Zip Slip Path Traversal** | Archive extractor validates and sanitizes all entry paths |
| **Decompression Bombs** | Size boundary enforced during ZIP/OOXML extraction |
| **Malformed OOXML** | Graceful fallback for corrupt or non-conformant documents |

### AI Safety

- AI suggestions are always shown as **diffs** — never silently applied
- AI backend is restricted to loopback addresses (`127.0.0.1`) only
- No documents, selections, or file paths are sent to remote APIs
- AI is **disabled by default** — opt-in via Settings

Full threat model: [`THREAT_MODEL.md`](THREAT_MODEL.md)

---

## ⌨️ Keyboard Shortcuts

### Global

| Shortcut | Action |
|---|---|
| `Cmd+K` / `Ctrl+K` | Open Universal Command Palette |
| `Cmd+T` / `Ctrl+T` | Open Template Library |
| `Cmd+Shift+F` / `Ctrl+Shift+F` | Full-Text Search |
| `Cmd+S` / `Ctrl+S` | Save Document |
| `Cmd+Z` / `Ctrl+Z` | Undo |
| `Cmd+Shift+Z` / `Ctrl+Y` | Redo |
| `F1` or `?` | Help & Shortcuts Reference |

### Pen (Document Editor)

| Shortcut | Action |
|---|---|
| `Cmd+B` | Bold |
| `Cmd+I` | Italic |
| `Cmd+U` | Underline |
| `Cmd+Shift+S` | Strikethrough |
| `Cmd+1`–`6` | Apply Heading 1–6 |
| `Cmd+F` / `Ctrl+F` | Find in Document |
| `Cmd+H` / `Ctrl+H` | Find and Replace |
| `Tab` | Increase list indent |
| `Shift+Tab` | Decrease list indent |

### Sum (Spreadsheet)

| Shortcut | Action |
|---|---|
| `F2` | Enter cell edit mode |
| `Escape` | Cancel cell edit |
| `Enter` | Confirm and move down |
| `Tab` | Confirm and move right |
| `Ctrl+Enter` | Confirm and stay in cell |
| `Ctrl+Home` | Go to cell A1 |
| `Ctrl+End` | Go to last used cell |
| `Ctrl+Shift+L` | Toggle AutoFilter |
| `Ctrl+D` | Fill down |
| `Ctrl+R` | Fill right |
| `Ctrl+;` | Insert today's date |
| `Ctrl+Shift+;` | Insert current time |
| `Alt+=` | Insert AutoSum formula |

### Glimpse (Presentations)

| Shortcut | Action |
|---|---|
| `F5` | Start Presenter Mode (from first slide) |
| `Shift+F5` | Start from current slide |
| `Escape` | Exit Presenter Mode |
| `→` / `Space` | Next slide (in Presenter Mode) |
| `←` / `Backspace` | Previous slide |
| `Cmd+D` | Duplicate selected slide |
| `Cmd+M` | Add new slide |
| `Delete` | Delete selected element |
| `Cmd+G` | Group selected objects |
| `Cmd+Shift+G` | Ungroup objects |
| `Cmd+]` | Bring forward |
| `Cmd+[` | Send backward |

---

## 🐳 Self-Hosting with Docker

Deploy your own private Openhead instance on any server.

### Quick Start

```bash
docker run -d \
  --name openhead \
  -p 8080:8080 \
  --restart unless-stopped \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /var/cache/nginx \
  --tmpfs /var/run \
  --security-opt no-new-privileges:true \
  ghcr.io/krtvysinghh/openhead:1.0.0
```

Access at: `http://localhost:8080`

### Docker Compose

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
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

```bash
docker-compose up -d
```

### Reverse Proxy with TLS (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name openhead.yourdomain.com;

    ssl_certificate     /etc/ssl/certs/openhead.crt;
    ssl_certificate_key /etc/ssl/private/openhead.key;
    ssl_protocols       TLSv1.2 TLSv1.3;

    location / {
        proxy_pass         http://127.0.0.1:8080;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Full self-hosting guide: [`docs/SELF_HOSTING.md`](docs/SELF_HOSTING.md)

---

## 🧪 Testing

Openhead has a comprehensive automated test suite covering all layers of the stack.

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Run a specific test file
pnpm test tests/formula.test.ts

# Run tests matching a pattern
pnpm test --grep "DOCX"
```

### Test Suite Summary

| Suite | Tests | Coverage |
|---|---|---|
| Formula Engine (90+ functions) | 78 | Pratt parser, operator precedence, dynamic arrays |
| Document AST (Pen) | 42 | Block types, serialization, paragraph normalization |
| Workbook Engine (Sum) | 55 | Topological DAG, spill ranges, cell addressing |
| Presentation Scene Graph (Glimpse) | 38 | Slide operations, themes, animation keyframes |
| DOCX Import/Export | 24 | Round-trip fidelity, edge cases, malformed XML |
| XLSX Import/Export | 18 | Multi-sheet, merged cells, conditional formatting |
| PPTX Import/Export | 16 | DrawingML, masters, transitions |
| Security Corpus | 12 | Zip Slip, Billion Laughs, formula injection, macros |
| AI Provider & Safety | 14 | Permissions, diff generation, backend detection |
| Storage & Recovery | 10 | Atomic writes, crash journal, restore flow |
| Templates | 12 | All 16 templates, structure validation |
| Office Parity | 18 | Goal Seek, Text-to-Columns, watermark, image insert |
| Apps UI & Performance | 6 | Dynamic grid bounds, real styles, presenter scene graph |
| **Total** | **343** | **88 test suites** |

---

## 📁 Project Structure

```
openhead/
│
├── apps/
│   └── studio/                   # React 18 Studio app (Vite + Tailwind)
│       ├── public/               # Static assets (logo.png, favicon.png)
│       ├── src/
│       │   ├── views/
│       │   │   ├── PenView.tsx        # Document editor view
│       │   │   ├── SumView.tsx        # Spreadsheet editor view
│       │   │   └── GlimpseView.tsx    # Presentation editor view
│       │   ├── components/
│       │   │   ├── Header.tsx              # App header with brand + nav
│       │   │   ├── HomeScreen.tsx          # Welcome / recent docs screen
│       │   │   ├── CommandPalette.tsx      # Universal command palette
│       │   │   ├── AiSidebar.tsx           # Local AI panel
│       │   │   ├── TemplatePickerModal.tsx # Template library browser
│       │   │   ├── SettingsModal.tsx       # App settings
│       │   │   └── HelpModal.tsx           # Keyboard shortcuts reference
│       │   └── main.tsx
│       └── index.html
│
├── packages/
│   ├── core/                     # @openhead/core
│   │   └── src/
│   │       ├── templates.ts      # All 16 built-in templates
│   │       ├── storage.ts        # Atomic local storage engine
│   │       ├── types.ts          # Shared type definitions
│   │       └── crash-recovery.ts # Session crash journal
│   │
│   ├── pen/                      # @openhead/pen
│   │   └── src/
│   │       ├── document.ts       # Document model & mutations
│   │       ├── types.ts          # Block, Run, Section types
│   │       ├── docx-exporter.ts  # OOXML DOCX serializer
│   │       └── docx-importer.ts  # OOXML DOCX deserializer
│   │
│   ├── sum/                      # @openhead/sum
│   │   └── src/
│   │       ├── workbook.ts       # Workbook model, sheets, cells
│   │       ├── xlsx-exporter.ts  # OOXML XLSX serializer
│   │       └── xlsx-importer.ts  # OOXML XLSX deserializer
│   │
│   ├── glimpse/                  # @openhead/glimpse
│   │   └── src/
│   │       ├── deck.ts           # Presentation model & mutations
│   │       ├── types.ts          # Slide, Block, Theme types
│   │       ├── pptx-exporter.ts  # OOXML PPTX serializer
│   │       └── pptx-importer.ts  # OOXML PPTX deserializer
│   │
│   ├── formula/                  # @openhead/formula
│   │   └── src/
│   │       ├── parser.ts         # Pratt parser & AST
│   │       ├── evaluator.ts      # Formula evaluator
│   │       └── functions/        # 90+ function implementations
│   │
│   ├── ai/                       # @openhead/ai
│   │   └── src/
│   │       ├── provider.ts       # Ollama / LM Studio connector
│   │       ├── permissions.ts    # AI safety & approval gates
│   │       └── diff.ts           # Word-level diff for review UI
│   │
│   └── ui/                       # @openhead/ui
│       └── src/
│           └── styles.ts         # Glass morphism design tokens
│
├── src-tauri/                    # Rust + Tauri 2 native desktop
│   ├── src/main.rs
│   ├── Cargo.toml
│   └── icons/                    # icon.png, icon.icns, icon.ico + sizes
│
├── tests/                        # Root test suite (87 suites, 337 assertions)
├── docs/                         # Documentation, audits, security, shortcuts
├── compatibility-corpus/         # Real-world DOCX/XLSX/PPTX test fixtures
├── scripts/
│   └── generate_icons.py         # Cross-platform icon generator (with Pillow)
│
├── ARCHITECTURE.md               # High-level architecture overview
├── CHANGELOG.md                  # Full version history
├── COMPATIBILITY.md              # Detailed format compatibility matrix
├── CONTRIBUTING.md               # Contribution guidelines
├── GOVERNANCE.md                 # Project governance model
├── ROADMAP.md                    # Feature roadmap and future milestones
├── SECURITY.md                   # Security policy and disclosure process
├── THREAT_MODEL.md               # Complete threat model analysis
├── Dockerfile                    # Production Docker image
├── docker-compose.yml            # Docker Compose configuration
└── nginx.conf                    # Hardened Nginx configuration
```

---

## 🤝 Contributing

Contributions are warmly welcome! Here's how to get started:

1. **Fork** the repository on GitHub
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/Openhead.git`
3. **Create a branch**: `git checkout -b feat/your-feature-name`
4. **Make your changes** following the existing code style (TypeScript strict)
5. **Run tests** before committing: `pnpm test`
6. **Commit** with a conventional commit message: `feat(sum): add XLOOKUP function`
7. **Push** and **open a Pull Request** against `main`

### Commit Convention

```
feat(scope):    New feature
fix(scope):     Bug fix
docs(scope):    Documentation only
test(scope):    Tests only
refactor(scope): Code restructuring
perf(scope):    Performance improvement
chore(scope):   Tooling, dependencies
```

Scopes: `pen`, `sum`, `glimpse`, `formula`, `ai`, `core`, `ui`, `studio`, `tauri`, `ci`, `docs`

### Code Quality Standards

- TypeScript `strict` mode — no `any`, no implicit returns
- All public APIs must be documented with JSDoc
- New features require corresponding tests
- Security-sensitive code requires threat model review

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full guidelines.

---

## 📜 Changelog

The full version history is in [`CHANGELOG.md`](CHANGELOG.md).

**v1.0.0** — Initial production release
- Pen, Sum, Glimpse — fully functional with DOCX/XLSX/PPTX compatibility
- 90+ formulas, dynamic arrays, Goal Seek, Text to Columns
- 16 professional templates with search and category filters
- Local-first AI with Ollama and LM Studio support
- Security hardening: VBA quarantine, formula injection defense, Zip Slip protection
- Crash recovery, autosave, undo/redo
- Tauri 2 desktop, Docker self-hosting, CI/CD
- 337 automated tests passing across 87 suites

---

## 📄 License

Openhead is open-source software released under the **[Apache License 2.0](LICENSE)**.

```
Copyright 2026 Openhead Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
```

You are free to use, modify, and distribute Openhead — commercially or non-commercially — subject to the Apache 2.0 terms.

---

<div align="center">

<img src="apps/studio/public/logo.png" alt="Openhead" width="48" height="48" />

**Built with ❤️ by the Openhead community**

[GitHub](https://github.com/krtvysinghh/Openhead) &nbsp;·&nbsp; [Releases](https://github.com/krtvysinghh/Openhead/releases) &nbsp;·&nbsp; [Issues](https://github.com/krtvysinghh/Openhead/issues) &nbsp;·&nbsp; [Discussions](https://github.com/krtvysinghh/Openhead/discussions)

*Zero Telemetry · 100% Local · Fully Open Source*

</div>
