# Openhead Formula Function Reference

The `@openhead/formula` engine supports Excel-compatible formula syntax and functions.

## Math & Arithmetic
- `SUM(range...)`: Calculates the sum of numbers or ranges.
- `AVERAGE(range...)`: Calculates the arithmetic mean.
- `MIN(range...)` / `MAX(range...)`: Returns the minimum or maximum value.
- `PRODUCT(range...)`: Multiplies all numbers.
- `ROUND(number, digits)`: Rounds a number to specified decimals.
- `ABS(number)`: Returns the absolute value.
- `SQRT(number)`: Computes the square root.
- `POWER(base, exp)`: Raises a number to a power.
- `MOD(number, divisor)`: Returns the remainder of division.
- `FLOOR(number, significance)` / `CEILING(number, significance)`: Rounds down/up to nearest multiple.

## Logical
- `IF(condition, true_val, false_val)`: Returns one value if true and another if false.
- `AND(expr1, expr2...)`: Returns TRUE if all arguments are true.
- `OR(expr1, expr2...)`: Returns TRUE if any argument is true.
- `NOT(expr)`: Inverts boolean value.
- `IFS(cond1, val1, cond2, val2...)`: Checks multiple conditions.
- `SWITCH(expression, val1, result1, ...)`: Matches against multiple values.
- `IFERROR(value, value_if_error)`: Returns fallback if calculation yields an error.

## Text
- `CONCATENATE(text1, text2...)` / `CONCAT(text1...)`: Joins strings together.
- `LEFT(text, num_chars)` / `RIGHT(text, num_chars)`: Extracts characters from start/end.
- `MID(text, start, length)`: Extracts characters from middle of string.
- `LEN(text)`: Returns string character length.
- `UPPER(text)` / `LOWER(text)`: Converts string case.
- `TRIM(text)`: Strips excess whitespace.
- `TEXTJOIN(delimiter, ignore_empty, range...)`: Joins array with delimiter.
- `EXACT(text1, text2)`: Case-sensitive string equality comparison.

## Lookup & Reference
- `VLOOKUP(lookup_value, table_array, col_index, [range_lookup])`: Vertical table lookup.
- `HLOOKUP(lookup_value, table_array, row_index, [range_lookup])`: Horizontal table lookup.
- `INDEX(array, row_num, [col_num])`: Returns cell value at coordinates.
- `MATCH(lookup_value, lookup_array, [match_type])`: Returns position of value in array.
- `XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])`: Advanced lookup.
- `CHOOSE(index, value1, value2...)`: Selects value by 1-based index.

## Date & Time
- `TODAY()`: Returns current date string (YYYY-MM-DD).
- `NOW()`: Returns current timestamp string.
- `DATE(year, month, day)`: Constructs formatted date.
- `YEAR(date)` / `MONTH(date)` / `DAY(date)`: Extracts date components.
- `DATEDIF(start_date, end_date, unit)`: Difference between dates in 'D', 'M', or 'Y'.

## Statistical
- `COUNT(range...)`: Counts numeric cells.
- `COUNTA(range...)`: Counts non-empty cells.
- `COUNTIF(range, criteria)`: Counts cells satisfying criteria.
- `SUMIF(range, criteria, [sum_range])`: Sums cells satisfying criteria.
- `AVERAGEIF(range, criteria, [avg_range])`: Averages cells satisfying criteria.
- `STDEV(range...)`: Computes sample standard deviation.
