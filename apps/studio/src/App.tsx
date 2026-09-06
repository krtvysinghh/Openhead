import React, { useState, useEffect, useRef } from 'react';
import { ProductType, StorageManager } from '@openhead/core';
import { PenDocument } from '@openhead/pen';
import { SumWorkbook } from '@openhead/sum';
import { GlimpseDeck } from '@openhead/glimpse';
import { CommandPalette, CommandItem, SettingsModal, RecentFilesModal, AppSettings, ShortcutsRegistry } from '@openhead/ui';
import { Header } from './components/Header';
import { PenView } from './views/PenView';
import { SumView } from './views/SumView';
import { GlimpseView } from './views/GlimpseView';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';

export const App: React.FC = () => {
  const [activeProduct, setActiveProduct] = useState<ProductType>('pen');
  const storageManager = useRef(new StorageManager()).current;
  const shortcutsRegistry = useRef(new ShortcutsRegistry()).current;

  const [settings, setSettings] = useState<AppSettings>({
    theme: 'glass-dark',
    autoSaveIntervalSec: 3,
    enableLocalAi: true,
    aiEndpoint: 'http://localhost:11434',
  });

  const [penDoc] = useState<PenDocument>(() => {
    const snap = storageManager.loadAutosaveSnapshot('pen');
    if (snap) return new PenDocument(snap);
    const doc = new PenDocument();
    doc.setTitle('Openhead Architecture & Engineering Guide');
    return doc;
  });

  const [sumWb] = useState<SumWorkbook>(() => {
    const snap = storageManager.loadAutosaveSnapshot('sum');
    if (snap) return new SumWorkbook(snap);
    const wb = new SumWorkbook();
    wb.setCellValue('A1', 'Category');
    wb.setCellValue('B1', 'Q1 Budget');
    wb.setCellValue('C1', 'Q2 Budget');
    wb.setCellValue('D1', 'Total');

    wb.setCellValue('A2', 'Engineering');
    wb.setCellValue('B2', 45000);
    wb.setCellValue('C2', 52000);
    wb.setCellValue('D2', '=SUM(B2:C2)');

    wb.setCellValue('A3', 'Infrastructure');
    wb.setCellValue('B3', 12000);
    wb.setCellValue('C3', 14500);
    wb.setCellValue('D3', '=SUM(B3:C3)');

    wb.setCellValue('A4', 'Total Expense');
    wb.setCellValue('B4', '=SUM(B2:B3)');
    wb.setCellValue('C4', '=SUM(C2:C3)');
    wb.setCellValue('D4', '=SUM(D2:D3)');

    return wb;
  });

  const [glimpseDeck] = useState<GlimpseDeck>(() => {
    const snap = storageManager.loadAutosaveSnapshot('glimpse');
    if (snap) return new GlimpseDeck(snap);
    return new GlimpseDeck();
  });

  const [, setVersion] = useState(0);
  const [isAutosaved, setIsAutosaved] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isRecentFilesOpen, setIsRecentFilesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiContext, setAiContext] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');

  const triggerUpdate = () => {
    setIsAutosaved(false);
    setVersion((v) => v + 1);
  };

  // Periodic Autosave
  useEffect(() => {
    if (settings.autoSaveIntervalSec <= 0) return;
    const timer = setInterval(() => {
      if (activeProduct === 'pen') storageManager.saveAutosaveSnapshot('pen', penDoc.getModel());
      else if (activeProduct === 'sum') storageManager.saveAutosaveSnapshot('sum', sumWb.getModel());
      else storageManager.saveAutosaveSnapshot('glimpse', glimpseDeck.getModel());
      setIsAutosaved(true);
    }, settings.autoSaveIntervalSec * 1000);

    return () => clearInterval(timer);
  }, [activeProduct, penDoc, sumWb, glimpseDeck, settings.autoSaveIntervalSec]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    shortcutsRegistry.register({
      id: 'save',
      keys: 'cmd+s',
      label: 'Save Document',
      description: 'Save active document to local storage',
      category: 'File',
      action: handleManualSave,
    });
    shortcutsRegistry.register({
      id: 'open',
      keys: 'cmd+o',
      label: 'Open Recent Files',
      description: 'Open recent files browser',
      category: 'File',
      action: () => setIsRecentFilesOpen(true),
    });
    shortcutsRegistry.register({
      id: 'command-palette',
      keys: 'cmd+k',
      label: 'Command Palette',
      description: 'Open global command palette',
      category: 'View',
      action: () => setIsCommandPaletteOpen(true),
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      shortcutsRegistry.handleKeyDown(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleManualSave = () => {
    if (activeProduct === 'pen') {
      storageManager.saveDocument(penDoc.getModel().metadata, penDoc.getModel());
    } else if (activeProduct === 'sum') {
      storageManager.saveDocument(sumWb.getModel().metadata, sumWb.getModel());
    } else {
      storageManager.saveDocument(glimpseDeck.getModel().metadata, glimpseDeck.getModel());
    }
    setIsAutosaved(true);
  };

  const handleOpenAiWithContext = (prompt: string, context: string) => {
    setAiPrompt(prompt);
    setAiContext(context);
    setIsAiOpen(true);
  };

  const commands: CommandItem[] = [
    {
      id: 'switch-pen',
      title: 'Switch to Pen Document Editor',
      category: 'Document',
      shortcut: 'Cmd+1',
      action: () => setActiveProduct('pen'),
    },
    {
      id: 'switch-sum',
      title: 'Switch to Sum Spreadsheet',
      category: 'Spreadsheet',
      shortcut: 'Cmd+2',
      action: () => setActiveProduct('sum'),
    },
    {
      id: 'switch-glimpse',
      title: 'Switch to Glimpse Presentations',
      category: 'Presentation',
      shortcut: 'Cmd+3',
      action: () => setActiveProduct('glimpse'),
    },
    {
      id: 'save-doc',
      title: 'Save Active Document',
      category: 'System',
      shortcut: 'Cmd+S',
      action: handleManualSave,
    },
    {
      id: 'recent-files',
      title: 'Open Recent Files Browser',
      category: 'System',
      shortcut: 'Cmd+O',
      action: () => setIsRecentFilesOpen(true),
    },
    {
      id: 'open-settings',
      title: 'Open Preferences & Settings',
      category: 'System',
      action: () => setIsSettingsOpen(true),
    },
    {
      id: 'open-ai',
      title: 'Open Local AI Copilot',
      category: 'AI Assistant',
      shortcut: 'Cmd+I',
      action: () => setIsAiOpen(true),
    },
  ];

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden ${settings.theme === 'glass-frost' ? 'bg-slate-900 text-slate-100' : ''}`}>
      <Header
        activeProduct={activeProduct}
        onSelectProduct={setActiveProduct}
        title={
          activeProduct === 'pen'
            ? penDoc.getModel().metadata.title
            : activeProduct === 'sum'
            ? sumWb.getModel().metadata.title
            : glimpseDeck.getModel().metadata.title
        }
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleAi={() => setIsAiOpen((prev) => !prev)}
        onOpenRecentFiles={() => setIsRecentFilesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onManualSave={handleManualSave}
        isAutosaved={isAutosaved}
        canUndo={true}
        canRedo={false}
        onUndo={() => {
          if (activeProduct === 'pen') penDoc.undo();
          else if (activeProduct === 'sum') sumWb.undo();
          else glimpseDeck.undo();
          triggerUpdate();
        }}
        onRedo={() => {
          if (activeProduct === 'pen') penDoc.redo();
          else if (activeProduct === 'sum') sumWb.redo();
          else glimpseDeck.redo();
          triggerUpdate();
        }}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {activeProduct === 'pen' && <PenView document={penDoc} onUpdate={triggerUpdate} onAiPrompt={handleOpenAiWithContext} />}
        {activeProduct === 'sum' && <SumView workbook={sumWb} onUpdate={triggerUpdate} onAiPrompt={handleOpenAiWithContext} />}
        {activeProduct === 'glimpse' && <GlimpseView deck={glimpseDeck} onUpdate={triggerUpdate} onAiPrompt={handleOpenAiWithContext} />}

        <AiAssistantDrawer
          isOpen={isAiOpen}
          onClose={() => setIsAiOpen(false)}
          initialPrompt={aiPrompt}
          context={aiContext}
        />
      </div>

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        commands={commands}
      />

      <RecentFilesModal
        isOpen={isRecentFilesOpen}
        onClose={() => setIsRecentFilesOpen(false)}
        documents={storageManager.listDocuments()}
        onOpenDocument={(id) => {
          const entry = storageManager.loadDocument(id);
          if (entry) {
            if (entry.metadata.type === 'pen') {
              penDoc.getModel().sections = entry.payload.sections;
              penDoc.setTitle(entry.metadata.title);
              setActiveProduct('pen');
            } else if (entry.metadata.type === 'sum') {
              sumWb.getModel().sheets = entry.payload.sheets;
              setActiveProduct('sum');
            } else if (entry.metadata.type === 'glimpse') {
              glimpseDeck.getModel().slides = entry.payload.slides;
              setActiveProduct('glimpse');
            }
            triggerUpdate();
          }
        }}
        onDeleteDocument={(id) => {
          storageManager.deleteDocument(id);
          triggerUpdate();
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
      />
    </div>
  );
};
