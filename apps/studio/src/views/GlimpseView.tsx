import React, { useState } from 'react';
import { GlimpseDeck, TextNode, ShapeNode } from '@openhead/glimpse';
import { glassStyles } from '@openhead/ui';
import { Plus, Play, Square, Circle, Type, Sparkles } from 'lucide-react';

interface GlimpseViewProps {
  deck: GlimpseDeck;
  onUpdate: () => void;
  onAiPrompt?: (prompt: string, context: string) => void;
}

export const GlimpseView: React.FC<GlimpseViewProps> = ({ deck, onUpdate, onAiPrompt }) => {
  const model = deck.getModel();
  const activeSlide = deck.getActiveSlide();
  const [isPresenterMode, setIsPresenterMode] = useState<boolean>(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  const handleAddSlide = () => {
    deck.addSlide(`Slide ${model.slides.length + 1}`);
    onUpdate();
  };

  const handleAddText = () => {
    const node: TextNode = {
      id: `node_${Date.now()}`,
      type: 'text',
      x: 200,
      y: 200,
      width: 400,
      height: 60,
      text: 'Editable presentation text',
      fontSize: 24,
      color: '#ffffff',
      align: 'left',
      zIndex: 5,
    };
    deck.addNode(node);
    onUpdate();
  };

  const handleAddShape = (kind: 'rectangle' | 'circle' | 'card') => {
    const node: ShapeNode = {
      id: `node_${Date.now()}`,
      type: 'shape',
      kind,
      x: 300,
      y: 300,
      width: 280,
      height: 180,
      fill: kind === 'card' ? 'rgba(255,255,255,0.08)' : 'rgba(99, 102, 241, 0.4)',
      stroke: 'rgba(255,255,255,0.2)',
      strokeWidth: 1,
      cornerRadius: 12,
      zIndex: 4,
    };
    deck.addNode(node);
    onUpdate();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/40">
      <div className={`flex items-center justify-between px-6 py-2.5 border-b border-white/10 ${glassStyles.panelSubtle}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddSlide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> New Slide
          </button>
          <div className="w-[1px] h-4 bg-white/10 mx-1" />
          <button
            onClick={handleAddText}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
            title="Add Text Box"
          >
            <Type className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAddShape('rectangle')}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
            title="Add Rectangle"
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAddShape('card')}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 hover:text-white"
            title="Add Glass Card"
          >
            <Circle className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <button
            onClick={() => onAiPrompt?.('Generate 3 slide ideas for this deck', model.metadata.title)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 hover:bg-indigo-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Design Assistant
          </button>
        </div>

        <button
          onClick={() => setIsPresenterMode(true)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium ${glassStyles.buttonPrimary}`}
        >
          <Play className="w-3.5 h-3.5" /> Present
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
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
                className={`p-2 rounded-xl border cursor-pointer transition-all aspect-video flex flex-col justify-between ${
                  slide.id === activeSlide.id
                    ? 'border-indigo-400/60 bg-indigo-950/40 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-400/50'
                    : 'border-white/10 bg-slate-900/40 hover:border-white/20'
                }`}
              >
                <span className="text-xs font-medium text-slate-300 truncate">{slide.title}</span>
                <span className="text-[10px] text-slate-500">Slide {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

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

              if (node.type === 'text') {
                const t = node as TextNode;
                return (
                  <div
                    key={t.id}
                    className="absolute cursor-move select-none p-1 border border-transparent hover:border-indigo-400/40 rounded transition-colors"
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      fontSize: `${t.fontSize * scale}px`,
                      color: t.color,
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
                    className="absolute backdrop-blur-md cursor-move border hover:border-indigo-400/60 transition-colors"
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

              return null;
            })}
          </div>
        </div>
      </div>

      {isPresenterMode && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-8 animate-in fade-in duration-200">
          <div className="flex justify-between items-center text-white">
            <span className="text-sm font-medium text-slate-400">
              Openhead Presenter Mode — Slide {currentSlideIndex + 1} of {model.slides.length}
            </span>
            <button
              onClick={() => setIsPresenterMode(false)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium"
            >
              Exit (ESC)
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div
              className="w-full max-w-5xl aspect-video rounded-xl shadow-2xl p-8 relative flex items-center justify-center border border-white/10"
              style={{ background: model.slides[currentSlideIndex].background }}
            >
              <h1 className="text-4xl font-bold text-white tracking-tight">{model.slides[currentSlideIndex].title}</h1>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm disabled:opacity-30"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.min(model.slides.length - 1, prev + 1))}
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
