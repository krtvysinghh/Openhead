# Openhead Office — Compatibility Matrix & File Format Specification

Openhead delivers high-fidelity bidirectional compatibility with Microsoft Office formats (OpenXML) while maintaining a strict security sandbox.

---

## 📄 Word Processing: Pen (.docx / .odt)

| Feature | Support Level | Implementation Notes |
|---|---|---|
| **Text Runs & Formatting** | Full | Bold, italic, underline, strikethrough, fontSize, fontFamily, color, highlight, superscript, subscript. |
| **Paragraph Formatting** | Full | Alignment, line spacing, margins, indents, before/after spacing. |
| **Styles & Hierarchies** | Full | Built-in heading styles (Heading 1–6), Title, Subtitle, Quote, Code. |
| **Multi-Level Lists** | Full | Bulleted and numbered lists with full `word/numbering.xml` indentation. |
| **Tables & Cells** | Full | Nested cell text, borders, background fills, cell spanning (`gridSpan`). |
| **Footnotes & Endnotes** | Full | Auto-numbering and superscript references mapped to `word/footnotes.xml`. |
| **Page Layout & Sections** | Full | Orientation (Portrait/Landscape), paper sizes (A4, Letter, Legal), margins, running headers/footers. |
| **Fields & Hyperlinks** | Full | `PAGE`, `NUMPAGES`, `DATE`, `TITLE` field tokens and external hyperlinks. |
| **Track Changes & Comments** | Full | Threaded inline comments and revision history records. |
| **VBA Macros** | Explicitly Stripped | For security, macro code is stripped on import and blocked from execution. |

---

## 📊 Spreadsheets: Sum (.xlsx / .ods / .csv)

| Feature | Support Level | Implementation Notes |
|---|---|---|
| **Formula Engine** | Full | 90+ Excel-compatible functions, Pratt parser, multi-sheet topological DAG. |
| **Dynamic Arrays** | Full | Spill ranges, `#SPILL!` obstruction detection, array formulas (`<f t="array">`). |
| **Styles & Number Formats** | Full | `xl/styles.xml` generation & parsing, custom number formats (`<numFmts>`), borders, fills, alignments. |
| **Shared Strings** | Full | `xl/sharedStrings.xml` de-duplication and rich-text run support. |
| **Data Validation** | Full | List, decimal, date, text length, and whole number rules. |
| **AutoFilter** | Full | Multi-column filter criteria, custom sort orders, and hidden rows. |
| **Defined Names** | Full | Workbook and worksheet-level named ranges and constants. |
| **Cell Comments** | Full | Per-cell annotations and note threads. |
| **Auto-Fill Engine** | Full | Arithmetic sequences, quarters, month names, day names. |
| **VBA / XLAM Macros** | Explicitly Blocked | Stripped on ingest to guarantee zero code execution vulnerability. |

---

## 📽️ Presentations: Glimpse (.pptx / .odp)

| Feature | Support Level | Implementation Notes |
|---|---|---|
| **Scene Graph & Shapes** | Full | DrawingML preset geometries (`<a:prstGeom>`), rectangles, cards, circles, polygons, arrows. |
| **Typography & Layouts** | Full | Inline run formatting, multi-column card layouts, 16:9 widescreen coordinate system. |
| **Tables & Charts** | Full | Structured slide tables and multi-series analytics charts (`bar`, `column`, `line`, `pie`, `area`). |
| **Slide Masters** | Full | Master template inheritance with theme palette mapping. |
| **Animations & Transitions** | Full | Entrance/exit keyframe animations and PresentationML `<p:transition>`. |
| **Connectors & Guides** | Full | Auto-routing orthogonal connectors and smart canvas snapping guides. |
| **Presenter Notes** | Full | `ppt/notesSlides` generation and live Presenter Mode view. |
| **3D / SmartArt Morphing** | Schema Preserved | Retained as DrawingML schema objects; rendered with 2D fallback representations in canvas preview. |
