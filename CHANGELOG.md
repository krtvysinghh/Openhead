# Changelog

All notable changes to Openhead are documented in this file.

## [0.3.0] - 2026-09-06 (Phase 3: Depth & Compatibility)

### Added
- **Formula Debugger & Inspector**: Visual step-by-step evaluator trace tool showing token streams, AST nodes, referenced cells, and clear error diagnostics (e.g. why `#DIV/0!`, `#VALUE!`, or `#REF!` occurred).
- **Formula Autocomplete**: Live popup suggestions matching partial formula prefixes with complete parameter signatures and descriptions for 70+ functions.
- **Financial & Engineering Functions**: Added `PMT`, `FV`, `PV`, `NPV`, `DELTA`, `CONVERT`, `BIN2DEC`, `DEC2BIN`, `HEX2DEC`.
- **Database & Dynamic Array Functions**: Added `DSUM`, `DAVERAGE`, `UNIQUE`, `SEQUENCE`.
- **Spreadsheet Data Features**: Column sorting (A-Z / Z-A), `NamedRangesManager`, and `ConditionalFormattingEvaluator` rules engine.
- **Glimpse Alignment Engine**: Geometric alignment tools (Align Left, Center, Right, Top, Middle, Bottom, Distribute Horizontally/Vertically) and Slide Layout templates (`createTwoColumnCompare`).
- **Office Compatibility Lab**: Dedicated test suite in `tests/compatibility/` validating WordprocessingML (DOCX), SpreadsheetML (XLSX), and PresentationML (PPTX) data integrity.
- **Hardened Security Boundaries**: XML entity expansion (XXE) and billion laughs attack blocker, zip bomb compression ratio verifier, and strict URL scheme whitelist (`http`, `https`, `mailto`).
- **Expanded Test Suite**: 51 passing automated unit and compatibility tests across 18 test files.

## [0.2.0] - 2026-09-06 (Phase 2: Product & Persistence)
- Persistent storage manager (`StorageManager`), autosave snapshots, and recent files browser.
- Interactive table mutations and search & replace in Pen.
- Spreadsheet grid keyboard navigation, row shifting, and formatting in Sum.
- Shape inspector, slide duplication, and Presenter Mode timer in Glimpse.

## [0.1.0] - 2026-09-06 (Phase 1: Architecture & Foundation)
- Initial release of Openhead monorepo and shared engines.
