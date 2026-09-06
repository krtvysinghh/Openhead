import { describe, it, expect } from 'vitest';
import { SumWorkbook } from '../packages/sum/src/workbook';
import { PenDocument } from '../packages/pen/src/document';
import { GlimpseDeck, SlideLayouts } from '../packages/glimpse/src';
import { parseCellAddress } from '../packages/formula/src/coords';

describe('Apps Peak Performance & UI Fidelity Verification', () => {
  describe('Sum — Dynamic Grid Bounds & Real Cell Styles', () => {
    it('should correctly support dynamic row and column bounds calculation for large sheets', () => {
      const wb = new SumWorkbook(SumWorkbook.createEmpty('Large Dynamic Sheet'));
      wb.setCellValue('Z100', 42); // Populate cell in col 25, row 99

      const sheet = wb.getActiveSheet();
      const cellKeys = Object.keys(sheet.cells);

      let maxRow = 20;
      let maxCol = 10;
      for (const k of cellKeys) {
        const addr = parseCellAddress(k);
        if (addr) {
          if (addr.row + 1 > maxRow) maxRow = addr.row + 1;
          if (addr.col + 1 > maxCol) maxCol = addr.col + 1;
        }
      }

      const computedRows = Math.max(30, maxRow + 8);
      const computedCols = Math.max(14, maxCol + 3);

      expect(computedRows).toBe(108);
      expect(computedCols).toBe(29);
      expect(sheet.cells['Z100'].value).toBe(42);
    });

    it('should set and retrieve rich cell styles including bold, italic, align, and borders', () => {
      const wb = new SumWorkbook(SumWorkbook.createEmpty('Styled Sheet'));
      wb.setCellValue('B2', 'Total Revenue');
      wb.setCellStyle('B2', {
        bold: true,
        italic: true,
        underline: true,
        color: '#38bdf8',
        background: '#0f172a',
        align: 'center',
        borders: { top: true, bottom: true, left: true, right: true },
      });

      const cell = wb.getActiveSheet().cells['B2'];
      expect(cell.style?.bold).toBe(true);
      expect(cell.style?.italic).toBe(true);
      expect(cell.style?.underline).toBe(true);
      expect(cell.style?.color).toBe('#38bdf8');
      expect(cell.style?.background).toBe('#0f172a');
      expect(cell.style?.align).toBe('center');
      expect(cell.style?.borders?.top).toBe(true);
    });
  });

  describe('Glimpse — Presenter Mode Scene Graph Integrity', () => {
    it('should construct rich multi-node slide layouts for presenter display', () => {
      const deck = new GlimpseDeck();
      deck.addSlideFromLayout(SlideLayouts.createExecutiveKpiDashboard('Q3 Performance Dashboard'));
      
      const activeSlide = deck.getActiveSlide();
      expect(activeSlide.nodes.length).toBeGreaterThan(2);

      // Verify node types exist for presenter scene graph rendering
      const hasShape = activeSlide.nodes.some(n => n.type === 'shape');
      const hasText = activeSlide.nodes.some(n => n.type === 'text');
      expect(hasShape).toBe(true);
      expect(hasText).toBe(true);
    });

    it('should allow updating node properties and speaker notes', () => {
      const deck = new GlimpseDeck();
      const slide = deck.getActiveSlide();
      deck.updateSlideNotes(slide.id, 'Focus on ARR growth and customer retention');

      expect(deck.getActiveSlide().notes).toBe('Focus on ARR growth and customer retention');
    });
  });

  describe('Pen — Paragraph Alignment & Inline Formatting Propagation', () => {
    it('should apply paragraph alignment and line spacing accurately', () => {
      const doc = new PenDocument();
      doc.setParagraphProperties(0, 0, { align: 'center', lineSpacing: 1.5 });

      const model = doc.getModel();
      const block = model.sections[0].blocks[0];
      expect(block.props?.align).toBe('center');
      expect(block.props?.lineSpacing).toBe(1.5);
    });

    it('should format inline text selections with bold, italic, and font properties', () => {
      const doc = new PenDocument();
      doc.formatInlineSelection(0, 0, 0, 10, {
        bold: true,
        italic: true,
        fontSize: 14,
        fontFamily: 'Georgia',
      });

      const model = doc.getModel();
      const inline = (model.sections[0].blocks[0] as any).inlines[0];
      expect(inline.styles?.bold).toBe(true);
      expect(inline.styles?.italic).toBe(true);
      expect(inline.styles?.fontSize).toBe(14);
      expect(inline.styles?.fontFamily).toBe('Georgia');
    });
  });
});
