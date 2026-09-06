import { ConnectorNode, SlideNode } from './types';

export class ConnectorManager {
  /**
   * Creates a connector line linking two slide shapes.
   */
  public static createConnector(
    sourceNode: SlideNode,
    targetNode: SlideNode,
    style: 'straight' | 'elbow' | 'curved' = 'elbow',
    strokeColor: string = '#6366F1',
    strokeWidth: number = 2
  ): ConnectorNode {
    // Connect center-right of source to center-left of target
    const startX = sourceNode.x + sourceNode.width;
    const startY = sourceNode.y + sourceNode.height / 2;
    const endX = targetNode.x;
    const endY = targetNode.y + targetNode.height / 2;

    const minX = Math.min(startX, endX);
    const minY = Math.min(startY, endY);
    const width = Math.max(Math.abs(endX - startX), 10);
    const height = Math.max(Math.abs(endY - startY), 10);

    const connector: ConnectorNode = {
      id: `conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: 'connector',
      startNodeId: sourceNode.id,
      endNodeId: targetNode.id,
      startX,
      startY,
      endX,
      endY,
      x: minX,
      y: minY,
      width,
      height,
      zIndex: Math.max(sourceNode.zIndex, targetNode.zIndex) + 1,
      style,
      strokeColor,
      strokeWidth,
      startArrow: false,
      endArrow: true,
    };

    return connector;
  }
}
