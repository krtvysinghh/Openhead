import { describe, it, expect } from 'vitest';
import { AlignmentEngine } from '../alignment';
import { SlideNode } from '../types';

describe('Glimpse Canvas Alignment, Distribution & Smart Snapping', () => {
  const sampleNodes: SlideNode[] = [
    { id: '1', type: 'shape', kind: 'rectangle', fill: '#000', x: 100, y: 100, width: 200, height: 150, zIndex: 1 },
    { id: '2', type: 'shape', kind: 'rectangle', fill: '#000', x: 400, y: 250, width: 300, height: 100, zIndex: 2 },
    { id: '3', type: 'shape', kind: 'rectangle', fill: '#000', x: 900, y: 150, width: 200, height: 200, zIndex: 3 },
  ];

  it('should align nodes to slide boundaries when explicit bounds are provided', () => {
    const slideBounds = { x: 0, y: 0, width: 1920, height: 1080 };

    // Align to left edge of slide
    const alignedLeft = AlignmentEngine.alignNodes(sampleNodes, 'left', slideBounds);
    expect(alignedLeft.every((n) => n.x === 0)).toBe(true);

    // Align to right edge of slide
    const alignedRight = AlignmentEngine.alignNodes(sampleNodes, 'right', slideBounds);
    expect(alignedRight[0].x).toBe(1920 - 200);
    expect(alignedRight[1].x).toBe(1920 - 300);

    // Align to center of slide
    const alignedCenter = AlignmentEngine.alignNodes(sampleNodes, 'center', slideBounds);
    expect(alignedCenter[0].x).toBe(1920 / 2 - 200 / 2);

    // Align to top of slide
    const alignedTop = AlignmentEngine.alignNodes(sampleNodes, 'top', slideBounds);
    expect(alignedTop.every((n) => n.y === 0)).toBe(true);

    // Align to bottom of slide
    const alignedBottom = AlignmentEngine.alignNodes(sampleNodes, 'bottom', slideBounds);
    expect(alignedBottom[0].y).toBe(1080 - 150);
  });

  it('should align nodes relative to selection bounding box when no bounds provided', () => {
    const alignedMiddle = AlignmentEngine.alignNodes(sampleNodes, 'middle');
    const minY = 100;
    const maxY = 350; // max is 150+200=350
    const centerY = minY + (maxY - minY) / 2; // 225

    expect(alignedMiddle[0].y).toBe(centerY - 150 / 2); // 225 - 75 = 150
    expect(alignedMiddle[1].y).toBe(centerY - 100 / 2); // 225 - 50 = 175
  });

  it('should distribute nodes vertically with equal spacing', () => {
    const distributedV = AlignmentEngine.distributeNodes(sampleNodes, 'vertical');
    expect(distributedV[0].y).toBe(100);
    expect(distributedV[1].y).toBe(175); // (250-100)/2 + 100 = 175
    expect(distributedV[2].y).toBe(250);
  });

  it('should return empty or single array when aligning fewer than 2 nodes without bounds', () => {
    expect(AlignmentEngine.alignNodes([], 'left')).toEqual([]);
    expect(AlignmentEngine.alignNodes([sampleNodes[0]], 'left')).toEqual([sampleNodes[0]]);
    expect(AlignmentEngine.distributeNodes([sampleNodes[0], sampleNodes[1]], 'horizontal').length).toBe(2);
  });
});
