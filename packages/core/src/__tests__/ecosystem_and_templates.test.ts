import { describe, it, expect } from 'vitest';
import { OfficeEcosystemBridge } from '../ecosystem';
import { OfficeTemplateLibrary } from '../templates';
import { PdfExportEngine } from '../pdf';
import { TableBlock, PenDocumentModel } from '@openhead/pen';

describe('Office Ecosystem Bridge, Templates & PDF Export (Chunk 2)', () => {
  it('should convert Pen table block into structured Sum worksheet', () => {
    const penTable: TableBlock = {
      id: 'tbl_1',
      type: 'table',
      headers: ['Item', 'Quantity', 'Price'],
      rows: [
        [
          { id: 'c1', inlines: [{ id: 'i1', text: 'Widgets' }] },
          { id: 'c2', inlines: [{ id: 'i2', text: '10' }] },
          { id: 'c3', inlines: [{ id: 'i3', text: '49.99' }] },
        ],
      ],
    };

    const sheet = OfficeEcosystemBridge.penTableToSumSheet(penTable, 'PenImport');
    expect(sheet.name).toBe('PenImport');
    expect(sheet.cells['A1'].value).toBe('Item');
    expect(sheet.cells['B1'].value).toBe('Quantity');
    expect(sheet.cells['C1'].value).toBe('Price');
    expect(sheet.cells['A2'].value).toBe('Widgets');
    expect(sheet.cells['B2'].value).toBe(10);
    expect(sheet.cells['C2'].value).toBe(49.99);
  });

  it('should convert Sum matrix into Pen table, Glimpse table, and Glimpse chart', () => {
    const matrix = [
      ['Region', 'Q1 Sales', 'Q2 Sales'],
      ['North', 15000, 18000],
      ['South', 22000, 24000],
    ];

    // Pen Table
    const penTable = OfficeEcosystemBridge.sumRangeToPenTable(matrix, true);
    expect(penTable.type).toBe('table');
    expect(penTable.rows.length).toBe(3);
    expect(penTable.rows[0][0].inlines[0].text).toBe('Region');
    expect(penTable.rows[1][1].inlines[0].text).toBe('15000');

    // Glimpse Table
    const glimpseTable = OfficeEcosystemBridge.sumRangeToGlimpseTable(matrix);
    expect(glimpseTable.type).toBe('table');
    expect(glimpseTable.rows).toBe(3);
    expect(glimpseTable.columns).toBe(3);
    expect(glimpseTable.cells[0][0].text).toBe('Region');

    // Glimpse Chart
    const chart = OfficeEcosystemBridge.sumRangeToGlimpseChart(
      ['North', 'South'],
      [
        { name: 'Q1 Sales', values: [15000, 22000] },
        { name: 'Q2 Sales', values: [18000, 24000] },
      ],
      'Quarterly Performance'
    );
    expect(chart.type).toBe('chart');
    expect(chart.title).toBe('Quarterly Performance');
    expect(chart.series.length).toBe(2);
    expect(chart.categories).toEqual(['North', 'South']);
  });

  it('should convert Pen doc headings into Glimpse presentation deck and vice-versa', () => {
    const penDoc: PenDocumentModel = {
      metadata: { id: 'doc_1', title: 'Product Launch', type: 'pen', createdAt: Date.now(), updatedAt: Date.now(), version: 1 },
      sections: [
        {
          id: 'sec_1',
          pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1 },
          blocks: [
            { id: 'b1', type: 'heading', level: 1, inlines: [{ id: 'i1', text: 'Product Launch Overview' }] },
            { id: 'b2', type: 'paragraph', inlines: [{ id: 'i2', text: 'Target release date is Q3.' }] },
            { id: 'b3', type: 'heading', level: 2, inlines: [{ id: 'i3', text: 'Market Readiness' }] },
            { id: 'b4', type: 'paragraph', inlines: [{ id: 'i4', text: 'All compatibility tests passing.' }] },
          ],
        },
      ],
    };

    const deck = OfficeEcosystemBridge.penDocToGlimpseDeck(penDoc);
    expect(deck.slides.length).toBeGreaterThanOrEqual(2);
    expect(deck.slides[0].title).toBe('Product Launch');

    // Roundtrip back from Glimpse to Pen executive report
    const returnedPenDoc = OfficeEcosystemBridge.glimpseDeckToPenDoc(deck);
    expect(returnedPenDoc.sections[0].blocks.length).toBeGreaterThan(0);
    expect(returnedPenDoc.metadata.title).toContain('Executive Summary');
  });

  it('should instantiate high quality editable templates across Pen, Sum, and Glimpse', () => {
    const penTemplates = OfficeTemplateLibrary.getPenTemplates();
    expect(penTemplates.length).toBeGreaterThanOrEqual(4);
    const letter = penTemplates.find((t) => t.id === 'pen_business_letter')!;
    const letterModel = letter.createModel();
    expect(letterModel.sections[0].blocks.length).toBeGreaterThan(1);

    const sumTemplates = OfficeTemplateLibrary.getSumTemplates();
    expect(sumTemplates.length).toBeGreaterThanOrEqual(3);
    const budget = sumTemplates.find((t) => t.id === 'sum_budget')!;
    const budgetModel = budget.createModel();
    expect(budgetModel.sheets[0].cells['D4'].raw).toBe('=B4-C4');

    const glimpseTemplates = OfficeTemplateLibrary.getGlimpseTemplates();
    expect(glimpseTemplates.length).toBeGreaterThanOrEqual(2);
    const pitch = glimpseTemplates.find((t) => t.id === 'glimpse_pitch_deck')!;
    const pitchModel = pitch.createModel();
    expect(pitchModel.slides.length).toBe(3);
  });

  it('should convert Glimpse table into Sum worksheet, Pen table, and Pen table into Glimpse table', () => {
    const glimpseTable = {
      id: 'tbl_node_1',
      type: 'table' as const,
      x: 50,
      y: 50,
      width: 800,
      height: 400,
      rows: 2,
      columns: 2,
      cells: [
        [
          { id: 'c1', text: 'Metric', fill: '#000', align: 'left' as const },
          { id: 'c2', text: 'Value', fill: '#000', align: 'left' as const },
        ],
        [
          { id: 'c3', text: 'Revenue', fill: '#fff', align: 'left' as const },
          { id: 'c4', text: '50000', fill: '#fff', align: 'left' as const },
        ],
      ],
      headerRow: true,
      zIndex: 1,
    };

    // Glimpse -> Sum
    const sumSheet = OfficeEcosystemBridge.glimpseTableToSumSheet(glimpseTable, 'FromSlide');
    expect(sumSheet.name).toBe('FromSlide');
    expect(sumSheet.cells['A1'].value).toBe('Metric');
    expect(sumSheet.cells['B2'].value).toBe(50000);

    // Glimpse -> Pen
    const penTable = OfficeEcosystemBridge.glimpseTableToPenTable(glimpseTable);
    expect(penTable.type).toBe('table');
    expect(penTable.hasHeaderRow).toBe(true);
    expect(penTable.rows[1][1].inlines[0].text).toBe('50000');

    // Pen -> Glimpse
    const returnedGlimpseTable = OfficeEcosystemBridge.penTableToGlimpseTable(penTable);
    expect(returnedGlimpseTable.type).toBe('table');
    expect(returnedGlimpseTable.rows).toBe(2);
    expect(returnedGlimpseTable.cells[1][0].text).toBe('Revenue');
  });

  it('should generate printable HTML with custom page layouts and pagination', () => {
    const printable = PdfExportEngine.generatePrintableHtml(
      'Quarterly Report',
      '<h1>Quarterly Report</h1><p>Content goes here.</p>',
      { orientation: 'landscape', pageSize: 'Letter', marginMm: 15 }
    );

    expect(printable).toContain('Quarterly Report');
    expect(printable).toContain('size: Letter landscape');
    expect(printable).toContain('margin: 15mm');
  });
});
