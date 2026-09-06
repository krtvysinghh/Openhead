import { BaseDocumentMetadata } from '@openhead/core';

export type NodeType = 'text' | 'shape' | 'image' | 'group';

export interface BaseNode {
  id: string;
  type: NodeType;
  x: number; // px from slide left
  y: number; // px from slide top
  width: number;
  height: number;
  rotation?: number; // degrees
  opacity?: number;
  zIndex: number;
  locked?: boolean;
}

export interface TextNode extends BaseNode {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color: string;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
}

export type ShapeKind = 'rectangle' | 'circle' | 'triangle' | 'badge' | 'card';

export interface ShapeNode extends BaseNode {
  type: 'shape';
  kind: ShapeKind;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  cornerRadius?: number;
}

export interface ImageNode extends BaseNode {
  type: 'image';
  src: string;
  alt?: string;
  aspectRatio?: number;
}

export type SlideNode = TextNode | ShapeNode | ImageNode;

export interface SlideModel {
  id: string;
  title: string;
  background: string;
  notes?: string;
  nodes: SlideNode[];
  transition?: 'none' | 'fade' | 'slide-left' | 'slide-up' | 'zoom';
}

export interface DeckDimensions {
  width: number; // e.g., 1920
  height: number; // e.g., 1080
  aspectRatio: '16:9' | '4:3';
}

export interface GlimpseDeckModel {
  metadata: BaseDocumentMetadata;
  dimensions: DeckDimensions;
  slides: SlideModel[];
  activeSlideId: string;
}
