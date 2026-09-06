import React, { useState } from 'react';
import {
  GlimpseDeck,
  TextNode,
  ShapeNode,
  ShapeKind,
  SlideLayouts,
  AlignmentEngine,
  PptxAdapter,
} from '@openhead/glimpse';
import { glassStyles } from '@openhead/ui';
import {
  Plus,
  Play,
  Square,
  Circle,
  Type,
  Sparkles,
  Copy,
  Trash2,
  Sliders,
  Download,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table,
  BarChart2,
  FileText,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from 'lucide-react';

interface GlimpseViewProps {
  deck: GlimpseDeck;
  onUpdate: () => void;
  onAiPrompt?: (prompt: string, context: string) => void;
}

export const GlimpseView: React.FC<GlimpseViewProps> = ({ deck, onUpdate, onAiPrompt }) => {
  const model = deck.getModel();
  const activeSlide = deck.getActiveSlide();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPresenterMode, setIsPresenterMode] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [presenterTimer, setPresenterTimer] = useState<number>(0);
  const [showNotes, setShowNotes] = useState<boolean>(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState<boolean>(false);

  React.useEffect(() => {
    let timer: any;
    if (isPresenterMode) {
      setPresenterTimer(0);
      timer = setInterval(() => setPresenterTimer((t: number) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isPresenterMode]);

  // Keyboard navigation for Presenter Mode
  React.useEffect(() => {
    if (!isPresenterMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPresenterMode(false);
      } else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown' || e.key === 'Enter') {
        e.preventDefault();
        setCurrentSlideIndex((prev: number) => Math.min(model.slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentSlideIndex((prev: number) => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenterMode, model.slides.length]);

  const selectedNode = activeSlide.nodes.find((n) => n.id === selectedNodeId);

  const handleAddSlide = () => {
    deck.addSlide(`Slide ${model.slides.length + 1}`);
    onUpdate();
  };

  const handleAddLayout = (layoutType: string) => {
    switch (layoutType) {
      case 'title':
        deck.addSlideFromLayout(SlideLayouts.createTitleSlide('New Title Slide', 'Subtitle'));
        break;
      case 'content':
        deck.addSlideFromLayout(SlideLayouts.createTitleAndContent('Key Agenda & Takeaways'));
        break;
      case 'section':
        deck.addSlideFromLayout(SlideLayouts.createSectionHeader('Next Generation Section'));
        break;
      case 'compare':
        deck.addSlideFromLayout(SlideLayouts.createTwoColumnCompare('Comparative Evaluation'));
        break;
      case 'three-col':
        deck.addSlideFromLayout(SlideLayouts.createThreeColumnCards('Core Deliverables'));
        break;
      case 'kpi':
        deck.addSlideFromLayout(SlideLayouts.createExecutiveKpiDashboard('Executive Overview'));
        break;
      case 'table':
        deck.addSlideFromLayout(SlideLayouts.createTableSlide('Performance Metrics'));
        break;
      case 'chart':
        deck.addSlideFromLayout(SlideLayouts.createChartSlide('Growth Trajectory'));
        break;
      case 'blank':
        deck.addSlideFromLayout(SlideLayouts.createBlank());
        break;
    }
    setShowLayoutMenu(false);
    onUpdate();
  };

  const handleDuplicateSlide = () => {
    deck.duplicateSlide(activeSlide.id);
    onUpdate();
  };

  const handleAddText = () => {
    const node = deck.addTextNode({
      text: 'Editable Presentation Text',
      fontSize: 28,
      color: '#ffffff',
      align: 'left',
    });
    setSelectedNodeId(node.id);
    onUpdate();
  };

  const handleAddShape = (kind: ShapeKind) => {
    const node = deck.addShapeNode(kind, {
      fill: kind === 'card' ? 'rgba(255,255,255,0.08)' : '#3b82f6',
      stroke: 'rgba(255,255,255,0.2)',
      strokeWidth: 1,
    });
    setSelectedNodeId(node.id);
    onUpdate();
  };

  const handleAddTable = () => {
    const node = deck.addTableNode(3, 3);
    setSelectedNodeId(node.id);
    onUpdate();
  };

  const handleAddChart = () => {
    const node = deck.addChartNode('bar', ['Q1', 'Q2', 'Q3', 'Q4'], [{ name: 'Growth', data: [25, 45, 70, 95] }]);
    setSelectedNodeId(node.id);
    onUpdate();
  };

  const handleAlign = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => {
    const slideBounds = { x: 0, y: 0, width: 1920, height: 1080 };
    if (selectedNode) {
      const aligned = AlignmentEngine.alignNodes([selectedNode], alignment, slideBounds);
      deck.updateNode(selectedNode.id, { x: aligned[0].x, y: aligned[0].y });
      onUpdate();
    }
  };

  const handleDeleteSelectedNode = () => {
    if (selectedNodeId) {
      deck.deleteNode(selectedNodeId);
      setSelectedNodeId(null);
      onUpdate();
    }
  };

  const handleExportPptx = async () => {
    const buffer = await PptxAdapter.toBuffer(deck.getModel());
    const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.getModel().metadata.title || 'presentation'}.pptx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPptx = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const arrayBuf = evt.target?.result as ArrayBuffer;
      if (arrayBuf) {
        const imported = await PptxAdapter.fromBuffer(arrayBuf);
        Object.assign(deck.getModel(), imported);
        onUpdate();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string;
      if (dataUrl) {
        deck.addImageNode(dataUrl, {
          x: 300,
          y: 200,
          width: 640,
          height: 380,
          alt: file.name,
        });
        onUpdate();
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/40">
      {/* Ribbon Toolbar */}
      <div className={`flex items-center justify-between px-6 py-2 border-b border-white/10 ${glassStyles.panelSubtle}`}>
        <div className="flex items-center gap-2">
          {/* New Slide & Layout Dropdown */}
          <button
            onClick={handleAddSlide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> New Slide
          </button>
          <div className="relative">
            <button
              onClick={() => setShowLayoutMenu(!showLayoutMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            >
              Layouts
            </button>
            {showLayoutMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-white/15 rounded-xl shadow-2xl z-50 p-1 space-y-1 text-xs text-slate-200">
                <button onClick={() => handleAddLayout('title')} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10">Title Slide</button>
                <button onClick={() => handleAddLayout('content')} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10">Title & Content</button>
                <button onClick={() => handleAddLayout('section')} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10">Section Header</button>
                <button onClick={() => handleAddLayout('compare')} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10">Comparison Cards</button>
                <button onClick={() => handleAddLayout('three-col')} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10">Three Columns</button>
                <button onClick={() => handleAddLayout('kpi')} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10">Executive KPI</button>
                <button onClick={() => handleAddLayout('table')} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10">Data Table</button>
                <button onClick={() => handleAddLayout('chart')} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10">Analytics Chart</button>
                <button onClick={() => handleAddLayout('blank')} className="w-full text-left px-3 py-1.5 rounded hover:bg-white/10">Blank Slide</button>
              </div>
            )}
          </div>

          <button
            onClick={handleDuplicateSlide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Duplicate Slide"
          >
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Node Insertions */}
          <button onClick={handleAddText} className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white" title="Add Text Box">
            <Type className="w-4 h-4" />
          </button>
          <button onClick={() => handleAddShape('rectangle')} className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white" title="Add Rectangle">
            <Square className="w-4 h-4" />
          </button>
          <button onClick={() => handleAddShape('circle')} className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white" title="Add Circle">
            <Circle className="w-4 h-4" />
          </button>
          <button onClick={handleAddTable} className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white" title="Insert Table">
            <Table className="w-4 h-4" />
          </button>
          <button onClick={handleAddChart} className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white" title="Insert Chart">
            <BarChart2 className="w-4 h-4" />
          </button>
          <label className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer" title="Insert Image from Device">
            <ImageIcon className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Alignments */}
          <button onClick={() => handleAlign('left')} className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white" title="Align Left">
            <AlignLeft className="w-4 h-4" />
          </button>
          <button onClick={() => handleAlign('center')} className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white" title="Align Center">
            <AlignCenter className="w-4 h-4" />
          </button>
          <button onClick={() => handleAlign('right')} className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white" title="Align Right">
            <AlignRight className="w-4 h-4" />
          </button>

          {selectedNodeId && (
            <button onClick={handleDeleteSelectedNode} className="p-1.5 rounded-lg text-red-400 hover:bg-white/10 hover:text-red-300" title="Delete Selection">
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${showNotes ? 'bg-indigo-600/30 text-indigo-300' : 'text-slate-300 hover:bg-white/10'}`}
          >
            <FileText className="w-3.5 h-3.5" /> Speaker Notes
          </button>

          <button
            onClick={() => onAiPrompt?.('Generate 3 slide ideas for this deck', model.metadata.title)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 hover:bg-indigo-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Assistant
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* PPTX Import / Export */}
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Import PPTX
            <input type="file" accept=".pptx" onChange={handleImportPptx} className="hidden" />
          </label>
          <button
            onClick={handleExportPptx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10"
          >
            <Download className="w-3.5 h-3.5" /> Export PPTX
          </button>

          <button
            onClick={() => setIsPresenterMode(true)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium ${glassStyles.buttonPrimary}`}
          >
            <Play className="w-3.5 h-3.5" /> Present
          </button>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Thumbnails Strip */}
        <div className="w-56 border-r border-white/5 p-4 flex flex-col gap-3 bg-slate-950/20 overflow-y-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Slides</span>
          <div className="space-y-3">
            {model.slides.map((slide, idx) => (
              <div
                key={slide.id}
                onClick={() => {
                  deck.setActiveSlide(slide.id);
                  onUpdate();
                }}
                className={`group relative p-2 rounded-xl border cursor-pointer transition-all aspect-video flex flex-col justify-between ${
                  slide.id === activeSlide.id
                    ? 'border-indigo-400/60 bg-indigo-950/40 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-400/50'
                    : 'border-white/10 bg-slate-900/40 hover:border-white/20'
                } ${slide.hidden ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300 truncate">{slide.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deck.toggleSlideHidden(slide.id);
                      onUpdate();
                    }}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-400 hover:text-white transition-opacity"
                    title={slide.hidden ? 'Unhide Slide' : 'Hide Slide'}
                  >
                    {slide.hidden ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-500">{slide.hidden ? 'Hidden Slide' : `Slide ${idx + 1}`}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Presentation Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-8 flex items-center justify-center overflow-auto">
            <div
              className="relative rounded-2xl shadow-2xl overflow-hidden border border-white/10"
              style={{
                width: '800px',
                height: '450px',
                background: activeSlide.background || '#0f172a',
              }}
            >
              {activeSlide.nodes.map((node) => {
                const scale = 800 / 1920;
                const left = node.x * scale;
                const top = node.y * scale;
                const width = node.width * scale;
                const height = node.height * scale;
                const isSelected = selectedNodeId === node.id;

                if (node.type === 'text') {
                  const t = node as TextNode;
                  return (
                    <div
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(t.id);
                      }}
                      className={`absolute cursor-move select-none p-1 rounded transition-colors ${
                        isSelected ? 'ring-2 ring-indigo-400 bg-white/5' : 'hover:ring-1 hover:ring-indigo-400/40'
                      }`}
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        fontSize: `${(t.fontSize || 24) * scale}px`,
                        color: t.color || '#ffffff',
                        fontWeight: t.fontWeight || 'normal',
                        textAlign: t.align || 'left',
                        zIndex: t.zIndex,
                      }}
                    >
                      {t.text}
                    </div>
                  );
                }

                if (node.type === 'shape') {
                  const s = node as ShapeNode;
                  return (
                    <div
                      key={s.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(s.id);
                      }}
                      className={`absolute backdrop-blur-md cursor-move border transition-colors ${
                        isSelected ? 'ring-2 ring-indigo-400 border-indigo-400' : 'hover:border-indigo-400/60'
                      }`}
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                        background: s.fill,
                        borderColor: s.stroke || 'rgba(255,255,255,0.1)',
                        borderRadius: `${(s.cornerRadius || 8) * scale}px`,
                        zIndex: s.zIndex,
                      }}
                    />
                  );
                }

                if (node.type === 'image') {
                  const img = node as any;
                  return (
                    <div
                      key={img.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(img.id);
                      }}
                      className={`absolute cursor-move select-none p-1 rounded transition-all ${
                        isSelected ? 'ring-2 ring-indigo-400 bg-white/5' : 'hover:ring-1 hover:ring-indigo-400/40'
                      }`}
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                        zIndex: img.zIndex,
                      }}
                    >
                      <img
                        src={img.src}
                        alt={img.alt || 'Slide image'}
                        className="w-full h-full object-contain pointer-events-none rounded shadow-md"
                        style={{ opacity: img.opacity ?? 1 }}
                      />
                    </div>
                  );
                }

                if (node.type === 'table') {
                  const tbl = node as any;
                  return (
                    <div
                      key={tbl.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(tbl.id);
                      }}
                      className={`absolute overflow-auto cursor-move border border-white/10 rounded-lg bg-slate-900/80 backdrop-blur-md p-1 ${
                        isSelected ? 'ring-2 ring-indigo-400' : ''
                      }`}
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                        zIndex: tbl.zIndex,
                      }}
                    >
                      <table className="w-full h-full text-left border-collapse text-[10px]">
                        <tbody>
                          {(tbl.cells || []).map((row: any[], r: number) => (
                            <tr key={r}>
                              {row.map((c: any, ci: number) => (
                                <td
                                  key={c.id || ci}
                                  className={`p-1 border border-white/10 ${r === 0 && tbl.headerRow ? 'font-bold bg-white/10 text-white' : 'text-slate-300'}`}
                                >
                                  {c.text || ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                if (node.type === 'chart') {
                  const ch = node as any;
                  return (
                    <div
                      key={ch.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeId(ch.id);
                      }}
                      className={`absolute cursor-move border border-indigo-500/20 rounded-xl bg-slate-900/90 backdrop-blur-md p-2 flex flex-col justify-between ${
                        isSelected ? 'ring-2 ring-indigo-400' : ''
                      }`}
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                        zIndex: ch.zIndex,
                      }}
                    >
                      <span className="text-[11px] font-bold text-white truncate">{ch.title || ch.chartType?.toUpperCase() || 'CHART'}</span>
                      <div className="flex-1 flex items-end gap-1.5 pt-1 pb-1">
                        {(ch.series?.[0]?.data || [20, 50, 80, 40]).map((val: number, idx: number) => (
                          <div key={idx} className="flex-1 bg-indigo-500/80 rounded-t flex items-end justify-center" style={{ height: `${Math.min(100, val)}%` }}>
                            <span className="text-[8px] text-white/80">{ch.categories?.[idx] || ''}</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-[9px] text-slate-400 text-center truncate">{ch.series?.map((s: any) => s.name).join(', ')}</span>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* Bottom Speaker Notes Drawer */}
          {showNotes && (
            <div className="h-32 border-t border-white/10 bg-slate-900/60 p-3 flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Speaker Notes</span>
              <textarea
                value={activeSlide.notes || ''}
                onChange={(e) => {
                  deck.updateSlideNotes(activeSlide.id, e.target.value);
                  onUpdate();
                }}
                placeholder="Add private presenter cues, talking points and context..."
                className="flex-1 w-full bg-slate-950/50 border border-white/10 rounded-lg p-2 text-xs text-slate-200 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </div>
          )}
        </div>

        {/* Right Property Inspector */}
        {selectedNode && (
          <div className="w-64 border-l border-white/5 p-4 flex flex-col gap-4 bg-slate-950/20 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10 font-semibold text-slate-300">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Shape Inspector</span>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 font-medium">Position & Size</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500">X:</span>
                  <input
                    type="number"
                    value={selectedNode.x}
                    onChange={(e) => {
                      deck.updateNode(selectedNode.id, { x: Number(e.target.value) });
                      onUpdate();
                    }}
                    className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Y:</span>
                  <input
                    type="number"
                    value={selectedNode.y}
                    onChange={(e) => {
                      deck.updateNode(selectedNode.id, { y: Number(e.target.value) });
                      onUpdate();
                    }}
                    className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">W:</span>
                  <input
                    type="number"
                    value={selectedNode.width}
                    onChange={(e) => {
                      deck.updateNode(selectedNode.id, { width: Number(e.target.value) });
                      onUpdate();
                    }}
                    className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">H:</span>
                  <input
                    type="number"
                    value={selectedNode.height}
                    onChange={(e) => {
                      deck.updateNode(selectedNode.id, { height: Number(e.target.value) });
                      onUpdate();
                    }}
                    className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Text Node Specific Properties */}
            {selectedNode.type === 'text' && (
              <div className="space-y-2 border-t border-white/10 pt-3">
                <label className="text-slate-400 font-medium">Text Content & Style</label>
                <textarea
                  value={(selectedNode as TextNode).text || ''}
                  onChange={(e) => {
                    deck.updateNode(selectedNode.id, { text: e.target.value });
                    onUpdate();
                  }}
                  className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1.5 text-white resize-none text-xs"
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">Font Size:</span>
                    <input
                      type="number"
                      value={(selectedNode as TextNode).fontSize || 24}
                      onChange={(e) => {
                        deck.updateNode(selectedNode.id, { fontSize: Number(e.target.value) });
                        onUpdate();
                      }}
                      className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Color:</span>
                    <input
                      type="text"
                      value={(selectedNode as TextNode).color || '#ffffff'}
                      onChange={(e) => {
                        deck.updateNode(selectedNode.id, { color: e.target.value });
                        onUpdate();
                      }}
                      className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Shape Node Specific Properties */}
            {selectedNode.type === 'shape' && (
              <div className="space-y-2 border-t border-white/10 pt-3">
                <label className="text-slate-400 font-medium">Shape Style</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500">Fill:</span>
                    <input
                      type="text"
                      value={(selectedNode as ShapeNode).fill || ''}
                      onChange={(e) => {
                        deck.updateNode(selectedNode.id, { fill: e.target.value });
                        onUpdate();
                      }}
                      className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">Radius:</span>
                    <input
                      type="number"
                      value={(selectedNode as ShapeNode).cornerRadius || 8}
                      onChange={(e) => {
                        deck.updateNode(selectedNode.id, { cornerRadius: Number(e.target.value) });
                        onUpdate();
                      }}
                      className="w-full bg-slate-900 border border-white/10 rounded px-2 py-1 text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Presenter Mode Modal */}
      {isPresenterMode && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-8 animate-in fade-in duration-200">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-400">
                Openhead Presenter Mode — Slide {currentSlideIndex + 1} of {model.slides.length}
              </span>
              <span className="text-xs px-2.5 py-1 rounded bg-white/10 text-indigo-300 font-mono">
                ⏱ {Math.floor(presenterTimer / 60)}:{(presenterTimer % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={() => setIsPresenterMode(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium"
            >
              Exit (ESC)
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center gap-8 p-4">
            <div
              className="w-full max-w-4xl aspect-video rounded-xl shadow-2xl relative border border-white/10 overflow-hidden"
              style={{ background: model.slides[currentSlideIndex].background || '#0f172a' }}
            >
              {model.slides[currentSlideIndex].nodes.map((node) => {
                const presScale = 896 / 1920;
                const left = node.x * presScale;
                const top = node.y * presScale;
                const width = node.width * presScale;
                const height = node.height * presScale;

                if (node.type === 'text') {
                  const t = node as TextNode;
                  return (
                    <div
                      key={t.id}
                      className="absolute p-1 select-none"
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        fontSize: `${(t.fontSize || 24) * presScale}px`,
                        color: t.color || '#ffffff',
                        fontWeight: t.fontWeight || 'normal',
                        textAlign: t.align || 'left',
                        zIndex: t.zIndex,
                      }}
                    >
                      {t.text}
                    </div>
                  );
                }

                if (node.type === 'shape') {
                  const s = node as ShapeNode;
                  return (
                    <div
                      key={s.id}
                      className="absolute backdrop-blur-md border"
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                        background: s.fill,
                        borderColor: s.stroke || 'rgba(255,255,255,0.1)',
                        borderRadius: `${(s.cornerRadius || 8) * presScale}px`,
                        zIndex: s.zIndex,
                      }}
                    />
                  );
                }

                if (node.type === 'image') {
                  const img = node as any;
                  return (
                    <div
                      key={img.id}
                      className="absolute p-1 select-none"
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                        zIndex: img.zIndex,
                      }}
                    >
                      <img
                        src={img.src}
                        alt={img.alt || 'Slide image'}
                        className="w-full h-full object-contain pointer-events-none rounded shadow-md"
                        style={{ opacity: img.opacity ?? 1 }}
                      />
                    </div>
                  );
                }

                if (node.type === 'table') {
                  const tbl = node as any;
                  return (
                    <div
                      key={tbl.id}
                      className="absolute overflow-auto border border-white/10 rounded-lg bg-slate-900/80 backdrop-blur-md p-1"
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                        zIndex: tbl.zIndex,
                      }}
                    >
                      <table className="w-full h-full text-left border-collapse text-xs">
                        <tbody>
                          {(tbl.cells || []).map((row: any[], r: number) => (
                            <tr key={r}>
                              {row.map((c: any, ci: number) => (
                                <td
                                  key={c.id || ci}
                                  className={`p-1.5 border border-white/10 ${r === 0 && tbl.headerRow ? 'font-bold bg-white/10 text-white' : 'text-slate-300'}`}
                                >
                                  {c.text || ''}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                if (node.type === 'chart') {
                  const ch = node as any;
                  return (
                    <div
                      key={ch.id}
                      className="absolute border border-indigo-500/20 rounded-xl bg-slate-900/90 backdrop-blur-md p-3 flex flex-col justify-between"
                      style={{
                        left: `${left}px`,
                        top: `${top}px`,
                        width: `${width}px`,
                        height: `${height}px`,
                        zIndex: ch.zIndex,
                      }}
                    >
                      <span className="text-xs font-bold text-white truncate">{ch.title || ch.chartType?.toUpperCase() || 'CHART'}</span>
                      <div className="flex-1 flex items-end gap-2 pt-2 pb-1">
                        {(ch.series?.[0]?.data || [20, 50, 80, 40]).map((val: number, idx: number) => (
                          <div key={idx} className="flex-1 bg-indigo-500/80 rounded-t flex items-end justify-center" style={{ height: `${Math.min(100, val)}%` }}>
                            <span className="text-[9px] text-white/80">{ch.categories?.[idx] || ''}</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 text-center truncate">{ch.series?.map((s: any) => s.name).join(', ')}</span>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Presenter Notes Panel */}
            <div className="w-80 h-full max-h-[450px] bg-slate-900/80 border border-white/15 rounded-xl p-4 flex flex-col justify-between text-xs text-slate-300">
              <div>
                <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-2">Speaker Cues</span>
                <p className="text-slate-200 leading-relaxed">{model.slides[currentSlideIndex].notes || 'No speaker notes for this slide.'}</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <span className="text-slate-500 block mb-1">Next Slide:</span>
                <span className="text-slate-300 font-medium">
                  {currentSlideIndex + 1 < model.slides.length ? model.slides[currentSlideIndex + 1].title : 'End of Deck'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCurrentSlideIndex((prev: number) => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm disabled:opacity-30"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentSlideIndex((prev: number) => Math.min(model.slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === model.slides.length - 1}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
