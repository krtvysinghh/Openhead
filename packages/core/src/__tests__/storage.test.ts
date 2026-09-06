import { describe, it, expect } from 'vitest';
import { StorageManager, MemoryStorageAdapter } from '../storage';
import { BaseDocumentMetadata } from '../types';

describe('StorageManager & Persistence', () => {
  it('should save, list, load, and delete documents accurately', () => {
    const adapter = new MemoryStorageAdapter();
    const manager = new StorageManager(adapter);

    const meta: BaseDocumentMetadata = {
      id: 'doc_test_1',
      title: 'Q3 Financial Analysis',
      type: 'pen',
      createdAt: 1000,
      updatedAt: 1000,
      version: 1,
    };

    const payload = { content: 'Test Content' };
    const saved = manager.saveDocument(meta, payload);

    expect(saved.metadata.id).toBe('doc_test_1');
    expect(saved.sizeBytes).toBeGreaterThan(0);

    const list = manager.listDocuments();
    expect(list.length).toBe(1);
    expect(list[0].title).toBe('Q3 Financial Analysis');

    const loaded = manager.loadDocument('doc_test_1');
    expect(loaded?.payload).toEqual(payload);

    manager.deleteDocument('doc_test_1');
    expect(manager.listDocuments().length).toBe(0);
    expect(manager.loadDocument('doc_test_1')).toBeNull();
  });

  it('should manage crash-safe autosave snapshots', () => {
    const adapter = new MemoryStorageAdapter();
    const manager = new StorageManager(adapter);

    manager.saveAutosaveSnapshot('sum', { sheet: 'Sheet1', cellCount: 50 });
    const snap = manager.loadAutosaveSnapshot('sum');
    expect(snap).toEqual({ sheet: 'Sheet1', cellCount: 50 });

    manager.clearAutosaveSnapshot('sum');
    expect(manager.loadAutosaveSnapshot('sum')).toBeNull();
  });
});
