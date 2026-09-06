import { describe, it, expect, beforeEach } from 'vitest';
import { AiManager } from '../manager';
import { AiAuditLogger } from '../audit';

describe('AI Application Workflows & Audit Logger', () => {
  beforeEach(() => {
    AiAuditLogger.clear();
    AiManager.getInstance().setActiveProvider('offline-mock');
  });

  it('should support Pen rewrite workflow with accept/reject cycle and audit trail', async () => {
    const penAi = AiManager.getInstance().getPenAi();
    let committedText = '';

    const proposal = await penAi.proposeRewrite(
      'The quick brown fox',
      'Make it more professional',
      'selection',
      (newText) => {
        committedText = newText;
      }
    );

    expect(proposal.originalContent).toBe('The quick brown fox');
    expect(proposal.proposedContent.length).toBeGreaterThan(0);
    expect(proposal.applied).toBe(false);

    const logs = AiAuditLogger.getEntries();
    expect(logs.length).toBe(1);
    expect(logs[0].intent).toBe('pen:rewrite');
    expect(logs[0].scope).toBe('selection');

    // Test accept commit
    proposal.apply();
    expect(proposal.applied).toBe(true);
    expect(committedText).toBe(proposal.proposedContent);

    const updatedLogs = AiAuditLogger.getEntries();
    expect(updatedLogs[0].status).toBe('accepted');
  });

  it('should support Sum formula suggestions and explanations', async () => {
    const sumAi = AiManager.getInstance().getSumAi();

    const explanation = await sumAi.explainFormula('=SUM(A1:A10)');
    expect(explanation).toContain('Formula Explanation');

    let insertedFormula = '';
    const formulaProposal = await sumAi.suggestFormula(
      'Calculate total sales in Q1',
      'Column A: Quarter, Column B: Sales',
      'C1',
      (f) => {
        insertedFormula = f;
      }
    );

    expect(formulaProposal.proposedContent.startsWith('=')).toBe(true);
    formulaProposal.apply();
    expect(insertedFormula).toBe(formulaProposal.proposedContent);
  });

  it('should support Glimpse presentation outline generation', async () => {
    const glimpseAi = AiManager.getInstance().getGlimpseAi();

    const outline = await glimpseAi.generatePresentationOutline('Local AI in Office Suites', 3);
    expect(outline.presentationTitle).toBeDefined();
    expect(outline.slides.length).toBeGreaterThanOrEqual(2);
    expect(outline.slides[0].title).toBeDefined();
    expect(outline.slides[0].bulletPoints.length).toBeGreaterThan(0);

    const notes = await glimpseAi.generateSpeakerNotes('Executive Summary', ['Point A', 'Point B']);
    expect(notes.length).toBeGreaterThan(10);
  });
});
