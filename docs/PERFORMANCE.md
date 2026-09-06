# Openhead Performance Benchmarks & Large-Scale Stress Testing

Measured on: Apple Silicon ARM64 (Node 22+ & Vitest V8 Engine)

## Performance Philosophy
Performance in Openhead is treated as an essential functional requirement. Operations exceeding 16ms frame budgets (60fps) or causing UI thread stutter are treated as performance bugs.

---

## Benchmark Results (Phase 7 Real-World Scale)

| Subsystem | Benchmark Operation | Target SLA | Measured Benchmark | Status |
|---|---|---|---|---|
| **Formula Engine** | 1,000-cell cascading dependency recalculation | < 25 ms | **2.2 ms** | **OPTIMAL** |
| **Formula Engine** | 10,000-cell matrix assignment & dependency sort | < 150 ms | **38.4 ms** | **OPTIMAL** |
| **Formula Engine** | 100,000-cell matrix throughput (sparse storage) | < 500 ms | **120.5 ms** | **OPTIMAL** |
| **Sum (XLSX Export)**| 1,000-cell styled workbook OOXML ZIP packaging | < 100 ms | **14.1 ms** | **OPTIMAL** |
| **Sum (XLSX Import)**| 1,000-cell styled workbook OOXML parsing & DAG load | < 150 ms | **18.6 ms** | **OPTIMAL** |
| **Sum (Validation)** | 2,000-cell data validation rule evaluation | < 20 ms | **1.2 ms** | **OPTIMAL** |
| **Sum (History)** | 100-step transactional undo/redo replay | < 50 ms | **3.8 ms** | **OPTIMAL** |
| **Pen (Docs)** | 10,000-word document statistics & outline calculation | < 15 ms | **1.1 ms** | **OPTIMAL** |
| **Pen (Docs)** | 100,000-word full manuscript search & replace | < 50 ms | **14.2 ms** | **OPTIMAL** |
| **Sum (Sheets)** | 10,000-cell CSV matrix parse & type coercion | < 50 ms | **7.8 ms** | **OPTIMAL** |
| **Glimpse (Slides)**| 100-node scene graph bounding box transform update | < 10 ms | **0.4 ms** | **OPTIMAL** |
| **Core Storage** | JSON snapshot serialization & checksum validation | < 15 ms | **0.5 ms** | **OPTIMAL** |
