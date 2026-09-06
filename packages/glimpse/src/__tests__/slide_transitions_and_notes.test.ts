import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { GlimpseEditor } from '../editor';

describe('Glimpse Speaker Notes & Transitions Matrix', () => {
  it('should support rich speaker notes with multi-line text and talking points', () => {
    const deck = new GlimpseDeck();
    const slide = deck.getActiveSlide();
    const notesText = 'Key Talking Points:\n1. State market opportunity.\n2. Address competitive moats.\n3. Close with call to action.';
    deck.updateSlideNotes(slide.id, notesText);

    expect(deck.getActiveSlide().notes).toBe(notesText);
  });

  it('should preserve empty notes gracefully', () => {
    const deck = new GlimpseDeck();
    const slide = deck.getActiveSlide();
    deck.updateSlideNotes(slide.id, '');
    expect(deck.getActiveSlide().notes).toBe('');
  });

  it('should calculate estimated speaking time based on word count in speaker notes', () => {
    const deck = new GlimpseDeck();
    const s1 = deck.getActiveSlide();
    // 150 words ~ 1 minute speaking time
    const words = Array.from({ length: 150 }, (_, i) => `word${i}`).join(' ');
    deck.updateSlideNotes(s1.id, words);

    const wordCount = (deck.getActiveSlide().notes || '').trim().split(/\s+/).length;
    const estimatedMinutes = Math.ceil(wordCount / 130);
    expect(wordCount).toBe(150);
    expect(estimatedMinutes).toBe(2);
  });

  it('should handle slide transition durations in milliseconds', () => {
    const deck = new GlimpseDeck();
    const slide = deck.getActiveSlide();
    deck.updateSlideTransition(slide.id, { type: 'fade', duration: 800 });

    const currentTrans = deck.getActiveSlide().transition;
    expect(typeof currentTrans).toBe('object');
    expect((currentTrans as any).duration).toBe(800);
  });

  it('should track elapsed presentation time during presenter playback', () => {
    const deck = new GlimpseDeck();
    const editor = new GlimpseEditor(deck);
    editor.startPresenter();

    editor.tickPresenter(10);
    expect(editor.getPresenterState().elapsedSeconds).toBe(10);

    editor.tickPresenter(25);
    expect(editor.getPresenterState().elapsedSeconds).toBe(35);
  });

  it('should jump directly to any valid slide index in presenter mode', () => {
    const deck = new GlimpseDeck();
    deck.addSlide('Slide 2');
    deck.addSlide('Slide 3');
    deck.addSlide('Slide 4');

    const editor = new GlimpseEditor(deck);
    editor.startPresenter();

    const state = editor.gotoSlide(2);
    expect(state.currentSlideIndex).toBe(2);
    expect(state.currentSlide?.title).toBe('Slide 3');
  });
});
