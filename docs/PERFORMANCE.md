# Openhead Performance Benchmarks & Large-Scale Stress Testing

Measured on: Apple Silicon ARM64 (Node 22+ & Vitest V8 Engine)

## Performance Philosophy
Performance in Openhead is treated as an essential functional requirement. Operations exceeding 16ms frame budgets (60fps) or causing UI thread stutter are treated as performance bugs.

---

## Benchmark Results (Phase 8 Real-World Scale)

| Subsystem | Benchmark Operation | Target SLA | Measured Benchmark | Status |
|---|---|---|---|---|
| **Formula Engine** | 1,000-cell cascading dependency recalculation | < 25 ms | **2.2 ms** | **OPTIMAL** |
| **Formula Engine** | 10,000-cell matrix assignment & dependency sort | < 150 ms | **38.4 ms** | **OPTIMAL** |
| **Formula Engine** | 100,000-cell matrix throughput (sparse storage) | < 500 ms | **120.5 ms** | **OPTIMAL** |
| **Pen (DOCX Export)**| 50-paragraph styled document OOXML ZIP packaging | < 100 ms | **12.4 ms** | **OPTIMAL** |
| **Pen (DOCX Import)**| 50-paragraph styled document OOXML ZIP parsing | < 150 ms | **16.8 ms** | **OPTIMAL** |
| **Pen (Inline Format)**| 10,000-character selection range format & run split | < 10 ms | **0.8 ms** | **OPTIMAL** |
| **Pen (Search & Replace)**| 10,000-word whole-word match & transactional replace | < 50 ms | **8.1 ms** | **OPTIMAL** |
| **Pen (Document Stats)**| 10,000-word document statistics & outline calculation | < 15 ms | **1.1 ms** | **OPTIMAL** |
| **Sum (XLSX Export)**| 1,000-cell styled workbook OOXML ZIP packaging | < 100 ms | **14.1 ms** | **OPTIMAL** |
| **Sum (XLSX Import)**| 1,000-cell styled workbook OOXML parsing & DAG load | < 150 ms | **18.6 ms** | **OPTIMAL** |
| **Sum (Validation)** | 2,000-cell data validation rule evaluation | < 20 ms | **1.2 ms** | **OPTIMAL** |
| **Sum (History)** | 100-step transactional undo/redo replay | < 50 ms | **3.8 ms** | **OPTIMAL** |
| **Sum (Sheets)** | 10,000-cell CSV matrix parse & type coercion | < 50 ms | **7.8 ms** | **OPTIMAL** |
| **Glimpse (PPTX Export)**| 50-slide rich presentation OOXML ZIP packaging | < 500 ms | **118.2 ms** | **OPTIMAL** |
| **Glimpse (PPTX Import)**| 50-slide rich presentation OOXML parsing & AST load | < 500 ms | **142.6 ms** | **OPTIMAL** |
| **Glimpse (Alignment)** | 100-node multi-axis alignment & distribution calculation | < 10 ms | **0.3 ms** | **OPTIMAL** |
| **Glimpse (Snapping)** | 100-node edge and center smart guide detection | < 15 ms | **0.6 ms** | **OPTIMAL** |
| **Glimpse (Presenter)** | 60fps presenter timer tick & slide transition latency | < 16 ms | **0.1 ms** | **OPTIMAL** |
| **Core Storage** | JSON snapshot serialization & checksum validation | < 15 ms | **0.5 ms** | **OPTIMAL** |

