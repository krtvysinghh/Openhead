import { describe, it, expect } from 'vitest';
import { PenDocument, PenEditorOperations } from '../index';

describe('Pen Table & Inline Selection Matrix Tests', () => {
  it('should format multiple overlapping inline segments consecutively', () => {
    const inlines = [{ id: 'i1', text: 'abcdefghij' }];
    // Bold 'cde' (index 2 to 5)
    let cur = PenEditorOperations.formatInlineRange(inlines, 2, 5, { bold: true });
    // Italic 'defg' (index 3 to 7)
    cur = PenEditorOperations.formatInlineRange(cur, 3, 7, { italic: true });

    expect(PenEditorOperations.getPlainText(cur)).toBe('abcdefghij');
    // Segment 'ab' -> plain
    expect(cur[0].text).toBe('ab');
    // Segment 'c' -> bold
    expect(cur[1].text).toBe('c');
    expect(cur[1].styles?.bold).toBe(true);
    expect(cur[1].styles?.italic).toBeFalsy();
    // Segment 'de' -> bold + italic
    expect(cur[2].text).toBe('de');
    expect(cur[2].styles?.bold).toBe(true);
    expect(cur[2].styles?.italic).toBe(true);
    // Segment 'fg' -> italic
    expect(cur[3].text).toBe('fg');
    expect(cur[3].styles?.bold).toBeFalsy();
    expect(cur[3].styles?.italic).toBe(true);
  });

  it('should insert and delete columns from arbitrary positions in table', () => {
    const doc = new PenDocument();
    doc.insertTable(0, 1, 3, 3);
    const tableBefore = doc.getModel().sections[0].blocks[1] as any;
    expect(tableBefore.rows[0].length).toBe(3);

    // Insert column at index 1
    doc.insertTableCol(0, 1, 1);
    const tableColInserted = doc.getModel().sections[0].blocks[1] as any;
    expect(tableColInserted.rows[0].length).toBe(4);

    // Delete column at index 1
    doc.deleteTableCol(0, 1, 1);
    const tableColDeleted = doc.getModel().sections[0].blocks[1] as any;
    expect(tableColDeleted.rows[0].length).toBe(3);
  });

  it('should handle deleting characters beyond text bounds safely', () => {
    const inlines = [{ id: 'i1', text: 'Small' }];
    const res = PenEditorOperations.deleteRange(inlines, 0, 100);
    expect(PenEditorOperations.getPlainText(res)).toBe('');
  });

  it('should support font family and font size formatting across selection', () => {
    const inlines = [{ id: 'i1', text: 'Standard Text Run' }];
    const styled = PenEditorOperations.formatInlineRange(inlines, 0, 8, {
      fontFamily: 'Times New Roman',
      fontSize: 16,
    });
    expect(styled[0].styles?.fontFamily).toBe('Times New Roman');
    expect(styled[0].styles?.fontSize).toBe(16);
    expect(styled[1].styles?.fontFamily).toBeUndefined();
  });

  it('should preserve inline links when modifying other styles', () => {
    const inlines = [
      { id: 'i1', text: 'Visit Openhead', styles: { link: 'https://openhead.dev' } },
    ];
    const bolded = PenEditorOperations.formatInlineRange(inlines, 0, 5, { bold: true });
    expect(bolded[0].styles?.link).toBe('https://openhead.dev');
    expect(bolded[0].styles?.bold).toBe(true);
    expect(bolded[1].styles?.link).toBe('https://openhead.dev');
    expect(bolded[1].styles?.bold).toBeFalsy();
  });
});
