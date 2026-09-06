import React, { useState, useEffect, useRef } from 'react';
import { ProductType, StorageManager, CrashRecoveryLog, SettingsManager, CommandRegistry } from '@openhead/core';
import { PenDocument } from '@openhead/pen';
import { SumWorkbook } from '@openhead/sum';
import { GlimpseDeck } from '@openhead/glimpse';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { PenView } from './views/PenView';
import { SumView } from './views/SumView';
import { GlimpseView } from './views/GlimpseView';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { SettingsModal } from './components/SettingsModal';
import { UnifiedSearchModal } from './components/UnifiedSearchModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';

export const App: React.FC = () => {
  const [activeProduct, setActiveProduct] = useState<ProductType | 'home'>('home');
  const storageManager = useRef(new StorageManager()).current;

  const [penDoc] = useState<PenDocument>(() => {
    const snap = storageManager.loadAutosaveSnapshot('pen');
    if (snap) return new PenDocument(snap);
    const doc = new PenDocument();
    doc.setTitle('Openhead Document');
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiContext, setAiContext] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');

  const triggerUpdate = () => {
    setIsAutosaved(false);
    setVersion((v) => v + 1);
  };

  // Register Core Commands in CommandRegistry
  useEffect(() => {
    CommandRegistry.register({
      id: 'app.home',
      label: 'Go to Openhead Home',
      category: 'file',
      execute: () => setActiveProduct('home'),
    });
    CommandRegistry.register({
      id: 'app.switch.pen',
      label: 'Switch to Pen Document Editor',
      category: 'file',
      shortcut: 'Ctrl+1',
      execute: () => setActiveProduct('pen'),
    });
    CommandRegistry.register({
      id: 'app.switch.sum',
      label: 'Switch to Sum Spreadsheet',
      category: 'file',
      shortcut: 'Ctrl+2',
      execute: () => setActiveProduct('sum'),
    });
    CommandRegistry.register({
      id: 'app.switch.glimpse',
      label: 'Switch to Glimpse Presentations',
      category: 'file',
      shortcut: 'Ctrl+3',
      execute: () => setActiveProduct('glimpse'),
    });
    CommandRegistry.register({
      id: 'file.save',
      label: 'Save Active Document',
      category: 'file',
      shortcut: 'Ctrl+S',
      execute: handleManualSave,
    });
    CommandRegistry.register({
      id: 'view.search',
      label: 'Search Document Contents',
      category: 'view',
      shortcut: 'Ctrl+F',
      execute: () => setIsSearchOpen(true),
    });
    CommandRegistry.register({
      id: 'view.settings',
      label: 'Preferences & Settings',
      category: 'tools',
      shortcut: 'Ctrl+,',
      execute: () => setIsSettingsOpen(true),
    });
    CommandRegistry.register({
      id: 'ai.toggle',
      label: 'Toggle Local AI Assistant',
      category: 'ai',
      shortcut: 'Ctrl+I',
      execute: () => setIsAiOpen((prev) => !prev),
    });
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleManualSave();
      } else if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeProduct]);

  // Periodic Autosave
  useEffect(() => {
    const settings = SettingsManager.get();
    if (!settings.fileHandling.autosaveEnabled) return;

    const timer = setInterval(() => {
      if (activeProduct === 'pen') storageManager.saveAutosaveSnapshot('pen', penDoc.getModel());
      else if (activeProduct === 'sum') storageManager.saveAutosaveSnapshot('sum', sumWb.getModel());
      else if (activeProduct === 'glimpse') storageManager.saveAutosaveSnapshot('glimpse', glimpseDeck.getModel());
      setIsAutosaved(true);
    }, settings.fileHandling.autosaveIntervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [activeProduct, penDoc, sumWb, glimpseDeck]);

  const handleManualSave = () => {
    if (activeProduct === 'pen') {
      storageManager.saveDocument(penDoc.getModel().metadata, penDoc.getModel());
    } else if (activeProduct === 'sum') {
      storageManager.saveDocument(sumWb.getModel().metadata, sumWb.getModel());
    } else if (activeProduct === 'glimpse') {
      storageManager.saveDocument(glimpseDeck.getModel().metadata, glimpseDeck.getModel());
    }
    setIsAutosaved(true);
    triggerUpdate();
  };

  const handleOpenAiWithContext = (prompt: string, context: string) => {
    setAiPrompt(prompt);
    setAiContext(context);
    setIsAiOpen(true);
  };

  const handleNewDoc = (type: ProductType) => {
    if (type === 'pen') {
      penDoc.getModel().sections = [
        {
          id: `sec_${Date.now()}`,
          pageSettings: { orientation: 'portrait', pageSize: 'A4', margins: { top: 25, bottom: 25, left: 25, right: 25 }, columns: 1 },
          blocks: [{ id: `b_${Date.now()}`, type: 'paragraph', inlines: [{ id: `inl_${Date.now()}`, text: '' }] }],
          footnotes: [],
        },
      ];
      penDoc.setTitle('Untitled Document');
      setActiveProduct('pen');
    } else if (type === 'sum') {
      sumWb.getModel().sheets = [
        {
          id: `sheet_${Date.now()}`,
          name: 'Sheet1',
          cells: {},
          rowCount: 100,
          colCount: 26,
        },
      ];
      setActiveProduct('sum');
    } else if (type === 'glimpse') {
      glimpseDeck.getModel().slides = [
        {
          id: `s_${Date.now()}`,
          title: 'Title Slide',
          background: 'radial-gradient(ellipse at top, #1e293b, #0f172a)',
          nodes: [
            {
              id: `n1_${Date.now()}`,
              type: 'text',
              x: 160,
              y: 340,
              width: 1600,
              height: 140,
              text: 'Presentation Title',
              fontSize: 56,
              fontWeight: 'bold',
              color: '#ffffff',
              align: 'center',
              zIndex: 1,
            },
          ],
        },
      ];
      setActiveProduct('glimpse');
    }
    triggerUpdate();
  };

  const handleOpenDoc = (id: string) => {
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
  };

  const handleRecoverCrash = (recovery: CrashRecoveryLog) => {
    if (recovery.type === 'pen') {
      penDoc.getModel().sections = recovery.payload.sections;
      penDoc.setTitle(recovery.title);
      setActiveProduct('pen');
    } else if (recovery.type === 'sum') {
      sumWb.getModel().sheets = recovery.payload.sheets;
      setActiveProduct('sum');
    } else if (recovery.type === 'glimpse') {
      glimpseDeck.getModel().slides = recovery.payload.slides;
      setActiveProduct('glimpse');
    }
    storageManager.clearCrashRecovery(recovery.docId);
    triggerUpdate();
  };

  const getActiveModel = () => {
    if (activeProduct === 'pen') return penDoc.getModel();
    if (activeProduct === 'sum') return sumWb.getModel();
    if (activeProduct === 'glimpse') return glimpseDeck.getModel();
    return null;
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <Header
        activeProduct={activeProduct}
        onSelectProduct={setActiveProduct}
        title={
          activeProduct === 'pen'
            ? penDoc.getModel().metadata.title
            : activeProduct === 'sum'
            ? sumWb.getModel().metadata.title
            : activeProduct === 'glimpse'
            ? glimpseDeck.getModel().metadata.title
            : 'Openhead Home'
        }
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleAi={() => setIsAiOpen((prev) => !prev)}
        onOpenRecentFiles={() => setActiveProduct('home')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onManualSave={handleManualSave}
        isAutosaved={isAutosaved}
        canUndo={true}
        canRedo={false}
        onUndo={() => {
          if (activeProduct === 'pen') penDoc.undo();
          else if (activeProduct === 'sum') sumWb.undo();
          else if (activeProduct === 'glimpse') glimpseDeck.undo();
          triggerUpdate();
        }}
        onRedo={() => {
          if (activeProduct === 'pen') penDoc.redo();
          else if (activeProduct === 'sum') sumWb.redo();
          else if (activeProduct === 'glimpse') glimpseDeck.redo();
          triggerUpdate();
        }}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {activeProduct === 'home' && (
          <HomeScreen
            recentDocs={storageManager.listDocuments()}
            onNewDoc={handleNewDoc}
            onOpenDoc={handleOpenDoc}
            onDeleteDoc={(id) => {
              storageManager.deleteDocument(id);
              triggerUpdate();
            }}
            onRecoverCrash={handleRecoverCrash}
            onDismissRecovery={(id) => {
              storageManager.clearCrashRecovery(id);
              triggerUpdate();
            }}
          />
        )}

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

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        context={{
          activeApp: activeProduct,
          canUndo: true,
          canRedo: false,
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsChanged={triggerUpdate}
      />

      <UnifiedSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        activeApp={activeProduct === 'home' ? 'pen' : activeProduct}
        model={getActiveModel()}
      />
    </div>
  );
};
