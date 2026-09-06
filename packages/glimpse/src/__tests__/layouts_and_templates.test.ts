import { describe, it, expect } from 'vitest';
import { SlideLayouts } from '../layouts';

describe('Glimpse Slide Layout Templates Engine', () => {
  it('should generate standard Title Slide layout with proper text hierarchy', () => {
    const slide = SlideLayouts.createTitleSlide('Autonomous Office Suite', 'Google Deepmind Pairing');
    expect(slide.layoutId).toBe('title-slide');
    expect(slide.nodes.length).toBe(2);
    expect((slide.nodes[0] as any).text).toBe('Autonomous Office Suite');
    expect((slide.nodes[1] as any).text).toBe('Google Deepmind Pairing');
  });

  it('should generate Title and Content layout with structured bullet points', () => {
    const slide = SlideLayouts.createTitleAndContent('Architecture Pillars', ['Local-first computation', 'OOXML schema fidelity', 'Deterministic test corpus']);
    expect(slide.layoutId).toBe('title-and-content');
    expect(slide.nodes.length).toBe(2);
    const contentNode = slide.nodes[1] as any;
    expect(contentNode.paragraphs.length).toBe(3);
    expect(contentNode.paragraphs[0].bullet).toBe(true);
    expect(contentNode.paragraphs[0].runs[0].text).toBe('Local-first computation');
  });

  it('should generate Section Header layout with category badge', () => {
    const slide = SlideLayouts.createSectionHeader('Part II: Engine Internals', 'Deep dive into Pratt parsing and DrawingML scene graphs');
    expect(slide.layoutId).toBe('section-header');
    expect(slide.nodes.length).toBe(3);
    expect(slide.nodes[0].type).toBe('shape');
    expect((slide.nodes[0] as any).text).toBe('SECTION');
  });

  it('should generate Two Column Comparison layout', () => {
    const slide = SlideLayouts.createTwoColumnCompare('Client vs Server', 'Local WASM / JS', 'Remote SaaS Cloud');
    expect(slide.layoutId).toBe('two-column-compare');
    expect(slide.nodes.length).toBe(3);
    expect(slide.nodes[1].type).toBe('shape');
    expect(slide.nodes[2].type).toBe('shape');
  });

  it('should generate Three Column Cards layout', () => {
    const cards = [
      { title: 'Pen', desc: 'Word-class rich document processor' },
      { title: 'Sum', desc: 'Excel-class 90+ function spreadsheet' },
      { title: 'Glimpse', desc: 'PowerPoint-class presentation editor' },
    ];
    const slide = SlideLayouts.createThreeColumnCards('The Openhead Trio', cards);
    expect(slide.layoutId).toBe('three-columns');
    expect(slide.nodes.length).toBe(1 + cards.length * 3);
  });

  it('should generate Executive KPI Dashboard layout', () => {
    const kpis = [
      { metric: 'Active Users', value: '5.2M', delta: '+45% YoY' },
      { metric: 'Latency p99', value: '4.2ms', delta: '-12% QoQ' },
    ];
    const slide = SlideLayouts.createExecutiveKpiDashboard('Performance Metrics', kpis);
    expect(slide.layoutId).toBe('executive-kpi');
    expect(slide.nodes.length).toBe(1 + kpis.length * 4);
  });

  it('should generate Blank layout', () => {
    const slide = SlideLayouts.createBlank();
    expect(slide.layoutId).toBe('blank');
    expect(slide.nodes.length).toBe(0);
  });
});
