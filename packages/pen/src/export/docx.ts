import JSZip from 'jszip';
import {
  PenDocumentModel,
  Block,
  TableBlock,
  TableCell,
  InlineText,
  InlineStyle,
  Footnote,
  UnderlineStyle,
  HighlightColor,
} from '../types';
import { PenSecurity } from '../security';
import { DEFAULT_PEN_STYLES } from '../styles';
import { generateId } from '@openhead/core';

export class DocxAdapter {
  /**
   * Generates raw WordprocessingML document.xml string.
   */
  public static toWordprocessingML(doc: PenDocumentModel): string {
    const section = doc.sections[0] || {
      id: generateId('sec'),
      pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1 },
      blocks: [],
      footnotes: [],
    };
    let docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    docXml += `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n`;
    docXml += `  <w:body>\n`;

    for (const block of section.blocks) {
      if (block.type === 'heading') {
        docXml += `    <w:p><w:pPr><w:pStyle w:val="Heading${block.level}"/></w:pPr>`;
        for (const inl of block.inlines) {
          docXml += `<w:r><w:t>${escapeXml(inl.text)}</w:t></w:r>`;
        }
        docXml += `</w:p>\n`;
      } else if (block.type === 'paragraph') {
        docXml += `    <w:p>`;
        for (const inl of block.inlines) {
          docXml += serializeInlineRun(inl, () => '');
        }
        docXml += `</w:p>\n`;
      } else if (block.type === 'table') {
        docXml += `    <w:tbl>\n`;
        docXml += `      <w:tblPr><w:tblW w:w="0" w:type="auto"/></w:tblPr>\n`;
        if (block.headers && block.headers.length > 0) {
          docXml += `      <w:tr>\n`;
          for (const header of block.headers) {
            docXml += `        <w:tc><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>${escapeXml(header)}</w:t></w:r></w:p></w:tc>\n`;
          }
          docXml += `      </w:tr>\n`;
        }
        for (const row of block.rows) {
          docXml += `      <w:tr>\n`;
          for (const cell of row) {
            docXml += `        <w:tc><w:p>`;
            for (const inl of cell.inlines) {
              docXml += `<w:r><w:t>${escapeXml(inl.text)}</w:t></w:r>`;
            }
            docXml += `</w:p></w:tc>\n`;
          }
          docXml += `      </w:tr>\n`;
        }
        docXml += `    </w:tbl>\n`;
      } else if (block.type === 'bullet-list-item' || block.type === 'numbered-list-item') {
        docXml += `    <w:p><w:pPr><w:numPr><w:ilvl w:val="${block.level || 0}"/></w:numPr></w:pPr>`;
        for (const inl of block.inlines) {
          docXml += `<w:r><w:t>${escapeXml(inl.text)}</w:t></w:r>`;
        }
        docXml += `</w:p>\n`;
      }
    }

    docXml += `  </w:body>\n</w:document>`;
    return docXml;
  }

  /**
   * Generates a complete, standards-compliant OOXML .docx ZIP archive buffer.
   */
  public static async toBuffer(doc: PenDocumentModel): Promise<Uint8Array> {
    const zip = new JSZip();

    const section = doc.sections[0] || {
      id: generateId('sec'),
      pageSettings: {
        orientation: 'portrait',
        pageSize: 'A4',
        margins: { top: 25, bottom: 25, left: 25, right: 25 },
        columns: 1,
      },
      blocks: [],
      footnotes: [],
    };

    const hasFootnotes = section.footnotes && section.footnotes.length > 0;
    const hasHeader = !!section.pageSettings.headerText;
    const hasFooter = !!section.pageSettings.footerText;

    // Collect external hyperlinks
    const hyperlinks: Array<{ rId: string; url: string }> = [];
    let relIndex = 1;

    const getOrAddHyperlinkRel = (url: string): string => {
      const sanitized = PenSecurity.sanitizeHyperlink(url);
      if (!sanitized) return '';
      const existing = hyperlinks.find((h) => h.url === sanitized);
      if (existing) return existing.rId;
      const rId = `rIdHlink${relIndex++}`;
      hyperlinks.push({ rId, url: sanitized });
      return rId;
    };

    // 1. [Content_Types].xml
    let contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    contentTypesXml += `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n`;
    contentTypesXml += `  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n`;
    contentTypesXml += `  <Default Extension="xml" ContentType="application/xml"/>\n`;
    contentTypesXml += `  <Default Extension="png" ContentType="image/png"/>\n`;
    contentTypesXml += `  <Default Extension="jpeg" ContentType="image/jpeg"/>\n`;
    contentTypesXml += `  <Default Extension="jpg" ContentType="image/jpeg"/>\n`;
    contentTypesXml += `  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n`;
    contentTypesXml += `  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>\n`;
    contentTypesXml += `  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>\n`;
    if (hasFootnotes) {
      contentTypesXml += `  <Override PartName="/word/footnotes.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml"/>\n`;
    }
    if (hasHeader) {
      contentTypesXml += `  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>\n`;
    }
    if (hasFooter) {
      contentTypesXml += `  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>\n`;
    }
    contentTypesXml += `</Types>`;
    zip.file('[Content_Types].xml', contentTypesXml);

    // 2. _rels/.rels
    let rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    rootRelsXml += `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n`;
    rootRelsXml += `  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n`;
    rootRelsXml += `</Relationships>`;
    zip.file('_rels/.rels', rootRelsXml);

    // 3. word/_rels/document.xml.rels
    let docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    docRelsXml += `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n`;
    docRelsXml += `  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\n`;
    docRelsXml += `  <Relationship Id="rIdNumbering" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>\n`;
    if (hasFootnotes) {
      docRelsXml += `  <Relationship Id="rIdFootnotes" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footnotes" Target="footnotes.xml"/>\n`;
    }
    if (hasHeader) {
      docRelsXml += `  <Relationship Id="rIdHeader1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>\n`;
    }
    if (hasFooter) {
      docRelsXml += `  <Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>\n`;
    }

    // 4. word/styles.xml
    let stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    stylesXml += `<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n`;
    stylesXml += `  <w:docDefaults>\n`;
    stylesXml += `    <w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:color w:val="000000"/></w:rPr></w:rPrDefault>\n`;
    stylesXml += `    <w:pPrDefault><w:pPr><w:spacing w:line="276" w:lineRule="auto" w:after="120"/></w:pPr></w:pPrDefault>\n`;
    stylesXml += `  </w:docDefaults>\n`;

    for (const styleKey of Object.keys(DEFAULT_PEN_STYLES)) {
      const s = DEFAULT_PEN_STYLES[styleKey];
      stylesXml += `  <w:style w:type="paragraph" w:styleId="${s.id}">\n`;
      stylesXml += `    <w:name w:val="${s.name}"/>\n`;
      if (s.basedOn) stylesXml += `    <w:basedOn w:val="${s.basedOn}"/>\n`;
      if (s.paragraphProps) {
        stylesXml += `    <w:pPr>`;
        if (s.paragraphProps.align) stylesXml += `<w:jc w:val="${s.paragraphProps.align}"/>`;
        if (s.paragraphProps.keepWithNext) stylesXml += `<w:keepNext/>`;
        if (s.paragraphProps.spacingBefore !== undefined || s.paragraphProps.spacingAfter !== undefined) {
          stylesXml += `<w:spacing w:before="${(s.paragraphProps.spacingBefore || 0) * 20}" w:after="${(s.paragraphProps.spacingAfter || 0) * 20}"/>`;
        }
        stylesXml += `</w:pPr>\n`;
      }
      if (s.inlineStyles) {
        stylesXml += `    <w:rPr>`;
        if (s.inlineStyles.fontFamily) stylesXml += `<w:rFonts w:ascii="${s.inlineStyles.fontFamily}" w:hAnsi="${s.inlineStyles.fontFamily}"/>`;
        if (s.inlineStyles.fontSize) stylesXml += `<w:sz w:val="${s.inlineStyles.fontSize * 2}"/>`;
        if (s.inlineStyles.bold) stylesXml += `<w:b/>`;
        if (s.inlineStyles.italic) stylesXml += `<w:i/>`;
        if (s.inlineStyles.color) stylesXml += `<w:color w:val="${s.inlineStyles.color.replace('#', '')}"/>`;
        stylesXml += `</w:rPr>\n`;
      }
      stylesXml += `  </w:style>\n`;
    }
    stylesXml += `</w:styles>`;
    zip.file('word/styles.xml', stylesXml);

    // 5. word/numbering.xml
    let numberingXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    numberingXml += `<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n`;
    // Abstract bullet numbering
    numberingXml += `  <w:abstractNum w:abstractNumId="1">\n`;
    for (let i = 0; i <= 8; i++) {
      const bulletChar = i % 3 === 0 ? '•' : i % 3 === 1 ? 'o' : '▪';
      numberingXml += `    <w:lvl w:ilvl="${i}"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="${bulletChar}"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="${(i + 1) * 720}" w:hanging="360"/></w:pPr></w:lvl>\n`;
    }
    numberingXml += `  </w:abstractNum>\n`;
    // Abstract decimal numbering
    numberingXml += `  <w:abstractNum w:abstractNumId="2">\n`;
    for (let i = 0; i <= 8; i++) {
      numberingXml += `    <w:lvl w:ilvl="${i}"><w:start w:val="1"/><w:numFmt w:val="decimal"/><w:lvlText w:val="%${i + 1}."/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="${(i + 1) * 720}" w:hanging="360"/></w:pPr></w:lvl>\n`;
    }
    numberingXml += `  </w:abstractNum>\n`;
    numberingXml += `  <w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num>\n`;
    numberingXml += `  <w:num w:numId="2"><w:abstractNumId w:val="2"/></w:num>\n`;
    numberingXml += `</w:numbering>`;
    zip.file('word/numbering.xml', numberingXml);

    // 6. word/footnotes.xml
    if (hasFootnotes) {
      let fnXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
      fnXml += `<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n`;
      fnXml += `  <w:footnote w:type="separator" w:id="-1"><w:p><w:r><w:separator/></w:r></w:p></w:footnote>\n`;
      fnXml += `  <w:footnote w:type="continuationSeparator" w:id="0"><w:p><w:r><w:continuationSeparator/></w:r></w:p></w:footnote>\n`;
      for (const fn of section.footnotes || []) {
        fnXml += `  <w:footnote w:id="${fn.index}">\n`;
        fnXml += `    <w:p><w:pPr><w:pStyle w:val="FootnoteText"/></w:pPr>`;
        fnXml += `<w:r><w:rPr><w:vertAlign w:val="superscript"/></w:rPr><w:footnoteRef/></w:r>`;
        fnXml += `<w:r><w:t xml:space="preserve"> ${escapeXml(fn.text)}</w:t></w:r></w:p>\n`;
        fnXml += `  </w:footnote>\n`;
      }
      fnXml += `</w:footnotes>`;
      zip.file('word/footnotes.xml', fnXml);
    }

    // 7. word/header1.xml & word/footer1.xml
    if (hasHeader) {
      let hdrXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
      hdrXml += `<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n`;
      hdrXml += `  <w:p><w:pPr><w:pStyle w:val="Header"/></w:pPr><w:r><w:t>${escapeXml(section.pageSettings.headerText || '')}</w:t></w:r></w:p>\n`;
      hdrXml += `</w:hdr>`;
      zip.file('word/header1.xml', hdrXml);
    }
    if (hasFooter) {
      let ftrXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
      ftrXml += `<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n`;
      ftrXml += `  <w:p><w:pPr><w:pStyle w:val="Footer"/><w:jc w:val="right"/></w:pPr>`;
      ftrXml += `<w:r><w:t xml:space="preserve">${escapeXml(section.pageSettings.footerText || '')} </w:t></w:r>`;
      ftrXml += `<w:fldSimple w:instr="PAGE"><w:r><w:t>1</w:t></w:r></w:fldSimple>`;
      ftrXml += `</w:p>\n</w:ftr>`;
      zip.file('word/footer1.xml', ftrXml);
    }

    // 8. word/document.xml
    let docXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    docXml += `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n`;
    docXml += `  <w:body>\n`;

    for (const block of section.blocks) {
      if (block.type === 'heading') {
        docXml += `    <w:p>\n`;
        docXml += `      <w:pPr>\n`;
        docXml += `        <w:pStyle w:val="Heading${block.level}"/>\n`;
        if (block.props?.align) docXml += `        <w:jc w:val="${block.props.align}"/>\n`;
        docXml += `        <w:keepNext/>\n`;
        docXml += `      </w:pPr>\n`;
        for (const inl of block.inlines) {
          docXml += serializeInlineRun(inl, getOrAddHyperlinkRel);
        }
        docXml += `    </w:p>\n`;
      } else if (block.type === 'paragraph') {
        docXml += `    <w:p>\n`;
        docXml += `      <w:pPr>\n`;
        if (block.props?.styleId) {
          docXml += `        <w:pStyle w:val="${block.props.styleId}"/>\n`;
        }
        if (block.props?.align || block.align) {
          docXml += `        <w:jc w:val="${block.props?.align || block.align}"/>\n`;
        }
        if (block.props?.lineSpacing || block.lineHeight) {
          const lineVal = Math.round((block.props?.lineSpacing || block.lineHeight || 1.15) * 240);
          const beforeVal = (block.props?.spacingBefore || 0) * 20;
          const afterVal = (block.props?.spacingAfter !== undefined ? block.props.spacingAfter : 6) * 20;
          docXml += `        <w:spacing w:line="${lineVal}" w:lineRule="auto" w:before="${beforeVal}" w:after="${afterVal}"/>\n`;
        }
        if (block.props?.leftIndent || block.props?.rightIndent || block.props?.firstLineIndent) {
          const left = (block.props.leftIndent || 0) * 20;
          const right = (block.props.rightIndent || 0) * 20;
          const firstLine = (block.props.firstLineIndent || 0) * 20;
          docXml += `        <w:ind w:left="${left}" w:right="${right}" w:firstLine="${firstLine}"/>\n`;
        }
        docXml += `      </w:pPr>\n`;
        for (const inl of block.inlines) {
          docXml += serializeInlineRun(inl, getOrAddHyperlinkRel);
        }
        docXml += `    </w:p>\n`;
      } else if (block.type === 'bullet-list-item' || block.type === 'numbered-list-item') {
        const numId = block.type === 'bullet-list-item' ? '1' : '2';
        const ilvl = block.level || 0;
        docXml += `    <w:p>\n`;
        docXml += `      <w:pPr>\n`;
        docXml += `        <w:numPr><w:ilvl w:val="${ilvl}"/><w:numId w:val="${numId}"/></w:numPr>\n`;
        if (block.props?.align) docXml += `        <w:jc w:val="${block.props.align}"/>\n`;
        docXml += `      </w:pPr>\n`;
        for (const inl of block.inlines) {
          docXml += serializeInlineRun(inl, getOrAddHyperlinkRel);
        }
        docXml += `    </w:p>\n`;
      } else if (block.type === 'callout') {
        docXml += `    <w:p>\n`;
        docXml += `      <w:pPr><w:pStyle w:val="Quote"/><w:ind w:left="480" w:right="480"/></w:pPr>\n`;
        for (const inl of block.inlines) {
          docXml += serializeInlineRun(inl, getOrAddHyperlinkRel);
        }
        docXml += `    </w:p>\n`;
      } else if (block.type === 'code-block') {
        docXml += `    <w:p>\n`;
        docXml += `      <w:pPr><w:pStyle w:val="Normal"/><w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/></w:pPr>\n`;
        docXml += `      <w:r><w:rPr><w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="19"/></w:rPr><w:t xml:space="preserve">${escapeXml(block.code)}</w:t></w:r>\n`;
        docXml += `    </w:p>\n`;
      } else if (block.type === 'page-break') {
        docXml += `    <w:p><w:r><w:br w:type="page"/></w:r></w:p>\n`;
      } else if (block.type === 'table') {
        docXml += `    <w:tbl>\n`;
        docXml += `      <w:tblPr>\n`;
        docXml += `        <w:tblW w:w="0" w:type="auto"/>\n`;
        docXml += `        <w:tblBorders>\n`;
        docXml += `          <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>\n`;
        docXml += `          <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>\n`;
        docXml += `          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>\n`;
        docXml += `          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>\n`;
        docXml += `        </w:tblBorders>\n`;
        docXml += `      </w:tblPr>\n`;

        if (block.colWidths && block.colWidths.length > 0) {
          docXml += `      <w:tblGrid>\n`;
          for (const w of block.colWidths) {
            docXml += `        <w:gridCol w:w="${Math.round((w / 100) * 8500)}"/>\n`;
          }
          docXml += `      </w:tblGrid>\n`;
        }

        if (block.headers && block.headers.length > 0) {
          docXml += `      <w:tr>\n`;
          for (const header of block.headers) {
            docXml += `        <w:tc>\n`;
            docXml += `          <w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="F8FAFC"/></w:tcPr>\n`;
            docXml += `          <w:p><w:r><w:rPr><w:b/><w:color w:val="0F172A"/></w:rPr><w:t>${escapeXml(header)}</w:t></w:r></w:p>\n`;
            docXml += `        </w:tc>\n`;
          }
          docXml += `      </w:tr>\n`;
        }

        for (const row of block.rows) {
          docXml += `      <w:tr>\n`;
          for (const cell of row) {
            docXml += `        <w:tc>\n`;
            docXml += `          <w:tcPr>\n`;
            if (cell.gridSpan && cell.gridSpan > 1) {
              docXml += `            <w:gridSpan w:val="${cell.gridSpan}"/>\n`;
            }
            if (cell.background) {
              docXml += `            <w:shd w:val="clear" w:color="auto" w:fill="${cell.background.replace('#', '')}"/>\n`;
            }
            if (cell.verticalAlign) {
              docXml += `            <w:vAlign w:val="${cell.verticalAlign}"/>\n`;
            }
            docXml += `          </w:tcPr>\n`;
            docXml += `          <w:p>\n`;
            if (cell.align) {
              docXml += `            <w:pPr><w:jc w:val="${cell.align}"/></w:pPr>\n`;
            }
            for (const inl of cell.inlines) {
              docXml += serializeInlineRun(inl, getOrAddHyperlinkRel);
            }
            docXml += `          </w:p>\n`;
            docXml += `        </w:tc>\n`;
          }
          docXml += `      </w:tr>\n`;
        }
        docXml += `    </w:tbl>\n`;
      }
    }

    // Section Properties at document end
    const m = section.pageSettings.margins;
    const isLandscape = section.pageSettings.orientation === 'landscape';
    const pageWidth = isLandscape ? 16838 : 11906; // A4 default
    const pageHeight = isLandscape ? 11906 : 16838;

    docXml += `    <w:sectPr>\n`;
    if (hasHeader) {
      docXml += `      <w:headerReference w:type="default" r:id="rIdHeader1"/>\n`;
    }
    if (hasFooter) {
      docXml += `      <w:footerReference w:type="default" r:id="rIdFooter1"/>\n`;
    }
    docXml += `      <w:pgSz w:w="${pageWidth}" w:h="${pageHeight}" w:orient="${section.pageSettings.orientation}"/>\n`;
    docXml += `      <w:pgMar w:top="${Math.round(m.top * 56.7)}" w:bottom="${Math.round(m.bottom * 56.7)}" w:left="${Math.round(m.left * 56.7)}" w:right="${Math.round(m.right * 56.7)}"/>\n`;
    docXml += `    </w:sectPr>\n`;

    docXml += `  </w:body>\n</w:document>`;
    zip.file('word/document.xml', docXml);

    // Finalize relationships with hyperlinks
    for (const h of hyperlinks) {
      docRelsXml += `  <Relationship Id="${h.rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escapeXml(h.url)}" TargetMode="External"/>\n`;
    }
    docRelsXml += `</Relationships>`;
    zip.file('word/_rels/document.xml.rels', docRelsXml);

    const generatedZip = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    return generatedZip;
  }

  /**
   * Imports a .docx OOXML ZIP package into an Openhead PenDocumentModel.
   */
  public static async fromBuffer(buffer: ArrayBuffer | Uint8Array): Promise<PenDocumentModel> {
    const zip = await JSZip.loadAsync(buffer);

    // Security check: zip bombs and entry bounds
    let uncompressedTotal = 0;
    const entries = Object.keys(zip.files);
    if (entries.length > PenSecurity.MAX_ZIP_ENTRIES) {
      throw new Error(`Security Violation: DOCX ZIP entry count (${entries.length}) exceeds maximum limit.`);
    }

    for (const filename of entries) {
      PenSecurity.validateEntryPath(filename);
      const file = zip.files[filename];
      const data = await file.async('uint8array');
      uncompressedTotal += data.length;
      if (uncompressedTotal > PenSecurity.MAX_UNCOMPRESSED_BYTES) {
        throw new Error('Security Violation: DOCX uncompressed payload exceeds safety bounds.');
      }
    }

    const docFile = zip.file('word/document.xml');
    if (!docFile) {
      throw new Error('Invalid DOCX package: word/document.xml missing.');
    }
    const docXml = await docFile.async('string');
    PenSecurity.validateXmlContent(docXml, 'word/document.xml');

    // Parse Relationships
    const relsMap: Record<string, string> = {};
    const relsFile = zip.file('word/_rels/document.xml.rels');
    if (relsFile) {
      const relsXml = await relsFile.async('string');
      PenSecurity.validateXmlContent(relsXml, 'word/_rels/document.xml.rels');
      const relMatches = relsXml.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g);
      for (const m of relMatches) {
        relsMap[m[1]] = m[2];
      }
    }

    // Parse Footnotes if present
    const footnotes: Footnote[] = [];
    const fnFile = zip.file('word/footnotes.xml');
    if (fnFile) {
      const fnXml = await fnFile.async('string');
      PenSecurity.validateXmlContent(fnXml, 'word/footnotes.xml');
      const fnMatches = fnXml.matchAll(/<w:footnote\b[^>]*w:id="(\d+)"[^>]*>(.*?)<\/w:footnote>/gs);
      for (const m of fnMatches) {
        const idNum = parseInt(m[1], 10);
        if (idNum > 0) {
          const fnContent = m[2];
          const textMatches = [...fnContent.matchAll(/<w:t\b[^>]*>(.*?)<\/w:t>/g)];
          const text = textMatches.map((tm) => unescapeXml(tm[1])).join('').trim();
          footnotes.push({
            id: `fn_${idNum}`,
            index: idNum,
            text,
            inlines: [{ id: generateId('inl'), text }],
          });
        }
      }
    }

    // Parse Header & Footer text
    let headerText: string | undefined;
    let footerText: string | undefined;
    const hdrFile = zip.file('word/header1.xml');
    if (hdrFile) {
      const hdrXml = await hdrFile.async('string');
      const hdrClean = hdrXml.replace(/<w:fldSimple\b.*?<\/w:fldSimple>/gs, '');
      const tMatches = [...hdrClean.matchAll(/<w:t\b[^>]*>(.*?)<\/w:t>/g)];
      headerText = tMatches.map((m) => unescapeXml(m[1])).join('').trim() || undefined;
    }
    const ftrFile = zip.file('word/footer1.xml');
    if (ftrFile) {
      const ftrXml = await ftrFile.async('string');
      const ftrClean = ftrXml.replace(/<w:fldSimple\b.*?<\/w:fldSimple>/gs, '');
      const tMatches = [...ftrClean.matchAll(/<w:t\b[^>]*>(.*?)<\/w:t>/g)];
      footerText = tMatches.map((m) => unescapeXml(m[1])).join('').trim() || undefined;
    }

    // Parse Page Settings from <w:sectPr>
    let orientation: 'portrait' | 'landscape' = 'portrait';
    const orientMatch = docXml.match(/<w:pgSz\b[^>]*w:orient="([^"]+)"/);
    if (orientMatch && orientMatch[1] === 'landscape') {
      orientation = 'landscape';
    }

    let margins = { top: 25, bottom: 25, left: 25, right: 25 };
    const marMatch = docXml.match(/<w:pgMar\b[^>]*w:top="(\d+)"[^>]*w:bottom="(\d+)"[^>]*w:left="(\d+)"[^>]*w:right="(\d+)"/);
    if (marMatch) {
      margins = {
        top: Math.round(parseInt(marMatch[1], 10) / 56.7),
        bottom: Math.round(parseInt(marMatch[2], 10) / 56.7),
        left: Math.round(parseInt(marMatch[3], 10) / 56.7),
        right: Math.round(parseInt(marMatch[4], 10) / 56.7),
      };
    }

    const blocks: Block[] = [];

    // Parse Paragraphs and Tables inside body
    const bodyMatch = docXml.match(/<w:body>(.*?)<\/w:body>/s);
    const bodyContent = bodyMatch ? bodyMatch[1] : docXml;

    // Match either <w:p> or <w:tbl>
    const itemRegex = /<w:p\b[^>]*>.*?<\/w:p>|<w:tbl\b[^>]*>.*?<\/w:tbl>/gs;
    const matches = bodyContent.match(itemRegex) || [];

    for (const itemXml of matches) {
      if (itemXml.startsWith('<w:tbl')) {
        // Table Parser
        const tableBlock = parseTableXml(itemXml);
        blocks.push(tableBlock);
      } else {
        // Paragraph Parser
        const block = parseParagraphXml(itemXml, relsMap);
        if (block) {
          blocks.push(block);
        }
      }
    }

    if (blocks.length === 0) {
      blocks.push({
        id: generateId('blk'),
        type: 'paragraph',
        inlines: [{ id: generateId('inl'), text: '' }],
      });
    }

    const title = blocks[0] && 'inlines' in blocks[0] && (blocks[0] as any).inlines[0]?.text
      ? (blocks[0] as any).inlines.map((i: any) => i.text).join('').trim() || 'Imported Document'
      : 'Imported Document';

    return {
      metadata: {
        id: generateId('doc'),
        title,
        type: 'pen',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      styles: { ...DEFAULT_PEN_STYLES },
      sections: [
        {
          id: generateId('sec'),
          pageSettings: {
            orientation,
            pageSize: 'A4',
            margins,
            columns: 1,
            headerText,
            footerText,
          },
          blocks,
          footnotes,
        },
      ],
    };
  }
}

function serializeInlineRun(inl: InlineText, getHlinkRel: (url: string) => string): string {
  if (inl.styles?.field) {
    return `<w:fldSimple w:instr="${inl.styles.field.type}"><w:r><w:t>${escapeXml(inl.styles.field.value || '1')}</w:t></w:r></w:fldSimple>`;
  }

  let rPr = '';
  const s = inl.styles;
  if (s) {
    if (s.fontFamily) rPr += `<w:rFonts w:ascii="${s.fontFamily}" w:hAnsi="${s.fontFamily}"/>`;
    if (s.fontSize) rPr += `<w:sz w:val="${Math.round(s.fontSize * 2)}"/>`;
    if (s.bold) rPr += `<w:b/>`;
    if (s.italic) rPr += `<w:i/>`;
    if (s.underline) rPr += `<w:u w:val="${typeof s.underline === 'string' ? s.underline : 'single'}"/>`;
    if (s.strikethrough) rPr += `<w:strike/>`;
    if (s.color) rPr += `<w:color w:val="${s.color.replace('#', '')}"/>`;
    if (s.highlight) rPr += `<w:highlight w:val="${s.highlight}"/>`;
    if (s.superscript) rPr += `<w:vertAlign w:val="superscript"/>`;
    if (s.subscript) rPr += `<w:vertAlign w:val="subscript"/>`;
    if (s.characterSpacing) rPr += `<w:spacing w:val="${s.characterSpacing * 20}"/>`;
  }

  let runXml = `<w:r>`;
  if (rPr) runXml += `<w:rPr>${rPr}</w:rPr>`;
  runXml += `<w:t xml:space="preserve">${escapeXml(inl.text)}</w:t></w:r>`;

  if (s?.link) {
    const rId = getHlinkRel(s.link);
    if (rId) {
      return `<w:hyperlink r:id="${rId}">${runXml}</w:hyperlink>`;
    }
  }

  return runXml;
}

function parseParagraphXml(pXml: string, relsMap: Record<string, string>): Block | null {
  // Check for page break
  if (pXml.includes('<w:br w:type="page"/>')) {
    return { id: generateId('blk'), type: 'page-break' };
  }

  // Heading Level
  const styleMatch = pXml.match(/<w:pStyle\b[^>]*w:val="([^"]+)"/);
  const styleId = styleMatch ? styleMatch[1] : undefined;

  let headingLevel: 1 | 2 | 3 | 4 | 5 | 6 | undefined;
  if (styleId && /^Heading([1-6])$/i.test(styleId)) {
    headingLevel = parseInt(styleId.replace(/Heading/i, ''), 10) as any;
  }

  // List Item Check
  const numMatch = pXml.match(/<w:numPr>.*?<w:ilvl\b[^>]*w:val="(\d+)".*?<w:numId\b[^>]*w:val="(\d+)"/s);
  const isNumberedList = numMatch && numMatch[2] === '2';
  const isBulletList = numMatch && numMatch[2] === '1';
  const listLevel = numMatch ? parseInt(numMatch[1], 10) : 0;

  // Alignment
  let align: 'left' | 'center' | 'right' | 'justify' | undefined;
  const jcMatch = pXml.match(/<w:jc\b[^>]*w:val="([^"]+)"/);
  if (jcMatch) {
    align = jcMatch[1] as any;
  }

  // Inlines Parser
  const inlines: InlineText[] = [];
  const runOrLinkRegex = /<w:hyperlink\b[^>]*r:id="([^"]+)"[^>]*>(.*?)<\/w:hyperlink>|<w:r\b[^>]*>(.*?)<\/w:r>|<w:fldSimple\b[^>]*w:instr="([^"]+)"[^>]*>(.*?)<\/w:fldSimple>/gs;
  const itemMatches = pXml.matchAll(runOrLinkRegex);

  for (const m of itemMatches) {
    if (m[1]) {
      // Hyperlink container
      const hlinkId = m[1];
      const hlinkTarget = relsMap[hlinkId];
      const subRuns = m[2].matchAll(/<w:r\b[^>]*>(.*?)<\/w:r>/gs);
      for (const sr of subRuns) {
        const inl = parseRunContent(sr[1], hlinkTarget);
        if (inl) inlines.push(inl);
      }
    } else if (m[3]) {
      // Direct Run
      const inl = parseRunContent(m[3]);
      if (inl) inlines.push(inl);
    } else if (m[4]) {
      // Simple Field (PAGE, NUMPAGES, etc.)
      const fieldType = m[4].trim().toUpperCase() as any;
      inlines.push({
        id: generateId('inl'),
        text: fieldType === 'PAGE' ? '1' : fieldType,
        styles: { field: { type: fieldType, value: '1' } },
      });
    }
  }

  const finalInlines = inlines.length > 0 ? inlines : [{ id: generateId('inl'), text: '' }];

  if (headingLevel) {
    return {
      id: generateId('blk'),
      type: 'heading',
      level: headingLevel,
      inlines: finalInlines,
      props: { align, styleId: `Heading${headingLevel}` },
    };
  }

  if (isBulletList) {
    return {
      id: generateId('blk'),
      type: 'bullet-list-item',
      level: listLevel,
      inlines: finalInlines,
      props: { align },
    };
  }

  if (isNumberedList) {
    return {
      id: generateId('blk'),
      type: 'numbered-list-item',
      level: listLevel,
      inlines: finalInlines,
      props: { align },
    };
  }

  if (styleId === 'Quote') {
    return {
      id: generateId('blk'),
      type: 'callout',
      variant: 'note',
      inlines: finalInlines,
      props: { align, styleId: 'Quote' },
    };
  }

  return {
    id: generateId('blk'),
    type: 'paragraph',
    inlines: finalInlines,
    props: { align, styleId: styleId || 'Normal' },
  };
}

function parseRunContent(rXml: string, linkUrl?: string): InlineText | null {
  const textMatches = [...rXml.matchAll(/<w:t\b[^>]*>(.*?)<\/w:t>/g)];
  const rawText = textMatches.map((m) => unescapeXml(m[1])).join('');
  if (!rawText && !rXml.includes('<w:footnoteRef/>')) return null;

  const styles: InlineStyle = {};
  if (rXml.includes('<w:b/>') || rXml.includes('<w:b w:val="true"/>') || rXml.includes('<w:b w:val="1"/>')) {
    styles.bold = true;
  }
  if (rXml.includes('<w:i/>') || rXml.includes('<w:i w:val="true"/>') || rXml.includes('<w:i w:val="1"/>')) {
    styles.italic = true;
  }
  if (rXml.includes('<w:u ')) {
    const uMatch = rXml.match(/<w:u\b[^>]*w:val="([^"]+)"/);
    styles.underline = uMatch ? (uMatch[1] as UnderlineStyle) : 'single';
  }
  if (rXml.includes('<w:strike/>') || rXml.includes('<w:strike w:val="true"/>')) {
    styles.strikethrough = true;
  }
  const colorMatch = rXml.match(/<w:color\b[^>]*w:val="([^"]+)"/);
  if (colorMatch && colorMatch[1] !== 'auto') {
    styles.color = `#${colorMatch[1]}`;
  }
  const szMatch = rXml.match(/<w:sz\b[^>]*w:val="(\d+)"/);
  if (szMatch) {
    styles.fontSize = parseInt(szMatch[1], 10) / 2;
  }
  const fontMatch = rXml.match(/<w:rFonts\b[^>]*w:ascii="([^"]+)"/);
  if (fontMatch) {
    styles.fontFamily = fontMatch[1];
  }
  const hlMatch = rXml.match(/<w:highlight\b[^>]*w:val="([^"]+)"/);
  if (hlMatch) {
    styles.highlight = hlMatch[1] as HighlightColor;
  }
  const vertMatch = rXml.match(/<w:vertAlign\b[^>]*w:val="([^"]+)"/);
  if (vertMatch) {
    if (vertMatch[1] === 'superscript') styles.superscript = true;
    if (vertMatch[1] === 'subscript') styles.subscript = true;
  }
  if (linkUrl) {
    styles.link = linkUrl;
  }

  return {
    id: generateId('inl'),
    text: rawText,
    styles: Object.keys(styles).length > 0 ? styles : undefined,
  };
}

function parseTableXml(tblXml: string): TableBlock {
  const rows: TableCell[][] = [];
  const trMatches = tblXml.matchAll(/<w:tr\b[^>]*>(.*?)<\/w:tr>/gs);

  for (const trMatch of trMatches) {
    const row: TableCell[] = [];
    const tcMatches = trMatch[1].matchAll(/<w:tc\b[^>]*>(.*?)<\/w:tc>/gs);
    for (const tcMatch of tcMatches) {
      const tcXml = tcMatch[1];

      // Cell Shading / Background
      let background: string | undefined;
      const shdMatch = tcXml.match(/<w:shd\b[^>]*w:fill="([^"]+)"/);
      if (shdMatch && shdMatch[1] !== 'auto' && shdMatch[1] !== 'clear') {
        background = `#${shdMatch[1]}`;
      }

      // Vertical Align
      let verticalAlign: 'top' | 'center' | 'bottom' | undefined;
      const vAlignMatch = tcXml.match(/<w:vAlign\b[^>]*w:val="([^"]+)"/);
      if (vAlignMatch) {
        verticalAlign = vAlignMatch[1] as any;
      }

      // GridSpan
      let gridSpan: number | undefined;
      const gsMatch = tcXml.match(/<w:gridSpan\b[^>]*w:val="(\d+)"/);
      if (gsMatch) {
        gridSpan = parseInt(gsMatch[1], 10);
      }

      // Cell inlines
      const inlines: InlineText[] = [];
      const runMatches = tcXml.matchAll(/<w:r\b[^>]*>(.*?)<\/w:r>/gs);
      for (const rm of runMatches) {
        const inl = parseRunContent(rm[1]);
        if (inl) inlines.push(inl);
      }

      row.push({
        id: generateId('tc'),
        inlines: inlines.length > 0 ? inlines : [{ id: generateId('inl'), text: '' }],
        background,
        verticalAlign,
        gridSpan,
      });
    }
    if (row.length > 0) {
      rows.push(row);
    }
  }

  return {
    id: generateId('tbl'),
    type: 'table',
    rows,
    hasHeaderRow: rows.length > 1,
  };
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function unescapeXml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
