# Openhead Formula Function Registry & Specification

Canonical reference for all functions supported by the `@openhead/formula` engine.

## 1. Dynamic Arrays & Matrix Manipulation

| Function | Signature | Description | Spill Aware |
|---|---|---|---|
| `UNIQUE` | `UNIQUE(array, [by_col], [exactly_once])` | Returns a list of unique values in a list or range. | Yes |
| `SEQUENCE` | `SEQUENCE(rows, [columns], [start], [step])` | Generates a list of sequential numbers in an array. | Yes |
| `FILTER` | `FILTER(array, include, [if_empty])` | Filters an array or range based on a boolean criteria array. | Yes |
| `SORT` | `SORT(array, [sort_index], [sort_order], [by_col])` | Sorts the contents of a range or array. | Yes |
| `SORTBY` | `SORTBY(array, by_array1, [sort_order1], ...)` | Sorts the contents of a range or array based on the values in a corresponding range. | Yes |
| `TRANSPOSE` | `TRANSPOSE(array)` | Returns a vertical range of cells as a horizontal range, or vice versa. | Yes |

---

## 2. Lookup & Reference Functions

| Function | Signature | Description | Compatibility |
|---|---|---|---|
| `XLOOKUP` | `XLOOKUP(lookup_val, lookup_arr, return_arr, [if_not_found], [match_mode], [search_mode])` | Searches a range or an array for a match and returns the corresponding item. | Excel 2021+ |
| `VLOOKUP` | `VLOOKUP(lookup_val, table, col_index, [range_lookup])` | Looks in the first column of an array and moves across row. | Excel 97+ |
| `HLOOKUP` | `HLOOKUP(lookup_val, table, row_index, [range_lookup])` | Looks in the top row of an array and returns value in row. | Excel 97+ |
| `INDEX` | `INDEX(array, row_num, [col_num])` | Returns a value or reference of the cell at the intersection. | Excel 97+ |
| `MATCH` | `MATCH(lookup_val, lookup_arr, [match_type])` | Returns the relative position of an item in an array. | Excel 97+ |
| `CHOOSE` | `CHOOSE(index, value1, [value2], ...)` | Returns a value from a list using a given index. | Excel 97+ |

---

## 3. Information & Inspection Functions

| Function | Signature | Description | Compatibility |
|---|---|---|---|
| `ISBLANK` | `ISBLANK(val)` | Returns TRUE if the value is blank/empty. | Excel 97+ |
| `ISNUMBER` | `ISNUMBER(val)` | Returns TRUE if the value is a valid numeric number. | Excel 97+ |
| `ISTEXT` | `ISTEXT(val)` | Returns TRUE if the value is text. | Excel 97+ |
| `ISNONTEXT`| `ISNONTEXT(val)` | Returns TRUE if the value is not text. | Excel 97+ |
| `ISLOGICAL`| `ISLOGICAL(val)` | Returns TRUE if the value is a boolean TRUE/FALSE. | Excel 97+ |
| `ISERROR` | `ISERROR(val)` | Returns TRUE if the value is any error value (`#DIV/0!`, `#VALUE!`, `#SPILL!`, etc.). | Excel 97+ |
| `ISERR` | `ISERR(val)` | Returns TRUE if the value is any error value except `#N/A`. | Excel 97+ |
| `ISNA` | `ISNA(val)` | Returns TRUE if the value is `#N/A`. | Excel 97+ |
| `TYPE` | `TYPE(val)` | Returns 1 for number, 2 for text, 4 for logical, 16 for error, 64 for array. | Excel 97+ |
| `N` | `N(val)` | Converts a value to a number. | Excel 97+ |
| `NA` | `NA()` | Returns the error value `#N/A`. | Excel 97+ |

---

## 4. Advanced Math & Engineering

| Function | Signature | Description |
|---|---|---|
| `SUMPRODUCT` | `SUMPRODUCT(array1, [array2], ...)` | Multiplies corresponding components in the given arrays, and returns the sum of those products. |
| `MOD` | `MOD(number, divisor)` | Returns the remainder after number is divided by divisor. |
| `ROUNDUP` | `ROUNDUP(number, num_digits)` | Rounds a number up, away from zero. |
| `ROUNDDOWN` | `ROUNDDOWN(number, num_digits)` | Rounds a number down, toward zero. |
| `DELTA` | `DELTA(number1, [number2])` | Tests whether two values are equal (Kronecker Delta). |
| `CONVERT` | `CONVERT(number, from_unit, to_unit)` | Converts a number from one measurement system to another (m, km, ft, in, c, f). |

---

## 5. Financial & Database Functions

- **Financial**: `PMT`, `FV`, `PV`, `NPV`, `RATE`, `IRR`.
- **Database**: `DSUM`, `DAVERAGE`, `DCOUNT`, `DMAX`, `DMIN`.
- **Date/Time**: `TODAY`, `NOW`, `DATE`, `YEAR`, `MONTH`, `DAY`, `EOMONTH`, `WORKDAY`, `NETWORKDAYS`.
