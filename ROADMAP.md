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

## Phase 2: From Foundation to Real Interactive Product (Completed)
- [x] Phase 2 comprehensive reality audit (`docs/PHASE2_AUDIT.md`)
- [x] Durable storage layer with `StorageManager` (save, load, list, autosave, recovery)
- [x] Pen interactive vertical slice (in-place table editor with row/col controls, search & replace dialog, markdown import/export)
- [x] Sum production spreadsheet grid (arrow key cursor navigation, `F2` in-cell edit, row insert/delete with coordinate shifting, number/currency/percent formatters, CSV import/export)
- [x] Glimpse slide studio (interactive shape inspector, 8-point sizing, slide duplicate/reorder, live Presenter Mode with elapsed timer)
- [x] Formula engine extensions (MEDIAN, SUMPRODUCT, TRUNC, INT, EVEN, ODD, ISNUMBER, ISTEXT, ISBLANK, cross-sheet and mixed reference support)
- [x] Centralized cross-platform keyboard shortcut system (`ShortcutsRegistry`)
- [x] Security hardening (CSV formula injection sanitizer, path traversal validator, safe JSON parser)
- [x] Performance benchmarks suite (`docs/PERFORMANCE.md`)

## Phase 3: Advanced Automation, Binary Office Packaging & Collaboration (Upcoming)
- [ ] Binary ZIP packaging for native `.docx`, `.xlsx`, and `.pptx` files
- [ ] CRDT-based offline-first real-time collaboration engine
- [ ] Direct WebLLM / ONNX runtime integration for in-browser local AI inference
- [ ] Desktop packaging with Tauri for native Windows, macOS, and Linux releases
