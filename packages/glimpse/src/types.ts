import { BaseDocumentMetadata } from '@openhead/core';

export type NodeType = 'text' | 'shape' | 'image' | 'table' | 'chart' | 'group';

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

export interface TextRun {
  id: string;
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number; // pt (e.g. 18, 24, 32, 44)
  fontFamily?: string;
  color?: string; // hex RGB
  highlight?: string;
  link?: string;
}

export interface Paragraph {
  id: string;
  runs: TextRun[];
  align?: 'left' | 'center' | 'right' | 'justify';
  lineSpacing?: number;
  bullet?: boolean;
  numbered?: boolean;
}

export interface TextNode extends BaseNode {
  type: 'text';
  paragraphs?: Paragraph[];
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
}

export type ShapeKind =
  | 'rectangle'
  | 'rounded-rectangle'
  | 'circle'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'star'
  | 'callout'
  | 'badge'
  | 'card';

export interface ShapeNode extends BaseNode {
  type: 'shape';
  kind: ShapeKind;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDash?: 'solid' | 'dashed' | 'dotted';
  cornerRadius?: number;
  text?: string;
  paragraphs?: Paragraph[];
  textColor?: string;
  fontSize?: number;
}

export interface TableCell {
  id: string;
  text?: string;
  runs?: TextRun[];
  fill?: string;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface TableNode extends BaseNode {
  type: 'table';
  rows: number;
  columns: number;
  cells: TableCell[][];
  colWidths?: number[];
  rowHeights?: number[];
  headerRow?: boolean;
}

export type ChartType = 'bar' | 'column' | 'line' | 'pie' | 'area';

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface ChartNode extends BaseNode {
  type: 'chart';
  chartType: ChartType;
  title?: string;
  categories: string[];
  series: ChartSeries[];
  showLegend?: boolean;
  showDataLabels?: boolean;
}

export interface ImageNode extends BaseNode {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
  aspectRatio?: number;
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface GroupNode extends BaseNode {
  type: 'group';
  children: SlideNode[];
}

export type SlideNode = TextNode | ShapeNode | ImageNode | TableNode | ChartNode | GroupNode;

export interface ThemeDefinition {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  headingFont: string;
  bodyFont: string;
}

export type SlideTransitionType = 'none' | 'fade' | 'push' | 'wipe' | 'zoom' | 'slide-left' | 'slide-up';

export interface SlideTransition {
  type: SlideTransitionType;
  duration?: number; // ms
}

export interface SlideModel {
  id: string;
  title: string;
  layoutId?: string;
  background: string;
  notes?: string;
  nodes: SlideNode[];
  transition?: SlideTransition | SlideTransitionType;
  hidden?: boolean;
}

export interface DeckDimensions {
  width: number; // e.g. 1920 or 960
  height: number; // e.g. 1080 or 540
  aspectRatio: '16:9' | '4:3';
}

export interface GlimpseDeckModel {
  metadata: BaseDocumentMetadata;
  dimensions: DeckDimensions;
  theme?: ThemeDefinition;
  slides: SlideModel[];
  activeSlideId: string;
}
