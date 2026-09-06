import React, { useState, useEffect, useRef } from 'react';
import { OfficeSearchEngine, SearchResultMatch, ProductType } from '@openhead/core';
import { Search, X, MapPin } from 'lucide-react';

interface UnifiedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeApp: ProductType;
  model: any;
  onNavigateMatch?: (match: SearchResultMatch) => void;
}

export const UnifiedSearchModal: React.FC<UnifiedSearchModalProps> = ({ isOpen, onClose, activeApp, model, onNavigateMatch }) => {
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<SearchResultMatch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setMatches([]);
      return;
    }

    if (activeApp === 'pen') {
      setMatches(OfficeSearchEngine.searchPenDocument(model, query));
    } else if (activeApp === 'sum') {
      setMatches(OfficeSearchEngine.searchSumWorkbook(model, query));
    } else if (activeApp === 'glimpse') {
      setMatches(OfficeSearchEngine.searchGlimpseDeck(model, query));
    }
  }, [query, activeApp, model]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Unified Search"
    >
      <div
        className="w-full max-w-xl bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-slate-950/40">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search in current ${activeApp.toUpperCase()} document...`}
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            aria-label="Close search dialog"
            className="p-1 rounded text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {query.trim() && matches.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No matches found for "{query}"</div>
          ) : (
            matches.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  onNavigateMatch?.(m);
                  onClose();
                }}
                className="p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10 flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{m.location}</span>
                </div>
                <p className="text-xs text-slate-300 font-mono line-clamp-2">{m.snippet}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
