import { describe, it, expect, beforeEach } from 'vitest';
import { CommandRegistry, CommandContext } from '../commands';

describe('CommandRegistry & Unified Command Palette Dispatcher', () => {
  beforeEach(() => {
    CommandRegistry.register({
      id: 'file.save',
      label: 'Save Document',
      category: 'file',
      shortcut: 'Ctrl+S',
      execute: (ctx) => {
        (ctx as any).saved = true;
      },
    });

    CommandRegistry.register({
      id: 'sum.calculate',
      label: 'Recalculate Sheet',
      category: 'tools',
      appScope: 'sum',
      execute: (ctx) => {
        (ctx as any).recalculated = true;
      },
    });

    CommandRegistry.register({
      id: 'edit.undo',
      label: 'Undo Action',
      category: 'edit',
      shortcut: 'Ctrl+Z',
      isAvailable: (ctx) => !!ctx.canUndo,
      execute: (ctx) => {
        (ctx as any).undone = true;
      },
    });
  });

  it('should filter available commands by application scope and context predicates', () => {
    const penContext: CommandContext = { activeApp: 'pen', canUndo: false };
    const availablePen = CommandRegistry.getAvailable(penContext);

    expect(availablePen.some((c) => c.id === 'file.save')).toBe(true);
    expect(availablePen.some((c) => c.id === 'sum.calculate')).toBe(false); // scope restricted
    expect(availablePen.some((c) => c.id === 'edit.undo')).toBe(false); // predicate canUndo is false

    const sumContext: CommandContext = { activeApp: 'sum', canUndo: true };
    const availableSum = CommandRegistry.getAvailable(sumContext);

    expect(availableSum.some((c) => c.id === 'sum.calculate')).toBe(true);
    expect(availableSum.some((c) => c.id === 'edit.undo')).toBe(true);
  });

  it('should search commands by label, category, and shortcut', () => {
    const context: CommandContext = { activeApp: 'sum', canUndo: true };
    const searchResult = CommandRegistry.search('recalc', context);

    expect(searchResult.length).toBe(1);
    expect(searchResult[0].id).toBe('sum.calculate');

    const searchShortcut = CommandRegistry.search('Ctrl+S', context);
    expect(searchShortcut.length).toBe(1);
    expect(searchShortcut[0].id).toBe('file.save');
  });

  it('should execute commands within context', async () => {
    const context: any = { activeApp: 'pen', canUndo: true };
    const success = await CommandRegistry.execute('file.save', context);

    expect(success).toBe(true);
    expect(context.saved).toBe(true);
  });
});
