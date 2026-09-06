import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { XlsxAdapter } from '../index';

describe('Hostile XLSX Security Boundaries', () => {
  it('should reject XXE injection in sharedStrings.xml', async () => {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>');
    zip.file('xl/workbook.xml', '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>');
    zip.file('xl/sharedStrings.xml', '<!DOCTYPE sst [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><sst><si><t>&xxe;</t></si></sst>');

    const buffer = await zip.generateAsync({ type: 'uint8array' });
    await expect(XlsxAdapter.fromBuffer(buffer)).rejects.toThrow(/Hostile XML/);
  });

  it('should reject XXE injection in worksheet XML', async () => {
    const zip = new JSZip();
    zip.file('[Content_Types].xml', '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>');
    zip.file('xl/workbook.xml', '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>');
    zip.file('xl/worksheets/sheet1.xml', '<!DOCTYPE worksheet [<!ENTITY xxe SYSTEM "http://malicious.com">]><worksheet/>');

    const buffer = await zip.generateAsync({ type: 'uint8array' });
    await expect(XlsxAdapter.fromBuffer(buffer)).rejects.toThrow(/Hostile XML/);
  });
});
