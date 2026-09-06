import { generateId, HistoryStack, HistoryCommand } from '@openhead/core';
import {
  PenDocumentModel,
  Block,
  ParagraphBlock,
  HeadingBlock,
  TableBlock,
  TableCell,
  DocStats,
  OutlineItem,
  InlineText,
  InlineStyle,
  ParagraphProperties,
  PageSettings,
} from './types';
import { PenEditorOperations } from './editor';
import { DEFAULT_PEN_STYLES } from './styles';

export class PenDocument {
  private model: PenDocumentModel;
  private history = new HistoryStack<PenDocumentModel>();

  constructor(initialModel?: PenDocumentModel) {
    if (initialModel) {
      this.model = JSON.parse(JSON.stringify(initialModel));
    } else {
      this.model = PenDocument.createEmpty('Untitled Document');
    }
  }

  public static createEmpty(title: string = 'Untitled Document'): PenDocumentModel {
    const docId = generateId('doc');
    return {
      metadata: {
        id: docId,
        title,
        type: 'pen',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      styles: { ...DEFAULT_PEN_STYLES },
      sections: [
        {
          id: generateId('sec'),
          pageSettings: {
            orientation: 'portrait',
            pageSize: 'A4',
            margins: { top: 25, bottom: 25, left: 25, right: 25 },
            columns: 1,
            headerText: 'Openhead Document',
            footerText: 'Page 1',
          },
          blocks: [
            {
              id: generateId('blk'),
              type: 'heading',
              level: 1,
              props: { styleId: 'Heading1', spacingBefore: 14, spacingAfter: 6 },
              inlines: [{ id: generateId('inl'), text: title }],
            },
            {
              id: generateId('blk'),
              type: 'paragraph',
              props: { styleId: 'Normal', lineSpacing: 1.15, spacingAfter: 6 },
              inlines: [{ id: generateId('inl'), text: 'Start typing your document...' }],
            },
          ],
          footnotes: [],
        },
      ],
    };
  }

  public getModel(): PenDocumentModel {
    return this.model;
  }

  public get canUndo(): boolean {
    return this.history.canUndo;
  }

  public get canRedo(): boolean {
    return this.history.canRedo;
  }

  public undo(): void {
    const res = this.history.undo(this.model);
    if (res && res.state) {
      this.model = res.state;
    }
  }

  public redo(): void {
    const res = this.history.redo(this.model);
    if (res && res.state) {
      this.model = res.state;
    }
  }

  private executeCommand(name: string, mutateFn: (model: PenDocumentModel) => void): void {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    mutateFn(next);
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<PenDocumentModel> = {
      id: generateId('cmd'),
      name,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
  }

  public setTitle(title: string): void {
    this.executeCommand('Set Title', (model) => {
      model.metadata.title = title;
    });
  }

  public insertBlock(sectionIndex: number, blockIndex: number, block: Block): void {
    this.executeCommand(`Insert ${block.type}`, (model) => {
      model.sections[sectionIndex].blocks.splice(blockIndex, 0, block);
    });
  }

  public updateBlock(sectionIndex: number, blockIndex: number, updatedBlock: Block): void {
    this.executeCommand(`Update ${updatedBlock.type}`, (model) => {
      model.sections[sectionIndex].blocks[blockIndex] = updatedBlock;
    });
  }

  public deleteBlock(sectionIndex: number, blockIndex: number): void {
    this.executeCommand('Delete Block', (model) => {
      model.sections[sectionIndex].blocks.splice(blockIndex, 1);
    });
  }

  public moveBlock(sectionIndex: number, fromIndex: number, toIndex: number): void {
    this.executeCommand('Move Block', (model) => {
      const [block] = model.sections[sectionIndex].blocks.splice(fromIndex, 1);
      if (block) {
        model.sections[sectionIndex].blocks.splice(toIndex, 0, block);
      }
    });
  }

  /**
   * Formats a selection range [startChar, endChar] in a block's inline runs.
   */
  public formatInlineSelection(
    sectionIndex: number,
    blockIndex: number,
    startChar: number,
    endChar: number,
    stylePatch: Partial<InlineStyle>
  ): void {
    this.executeCommand('Format Selection', (model) => {
      const block = model.sections[sectionIndex].blocks[blockIndex];
      if (block && 'inlines' in block && Array.isArray((block as any).inlines)) {
        (block as any).inlines = PenEditorOperations.formatInlineRange(
          (block as any).inlines,
          startChar,
          endChar,
          stylePatch
        );
      }
    });
  }

  /**
   * Sets paragraph level properties (align, lineSpacing, spacingBefore, spacingAfter, indents).
   */
  public setParagraphProperties(
    sectionIndex: number,
    blockIndex: number,
    props: Partial<ParagraphProperties>
  ): void {
    this.executeCommand('Set Paragraph Properties', (model) => {
      const block = model.sections[sectionIndex].blocks[blockIndex];
      if (block && (block.type === 'paragraph' || block.type === 'heading' || block.type === 'bullet-list-item' || block.type === 'numbered-list-item' || block.type === 'callout')) {
        const currentProps = (block as any).props || {};
        (block as any).props = { ...currentProps, ...props };
        if (props.align) {
          (block as any).align = props.align;
        }
      }
    });
  }

  /**
   * Sets style for a block (e.g. Normal, Heading1, Title, Quote).
   */
  public setBlockStyle(sectionIndex: number, blockIndex: number, styleId: string): void {
    this.executeCommand(`Apply Style ${styleId}`, (model) => {
      const block = model.sections[sectionIndex].blocks[blockIndex];
      if (!block) return;
      if (styleId.startsWith('Heading')) {
        const level = parseInt(styleId.replace('Heading', ''), 10) as 1 | 2 | 3 | 4 | 5 | 6;
        if (level >= 1 && level <= 6) {
          const headingBlock: HeadingBlock = {
            id: block.id,
            type: 'heading',
            level,
            props: { ...((block as any).props || {}), styleId },
            inlines: (block as any).inlines || [{ id: generateId('inl'), text: '' }],
          };
          model.sections[sectionIndex].blocks[blockIndex] = headingBlock;
          return;
        }
      }
      if (styleId === 'Quote') {
        const quoteBlock: ParagraphBlock = {
          id: block.id,
          type: 'paragraph',
          inlines: (block as any).inlines || [{ id: generateId('inl'), text: '' }],
          props: { ...((block as any).props || {}), styleId: 'Quote' },
        };
        model.sections[sectionIndex].blocks[blockIndex] = quoteBlock;
        return;
      }
      if (block.type === 'heading') {
        const pBlock: ParagraphBlock = {
          id: block.id,
          type: 'paragraph',
          inlines: block.inlines,
          props: { ...((block as any).props || {}), styleId },
        };
        model.sections[sectionIndex].blocks[blockIndex] = pBlock;
        return;
      }
      if (block.type === 'paragraph' || block.type === 'callout') {
        (block as any).props = { ...((block as any).props || {}), styleId };
      }
    });
  }

  /**
   * Indents a list item (increases level).
   */
  public indentListItem(sectionIndex: number, blockIndex: number): void {
    this.executeCommand('Indent List Item', (model) => {
      const block = model.sections[sectionIndex].blocks[blockIndex];
      if (block && (block.type === 'bullet-list-item' || block.type === 'numbered-list-item')) {
        block.level = Math.min(8, (block.level || 0) + 1);
      }
    });
  }

  /**
   * Outdents a list item (decreases level or turns into paragraph).
   */
  public outdentListItem(sectionIndex: number, blockIndex: number): void {
    this.executeCommand('Outdent List Item', (model) => {
      const block = model.sections[sectionIndex].blocks[blockIndex];
      if (block && (block.type === 'bullet-list-item' || block.type === 'numbered-list-item')) {
        if (block.level > 0) {
          block.level -= 1;
        } else {
          // Convert to normal paragraph
          const pBlock: ParagraphBlock = {
            id: block.id,
            type: 'paragraph',
            inlines: block.inlines,
            props: { styleId: 'Normal', lineSpacing: 1.15, spacingAfter: 6 },
          };
          model.sections[sectionIndex].blocks[blockIndex] = pBlock;
        }
      }
    });
  }

  /**
   * Inserts a new table block.
   */
  public insertTable(
    sectionIndex: number,
    blockIndex: number,
    rowsCount: number = 3,
    colsCount: number = 3,
    headers?: string[]
  ): void {
    const tableId = generateId('tbl');
    const tableHeaders = headers || Array.from({ length: colsCount }, (_, i) => `Column ${i + 1}`);
    const rows: TableCell[][] = [];

    for (let r = 0; r < rowsCount; r++) {
      const row: TableCell[] = [];
      for (let c = 0; c < colsCount; c++) {
        row.push({
          id: generateId('tc'),
          inlines: [{ id: generateId('inl'), text: `Data ${r + 1},${c + 1}` }],
          align: 'left',
          borders: {
            top: { style: 'single', color: '#CBD5E1', width: 1 },
            bottom: { style: 'single', color: '#CBD5E1', width: 1 },
            left: { style: 'single', color: '#CBD5E1', width: 1 },
            right: { style: 'single', color: '#CBD5E1', width: 1 },
          },
        });
      }
      rows.push(row);
    }

    const tableBlock: TableBlock = {
      id: tableId,
      type: 'table',
      headers: tableHeaders,
      hasHeaderRow: true,
      rows,
      colWidths: Array.from({ length: colsCount }, () => Math.floor(100 / colsCount)),
    };

    this.insertBlock(sectionIndex, blockIndex, tableBlock);
  }

  /**
   * Adds a row to a table.
   */
  public insertTableRow(sectionIndex: number, blockIndex: number, atRowIndex?: number): void {
    this.executeCommand('Insert Table Row', (model) => {
      const block = model.sections[sectionIndex].blocks[blockIndex];
      if (block && block.type === 'table') {
        const colCount = block.rows.length > 0 ? block.rows[0].length : (block.headers?.length || 3);
        const newRow: TableCell[] = Array.from({ length: colCount }, () => ({
          id: generateId('tc'),
          inlines: [{ id: generateId('inl'), text: '' }],
          align: 'left',
          borders: {
            top: { style: 'single', color: '#CBD5E1', width: 1 },
            bottom: { style: 'single', color: '#CBD5E1', width: 1 },
            left: { style: 'single', color: '#CBD5E1', width: 1 },
            right: { style: 'single', color: '#CBD5E1', width: 1 },
          },
        }));
        const targetIdx = atRowIndex !== undefined ? atRowIndex : block.rows.length;
        block.rows.splice(targetIdx, 0, newRow);
      }
    });
  }

  /**
   * Deletes a row from a table.
   */
  public deleteTableRow(sectionIndex: number, blockIndex: number, rowIndex: number): void {
    this.executeCommand('Delete Table Row', (model) => {
      const block = model.sections[sectionIndex].blocks[blockIndex];
      if (block && block.type === 'table' && block.rows.length > 1) {
        block.rows.splice(rowIndex, 1);
      }
    });
  }

  /**
   * Adds a column to a table.
   */
  public insertTableCol(sectionIndex: number, blockIndex: number, atColIndex?: number): void {
    this.executeCommand('Insert Table Column', (model) => {
      const block = model.sections[sectionIndex].blocks[blockIndex];
      if (block && block.type === 'table') {
        const targetIdx = atColIndex !== undefined ? atColIndex : (block.headers?.length || (block.rows[0]?.length || 0));
        if (block.headers) {
          block.headers.splice(targetIdx, 0, `Col ${block.headers.length + 1}`);
        }
        for (const row of block.rows) {
          row.splice(targetIdx, 0, {
            id: generateId('tc'),
            inlines: [{ id: generateId('inl'), text: '' }],
            align: 'left',
            borders: {
              top: { style: 'single', color: '#CBD5E1', width: 1 },
              bottom: { style: 'single', color: '#CBD5E1', width: 1 },
              left: { style: 'single', color: '#CBD5E1', width: 1 },
              right: { style: 'single', color: '#CBD5E1', width: 1 },
            },
          });
        }
      }
    });
  }

  /**
   * Deletes a column from a table.
   */
  public deleteTableCol(sectionIndex: number, blockIndex: number, colIndex: number): void {
    this.executeCommand('Delete Table Column', (model) => {
      const block = model.sections[sectionIndex].blocks[blockIndex];
      if (block && block.type === 'table' && (block.rows[0]?.length || 0) > 1) {
        if (block.headers && block.headers.length > colIndex) {
          block.headers.splice(colIndex, 1);
        }
        for (const row of block.rows) {
          if (row.length > colIndex) {
            row.splice(colIndex, 1);
          }
        }
      }
    });
  }

  /**
   * Sets table cell properties.
   */
  public setTableCell(
    sectionIndex: number,
    blockIndex: number,
    rowIndex: number,
    colIndex: number,
    text: string,
    styles?: InlineStyle,
    cellProps?: Partial<TableCell>
  ): void {
    this.executeCommand('Update Table Cell', (model) => {
      const block = model.sections[sectionIndex].blocks[blockIndex];
      if (block && block.type === 'table' && block.rows[rowIndex]?.[colIndex]) {
        const cell = block.rows[rowIndex][colIndex];
        cell.inlines = [{ id: generateId('inl'), text, styles }];
        if (cellProps) {
          Object.assign(cell, cellProps);
        }
      }
    });
  }

  /**
   * Inserts a footnote in the document section.
   */
  public insertFootnote(
    sectionIndex: number,
    blockIndex: number,
    charOffset: number,
    footnoteText: string
  ): string {
    const fnId = generateId('fn');
    this.executeCommand('Insert Footnote', (model) => {
      const section = model.sections[sectionIndex];
      if (!section.footnotes) section.footnotes = [];
      const nextIndex = section.footnotes.length + 1;
      section.footnotes.push({
        id: fnId,
        index: nextIndex,
        text: footnoteText,
        inlines: [{ id: generateId('inl'), text: footnoteText }],
      });

      // Insert footnote reference run in block
      const block = section.blocks[blockIndex];
      if (block && 'inlines' in block && Array.isArray((block as any).inlines)) {
        (block as any).inlines = PenEditorOperations.insertTextAt(
          (block as any).inlines,
          charOffset,
          `[${nextIndex}]`,
          { superscript: true, footnoteRefId: fnId, color: '#2563EB' }
        );
      }
    });
    return fnId;
  }

  /**
   * Deletes a footnote.
   */
  public deleteFootnote(sectionIndex: number, footnoteId: string): void {
    this.executeCommand('Delete Footnote', (model) => {
      const section = model.sections[sectionIndex];
      if (section.footnotes) {
        section.footnotes = section.footnotes.filter((f) => f.id !== footnoteId);
        // Re-index remaining footnotes
        section.footnotes.forEach((f, idx) => {
          f.index = idx + 1;
        });
      }
    });
  }

  /**
   * Sets page layout settings for a section.
   */
  public setPageSettings(sectionIndex: number, settings: Partial<PageSettings>): void {
    this.executeCommand('Set Page Settings', (model) => {
      const section = model.sections[sectionIndex];
      if (section) {
        section.pageSettings = { ...section.pageSettings, ...settings };
      }
    });
  }

  /**
   * Searches and replaces text across all text runs with atomic undo.
   */
  public searchAndReplace(
    query: string,
    replacement: string,
    options: { caseSensitive?: boolean; wholeWord?: boolean } = {}
  ): number {
    if (!query) return 0;
    let matchCount = 0;

    this.executeCommand(`Replace "${query}" with "${replacement}"`, (model) => {
      const flags = options.caseSensitive ? 'g' : 'gi';
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const patternStr = options.wholeWord ? `\\b${escapedQuery}\\b` : escapedQuery;
      const regex = new RegExp(patternStr, flags);

      for (const section of model.sections) {
        for (const block of section.blocks) {
          if ('inlines' in block && Array.isArray((block as any).inlines)) {
            for (const inl of (block as any).inlines) {
              const matches = inl.text.match(regex);
              if (matches) {
                matchCount += matches.length;
                inl.text = inl.text.replace(regex, replacement);
              }
            }
          } else if (block.type === 'table') {
            for (const row of block.rows) {
              for (const cell of row) {
                for (const inl of cell.inlines) {
                  const matches = inl.text.match(regex);
                  if (matches) {
                    matchCount += matches.length;
                    inl.text = inl.text.replace(regex, replacement);
                  }
                }
              }
            }
          }
        }
      }
    });

    return matchCount;
  }

  /**
   * Computes document statistics.
   */
  public getStats(): DocStats {
    let wordCount = 0;
    let charCount = 0;
    let charNoSpaces = 0;
    let paragraphCount = 0;

    for (const section of this.model.sections) {
      for (const block of section.blocks) {
        if ('inlines' in block && Array.isArray((block as any).inlines)) {
          paragraphCount++;
          const text = (block as any).inlines.map((i: InlineText) => i.text).join('');
          charCount += text.length;
          charNoSpaces += text.replace(/\s+/g, '').length;
          const words = text.trim().split(/\s+/).filter(Boolean);
          wordCount += words.length;
        } else if (block.type === 'table') {
          paragraphCount += block.rows.length;
          for (const row of block.rows) {
            for (const cell of row) {
              const text = cell.inlines.map((i) => i.text).join('');
              charCount += text.length;
              charNoSpaces += text.replace(/\s+/g, '').length;
              const words = text.trim().split(/\s+/).filter(Boolean);
              wordCount += words.length;
            }
          }
        }
      }
    }

    const estimatedPages = Math.max(1, Math.ceil(wordCount / 300) + Math.floor(paragraphCount / 12));
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    return {
      words: wordCount,
      characters: charCount,
      charactersWithoutSpaces: charNoSpaces,
      paragraphs: paragraphCount,
      estimatedPages,
      readingTimeMinutes,
    };
  }

  /**
   * Extracts structural document outline (Heading 1-6).
   */
  public getOutline(): OutlineItem[] {
    const items: OutlineItem[] = [];
    this.model.sections.forEach((section, sIdx) => {
      section.blocks.forEach((block, bIdx) => {
        if (block.type === 'heading') {
          const title = block.inlines.map((i) => i.text).join('').trim();
          items.push({
            id: block.id,
            level: block.level,
            title: title || `Heading ${block.level}`,
            blockIndex: bIdx,
            sectionIndex: sIdx,
          });
        }
      });
    });
    return items;
  }
}
