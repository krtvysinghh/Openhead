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

## 2. Multi-Criteria Aggregations & Statistical Analysis

| Function | Signature | Description |
|---|---|---|
| `SUMIFS` | `SUMIFS(sum_range, criteria_range1, criteria1, ...)` | Adds cells specified by a given set of conditions or criteria. |
| `COUNTIFS` | `COUNTIFS(criteria_range1, criteria1, ...)` | Counts cells specified by a given set of conditions or criteria. |
| `AVERAGEIFS` | `AVERAGEIFS(avg_range, criteria_range1, criteria1, ...)` | Calculates average of cells matching multiple criteria. |
| `MAXIFS` | `MAXIFS(max_range, criteria_range1, criteria1, ...)` | Returns maximum value among cells specified by a given set of conditions. |
| `MINIFS` | `MINIFS(min_range, criteria_range1, criteria1, ...)` | Returns minimum value among cells specified by a given set of conditions. |
| `SUM` | `SUM(val1, [val2], ...)` | Adds all numbers in a range or argument list. |
| `AVERAGE` | `AVERAGE(val1, [val2], ...)` | Returns the arithmetic mean of arguments. |
| `COUNT` | `COUNT(val1, [val2], ...)` | Counts how many numbers are in the list. |
| `COUNTA` | `COUNTA(val1, [val2], ...)` | Counts how many non-empty values are in the list. |
| `COUNTBLANK` | `COUNTBLANK(range)` | Counts empty cells in a specified range. |
| `COUNTIF` | `COUNTIF(range, criteria)` | Counts number of cells within a range that meet the given condition. |
| `SUMIF` | `SUMIF(range, criteria, [sum_range])` | Adds cells specified by a given condition. |
| `AVERAGEIF` | `AVERAGEIF(range, criteria, [average_range])` | Returns the average of all cells in a range that meet a given criteria. |
| `MEDIAN` | `MEDIAN(val1, [val2], ...)` | Returns the median of the given numbers. |
| `MODE` | `MODE(val1, [val2], ...)` | Returns the most frequently occurring value in an array. |
| `STDEV` | `STDEV(val1, [val2], ...)` | Estimates standard deviation based on a sample. |
| `VAR` | `VAR(val1, [val2], ...)` | Estimates variance based on a sample. |
| `CORREL` | `CORREL(arr1, arr2)` | Returns Pearson correlation coefficient between two data sets. |
| `LARGE` | `LARGE(array, k)` | Returns the k-th largest value in a data set. |
| `SMALL` | `SMALL(array, k)` | Returns the k-th smallest value in a data set. |
| `RANK` | `RANK(number, ref, [order])` | Returns the rank of a number in a list of numbers. |
| `PERCENTILE` | `PERCENTILE(array, k)` | Returns the k-th percentile of values in a range. |

---

## 3. Lookup & Reference Functions

| Function | Signature | Description | Compatibility |
|---|---|---|---|
| `XLOOKUP` | `XLOOKUP(lookup_val, lookup_arr, return_arr, [if_not_found], [match_mode], [search_mode])` | Searches a range or an array for a match and returns the corresponding item. | Excel 2021+ |
| `XMATCH` | `XMATCH(lookup_val, lookup_arr, [match_mode], [search_mode])` | Returns the relative position of an item in an array or range. | Excel 2021+ |
| `VLOOKUP` | `VLOOKUP(lookup_val, table, col_index, [range_lookup])` | Looks in the first column of an array and moves across row. | Excel 97+ |
| `HLOOKUP` | `HLOOKUP(lookup_val, table, row_index, [range_lookup])` | Looks in the top row of an array and returns value in row. | Excel 97+ |
| `INDEX` | `INDEX(array, row_num, [col_num])` | Returns a value or reference of the cell at the intersection. | Excel 97+ |
| `MATCH` | `MATCH(lookup_val, lookup_arr, [match_type])` | Returns the relative position of an item in an array. | Excel 97+ |
| `CHOOSE` | `CHOOSE(index, value1, [value2], ...)` | Returns a value from a list using a given index. | Excel 97+ |
| `ROWS` | `ROWS(array)` | Returns the number of rows in a reference or array. | Excel 97+ |
| `COLUMNS` | `COLUMNS(array)` | Returns the number of columns in a reference or array. | Excel 97+ |
| `ADDRESS` | `ADDRESS(row_num, col_num, [abs_num], [a1], [sheet_text])` | Creates a cell reference as text, given specified row and column numbers. | Excel 97+ |

---

## 4. Text & String Manipulation Functions

| Function | Signature | Description |
|---|---|---|
| `CONCATENATE` | `CONCATENATE(text1, [text2], ...)` | Joins two or more text strings into one string. |
| `TEXTJOIN` | `TEXTJOIN(delimiter, ignore_empty, text1, ...)` | Combines text from multiple ranges/strings with a delimiter. |
| `LEFT` | `LEFT(text, [num_chars])` | Returns the first characters in a text string. |
| `RIGHT` | `RIGHT(text, [num_chars])` | Returns the last characters in a text string. |
| `MID` | `MID(text, start_num, num_chars)` | Returns characters from the middle of a text string. |
| `LEN` | `LEN(text)` | Returns the number of characters in a text string. |
| `LOWER` | `LOWER(text)` | Converts text to lowercase. |
| `UPPER` | `UPPER(text)` | Converts text to uppercase. |
| `PROPER` | `PROPER(text)` | Capitalizes the first letter of each word in a text string. |
| `TRIM` | `TRIM(text)` | Removes leading, trailing, and repeated spaces from text. |
| `SUBSTITUTE` | `SUBSTITUTE(text, old_text, new_text, [instance_num])` | Substitutes new text for old text in a text string. |
| `REPLACE` | `REPLACE(old_text, start_num, num_chars, new_text)` | Replaces part of a text string with a different text string. |
| `FIND` | `FIND(find_text, within_text, [start_num])` | Finds one text value within another (case-sensitive). |
| `SEARCH` | `SEARCH(find_text, within_text, [start_num])` | Finds one text value within another (case-insensitive, wildcards). |
| `TEXT` | `TEXT(value, format_text)` | Formats a number and converts it to text. |
| `VALUE` | `VALUE(text)` | Converts a text string that represents a number to a number. |

---

## 5. Date & Time Functions

| Function | Signature | Description |
|---|---|---|
| `TODAY` | `TODAY()` | Returns the serial number of today's date. |
| `NOW` | `NOW()` | Returns the serial number of the current date and time. |
| `DATE` | `DATE(year, month, day)` | Returns the serial number of a particular date. |
| `YEAR` | `YEAR(serial_number)` | Converts a serial number to a year. |
| `MONTH` | `MONTH(serial_number)` | Converts a serial number to a month. |
| `DAY` | `DAY(serial_number)` | Converts a serial number to a day of the month. |
| `DAYS` | `DAYS(end_date, start_date)` | Returns the number of days between two dates. |
| `WEEKDAY` | `WEEKDAY(serial_number, [return_type])` | Converts a serial number to a day of the week. |
| `WEEKNUM` | `WEEKNUM(serial_number, [return_type])` | Converts a serial number to a number representing where the week falls numerically with a year. |
| `DATEDIF` | `DATEDIF(start_date, end_date, unit)` | Calculates the number of days, months, or years between two dates (`"Y"`, `"M"`, `"D"`, `"YM"`, `"YD"`, `"MD"`). |
| `EOMONTH` | `EOMONTH(start_date, months)` | Returns the serial number of the last day of the month before or after a specified number of months. |
| `WORKDAY` | `WORKDAY(start_date, days, [holidays])` | Returns the serial number of the date before or after a specified number of workdays. |
| `NETWORKDAYS` | `NETWORKDAYS(start_date, end_date, [holidays])` | Returns the number of whole workdays between two dates. |

---

## 6. Financial Analysis & Modeling

| Function | Signature | Description |
|---|---|---|
| `PMT` | `PMT(rate, nper, pv, [fv], [type])` | Calculates the payment for a loan based on constant payments and a constant interest rate. |
| `IPMT` | `IPMT(rate, per, nper, pv, [fv], [type])` | Returns the interest payment for an investment for a given period. |
| `PPMT` | `PPMT(rate, per, nper, pv, [fv], [type])` | Returns the payment on the principal for an investment for a given period. |
| `PV` | `PV(rate, nper, pmt, [fv], [type])` | Returns the present value of an investment. |
| `FV` | `FV(rate, nper, pmt, [pv], [type])` | Returns the future value of an investment. |
| `NPV` | `NPV(rate, value1, [value2], ...)` | Returns the net present value of an investment based on a series of periodic cash flows and a discount rate. |
| `IRR` | `IRR(values, [guess])` | Returns the internal rate of return for a series of cash flows (Newton-Raphson method). |
| `RATE` | `RATE(nper, pmt, pv, [fv], [type], [guess])` | Returns the interest rate per period of an annuity. |

---

## 7. Logical & Inspection Functions

| Function | Signature | Description |
|---|---|---|
| `IF` | `IF(logical_test, value_if_true, [value_if_false])` | Specifies a logical test to perform. |
| `IFS` | `IFS(logical_test1, val1, [logical_test2, val2], ...)` | Checks whether one or more conditions are met and returns a value. |
| `IFERROR` | `IFERROR(value, value_if_error)` | Returns a value you specify if a formula evaluates to an error. |
| `IFNA` | `IFNA(value, value_if_na)` | Returns the value you specify if the expression resolves to `#N/A`. |
| `AND` | `AND(logical1, [logical2], ...)` | Returns TRUE if all of its arguments are TRUE. |
| `OR` | `OR(logical1, [logical2], ...)` | Returns TRUE if any argument is TRUE. |
| `XOR` | `XOR(logical1, [logical2], ...)` | Returns a logical exclusive OR of all arguments. |
| `NOT` | `NOT(logical)` | Reverses the logic of its argument. |
| `SWITCH` | `SWITCH(expr, val1, result1, [default_or_val2], ...)` | Evaluates an expression against a list of values. |
| `ISBLANK` | `ISBLANK(val)` | Returns TRUE if the value is blank/empty. |
| `ISNUMBER` | `ISNUMBER(val)` | Returns TRUE if the value is a valid numeric number. |
| `ISTEXT` | `ISTEXT(val)` | Returns TRUE if the value is text. |
| `ISNONTEXT`| `ISNONTEXT(val)` | Returns TRUE if the value is not text. |
| `ISLOGICAL`| `ISLOGICAL(val)` | Returns TRUE if the value is a boolean TRUE/FALSE. |
| `ISERROR` | `ISERROR(val)` | Returns TRUE if the value is any error value. |
| `ISERR` | `ISERR(val)` | Returns TRUE if the value is any error value except `#N/A`. |
| `ISNA` | `ISNA(val)` | Returns TRUE if the value is `#N/A`. |
| `TYPE` | `TYPE(val)` | Returns 1 (number), 2 (text), 4 (logical), 16 (error), 64 (array). |
| `N` | `N(val)` | Converts a value to a number. |
| `NA` | `NA()` | Returns the error value `#N/A`. |
