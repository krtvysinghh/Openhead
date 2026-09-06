import { OutlineItem, PenDocumentModel, HeadingBlock, ParagraphBlock } from './types';

export class OutlineGenerator {
  /**
   * Extracts hierarchical outline items from document headings.
   */
  public static generateOutline(doc: PenDocumentModel): OutlineItem[] {
    const outline: OutlineItem[] = [];

    doc.sections.forEach((section, sIdx) => {
      section.blocks.forEach((block, bIdx) => {
        if (block.type === 'heading') {
          const heading = block as HeadingBlock;
          const text = heading.inlines.map((i) => i.text).join('').trim();
          if (text) {
            outline.push({
              id: heading.id,
              level: heading.level,
              title: text,
              blockIndex: bIdx,
              sectionIndex: sIdx,
            });
          }
        }
      });
    });

    return outline;
  }

  /**
   * Generates a Table of Contents as formatted paragraphs.
   */
  public static generateTableOfContents(doc: PenDocumentModel): ParagraphBlock[] {
    const outline = this.generateOutline(doc);
    return outline.map((item) => {
      const indent = (item.level - 1) * 20;
      return {
        id: `toc_${item.id}`,
        type: 'paragraph',
        props: {
          leftIndent: indent,
          spacingAfter: 4,
        },
        inlines: [
          {
            id: `toc_in_${item.id}`,
            text: `${item.title}`,
            styles: {
              bold: item.level === 1,
              color: item.level === 1 ? '#1E293B' : '#475569',
            },
          },
        ],
      };
    });
  }
}
