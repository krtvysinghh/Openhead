import React, { useState } from 'react';
import { glassStyles } from '@openhead/ui';
import { HelpCircle, X, Keyboard, ShieldCheck, Sparkles, Table } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'architecture' | 'formulas' | 'ai'>('shortcuts');

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Openhead Help and Shortcuts Reference"
    >
      <div
        className={`w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 ${glassStyles.panel} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Openhead Help & Reference Guide</h2>
              <p className="text-[11px] text-slate-400">Everything you need to master Openhead Office.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close help dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'shortcuts'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" /> Keyboard Shortcuts
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'architecture'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Privacy & Security
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'formulas'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" /> Formulas & Interop
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'ai'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Local AI
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-300 space-y-4">
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">Command Palette</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[10px]">⌘K / Ctrl+K</kbd>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">Find in Document</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[10px]">⌘F / Ctrl+F</kbd>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">Save Document</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[10px]">⌘S / Ctrl+S</kbd>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">Preferences / Settings</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[10px]">⌘, / Ctrl+,</kbd>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">Switch to Pen (Docs)</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[10px]">Ctrl+1</kbd>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">Switch to Sum (Sheets)</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[10px]">Ctrl+2</kbd>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">Switch to Glimpse (Slides)</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[10px]">Ctrl+3</kbd>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-300">Toggle AI Assistant</span>
                  <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[10px]">Ctrl+I</kbd>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-3 leading-relaxed">
              <h3 className="font-semibold text-white text-sm">Zero-Telemetry & Data Sovereignty</h3>
              <p>
                Openhead operates with 100% offline-first privacy. Your files, documents, and calculations never touch third-party telemetry servers or cloud analytics.
              </p>
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                ✓ All document AST mutations happen locally in-memory.<br />
                ✓ Autosaves are persisted directly to your local sandboxed browser storage / desktop filesystem.<br />
                ✓ No VBA macros or unverified native binaries are allowed to execute.
              </div>
            </div>
          )}

          {activeTab === 'formulas' && (
            <div className="space-y-3 leading-relaxed">
              <h3 className="font-semibold text-white text-sm">Spreadsheet Formula Depth & Interop</h3>
              <p>
                Sum provides 90+ Excel-standard formulas across Math, Stats, Lookup, Text, Logical, Date/Time, and Financial categories.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong className="text-slate-200">Dynamic Arrays & Spill:</strong> Formulas like <code className="text-indigo-300">=SEQUENCE(5, 5)</code> automatically spill into adjacent cells.</li>
                <li><strong className="text-slate-200">XLSX Fidelity:</strong> Full OpenXML roundtrip preserving cell formats, borders, fonts, colors, and named ranges.</li>
                <li><strong className="text-slate-200">Cross-App Bridge:</strong> Embed Sum spreadsheet tables directly into Pen documents or Glimpse presentation decks.</li>
              </ul>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-3 leading-relaxed">
              <h3 className="font-semibold text-white text-sm">Private Local AI Copilot</h3>
              <p>
                Openhead AI connects directly to local inference backends like Ollama (e.g. llama3, mistral, deepseek-r1) or OpenAI-compatible local APIs.
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li><strong className="text-slate-200">Proposal & Diff Review:</strong> All AI rewrites and formula changes are presented as structured diffs requiring your explicit accept/reject approval.</li>
                <li><strong className="text-slate-200">Zero Silent Transmission:</strong> Prompts are strictly sandboxed and logged to a local audit trail.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
