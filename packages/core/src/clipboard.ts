export type OfficeClipboardDataType = 'text' | 'table' | 'blocks' | 'cells' | 'shapes' | 'chart';

export interface TableClipboardData {
  headers?: string[];
  rows: string[][];
  numRows: number;
  numCols: number;
}

export interface OfficeClipboardPayload {
  type: OfficeClipboardDataType;
  sourceApp: 'pen' | 'sum' | 'glimpse';
  timestamp: number;
  plainText: string;
  tableData?: TableClipboardData;
  rawPayload?: any;
}

export class OfficeClipboardEngine {
  private static clipboard: OfficeClipboardPayload | null = null;

  public static copy(payload: OfficeClipboardPayload): void {
    this.clipboard = JSON.parse(JSON.stringify(payload));
  }

  public static get(): OfficeClipboardPayload | null {
    return this.clipboard ? JSON.parse(JSON.stringify(this.clipboard)) : null;
  }

  public static clear(): void {
    this.clipboard = null;
  }

  // --- Translation Methods ---

  /**
   * Sum Cells -> Table / PlainText
   */
  public static copySumCells(cellMatrix: string[][], headers?: string[]): void {
    const numRows = cellMatrix.length;
    const numCols = numRows > 0 ? cellMatrix[0].length : 0;
    const plainText = cellMatrix.map((row) => row.join('\t')).join('\n');

    this.copy({
      type: 'cells',
      sourceApp: 'sum',
      timestamp: Date.now(),
      plainText,
      tableData: {
        headers,
        rows: cellMatrix,
        numRows,
        numCols,
      },
      rawPayload: cellMatrix,
    });
  }

  /**
   * Sum -> Pen: Convert clipboard payload to Pen TableBlock structure
   */
  public static pasteToPenTable(): { headers?: string[]; rows: Array<Array<{ inlines: Array<{ text: string }> }>> } | null {
    if (!this.clipboard) return null;

    if (this.clipboard.tableData) {
      const { headers, rows } = this.clipboard.tableData;
      return {
        headers,
        rows: rows.map((row) =>
          row.map((cellText) => ({
            inlines: [{ text: cellText }],
          }))
        ),
      };
    }

    // Fallback: parse tab-separated plain text
    if (this.clipboard.plainText) {
      const lines = this.clipboard.plainText.split('\n').map((l) => l.split('\t'));
      return {
        rows: lines.map((row) =>
          row.map((cellText) => ({
            inlines: [{ text: cellText }],
          }))
        ),
      };
    }

    return null;
  }

  /**
   * Sum -> Glimpse: Convert clipboard payload to Glimpse TableNode format
   */
  public static pasteToGlimpseTable(): { rows: number; columns: number; cells: Array<Array<{ id: string; text: string; fill?: string }>> } | null {
    if (!this.clipboard) return null;

    let rowData: string[][] = [];
    if (this.clipboard.tableData) {
      if (this.clipboard.tableData.headers) {
        rowData.push(this.clipboard.tableData.headers);
      }
      rowData.push(...this.clipboard.tableData.rows);
    } else if (this.clipboard.plainText) {
      rowData = this.clipboard.plainText.split('\n').map((l) => l.split('\t'));
    }

    if (rowData.length === 0) return null;
    const rows = rowData.length;
    const columns = Math.max(...rowData.map((r) => r.length), 1);

    const cells = rowData.map((row, rIdx) =>
      row.map((val, cIdx) => ({
        id: `cell_${rIdx}_${cIdx}`,
        text: val,
        fill: rIdx === 0 ? '#1e293b' : 'rgba(255,255,255,0.03)',
      }))
    );

    return { rows, columns, cells };
  }

  /**
   * Sum -> Glimpse: Convert numeric tabular data into Chart series & categories
   */
  public static pasteToGlimpseChart(): { categories: string[]; series: Array<{ name: string; data: number[] }> } | null {
    if (!this.clipboard || !this.clipboard.tableData) return null;
    const { headers, rows } = this.clipboard.tableData;
    if (rows.length === 0) return null;

    const categories = rows.map((r) => r[0] || 'Item');
    const series: Array<{ name: string; data: number[] }> = [];

    const numCols = rows[0].length;
    for (let c = 1; c < numCols; c++) {
      const seriesName = headers && headers[c] ? headers[c] : `Series ${c}`;
      const seriesData = rows.map((r) => {
        const parsed = parseFloat((r[c] || '').replace(/[^0-9.-]+/g, ''));
        return isNaN(parsed) ? 0 : parsed;
      });
      series.push({ name: seriesName, data: seriesData });
    }

    if (series.length === 0) {
      // If only 1 column, create single count series
      series.push({
        name: headers ? headers[0] : 'Values',
        data: rows.map((r) => {
          const parsed = parseFloat((r[0] || '').replace(/[^0-9.-]+/g, ''));
          return isNaN(parsed) ? 1 : parsed;
        }),
      });
    }

    return { categories, series };
  }

  /**
   * Pen Text -> Sum Cells: Parse multiline / TSV / CSV text into 2D cell grid
   */
  public static pasteToSumMatrix(): string[][] | null {
    if (!this.clipboard) return null;

    if (this.clipboard.tableData) {
      const res: string[][] = [];
      if (this.clipboard.tableData.headers) {
        res.push(this.clipboard.tableData.headers);
      }
      res.push(...this.clipboard.tableData.rows);
      return res;
    }

    if (this.clipboard.plainText) {
      return this.clipboard.plainText.split('\n').map((line) => line.split('\t'));
    }

    return null;
  }
}
