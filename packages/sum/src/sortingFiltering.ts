import { WorksheetModel, CellData, AutoFilterConfig } from './types';
import { colIndexToName, parseCellAddress, parseRangeAddress } from '@openhead/formula';

export interface SortCriterion {
  colIndex: number;
  ascending?: boolean;
}

export class SortingFilteringEngine {
  /**
   * Sort a worksheet by one or multiple columns with header preservation
   */
  public static sortColumns(
    sheet: WorksheetModel,
    criteria: SortCriterion[],
    hasHeader: boolean = true
  ): WorksheetModel {
    if (!criteria || criteria.length === 0) return sheet;

    const rowsMap = new Map<number, Record<string, CellData>>();
    let maxRow = 0;
    for (const [key, cell] of Object.entries(sheet.cells)) {
      const addr = parseCellAddress(key);
      if (addr) {
        if (!rowsMap.has(addr.row)) rowsMap.set(addr.row, {});
        rowsMap.get(addr.row)![key] = cell;
        if (addr.row > maxRow) maxRow = addr.row;
      }
    }

    const startRow = hasHeader ? 1 : 0;
    const dataRows: { rowIndex: number; cells: Record<string, CellData> }[] = [];
    for (let r = startRow; r <= maxRow; r++) {
      const rowCells = rowsMap.get(r) || {};
      dataRows.push({ rowIndex: r, cells: rowCells });
    }

    dataRows.sort((rowA, rowB) => {
      for (const crit of criteria) {
        const colName = colIndexToName(crit.colIndex);
        const cellKeyA = `${colName}${rowA.rowIndex + 1}`;
        const cellKeyB = `${colName}${rowB.rowIndex + 1}`;
        const valA = rowA.cells[cellKeyA]?.value ?? '';
        const valB = rowB.cells[cellKeyB]?.value ?? '';
        const asc = crit.ascending !== false;

        if (valA === valB) continue;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return asc ? valA - valB : valB - valA;
        }

        const comp = String(valA).localeCompare(String(valB));
        if (comp !== 0) {
          return asc ? comp : -comp;
        }
      }
      return 0;
    });

    const nextCells: Record<string, CellData> = {};

    // Preserve header rows
    if (hasHeader) {
      const headerRowCells = rowsMap.get(0) || {};
      for (const [key, cell] of Object.entries(headerRowCells)) {
        nextCells[key] = cell;
      }
    }

    // Reassign sorted data rows
    for (let newIdx = 0; newIdx < dataRows.length; newIdx++) {
      const targetRow = startRow + newIdx;
      const rowData = dataRows[newIdx].cells;

      for (const [origKey, cell] of Object.entries(rowData)) {
        const addr = parseCellAddress(origKey);
        if (addr) {
          const targetKey = `${colIndexToName(addr.col)}${targetRow + 1}`;
          nextCells[targetKey] = cell;
        }
      }
    }

    return {
      ...sheet,
      cells: nextCells,
    };
  }

  public static sortColumn(sheet: WorksheetModel, colIndex: number, ascending: boolean = true): WorksheetModel {
    return this.sortColumns(sheet, [{ colIndex, ascending }], true);
  }

  /**
   * Non-destructively apply auto-filters to a worksheet, populating hiddenRows
   */
  public static applyAutoFilter(sheet: WorksheetModel, config: AutoFilterConfig): WorksheetModel {
    const range = parseRangeAddress(config.range);
    if (!range) return { ...sheet, autoFilter: config };

    const hiddenRowsSet = new Set<number>(sheet.hiddenRows || []);
    const columnFilters = config.columnFilters || {};

    for (let r = range.start.row + 1; r <= range.end.row; r++) {
      let isRowVisible = true;

      for (const [colStr, allowedValues] of Object.entries(columnFilters)) {
        const colIdx = parseInt(colStr, 10);
        if (isNaN(colIdx) || !allowedValues || allowedValues.length === 0) continue;

        const cellKey = `${colIndexToName(colIdx)}${r + 1}`;
        const cellValue = sheet.cells[cellKey]?.value !== undefined ? String(sheet.cells[cellKey].value) : '';

        if (!allowedValues.includes(cellValue)) {
          isRowVisible = false;
          break;
        }
      }

      if (!isRowVisible) {
        hiddenRowsSet.add(r);
      } else {
        hiddenRowsSet.delete(r);
      }
    }

    return {
      ...sheet,
      autoFilter: config,
      hiddenRows: Array.from(hiddenRowsSet),
    };
  }

  public static clearAutoFilter(sheet: WorksheetModel): WorksheetModel {
    return {
      ...sheet,
      autoFilter: undefined,
      hiddenRows: [],
    };
  }
}
