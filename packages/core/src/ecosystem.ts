import { PenDocumentModel, TableBlock, ParagraphBlock, HeadingBlock } from '../../pen/src/types';
import { WorksheetModel } from '../../sum/src/types';
import { GlimpseDeckModel, SlideModel, TableNode, ChartNode, TextNode } from '../../glimpse/src/types';
import { generateId } from './types';

export class OfficeEcosystemBridge {
  /**
   * Converts a Pen document table block into a Sum worksheet.
   */
  public static penTableToSumSheet(table: TableBlock, sheetName: string = 'ImportedTable'): WorksheetModel {
    const cells: Record<string, any> = {};
    let rowIdx = 0;

    // Optional header row
    if (table.headers && table.headers.length > 0) {
      table.headers.forEach((h, cIdx) => {
        const colLetter = String.fromCharCode(65 + cIdx);
        cells[`${colLetter}1`] = { raw: h, value: h, formula: null };
      });
      rowIdx = 1;
    }

    table.rows.forEach((row, r) => {
      row.forEach((cell, c) => {
        const colLetter = String.fromCharCode(65 + c);
        const cellCoord = `${colLetter}${rowIdx + r + 1}`;
        const text = cell.inlines.map((i) => i.text).join('').trim();
        const num = Number(text);
        const val = !isNaN(num) && text !== '' ? num : text;
        cells[cellCoord] = { raw: val, value: val, formula: null };
      });
    });

    return {
      id: generateId('sheet'),
      name: sheetName,
      cells,
      rowCount: Math.max(table.rows.length + rowIdx + 10, 50),
      colCount: Math.max((table.rows[0]?.length || 1) + 5, 26),
    };
  }

  /**
   * Converts a Sum spreadsheet cell range into a Pen document table block.
   */
  public static sumRangeToPenTable(
    matrix: (string | number | boolean | null)[][],
    hasHeaders: boolean = true
  ): TableBlock {
    const tableCells = matrix.map((row, rIdx) =>
      row.map((val) => ({
        id: generateId('cell'),
        inlines: [{ id: generateId('inl'), text: val === null ? '' : String(val) }],
        background: rIdx === 0 && hasHeaders ? '#F1F5F9' : undefined,
      }))
    );

    return {
      id: generateId('blk'),
      type: 'table',
      rows: tableCells,
      hasHeaderRow: hasHeaders,
    };
  }

  /**
   * Converts a Sum cell range into a Glimpse presentation slide table.
   */
  public static sumRangeToGlimpseTable(
    matrix: (string | number | boolean | null)[][],
    x: number = 100,
    y: number = 200,
    width: number = 1200,
    height: number = 600
  ): TableNode {
    const rows = matrix.length;
    const cols = matrix[0]?.length || 1;

    const cells = matrix.map((row, r) =>
      row.map((val) => ({
        id: generateId('cell'),
        text: val === null ? '' : String(val),
        fill: r === 0 ? '#1E293B' : 'rgba(255,255,255,0.03)',
        align: 'left' as const,
      }))
    );

    return {
      id: generateId('node'),
      type: 'table',
      x,
      y,
      width,
      height,
      rows,
      columns: cols,
      cells,
      headerRow: true,
      zIndex: 1,
    };
  }

  /**
   * Converts a Sum numeric table into a Glimpse multi-series ChartNode.
   */
  public static sumRangeToGlimpseChart(
    categories: string[],
    seriesData: { name: string; values: number[] }[],
    title: string = 'Spreadsheet Analytics',
    chartType: 'bar' | 'column' | 'line' | 'pie' | 'area' = 'column'
  ): ChartNode {
    const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return {
      id: generateId('node'),
      type: 'chart',
      chartType,
      title,
      categories,
      series: seriesData.map((s, idx) => ({
        name: s.name,
        data: s.values,
        color: colors[idx % colors.length],
      })),
      x: 100,
      y: 180,
      width: 1400,
      height: 700,
      showLegend: true,
      showDataLabels: true,
      zIndex: 1,
    };
  }

  /**
   * Converts Pen headings and paragraphs into a multi-slide Glimpse deck outline.
   */
  public static penDocToGlimpseDeck(penDoc: PenDocumentModel): GlimpseDeckModel {
    const slides: SlideModel[] = [];
    const title = penDoc.metadata.title || 'Exported Presentation';

    // Slide 1: Title
    slides.push({
      id: generateId('slide'),
      title,
      background: '#0F172A',
      nodes: [
        {
          id: generateId('node'),
          type: 'text',
          x: 160,
          y: 380,
          width: 1600,
          height: 140,
          text: title,
          fontSize: 52,
          fontWeight: 'bold',
          color: '#FFFFFF',
          align: 'center',
          zIndex: 1,
        } as TextNode,
      ],
    });

    let currentSlide: SlideModel | null = null;
    let bulletPoints: string[] = [];

    penDoc.sections.forEach((section) => {
      section.blocks.forEach((block) => {
        if (block.type === 'heading') {
          const heading = block as HeadingBlock;
          const hText = heading.inlines.map((i) => i.text).join('').trim();
          if (currentSlide && bulletPoints.length > 0) {
            currentSlide.nodes.push({
              id: generateId('node'),
              type: 'text',
              x: 100,
              y: 220,
              width: 1720,
              height: 700,
              text: bulletPoints.map((b) => `• ${b}`).join('\n\n'),
              fontSize: 24,
              color: '#CBD5E1',
              align: 'left',
              zIndex: 2,
            } as TextNode);
          }

          currentSlide = {
            id: generateId('slide'),
            title: hText,
            background: '#0F172A',
            nodes: [
              {
                id: generateId('node'),
                type: 'text',
                x: 100,
                y: 80,
                width: 1720,
                height: 100,
                text: hText,
                fontSize: 40,
                fontWeight: 'bold',
                color: '#FFFFFF',
                align: 'left',
                zIndex: 1,
              } as TextNode,
            ],
          };
          slides.push(currentSlide);
          bulletPoints = [];
        } else if (block.type === 'paragraph') {
          const p = block as ParagraphBlock;
          const text = p.inlines.map((i) => i.text).join('').trim();
          if (text) {
            bulletPoints.push(text);
          }
        }
      });
    });

    const targetSlide = currentSlide as SlideModel | null;
    if (targetSlide && bulletPoints.length > 0) {
      targetSlide.nodes.push({
        id: generateId('node'),
        type: 'text',
        x: 100,
        y: 220,
        width: 1720,
        height: 700,
        text: bulletPoints.map((b) => `• ${b}`).join('\n\n'),
        fontSize: 24,
        color: '#CBD5E1',
        align: 'left',
        zIndex: 2,
      } as TextNode);
    }

    return {
      metadata: {
        id: generateId('deck'),
        title,
        type: 'glimpse',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      dimensions: { width: 1920, height: 1080, aspectRatio: '16:9' },
      slides,
      activeSlideId: slides[0].id,
    };
  }

  /**
   * Converts a Glimpse slide deck into an executive Pen report document.
   */
  public static glimpseDeckToPenDoc(deck: GlimpseDeckModel): PenDocumentModel {
    const blocks: any[] = [];

    // Document Title
    blocks.push({
      id: generateId('blk'),
      type: 'heading',
      level: 1,
      props: { styleId: 'Heading1', spacingBefore: 12, spacingAfter: 8 },
      inlines: [{ id: generateId('inl'), text: deck.metadata.title || 'Presentation Summary' }],
    });

    deck.slides.forEach((slide, idx) => {
      blocks.push({
        id: generateId('blk'),
        type: 'heading',
        level: 2,
        props: { styleId: 'Heading2', spacingBefore: 14, spacingAfter: 6 },
        inlines: [{ id: generateId('inl'), text: `Slide ${idx + 1}: ${slide.title}` }],
      });

      slide.nodes.forEach((node) => {
        if (node.type === 'text') {
          const tNode = node as TextNode;
          const rawText = tNode.text || tNode.paragraphs?.map((p) => p.runs.map((r) => r.text).join('')).join('\n') || '';
          if (rawText && rawText !== slide.title) {
            blocks.push({
              id: generateId('blk'),
              type: 'paragraph',
              props: { styleId: 'Normal', lineSpacing: 1.15, spacingAfter: 6 },
              inlines: [{ id: generateId('inl'), text: rawText }],
            });
          }
        }
      });

      if (slide.notes) {
        blocks.push({
          id: generateId('blk'),
          type: 'callout',
          variant: 'note',
          inlines: [{ id: generateId('inl'), text: `Presenter Notes: ${slide.notes}` }],
        });
      }
    });

    return {
      metadata: {
        id: generateId('doc'),
        title: `${deck.metadata.title} - Executive Summary`,
        type: 'pen',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      sections: [
        {
          id: generateId('sec'),
          pageSettings: {
            orientation: 'portrait',
            pageSize: 'A4',
            margins: { top: 25, bottom: 25, left: 25, right: 25 },
            columns: 1,
          },
          blocks,
        },
      ],
    };
  }
}
