import { CellAddress, CellRangeAddress } from './types';

export function colIndexToName(col: number): string {
  let temp = col + 1;
  let name = '';
  while (temp > 0) {
    const rem = (temp - 1) % 26;
    name = String.fromCharCode(65 + rem) + name;
    temp = Math.floor((temp - 1) / 26);
  }
  return name;
}

export function colNameToIndex(name: string): number {
  let index = 0;
  const upper = name.toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    index = index * 26 + (upper.charCodeAt(i) - 64);
  }
  return index - 1;
}

export function parseCellAddress(ref: string): CellAddress | null {
  const match = ref.match(/^(?:(?:'([^']+)'|([A-Za-z0-9_]+))!)?(\$?)([A-Za-z]+)(\$?)([0-9]+)$/);
  if (!match) return null;

  const sheet = match[1] || match[2] || undefined;
  const colAbsolute = match[3] === '$';
  const colName = match[4];
  const rowAbsolute = match[5] === '$';
  const rowNum = parseInt(match[6], 10);

  return {
    sheet,
    col: colNameToIndex(colName),
    row: rowNum - 1,
    colAbsolute,
    rowAbsolute,
  };
}

export function formatCellAddress(addr: CellAddress): string {
  const sheetPart = addr.sheet ? `${addr.sheet}!` : '';
  const colPart = `${addr.colAbsolute ? '$' : ''}${colIndexToName(addr.col)}`;
  const rowPart = `${addr.rowAbsolute ? '$' : ''}${addr.row + 1}`;
  return `${sheetPart}${colPart}${rowPart}`;
}

export function parseRangeAddress(rangeStr: string): CellRangeAddress | null {
  const parts = rangeStr.split(':');
  if (parts.length !== 2) return null;

  const start = parseCellAddress(parts[0]);
  const end = parseCellAddress(parts[1]);

  if (!start || !end) return null;

  return {
    sheet: start.sheet || end.sheet,
    start: {
      ...start,
      col: Math.min(start.col, end.col),
      row: Math.min(start.row, end.row),
    },
    end: {
      ...end,
      col: Math.max(start.col, end.col),
      row: Math.max(start.row, end.row),
    },
  };
}

export function formatRangeAddress(range: CellRangeAddress): string {
  return `${formatCellAddress(range.start)}:${formatCellAddress(range.end)}`;
}

export function getCellsInRange(range: CellRangeAddress): CellAddress[] {
  const cells: CellAddress[] = [];
  for (let r = range.start.row; r <= range.end.row; r++) {
    for (let c = range.start.col; c <= range.end.col; c++) {
      cells.push({
        sheet: range.sheet,
        col: c,
        row: r,
      });
    }
  }
  return cells;
}
