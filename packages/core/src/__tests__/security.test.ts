import { describe, it, expect } from 'vitest';
import { SecuritySanitizer } from '../security';

describe('SecuritySanitizer - Hardened Security Boundaries', () => {
  it('should sanitize hostile formula injection characters in CSV / cell data', () => {
    expect(SecuritySanitizer.sanitizeFormulaField('=cmd|"/C calc"!A0')).toBe(`'=cmd|"/C calc"!A0`);
    expect(SecuritySanitizer.sanitizeFormulaField('+12345')).toBe(`'+12345`);
    expect(SecuritySanitizer.sanitizeFormulaField('-500')).toBe(`'-500`);
    expect(SecuritySanitizer.sanitizeFormulaField('@SUM(A1)')).toBe(`'@SUM(A1)`);
    expect(SecuritySanitizer.sanitizeFormulaField('Regular Safe Text')).toBe('Regular Safe Text');
  });

  it('should block unsafe relative paths preventing path traversal', () => {
    expect(SecuritySanitizer.isSafeRelativePath('../../../etc/passwd')).toBe(false);
    expect(SecuritySanitizer.isSafeRelativePath('/root/config')).toBe(false);
    expect(SecuritySanitizer.isSafeRelativePath('C:\\Windows\\System32')).toBe(false);
    expect(SecuritySanitizer.isSafeRelativePath('media/image1.png')).toBe(true);
    expect(SecuritySanitizer.isSafeRelativePath('word/document.xml')).toBe(true);
  });

  it('should detect and reject XML entity expansion and XXE injection', () => {
    const maliciousXml = `<?xml version="1.0"?>\n<!DOCTYPE lolz [\n <!ENTITY lol "lol">\n <!ENTITY lol2 "&lol;&lol;">\n]>\n<doc>&lol2;</doc>`;
    expect(SecuritySanitizer.validateXmlSafety(maliciousXml)).toBe(false);

    const safeXml = `<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body/></w:document>`;
    expect(SecuritySanitizer.validateXmlSafety(safeXml)).toBe(true);
  });

  it('should validate compression ratios protecting against zip bombs', () => {
    // 50 MB uncompressed from 1 KB compressed = 50,000 ratio (unsafe)
    expect(SecuritySanitizer.validateCompressionRatio(50 * 1024 * 1024, 1024)).toBe(false);
    // 2 MB uncompressed from 1 MB compressed = 2 ratio (safe)
    expect(SecuritySanitizer.validateCompressionRatio(2 * 1024 * 1024, 1024 * 1024)).toBe(true);
  });

  it('should enforce strict URL protocol whitelist', () => {
    expect(SecuritySanitizer.isSafeUrl('https://openhead.org')).toBe(true);
    expect(SecuritySanitizer.isSafeUrl('mailto:contact@openhead.org')).toBe(true);
    expect(SecuritySanitizer.isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(SecuritySanitizer.isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });
});
