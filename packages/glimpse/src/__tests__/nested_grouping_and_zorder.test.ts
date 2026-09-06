import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { GlimpseEditor } from '../editor';

describe('Glimpse Multi-Node Selection, Grouping & Z-Order', () => {
  it('should manage multi-node selection via GlimpseEditor', () => {
    const deck = new GlimpseDeck();
    const n1 = deck.addShapeNode('rectangle');
    const n2 = deck.addShapeNode('circle');
    deck.addShapeNode('triangle');

    const editor = new GlimpseEditor(deck);

    // Single select
    editor.selectNode(n1.id);
    expect(editor.getSelectedNodeIds()).toEqual([n1.id]);

    // Multi select
    editor.selectNode(n2.id, true);
    expect(editor.getSelectedNodeIds().length).toBe(2);
    expect(editor.getSelectedNodes().length).toBe(2);

    // Deselect
    editor.deselectNode(n1.id);
    expect(editor.getSelectedNodeIds()).toEqual([n2.id]);

    // Clear
    editor.clearSelection();
    expect(editor.getSelectedNodeIds().length).toBe(0);
  });

  it('should adjust z-index incrementally with bringForward and sendBackward', () => {
    const deck = new GlimpseDeck();
    const n1 = deck.addShapeNode('rectangle', { zIndex: 5 });

    deck.bringForward(n1.id);
    expect(deck.getActiveSlide().nodes.find((n) => n.id === n1.id)?.zIndex).toBe(6);

    deck.sendBackward(n1.id);
    expect(deck.getActiveSlide().nodes.find((n) => n.id === n1.id)?.zIndex).toBe(5);
  });
});
