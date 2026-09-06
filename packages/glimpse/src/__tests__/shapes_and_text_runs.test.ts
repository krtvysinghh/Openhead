import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { PptxAdapter } from '../export/pptx';
import { ShapeKind } from '../types';

describe('Glimpse Shapes & Rich Text Runs', () => {
  it('should support all standard preset shape geometries', () => {
    const deck = new GlimpseDeck();
    const kinds: ShapeKind[] = [
      'rectangle',
      'rounded-rectangle',
      'circle',
      'triangle',
      'line',
      'arrow',
      'diamond',
      'pentagon',
      'hexagon',
      'star',
      'callout',
      'badge',
      'card',
    ];

    kinds.forEach((kind, idx) => {
      deck.addShapeNode(kind, {
        x: 100 + idx * 20,
        y: 100 + idx * 20,
        width: 150,
        height: 100,
        fill: '#3b82f6',
        stroke: '#ffffff',
        strokeWidth: 2,
        strokeDash: idx % 2 === 0 ? 'solid' : 'dashed',
      });
    });

    const activeSlide = deck.getActiveSlide();
    expect(activeSlide.nodes.length).toBe(2 + kinds.length);

    const slideXml = PptxAdapter.toSlideXml(activeSlide, 1);
    expect(slideXml).toContain('prst="rect"');
    expect(slideXml).toContain('prst="roundRect"');
    expect(slideXml).toContain('prst="ellipse"');
    expect(slideXml).toContain('prst="triangle"');
    expect(slideXml).toContain('prst="rightArrow"');
    expect(slideXml).toContain('prst="star5"');
    expect(slideXml).toContain('prst="wedgeRectCallout"');
  });

  it('should format rich text runs with bold, italic, underline, colors, and links', () => {
    const deck = new GlimpseDeck();
    const node = deck.addTextNode({
      paragraphs: [
        {
          id: 'p1',
          align: 'center',
          bullet: false,
          runs: [
            { id: 'r1', text: 'Important: ', bold: true, color: '#ef4444', fontSize: 28 },
            { id: 'r2', text: 'Openhead ', italic: true, underline: true, color: '#38bdf8', fontSize: 28, link: 'https://openhead.org' },
            { id: 'r3', text: 'is free & open source.', strikethrough: false, color: '#ffffff', fontSize: 28 },
          ],
        },
        {
          id: 'p2',
          bullet: true,
          runs: [{ id: 'r4', text: 'Local-first architecture', fontSize: 22, color: '#cbd5e1' }],
        },
        {
          id: 'p3',
          numbered: true,
          runs: [{ id: 'r5', text: 'Mathematical formula verification', fontSize: 22, color: '#cbd5e1' }],
        },
      ],
    });

    expect(node.paragraphs?.length).toBe(3);
    expect(node.paragraphs![0].runs.length).toBe(3);
    expect(node.paragraphs![1].bullet).toBe(true);
    expect(node.paragraphs![2].numbered).toBe(true);

    const slideXml = PptxAdapter.toSlideXml(deck.getActiveSlide(), 1);
    expect(slideXml).toContain('b="1"');
    expect(slideXml).toContain('i="1"');
    expect(slideXml).toContain('u="sng"');
    expect(slideXml).toContain('buChar');
    expect(slideXml).toContain('buAutoNum');
  });
});
