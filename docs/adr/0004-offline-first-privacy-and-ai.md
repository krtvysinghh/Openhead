# ADR 0004: Offline-First Privacy and Local AI Abstraction

## Status
Accepted

## Context
Office users deal with private, sensitive documents. Cloud-only architectures risk data leaks and mandatory vendor lock-in.

## Decision
- Openhead is strictly **offline-first**. All document persistence, formula recalculations, and layout rendering happen locally.
- AI capabilities are abstracted through an `AIProvider` interface supporting local model endpoints (e.g., Ollama, WebLLM, Local Llama) with explicit per-action user invocation.
- Zero telemetry or network requests without user configuration.

## Consequences
- Complete user data sovereignty.
- Works seamlessly on air-gapped systems.
