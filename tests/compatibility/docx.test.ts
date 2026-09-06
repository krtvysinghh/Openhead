import { describe, it, expect } from 'vitest';
import { PenDocument, DocxAdapter } from '@openhead/pen';

describe('Office Compatibility Lab - DOCX (WordprocessingML)', () => {
  it('should export valid WordprocessingML with paragraphs, headings, and character styles', () => {
    const doc = new PenDocument();
    doc.setTitle('Quarterly Executive Briefing');
    doc.insertBlock(0, 1, {
      id: 'p1',
      type: 'paragraph',
      inlines: [
        { id: 'i1', text: 'Confidential Strategy Document: ', styles: { bold: true } },
        { id: 'i2', text: 'For Internal Distribution Only', styles: { italic: true } },
      ],
    });

    const xml = DocxAdapter.toWordprocessingML(doc.getModel());

    // Schema validation assertions
    expect(xml).toContain('xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"');
    expect(xml).toContain('<w:pStyle w:val="Heading1"/>');
    expect(xml).toContain('<w:b/>');
    expect(xml).toContain('<w:i/>');
    expect(xml).toContain('Confidential Strategy Document:');
  });
});
