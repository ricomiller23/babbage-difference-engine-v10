import React, { useState } from 'react';
import { X, CheckCircle, HelpCircle, ShieldCheck, Maximize2, Minimize2 } from 'lucide-react';

export const LedgerTable = ({
  isOpen,
  onClose,
  engineState,
  history = [],
  currentPresetName,
  polynomialFormula
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeColInspect, setActiveColInspect] = useState(0);

  if (!isOpen) return null;

  const columnHeaders = [
    { title: "Column 0", subtitle: "Value f(x)", order: "f(x)" },
    { title: "Column 1", subtitle: "1st Diff", order: "Δ¹" },
    { title: "Column 2", subtitle: "2nd Diff", order: "Δ²" },
    { title: "Column 3", subtitle: "3rd Diff", order: "Δ³" },
    { title: "Column 4", subtitle: "4th Diff", order: "Δ⁴" },
    { title: "Column 5", subtitle: "5th Diff", order: "Δ⁵" },
    { title: "Column 6", subtitle: "6th Diff", order: "Δ⁶" },
    { title: "Column 7", subtitle: "7th Diff", order: "Δ⁷" },
  ];

  const colDigits = engineState ? engineState.columns[activeColInspect] : [];
  const colCarryFlags = engineState ? engineState.carryWarnings[activeColInspect] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm pointer-events-auto">
      <div 
        className={`bg-[#121418] border-2 border-[#8a652a] rounded-sm shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isExpanded ? 'w-[96vw] h-[92vh]' : 'w-[880px] max-h-[85vh]'
        }`}
      >
        {/* Victorian Modal Header Plaque */}
        <div className="bg-gradient-to-r from-[#211a0f] via-[#332615] to-[#211a0f] border-b border-[#8a652a] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-[#daa520]" />
            <div>
              <h2 className="font-serif text-[#f4ebdc] text-sm font-bold tracking-widest uppercase">
                Finite Difference Ledger & 31-Digit Register
              </h2>
              <p className="text-[10px] text-[#b89c68] font-mono tracking-wider">
                {currentPresetName} • {polynomialFormula}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-[#8e816a] hover:text-[#ffd980] transition-all"
            >
              {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-[#8e816a] hover:text-[#ff9999] transition-all"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Current State Summary Banner */}
        <div className="bg-[#171920] border-b border-[#2d2922] px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-[#8e816a]">
              Current Cycle: <strong className="text-[#daa520]">{engineState ? engineState.history.length - 1 : 0}</strong>
            </span>
            <span className="text-[#8e816a]">
              Variable x: <strong className="text-[#ffd980]">{engineState ? engineState.x : 0}</strong>
            </span>
            <span className="text-[#8e816a]">
              Calculated f(x): <strong className="text-[#f5f0e4]">{engineState ? engineState.getColumnValue(0).toString() : '0'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#85e070]">
            <CheckCircle size={13} />
            <span>Provably Inerrant Mechanical Arithmetic</span>
          </div>
        </div>

        {/* Main Body: 8-Column Live Table + 31-Wheel Digital Inspector */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {/* 8-Column Live Values */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-serif uppercase tracking-wider text-[#daa520] font-bold">
                Live State Across All 8 Calculating Columns
              </span>
              <span className="text-[10px] text-[#7a6f5a] font-mono italic">
                Click a column below to inspect its individual 31 figure wheels
              </span>
            </div>

            <div className="grid grid-cols-8 gap-1.5">
              {columnHeaders.map((col, idx) => {
                const isSelected = activeColInspect === idx;
                const colVal = engineState ? engineState.getColumnValue(idx).toString() : '0';
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveColInspect(idx)}
                    className={`p-2 rounded-sm border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#2b2214] border-[#daa520] shadow-md'
                        : 'bg-[#181a1f] border-[#292c34] hover:border-[#695029]'
                    }`}
                  >
                    <div className="text-[10px] font-serif text-[#daa520] font-bold truncate">
                      {col.order}
                    </div>
                    <div className="text-[9px] text-[#7a6f5a] font-mono truncate">
                      {col.subtitle}
                    </div>
                    <div className="mt-1.5 font-mono text-xs text-[#f2ede4] font-bold truncate" title={colVal}>
                      {colVal}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 31 Figure Wheels Vertical Stack Inspector for Selected Column */}
          <div className="bg-[#15171d] border border-[#2d2922] p-3 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-serif text-[#ffd980] font-bold uppercase tracking-wider">
                Column {activeColInspect} ({columnHeaders[activeColInspect].order}) — 31 Figure Wheels Internal State
              </span>
              <span className="text-[10px] text-[#8e816a] font-mono">
                Wheel 30 (MSB) down to Wheel 0 (Units)
              </span>
            </div>

            {/* Visual Figure Wheels Grid (Showing Digit 0..9 and Carry Flags) */}
            <div className="grid grid-cols-16 sm:grid-cols-31 gap-1 py-1">
              {colDigits && colDigits.map((digit, wIdx) => {
                const isTripped = colCarryFlags && colCarryFlags[wIdx];
                return (
                  <div
                    key={wIdx}
                    className={`flex flex-col items-center justify-center p-1 rounded border text-center transition-all ${
                      isTripped
                        ? 'bg-[#3b1c1c] border-[#ff5555] text-[#ff9999]'
                        : 'bg-[#1d2027] border-[#2f333d] text-[#e0dacd]'
                    }`}
                    title={`Wheel ${wIdx} ${wIdx === 0 ? '(Units)' : ''}: Digit ${digit}${isTripped ? ' [CARRY FLAGGED]' : ''}`}
                  >
                    <span className="text-[8px] font-mono text-[#6c7482]">
                      w{wIdx}
                    </span>
                    <span className="font-mono text-xs font-bold text-[#ffd980]">
                      {digit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chronological Calculation History Table */}
          <div>
            <div className="text-[11px] font-serif uppercase tracking-wider text-[#daa520] font-bold mb-2">
              Chronological Calculation Table ({history.length} Cycles)
            </div>

            <div className="overflow-x-auto border border-[#282b34] rounded-sm max-h-[220px] overflow-y-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead className="bg-[#1a1d24] text-[#8e816a] text-[10px] uppercase sticky top-0 border-b border-[#282b34]">
                  <tr>
                    <th className="py-2 px-3">Cycle</th>
                    <th className="py-2 px-3">x</th>
                    <th className="py-2 px-3 text-[#daa520]">f(x) (Col 0)</th>
                    <th className="py-2 px-3">Δ¹ (Col 1)</th>
                    <th className="py-2 px-3">Δ² (Col 2)</th>
                    <th className="py-2 px-3">Δ³ (Col 3)</th>
                    <th className="py-2 px-3">Δ⁴ (Col 4)</th>
                    <th className="py-2 px-3">Δ⁵ (Col 5)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#20232c] text-[#cfc8b8]">
                  {history.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-[#1a1c22]">
                      <td className="py-1.5 px-3 text-[#7d715d] font-bold">#{row.cycle}</td>
                      <td className="py-1.5 px-3 text-[#ffd980]">{row.x}</td>
                      <td className="py-1.5 px-3 font-bold text-[#f5f0e4]">{row.value.toString()}</td>
                      <td className="py-1.5 px-3 text-[#a89e8b]">{row.differences[1]?.toString() || '0'}</td>
                      <td className="py-1.5 px-3 text-[#a89e8b]">{row.differences[2]?.toString() || '0'}</td>
                      <td className="py-1.5 px-3 text-[#a89e8b]">{row.differences[3]?.toString() || '0'}</td>
                      <td className="py-1.5 px-3 text-[#a89e8b]">{row.differences[4]?.toString() || '0'}</td>
                      <td className="py-1.5 px-3 text-[#a89e8b]">{row.differences[5]?.toString() || '0'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer Note */}
        <div className="bg-[#14161b] border-t border-[#2b271f] px-4 py-2 flex items-center justify-between text-[11px] text-[#786c57] font-serif">
          <div className="flex items-center gap-1.5">
            <HelpCircle size={13} className="text-[#daa520]" />
            <span>
              All computations are evaluated via mechanical finite difference additions — no multiplication or division logic exists anywhere in the engine.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#241d13] text-[#d6c7a7] border border-[#6b522b] rounded-sm hover:border-[#b8860b] hover:text-[#fff0cc] transition-all"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
