import { describe, it, expect } from 'vitest';
import { PenDocument, exportToMarkdown, importFromMarkdown } from '../index';

describe('Pen Markdown Interop, Callouts & Code Blocks', () => {
  it('should export and import document with headings and code blocks to Markdown', () => {
    const doc = new PenDocument();
    doc.setTitle('Markdown Architecture Doc');
    doc.insertBlock(0, 1, {
      id: 'h1',
      type: 'heading',
      level: 1,
      inlines: [{ id: 'i1', text: 'System Architecture' }],
    });
    doc.insertBlock(0, 2, {
      id: 'cb1',
      type: 'code-block',
      language: 'typescript',
      code: 'const answer: number = 42;\nconsole.log(answer);',
    });

    const md = exportToMarkdown(doc.getModel());
    expect(md).toContain('# System Architecture');
    expect(md).toContain('```typescript');
    expect(md).toContain('console.log(answer);');

    const reimported = importFromMarkdown(md, 'Imported MD');
    expect(reimported.sections[0].blocks.length).toBeGreaterThanOrEqual(2);
  });

  it('should export and import callout notes to and from Markdown blockquotes', () => {
    const doc = new PenDocument();
    doc.insertBlock(0, 1, {
      id: 'callout1',
      type: 'callout',
      variant: 'tip',
      inlines: [{ id: 'ci1', text: 'Tip: Always verify OOXML schemas before exporting.' }],
    });

    const md = exportToMarkdown(doc.getModel());
    expect(md).toContain('> Tip: Always verify OOXML schemas before exporting.');

    const reimported = importFromMarkdown(md, 'Callout Doc');
    expect(reimported.sections[0].blocks[1].type).toBe('callout');
  });

  it('should export bullet and numbered list items to Markdown with level indentation', () => {
    const doc = new PenDocument();
    doc.insertBlock(0, 1, {
      id: 'li1',
      type: 'bullet-list-item',
      level: 0,
      inlines: [{ id: 'i1', text: 'Level 0 bullet' }],
    });
    doc.insertBlock(0, 2, {
      id: 'li2',
      type: 'bullet-list-item',
      level: 1,
      inlines: [{ id: 'i2', text: 'Level 1 nested bullet' }],
    });

    const md = exportToMarkdown(doc.getModel());
    expect(md).toContain('- Level 0 bullet');
    expect(md).toContain('  - Level 1 nested bullet');
  });
});
