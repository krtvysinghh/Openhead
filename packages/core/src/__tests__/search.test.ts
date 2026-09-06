import { describe, it, expect } from 'vitest';
import { OfficeSearchEngine } from '../search';

describe('OfficeSearchEngine Unified Search Across Office Models', () => {
  it('should search Pen document paragraphs, headings, and tables', () => {
    const docModel = {
      sections: [
        {
          blocks: [
            { id: 'b1', type: 'heading', level: 1, inlines: [{ text: 'Executive Summary' }] },
            { id: 'b2', type: 'paragraph', inlines: [{ text: 'Openhead enables local-first privacy.' }] },
            {
              id: 'b3',
              type: 'table',
              rows: [[{ inlines: [{ text: 'Metric' }] }, { inlines: [{ text: 'ARR Target' }] }]],
            },
          ],
        },
      ],
    };

    const matches = OfficeSearchEngine.searchPenDocument(docModel, 'privacy');
    expect(matches.length).toBe(1);
    expect(matches[0].location).toContain('Section 1');
    expect(matches[0].snippet).toContain('local-first privacy');

    const tableMatch = OfficeSearchEngine.searchPenDocument(docModel, 'ARR Target');
    expect(tableMatch.length).toBe(1);
  });

  it('should search Sum workbook sheets, cell values, and formulas', () => {
    const workbookModel = {
      sheets: [
        {
          id: 'sheet1',
          name: 'Forecast',
          cells: {
            A1: { value: 'Gross Revenue' },
            B1: { value: 1200000, formula: 'SUM(B2:B10)' },
          },
        },
      ],
    };

    const matches = OfficeSearchEngine.searchSumWorkbook(workbookModel, 'Revenue');
    expect(matches.length).toBe(1);
    expect(matches[0].location).toBe('Forecast!A1');

    const formulaMatches = OfficeSearchEngine.searchSumWorkbook(workbookModel, 'SUM');
    expect(formulaMatches.length).toBe(1);
    expect(formulaMatches[0].location).toBe('Forecast!B1');
  });

  it('should search Glimpse presentation slides, titles, notes, and shapes', () => {
    const deckModel = {
      slides: [
        {
          id: 's1',
          title: 'Product Strategy',
          notes: 'Speaker talking points about roadmap.',
          nodes: [{ id: 'n1', type: 'text', text: 'Mathematical precision in office engines.' }],
        },
      ],
    };

    const titleMatches = OfficeSearchEngine.searchGlimpseDeck(deckModel, 'Strategy');
    expect(titleMatches.length).toBe(1);

    const notesMatches = OfficeSearchEngine.searchGlimpseDeck(deckModel, 'roadmap');
    expect(notesMatches.length).toBe(1);
    expect(notesMatches[0].location).toContain('Speaker Notes');

    const nodeMatches = OfficeSearchEngine.searchGlimpseDeck(deckModel, 'precision');
    expect(nodeMatches.length).toBe(1);
  });
});
