import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { ShapeNode } from '../types';

describe('GlimpseDeck', () => {
  it('should create default deck with title slide and scene nodes', () => {
    const deck = new GlimpseDeck();
    const model = deck.getModel();
    expect(model.slides.length).toBe(1);
    expect(model.dimensions.width).toBe(1920);
    expect(model.dimensions.height).toBe(1080);
    expect(model.slides[0].nodes.length).toBe(2);
  });

  it('should add slides and support undo/redo', () => {
    const deck = new GlimpseDeck();
    deck.addSlide('Architecture Overview');
    expect(deck.getModel().slides.length).toBe(2);
    expect(deck.getActiveSlide().title).toBe('Architecture Overview');

    deck.undo();
    expect(deck.getModel().slides.length).toBe(1);

    deck.redo();
    expect(deck.getModel().slides.length).toBe(2);
  });

  it('should add, update, and remove scene nodes', () => {
    const deck = new GlimpseDeck();
    const cardNode: ShapeNode = {
      id: 'node-card-1',
      type: 'shape',
      kind: 'card',
      x: 200,
      y: 200,
      width: 400,
      height: 300,
      fill: 'rgba(255,255,255,0.08)',
      stroke: 'rgba(255,255,255,0.2)',
      strokeWidth: 1,
      cornerRadius: 12,
      zIndex: 3,
    };

    deck.addNode(cardNode);
    expect(deck.getActiveSlide().nodes.length).toBe(3);

    deck.updateNode('node-card-1', { width: 500 });
    const found = deck.getActiveSlide().nodes.find((n) => n.id === 'node-card-1') as ShapeNode;
    expect(found.width).toBe(500);

    deck.deleteNode('node-card-1');
    expect(deck.getActiveSlide().nodes.length).toBe(2);
  });
});
