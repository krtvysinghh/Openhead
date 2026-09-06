import { generateId, HistoryStack, HistoryCommand } from '@openhead/core';
import {
  GlimpseDeckModel,
  SlideModel,
  SlideNode,
  TextNode,
  ShapeNode,
  ShapeKind,
  TableNode,
  ChartNode,
  ChartType,
  ImageNode,
  ThemeDefinition,
  SlideTransition,
} from './types';
import { defaultDark } from './themes';

export class GlimpseDeck {
  private model: GlimpseDeckModel;
  private history = new HistoryStack<GlimpseDeckModel>();
  private clipboardNodes: SlideNode[] = [];

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
      theme: defaultDark,
      slides: [
        {
          id: slideId,
          title: 'Title Slide',
          background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
          notes: 'Welcome everyone to the Openhead presentation.',
          nodes: [titleNode, subtitleNode],
          transition: { type: 'fade', duration: 400 },
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
      transition: { type: 'fade', duration: 400 },
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

  public addSlideFromLayout(layout: SlideModel): SlideModel {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));

    const clonedSlide: SlideModel = JSON.parse(JSON.stringify(layout));
    clonedSlide.id = generateId('slide');
    clonedSlide.nodes = clonedSlide.nodes.map((node) => ({
      ...node,
      id: generateId('node'),
    }));

    next.slides.push(clonedSlide);
    next.activeSlideId = clonedSlide.id;
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<GlimpseDeckModel> = {
      id: generateId('cmd'),
      name: `Add Slide (${layout.title})`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    return clonedSlide;
  }

  public duplicateSlide(slideId: string): SlideModel | null {
    const idx = this.model.slides.findIndex((s) => s.id === slideId);
    if (idx === -1) return null;

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));

    const original = next.slides[idx];
    const cloned: SlideModel = {
      ...JSON.parse(JSON.stringify(original)),
      id: generateId('slide'),
      title: `${original.title} (Copy)`,
      nodes: original.nodes.map((n: SlideNode) => ({ ...n, id: generateId('node') })),
    };

    next.slides.splice(idx + 1, 0, cloned);
    next.activeSlideId = cloned.id;
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<GlimpseDeckModel> = {
      id: generateId('cmd'),
      name: 'Duplicate Slide',
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    return cloned;
  }

  public toggleSlideHidden(slideId: string): boolean {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const slide = next.slides.find((s: SlideModel) => s.id === slideId);
    if (!slide) return false;

    slide.hidden = !slide.hidden;
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<GlimpseDeckModel> = {
      id: generateId('cmd'),
      name: slide.hidden ? 'Hide Slide' : 'Unhide Slide',
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    return !!slide.hidden;
  }

  public setDimensions(width: number, height: number, aspectRatio: '16:9' | '4:3' = '16:9'): void {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    next.dimensions = { width, height, aspectRatio };
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<GlimpseDeckModel> = {
      id: generateId('cmd'),
      name: `Set Aspect Ratio (${aspectRatio})`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
  }

  public deleteSlide(slideId: string): void {
    if (this.model.slides.length <= 1) return; // Keep at least one slide

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));

    const idx = next.slides.findIndex((s: SlideModel) => s.id === slideId);
    if (idx === -1) return;

    next.slides.splice(idx, 1);
    if (next.activeSlideId === slideId) {
      next.activeSlideId = next.slides[Math.max(0, idx - 1)].id;
    }
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<GlimpseDeckModel> = {
      id: generateId('cmd'),
      name: 'Delete Slide',
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
  }

  public reorderSlides(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.model.slides.length || toIndex < 0 || toIndex >= this.model.slides.length) {
      return;
    }

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));

    const [moved] = next.slides.splice(fromIndex, 1);
    next.slides.splice(toIndex, 0, moved);
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<GlimpseDeckModel> = {
      id: generateId('cmd'),
      name: 'Reorder Slides',
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
  }

  public updateSlideNotes(slideId: string, notes: string): void {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const slide = next.slides.find((s: SlideModel) => s.id === slideId);
    if (slide) {
      slide.notes = notes;
      next.metadata.updatedAt = Date.now();

      const cmd: HistoryCommand<GlimpseDeckModel> = {
        id: generateId('cmd'),
        name: 'Update Slide Notes',
        execute: () => next,
        undo: () => prev,
        timestamp: Date.now(),
      };
      this.model = this.history.execute(this.model, cmd);
    }
  }

  public updateSlideBackground(slideId: string, background: string): void {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const slide = next.slides.find((s: SlideModel) => s.id === slideId);
    if (slide) {
      slide.background = background;
      next.metadata.updatedAt = Date.now();

      const cmd: HistoryCommand<GlimpseDeckModel> = {
        id: generateId('cmd'),
        name: 'Update Slide Background',
        execute: () => next,
        undo: () => prev,
        timestamp: Date.now(),
      };
      this.model = this.history.execute(this.model, cmd);
    }
  }

  public updateSlideTransition(slideId: string, transition: SlideTransition | string): void {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const slide = next.slides.find((s: SlideModel) => s.id === slideId);
    if (slide) {
      slide.transition = transition;
      next.metadata.updatedAt = Date.now();

      const cmd: HistoryCommand<GlimpseDeckModel> = {
        id: generateId('cmd'),
        name: 'Update Slide Transition',
        execute: () => next,
        undo: () => prev,
        timestamp: Date.now(),
      };
      this.model = this.history.execute(this.model, cmd);
    }
  }

  public applyTheme(theme: ThemeDefinition): void {
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    next.theme = theme;
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<GlimpseDeckModel> = {
      id: generateId('cmd'),
      name: `Apply Theme (${theme.name})`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
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

  public addTextNode(options: Partial<TextNode>): TextNode {
    const defaultNode: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 200,
      y: 200,
      width: 600,
      height: 100,
      text: 'Double click to edit text',
      fontSize: 24,
      color: '#ffffff',
      zIndex: this.getNextZIndex(),
      ...options,
    };
    this.addNode(defaultNode);
    return defaultNode;
  }

  public addShapeNode(kind: ShapeKind, options: Partial<ShapeNode> = {}): ShapeNode {
    const defaultNode: ShapeNode = {
      id: generateId('node'),
      type: 'shape',
      kind,
      x: 300,
      y: 300,
      width: 240,
      height: 160,
      fill: '#3b82f6',
      stroke: 'rgba(255,255,255,0.2)',
      strokeWidth: 1,
      cornerRadius: kind === 'rounded-rectangle' ? 12 : 0,
      zIndex: this.getNextZIndex(),
      ...options,
    };
    this.addNode(defaultNode);
    return defaultNode;
  }

  public addShape(
    kind: ShapeKind,
    x: number = 300,
    y: number = 300,
    width: number = 240,
    height: number = 160,
    options: Partial<ShapeNode> = {}
  ): ShapeNode {
    return this.addShapeNode(kind, { x, y, width, height, ...options });
  }

  public addTableNode(rows: number = 3, cols: number = 3, options: Partial<TableNode> = {}): TableNode {
    const cells = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        id: generateId('cell'),
        text: `R${r + 1}C${c + 1}`,
        fill: r === 0 ? '#1e293b' : 'rgba(255,255,255,0.03)',
        align: 'left' as const,
      }))
    );

    const defaultNode: TableNode = {
      id: generateId('node'),
      type: 'table',
      x: 200,
      y: 200,
      width: 1000,
      height: 400,
      rows,
      columns: cols,
      cells,
      headerRow: true,
      zIndex: this.getNextZIndex(),
      ...options,
    };
    this.addNode(defaultNode);
    return defaultNode;
  }

  public addChartNode(
    chartType: ChartType = 'bar',
    categories: string[] = ['Q1', 'Q2', 'Q3', 'Q4'],
    series: Array<{ name: string; data: number[]; color?: string }> = [
      { name: 'Series 1', data: [10, 25, 45, 60], color: '#38bdf8' },
    ],
    options: Partial<ChartNode> = {}
  ): ChartNode {
    const defaultNode: ChartNode = {
      id: generateId('node'),
      type: 'chart',
      x: 200,
      y: 200,
      width: 900,
      height: 500,
      chartType,
      title: 'Chart Title',
      categories,
      series,
      showLegend: true,
      showDataLabels: true,
      zIndex: this.getNextZIndex(),
      ...options,
    };
    this.addNode(defaultNode);
    return defaultNode;
  }

  public addImageNode(src: string, options: Partial<ImageNode> = {}): ImageNode {
    const defaultNode: ImageNode = {
      id: generateId('node'),
      type: 'image',
      src,
      x: 200,
      y: 200,
      width: 640,
      height: 360,
      zIndex: this.getNextZIndex(),
      ...options,
    };
    this.addNode(defaultNode);
    return defaultNode;
  }

  public copyNodes(nodeIds: string[]): void {
    const slide = this.getActiveSlide();
    this.clipboardNodes = slide.nodes.filter((n) => nodeIds.includes(n.id)).map((n) => JSON.parse(JSON.stringify(n)));
  }

  public pasteNodes(offsetX: number = 40, offsetY: number = 40): SlideNode[] {
    if (this.clipboardNodes.length === 0) return [];
    const pasted: SlideNode[] = [];

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const slide = next.slides.find((s: SlideModel) => s.id === this.model.activeSlideId)!;
    const baseZ = this.getNextZIndex();

    this.clipboardNodes.forEach((node, idx) => {
      const cloned: SlideNode = {
        ...JSON.parse(JSON.stringify(node)),
        id: generateId('node'),
        x: node.x + offsetX,
        y: node.y + offsetY,
        zIndex: baseZ + idx,
      };
      slide.nodes.push(cloned);
      pasted.push(cloned);
    });

    next.metadata.updatedAt = Date.now();
    const cmd: HistoryCommand<GlimpseDeckModel> = {
      id: generateId('cmd'),
      name: `Paste ${pasted.length} nodes`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    return pasted;
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

  public bringToFront(nodeId: string): void {
    const slide = this.getActiveSlide();
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const targetSlide = next.slides.find((s: SlideModel) => s.id === slide.id)!;

    const maxZ = Math.max(...targetSlide.nodes.map((n: SlideNode) => n.zIndex || 0), 0);
    const node = targetSlide.nodes.find((n: SlideNode) => n.id === nodeId);
    if (node) {
      node.zIndex = maxZ + 1;
      next.metadata.updatedAt = Date.now();

      const cmd: HistoryCommand<GlimpseDeckModel> = {
        id: generateId('cmd'),
        name: `Bring to Front`,
        execute: () => next,
        undo: () => prev,
        timestamp: Date.now(),
      };
      this.model = this.history.execute(this.model, cmd);
    }
  }

  public sendToBack(nodeId: string): void {
    const slide = this.getActiveSlide();
    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const targetSlide = next.slides.find((s: SlideModel) => s.id === slide.id)!;

    const minZ = Math.min(...targetSlide.nodes.map((n: SlideNode) => n.zIndex || 0), 0);
    const node = targetSlide.nodes.find((n: SlideNode) => n.id === nodeId);
    if (node) {
      node.zIndex = Math.max(0, minZ - 1);
      next.metadata.updatedAt = Date.now();

      const cmd: HistoryCommand<GlimpseDeckModel> = {
        id: generateId('cmd'),
        name: `Send to Back`,
        execute: () => next,
        undo: () => prev,
        timestamp: Date.now(),
      };
      this.model = this.history.execute(this.model, cmd);
    }
  }

  public bringForward(nodeId: string): void {
    const slide = this.getActiveSlide();
    const node = slide.nodes.find((n) => n.id === nodeId);
    if (node) {
      this.updateNode(nodeId, { zIndex: (node.zIndex || 0) + 1 });
    }
  }

  public sendBackward(nodeId: string): void {
    const slide = this.getActiveSlide();
    const node = slide.nodes.find((n) => n.id === nodeId);
    if (node) {
      this.updateNode(nodeId, { zIndex: Math.max(0, (node.zIndex || 0) - 1) });
    }
  }

  public groupNodes(nodeIds: string[]): SlideNode | null {
    if (nodeIds.length < 2) return null;
    const slide = this.getActiveSlide();
    const nodesToGroup = slide.nodes.filter((n) => nodeIds.includes(n.id));
    if (nodesToGroup.length !== nodeIds.length) return null;

    const minX = Math.min(...nodesToGroup.map((n) => n.x));
    const minY = Math.min(...nodesToGroup.map((n) => n.y));
    const maxX = Math.max(...nodesToGroup.map((n) => n.x + n.width));
    const maxY = Math.max(...nodesToGroup.map((n) => n.y + n.height));

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const targetSlide = next.slides.find((s: SlideModel) => s.id === slide.id)!;

    const groupNode: SlideNode = {
      id: generateId('group'),
      type: 'group',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      zIndex: Math.max(...nodesToGroup.map((n) => n.zIndex || 1)),
      children: nodesToGroup,
    };

    targetSlide.nodes = targetSlide.nodes.filter((n: SlideNode) => !nodeIds.includes(n.id));
    targetSlide.nodes.push(groupNode);
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<GlimpseDeckModel> = {
      id: generateId('cmd'),
      name: `Group ${nodeIds.length} objects`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    return groupNode;
  }

  public ungroupNode(groupId: string): SlideNode[] | null {
    const slide = this.getActiveSlide();
    const group = slide.nodes.find((n) => n.id === groupId && n.type === 'group') as any;
    if (!group || !group.children) return null;

    const prev = JSON.parse(JSON.stringify(this.model));
    const next = JSON.parse(JSON.stringify(this.model));
    const targetSlide = next.slides.find((s: SlideModel) => s.id === slide.id)!;

    targetSlide.nodes = targetSlide.nodes.filter((n: SlideNode) => n.id !== groupId);
    for (const child of group.children) {
      targetSlide.nodes.push(child);
    }
    next.metadata.updatedAt = Date.now();

    const cmd: HistoryCommand<GlimpseDeckModel> = {
      id: generateId('cmd'),
      name: `Ungroup objects`,
      execute: () => next,
      undo: () => prev,
      timestamp: Date.now(),
    };
    this.model = this.history.execute(this.model, cmd);
    return group.children;
  }

  private getNextZIndex(): number {
    const slide = this.getActiveSlide();
    if (!slide || slide.nodes.length === 0) return 1;
    return Math.max(...slide.nodes.map((n) => n.zIndex || 0)) + 1;
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
