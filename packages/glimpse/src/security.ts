export class GlimpseSecurity {
  public static readonly MAX_UNCOMPRESSED_BYTES = 250 * 1024 * 1024; // 250 MB
  public static readonly MAX_COMPRESSION_RATIO = 100;
  public static readonly MAX_ZIP_ENTRIES = 5000;
  public static readonly MAX_XML_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
  public static readonly MAX_MEDIA_FILE_SIZE = 25 * 1024 * 1024; // 25 MB

  private static readonly ALLOWED_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

  /**
   * Sanitizes XML content against XXE injection and entity expansion bombs.
   */
  public static validateXmlContent(xml: string, context: string = 'PPTX Part'): void {
    if (!xml || typeof xml !== 'string') return;

    if (xml.length > this.MAX_XML_FILE_SIZE) {
      throw new Error(`Security Violation: XML in ${context} exceeds maximum size limit of ${this.MAX_XML_FILE_SIZE} bytes.`);
    }

    // XXE detection: check for DTD entity injection or <!DOCTYPE with SYSTEM/PUBLIC entities
    if (/<!DOCTYPE\b[^>]*(\bSYSTEM\b|\bPUBLIC\b|\[)/i.test(xml) || /<!ENTITY\b/i.test(xml)) {
      throw new Error(`Security Violation: DTD / Entity expansion detected in ${context}. Hostile XML payload rejected.`);
    }
  }

  /**
   * Validates entry path against directory traversal attempts.
   */
  public static validateEntryPath(entryPath: string): void {
    if (!entryPath || typeof entryPath !== 'string') {
      throw new Error('Security Violation: Invalid entry path in ZIP package.');
    }
    if (entryPath.includes('\0')) {
      throw new Error('Security Violation: Null byte detected in entry path.');
    }
    const normalized = entryPath.replace(/\\/g, '/');
    if (normalized.includes('../') || normalized.startsWith('/') || normalized.startsWith('./../')) {
      throw new Error(`Security Violation: Directory traversal detected in entry path: "${entryPath}".`);
    }
  }

  /**
   * Validates hyperlink destination URL.
   */
  public static sanitizeHyperlink(url: string | undefined): string | undefined {
    if (!url) return undefined;
    const trimmed = url.trim();
    if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
      return trimmed; // internal presentation bookmarks/slides
    }

    try {
      const parsed = new URL(trimmed);
      if (!this.ALLOWED_URL_PROTOCOLS.has(parsed.protocol)) {
        return undefined; // reject dangerous protocol (javascript:, file:, data:, etc.)
      }
      return trimmed;
    } catch {
      if (/^(https?|mailto):/i.test(trimmed)) {
        return trimmed;
      }
      return undefined;
    }
  }
}
