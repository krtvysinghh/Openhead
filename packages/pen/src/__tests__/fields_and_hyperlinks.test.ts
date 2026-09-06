import { describe, it, expect } from 'vitest';
import { PenDocument, DocxAdapter, PenDocumentModel } from '../index';

describe('Pen Dynamic Fields, Hyperlinks and Footnotes', () => {
  it('should serialize and parse dynamic PAGE and NUMPAGES fields', async () => {
    const model: PenDocumentModel = {
      metadata: { id: 'doc_fields', title: 'Fields Test', type: 'pen', createdAt: 0, updatedAt: 0, version: 1 },
      sections: [
        {
          id: 'sec_1',
          pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1 },
          blocks: [
            {
              id: 'b1',
              type: 'paragraph',
              inlines: [
                { id: 'i1', text: 'Page number: ' },
                { id: 'i2', text: '1', styles: { field: { type: 'PAGE' } } },
                { id: 'i3', text: ' of ' },
                { id: 'i4', text: '5', styles: { field: { type: 'NUMPAGES' } } },
              ],
            },
          ],
        },
      ],
    };

    const buffer = await DocxAdapter.toBuffer(model);
    const imported = await DocxAdapter.fromBuffer(buffer);
    const para = imported.sections[0].blocks[0] as any;
    expect(para.type).toBe('paragraph');
    expect(para.inlines.some((inl: any) => inl.styles?.field?.type === 'PAGE')).toBe(true);
  });

  it('should serialize and parse safe external hyperlinks and reject unsafe ones', async () => {
    const model: PenDocumentModel = {
      metadata: { id: 'doc_links', title: 'Links Test', type: 'pen', createdAt: 0, updatedAt: 0, version: 1 },
      sections: [
        {
          id: 'sec_1',
          pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1 },
          blocks: [
            {
              id: 'b1',
              type: 'paragraph',
              inlines: [
                { id: 'i1', text: 'Visit Openhead website', styles: { link: 'https://openhead.dev' } },
                { id: 'i2', text: ' or contact support', styles: { link: 'mailto:support@openhead.dev' } },
              ],
            },
          ],
        },
      ],
    };

    const buffer = await DocxAdapter.toBuffer(model);
    const imported = await DocxAdapter.fromBuffer(buffer);
    const para = imported.sections[0].blocks[0] as any;
    expect(para.inlines[0].styles?.link).toBe('https://openhead.dev');
    expect(para.inlines[1].styles?.link).toBe('mailto:support@openhead.dev');
  });

  it('should support multiple footnotes with continuous automatic numbering', () => {
    const doc = new PenDocument();
    const fn1 = doc.insertFootnote(0, 0, 0, 'First footnote reference.');
    const fn2 = doc.insertFootnote(0, 0, 10, 'Second footnote citation.');

    const sec = doc.getModel().sections[0];
    expect(sec.footnotes?.length).toBe(2);
    expect(sec.footnotes?.[0].index).toBe(1);
    expect(sec.footnotes?.[1].index).toBe(2);

    doc.deleteFootnote(0, fn1);
    const updatedSec = doc.getModel().sections[0];
    expect(updatedSec.footnotes?.length).toBe(1);
    expect(updatedSec.footnotes?.[0].id).toBe(fn2);
    expect(updatedSec.footnotes?.[0].index).toBe(1); // Re-indexed
  });
});
