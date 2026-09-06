# Openhead Phase 9 Reality Audit — Glimpse & PPTX Interoperability

**Audit Date:** 2026-09-06  
**Auditor:** Openhead Architecture & QA  
**Scope:** `@openhead/glimpse`, `apps/studio/src/views/GlimpseView.tsx`, DrawingML/PresentationML PPTX Import/Export, and Compatibility Corpus.

---

## 1. Executive Summary

Glimpse previously established foundational 2D scene graph transforms, layout templates, presenter notes, and bounding box math. However, it lacked rich text runs, full shape geometry presets, tables, charts, slide master/theme inheritance, transactional history, and standards-compliant OOXML PresentationML (`.pptx`) package generation/parsing.

Phase 9 transforms Glimpse into a production-grade presentation design and delivery suite with bidirectional PPTX compatibility.

---

## 2. Subsystem Classification Matrix

| Subsystem | Status | Current Reality & Gaps | Target Phase 9 State |
|---|---|---|---|
| **Slide Model** | Supported | Slides had IDs, titles, backgrounds, notes, and node trees. Lacked layout IDs and master inheritance. | Rich slide model with layout templates, themes, custom dimensions (16:9, 4:3), and persistent speaker notes. |
| **Scene Graph & Nodes** | Supported | Text, Shape, Image, Group nodes existed; lacked Table, Chart, Connector nodes. | Full node hierarchy supporting Rich Text, Geometry Shapes, Tables, Charts, Images, and Nested Groups. |
| **Transforms & Bounding Boxes** | Supported | Position (x, y), dimensions (w, h), rotation, opacity, z-order. | Expanded with multi-selection bounding boxes, resize anchors, rotation handles, and recursive transform propagation. |
| **Grouping & Ungrouping** | Supported | Group node model existed; lacked deep multi-level recursive transform calculations during nested ungrouping. | Production recursive group/ungroup engine preserving relative offsets and z-order. |
| **Alignment & Distribution** | Supported | `AlignmentEngine` had alignLeft, alignCenter, alignRight, top, middle, bottom, distribute. | Enhanced with align-to-slide vs align-to-selection, smart snapping guides (slide center, edges, sibling nodes). |
| **Shapes System** | Partial | Rectangle, circle, triangle. Lacked rounded rectangle, line, arrow, diamond, star, pentagon, hexagon. | Full shape library with DrawingML preset geometries (`rect`, `roundRect`, `ellipse`, `triangle`, `line`, `arrow`, `diamond`, `star5`, `hexagon`). |
| **Text Boxes & Rich Text Runs** | Partial | Flat string on `TextNode` with single font/color. Lacked multi-run rich text and bullet formatting. | Rich text runs (`TextRun`: `bold`, `italic`, `underline`, `strikethrough`, `color`, `fontSize`, `fontFamily`, `link`, bullets/numbers). |
| **Tables** | Unsupported | No presentation table node existed. | Full `TableNode` with grid rows, columns, cell backgrounds, borders, alignments, and DrawingML table serialization (`a:tbl`). |
| **Charts** | Unsupported | No chart primitive existed. | Native `ChartNode` supporting Bar, Column, Line, Pie, and Area chart representations with categories and series. |
| **Images** | Partial | `ImageNode` existed; lacked aspect ratio preservation, crop, opacity, and PPTX media relationship embedding (`ppt/media/*`). | Secure image handling with MIME validation, size limits, and OOXML `p:pic` relationship resolution. |
| **Themes & Masters** | Unsupported | Hardcoded visual styles. | Semantic theme system (`ThemeDefinition`) with color palette (primary, secondary, accent, bg, text) and typography (heading/body). |
| **Slide Layouts** | Supported | Basic 2-column comparison helper existed. | 9 standard layout templates: Title Slide, Title + Content, Section Header, Two Content, Comparison, Title Only, Blank, Content with Caption, Picture with Caption. |
| **Speaker Notes** | Supported | String on slide model; lacked persistent notes slide serialization (`ppt/notesSlides/notesSlide*.xml`). | Persistent notes engine integrated with DrawingML notes slides and live Presenter Mode. |
| **Presenter Mode** | Supported | Dual-view with timer; needed fullscreen toggle, keyboard navigation, and black/white screen support. | Production Presenter Mode with elapsed timer, slide preview, notes drawer, and hotkeys. |
| **Transitions & Animations** | Partial | Enum on slide model; lacked PresentationML transition markup. | Supported slide transitions (`fade`, `push`, `wipe`, `none`) and entry animations. |
| **Undo / Redo** | Partial | Not wired across all canvas mutations. | Transactional `HistoryStack` across all slide additions, deletions, node mutations, grouping, alignment, and formatting. |
| **Copy / Paste** | Unsupported | No clipboard offset placement. | Presentation-aware clipboard with cascade position offset (+20px) and deep node cloning. |
| **PPTX Export** | Unsupported | Only schema tests existed; no real ZIP exporter. | Full high-fidelity `.pptx` ZIP package exporter (`DocxAdapter`-style `PptxAdapter`) generating `ppt/presentation.xml`, `slides/`, `notesSlides/`, `theme/`. |
| **PPTX Import** | Unsupported | No importer existed. | Robust OOXML PresentationML reader extracting slides, shapes, text runs, tables, images, and notes. |
| **Security Hardening** | Unsupported | No protection against malicious PPTX files. | Strict XXE prevention, zip bomb ratio limits (100:1), payload limits (250MB), path traversal blocking, and URL protocol whitelisting. |
| **Performance** | Partial | Needed fast recalculation for 50-slide and 100-slide decks. | Sub-25ms 50-slide PPTX packaging and parsing; sub-1ms transform calculations. |

---

## 3. Plan of Execution

1. **Model Expansion (`types.ts`)**: Add `TextRun`, `TableNode`, `ChartNode`, rich shapes, `ThemeDefinition`, `Transition`, `Animation`.
2. **Interactive Slide Engine (`deck.ts` & `editor.ts`)**: Implement snapping, multi-selection, copy/paste offset, transactional undo/redo, smart layouts.
3. **PresentationML PPTX Exporter & Importer (`export/pptx.ts`)**: Generate and parse complete PPTX ZIP archives (`[Content_Types].xml`, `_rels/.rels`, `ppt/presentation.xml`, `ppt/slides/slide*.xml`, `ppt/notesSlides/notesSlide*.xml`, `ppt/theme/theme1.xml`, `ppt/slideLayouts/`).
4. **Security Hardening (`security.ts`)**: Guard against XXE, zip bombs, path traversal, unsafe hyperlinks.
5. **Compatibility Corpus**: Create 12 real-world presentation decks in `compatibility-corpus/glimpse/`.
6. **Studio UI Updates (`GlimpseView.tsx`)**: Ribbon toolbar, shapes menu, text box controls, table insertion, presenter mode, live PPTX import/export.
7. **Comprehensive Testing**: Target **250+ passing tests** across monorepo.
