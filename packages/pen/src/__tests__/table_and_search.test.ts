import { describe, it, expect } from 'vitest';
import { PenDocument } from '../document';
import { TableBlock } from '../types';

describe('PenDocument - Table Operations & Search/Replace', () => {
  it('should insert, modify, and delete table rows with history tracking', () => {
    const doc = new PenDocument();
    const tableBlock: TableBlock = {
      id: 'tbl_1',
      type: 'table',
      headers: ['Feature', 'Status'],
      rows: [
        [
          { id: 'c1', inlines: [{ id: 'i1', text: 'Parser' }] },
          { id: 'c2', inlines: [{ id: 'i2', text: 'Done' }] },
        ],
      ],
    };

    doc.insertBlock(0, 1, tableBlock);
    expect(doc.getModel().sections[0].blocks.length).toBe(3);

    // Insert row
    doc.insertTableRow(0, 1, 1);
    const tableAfter = doc.getModel().sections[0].blocks[1] as TableBlock;
    expect(tableAfter.rows.length).toBe(2);

    // Undo insertion
    doc.undo();
    const tableUndone = doc.getModel().sections[0].blocks[1] as TableBlock;
    expect(tableUndone.rows.length).toBe(1);
  });

  it('should search and replace text across document blocks with undo support', () => {
    const doc = new PenDocument();
    doc.insertBlock(0, 1, {
      id: 'blk_p',
      type: 'paragraph',
      inlines: [{ id: 'inl_p', text: 'Openhead is fast. Openhead is secure.' }],
    });

    const count = doc.searchAndReplace('Openhead', 'Openhead Suite');
    expect(count).toBe(2);

    const textAfter = (doc.getModel().sections[0].blocks[1] as any).inlines[0].text;
    expect(textAfter).toBe('Openhead Suite is fast. Openhead Suite is secure.');

    // Undo search & replace
    doc.undo();
    const textUndone = (doc.getModel().sections[0].blocks[1] as any).inlines[0].text;
    expect(textUndone).toBe('Openhead is fast. Openhead is secure.');
  });
});
