export interface SearchResultMatch {
  id: string;
  location: string; // e.g. "Section 1 > Paragraph 2", "Sheet1!B12", "Slide 3 > TextBox 1"
  snippet: string;
  score: number;
  dataRef?: any;
}

export interface SearchQueryOptions {
  caseSensitive?: boolean;
  matchWholeWord?: boolean;
  maxResults?: number;
}

export class OfficeSearchEngine {
  /**
   * Search within Pen Document Blocks
   */
  public static searchPenDocument(docModel: any, query: string, options: SearchQueryOptions = {}): SearchResultMatch[] {
    if (!docModel || !query.trim()) return [];
    const results: SearchResultMatch[] = [];
    const q = options.caseSensitive ? query : query.toLowerCase();

    const sections = docModel.sections || [];
    sections.forEach((sec: any, secIdx: number) => {
      const blocks = sec.blocks || [];
      blocks.forEach((block: any, bIdx: number) => {
        let textContent = '';
        if (block.type === 'heading' || block.type === 'paragraph' || block.type === 'quote') {
          textContent = (block.inlines || []).map((inl: any) => inl.text || '').join('');
        } else if (block.type === 'table') {
          textContent = (block.rows || [])
            .map((r: any) => r.map((c: any) => (c.inlines || []).map((i: any) => i.text || '').join('')).join(' | '))
            .join('\n');
        }

        const matchText = options.caseSensitive ? textContent : textContent.toLowerCase();
        if (matchText.includes(q)) {
          results.push({
            id: `pen_${secIdx}_${bIdx}`,
            location: `Section ${secIdx + 1} • ${block.type} #${bIdx + 1}`,
            snippet: textContent.length > 80 ? textContent.substring(0, 80) + '...' : textContent,
            score: 1.0,
            dataRef: { sectionIndex: secIdx, blockId: block.id },
          });
        }
      });
    });

    return options.maxResults ? results.slice(0, options.maxResults) : results;
  }

  /**
   * Search within Sum Workbook Sheets
   */
  public static searchSumWorkbook(workbookModel: any, query: string, options: SearchQueryOptions = {}): SearchResultMatch[] {
    if (!workbookModel || !query.trim()) return [];
    const results: SearchResultMatch[] = [];
    const q = options.caseSensitive ? query : query.toLowerCase();

    const sheets = workbookModel.sheets || [];
    sheets.forEach((sheet: any) => {
      const cells = sheet.cells || {};
      for (const [coord, cell] of Object.entries<any>(cells)) {
        const valStr = cell.value !== undefined ? String(cell.value) : '';
        const formulaStr = cell.formula ? String(cell.formula) : '';
        const textToSearch = options.caseSensitive ? `${valStr} ${formulaStr}` : `${valStr} ${formulaStr}`.toLowerCase();

        if (textToSearch.includes(q)) {
          results.push({
            id: `sum_${sheet.id}_${coord}`,
            location: `${sheet.name}!${coord}`,
            snippet: cell.formula ? `=${cell.formula} -> ${valStr}` : valStr,
            score: 1.0,
            dataRef: { sheetId: sheet.id, coordinate: coord },
          });
        }
      }
    });

    return options.maxResults ? results.slice(0, options.maxResults) : results;
  }

  /**
   * Search within Glimpse Presentation Slides
   */
  public static searchGlimpseDeck(deckModel: any, query: string, options: SearchQueryOptions = {}): SearchResultMatch[] {
    if (!deckModel || !query.trim()) return [];
    const results: SearchResultMatch[] = [];
    const q = options.caseSensitive ? query : query.toLowerCase();

    const slides = deckModel.slides || [];
    slides.forEach((slide: any, sIdx: number) => {
      // Check slide title
      const titleMatch = options.caseSensitive ? slide.title : slide.title.toLowerCase();
      if (titleMatch.includes(q)) {
        results.push({
          id: `glimpse_${slide.id}_title`,
          location: `Slide ${sIdx + 1} (${slide.title})`,
          snippet: `Title: ${slide.title}`,
          score: 1.2,
          dataRef: { slideId: slide.id },
        });
      }

      // Check speaker notes
      if (slide.notes) {
        const notesMatch = options.caseSensitive ? slide.notes : slide.notes.toLowerCase();
        if (notesMatch.includes(q)) {
          results.push({
            id: `glimpse_${slide.id}_notes`,
            location: `Slide ${sIdx + 1} • Speaker Notes`,
            snippet: slide.notes.length > 80 ? slide.notes.substring(0, 80) + '...' : slide.notes,
            score: 0.9,
            dataRef: { slideId: slide.id },
          });
        }
      }

      // Check slide nodes
      const nodes = slide.nodes || [];
      nodes.forEach((node: any) => {
        let nodeText = node.text || '';
        if (node.paragraphs) {
          nodeText += ' ' + node.paragraphs.map((p: any) => (p.runs || []).map((r: any) => r.text || '').join('')).join(' ');
        }
        const nodeMatch = options.caseSensitive ? nodeText : nodeText.toLowerCase();
        if (nodeMatch.includes(q)) {
          results.push({
            id: `glimpse_${slide.id}_${node.id}`,
            location: `Slide ${sIdx + 1} • ${node.type} node`,
            snippet: nodeText.length > 80 ? nodeText.substring(0, 80) + '...' : nodeText,
            score: 1.0,
            dataRef: { slideId: slide.id, nodeId: node.id },
          });
        }
      });
    });

    return options.maxResults ? results.slice(0, options.maxResults) : results;
  }
}
