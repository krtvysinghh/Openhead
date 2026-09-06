import { BaseDocumentMetadata } from '@openhead/core';

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'bullet-list-item'
  | 'numbered-list-item'
  | 'table'
  | 'callout'
  | 'code-block'
  | 'image'
  | 'divider'
  | 'page-break';

export interface InlineStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  color?: string;
  highlight?: string;
  fontFamily?: string;
  fontSize?: number; // pt
  link?: string;
  math?: boolean;
}

export interface InlineText {
  id: string;
  text: string;
  styles?: InlineStyle;
}

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  inlines: InlineText[];
  align?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  inlines: InlineText[];
}

export interface ListItemBlock extends BaseBlock {
  type: 'bullet-list-item' | 'numbered-list-item';
  inlines: InlineText[];
  level: number;
}

export interface TableCell {
  id: string;
  inlines: InlineText[];
  align?: 'left' | 'center' | 'right';
  background?: string;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: TableCell[][];
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  variant: 'info' | 'warning' | 'tip' | 'note';
  inlines: InlineText[];
}

export interface CodeBlock extends BaseBlock {
  type: 'code-block';
  language: string;
  code: string;
}

export interface ImageBlock extends BaseBlock {
  type: 'image';
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
}

export interface PageBreakBlock extends BaseBlock {
  type: 'page-break';
}

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | ListItemBlock
  | TableBlock
  | CalloutBlock
  | CodeBlock
  | ImageBlock
  | DividerBlock
  | PageBreakBlock;

export interface PageSettings {
  orientation: 'portrait' | 'landscape';
  pageSize: 'A4' | 'Letter' | 'Legal';
  margins: { top: number; bottom: number; left: number; right: number };
  columns: number;
  headerText?: string;
  footerText?: string;
}

export interface Footnote {
  id: string;
  index: number;
  text: string;
}

export interface DocumentSection {
  id: string;
  title?: string;
  pageSettings: PageSettings;
  blocks: Block[];
  footnotes?: Footnote[];
}

export interface PenDocumentModel {
  metadata: BaseDocumentMetadata;
  sections: DocumentSection[];
}

export interface DocStats {
  words: number;
  characters: number;
  charactersWithoutSpaces: number;
  paragraphs: number;
  estimatedPages: number;
  readingTimeMinutes: number;
}

export interface OutlineItem {
  id: string;
  level: number;
  title: string;
}
