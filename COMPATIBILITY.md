# Microsoft Office & Open Document Format Compatibility Matrix

Openhead aims for standards-compliant interchange with Microsoft Office (DOCX, XLSX, PPTX) and OpenDocument (ODT, ODS, ODP) formats.

## Compatibility Status Matrix

| Product | Feature Area | Openhead Native | Microsoft Office Format | OpenDocument Format | Status |
|---|---|---|---|---|---|
| **Pen** | Text & Paragraph Styles | Full AST | DOCX (WordprocessingML) | ODT | Supported |
| **Pen** | Tables & Cell Formatting | Full AST | DOCX Tables | ODT Tables | Supported |
| **Pen** | Markdown & Frontmatter | Native | CommonMark / GFM | N/A | Supported |
| **Sum** | Standard Formulas (50+) | Native DAG | XLSX Formula Syntax | ODS Formula Syntax | Supported |
| **Sum** | Cell References & Ranges | $A$1 notation | Standard OpenXML | OpenDocument | Supported |
| **Sum** | CSV / TSV Import & Export | Streaming / Matrix | CSV / TSV | CSV / TSV | Supported |
| **Glimpse**| Vector Scene Graph | Native Node Tree | PPTX Shapes | ODP Shapes | Supported |
| **Glimpse**| Slide Layouts & Masters | Template Engine | PPTX SlideLayouts | ODP Master Pages | Supported |
| **Glimpse**| Presenter Mode & Notes | Dual View | PPTX NotesSlide | ODP Presentation | Supported |
