import { describe, it, expect } from 'vitest';
import { OfficeTemplateLibrary } from '../packages/core/src/templates';
import { PenDocument } from '../packages/pen/src/document';
import { SumWorkbook } from '../packages/sum/src/workbook';
import { GlimpseDeck } from '../packages/glimpse/src/deck';

describe('Office Template Library & MS Office Feature Parity', () => {
  describe('Massive Office Template Library', () => {
    it('provides rich templates for Pen, Sum, and Glimpse', () => {
      const penTemplates = OfficeTemplateLibrary.getPenTemplates();
      const sumTemplates = OfficeTemplateLibrary.getSumTemplates();
      const glimpseTemplates = OfficeTemplateLibrary.getGlimpseTemplates();
      const allTemplates = OfficeTemplateLibrary.getAllTemplates();

      expect(penTemplates.length).toBeGreaterThanOrEqual(4);
      expect(sumTemplates.length).toBeGreaterThanOrEqual(4);
      expect(glimpseTemplates.length).toBeGreaterThanOrEqual(4);
      expect(allTemplates.length).toBe(penTemplates.length + sumTemplates.length + glimpseTemplates.length);
    });

    it('creates valid models for every template in the library', () => {
      const allTemplates = OfficeTemplateLibrary.getAllTemplates();

      for (const tpl of allTemplates) {
        expect(tpl.id).toBeTruthy();
        expect(tpl.title).toBeTruthy();
        expect(tpl.description).toBeTruthy();
        expect(tpl.category).toBeTruthy();
        expect(Array.isArray(tpl.tags)).toBe(true);

        const model = tpl.createModel();
        expect(model).toBeDefined();
        expect(model.metadata).toBeDefined();
        expect(model.metadata.type).toBe(tpl.product);

        if (tpl.product === 'pen') {
          expect(Array.isArray(model.sections)).toBe(true);
          expect(model.sections.length).toBeGreaterThanOrEqual(1);
          expect(model.sections[0].blocks.length).toBeGreaterThanOrEqual(1);
        } else if (tpl.product === 'sum') {
          expect(Array.isArray(model.sheets)).toBe(true);
          expect(model.sheets.length).toBeGreaterThanOrEqual(1);
          expect(model.sheets[0].cells).toBeDefined();
        } else if (tpl.product === 'glimpse') {
          expect(Array.isArray(model.slides)).toBe(true);
          expect(model.slides.length).toBeGreaterThanOrEqual(1);
          expect(model.slides[0].nodes.length).toBeGreaterThanOrEqual(1);
        }
      }
    });
  });

  describe('Pen Word Processing Deep Parity', () => {
    it('inserts image blocks and tracks dimensions and captions', () => {
      const doc = new PenDocument();
      const imgBlock = doc.addImage('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'Chart figure 1', 800, 600);

      expect(imgBlock.type).toBe('image');
      expect(imgBlock.url).toContain('data:image/png;base64');
      expect(imgBlock.caption).toBe('Chart figure 1');
      expect(imgBlock.width).toBe(800);
      expect(imgBlock.height).toBe(600);

      const model = doc.getModel();
      expect(model.sections[0].blocks.some((b) => b.type === 'image')).toBe(true);
    });

    it('sets and updates document watermarks', () => {
      const doc = new PenDocument();
      doc.setWatermark('CONFIDENTIAL');

      expect(doc.getModel().sections[0].pageSettings.watermark).toBe('CONFIDENTIAL');

      doc.setWatermark('TOP SECRET', 0, '#FF0000');
      expect(doc.getModel().sections[0].pageSettings.watermark).toBe('TOP SECRET');
      expect(doc.getModel().sections[0].pageSettings.watermarkColor).toBe('#FF0000');

      doc.setWatermark(undefined);
      expect(doc.getModel().sections[0].pageSettings.watermark).toBeUndefined();
    });

    it('configures multi-column sections and computes reading stats', () => {
      const doc = new PenDocument();
      doc.setPageSettings(0, { columns: 3 });
      expect(doc.getModel().sections[0].pageSettings.columns).toBe(3);

      doc.addParagraph('Openhead sovereign office engine delivers private document productivity without telemetry.');
      const stats = doc.getStats();
      expect(stats.words).toBeGreaterThan(5);
      expect(stats.paragraphs).toBeGreaterThanOrEqual(1);
      expect(stats.readingTimeMinutes).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Sum Spreadsheet Deep Parity', () => {
    it('executes Goal Seek to solve target formula values', () => {
      const wb = new SumWorkbook();
      // Set A1 as unit price, A2 as quantity, A3 as =A1*A2
      wb.setCellValue('A1', 25);
      wb.setCellValue('A2', 10);
      wb.setCellValue('A3', '=A1*A2');

      expect(wb.getCellValue('A3')).toBe(250);

      // Solve for A3 = 1000 by changing A2
      const result = wb.goalSeek('A3', 1000, 'A2');
      expect(result.success).toBe(true);
      expect(Number(wb.getCellValue('A2'))).toBeCloseTo(40, 1);
      expect(Number(wb.getCellValue('A3'))).toBeCloseTo(1000, 1);
    });

    it('splits delimited text across columns using Text-to-Columns', () => {
      const wb = new SumWorkbook();
      wb.setCellValue('A1', 'Alice,30,Engineer,San Francisco');
      wb.setCellValue('A2', 'Bob,25,Designer,New York');

      wb.textToColumns('A1:A2', ',');

      expect(wb.getCellValue('A1')).toBe('Alice');
      expect(wb.getCellValue('B1')).toBe(30);
      expect(wb.getCellValue('C1')).toBe('Engineer');
      expect(wb.getCellValue('D1')).toBe('San Francisco');

      expect(wb.getCellValue('A2')).toBe('Bob');
      expect(wb.getCellValue('B2')).toBe(25);
      expect(wb.getCellValue('C2')).toBe('Designer');
      expect(wb.getCellValue('D2')).toBe('New York');
    });

    it('deduplicates rows in a range using Remove Duplicates', () => {
      const wb = new SumWorkbook();
      wb.setCellValue('A1', 'Product A');
      wb.setCellValue('B1', 100);

      wb.setCellValue('A2', 'Product B');
      wb.setCellValue('B2', 200);

      wb.setCellValue('A3', 'Product A');
      wb.setCellValue('B3', 100);

      const removed = wb.removeDuplicates('A1:B3', [0, 1]);
      expect(removed).toBe(1);
      expect(wb.getCellValue('A1')).toBe('Product A');
      expect(wb.getCellValue('A2')).toBe('Product B');
      expect(wb.getCellValue('A3')).toBeUndefined();
    });

    it('quick freezes top row and first column', () => {
      const wb = new SumWorkbook();
      wb.freezeTopRow();
      expect(wb.getActiveSheet().freezePanes).toEqual({ rows: 1, cols: 0, topLeftCell: undefined });

      wb.freezeFirstColumn();
      expect(wb.getActiveSheet().freezePanes).toEqual({ rows: 0, cols: 1, topLeftCell: undefined });
    });
  });

  describe('Glimpse Presentation Deep Parity', () => {
    it('inserts image nodes into slides with positioning and dimensions', () => {
      const deck = new GlimpseDeck();
      const node = deck.addImageNode('data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=', {
        x: 100,
        y: 100,
        width: 800,
        height: 600,
        alt: 'Architecture Diagram',
      });

      expect(node.type).toBe('image');
      expect(node.src).toContain('data:image/svg+xml');
      expect(node.width).toBe(800);
      expect(node.height).toBe(600);
      expect(node.alt).toBe('Architecture Diagram');

      const slide = deck.getActiveSlide();
      expect(slide.nodes.some((n) => n.id === node.id)).toBe(true);
    });

    it('switches dimensions and aspect ratios (16:9 vs 4:3)', () => {
      const deck = new GlimpseDeck();
      deck.setDimensions(1024, 768, '4:3');

      expect(deck.getModel().dimensions.width).toBe(1024);
      expect(deck.getModel().dimensions.height).toBe(768);
      expect(deck.getModel().dimensions.aspectRatio).toBe('4:3');

      deck.setDimensions(1920, 1080, '16:9');
      expect(deck.getModel().dimensions.aspectRatio).toBe('16:9');
    });

    it('duplicates slides and toggles slide visibility', () => {
      const deck = new GlimpseDeck();
      const originalSlideId = deck.getActiveSlide().id;

      const duplicate = deck.duplicateSlide(originalSlideId);
      expect(duplicate).toBeDefined();
      expect(deck.getModel().slides.length).toBe(2);

      deck.toggleSlideHidden(duplicate!.id);
      expect(deck.getModel().slides[1].hidden).toBe(true);

      deck.toggleSlideHidden(duplicate!.id);
      expect(deck.getModel().slides[1].hidden).toBe(false);
    });
  });
});
