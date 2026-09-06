import React from 'react';
import { BaseDocumentMetadata, ProductType, StorageManager, CrashRecoveryLog } from '@openhead/core';
import { glassStyles } from '@openhead/ui';
import { FileText, Table, Presentation, Plus, Clock, AlertTriangle, Trash2, FolderOpen, Shield, LayoutTemplate } from 'lucide-react';

interface HomeScreenProps {
  recentDocs: BaseDocumentMetadata[];
  onNewDoc: (type: ProductType) => void;
  onOpenDoc: (id: string) => void;
  onDeleteDoc: (id: string) => void;
  onRecoverCrash: (recovery: CrashRecoveryLog) => void;
  onDismissRecovery: (docId: string) => void;
  onBrowseTemplates?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  recentDocs,
  onNewDoc,
  onOpenDoc,
  onDeleteDoc,
  onRecoverCrash,
  onDismissRecovery,
  onBrowseTemplates,
}) => {
  const [recoveries, setRecoveries] = React.useState<CrashRecoveryLog[]>([]);

  React.useEffect(() => {
    const storage = new StorageManager();
    setRecoveries(storage.listCrashRecoveries());
  }, []);

  const getProductIcon = (type: ProductType) => {
    switch (type) {
      case 'pen':
        return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'sum':
        return <Table className="w-5 h-5 text-emerald-400" />;
      case 'glimpse':
        return <Presentation className="w-5 h-5 text-amber-400" />;
    }
  };

  const getProductBadgeColor = (type: ProductType) => {
    switch (type) {
      case 'pen':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'sum':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'glimpse':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-8 overflow-y-auto bg-slate-950/60">
      <div className="w-full max-w-5xl space-y-10">
        {/* Welcome Header */}
        <div className="flex flex-col gap-2 pt-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-white tracking-tight">Openhead Office</h1>
            <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              <Shield className="w-3 h-3" /> 100% Local & Sovereign
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Free, open-source, privacy-first office productivity. Word-class documents, Excel-class spreadsheets, and PowerPoint-class presentations.
          </p>
        </div>

        {/* Crash Recovery Banner if any */}
        {recoveries.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Unsaved Work Recovered from Prior Session</span>
            </div>
            <div className="space-y-2">
              {recoveries.map((rec) => (
                <div key={rec.docId} className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5">
                  <div className="flex items-center gap-3">
                    {getProductIcon(rec.type)}
                    <div>
                      <span className="text-xs font-medium text-slate-200 block">{rec.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(rec.timestamp).toLocaleTimeString()} • {rec.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onRecoverCrash(rec);
                        setRecoveries((prev) => prev.filter((r) => r.docId !== rec.docId));
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
                    >
                      Restore Document
                    </button>
                    <button
                      onClick={() => {
                        onDismissRecovery(rec.docId);
                        setRecoveries((prev) => prev.filter((r) => r.docId !== rec.docId));
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-200"
                      title="Dismiss"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Document Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Create New</h2>
            {onBrowseTemplates && (
              <button
                onClick={onBrowseTemplates}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 hover:bg-indigo-500/20 transition-all"
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-indigo-400" />
                <span>Browse Template Library</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* New Pen */}
            <div
              onClick={() => onNewDoc('pen')}
              className={`p-6 rounded-2xl border cursor-pointer group transition-all flex flex-col justify-between h-44 hover:border-indigo-400/50 hover:shadow-xl hover:shadow-indigo-500/10 ${glassStyles.panelSubtle}`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 transition-colors" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors">Pen Document</h3>
                <p className="text-xs text-slate-400 mt-1">Word-class rich document processor with full DOCX compatibility.</p>
              </div>
            </div>

            {/* New Sum */}
            <div
              onClick={() => onNewDoc('sum')}
              className={`p-6 rounded-2xl border cursor-pointer group transition-all flex flex-col justify-between h-44 hover:border-emerald-400/50 hover:shadow-xl hover:shadow-emerald-500/10 ${glassStyles.panelSubtle}`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <Table className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-emerald-300 transition-colors" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white group-hover:text-emerald-300 transition-colors">Sum Workbook</h3>
                <p className="text-xs text-slate-400 mt-1">Excel-class spreadsheet with 90+ formulas, dynamic arrays, and XLSX fidelity.</p>
              </div>
            </div>

            {/* New Glimpse */}
            <div
              onClick={() => onNewDoc('glimpse')}
              className={`p-6 rounded-2xl border cursor-pointer group transition-all flex flex-col justify-between h-44 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/10 ${glassStyles.panelSubtle}`}
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <Presentation className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-amber-300 transition-colors" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white group-hover:text-amber-300 transition-colors">Glimpse Deck</h3>
                <p className="text-xs text-slate-400 mt-1">PowerPoint-class presentation editor with DrawingML scene graph and presenter mode.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Documents</h2>
            </div>
          </div>

          {recentDocs.length === 0 ? (
            <div className="p-10 rounded-2xl border border-white/5 bg-slate-900/20 text-center flex flex-col items-center justify-center gap-3">
              <FolderOpen className="w-8 h-8 text-slate-600" />
              <p className="text-xs text-slate-400">No recent documents found. Create a new Pen, Sum, or Glimpse file above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onOpenDoc(doc.id)}
                  className="p-4 rounded-xl border border-white/10 bg-slate-900/40 hover:bg-white/5 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {getProductIcon(doc.type)}
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-slate-200 block truncate group-hover:text-indigo-300 transition-colors">
                        {doc.title || 'Untitled Document'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(doc.updatedAt).toLocaleDateString()} at {new Date(doc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium uppercase ${getProductBadgeColor(doc.type)}`}>
                      {doc.type}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDoc(doc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
