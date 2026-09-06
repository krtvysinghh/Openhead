import React, { useState } from 'react';
import { AiManager, AiPermissionScope, AiProposedChange, DiffEngine } from '@openhead/ai';
import { glassStyles } from '@openhead/ui';
import { Sparkles, X, Shield, Send, Check, RefreshCw, Layers } from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  context?: string;
  onApplyChange?: (newText: string) => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  context = '',
  onApplyChange,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [scope, setScope] = useState<AiPermissionScope>('selection');
  const [providerId, setProviderId] = useState('offline-mock');
  const [response, setResponse] = useState<string | null>(null);
  const [diffProposal, setDiffProposal] = useState<AiProposedChange<string> | null>(null);
  const [loading, setLoading] = useState(false);

  const aiManager = AiManager.getInstance();

  if (!isOpen) return null;

  const handleProviderChange = (newProviderId: string) => {
    try {
      aiManager.setActiveProvider(newProviderId);
      setProviderId(newProviderId);
    } catch {
      // Keep existing
    }
  };

  const handleRun = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);
    setDiffProposal(null);

    try {
      const activeProvider = aiManager.getActiveProvider();
      const res = await activeProvider.complete([
        {
          role: 'system',
          content: 'You are an AI assistant in Openhead Office. Provide helpful and accurate responses.',
        },
        {
          role: 'user',
          content: context ? `Context (${scope}):\n${context}\n\nTask: ${prompt}` : prompt,
        },
      ]);

      setResponse(res.text);

      if (context && onApplyChange) {
        const diff = DiffEngine.computeWordDiff(context, res.text);
        const proposal: AiProposedChange<string> = {
          id: `diff_${Date.now()}`,
          scope,
          description: prompt,
          originalContent: context,
          proposedContent: res.text,
          diff,
          applied: false,
          rejected: false,
          apply: () => {
            proposal.applied = true;
            onApplyChange(res.text);
            setDiffProposal(null);
          },
          reject: () => {
            proposal.rejected = true;
            setDiffProposal(null);
          },
        };
        setDiffProposal(proposal);
      }
    } catch (err: any) {
      setResponse(`Error: ${err.message || 'Failed to complete local AI request'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-0 top-14 bottom-0 w-96 z-40 bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
      <div className="space-y-4 overflow-y-auto pr-1">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-sm text-white">Local AI Copilot</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model & Scope Selectors */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-medium text-slate-400 mb-1">Provider</label>
            <select
              value={providerId}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-2 py-1.5 text-slate-200 text-xs outline-none"
            >
              <option value="offline-mock">Offline Fallback</option>
              <option value="ollama-local">Ollama (11434)</option>
              <option value="lmstudio-local">LM Studio (1234)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-medium text-slate-400 mb-1">Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as AiPermissionScope)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-lg px-2 py-1.5 text-slate-200 text-xs outline-none"
            >
              <option value="selection">Selection Only</option>
              <option value="paragraph">Current Paragraph</option>
              <option value="slide">Current Slide</option>
              <option value="sheet">Active Sheet</option>
              <option value="document">Full Document</option>
            </select>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-start gap-2.5 text-xs text-indigo-200">
          <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>Local execution. Zero telemetry. Permission-scoped context.</span>
        </div>

        {/* Preset suggestions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Quick Actions</span>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              onClick={() => setPrompt('Summarize key points')}
              className="text-left text-xs text-slate-300 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              📄 Summarize current selection
            </button>
            <button
              onClick={() => setPrompt('Explain formula logic and potential edge cases')}
              className="text-left text-xs text-slate-300 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              📊 Explain active formula
            </button>
            <button
              onClick={() => setPrompt('Generate presentation outline with 3 key takeaways')}
              className="text-left text-xs text-slate-300 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              💡 Generate slide ideas
            </button>
          </div>
        </div>

        {/* Diff Proposal Preview */}
        {diffProposal && (
          <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-indigo-300">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" /> Proposed Changes
              </span>
              <span className="text-[10px] text-slate-400">Review Diff</span>
            </div>
            <div className="text-xs max-h-32 overflow-y-auto p-2 rounded bg-slate-900/90 font-mono leading-relaxed">
              {diffProposal.diff.map((chunk, idx) => (
                <span
                  key={idx}
                  className={
                    chunk.type === 'added'
                      ? 'bg-emerald-500/30 text-emerald-200 px-0.5 rounded'
                      : chunk.type === 'removed'
                      ? 'bg-rose-500/30 text-rose-200 line-through px-0.5 rounded'
                      : 'text-slate-300'
                  }
                >
                  {chunk.value}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={diffProposal.apply}
                className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center justify-center gap-1"
              >
                <Check className="w-3 h-3" /> Accept & Apply
              </button>
              <button
                onClick={diffProposal.reject}
                className="py-1 px-2 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-medium flex items-center justify-center gap-1"
              >
                <X className="w-3 h-3" /> Reject
              </button>
            </div>
          </div>
        )}

        {/* Plain Response Box */}
        {response && !diffProposal && (
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {response}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="space-y-2 pt-3 border-t border-white/10">
        <div className="relative flex items-center">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask AI anything about your document..."
            rows={2}
            className="w-full bg-slate-950/80 border border-white/10 focus:border-indigo-400/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none resize-none"
          />
        </div>
        <button
          onClick={handleRun}
          disabled={loading || !prompt.trim()}
          className={`w-full py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 ${glassStyles.buttonPrimary} disabled:opacity-40`}
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Locally...</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Execute with Local AI</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
