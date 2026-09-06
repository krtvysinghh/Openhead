# Microsoft Office & Open Document Format Compatibility Matrix

Openhead aims for standards-compliant interchange with Microsoft Office (DOCX, XLSX, PPTX) and OpenDocument (ODT, ODS, ODP) formats.

## Compatibility Status Matrix

| Product | Feature Area | Openhead Native | Microsoft Office Format | OpenDocument Format | Status |
|---|---|---|---|---|---|
| **Pen** | Text & Paragraph Styles | Full AST | DOCX (WordprocessingML) | ODT | Supported |
| **Pen** | Tables & Cell Formatting | Full AST | DOCX Tables (`w:tbl`, `w:tr`, `w:tc`) | ODT Tables | Supported |
| **Pen** | Footnotes & Pagination | Multi-Page Estimator | DOCX Footnotes (`w:footnote`) | ODT Footnotes | Supported |
| **Pen** | Markdown & Frontmatter | Native | CommonMark / GFM | N/A | Supported |
| **Sum** | Standard Formulas (70+) | Native DAG | XLSX Formula Syntax | ODS Formula Syntax | Supported |
| **Sum** | Cell References & Ranges | $A$1 notation | Standard OpenXML | OpenDocument | Supported |
| **Sum** | Financial / Database / Arrays | Native functions | Excel 2021+ Dynamic Arrays | Calc Functions | Supported |
| **Sum** | CSV / TSV Import & Export | Streaming / Matrix | CSV / TSV | CSV / TSV | Supported |
| **Glimpse**| Vector Scene Graph | Native Node Tree | PPTX Shapes | ODP Shapes | Supported |
| **Glimpse**| Slide Layouts & Masters | Template Engine | PPTX SlideLayouts | ODP Master Pages | Supported |
| **Glimpse**| Presenter Mode & Notes | Dual View | PPTX NotesSlide | ODP Presentation | Supported |

## Openhead Compatibility Corpus

The `compatibility-corpus/` test fixture library contains complex real-world document models for automated structural and visual regression testing:

- `compatibility-corpus/pen/typography/fixture_01_rich_typography.json`: Multi-tier headings, bold/italic inline text, LaTeX formulas.
- `compatibility-corpus/pen/tables/fixture_02_nested_data_table.json`: Multi-column tables with headers and formatted cells.
- `compatibility-corpus/sum/formulas/fixture_03_nested_financial_model.json`: Multi-step loan amortization with reactive `PMT` calculation.
- `compatibility-corpus/glimpse/layouts/fixture_04_executive_slide_deck.json`: 16:9 executive presentation slide with positioned shape nodes.
