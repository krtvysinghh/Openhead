# Microsoft Office & Open Document Format Compatibility Matrix

Openhead aims for standards-compliant interchange with Microsoft Office (DOCX, XLSX, PPTX) and OpenDocument (ODT, ODS, ODP) formats.

## Compatibility Status Matrix

| Product | Feature Area | Openhead Native | Microsoft Office Format | OpenDocument Format | Status |
|---|---|---|---|---|---|
| **Pen** | Full DOCX Package (.docx) | Native JSZip | OOXML (`word/document.xml`, `styles.xml`, `numbering.xml`) | ODT | Supported |
| **Pen** | Inline Typography & Highlights | Full AST | `<w:rPr>` (`w:b`, `w:i`, `w:u`, `w:strike`, `w:color`, `w:highlight`, `w:sz`) | ODF Text Styles | Supported |
| **Pen** | Paragraph Formatting & Indents | Full AST | `<w:pPr>` (`w:jc`, `w:spacing`, `w:ind`, `w:keepNext`) | ODF Paragraphs | Supported |
| **Pen** | Named Styles & Inheritance | Styles Engine | `<w:styles>` (Normal, Heading 1-6, Title, Subtitle, Quote) | ODF Named Styles | Supported |
| **Pen** | Multi-Level Hierarchical Lists | Numbering Engine | `<w:numbering>` (Bullet & Numbered levels 0-8) | ODF List Styles | Supported |
| **Pen** | Tables, Merged Cells & Shading | Full AST | `<w:tbl>`, `<w:gridSpan>`, `<w:shd>`, `<w:tcBorders>` | ODT Tables | Supported |
| **Pen** | Footnotes & Citations | Multi-Page Engine | `<w:footnotes>` & `<w:footnoteReference>` | ODT Footnotes | Supported |
| **Pen** | Headers, Footers & Fields | Layout Engine | `<w:hdr>`, `<w:ftr>`, `<w:fldSimple w:instr="PAGE">` | ODF Header/Footer | Supported |
| **Pen** | Hyperlinks & External Refs | Safe Engine | `<w:hyperlink>` (whitelisted http/https/mailto) | ODF Links | Supported |
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
| **Glimpse**| Full PPTX Package (.pptx) | Native JSZip | OOXML PresentationML & DrawingML | ODP | Supported |
| **Glimpse**| DrawingML Preset Geometries | Native Vector | `<a:prstGeom>` (rect, roundRect, ellipse, triangle, star, etc.) | ODF Draw | Supported |
| **Glimpse**| Rich Text & Multi-level Paragraphs | Full Scene Graph | `<p:txBody>`, `<a:p>`, `<a:r>`, `<a:buChar>`, `<a:buAutoNum>` | ODF Text | Supported |
| **Glimpse**| Presentation Tables & Grid Styles | Native Table | `<p:graphicFrame>` & `<a:tbl>` | ODF Table | Supported |
| **Glimpse**| Analytics Charts & Series | Native Chart | DrawingML GraphicFrame / Chart | ODF Chart | Supported |
| **Glimpse**| Slide Layouts & Templates | Template Engine | PPTX SlideLayouts & Master IDs | ODP Master Pages | Supported |
| **Glimpse**| Presenter Mode & Speaker Notes | Dual View Engine | `<p:notes>` & `<p:notesMaster>` | ODP Presentation | Supported |
| **Glimpse**| Slide Transitions & Timings | Motion Engine | `<p:transition>` (fade, push, wipe, zoom) | ODF Transitions | Supported |

## Openhead Compatibility Corpus

The `compatibility-corpus/` test fixture library contains complex real-world document models for automated structural, formula, and visual regression testing:

### Pen (WordprocessingML DOCX) Fixtures
- `compatibility-corpus/pen/fixture_01_business_letter.json`: Executive business correspondence with company header, recipient metadata, and signature.
- `compatibility-corpus/pen/fixture_02_corporate_report.json`: Annual operational report with multi-level headings, bold monetary metrics, and summary tables.
- `compatibility-corpus/pen/fixture_03_academic_essay.json`: Research publication with italic abstracts, section numbers, and academic footnotes.
- `compatibility-corpus/pen/fixture_04_resume_cv.json`: Professional curriculum vitae with contact headers, bullet points, and typography styling.
- `compatibility-corpus/pen/fixture_05_legal_contract.json`: Master Services Agreement with multi-level numbered clauses and definition formatting.
- `compatibility-corpus/pen/fixture_06_financial_report.json`: Quarterly financial release with multi-column revenue and gross profit statement tables.
- `compatibility-corpus/pen/fixture_07_heavily_styled_doc.json`: Rich styling showcase (bold, italic, underline, strike, color, highlight, super/subscripts).
- `compatibility-corpus/pen/fixture_08_nested_lists.json`: Hierarchical lists up to 3 levels deep with mixed bullet and decimal numbering.
- `compatibility-corpus/pen/fixture_09_large_tables.json`: Matrix table with cell spanning (`gridSpan`), background fills, and custom borders.
- `compatibility-corpus/pen/fixture_10_footnote_heavy_thesis.json`: Historical research paper containing multiple linked numbered footnotes.
- `compatibility-corpus/pen/fixture_11_multi_section_landscape.json`: Multi-section landscape layout with custom margins and running headers/footers.
- `compatibility-corpus/pen/fixture_12_image_rich_document.json`: Visual document containing callout quote blocks and code syntax snippets.

### Sum (SpreadsheetML XLSX) Fixtures
- `compatibility-corpus/sum/financial/fixture_01_dcf_model.json`: 5-year discounted cash flow valuation model.
- `compatibility-corpus/sum/financial/fixture_02_accounting_ledger.json`: Double-entry accounting ledger with debit/credit balance validations.
- `compatibility-corpus/sum/formulas/fixture_03_nested_financial_model.json`: Multi-step loan amortization with reactive `PMT` calculation.
- `compatibility-corpus/sum/executive/fixture_04_sales_quota_dashboard.json`: Regional sales leaderboard with multi-column sorting and commission tiers.
- `compatibility-corpus/sum/financial/fixture_05_multi_sheet_corporate_model.json`: Multi-sheet corporate model with cross-sheet revenue consolidation.
- `compatibility-corpus/sum/academic/fixture_06_statistical_dataset.json`: Statistical modeling using `AVERAGEIFS`, `STDEV`, `CORREL`.
- `compatibility-corpus/sum/dynamic/fixture_07_dynamic_arrays_spill_matrix.json`: Dynamic arrays, spilled matrices, and `SEQUENCE` / `SORTBY`.
- `compatibility-corpus/sum/executive/fixture_08_executive_freeze_panes.json`: Executive dashboard with frozen headers, custom col widths, and formatted KPIs.
- `compatibility-corpus/sum/errors/fixture_09_error_diagnostics_matrix.json`: Error diagnostic corpus covering `#DIV/0!`, `#N/A`, `#VALUE!`, `#REF!`, `#NAME?`.
- `compatibility-corpus/sum/complex/fixture_10_project_tracker.json`: Gantt milestone scheduling and workday calculations.
- `compatibility-corpus/sum/academic/fixture_11_gradebook_scores.json`: Academic gradebook with percentile rank calculations.
- `compatibility-corpus/sum/complex/fixture_12_inventory_stock.json`: Warehouse inventory reorder threshold monitoring.
- `compatibility-corpus/sum/formatting/fixture_13_heavy_typography_borders.json`: Rich typography, pattern fills, and multi-edge border styling.
- `compatibility-corpus/sum/formulas/fixture_14_defined_names_ranges.json`: Named ranges and defined formula coordinates.
- `compatibility-corpus/sum/complex/fixture_15_data_validation_and_autofilter.json`: Dropdown list validation and AutoFilter sorting rules.

### Glimpse (PresentationML PPTX) Fixtures
- `compatibility-corpus/glimpse/fixture_01_corporate_all_hands_title.json`: Corporate all-hands title slide with 16:9 widescreen layout and subtitle.
- `compatibility-corpus/glimpse/fixture_02_executive_kpi_dashboard.json`: 4-column executive KPI card dashboard with metric titles, values, and delta badges.
- `compatibility-corpus/glimpse/fixture_03_sales_pitch_deck.json`: Enterprise pitch comparison deck with legacy vs Openhead glassmorphic cards.
- `compatibility-corpus/glimpse/fixture_04_quarterly_business_review.json`: Operational QBR review slide with multi-level bulleted takeaway items.
- `compatibility-corpus/glimpse/fixture_05_product_roadmap_timeline.json`: Multi-phase product roadmap timeline cards with border highlights.
- `compatibility-corpus/glimpse/fixture_06_technical_architecture_cards.json`: Architecture deep-dive cards illustrating package boundaries and AST parsing.
- `compatibility-corpus/glimpse/fixture_07_financial_performance_tables.json`: 5x5 departmental expense budget table with header row and status indicators.
- `compatibility-corpus/glimpse/fixture_08_marketing_campaign_analytics.json`: Analytics chart slide tracking lead velocity across organic and direct inbound channels.
- `compatibility-corpus/glimpse/fixture_09_academic_research_findings.json`: Academic algorithmic complexity evaluation slide with bold inline definitions.
- `compatibility-corpus/glimpse/fixture_10_startup_investor_deck.json`: Series A seed investor closing deck with star geometry vector callouts and zoom transition.
- `compatibility-corpus/glimpse/fixture_11_multilevel_typography_quotes.json`: Architectural manifesto slide featuring centered speech callouts and quote typography.
- `compatibility-corpus/glimpse/fixture_12_speaker_notes_and_transitions.json`: Multi-slide keynote deck demonstrating speaker notes preservation and push slide transitions.
