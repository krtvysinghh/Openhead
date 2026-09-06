# Openhead Phase 7 — XLSX Compatibility & Fidelity Audit

Date: 2026-09-06
Status: Production Fidelity Baseline

This document classifies the SpreadsheetML (OOXML `.xlsx`) and Openhead Sum spreadsheet engine features across four precise categories: **Supported**, **Partial**, **Unsupported**, and **Planned**.

---

## 1. OOXML Parts & Architecture

| OOXML Package Part | Status | Description / Notes |
|---|---|---|
| `[Content_Types].xml` | **Supported** | Generates standard MIME types for workbook, worksheets, styles, sharedStrings, rels. |
| `_rels/.rels` | **Supported** | Root relationship mapping to `xl/workbook.xml`. |
| `xl/_rels/workbook.xml.rels` | **Supported** | Dynamic worksheet, style, and shared string relationship mapping. |
| `xl/workbook.xml` | **Supported** | Multi-sheet indexing, sheet visibility (`state="hidden"`), defined names / named ranges. |
| `xl/styles.xml` | **Supported** | Full palette mapping: `<numFmts>`, `<fonts>`, `<fills>`, `<borders>`, `<cellXfs>`, `<dxfs>`. |
| `xl/sharedStrings.xml` | **Supported** | String deduplication on export; plain `<t>` and rich text `<r><t>` parsing with XML unescaping on import. |
| `xl/worksheets/sheet*.xml` | **Supported** | Grid cells (`<c>`), values (`<v>`), formulas (`<f>`), dimensions, cols (`<cols>`), rows (`<row>`), merged cells (`<mergeCells>`), freeze panes (`<pane>`), data validation (`<dataValidations>`), autoFilter (`<autoFilter>`), conditional formatting (`<conditionalFormatting>`). |
| `xl/drawings/drawing*.xml` | **Planned** | Embedded vector shapes and chart objects. |
| `xl/comments*.xml` | **Planned** | Cell comment annotations and threaded discussions. |
| `xl/pivotTables/` | **Unsupported** | Pivot cache and pivot table definitions. |
| `xl/vbaProject.bin` | **Unsupported (By Design)**| VBA Macros (excluded for privacy, security, and sandboxing). |

---

## 2. Formatting & Styles (`xl/styles.xml`)

| Style Category | Feature | Status | Details |
|---|---|---|---|
| **Fonts** | Font family / name | **Supported** | Arial, Calibri, Segoe UI, Inter, Roboto, etc. |
| | Font size | **Supported** | Integer / float point sizes. |
| | Bold / Italic / Underline | **Supported** | Standard toggles preserved bi-directionally. |
| | Strikethrough | **Supported** | `<strike/>` element preservation. |
| | Font Color | **Supported** | Standard hex RGB and 8-digit ARGB colors (`<color rgb="FF1E293B"/>`). |
| **Fills** | Solid fills | **Supported** | `<patternFill patternType="solid"><fgColor rgb="..."/></patternFill>`. |
| | Background colors | **Supported** | Hex RGB / ARGB color mapping. |
| | Pattern fills | **Partial** | Solid pattern fully preserved; other pattern fills mapped to base color. |
| **Borders** | Left / Right / Top / Bottom | **Supported** | `<left>`, `<right>`, `<top>`, `<bottom>` with line styles. |
| | Border styles | **Supported** | `thin`, `medium`, `thick`, `dashed`, `double`. |
| | Border colors | **Supported** | Color hex values per edge. |
| | Diagonal borders | **Partial** | Parsed if present; standard orthogonal borders prioritized in UI. |
| **Alignment** | Horizontal | **Supported** | `left`, `center`, `right`, `justify`. |
| | Vertical | **Supported** | `top`, `center`, `bottom`. |
| | Wrap Text | **Supported** | `<alignment wrapText="1"/>` preserved bi-directionally. |
| | Text Rotation & Indent | **Supported** | `<alignment textRotation="..." indent="..."/>`. |
| **Number Formats** | Built-in Formats (IDs 0–49)| **Supported** | General, 0, 0.00, #,##0, $#,##0, %, 0.00%, date/time formats. |
| | Custom Number Formats | **Supported** | `<numFmt numFmtId="164" formatCode="..."/>` preserved and parsed. |

---

## 3. Worksheet Layout & Structure

| Feature | Status | Details |
|---|---|---|
| **Column Widths** | **Supported** | `<col min="X" max="Y" width="W" customWidth="1"/>` preserved bi-directionally. |
| **Row Heights** | **Supported** | `<row r="R" ht="H" customHeight="1"/>` preserved bi-directionally. |
| **Hidden Rows & Columns** | **Supported** | `hidden="1"` on rows and columns preserved without destructive cell loss. |
| **Merged Cells** | **Supported** | `<mergeCells><mergeCell ref="A1:C2"/></mergeCells>` with collision validation. |
| **Freeze Panes** | **Supported** | Top rows (`ySplit`), left columns (`xSplit`), or 2D intersection (`topLeftCell`). |
| **Sheet Visibility** | **Supported** | Active, visible, and hidden (`state="hidden"`) sheets preserved. |

---

## 4. Formula Fidelity & Cell Types

| Category | Feature | Status | Details |
|---|---|---|---|
| **Formulas** | Exact text preservation | **Supported** | Formula expressions preserved without silent mutation. |
| | Relative / Absolute / Mixed | **Supported** | `$A$1`, `$A1`, `A$1`, `A1` preserved and translated during copy/paste and col/row shifts. |
| | Sheet-qualified references | **Supported** | `Sheet1!A1`, `'Quarter 1'!B5` preserved with proper quoting. |
| | Shared Formulas | **Supported** | `<f t="shared" si="..." ref="...">` master and follower reference translation. |
| | Legacy Array Formulas | **Supported** | `<f t="array" ref="...">` distinct from dynamic arrays. |
| | Dynamic Arrays & Spill | **Supported** | `UNIQUE`, `FILTER`, `SEQUENCE`, `SORT`, `SORTBY`, `TRANSPOSE` with `#SPILL!` detection. |
| | Unsupported Formulas | **Supported** | Preserved in original text; foreign cached `<v>` retained with uncalculated marker. |
| **Cell Types** | Numeric | **Supported** | Standard integers and IEEE floating-point numbers. |
| | Shared String / Plain Text | **Supported** | Stored in shared strings table with XML escaping. |
| | Inline Strings | **Supported** | `<c t="inlineStr"><is><t>...</t></is></c>` parsed on import. |
| | Boolean | **Supported** | `<c t="b"><v>1</v></c>` (TRUE) and `<c t="b"><v>0</v></c>` (FALSE). |
| | Error Types | **Supported** | `<c t="e"><v>#DIV/0!</v></c>`, `#VALUE!`, `#REF!`, `#NAME?`, `#N/A`, `#NUM!`, `#NULL!`, `#SPILL!`. |
| | Date / Time Serials | **Supported** | Converted to/from ISO date strings and Excel serial date numbers (1900 date system). |

---

## 5. Advanced Workbook Systems

| System | Status | Details |
|---|---|---|
| **Defined Names / Named Ranges** | **Supported** | Workbook-scoped and sheet-scoped named ranges exported to `xl/workbook.xml` and imported. |
| **Data Validation** | **Supported** | `<dataValidations>` with `list`, `whole`, `decimal`, `date`, `textLength`, `custom` rules and error messages. |
| **AutoFilter** | **Supported** | `<autoFilter ref="...">` non-destructive row filtering preserving underlying cell data. |
| **Conditional Formatting** | **Supported** | `<conditionalFormatting sqref="...">` with `cellIs` and `expression` rules mapped to `@openhead/sum`. |
| **Undo / Redo History** | **Supported** | Full multi-step snapshot and transaction stack for edits, pastes, formats, row/col ops, merges. |

---

## 6. Security Boundaries & Limits

| Threat Vector | Mitigation | Status |
|---|---|---|
| **XML Entity Expansion (XXE)** | Strict screening rejecting `<!DOCTYPE`, `<!ENTITY`, `SYSTEM`, `PUBLIC`. | **Enforced** |
| **Zip Bomb / Decompression Ratio** | Maximum uncompressed payload ratio (100:1) and size ceiling (50MB). | **Enforced** |
| **Path Traversal in ZIP** | Rejection of entries containing `..`, absolute paths `/`, or illegal schemes. | **Enforced** |
| **CSV / Formula Injection** | Sanitization of unsafe formula prefix characters (`=`, `+`, `-`, `@`) in plain text exports. | **Enforced** |
| **Oversized Sheet Dimensions** | Max row limit (1,048,576) and col limit (16,384) with memory guard. | **Enforced** |

