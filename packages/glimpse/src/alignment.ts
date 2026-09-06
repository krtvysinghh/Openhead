import { SlideNode } from './types';

export interface AlignmentBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  distance: number;
}

export class AlignmentEngine {
  /**
   * Aligns a collection of nodes relative to their bounding box or explicit slide bounds.
   */
  public static alignNodes(
    nodes: SlideNode[],
    alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom',
    bounds?: AlignmentBounds
  ): SlideNode[] {
    if (nodes.length === 0) return [];
    if (nodes.length === 1 && !bounds) return nodes;

    const minX = bounds ? bounds.x : Math.min(...nodes.map((n) => n.x));
    const maxX = bounds ? bounds.x + bounds.width : Math.max(...nodes.map((n) => n.x + n.width));
    const minY = bounds ? bounds.y : Math.min(...nodes.map((n) => n.y));
    const maxY = bounds ? bounds.y + bounds.height : Math.max(...nodes.map((n) => n.y + n.height));

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

  /**
   * Evenly distributes nodes along the horizontal or vertical axis.
   */
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
        x: Math.round(startX + idx * step),
      }));
    } else {
      const startY = sorted[0].y;
      const endY = sorted[sorted.length - 1].y;
      const totalSpan = endY - startY;
      const step = totalSpan / (sorted.length - 1);

      return sorted.map((node, idx) => ({
        ...node,
        y: Math.round(startY + idx * step),
      }));
    }
  }

  /**
   * Detects snapping candidates against existing nodes within a pixel threshold.
   */
  public static calculateSnapGuides(
    target: { x: number; y: number; width: number; height: number },
    otherNodes: SlideNode[],
    threshold: number = 8
  ): { snapX?: number; snapY?: number; guides: SnapGuide[] } {
    const guides: SnapGuide[] = [];
    let snapX: number | undefined;
    let snapY: number | undefined;

    const targetLeft = target.x;
    const targetCenterX = target.x + target.width / 2;
    const targetRight = target.x + target.width;

    const targetTop = target.y;
    const targetCenterY = target.y + target.height / 2;
    const targetBottom = target.y + target.height;

    for (const node of otherNodes) {
      const nodeLeft = node.x;
      const nodeCenterX = node.x + node.width / 2;
      const nodeRight = node.x + node.width;

      const nodeTop = node.y;
      const nodeCenterY = node.y + node.height / 2;
      const nodeBottom = node.y + node.height;

      // X checks: left edge to left/right edge
      if (Math.abs(targetLeft - nodeLeft) <= threshold) {
        snapX = nodeLeft;
        guides.push({ type: 'vertical', position: nodeLeft, distance: Math.abs(targetLeft - nodeLeft) });
      } else if (Math.abs(targetLeft - nodeRight) <= threshold) {
        snapX = nodeRight;
        guides.push({ type: 'vertical', position: nodeRight, distance: Math.abs(targetLeft - nodeRight) });
      } else if (Math.abs(targetCenterX - nodeCenterX) <= threshold) {
        snapX = nodeCenterX - target.width / 2;
        guides.push({ type: 'vertical', position: nodeCenterX, distance: Math.abs(targetCenterX - nodeCenterX) });
      } else if (Math.abs(targetRight - nodeRight) <= threshold) {
        snapX = nodeRight - target.width;
        guides.push({ type: 'vertical', position: nodeRight, distance: Math.abs(targetRight - nodeRight) });
      } else if (Math.abs(targetRight - nodeLeft) <= threshold) {
        snapX = nodeLeft - target.width;
        guides.push({ type: 'vertical', position: nodeLeft, distance: Math.abs(targetRight - nodeLeft) });
      }

      // Y checks: top edge to top/bottom edge
      if (Math.abs(targetTop - nodeTop) <= threshold) {
        snapY = nodeTop;
        guides.push({ type: 'horizontal', position: nodeTop, distance: Math.abs(targetTop - nodeTop) });
      } else if (Math.abs(targetTop - nodeBottom) <= threshold) {
        snapY = nodeBottom;
        guides.push({ type: 'horizontal', position: nodeBottom, distance: Math.abs(targetTop - nodeBottom) });
      } else if (Math.abs(targetCenterY - nodeCenterY) <= threshold) {
        snapY = nodeCenterY - target.height / 2;
        guides.push({ type: 'horizontal', position: nodeCenterY, distance: Math.abs(targetCenterY - nodeCenterY) });
      } else if (Math.abs(targetBottom - nodeBottom) <= threshold) {
        snapY = nodeBottom - target.height;
        guides.push({ type: 'horizontal', position: nodeBottom, distance: Math.abs(targetBottom - nodeBottom) });
      } else if (Math.abs(targetBottom - nodeTop) <= threshold) {
        snapY = nodeTop - target.height;
        guides.push({ type: 'horizontal', position: nodeTop, distance: Math.abs(targetBottom - nodeTop) });
      }
    }

    return { snapX, snapY, guides };
  }
}
