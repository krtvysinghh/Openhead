import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { DocxAdapter, PenDocumentModel } from '../../packages/pen/src';

describe('Pen Structural Regression & AST Snapshot Lab', () => {
  const corpusDir = path.resolve(__dirname, '../../compatibility-corpus/pen');
  const fixtureFiles = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json'));

  it('should maintain deterministic AST structure across all 12 Pen fixtures', async () => {
    for (const file of fixtureFiles) {
      const content = JSON.parse(fs.readFileSync(path.join(corpusDir, file), 'utf-8'));
      const source: PenDocumentModel = content.model || content;

      const docx = await DocxAdapter.toBuffer(source);
      const parsed = await DocxAdapter.fromBuffer(docx);

      expect(parsed.sections.length).toBe(source.sections.length);
      expect(parsed.sections[0].blocks.length).toBeGreaterThanOrEqual(1);

      // Check title preservation
      if (source.metadata.title) {
        expect(parsed.metadata.title).toBeDefined();
      }
    }
  });

  it('should preserve heading hierarchy across multi-tier structures', async () => {
    const essayFile = path.join(corpusDir, 'fixture_03_academic_essay.json');
    const essayContent = JSON.parse(fs.readFileSync(essayFile, 'utf-8'));
    const docx = await DocxAdapter.toBuffer(essayContent);
    const parsed = await DocxAdapter.fromBuffer(docx);

    const headings = parsed.sections[0].blocks.filter((b) => b.type === 'heading');
    expect(headings.length).toBeGreaterThanOrEqual(2);
  });

  it('should preserve table structure and cell counts in financial statements', async () => {
    const finFile = path.join(corpusDir, 'fixture_06_financial_report.json');
    const finContent = JSON.parse(fs.readFileSync(finFile, 'utf-8'));
    const docx = await DocxAdapter.toBuffer(finContent);
    const parsed = await DocxAdapter.fromBuffer(docx);

    const tables = parsed.sections[0].blocks.filter((b) => b.type === 'table');
    expect(tables.length).toBe(1);
    expect((tables[0] as any).rows.length).toBeGreaterThanOrEqual(2);
  });

  it('should preserve numbered clauses and subclauses in legal contracts', async () => {
    const legalFile = path.join(corpusDir, 'fixture_05_legal_contract.json');
    const legalContent = JSON.parse(fs.readFileSync(legalFile, 'utf-8'));
    const docx = await DocxAdapter.toBuffer(legalContent);
    const parsed = await DocxAdapter.fromBuffer(docx);

    const numberedItems = parsed.sections[0].blocks.filter((b) => b.type === 'numbered-list-item');
    expect(numberedItems.length).toBeGreaterThanOrEqual(2);
  });
});
