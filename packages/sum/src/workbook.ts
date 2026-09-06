import { generateId, HistoryStack, HistoryCommand } from '@openhead/core';
import { FormulaEngine, parseCellAddress, parseRangeAddress, colIndexToName } from '@openhead/formula';
import { WorkbookModel, WorksheetModel, CellStyle, CellFormat, CellBorders } from './types';

export class SumWorkbook {
  private model: WorkbookModel;
  private formulaEngine: FormulaEngine;
  private history = new HistoryStack<WorkbookModel>();

  constructor(initialModel?: WorkbookModel) {
    this.formulaEngine = new FormulaEngine();
    if (initialModel) {
      this.model = JSON.parse(JSON.stringify(initialModel));
      this.rebuildFormulaEngine();
    } else {
      this.model = SumWorkbook.createEmpty('Untitled Workbook');
    }
  }

  public static createEmpty(title: string = 'Untitled Workbook'): WorkbookModel {
    const sheetId = generateId('sheet');
    return {
      metadata: {
        id: generateId('wb'),
        title,
        type: 'sum',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      sheets: [
        {
          id: sheetId,
          name: 'Sheet1',
          rowCount: 100,
          colCount: 26,
          cells: {},
        },
      ],
      activeSheetId: sheetId,
    };
  }

  public getModel(): WorkbookModel {
    return this.model;
  }

  public getActiveSheet(): WorksheetModel {
    return this.model.sheets.find((s) => s.id === this.model.activeSheetId) || this.model.sheets[0];
  }

  public setActiveSheet(sheetId: string): void {
    if (this.model.sheets.some((s) => s.id === sheetId)) {
      this.model.activeSheetId = sheetId;
    }
  }

  public addSheet(name?: string): WorksheetModel {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));

    const sheetNum = next.sheets.length + 1;
    const sheetName = name || `Sheet${sheetNum}`;
    const newSheet: WorksheetModel = {
      id: generateId('sheet'),
      name: sheetName,
      rowCount: 100,
      colCount: 26,
      cells: {},
    };
    next.sheets.push(newSheet);
    next.activeSheetId = newSheet.id;
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<WorkbookModel> = {
      id: generateId('cmd'),
      name: `Add sheet ${sheetName}`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    this.rebuildFormulaEngine();
    return newSheet;
  }

  public duplicateSheet(sheetId: string): WorksheetModel | null {
    const sourceSheet = this.model.sheets.find((s) => s.id === sheetId);
    if (!sourceSheet) return null;

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));

    const clone: WorksheetModel = JSON.parse(JSON.stringify(sourceSheet));
    clone.id = generateId('sheet');
    clone.name = `${sourceSheet.name} (Copy)`;

    next.sheets.push(clone);
    next.activeSheetId = clone.id;
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<WorkbookModel> = {
      id: generateId('cmd'),
      name: `Duplicate sheet ${sourceSheet.name}`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    this.rebuildFormulaEngine();
    return clone;
  }

  public deleteSheet(sheetId: string): boolean {
    if (this.model.sheets.length <= 1) return false;
    const sheetIndex = this.model.sheets.findIndex((s) => s.id === sheetId);
    if (sheetIndex === -1) return false;

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));

    const deletedName = next.sheets[sheetIndex].name;
    next.sheets.splice(sheetIndex, 1);

    if (next.activeSheetId === sheetId) {
      next.activeSheetId = next.sheets[Math.max(0, sheetIndex - 1)].id;
    }
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<WorkbookModel> = {
      id: generateId('cmd'),
      name: `Delete sheet ${deletedName}`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    this.rebuildFormulaEngine();
    return true;
  }

  public renameSheet(sheetId: string, newName: string): boolean {
    if (!newName || this.model.sheets.some((s) => s.id !== sheetId && s.name === newName)) {
      return false;
    }

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const sheet = next.sheets.find((s: WorksheetModel) => s.id === sheetId);
    if (!sheet) return false;

    sheet.name = newName;
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<WorkbookModel> = {
      id: generateId('cmd'),
      name: `Rename sheet to ${newName}`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    this.rebuildFormulaEngine();
    return true;
  }

  public reorderSheets(sheetIds: string[]): void {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));

    const newSheets: WorksheetModel[] = [];
    for (const id of sheetIds) {
      const found = next.sheets.find((s: WorksheetModel) => s.id === id);
      if (found) newSheets.push(found);
    }
    if (newSheets.length === next.sheets.length) {
      next.sheets = newSheets;
      next.metadata.updatedAt = Date.now();

      const cmd: HistoryCommand<WorkbookModel> = {
        id: generateId('cmd'),
        name: `Reorder sheets`,
        execute: () => next,
        undo: () => prev,
        timestamp: Date.now(),
      };
      this.model = this.history.execute(this.model, cmd);
    }
  }

  public hideSheet(sheetId: string): void {
    const sheet = this.model.sheets.find((s) => s.id === sheetId);
    if (sheet) sheet.hidden = true;
  }

  public unhideSheet(sheetId: string): void {
    const sheet = this.model.sheets.find((s) => s.id === sheetId);
    if (sheet) sheet.hidden = false;
  }

  public hideRow(rowIndex: number): void {
    const sheet = this.getActiveSheet();
    if (!sheet.hiddenRows) sheet.hiddenRows = [];
    if (!sheet.hiddenRows.includes(rowIndex)) sheet.hiddenRows.push(rowIndex);
  }

  public unhideRow(rowIndex: number): void {
    const sheet = this.getActiveSheet();
    if (sheet.hiddenRows) {
      sheet.hiddenRows = sheet.hiddenRows.filter((r) => r !== rowIndex);
    }
  }

  public hideCol(colIndex: number): void {
    const sheet = this.getActiveSheet();
    if (!sheet.hiddenCols) sheet.hiddenCols = [];
    if (!sheet.hiddenCols.includes(colIndex)) sheet.hiddenCols.push(colIndex);
  }

  public unhideCol(colIndex: number): void {
    const sheet = this.getActiveSheet();
    if (sheet.hiddenCols) {
      sheet.hiddenCols = sheet.hiddenCols.filter((c) => c !== colIndex);
    }
  }

  public setFreezePanes(freeze: { rows: number; cols: number } | undefined): void {
    const sheet = this.getActiveSheet();
    sheet.freezePanes = freeze;
  }

  public setCellValue(cellKey: string, input: string | number | boolean | null): void {
    const sheet = this.getActiveSheet();
    const addr = parseCellAddress(cellKey);
    if (!addr) return;

    const prevModel = JSON.parse(JSON.stringify(this.model));
    const nextModel = JSON.parse(JSON.stringify(this.model));
    const targetSheet = nextModel.sheets.find((s: WorksheetModel) => s.id === sheet.id)!;

    this.formulaEngine.setActiveSheet(sheet.name);
    this.formulaEngine.setCellValue(addr, input);
    const calculatedValue = this.formulaEngine.getCellValue(addr);

    if (input === null || input === '') {
      delete targetSheet.cells[cellKey];
    } else {
      const existing = targetSheet.cells[cellKey] || { raw: '', value: null };
      targetSheet.cells[cellKey] = {
        ...existing,
        raw: input,
        value: calculatedValue,
      };
    }

    // Refresh all calculated values in sheet
    for (const k of Object.keys(targetSheet.cells)) {
      const a = parseCellAddress(k);
      if (a) {
        targetSheet.cells[k].value = this.formulaEngine.getCellValue(a);
      }
    }

    nextModel.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<WorkbookModel> = {
      id: generateId('cmd'),
      name: `Set ${cellKey}`,
      execute: () => nextModel,
      undo: () => prevModel,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
  }

  public insertRow(atRowIndex: number): void {
    const sheet = this.getActiveSheet();
    const prevModel = JSON.parse(JSON.stringify(this.model));
    const nextModel = JSON.parse(JSON.stringify(this.model));
    const targetSheet = nextModel.sheets.find((s: WorksheetModel) => s.id === sheet.id)!;

    const newCells: Record<string, any> = {};
    for (const [key, cell] of Object.entries(targetSheet.cells)) {
      const addr = parseCellAddress(key);
      if (addr) {
        if (addr.row >= atRowIndex) {
          const newKey = `${colIndexToName(addr.col)}${addr.row + 2}`;
          newCells[newKey] = cell;
        } else {
          newCells[key] = cell;
        }
      }
    }
    targetSheet.cells = newCells;
    targetSheet.rowCount += 1;
    nextModel.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<WorkbookModel> = {
      id: generateId('cmd'),
      name: `Insert row ${atRowIndex + 1}`,
      execute: () => nextModel,
      undo: () => prevModel,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    this.rebuildFormulaEngine();
  }

  public deleteRow(atRowIndex: number): void {
    const sheet = this.getActiveSheet();
    const prevModel = JSON.parse(JSON.stringify(this.model));
    const nextModel = JSON.parse(JSON.stringify(this.model));
    const targetSheet = nextModel.sheets.find((s: WorksheetModel) => s.id === sheet.id)!;

    const newCells: Record<string, any> = {};
    for (const [key, cell] of Object.entries(targetSheet.cells)) {
      const addr = parseCellAddress(key);
      if (addr) {
        if (addr.row === atRowIndex) {
          continue;
        } else if (addr.row > atRowIndex) {
          const newKey = `${colIndexToName(addr.col)}${addr.row}`;
          newCells[newKey] = cell;
        } else {
          newCells[key] = cell;
        }
      }
    }
    targetSheet.cells = newCells;
    targetSheet.rowCount = Math.max(10, targetSheet.rowCount - 1);
    nextModel.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<WorkbookModel> = {
      id: generateId('cmd'),
      name: `Delete row ${atRowIndex + 1}`,
      execute: () => nextModel,
      undo: () => prevModel,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    this.rebuildFormulaEngine();
  }

  public setCellStyle(cellKey: string, style: Partial<CellStyle>): void {
    const sheet = this.getActiveSheet();
    const existing = sheet.cells[cellKey] || { raw: '', value: null };
    sheet.cells[cellKey] = {
      ...existing,
      style: { ...(existing.style || {}), ...style },
    };
  }

  public setCellBorders(cellKey: string, borders: CellBorders): void {
    this.setCellStyle(cellKey, { borders });
  }

  public setCellFormat(cellKey: string, format: CellFormat): void {
    const sheet = this.getActiveSheet();
    const existing = sheet.cells[cellKey] || { raw: '', value: null };
    sheet.cells[cellKey] = {
      ...existing,
      format,
    };
  }

  public fillRange(sourceRange: string, targetRange: string): void {
    const src = parseRangeAddress(sourceRange);
    const tgt = parseRangeAddress(targetRange);
    if (!src || !tgt) return;

    const sheet = this.getActiveSheet();
    const srcVals: (string | number | boolean | null)[] = [];
    for (let r = src.start.row; r <= src.end.row; r++) {
      for (let c = src.start.col; c <= src.end.col; c++) {
        const k = `${colIndexToName(c)}${r + 1}`;
        srcVals.push(sheet.cells[k]?.raw ?? null);
      }
    }

    // If source is a sequence of numbers, extrapolate
    const numVals = srcVals.filter((v): v is number => typeof v === 'number');
    const isArithmetic = numVals.length >= 2;
    const step = isArithmetic ? numVals[1] - numVals[0] : 1;
    let lastNum = numVals[numVals.length - 1] ?? 0;

    let srcIdx = 0;
    for (let r = tgt.start.row; r <= tgt.end.row; r++) {
      for (let c = tgt.start.col; c <= tgt.end.col; c++) {
        const k = `${colIndexToName(c)}${r + 1}`;
        if (isArithmetic) {
          lastNum += step;
          this.setCellValue(k, lastNum);
        } else {
          const val = srcVals[srcIdx % srcVals.length];
          this.setCellValue(k, val);
          srcIdx++;
        }
      }
    }
  }

  public undo(): boolean {
    if (!this.history.canUndo) return false;
    const res = this.history.undo(this.model);
    this.model = res.state;
    this.rebuildFormulaEngine();
    return true;
  }

  public redo(): boolean {
    if (!this.history.canRedo) return false;
    const res = this.history.redo(this.model);
    this.model = res.state;
    this.rebuildFormulaEngine();
    return true;
  }

  private rebuildFormulaEngine(): void {
    this.formulaEngine = new FormulaEngine();
    for (const sheet of this.model.sheets) {
      for (const [key, cell] of Object.entries(sheet.cells)) {
        const addr = parseCellAddress(key);
        if (addr && cell.raw !== null && cell.raw !== undefined) {
          this.formulaEngine.setCellValue({ ...addr, sheet: sheet.name }, cell.raw);
        }
      }
    }
  }
}
