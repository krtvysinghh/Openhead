import { describe, it, expect } from 'vitest';
import { PenDocument, exportToMarkdown } from '@openhead/pen';
import { SumWorkbook, exportWorksheetToCsv } from '@openhead/sum';
import { GlimpseDeck } from '@openhead/glimpse';
import fs from 'fs';
import path from 'path';

describe('Visual & Structural Regression Suite', () => {
  it('should preserve typography and section tree structure on Pen document fixtures', () => {
    const fixturePath = path.resolve(__dirname, '../../compatibility-corpus/pen/typography/fixture_01_rich_typography.json');
    const raw = fs.readFileSync(fixturePath, 'utf8');
    const model = JSON.parse(raw);

    const doc = new PenDocument(model);
    expect(doc.getModel().sections.length).toBe(1);
    expect(doc.getModel().sections[0].blocks.length).toBe(2);

    const md = exportToMarkdown(doc.getModel());
    expect(md).toContain('# **Corporate Typography & Styling Manual**');
    expect(md).toContain('Openhead maintains strict WCAG AAA contrast');
  });

  it('should preserve complex financial calculations and formulas on Sum workbook fixtures', () => {
    const fixturePath = path.resolve(__dirname, '../../compatibility-corpus/sum/formulas/fixture_03_nested_financial_model.json');
    const raw = fs.readFileSync(fixturePath, 'utf8');
    const model = JSON.parse(raw);

    const wb = new SumWorkbook(model);
    const sheet = wb.getActiveSheet();

    // Verify initial calculated PMT formula
    expect(sheet.cells['B4'].value).toBe(-3160.34);

    // Edit loan amount from 500k to 600k and verify reactive calculation
    wb.setCellValue('B1', 600000);
    expect(wb.getActiveSheet().cells['B4'].value).toBe(-3792.41);
  });

  it('should preserve 16:9 scene graph node coordinates on Glimpse deck fixtures', () => {
    const fixturePath = path.resolve(__dirname, '../../compatibility-corpus/glimpse/layouts/fixture_04_executive_slide_deck.json');
    const raw = fs.readFileSync(fixturePath, 'utf8');
    const model = JSON.parse(raw);

    const deck = new GlimpseDeck(model);
    const slide = deck.getActiveSlide();

    expect(slide.nodes.length).toBe(3);
    expect(slide.nodes[0].x).toBe(120);
    expect(slide.nodes[0].y).toBe(100);
    expect(slide.nodes[1].width).toBe(800);
    expect(slide.nodes[2].width).toBe(800);
  });
});
