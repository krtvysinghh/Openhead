import { describe, it, expect } from 'vitest';
import { AiManager } from '../manager';
import { OfflineMockProvider } from '../providers/offlineMock';

describe('AiProviders & AiManager', () => {
  it('should register default providers and list available local models', async () => {
    const manager = AiManager.getInstance();
    const providers = manager.getAllProviders();

    expect(providers.length).toBeGreaterThanOrEqual(3);
    expect(providers.some((p) => p.id === 'offline-mock')).toBe(true);
    expect(providers.some((p) => p.id === 'ollama-local')).toBe(true);

    const models = await manager.getAvailableModels();
    expect(models.length).toBeGreaterThan(0);
    expect(models[0].isLocal).toBe(true);
  });

  it('should perform deterministic completions and streaming in OfflineMockProvider', async () => {
    const mock = new OfflineMockProvider();
    const health = await mock.checkHealth();
    expect(health.available).toBe(true);

    const completion = await mock.complete([
      { role: 'user', content: 'Please summarize this text' },
    ]);
    expect(completion.text).toContain('Executive Summary');
    expect(completion.model).toBe('mock-deepseek-r1-q4');

    const streamedChunks: string[] = [];
    await mock.stream(
      [{ role: 'user', content: 'Generate a formula for sum' }],
      (chunk) => streamedChunks.push(chunk)
    );
    expect(streamedChunks.join('')).toContain('SUM');
  });

  it('should support registering custom OpenAI-compatible endpoints', () => {
    const manager = AiManager.getInstance();
    manager.createCustomProvider({
      id: 'my-custom-endpoint',
      name: 'Custom Server',
      endpoint: 'http://127.0.0.1:8080/v1',
      apiKey: 'test-key',
    });

    const active = manager.getActiveProvider();
    expect(active.id).toBe('my-custom-endpoint');
    expect(active.isLocal).toBe(true);

    // Reset back to offline mock
    manager.setActiveProvider('offline-mock');
    expect(manager.getActiveProvider().id).toBe('offline-mock');
  });
});
