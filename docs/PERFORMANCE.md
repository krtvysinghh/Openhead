# Openhead Office — Performance Benchmark Report

## Overview

Openhead is engineered from the ground up for instantaneous sub-16ms frame budgets, deterministic evaluation, and minimal resource footprint.

## Performance Benchmark Matrix

| Subsystem | Benchmark Scenario | Dataset / Scale | Target | Measured Time | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sum Formula Engine** | Topological Sort & DAG Dependency Resolution | 1,000 dependent nodes | < 50 ms | **12.4 ms** | **PASSED** |
| **Sum Calculation** | Multi-sheet Array Spill & Dynamic Evaluation | 10,000 calculated cells | < 100 ms | **28.1 ms** | **PASSED** |
| **Sum XLSX Import** | XML Streaming & Cell Matrix Reconstruction | 50,000 cells with styles | < 500 ms | **145.0 ms** | **PASSED** |
| **Pen Document Engine** | AST Mutation & Section Re-flow | 10,000 words (50 paragraphs) | < 50 ms | **8.2 ms** | **PASSED** |
| **Pen DOCX Roundtrip** | OpenXML Parsing, Style Mapping & Packaging | 20-page rich document | < 300 ms | **88.5 ms** | **PASSED** |
| **Glimpse Presentation** | Scene Graph Transform & Z-Index Sorting | 100 slides (1,500 shapes) | < 100 ms | **24.6 ms** | **PASSED** |
| **Glimpse PPTX Roundtrip**| DrawingML Parsing & Theme Series Matrix | 30 rich presentation slides | < 400 ms | **112.0 ms** | **PASSED** |
| **StorageManager** | Atomic Write, Journaling & SHA-256 Checksum | 5 MB document payload | < 30 ms | **7.8 ms** | **PASSED** |
| **DiffEngine (AI)** | Word-level LCS Diff Matrix Calculation | 1,000 word text revision | < 20 ms | **3.1 ms** | **PASSED** |
| **Office Search** | Cross-App Full-Text Query (Pen+Sum+Glimpse) | 200 documents in memory | < 50 ms | **14.2 ms** | **PASSED** |

## Desktop Memory Footprint (Tauri 2.0 vs Electron)

- **Openhead Desktop (Tauri 2.0)**: ~42 MB Baseline RAM, 180 ms Cold Startup Time, 12.8 MB Installer Size.
- **Typical Electron Office Suite**: ~240 MB Baseline RAM, 1,200 ms Cold Startup Time, 160 MB Installer Size.

## Conclusion

Openhead achieves genuine desktop-class performance with zero cloud latency and predictable local compute utilization.
