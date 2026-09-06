# Changelog

All notable changes to Openhead are documented in this file.

## [0.2.0] - 2026-09-06 (Phase 2)

### Added
- Comprehensive Phase 2 reality audit in `docs/PHASE2_AUDIT.md`.
- `StorageManager` in `@openhead/core`: Local storage persistence, snapshot autosave, crash recovery, and recent files listing.
- `SecuritySanitizer` in `@openhead/core`: CSV/formula injection sanitization, path traversal blocking, and payload size bounds.
- Table editing controls and search & replace engine with regex support in `@openhead/pen`.
- Interactive spreadsheet grid in `@openhead/sum` with keyboard navigation, row/column insertion/deletion, coordinate shifting, and currency/percent formatting.
- Interactive slide studio in `@openhead/glimpse` with property inspector, slide duplication, slide reordering, and Presenter Mode timer.
- 15+ extended Excel functions in `@openhead/formula` (`MEDIAN`, `SUMPRODUCT`, `TRUNC`, `INT`, `EVEN`, `ODD`, `ISNUMBER`, `ISTEXT`, `ISBLANK`), cross-sheet reference parsing (`Sheet2!A1`), and mixed references (`$A1`, `A$1`).
- `ShortcutsRegistry`, `SettingsModal`, and `RecentFilesModal` in `@openhead/ui`.
- Performance benchmark documentation in `docs/PERFORMANCE.md` and benchmark test suite.
- Expanded automated test suite to 37 passing unit & performance tests across 12 test files.

## [0.1.0] - 2026-09-06 (Phase 1)
- Initial release of Openhead office suite monorepo foundation.
- Core packages: `@openhead/core`, `@openhead/formula`, `@openhead/pen`, `@openhead/sum`, `@openhead/glimpse`, `@openhead/ui`, and `apps/studio`.
