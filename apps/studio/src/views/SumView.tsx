import React, { useState } from 'react';
import { SumWorkbook, exportWorksheetToCsv, importCsvToWorksheet } from '@openhead/sum';
import { colIndexToName, parseCellAddress } from '@openhead/formula';
import { glassStyles } from '@openhead/ui';
import {
  FileDown,
  FileUp,
  Plus,
  FunctionSquare,
  Sparkles,
  Hash,
  DollarSign,
  Percent,
  PlusSquare,
  MinusSquare,
} from 'lucide-react';

interface SumViewProps {
  workbook: SumWorkbook;
  onUpdate: () => void;
  onAiPrompt?: (prompt: string, context: string) => void;
}

export const SumView: React.FC<SumViewProps> = ({ workbook: wb, onUpdate, onAiPrompt }) => {
  const activeSheet = wb.getActiveSheet();
  const [selectedCell, setSelectedCell] = useState<string>('A1');
  const [formulaInput, setFormulaInput] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const handleCellSelect = (cellKey: string) => {
    setSelectedCell(cellKey);
    const cell = activeSheet.cells[cellKey];
    setFormulaInput(cell ? String(cell.raw ?? '') : '');
  };

  const handleCellCommit = () => {
    wb.setCellValue(selectedCell, formulaInput);
    setIsEditing(false);
    onUpdate();
  };

  const handleKeyDownGrid = (e: React.KeyboardEvent) => {
    if (isEditing) return;
    const addr = parseCellAddress(selectedCell);
    if (!addr) return;

    if (e.key === 'ArrowUp' && addr.row > 0) {
      e.preventDefault();
      handleCellSelect(`${colIndexToName(addr.col)}${addr.row}`);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleCellSelect(`${colIndexToName(addr.col)}${addr.row + 2}`);
    } else if (e.key === 'ArrowLeft' && addr.col > 0) {
      e.preventDefault();
      handleCellSelect(`${colIndexToName(addr.col - 1)}${addr.row + 1}`);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleCellSelect(`${colIndexToName(addr.col + 1)}${addr.row + 1}`);
    } else if (e.key === 'F2') {
      e.preventDefault();
      setIsEditing(true);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(true);
    }
  };

  const handleInsertRow = () => {
    const addr = parseCellAddress(selectedCell);
    if (addr) {
      wb.insertRow(addr.row);
      onUpdate();
    }
  };

  const handleDeleteRow = () => {
    const addr = parseCellAddress(selectedCell);
    if (addr) {
      wb.deleteRow(addr.row);
      onUpdate();
    }
  };

  const handleExportCsv = () => {
    const csv = exportWorksheetToCsv(activeSheet);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${activeSheet.name.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const importedSheet = importCsvToWorksheet(content, file.name.replace(/\.csv$/, ''));
        wb.getModel().sheets.push(importedSheet);
        wb.setActiveSheet(importedSheet.id);
        onUpdate();
      }
    };
    reader.readAsText(file);
  };

  const rowsCount = 25;
  const colsCount = 12;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/40" onKeyDown={handleKeyDownGrid} tabIndex={0}>
      {/* Ribbon Toolbar */}
      <div className={`flex items-center justify-between px-6 py-2 border-b border-white/10 ${glassStyles.panelSubtle}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              wb.setCellFormat(selectedCell, { type: 'currency', currencySymbol: '$', decimals: 2 });
              onUpdate();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Format as Currency ($)"
          >
            <DollarSign className="w-4 h-4" /> Currency
          </button>
          <button
            onClick={() => {
              wb.setCellFormat(selectedCell, { type: 'percent', decimals: 1 });
              onUpdate();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Format as Percent (%)"
          >
            <Percent className="w-4 h-4" /> Percent
          </button>
          <button
            onClick={() => {
              wb.setCellFormat(selectedCell, { type: 'number', decimals: 2 });
              onUpdate();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Format as Number"
          >
            <Hash className="w-4 h-4" /> Number
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <button
            onClick={handleInsertRow}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Insert Row Above Selection"
          >
            <PlusSquare className="w-4 h-4 text-emerald-400" /> Insert Row
          </button>
          <button
            onClick={handleDeleteRow}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Delete Current Row"
          >
            <MinusSquare className="w-4 h-4 text-red-400" /> Delete Row
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <button
            onClick={() =>
              onAiPrompt?.('Explain formulas and summarize trends in this spreadsheet', exportWorksheetToCsv(activeSheet))
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 hover:bg-indigo-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Analyze with AI
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
            <FileUp className="w-3.5 h-3.5" /> Import CSV
            <input type="file" accept=".csv,.tsv,.txt" onChange={handleImportCsv} className="hidden" />
          </label>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <FileDown className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="flex items-center px-4 py-2 bg-slate-900/40 border-b border-white/5 gap-3">
        <span className="text-xs font-mono font-bold text-indigo-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
          {selectedCell}
        </span>
        <FunctionSquare className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={formulaInput}
          onChange={(e) => setFormulaInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCellCommit();
          }}
          placeholder="Enter a value or formula (e.g. =SUM(A1:A5), =AVERAGE(B1:B10), =VLOOKUP(...))..."
          className="flex-1 bg-transparent border-none outline-none text-slate-100 text-sm font-mono placeholder-slate-500"
        />
      </div>

      {/* Spreadsheet Matrix Grid */}
      <div className="flex-1 overflow-auto bg-slate-950/60 p-4">
        <div className={`inline-block min-w-full rounded-xl overflow-hidden border border-white/10 ${glassStyles.panelSubtle}`}>
          <table className="border-collapse text-xs w-full">
            <thead>
              <tr className="bg-white/5 text-slate-400 font-mono">
                <th className="w-12 py-2 border-r border-b border-white/10 text-center font-medium">#</th>
                {Array.from({ length: colsCount }).map((_, c) => (
                  <th key={c} className="w-32 px-3 py-2 border-r border-b border-white/10 text-center font-medium">
                    {colIndexToName(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowsCount }).map((_, r) => (
                <tr key={r} className="hover:bg-white/[0.02]">
                  <td className="bg-white/5 text-slate-400 font-mono text-center border-r border-b border-white/10 py-1.5 select-none font-medium">
                    {r + 1}
                  </td>
                  {Array.from({ length: colsCount }).map((_, c) => {
                    const cellKey = `${colIndexToName(c)}${r + 1}`;
                    const cell = activeSheet.cells[cellKey];
                    const isSelected = selectedCell === cellKey;
                    const displayValue = cell?.value !== undefined && cell?.value !== null ? String(cell.value) : '';

                    return (
                      <td
                        key={c}
                        onClick={() => handleCellSelect(cellKey)}
                        onDoubleClick={() => setIsEditing(true)}
                        className={`border-r border-b border-white/5 px-2.5 py-1.5 font-mono truncate cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-600/20 text-white outline outline-2 outline-indigo-400 z-10'
                            : 'text-slate-300 hover:bg-white/[0.04]'
                        }`}
                      >
                        {isSelected && isEditing ? (
                          <input
                            type="text"
                            value={formulaInput}
                            onChange={(e) => setFormulaInput(e.target.value)}
                            onBlur={handleCellCommit}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCellCommit();
                            }}
                            autoFocus
                            className="w-full bg-slate-900 text-white outline-none border border-indigo-400 px-1 rounded"
                          />
                        ) : (
                          displayValue
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sheet Tabs */}
      <div className="px-4 py-2 border-t border-white/10 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {wb.getModel().sheets.map((sheet) => (
            <button
              key={sheet.id}
              onClick={() => {
                wb.setActiveSheet(sheet.id);
                onUpdate();
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                sheet.id === activeSheet.id
                  ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-400/40 shadow'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {sheet.name}
            </button>
          ))}
          <button
            onClick={() => {
              wb.addSheet();
              onUpdate();
            }}
            className="p-1 rounded-md text-slate-400 hover:bg-white/10 hover:text-white"
            title="Add sheet"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-xs text-slate-500 font-mono">Topological DAG Active</span>
      </div>
    </div>
  );
};
