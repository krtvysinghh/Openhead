import { BaseDocumentMetadata, ProductType } from './types';

export interface StorageEntry<T = any> {
  metadata: BaseDocumentMetadata;
  payload: T;
  lastModified: number;
  sizeBytes: number;
  checksum?: string;
  version?: number;
}

export interface CrashRecoveryLog {
  id: string;
  docId: string;
  type: ProductType;
  title: string;
  timestamp: number;
  payload: any;
  checksum: string;
  interrupted: boolean;
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  keys(): string[];
}

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  public removeItem(key: string): void {
    this.store.delete(key);
  }

  public keys(): string[] {
    return Array.from(this.store.keys());
  }
}

export class LocalStorageAdapter implements StorageAdapter {
  public getItem(key: string): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  }

  public setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  }

  public removeItem(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  }

  public keys(): string[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    return Object.keys(window.localStorage);
  }
}

export class StorageManager {
  private adapter: StorageAdapter;
  private readonly DOC_PREFIX = 'oh_doc_';
  private readonly AUTOSAVE_PREFIX = 'oh_autosave_';
  private readonly RECOVERY_PREFIX = 'oh_recovery_';
  private readonly JOURNAL_PREFIX = 'oh_journal_';
  private readonly INDEX_KEY = 'oh_docs_index';

  constructor(adapter?: StorageAdapter) {
    if (adapter) {
      this.adapter = adapter;
    } else if (typeof window !== 'undefined' && window.localStorage) {
      this.adapter = new LocalStorageAdapter();
    } else {
      this.adapter = new MemoryStorageAdapter();
    }
  }

  public static computeChecksum(content: string): string {
    let hash = 5381;
    for (let i = 0; i < content.length; i++) {
      hash = (hash * 33) ^ content.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }

  /**
   * Atomic document save with checksum validation and rollback journal
   */
  public saveDocument<T>(metadata: BaseDocumentMetadata, payload: T): StorageEntry<T> {
    const raw = JSON.stringify(payload);
    const checksum = StorageManager.computeChecksum(raw);
    const docKey = `${this.DOC_PREFIX}${metadata.id}`;
    const journalKey = `${this.JOURNAL_PREFIX}${metadata.id}`;

    // 1. Write Journal entry first (Atomic intent)
    this.adapter.setItem(
      journalKey,
      JSON.stringify({
        intent: 'write',
        timestamp: Date.now(),
        docId: metadata.id,
        checksum,
      })
    );

    // 2. Perform write
    const entry: StorageEntry<T> = {
      metadata: {
        ...metadata,
        updatedAt: Date.now(),
      },
      payload,
      lastModified: Date.now(),
      sizeBytes: new TextEncoder().encode(raw).length,
      checksum,
      version: (metadata.version || 1) + 1,
    };

    this.adapter.setItem(docKey, JSON.stringify(entry));

    // 3. Clear journal after successful write
    this.adapter.removeItem(journalKey);

    // 4. Update index
    this.updateIndex(entry.metadata);
    return entry;
  }

  public loadDocument<T = any>(id: string): StorageEntry<T> | null {
    const docKey = `${this.DOC_PREFIX}${id}`;
    const raw = this.adapter.getItem(docKey);
    if (!raw) return null;

    try {
      const entry = JSON.parse(raw) as StorageEntry<T>;
      // Corruption Check
      if (entry.checksum) {
        const payloadStr = JSON.stringify(entry.payload);
        const calcChecksum = StorageManager.computeChecksum(payloadStr);
        if (calcChecksum !== entry.checksum) {
          console.error(`Storage Corruption detected for document ${id}. Checksum mismatch!`);
          return null;
        }
      }
      return entry;
    } catch {
      return null;
    }
  }

  public listDocuments(): BaseDocumentMetadata[] {
    const rawIndex = this.adapter.getItem(this.INDEX_KEY);
    if (!rawIndex) return [];
    try {
      const list = JSON.parse(rawIndex) as BaseDocumentMetadata[];
      return list.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }

  public deleteDocument(id: string): boolean {
    const docKey = `${this.DOC_PREFIX}${id}`;
    this.adapter.removeItem(docKey);
    const current = this.listDocuments();
    const next = current.filter((d) => d.id !== id);
    this.adapter.setItem(this.INDEX_KEY, JSON.stringify(next));
    return true;
  }

  public saveAutosaveSnapshot(type: ProductType, payload: any): void {
    const key = `${this.AUTOSAVE_PREFIX}${type}`;
    this.adapter.setItem(
      key,
      JSON.stringify({
        type,
        timestamp: Date.now(),
        payload,
      })
    );
  }

  public loadAutosaveSnapshot(type: ProductType): any | null {
    const key = `${this.AUTOSAVE_PREFIX}${type}`;
    const raw = this.adapter.getItem(key);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed.payload;
    } catch {
      return null;
    }
  }

  public clearAutosaveSnapshot(type: ProductType): void {
    const key = `${this.AUTOSAVE_PREFIX}${type}`;
    this.adapter.removeItem(key);
  }

  // --- Crash Recovery Subsystem ---

  public saveCrashRecoverySnapshot(docId: string, type: ProductType, title: string, payload: any): void {
    const raw = JSON.stringify(payload);
    const checksum = StorageManager.computeChecksum(raw);
    const recoveryKey = `${this.RECOVERY_PREFIX}${docId}`;

    const recoveryLog: CrashRecoveryLog = {
      id: `rec_${Date.now()}`,
      docId,
      type,
      title,
      timestamp: Date.now(),
      payload,
      checksum,
      interrupted: true,
    };

    this.adapter.setItem(recoveryKey, JSON.stringify(recoveryLog));
  }

  public listCrashRecoveries(): CrashRecoveryLog[] {
    const keys = this.adapter.keys().filter((k) => k.startsWith(this.RECOVERY_PREFIX));
    const recoveries: CrashRecoveryLog[] = [];

    for (const k of keys) {
      const raw = this.adapter.getItem(k);
      if (raw) {
        try {
          recoveries.push(JSON.parse(raw));
        } catch {
          // ignore corrupted recovery logs
        }
      }
    }
    return recoveries.sort((a, b) => b.timestamp - a.timestamp);
  }

  public clearCrashRecovery(docId: string): void {
    const recoveryKey = `${this.RECOVERY_PREFIX}${docId}`;
    this.adapter.removeItem(recoveryKey);
  }

  private updateIndex(meta: BaseDocumentMetadata): void {
    const docs = this.listDocuments().filter((d) => d.id !== meta.id);
    docs.unshift(meta);
    this.adapter.setItem(this.INDEX_KEY, JSON.stringify(docs));
  }
}
