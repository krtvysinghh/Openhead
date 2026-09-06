# Changelog

All notable changes to Openhead are documented in this file.

## [0.1.0] - 2026-09-06

### Added
- Initial release of Openhead office suite monorepo.
- `@openhead/core`: Base document ASTs, command history stack, theme tokens, and local AI provider abstraction.
- `@openhead/formula`: Formula Lexer, Pratt Parser, Dependency Graph (DAG) with cycle detection, and registry with 50+ Excel-compatible functions.
- `@openhead/pen`: Word-class document editor core with rich block hierarchy, inline formatting, stats calculation, and markdown export/import.
- `@openhead/sum`: Spreadsheet engine with matrix coordinate resolution, dynamic ranges, cell formatting, and cascading calculation engine.
- `@openhead/glimpse`: Presentation engine with vector scene graph, master layouts, geometric transforms, and presenter mode.
- `@openhead/ui`: Glassmorphic component library, theme provider, keyboard shortcut manager, and `Cmd+K` Command Palette.
- `apps/studio`: Integrated desktop/web studio hosting Pen, Sum, and Glimpse with seamless document switching.
