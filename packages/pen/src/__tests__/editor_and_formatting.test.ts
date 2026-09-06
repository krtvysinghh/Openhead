import { describe, it, expect } from 'vitest';
import { PenDocument, PenEditorOperations } from '../index';

describe('Pen Editor & Inline Formatting Engine', () => {
  it('should split and merge inlines when applying partial formatting', () => {
    const inlines = [{ id: 'i1', text: 'Hello World! Welcome to Openhead.' }];
    // Bold "World" (index 6 to 11)
    const formatted = PenEditorOperations.formatInlineRange(inlines, 6, 11, { bold: true });
    expect(formatted.length).toBe(3);
    expect(formatted[0].text).toBe('Hello ');
    expect(formatted[0].styles?.bold).toBeFalsy();
    expect(formatted[1].text).toBe('World');
    expect(formatted[1].styles?.bold).toBe(true);
    expect(formatted[2].text).toBe('! Welcome to Openhead.');

    // Highlight "Welcome" (index 13 to 20 in original coordinate space)
    const highlighted = PenEditorOperations.formatInlineRange(formatted, 13, 20, { highlight: 'yellow' });
    expect(highlighted.some((i) => i.styles?.highlight === 'yellow')).toBe(true);
  });

  it('should insert and delete text ranges cleanly with style preservation', () => {
    const inlines = [
      { id: 'i1', text: 'First ' },
      { id: 'i2', text: 'Bold', styles: { bold: true } },
      { id: 'i3', text: ' Last' },
    ];
    // Insert "Very " inside Bold run at offset 6
    const inserted = PenEditorOperations.insertTextAt(inlines, 6, 'Very ', { bold: true });
    expect(PenEditorOperations.getPlainText(inserted)).toBe('First Very Bold Last');

    // Delete "Very "
    const deleted = PenEditorOperations.deleteRange(inserted, 6, 11);
    expect(PenEditorOperations.getPlainText(deleted)).toBe('First Bold Last');
  });

  it('should manage transactional undo/redo across paragraph mutations', () => {
    const doc = new PenDocument();
    expect(doc.canUndo).toBe(false);

    doc.setTitle('Q3 Operations Report');
    expect(doc.getModel().metadata.title).toBe('Q3 Operations Report');
    expect(doc.canUndo).toBe(true);

    doc.undo();
    expect(doc.getModel().metadata.title).toBe('Untitled Document');
    expect(doc.canRedo).toBe(true);

    doc.redo();
    expect(doc.getModel().metadata.title).toBe('Q3 Operations Report');
  });

  it('should indent and outdent list items', () => {
    const doc = new PenDocument();
    doc.insertBlock(0, 1, {
      id: 'list1',
      type: 'bullet-list-item',
      level: 0,
      inlines: [{ id: 'li1', text: 'Item 1' }],
    });

    doc.indentListItem(0, 1);
    expect((doc.getModel().sections[0].blocks[1] as any).level).toBe(1);

    doc.outdentListItem(0, 1);
    expect((doc.getModel().sections[0].blocks[1] as any).level).toBe(0);

    // Outdenting at level 0 turns into paragraph
    doc.outdentListItem(0, 1);
    expect(doc.getModel().sections[0].blocks[1].type).toBe('paragraph');
  });

  it('should insert, update, and mutate table rows and columns', () => {
    const doc = new PenDocument();
    doc.insertTable(0, 1, 2, 2);
    const table = doc.getModel().sections[0].blocks[1] as any;
    expect(table.type).toBe('table');
    expect(table.rows.length).toBe(2);
    expect(table.rows[0].length).toBe(2);

    doc.insertTableRow(0, 1);
    expect((doc.getModel().sections[0].blocks[1] as any).rows.length).toBe(3);

    doc.insertTableCol(0, 1);
    expect((doc.getModel().sections[0].blocks[1] as any).rows[0].length).toBe(3);

    doc.deleteTableRow(0, 1, 0);
    expect((doc.getModel().sections[0].blocks[1] as any).rows.length).toBe(2);

    doc.setTableCell(0, 1, 0, 0, 'Updated Cell', { bold: true }, { background: '#EFF6FF' });
    const cell = (doc.getModel().sections[0].blocks[1] as any).rows[0][0];
    expect(cell.inlines[0].text).toBe('Updated Cell');
    expect(cell.inlines[0].styles?.bold).toBe(true);
    expect(cell.background).toBe('#EFF6FF');
  });

  it('should create, update, and delete footnotes with correct indexing', () => {
    const doc = new PenDocument();
    const fnId = doc.insertFootnote(0, 0, 5, 'First reference source citation.');
    const sec = doc.getModel().sections[0];
    expect(sec.footnotes?.length).toBe(1);
    expect(sec.footnotes?.[0].id).toBe(fnId);
    expect(sec.footnotes?.[0].index).toBe(1);

    doc.deleteFootnote(0, fnId);
    expect(doc.getModel().sections[0].footnotes?.length).toBe(0);
  });

  it('should execute case-sensitive and whole-word search and replace with match counts', () => {
    const doc = new PenDocument();
    doc.insertBlock(0, 1, {
      id: 'p1',
      type: 'paragraph',
      inlines: [{ id: 'pi1', text: 'The Openhead engine powers Openhead word processor.' }],
    });

    const count = doc.searchAndReplace('Openhead', 'Pen', { wholeWord: true });
    expect(count).toBe(2);
    expect((doc.getModel().sections[0].blocks[1] as any).inlines[0].text).toBe('The Pen engine powers Pen word processor.');
  });
});
