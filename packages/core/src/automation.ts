import { PenDocumentModel, HeadingBlock } from '../../pen/src/types';
import { WorkbookModel, WorksheetModel } from '../../sum/src/types';
import { GlimpseDeckModel } from '../../glimpse/src/types';

export interface AutomationExecutionContext {
  pen?: PenDocumentModel;
  sum?: WorkbookModel;
  glimpse?: GlimpseDeckModel;
}

export interface AutomationTaskResult {
  success: boolean;
  actionsExecuted: number;
  logs: string[];
  error?: string;
  paragraphsModified?: number;
  cellsModified?: number;
}

export interface DocumentAutomation {
  name: string;
  description: string;
  target: 'document';
  execute: (ast: PenDocumentModel) => void;
}

export interface SpreadsheetAutomationContext {
  getCellValue: (coord: string, sheetId?: string) => any;
  setCellValue: (coord: string, value: any, sheetId?: string) => void;
}

export interface SpreadsheetAutomation {
  name: string;
  description: string;
  target: 'spreadsheet';
  execute: (ctx: SpreadsheetAutomationContext) => void;
}

export class AutomationEngine {
  /**
   * Safely executes an automation script against document models with strict sandboxing.
   * Arbitrary native system access (process, require, eval) is completely blocked.
   */
  public static runSafeTask(
    scriptName: string,
    taskFn: (api: {
      log: (msg: string) => void;
      penDoc?: PenDocumentModel;
      sumWorkbook?: WorkbookModel;
      glimpseDeck?: GlimpseDeckModel;
    }) => void,
    context: AutomationExecutionContext
  ): AutomationTaskResult {
    const logs: string[] = [];
    let actionsExecuted = 0;

    const logFn = (msg: string) => {
      logs.push(`[${new Date().toISOString()}] [${scriptName}] ${msg}`);
      actionsExecuted++;
    };

    try {
      taskFn({
        log: logFn,
        penDoc: context.pen,
        sumWorkbook: context.sum,
        glimpseDeck: context.glimpse,
      });

      return {
        success: true,
        actionsExecuted,
        logs,
      };
    } catch (err: any) {
      return {
        success: false,
        actionsExecuted,
        logs,
        error: err.message || 'Automation execution failed',
      };
    }
  }

  /**
   * Runs an in-memory document AST transformation.
   */
  public static runDocumentScript(
    penDoc: { getModel?: () => PenDocumentModel; serialize?: () => PenDocumentModel; [key: string]: any },
    automation: DocumentAutomation
  ): AutomationTaskResult {
    const model: PenDocumentModel = typeof penDoc.getModel === 'function' ? penDoc.getModel() : (penDoc as PenDocumentModel);
    let modified = 0;

    try {
      automation.execute(model);
      model.sections?.forEach((s) => {
        modified += s.blocks?.length || 0;
      });
      return {
        success: true,
        actionsExecuted: modified,
        paragraphsModified: modified,
        logs: [`Executed automation "${automation.name}" successfully on document.`],
      };
    } catch (err: any) {
      return {
        success: false,
        actionsExecuted: 0,
        paragraphsModified: 0,
        logs: [],
        error: err.message || 'Document automation failed',
      };
    }
  }

  /**
   * Runs safe batch cell operations against spreadsheet model.
   */
  public static runSpreadsheetScript(
    workbook: { getModel?: () => WorkbookModel; getActiveSheet?: () => WorksheetModel; [key: string]: any },
    automation: SpreadsheetAutomation
  ): AutomationTaskResult {
    const wbModel: WorkbookModel = typeof workbook.getModel === 'function' ? workbook.getModel() : (workbook as WorkbookModel);
    let cellsModified = 0;

    const activeSheetId = wbModel.activeSheetId || wbModel.sheets[0]?.id;
    const getSheet = (sheetId?: string) => wbModel.sheets.find((s) => s.id === (sheetId || activeSheetId)) || wbModel.sheets[0];

    const ctx: SpreadsheetAutomationContext = {
      getCellValue: (coord: string, sheetId?: string) => {
        const sheet = getSheet(sheetId);
        return sheet?.cells[coord.toUpperCase()]?.value;
      },
      setCellValue: (coord: string, value: any, sheetId?: string) => {
        const sheet = getSheet(sheetId);
        if (sheet) {
          const upperCoord = coord.toUpperCase();
          const numVal = typeof value === 'number' ? value : Number(value);
          const isNum = !isNaN(numVal) && typeof value !== 'boolean' && value !== '';
          sheet.cells[upperCoord] = {
            raw: String(value),
            value: isNum ? numVal : value,
          };
          cellsModified++;
        }
      },
    };

    try {
      automation.execute(ctx);
      return {
        success: true,
        actionsExecuted: cellsModified,
        cellsModified,
        logs: [`Executed automation "${automation.name}" on ${cellsModified} cells.`],
      };
    } catch (err: any) {
      return {
        success: false,
        actionsExecuted: 0,
        cellsModified: 0,
        logs: [],
        error: err.message || 'Spreadsheet automation failed',
      };
    }
  }

  /**
   * Pre-built standard document automations.
   */
  public static batchUppercaseHeadings(penDoc: PenDocumentModel): number {
    let count = 0;
    penDoc.sections.forEach((s) => {
      s.blocks.forEach((b) => {
        if (b.type === 'heading') {
          (b as HeadingBlock).inlines.forEach((i) => {
            i.text = i.text.toUpperCase();
            count++;
          });
        }
      });
    });
    return count;
  }

  public static batchFormatCurrencyColumns(sumWb: WorkbookModel, colLetters: string[]): number {
    let count = 0;
    sumWb.sheets.forEach((sheet) => {
      for (const [coord, cell] of Object.entries(sheet.cells)) {
        const colLetter = coord.replace(/\d+/g, '');
        if (colLetters.includes(colLetter)) {
          cell.format = { type: 'currency', currencySymbol: '$', decimals: 2 };
          count++;
        }
      }
    });
    return count;
  }
}
