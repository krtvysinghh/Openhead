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
    // Disallow absolute drive letters (e.g. C:)
    if (/^[a-zA-Z]:/.test(targetPath)) return false;
    return true;
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
