import React, { useState } from 'react';
import { SettingsManager, OpenheadSettings } from '@openhead/core';
import { X, Shield, Palette, HardDrive, Cpu, Keyboard } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSettingsChanged }) => {
  const [settings, setSettings] = useState<OpenheadSettings>(SettingsManager.get());
  const [activeTab, setActiveTab] = useState<'appearance' | 'fileHandling' | 'ai' | 'privacy' | 'shortcuts'>('appearance');

  if (!isOpen) return null;

  const handleUpdate = (partial: Partial<OpenheadSettings>) => {
    const next = SettingsManager.update(partial);
    setSettings(next);
    onSettingsChanged();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">Openhead Settings</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Local Storage Only
            </span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation & Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-white/10 p-3 space-y-1 bg-slate-950/20 text-xs">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                activeTab === 'appearance' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" /> Appearance
            </button>
            <button
              onClick={() => setActiveTab('fileHandling')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                activeTab === 'fileHandling' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <HardDrive className="w-4 h-4" /> Storage & Autosave
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                activeTab === 'ai' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4" /> Local-First AI
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                activeTab === 'privacy' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" /> Privacy & Guardrails
            </button>
            <button
              onClick={() => setActiveTab('shortcuts')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left font-medium transition-colors ${
                activeTab === 'shortcuts' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Keyboard className="w-4 h-4" /> Keybindings
            </button>
          </div>

          {/* Content Pane */}
          <div className="flex-1 p-6 overflow-y-auto text-xs text-slate-200 space-y-6">
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Theme Palette</label>
                  <select
                    value={settings.appearance.theme}
                    onChange={(e) => handleUpdate({ appearance: { ...settings.appearance, theme: e.target.value as any } })}
                    className="w-full bg-slate-950 border border-white/15 rounded-lg p-2 text-white"
                  >
                    <option value="dark">Openhead Dark (Default)</option>
                    <option value="light">Executive Clean Light</option>
                    <option value="high-contrast">High Contrast (Accessibility)</option>
                    <option value="emerald">Emerald Modern</option>
                    <option value="sunset">Sunset Minimal</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="font-medium block">Reduced Motion</span>
                    <span className="text-[10px] text-slate-500">Disable slide and dialog animations</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.appearance.reducedMotion}
                    onChange={(e) => handleUpdate({ appearance: { ...settings.appearance, reducedMotion: e.target.checked } })}
                    className="accent-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'fileHandling' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium block">Automatic Document Autosave</span>
                    <span className="text-[10px] text-slate-500">Periodically save active session locally</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.fileHandling.autosaveEnabled}
                    onChange={(e) => handleUpdate({ fileHandling: { ...settings.fileHandling, autosaveEnabled: e.target.checked } })}
                    className="accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Autosave Interval (Seconds)</label>
                  <input
                    type="number"
                    value={settings.fileHandling.autosaveIntervalSeconds}
                    onChange={(e) => handleUpdate({ fileHandling: { ...settings.fileHandling, autosaveIntervalSeconds: Number(e.target.value) } })}
                    className="w-full bg-slate-950 border border-white/15 rounded-lg p-2 text-white"
                  />
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium block">Enable AI Assistance</span>
                    <span className="text-[10px] text-slate-500">Optional writing, formula, and slide assistance</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.ai.enabled}
                    onChange={(e) => handleUpdate({ ai: { ...settings.ai, enabled: e.target.checked } })}
                    className="accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Inference Provider</label>
                  <select
                    value={settings.ai.defaultProvider}
                    onChange={(e) => handleUpdate({ ai: { ...settings.ai, defaultProvider: e.target.value as any } })}
                    className="w-full bg-slate-950 border border-white/15 rounded-lg p-2 text-white"
                  >
                    <option value="local">Local HTTP (Ollama / LM Studio / localhost)</option>
                    <option value="mock">Offline Heuristic Mock (Zero network)</option>
                    <option value="remote">Custom OpenAI-Compatible Endpoint</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Local Endpoint URL</label>
                  <input
                    type="text"
                    value={settings.ai.localEndpoint}
                    onChange={(e) => handleUpdate({ ai: { ...settings.ai, localEndpoint: e.target.value } })}
                    className="w-full bg-slate-950 border border-white/15 rounded-lg p-2 text-white font-mono text-[11px]"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="font-medium block">Require Mutation Confirmation</span>
                    <span className="text-[10px] text-slate-500">Always preview diffs before applying changes</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.ai.requireConfirmationBeforeMutation}
                    onChange={(e) => handleUpdate({ ai: { ...settings.ai, requireConfirmationBeforeMutation: e.target.checked } })}
                    className="accent-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-emerald-400 block">Telemetry Policy: Disabled</span>
                    <span className="text-[10px] text-slate-400">Openhead collects zero telemetry, tracking pixels, or background beacons.</span>
                  </div>
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="font-medium block">Enforce Strict Air-Gapped Mode</span>
                    <span className="text-[10px] text-slate-500">Block all external outbound HTTP connections</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.privacy.offlineModeForced}
                    onChange={(e) => handleUpdate({ privacy: { ...settings.privacy, offlineModeForced: e.target.checked } })}
                    className="accent-indigo-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'shortcuts' && (
              <div className="space-y-2">
                <span className="text-slate-400 block mb-2 font-medium">Core Office Keybindings</span>
                {Object.entries(settings.keyboardShortcuts).map(([action, key]) => (
                  <div key={action} className="flex items-center justify-between py-1.5 border-b border-white/5">
                    <span className="font-mono text-[11px] text-slate-300">{action}</span>
                    <kbd className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-white/10">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
