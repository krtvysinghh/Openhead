import React, { useState } from 'react';
import { glassStyles } from '../theme';
import { X, Moon, Sun, Shield, Sliders, Cpu, Save } from 'lucide-react';

export interface AppSettings {
  theme: 'glass-dark' | 'glass-frost' | 'high-contrast';
  autoSaveIntervalSec: number;
  enableLocalAi: boolean;
  aiEndpoint: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className={`w-full max-w-lg ${glassStyles.modal} p-6 flex flex-col gap-6 shadow-2xl`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Openhead Preferences</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 text-xs">
          {/* Theme */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-300">Interface Theme & Atmosphere</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLocalSettings((s) => ({ ...s, theme: 'glass-dark' }))}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all ${
                  localSettings.theme === 'glass-dark'
                    ? 'border-indigo-400/80 bg-indigo-600/20 text-white shadow'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-indigo-400" /> Glass Dark
              </button>
              <button
                type="button"
                onClick={() => setLocalSettings((s) => ({ ...s, theme: 'glass-frost' }))}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all ${
                  localSettings.theme === 'glass-frost'
                    ? 'border-indigo-400/80 bg-indigo-600/20 text-white shadow'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Glass Frost
              </button>
              <button
                type="button"
                onClick={() => setLocalSettings((s) => ({ ...s, theme: 'high-contrast' }))}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition-all ${
                  localSettings.theme === 'high-contrast'
                    ? 'border-indigo-400/80 bg-indigo-600/20 text-white shadow'
                    : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> High Contrast
              </button>
            </div>
          </div>

          {/* Autosave */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-300">Autosave Interval</label>
            <select
              value={localSettings.autoSaveIntervalSec}
              onChange={(e) => setLocalSettings((s) => ({ ...s, autoSaveIntervalSec: Number(e.target.value) }))}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none"
            >
              <option value={3}>Every 3 seconds (High frequency)</option>
              <option value={10}>Every 10 seconds (Balanced)</option>
              <option value={30}>Every 30 seconds</option>
              <option value={0}>Manual Save Only</option>
            </select>
          </div>

          {/* Local AI Endpoint */}
          <div className="space-y-1.5">
            <label className="font-medium text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Local AI Model Endpoint
            </label>
            <input
              type="text"
              value={localSettings.aiEndpoint}
              onChange={(e) => setLocalSettings((s) => ({ ...s, aiEndpoint: e.target.value }))}
              placeholder="http://localhost:11434 (Ollama / Local Server)"
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 outline-none placeholder-slate-500 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Openhead runs exclusively offline. Documents are never uploaded to external cloud endpoints.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium ${glassStyles.buttonPrimary}`}
          >
            <Save className="w-3.5 h-3.5" /> Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
