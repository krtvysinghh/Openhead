import { PenDocumentModel } from '../types';

export interface DocxPackageOptions {
  creator?: string;
  description?: string;
}

export class DocxAdapter {
  public static toWordprocessingML(doc: PenDocumentModel): string {
    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    xml += `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n`;
    xml += `  <w:body>\n`;

    for (const section of doc.sections) {
      for (const block of section.blocks) {
        if (block.type === 'heading') {
          xml += `    <w:p><w:pPr><w:pStyle w:val="Heading${block.level}"/></w:pPr>`;
          for (const inl of block.inlines) {
            xml += `<w:r><w:t>${escapeXml(inl.text)}</w:t></w:r>`;
          }
          xml += `</w:p>\n`;
        } else if (block.type === 'paragraph') {
          xml += `    <w:p>`;
          for (const inl of block.inlines) {
            const isBold = inl.styles?.bold;
            const isItalic = inl.styles?.italic;
            xml += `<w:r>`;
            if (isBold || isItalic) {
              xml += `<w:rPr>`;
              if (isBold) xml += `<w:b/>`;
              if (isItalic) xml += `<w:i/>`;
              xml += `</w:rPr>`;
            }
            xml += `<w:t>${escapeXml(inl.text)}</w:t></w:r>`;
          }
          xml += `</w:p>\n`;
        }
      }
    }

    xml += `  </w:body>\n</w:document>`;
    return xml;
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
