import { describe, it, expect } from 'vitest';
import { GlimpseDeck } from '../deck';
import { SlideMasterManager } from '../masters';
import { AnimationTimelineManager } from '../animations';
import { ConnectorManager } from '../connectors';

describe('Glimpse Slide Masters, Animations & Connectors', () => {
  it('should instantiate slides from master layouts with standard placeholders', () => {
    const deck = new GlimpseDeck();
    const master = SlideMasterManager.createDefaultMaster();
    expect(master.layouts.length).toBeGreaterThanOrEqual(3);

    const slide = SlideMasterManager.instantiateSlideFromLayout(
      deck.getModel(),
      'layout_two_column',
      'Market Analysis'
    );

    expect(slide.title).toBe('Market Analysis');
    expect(slide.layoutId).toBe('layout_two_column');
    expect(slide.nodes.length).toBe(3); // 1 title + 2 column body nodes
    expect(slide.nodes[0].type).toBe('text');
  });

  it('should manage slide animations and reordering', () => {
    const deck = new GlimpseDeck();
    const slide = deck.addSlide('Animated Slide');
    const shape = deck.addShape('rectangle', 100, 100, 200, 200);

    const anim1 = AnimationTimelineManager.addAnimation(slide, shape.id, 'fade', 'onClick', 500);
    const anim2 = AnimationTimelineManager.addAnimation(slide, shape.id, 'fly-in', 'afterPrevious', 300);

    expect(slide.animations?.length).toBe(2);
    expect(anim1.type).toBe('fade');
    expect(anim2.type).toBe('fly-in');

    // Test reorder
    const moved = AnimationTimelineManager.moveAnimation(slide, 0, 1);
    expect(moved).toBe(true);
    expect(slide.animations![0].type).toBe('fly-in');

    // Test delete
    const deleted = AnimationTimelineManager.deleteAnimation(slide, anim1.id);
    expect(deleted).toBe(true);
    expect(slide.animations?.length).toBe(1);
  });

  it('should create smart connector lines between two slide shapes', () => {
    const deck = new GlimpseDeck();
    deck.addSlide('Flowchart');
    const shapeA = deck.addShape('rectangle', 100, 100, 200, 100);
    const shapeB = deck.addShape('rectangle', 500, 100, 200, 100);

    const conn = ConnectorManager.createConnector(shapeA, shapeB, 'elbow', '#6366F1', 3);
    expect(conn.type).toBe('connector');
    expect(conn.startNodeId).toBe(shapeA.id);
    expect(conn.endNodeId).toBe(shapeB.id);
    expect(conn.startX).toBe(300); // shapeA.x + shapeA.width
    expect(conn.endX).toBe(500); // shapeB.x
    expect(conn.endArrow).toBe(true);
  });
});
