# Microsoft Office & Open Document Format Compatibility Matrix

Openhead aims for standards-compliant interchange with Microsoft Office (DOCX, XLSX, PPTX) and OpenDocument (ODT, ODS, ODP) formats.

## Compatibility Status Matrix

| Product | Feature Area | Openhead Native | Microsoft Office Format | OpenDocument Format | Status |
|---|---|---|---|---|---|
| **Pen** | Text & Paragraph Styles | Full AST | DOCX (WordprocessingML) | ODT | Supported |
| **Pen** | Tables & Cell Formatting | Full AST | DOCX Tables (`w:tbl`, `w:tr`, `w:tc`) | ODT Tables | Supported |
| **Pen** | Footnotes & Pagination | Multi-Page Estimator | DOCX Footnotes (`w:footnote`) | ODT Footnotes | Supported |
| **Pen** | Markdown & Frontmatter | Native | CommonMark / GFM | N/A | Supported |
| **Sum** | Standard Formulas (90+) | Native DAG | XLSX Formula Syntax (`<f>`) | ODS Formula Syntax | Supported |
| **Sum** | OpenXML Package (.xlsx) | Native JSZip | XLSX (SpreadsheetML ZIP) | ODS | Supported |
| **Sum** | Typography, Fills, Borders & NumFmts | Native Styles | `<fonts>`, `<fills>`, `<borders>`, `<numFmts>` | ODF Styles | Supported |
| **Sum** | Data Validation & AutoFilter | Native Rules | `<dataValidations>`, `<autoFilter>` | `<table:filter>` | Supported |
| **Sum** | Defined Names & Shared Formulas | Native DAG | `<definedNames>`, `<f t="shared">` | `<table:named-range>` | Supported |
| **Sum** | Cell References & Shifting | $A$1, $A1, A$1 | Standard OpenXML | OpenDocument | Supported |
| **Sum** | Merged Cells & Freeze Panes | Native Grid AST | `<mergeCells>`, `<pane ySplit xSplit>` | `<table:table-cell>` | Supported |
| **Sum** | Financial / Database / Arrays | Native functions | Excel 2021+ Dynamic Arrays | Calc Functions | Supported |
| **Sum** | CSV / TSV Import & Export | Streaming / Matrix | CSV / TSV | CSV / TSV | Supported |
| **Glimpse**| Vector Scene Graph | Native Node Tree | PPTX Shapes | ODP Shapes | Supported |
| **Glimpse**| Slide Layouts & Masters | Template Engine | PPTX SlideLayouts | ODP Master Pages | Supported |
| **Glimpse**| Presenter Mode & Notes | Dual View | PPTX NotesSlide | ODP Presentation | Supported |

## Openhead Compatibility Corpus

The `compatibility-corpus/` test fixture library contains complex real-world document models for automated structural, formula, and visual regression testing:

- `compatibility-corpus/pen/typography/fixture_01_rich_typography.json`: Multi-tier headings, bold/italic inline text, LaTeX formulas.
- `compatibility-corpus/pen/tables/fixture_02_nested_data_table.json`: Multi-column tables with headers and formatted cells.
- `compatibility-corpus/sum/formulas/fixture_03_nested_financial_model.json`: Multi-step loan amortization with reactive `PMT` calculation.
- `compatibility-corpus/glimpse/layouts/fixture_04_executive_slide_deck.json`: 16:9 executive presentation slide with positioned shape nodes.
- `compatibility-corpus/sum/financial/fixture_05_multi_sheet_corporate_model.json`: Multi-sheet corporate model with cross-sheet revenue consolidation.
- `compatibility-corpus/sum/academic/fixture_06_statistical_dataset.json`: Statistical modeling using `AVERAGEIFS`, `STDEV`, `CORREL`.
- `compatibility-corpus/sum/dynamic/fixture_07_dynamic_arrays_spill_matrix.json`: Dynamic arrays, spilled matrices, and `SEQUENCE` / `SORTBY`.
- `compatibility-corpus/sum/executive/fixture_08_executive_freeze_panes.json`: Executive dashboard with frozen headers, custom col widths, and formatted KPIs.
- `compatibility-corpus/sum/errors/fixture_09_error_diagnostics_matrix.json`: Error diagnostic corpus covering `#DIV/0!`, `#N/A`, `#VALUE!`, `#REF!`, `#NAME?`.
- `compatibility-corpus/sum/financial/fixture_10_multi_year_dcf_model.json`: 5-year discounted cash flow model with WACC discounting and terminal enterprise valuation.
- `compatibility-corpus/sum/accounting/fixture_11_general_ledger_journal.json`: Double-entry accounting journal with debit/credit balance validations and conditional formatting.
- `compatibility-corpus/sum/sales/fixture_12_regional_sales_dashboard.json`: Multi-tier sales quota tracker with multi-column sorting, regional tiering, and currency formatting.
- `compatibility-corpus/sum/inventory/fixture_13_warehouse_stock_reorder.json`: Inventory reorder threshold matrix with dynamic status indicators and stock valuation formulas.
- `compatibility-corpus/sum/styles/fixture_14_typography_and_borders_showcase.json`: Rich styling showcase with custom fonts, colors, multi-edge borders, and percentage formats.
- `compatibility-corpus/sum/validation/fixture_15_data_validation_and_autofilter.json`: Strict input constraints (list, integer, textLength) with interactive filtering metadata.
