# ADR 0007: Local-First AI Architecture & Sandboxed Workflows

## Status
Accepted

## Context
AI-assisted document authoring, formula generation, and presentation design are highly valuable, but cloud-hosted AI APIs violate privacy and document confidentiality for enterprises and individual users.

## Decision
1. Create `@openhead/ai` with a pluggable `AiProvider` abstraction prioritizing local execution:
   - `LocalHttpProvider` connecting to local Ollama (`localhost:11434`) and LM Studio (`localhost:1234`).
   - `OfflineMockProvider` providing deterministic offline execution for testing and disconnected environments.
   - `OpenAiCompatibleProvider` allowing user-configured private inference endpoints.
2. Enforce explicit `AiPermissionScope` (`selection`, `paragraph`, `slide`, `sheet`, `document`).
3. Require structured Diff Preview (`DiffEngine`) before mutating any document AST, with explicit user Accept/Reject commits.
4. Maintain a persistent local-only `AiAuditLogger` recording all AI invocations and token usage.
5. Apply strict prompt sandboxing with `PromptSanitizer` to prevent prompt injection and context confusion attacks.

## Consequences
- Complete document confidentiality: user data never leaves the local machine.
- Safe mutations: users visually inspect word-level diffs before accepting changes.
- Works 100% offline without requiring internet access or paid subscription keys.
