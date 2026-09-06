# Changelog

All notable changes to Openhead are documented in this file.

## [0.5.0] - 2026-09-06 (Phase 5: Office Engine Expansion)

### Added
- **Sum Dynamic Array Engine & Spill Ranges**: Full support for spill footprints, target cell population, and `#SPILL!` conflict detection with automatic recovery when obstructions are removed.
- **Dynamic Array Functions**: Added `FILTER`, `SORT`, `SORTBY`, `TRANSPOSE`, and updated `UNIQUE` & `SEQUENCE` with multi-dimensional parameter support.
- **Lookup & Info Functions**: Added `XLOOKUP`, `ISBLANK`, `ISNUMBER`, `ISTEXT`, `ISNONTEXT`, `ISLOGICAL`, `ISERROR`, `ISERR`, `ISNA`, `TYPE`, `N`, `NA`.
- **Math & Date Expansion**: Added `SUMPRODUCT`, `MOD`, `ROUNDUP`, `ROUNDDOWN`, `EOMONTH`, `WORKDAY`, `NETWORKDAYS`.
- **Workbook & Worksheet Controls**: Added sheet duplication, renaming, deletion, reordering, sheet hiding, row/col hiding, freeze panes, cell borders, and range auto-fill (`fillRange`).
- **Glimpse Z-Ordering & Grouping**: Added `bringToFront`, `sendToBack`, `bringForward`, `sendBackward`, `groupNodes`, and `ungroupNode`.
- **WordprocessingML DOCX Fidelity**: Added footnote references (`w:footnoteRef`), section margins (`w:pgMar`), page orientation (`w:pgSz`), and underline formatting.
- **Expanded Test Suite**: **69 passing automated test suites across 24 test files**.

## [0.4.0] - 2026-09-06 (Phase 4: Real-World Compatibility & Productization)

### Added
- **Openhead Compatibility Corpus**: Comprehensive suite of multi-document edge fixtures in `compatibility-corpus/` covering rich typography, LaTeX formulas, nested data tables, multi-variable financial models, and 16:9 executive presentation decks.
- **Structural & Visual Regression Framework**: Added `tests/visual-regression/structural_regression.test.ts` and `tests/compatibility/corpus_roundtrip.test.ts` to guarantee AST and schema stability across exports without flaky OS-dependent pixel diffing.
- **WordprocessingML Table & List Exporter**: Enhanced `@openhead/pen` DOCX adapter to generate standard `w:tbl`, `w:tr`, `w:tc`, bullet/numbered lists, and code blocks.
- **Pen Multi-Page Pagination Engine**: Enhanced pagination estimator calculating dynamic page breaks based on word count, heading density, and margins.
- **20 Test Suites / 57 Unit & Regression Tests**: 100% test pass rate across all monorepo packages.

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
