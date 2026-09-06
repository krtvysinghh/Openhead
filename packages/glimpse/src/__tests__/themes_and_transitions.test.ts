import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { DEFAULT_THEMES, emeraldModern } from '../themes';
import { PptxAdapter } from '../export/pptx';

describe('Glimpse Theme Definitions & Slide Transitions', () => {
  it('should define comprehensive theme color palettes and typography', () => {
    expect(DEFAULT_THEMES.defaultDark.primaryColor).toBe('#6366F1');
    expect(DEFAULT_THEMES.executiveLight.backgroundColor).toBe('#FFFFFF');
    expect(DEFAULT_THEMES.emeraldModern.primaryColor).toBe('#10B981');
    expect(DEFAULT_THEMES.sunsetMinimal.primaryColor).toBe('#F97316');
  });

  it('should switch deck themes dynamically and preserve theme state', () => {
    const deck = new GlimpseDeck();
    expect(deck.getModel().theme?.id).toBe('defaultDark');

    deck.applyTheme(emeraldModern);
    expect(deck.getModel().theme?.id).toBe('emeraldModern');
    expect(deck.getModel().theme?.accentColor).toBe('#F59E0B');

    // Undo theme change
    deck.undo();
    expect(deck.getModel().theme?.id).toBe('defaultDark');
  });

  it('should serialize slide transitions (fade, push, wipe, zoom) into OOXML presentation', () => {
    const deck = new GlimpseDeck();
    const s1 = deck.getActiveSlide();
    s1.transition = 'fade';

    const s2 = deck.addSlide('Slide 2');
    s2.transition = { type: 'push', duration: 500 };

    const s3 = deck.addSlide('Slide 3');
    s3.transition = 'wipe';

    const s4 = deck.addSlide('Slide 4');
    s4.transition = 'zoom';

    const xml1 = PptxAdapter.toSlideXml(s1, 1);
    const xml2 = PptxAdapter.toSlideXml(s2, 2);
    const xml3 = PptxAdapter.toSlideXml(s3, 3);
    const xml4 = PptxAdapter.toSlideXml(s4, 4);

    expect(xml1).toContain('<p:fade/>');
    expect(xml2).toContain('<p:push/>');
    expect(xml3).toContain('<p:wipe/>');
    expect(xml4).toContain('<p:zoom/>');
  });
});
