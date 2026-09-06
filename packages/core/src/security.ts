export class SecuritySanitizer {
  /**
   * Sanitizes spreadsheet cell strings to prevent CSV / Formula Injection attacks (CWE-1236).
   * If a string begins with '=', '+', '-', '@', '\t', or '\r', prepends a single quote.
   */
  public static sanitizeFormulaField(val: string): string {
    if (!val || typeof val !== 'string') return val;
    const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
    if (dangerousChars.some((c) => val.startsWith(c))) {
      return `'${val}`;
    }
    return val;
  }

  /**
   * Validates relative file paths within document packages to prevent directory traversal (CWE-22).
   */
  public static isSafeRelativePath(targetPath: string): boolean {
    if (!targetPath || typeof targetPath !== 'string') return false;
    if (targetPath.includes('..') || targetPath.startsWith('/') || targetPath.includes('\\')) {
      return false;
    }
    if (/^[a-zA-Z]:/.test(targetPath)) return false;
    return true;
  }

  /**
   * Validates XML input against XXE (XML External Entity) and entity expansion attacks (CWE-611 / CWE-776).
   */
  public static validateXmlSafety(xml: string): boolean {
    if (!xml || typeof xml !== 'string') return false;
    // Reject DTD DOCTYPE entity expansions
    if (/<!DOCTYPE[^>]*\[[^\]]*<!ENTITY/i.test(xml) || /<!ENTITY/i.test(xml)) {
      return false;
    }
    // Reject external SYSTEM entities
    if (/SYSTEM\s+["'][^"']+["']/i.test(xml)) {
      return false;
    }
    return true;
  }

  /**
   * Protects against Zip Bomb decompression ratio attacks (CWE-409). Max ratio: 100:1.
   */
  public static validateCompressionRatio(uncompressedBytes: number, compressedBytes: number, maxRatio: number = 100): boolean {
    if (compressedBytes <= 0) return false;
    const ratio = uncompressedBytes / compressedBytes;
    return ratio <= maxRatio;
  }

  /**
   * Validates hyperlinks to ensure only safe schemes are allowed.
   */
  public static isSafeUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    return trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('mailto:');
  }

  /**
   * Safely parses JSON with payload size limit to prevent memory exhaustion (DoS).
   */
  public static safeJsonParse<T = any>(jsonStr: string, maxBytes: number = 10 * 1024 * 1024): T {
    const byteLength = new TextEncoder().encode(jsonStr).length;
    if (byteLength > maxBytes) {
      throw new Error(`JSON payload of ${byteLength} bytes exceeds limit of ${maxBytes} bytes.`);
    }
    return JSON.parse(jsonStr) as T;
  }
}
