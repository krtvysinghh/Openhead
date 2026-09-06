import { describe, it, expect } from 'vitest';
import { PenDocument } from '../document';
import { exportToMarkdown, importFromMarkdown } from '../export/markdown';
import { DocxAdapter } from '../export/docx';

describe('PenDocument', () => {
  it('should initialize an empty document and calculate stats', () => {
    const doc = new PenDocument();
    const stats = doc.getStats();
    expect(stats.words).toBeGreaterThan(0);
    expect(stats.paragraphs).toBe(2);
    expect(doc.getModel().metadata.title).toBe('Untitled Document');
  });

  it('should extract outline headings accurately', () => {
    const doc = new PenDocument();
    const outline = doc.getOutline();
    expect(outline.length).toBe(1);
    expect(outline[0].title).toBe('Untitled Document');
    expect(outline[0].level).toBe(1);
  });

  it('should export and import Markdown correctly', () => {
    const mdInput = `# Openhead Architecture\n\nPen is a powerful document editor.\n\n- Feature 1\n- Feature 2`;
    const imported = importFromMarkdown(mdInput, 'Architecture Doc');
    expect(imported.sections[0].blocks.length).toBe(4);

    const exported = exportToMarkdown(imported);
    expect(exported).toContain('# Openhead Architecture');
    expect(exported).toContain('- Feature 1');
  });

  it('should generate valid WordprocessingML schema XML for DOCX export', () => {
    const doc = new PenDocument();
    const xml = DocxAdapter.toWordprocessingML(doc.getModel());
    expect(xml).toContain('<w:document');
    expect(xml).toContain('Heading1');
    expect(xml).toContain('Untitled Document');
  });
});
