import JSZip from 'jszip';
import {
  GlimpseDeckModel,
  SlideModel,
  SlideNode,
  TextNode,
  ShapeNode,
  ShapeKind,
  TableNode,
  ChartNode,
  ImageNode,
  GroupNode,
  TextRun,
  Paragraph,
} from '../types';
import { GlimpseSecurity } from '../security';
import { generateId } from '@openhead/core';

// Conversion factor: standard 96 DPI CSS px to DrawingML EMUs (1 px = 9525 EMUs at 96 dpi, or 6350 EMUs for 1920x1080 -> 12192000x6858000)
// 1920 px * 6350 = 12,192,000 EMUs (16:9 standard PPTX width)
// 1080 px * 6350 = 6,858,000 EMUs (16:9 standard PPTX height)
const PX_TO_EMU = 6350;

function pxToEmu(px: number): number {
  return Math.round((px || 0) * PX_TO_EMU);
}

function emuToPx(emu: number): number {
  return Math.round((emu || 0) / PX_TO_EMU);
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function hexToRgb(hex: string): string {
  if (!hex) return 'FFFFFF';
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length === 8) {
    clean = clean.substring(0, 6);
  }
  if (clean.length !== 6) return '000000';
  return clean.toUpperCase();
}

function shapeKindToPreset(kind: ShapeKind): string {
  switch (kind) {
    case 'rectangle':
    case 'card':
      return 'rect';
    case 'rounded-rectangle':
    case 'badge':
      return 'roundRect';
    case 'circle':
      return 'ellipse';
    case 'triangle':
      return 'triangle';
    case 'line':
      return 'line';
    case 'arrow':
      return 'rightArrow';
    case 'diamond':
      return 'diamond';
    case 'pentagon':
      return 'pentagon';
    case 'hexagon':
      return 'hexagon';
    case 'star':
      return 'star5';
    case 'callout':
      return 'wedgeRectCallout';
    default:
      return 'rect';
  }
}

function presetToShapeKind(preset: string): ShapeKind {
  switch (preset) {
    case 'rect':
      return 'rectangle';
    case 'roundRect':
      return 'rounded-rectangle';
    case 'ellipse':
      return 'circle';
    case 'triangle':
      return 'triangle';
    case 'line':
      return 'line';
    case 'rightArrow':
      return 'arrow';
    case 'diamond':
      return 'diamond';
    case 'pentagon':
      return 'pentagon';
    case 'hexagon':
      return 'hexagon';
    case 'star5':
    case 'star':
      return 'star';
    case 'wedgeRectCallout':
      return 'callout';
    default:
      return 'rectangle';
  }
}

export class PptxAdapter {
  /**
   * Generates a raw PresentationML presentation.xml string.
   */
  public static toPresentationML(deck: GlimpseDeckModel): string {
    const sldWidthEmu = pxToEmu(deck.dimensions?.width || 1920);
    const sldHeightEmu = pxToEmu(deck.dimensions?.height || 1080);

    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    xml += `<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">\n`;
    xml += `  <p:sldMasterIdLst>\n`;
    xml += `    <p:sldMasterId id="2147483648" r:id="rId1"/>\n`;
    xml += `  </p:sldMasterIdLst>\n`;
    xml += `  <p:sldIdLst>\n`;

    deck.slides.forEach((_, idx) => {
      xml += `    <p:sldId id="${256 + idx}" r:id="rIdSlide${idx + 1}"/>\n`;
    });

    xml += `  </p:sldIdLst>\n`;
    xml += `  <p:sldSz cx="${sldWidthEmu}" cy="${sldHeightEmu}" type="screen16x9"/>\n`;
    xml += `  <p:notesSz cx="6858000" cy="9144000"/>\n`;
    xml += `</p:presentation>`;
    return xml;
  }

  /**
   * Generates a single slide XML string.
   */
  public static toSlideXml(slide: SlideModel, _slideIndex?: number): string {
    let xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    xml += `<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">\n`;
    xml += `  <p:cSld name="${escapeXml(slide.title)}">\n`;

    // Background fill
    const bgColor = slide.background && slide.background.startsWith('#') ? hexToRgb(slide.background) : '1E293B';
    xml += `    <p:bg>\n`;
    xml += `      <p:bgPr>\n`;
    xml += `        <a:solidFill><a:srgbClr val="${bgColor}"/></a:solidFill>\n`;
    xml += `        <a:effectLst/>\n`;
    xml += `      </p:bgPr>\n`;
    xml += `    </p:bg>\n`;

    xml += `    <p:spTree>\n`;
    xml += `      <p:nvGrpSpPr>\n`;
    xml += `        <p:cNvPr id="1" name=""/>\n`;
    xml += `        <p:cNvGrpSpPr/>\n`;
    xml += `        <p:nvPr/>\n`;
    xml += `      </p:nvGrpSpPr>\n`;
    xml += `      <p:grpSpPr>\n`;
    xml += `        <a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm>\n`;
    xml += `      </p:grpSpPr>\n`;

    let shapeId = 2;

    for (const node of slide.nodes) {
      if (node.type === 'text') {
        xml += this.serializeTextShape(node as TextNode, shapeId++);
      } else if (node.type === 'shape') {
        xml += this.serializeGeomShape(node as ShapeNode, shapeId++);
      } else if (node.type === 'table') {
        xml += this.serializeTable(node as TableNode, shapeId++);
      } else if (node.type === 'chart') {
        xml += this.serializeChartAsShape(node as ChartNode, shapeId++);
      } else if (node.type === 'image') {
        xml += this.serializeImagePlaceholder(node as ImageNode, shapeId++);
      } else if (node.type === 'group') {
        xml += this.serializeGroup(node as GroupNode, shapeId++);
      }
    }

    xml += `    </p:spTree>\n`;
    xml += `  </p:cSld>\n`;
    xml += `  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>\n`;

    // Slide transition
    if (slide.transition && slide.transition !== 'none') {
      const transType = typeof slide.transition === 'object' ? slide.transition.type : slide.transition;
      if (transType === 'fade') {
        xml += `  <p:transition spd="med"><p:fade/></p:transition>\n`;
      } else if (transType === 'push' || transType === 'slide-left' || transType === 'slide-up') {
        xml += `  <p:transition spd="med"><p:push/></p:transition>\n`;
      } else if (transType === 'wipe') {
        xml += `  <p:transition spd="med"><p:wipe/></p:transition>\n`;
      } else if (transType === 'zoom') {
        xml += `  <p:transition spd="med"><p:zoom/></p:transition>\n`;
      }
    }

    xml += `</p:sld>`;
    return xml;
  }

  private static serializeTextShape(node: TextNode, id: number): string {
    const x = pxToEmu(node.x);
    const y = pxToEmu(node.y);
    const cx = pxToEmu(node.width);
    const cy = pxToEmu(node.height);

    let xml = `      <p:sp>\n`;
    xml += `        <p:nvSpPr>\n`;
    xml += `          <p:cNvPr id="${id}" name="TextBox ${id}"/>\n`;
    xml += `          <p:cNvSpPr txBox="1"/>\n`;
    xml += `          <p:nvPr/>\n`;
    xml += `        </p:nvSpPr>\n`;
    xml += `        <p:spPr>\n`;
    xml += `          <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>\n`;
    xml += `          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>\n`;
    xml += `          <a:noFill/>\n`;
    xml += `        </p:spPr>\n`;
    xml += `        <p:txBody>\n`;
    xml += `          <a:bodyPr wrap="square" rtlCol="0">\n`;
    xml += `            <a:spAutoFit/>\n`;
    xml += `          </a:bodyPr>\n`;
    xml += `          <a:lstStyle/>\n`;

    if (node.paragraphs && node.paragraphs.length > 0) {
      for (const para of node.paragraphs) {
        xml += this.serializeParagraph(para, node);
      }
    } else {
      const align = node.align === 'center' ? 'ctr' : node.align === 'right' ? 'r' : 'l';
      const fontSize = Math.round((node.fontSize || 24) * 100);
      const color = hexToRgb(node.color || '#FFFFFF');
      const isBold = node.fontWeight === 'bold' || node.fontWeight === 700;

      xml += `          <a:p>\n`;
      xml += `            <a:pPr algn="${align}"/>\n`;
      xml += `            <a:r>\n`;
      xml += `              <a:rPr lang="en-US" sz="${fontSize}" b="${isBold ? '1' : '0'}">\n`;
      xml += `                <a:solidFill><a:srgbClr val="${color}"/></a:solidFill>\n`;
      if (node.fontFamily) {
        xml += `                <a:latin typeface="${escapeXml(node.fontFamily)}"/>\n`;
      }
      xml += `              </a:rPr>\n`;
      xml += `              <a:t>${escapeXml(node.text || '')}</a:t>\n`;
      xml += `            </a:r>\n`;
      xml += `          </a:p>\n`;
    }

    xml += `        </p:txBody>\n`;
    xml += `      </p:sp>\n`;
    return xml;
  }

  private static serializeParagraph(para: Paragraph, parentNode?: TextNode): string {
    const align = para.align === 'center' ? 'ctr' : para.align === 'right' ? 'r' : 'l';
    let xml = `          <a:p>\n`;
    xml += `            <a:pPr algn="${align}">\n`;
    if (para.bullet) {
      xml += `              <a:buChar char="•"/>\n`;
    } else if (para.numbered) {
      xml += `              <a:buAutoNum type="arabicPeriod"/>\n`;
    }
    xml += `            </a:pPr>\n`;

    for (const run of para.runs) {
      const fontSize = Math.round((run.fontSize || parentNode?.fontSize || 24) * 100);
      const color = hexToRgb(run.color || parentNode?.color || '#FFFFFF');
      xml += `            <a:r>\n`;
      xml += `              <a:rPr lang="en-US" sz="${fontSize}" b="${run.bold ? '1' : '0'}" i="${run.italic ? '1' : '0'}" u="${run.underline ? 'sng' : 'none'}" strike="${run.strikethrough ? 'sngStrike' : 'noStrike'}">\n`;
      xml += `                <a:solidFill><a:srgbClr val="${color}"/></a:solidFill>\n`;
      if (run.fontFamily || parentNode?.fontFamily) {
        xml += `                <a:latin typeface="${escapeXml(run.fontFamily || parentNode?.fontFamily || 'Inter')}"/>\n`;
      }
      if (run.link) {
        xml += `                <a:hlinkClick r:id="" tooltip="${escapeXml(run.link)}"/>\n`;
      }
      xml += `              </a:rPr>\n`;
      xml += `              <a:t>${escapeXml(run.text || '')}</a:t>\n`;
      xml += `            </a:r>\n`;
    }

    xml += `          </a:p>\n`;
    return xml;
  }

  private static serializeGeomShape(node: ShapeNode, id: number): string {
    const x = pxToEmu(node.x);
    const y = pxToEmu(node.y);
    const cx = pxToEmu(node.width);
    const cy = pxToEmu(node.height);
    const prst = shapeKindToPreset(node.kind);
    const fillColor = hexToRgb(node.fill || '#3B82F6');

    let xml = `      <p:sp>\n`;
    xml += `        <p:nvSpPr>\n`;
    xml += `          <p:cNvPr id="${id}" name="${node.kind} ${id}"/>\n`;
    xml += `          <p:cNvSpPr/>\n`;
    xml += `          <p:nvPr/>\n`;
    xml += `        </p:nvSpPr>\n`;
    xml += `        <p:spPr>\n`;
    xml += `          <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>\n`;
    xml += `          <a:prstGeom prst="${prst}"><a:avLst/></a:prstGeom>\n`;
    xml += `          <a:solidFill><a:srgbClr val="${fillColor}"/></a:solidFill>\n`;

    if (node.stroke) {
      const strokeClr = hexToRgb(node.stroke);
      const strokeW = pxToEmu(node.strokeWidth || 1);
      xml += `          <a:ln w="${strokeW}">\n`;
      xml += `            <a:solidFill><a:srgbClr val="${strokeClr}"/></a:solidFill>\n`;
      if (node.strokeDash === 'dashed') {
        xml += `            <a:prstDash val="dash"/>\n`;
      }
      xml += `          </a:ln>\n`;
    }

    xml += `        </p:spPr>\n`;

    if (node.text || (node.paragraphs && node.paragraphs.length > 0)) {
      xml += `        <p:txBody>\n`;
      xml += `          <a:bodyPr anchor="ctr"/>\n`;
      xml += `          <a:lstStyle/>\n`;
      if (node.paragraphs && node.paragraphs.length > 0) {
        for (const p of node.paragraphs) {
          xml += this.serializeParagraph(p);
        }
      } else {
        const textColor = hexToRgb(node.textColor || '#FFFFFF');
        const fontSize = Math.round((node.fontSize || 20) * 100);
        xml += `          <a:p>\n`;
        xml += `            <a:pPr algn="ctr"/>\n`;
        xml += `            <a:r>\n`;
        xml += `              <a:rPr sz="${fontSize}">\n`;
        xml += `                <a:solidFill><a:srgbClr val="${textColor}"/></a:solidFill>\n`;
        xml += `              </a:rPr>\n`;
        xml += `              <a:t>${escapeXml(node.text || '')}</a:t>\n`;
        xml += `            </a:r>\n`;
        xml += `          </a:p>\n`;
      }
      xml += `        </p:txBody>\n`;
    }

    xml += `      </p:sp>\n`;
    return xml;
  }

  private static serializeTable(node: TableNode, id: number): string {
    const x = pxToEmu(node.x);
    const y = pxToEmu(node.y);
    const cx = pxToEmu(node.width);
    const cy = pxToEmu(node.height);

    const cols = node.columns || 1;
    const colW = Math.round(cx / cols);
    const rowH = Math.round(cy / (node.rows || 1));

    let xml = `      <p:graphicFrame>\n`;
    xml += `        <p:nvGraphicFramePr>\n`;
    xml += `          <p:cNvPr id="${id}" name="Table ${id}"/>\n`;
    xml += `          <p:cNvGraphicFramePr><a:graphicFrameLocks noGrp="1"/></p:cNvGraphicFramePr>\n`;
    xml += `          <p:nvPr/>\n`;
    xml += `        </p:nvGraphicFramePr>\n`;
    xml += `        <p:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></p:xfrm>\n`;
    xml += `        <a:graphic>\n`;
    xml += `          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table">\n`;
    xml += `            <a:tbl>\n`;
    xml += `              <a:tblPr firstRow="${node.headerRow ? '1' : '0'}" bandRow="1">\n`;
    xml += `                <a:tableStyleId>{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}</a:tableStyleId>\n`;
    xml += `              </a:tblPr>\n`;
    xml += `              <a:tblGrid>\n`;
    for (let c = 0; c < cols; c++) {
      xml += `                <a:gridCol w="${colW}"/>\n`;
    }
    xml += `              </a:tblGrid>\n`;

    for (let r = 0; r < node.rows; r++) {
      xml += `              <a:tr h="${rowH}">\n`;
      for (let c = 0; c < cols; c++) {
        const cell = node.cells?.[r]?.[c];
        const text = cell?.text || '';
        const cellBg = cell?.fill ? hexToRgb(cell.fill) : r === 0 && node.headerRow ? '1E293B' : '0F172A';

        xml += `                <a:tc>\n`;
        xml += `                  <a:txBody>\n`;
        xml += `                    <a:bodyPr/>\n`;
        xml += `                    <a:lstStyle/>\n`;
        xml += `                    <a:p>\n`;
        xml += `                      <a:r>\n`;
        xml += `                        <a:rPr sz="1800" b="${r === 0 && node.headerRow ? '1' : '0'}">\n`;
        xml += `                          <a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>\n`;
        xml += `                        </a:rPr>\n`;
        xml += `                        <a:t>${escapeXml(text)}</a:t>\n`;
        xml += `                      </a:r>\n`;
        xml += `                    </a:p>\n`;
        xml += `                  </a:txBody>\n`;
        xml += `                  <a:tcPr>\n`;
        xml += `                    <a:solidFill><a:srgbClr val="${cellBg}"/></a:solidFill>\n`;
        xml += `                  </a:tcPr>\n`;
        xml += `                </a:tc>\n`;
      }
      xml += `              </a:tr>\n`;
    }

    xml += `            </a:tbl>\n`;
    xml += `          </a:graphicData>\n`;
    xml += `        </a:graphic>\n`;
    xml += `      </p:graphicFrame>\n`;
    return xml;
  }

  private static serializeChartAsShape(node: ChartNode, id: number): string {
    const x = pxToEmu(node.x);
    const y = pxToEmu(node.y);
    const cx = pxToEmu(node.width);
    const cy = pxToEmu(node.height);

    let xml = `      <p:sp>\n`;
    xml += `        <p:nvSpPr>\n`;
    xml += `          <p:cNvPr id="${id}" name="Chart ${escapeXml(node.title || '')}"/>\n`;
    xml += `          <p:cNvSpPr/>\n`;
    xml += `          <p:nvPr/>\n`;
    xml += `        </p:nvSpPr>\n`;
    xml += `        <p:spPr>\n`;
    xml += `          <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>\n`;
    xml += `          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>\n`;
    xml += `          <a:solidFill><a:srgbClr val="1E293B"/></a:solidFill>\n`;
    xml += `          <a:ln w="12700"><a:solidFill><a:srgbClr val="3B82F6"/></a:solidFill></a:ln>\n`;
    xml += `        </p:spPr>\n`;
    xml += `        <p:txBody>\n`;
    xml += `          <a:bodyPr anchor="t"/>\n`;
    xml += `          <a:lstStyle/>\n`;
    xml += `          <a:p>\n`;
    xml += `            <a:r>\n`;
    xml += `              <a:rPr sz="2200" b="1"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:rPr>\n`;
    xml += `              <a:t>[Chart: ${escapeXml(node.title || node.chartType.toUpperCase())}]</a:t>\n`;
    xml += `            </a:r>\n`;
    xml += `          </a:p>\n`;

    if (node.categories && node.series) {
      for (const s of node.series) {
        xml += `          <a:p>\n`;
        xml += `            <a:r>\n`;
        xml += `              <a:rPr sz="1600"><a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill></a:rPr>\n`;
        xml += `              <a:t>• ${escapeXml(s.name)}: ${s.data.join(', ')}</a:t>\n`;
        xml += `            </a:r>\n`;
        xml += `          </a:p>\n`;
      }
    }

    xml += `        </p:txBody>\n`;
    xml += `      </p:sp>\n`;
    return xml;
  }

  private static serializeImagePlaceholder(node: ImageNode, id: number): string {
    const x = pxToEmu(node.x);
    const y = pxToEmu(node.y);
    const cx = pxToEmu(node.width);
    const cy = pxToEmu(node.height);

    let xml = `      <p:sp>\n`;
    xml += `        <p:nvSpPr>\n`;
    xml += `          <p:cNvPr id="${id}" name="Image ${id}"/>\n`;
    xml += `          <p:cNvSpPr/>\n`;
    xml += `          <p:nvPr/>\n`;
    xml += `        </p:nvSpPr>\n`;
    xml += `        <p:spPr>\n`;
    xml += `          <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm>\n`;
    xml += `          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>\n`;
    xml += `          <a:solidFill><a:srgbClr val="0F172A"/></a:solidFill>\n`;
    xml += `          <a:ln w="12700"><a:solidFill><a:srgbClr val="475569"/></a:solidFill></a:ln>\n`;
    xml += `        </p:spPr>\n`;
    xml += `        <p:txBody>\n`;
    xml += `          <a:bodyPr anchor="ctr"/>\n`;
    xml += `          <a:lstStyle/>\n`;
    xml += `          <a:p>\n`;
    xml += `            <a:pPr algn="ctr"/>\n`;
    xml += `            <a:r>\n`;
    xml += `              <a:rPr sz="1800"><a:solidFill><a:srgbClr val="94A3B8"/></a:solidFill></a:rPr>\n`;
    xml += `              <a:t>[Image: ${escapeXml(node.alt || node.src)}]</a:t>\n`;
    xml += `            </a:r>\n`;
    xml += `          </a:p>\n`;
    xml += `        </p:txBody>\n`;
    xml += `      </p:sp>\n`;
    return xml;
  }

  private static serializeGroup(node: GroupNode, id: number): string {
    const x = pxToEmu(node.x);
    const y = pxToEmu(node.y);
    const cx = pxToEmu(node.width);
    const cy = pxToEmu(node.height);

    let xml = `      <p:grpSp>\n`;
    xml += `        <p:nvGrpSpPr>\n`;
    xml += `          <p:cNvPr id="${id}" name="Group ${id}"/>\n`;
    xml += `          <p:cNvGrpSpPr/>\n`;
    xml += `          <p:nvPr/>\n`;
    xml += `        </p:nvGrpSpPr>\n`;
    xml += `        <p:grpSpPr>\n`;
    xml += `          <a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/><a:chOff x="${x}" y="${y}"/><a:chExt cx="${cx}" cy="${cy}"/></a:xfrm>\n`;
    xml += `        </p:grpSpPr>\n`;

    let childId = id * 100;
    for (const child of node.children) {
      if (child.type === 'text') {
        xml += this.serializeTextShape(child as TextNode, childId++);
      } else if (child.type === 'shape') {
        xml += this.serializeGeomShape(child as ShapeNode, childId++);
      }
    }

    xml += `      </p:grpSp>\n`;
    return xml;
  }

  /**
   * Generates a complete, standards-compliant OOXML .pptx ZIP archive buffer.
   */
  public static async toBuffer(deck: GlimpseDeckModel): Promise<Uint8Array> {
    const zip = new JSZip();

    // 1. [Content_Types].xml
    let contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    contentTypesXml += `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n`;
    contentTypesXml += `  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n`;
    contentTypesXml += `  <Default Extension="xml" ContentType="application/xml"/>\n`;
    contentTypesXml += `  <Default Extension="jpeg" ContentType="image/jpeg"/>\n`;
    contentTypesXml += `  <Default Extension="png" ContentType="image/png"/>\n`;
    contentTypesXml += `  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>\n`;
    contentTypesXml += `  <Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawingml.theme+xml"/>\n`;
    contentTypesXml += `  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>\n`;
    contentTypesXml += `  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>\n`;

    deck.slides.forEach((_, idx) => {
      contentTypesXml += `  <Override PartName="/ppt/slides/slide${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>\n`;
      contentTypesXml += `  <Override PartName="/ppt/notesSlides/notesSlide${idx + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>\n`;
    });

    contentTypesXml += `</Types>`;
    zip.file('[Content_Types].xml', contentTypesXml);

    // 2. _rels/.rels
    let rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    rootRelsXml += `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n`;
    rootRelsXml += `  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>\n`;
    rootRelsXml += `  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>\n`;
    rootRelsXml += `  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>\n`;
    rootRelsXml += `</Relationships>`;
    zip.file('_rels/.rels', rootRelsXml);

    // 3. docProps/core.xml & docProps/app.xml
    const nowIso = new Date().toISOString();
    let coreXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    coreXml += `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n`;
    coreXml += `  <dc:title>${escapeXml(deck.metadata.title)}</dc:title>\n`;
    coreXml += `  <dc:creator>Openhead Glimpse</dc:creator>\n`;
    coreXml += `  <cp:lastModifiedBy>Openhead Glimpse</cp:lastModifiedBy>\n`;
    coreXml += `  <dcterms:created xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:created>\n`;
    coreXml += `  <dcterms:modified xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:modified>\n`;
    coreXml += `</cp:coreProperties>`;
    zip.file('docProps/core.xml', coreXml);

    let appXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    appXml += `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">\n`;
    appXml += `  <Application>Openhead Glimpse</Application>\n`;
    appXml += `  <Slides>${deck.slides.length}</Slides>\n`;
    appXml += `</Properties>`;
    zip.file('docProps/app.xml', appXml);

    // 4. ppt/presentation.xml
    zip.file('ppt/presentation.xml', this.toPresentationML(deck));

    // 5. ppt/_rels/presentation.xml.rels
    let presRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    presRelsXml += `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n`;
    presRelsXml += `  <Relationship Id="rIdTheme1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="theme/theme1.xml"/>\n`;

    deck.slides.forEach((_, idx) => {
      presRelsXml += `  <Relationship Id="rIdSlide${idx + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${idx + 1}.xml"/>\n`;
    });

    presRelsXml += `</Relationships>`;
    zip.file('ppt/_rels/presentation.xml.rels', presRelsXml);

    // 6. ppt/theme/theme1.xml
    let themeXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    themeXml += `<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Office Theme">\n`;
    themeXml += `  <a:themeElements>\n`;
    themeXml += `    <a:clrScheme name="Office">\n`;
    themeXml += `      <a:dk1><a:srgbClr val="000000"/></a:dk1>\n`;
    themeXml += `      <a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>\n`;
    themeXml += `      <a:dk2><a:srgbClr val="1E293B"/></a:dk2>\n`;
    themeXml += `      <a:lt2><a:srgbClr val="F8FAFC"/></a:lt2>\n`;
    themeXml += `      <a:accent1><a:srgbClr val="3B82F6"/></a:accent1>\n`;
    themeXml += `      <a:accent2><a:srgbClr val="10B981"/></a:accent2>\n`;
    themeXml += `      <a:accent3><a:srgbClr val="F59E0B"/></a:accent3>\n`;
    themeXml += `      <a:accent4><a:srgbClr val="EF4444"/></a:accent4>\n`;
    themeXml += `      <a:accent5><a:srgbClr val="8B5CF6"/></a:accent5>\n`;
    themeXml += `      <a:accent6><a:srgbClr val="EC4899"/></a:accent6>\n`;
    themeXml += `      <a:hlink><a:srgbClr val="38BDF8"/></a:hlink>\n`;
    themeXml += `      <a:folHlink><a:srgbClr val="818CF8"/></a:folHlink>\n`;
    themeXml += `    </a:clrScheme>\n`;
    themeXml += `    <a:fontScheme name="Office">\n`;
    themeXml += `      <a:majorFont><a:latin typeface="Inter"/></a:majorFont>\n`;
    themeXml += `      <a:minorFont><a:latin typeface="Inter"/></a:minorFont>\n`;
    themeXml += `    </a:fontScheme>\n`;
    themeXml += `    <a:fmtScheme name="Office">\n`;
    themeXml += `      <a:fillStyleLst><a:solidFill><a:srgbClr val="3B82F6"/></a:solidFill></a:fillStyleLst>\n`;
    themeXml += `      <a:lnStyleLst><a:ln w="9525"><a:solidFill><a:srgbClr val="3B82F6"/></a:solidFill></a:ln></a:lnStyleLst>\n`;
    themeXml += `      <a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>\n`;
    themeXml += `      <a:bgFillStyleLst><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:bgFillStyleLst>\n`;
    themeXml += `    </a:fmtScheme>\n`;
    themeXml += `  </a:themeElements>\n`;
    themeXml += `</a:theme>`;
    zip.file('ppt/theme/theme1.xml', themeXml);

    // 7. ppt/slides/slide{N}.xml & notesSlides/notesSlide{N}.xml
    deck.slides.forEach((slide, idx) => {
      const slideXml = this.toSlideXml(slide, idx + 1);
      zip.file(`ppt/slides/slide${idx + 1}.xml`, slideXml);

      // Slide relationships (linking to notesSlide)
      let slideRelXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
      slideRelXml += `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n`;
      slideRelXml += `  <Relationship Id="rIdNotes" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide${idx + 1}.xml"/>\n`;
      slideRelXml += `</Relationships>`;
      zip.file(`ppt/slides/_rels/slide${idx + 1}.xml.rels`, slideRelXml);

      // Notes Slide
      const notesText = slide.notes || '';
      let notesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
      notesXml += `<p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">\n`;
      notesXml += `  <p:cSld>\n`;
      notesXml += `    <p:spTree>\n`;
      notesXml += `      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>\n`;
      notesXml += `      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>\n`;
      notesXml += `      <p:sp>\n`;
      notesXml += `        <p:nvSpPr><p:cNvPr id="2" name="Notes Placeholder 2"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>\n`;
      notesXml += `        <p:spPr><a:xfrm><a:off x="685800" y="685800"/><a:ext cx="5486400" cy="7772400"/></a:xfrm></p:spPr>\n`;
      notesXml += `        <p:txBody>\n`;
      notesXml += `          <a:bodyPr/>\n`;
      notesXml += `          <a:lstStyle/>\n`;
      notesXml += `          <a:p>\n`;
      notesXml += `            <a:r>\n`;
      notesXml += `              <a:rPr sz="1200"><a:solidFill><a:srgbClr val="000000"/></a:solidFill></a:rPr>\n`;
      notesXml += `              <a:t>${escapeXml(notesText)}</a:t>\n`;
      notesXml += `            </a:r>\n`;
      notesXml += `          </a:p>\n`;
      notesXml += `        </p:txBody>\n`;
      notesXml += `      </p:sp>\n`;
      notesXml += `    </p:spTree>\n`;
      notesXml += `  </p:cSld>\n`;
      notesXml += `</p:notes>`;
      zip.file(`ppt/notesSlides/notesSlide${idx + 1}.xml`, notesXml);
    });

    const outBuf = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
    return outBuf;
  }

  /**
   * Parses a complete .pptx ZIP archive buffer into a GlimpseDeckModel.
   */
  public static async fromBuffer(buffer: ArrayBuffer | Uint8Array): Promise<GlimpseDeckModel> {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(buffer);

    let totalUncompressedSize = 0;
    const entryCount = Object.keys(loadedZip.files).length;
    if (entryCount > GlimpseSecurity.MAX_ZIP_ENTRIES) {
      throw new Error(`Security Violation: ZIP entry count (${entryCount}) exceeds safe limit.`);
    }

    for (const [path, file] of Object.entries(loadedZip.files)) {
      GlimpseSecurity.validateEntryPath(path);
      const uncompressedSize = (file as any)._data?.uncompressedSize || 0;
      totalUncompressedSize += uncompressedSize;
      if (totalUncompressedSize > GlimpseSecurity.MAX_UNCOMPRESSED_BYTES) {
        throw new Error(`Security Violation: PPTX exceeds maximum decompression limit of ${GlimpseSecurity.MAX_UNCOMPRESSED_BYTES} bytes.`);
      }
    }

    // 1. Read presentation.xml
    const presFile = loadedZip.file('ppt/presentation.xml');
    if (!presFile) {
      throw new Error('Invalid PPTX archive: Missing ppt/presentation.xml.');
    }
    const presXml = await presFile.async('text');
    GlimpseSecurity.validateXmlContent(presXml, 'ppt/presentation.xml');

    let widthPx = 1920;
    let heightPx = 1080;
    const sldSzMatch = /<p:sldSz\b[^>]*\bcx="(\d+)"[^>]*\bcy="(\d+)"/i.exec(presXml);
    if (sldSzMatch) {
      const cxEmu = parseInt(sldSzMatch[1], 10);
      const cyEmu = parseInt(sldSzMatch[2], 10);
      if (cxEmu > 0 && cyEmu > 0) {
        widthPx = emuToPx(cxEmu);
        heightPx = emuToPx(cyEmu);
      }
    }

    // 2. Discover slide files
    const slideEntries = Object.keys(loadedZip.files)
      .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10);
        const numB = parseInt(b.replace(/\D/g, ''), 10);
        return numA - numB;
      });

    const slides: SlideModel[] = [];

    for (let i = 0; i < slideEntries.length; i++) {
      const slidePath = slideEntries[i];
      const slideFile = loadedZip.file(slidePath)!;
      const slideXml = await slideFile.async('text');
      GlimpseSecurity.validateXmlContent(slideXml, slidePath);

      // Check for matching notes slide
      const slideNum = slidePath.replace(/\D/g, '');
      const notesFile = loadedZip.file(`ppt/notesSlides/notesSlide${slideNum}.xml`);
      let notes = '';
      if (notesFile) {
        const notesXml = await notesFile.async('text');
        GlimpseSecurity.validateXmlContent(notesXml, `ppt/notesSlides/notesSlide${slideNum}.xml`);
        notes = this.extractTextFromXml(notesXml);
      }

      const slideModel = this.parseSlideXml(slideXml, i + 1, notes);
      slides.push(slideModel);
    }

    if (slides.length === 0) {
      slides.push({
        id: generateId('slide'),
        title: 'Slide 1',
        background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
        nodes: [],
      });
    }

    return {
      metadata: {
        id: generateId('deck'),
        title: 'Imported Presentation',
        type: 'glimpse',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        version: 1,
      },
      dimensions: {
        width: widthPx,
        height: heightPx,
        aspectRatio: widthPx / heightPx >= 1.7 ? '16:9' : '4:3',
      },
      slides,
      activeSlideId: slides[0].id,
    };
  }

  private static parseSlideXml(xml: string, slideNumber: number, notes?: string): SlideModel {
    const slideId = generateId('slide');
    const nodes: SlideNode[] = [];

    // Check background color
    let background = 'radial-gradient(ellipse at top, #1e293b, #0f172a)';
    const bgClrMatch = /<p:bg>[\s\S]*?<a:srgbClr\b[^>]*\bval="([A-Fa-f0-9]{6})"/i.exec(xml);
    if (bgClrMatch) {
      background = `#${bgClrMatch[1]}`;
    }

    // Extract slide title if present
    let title = `Slide ${slideNumber}`;
    const nameMatch = /<p:cSld\b[^>]*\bname="([^"]+)"/i.exec(xml);
    if (nameMatch && nameMatch[1]) {
      title = nameMatch[1];
    }

    // Parse Shapes (<p:sp>)
    const shapeRegex = /<p:sp\b[\s\S]*?<\/p:sp>/gi;
    let shapeMatch: RegExpExecArray | null;
    let zIndex = 1;

    while ((shapeMatch = shapeRegex.exec(xml)) !== null) {
      const spXml = shapeMatch[0];

      // Xfrm
      const xfrmMatch = /<a:off\b[^>]*\bx="(-?\d+)"[^>]*\by="(-?\d+)"[\s\S]*?<a:ext\b[^>]*\bcx="(\d+)"[^>]*\bcy="(\d+)"/i.exec(spXml);
      const x = xfrmMatch ? emuToPx(parseInt(xfrmMatch[1], 10)) : 100;
      const y = xfrmMatch ? emuToPx(parseInt(xfrmMatch[2], 10)) : 100;
      const width = xfrmMatch ? Math.max(20, emuToPx(parseInt(xfrmMatch[3], 10))) : 400;
      const height = xfrmMatch ? Math.max(20, emuToPx(parseInt(xfrmMatch[4], 10))) : 100;

      // Text Body
      const paragraphs = this.parseParagraphs(spXml);
      const textContent = paragraphs.map((p) => p.runs.map((r) => r.text).join('')).join('\n');

      // Geometry preset
      const prstMatch = /<a:prstGeom\b[^>]*\bprst="([^"]+)"/i.exec(spXml);
      const prst = prstMatch ? prstMatch[1] : 'rect';
      const isTxBox = /<p:cNvSpPr\b[^>]*\btxBox="1"/i.test(spXml);

      // Fill color
      const fillMatch = /<p:spPr>[\s\S]*?<a:solidFill>[\s\S]*?<a:srgbClr\b[^>]*\bval="([A-Fa-f0-9]{6})"/i.exec(spXml);
      const fill = fillMatch ? `#${fillMatch[1]}` : undefined;

      if (isTxBox || (!fill && prst === 'rect')) {
        const textNode: TextNode = {
          id: generateId('node'),
          type: 'text',
          x,
          y,
          width,
          height,
          text: textContent,
          paragraphs,
          zIndex: zIndex++,
        };
        nodes.push(textNode);
      } else {
        const shapeNode: ShapeNode = {
          id: generateId('node'),
          type: 'shape',
          kind: presetToShapeKind(prst),
          x,
          y,
          width,
          height,
          fill: fill || '#3B82F6',
          text: textContent,
          paragraphs,
          zIndex: zIndex++,
        };
        nodes.push(shapeNode);
      }
    }

    // Parse Tables (<a:tbl>)
    const tableRegex = /<p:graphicFrame\b[\s\S]*?<a:tbl\b[\s\S]*?<\/a:tbl>[\s\S]*?<\/p:graphicFrame>/gi;
    let tblMatch: RegExpExecArray | null;

    while ((tblMatch = tableRegex.exec(xml)) !== null) {
      const gfXml = tblMatch[0];
      const xfrmMatch = /<p:xfrm>[\s\S]*?<a:off\b[^>]*\bx="(-?\d+)"[^>]*\by="(-?\d+)"[\s\S]*?<a:ext\b[^>]*\bcx="(\d+)"[^>]*\bcy="(\d+)"/i.exec(gfXml);
      const x = xfrmMatch ? emuToPx(parseInt(xfrmMatch[1], 10)) : 120;
      const y = xfrmMatch ? emuToPx(parseInt(xfrmMatch[2], 10)) : 200;
      const width = xfrmMatch ? Math.max(100, emuToPx(parseInt(xfrmMatch[3], 10))) : 1200;
      const height = xfrmMatch ? Math.max(100, emuToPx(parseInt(xfrmMatch[4], 10))) : 500;

      const rows: any[][] = [];
      const trRegex = /<a:tr\b[\s\S]*?<\/a:tr>/gi;
      let trMatch: RegExpExecArray | null;

      while ((trMatch = trRegex.exec(gfXml)) !== null) {
        const rowCells: any[] = [];
        const tcRegex = /<a:tc\b[\s\S]*?<\/a:tc>/gi;
        let tcMatch: RegExpExecArray | null;
        while ((tcMatch = tcRegex.exec(trMatch[0])) !== null) {
          const text = this.extractTextFromXml(tcMatch[0]);
          rowCells.push({ id: generateId('cell'), text, align: 'left' });
        }
        rows.push(rowCells);
      }

      if (rows.length > 0) {
        const tableNode: TableNode = {
          id: generateId('node'),
          type: 'table',
          x,
          y,
          width,
          height,
          rows: rows.length,
          columns: rows[0]?.length || 1,
          cells: rows,
          headerRow: true,
          zIndex: zIndex++,
        };
        nodes.push(tableNode);
      }
    }

    return {
      id: slideId,
      title,
      background,
      notes: notes || undefined,
      nodes,
      transition: 'fade',
    };
  }

  private static parseParagraphs(txXml: string): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    const pRegex = /<a:p\b[\s\S]*?<\/a:p>/gi;
    let pMatch: RegExpExecArray | null;

    while ((pMatch = pRegex.exec(txXml)) !== null) {
      const pStr = pMatch[0];
      const isBullet = /<a:buChar\b/i.test(pStr);
      const isNumbered = /<a:buAutoNum\b/i.test(pStr);
      const alignMatch = /<a:pPr\b[^>]*\balgn="([^"]+)"/i.exec(pStr);
      const align = alignMatch ? (alignMatch[1] === 'ctr' ? 'center' : alignMatch[1] === 'r' ? 'right' : 'left') : 'left';

      const runs: TextRun[] = [];
      const rRegex = /<a:r\b[\s\S]*?<\/a:r>/gi;
      let rMatch: RegExpExecArray | null;

      while ((rMatch = rRegex.exec(pStr)) !== null) {
        const rStr = rMatch[0];
        const tMatch = /<a:t\b[^>]*>([\s\S]*?)<\/a:t>/i.exec(rStr);
        const text = tMatch ? unescapeXml(tMatch[1]) : '';
        if (!text) continue;

        const bMatch = /<a:rPr\b[^>]*\bb="1"/i.test(rStr);
        const iMatch = /<a:rPr\b[^>]*\bi="1"/i.test(rStr);
        const uMatch = /<a:rPr\b[^>]*\bu="sng"/i.test(rStr);
        const szMatch = /<a:rPr\b[^>]*\bsz="(\d+)"/i.exec(rStr);
        const fontSize = szMatch ? parseInt(szMatch[1], 10) / 100 : 24;

        const clrMatch = /<a:solidFill>[\s\S]*?<a:srgbClr\b[^>]*\bval="([A-Fa-f0-9]{6})"/i.exec(rStr);
        const color = clrMatch ? `#${clrMatch[1]}` : '#FFFFFF';

        runs.push({
          id: generateId('run'),
          text,
          bold: bMatch,
          italic: iMatch,
          underline: uMatch,
          fontSize,
          color,
        });
      }

      if (runs.length > 0) {
        paragraphs.push({
          id: generateId('p'),
          runs,
          align: align as any,
          bullet: isBullet,
          numbered: isNumbered,
        });
      }
    }

    return paragraphs;
  }

  private static extractTextFromXml(xml: string): string {
    const textPieces: string[] = [];
    const tRegex = /<a:t\b[^>]*>([\s\S]*?)<\/a:t>/gi;
    let match: RegExpExecArray | null;
    while ((match = tRegex.exec(xml)) !== null) {
      textPieces.push(unescapeXml(match[1]));
    }
    return textPieces.join(' ').trim();
  }
}

function unescapeXml(safe: string): string {
  if (!safe) return '';
  return safe
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}
