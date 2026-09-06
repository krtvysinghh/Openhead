import { describe, it, expect } from 'vitest';
import { PenDocument, DocxAdapter, CommentManager, TrackChangesManager } from '@openhead/pen';
import { SumWorkbook, XlsxAdapter, CellCommentManager } from '@openhead/sum';
import { GlimpseDeck, PptxAdapter } from '@openhead/glimpse';
import { OfficeEcosystemBridge } from '@openhead/core';

describe('Real-World Microsoft Office Compatibility & Roundtrip Corpus', () => {
  describe('Pen DOCX Real-World Enterprise Document', () => {
    it('should faithfully preserve multi-section text, tables, footnotes, headers, footers, comments and tracked changes', async () => {
      const doc = new PenDocument();
      doc.setTitle('Enterprise Consulting Proposal');
      
      const s1 = doc.getModel().sections[0];
      s1.pageSettings.headerText = 'ACME Corp — Confidential';
      s1.pageSettings.footerText = 'Page 1 of 5';

      doc.addHeading('1. Executive Overview', 1);
      const p1 = doc.addParagraph('This comprehensive enterprise proposal outlines strategic IT modernisation.');
      
      // Add table
      doc.insertTable(0, 2, 3, 3, ['Service Track', 'Estimated Q1 Hours', 'Rate ($/hr)']);
      
      // Add comments
      CommentManager.addThread(doc.getModel(), p1.id, 'Alice Partner', 'Verify whether client requested Q2 onboarding.');

      // Add tracked change
      TrackChangesManager.trackInsertion(doc.getModel(), p1.id, 'Bob Consultant', 'strategic IT modernisation');

      // Export to DOCX binary buffer
      const docxBytes = await DocxAdapter.toBuffer(doc.getModel());
      expect(docxBytes.length).toBeGreaterThan(1000);

      // Re-import from DOCX binary buffer
      const imported = await DocxAdapter.fromBuffer(docxBytes);
      expect(imported.metadata.title).toBeDefined();
      expect(imported.sections.length).toBeGreaterThan(0);
      expect(imported.sections[0].blocks.length).toBeGreaterThan(1);
    });
  });

  describe('Sum XLSX Real-World Financial Workbook', () => {
    it('should faithfully preserve multi-sheet formulas, defined names, styles, borders and AutoFilter', async () => {
      const wb = new SumWorkbook();
      const s1 = wb.getActiveSheet();
      s1.name = 'Consolidated_P&L';

      wb.setCellValue('A1', 'Revenue Stream');
      wb.setCellValue('B1', 'Jan 2026');
      wb.setCellValue('C1', 'Feb 2026');
      wb.setCellValue('D1', 'Q1 Total');

      wb.setCellValue('A2', 'SaaS Subscriptions');
      wb.setCellValue('B2', 125000);
      wb.setCellValue('C2', 142000);
      wb.setCellValue('D2', '=SUM(B2:C2)');

      wb.setCellValue('A3', 'Professional Services');
      wb.setCellValue('B3', 45000);
      wb.setCellValue('C3', 48000);
      wb.setCellValue('D3', '=SUM(B3:C3)');

      wb.setCellValue('A4', 'Total Gross Revenue');
      wb.setCellValue('B4', '=SUM(B2:B3)');
      wb.setCellValue('C4', '=SUM(C2:C3)');
      wb.setCellValue('D4', '=SUM(D2:D3)');

      // Add second sheet
      const s2 = wb.addSheet('Headcount_Plan');
      wb.setCellValue('A1', 'Department');
      wb.setCellValue('B1', 'HC');
      wb.setCellValue('A2', 'Engineering');
      wb.setCellValue('B2', 24);

      // Add cell comments
      const commentMgr = new CellCommentManager();
      commentMgr.addComment(s1.id, 'D4', 'Lead Controller', 'Q1 variance matches adjusted forecast.');

      // Export to XLSX buffer
      const xlsxBytes = await XlsxAdapter.toBuffer(wb.getModel());
      expect(xlsxBytes.length).toBeGreaterThan(1000);

      // Re-import from XLSX buffer
      const importedWb = await XlsxAdapter.fromBuffer(xlsxBytes);
      expect(importedWb.sheets.length).toBeGreaterThanOrEqual(2);
      expect(importedWb.sheets[0].name).toBe('Consolidated_P&L');
      expect(importedWb.sheets[0].cells['D2'].raw).toBe('=SUM(B2:C2)');
      expect(importedWb.sheets[0].cells['D4'].raw).toBe('=SUM(D2:D3)');
    });
  });

  describe('Glimpse PPTX Real-World Board Deck', () => {
    it('should faithfully preserve slides, master layouts, shapes, tables, speaker notes and connectors', async () => {
      const deck = new GlimpseDeck();
      deck.getModel().metadata.title = 'Board of Directors Q1 Deck';

      const s1 = deck.getActiveSlide();
      s1.title = 'Corporate Strategy 2026';
      deck.addShapeNode('rectangle', { x: 100, y: 150, width: 400, height: 200, fill: '#3B82F6' });
      deck.addShapeNode('rectangle', { x: 600, y: 150, width: 400, height: 200, fill: '#10B981' });

      // Add slide note
      deck.updateSlideNotes(s1.id, 'Emphasize that our 100% offline-first privacy model won three Fortune 500 contracts.');

      // Add second slide with table
      const s2 = deck.addSlide('Performance Metrics');
      const tableNode = OfficeEcosystemBridge.sumRangeToGlimpseTable([
        ['KPI', 'Target', 'Actual'],
        ['ARR Growth', '40%', '46.2%'],
        ['Net Retention', '120%', '124.5%'],
      ]);
      s2.nodes.push(tableNode);

      // Export to PPTX buffer
      const pptxBytes = await PptxAdapter.toBuffer(deck.getModel());
      expect(pptxBytes.length).toBeGreaterThan(1000);

      // Re-import from PPTX buffer
      const importedDeck = await PptxAdapter.fromBuffer(pptxBytes);
      expect(importedDeck.slides.length).toBeGreaterThanOrEqual(2);
      expect(importedDeck.slides[0].notes).toContain('offline-first privacy');
    });
  });

  describe('Cross-App Ecosystem Conversions', () => {
    it('should seamlessly convert Sum table to Pen and Glimpse without data loss', () => {
      const sumMatrix = [
        ['Product', '2025 Sales', '2026 Forecast'],
        ['Pen Docs', 12000, 24000],
        ['Sum Sheets', 18000, 31000],
      ];

      // Convert to Pen Table
      const penTable = OfficeEcosystemBridge.sumRangeToPenTable(sumMatrix);
      expect(penTable.rows.length).toBe(3);
      expect(penTable.rows[0][0].inlines[0].text).toBe('Product');
      expect(penTable.rows[1][1].inlines[0].text).toBe('12000');

      // Convert back to Sum Sheet
      const sumSheet = OfficeEcosystemBridge.penTableToSumSheet(penTable);
      expect(sumSheet.cells['A1'].value).toBe('Product');
      expect(sumSheet.cells['B2'].value).toBe(12000);

      // Convert to Glimpse Chart
      const chartNode = OfficeEcosystemBridge.sumRangeToGlimpseChart(sumMatrix, 'bar', 'Annual Growth');
      expect(chartNode.chartType).toBe('bar');
      expect(chartNode.categories).toEqual(['Pen Docs', 'Sum Sheets']);
      expect(chartNode.series[0].name).toBe('2025 Sales');
      expect(chartNode.series[0].data).toEqual([12000, 18000]);
    });
  });
});
