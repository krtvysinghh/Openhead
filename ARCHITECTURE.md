# Openhead Architecture

## System Overview

Openhead is structured as a modular TypeScript monorepo with strict layer boundaries. The architecture enforces separation of concerns between computational engines, data models, rendering pipelines, and platform wrappers.

```text
 packages/core        <- Document AST primitives, Undo/Redo, Event bus, AI abstractions
 packages/formula     <- Lexer, Pratt Parser, Dependency DAG, Excel Function Registry
 packages/pen         <- Document model, typesetting rules, styles, block transforms
 packages/sum         <- Matrix storage, range indexing, cascading calculation, formatting
 packages/glimpse     <- Slide deck model, Scene Graph, vector transforms, presenter loop
 packages/ui          <- Glassmorphic design tokens, shared layout components, command palette
 apps/studio          <- Unified multi-app desktop/web shell
```

## Core Principles

1. **Shared Computational Cores**: Business logic for documents, calculation formulas, and slide scenes are 100% platform-agnostic and do not depend on DOM, Electron, or mobile APIs directly.
2. **Defensive Data Models**: Every document model is serialized as structured JSON ASTs with schema validation, preventing malformed memory states and malicious code injection.
3. **Reactive Calculation Graph**: The Sum formula engine utilizes a Directed Acyclic Graph (DAG) with topological sorting and cycle detection (`#CYCLE!`), guaranteeing deterministic $O(N)$ updates on cell mutation.
4. **Isolated AI Bridge**: AI functionality communicates exclusively through an abstract interface (`AIProvider`). Local model execution is prioritized via WebLLM/Ollama endpoints.
