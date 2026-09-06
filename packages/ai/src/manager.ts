import { AiProvider, AiModelInfo } from './types';
import { OfflineMockProvider } from './providers/offlineMock';
import { LocalHttpProvider } from './providers/localHttp';
import { OpenAiCompatibleProvider } from './providers/openAiCompatible';
import { PenAiWorkflow } from './workflows/penAi';
import { SumAiWorkflow } from './workflows/sumAi';
import { GlimpseAiWorkflow } from './workflows/glimpseAi';

export class AiManager {
  private static instance: AiManager;
  private providers: Map<string, AiProvider> = new Map();
  private activeProviderId: string = 'offline-mock';

  private constructor() {
    // Register default providers
    const offline = new OfflineMockProvider();
    const ollama = new LocalHttpProvider({ id: 'ollama-local', name: 'Ollama (Local)', endpoint: 'http://127.0.0.1:11434', type: 'local-ollama' });
    const lmStudio = new LocalHttpProvider({ id: 'lmstudio-local', name: 'LM Studio (Local)', endpoint: 'http://127.0.0.1:1234', type: 'local-lmstudio' });

    this.registerProvider(offline);
    this.registerProvider(ollama);
    this.registerProvider(lmStudio);
  }

  public static getInstance(): AiManager {
    if (!AiManager.instance) {
      AiManager.instance = new AiManager();
    }
    return AiManager.instance;
  }

  public registerProvider(provider: AiProvider): void {
    this.providers.set(provider.id, provider);
  }

  public setActiveProvider(providerId: string): void {
    if (!this.providers.has(providerId)) {
      throw new Error(`Provider "${providerId}" not found in AiManager`);
    }
    this.activeProviderId = providerId;
  }

  public getActiveProvider(): AiProvider {
    return this.providers.get(this.activeProviderId) || this.providers.get('offline-mock')!;
  }

  public getAllProviders(): AiProvider[] {
    return Array.from(this.providers.values());
  }

  public async getAvailableModels(): Promise<AiModelInfo[]> {
    return this.getActiveProvider().listModels();
  }

  // Application Workflows Factory
  public getPenAi(): PenAiWorkflow {
    return new PenAiWorkflow(this.getActiveProvider());
  }

  public getSumAi(): SumAiWorkflow {
    return new SumAiWorkflow(this.getActiveProvider());
  }

  public getGlimpseAi(): GlimpseAiWorkflow {
    return new GlimpseAiWorkflow(this.getActiveProvider());
  }

  public createCustomProvider(config: { id: string; name: string; endpoint: string; apiKey?: string }): void {
    const custom = new OpenAiCompatibleProvider(config);
    this.registerProvider(custom);
    this.setActiveProvider(custom.id);
  }
}
