import { describe, it, expect } from 'vitest';
import { SecuritySanitizer } from '../security';

describe('SecuritySanitizer', () => {
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

  it('should reject oversized JSON payloads', () => {
    const hugeStr = JSON.stringify({ data: 'A'.repeat(5000) });
    expect(() => SecuritySanitizer.safeJsonParse(hugeStr, 1000)).toThrow(/exceeds limit/);
    const valid = SecuritySanitizer.safeJsonParse(hugeStr, 10000);
    expect(valid.data.length).toBe(5000);
  });
});
