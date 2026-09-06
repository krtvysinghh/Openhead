import React from 'react';
import { PenDocument, exportToMarkdown, Block, ParagraphBlock, HeadingBlock } from '@openhead/pen';
import { glassStyles } from '@openhead/ui';
import { Heading1, FileDown, Sparkles, Plus, Trash2 } from 'lucide-react';

interface PenViewProps {
  document: PenDocument;
  onUpdate: () => void;
  onAiPrompt?: (prompt: string, context: string) => void;
}

export const PenView: React.FC<PenViewProps> = ({ document: doc, onUpdate, onAiPrompt }) => {
  const model = doc.getModel();
  const stats = doc.getStats();
  const outline = doc.getOutline();

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
      inlines: [{ id: `inl_${Date.now()}`, text: 'New paragraph...' }],
    };
    doc.insertBlock(0, model.sections[0].blocks.length, newBlock);
    onUpdate();
  };

  const handleAddHeading = () => {
    const newBlock: HeadingBlock = {
      id: `blk_${Date.now()}`,
      type: 'heading',
      level: 2,
      inlines: [{ id: `inl_${Date.now()}`, text: 'Section Heading' }],
    };
    doc.insertBlock(0, model.sections[0].blocks.length, newBlock);
    onUpdate();
  };

  const handleDeleteBlock = (blockIdx: number) => {
    if (model.sections[0].blocks.length > 1) {
      doc.deleteBlock(0, blockIdx);
      onUpdate();
    }
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

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/40">
      <div className={`flex items-center justify-between px-6 py-2.5 border-b border-white/10 ${glassStyles.panelSubtle}`}>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAddHeading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            title="Add Heading"
          >
            <Heading1 className="w-4 h-4" /> Heading
          </button>
          <button
            onClick={handleAddParagraph}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            title="Add Paragraph"
          >
            <Plus className="w-4 h-4" /> Paragraph
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <button
            onClick={() => onAiPrompt?.('Summarize this document and extract top 3 action items', exportToMarkdown(model))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 hover:bg-indigo-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Ask AI
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <FileDown className="w-3.5 h-3.5" /> Export Markdown
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-white/5 p-4 flex flex-col gap-3 bg-slate-950/20 hidden md:flex">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Document Outline</span>
          <div className="space-y-1 overflow-y-auto">
            {outline.map((item, idx) => (
              <div
                key={idx}
                className="text-xs text-slate-300 hover:text-white py-1 px-2 rounded hover:bg-white/5 cursor-pointer truncate"
                style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
              >
                {item.title || 'Untitled'}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex justify-center">
          <div className={`w-full max-w-3xl min-h-[850px] p-12 rounded-2xl ${glassStyles.panel} shadow-2xl relative flex flex-col gap-6`}>
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

            <div className="space-y-4">
              {model.sections[0].blocks.map((block, idx) => {
                const text = 'inlines' in block ? block.inlines.map((i) => i.text).join('') : '';

                return (
                  <div
                    key={block.id}
                    className="group relative flex items-start gap-2"
                  >
                    {block.type === 'heading' ? (
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => handleTextChange(0, idx, e.target.value)}
                        className={`w-full bg-transparent border-none outline-none font-bold text-white tracking-tight ${
                          (block as HeadingBlock).level === 1
                            ? 'text-2xl mt-4 mb-2 text-indigo-200'
                            : 'text-xl mt-3 mb-1 text-slate-200'
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
