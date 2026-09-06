import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { XlsxAdapter, WorkbookModel } from '@openhead/sum';

describe('Real-World Compatibility Corpus — 15 Fixtures XLSX Round-Trip', () => {
  const corpusDir = path.resolve(__dirname, '../../compatibility-corpus/sum');

  const findJsonFixtures = (dir: string): string[] => {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(findJsonFixtures(fullPath));
      } else if (file.endsWith('.json')) {
        results.push(fullPath);
      }
    }
    return results;
  };

  const fixtures = findJsonFixtures(corpusDir);

  it('should find at least 15 real-world compatibility fixtures', () => {
    expect(fixtures.length).toBeGreaterThanOrEqual(15);
  });

  for (const fixturePath of fixtures) {
    const basename = path.basename(fixturePath);

    it(`should successfully round-trip fixture: ${basename}`, async () => {
      const content = fs.readFileSync(fixturePath, 'utf8');
      const json = JSON.parse(content);
      const sourceModel: WorkbookModel = json.model || json;

      // 1. Sum -> XLSX buffer
      const xlsxBuffer = await XlsxAdapter.toBuffer(sourceModel);

      expect(xlsxBuffer).toBeInstanceOf(Uint8Array);
      expect(xlsxBuffer.length).toBeGreaterThan(100);

      // 2. XLSX buffer -> Sum model
      const importedModel = await XlsxAdapter.fromBuffer(xlsxBuffer);
      expect(importedModel.sheets.length).toBe(sourceModel.sheets.length);

      // 3. Compare sheet names and key cells
      for (let s = 0; s < sourceModel.sheets.length; s++) {
        const srcSheet = sourceModel.sheets[s];
        const impSheet = importedModel.sheets[s];
        expect(impSheet.name).toBe(srcSheet.name);

        for (const [cellKey, srcCell] of Object.entries(srcSheet.cells)) {
          const impCell = impSheet.cells[cellKey];
          expect(impCell).toBeDefined();
          if (typeof srcCell.raw === 'string' && srcCell.raw.startsWith('=')) {
            expect(impCell.raw).toBe(srcCell.raw);
          } else {
            expect(impCell.value).toEqual(srcCell.value);
          }
        }
      }

      // 4. Sum -> XLSX -> Sum second round trip (idempotency)
      const secondBuffer = await XlsxAdapter.toBuffer(importedModel);
      const secondImport = await XlsxAdapter.fromBuffer(secondBuffer);
      expect(secondImport.sheets.length).toBe(sourceModel.sheets.length);
    });
  }
});
