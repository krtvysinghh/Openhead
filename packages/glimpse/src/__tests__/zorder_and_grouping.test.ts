import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { ShapeNode, TextNode } from '../types';

describe('Glimpse Z-Ordering & Object Grouping Engine', () => {
  it('should manage z-index ordering with bringToFront and sendToBack', () => {
    const deck = new GlimpseDeck();
    const node1: ShapeNode = {
      id: 'shape-1',
      type: 'shape',
      kind: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 150,
      fill: '#3b82f6',
      zIndex: 1,
    };
    const node2: TextNode = {
      id: 'text-2',
      type: 'text',
      x: 120,
      y: 120,
      width: 160,
      height: 50,
      text: 'Layer Text',
      fontSize: 20,
      color: '#ffffff',
      zIndex: 2,
    };

    deck.addNode(node1);
    deck.addNode(node2);

    // Bring shape-1 to front
    deck.bringToFront('shape-1');
    const shape = deck.getActiveSlide().nodes.find((n) => n.id === 'shape-1')!;
    const text = deck.getActiveSlide().nodes.find((n) => n.id === 'text-2')!;
    expect(shape.zIndex).toBeGreaterThan(text.zIndex);

    // Send shape-1 to back
    deck.sendToBack('shape-1');
    const shapeAfter = deck.getActiveSlide().nodes.find((n) => n.id === 'shape-1')!;
    expect(shapeAfter.zIndex).toBeLessThanOrEqual(text.zIndex);
  });

  it('should group and ungroup composite canvas nodes with bounding box calculation', () => {
    const deck = new GlimpseDeck();
    const node1: ShapeNode = {
      id: 'box-a',
      type: 'shape',
      kind: 'rectangle',
      x: 100,
      y: 100,
      width: 200,
      height: 100,
      fill: '#10b981',
      zIndex: 1,
    };
    const node2: ShapeNode = {
      id: 'box-b',
      type: 'shape',
      kind: 'circle',
      x: 250,
      y: 150,
      width: 150,
      height: 150,
      fill: '#f59e0b',
      zIndex: 2,
    };

    deck.addNode(node1);
    deck.addNode(node2);

    // Group box-a and box-b
    const group = deck.groupNodes(['box-a', 'box-b']);
    expect(group).not.toBeNull();
    expect(group!.type).toBe('group');
    expect(group!.x).toBe(100);
    expect(group!.y).toBe(100);
    expect(group!.width).toBe(300); // from 100 to 400
    expect(group!.height).toBe(200); // from 100 to 300

    // Ungroup
    const restored = deck.ungroupNode(group!.id);
    expect(restored).not.toBeNull();
    expect(restored!.length).toBe(2);
    expect(deck.getActiveSlide().nodes.some((n) => n.id === 'box-a')).toBe(true);
    expect(deck.getActiveSlide().nodes.some((n) => n.id === 'box-b')).toBe(true);
  });
});
