import React from 'react';
import { FormulaDebugger, DebuggerReport } from '@openhead/formula';
import { glassStyles } from '@openhead/ui';
import { Bug, X, CheckCircle, AlertTriangle, ListOrdered, Code } from 'lucide-react';

interface FormulaDebuggerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  formula: string;
  cellResolver: (addr: any) => any;
  rangeResolver: (rng: any) => any[][];
}

export const FormulaDebuggerDrawer: React.FC<FormulaDebuggerDrawerProps> = ({
  isOpen,
  onClose,
  formula,
  cellResolver,
  rangeResolver,
}) => {
  if (!isOpen || !formula) return null;

  let report: DebuggerReport | null = null;
  try {
    report = FormulaDebugger.trace(formula, cellResolver, rangeResolver);
  } catch (err: any) {
    // Parser error fallback
  }

  return (
    <div className="fixed right-0 top-14 bottom-0 w-[420px] z-40 bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
      <div className="space-y-4 overflow-y-auto pr-1">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-sm text-white">Formula Debugger & Inspector</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formula Display */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs text-indigo-300">
          <span className="text-slate-500 block text-[10px] uppercase font-sans font-semibold mb-1">Inspected Expression</span>
          {formula}
        </div>

        {report && (
          <>
            {/* Result & Diagnostics */}
            <div className={`p-3 rounded-xl border text-xs ${
              report.errorExplanation ? 'bg-red-500/10 border-red-400/30 text-red-200' : 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2 font-semibold mb-1">
                {report.errorExplanation ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />}
                <span>Final Output: {JSON.stringify(report.finalResult)}</span>
              </div>
              {report.errorExplanation && (
                <p className="text-[11px] text-red-300/90 leading-relaxed mt-1">{report.errorExplanation}</p>
              )}
            </div>

            {/* Referenced Cells */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Referenced Cells</span>
              <div className="flex flex-wrap gap-1.5">
                {report.referencedCells.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No cell dependencies</span>
                ) : (
                  report.referencedCells.map((ref, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-indigo-300">
                      {ref}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Evaluation Trace Steps */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Evaluation Trace</span>
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {report.steps.map((step) => (
                  <div key={step.stepIndex} className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs">
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-400">
                      <span>Step #{step.stepIndex}: {step.nodeType}</span>
                      <span className="text-indigo-300 font-semibold">{JSON.stringify(step.result)}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{step.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tokens Breakdown */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                <Code className="w-3.5 h-3.5" />
                <span>Token Stream</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/5 font-mono text-[10px] text-slate-400 max-h-24 overflow-y-auto leading-relaxed">
                {report.tokens.join(' → ')}
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={onClose}
        className={`w-full py-2 rounded-xl text-xs font-medium ${glassStyles.buttonSecondary}`}
      >
        Close Debugger
      </button>
    </div>
  );
};
