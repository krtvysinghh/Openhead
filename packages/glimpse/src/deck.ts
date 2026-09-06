import { generateId, HistoryStack, HistoryCommand } from '@openhead/core';
import { GlimpseDeckModel, SlideModel, SlideNode, TextNode } from './types';

export class GlimpseDeck {
  private model: GlimpseDeckModel;
  private history = new HistoryStack<GlimpseDeckModel>();

  constructor(initialModel?: GlimpseDeckModel) {
    if (initialModel) {
      this.model = JSON.parse(JSON.stringify(initialModel));
    } else {
      this.model = GlimpseDeck.createEmpty('Untitled Presentation');
    }
  }

  public static createEmpty(title: string = 'Untitled Presentation'): GlimpseDeckModel {
    const slideId = generateId('slide');
    const titleNode: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 160,
      y: 360,
      width: 1600,
      height: 120,
      text: title,
      fontSize: 56,
      fontWeight: 'bold',
      color: '#ffffff',
      align: 'center',
      zIndex: 1,
    };
    const subtitleNode: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 160,
      y: 500,
      width: 1600,
      height: 80,
      text: 'Created with Openhead Glimpse',
      fontSize: 28,
      color: '#94a3b8',
      align: 'center',
      zIndex: 2,
    };

    return {
      metadata: {
        id: generateId('deck'),
        title,
        type: 'glimpse',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      dimensions: {
        width: 1920,
        height: 1080,
        aspectRatio: '16:9',
      },
      slides: [
        {
          id: slideId,
          title: 'Title Slide',
          background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
          notes: 'Welcome everyone to the Openhead presentation.',
          nodes: [titleNode, subtitleNode],
          transition: 'fade',
        },
      ],
      activeSlideId: slideId,
    };
  }

  public getModel(): GlimpseDeckModel {
    return this.model;
  }

  public getActiveSlide(): SlideModel {
    return this.model.slides.find((s) => s.id === this.model.activeSlideId) || this.model.slides[0];
  }

  public setActiveSlide(slideId: string): void {
    if (this.model.slides.some((s) => s.id === slideId)) {
      this.model.activeSlideId = slideId;
    }
  }

  public addSlide(title: string = 'New Slide'): SlideModel {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));

    const newSlide: SlideModel = {
      id: generateId('slide'),
      title,
      background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
      nodes: [
        {
          id: generateId('node'),
          type: 'text',
          x: 120,
          y: 100,
          width: 1680,
          height: 80,
          text: title,
          fontSize: 44,
          fontWeight: 'bold',
          color: '#ffffff',
          align: 'left',
          zIndex: 1,
        } as TextNode,
      ],
      transition: 'fade',
    };

    next.slides.push(newSlide);
    next.activeSlideId = newSlide.id;
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<GlimpseDeckModel> = {
      id: generateId('cmd'),
      name: 'Add Slide',
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    return newSlide;
  }

  public addNode(node: SlideNode): void {
    const slide = this.getActiveSlide();
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const targetSlide = next.slides.find((s: SlideModel) => s.id === slide.id)!;

    targetSlide.nodes.push(node);
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<GlimpseDeckModel> = {
      id: generateId('cmd'),
      name: `Add ${node.type} node`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
  }

  public updateNode(nodeId: string, updates: Partial<SlideNode>): void {
    const slide = this.getActiveSlide();
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const targetSlide = next.slides.find((s: SlideModel) => s.id === slide.id)!;

    const idx = targetSlide.nodes.findIndex((n: SlideNode) => n.id === nodeId);
    if (idx !== -1) {
      targetSlide.nodes[idx] = { ...targetSlide.nodes[idx], ...updates } as SlideNode;
      next.metadata.updatedAt = Date.now();

      const cmd: HistoryCommand<GlimpseDeckModel> = {
        id: generateId('cmd'),
        name: `Update node`,
        execute: () => next,
        undo: () => prev,
        timestamp: Date.now(),
      };
      this.model = this.history.execute(this.model, cmd);
    }
  }

  public deleteNode(nodeId: string): void {
    const slide = this.getActiveSlide();
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const targetSlide = next.slides.find((s: SlideModel) => s.id === slide.id)!;

    targetSlide.nodes = targetSlide.nodes.filter((n: SlideNode) => n.id !== nodeId);
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<GlimpseDeckModel> = {
      id: generateId('cmd'),
      name: `Delete node`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
  }

  public undo(): boolean {
    if (!this.history.canUndo) return false;
    const res = this.history.undo(this.model);
    this.model = res.state;
    return true;
  }

  public redo(): boolean {
    if (!this.history.canRedo) return false;
    const res = this.history.redo(this.model);
    this.model = res.state;
    return true;
  }
}
