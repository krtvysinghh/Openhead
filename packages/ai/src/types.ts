export type AiProviderType = 'local-ollama' | 'local-lmstudio' | 'openai-compatible' | 'offline-mock';

export type AiPermissionScope = 'selection' | 'paragraph' | 'slide' | 'sheet' | 'document';

export interface AiRequestMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AiCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface AiCompletionResult {
  text: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  finishReason?: string;
}

export interface AiModelInfo {
  id: string;
  name: string;
  parameterSize?: string;
  quantized?: string;
  isLocal: boolean;
}

export interface AiProvider {
  id: string;
  name: string;
  type: AiProviderType;
  isLocal: boolean;
  endpoint?: string;
  checkHealth(): Promise<{ available: boolean; error?: string }>;
  listModels(): Promise<AiModelInfo[]>;
  complete(messages: AiRequestMessage[], options?: AiCompletionOptions): Promise<AiCompletionResult>;
  stream?(
    messages: AiRequestMessage[],
    onChunk: (chunk: string) => void,
    options?: AiCompletionOptions
  ): Promise<AiCompletionResult>;
}

export interface AiDiffChunk {
  type: 'unchanged' | 'added' | 'removed';
  value: string;
}

export interface AiProposedChange<T = any> {
  id: string;
  scope: AiPermissionScope;
  description: string;
  originalContent: string;
  proposedContent: string;
  diff: AiDiffChunk[];
  metadata?: T;
  applied: boolean;
  rejected: boolean;
  apply: () => void;
  reject: () => void;
}

export interface AiAuditEntry {
  id: string;
  timestamp: number;
  providerId: string;
  scope: AiPermissionScope;
  intent: string;
  promptSummary: string;
  tokensUsed: number;
  status: 'generated' | 'accepted' | 'rejected' | 'failed';
  error?: string;
}
