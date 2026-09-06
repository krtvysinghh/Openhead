import { generateId, HistoryStack, HistoryCommand } from '@openhead/core';
import { FormulaEngine, parseCellAddress, parseRangeAddress, colIndexToName } from '@openhead/formula';
import {
  WorkbookModel,
  WorksheetModel,
  CellStyle,
  CellFormat,
  CellBorders,
  DataValidationRule,
  AutoFilterConfig,
  CellData,
} from './types';


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
      const sheet = this.getActiveSheet();
      this.formulaEngine.setActiveSheet(sheet.name);
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

  public renameSheet(sheetId: string, newName: string): boolean {
    const sheet = this.model.sheets.find((s) => s.id === sheetId);
    if (!sheet || !newName.trim()) return false;
    if (this.model.sheets.some((s) => s.id !== sheetId && s.name.toLowerCase() === newName.trim().toLowerCase())) {
      return false; // Name conflict
    }

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const target = next.sheets.find((s: WorksheetModel) => s.id === sheetId)!;
    target.name = newName.trim();
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

  public deleteSheet(sheetId: string): boolean {
    if (this.model.sheets.length <= 1) return false;
    const sheetIndex = this.model.sheets.findIndex((s) => s.id === sheetId);
    if (sheetIndex === -1) return false;

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    next.sheets.splice(sheetIndex, 1);
    if (next.activeSheetId === sheetId) {
      next.activeSheetId = next.sheets[Math.max(0, sheetIndex - 1)].id;
    }
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<WorkbookModel> = {
      id: generateId('cmd'),
      name: `Delete sheet`,
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
    const sheetMap = new Map(next.sheets.map((s: WorksheetModel) => [s.id, s]));
    const reordered: WorksheetModel[] = [];

    for (const id of sheetIds) {
      const s = sheetMap.get(id);
      if (s) {
        reordered.push(s as WorksheetModel);
        sheetMap.delete(id);
      }
    }
    for (const remaining of sheetMap.values()) {
      reordered.push(remaining as WorksheetModel);
    }
    next.sheets = reordered;
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

  public hideSheet(sheetId: string): boolean {
    const visibleCount = this.model.sheets.filter((s) => !s.hidden).length;
    if (visibleCount <= 1) return false;

    const sheet = this.model.sheets.find((s) => s.id === sheetId);
    if (!sheet) return false;
    sheet.hidden = true;

    if (this.model.activeSheetId === sheetId) {
      const nextVisible = this.model.sheets.find((s) => !s.hidden);
      if (nextVisible) this.model.activeSheetId = nextVisible.id;
    }
    return true;
  }

  public unhideSheet(sheetId: string): void {
    const sheet = this.model.sheets.find((s) => s.id === sheetId);
    if (sheet) sheet.hidden = false;
  }

  public setCellValue(cellKey: string, rawValue: string | number | boolean | null): void {
    const activeSheet = this.getActiveSheet();
    const prevModel = JSON.parse(JSON.stringify(this.model));
    const nextModel = JSON.parse(JSON.stringify(this.model));
    const targetSheet = nextModel.sheets.find((s: WorksheetModel) => s.id === activeSheet.id)!;

    if (rawValue === null || rawValue === '') {
      delete targetSheet.cells[cellKey];
    } else {
      const existing = targetSheet.cells[cellKey] || { raw: null, value: null };
      targetSheet.cells[cellKey] = {
        ...existing,
        raw: rawValue,
      };
    }
    nextModel.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<WorkbookModel> = {
      id: generateId('cmd'),
      name: `Edit ${cellKey}`,
      execute: () => nextModel,
      undo: () => prevModel,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    this.rebuildFormulaEngine();
  }

  public getCellValue(cellKey: string, sheetId?: string): any {
    const sheet = sheetId ? this.model.sheets.find((s) => s.id === sheetId) || this.getActiveSheet() : this.getActiveSheet();
    const cell = sheet.cells[cellKey];
    if (!cell) return undefined;
    return cell.value !== undefined ? cell.value : cell.raw;
  }

  public setCellStyle(cellKey: string, style: Partial<CellStyle>): void {
    const activeSheet = this.getActiveSheet();
    const prevModel = JSON.parse(JSON.stringify(this.model));
    const nextModel = JSON.parse(JSON.stringify(this.model));
    const targetSheet = nextModel.sheets.find((s: WorksheetModel) => s.id === activeSheet.id)!;

    if (!targetSheet.cells[cellKey]) {
      targetSheet.cells[cellKey] = { raw: null, value: null };
    }
    targetSheet.cells[cellKey].style = {
      ...targetSheet.cells[cellKey].style,
      ...style,
    };
    nextModel.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<WorkbookModel> = {
      id: generateId('cmd'),
      name: `Format style ${cellKey}`,
      execute: () => nextModel,
      undo: () => prevModel,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
  }

  public setCellBorders(cellKey: string, borders: CellBorders): void {
    this.setCellStyle(cellKey, { borders });
  }

  public setCellFormat(cellKey: string, format: CellFormat): void {
    const activeSheet = this.getActiveSheet();
    const prevModel = JSON.parse(JSON.stringify(this.model));
    const nextModel = JSON.parse(JSON.stringify(this.model));
    const targetSheet = nextModel.sheets.find((s: WorksheetModel) => s.id === activeSheet.id)!;

    if (!targetSheet.cells[cellKey]) {
      targetSheet.cells[cellKey] = { raw: null, value: null };
    }
    targetSheet.cells[cellKey].format = format;
    nextModel.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<WorkbookModel> = {
      id: generateId('cmd'),
      name: `Format cell ${cellKey}`,
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

    const newCells: Record<string, CellData> = {};
    for (const [key, cell] of Object.entries(targetSheet.cells)) {
      const addr = parseCellAddress(key);
      if (addr) {
        if (addr.row >= atRowIndex) {
          const newKey = `${colIndexToName(addr.col)}${addr.row + 2}`;
          newCells[newKey] = cell as CellData;
        } else {
          newCells[key] = cell as CellData;
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

    const newCells: Record<string, CellData> = {};
    for (const [key, cell] of Object.entries(targetSheet.cells)) {
      const addr = parseCellAddress(key);
      if (addr) {
        if (addr.row === atRowIndex) {
          continue;
        } else if (addr.row > atRowIndex) {
          const newKey = `${colIndexToName(addr.col)}${addr.row}`;
          newCells[newKey] = cell as CellData;
        } else {
          newCells[key] = cell as CellData;
        }
      }
    }
    targetSheet.cells = newCells;
    targetSheet.rowCount = Math.max(5, targetSheet.rowCount - 1);
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

  public insertCol(atColIndex: number): void {
    const sheet = this.getActiveSheet();
    const prevModel = JSON.parse(JSON.stringify(this.model));
    const nextModel = JSON.parse(JSON.stringify(this.model));
    const targetSheet = nextModel.sheets.find((s: WorksheetModel) => s.id === sheet.id)!;

    const newCells: Record<string, CellData> = {};
    for (const [key, cell] of Object.entries(targetSheet.cells)) {
      const addr = parseCellAddress(key);
      if (addr) {
        if (addr.col >= atColIndex) {
          const newKey = `${colIndexToName(addr.col + 1)}${addr.row + 1}`;
          newCells[newKey] = cell as CellData;
        } else {
          newCells[key] = cell as CellData;
        }
      }
    }
    targetSheet.cells = newCells;
    targetSheet.colCount += 1;
    nextModel.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<WorkbookModel> = {
      id: generateId('cmd'),
      name: `Insert column ${colIndexToName(atColIndex)}`,
      execute: () => nextModel,
      undo: () => prevModel,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    this.rebuildFormulaEngine();
  }

  public deleteCol(atColIndex: number): void {
    const sheet = this.getActiveSheet();
    const prevModel = JSON.parse(JSON.stringify(this.model));
    const nextModel = JSON.parse(JSON.stringify(this.model));
    const targetSheet = nextModel.sheets.find((s: WorksheetModel) => s.id === sheet.id)!;

    const newCells: Record<string, CellData> = {};
    for (const [key, cell] of Object.entries(targetSheet.cells)) {
      const addr = parseCellAddress(key);
      if (addr) {
        if (addr.col === atColIndex) {
          continue;
        } else if (addr.col > atColIndex) {
          const newKey = `${colIndexToName(addr.col - 1)}${addr.row + 1}`;
          newCells[newKey] = cell as CellData;
        } else {
          newCells[key] = cell as CellData;
        }
      }
    }
    targetSheet.cells = newCells;
    targetSheet.colCount = Math.max(5, targetSheet.colCount - 1);
    nextModel.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<WorkbookModel> = {
      id: generateId('cmd'),
      name: `Delete column ${colIndexToName(atColIndex)}`,
      execute: () => nextModel,
      undo: () => prevModel,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    this.rebuildFormulaEngine();
  }

  public hideRow(rowIndex: number): void {
    const sheet = this.getActiveSheet();
    if (!sheet.hiddenRows) sheet.hiddenRows = [];
    if (!sheet.hiddenRows.includes(rowIndex)) {
      sheet.hiddenRows.push(rowIndex);
    }
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
    if (!sheet.hiddenCols.includes(colIndex)) {
      sheet.hiddenCols.push(colIndex);
    }
  }

  public unhideCol(colIndex: number): void {
    const sheet = this.getActiveSheet();
    if (sheet.hiddenCols) {
      sheet.hiddenCols = sheet.hiddenCols.filter((c) => c !== colIndex);
    }
  }

  public mergeCells(rangeStr: string): boolean {
    const parsed = parseRangeAddress(rangeStr);
    if (!parsed) return false;

    const sheet = this.getActiveSheet();
    if (!sheet.mergedRanges) sheet.mergedRanges = [];

    for (const existing of sheet.mergedRanges) {
      const exParsed = parseRangeAddress(existing);
      if (exParsed) {
        const overlap =
          Math.max(parsed.start.col, exParsed.start.col) <= Math.min(parsed.end.col, exParsed.end.col) &&
          Math.max(parsed.start.row, exParsed.start.row) <= Math.min(parsed.end.row, exParsed.end.row);
        if (overlap && existing !== rangeStr) {
          return false;
        }
      }
    }

    if (!sheet.mergedRanges.includes(rangeStr)) {
      sheet.mergedRanges.push(rangeStr);
    }
    return true;
  }

  public unmergeCells(rangeStr: string): void {
    const sheet = this.getActiveSheet();
    if (sheet.mergedRanges) {
      sheet.mergedRanges = sheet.mergedRanges.filter((r) => r !== rangeStr);
    }
  }

  public setFreezePanes(
    rowsOrConfig: number | { rows: number; cols: number; topLeftCell?: string },
    cols: number = 0,
    topLeftCell?: string
  ): void {
    const sheet = this.getActiveSheet();
    if (typeof rowsOrConfig === 'object') {
      sheet.freezePanes = rowsOrConfig;
    } else {
      if (rowsOrConfig <= 0 && cols <= 0) {
        sheet.freezePanes = undefined;
      } else {
        sheet.freezePanes = { rows: rowsOrConfig, cols, topLeftCell };
      }
    }
  }

  public clearFreezePanes(): void {
    const sheet = this.getActiveSheet();
    sheet.freezePanes = undefined;
  }

  public addDataValidation(rule: DataValidationRule): void {
    const sheet = this.getActiveSheet();
    if (!sheet.dataValidations) sheet.dataValidations = [];
    sheet.dataValidations.push(rule);
  }

  public removeDataValidation(ruleId: string): void {
    const sheet = this.getActiveSheet();
    if (sheet.dataValidations) {
      sheet.dataValidations = sheet.dataValidations.filter((r) => r.id !== ruleId);
    }
  }

  public setAutoFilter(config: AutoFilterConfig): void {
    const sheet = this.getActiveSheet();
    sheet.autoFilter = config;
  }

  public clearAutoFilter(): void {
    const sheet = this.getActiveSheet();
    sheet.autoFilter = undefined;
    sheet.hiddenRows = [];
  }

  public addDefinedName(name: string, formula: string, sheetScopeId?: string, comment?: string): void {
    if (!this.model.definedNames) this.model.definedNames = [];
    this.model.definedNames = this.model.definedNames.filter(
      (d) => !(d.name === name && d.sheetScopeId === sheetScopeId)
    );
    this.model.definedNames.push({ name, formula, sheetScopeId, comment });
  }

  public removeDefinedName(name: string, sheetScopeId?: string): void {
    if (this.model.definedNames) {
      this.model.definedNames = this.model.definedNames.filter(
        (d) => !(d.name === name && d.sheetScopeId === sheetScopeId)
      );
    }
  }

  public copyPasteRange(sourceKey: string, targetKey: string): void {
    const srcAddr = parseCellAddress(sourceKey);
    const tgtAddr = parseCellAddress(targetKey);
    if (!srcAddr || !tgtAddr) return;

    const sheet = this.getActiveSheet();
    const srcCell = sheet.cells[sourceKey];
    if (!srcCell) {
      this.setCellValue(targetKey, null);
      return;
    }

    const dRow = tgtAddr.row - srcAddr.row;
    const dCol = tgtAddr.col - srcAddr.col;

    if (typeof srcCell.raw === 'string' && srcCell.raw.startsWith('=')) {
      const shiftedFormula = shiftFormulaReferences(srcCell.raw, dRow, dCol);
      this.setCellValue(targetKey, shiftedFormula);
    } else {
      this.setCellValue(targetKey, srcCell.raw);
    }

    if (srcCell.style) {
      this.setCellStyle(targetKey, srcCell.style);
    }
    if (srcCell.format) {
      this.setCellFormat(targetKey, srcCell.format);
    }
  }

  public copyPasteMatrix(sourceRangeStr: string, targetStartKey: string): void {
    const srcRange = parseRangeAddress(sourceRangeStr);
    const tgtStart = parseCellAddress(targetStartKey);
    if (!srcRange || !tgtStart) return;

    const sheet = this.getActiveSheet();
    const dRow = tgtStart.row - srcRange.start.row;
    const dCol = tgtStart.col - srcRange.start.col;

    for (let r = srcRange.start.row; r <= srcRange.end.row; r++) {
      for (let c = srcRange.start.col; c <= srcRange.end.col; c++) {
        const srcKey = `${colIndexToName(c)}${r + 1}`;
        const tgtKey = `${colIndexToName(c + dCol)}${r + dRow + 1}`;
        const srcCell = sheet.cells[srcKey];

        if (srcCell) {
          if (typeof srcCell.raw === 'string' && srcCell.raw.startsWith('=')) {
            const shifted = shiftFormulaReferences(srcCell.raw, dRow, dCol);
            this.setCellValue(tgtKey, shifted);
          } else {
            this.setCellValue(tgtKey, srcCell.raw);
          }
          if (srcCell.style) this.setCellStyle(tgtKey, srcCell.style);
          if (srcCell.format) this.setCellFormat(tgtKey, srcCell.format);
        }
      }
    }
  }

  public fillRange(sourceRangeStr: string, targetRangeStr: string): void {
    const srcRange = parseRangeAddress(sourceRangeStr);
    const tgtRange = parseRangeAddress(targetRangeStr);
    if (!srcRange || !tgtRange) return;

    const sheet = this.getActiveSheet();
    // Check if vertical sequence
    if (srcRange.start.col === srcRange.end.col && tgtRange.start.col === tgtRange.end.col) {
      const col = srcRange.start.col;
      const srcValues: number[] = [];
      for (let r = srcRange.start.row; r <= srcRange.end.row; r++) {
        const key = `${colIndexToName(col)}${r + 1}`;
        const val = Number(sheet.cells[key]?.raw);
        if (!isNaN(val)) srcValues.push(val);
      }

      if (srcValues.length >= 2) {
        const step = (srcValues[srcValues.length - 1] - srcValues[0]) / (srcValues.length - 1);
        let lastVal = srcValues[srcValues.length - 1];

        for (let r = tgtRange.start.row; r <= tgtRange.end.row; r++) {
          lastVal += step;
          const key = `${colIndexToName(col)}${r + 1}`;
          this.setCellValue(key, lastVal);
        }
        return;
      }
    }

    // Default: copy formulas / values across target range
    this.copyPasteMatrix(sourceRangeStr, `${colIndexToName(tgtRange.start.col)}${tgtRange.start.row + 1}`);
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

  public get canUndo(): boolean {
    return this.history.canUndo;
  }

  public get canRedo(): boolean {
    return this.history.canRedo;
  }

  private rebuildFormulaEngine(): void {
    const activeSheet = this.getActiveSheet();
    this.formulaEngine.setActiveSheet(activeSheet.name);

    for (const sheet of this.model.sheets) {
      for (const [cellKey, cellData] of Object.entries(sheet.cells)) {
        const addr = parseCellAddress(cellKey);
        if (addr) {
          const fullAddr = { ...addr, sheet: sheet.name };
          if (typeof cellData.raw === 'string' && cellData.raw.startsWith('=')) {
            this.formulaEngine.setCellValue(fullAddr, cellData.raw);
          } else if (cellData.raw !== null && cellData.raw !== undefined) {
            const num = Number(cellData.raw);
            const val = isNaN(num) || typeof cellData.raw === 'boolean' ? cellData.raw : num;
            this.formulaEngine.setCellValue(fullAddr, val);
          }
        }
      }
    }

    for (const sheet of this.model.sheets) {
      for (const [cellKey, cellData] of Object.entries(sheet.cells)) {
        const addr = parseCellAddress(cellKey);
        if (addr) {
          const fullAddr = { ...addr, sheet: sheet.name };
          const val = this.formulaEngine.getCellValue(fullAddr);
          cellData.value = val;
        }
      }
    }
  }

  /**
   * Goal Seek: Iterative numeric solver that adjusts changingCell until targetCell equals targetValue.
   */
  public goalSeek(
    targetCell: string,
    targetValue: number,
    changingCell: string,
    maxIterations: number = 100,
    tolerance: number = 0.001
  ): { success: boolean; iterations: number; finalValue: number } {
    let guess = Number(this.getCellValue(changingCell)) || 0;
    let step = 1.0;

    for (let iter = 0; iter < maxIterations; iter++) {
      this.setCellValue(changingCell, guess);
      const current = Number(this.getCellValue(targetCell));

      if (isNaN(current)) {
        return { success: false, iterations: iter, finalValue: guess };
      }

      const diff = current - targetValue;
      if (Math.abs(diff) <= tolerance) {
        return { success: true, iterations: iter + 1, finalValue: guess };
      }

      // Finite difference approximation for derivative
      this.setCellValue(changingCell, guess + 0.0001);
      const currentPlus = Number(this.getCellValue(targetCell));
      const derivative = (currentPlus - current) / 0.0001;

      if (Math.abs(derivative) < 1e-9) {
        guess += (Math.random() - 0.5) * step;
      } else {
        guess -= diff / derivative;
      }
    }

    this.setCellValue(changingCell, guess);
    const finalDiff = Math.abs(Number(this.getCellValue(targetCell)) - targetValue);
    return { success: finalDiff <= tolerance, iterations: maxIterations, finalValue: guess };
  }

  /**
   * Text to Columns: Splits cell strings in a range across adjacent columns by a delimiter.
   */
  public textToColumns(rangeStr: string, delimiter: string = ','): void {
    const range = parseRangeAddress(rangeStr);
    if (!range) return;

    const sheet = this.getActiveSheet();
    for (let r = range.start.row; r <= range.end.row; r++) {
      const srcCoord = `${colIndexToName(range.start.col)}${r + 1}`;
      const cell = sheet.cells[srcCoord];
      if (cell && typeof cell.raw === 'string') {
        const parts = cell.raw.split(delimiter);
        parts.forEach((part, idx) => {
          const targetCoord = `${colIndexToName(range.start.col + idx)}${r + 1}`;
          const trimmed = part.trim();
          const num = Number(trimmed);
          const val = !isNaN(num) && trimmed !== '' ? num : trimmed;
          this.setCellValue(targetCoord, val);
        });
      }
    }
  }

  /**
   * Remove Duplicates: Removes duplicate rows in a specified range.
   */
  public removeDuplicates(rangeStr: string, keyColOffsets: number[] = [0]): number {
    const range = parseRangeAddress(rangeStr);
    if (!range) return 0;

    const seen = new Set<string>();
    let removedCount = 0;
    const sheet = this.getActiveSheet();

    for (let r = range.start.row; r <= range.end.row; r++) {
      const rowKey = keyColOffsets
        .map((offset) => {
          const coord = `${colIndexToName(range.start.col + offset)}${r + 1}`;
          return String(sheet.cells[coord]?.value ?? '');
        })
        .join('|');

      if (seen.has(rowKey)) {
        // Clear duplicate row cells
        for (let c = range.start.col; c <= range.end.col; c++) {
          const coord = `${colIndexToName(c)}${r + 1}`;
          delete sheet.cells[coord];
        }
        removedCount++;
      } else {
        seen.add(rowKey);
      }
    }

    this.rebuildFormulaEngine();
    return removedCount;
  }

  /**
   * Quick freeze top row (row 1)
   */
  public freezeTopRow(): void {
    this.setFreezePanes(1, 0);
  }

  /**
   * Quick freeze first column (column A)
   */
  public freezeFirstColumn(): void {
    this.setFreezePanes(0, 1);
  }
}

export function shiftFormulaReferences(formula: string, dRow: number, dCol: number): string {
  if (!formula.startsWith('=')) return formula;

  // Match cell references: e.g. Sheet1!$A$1, $B$2, C3, $D4, E$5
  const refRegex = /(?:([A-Za-z0-9_]+)!)?(\$?)([A-Za-z]+)(\$?)([0-9]+)/g;

  return formula.replace(refRegex, (_fullMatch, sheet, colAbs, colName, rowAbs, rowNumStr) => {
    const rowNum = parseInt(rowNumStr, 10);
    let colIdx = 0;
    const upperCol = colName.toUpperCase();
    for (let i = 0; i < upperCol.length; i++) {
      colIdx = colIdx * 26 + (upperCol.charCodeAt(i) - 64);
    }
    colIdx -= 1; // 0-based

    const isColAbsolute = colAbs === '$';
    const isRowAbsolute = rowAbs === '$';

    const targetCol = isColAbsolute ? colIdx : colIdx + dCol;
    const targetRow = isRowAbsolute ? rowNum - 1 : rowNum - 1 + dRow;

    if (targetCol < 0 || targetRow < 0) {
      return '#REF!';
    }

    const sheetPrefix = sheet ? `${sheet}!` : '';
    const newColStr = `${colAbs}${colIndexToName(targetCol)}`;
    const newRowStr = `${rowAbs}${targetRow + 1}`;

    return `${sheetPrefix}${newColStr}${newRowStr}`;
  });
}
