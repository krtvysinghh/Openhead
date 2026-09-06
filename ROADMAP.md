# Openhead Roadmap

## Phase 1: Foundation & Core Engines (Current)
- [x] Monorepo architecture and package topology
- [x] High-performance `@openhead/formula` engine with Pratt parser and 50+ Excel functions
- [x] Complete `@openhead/pen` document model with block AST and undo/redo history
- [x] Complete `@openhead/sum` spreadsheet matrix engine with dynamic cell references
- [x] Complete `@openhead/glimpse` slide deck scene graph and presenter system
- [x] Restrained glassmorphic design system in `@openhead/ui`
- [x] Unified Openhead Studio shell application
- [x] Comprehensive test suites and architectural decision records (ADRs)

## Phase 2: Office Format Fidelity & Extended Functions
- [ ] Direct binary DOCX / XLSX / PPTX packager with zip compression
- [ ] Extended financial, statistical, and engineering formula registry (100+ functions)
- [ ] Pivot tables and conditional formatting rules engine in Sum
- [ ] Rich text canvas layout engine with pagination preview in Pen

## Phase 3: Local AI & Collaboration
- [ ] Embedded WebLLM / ONNX runtime for zero-configuration in-browser local AI
- [ ] CRDT-based offline-first real-time collaboration engine
- [ ] Plugin API and sandboxed JavaScript/Python macro scripting engine
