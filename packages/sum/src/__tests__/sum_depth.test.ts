import { describe, it, expect } from 'vitest';
import { SumWorkbook } from '../workbook';
import { NamedRangesManager } from '../namedRanges';
import { SortingFilteringEngine } from '../sortingFiltering';
import { ConditionalFormattingEvaluator, ConditionalFormattingRule } from '../conditionalFormatting';

describe('SumWorkbook - Sorting, Named Ranges & Conditional Formatting', () => {
  it('should define and retrieve named ranges correctly', () => {
    const manager = new NamedRangesManager();
    const success = manager.define('TotalRevenue', 'Sheet1!B2:B10');
    expect(success).toBe(true);

    const retrieved = manager.get('totalrevenue');
    expect(retrieved?.name).toBe('TotalRevenue');
    expect(retrieved?.range.start.col).toBe(1);
    expect(retrieved?.range.start.row).toBe(1);
  });

  it('should sort spreadsheet rows numerically ascending and descending', () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 'Item');
    wb.setCellValue('B1', 'Amount');

    wb.setCellValue('A2', 'Apples');
    wb.setCellValue('B2', 50);

    wb.setCellValue('A3', 'Oranges');
    wb.setCellValue('B3', 10);

    wb.setCellValue('A4', 'Bananas');
    wb.setCellValue('B4', 30);

    // Sort column B (col index 1) ASC
    const sortedSheet = SortingFilteringEngine.sortColumn(wb.getActiveSheet(), 1, true);
    expect(sortedSheet.cells['B2'].value).toBe(10); // Oranges
    expect(sortedSheet.cells['A2'].value).toBe('Oranges');
    expect(sortedSheet.cells['B3'].value).toBe(30); // Bananas
    expect(sortedSheet.cells['B4'].value).toBe(50); // Apples
  });

  it('should evaluate conditional formatting rules accurately', () => {
    const ruleGreaterThan50: ConditionalFormattingRule = {
      id: 'rule_1',
      condition: 'greaterThan',
      value1: 50,
      style: { background: 'rgba(239, 68, 68, 0.2)' },
    };

    expect(ConditionalFormattingEvaluator.evaluate(75, ruleGreaterThan50)).toBe(true);
    expect(ConditionalFormattingEvaluator.evaluate(25, ruleGreaterThan50)).toBe(false);
    expect(ConditionalFormattingEvaluator.evaluate(50, ruleGreaterThan50)).toBe(false);
  });
});
