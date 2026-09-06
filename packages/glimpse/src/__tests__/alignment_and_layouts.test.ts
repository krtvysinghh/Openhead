import { describe, it, expect } from 'vitest';
import { AlignmentEngine } from '../alignment';
import { SlideLayouts } from '../layouts';
import { ShapeNode } from '../types';

describe('Glimpse - Alignment & Layout Templates', () => {
  it('should align multiple nodes to left boundary', () => {
    const node1: ShapeNode = { id: '1', type: 'shape', kind: 'card', x: 100, y: 100, width: 200, height: 100, fill: '', zIndex: 1 };
    const node2: ShapeNode = { id: '2', type: 'shape', kind: 'card', x: 300, y: 250, width: 200, height: 100, fill: '', zIndex: 2 };

    const aligned = AlignmentEngine.alignNodes([node1, node2], 'left');
    expect(aligned[0].x).toBe(100);
    expect(aligned[1].x).toBe(100);
  });

  it('should create pre-architected Two-Column Compare layout', () => {
    const slide = SlideLayouts.createTwoColumnCompare('Cloud vs Edge');
    expect(slide.nodes.length).toBe(3);
    expect(slide.title).toBe('Cloud vs Edge');
  });
});
