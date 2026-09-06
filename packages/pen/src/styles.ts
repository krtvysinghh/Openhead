import { NamedStyle, ParagraphProperties, InlineStyle } from './types';

export const DEFAULT_PEN_STYLES: Record<string, NamedStyle> = {
  Normal: {
    id: 'Normal',
    name: 'Normal',
    type: 'paragraph',
    paragraphProps: {
      align: 'left',
      lineSpacing: 1.15,
      spacingBefore: 0,
      spacingAfter: 6,
      widowControl: true,
    },
    inlineStyles: {
      fontFamily: 'Calibri',
      fontSize: 11,
      color: '#000000',
    },
  },
  Title: {
    id: 'Title',
    name: 'Title',
    type: 'paragraph',
    basedOn: 'Normal',
    paragraphProps: {
      align: 'left',
      lineSpacing: 1.15,
      spacingBefore: 12,
      spacingAfter: 12,
      keepWithNext: true,
    },
    inlineStyles: {
      fontFamily: 'Calibri',
      fontSize: 26,
      bold: true,
      color: '#0F172A',
    },
  },
  Subtitle: {
    id: 'Subtitle',
    name: 'Subtitle',
    type: 'paragraph',
    basedOn: 'Normal',
    paragraphProps: {
      align: 'left',
      lineSpacing: 1.15,
      spacingBefore: 0,
      spacingAfter: 16,
      keepWithNext: true,
    },
    inlineStyles: {
      fontFamily: 'Calibri',
      fontSize: 14,
      color: '#64748B',
    },
  },
  Heading1: {
    id: 'Heading1',
    name: 'Heading 1',
    type: 'paragraph',
    basedOn: 'Normal',
    paragraphProps: {
      align: 'left',
      lineSpacing: 1.15,
      spacingBefore: 14,
      spacingAfter: 6,
      keepWithNext: true,
    },
    inlineStyles: {
      fontFamily: 'Calibri',
      fontSize: 20,
      bold: true,
      color: '#1E3A8A',
    },
  },
  Heading2: {
    id: 'Heading2',
    name: 'Heading 2',
    type: 'paragraph',
    basedOn: 'Normal',
    paragraphProps: {
      align: 'left',
      lineSpacing: 1.15,
      spacingBefore: 12,
      spacingAfter: 4,
      keepWithNext: true,
    },
    inlineStyles: {
      fontFamily: 'Calibri',
      fontSize: 16,
      bold: true,
      color: '#1E40AF',
    },
  },
  Heading3: {
    id: 'Heading3',
    name: 'Heading 3',
    type: 'paragraph',
    basedOn: 'Normal',
    paragraphProps: {
      align: 'left',
      lineSpacing: 1.15,
      spacingBefore: 8,
      spacingAfter: 3,
      keepWithNext: true,
    },
    inlineStyles: {
      fontFamily: 'Calibri',
      fontSize: 13,
      bold: true,
      color: '#2563EB',
    },
  },
  Heading4: {
    id: 'Heading4',
    name: 'Heading 4',
    type: 'paragraph',
    basedOn: 'Normal',
    paragraphProps: {
      align: 'left',
      lineSpacing: 1.15,
      spacingBefore: 6,
      spacingAfter: 2,
      keepWithNext: true,
    },
    inlineStyles: {
      fontFamily: 'Calibri',
      fontSize: 11,
      bold: true,
      italic: true,
      color: '#3B82F6',
    },
  },
  Heading5: {
    id: 'Heading5',
    name: 'Heading 5',
    type: 'paragraph',
    basedOn: 'Normal',
    paragraphProps: {
      align: 'left',
      lineSpacing: 1.15,
      spacingBefore: 4,
      spacingAfter: 2,
      keepWithNext: true,
    },
    inlineStyles: {
      fontFamily: 'Calibri',
      fontSize: 11,
      bold: true,
      color: '#64748B',
    },
  },
  Heading6: {
    id: 'Heading6',
    name: 'Heading 6',
    type: 'paragraph',
    basedOn: 'Normal',
    paragraphProps: {
      align: 'left',
      lineSpacing: 1.15,
      spacingBefore: 4,
      spacingAfter: 2,
      keepWithNext: true,
    },
    inlineStyles: {
      fontFamily: 'Calibri',
      fontSize: 10,
      italic: true,
      color: '#64748B',
    },
  },
  Quote: {
    id: 'Quote',
    name: 'Quote',
    type: 'paragraph',
    basedOn: 'Normal',
    paragraphProps: {
      align: 'left',
      lineSpacing: 1.2,
      spacingBefore: 8,
      spacingAfter: 8,
      leftIndent: 24,
      rightIndent: 24,
    },
    inlineStyles: {
      fontFamily: 'Georgia',
      fontSize: 11,
      italic: true,
      color: '#475569',
    },
  },
  FootnoteText: {
    id: 'FootnoteText',
    name: 'Footnote Text',
    type: 'paragraph',
    basedOn: 'Normal',
    paragraphProps: {
      align: 'left',
      lineSpacing: 1.0,
      spacingBefore: 0,
      spacingAfter: 2,
    },
    inlineStyles: {
      fontFamily: 'Calibri',
      fontSize: 9,
      color: '#334155',
    },
  },
  Header: {
    id: 'Header',
    name: 'Header',
    type: 'paragraph',
    basedOn: 'Normal',
    paragraphProps: {
      align: 'left',
      lineSpacing: 1.0,
      spacingAfter: 0,
    },
    inlineStyles: {
      fontFamily: 'Calibri',
      fontSize: 9,
      color: '#64748B',
    },
  },
  Footer: {
    id: 'Footer',
    name: 'Footer',
    type: 'paragraph',
    basedOn: 'Normal',
    paragraphProps: {
      align: 'left',
      lineSpacing: 1.0,
      spacingAfter: 0,
    },
    inlineStyles: {
      fontFamily: 'Calibri',
      fontSize: 9,
      color: '#64748B',
    },
  },
};

export class StylesManager {
  public static resolveEffectiveStyles(
    styleId: string | undefined,
    customProps?: ParagraphProperties,
    customInlines?: InlineStyle,
    stylesCatalog: Record<string, NamedStyle> = DEFAULT_PEN_STYLES
  ): { paragraph: ParagraphProperties; inline: InlineStyle } {
    let baseParagraph: ParagraphProperties = { ...DEFAULT_PEN_STYLES.Normal.paragraphProps };
    let baseInline: InlineStyle = { ...DEFAULT_PEN_STYLES.Normal.inlineStyles };

    if (styleId && stylesCatalog[styleId]) {
      const targetStyle = stylesCatalog[styleId];
      if (targetStyle.basedOn && stylesCatalog[targetStyle.basedOn]) {
        const parent = stylesCatalog[targetStyle.basedOn];
        baseParagraph = { ...baseParagraph, ...parent.paragraphProps };
        baseInline = { ...baseInline, ...parent.inlineStyles };
      }
      baseParagraph = { ...baseParagraph, ...targetStyle.paragraphProps };
      baseInline = { ...baseInline, ...targetStyle.inlineStyles };
    }

    return {
      paragraph: { ...baseParagraph, ...customProps },
      inline: { ...baseInline, ...customInlines },
    };
  }
}
