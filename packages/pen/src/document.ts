import { generateId, HistoryStack, HistoryCommand } from '@openhead/core';
import {
  PenDocumentModel,
  Block,
  HeadingBlock,
  DocStats,
  OutlineItem,
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

    for (const section of this.model.sections) {
      for (const block of section.blocks) {
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

    return {
      words,
      characters,
      charactersWithoutSpaces,
      paragraphs: paragraphCount,
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
