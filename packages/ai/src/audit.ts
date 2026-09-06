import { AiAuditEntry, AiPermissionScope } from './types';

export class AiAuditLogger {
  private static entries: AiAuditEntry[] = [];
  private static maxEntries = 200;

  public static log(entry: Omit<AiAuditEntry, 'id' | 'timestamp'>): AiAuditEntry {
    const fullEntry: AiAuditEntry = {
      ...entry,
      id: `ai_log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
    };

    this.entries.unshift(fullEntry);
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(0, this.maxEntries);
    }

    return fullEntry;
  }

  public static updateStatus(id: string, status: AiAuditEntry['status'], error?: string): void {
    const found = this.entries.find((e) => e.id === id);
    if (found) {
      found.status = status;
      if (error) found.error = error;
    }
  }

  public static getEntries(): readonly AiAuditEntry[] {
    return [...this.entries];
  }

  public static getEntriesByScope(scope: AiPermissionScope): AiAuditEntry[] {
    return this.entries.filter((e) => e.scope === scope);
  }

  public static clear(): void {
    this.entries = [];
  }
}
