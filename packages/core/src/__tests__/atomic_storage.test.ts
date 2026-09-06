import { describe, it, expect } from 'vitest';
import { StorageManager, MemoryStorageAdapter } from '../storage';

describe('StorageManager Atomic Writes & Crash Recovery', () => {
  it('should save document with checksum verification and list documents sorted by last modified', () => {
    const adapter = new MemoryStorageAdapter();
    const storage = new StorageManager(adapter);

    const meta = { id: 'doc1', title: 'Q3 Financials', type: 'pen' as const, createdAt: 1000, updatedAt: 1000, version: 1 };
    const payload = { content: 'Secret Financial Data' };

    const entry = storage.saveDocument(meta, payload);
    expect(entry.checksum).toBeDefined();
    expect(entry.version).toBe(2);

    const loaded = storage.loadDocument('doc1');
    expect(loaded).not.toBeNull();
    expect(loaded?.payload).toEqual(payload);
    expect(loaded?.checksum).toBe(entry.checksum);

    const list = storage.listDocuments();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe('doc1');
  });

  it('should detect checksum mismatch and reject corrupted storage entries', () => {
    const adapter = new MemoryStorageAdapter();
    const storage = new StorageManager(adapter);

    const meta = { id: 'doc2', title: 'Corrupt Test', type: 'sum' as const, createdAt: 1000, updatedAt: 1000, version: 1 };
    storage.saveDocument(meta, { cells: { A1: 'Original' } });

    // Manually tamper with the stored entry
    const docKey = 'oh_doc_doc2';
    const raw = adapter.getItem(docKey)!;
    const tampered = JSON.parse(raw);
    tampered.payload = { cells: { A1: 'Malicious Injected Value' } }; // payload changed without updating checksum
    adapter.setItem(docKey, JSON.stringify(tampered));

    // Load should fail due to checksum mismatch
    const loaded = storage.loadDocument('doc2');
    expect(loaded).toBeNull();
  });

  it('should manage crash recovery snapshots', () => {
    const adapter = new MemoryStorageAdapter();
    const storage = new StorageManager(adapter);

    storage.saveCrashRecoverySnapshot('doc3', 'glimpse', 'Unsaved Pitch Deck', { slides: [{ title: 'Slide 1' }] });

    const recoveries = storage.listCrashRecoveries();
    expect(recoveries.length).toBe(1);
    expect(recoveries[0].docId).toBe('doc3');
    expect(recoveries[0].title).toBe('Unsaved Pitch Deck');
    expect(recoveries[0].interrupted).toBe(true);

    // Clear recovery
    storage.clearCrashRecovery('doc3');
    expect(storage.listCrashRecoveries().length).toBe(0);
  });
});
