# Openhead Roadmap

## Phase 1: Foundation & Core Engines (Completed)
- [x] Monorepo architecture and package topology
- [x] High-performance `@openhead/formula` engine with Pratt parser and 50+ Excel functions
- [x] Complete `@openhead/pen` document model with block AST and undo/redo history
- [x] Complete `@openhead/sum` spreadsheet matrix engine with dynamic cell references
- [x] Complete `@openhead/glimpse` slide deck scene graph and presenter system
- [x] Restrained glassmorphic design system in `@openhead/ui`
- [x] Unified Openhead Studio shell application
- [x] Comprehensive test suites and architectural decision records (ADRs)

## Phase 2: Interactive Product & Persistence (Completed)
- [x] Phase 2 reality audit (`docs/PHASE2_AUDIT.md`)
- [x] Durable storage layer with `StorageManager` (save, load, list, autosave, recovery)
- [x] Pen interactive vertical slice (in-place table editor with row/col controls, search & replace dialog, markdown import/export)
- [x] Sum production spreadsheet grid (arrow key cursor navigation, `F2` in-cell edit, row insert/delete with coordinate shifting, number/currency/percent formatters, CSV import/export)
- [x] Glimpse slide studio (interactive shape inspector, 8-point sizing, slide duplicate/reorder, live Presenter Mode with elapsed timer)
- [x] Centralized cross-platform keyboard shortcut system (`ShortcutsRegistry`)
- [x] Security hardening (CSV formula injection sanitizer, path traversal validator, safe JSON parser)
- [x] Performance benchmarks suite (`docs/PERFORMANCE.md`)

## Phase 3: Compatibility & Depth (Completed)
- [x] Phase 3 depth audit (`docs/PHASE3_AUDIT.md`)
- [x] Step-by-step interactive **Formula Debugger** (`FormulaDebugger`) with AST token breakdowns and human-readable error reasons
- [x] Formula autocomplete engine (`FormulaAutocomplete`) with parameter signatures and descriptions
- [x] 20+ new Excel functions across Financial, Engineering, Database, and Dynamic Arrays (`PMT`, `FV`, `PV`, `NPV`, `DELTA`, `CONVERT`, `DSUM`, `DAVERAGE`, `UNIQUE`, `SEQUENCE`)
- [x] Spreadsheet sorting (ASC/DESC), filtering, Named Ranges manager, and Conditional Formatting rule evaluator
- [x] Glimpse object alignment tools (Align Left/Center/Right/Top/Middle/Bottom, Distribute) and slide layout templates
- [x] Office Compatibility Lab (`tests/compatibility/`) with automated round-trip tests for DOCX, XLSX, and PPTX models
- [x] Advanced security fuzzing: XML entity expansion (XXE) validator, zip bomb compression ratio bounds, strict URL protocol whitelist
- [x] 51 passing automated test suites across 18 test files

## Phase 4: Desktop Packaging & Multi-Platform Distribution (Upcoming)
- [ ] Tauri 2.0 native packaging for macOS (.dmg / .app), Windows (.msi / .exe), and Linux (.AppImage / .deb)
- [ ] Direct binary ZIP compressor for zero-dependency local `.docx`, `.xlsx`, `.pptx` writing
- [ ] Offline WebLLM / ONNX runtime for zero-configuration in-browser local AI inference
- [ ] CRDT-based offline-first multi-device sync
