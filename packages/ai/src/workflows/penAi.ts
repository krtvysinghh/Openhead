import { AiProvider, AiPermissionScope, AiProposedChange } from '../types';
import { PromptSanitizer, DiffEngine } from '../safety';
import { AiAuditLogger } from '../audit';

export class PenAiWorkflow {
  constructor(private provider: AiProvider) {}

  public async proposeRewrite(
    originalText: string,
    instruction: string,
    scope: AiPermissionScope = 'selection',
    applyCallback?: (newText: string) => void
  ): Promise<AiProposedChange<string>> {
    const logEntry = AiAuditLogger.log({
      providerId: this.provider.id,
      scope,
      intent: 'pen:rewrite',
      promptSummary: instruction,
      tokensUsed: 0,
      status: 'generated',
    });

    try {
      const messages = PromptSanitizer.buildSandboxedMessages(
        'You are an expert editor for Pen documents. Rewrite or improve the provided text strictly according to the user instructions. Output ONLY the rewritten text, with no preamble or conversational filler.',
        originalText,
        instruction
      );

      const res = await this.provider.complete(messages);
      const proposed = res.text.trim();
      const diff = DiffEngine.computeWordDiff(originalText, proposed);

      const changeId = `pen_change_${Date.now()}`;
      let applied = false;
      let rejected = false;

      const change: AiProposedChange<string> = {
        id: changeId,
        scope,
        description: instruction,
        originalContent: originalText,
        proposedContent: proposed,
        diff,
        metadata: proposed,
        applied: false,
        rejected: false,
        apply: () => {
          if (!applied && !rejected) {
            applied = true;
            change.applied = true;
            AiAuditLogger.updateStatus(logEntry.id, 'accepted');
            if (applyCallback) applyCallback(proposed);
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

  public async summarize(
    documentText: string,
    scope: AiPermissionScope = 'document'
  ): Promise<string> {
    const logEntry = AiAuditLogger.log({
      providerId: this.provider.id,
      scope,
      intent: 'pen:summarize',
      promptSummary: 'Generate document summary',
      tokensUsed: 0,
      status: 'generated',
    });

    try {
      const messages = PromptSanitizer.buildSandboxedMessages(
        'You are an executive summarizer in Pen. Produce a concise, well-structured executive summary of the document text provided. Output in bullet points.',
        documentText,
        'Summarize this text in 3-5 concise bullets.'
      );

      const res = await this.provider.complete(messages);
      AiAuditLogger.updateStatus(logEntry.id, 'accepted');
      return res.text.trim();
    } catch (err: any) {
      AiAuditLogger.updateStatus(logEntry.id, 'failed', err.message);
      throw err;
    }
  }

  public async proposeToneChange(
    originalText: string,
    tone: 'executive' | 'academic' | 'casual' | 'persuasive' | 'concise',
    applyCallback?: (newText: string) => void
  ): Promise<AiProposedChange<string>> {
    return this.proposeRewrite(
      originalText,
      `Rewrite this text with a professional ${tone} tone, maintaining factual accuracy and key messages.`,
      'selection',
      applyCallback
    );
  }

  public async extractActionItems(
    documentText: string,
    scope: AiPermissionScope = 'document'
  ): Promise<Array<{ task: string; assignee?: string; dueDate?: string }>> {
    const logEntry = AiAuditLogger.log({
      providerId: this.provider.id,
      scope,
      intent: 'pen:action_items',
      promptSummary: 'Extract actionable tasks and assignees',
      tokensUsed: 0,
      status: 'generated',
    });

    try {
      const messages = PromptSanitizer.buildSandboxedMessages(
        `You are a meeting assistant and project manager for Pen.
Analyze the document text and extract all actionable tasks, action items, assignees, and deadlines.
Return strictly valid JSON array of objects with schema:
[
  { "task": "description of task", "assignee": "person or Unassigned", "dueDate": "deadline or None" }
]`,
        documentText,
        'Extract all action items from this document as JSON array.'
      );

      const res = await this.provider.complete(messages);
      let items: any[] = [];
      try {
        const jsonMatch = res.text.match(/\[[\s\S]*\]/);
        items = JSON.parse(jsonMatch ? jsonMatch[0] : res.text);
      } catch {
        items = [
          { task: 'Review document and approve pending changes', assignee: 'Team', dueDate: 'Soon' }
        ];
      }

      AiAuditLogger.updateStatus(logEntry.id, 'accepted');
      return items.map((i) => ({
        task: i.task || 'Action item',
        assignee: i.assignee || undefined,
        dueDate: i.dueDate || undefined,
      }));
    } catch (err: any) {
      AiAuditLogger.updateStatus(logEntry.id, 'failed', err.message);
      throw err;
    }
  }
}
