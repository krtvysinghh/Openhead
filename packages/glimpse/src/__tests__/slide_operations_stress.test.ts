import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';

describe('Glimpse Slide Operations & Scale Robustness', () => {
  it('should support creating, reordering and mutating 100 slides smoothly', () => {
    const deck = new GlimpseDeck();

    for (let i = 1; i <= 100; i++) {
      deck.addSlide(`Slide ${i}`);
    }
    expect(deck.getModel().slides.length).toBe(101);

    // Reorder first to middle
    deck.reorderSlides(0, 50);
    expect(deck.getModel().slides[50].title).toBe('Title Slide');

    // Delete first 10
    for (let i = 0; i < 10; i++) {
      const firstId = deck.getModel().slides[0].id;
      deck.deleteSlide(firstId);
    }
    expect(deck.getModel().slides.length).toBe(91);
  });

  it('should maintain activeSlideId integrity when deleting active slides', () => {
    const deck = new GlimpseDeck();
    const s1 = deck.getActiveSlide().id;
    const s2 = deck.addSlide('Slide 2').id;
    const s3 = deck.addSlide('Slide 3').id;

    deck.setActiveSlide(s3);
    expect(deck.getModel().activeSlideId).toBe(s3);

    // Delete active slide s3
    deck.deleteSlide(s3);
    expect(deck.getModel().activeSlideId).toBe(s2);

    // Delete active slide s2
    deck.deleteSlide(s2);
    expect(deck.getModel().activeSlideId).toBe(s1);

    // Try deleting last slide (should be no-op)
    deck.deleteSlide(s1);
    expect(deck.getModel().slides.length).toBe(1);
  });
});
