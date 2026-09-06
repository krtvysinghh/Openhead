import React, { useState } from 'react';
import { ProductType, OfficeTemplateLibrary, OfficeTemplate } from '@openhead/core';
import { glassStyles } from '@openhead/ui';
import { FileText, Table, Presentation, X, Sparkles, Check } from 'lucide-react';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: OfficeTemplate) => void;
  initialType?: ProductType;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  initialType = 'pen',
}) => {
  const [selectedType, setSelectedType] = useState<ProductType>(initialType);
  const templates = OfficeTemplateLibrary.getTemplates(selectedType);

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
      aria-label="Office Template Library"
    >
      <div
        className={`w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 ${glassStyles.panel} shadow-2xl overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Office Template Library</h2>
              <p className="text-[11px] text-slate-400">Jumpstart your work with production-grade templates.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close templates dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5 bg-slate-950/40">
          <button
            onClick={() => setSelectedType('pen')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedType === 'pen'
                ? 'bg-indigo-600/80 text-white shadow-sm border border-indigo-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Pen Documents
          </button>
          <button
            onClick={() => setSelectedType('sum')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedType === 'sum'
                ? 'bg-emerald-600/80 text-white shadow-sm border border-emerald-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" /> Sum Spreadsheets
          </button>
          <button
            onClick={() => setSelectedType('glimpse')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedType === 'glimpse'
                ? 'bg-amber-600/80 text-white shadow-sm border border-amber-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Presentation className="w-3.5 h-3.5" /> Glimpse Presentations
          </button>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                onSelectTemplate(tpl);
                onClose();
              }}
              className="p-5 rounded-xl border border-white/10 bg-slate-900/40 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] px-2 py-0.5 rounded border border-white/10 bg-white/5 text-slate-300 font-mono">
                    {tpl.category}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {tpl.title || tpl.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                <span>Use Template</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
