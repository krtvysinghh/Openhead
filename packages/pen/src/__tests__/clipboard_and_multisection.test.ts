import { describe, it, expect } from 'vitest';
import { PenDocument, PenDocumentModel, DocxAdapter } from '../index';
import { generateId } from '@openhead/core';

describe('Pen Multi-Section & Document Structure Testing', () => {
  it('should support multiple sections with distinct page settings', () => {
    const doc = new PenDocument();
    const model = doc.getModel();
    model.sections.push({
      id: generateId('sec'),
      pageSettings: {
        orientation: 'landscape',
        pageSize: 'Legal',
        margins: { top: 15, bottom: 15, left: 15, right: 15 },
        columns: 2,
        headerText: 'Section 2 Header',
        footerText: 'Section 2 Footer',
      },
      blocks: [
        {
          id: generateId('blk'),
          type: 'heading',
          level: 2,
          inlines: [{ id: generateId('inl'), text: 'Section 2 Overview' }],
        },
      ],
    });

    expect(model.sections.length).toBe(2);
    expect(model.sections[0].pageSettings.orientation).toBe('portrait');
    expect(model.sections[1].pageSettings.orientation).toBe('landscape');
    expect(model.sections[1].pageSettings.columns).toBe(2);
  });

  it('should support moving blocks within a section with undo tracking', () => {
    const doc = new PenDocument();
    doc.insertBlock(0, 1, {
      id: 'b1',
      type: 'paragraph',
      inlines: [{ id: 'i1', text: 'Paragraph One' }],
    });
    doc.insertBlock(0, 2, {
      id: 'b2',
      type: 'paragraph',
      inlines: [{ id: 'i2', text: 'Paragraph Two' }],
    });

    doc.moveBlock(0, 1, 2);
    const sec = doc.getModel().sections[0];
    expect((sec.blocks[2] as any).inlines[0].text).toBe('Paragraph One');

    doc.undo();
    const secUndone = doc.getModel().sections[0];
    expect((secUndone.blocks[1] as any).inlines[0].text).toBe('Paragraph One');
  });

  it('should round-trip complex tables with merged cells and custom fills to DOCX', async () => {
    const model: PenDocumentModel = {
      metadata: { id: 'doc_tbl', title: 'Table Doc', type: 'pen', createdAt: 0, updatedAt: 0, version: 1 },
      sections: [
        {
          id: 'sec1',
          pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 20, bottom: 20, left: 20, right: 20 }, columns: 1 },
          blocks: [
            {
              id: 't1',
              type: 'table',
              rows: [
                [
                  { id: 'c1', inlines: [{ id: 'i1', text: 'Spanned Header' }], gridSpan: 3, background: '#0F172A' },
                ],
                [
                  { id: 'c2', inlines: [{ id: 'i2', text: 'Col 1' }] },
                  { id: 'c3', inlines: [{ id: 'i3', text: 'Col 2' }] },
                  { id: 'c4', inlines: [{ id: 'i4', text: 'Col 3' }] },
                ],
              ],
            },
          ],
        },
      ],
    };

    const buf = await DocxAdapter.toBuffer(model);
    const imported = await DocxAdapter.fromBuffer(buf);
    const table = imported.sections[0].blocks[0] as any;
    expect(table.type).toBe('table');
    expect(table.rows[0][0].gridSpan).toBe(3);
    expect(table.rows[0][0].background).toBe('#0F172A');
  });
});
