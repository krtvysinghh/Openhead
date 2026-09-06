import React, { useState } from 'react';
import {
  PenDocument,
  DocxAdapter,
  exportToMarkdown,
  importFromMarkdown,
  HeadingBlock,
  ListItemBlock,
  TableBlock,
  InlineText,
  InlineStyle,
} from '@openhead/pen';
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
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Undo2,
  Redo2,
  BookmarkPlus,
  Settings2,
  Image as ImageIcon,
} from 'lucide-react';

interface PenViewProps {
  document: PenDocument;
  onUpdate: () => void;
  onAiPrompt?: (prompt: string, context: string) => void;
}

export const PenView: React.FC<PenViewProps> = ({ document: doc, onUpdate, onAiPrompt }) => {
  const model = doc.getModel();
  const section = model.sections[0];
  const stats = doc.getStats();
  const outline = doc.getOutline();

  const [activeBlockIndex, setActiveBlockIndex] = useState<number>(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPageSetupOpen, setIsPageSetupOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [searchResultCount, setSearchResultCount] = useState<number | null>(null);

  // Selection formatting state
  const [fontFamily, setFontFamily] = useState('Calibri');
  const [fontSize, setFontSize] = useState(11);

  const handleKeyDownEditor = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        if (doc.canRedo) {
          doc.redo();
          onUpdate();
        }
      } else {
        if (doc.canUndo) {
          doc.undo();
          onUpdate();
        }
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      if (doc.canRedo) {
        doc.redo();
        onUpdate();
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      toggleInlineFormat({ bold: true });
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      toggleInlineFormat({ italic: true });
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault();
      toggleInlineFormat({ underline: true });
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      setIsSearchOpen(true);
      return;
    }
  };

  const toggleInlineFormat = (patch: Partial<InlineStyle>) => {
    const block = section.blocks[activeBlockIndex];
    if (block && 'inlines' in block && Array.isArray((block as any).inlines)) {
      const textLen = (block as any).inlines.map((i: InlineText) => i.text).join('').length;
      doc.formatInlineSelection(0, activeBlockIndex, 0, textLen, patch);
      onUpdate();
    }
  };

  const handleParagraphAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
    doc.setParagraphProperties(0, activeBlockIndex, { align });
    onUpdate();
  };

  const handleLineSpacing = (lineSpacing: number) => {
    doc.setParagraphProperties(0, activeBlockIndex, { lineSpacing });
    onUpdate();
  };

  const handleSetStyle = (styleId: string) => {
    doc.setBlockStyle(0, activeBlockIndex, styleId);
    onUpdate();
  };

  const handleAddParagraph = () => {
    doc.insertBlock(0, section.blocks.length, {
      id: `blk_${Date.now()}`,
      type: 'paragraph',
      inlines: [{ id: `inl_${Date.now()}`, text: 'Start typing here...' }],
      props: { styleId: 'Normal', lineSpacing: 1.15, spacingAfter: 6 },
    });
    setActiveBlockIndex(section.blocks.length - 1);
    onUpdate();
  };

  const handleAddHeading = (level: 1 | 2 | 3) => {
    doc.insertBlock(0, section.blocks.length, {
      id: `blk_${Date.now()}`,
      type: 'heading',
      level,
      inlines: [{ id: `inl_${Date.now()}`, text: `Heading ${level}` }],
      props: { styleId: `Heading${level}` },
    });
    setActiveBlockIndex(section.blocks.length - 1);
    onUpdate();
  };

  const handleAddList = (type: 'bullet-list-item' | 'numbered-list-item') => {
    doc.insertBlock(0, section.blocks.length, {
      id: `blk_${Date.now()}`,
      type,
      level: 0,
      inlines: [{ id: `inl_${Date.now()}`, text: 'List item' }],
    });
    setActiveBlockIndex(section.blocks.length - 1);
    onUpdate();
  };

  const handleAddTable = () => {
    doc.insertTable(0, section.blocks.length, 3, 3);
    setActiveBlockIndex(section.blocks.length - 1);
    onUpdate();
  };

  const handleAddFootnote = () => {
    const fnText = window.prompt('Enter Footnote Citation:');
    if (fnText) {
      doc.insertFootnote(0, activeBlockIndex, 0, fnText);
      onUpdate();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        doc.addImage(dataUrl, file.name);
        setActiveBlockIndex(section.blocks.length - 1);
        onUpdate();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeleteBlock = (blockIdx: number) => {
    if (section.blocks.length > 1) {
      doc.deleteBlock(0, blockIdx);
      setActiveBlockIndex(Math.max(0, blockIdx - 1));
      onUpdate();
    }
  };

  const handleExecuteSearchReplace = () => {
    if (!searchQuery) return;
    const count = doc.searchAndReplace(searchQuery, replaceQuery);
    setSearchResultCount(count);
    onUpdate();
  };

  const handleExportDocx = async () => {
    const buffer = await DocxAdapter.toBuffer(model);
    const blob = new Blob([buffer as any], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${model.metadata.title.toLowerCase().replace(/\s+/g, '_')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const importedModel = await DocxAdapter.fromBuffer(arrayBuffer);
    model.metadata.title = importedModel.metadata.title;
    model.sections = importedModel.sections;
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
    <div
      className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/40"
      onKeyDown={handleKeyDownEditor}
      tabIndex={0}
    >
      {/* Ribbon Toolbar */}
      <div className={`flex items-center justify-between px-6 py-2 border-b border-white/10 ${glassStyles.panelSubtle} flex-wrap gap-2`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Undo / Redo */}
          <button
            onClick={() => {
              if (doc.canUndo) {
                doc.undo();
                onUpdate();
              }
            }}
            disabled={!doc.canUndo}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              doc.canUndo ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-600 cursor-not-allowed opacity-50'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (doc.canRedo) {
                doc.redo();
                onUpdate();
              }
            }}
            disabled={!doc.canRedo}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              doc.canRedo ? 'text-slate-300 hover:bg-white/10 hover:text-white' : 'text-slate-600 cursor-not-allowed opacity-50'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Styles Selector */}
          <select
            onChange={(e) => handleSetStyle(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none hover:border-white/20"
            title="Apply Style"
          >
            <option value="Normal">Normal</option>
            <option value="Title">Title</option>
            <option value="Subtitle">Subtitle</option>
            <option value="Heading1">Heading 1</option>
            <option value="Heading2">Heading 2</option>
            <option value="Heading3">Heading 3</option>
            <option value="Quote">Quote</option>
          </select>

          {/* Font Family */}
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              toggleInlineFormat({ fontFamily: e.target.value });
            }}
            className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none hover:border-white/20"
            title="Font Family"
          >
            <option value="Calibri">Calibri</option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Consolas">Consolas</option>
          </select>

          {/* Font Size */}
          <select
            value={fontSize}
            onChange={(e) => {
              const sz = parseInt(e.target.value, 10);
              setFontSize(sz);
              toggleInlineFormat({ fontSize: sz });
            }}
            className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none hover:border-white/20"
            title="Font Size"
          >
            <option value="9">9 pt</option>
            <option value="10">10 pt</option>
            <option value="11">11 pt</option>
            <option value="12">12 pt</option>
            <option value="14">14 pt</option>
            <option value="16">16 pt</option>
            <option value="18">18 pt</option>
            <option value="20">20 pt</option>
            <option value="24">24 pt</option>
          </select>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Inline Formats */}
          <button
            onClick={() => toggleInlineFormat({ bold: true })}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleInlineFormat({ italic: true })}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleInlineFormat({ underline: true })}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-4 h-4" />
          </button>
          <button
            onClick={() => toggleInlineFormat({ strikethrough: true })}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Alignment */}
          <button
            onClick={() => handleParagraphAlign('left')}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleParagraphAlign('center')}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleParagraphAlign('right')}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleParagraphAlign('justify')}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
          </button>

          {/* Line spacing */}
          <select
            onChange={(e) => handleLineSpacing(parseFloat(e.target.value))}
            defaultValue="1.15"
            className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none hover:border-white/20"
            title="Line Spacing"
          >
            <option value="1.0">1.0</option>
            <option value="1.15">1.15</option>
            <option value="1.5">1.5</option>
            <option value="2.0">2.0</option>
          </select>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Lists */}
          <button
            onClick={() => handleAddList('bullet-list-item')}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAddList('numbered-list-item')}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              doc.indentListItem(0, activeBlockIndex);
              onUpdate();
            }}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Indent"
          >
            <Indent className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              doc.outdentListItem(0, activeBlockIndex);
              onUpdate();
            }}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Outdent"
          >
            <Outdent className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Block Inserts */}
          <button
            onClick={handleAddParagraph}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Add Paragraph"
          >
            <Plus className="w-3.5 h-3.5" /> P
          </button>
          <button
            onClick={() => handleAddHeading(1)}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAddHeading(2)}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAddHeading(3)}
            className="p-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleAddTable}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4 text-emerald-400" /> Table
          </button>
          <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer" title="Insert Image from Device">
            <ImageIcon className="w-4 h-4 text-purple-400" /> Image
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          <button
            onClick={handleAddFootnote}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Insert Footnote"
          >
            <BookmarkPlus className="w-4 h-4 text-amber-400" /> Footnote
          </button>
          <button
            onClick={() => setIsPageSetupOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Page Setup"
          >
            <Settings2 className="w-4 h-4 text-cyan-400" /> Page Setup
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <button
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isSearchOpen
                ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-400/40'
                : 'text-slate-300 hover:bg-white/10'
            }`}
            title="Find & Replace"
          >
            <Search className="w-3.5 h-3.5" /> Find
          </button>

          <button
            onClick={() =>
              onAiPrompt?.('Summarize this document and suggest improvements', exportToMarkdown(model))
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 hover:bg-indigo-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI
          </button>
        </div>

        {/* DOCX and Markdown Exporters */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
            <FileUp className="w-3.5 h-3.5 text-blue-400" /> Import DOCX
            <input type="file" accept=".docx" onChange={handleImportDocx} className="hidden" />
          </label>
          <button
            onClick={handleExportDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-blue-600/20 border border-blue-400/30 hover:bg-blue-600/30 transition-all"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-400" /> Export DOCX
          </button>
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
            <FileUp className="w-3.5 h-3.5" /> .md
            <input type="file" accept=".md,.markdown,.txt" onChange={handleImportMarkdown} className="hidden" />
          </label>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <FileDown className="w-3.5 h-3.5" /> .md
          </button>
        </div>
      </div>

      {/* Find & Replace Floating Drawer */}
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

      {/* Page Setup Modal */}
      {isPageSetupOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md p-6 rounded-2xl ${glassStyles.panel} shadow-2xl flex flex-col gap-4 border border-white/10`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-cyan-400" /> Page Setup & Margins
              </h3>
              <button onClick={() => setIsPageSetupOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <label className="block mb-1 font-medium">Page Orientation</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="orientation"
                      value="portrait"
                      checked={section.pageSettings.orientation === 'portrait'}
                      onChange={() => {
                        doc.setPageSettings(0, { orientation: 'portrait' });
                        onUpdate();
                      }}
                    />
                    Portrait (Vertical)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="orientation"
                      value="landscape"
                      checked={section.pageSettings.orientation === 'landscape'}
                      onChange={() => {
                        doc.setPageSettings(0, { orientation: 'landscape' });
                        onUpdate();
                      }}
                    />
                    Landscape (Horizontal)
                  </label>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Columns Layout</label>
                <div className="flex gap-3">
                  {[1, 2, 3].map((cols) => (
                    <button
                      key={cols}
                      type="button"
                      onClick={() => {
                        doc.setPageSettings(0, { columns: cols });
                        onUpdate();
                      }}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        (section.pageSettings.columns || 1) === cols
                          ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cols} {cols === 1 ? 'Column' : 'Columns'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium">Document Watermark</label>
                <select
                  value={section.pageSettings.watermark || ''}
                  onChange={(e) => {
                    doc.setWatermark(e.target.value || undefined);
                    onUpdate();
                  }}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none"
                >
                  <option value="">None (No Watermark)</option>
                  <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="TOP SECRET">TOP SECRET</option>
                  <option value="URGENT">URGENT</option>
                  <option value="DO NOT COPY">DO NOT COPY</option>
                  <option value="SAMPLE">SAMPLE</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">Header Text</label>
                <input
                  type="text"
                  value={section.pageSettings.headerText || ''}
                  onChange={(e) => {
                    doc.setPageSettings(0, { headerText: e.target.value });
                    onUpdate();
                  }}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none"
                  placeholder="Document Header"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Footer Text</label>
                <input
                  type="text"
                  value={section.pageSettings.footerText || ''}
                  onChange={(e) => {
                    doc.setPageSettings(0, { footerText: e.target.value });
                    onUpdate();
                  }}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white outline-none"
                  placeholder="Document Footer"
                />
              </div>
            </div>
            <button
              onClick={() => setIsPageSetupOpen(false)}
              className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs self-end"
            >
              Done
            </button>
          </div>
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
                  onClick={() => setActiveBlockIndex(item.blockIndex)}
                  className={`text-xs py-1 px-2 rounded cursor-pointer truncate transition-all ${
                    activeBlockIndex === item.blockIndex
                      ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                  style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                >
                  {item.title || 'Untitled'}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center Document Page Canvas */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center">
          <div
            className={`w-full ${
              section.pageSettings.orientation === 'landscape' ? 'max-w-5xl' : 'max-w-3xl'
            } min-h-[900px] p-12 rounded-2xl ${glassStyles.panel} shadow-2xl relative flex flex-col gap-6`}
          >
            {/* Watermark Overlay */}
            {section.pageSettings.watermark && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                <span className="text-8xl font-black uppercase tracking-widest transform -rotate-45 opacity-[0.06] text-white">
                  {section.pageSettings.watermark}
                </span>
              </div>
            )}

            {/* Header Display */}
            {section.pageSettings.headerText && (
              <div className="text-xs text-slate-400 border-b border-white/10 pb-2 flex justify-between font-mono">
                <span>{section.pageSettings.headerText}</span>
                <span>Openhead Document</span>
              </div>
            )}

            {/* Title Input */}
            <input
              type="text"
              value={model.metadata.title}
              onChange={(e) => {
                doc.setTitle(e.target.value);
                onUpdate();
              }}
              className="text-3xl font-bold bg-transparent border-none outline-none text-white tracking-tight placeholder-slate-500 z-10"
              placeholder="Document Title"
            />

            {/* Blocks Stream */}
            <div
              className="space-y-4 z-10"
              style={{
                columnCount: section.pageSettings.columns && section.pageSettings.columns > 1 ? section.pageSettings.columns : 1,
                columnGap: '2rem',
              }}
            >
              {section.blocks.map((block, idx) => {
                const isActive = activeBlockIndex === idx;

                if (block.type === 'image') {
                  const img = block as any;
                  return (
                    <div
                      key={block.id}
                      onClick={() => setActiveBlockIndex(idx)}
                      className={`group relative my-4 rounded-xl overflow-hidden border p-2 flex flex-col items-center gap-2 transition-all ${
                        isActive ? 'border-indigo-400/50 ring-1 ring-indigo-400/30' : 'border-white/10'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.caption || 'Document image'}
                        style={{ maxWidth: '100%', maxHeight: '450px' }}
                        className="rounded-lg object-contain"
                      />
                      <input
                        type="text"
                        value={img.caption || ''}
                        onChange={(e) => {
                          img.caption = e.target.value;
                          onUpdate();
                        }}
                        placeholder="Image caption..."
                        className="text-center text-xs text-slate-400 bg-transparent outline-none border-b border-transparent hover:border-white/10 w-3/4"
                      />
                      <button
                        onClick={() => handleDeleteBlock(idx)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-all"
                        title="Delete image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                if (block.type === 'table') {
                  const tbl = block as TableBlock;
                  return (
                    <div
                      key={block.id}
                      onClick={() => setActiveBlockIndex(idx)}
                      className={`group relative my-4 rounded-xl overflow-hidden border transition-all ${
                        isActive ? 'border-indigo-400/50 ring-1 ring-indigo-400/30' : 'border-white/10'
                      }`}
                    >
                      <table className="w-full text-xs text-left border-collapse">
                        {tbl.headers && tbl.headers.length > 0 && (
                          <thead>
                            <tr className="bg-white/5 text-slate-300 font-medium">
                              {tbl.headers.map((h, hIdx) => (
                                <th key={hIdx} className="p-2.5 border-r border-b border-white/10">
                                  <input
                                    type="text"
                                    value={h}
                                    onChange={(e) => {
                                      if (tbl.headers) tbl.headers[hIdx] = e.target.value;
                                      onUpdate();
                                    }}
                                    className="w-full bg-transparent outline-none font-semibold text-slate-200"
                                  />
                                </th>
                              ))}
                            </tr>
                          </thead>
                        )}
                        <tbody>
                          {tbl.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-white/[0.02]">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  colSpan={cell.gridSpan || 1}
                                  style={{
                                    backgroundColor: cell.background ? cell.background : undefined,
                                  }}
                                  className="p-2.5 border-r border-b border-white/5"
                                >
                                  <input
                                    type="text"
                                    value={cell.inlines[0]?.text ?? ''}
                                    onChange={(e) => {
                                      cell.inlines[0] = {
                                        id: `i_${Date.now()}`,
                                        text: e.target.value,
                                        styles: cell.inlines[0]?.styles,
                                      };
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
                        <div className="flex gap-3">
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
                            onClick={() => {
                              doc.insertTableCol(0, idx);
                              onUpdate();
                            }}
                            className="hover:text-indigo-400 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Column
                          </button>
                        </div>
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

                if (block.type === 'bullet-list-item' || block.type === 'numbered-list-item') {
                  const listBlock = block as ListItemBlock;
                  const text = listBlock.inlines.map((i) => i.text).join('');
                  return (
                    <div
                      key={block.id}
                      onClick={() => setActiveBlockIndex(idx)}
                      className={`group relative flex items-center gap-2 ${
                        isActive ? 'ring-1 ring-indigo-400/20 rounded p-1' : ''
                      }`}
                      style={{ paddingLeft: `${(listBlock.level || 0) * 20}px` }}
                    >
                      <span className="text-indigo-400 font-bold select-none text-xs">
                        {listBlock.type === 'bullet-list-item' ? '•' : `${idx + 1}.`}
                      </span>
                      <input
                        type="text"
                        value={text}
                        onChange={(e) => {
                          listBlock.inlines[0] = {
                            id: `inl_${Date.now()}`,
                            text: e.target.value,
                            styles: listBlock.inlines[0]?.styles,
                          };
                          onUpdate();
                        }}
                        className="w-full bg-transparent border-none outline-none text-slate-200 text-sm"
                      />
                      <button
                        onClick={() => handleDeleteBlock(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                }

                const text = 'inlines' in block ? (block as any).inlines.map((i: InlineText) => i.text).join('') : '';
                const blockProps = (block as any).props || {};
                const inlineStyle = (block as any).inlines?.[0]?.styles || {};

                return (
                  <div
                    key={block.id}
                    onClick={() => setActiveBlockIndex(idx)}
                        className={`group relative flex items-start gap-2 ${
                          isActive ? 'ring-1 ring-indigo-400/20 rounded p-1.5' : ''
                        }`}
                      >
                        {block.type === 'heading' ? (
                          <input
                            type="text"
                            value={text}
                            onChange={(e) => {
                              (block as any).inlines[0] = {
                                id: `inl_${Date.now()}`,
                                text: e.target.value,
                                styles: (block as any).inlines[0]?.styles,
                              };
                              onUpdate();
                            }}
                            style={{
                              textAlign: blockProps.align || 'left',
                              fontWeight: inlineStyle.bold !== false ? 'bold' : 'normal',
                              fontStyle: inlineStyle.italic ? 'italic' : 'normal',
                              textDecoration: inlineStyle.underline ? 'underline' : inlineStyle.strikethrough ? 'line-through' : 'none',
                              color: inlineStyle.fontColor || undefined,
                              fontFamily: inlineStyle.fontFamily || undefined,
                            }}
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
                            onChange={(e) => {
                              (block as any).inlines[0] = {
                                id: `inl_${Date.now()}`,
                                text: e.target.value,
                                styles: (block as any).inlines[0]?.styles,
                              };
                              onUpdate();
                            }}
                            rows={Math.max(1, Math.ceil(text.length / 70))}
                            style={{
                              textAlign: blockProps.align || 'left',
                              lineHeight: blockProps.lineSpacing ? `${blockProps.lineSpacing}` : '1.6',
                              fontWeight: inlineStyle.bold ? 'bold' : 'normal',
                              fontStyle: inlineStyle.italic ? 'italic' : 'normal',
                              textDecoration: inlineStyle.underline ? 'underline' : inlineStyle.strikethrough ? 'line-through' : 'none',
                              color: inlineStyle.fontColor || undefined,
                              fontFamily: inlineStyle.fontFamily || undefined,
                              fontSize: inlineStyle.fontSize ? `${inlineStyle.fontSize}pt` : undefined,
                            }}
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

            {/* Footnotes Display at document bottom */}
            {section.footnotes && section.footnotes.length > 0 && (
              <div className="mt-12 pt-4 border-t border-white/10 space-y-2 text-xs text-slate-400 font-mono">
                <div className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Footnotes</div>
                {section.footnotes.map((fn) => (
                  <div key={fn.id} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">[{fn.index}]</span>
                    <span>{fn.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Display */}
            {section.pageSettings.footerText && (
              <div className="mt-8 text-xs text-slate-500 border-t border-white/5 pt-3 flex justify-between font-mono">
                <span>{section.pageSettings.footerText}</span>
                <span>Page 1 of {stats.estimatedPages}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="px-6 py-2 border-t border-white/5 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>{stats.words} words</span>
          <span>{stats.characters} characters</span>
          <span>{stats.paragraphs} paragraphs</span>
          <span>~{stats.readingTimeMinutes} min read</span>
          <span>{section.pageSettings.pageSize} ({section.pageSettings.orientation})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Local Engine Ready</span>
        </div>
      </div>
    </div>
  );
};
