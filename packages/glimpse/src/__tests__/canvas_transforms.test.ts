import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';

describe('GlimpseDeck - Slide Duplication & Reordering', () => {
  it('should duplicate a slide with distinct IDs and undo support', () => {
    const deck = new GlimpseDeck();
    const slideId = deck.getActiveSlide().id;

    const duplicated = deck.duplicateSlide(slideId);
    expect(duplicated).not.toBeNull();
    expect(deck.getModel().slides.length).toBe(2);
    expect(duplicated?.id).not.toBe(slideId);

    deck.undo();
    expect(deck.getModel().slides.length).toBe(1);
  });

  it('should reorder slides properly with undo support', () => {
    const deck = new GlimpseDeck();
    deck.addSlide('Slide Two');
    deck.addSlide('Slide Three');

    expect(deck.getModel().slides[0].title).toBe('Title Slide');
    expect(deck.getModel().slides[1].title).toBe('Slide Two');
    expect(deck.getModel().slides[2].title).toBe('Slide Three');

    // Move Slide Three to index 0
    deck.reorderSlides(2, 0);
    expect(deck.getModel().slides[0].title).toBe('Slide Three');

    deck.undo();
    expect(deck.getModel().slides[0].title).toBe('Title Slide');
  });
});
