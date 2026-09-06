import { AiProvider, AiModelInfo, AiRequestMessage, AiCompletionOptions, AiCompletionResult } from '../types';

export interface LocalHttpProviderConfig {
  id?: string;
  name?: string;
  endpoint?: string;
  type?: 'local-ollama' | 'local-lmstudio';
}

export class LocalHttpProvider implements AiProvider {
  public id: string;
  public name: string;
  public type: 'local-ollama' | 'local-lmstudio';
  public isLocal = true;
  public endpoint: string;

  constructor(config?: LocalHttpProviderConfig) {
    this.id = config?.id || 'ollama-local';
    this.name = config?.name || 'Ollama Local (localhost:11434)';
    this.type = config?.type || 'local-ollama';
    this.endpoint = config?.endpoint || 'http://127.0.0.1:11434';
  }

  public async checkHealth(): Promise<{ available: boolean; error?: string }> {
    try {
      const url = this.type === 'local-ollama' ? `${this.endpoint}/api/tags` : `${this.endpoint}/v1/models`;
      const res = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return { available: true };
      }
      return { available: false, error: `HTTP ${res.status}: ${res.statusText}` };
    } catch (err: any) {
      return { available: false, error: err.message || 'Local endpoint connection refused' };
    }
  }

  public async listModels(): Promise<AiModelInfo[]> {
    try {
      if (this.type === 'local-ollama') {
        const res = await fetch(`${this.endpoint}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(2000) });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.models || []).map((m: any) => ({
          id: m.name,
          name: m.name,
          parameterSize: m.details?.parameter_size,
          quantized: m.details?.quantization_level,
          isLocal: true,
        }));
      } else {
        const res = await fetch(`${this.endpoint}/v1/models`, { method: 'GET', signal: AbortSignal.timeout(2000) });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.data || []).map((m: any) => ({
          id: m.id,
          name: m.id,
          isLocal: true,
        }));
      }
    } catch {
      return [];
    }
  }

  public async complete(
    messages: AiRequestMessage[],
    options?: AiCompletionOptions
  ): Promise<AiCompletionResult> {
    const model = options?.model || (this.type === 'local-ollama' ? 'llama3:latest' : 'local-model');
    const timeoutMs = options?.timeoutMs || 30000;

    if (this.type === 'local-ollama') {
      const res = await fetch(`${this.endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.3,
            num_predict: options?.maxTokens ?? 1024,
          },
        }),
        signal: options?.signal || AbortSignal.timeout(timeoutMs),
      });

      if (!res.ok) {
        throw new Error(`Ollama local request failed: ${res.statusText}`);
      }

      const data = await res.json();
      return {
        text: data.message?.content || '',
        model: data.model || model,
        promptTokens: data.prompt_eval_count,
        completionTokens: data.eval_count,
        finishReason: data.done ? 'stop' : 'length',
      };
    } else {
      const res = await fetch(`${this.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.3,
          max_tokens: options?.maxTokens ?? 1024,
        }),
        signal: options?.signal || AbortSignal.timeout(timeoutMs),
      });

      if (!res.ok) {
        throw new Error(`LM Studio local request failed: ${res.statusText}`);
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
}
