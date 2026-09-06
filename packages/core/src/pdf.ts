export interface PrintOptions {
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'A4' | 'Letter' | 'Legal';
  marginMm?: number;
  printBackgrounds?: boolean;
}

export class PdfExportEngine {
  /**
   * Generates a printable HTML document bundle with embedded print CSS styles.
   */
  public static generatePrintableHtml(title: string, bodyHtml: string, options: PrintOptions = {}): string {
    const orientation = options.orientation || 'portrait';
    const pageSize = options.pageSize || 'A4';
    const marginMm = options.marginMm ?? 20;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: ${pageSize} ${orientation};
      margin: ${marginMm}mm;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #000;
        background: #fff;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-after: always;
      }
    }
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
  }

  /**
   * Triggers the native browser or desktop print dialog.
   */
  public static triggerNativePrint(): void {
    if (typeof window !== 'undefined' && window.print) {
      window.print();
    }
  }
}
