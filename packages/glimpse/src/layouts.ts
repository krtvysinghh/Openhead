import { generateId } from '@openhead/core';
import { SlideModel, TextNode, ShapeNode, TableNode, ChartNode, ChartType, Paragraph } from './types';

export class SlideLayouts {
  public static createTitleSlide(
    title: string = 'Presentation Title',
    subtitle: string = 'Created with Openhead Glimpse'
  ): SlideModel {
    const slideId = generateId('slide');
    const titleNode: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 160,
      y: 340,
      width: 1600,
      height: 140,
      text: title,
      fontSize: 56,
      fontWeight: 'bold',
      color: '#ffffff',
      align: 'center',
      zIndex: 1,
    };

    const subtitleNode: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 160,
      y: 500,
      width: 1600,
      height: 80,
      text: subtitle,
      fontSize: 28,
      color: '#94a3b8',
      align: 'center',
      zIndex: 2,
    };

    return {
      id: slideId,
      title,
      layoutId: 'title-slide',
      background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
      nodes: [titleNode, subtitleNode],
      transition: 'fade',
    };
  }

  public static createTitleAndContent(
    title: string = 'Slide Title',
    bullets: string[] = ['First key takeaway or observation', 'Second supporting data point or detail', 'Strategic next steps and recommendations']
  ): SlideModel {
    const slideId = generateId('slide');
    const titleNode: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 120,
      y: 90,
      width: 1680,
      height: 80,
      text: title,
      fontSize: 44,
      fontWeight: 'bold',
      color: '#ffffff',
      align: 'left',
      zIndex: 1,
    };

    const paragraphs: Paragraph[] = bullets.map((text) => ({
      id: generateId('p'),
      bullet: true,
      align: 'left',
      runs: [{ id: generateId('run'), text, fontSize: 24, color: '#e2e8f0' }],
    }));

    const contentNode: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 120,
      y: 220,
      width: 1680,
      height: 700,
      text: bullets.join('\n'),
      paragraphs,
      fontSize: 24,
      color: '#e2e8f0',
      zIndex: 2,
    };

    return {
      id: slideId,
      title,
      layoutId: 'title-and-content',
      background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
      nodes: [titleNode, contentNode],
      transition: 'fade',
    };
  }

  public static createSectionHeader(
    sectionTitle: string = 'Section Title',
    description: string = 'Brief context or summary of topics covered in this section'
  ): SlideModel {
    const slideId = generateId('slide');
    const badgeNode: ShapeNode = {
      id: generateId('node'),
      type: 'shape',
      kind: 'rounded-rectangle',
      x: 160,
      y: 380,
      width: 160,
      height: 40,
      fill: '#3b82f6',
      cornerRadius: 8,
      text: 'SECTION',
      textColor: '#ffffff',
      fontSize: 16,
      zIndex: 1,
    };

    const titleNode: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 160,
      y: 440,
      width: 1600,
      height: 100,
      text: sectionTitle,
      fontSize: 52,
      fontWeight: 'bold',
      color: '#ffffff',
      zIndex: 2,
    };

    const descNode: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 160,
      y: 560,
      width: 1600,
      height: 80,
      text: description,
      fontSize: 24,
      color: '#94a3b8',
      zIndex: 3,
    };

    return {
      id: slideId,
      title: sectionTitle,
      layoutId: 'section-header',
      background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
      nodes: [badgeNode, titleNode, descNode],
      transition: 'push',
    };
  }

  public static createTwoColumnCompare(
    title: string = 'Comparison Layout',
    leftTitle: string = 'Option A',
    rightTitle: string = 'Option B'
  ): SlideModel {
    const slideId = generateId('slide');
    const header: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 120,
      y: 80,
      width: 1680,
      height: 80,
      text: title,
      fontSize: 44,
      fontWeight: 'bold',
      color: '#ffffff',
      zIndex: 1,
    };

    const cardLeft: ShapeNode = {
      id: generateId('node'),
      type: 'shape',
      kind: 'card',
      x: 120,
      y: 200,
      width: 800,
      height: 740,
      fill: 'rgba(255,255,255,0.05)',
      stroke: 'rgba(255,255,255,0.15)',
      strokeWidth: 1,
      cornerRadius: 16,
      text: leftTitle,
      textColor: '#38bdf8',
      fontSize: 28,
      zIndex: 2,
    };

    const cardRight: ShapeNode = {
      id: generateId('node'),
      type: 'shape',
      kind: 'card',
      x: 1000,
      y: 200,
      width: 800,
      height: 740,
      fill: 'rgba(255,255,255,0.05)',
      stroke: 'rgba(255,255,255,0.15)',
      strokeWidth: 1,
      cornerRadius: 16,
      text: rightTitle,
      textColor: '#a855f7',
      fontSize: 28,
      zIndex: 3,
    };

    return {
      id: slideId,
      title,
      layoutId: 'two-column-compare',
      background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
      nodes: [header, cardLeft, cardRight],
      transition: 'fade',
    };
  }

  public static createThreeColumnCards(
    title: string = 'Three Pillars',
    cards: Array<{ title: string; desc: string }> = [
      { title: 'Reliability', desc: 'Enterprise-grade stability and zero data loss guarantee.' },
      { title: 'Performance', desc: 'Sub-millisecond formula engine and fast rendering.' },
      { title: 'Privacy', desc: '100% local-first computation with zero telemetry.' },
    ]
  ): SlideModel {
    const slideId = generateId('slide');
    const header: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 120,
      y: 80,
      width: 1680,
      height: 80,
      text: title,
      fontSize: 44,
      fontWeight: 'bold',
      color: '#ffffff',
      zIndex: 1,
    };

    const cardWidth = 520;
    const gap = 60;
    const startX = 120;
    const nodes: any[] = [header];

    cards.forEach((card, idx) => {
      const cardX = startX + idx * (cardWidth + gap);
      nodes.push({
        id: generateId('node'),
        type: 'shape',
        kind: 'card',
        x: cardX,
        y: 220,
        width: cardWidth,
        height: 680,
        fill: 'rgba(255,255,255,0.04)',
        stroke: 'rgba(255,255,255,0.12)',
        strokeWidth: 1,
        cornerRadius: 16,
        zIndex: idx + 2,
      });

      nodes.push({
        id: generateId('node'),
        type: 'text',
        x: cardX + 30,
        y: 260,
        width: cardWidth - 60,
        height: 60,
        text: card.title,
        fontSize: 28,
        fontWeight: 'bold',
        color: '#60a5fa',
        zIndex: idx + 10,
      });

      nodes.push({
        id: generateId('node'),
        type: 'text',
        x: cardX + 30,
        y: 340,
        width: cardWidth - 60,
        height: 500,
        text: card.desc,
        fontSize: 20,
        color: '#cbd5e1',
        zIndex: idx + 20,
      });
    });

    return {
      id: slideId,
      title,
      layoutId: 'three-columns',
      background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
      nodes,
      transition: 'fade',
    };
  }

  public static createExecutiveKpiDashboard(
    title: string = 'Quarterly Executive KPI Dashboard',
    kpis: Array<{ metric: string; value: string; delta: string }> = [
      { metric: 'Annual Recurring Revenue', value: '$42.5M', delta: '+38% YoY' },
      { metric: 'Active Organizations', value: '1,420', delta: '+24% QoQ' },
      { metric: 'Net Revenue Retention', value: '128%', delta: '+4.2 pts' },
      { metric: 'Gross Margin', value: '84.2%', delta: '+1.5 pts' },
    ]
  ): SlideModel {
    const slideId = generateId('slide');
    const header: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 120,
      y: 70,
      width: 1680,
      height: 70,
      text: title,
      fontSize: 40,
      fontWeight: 'bold',
      color: '#ffffff',
      zIndex: 1,
    };

    const nodes: any[] = [header];
    const cardWidth = 380;
    const gap = 50;
    const startX = 120;

    kpis.forEach((kpi, idx) => {
      const cardX = startX + idx * (cardWidth + gap);
      nodes.push({
        id: generateId('node'),
        type: 'shape',
        kind: 'card',
        x: cardX,
        y: 180,
        width: cardWidth,
        height: 240,
        fill: 'rgba(30, 41, 59, 0.8)',
        stroke: 'rgba(59, 130, 246, 0.3)',
        strokeWidth: 1.5,
        cornerRadius: 12,
        zIndex: 2 + idx,
      });

      nodes.push({
        id: generateId('node'),
        type: 'text',
        x: cardX + 24,
        y: 204,
        width: cardWidth - 48,
        height: 40,
        text: kpi.metric,
        fontSize: 16,
        color: '#94a3b8',
        fontWeight: 'normal',
        zIndex: 10 + idx,
      });

      nodes.push({
        id: generateId('node'),
        type: 'text',
        x: cardX + 24,
        y: 248,
        width: cardWidth - 48,
        height: 70,
        text: kpi.value,
        fontSize: 44,
        color: '#ffffff',
        fontWeight: 'bold',
        zIndex: 20 + idx,
      });

      nodes.push({
        id: generateId('node'),
        type: 'text',
        x: cardX + 24,
        y: 330,
        width: cardWidth - 48,
        height: 36,
        text: kpi.delta,
        fontSize: 18,
        color: '#10b981',
        fontWeight: 'bold',
        zIndex: 30 + idx,
      });
    });

    return {
      id: slideId,
      title,
      layoutId: 'executive-kpi',
      background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
      nodes,
      transition: 'fade',
    };
  }

  public static createTableSlide(
    title: string = 'Performance Breakdown',
    headers: string[] = ['Department', 'Budget Allocated', 'Actual Spend', 'Variance', 'Status'],
    rows: string[][] = [
      ['Engineering', '$4,200,000', '$3,950,000', '-$250,000', 'Under Budget'],
      ['Marketing', '$1,800,000', '$1,820,000', '+$20,000', 'On Track'],
      ['Operations', '$950,000', '$910,000', '-$40,000', 'Under Budget'],
      ['Product & Design', '$1,400,000', '$1,380,000', '-$20,000', 'Under Budget'],
    ]
  ): SlideModel {
    const slideId = generateId('slide');
    const header: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 120,
      y: 80,
      width: 1680,
      height: 70,
      text: title,
      fontSize: 42,
      fontWeight: 'bold',
      color: '#ffffff',
      zIndex: 1,
    };

    const cells = [
      headers.map((h) => ({ id: generateId('cell'), text: h, fill: '#1e293b', align: 'left' as const })),
      ...rows.map((row) =>
        row.map((val) => ({ id: generateId('cell'), text: val, fill: 'rgba(255,255,255,0.02)', align: 'left' as const }))
      ),
    ];

    const tableNode: TableNode = {
      id: generateId('node'),
      type: 'table',
      x: 120,
      y: 200,
      width: 1680,
      height: 600,
      rows: cells.length,
      columns: headers.length,
      cells,
      headerRow: true,
      zIndex: 2,
    };

    return {
      id: slideId,
      title,
      layoutId: 'table-slide',
      background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
      nodes: [header, tableNode],
      transition: 'fade',
    };
  }

  public static createChartSlide(
    title: string = 'Revenue Forecast',
    chartType: ChartType = 'bar',
    categories: string[] = ['Q1', 'Q2', 'Q3', 'Q4'],
    series: Array<{ name: string; data: number[]; color?: string }> = [
      { name: '2025 Actual', data: [12.4, 14.8, 16.2, 19.1], color: '#38bdf8' },
      { name: '2026 Target', data: [15.0, 18.2, 21.5, 26.0], color: '#3b82f6' },
    ]
  ): SlideModel {
    const slideId = generateId('slide');
    const header: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 120,
      y: 80,
      width: 1680,
      height: 70,
      text: title,
      fontSize: 42,
      fontWeight: 'bold',
      color: '#ffffff',
      zIndex: 1,
    };

    const chartNode: ChartNode = {
      id: generateId('node'),
      type: 'chart',
      x: 120,
      y: 200,
      width: 1680,
      height: 720,
      chartType,
      title,
      categories,
      series,
      showLegend: true,
      showDataLabels: true,
      zIndex: 2,
    };

    return {
      id: slideId,
      title,
      layoutId: 'chart-slide',
      background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
      nodes: [header, chartNode],
      transition: 'fade',
    };
  }

  public static createBlank(): SlideModel {
    return {
      id: generateId('slide'),
      title: 'Blank Slide',
      layoutId: 'blank',
      background: '#0f172a',
      nodes: [],
      transition: 'none',
    };
  }
}
