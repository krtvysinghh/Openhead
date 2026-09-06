import { SlideNode } from './types';

export class AlignmentEngine {
  public static alignNodes(nodes: SlideNode[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): SlideNode[] {
    if (nodes.length < 2) return nodes;

    const minX = Math.min(...nodes.map((n) => n.x));
    const maxX = Math.max(...nodes.map((n) => n.x + n.width));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxY = Math.max(...nodes.map((n) => n.y + n.height));

    return nodes.map((node) => {
      const cloned = { ...node };
      switch (alignment) {
        case 'left':
          cloned.x = minX;
          break;
        case 'center':
          cloned.x = minX + (maxX - minX) / 2 - cloned.width / 2;
          break;
        case 'right':
          cloned.x = maxX - cloned.width;
          break;
        case 'top':
          cloned.y = minY;
          break;
        case 'middle':
          cloned.y = minY + (maxY - minY) / 2 - cloned.height / 2;
          break;
        case 'bottom':
          cloned.y = maxY - cloned.height;
          break;
      }
      return cloned;
    });
  }

  public static distributeNodes(nodes: SlideNode[], direction: 'horizontal' | 'vertical'): SlideNode[] {
    if (nodes.length < 3) return nodes;

    const sorted = [...nodes].sort((a, b) => (direction === 'horizontal' ? a.x - b.x : a.y - b.y));

    if (direction === 'horizontal') {
      const startX = sorted[0].x;
      const endX = sorted[sorted.length - 1].x;
      const totalSpan = endX - startX;
      const step = totalSpan / (sorted.length - 1);

      return sorted.map((node, idx) => ({
        ...node,
        x: startX + idx * step,
      }));
    } else {
      const startY = sorted[0].y;
      const endY = sorted[sorted.length - 1].y;
      const totalSpan = endY - startY;
      const step = totalSpan / (sorted.length - 1);

      return sorted.map((node, idx) => ({
        ...node,
        y: startY + idx * step,
      }));
    }
  }
}
