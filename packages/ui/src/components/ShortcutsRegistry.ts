export interface ShortcutDefinition {
  id: string;
  keys: string; // e.g. "meta+s", "ctrl+s", "f2"
  label: string;
  description: string;
  category: 'File' | 'Edit' | 'View' | 'Insert' | 'AI';
  action: () => void;
}

export class ShortcutsRegistry {
  private shortcuts: Map<string, ShortcutDefinition> = new Map();

  public register(shortcut: ShortcutDefinition): () => void {
    this.shortcuts.set(shortcut.id, shortcut);
    return () => this.shortcuts.delete(shortcut.id);
  }

  public handleKeyDown(e: KeyboardEvent): boolean {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
    const mod = isMac ? e.metaKey : e.ctrlKey;
    const key = e.key.toLowerCase();

    for (const sc of this.shortcuts.values()) {
      const parts = sc.keys.toLowerCase().split('+');
      const needsMod = parts.includes('cmd') || parts.includes('meta') || parts.includes('ctrl');
      const needsShift = parts.includes('shift');
      const needsAlt = parts.includes('alt');
      const targetKey = parts[parts.length - 1];

      if (
        needsMod === mod &&
        needsShift === e.shiftKey &&
        needsAlt === e.altKey &&
        targetKey === key
      ) {
        e.preventDefault();
        sc.action();
        return true;
      }
    }
    return false;
  }

  public list(): ShortcutDefinition[] {
    return Array.from(this.shortcuts.values());
  }
}
