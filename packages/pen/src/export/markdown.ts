import { PenDocumentModel, Block, HeadingBlock, ParagraphBlock, ListItemBlock, CodeBlock } from '../types';
import { generateId } from '@openhead/core';

export function exportToMarkdown(doc: PenDocumentModel): string {
  const lines: string[] = [];

  for (const section of doc.sections) {
    for (const block of section.blocks) {
      switch (block.type) {
        case 'heading': {
          const h = block as HeadingBlock;
          const prefix = '#'.repeat(h.level);
          const text = h.inlines.map((i) => formatInline(i.text, i.styles)).join('');
          lines.push(`${prefix} ${text}\n`);
          break;
        }
        case 'paragraph': {
          const p = block as ParagraphBlock;
          const text = p.inlines.map((i) => formatInline(i.text, i.styles)).join('');
          lines.push(`${text}\n`);
          break;
        }
        case 'bullet-list-item': {
          const l = block as ListItemBlock;
          const indent = '  '.repeat(l.level);
          const text = l.inlines.map((i) => formatInline(i.text, i.styles)).join('');
          lines.push(`${indent}- ${text}`);
          break;
        }
        case 'numbered-list-item': {
          const l = block as ListItemBlock;
          const indent = '  '.repeat(l.level);
          const text = l.inlines.map((i) => formatInline(i.text, i.styles)).join('');
          lines.push(`${indent}1. ${text}`);
          break;
        }
        case 'code-block': {
          const c = block as CodeBlock;
          lines.push(`\`\`\`${c.language || ''}\n${c.code}\n\`\`\`\n`);
          break;
        }
        case 'divider': {
          lines.push(`---\n`);
          break;
        }
        default:
          break;
      }
    }
  }

  return lines.join('\n');
}

function formatInline(text: string, styles?: any): string {
  if (!styles) return text;
  let res = text;
  if (styles.code) res = `\`${res}\``;
  if (styles.bold) res = `**${res}**`;
  if (styles.italic) res = `*${res}*`;
  if (styles.strikethrough) res = `~~${res}~~`;
  if (styles.link) res = `[${res}](${styles.link})`;
  return res;
}

export function importFromMarkdown(markdown: string, title: string = 'Imported Document'): PenDocumentModel {
  const blocks: Block[] = [];
  const lines = markdown.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#+)\s*(.*)$/);
      if (match) {
        const level = Math.min(match[1].length, 6) as 1 | 2 | 3 | 4 | 5 | 6;
        blocks.push({
          id: generateId('blk'),
          type: 'heading',
          level,
          inlines: [{ id: generateId('inl'), text: match[2] }],
        });
        continue;
      }
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      blocks.push({
        id: generateId('blk'),
        type: 'bullet-list-item',
        level: 0,
        inlines: [{ id: generateId('inl'), text: trimmed.slice(2) }],
      });
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const text = trimmed.replace(/^\d+\.\s*/, '');
      blocks.push({
        id: generateId('blk'),
        type: 'numbered-list-item',
        level: 0,
        inlines: [{ id: generateId('inl'), text }],
      });
      continue;
    }

    if (trimmed === '---') {
      blocks.push({ id: generateId('blk'), type: 'divider' });
      continue;
    }

    // Default paragraph
    blocks.push({
      id: generateId('blk'),
      type: 'paragraph',
      inlines: [{ id: generateId('inl'), text: trimmed }],
    });
  }

  return {
    metadata: {
      id: generateId('doc'),
      title,
      type: 'pen',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    },
    sections: [
      {
        id: generateId('sec'),
        pageSettings: {
          orientation: 'portrait',
          pageSize: 'A4',
          margins: { top: 25, bottom: 25, left: 25, right: 25 },
          columns: 1,
        },
        blocks,
      },
    ],
  };
}
