import { WorksheetModel, CellData } from './types';
import { colIndexToName, parseCellAddress } from '@openhead/formula';

export class SortingFilteringEngine {
  public static sortColumn(sheet: WorksheetModel, colIndex: number, ascending: boolean = true): WorksheetModel {
    const colName = colIndexToName(colIndex);
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

    // Sort rows from row 1 (preserving header row 0)
    const dataRows: { rowIndex: number; sortValue: any }[] = [];
    for (let r = 1; r <= maxRow; r++) {
      const cellKey = `${colName}${r + 1}`;
      const val = sheet.cells[cellKey]?.value ?? '';
      dataRows.push({ rowIndex: r, sortValue: val });
    }

    dataRows.sort((a, b) => {
      const vA = a.sortValue;
      const vB = b.sortValue;
      if (typeof vA === 'number' && typeof vB === 'number') {
        return ascending ? vA - vB : vB - vA;
      }
      return ascending ? String(vA).localeCompare(String(vB)) : String(vB).localeCompare(String(vA));
    });

    const nextCells: Record<string, CellData> = {};
    // Copy header row (row 0)
    for (const [key, cell] of Object.entries(sheet.cells)) {
      const addr = parseCellAddress(key);
      if (addr && addr.row === 0) {
        nextCells[key] = cell;
      }
    }

    // Reassign sorted rows
    for (let newR = 0; newR < dataRows.length; newR++) {
      const originalRowIdx = dataRows[newR].rowIndex;
      const originalRowCells = rowsMap.get(originalRowIdx) || {};

      for (const [origKey, cell] of Object.entries(originalRowCells)) {
        const addr = parseCellAddress(origKey);
        if (addr) {
          const targetKey = `${colIndexToName(addr.col)}${newR + 2}`;
          nextCells[targetKey] = cell;
        }
      }
    }

    return {
      ...sheet,
      cells: nextCells,
    };
  }
}
