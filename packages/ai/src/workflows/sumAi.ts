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

  public async diagnoseFormulaError(
    formula: string,
    errorCode: string,
    cellContext?: string
  ): Promise<{ diagnosis: string; suggestedFix: string }> {
    const logEntry = AiAuditLogger.log({
      providerId: this.provider.id,
      scope: 'selection',
      intent: 'sum:diagnose_error',
      promptSummary: `Diagnose error ${errorCode} in ${formula}`,
      tokensUsed: 0,
      status: 'generated',
    });

    try {
      const messages = PromptSanitizer.buildSandboxedMessages(
        `You are an expert spreadsheet debugger in Sum.
Analyze why formula ${formula} returned error ${errorCode}.
Explain the root cause and provide a corrected formula starting with '='.
Return strictly valid JSON:
{
  "diagnosis": "concise explanation of why the error happened",
  "suggestedFix": "=CORRECTED_FORMULA(...)"
}`,
        cellContext || 'No additional cell context provided.',
        `Formula: ${formula}, Error: ${errorCode}`
      );

      const res = await this.provider.complete(messages);
      let parsed: any;
      try {
        const jsonMatch = res.text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : res.text);
      } catch {
        parsed = {
          diagnosis: `Error ${errorCode} likely caused by incompatible data types or missing reference.`,
          suggestedFix: formula,
        };
      }

      AiAuditLogger.updateStatus(logEntry.id, 'accepted');
      return {
        diagnosis: parsed.diagnosis || 'Unrecognized error reason',
        suggestedFix: parsed.suggestedFix?.startsWith('=') ? parsed.suggestedFix : `=${parsed.suggestedFix || formula}`,
      };
    } catch (err: any) {
      AiAuditLogger.updateStatus(logEntry.id, 'failed', err.message);
      throw err;
    }
  }

  public async suggestOptimalChart(
    headers: string[],
    sampleRows: any[][]
  ): Promise<{ chartType: 'bar' | 'line' | 'pie' | 'scatter'; reason: string; title: string; categoryColumn: string; valueColumns: string[] }> {
    const logEntry = AiAuditLogger.log({
      providerId: this.provider.id,
      scope: 'selection',
      intent: 'sum:suggest_chart',
      promptSummary: `Suggest chart for columns: ${headers.join(', ')}`,
      tokensUsed: 0,
      status: 'generated',
    });

    try {
      const messages = PromptSanitizer.buildSandboxedMessages(
        `You are a data visualization architect in Sum.
Given table columns and sample rows, recommend the most effective chart type ('bar', 'line', 'pie', 'scatter').
Return strictly valid JSON:
{
  "chartType": "bar",
  "title": "Quarterly Revenue Summary",
  "categoryColumn": "Quarter",
  "valueColumns": ["Revenue"],
  "reason": "Clear discrete comparison across categories."
}`,
        `Columns: ${headers.join(', ')}\nSample Rows:\n${sampleRows.map((r) => r.join(' | ')).join('\n')}`,
        'Recommend best chart visualization for this data.'
      );

      const res = await this.provider.complete(messages);
      let parsed: any;
      try {
        const jsonMatch = res.text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : res.text);
      } catch {
        parsed = {
          chartType: 'bar',
          title: 'Data Overview',
          categoryColumn: headers[0] || 'Category',
          valueColumns: headers.slice(1).length > 0 ? headers.slice(1) : [headers[0]],
          reason: 'Standard tabular comparison chart',
        };
      }

      AiAuditLogger.updateStatus(logEntry.id, 'accepted');
      return {
        chartType: ['bar', 'line', 'pie', 'scatter'].includes(parsed.chartType) ? parsed.chartType : 'bar',
        title: parsed.title || 'Chart Summary',
        categoryColumn: parsed.categoryColumn || headers[0] || 'Category',
        valueColumns: Array.isArray(parsed.valueColumns) ? parsed.valueColumns : [headers[1] || headers[0]],
        reason: parsed.reason || 'Appropriate for dataset structure',
      };
    } catch (err: any) {
      AiAuditLogger.updateStatus(logEntry.id, 'failed', err.message);
      throw err;
    }
  }
}
