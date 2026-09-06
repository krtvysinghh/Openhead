# Changelog

All notable changes to Openhead are documented in this file.

## [0.8.0] - 2026-09-06 (Phase 8: Production Pen + DOCX Compatibility)

### Added
- **Full OOXML WordprocessingML (.docx) ZIP Package Exporter & Importer**:
  - Native `DocxAdapter.toBuffer` and `DocxAdapter.fromBuffer` generating and ingesting standards-compliant `.docx` ZIP archives containing `[Content_Types].xml`, `_rels/.rels`, `word/document.xml`, `word/styles.xml`, `word/numbering.xml`, `word/footnotes.xml`, `word/header1.xml`, `word/footer1.xml`, and `word/_rels/document.xml.rels`.
- **Rich Inline Run Model & Selection Formatting**:
  - Character-level inline range splitting and merging engine (`PenEditorOperations.formatInlineRange`, `insertTextAt`, `deleteRange`).
  - Full inline style attributes: `bold`, `italic`, `underline` (single, double, dotted, dashed), `strikethrough`, `color`, `highlight`, `fontFamily`, `fontSize`, `superscript`, `subscript`, `characterSpacing`, `link`, and dynamic fields (`PAGE`, `NUMPAGES`, `DATE`, `TITLE`).
- **Paragraph Properties & Named Styles System**:
  - Paragraph alignment (`left`, `center`, `right`, `justify`), line spacing, paragraph before/after spacing, left/right/firstLine indents, keep-with-next, and widow controls.
  - Named styles catalog with inheritance (`Normal`, `Title`, `Subtitle`, `Heading 1-6`, `Quote`, `FootnoteText`, `Header`, `Footer`).
- **Multi-Level Numbered and Bullet Lists**:
  - Hierarchical lists (levels 0 to 8) with proper OOXML `word/numbering.xml` definitions and indentation controls (`indentListItem`, `outdentListItem`).
- **Advanced Document Tables**:
  - Full table operations: row insertion/deletion, column insertion/deletion, cell text editing, background shading, cell spanning (`gridSpan`), and custom borders.
- **Footnotes & Endnotes**:
  - Complete footnote engine with auto-numbering, inline superscript references, footnote deletion and re-indexing, and `word/footnotes.xml` interchange.
- **Page Layout & Sections**:
  - Multi-section page settings: orientation (portrait / landscape), standard paper sizes (A4, Letter, Legal), margins, running headers & footers, and page number fields.
- **Transactional Undo / Redo & Production Search/Replace**:
  - `HistoryStack` transactional history tracking across all block additions, formatting, table edits, footnote updates, and search & replace operations.
  - Search & replace with whole word matching, case sensitivity, and match counts.
- **Security Hardening**:
  - Strict XXE injection detection, zip bomb compression ratio and payload limits (250MB), path traversal rejection on entry paths, and URL protocol whitelisting (`http:`, `https:`, `mailto:`).
- **12 Real-World Pen Compatibility Corpus Fixtures**:
  - Business letter, corporate report, academic essay, resume/CV, legal contract, financial statements, rich typography showcase, nested lists, merged tables, footnote thesis, landscape appendix, and developer guide.
- **176 Passing Automated Tests across 50 Test Files**:
  - 100% test pass rate with strict TypeScript compilation across the entire monorepo.

## [0.7.0] - 2026-09-06 (Phase 7: XLSX Fidelity + Production Sum)

### Added
- **High-Fidelity OOXML SpreadsheetML Styling**:
  - Full `xl/styles.xml` generation and bidirectional ingestion preserving fonts (families, sizes, bold, italic, underline, strike, colors), fills (solid, pattern types, hex foreground/background), borders (thin, medium, thick, double, dashed, colors across all 4 edges and diagonal), alignments (horizontal, vertical, wrapText, textRotation, indent), and number format identifiers.
  - Complete built-in number format mapping (`numFmtId` 0–49) and custom number format preservation (`<numFmts>`), with dynamic date serial / time / currency formatting engines.
- **Shared Strings & Formula Reference Preservation**:
  - `xl/sharedStrings.xml` parser supporting plain (`<t>`) and rich text (`<r><t>`) string runs with de-duplication on write.
  - Shared formula master-to-follower coordinate translation (`<f t="shared">`) and array formula (`<f t="array">`) preservation.
  - Automatic XML entity escaping and unescaping (`&gt;=`, `&lt;`, `&amp;`, `&quot;`).
- **Data Validation & AutoFilter Engines**:
  - `DataValidationEngine` evaluating `list`, `whole`, `decimal`, `date`, `textLength`, and `custom` rules across `sqref` cell ranges with custom error titles and prompt messages.
  - Non-destructive `AutoFilterConfig` supporting multi-column sorting and filtering with automatic row hiding (`hiddenRows`).
- **Transactional Undo / Redo & Grid Polish**:
  - Full `HistoryStack` transactional history supporting undo/redo across cell updates, format adjustments, range fills, row/col insertions, and deletions.
  - Multi-cell matrix copy/paste with formula reference translation (`shiftFormulaReferences`).
  - Keyboard navigation improvements (`Tab`, `Shift+Tab`, `Home`, `F2`, `Ctrl+Z`, `Ctrl+Y`) and ribbon toolbar Undo/Redo buttons.
- **Security Hardening**:
  - Guardrails against hostile XLSX payloads: XML Entity Expansion (XXE) blocking, zip bomb compression ratio and uncompressed size bounds, and path traversal sanitization on zip entry extraction.
- **15 Real-World Compatibility Corpus Fixtures**:
  - Added corporate DCF valuation models, double-entry general ledgers, regional sales performance dashboards, inventory reorder threshold matrices, rich typography and borders showcases, and data validation rules.
- **127 Passing Automated Tests across 38 Test Files**:
  - 100% test pass rate with strict TypeScript compilation across the entire monorepo.

## [0.6.0] - 2026-09-06 (Phase 6: Production Sum + XLSX Compatibility)

### Added
- **Full OpenXML (.xlsx) ZIP Archive Package Adapter**: Native `XlsxAdapter.toBuffer` and `XlsxAdapter.fromBuffer` generating and parsing standards-compliant SpreadsheetML archives (`[Content_Types].xml`, `xl/workbook.xml`, `xl/styles.xml`, `xl/sharedStrings.xml`, `xl/worksheets/sheet*.xml`) with freeze panes, formulas, values, and styles.
- **Formula Library Expansion (90+ Functions)**:
  - **Multi-Criteria Aggregations**: `SUMIFS`, `COUNTIFS`, `AVERAGEIFS`, `MAXIFS`, `MINIFS`.
  - **Advanced Text Manipulation**: `PROPER`, `SUBSTITUTE`, `REPLACE`, `FIND`, `SEARCH`, `TEXT`, `VALUE`.
  - **Date & Calendar Calculations**: `DAYS`, `WEEKDAY`, `WEEKNUM`, `DATEDIF` (supporting `"Y"`, `"M"`, `"D"`, `"YM"`, `"YD"`, `"MD"`).
  - **Lookups & Structural References**: `XMATCH`, `ROWS`, `COLUMNS`, `ADDRESS`.
  - **Financial Cash Flow Solvers**: `IPMT`, `PPMT`, `IRR` (Newton-Raphson iterative solver).
  - **Logical Operators**: `IFNA`, `XOR`.
- **Spreadsheet Range Shifting & Reference Translation**: Formula reference translator (`shiftFormulaReferences`) accurately translating relative cell coordinates while preserving `$A$1` absolute and `$A1`/`A$1` mixed coordinates during copy/paste and row/col insertions.
- **Grid Column Mutations & Merged Cells**: Added `insertCol(atColIndex)` and `deleteCol(atColIndex)` with coordinate shifting, and `mergeCells(rangeStr)` / `unmergeCells(rangeStr)`.
- **Studio Sum UI Updates**: Added column insertion/deletion controls, header freeze/unfreeze toggles, bold/border styling, sheet tab deletion, and XLSX direct file import/export.
- **Expanded Compatibility Corpus (Fixtures 05–09)**: Corporate multi-sheet consolidation, statistical datasets, dynamic array spill matrices, executive dashboards with freeze panes, and error diagnostic test cases.
- **76 Passing Automated Tests across 27 Test Files**: 100% test pass rate with full coverage of aggregation formulas, column ops, and XLSX round-trip fidelity.

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
