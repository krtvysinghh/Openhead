import { describe, it, expect } from 'vitest';
import { GlimpseDeck, SlideLayouts } from '@openhead/glimpse';

describe('Office Compatibility Lab - PPTX & Presentation Scene Graph', () => {
  it('should generate compliant 16:9 presentation dimensions and shape hierarchy', () => {
    const deck = new GlimpseDeck();
    deck.addSlide('Market Trends 2026');
    const layout = SlideLayouts.createTwoColumnCompare('Growth Drivers');
    deck.getModel().slides.push(layout);

    expect(deck.getModel().dimensions.aspectRatio).toBe('16:9');
    expect(deck.getModel().dimensions.width).toBe(1920);
    expect(deck.getModel().dimensions.height).toBe(1080);
    expect(deck.getModel().slides.length).toBe(3);
  });
});
