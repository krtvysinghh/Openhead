import { AiProvider, AiPermissionScope } from '../types';
import { PromptSanitizer } from '../safety';
import { AiAuditLogger } from '../audit';

export interface GeneratedSlideOutline {
  title: string;
  bulletPoints: string[];
  suggestedLayout?: 'title_slide' | 'bullet_list' | 'two_column' | 'chart_slide';
}

export interface GeneratedDeckOutline {
  presentationTitle: string;
  slides: GeneratedSlideOutline[];
}

export class GlimpseAiWorkflow {
  constructor(private provider: AiProvider) {}

  public async generatePresentationOutline(
    topic: string,
    slideCount: number = 3,
    scope: AiPermissionScope = 'document'
  ): Promise<GeneratedDeckOutline> {
    const logEntry = AiAuditLogger.log({
      providerId: this.provider.id,
      scope,
      intent: 'glimpse:generate_outline',
      promptSummary: `Generate ${slideCount} slides on: ${topic}`,
      tokensUsed: 0,
      status: 'generated',
    });

    try {
      const messages = PromptSanitizer.buildSandboxedMessages(
        `You are an executive presentation designer for Glimpse.
Generate a presentation outline JSON for the requested topic.
Format strictly as JSON:
{
  "presentationTitle": "Title",
  "slides": [
    { "title": "Slide Title", "bulletPoints": ["Point 1", "Point 2"], "suggestedLayout": "bullet_list" }
  ]
}`,
        `Requested slide count: ${slideCount}`,
        `Topic: ${topic}`
      );

      const res = await this.provider.complete(messages);
      let parsed: any;
      try {
        const jsonMatch = res.text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(jsonMatch ? jsonMatch[0] : res.text);
      } catch {
        parsed = {
          presentationTitle: topic,
          slides: [
            { title: 'Overview', bulletPoints: ['Key objective', 'Target milestones'], suggestedLayout: 'bullet_list' },
            { title: 'Details', bulletPoints: ['Implementation strategy', 'Results'], suggestedLayout: 'bullet_list' },
          ],
        };
      }

      AiAuditLogger.updateStatus(logEntry.id, 'accepted');
      return {
        presentationTitle: parsed.presentationTitle || topic,
        slides: parsed.slides || [],
      };
    } catch (err: any) {
      AiAuditLogger.updateStatus(logEntry.id, 'failed', err.message);
      throw err;
    }
  }

  public async generateSpeakerNotes(
    slideTitle: string,
    bulletPoints: string[]
  ): Promise<string> {
    const logEntry = AiAuditLogger.log({
      providerId: this.provider.id,
      scope: 'slide',
      intent: 'glimpse:speaker_notes',
      promptSummary: `Notes for ${slideTitle}`,
      tokensUsed: 0,
      status: 'generated',
    });

    try {
      const messages = PromptSanitizer.buildSandboxedMessages(
        'You are a professional presentation coach for Glimpse. Generate engaging, concise speaker notes to accompany the slide title and bullet points.',
        `Slide: ${slideTitle}\nPoints:\n${bulletPoints.map((p) => `- ${p}`).join('\n')}`,
        'Write 2-3 short paragraphs of natural speaking notes.'
      );

      const res = await this.provider.complete(messages);
      AiAuditLogger.updateStatus(logEntry.id, 'accepted');
      return res.text.trim();
    } catch (err: any) {
      AiAuditLogger.updateStatus(logEntry.id, 'failed', err.message);
      throw err;
    }
  }
}
