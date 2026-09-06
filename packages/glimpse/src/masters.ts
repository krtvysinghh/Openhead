import { SlideMaster, SlideLayoutDefinition, SlideModel, GlimpseDeckModel } from './types';

export class SlideMasterManager {
  /**
   * Generates a default modern slide master with standard layouts.
   */
  public static createDefaultMaster(): SlideMaster {
    const standardLayouts: SlideLayoutDefinition[] = [
      {
        id: 'layout_title',
        name: 'Title Slide',
        placeholders: [
          { id: 'ph_title', type: 'title', x: 160, y: 380, width: 1600, height: 160 },
          { id: 'ph_sub', type: 'subtitle', x: 160, y: 560, width: 1600, height: 100 },
        ],
      },
      {
        id: 'layout_content',
        name: 'Title and Content',
        placeholders: [
          { id: 'ph_title', type: 'title', x: 100, y: 80, width: 1720, height: 120 },
          { id: 'ph_body', type: 'body', x: 100, y: 220, width: 1720, height: 760 },
          { id: 'ph_footer', type: 'footer', x: 100, y: 1000, width: 800, height: 40 },
          { id: 'ph_num', type: 'slideNumber', x: 1720, y: 1000, width: 100, height: 40 },
        ],
      },
      {
        id: 'layout_two_column',
        name: 'Two Column Comparison',
        placeholders: [
          { id: 'ph_title', type: 'title', x: 100, y: 80, width: 1720, height: 120 },
          { id: 'ph_col1', type: 'body', x: 100, y: 220, width: 830, height: 760 },
          { id: 'ph_col2', type: 'body', x: 990, y: 220, width: 830, height: 760 },
        ],
      },
    ];

    return {
      id: 'master_default',
      name: 'Default Modern Theme Master',
      background: '#0F172A',
      layouts: standardLayouts,
    };
  }

  /**
   * Applies master layout placeholders to create a typed slide model.
   */
  public static instantiateSlideFromLayout(
    deck: GlimpseDeckModel,
    layoutId: string,
    slideTitle: string
  ): SlideModel {
    const master = deck.masters?.[0] || this.createDefaultMaster();
    const layout = master.layouts.find((l) => l.id === layoutId) || master.layouts[1];

    const slide: SlideModel = {
      id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: slideTitle,
      layoutId: layout.id,
      background: master.background,
      nodes: [],
    };

    // Instantiate placeholder nodes
    let z = 1;
    for (const ph of layout.placeholders) {
      if (ph.type === 'title') {
        slide.nodes.push({
          id: `node_${ph.id}_${Date.now()}`,
          type: 'text',
          x: ph.x,
          y: ph.y,
          width: ph.width,
          height: ph.height,
          zIndex: z++,
          text: slideTitle,
          fontSize: 40,
          fontWeight: 'bold',
          color: '#FFFFFF',
          align: 'left',
        });
      } else if (ph.type === 'body') {
        slide.nodes.push({
          id: `node_${ph.id}_${Date.now()}`,
          type: 'text',
          x: ph.x,
          y: ph.y,
          width: ph.width,
          height: ph.height,
          zIndex: z++,
          text: '• Click to add content\n• Second key bullet point\n• Supporting detail',
          fontSize: 22,
          color: '#CBD5E1',
          align: 'left',
        });
      }
    }

    return slide;
  }
}
