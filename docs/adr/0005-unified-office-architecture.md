# ADR 0005: Unified Office Architecture & Cross-Application Subsystems

## Status
Accepted

## Context
As Openhead expands to include Pen (Docs), Sum (Sheets), and Glimpse (Slides), user workflows frequently cross application boundaries (e.g., copying spreadsheet cells into a word processing table or presentation chart). A unified shell, centralized command registry, atomic cross-app clipboard, global settings manager, and cross-document search engine are required to provide a cohesive Microsoft Office alternative.

## Decision
1. Implement `OfficeClipboardEngine` in `@openhead/core` capable of translating tabular matrix data across Sum, Pen, and Glimpse seamlessly.
2. Implement `CommandRegistry` managing centralized shortcut registration (`Ctrl+K`), undoable command history, and context-dependent command execution.
3. Implement `SettingsManager` managing persistent user preferences with zero-telemetry defaults.
4. Implement `OfficeSearchEngine` capable of simultaneously querying Pen text ASTs, Sum multi-sheet matrices, and Glimpse presentation scene graphs.
5. Implement `StorageManager` utilizing atomic writes, SHA-256 integrity checksums, and crash-recovery journal snapshots.

## Consequences
- High developer velocity and shared UX patterns across all three applications.
- Seamless copy/paste interoperability without loss of tabular fidelity or formulas.
- Resilient document storage with automatic recovery after unexpected crashes or power loss.
