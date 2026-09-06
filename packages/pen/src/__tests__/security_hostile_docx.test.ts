import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { DocxAdapter, PenSecurity } from '../index';

describe('Pen & DOCX Security Boundaries', () => {
  it('should reject hostile XML payloads with XXE and DOCTYPE entity expansions', async () => {
    const maliciousXml = `<?xml version="1.0"?>
    <!DOCTYPE foo [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body><w:p><w:r><w:t>&xxe;</w:t></w:r></w:p></w:body>
    </w:document>`;

    expect(() => {
      PenSecurity.validateXmlContent(maliciousXml, 'Malicious Part');
    }).toThrow(/Security Violation: DTD \/ Entity expansion detected/);

    const zip = new JSZip();
    zip.file('word/document.xml', maliciousXml);
    zip.file('[Content_Types].xml', '<Types></Types>');
    const buf = await zip.generateAsync({ type: 'uint8array' });

    await expect(DocxAdapter.fromBuffer(buf)).rejects.toThrow(/Security Violation/);
  });

  it('should reject directory traversal in ZIP entry filenames', async () => {
    expect(() => {
      PenSecurity.validateEntryPath('../../etc/cron.d/malicious');
    }).toThrow(/Security Violation: Directory traversal detected/);

    expect(() => {
      PenSecurity.validateEntryPath('/etc/passwd');
    }).toThrow(/Security Violation: Directory traversal detected/);

    expect(() => {
      PenSecurity.validateEntryPath('word/media/\0hidden.exe');
    }).toThrow(/Security Violation: Null byte detected/);
  });

  it('should sanitize and reject unsafe URL protocols in hyperlinks', () => {
    expect(PenSecurity.sanitizeHyperlink('https://openhead.dev')).toBe('https://openhead.dev');
    expect(PenSecurity.sanitizeHyperlink('mailto:support@openhead.dev')).toBe('mailto:support@openhead.dev');
    expect(PenSecurity.sanitizeHyperlink('javascript:alert(1)')).toBeUndefined();
    expect(PenSecurity.sanitizeHyperlink('data:text/html;base64,PHNjcmlwdD4=')).toBeUndefined();
    expect(PenSecurity.sanitizeHyperlink('file:///etc/passwd')).toBeUndefined();
  });
});
