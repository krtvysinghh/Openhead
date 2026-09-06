import React, { useState } from 'react';
import {
  SumWorkbook,
  exportWorksheetToCsv,
  importCsvToWorksheet,
  SortingFilteringEngine,
  XlsxAdapter,
} from '@openhead/sum';
import { colIndexToName, parseCellAddress, FormulaAutocomplete, AutocompleteSuggestion } from '@openhead/formula';
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
  Bug,
  ArrowDownAZ,
  ArrowUpAZ,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Columns,
  Square,
  Snowflake,
  Trash2,
  Undo2,
  Redo2,
  Target,
  Split,
  X,
} from 'lucide-react';
import { FormulaDebuggerDrawer } from '../components/FormulaDebuggerDrawer';

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
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isDebuggerOpen, setIsDebuggerOpen] = useState(false);
  const [isGoalSeekOpen, setIsGoalSeekOpen] = useState(false);
  const [targetCell, setTargetCell] = useState('A1');
  const [targetValue, setTargetValue] = useState('100');
  const [changingCell, setChangingCell] = useState('A2');
  const [goalSeekResult, setGoalSeekResult] = useState<string | null>(null);

  const handleAutoSum = (func: 'SUM' | 'AVERAGE' | 'COUNT' | 'MIN' | 'MAX') => {
    const addr = parseCellAddress(selectedCell);
    if (!addr) return;
    const colName = colIndexToName(addr.col);
    if (addr.row > 0) {
      const range = `${colName}1:${colName}${addr.row}`;
      const formula = `=${func}(${range})`;
      wb.setCellValue(selectedCell, formula);
      setFormulaInput(formula);
      onUpdate();
    }
  };

  const handleRunGoalSeek = () => {
    const tVal = parseFloat(targetValue);
    if (isNaN(tVal)) return;
    const res = wb.goalSeek(targetCell, tVal, changingCell);
    if (res.success) {
      setGoalSeekResult(`Target reached! ${changingCell} set to ${res.finalValue.toFixed(4)} in ${res.iterations} iterations.`);
    } else {
      setGoalSeekResult(`Could not fully converge. Best estimate: ${res.finalValue.toFixed(4)}`);
    }
    onUpdate();
  };

  const handleTextToColumns = () => {
    const delim = window.prompt('Enter delimiter character (e.g. comma, semicolon, pipe):', ',') || ',';
    wb.textToColumns(selectedCell, delim);
    onUpdate();
  };

  const handleRemoveDuplicates = () => {
    const range = window.prompt('Enter table range to deduplicate (e.g. A1:D20):', 'A1:D25');
    if (range) {
      const count = wb.removeDuplicates(range);
      alert(`Successfully removed ${count} duplicate row(s).`);
      onUpdate();
    }
  };

  const handleCellSelect = (cellKey: string) => {
    setSelectedCell(cellKey);
    const cell = activeSheet.cells[cellKey];
    const rawVal = cell ? String(cell.raw ?? '') : '';
    setFormulaInput(rawVal);
    setSuggestions([]);
  };

  const handleFormulaInputChange = (val: string) => {
    setFormulaInput(val);
    if (val.startsWith('=')) {
      const match = val.match(/^=([A-Za-z]+)$/);
      if (match) {
        setSuggestions(FormulaAutocomplete.getSuggestions(match[1]));
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleCellCommit = () => {
    wb.setCellValue(selectedCell, formulaInput);
    setIsEditing(false);
    setSuggestions([]);
    onUpdate();
  };

  const handleApplySuggestion = (sug: AutocompleteSuggestion) => {
    setFormulaInput(`=${sug.name}(`);
    setSuggestions([]);
  };

  const handleKeyDownGrid = (e: React.KeyboardEvent) => {
    // Undo / Redo shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        if (wb.canRedo) {
          wb.redo();
          onUpdate();
        }
      } else {
        if (wb.canUndo) {
          wb.undo();
          onUpdate();
        }
      }
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      if (wb.canRedo) {
        wb.redo();
        onUpdate();
      }
      return;
    }

    if (isEditing) {
      if (e.key === 'Escape') {
        setIsEditing(false);
        setSuggestions([]);
      }
      return;
    }

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
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey && addr.col > 0) {
        handleCellSelect(`${colIndexToName(addr.col - 1)}${addr.row + 1}`);
      } else if (!e.shiftKey) {
        handleCellSelect(`${colIndexToName(addr.col + 1)}${addr.row + 1}`);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      handleCellSelect(`A${addr.row + 1}`);
    } else if (e.key === 'F2') {
      e.preventDefault();
      setIsEditing(true);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(true);
    }
  };

  const handleSortColumn = (ascending: boolean) => {
    const addr = parseCellAddress(selectedCell);
    if (addr) {
      const sorted = SortingFilteringEngine.sortColumn(activeSheet, addr.col, ascending);
      const targetSheet = wb.getModel().sheets.find((s) => s.id === activeSheet.id)!;
      targetSheet.cells = sorted.cells;
      onUpdate();
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

  const handleInsertCol = () => {
    const addr = parseCellAddress(selectedCell);
    if (addr) {
      wb.insertCol(addr.col);
      onUpdate();
    }
  };

  const handleDeleteCol = () => {
    const addr = parseCellAddress(selectedCell);
    if (addr) {
      wb.deleteCol(addr.col);
      onUpdate();
    }
  };

  const handleToggleFreezeHeader = () => {
    const currentSplit = activeSheet.freezePanes?.rows;
    if (currentSplit) {
      activeSheet.freezePanes = undefined;
    } else {
      activeSheet.freezePanes = { rows: 1, cols: 0 };
    }
    onUpdate();
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

  const handleExportXlsx = async () => {
    const buffer = await XlsxAdapter.toBuffer(wb.getModel());
    const blob = new Blob([buffer as any], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${wb.getModel().metadata.title || 'workbook'}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportXlsx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();
    const importedModel = await XlsxAdapter.fromBuffer(arrayBuffer);
    const currentModel = wb.getModel();
    currentModel.metadata.title = importedModel.metadata.title;
    currentModel.sheets = importedModel.sheets;
    currentModel.activeSheetId = importedModel.activeSheetId;
    onUpdate();
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

  // Dynamically compute row and column counts based on populated cells
  const cellKeys = Object.keys(activeSheet.cells);
  let maxUsedRow = 20;
  let maxUsedCol = 10;
  for (const k of cellKeys) {
    const addr = parseCellAddress(k);
    if (addr) {
      if (addr.row + 1 > maxUsedRow) maxUsedRow = addr.row + 1;
      if (addr.col + 1 > maxUsedCol) maxUsedCol = addr.col + 1;
    }
  }
  const rowsCount = Math.max(30, maxUsedRow + 8);
  const colsCount = Math.max(14, maxUsedCol + 3);

  const activeCellStyle = activeSheet.cells[selectedCell]?.style || {};

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/40" onKeyDown={handleKeyDownGrid} tabIndex={0}>
      {/* Ribbon Toolbar */}
      <div className={`flex items-center justify-between px-6 py-2 border-b border-white/10 ${glassStyles.panelSubtle}`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              if (wb.canUndo) {
                wb.undo();
                onUpdate();
              }
            }}
            disabled={!wb.canUndo}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              wb.canUndo
                ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                : 'text-slate-600 cursor-not-allowed opacity-50'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (wb.canRedo) {
                wb.redo();
                onUpdate();
              }
            }}
            disabled={!wb.canRedo}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              wb.canRedo
                ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                : 'text-slate-600 cursor-not-allowed opacity-50'
            }`}
            title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Typography / Cell Styling */}
          <button
            onClick={() => {
              wb.setCellStyle(selectedCell, { ...activeCellStyle, bold: !activeCellStyle.bold });
              onUpdate();
            }}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCellStyle.bold ? 'bg-indigo-600/40 text-white border border-indigo-400/50' : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              wb.setCellStyle(selectedCell, { ...activeCellStyle, italic: !activeCellStyle.italic });
              onUpdate();
            }}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCellStyle.italic ? 'bg-indigo-600/40 text-white border border-indigo-400/50' : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              wb.setCellStyle(selectedCell, { ...activeCellStyle, underline: !activeCellStyle.underline });
              onUpdate();
            }}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCellStyle.underline ? 'bg-indigo-600/40 text-white border border-indigo-400/50' : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          {/* Alignments */}
          <button
            onClick={() => {
              wb.setCellStyle(selectedCell, { ...activeCellStyle, align: 'left' });
              onUpdate();
            }}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCellStyle.align === 'left' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              wb.setCellStyle(selectedCell, { ...activeCellStyle, align: 'center' });
              onUpdate();
            }}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCellStyle.align === 'center' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              wb.setCellStyle(selectedCell, { ...activeCellStyle, align: 'right' });
              onUpdate();
            }}
            className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCellStyle.align === 'right' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <button
            onClick={() => {
              wb.setCellStyle(selectedCell, {
                ...activeCellStyle,
                borders: activeCellStyle.borders ? undefined : { top: true, bottom: true, left: true, right: true },
              });
              onUpdate();
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeCellStyle.borders ? 'bg-indigo-600/30 text-indigo-200 border border-indigo-400/40' : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
            title="Toggle All Borders"
          >
            <Square className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

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
            onClick={() => handleSortColumn(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Sort Column A-Z (Ascending)"
          >
            <ArrowDownAZ className="w-4 h-4 text-indigo-400" /> Sort Asc
          </button>
          <button
            onClick={() => handleSortColumn(false)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Sort Column Z-A (Descending)"
          >
            <ArrowUpAZ className="w-4 h-4 text-indigo-400" /> Sort Desc
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <button
            onClick={handleInsertRow}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Insert Row Above Selection"
          >
            <PlusSquare className="w-4 h-4 text-emerald-400" /> Row+
          </button>
          <button
            onClick={handleDeleteRow}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Delete Current Row"
          >
            <MinusSquare className="w-4 h-4 text-red-400" /> Row-
          </button>
          <button
            onClick={handleInsertCol}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Insert Column at Selection"
          >
            <Columns className="w-4 h-4 text-emerald-400" /> Col+
          </button>
          <button
            onClick={handleDeleteCol}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Delete Current Column"
          >
            <MinusSquare className="w-4 h-4 text-red-400" /> Col-
          </button>
          <button
            onClick={handleToggleFreezeHeader}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeSheet.freezePanes?.rows
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            }`}
            title="Freeze/Unfreeze Top Header Row"
          >
            <Snowflake className="w-4 h-4 text-cyan-400" /> Freeze
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAutoSum(e.target.value as any);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none hover:border-white/20"
            title="AutoSum Functions"
          >
            <option value="" disabled>Σ AutoSum</option>
            <option value="SUM">SUM</option>
            <option value="AVERAGE">AVERAGE</option>
            <option value="COUNT">COUNT</option>
            <option value="MIN">MIN</option>
            <option value="MAX">MAX</option>
          </select>

          <button
            onClick={() => {
              setTargetCell(selectedCell);
              setGoalSeekResult(null);
              setIsGoalSeekOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Goal Seek Solver"
          >
            <Target className="w-4 h-4 text-purple-400" /> Goal Seek
          </button>

          <button
            onClick={handleTextToColumns}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Split Text to Columns"
          >
            <Split className="w-4 h-4 text-amber-400" /> Text to Col
          </button>

          <button
            onClick={handleRemoveDuplicates}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white"
            title="Remove Duplicate Rows"
          >
            <Trash2 className="w-4 h-4 text-rose-400" /> Deduplicate
          </button>

          <div className="w-[1px] h-4 bg-white/10 mx-1" />

          <button
            onClick={() => setIsDebuggerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 hover:bg-emerald-500/20 transition-all"
          >
            <Bug className="w-3.5 h-3.5 text-emerald-400" /> Inspect Formula
          </button>

          <button
            onClick={() =>
              onAiPrompt?.('Explain formulas and summarize trends in this spreadsheet', exportWorksheetToCsv(activeSheet))
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 hover:bg-indigo-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Insights
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
            <FileUp className="w-3.5 h-3.5 text-green-400" /> Import XLSX
            <input type="file" accept=".xlsx" onChange={handleImportXlsx} className="hidden" />
          </label>
          <button
            onClick={handleExportXlsx}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-emerald-600/20 border border-emerald-400/30 hover:bg-emerald-600/30 transition-all"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" /> Export XLSX
          </button>
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-all">
            <FileUp className="w-3.5 h-3.5" /> CSV
            <input type="file" accept=".csv,.tsv,.txt" onChange={handleImportCsv} className="hidden" />
          </label>
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <FileDown className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Formula Bar with Autocomplete Dropdown */}
      <div className="relative flex items-center px-4 py-2 bg-slate-900/40 border-b border-white/5 gap-3">
        <span className="text-xs font-mono font-bold text-indigo-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded">
          {selectedCell}
        </span>
        <FunctionSquare className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={formulaInput}
          onChange={(e) => handleFormulaInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCellCommit();
          }}
          placeholder="Enter a value or formula (e.g. =SUM(A1:A5), =PMT(0.05/12, 36, 10000), =VLOOKUP(...))..."
          className="flex-1 bg-transparent border-none outline-none text-slate-100 text-sm font-mono placeholder-slate-500"
        />

        {/* Autocomplete Suggestions Box */}
        {suggestions.length > 0 && (
          <div className="absolute left-20 top-11 z-30 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl p-1.5 space-y-1 text-xs">
            {suggestions.map((sug) => (
              <div
                key={sug.name}
                onClick={() => handleApplySuggestion(sug)}
                className="p-2 rounded-lg hover:bg-indigo-600/30 cursor-pointer transition-colors"
              >
                <div className="font-mono font-semibold text-white">{sug.signature}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{sug.description}</div>
              </div>
            ))}
          </div>
        )}
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
                        style={{
                          fontWeight: cell?.style?.bold ? 'bold' : 'normal',
                          fontStyle: cell?.style?.italic ? 'italic' : 'normal',
                          textDecoration: cell?.style?.underline ? 'underline' : cell?.style?.strike ? 'line-through' : 'none',
                          textAlign: (cell?.style?.align as any) || (typeof cell?.value === 'number' ? 'right' : 'left'),
                          color: cell?.style?.color || undefined,
                          backgroundColor: isSelected ? undefined : (cell?.style?.background || undefined),
                          fontSize: cell?.style?.fontSize ? `${cell.style.fontSize}pt` : undefined,
                          fontFamily: cell?.style?.fontFamily || undefined,
                          borderTop: cell?.style?.borders?.top ? '1px solid rgba(255,255,255,0.4)' : undefined,
                          borderBottom: cell?.style?.borders?.bottom ? '1px solid rgba(255,255,255,0.4)' : undefined,
                          borderLeft: cell?.style?.borders?.left ? '1px solid rgba(255,255,255,0.4)' : undefined,
                          borderRight: cell?.style?.borders?.right ? '1px solid rgba(255,255,255,0.4)' : undefined,
                        }}
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
                            onChange={(e) => handleFormulaInputChange(e.target.value)}
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
            <div key={sheet.id} className="flex items-center gap-1 group">
              <button
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
              {wb.getModel().sheets.length > 1 && (
                <button
                  onClick={() => {
                    wb.deleteSheet(sheet.id);
                    onUpdate();
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  title={`Delete ${sheet.name}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
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

        <span className="text-xs text-slate-500 font-mono">Topological DAG Active • XLSX Compatible</span>
      </div>

      {/* Goal Seek Modal */}
      {isGoalSeekOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-6 rounded-2xl ${glassStyles.panel} shadow-2xl flex flex-col gap-4 border border-white/10`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" /> Goal Seek Solver
              </h3>
              <button onClick={() => setIsGoalSeekOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <label className="block mb-1 font-medium">Set Cell (Formula Cell):</label>
                <input
                  type="text"
                  value={targetCell}
                  onChange={(e) => setTargetCell(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none"
                  placeholder="e.g. C5"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">To Target Value:</label>
                <input
                  type="text"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none"
                  placeholder="e.g. 100000"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">By Changing Cell (Variable):</label>
                <input
                  type="text"
                  value={changingCell}
                  onChange={(e) => setChangingCell(e.target.value.toUpperCase())}
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-white font-mono outline-none"
                  placeholder="e.g. B2"
                />
              </div>
              {goalSeekResult && (
                <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-400/20 text-purple-200 text-xs font-mono">
                  {goalSeekResult}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setIsGoalSeekOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs"
              >
                Close
              </button>
              <button
                onClick={handleRunGoalSeek}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/20"
              >
                Solve Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formula Debugger Drawer */}
      <FormulaDebuggerDrawer
        isOpen={isDebuggerOpen}
        onClose={() => setIsDebuggerOpen(false)}
        formula={activeSheet.cells[selectedCell]?.raw ? String(activeSheet.cells[selectedCell].raw) : selectedCell}
        cellResolver={(addr) => {
          const key = `${colIndexToName(addr.col)}${addr.row + 1}`;
          return activeSheet.cells[key]?.value ?? null;
        }}
        rangeResolver={(rng) => {
          const rows: any[][] = [];
          for (let r = rng.start.row; r <= rng.end.row; r++) {
            const row: any[] = [];
            for (let c = rng.start.col; c <= rng.end.col; c++) {
              const k = `${colIndexToName(c)}${r + 1}`;
              row.push(activeSheet.cells[k]?.value ?? null);
            }
            rows.push(row);
          }
          return rows;
        }}
      />
    </div>
  );
};
