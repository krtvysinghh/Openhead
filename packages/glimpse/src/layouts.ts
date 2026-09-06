import { generateId } from '@openhead/core';
import { SlideModel, TextNode, ShapeNode } from './types';

export class SlideLayouts {
  public static createTwoColumnCompare(title: string = 'Comparison Layout'): SlideModel {
    const slideId = generateId('slide');
    const header: TextNode = {
      id: generateId('node'),
      type: 'text',
      x: 120,
      y: 80,
      width: 1680,
      height: 80,
      text: title,
      fontSize: 44,
      fontWeight: 'bold',
      color: '#ffffff',
      zIndex: 1,
    };

    const cardLeft: ShapeNode = {
      id: generateId('node'),
      type: 'shape',
      kind: 'card',
      x: 120,
      y: 220,
      width: 800,
      height: 720,
      fill: 'rgba(255,255,255,0.05)',
      stroke: 'rgba(255,255,255,0.15)',
      strokeWidth: 1,
      cornerRadius: 16,
      zIndex: 2,
    };

    const cardRight: ShapeNode = {
      id: generateId('node'),
      type: 'shape',
      kind: 'card',
      x: 1000,
      y: 220,
      width: 800,
      height: 720,
      fill: 'rgba(255,255,255,0.05)',
      stroke: 'rgba(255,255,255,0.15)',
      strokeWidth: 1,
      cornerRadius: 16,
      zIndex: 3,
    };

    return {
      id: slideId,
      title,
      background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
      nodes: [header, cardLeft, cardRight],
      transition: 'fade',
    };
  }
}
