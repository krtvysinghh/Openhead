export interface AICompletionOptions {
  prompt: string;
  context?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  id: string;
  name: string;
  isLocal: boolean;
  isAvailable(): Promise<boolean>;
  complete(options: AICompletionOptions): Promise<string>;
}

export class MockAIProvider implements AIProvider {
  public id = 'mock-ai';
  public name = 'Local Openhead AI Simulator (Offline)';
  public isLocal = true;

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async complete(options: AICompletionOptions): Promise<string> {
    const p = options.prompt.toLowerCase();
    if (p.includes('summarize')) {
      return `Summary: ${options.context ? options.context.slice(0, 150) + '...' : 'Key insights generated locally by Openhead AI.'}`;
    }
    if (p.includes('formula') || p.includes('explain')) {
      return `Formula Analysis: Evaluates range calculation with topological cycle protection.`;
    }
    if (p.includes('outline') || p.includes('slide')) {
      return `1. Introduction & Mission\n2. Key Architecture Milestones\n3. Engineering Benchmarks\n4. Conclusion & Next Steps`;
    }
    return `Openhead AI Assistant: Processed request offline with zero data telemetry.`;
  }
}
