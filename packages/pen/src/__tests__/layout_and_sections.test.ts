import { describe, it, expect } from 'vitest';
import { PenDocument, DocxAdapter } from '../index';

describe('Pen Layout, Margins & Section Properties', () => {
  it('should update and serialize page settings (orientation, margins, header/footer)', async () => {
    const doc = new PenDocument();
    doc.setPageSettings(0, {
      orientation: 'landscape',
      margins: { top: 15, bottom: 15, left: 20, right: 20 },
      headerText: 'Confidential Internal Draft',
      footerText: 'Department of Engineering',
    });

    const sec = doc.getModel().sections[0];
    expect(sec.pageSettings.orientation).toBe('landscape');
    expect(sec.pageSettings.margins.left).toBe(20);
    expect(sec.pageSettings.headerText).toBe('Confidential Internal Draft');

    const buffer = await DocxAdapter.toBuffer(doc.getModel());
    const imported = await DocxAdapter.fromBuffer(buffer);
    expect(imported.sections[0].pageSettings.orientation).toBe('landscape');
    expect(imported.sections[0].pageSettings.headerText).toBe('Confidential Internal Draft');
    expect(imported.sections[0].pageSettings.footerText).toBe('Department of Engineering');
  });
});
