import React from 'react';
import { ProductType } from '@openhead/core';
import { glassStyles } from '@openhead/ui';
import {
  FileText,
  Table,
  Presentation,
  Search,
  Sparkles,
  Undo,
  Redo,
  ShieldCheck,
  FolderOpen,
  Settings,
  Save,
  Menu,
} from 'lucide-react';

interface HeaderProps {
  activeProduct: ProductType | 'home';
  onSelectProduct: (product: ProductType | 'home') => void;
  title: string;
  onOpenCommandPalette: () => void;
  onOpenSearch: () => void;
  onToggleAi: () => void;
  onOpenRecentFiles: () => void;
  onOpenSettings: () => void;
  onManualSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isAutosaved: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeProduct,
  onSelectProduct,
  title: _title,
  onOpenCommandPalette,
  onOpenSearch,
  onToggleAi,
  onOpenRecentFiles,
  onOpenSettings,
  onManualSave,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isAutosaved,
}) => {

  return (
    <header className={`h-14 px-4 flex items-center justify-between border-b border-white/10 ${glassStyles.panel} relative z-30`}>
      {/* Brand & Product Selector */}
      <div className="flex items-center gap-6">
        <div className="relative">
          <button
            onClick={() => onSelectProduct('home')}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/5 transition-all"
            title="Go to Openhead Home"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-white/20">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
                OPENHEAD
              </span>
              <span className="text-[10px] block -mt-1 font-medium text-indigo-400">OFFICE</span>
            </div>
          </button>
        </div>

        {/* Product Switcher Pills */}
        <div className="flex items-center p-0.5 rounded-xl bg-slate-950/60 border border-white/10">
          <button
            onClick={() => onSelectProduct('home')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeProduct === 'home'
                ? 'bg-white/10 text-white shadow-sm border border-white/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onSelectProduct('pen')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeProduct === 'pen'
                ? 'bg-indigo-600/80 text-white shadow-sm border border-indigo-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Pen
          </button>
          <button
            onClick={() => onSelectProduct('sum')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeProduct === 'sum'
                ? 'bg-emerald-600/80 text-white shadow-sm border border-emerald-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" /> Sum
          </button>
          <button
            onClick={() => onSelectProduct('glimpse')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeProduct === 'glimpse'
                ? 'bg-amber-600/80 text-white shadow-sm border border-amber-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" /> Glimpse
          </button>
        </div>
      </div>

      {/* Center Search / Command Palette Shortcut */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/40 border border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-200 text-xs transition-all w-52 justify-between"
        >
          <div className="flex items-center gap-2">
            <Menu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Commands...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono">⌘K</kbd>
        </button>

        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/40 border border-white/10 hover:border-white/20 text-slate-400 hover:text-slate-200 text-xs transition-all"
          title="Search in Document (Ctrl+F)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Autosave Pill */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
          <span className={`w-1.5 h-1.5 rounded-full ${isAutosaved ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
          <span>{isAutosaved ? 'Autosaved' : 'Saving...'}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
            title="Undo (Cmd+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onManualSave}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Save Document (Cmd+S)"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenRecentFiles}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Open Recent Documents"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Settings & Privacy"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="w-[1px] h-4 bg-white/10 mx-1" />

        <button
          onClick={onToggleAi}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 hover:bg-indigo-500/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Local AI</span>
        </button>
      </div>
    </header>
  );
};
