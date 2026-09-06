export type ThemeMode = 'dark' | 'light' | 'high-contrast' | 'emerald' | 'sunset';

export interface OpenheadSettings {
  version: number;
  appearance: {
    theme: ThemeMode;
    reducedMotion: boolean;
    fontSize: 'small' | 'medium' | 'large';
    accentColor: string;
  };
  fileHandling: {
    autosaveEnabled: boolean;
    autosaveIntervalSeconds: number;
    createBackups: boolean;
    defaultExportFormat: 'native' | 'ooxml' | 'markdown';
  };
  ai: {
    enabled: boolean;
    defaultProvider: 'local' | 'mock' | 'remote';
    localEndpoint: string;
    remoteEndpoint?: string;
    modelName: string;
    requireConfirmationBeforeMutation: boolean;
    auditLogEnabled: boolean;
  };
  privacy: {
    telemetryEnabled: false; // permanently false
    offlineModeForced: boolean;
    sanitizeClipboardOnCopy: boolean;
  };
  keyboardShortcuts: Record<string, string>;
}

export const DEFAULT_OPENHEAD_SETTINGS: OpenheadSettings = {
  version: 1,
  appearance: {
    theme: 'dark',
    reducedMotion: false,
    fontSize: 'medium',
    accentColor: '#6366F1',
  },
  fileHandling: {
    autosaveEnabled: true,
    autosaveIntervalSeconds: 30,
    createBackups: true,
    defaultExportFormat: 'ooxml',
  },
  ai: {
    enabled: true,
    defaultProvider: 'local',
    localEndpoint: 'http://localhost:11434',
    modelName: 'qwen2.5:7b',
    requireConfirmationBeforeMutation: true,
    auditLogEnabled: true,
  },
  privacy: {
    telemetryEnabled: false,
    offlineModeForced: false,
    sanitizeClipboardOnCopy: false,
  },
  keyboardShortcuts: {
    'file.new': 'Ctrl+N',
    'file.open': 'Ctrl+O',
    'file.save': 'Ctrl+S',
    'edit.undo': 'Ctrl+Z',
    'edit.redo': 'Ctrl+Y',
    'view.commandPalette': 'Ctrl+K',
    'view.search': 'Ctrl+F',
    'view.present': 'F5',
  },
};

export class SettingsManager {
  private static settings: OpenheadSettings = { ...DEFAULT_OPENHEAD_SETTINGS };
  private static storageKey = 'openhead_global_settings';

  public static get(): OpenheadSettings {
    return JSON.parse(JSON.stringify(this.settings));
  }

  public static update(partial: Partial<OpenheadSettings>): OpenheadSettings {
    this.settings = {
      ...this.settings,
      ...partial,
      appearance: { ...this.settings.appearance, ...partial.appearance },
      fileHandling: { ...this.settings.fileHandling, ...partial.fileHandling },
      ai: { ...this.settings.ai, ...partial.ai },
      privacy: { ...this.settings.privacy, ...partial.privacy, telemetryEnabled: false }, // Telemetry can never be true
      keyboardShortcuts: { ...this.settings.keyboardShortcuts, ...partial.keyboardShortcuts },
    };
    this.saveToStorage();
    return this.get();
  }

  public static reset(): OpenheadSettings {
    this.settings = JSON.parse(JSON.stringify(DEFAULT_OPENHEAD_SETTINGS));
    this.saveToStorage();
    return this.get();
  }

  public static loadFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.settings = { ...DEFAULT_OPENHEAD_SETTINGS, ...parsed, privacy: { ...parsed.privacy, telemetryEnabled: false } };
        }
      }
    } catch {
      // Graceful fallback to default in-memory settings
    }
  }

  private static saveToStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
      }
    } catch {
      // In-memory persistence fallback
    }
  }
}
