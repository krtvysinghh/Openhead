import React, { useState } from 'react';
import { MockAIProvider } from '@openhead/core';
import { glassStyles } from '@openhead/ui';
import { Sparkles, X, Shield, Send } from 'lucide-react';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  context?: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({ isOpen, onClose, initialPrompt, context }) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const ai = new MockAIProvider();

  if (!isOpen) return null;

  const handleRun = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const res = await ai.complete({ prompt, context });
      setResponse(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-0 top-14 bottom-0 w-96 z-40 bg-slate-900/90 backdrop-blur-2xl border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
      <div className="space-y-4">
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

        {/* Privacy Note */}
        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-400/20 flex items-start gap-2.5 text-xs text-indigo-200">
          <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>Runs locally on your device. Zero telemetry or network transmissions.</span>
        </div>

        {/* Preset suggestions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Quick Actions</span>
          <div className="grid grid-cols-1 gap-1.5">
            <button
              onClick={() => setPrompt('Summarize key points')}
              className="text-left text-xs text-slate-300 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              📄 Summarize document
            </button>
            <button
              onClick={() => setPrompt('Explain formula logic and potential edge cases')}
              className="text-left text-xs text-slate-300 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              📊 Explain active formula
            </button>
            <button
              onClick={() => setPrompt('Generate 3 presentation outline ideas')}
              className="text-left text-xs text-slate-300 hover:text-white p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
            >
              💡 Generate slide ideas
            </button>
          </div>
        </div>

        {/* Response Box */}
        {response && (
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {response}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="space-y-2">
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
          {loading ? 'Processing Locally...' : <><Send className="w-3.5 h-3.5" /> Execute Prompt</>}
        </button>
      </div>
    </div>
  );
};
