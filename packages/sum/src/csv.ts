import { WorksheetModel, CellData } from './types';
import { colIndexToName } from '@openhead/formula';

export function exportWorksheetToCsv(sheet: WorksheetModel): string {
  const rows: string[] = [];

  let maxR = 0;
  let maxC = 0;
  for (const key of Object.keys(sheet.cells)) {
    const match = key.match(/^([A-Za-z]+)([0-9]+)$/);
    if (match) {
      const colName = match[1];
      const r = parseInt(match[2], 10) - 1;
      let c = 0;
      for (let i = 0; i < colName.length; i++) {
        c = c * 26 + (colName.charCodeAt(i) - 64);
      }
      c -= 1;
      if (r > maxR) maxR = r;
      if (c > maxC) maxC = c;
    }
  }

  for (let r = 0; r <= maxR; r++) {
    const rowValues: string[] = [];
    for (let c = 0; c <= maxC; c++) {
      const key = `${colIndexToName(c)}${r + 1}`;
      const cell = sheet.cells[key];
      const val = cell?.value !== undefined && cell?.value !== null ? String(cell.value) : '';
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        rowValues.push(`"${val.replace(/"/g, '""')}"`);
      } else {
        rowValues.push(val);
      }
    }
    rows.push(rowValues.join(','));
  }

  return rows.join('\n');
}

export function importCsvToWorksheet(csv: string, name: string = 'Sheet1'): WorksheetModel {
  const lines = csv.split(/\r?\n/);
  const cells: Record<string, CellData> = {};

  for (let r = 0; r < lines.length; r++) {
    const line = lines[r];
    if (!line.trim()) continue;

    const values = parseCsvLine(line);
    for (let c = 0; c < values.length; c++) {
      const val = values[c];
      if (val !== '') {
        const key = `${colIndexToName(c)}${r + 1}`;
        const isNum = !isNaN(Number(val)) && val.trim() !== '';
        cells[key] = {
          raw: isNum ? Number(val) : val,
          value: isNum ? Number(val) : val,
        };
      }
    }
  }

  return {
    id: `sheet_${Date.now()}`,
    name,
    rowCount: Math.max(lines.length + 10, 50),
    colCount: 26,
    cells,
  };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
