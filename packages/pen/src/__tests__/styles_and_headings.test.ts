import { describe, it, expect } from 'vitest';
import { PenDocument, StylesManager } from '../index';

describe('Pen Named Styles & Document Hierarchy', () => {
  it('should resolve effective styles with inheritance from Normal style', () => {
    const effectiveH1 = StylesManager.resolveEffectiveStyles('Heading1');
    expect(effectiveH1.paragraph.keepWithNext).toBe(true);
    expect(effectiveH1.inline.fontSize).toBe(20);
    expect(effectiveH1.inline.bold).toBe(true);

    const effectiveCustom = StylesManager.resolveEffectiveStyles('Normal', { align: 'center' }, { color: '#FF0000' });
    expect(effectiveCustom.paragraph.align).toBe('center');
    expect(effectiveCustom.inline.color).toBe('#FF0000');
  });

  it('should apply styles and convert between paragraph and headings seamlessly', () => {
    const doc = new PenDocument();
    doc.setBlockStyle(0, 1, 'Heading2');
    const block = doc.getModel().sections[0].blocks[1];
    expect(block.type).toBe('heading');
    expect((block as any).level).toBe(2);

    doc.setBlockStyle(0, 1, 'Quote');
    const blockQuote = doc.getModel().sections[0].blocks[1];
    expect((blockQuote as any).props?.styleId).toBe('Quote');
  });
});
