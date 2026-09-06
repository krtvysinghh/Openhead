import { describe, it, expect } from 'vitest';
import { PenDocument, exportToMarkdown, importFromMarkdown, DocxAdapter } from '@openhead/pen';
import { SumWorkbook, exportWorksheetToCsv, importCsvToWorksheet } from '@openhead/sum';
import fs from 'fs';
import path from 'path';

describe('Compatibility Corpus Round-Trip Test Lab', () => {
  it('should round-trip Pen table fixtures through DOCX WordprocessingML generation', () => {
    const fixturePath = path.resolve(__dirname, '../../compatibility-corpus/pen/tables/fixture_02_nested_data_table.json');
    const raw = fs.readFileSync(fixturePath, 'utf8');
    const model = JSON.parse(raw);

    const doc = new PenDocument(model);
    const xml = DocxAdapter.toWordprocessingML(doc.getModel());

    expect(xml).toContain('Consolidated Financial Performance');
    expect(xml).toContain('Research &amp; Development');
  });

  it('should round-trip Sum table fixtures through CSV export and import without data corruption', () => {
    const fixturePath = path.resolve(__dirname, '../../compatibility-corpus/sum/formulas/fixture_03_nested_financial_model.json');
    const raw = fs.readFileSync(fixturePath, 'utf8');
    const model = JSON.parse(raw);

    const wb = new SumWorkbook(model);
    const csv = exportWorksheetToCsv(wb.getActiveSheet());
    const restoredSheet = importCsvToWorksheet(csv, 'Restored');

    expect(restoredSheet.cells['A1'].value).toBe('Loan Amount');
    expect(restoredSheet.cells['B1'].value).toBe(500000);
    expect(restoredSheet.cells['A2'].value).toBe('Annual Rate');
    expect(restoredSheet.cells['B2'].value).toBe(0.065);
  });
});
