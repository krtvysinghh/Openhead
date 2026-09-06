import { AiProvider, AiProposedChange } from '../types';
import { PromptSanitizer, DiffEngine } from '../safety';
import { AiAuditLogger } from '../audit';

export class SumAiWorkflow {
  constructor(private provider: AiProvider) {}

  public async explainFormula(formula: string): Promise<string> {
    const logEntry = AiAuditLogger.log({
      providerId: this.provider.id,
      scope: 'selection',
      intent: 'sum:explain_formula',
      promptSummary: `Explain formula: ${formula}`,
      tokensUsed: 0,
      status: 'generated',
    });

    try {
      const messages = PromptSanitizer.buildSandboxedMessages(
        'You are an expert spreadsheet formula analyst for Sum. Explain the given formula in clear, friendly plain language. Outline inputs, conditional logic, and expected output.',
        formula,
        'Explain step-by-step how this formula calculates its result.'
      );

      const res = await this.provider.complete(messages);
      AiAuditLogger.updateStatus(logEntry.id, 'accepted');
      return res.text.trim();
    } catch (err: any) {
      AiAuditLogger.updateStatus(logEntry.id, 'failed', err.message);
      throw err;
    }
  }

  public async suggestFormula(
    intentDescription: string,
    tableSchemaContext: string,
    targetCell: string = 'A1',
    applyCallback?: (formula: string) => void
  ): Promise<AiProposedChange<string>> {
    const logEntry = AiAuditLogger.log({
      providerId: this.provider.id,
      scope: 'selection',
      intent: 'sum:suggest_formula',
      promptSummary: intentDescription,
      tokensUsed: 0,
      status: 'generated',
    });

    try {
      const messages = PromptSanitizer.buildSandboxedMessages(
        'You are a spreadsheet formula generator for Sum. Given a column schema and user goal, generate a valid Excel/Sum formula starting with "=". Output ONLY the formula on the first line.',
        `Target cell: ${targetCell}\nContext:\n${tableSchemaContext}`,
        intentDescription
      );

      const res = await this.provider.complete(messages);
      let formula = res.text.trim().split('\n')[0].trim();
      if (!formula.startsWith('=')) {
        formula = '=' + formula;
      }

      const diff = DiffEngine.computeWordDiff('', formula);

      const changeId = `sum_formula_${Date.now()}`;
      let applied = false;
      let rejected = false;

      const change: AiProposedChange<string> = {
        id: changeId,
        scope: 'selection',
        description: `Insert formula: ${formula}`,
        originalContent: '',
        proposedContent: formula,
        diff,
        metadata: formula,
        applied: false,
        rejected: false,
        apply: () => {
          if (!applied && !rejected) {
            applied = true;
            change.applied = true;
            AiAuditLogger.updateStatus(logEntry.id, 'accepted');
            if (applyCallback) applyCallback(formula);
          }
        },
        reject: () => {
          if (!applied && !rejected) {
            rejected = true;
            change.rejected = true;
            AiAuditLogger.updateStatus(logEntry.id, 'rejected');
          }
        },
      };

      return change;
    } catch (err: any) {
      AiAuditLogger.updateStatus(logEntry.id, 'failed', err.message);
      throw err;
    }
  }
}
