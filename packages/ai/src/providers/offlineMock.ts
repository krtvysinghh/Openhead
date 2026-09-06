import { AiProvider, AiModelInfo, AiRequestMessage, AiCompletionOptions, AiCompletionResult } from '../types';

export class OfflineMockProvider implements AiProvider {
  public id = 'offline-mock';
  public name = 'Offline Deterministic Model';
  public type = 'offline-mock' as const;
  public isLocal = true;

  public async checkHealth(): Promise<{ available: boolean; error?: string }> {
    return { available: true };
  }

  public async listModels(): Promise<AiModelInfo[]> {
    return [
      {
        id: 'mock-deepseek-r1-q4',
        name: 'DeepSeek-R1 (Local Simulated Q4_K_M)',
        parameterSize: '7B',
        quantized: 'Q4_K_M',
        isLocal: true,
      },
      {
        id: 'mock-llama-3-8b',
        name: 'Llama 3 (Local Simulated Q4_0)',
        parameterSize: '8B',
        quantized: 'Q4_0',
        isLocal: true,
      },
      {
        id: 'mock-qwen-2.5-coder',
        name: 'Qwen 2.5 Coder (Local Simulated Q5_K_M)',
        parameterSize: '7B',
        quantized: 'Q5_K_M',
        isLocal: true,
      },
    ];
  }

  public async complete(
    messages: AiRequestMessage[],
    _options?: AiCompletionOptions
  ): Promise<AiCompletionResult> {
    const lastUserMessage = messages.filter((m) => m.role === 'user').pop()?.content || '';
    let responseText = '';

    if (lastUserMessage.toLowerCase().includes('summarize')) {
      responseText = 'Executive Summary: The document details strategic objectives, operational metrics, and delivery timelines with a focus on local execution and security.';
    } else if (lastUserMessage.toLowerCase().includes('formula') || lastUserMessage.toLowerCase().includes('sum')) {
      if (lastUserMessage.toLowerCase().includes('explain')) {
        responseText = 'Formula Explanation: This expression calculates the aggregate sum across the specified range, filtering out invalid values and propagating results.';
      } else {
        responseText = '=SUMIFS(C2:C100, A2:A100, "Q1", B2:B100, ">1000")';
      }
    } else if (lastUserMessage.toLowerCase().includes('slide') || lastUserMessage.toLowerCase().includes('presentation')) {
      responseText = JSON.stringify({
        title: 'Strategic Overview',
        slides: [
          { title: 'Executive Summary', bulletPoints: ['Key milestone achievement', 'Zero cloud telemetry guarantee', '100% offline document sovereignty'] },
          { title: 'Operational Performance', bulletPoints: ['Sub-16ms interactive latency', 'High-fidelity DOCX/XLSX/PPTX import', 'Local Ollama & LM Studio integration'] },
          { title: 'Roadmap & Next Steps', bulletPoints: ['Production desktop release', 'Multi-user encrypted storage', 'Enterprise deployment validation'] },
        ],
      }, null, 2);
    } else if (lastUserMessage.toLowerCase().includes('simplify') || lastUserMessage.toLowerCase().includes('rewrite')) {
      responseText = 'Openhead provides high-performance document, spreadsheet, and presentation editing with guaranteed local privacy and zero telemetry.';
    } else {
      responseText = `Response: Processed request safely on local engine.\n\nKey takeaways:\n- Complete local data sovereignty\n- Structured diff review before committing changes\n- Zero external network dependency`;
    }

    return {
      text: responseText,
      model: 'mock-deepseek-r1-q4',
      promptTokens: Math.ceil(lastUserMessage.length / 4),
      completionTokens: Math.ceil(responseText.length / 4),
      finishReason: 'stop',
    };
  }

  public async stream(
    messages: AiRequestMessage[],
    onChunk: (chunk: string) => void,
    options?: AiCompletionOptions
  ): Promise<AiCompletionResult> {
    const result = await this.complete(messages, options);
    const words = result.text.split(' ');
    for (const word of words) {
      onChunk(word + ' ');
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    return result;
  }
}
