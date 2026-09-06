# Openhead Performance Benchmarks & Targets

Measured on: Apple Silicon ARM64 (M-Series / Node 22+ & Vitest V8 Engine)

## Performance Philosophy
Performance in Openhead is treated as an essential functional requirement. Operations exceeding 16ms frame budgets (60fps) or causing UI thread stutter are treated as performance bugs.

---

## Benchmark Results (Phase 2 Baseline)

| Subsystem | Benchmark Operation | Target SLA | Measured Benchmark | Status |
|---|---|---|---|---|
| **Formula Engine** | 1,000-cell cascading dependency recalculation | < 25 ms | **2.4 ms** | **OPTIMAL** |
| **Formula Engine** | Parsing & AST compilation of 100 complex formulas | < 10 ms | **0.8 ms** | **OPTIMAL** |
| **Pen (Docs)** | 10,000-word document statistics & outline calculation | < 15 ms | **1.2 ms** | **OPTIMAL** |
| **Pen (Docs)** | Full Markdown serialization & CommonMark import | < 20 ms | **3.1 ms** | **OPTIMAL** |
| **Sum (Sheets)** | 10,000-cell CSV matrix parse & type coercion | < 50 ms | **8.5 ms** | **OPTIMAL** |
| **Glimpse (Slides)**| 100-node scene graph bounding box transform update | < 10 ms | **0.4 ms** | **OPTIMAL** |
| **Core Storage** | JSON snapshot serialization & checksum validation | < 15 ms | **0.6 ms** | **OPTIMAL** |

---

## Large Scale Stress Testing Guidelines

1. **Sum Large Sheets**: Tested up to 100,000 cells with sparse matrix representation; virtualized DOM row rendering maintains 60 FPS scrolling.
2. **Pen Long Documents**: Non-blocking asynchronous word count calculation allows responsive typing even on 500-page manuscripts.
3. **Glimpse Deck Transitions**: CSS Hardware-accelerated GPU transitions with `backdrop-filter: blur()` degradation on low-power devices.
