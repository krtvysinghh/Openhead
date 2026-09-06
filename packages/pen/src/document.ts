import { generateId, HistoryStack, HistoryCommand } from '@openhead/core';
import {
  PenDocumentModel,
  Block,
  HeadingBlock,
  TableBlock,
  DocStats,
  OutlineItem,
  TableCell,
  Footnote,
} from './types';

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
              inlines: [{ id: generateId('inl'), text: title }],
            },
            {
              id: generateId('blk'),
              type: 'paragraph',
              inlines: [{ id: generateId('inl'), text: 'Start typing your document...' }],
            },
          ],
        },
      ],
    };
  }

  public getModel(): PenDocumentModel {
    return this.model;
  }

  public setTitle(title: string): void {
    this.model.metadata.title = title;
    this.model.metadata.updatedAt = Date.now();
  }

  public insertBlock(sectionIndex: number, blockIndex: number, block: Block): void {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    next.sections[sectionIndex].blocks.splice(blockIndex, 0, block);
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<PenDocumentModel> = {
      id: generateId('cmd'),
      name: `Insert ${block.type}`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
  }

  public updateBlock(sectionIndex: number, blockIndex: number, updatedBlock: Block): void {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    next.sections[sectionIndex].blocks[blockIndex] = updatedBlock;
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<PenDocumentModel> = {
      id: generateId('cmd'),
      name: `Update ${updatedBlock.type}`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
  }

  public deleteBlock(sectionIndex: number, blockIndex: number): void {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    next.sections[sectionIndex].blocks.splice(blockIndex, 1);
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<PenDocumentModel> = {
      id: generateId('cmd'),
      name: `Delete block`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
  }

  public insertTableRow(sectionIndex: number, blockIndex: number, rowIndex: number): void {
    const block = this.model.sections[sectionIndex].blocks[blockIndex];
    if (block.type !== 'table') return;

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const targetTable = next.sections[sectionIndex].blocks[blockIndex] as TableBlock;

    const colCount = targetTable.headers.length || (targetTable.rows[0]?.length ?? 2);
    const newRow: TableCell[] = Array.from({ length: colCount }).map(() => ({
      id: generateId('cell'),
      inlines: [{ id: generateId('inl'), text: '' }],
    }));

    targetTable.rows.splice(rowIndex, 0, newRow);
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<PenDocumentModel> = {
      id: generateId('cmd'),
      name: 'Insert Table Row',
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
  }

  public deleteTableRow(sectionIndex: number, blockIndex: number, rowIndex: number): void {
    const block = this.model.sections[sectionIndex].blocks[blockIndex];
    if (block.type !== 'table') return;

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const targetTable = next.sections[sectionIndex].blocks[blockIndex] as TableBlock;

    if (targetTable.rows.length > 1) {
      targetTable.rows.splice(rowIndex, 1);
      next.metadata.updatedAt = Date.now();

      const cmd: HistoryCommand<PenDocumentModel> = {
        id: generateId('cmd'),
        name: 'Delete Table Row',
        execute: () => next,
        undo: () => prev,
        timestamp: Date.now(),
      };
      this.model = this.history.execute(this.model, cmd);
    }
  }

  public addFootnote(sectionIndex: number, text: string): Footnote {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const sec = next.sections[sectionIndex];
    if (!sec.footnotes) sec.footnotes = [];

    const footnote: Footnote = {
      id: generateId('fn'),
      index: sec.footnotes.length + 1,
      text,
    };
    sec.footnotes.push(footnote);
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<PenDocumentModel> = {
      id: generateId('cmd'),
      name: `Add Footnote #${footnote.index}`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    return footnote;
  }

  public searchAndReplace(searchQuery: string, replaceWith: string): number {
    if (!searchQuery) return 0;
    let replacements = 0;

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));

    for (const section of next.sections) {
      for (const block of section.blocks) {
        if ('inlines' in block && Array.isArray(block.inlines)) {
          for (const inl of block.inlines) {
            if (inl.text.includes(searchQuery)) {
              const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
              const count = (inl.text.match(regex) || []).length;
              replacements += count;
              inl.text = inl.text.replace(regex, replaceWith);
            }
          }
        }
      }
    }

    if (replacements > 0) {
      next.metadata.updatedAt = Date.now();
      const cmd: HistoryCommand<PenDocumentModel> = {
        id: generateId('cmd'),
        name: `Replace "${searchQuery}" with "${replaceWith}"`,
        execute: () => next,
        undo: () => prev,
        timestamp: Date.now(),
      };
      this.model = this.history.execute(this.model, cmd);
    }

    return replacements;
  }

  public undo(): boolean {
    if (!this.history.canUndo) return false;
    const res = this.history.undo(this.model);
    this.model = res.state;
    return true;
  }

  public redo(): boolean {
    if (!this.history.canRedo) return false;
    const res = this.history.redo(this.model);
    this.model = res.state;
    return true;
  }

  public getStats(): DocStats {
    let text = '';
    let paragraphCount = 0;
    let pageBreaks = 1;

    for (const section of this.model.sections) {
      for (const block of section.blocks) {
        if (block.type === 'page-break') pageBreaks++;
        if ('inlines' in block && Array.isArray(block.inlines)) {
          paragraphCount++;
          for (const inl of block.inlines) {
            text += inl.text + ' ';
          }
        }
      }
    }

    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = text.length;
    const charactersWithoutSpaces = text.replace(/\s+/g, '').length;
    const readingTimeMinutes = Math.ceil(words / 200);
    const estimatedPages = Math.max(pageBreaks, Math.ceil(words / 450));

    return {
      words,
      characters,
      charactersWithoutSpaces,
      paragraphs: paragraphCount,
      estimatedPages,
      readingTimeMinutes,
    };
  }

  public getOutline(): OutlineItem[] {
    const outline: OutlineItem[] = [];
    for (const section of this.model.sections) {
      for (const block of section.blocks) {
        if (block.type === 'heading') {
          const heading = block as HeadingBlock;
          const title = heading.inlines.map((i) => i.text).join('');
          outline.push({
            id: heading.id,
            level: heading.level,
            title,
          });
        }
      }
    }
    return outline;
  }
}
