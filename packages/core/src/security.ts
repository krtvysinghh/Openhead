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
   * Validates relative file paths within document packages to prevent directory traversal (CWE-22 / Zip Slip).
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
    // Reject javascript:, data:, vbscript:, file:
    if (/^(javascript|data|vbscript|file|ms-msdt|powershell|cmd):/i.test(trimmed)) {
      return false;
    }
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

export class MacroExecutionPolicy {
  private static readonly DANGEROUS_EXTENSIONS = ['.xlsm', '.docm', '.pptm', '.dotm', '.xltm', '.potm'];
  private static readonly DANGEROUS_PARTS = [
    'vbaProject.bin',
    'word/vbaProject.bin',
    'xl/vbaProject.bin',
    'ppt/vbaProject.bin',
    'word/vbaData.xml',
    'xl/vbaProjectSignature.bin',
  ];

  /**
   * Strict invariant: Openhead NEVER executes embedded VBA/VBScript/OLE macros.
   * Returns true if file or package part contains macros.
   */
  public static containsMacros(filenameOrPart: string): boolean {
    const lower = filenameOrPart.toLowerCase();
    if (this.DANGEROUS_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      return true;
    }
    if (this.DANGEROUS_PARTS.some((part) => lower.includes(part.toLowerCase()))) {
      return true;
    }
    return false;
  }

  /**
   * Evaluates macro risk and reports audit advisory.
   */
  public static evaluateDocumentSafety(partNames: string[]): {
    hasMacros: boolean;
    quarantinedParts: string[];
    actionTaken: 'stripped' | 'denied' | 'safe';
  } {
    const quarantined = partNames.filter((p) => this.containsMacros(p));
    if (quarantined.length > 0) {
      return {
        hasMacros: true,
        quarantinedParts: quarantined,
        actionTaken: 'stripped',
      };
    }
    return {
      hasMacros: false,
      quarantinedParts: [],
      actionTaken: 'safe',
    };
  }
}

export class FormulaInjectionGuard {
  private static readonly EXFILTRATION_FUNCTIONS = [
    'WEBSERVICE',
    'FILTERXML',
    'IMPORTXML',
    'IMPORTHTML',
    'IMPORTRANGE',
    'IMPORTDATA',
    'DDE',
    'DDEAUTO',
    'EXEC',
    'SYSTEM',
    'CMD',
    'POWERSHELL',
  ];

  /**
   * Checks whether a formula expression attempts external data exfiltration or process execution.
   */
  public static isHostileFormula(formula: string): boolean {
    if (!formula || typeof formula !== 'string') return false;
    const clean = formula.toUpperCase();

    // Check for malicious DDE syntax like cmd|'/c calc'!A0
    if (/cmd\s*\|/i.test(formula) || /powershell\s*\|/i.test(formula)) {
      return true;
    }

    // Check for dangerous networking or system functions
    for (const fn of this.EXFILTRATION_FUNCTIONS) {
      if (new RegExp(`\\b${fn}\\s*\\(`, 'i').test(clean)) {
        return true;
      }
    }

    return false;
  }
}
