import { generateId, HistoryStack, HistoryCommand } from '@openhead/core';
import { FormulaEngine, parseCellAddress } from '@openhead/formula';
import { WorkbookModel, WorksheetModel, CellStyle, CellFormat } from './types';

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
    const sheetNum = this.model.sheets.length + 1;
    const sheetName = name || `Sheet${sheetNum}`;
    const newSheet: WorksheetModel = {
      id: generateId('sheet'),
      name: sheetName,
      rowCount: 100,
      colCount: 26,
      cells: {},
    };
    this.model.sheets.push(newSheet);
    this.model.activeSheetId = newSheet.id;
    return newSheet;
  }

  public setCellValue(cellKey: string, input: string | number | boolean | null): void {
    const sheet = this.getActiveSheet();
    const addr = parseCellAddress(cellKey);
    if (!addr) return;

    const prevModel = JSON.parse(JSON.stringify(this.model));
    const nextModel = JSON.parse(JSON.stringify(this.model));
    const targetSheet = nextModel.sheets.find((s: WorksheetModel) => s.id === sheet.id)!;

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

  public setCellStyle(cellKey: string, style: Partial<CellStyle>): void {
    const sheet = this.getActiveSheet();
    const existing = sheet.cells[cellKey] || { raw: '', value: null };
    sheet.cells[cellKey] = {
      ...existing,
      style: { ...(existing.style || {}), ...style },
    };
  }

  public setCellFormat(cellKey: string, format: CellFormat): void {
    const sheet = this.getActiveSheet();
    const existing = sheet.cells[cellKey] || { raw: '', value: null };
    sheet.cells[cellKey] = {
      ...existing,
      format,
    };
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
    const sheet = this.getActiveSheet();
    for (const [key, cell] of Object.entries(sheet.cells)) {
      const addr = parseCellAddress(key);
      if (addr && cell.raw !== null && cell.raw !== undefined) {
        this.formulaEngine.setCellValue(addr, cell.raw);
      }
    }
  }
}
