import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { DocxAdapter, PenDocumentModel } from '../../packages/pen/src';

describe('DOCX OOXML Package High-Fidelity Roundtrip Test Suite', () => {
  const corpusDir = path.resolve(__dirname, '../../compatibility-corpus/pen');
  const fixtureFiles = fs.existsSync(corpusDir)
    ? fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json'))
    : [];

  it('should find all 12 compatibility corpus fixtures in compatibility-corpus/pen', () => {
    expect(fixtureFiles.length).toBeGreaterThanOrEqual(12);
  });

  for (const filename of fixtureFiles) {
    it(`should successfully round-trip fixture: ${filename}`, async () => {
      const filePath = path.join(corpusDir, filename);
      const jsonContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const sourceModel: PenDocumentModel = jsonContent.model || jsonContent;

      // 1. Export PenDocumentModel to DOCX ZIP buffer
      const docxBuffer = await DocxAdapter.toBuffer(sourceModel);
      expect(docxBuffer).toBeDefined();
      expect(docxBuffer.length).toBeGreaterThan(500);

      // 2. Import DOCX ZIP buffer back into PenDocumentModel
      const importedModel = await DocxAdapter.fromBuffer(docxBuffer);
      expect(importedModel).toBeDefined();
      expect(importedModel.sections.length).toBeGreaterThanOrEqual(1);

      const srcSection = sourceModel.sections[0];
      const impSection = importedModel.sections[0];

      // Verify page settings
      expect(impSection.pageSettings.orientation).toBe(srcSection.pageSettings.orientation);

      // Verify block count
      expect(impSection.blocks.length).toBeGreaterThanOrEqual(srcSection.blocks.length);

      // Verify footnotes if present in source
      if (srcSection.footnotes && srcSection.footnotes.length > 0) {
        expect(impSection.footnotes?.length).toBe(srcSection.footnotes.length);
        expect(impSection.footnotes?.[0].text).toContain(srcSection.footnotes[0].text.trim());
      }
    });
  }

  it('should preserve rich formatting properties (bold, italic, colors, table backgrounds) through DOCX round-trip', async () => {
    const model: PenDocumentModel = {
      metadata: { id: 'doc_rich', title: 'Rich Doc', type: 'pen', createdAt: 0, updatedAt: 0, version: 1 },
      sections: [
        {
          id: 'sec_rich',
          pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1, headerText: 'Corporate Header', footerText: 'Page' },
          blocks: [
            {
              id: 'b1',
              type: 'heading',
              level: 1,
              inlines: [{ id: 'i1', text: 'Financial Analysis', styles: { bold: true, color: '#1E3A8A' } }],
            },
            {
              id: 'b2',
              type: 'paragraph',
              inlines: [
                { id: 'i2', text: 'This text is bold and italic. ', styles: { bold: true, italic: true } },
                { id: 'i3', text: 'Superscript 2', styles: { superscript: true } },
              ],
            },
            {
              id: 'b3',
              type: 'table',
              rows: [
                [
                  { id: 'c1', inlines: [{ id: 'ci1', text: 'Header Cell' }], background: '#1E293B', gridSpan: 2 },
                  { id: 'c2', inlines: [{ id: 'ci2', text: 'Value' }] },
                ],
              ],
            },
          ],
          footnotes: [
            { id: 'fn_1', index: 1, text: 'Financial auditing standard 2026.', inlines: [{ id: 'fi1', text: 'Financial auditing standard 2026.' }] },
          ],
        },
      ],
    };

    const buffer = await DocxAdapter.toBuffer(model);
    const imported = await DocxAdapter.fromBuffer(buffer);

    const heading = imported.sections[0].blocks[0] as any;
    expect(heading.type).toBe('heading');
    expect(heading.level).toBe(1);

    const para = imported.sections[0].blocks[1] as any;
    expect(para.type).toBe('paragraph');
    expect(para.inlines[0].styles?.bold).toBe(true);
    expect(para.inlines[0].styles?.italic).toBe(true);

    const table = imported.sections[0].blocks[2] as any;
    expect(table.type).toBe('table');
    expect(table.rows[0][0].background).toBe('#1E293B');
    expect(table.rows[0][0].gridSpan).toBe(2);

    expect(imported.sections[0].pageSettings.headerText).toBe('Corporate Header');
    expect(imported.sections[0].footnotes?.[0].text).toContain('Financial auditing standard 2026.');
  });
});
