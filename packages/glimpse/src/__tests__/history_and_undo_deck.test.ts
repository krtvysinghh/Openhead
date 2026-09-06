import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';

describe('Glimpse Transactional Undo/Redo Deck Operations', () => {
  it('should support multi-step undo and redo for node manipulation and z-index ordering', () => {
    const deck = new GlimpseDeck();

    // 1. Add 3 shapes
    const n1 = deck.addShapeNode('rectangle', { fill: '#ff0000', zIndex: 1 });
    const n2 = deck.addShapeNode('circle', { fill: '#00ff00', zIndex: 2 });
    const n3 = deck.addShapeNode('triangle', { fill: '#0000ff', zIndex: 3 });

    expect(deck.getActiveSlide().nodes.length).toBe(5); // 2 default text + 3 shapes

    // 2. Bring n1 to front
    deck.bringToFront(n1.id);
    expect(deck.getActiveSlide().nodes.find((n) => n.id === n1.id)?.zIndex).toBeGreaterThan(n3.zIndex);

    // 3. Send n3 to back
    deck.sendToBack(n3.id);
    expect(deck.getActiveSlide().nodes.find((n) => n.id === n3.id)?.zIndex).toBe(0);

    // 4. Group n1 and n2
    const group = deck.groupNodes([n1.id, n2.id]);
    expect(group).not.toBeNull();
    expect(deck.getActiveSlide().nodes.some((n) => n.id === group!.id)).toBe(true);

    // 5. Undo grouping
    expect(deck.undo()).toBe(true);
    expect(deck.getActiveSlide().nodes.some((n) => n.id === group!.id)).toBe(false);
    expect(deck.getActiveSlide().nodes.some((n) => n.id === n1.id)).toBe(true);

    // 6. Redo grouping
    expect(deck.redo()).toBe(true);
    expect(deck.getActiveSlide().nodes.some((n) => n.id === group!.id)).toBe(true);

    // 7. Ungroup
    const ungrouped = deck.ungroupNode(group!.id);
    expect(ungrouped).not.toBeNull();
    expect(deck.getActiveSlide().nodes.some((n) => n.id === group!.id)).toBe(false);
  });
});
