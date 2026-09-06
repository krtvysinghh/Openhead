import React, { useState } from 'react';
import { ProductType } from '@openhead/core';
import { PenDocument } from '@openhead/pen';
import { SumWorkbook } from '@openhead/sum';
import { GlimpseDeck } from '@openhead/glimpse';
import { CommandPalette, CommandItem } from '@openhead/ui';
import { Header } from './components/Header';
import { PenView } from './views/PenView';
import { SumView } from './views/SumView';
import { GlimpseView } from './views/GlimpseView';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';

export const App: React.FC = () => {
  const [activeProduct, setActiveProduct] = useState<ProductType>('pen');
  const [penDoc] = useState<PenDocument>(() => {
    const doc = new PenDocument();
    doc.setTitle('Openhead Architecture & Engineering Guide');
    return doc;
  });

  const [sumWb] = useState<SumWorkbook>(() => {
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
    const deck = new GlimpseDeck();
    return deck;
  });

  const [, setVersion] = useState(0);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiContext, setAiContext] = useState<string>('');
  const [aiPrompt, setAiPrompt] = useState<string>('');

  const triggerUpdate = () => setVersion((v) => v + 1);

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
      id: 'open-ai',
      title: 'Open Local AI Assistant',
      category: 'AI Assistant',
      shortcut: 'Cmd+I',
      action: () => setIsAiOpen(true),
    },
  ];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
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
    </div>
  );
};
