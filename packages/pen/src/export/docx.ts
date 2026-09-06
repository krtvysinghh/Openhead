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
            const isUnderline = inl.styles?.underline;
            xml += `<w:r>`;
            if (isBold || isItalic || isUnderline) {
              xml += `<w:rPr>`;
              if (isBold) xml += `<w:b/>`;
              if (isItalic) xml += `<w:i/>`;
              if (isUnderline) xml += `<w:u w:val="single"/>`;
              xml += `</w:rPr>`;
            }
            xml += `<w:t>${escapeXml(inl.text)}</w:t></w:r>`;
          }
          xml += `</w:p>\n`;
        } else if (block.type === 'table') {
          xml += `    <w:tbl>\n`;
          xml += `      <w:tblPr><w:tblW w:w="0" w:type="auto"/></w:tblPr>\n`;
          if (block.headers && block.headers.length > 0) {
            xml += `      <w:tr>\n`;
            for (const header of block.headers) {
              xml += `        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(header)}</w:t></w:r></w:p></w:tc>\n`;
            }
            xml += `      </w:tr>\n`;
          }
          for (const row of block.rows) {
            xml += `      <w:tr>\n`;
            for (const cell of row) {
              xml += `        <w:tc><w:p>`;
              for (const inl of cell.inlines) {
                xml += `<w:r><w:t>${escapeXml(inl.text)}</w:t></w:r>`;
              }
              xml += `</w:p></w:tc>\n`;
            }
            xml += `      </w:tr>\n`;
          }
          xml += `    </w:tbl>\n`;
        } else if (block.type === 'bullet-list-item' || block.type === 'numbered-list-item') {
          xml += `    <w:p><w:pPr><w:numPr><w:ilvl w:val="${block.level || 0}"/></w:numPr></w:pPr>`;
          for (const inl of block.inlines) {
            xml += `<w:r><w:t>${escapeXml(inl.text)}</w:t></w:r>`;
          }
          xml += `</w:p>\n`;
        } else if (block.type === 'callout') {
          xml += `    <w:p><w:pPr><w:pStyle w:val="Quote"/></w:pPr>`;
          for (const inl of block.inlines) {
            xml += `<w:r><w:t>${escapeXml(inl.text)}</w:t></w:r>`;
          }
          xml += `</w:p>\n`;
        } else if (block.type === 'code-block') {
          xml += `    <w:p><w:pPr><w:pStyle w:val="Code"/></w:pPr>`;
          xml += `<w:r><w:t>${escapeXml(block.code)}</w:t></w:r>`;
          xml += `</w:p>\n`;
        }
      }

      // Footnotes
      if (section.footnotes && section.footnotes.length > 0) {
        for (const fn of section.footnotes) {
          xml += `    <w:p><w:pPr><w:pStyle w:val="FootnoteText"/></w:pPr>`;
          xml += `<w:r><w:rPr><w:rStyle w:val="FootnoteReference"/></w:rPr><w:footnoteRef/></w:r>`;
          xml += `<w:r><w:t xml:space="preserve"> [${fn.index}] ${escapeXml(fn.text)}</w:t></w:r></w:p>\n`;
        }
      }

      // Section properties & margins
      const m = section.pageSettings.margins;
      xml += `    <w:sectPr>\n`;
      xml += `      <w:pgSz w:w="11906" w:h="16838" w:orient="${section.pageSettings.orientation}"/>\n`;
      xml += `      <w:pgMar w:top="${m.top * 20}" w:bottom="${m.bottom * 20}" w:left="${m.left * 20}" w:right="${m.right * 20}"/>\n`;
      xml += `    </w:sectPr>\n`;
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
