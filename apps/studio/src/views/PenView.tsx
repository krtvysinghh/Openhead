import React, { useState } from 'react';
import { PenDocument, exportToMarkdown, importFromMarkdown, Block, ParagraphBlock, HeadingBlock, TableBlock } from '@openhead/pen';
import { glassStyles } from '@openhead/ui';
import {
  Heading1,
  Heading2,
  Heading3,
  FileDown,
  FileUp,
  Sparkles,
  Plus,
  Trash2,
  Table as TableIcon,
  Search,
  Check,
  X,
} from 'lucide-react';

interface PenViewProps {
  document: PenDocument;
  onUpdate: () => void;
  onAiPrompt?: (prompt: string, context: string) => void;
}

export const PenView: React.FC<PenViewProps> = ({ document: doc, onUpdate, onAiPrompt }) => {
  const model = doc.getModel();
  const stats = doc.getStats();
  const outline = doc.getOutline();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [searchResultCount, setSearchResultCount] = useState<number | null>(null);

  const handleTextChange = (sectionIdx: number, blockIdx: number, text: string) => {
    const block = model.sections[sectionIdx].blocks[blockIdx];
    if ('inlines' in block) {
      const updated = {
        ...block,
        inlines: [{ id: 'inl-1', text }],
      } as Block;
      doc.updateBlock(sectionIdx, blockIdx, updated);
      onUpdate();
    }
  };

  const handleAddParagraph = () => {
    const newBlock: ParagraphBlock = {
      id: `blk_${Date.now()}`,
      type: 'paragraph',
      inlines: [{ id: `inl_${Date.now()}`, text: 'Start typing here...' }],
    };
    doc.insertBlock(0, model.sections[0].blocks.length, newBlock);
    onUpdate();
  };

  const handleAddHeading = (level: 1 | 2 | 3) => {
    const newBlock: HeadingBlock = {
      id: `blk_${Date.now()}`,
      type: 'heading',
      level,
      inlines: [{ id: `inl_${Date.now()}`, text: `Heading ${level}` }],
    };
    doc.insertBlock(0, model.sections[0].blocks.length, newBlock);
    onUpdate();
  };

  const handleAddTable = () => {
    const tableBlock: TableBlock = {
      id: `tbl_${Date.now()}`,
      type: 'table',
      headers: ['Column 1', 'Column 2', 'Column 3'],
      rows: [
        [
          { id: `c_${Date.now()}_1`, inlines: [{ id: `i_${Date.now()}_1`, text: 'Data 1' }] },
          { id: `c_${Date.now()}_2`, inlines: [{ id: `i_${Date.now()}_2`, text: 'Data 2' }] },
          { id: `c_${Date.now()}_3`, inlines: [{ id: `i_${Date.now()}_3`, text: 'Data 3' }] },
        ],
      ],
    };
    doc.insertBlock(0, model.sections[0].blocks.length, tableBlock);
    onUpdate();
  };

  const handleDeleteBlock = (blockIdx: number) => {
    if (model.sections[0].blocks.length > 1) {
      doc.deleteBlock(0, blockIdx);
      onUpdate();
    }
  };

  const handleExecuteSearchReplace = () => {
    if (!searchQuery) return;
    const count = doc.searchAndReplace(searchQuery, replaceQuery);
    setSearchResultCount(count);
    onUpdate();
  };

  const handleExportMarkdown = () => {
    const md = exportToMarkdown(model);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${model.metadata.title.toLowerCase().replace(/\s+/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportMarkdown = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const imported = importFromMarkdown(content, file.name.replace(/\.md$/, ''));
        doc.getModel().sections = imported.sections;
        doc.setTitle(imported.metadata.title);
        onUpdate();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/40">
      {/* Ribbon Toolbar */}
      <div className={`flex items-center justify-between px-6 py-2 border-b border-white/10 ${glassStyles.panelSubtle}`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => handleAddHeading(1)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" /> H1
          </button>
          <button
            onClick={() => handleAddHeading(2)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" /> H2
          </button>
          <button
            onClick={() => handleAddHeading(3)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" /> H3
          </button>
          <button
            onClick={handleAddParagraph}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Add Paragraph"
          >
            <Plus className="w-4 h-4" /> Paragraph
          </button>
          <button
            onClick={handleAddTable}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" /> Table
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <button
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isSearchOpen ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-400/40' : 'text-slate-300 hover:bg-white/10'
            }`}
            title="Find & Replace"
          >
            <Search className="w-3.5 h-3.5" /> Find & Replace
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <button
            onClick={() => onAiPrompt?.('Summarize this document and extract top 3 action items', exportToMarkdown(model))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 hover:bg-indigo-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Ask AI
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
            <FileUp className="w-3.5 h-3.5" /> Import .md
            <input type="file" accept=".md,.markdown,.txt" onChange={handleImportMarkdown} className="hidden" />
          </label>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <FileDown className="w-3.5 h-3.5" /> Export .md
          </button>
        </div>
      </div>

      {/* Search and Replace Floating Bar */}
      {isSearchOpen && (
        <div className="px-6 py-2.5 bg-slate-900/90 border-b border-white/10 flex items-center gap-3 text-xs animate-in slide-in-from-top duration-150">
          <Search className="w-4 h-4 text-indigo-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find text..."
            className="bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1 text-white outline-none w-48"
          />
          <input
            type="text"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            placeholder="Replace with..."
            className="bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1 text-white outline-none w-48"
          />
          <button
            onClick={handleExecuteSearchReplace}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1"
          >
            <Check className="w-3.5 h-3.5" /> Replace All
          </button>
          {searchResultCount !== null && (
            <span className="text-indigo-300 text-[11px] font-mono">
              {searchResultCount > 0 ? `Replaced ${searchResultCount} occurrence(s)` : 'No matches found'}
            </span>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="ml-auto p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Outline Drawer */}
        <div className="w-64 border-r border-white/5 p-4 flex flex-col gap-3 bg-slate-950/20 hidden md:flex">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Document Outline</span>
          <div className="space-y-1 overflow-y-auto">
            {outline.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No headings yet</span>
            ) : (
              outline.map((item, idx) => (
                <div
                  key={idx}
                  className="text-xs text-slate-300 hover:text-white py-1 px-2 rounded hover:bg-white/5 cursor-pointer truncate"
                  style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                >
                  {item.title || 'Untitled'}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center Document Page */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center">
          <div className={`w-full max-w-3xl min-h-[850px] p-12 rounded-2xl ${glassStyles.panel} shadow-2xl relative flex flex-col gap-6`}>
            {/* Title Input */}
            <input
              type="text"
              value={model.metadata.title}
              onChange={(e) => {
                doc.setTitle(e.target.value);
                onUpdate();
              }}
              className="text-3xl font-bold bg-transparent border-none outline-none text-white tracking-tight placeholder-slate-500"
              placeholder="Document Title"
            />

            {/* Blocks */}
            <div className="space-y-4">
              {model.sections[0].blocks.map((block, idx) => {
                if (block.type === 'table') {
                  const tbl = block as TableBlock;
                  return (
                    <div key={block.id} className="group relative my-4 rounded-xl overflow-hidden border border-white/10">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-white/5 text-slate-300 font-medium">
                            {tbl.headers.map((h, hIdx) => (
                              <th key={hIdx} className="p-2.5 border-r border-b border-white/10">
                                <input
                                  type="text"
                                  value={h}
                                  onChange={(e) => {
                                    tbl.headers[hIdx] = e.target.value;
                                    onUpdate();
                                  }}
                                  className="w-full bg-transparent outline-none font-semibold text-slate-200"
                                />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {tbl.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-white/[0.02]">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-2.5 border-r border-b border-white/5">
                                  <input
                                    type="text"
                                    value={cell.inlines[0]?.text ?? ''}
                                    onChange={(e) => {
                                      cell.inlines[0] = { id: `i_${Date.now()}`, text: e.target.value };
                                      onUpdate();
                                    }}
                                    className="w-full bg-transparent outline-none text-slate-300"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="flex items-center justify-between p-2 bg-slate-950/60 border-t border-white/5 text-[11px] text-slate-400">
                        <button
                          onClick={() => {
                            doc.insertTableRow(0, idx, tbl.rows.length);
                            onUpdate();
                          }}
                          className="hover:text-indigo-400 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Row
                        </button>
                        <button
                          onClick={() => handleDeleteBlock(idx)}
                          className="text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete Table
                        </button>
                      </div>
                    </div>
                  );
                }

                const text = 'inlines' in block ? block.inlines.map((i) => i.text).join('') : '';

                return (
                  <div key={block.id} className="group relative flex items-start gap-2">
                    {block.type === 'heading' ? (
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => handleTextChange(0, idx, e.target.value)}
                        className={`w-full bg-transparent border-none outline-none font-bold text-white tracking-tight ${
                          (block as HeadingBlock).level === 1
                            ? 'text-2xl mt-4 mb-2 text-indigo-200'
                            : (block as HeadingBlock).level === 2
                            ? 'text-xl mt-3 mb-1 text-slate-200'
                            : 'text-lg mt-2 mb-1 text-slate-300'
                        }`}
                        placeholder="Heading..."
                      />
                    ) : (
                      <textarea
                        value={text}
                        onChange={(e) => handleTextChange(0, idx, e.target.value)}
                        rows={Math.max(1, Math.ceil(text.length / 70))}
                        className="w-full bg-transparent border-none outline-none text-slate-200 text-base leading-relaxed resize-none placeholder-slate-500"
                        placeholder="Write content..."
                      />
                    )}

                    <button
                      onClick={() => handleDeleteBlock(idx)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all"
                      title="Delete block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-6 py-2 border-t border-white/5 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>{stats.words} words</span>
          <span>{stats.characters} characters</span>
          <span>{stats.paragraphs} paragraphs</span>
          <span>~{stats.readingTimeMinutes} min read</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Local Autotrack Active</span>
        </div>
      </div>
    </div>
  );
};
