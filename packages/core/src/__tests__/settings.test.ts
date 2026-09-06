import { describe, it, expect, beforeEach } from 'vitest';
import { SettingsManager } from '../settings';

describe('SettingsManager Persistent Preferences', () => {
  beforeEach(() => {
    SettingsManager.reset();
  });

  it('should initialize with default privacy, appearance, and autosave settings', () => {
    const settings = SettingsManager.get();
    expect(settings.appearance.theme).toBe('dark');
    expect(settings.fileHandling.autosaveEnabled).toBe(true);
    expect(settings.privacy.telemetryEnabled).toBe(false);
    expect(settings.ai.defaultProvider).toBe('local');
  });

  it('should update partial settings while preserving zero-telemetry invariant', () => {
    SettingsManager.update({
      appearance: { theme: 'emerald', reducedMotion: true, fontSize: 'large', accentColor: '#10b981' },
      fileHandling: { autosaveEnabled: true, autosaveIntervalSeconds: 60, createBackups: false, defaultExportFormat: 'ooxml' },
      privacy: { telemetryEnabled: false as any, offlineModeForced: true, sanitizeClipboardOnCopy: true },
    });

    const updated = SettingsManager.get();
    expect(updated.appearance.theme).toBe('emerald');
    expect(updated.appearance.reducedMotion).toBe(true);
    expect(updated.fileHandling.autosaveIntervalSeconds).toBe(60);
    expect(updated.privacy.offlineModeForced).toBe(true);
    expect(updated.privacy.telemetryEnabled).toBe(false);
  });

  it('should enforce telemetryEnabled to always be false regardless of override attempts', () => {
    SettingsManager.update({
      privacy: { telemetryEnabled: true as any, offlineModeForced: false, sanitizeClipboardOnCopy: false },
    });
    expect(SettingsManager.get().privacy.telemetryEnabled).toBe(false);
  });
});
