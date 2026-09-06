import React, { useState, useEffect, useRef } from 'react';
import { CommandRegistry, CommandDefinition, CommandContext } from '@openhead/core';
import { Search, Command, CornerDownLeft } from 'lucide-react';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: CommandContext;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose, context }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = isOpen ? CommandRegistry.search(query, context) : [];

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (commands.length > 0 ? (prev + 1) % commands.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (commands.length > 0 ? (prev - 1 + commands.length) % commands.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (commands[selectedIndex]) {
        executeCommand(commands[selectedIndex]);
      }
    }
  };

  const executeCommand = async (cmd: CommandDefinition) => {
    onClose();
    await CommandRegistry.execute(cmd.id, context);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-slate-950/40">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search actions..."
            className="flex-1 bg-transparent border-none text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-400 border border-white/10">ESC</kbd>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {commands.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No commands found for "{query}"</div>
          ) : (
            commands.map((cmd, idx) => (
              <div
                key={cmd.id}
                onClick={() => executeCommand(cmd)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                  idx === selectedIndex ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Command className={`w-3.5 h-3.5 ${idx === selectedIndex ? 'text-white' : 'text-slate-500'}`} />
                  <div>
                    <span className="font-medium block">{cmd.label}</span>
                    {cmd.description && (
                      <span className={`text-[10px] block ${idx === selectedIndex ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {cmd.description}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {cmd.shortcut && (
                    <kbd className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${idx === selectedIndex ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400 border border-white/10'}`}>
                      {cmd.shortcut}
                    </kbd>
                  )}
                  {idx === selectedIndex && <CornerDownLeft className="w-3.5 h-3.5 text-indigo-200" />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
