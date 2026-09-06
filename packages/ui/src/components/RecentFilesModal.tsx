import React from 'react';
import { BaseDocumentMetadata } from '@openhead/core';
import { glassStyles } from '../theme';
import { FolderOpen, X, FileText, Table, Presentation, Trash2, Clock } from 'lucide-react';

interface RecentFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: BaseDocumentMetadata[];
  onOpenDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
}

export const RecentFilesModal: React.FC<RecentFilesModalProps> = ({
  isOpen,
  onClose,
  documents,
  onOpenDocument,
  onDeleteDocument,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className={`w-full max-w-xl ${glassStyles.modal} p-6 flex flex-col gap-4 shadow-2xl max-h-[80vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Saved Workspace Documents</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto space-y-2 max-h-96 pr-1">
          {documents.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No saved documents in your local workspace yet.
            </div>
          ) : (
            documents.map((doc) => {
              const icon =
                doc.type === 'pen' ? (
                  <FileText className="w-4 h-4 text-indigo-400" />
                ) : doc.type === 'sum' ? (
                  <Table className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Presentation className="w-4 h-4 text-amber-400" />
                );

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all text-xs"
                >
                  <div
                    onClick={() => {
                      onOpenDocument(doc.id);
                      onClose();
                    }}
                    className="flex items-center gap-3 cursor-pointer flex-1 truncate"
                  >
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">{icon}</div>
                    <div className="truncate">
                      <span className="font-semibold text-white block truncate">{doc.title}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> {new Date(doc.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
