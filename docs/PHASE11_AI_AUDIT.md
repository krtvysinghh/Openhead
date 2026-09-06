# Openhead Phase 11 Audit: Local-First AI Architecture

## 1. Executive Summary
AI in Openhead is strictly **optional, local-first, permission-controlled, auditable, and non-intrusive**.
Openhead adheres to the fundamental hierarchy:
$$\text{User} \longrightarrow \text{Office Workflow} \longrightarrow \text{AI Assistance}$$

Never will document contents be silently uploaded to external clouds or third-party servers.

---

## 2. Architecture & Subsystem Specification

### 2.1 Provider Abstraction (`packages/ai`)
- **`AiProvider` Interface**: Generic contract for `generate`, `summarize`, `rewrite`, `explainFormula`, `suggestCharts`, and `extractActions`.
- **Local Providers**:
  - `LocalHttpProvider` (Ollama, LM Studio, vLLM, llama.cpp localhost endpoints).
  - `OfflineMockProvider` (deterministic heuristic fallback when completely offline with zero inference server).
- **Optional Remote Providers**:
  - `OpenAiCompatibleProvider` (explicit API key, visible endpoint URL, requiring explicit user authorization per request).

### 2.2 Explicit Context Permissions & Scopes
Every AI operation requires explicit user-defined context scope:
- `selection-only`: Only the highlighted text run, cells, or shape.
- `current-paragraph` / `current-slide` / `current-worksheet`.
- `entire-document` / `entire-workbook` / `entire-deck`.
No document content outside the permitted scope is passed to the provider.

### 2.3 Visual Privacy Indicators
Every AI action prominently displays:
- Provider Name (e.g. "Local Ollama (qwen2.5:7b)")
- Execution Mode (Local / Remote)
- Context Scope (e.g. "Selection: 142 chars")
- Endpoint destination.

### 2.4 Mutation Safety & Transactional Undo
All AI mutations adhere to the Safety Lifecycle:
$$\text{Prompt} \longrightarrow \text{Diff Preview} \longrightarrow \text{User Review (Accept / Reject)} \longrightarrow \text{Undoable History Commit}$$
AI never executes destructive replacements silently.

### 2.5 Local Audit Log
An optional, persistent, privacy-preserving audit log records timestamp, provider, model, context token estimate, and action name without leaking sensitive payload data.
