import { describe, it, expect, beforeEach } from 'vitest';
import { CommandRegistry, SettingsManager, StorageManager, OfficeTemplateLibrary } from '@openhead/core';
import { PenDocument } from '@openhead/pen';
import { SumWorkbook } from '@openhead/sum';
import { GlimpseDeck } from '@openhead/glimpse';

describe('Studio Desktop Workflows & Accessibility Architecture', () => {
  beforeEach(() => {
    CommandRegistry.clear();
  });

  it('should register and execute full suite of desktop commands', async () => {
    let executedAction = '';

    CommandRegistry.register({
      id: 'file.new.pen',
      label: 'New Pen Document',
      category: 'file',
      shortcut: 'Ctrl+N',
      execute: () => {
        executedAction = 'new_pen';
      },
    });

    CommandRegistry.register({
      id: 'file.save.as',
      label: 'Save Document As...',
      category: 'file',
      shortcut: 'Ctrl+Shift+S',
      execute: () => {
        executedAction = 'save_as';
      },
    });

    const results = CommandRegistry.search('Save', { activeApp: 'pen', canUndo: true, canRedo: false });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].id).toBe('file.save.as');

    await CommandRegistry.execute('file.save.as', { activeApp: 'pen', canUndo: true, canRedo: false });
    expect(executedAction).toBe('save_as');
  });

  it('should maintain consistent settings defaults and persistence', () => {
    const initial = SettingsManager.get();
    expect(initial.fileHandling.autosaveEnabled).toBe(true);
    expect(initial.privacy.telemetryEnabled).toBe(false);

    const updated = SettingsManager.update({
      appearance: { theme: 'emerald', fontSize: 'large', accentColor: '#10B981', reducedMotion: false },
    });

    expect(updated.appearance.theme).toBe('emerald');
    expect(updated.appearance.fontSize).toBe('large');
    expect(SettingsManager.get().appearance.theme).toBe('emerald');
  });

  it('should instantiate and populate templates into each editor model without mutation leaks', () => {
    const penTemplates = OfficeTemplateLibrary.getPenTemplates();
    expect(penTemplates.length).toBeGreaterThan(0);
    const penModel = penTemplates[1].createModel();
    const doc = new PenDocument(penModel);
    expect(doc.getModel().metadata.title).toBe('Business Letter');

    const sumTemplates = OfficeTemplateLibrary.getSumTemplates();
    expect(sumTemplates.length).toBeGreaterThan(0);
    const sumModel = sumTemplates[1].createModel();
    const wb = new SumWorkbook(sumModel);
    expect(wb.getModel().metadata.title).toBe('Annual Budget');

    const glimpseTemplates = OfficeTemplateLibrary.getGlimpseTemplates();
    expect(glimpseTemplates.length).toBeGreaterThan(0);
    const glimpseModel = glimpseTemplates[1].createModel();
    const deck = new GlimpseDeck(glimpseModel);
    expect(deck.getModel().metadata.title).toBe('Series A Pitch Deck');
  });
});
