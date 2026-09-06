import JSZip from 'jszip';
import { generateId, SecuritySanitizer } from '@openhead/core';
import { parseCellAddress, colIndexToName } from '@openhead/formula';
import { WorkbookModel, WorksheetModel, CellData } from '../types';

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

    // 2. [Content_Types].xml
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

    // 3. _rels/.rels
    let rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    rootRelsXml += `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n`;
    rootRelsXml += `  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>\n`;
    rootRelsXml += `</Relationships>`;
    zip.file('_rels/.rels', rootRelsXml);

    // 4. xl/_rels/workbook.xml.rels
    let wbRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    wbRelsXml += `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n`;
    wbRelsXml += `  <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\n`;
    wbRelsXml += `  <Relationship Id="rIdSharedStrings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>\n`;
    for (let i = 0; i < workbook.sheets.length; i++) {
      wbRelsXml += `  <Relationship Id="rIdSheet${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>\n`;
    }
    wbRelsXml += `</Relationships>`;
    zip.file('xl/_rels/workbook.xml.rels', wbRelsXml);

    // 5. xl/workbook.xml
    let wbXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    wbXml += `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n`;
    wbXml += `  <sheets>\n`;
    for (let i = 0; i < workbook.sheets.length; i++) {
      const sheet = workbook.sheets[i];
      const stateAttr = sheet.hidden ? ` state="hidden"` : '';
      wbXml += `    <sheet name="${escapeXml(sheet.name)}" sheetId="${i + 1}" r:id="rIdSheet${i + 1}"${stateAttr}/>\n`;
    }
    wbXml += `  </sheets>\n`;
    wbXml += `</workbook>`;
    zip.file('xl/workbook.xml', wbXml);

    // 6. xl/styles.xml
    let stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    stylesXml += `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n`;
    stylesXml += `  <fonts count="2">\n`;
    stylesXml += `    <font><sz val="11"/><name val="Segoe UI"/></font>\n`;
    stylesXml += `    <font><b/><sz val="11"/><name val="Segoe UI"/></font>\n`;
    stylesXml += `  </fonts>\n`;
    stylesXml += `  <fills count="2">\n`;
    stylesXml += `    <fill><patternFill patternType="none"/></fill>\n`;
    stylesXml += `    <fill><patternFill patternType="gray125"/></fill>\n`;
    stylesXml += `  </fills>\n`;
    stylesXml += `  <borders count="1">\n`;
    stylesXml += `    <border><left/><right/><top/><bottom/><diagonal/></border>\n`;
    stylesXml += `  </borders>\n`;
    stylesXml += `  <cellXfs count="2">\n`;
    stylesXml += `    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>\n`;
    stylesXml += `    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>\n`;
    stylesXml += `  </cellXfs>\n`;
    stylesXml += `</styleSheet>`;
    zip.file('xl/styles.xml', stylesXml);

    // 7. Worksheets xl/worksheets/sheet*.xml
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
        const topLeft = `${colIndexToName(xSplit)}${ySplit + 1}`;
        sheetXml += `      <pane xSplit="${xSplit}" ySplit="${ySplit}" topLeftCell="${topLeft}" activePane="bottomRight" state="frozen"/>\n`;
        sheetXml += `    </sheetView>\n`;
        sheetXml += `  </sheetViews>\n`;
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

      const sortedRows = Array.from(rowMap.keys()).sort((a, b) => a - b);
      sheetXml += `  <sheetData>\n`;

      for (const rowIdx of sortedRows) {
        const rowCells = rowMap.get(rowIdx)!;
        rowCells.sort((a, b) => (parseCellAddress(a.key)?.col || 0) - (parseCellAddress(b.key)?.col || 0));

        sheetXml += `    <row r="${rowIdx}">\n`;
        for (const { key, cell } of rowCells) {
          const isFormula = typeof cell.raw === 'string' && cell.raw.startsWith('=');
          const isBold = cell.style?.bold;
          const sAttr = isBold ? ` s="1"` : '';

          if (isFormula) {
            const formulaClean = String(cell.raw).slice(1);
            const valStr = cell.value !== null && cell.value !== undefined ? String(cell.value) : '';
            sheetXml += `      <c r="${key}"${sAttr}><f>${escapeXml(formulaClean)}</f><v>${escapeXml(valStr)}</v></c>\n`;
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
      sheetXml += `</worksheet>`;
      zip.file(`xl/worksheets/sheet${i + 1}.xml`, sheetXml);
    }

    // 8. xl/sharedStrings.xml
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
   * Parses an OOXML (.xlsx) binary ZIP buffer into an Openhead WorkbookModel.
   */
  public static async fromBuffer(data: Uint8Array | ArrayBuffer): Promise<WorkbookModel> {
    const zip = await JSZip.loadAsync(data);

    // 1. Parse Shared Strings
    const sharedStrings: string[] = [];
    const sstFile = zip.file('xl/sharedStrings.xml');
    if (sstFile) {
      const sstRaw = await sstFile.async('text');
      if (!SecuritySanitizer.validateXmlSafety(sstRaw)) {
        throw new Error('Hostile XML entity expansion detected in sharedStrings.xml');
      }
      const matches = sstRaw.match(/<t[^>]*>(.*?)<\/t>/gs);
      if (matches) {
        for (const m of matches) {
          const content = m.replace(/<\/?t[^>]*>/g, '');
          sharedStrings.push(unescapeXml(content));
        }
      }
    }

    // 2. Parse Workbook Definition
    const wbFile = zip.file('xl/workbook.xml');
    const sheetDefs: { name: string; rId: string; hidden: boolean }[] = [];
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
    }

    if (sheetDefs.length === 0) {
      sheetDefs.push({ name: 'Sheet1', rId: 'rIdSheet1', hidden: false });
    }

    // 3. Parse Worksheet files
    const sheets: WorksheetModel[] = [];
    for (let i = 0; i < sheetDefs.length; i++) {
      const def = sheetDefs[i];
      const sheetPath = `xl/worksheets/sheet${i + 1}.xml`;
      const sheetFile = zip.file(sheetPath);
      const cells: Record<string, CellData> = {};

      if (sheetFile) {
        const sheetRaw = await sheetFile.async('text');
        if (!SecuritySanitizer.validateXmlSafety(sheetRaw)) {
          throw new Error(`Hostile XML entity expansion detected in ${sheetPath}`);
        }

        // Parse cells: <c r="A1" t="s"><f>...</f><v>...</v></c>
        const cellRegex = /<c\s+r="([A-Za-z0-9]+)"(?:\s+t="([a-z]+)")?[^>]*>(?:<f>([^<]*)<\/f>)?(?:<v>([^<]*)<\/v>)?<\/c>/g;
        let match;
        while ((match = cellRegex.exec(sheetRaw)) !== null) {
          const cellRef = match[1];
          const type = match[2];
          const formula = match[3];
          const val = match[4];

          if (formula) {
            cells[cellRef] = {
              raw: `=${formula}`,
              value: val ? (isNaN(Number(val)) ? val : Number(val)) : null,
            };
          } else if (type === 's' && val !== undefined) {
            const strIdx = parseInt(val, 10);
            cells[cellRef] = {
              raw: sharedStrings[strIdx] ?? '',
              value: sharedStrings[strIdx] ?? '',
            };
          } else if (type === 'b' && val !== undefined) {
            cells[cellRef] = {
              raw: val === '1',
              value: val === '1',
            };
          } else if (val !== undefined) {
            const num = Number(val);
            cells[cellRef] = {
              raw: isNaN(num) ? val : num,
              value: isNaN(num) ? val : num,
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
