# ADR 0001: Monorepo and Shared Core Architecture

## Status
Accepted

## Context
Building an integrated office suite (Word-equivalent Pen, Excel-equivalent Sum, PowerPoint-equivalent Glimpse) requires high code reuse, shared document models, unified shortcut handling, and cross-platform portability across Web, Desktop (Tauri/Electron), and Mobile.

## Decision
We adopt a TypeScript monorepo using `pnpm` workspaces:
- Separate packages for computational engines (`@openhead/formula`, `@openhead/pen`, `@openhead/sum`, `@openhead/glimpse`).
- Shared foundation package (`@openhead/core`) for undo/redo stacks, AST primitives, and AI interfaces.
- Decoupled UI package (`@openhead/ui`) implementing our glassmorphic design system.
- An application layer (`apps/studio`) consuming the core packages.

## Consequences
- Clean separation between business logic and UI rendering.
- Core engines can run headlessly in node, workers, or server environments.
- Fast builds, strict typing boundaries, and isolated test suites.
