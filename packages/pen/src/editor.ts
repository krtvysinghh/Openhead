import { generateId } from '@openhead/core';
import {
  InlineText,
  InlineStyle,
} from './types';


export class PenEditorOperations {
  /**
   * Splits and formats a character range within an array of InlineText runs.
   */
  public static formatInlineRange(
    inlines: InlineText[],
    startChar: number,
    endChar: number,
    stylePatch: Partial<InlineStyle>
  ): InlineText[] {
    if (startChar >= endChar || inlines.length === 0) {
      return JSON.parse(JSON.stringify(inlines));
    }

    const segments = this.decomposeInlines(inlines);
    const result: InlineText[] = [];

    for (const seg of segments) {
      // Check overlap between [seg.start, seg.end] and [startChar, endChar]
      const overlapStart = Math.max(seg.start, startChar);
      const overlapEnd = Math.min(seg.end, endChar);

      if (overlapStart < overlapEnd) {
        // There is an overlap
        // 1. Portion before overlap
        if (seg.start < overlapStart) {
          result.push({
            id: generateId('inl'),
            text: seg.text.substring(0, overlapStart - seg.start),
            styles: seg.styles ? { ...seg.styles } : undefined,
          });
        }
        // 2. Overlapping portion with styles merged
        const styledPortion = seg.text.substring(
          overlapStart - seg.start,
          overlapEnd - seg.start
        );
        const mergedStyles: InlineStyle = {
          ...(seg.styles || {}),
          ...stylePatch,
        };
        // Clean up undefined properties
        for (const key of Object.keys(mergedStyles) as (keyof InlineStyle)[]) {
          if (mergedStyles[key] === undefined || mergedStyles[key] === false) {
            delete mergedStyles[key];
          }
        }

        result.push({
          id: generateId('inl'),
          text: styledPortion,
          styles: Object.keys(mergedStyles).length > 0 ? mergedStyles : undefined,
        });

        // 3. Portion after overlap
        if (overlapEnd < seg.end) {
          result.push({
            id: generateId('inl'),
            text: seg.text.substring(overlapEnd - seg.start),
            styles: seg.styles ? { ...seg.styles } : undefined,
          });
        }
      } else {
        // No overlap
        result.push({
          id: generateId('inl'),
          text: seg.text,
          styles: seg.styles ? { ...seg.styles } : undefined,
        });
      }
    }

    return this.mergeAdjacentInlines(result);
  }

  /**
   * Decomposes inlines into character position segments.
   */
  private static decomposeInlines(inlines: InlineText[]): Array<{
    start: number;
    end: number;
    text: string;
    styles?: InlineStyle;
  }> {
    const segments = [];
    let currentOffset = 0;
    for (const inl of inlines) {
      const len = inl.text.length;
      segments.push({
        start: currentOffset,
        end: currentOffset + len,
        text: inl.text,
        styles: inl.styles,
      });
      currentOffset += len;
    }
    return segments;
  }

  /**
   * Merges adjacent inline runs that share identical style properties.
   */
  public static mergeAdjacentInlines(inlines: InlineText[]): InlineText[] {
    if (inlines.length <= 1) return inlines;
    const merged: InlineText[] = [];

    for (const current of inlines) {
      if (current.text.length === 0) continue;
      if (merged.length === 0) {
        merged.push({ ...current });
        continue;
      }
      const prev = merged[merged.length - 1];
      if (this.areStylesEqual(prev.styles, current.styles) && !prev.styles?.field && !current.styles?.field) {
        prev.text += current.text;
      } else {
        merged.push({ ...current });
      }
    }
    return merged.length > 0 ? merged : [{ id: generateId('inl'), text: '' }];
  }

  /**
   * Deep equality check for inline styles.
   */
  public static areStylesEqual(a?: InlineStyle, b?: InlineStyle): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return (
      !!a.bold === !!b.bold &&
      !!a.italic === !!b.italic &&
      a.underline === b.underline &&
      !!a.strikethrough === !!b.strikethrough &&
      !!a.code === !!b.code &&
      a.color === b.color &&
      a.highlight === b.highlight &&
      a.fontFamily === b.fontFamily &&
      a.fontSize === b.fontSize &&
      !!a.superscript === !!b.superscript &&
      !!a.subscript === !!b.subscript &&
      a.characterSpacing === b.characterSpacing &&
      a.link === b.link &&
      a.footnoteRefId === b.footnoteRefId
    );
  }

  /**
   * Inserts text at a specific character offset within an inlines array.
   */
  public static insertTextAt(
    inlines: InlineText[],
    offset: number,
    text: string,
    styles?: InlineStyle
  ): InlineText[] {
    if (inlines.length === 0) {
      return [{ id: generateId('inl'), text, styles }];
    }
    let cur = 0;
    const result: InlineText[] = [];
    let inserted = false;

    for (const inl of inlines) {
      const nextCur = cur + inl.text.length;
      if (!inserted && offset >= cur && offset <= nextCur) {
        const splitIdx = offset - cur;
        const left = inl.text.substring(0, splitIdx);
        const right = inl.text.substring(splitIdx);
        if (left) result.push({ id: generateId('inl'), text: left, styles: inl.styles });
        result.push({
          id: generateId('inl'),
          text,
          styles: styles !== undefined ? styles : inl.styles,
        });
        if (right) result.push({ id: generateId('inl'), text: right, styles: inl.styles });
        inserted = true;
      } else {
        result.push({ ...inl });
      }
      cur = nextCur;
    }

    if (!inserted) {
      result.push({ id: generateId('inl'), text, styles });
    }

    return this.mergeAdjacentInlines(result);
  }

  /**
   * Deletes a range of characters [startChar, endChar] from inlines array.
   */
  public static deleteRange(
    inlines: InlineText[],
    startChar: number,
    endChar: number
  ): InlineText[] {
    if (startChar >= endChar) return inlines;
    const segments = this.decomposeInlines(inlines);
    const result: InlineText[] = [];

    for (const seg of segments) {
      if (seg.end <= startChar || seg.start >= endChar) {
        // Outside deletion range
        result.push({ id: generateId('inl'), text: seg.text, styles: seg.styles });
      } else if (seg.start < startChar && seg.end > endChar) {
        // Range inside this segment
        const left = seg.text.substring(0, startChar - seg.start);
        const right = seg.text.substring(endChar - seg.start);
        result.push({ id: generateId('inl'), text: left + right, styles: seg.styles });
      } else if (seg.start < startChar) {
        // Starts before, ends inside
        result.push({
          id: generateId('inl'),
          text: seg.text.substring(0, startChar - seg.start),
          styles: seg.styles,
        });
      } else if (seg.end > endChar) {
        // Starts inside, ends after
        result.push({
          id: generateId('inl'),
          text: seg.text.substring(endChar - seg.start),
          styles: seg.styles,
        });
      }
    }

    return this.mergeAdjacentInlines(result);
  }

  /**
   * Extracts total plain text from inlines.
   */
  public static getPlainText(inlines: InlineText[]): string {
    return inlines.map((i) => i.text).join('');
  }
}
