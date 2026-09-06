import { GlimpseDeck } from './deck';
import { GlimpseDeckModel, SlideModel, SlideNode } from './types';

export interface PresenterState {
  isPlaying: boolean;
  currentSlideIndex: number;
  totalSlides: number;
  elapsedSeconds: number;
  currentSlide: SlideModel | null;
  nextSlide: SlideModel | null;
  speakerNotes: string;
}

export class GlimpseEditor {
  private deck: GlimpseDeck;
  private elapsedSeconds: number = 0;
  private isPresenterPlaying: boolean = false;
  private selectedNodeIds: Set<string> = new Set();

  constructor(deck?: GlimpseDeck) {
    this.deck = deck || new GlimpseDeck();
  }

  public getDeck(): GlimpseDeck {
    return this.deck;
  }

  public getModel(): GlimpseDeckModel {
    return this.deck.getModel();
  }

  // Selection management
  public selectNode(nodeId: string, multiSelect: boolean = false): void {
    if (!multiSelect) {
      this.selectedNodeIds.clear();
    }
    this.selectedNodeIds.add(nodeId);
  }

  public deselectNode(nodeId: string): void {
    this.selectedNodeIds.delete(nodeId);
  }

  public clearSelection(): void {
    this.selectedNodeIds.clear();
  }

  public getSelectedNodeIds(): string[] {
    return Array.from(this.selectedNodeIds);
  }

  public getSelectedNodes(): SlideNode[] {
    const slide = this.deck.getActiveSlide();
    return slide.nodes.filter((n) => this.selectedNodeIds.has(n.id));
  }

  // Presenter Mode
  public startPresenter(startFromBeginning: boolean = true): PresenterState {
    this.isPresenterPlaying = true;
    this.elapsedSeconds = 0;
    const model = this.deck.getModel();
    if (startFromBeginning && model.slides.length > 0) {
      this.deck.setActiveSlide(model.slides[0].id);
    }
    return this.getPresenterState();
  }

  public stopPresenter(): void {
    this.isPresenterPlaying = false;
  }

  public tickPresenter(secondsDelta: number = 1): void {
    if (this.isPresenterPlaying) {
      this.elapsedSeconds += secondsDelta;
    }
  }

  public nextSlide(): PresenterState {
    const model = this.deck.getModel();
    const currIdx = model.slides.findIndex((s) => s.id === model.activeSlideId);
    if (currIdx < model.slides.length - 1) {
      this.deck.setActiveSlide(model.slides[currIdx + 1].id);
    }
    return this.getPresenterState();
  }

  public prevSlide(): PresenterState {
    const model = this.deck.getModel();
    const currIdx = model.slides.findIndex((s) => s.id === model.activeSlideId);
    if (currIdx > 0) {
      this.deck.setActiveSlide(model.slides[currIdx - 1].id);
    }
    return this.getPresenterState();
  }

  public gotoSlide(index: number): PresenterState {
    const model = this.deck.getModel();
    if (index >= 0 && index < model.slides.length) {
      this.deck.setActiveSlide(model.slides[index].id);
    }
    return this.getPresenterState();
  }

  public getPresenterState(): PresenterState {
    const model = this.deck.getModel();
    const currIdx = Math.max(0, model.slides.findIndex((s) => s.id === model.activeSlideId));
    const currentSlide = model.slides[currIdx] || null;
    const nextSlide = currIdx + 1 < model.slides.length ? model.slides[currIdx + 1] : null;

    return {
      isPlaying: this.isPresenterPlaying,
      currentSlideIndex: currIdx,
      totalSlides: model.slides.length,
      elapsedSeconds: this.elapsedSeconds,
      currentSlide,
      nextSlide,
      speakerNotes: currentSlide?.notes || 'No speaker notes for this slide.',
    };
  }
}
