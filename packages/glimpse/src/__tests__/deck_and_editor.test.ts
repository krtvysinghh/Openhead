import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { GlimpseEditor } from '../editor';
import { executiveLight } from '../themes';

describe('GlimpseDeck & GlimpseEditor Core State Engine', () => {
  it('should initialize empty deck with 16:9 widescreen dimensions and title slide', () => {
    const deck = new GlimpseDeck();
    const model = deck.getModel();

    expect(model.dimensions.aspectRatio).toBe('16:9');
    expect(model.dimensions.width).toBe(1920);
    expect(model.dimensions.height).toBe(1080);
    expect(model.slides.length).toBe(1);
    expect(model.slides[0].title).toBe('Title Slide');
    expect(model.slides[0].notes).toBeDefined();
  });

  it('should add, duplicate, delete and reorder slides with transactional history', () => {
    const deck = new GlimpseDeck();
    const s2 = deck.addSlide('Product Roadmap');
    const s3 = deck.addSlide('Architecture');

    expect(deck.getModel().slides.length).toBe(3);
    expect(deck.getActiveSlide().id).toBe(s3.id);

    // Duplicate slide
    const dup = deck.duplicateSlide(s2.id);
    expect(dup).not.toBeNull();
    expect(deck.getModel().slides.length).toBe(4);
    expect(dup!.title).toBe('Product Roadmap (Copy)');

    // Reorder slides
    deck.reorderSlides(0, 3);
    expect(deck.getModel().slides[3].title).toBe('Title Slide');

    // Delete slide
    deck.deleteSlide(s2.id);
    expect(deck.getModel().slides.length).toBe(3);

    // Undo delete
    expect(deck.undo()).toBe(true);
    expect(deck.getModel().slides.length).toBe(4);

    // Redo delete
    expect(deck.redo()).toBe(true);
    expect(deck.getModel().slides.length).toBe(3);
  });

  it('should add typed nodes (text, shape, table, chart, image) and support copy-paste with offset', () => {
    const deck = new GlimpseDeck();
    const txt = deck.addTextNode({ text: 'Hello Glimpse', fontSize: 32 });
    const shp = deck.addShapeNode('rounded-rectangle', { fill: '#3b82f6', stroke: '#ffffff' });
    const tbl = deck.addTableNode(3, 4);
    const chrt = deck.addChartNode('bar', ['Q1', 'Q2'], [{ name: 'Growth', data: [10, 20] }]);
    const img = deck.addImageNode('https://example.com/logo.png', { alt: 'Company Logo' });

    expect(deck.getActiveSlide().nodes.length).toBe(7); // 2 default title nodes + 5 added
    expect(txt.type).toBe('text');
    expect(shp.type).toBe('shape');
    expect(tbl.type).toBe('table');
    expect(chrt.type).toBe('chart');
    expect(img.type).toBe('image');

    // Copy and paste
    deck.copyNodes([txt.id, shp.id]);
    const pasted = deck.pasteNodes(50, 50);

    expect(pasted.length).toBe(2);
    expect(pasted[0].x).toBe(txt.x + 50);
    expect(pasted[0].y).toBe(txt.y + 50);
    expect(pasted[0].id).not.toBe(txt.id);
  });

  it('should support slide notes, slide transitions, and theme application', () => {
    const deck = new GlimpseDeck();
    const activeSlide = deck.getActiveSlide();

    deck.updateSlideNotes(activeSlide.id, 'Emphasize data privacy and security guarantees.');
    expect(deck.getActiveSlide().notes).toBe('Emphasize data privacy and security guarantees.');

    deck.updateSlideTransition(activeSlide.id, { type: 'slide-left', duration: 300 });
    expect(deck.getActiveSlide().transition).toEqual({ type: 'slide-left', duration: 300 });

    deck.applyTheme(executiveLight);
    expect(deck.getModel().theme?.name).toBe('Executive Light');
  });

  it('should manage interactive presenter mode state and navigation', () => {
    const deck = new GlimpseDeck();
    deck.addSlide('Slide 2');
    deck.addSlide('Slide 3');

    const editor = new GlimpseEditor(deck);
    const state = editor.startPresenter();

    expect(state.isPlaying).toBe(true);
    expect(state.currentSlideIndex).toBe(0);
    expect(state.totalSlides).toBe(3);
    expect(state.nextSlide?.title).toBe('Slide 2');

    // Tick timer
    editor.tickPresenter(5);
    expect(editor.getPresenterState().elapsedSeconds).toBe(5);

    // Navigate next
    const nextState = editor.nextSlide();
    expect(nextState.currentSlideIndex).toBe(1);
    expect(nextState.currentSlide?.title).toBe('Slide 2');
    expect(nextState.nextSlide?.title).toBe('Slide 3');

    // Navigate prev
    const prevState = editor.prevSlide();
    expect(prevState.currentSlideIndex).toBe(0);

    // Stop presenter
    editor.stopPresenter();
    expect(editor.getPresenterState().isPlaying).toBe(false);
  });
});
