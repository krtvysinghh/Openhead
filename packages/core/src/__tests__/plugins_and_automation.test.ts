import { describe, it, expect, beforeEach } from 'vitest';
import { PluginManager, OfficePlugin } from '../plugins';
import { AutomationEngine, DocumentAutomation, SpreadsheetAutomation } from '../automation';
import { PenDocument } from '@openhead/pen';
import { SumWorkbook } from '@openhead/sum';

describe('PluginManager & Sandboxed Host', () => {
  let manager: PluginManager;

  beforeEach(() => {
    manager = new PluginManager();
  });

  it('should register and activate a valid plugin with permissions', () => {
    const plugin: OfficePlugin = {
      manifest: {
        id: 'org.openhead.wordcount',
        name: 'Word Count Widget',
        version: '1.0.0',
        description: 'Counts words in selection',
        author: 'Openhead Team',
        permissions: ['document:read'],
      },
    };

    manager.registerPlugin(plugin);
    expect(manager.getPlugins().length).toBe(1);
    expect(manager.hasPermission('org.openhead.wordcount', 'document:read')).toBe(true);
    expect(manager.hasPermission('org.openhead.wordcount', 'filesystem:read')).toBe(false);
  });

  it('should reject duplicate plugin registrations', () => {
    const plugin: OfficePlugin = {
      manifest: {
        id: 'org.openhead.duplicate',
        name: 'Duplicate',
        version: '1.0.0',
        description: 'Test duplicate',
        author: 'Openhead Team',
        permissions: [],
      },
    };

    manager.registerPlugin(plugin);
    expect(() => manager.registerPlugin(plugin)).toThrow(/already registered/);
  });

  it('should reject unpermitted command and formula registrations', () => {
    const plugin: OfficePlugin = {
      manifest: {
        id: 'org.openhead.restricted',
        name: 'Restricted',
        version: '1.0.0',
        description: 'Restricted plugin',
        author: 'Openhead Team',
        permissions: [], // no permissions
      },
    };
    manager.registerPlugin(plugin);

    expect(() => {
      manager.registerPluginCommand('org.openhead.restricted', {
        id: 'test.cmd',
        title: 'Test',
        category: 'Edit',
        action: () => {},
      });
    }).toThrow(/Permission denied/);

    expect(() => {
      manager.registerPluginFormula('org.openhead.restricted', {
        name: 'MY_FORMULA',
        description: 'Test',
        minArgs: 1,
        maxArgs: 1,
        compute: (args) => args[0],
      });
    }).toThrow(/Permission denied/);
  });

  it('should allow permitted command and formula registrations', () => {
    const plugin: OfficePlugin = {
      manifest: {
        id: 'org.openhead.allowed',
        name: 'Allowed',
        version: '1.0.0',
        description: 'Allowed plugin',
        author: 'Openhead Team',
        permissions: ['commands:register', 'formulas:register'],
      },
    };
    manager.registerPlugin(plugin);

    manager.registerPluginCommand('org.openhead.allowed', {
      id: 'custom.cmd',
      title: 'Custom Action',
      category: 'View',
      action: () => 'done',
    });

    manager.registerPluginFormula('org.openhead.allowed', {
      name: 'CUSTOM_SUM',
      description: 'Sums custom values',
      minArgs: 1,
      maxArgs: 2,
      compute: (args) => (args[0] as number) * 2,
    });

    expect(manager.getRegisteredCommands().length).toBe(1);
    expect(manager.getRegisteredFormulas().length).toBe(1);
    expect(manager.executeCommand('custom.cmd')).toBe('done');
    expect(manager.evaluateFormula('CUSTOM_SUM', [21])).toBe(42);
  });
});

describe('AutomationEngine Safe Scripts', () => {
  it('should execute document AST transformation scripts safely', () => {
    const doc = new PenDocument();
    doc.addParagraph('First lowercase line');
    doc.addParagraph('Second lowercase line');

    const automation: DocumentAutomation = {
      name: 'Uppercase Blocks',
      description: 'Capitalizes all paragraph text',
      target: 'document',
      execute: (ast) => {
        ast.sections.forEach((s) => {
          s.blocks.forEach((b) => {
            if (b.type === 'paragraph') {
              (b as any).inlines.forEach((i: any) => {
                i.text = i.text.toUpperCase();
              });
            }
          });
        });
      },
    };

    const res = AutomationEngine.runDocumentScript(doc.getModel(), automation);
    expect(res.success).toBe(true);
    expect(res.paragraphsModified).toBeGreaterThan(0);

    const serialized = doc.getModel();
    expect(serialized.sections[0].blocks.length).toBeGreaterThan(1);
  });

  it('should execute batch spreadsheet automations safely', () => {
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 10);
    wb.setCellValue('A2', 20);
    wb.setCellValue('A3', 30);

    const automation: SpreadsheetAutomation = {
      name: 'Batch Tax Applier',
      description: 'Applies 10% tax in adjacent column',
      target: 'spreadsheet',
      execute: (context) => {
        const rows = [1, 2, 3];
        rows.forEach((r) => {
          const val = context.getCellValue(`A${r}`);
          if (typeof val === 'number') {
            context.setCellValue(`B${r}`, val * 1.1);
          }
        });
      },
    };

    const res = AutomationEngine.runSpreadsheetScript(wb.getModel(), automation);
    expect(res.success).toBe(true);
    expect(res.cellsModified).toBe(3);
    const sheet = wb.getActiveSheet();
    expect(sheet.cells['B1']?.value).toBeCloseTo(11);
    expect(sheet.cells['B2']?.value).toBeCloseTo(22);
    expect(sheet.cells['B3']?.value).toBeCloseTo(33);
  });
});
