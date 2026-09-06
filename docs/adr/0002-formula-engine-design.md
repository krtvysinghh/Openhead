# ADR 0002: Formula Engine Architecture

## Status
Accepted

## Context
A spreadsheet engine requires fast, deterministic, and accurate formula evaluation compatible with Excel.

## Decision
We implement a 5-stage calculation architecture:
1. **Lexer**: Tokenizes formulas, cell coordinates (`A1`, `$B$3`), ranges (`A1:C10`), string literals, numbers, and operators.
2. **Pratt Parser**: Generates an Abstract Syntax Tree (AST) respecting mathematical operator precedence and function arguments.
3. **Dependency Graph (DAG)**: Tracks inter-cell dependencies, performs topological sorting, and detects circular references (`#CYCLE!`).
4. **Function Registry**: Implements standard Excel functions categorized by Math, Logical, Text, Lookup, Date, and Statistics.
5. **Calculation Engine**: Evaluates ASTs against the grid matrix and dynamically propagates updates.

## Consequences
- Guaranteed cycle detection without infinite loops.
- Support for complex formulas like `=IF(SUM(A1:A5) > 100, VLOOKUP(B1, C1:D10, 2, FALSE), AVERAGE(A1:A5))`.
