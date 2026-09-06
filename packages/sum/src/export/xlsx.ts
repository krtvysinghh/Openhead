import JSZip from 'jszip';
import { generateId, SecuritySanitizer } from '@openhead/core';
import { parseCellAddress, colIndexToName } from '@openhead/formula';
import {
  WorkbookModel,
  WorksheetModel,
  CellData,
  CellStyle,
  CellFormat,
  DataValidationRule,
  AutoFilterConfig,
  DefinedName,
  CellBorderEdge,
} from '../types';
import { shiftFormulaReferences } from '../workbook';
import { getFormatFromNumFmtId, getNumFmtIdFromFormat } from '../formatting';

export class XlsxAdapter {
  /**
   * Serializes an Openhead WorkbookModel into standard OpenXML (.xlsx) binary ZIP buffer.
   */
  public static async toBuffer(workbook: WorkbookModel): Promise<Uint8Array> {
    const zip = new JSZip();

    // 1. Shared Strings extraction & deduplication
    const sharedStrings: string[] = [];
    const stringMap = new Map<string, number>();

    const getSharedStringIndex = (str: string): number => {
      const existing = stringMap.get(str);
      if (existing !== undefined) return existing;
      const idx = sharedStrings.length;
      sharedStrings.push(str);
      stringMap.set(str, idx);
      return idx;
    };

    // 2. Style Tables extraction & deduplication
    const numFmts: { id: number; code: string }[] = [];
    const fonts: { name: string; size: number; bold?: boolean; italic?: boolean; underline?: boolean; strike?: boolean; color?: string }[] = [
      { name: 'Segoe UI', size: 11 }, // default font 0
    ];
    const fills: { type: string; fgColor?: string; patternType?: string }[] = [
      { type: 'none', patternType: 'none' }, // fill 0
      { type: 'gray125', patternType: 'gray125' }, // fill 1
    ];
    const borders: {
      left?: CellBorderEdge;
      right?: CellBorderEdge;
      top?: CellBorderEdge;
      bottom?: CellBorderEdge;
      diagonal?: CellBorderEdge;
    }[] = [
      {}, // border 0
    ];
    const cellXfs: {
      numFmtId: number;
      fontId: number;
      fillId: number;
      borderId: number;
      alignment?: CellStyle['alignment'];
    }[] = [
      { numFmtId: 0, fontId: 0, fillId: 0, borderId: 0 }, // default xf 0
    ];

    const styleXfMap = new Map<string, number>();

    const getXfIndex = (style?: CellStyle, format?: CellFormat): number => {
      if (!style && !format) return 0;

      // Determine NumFmt
      let numFmtId = 0;
      if (format) {
        const nf = getNumFmtIdFromFormat(format);
        numFmtId = nf.numFmtId;
        if (numFmtId >= 164 && nf.customCode) {
          let customEntry = numFmts.find((n) => n.code === nf.customCode);
          if (!customEntry) {
            const nextId = 164 + numFmts.length;
            customEntry = { id: nextId, code: nf.customCode };
            numFmts.push(customEntry);
          }
          numFmtId = customEntry.id;
        }
      }

      // Determine Font
      let fontId = 0;
      if (style?.fontFamily || style?.fontSize || style?.bold || style?.italic || style?.underline || style?.strike || style?.color) {
        const fontName = style.fontFamily || 'Segoe UI';
        const fontSize = style.fontSize || 11;
        let fIdx = fonts.findIndex(
          (f) =>
            f.name === fontName &&
            f.size === fontSize &&
            !!f.bold === !!style.bold &&
            !!f.italic === !!style.italic &&
            !!f.underline === !!style.underline &&
            !!f.strike === !!style.strike &&
            f.color === style.color
        );
        if (fIdx === -1) {
          fIdx = fonts.length;
          fonts.push({
            name: fontName,
            size: fontSize,
            bold: style.bold,
            italic: style.italic,
            underline: style.underline,
            strike: style.strike,
            color: style.color,
          });
        }
        fontId = fIdx;
      }

      // Determine Fill
      let fillId = 0;
      if (style?.background || style?.patternType) {
        const bg = style.background;
        const pt = style.patternType || (bg ? 'solid' : 'none');
        let fIdx = fills.findIndex((fl) => fl.fgColor === bg && fl.patternType === pt);
        if (fIdx === -1) {
          fIdx = fills.length;
          fills.push({ type: pt, fgColor: bg, patternType: pt });
        }
        fillId = fIdx;
      }

      // Determine Border
      let borderId = 0;
      if (style?.borders) {
        const b = style.borders;
        const normalizeEdge = (edge?: boolean | CellBorderEdge): CellBorderEdge | undefined => {
          if (!edge) return undefined;
          if (typeof edge === 'boolean') return { style: (b.style as any) || 'thin', color: b.color };
          return edge;
        };

        const topEdge = normalizeEdge(b.top);
        const bottomEdge = normalizeEdge(b.bottom);
        const leftEdge = normalizeEdge(b.left);
        const rightEdge = normalizeEdge(b.right);
        const diagEdge = normalizeEdge(b.diagonal);

        let bIdx = borders.findIndex(
          (br) =>
            br.top?.style === topEdge?.style &&
            br.bottom?.style === bottomEdge?.style &&
            br.left?.style === leftEdge?.style &&
            br.right?.style === rightEdge?.style
        );
        if (bIdx === -1) {
          bIdx = borders.length;
          borders.push({ top: topEdge, bottom: bottomEdge, left: leftEdge, right: rightEdge, diagonal: diagEdge });
        }
        borderId = bIdx;
      }

      const alignKey = JSON.stringify(style?.alignment || (style?.align ? { horizontal: style.align } : null));
      const xfKey = `${numFmtId}_${fontId}_${fillId}_${borderId}_${alignKey}`;
      const existingXf = styleXfMap.get(xfKey);
      if (existingXf !== undefined) return existingXf;

      const newXfIdx = cellXfs.length;
      cellXfs.push({
        numFmtId,
        fontId,
        fillId,
        borderId,
        alignment: style?.alignment || (style?.align ? { horizontal: style.align as any } : undefined),
      });
      styleXfMap.set(xfKey, newXfIdx);
      return newXfIdx;
    };

    // Pre-calculate all styles across sheets
    for (const sheet of workbook.sheets) {
      for (const cell of Object.values(sheet.cells)) {
        getXfIndex(cell.style, cell.format);
      }
    }

    // 3. [Content_Types].xml
    let contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    contentTypesXml += `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n`;
    contentTypesXml += `  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n`;
    contentTypesXml += `  <Default Extension="xml" ContentType="application/xml"/>\n`;
    contentTypesXml += `  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>\n`;
    contentTypesXml += `  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>\n`;
    contentTypesXml += `  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>\n`;
    for (let i = 0; i < workbook.sheets.length; i++) {
      contentTypesXml += `  <Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>\n`;
    }
    contentTypesXml += `</Types>`;
    zip.file('[Content_Types].xml', contentTypesXml);

    // 4. _rels/.rels
    let rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    rootRelsXml += `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n`;
    rootRelsXml += `  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>\n`;
    rootRelsXml += `</Relationships>`;
    zip.file('_rels/.rels', rootRelsXml);

    // 5. xl/_rels/workbook.xml.rels
    let wbRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    wbRelsXml += `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n`;
    wbRelsXml += `  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\n`;
    wbRelsXml += `  <Relationship Id="rIdSharedStrings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>\n`;
    for (let i = 0; i < workbook.sheets.length; i++) {
      wbRelsXml += `  <Relationship Id="rIdSheet${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>\n`;
    }
    wbRelsXml += `</Relationships>`;
    zip.file('xl/_rels/workbook.xml.rels', wbRelsXml);

    // 6. xl/workbook.xml
    let wbXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    wbXml += `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n`;
    wbXml += `  <sheets>\n`;
    for (let i = 0; i < workbook.sheets.length; i++) {
      const sheet = workbook.sheets[i];
      const stateAttr = sheet.hidden ? ` state="hidden"` : '';
      wbXml += `    <sheet name="${escapeXml(sheet.name)}" sheetId="${i + 1}" r:id="rIdSheet${i + 1}"${stateAttr}/>\n`;
    }
    wbXml += `  </sheets>\n`;

    // Defined Names
    if (workbook.definedNames && workbook.definedNames.length > 0) {
      wbXml += `  <definedNames>\n`;
      for (const dn of workbook.definedNames) {
        const localAttr = dn.sheetScopeId ? ` localSheetId="0"` : '';
        const commentAttr = dn.comment ? ` comment="${escapeXml(dn.comment)}"` : '';
        wbXml += `    <definedName name="${escapeXml(dn.name)}"${localAttr}${commentAttr}>${escapeXml(dn.formula)}</definedName>\n`;
      }
      wbXml += `  </definedNames>\n`;
    }

    wbXml += `</workbook>`;
    zip.file('xl/workbook.xml', wbXml);

    // 7. xl/styles.xml
    let stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    stylesXml += `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n`;

    if (numFmts.length > 0) {
      stylesXml += `  <numFmts count="${numFmts.length}">\n`;
      for (const nf of numFmts) {
        stylesXml += `    <numFmt numFmtId="${nf.id}" formatCode="${escapeXml(nf.code)}"/>\n`;
      }
      stylesXml += `  </numFmts>\n`;
    }

    // Fonts
    stylesXml += `  <fonts count="${fonts.length}">\n`;
    for (const f of fonts) {
      stylesXml += `    <font>\n`;
      if (f.bold) stylesXml += `      <b/>\n`;
      if (f.italic) stylesXml += `      <i/>\n`;
      if (f.underline) stylesXml += `      <u/>\n`;
      if (f.strike) stylesXml += `      <strike/>\n`;
      stylesXml += `      <sz val="${f.size}"/>\n`;
      stylesXml += `      <name val="${escapeXml(f.name)}"/>\n`;
      if (f.color) {
        const rgb = f.color.replace(/^#/, '');
        const hex = rgb.length === 6 ? `FF${rgb}` : rgb;
        stylesXml += `      <color rgb="${hex.toUpperCase()}"/>\n`;
      }
      stylesXml += `    </font>\n`;
    }
    stylesXml += `  </fonts>\n`;

    // Fills
    stylesXml += `  <fills count="${fills.length}">\n`;
    for (const fl of fills) {
      stylesXml += `    <fill>\n`;
      if (fl.fgColor) {
        const rgb = fl.fgColor.replace(/^#/, '');
        const hex = rgb.length === 6 ? `FF${rgb}` : rgb;
        stylesXml += `      <patternFill patternType="${fl.patternType || 'solid'}">\n`;
        stylesXml += `        <fgColor rgb="${hex.toUpperCase()}"/>\n`;
        stylesXml += `      </patternFill>\n`;
      } else {
        stylesXml += `      <patternFill patternType="${fl.patternType || 'none'}"/>\n`;
      }
      stylesXml += `    </fill>\n`;
    }
    stylesXml += `  </fills>\n`;

    // Borders
    stylesXml += `  <borders count="${borders.length}">\n`;
    for (const b of borders) {
      stylesXml += `    <border>\n`;
      const renderEdge = (tag: string, edge?: CellBorderEdge) => {
        if (!edge || !edge.style) {
          return `      <${tag}/>\n`;
        }
        let out = `      <${tag} style="${edge.style}">\n`;
        if (edge.color) {
          const rgb = edge.color.replace(/^#/, '');
          const hex = rgb.length === 6 ? `FF${rgb}` : rgb;
          out += `        <color rgb="${hex.toUpperCase()}"/>\n`;
        }
        out += `      </${tag}>\n`;
        return out;
      };

      stylesXml += renderEdge('left', b.left);
      stylesXml += renderEdge('right', b.right);
      stylesXml += renderEdge('top', b.top);
      stylesXml += renderEdge('bottom', b.bottom);
      stylesXml += renderEdge('diagonal', b.diagonal);
      stylesXml += `    </border>\n`;
    }
    stylesXml += `  </borders>\n`;

    // CellXfs
    stylesXml += `  <cellXfs count="${cellXfs.length}">\n`;
    for (const xf of cellXfs) {
      let xfAttrs = `numFmtId="${xf.numFmtId}" fontId="${xf.fontId}" fillId="${xf.fillId}" borderId="${xf.borderId}" xfId="0"`;
      if (xf.fontId > 0) xfAttrs += ` applyFont="1"`;
      if (xf.fillId > 0) xfAttrs += ` applyFill="1"`;
      if (xf.borderId > 0) xfAttrs += ` applyBorder="1"`;
      if (xf.numFmtId > 0) xfAttrs += ` applyNumberFormat="1"`;

      if (xf.alignment) {
        xfAttrs += ` applyAlignment="1"`;
        let alignAttrs = '';
        if (xf.alignment.horizontal) alignAttrs += ` horizontal="${xf.alignment.horizontal}"`;
        if (xf.alignment.vertical) alignAttrs += ` vertical="${xf.alignment.vertical}"`;
        if (xf.alignment.wrapText) alignAttrs += ` wrapText="1"`;
        if (xf.alignment.textRotation) alignAttrs += ` textRotation="${xf.alignment.textRotation}"`;
        if (xf.alignment.indent) alignAttrs += ` indent="${xf.alignment.indent}"`;

        stylesXml += `    <xf ${xfAttrs}>\n`;
        stylesXml += `      <alignment${alignAttrs}/>\n`;
        stylesXml += `    </xf>\n`;
      } else {
        stylesXml += `    <xf ${xfAttrs}/>\n`;
      }
    }
    stylesXml += `  </cellXfs>\n`;
    stylesXml += `</styleSheet>`;
    zip.file('xl/styles.xml', stylesXml);

    // 8. Worksheets xl/worksheets/sheet*.xml
    for (let i = 0; i < workbook.sheets.length; i++) {
      const sheet = workbook.sheets[i];
      let sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
      sheetXml += `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n`;
      sheetXml += `  <dimension ref="A1:${colIndexToName(sheet.colCount - 1)}${sheet.rowCount}"/>\n`;

      // Freeze panes
      if (sheet.freezePanes && (sheet.freezePanes.rows > 0 || sheet.freezePanes.cols > 0)) {
        sheetXml += `  <sheetViews>\n`;
        sheetXml += `    <sheetView tabSelected="${sheet.id === workbook.activeSheetId ? 1 : 0}" workbookViewId="0">\n`;
        const ySplit = sheet.freezePanes.rows || 0;
        const xSplit = sheet.freezePanes.cols || 0;
        const topLeft = sheet.freezePanes.topLeftCell || `${colIndexToName(xSplit)}${ySplit + 1}`;
        sheetXml += `      <pane xSplit="${xSplit}" ySplit="${ySplit}" topLeftCell="${topLeft}" activePane="bottomRight" state="frozen"/>\n`;
        sheetXml += `    </sheetView>\n`;
        sheetXml += `  </sheetViews>\n`;
      }

      // Column widths and hidden columns
      if (sheet.colWidths || (sheet.hiddenCols && sheet.hiddenCols.length > 0)) {
        sheetXml += `  <cols>\n`;
        const allCols = new Set<number>();
        if (sheet.colWidths) Object.keys(sheet.colWidths).forEach((k) => allCols.add(parseInt(k, 10)));
        if (sheet.hiddenCols) sheet.hiddenCols.forEach((c) => allCols.add(c));

        const sortedCols = Array.from(allCols).sort((a, b) => a - b);
        for (const c of sortedCols) {
          const width = sheet.colWidths?.[c] || 10;
          const isHidden = sheet.hiddenCols?.includes(c);
          const hiddenAttr = isHidden ? ` hidden="1"` : '';
          sheetXml += `    <col min="${c + 1}" max="${c + 1}" width="${width}" customWidth="1"${hiddenAttr}/>\n`;
        }
        sheetXml += `  </cols>\n`;
      }

      // Group cells by row index
      const rowMap = new Map<number, { key: string; cell: CellData }[]>();
      for (const [key, cell] of Object.entries(sheet.cells)) {
        const addr = parseCellAddress(key);
        if (!addr) continue;
        const rowIdx = addr.row + 1; // 1-based
        if (!rowMap.has(rowIdx)) rowMap.set(rowIdx, []);
        rowMap.get(rowIdx)!.push({ key, cell });
      }

      const allRowIndices = new Set<number>(rowMap.keys());
      if (sheet.rowHeights) Object.keys(sheet.rowHeights).forEach((r) => allRowIndices.add(parseInt(r, 10) + 1));
      if (sheet.hiddenRows) sheet.hiddenRows.forEach((r) => allRowIndices.add(r + 1));

      const sortedRows = Array.from(allRowIndices).sort((a, b) => a - b);
      sheetXml += `  <sheetData>\n`;

      for (const rowIdx of sortedRows) {
        const rowCells = rowMap.get(rowIdx) || [];
        rowCells.sort((a, b) => (parseCellAddress(a.key)?.col || 0) - (parseCellAddress(b.key)?.col || 0));

        const customHt = sheet.rowHeights?.[rowIdx - 1];
        const isHidden = sheet.hiddenRows?.includes(rowIdx - 1);
        let rowAttrs = `r="${rowIdx}"`;
        if (customHt) rowAttrs += ` ht="${customHt}" customHeight="1"`;
        if (isHidden) rowAttrs += ` hidden="1"`;

        sheetXml += `    <row ${rowAttrs}>\n`;
        for (const { key, cell } of rowCells) {
          const xfIdx = getXfIndex(cell.style, cell.format);
          const sAttr = xfIdx > 0 ? ` s="${xfIdx}"` : '';
          const isFormula = typeof cell.raw === 'string' && cell.raw.startsWith('=');

          if (isFormula) {
            const formulaClean = String(cell.raw).slice(1);
            const valStr = cell.value !== null && cell.value !== undefined ? String(cell.value) : '';
            if (cell.isArrayFormula) {
              sheetXml += `      <c r="${key}"${sAttr}><f t="array" ref="${key}">${escapeXml(formulaClean)}</f><v>${escapeXml(valStr)}</v></c>\n`;
            } else {
              sheetXml += `      <c r="${key}"${sAttr}><f>${escapeXml(formulaClean)}</f><v>${escapeXml(valStr)}</v></c>\n`;
            }
          } else if (typeof cell.raw === 'number') {
            sheetXml += `      <c r="${key}"${sAttr}><v>${cell.raw}</v></c>\n`;
          } else if (typeof cell.raw === 'boolean') {
            sheetXml += `      <c r="${key}" t="b"${sAttr}><v>${cell.raw ? 1 : 0}</v></c>\n`;
          } else if (typeof cell.raw === 'string') {
            const sIndex = getSharedStringIndex(cell.raw);
            sheetXml += `      <c r="${key}" t="s"${sAttr}><v>${sIndex}</v></c>\n`;
          }
        }
        sheetXml += `    </row>\n`;
      }
      sheetXml += `  </sheetData>\n`;

      // AutoFilter
      if (sheet.autoFilter) {
        sheetXml += `  <autoFilter ref="${escapeXml(sheet.autoFilter.range)}"/>\n`;
      }

      // Merged Cells
      if (sheet.mergedRanges && sheet.mergedRanges.length > 0) {
        sheetXml += `  <mergeCells count="${sheet.mergedRanges.length}">\n`;
        for (const rng of sheet.mergedRanges) {
          sheetXml += `    <mergeCell ref="${escapeXml(rng)}"/>\n`;
        }
        sheetXml += `  </mergeCells>\n`;
      }

      // Data Validations
      if (sheet.dataValidations && sheet.dataValidations.length > 0) {
        sheetXml += `  <dataValidations count="${sheet.dataValidations.length}">\n`;
        for (const dv of sheet.dataValidations) {
          let dvAttrs = `type="${dv.type}" sqref="${escapeXml(dv.sqref)}"`;
          if (dv.operator) dvAttrs += ` operator="${dv.operator}"`;
          if (dv.allowBlank !== false) dvAttrs += ` allowBlank="1"`;
          if (dv.showErrorMessage !== false) dvAttrs += ` showErrorMessage="1"`;
          if (dv.errorTitle) dvAttrs += ` errorTitle="${escapeXml(dv.errorTitle)}"`;
          if (dv.errorMessage) dvAttrs += ` error="${escapeXml(dv.errorMessage)}"`;

          sheetXml += `    <dataValidation ${dvAttrs}>\n`;
          sheetXml += `      <formula1>${escapeXml(dv.formula1)}</formula1>\n`;
          if (dv.formula2) {
            sheetXml += `      <formula2>${escapeXml(dv.formula2)}</formula2>\n`;
          }
          sheetXml += `    </dataValidation>\n`;
        }
        sheetXml += `  </dataValidations>\n`;
      }

      sheetXml += `</worksheet>`;
      zip.file(`xl/worksheets/sheet${i + 1}.xml`, sheetXml);
    }

    // 9. xl/sharedStrings.xml
    let sstXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    sstXml += `<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${sharedStrings.length}" uniqueCount="${sharedStrings.length}">\n`;
    for (const str of sharedStrings) {
      sstXml += `  <si><t>${escapeXml(str)}</t></si>\n`;
    }
    sstXml += `</sst>`;
    zip.file('xl/sharedStrings.xml', sstXml);

    return zip.generateAsync({ type: 'uint8array' });
  }

  /**
   * Parses an OOXML (.xlsx) binary ZIP buffer into an Openhead WorkbookModel with full fidelity.
   */
  public static async fromBuffer(data: Uint8Array | ArrayBuffer): Promise<WorkbookModel> {
    const zip = await JSZip.loadAsync(data);

    // 1. Parse Shared Strings (plain <t> and rich text <r><t>)
    const sharedStrings: string[] = [];
    const sstFile = zip.file('xl/sharedStrings.xml');
    if (sstFile) {
      const sstRaw = await sstFile.async('text');
      if (!SecuritySanitizer.validateXmlSafety(sstRaw)) {
        throw new Error('Hostile XML entity expansion detected in sharedStrings.xml');
      }

      const siMatches = sstRaw.match(/<si>(.*?)<\/si>/gs) || [];
      for (const si of siMatches) {
        const textMatches = si.match(/<t[^>]*>(.*?)<\/t>/gs);
        if (textMatches) {
          const fullText = textMatches
            .map((t) => t.replace(/<\/?t[^>]*>/g, ''))
            .join('');
          sharedStrings.push(unescapeXml(fullText));
        } else {
          sharedStrings.push('');
        }
      }
    }

    // 2. Parse Stylesheet (xl/styles.xml)
    const stylesFile = zip.file('xl/styles.xml');
    const parsedXfs: { style?: CellStyle; format?: CellFormat }[] = [];
    if (stylesFile) {
      const stylesRaw = await stylesFile.async('text');
      if (!SecuritySanitizer.validateXmlSafety(stylesRaw)) {
        throw new Error('Hostile XML entity expansion detected in styles.xml');
      }

      // Parse custom numFmts
      const customNumFmtMap = new Map<number, string>();
      const numFmtMatches = stylesRaw.match(/<numFmt\s+[^>]*\/>/g) || [];
      for (const nfm of numFmtMatches) {
        const idMatch = nfm.match(/numFmtId="([0-9]+)"/);
        const codeMatch = nfm.match(/formatCode="([^"]+)"/);
        if (idMatch && codeMatch) {
          customNumFmtMap.set(parseInt(idMatch[1], 10), unescapeXml(codeMatch[1]));
        }
      }

      // Parse fonts
      const parsedFonts: Partial<CellStyle>[] = [];
      const fontsBlockMatch = stylesRaw.match(/<fonts\b[^>]*>(.*?)<\/fonts>/s);
      const fontsContent = fontsBlockMatch ? fontsBlockMatch[1] : stylesRaw;
      const fontMatches = fontsContent.match(/<font\b[^>]*\/>|<font\b[^>]*>.*?<\/font>/gs) || [];
      for (const fm of fontMatches) {
        const bold = fm.includes('<b/>') || fm.includes('<b ') || fm.includes('<b>');
        const italic = fm.includes('<i/>') || fm.includes('<i ') || fm.includes('<i>');
        const underline = fm.includes('<u/>') || fm.includes('<u ') || fm.includes('<u>');
        const strike = fm.includes('<strike/>') || fm.includes('<strike ') || fm.includes('<strike>');
        const szMatch = fm.match(/<sz\s+val="([^"]+)"/);
        const nameMatch = fm.match(/<name\s+val="([^"]+)"/);
        const colorMatch = fm.match(/<color\s+rgb="([A-Fa-f0-9]+)"/);

        parsedFonts.push({
          bold,
          italic,
          underline,
          strike,
          fontSize: szMatch ? parseFloat(szMatch[1]) : undefined,
          fontFamily: nameMatch ? nameMatch[1] : undefined,
          color: colorMatch ? `#${colorMatch[1].slice(-6)}` : undefined,
        });
      }

      // Parse fills
      const parsedFills: Partial<CellStyle>[] = [];
      const fillsBlockMatch = stylesRaw.match(/<fills\b[^>]*>(.*?)<\/fills>/s);
      const fillsContent = fillsBlockMatch ? fillsBlockMatch[1] : stylesRaw;
      const fillMatches = fillsContent.match(/<fill\b[^>]*\/>|<fill\b[^>]*>.*?<\/fill>/gs) || [];
      for (const fl of fillMatches) {
        const fgMatch = fl.match(/<fgColor\s+rgb="([A-Fa-f0-9]+)"/);
        const ptMatch = fl.match(/patternType="([^"]+)"/);
        parsedFills.push({
          background: fgMatch ? `#${fgMatch[1].slice(-6)}` : undefined,
          patternType: ptMatch ? ptMatch[1] : undefined,
        });
      }

      // Parse borders
      const parsedBorders: CellStyle['borders'][] = [];
      const bordersBlockMatch = stylesRaw.match(/<borders\b[^>]*>(.*?)<\/borders>/s);
      const bordersContent = bordersBlockMatch ? bordersBlockMatch[1] : stylesRaw;
      const borderMatches = bordersContent.match(/<border\b[^>]*\/>|<border\b[^>]*>.*?<\/border>/gs) || [];
      for (const bm of borderMatches) {
        const extractEdge = (tag: string): CellBorderEdge | undefined => {
          const edgeRegex = new RegExp(`<${tag}[^>]*style="([^"]+)"[^>]*>(?:.*?<color\\s+rgb="([A-Fa-f0-9]+)"[^>]*>)?`, 's');
          const m = bm.match(edgeRegex);
          if (m) {
            return {
              style: m[1] as any,
              color: m[2] ? `#${m[2].slice(-6)}` : undefined,
            };
          }
          return undefined;
        };

        parsedBorders.push({
          left: extractEdge('left'),
          right: extractEdge('right'),
          top: extractEdge('top'),
          bottom: extractEdge('bottom'),
          diagonal: extractEdge('diagonal'),
        });
      }

      // Parse cellXfs
      const cellXfsBlockMatch = stylesRaw.match(/<cellXfs\b[^>]*>(.*?)<\/cellXfs>/s);
      const cellXfsContent = cellXfsBlockMatch ? cellXfsBlockMatch[1] : stylesRaw;
      const xfMatches = cellXfsContent.match(/<xf\b[^>]*\/>|<xf\b[^>]*>.*?<\/xf>/gs) || [];
      for (const xfm of xfMatches) {
        const numFmtIdMatch = xfm.match(/numFmtId="([0-9]+)"/);
        const fontIdMatch = xfm.match(/fontId="([0-9]+)"/);
        const fillIdMatch = xfm.match(/fillId="([0-9]+)"/);
        const borderIdMatch = xfm.match(/borderId="([0-9]+)"/);


        const numFmtId = numFmtIdMatch ? parseInt(numFmtIdMatch[1], 10) : 0;
        const fontId = fontIdMatch ? parseInt(fontIdMatch[1], 10) : 0;
        const fillId = fillIdMatch ? parseInt(fillIdMatch[1], 10) : 0;
        const borderId = borderIdMatch ? parseInt(borderIdMatch[1], 10) : 0;

        const font = parsedFonts[fontId] || {};
        const fill = parsedFills[fillId] || {};
        const border = parsedBorders[borderId];

        // Format
        const customCode = customNumFmtMap.get(numFmtId);
        const format = getFormatFromNumFmtId(numFmtId, customCode);

        // Alignment
        const horizMatch = xfm.match(/horizontal="([^"]+)"/);
        const vertMatch = xfm.match(/vertical="([^"]+)"/);
        const wrapMatch = xfm.match(/wrapText="1"/);

        const alignment =
          horizMatch || vertMatch || wrapMatch
            ? {
                horizontal: horizMatch ? (horizMatch[1] as any) : undefined,
                vertical: vertMatch ? (vertMatch[1] as any) : undefined,
                wrapText: !!wrapMatch,
              }
            : undefined;

        parsedXfs.push({
          style: {
            ...font,
            background: fill.background,
            patternType: fill.patternType,
            borders: border,
            alignment,
          },
          format,
        });
      }
    }

    // 3. Parse Workbook Definition & Defined Names
    const wbFile = zip.file('xl/workbook.xml');
    const sheetDefs: { name: string; rId: string; hidden: boolean }[] = [];
    const definedNames: DefinedName[] = [];

    if (wbFile) {
      const wbRaw = await wbFile.async('text');
      if (!SecuritySanitizer.validateXmlSafety(wbRaw)) {
        throw new Error('Hostile XML entity expansion detected in workbook.xml');
      }

      const sheetMatches = wbRaw.match(/<sheet\s+[^>]*\/>/g) || [];
      for (const sm of sheetMatches) {
        const nameMatch = sm.match(/name="([^"]+)"/);
        const rIdMatch = sm.match(/r:id="([^"]+)"/);
        const hiddenMatch = sm.includes('state="hidden"');
        if (nameMatch) {
          sheetDefs.push({
            name: unescapeXml(nameMatch[1]),
            rId: rIdMatch ? rIdMatch[1] : `rIdSheet${sheetDefs.length + 1}`,
            hidden: hiddenMatch,
          });
        }
      }

      // Defined Names
      const dnMatches = wbRaw.match(/<definedName\s+([^>]*)>(.*?)<\/definedName>/gs) || [];
      for (const dnm of dnMatches) {
        const nameMatch = dnm.match(/name="([^"]+)"/);
        const formulaMatch = dnm.match(/>([^<]+)<\/definedName>/);
        if (nameMatch && formulaMatch) {
          definedNames.push({
            name: unescapeXml(nameMatch[1]),
            formula: unescapeXml(formulaMatch[1]),
          });
        }
      }
    }

    if (sheetDefs.length === 0) {
      sheetDefs.push({ name: 'Sheet1', rId: 'rIdSheet1', hidden: false });
    }

    // 4. Parse Worksheet files
    const sheets: WorksheetModel[] = [];
    for (let i = 0; i < sheetDefs.length; i++) {
      const def = sheetDefs[i];
      const sheetPath = `xl/worksheets/sheet${i + 1}.xml`;
      const sheetFile = zip.file(sheetPath);
      const cells: Record<string, CellData> = {};
      let freezePanes: WorksheetModel['freezePanes'];
      const mergedRanges: string[] = [];
      const colWidths: Record<number, number> = {};
      const rowHeights: Record<number, number> = {};
      const hiddenRows: number[] = [];
      const hiddenCols: number[] = [];
      const dataValidations: DataValidationRule[] = [];
      let autoFilter: AutoFilterConfig | undefined;

      if (sheetFile) {
        const sheetRaw = await sheetFile.async('text');
        if (!SecuritySanitizer.validateXmlSafety(sheetRaw)) {
          throw new Error(`Hostile XML entity expansion detected in ${sheetPath}`);
        }

        // Parse Freeze Panes
        const paneMatch = sheetRaw.match(/<pane\s+[^>]*\/>/);
        if (paneMatch) {
          const ySplitMatch = paneMatch[0].match(/ySplit="([0-9]+)"/);
          const xSplitMatch = paneMatch[0].match(/xSplit="([0-9]+)"/);
          const topLeftMatch = paneMatch[0].match(/topLeftCell="([A-Za-z0-9]+)"/);
          const ySplit = ySplitMatch ? parseInt(ySplitMatch[1], 10) : 0;
          const xSplit = xSplitMatch ? parseInt(xSplitMatch[1], 10) : 0;
          if (ySplit > 0 || xSplit > 0) {
            freezePanes = {
              rows: ySplit,
              cols: xSplit,
              topLeftCell: topLeftMatch ? topLeftMatch[1] : undefined,
            };
          }
        }

        // Parse Columns
        const colMatches = sheetRaw.match(/<col\s+[^>]*\/>/g) || [];
        for (const colTag of colMatches) {
          const minMatch = colTag.match(/min="([0-9]+)"/);
          const maxMatch = colTag.match(/max="([0-9]+)"/);
          const widthMatch = colTag.match(/width="([^"]+)"/);
          const isHidden = colTag.includes('hidden="1"');

          if (minMatch && maxMatch) {
            const min = parseInt(minMatch[1], 10) - 1;
            const max = parseInt(maxMatch[1], 10) - 1;
            const width = widthMatch ? parseFloat(widthMatch[1]) : 10;
            for (let c = min; c <= max; c++) {
              colWidths[c] = width;
              if (isHidden) hiddenCols.push(c);
            }
          }
        }

        // Parse Row properties
        const rowTagMatches = sheetRaw.match(/<row\s+[^>]*>/g) || [];
        for (const rt of rowTagMatches) {
          const rMatch = rt.match(/r="([0-9]+)"/);
          const htMatch = rt.match(/ht="([^"]+)"/);
          const isHidden = rt.includes('hidden="1"');
          if (rMatch) {
            const rIdx = parseInt(rMatch[1], 10) - 1;
            if (htMatch) rowHeights[rIdx] = parseFloat(htMatch[1]);
            if (isHidden) hiddenRows.push(rIdx);
          }
        }

        // Parse Merged Cells
        const mergeMatches = sheetRaw.match(/<mergeCell\s+ref="([^"]+)"\/>/g) || [];
        for (const mm of mergeMatches) {
          const refMatch = mm.match(/ref="([^"]+)"/);
          if (refMatch) {
            mergedRanges.push(refMatch[1]);
          }
        }

        // Parse AutoFilter
        const afMatch = sheetRaw.match(/<autoFilter\s+ref="([^"]+)"\/>/);
        if (afMatch) {
          autoFilter = { range: afMatch[1] };
        }

        // Parse Data Validation
        const dvMatches = sheetRaw.match(/<dataValidation\s+([^>]*)>(.*?)<\/dataValidation>/gs) || [];
        for (const dvm of dvMatches) {
          const typeMatch = dvm.match(/type="([^"]+)"/);
          const sqrefMatch = dvm.match(/sqref="([^"]+)"/);
          const opMatch = dvm.match(/operator="([^"]+)"/);
          const f1Match = dvm.match(/<formula1>([^<]+)<\/formula1>/);
          const f2Match = dvm.match(/<formula2>([^<]+)<\/formula2>/);
          const errMatch = dvm.match(/error="([^"]+)"/);

          if (typeMatch && sqrefMatch && f1Match) {
            dataValidations.push({
              id: generateId('dv'),
              type: typeMatch[1] as any,
              sqref: sqrefMatch[1],
              operator: opMatch ? (opMatch[1] as any) : undefined,
              formula1: unescapeXml(f1Match[1]),
              formula2: f2Match ? unescapeXml(f2Match[1]) : undefined,
              errorMessage: errMatch ? unescapeXml(errMatch[1]) : undefined,
            });
          }
        }

        // Shared Formulas tracking map: si -> { masterRef: string, masterFormula: string }
        const sharedFormulaMasters = new Map<number, { masterRef: string; masterFormula: string }>();

        // Parse cells: <c r="A1" t="s" s="1"><f>...</f><v>...</v></c>
        const cellRegex = /<c\s+([^>]*?)>(?:<f(?:\s+([^>]*?))?>([^<]*)<\/f>)?(?:<v>([^<]*)<\/v>)?(?:<is><t>([^<]*)<\/t><\/is>)?<\/c>/gs;
        let match;
        while ((match = cellRegex.exec(sheetRaw)) !== null) {
          const cAttrs = match[1];
          const fAttrs = match[2] || '';
          const formula = match[3];
          const val = match[4];
          const inlineText = match[5];

          const rMatch = cAttrs.match(/r="([A-Za-z0-9]+)"/);
          if (!rMatch) continue;
          const cellRef = rMatch[1];

          const tMatch = cAttrs.match(/t="([a-z]+)"/);
          const sMatch = cAttrs.match(/s="([0-9]+)"/);
          const type = tMatch ? tMatch[1] : undefined;
          const styleIdx = sMatch ? parseInt(sMatch[1], 10) : 0;
          const xf = parsedXfs[styleIdx];

          // Handle shared formulas
          let resolvedFormula = formula;
          const siMatch = fAttrs.match(/si="([0-9]+)"/);
          const isSharedMaster = fAttrs.includes('t="shared"') && fAttrs.includes('ref=');
          const isSharedFollower = fAttrs.includes('t="shared"') && !fAttrs.includes('ref=');

          if (siMatch) {
            const si = parseInt(siMatch[1], 10);
            if (isSharedMaster && formula) {
              sharedFormulaMasters.set(si, { masterRef: cellRef, masterFormula: formula });
            } else if (isSharedFollower) {
              const master = sharedFormulaMasters.get(si);
              if (master) {
                const srcAddr = parseCellAddress(master.masterRef);
                const tgtAddr = parseCellAddress(cellRef);
                if (srcAddr && tgtAddr) {
                  resolvedFormula = shiftFormulaReferences(
                    `=${master.masterFormula}`,
                    tgtAddr.row - srcAddr.row,
                    tgtAddr.col - srcAddr.col
                  ).slice(1);
                }
              }
            }
          }

          if (resolvedFormula) {
            cells[cellRef] = {
              raw: `=${unescapeXml(resolvedFormula)}`,
              value: val ? (isNaN(Number(val)) ? unescapeXml(val) : Number(val)) : null,
              style: xf?.style,
              format: xf?.format,
              isArrayFormula: fAttrs.includes('t="array"'),
            };
          } else if (type === 's' && val !== undefined) {
            const strIdx = parseInt(val, 10);
            const strVal = sharedStrings[strIdx] ?? '';
            cells[cellRef] = {
              raw: strVal,
              value: strVal,
              style: xf?.style,
              format: xf?.format,
            };
          } else if (type === 'inlineStr' || inlineText !== undefined) {
            const strVal = unescapeXml(inlineText || '');
            cells[cellRef] = {
              raw: strVal,
              value: strVal,
              style: xf?.style,
              format: xf?.format,
            };
          } else if (type === 'b' && val !== undefined) {
            cells[cellRef] = {
              raw: val === '1',
              value: val === '1',
              style: xf?.style,
              format: xf?.format,
            };
          } else if (type === 'e' && val !== undefined) {
            cells[cellRef] = {
              raw: val,
              value: val,
              style: xf?.style,
              format: xf?.format,
            };
          } else if (val !== undefined) {
            const num = Number(val);
            cells[cellRef] = {
              raw: isNaN(num) ? unescapeXml(val) : num,
              value: isNaN(num) ? unescapeXml(val) : num,
              style: xf?.style,
              format: xf?.format,
            };
          }
        }
      }

      sheets.push({
        id: generateId('sheet'),
        name: def.name,
        rowCount: 100,
        colCount: 26,
        cells,
        hidden: def.hidden,
        freezePanes,
        mergedRanges: mergedRanges.length > 0 ? mergedRanges : undefined,
        colWidths: Object.keys(colWidths).length > 0 ? colWidths : undefined,
        rowHeights: Object.keys(rowHeights).length > 0 ? rowHeights : undefined,
        hiddenRows: hiddenRows.length > 0 ? hiddenRows : undefined,
        hiddenCols: hiddenCols.length > 0 ? hiddenCols : undefined,
        dataValidations: dataValidations.length > 0 ? dataValidations : undefined,
        autoFilter,
      });
    }

    return {
      metadata: {
        id: generateId('wb'),
        title: 'Imported Workbook',
        type: 'sum',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      sheets,
      activeSheetId: sheets[0]?.id || '',
      definedNames: definedNames.length > 0 ? definedNames : undefined,
    };
  }
}

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function unescapeXml(str: string): string {
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
