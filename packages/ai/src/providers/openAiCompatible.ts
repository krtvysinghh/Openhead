import { AiProvider, AiModelInfo, AiRequestMessage, AiCompletionOptions, AiCompletionResult } from '../types';

export interface OpenAiCompatibleProviderConfig {
  id?: string;
  name?: string;
  endpoint: string;
  apiKey?: string;
  isLocal?: boolean;
}

export class OpenAiCompatibleProvider implements AiProvider {
  public id: string;
  public name: string;
  public type = 'openai-compatible' as const;
  public isLocal: boolean;
  public endpoint: string;
  private apiKey?: string;

  constructor(config: OpenAiCompatibleProviderConfig) {
    this.id = config.id || 'custom-openai-compatible';
    this.name = config.name || 'Custom OpenAI-Compatible Endpoint';
    this.endpoint = config.endpoint.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.isLocal = config.isLocal ?? (this.endpoint.includes('localhost') || this.endpoint.includes('127.0.0.1'));
  }

  public async checkHealth(): Promise<{ available: boolean; error?: string }> {
    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
      const res = await fetch(`${this.endpoint}/models`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(3000),
      });
      if (res.ok) {
        return { available: true };
      }
      return { available: false, error: `HTTP ${res.status}: ${res.statusText}` };
    } catch (err: any) {
      return { available: false, error: err.message || 'Endpoint connection failed' };
    }
  }

  public async listModels(): Promise<AiModelInfo[]> {
    try {
      const headers: Record<string, string> = {};
      if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
      const res = await fetch(`${this.endpoint}/models`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data || []).map((m: any) => ({
        id: m.id,
        name: m.id,
        isLocal: this.isLocal,
      }));
    } catch {
      return [];
    }
  }

  public async complete(
    messages: AiRequestMessage[],
    options?: AiCompletionOptions
  ): Promise<AiCompletionResult> {
    const model = options?.model || 'default-model';
    const timeoutMs = options?.timeoutMs || 30000;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const res = await fetch(`${this.endpoint}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 1024,
      }),
      signal: options?.signal || AbortSignal.timeout(timeoutMs),
    });

    if (!res.ok) {
      throw new Error(`OpenAI-compatible request failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    return {
      text: choice?.message?.content || '',
      model: data.model || model,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      finishReason: choice?.finish_reason || 'stop',
    };
  }
}
