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

export type UnderlineStyle = 'single' | 'double' | 'dotted' | 'dashed' | 'none';
export type HighlightColor =
  | 'yellow'
  | 'green'
  | 'cyan'
  | 'magenta'
  | 'blue'
  | 'red'
  | 'darkBlue'
  | 'darkCyan'
  | 'darkGreen'
  | 'darkMagenta'
  | 'darkRed'
  | 'darkYellow'
  | 'darkGray'
  | 'lightGray'
  | 'black';

export interface FieldDefinition {
  type: 'PAGE' | 'NUMPAGES' | 'DATE' | 'TITLE';
  value?: string;
  format?: string;
}

export interface InlineStyle {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean | UnderlineStyle;
  strikethrough?: boolean;
  code?: boolean;
  color?: string; // RGB hex, e.g. "#1E293B"
  highlight?: HighlightColor | string;
  fontFamily?: string;
  fontSize?: number; // pt (e.g. 11, 12, 14, 18, 24)
  superscript?: boolean;
  subscript?: boolean;
  characterSpacing?: number; // pt
  link?: string;
  math?: boolean;
  field?: FieldDefinition;
  footnoteRefId?: string;
}

export interface InlineText {
  id: string;
  text: string;
  styles?: InlineStyle;
}

export interface ParagraphProperties {
  align?: 'left' | 'center' | 'right' | 'justify';
  lineSpacing?: number; // 1.0, 1.15, 1.5, 2.0
  spacingBefore?: number; // pt
  spacingAfter?: number; // pt
  firstLineIndent?: number; // pt
  leftIndent?: number; // pt
  rightIndent?: number; // pt
  keepWithNext?: boolean;
  widowControl?: boolean;
  styleId?: string; // e.g. "Normal", "Title", "Subtitle", "Heading1", "Heading2", "Quote"
}

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface ParagraphBlock extends BaseBlock {
  type: 'paragraph';
  inlines: InlineText[];
  props?: ParagraphProperties;
  align?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  inlines: InlineText[];
  props?: ParagraphProperties;
}

export interface ListItemBlock extends BaseBlock {
  type: 'bullet-list-item' | 'numbered-list-item';
  inlines: InlineText[];
  level: number; // 0 to 8
  startNumber?: number;
  bulletChar?: string;
  props?: ParagraphProperties;
}

export interface TableCellBorder {
  style?: 'single' | 'double' | 'dashed' | 'dotted' | 'thick' | 'none';
  color?: string;
  width?: number; // pt
}

export interface TableCellBorders {
  top?: boolean | TableCellBorder;
  bottom?: boolean | TableCellBorder;
  left?: boolean | TableCellBorder;
  right?: boolean | TableCellBorder;
}

export interface TableCell {
  id: string;
  inlines: InlineText[];
  align?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'center' | 'bottom';
  background?: string; // hex
  gridSpan?: number; // colSpan
  rowSpan?: number;
  borders?: TableCellBorders;
  width?: number;
  height?: number;
}

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers?: string[];
  rows: TableCell[][];
  colWidths?: number[];
  alignment?: 'left' | 'center' | 'right';
  hasHeaderRow?: boolean;
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  variant: 'info' | 'warning' | 'tip' | 'note';
  inlines: InlineText[];
  props?: ParagraphProperties;
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
  altText?: string;
  width?: number;
  height?: number;
  align?: 'left' | 'center' | 'right';
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
  margins: { top: number; bottom: number; left: number; right: number }; // mm
  columns: number;
  headerText?: string;
  footerText?: string;
  firstPageDifferent?: boolean;
  firstPageHeaderText?: string;
  firstPageFooterText?: string;
  evenPageHeaderText?: string;
  evenPageFooterText?: string;
}

export interface Footnote {
  id: string;
  index: number;
  text: string;
  inlines?: InlineText[];
  type?: 'footnote' | 'endnote';
}

export interface NamedStyle {
  id: string;
  name: string;
  type: 'paragraph' | 'character';
  basedOn?: string;
  nextStyle?: string;
  paragraphProps?: ParagraphProperties;
  inlineStyles?: InlineStyle;
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
  styles?: Record<string, NamedStyle>;
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
  blockIndex: number;
  sectionIndex: number;
}
