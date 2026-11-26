import React, { useRef, useEffect } from 'react';
import { Printer, Download, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

export const PrinterOutput = ({
  history = [],
  polynomialFormula,
  onClearHistory
}) => {
  const [isMinimized, setIsMinimized] = React.useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom of paper roll on new print entry
  useEffect(() => {
    if (scrollRef.current && !isMinimized) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isMinimized]);

  const handleExportText = () => {
    let text = "========================================================\n";
    text += "  HER MAJESTY'S STATIONERY OFFICE • LONDON\n";
    text += "  CHARLES BABBAGE'S DIFFERENCE ENGINE NO. 2 (1849)\n";
    text += `  TABULATION OF: ${polynomialFormula}\n`;
    text += "========================================================\n\n";
    text += " CYCLE |       x       |                 f(x) VALUE [31 DIGITS]\n";
    text += "-------+---------------+----------------------------------------\n";

    history.forEach((h) => {
      const cycleStr = h.cycle.toString().padStart(5, ' ');
      const xStr = h.x.toString().padStart(13, ' ');
      const valStr = h.value.toString().padStart(38, ' ');
      text += ` ${cycleStr} | ${xStr} | ${valStr}\n`;
    });

    text += "\n========================================================\n";
    text += "  CERTIFIED MECHANICALLY INERRANT — ZERO HUMAN TRANSCRIPTION\n";
    text += "========================================================\n";

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `babbage_difference_engine_table_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="absolute bottom-4 left-4 z-20 pointer-events-auto max-w-[340px] w-full transition-all">
      {/* Antique Victorian Parchment Paper Roll Container */}
      <div className="bg-[#f7f3e8] border-2 border-[#8a652a] rounded-t-sm shadow-2xl relative overflow-hidden flex flex-col text-[#262118]">
        {/* Top Paper Cutter / Brass Roller Guide Bar */}
        <div className="bg-gradient-to-r from-[#5a421b] via-[#daa520] to-[#5a421b] h-3 w-full border-b border-[#3b2b10] flex items-center justify-between px-2">
          <div className="w-1 h-1 rounded-full bg-[#1b1407]" />
          <div className="text-[8px] font-serif text-[#1e1507] uppercase tracking-widest font-bold">
            Integral Stereotype & Printing Carriage
          </div>
          <div className="w-1 h-1 rounded-full bg-[#1b1407]" />
        </div>

        {/* Paper Header / Control Bar */}
        <div className="bg-[#eee7d5] border-b border-[#c4b699] px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Printer size={13} className="text-[#8a652a]" />
            <span className="font-serif text-[11px] font-bold tracking-wider text-[#3d3322]">
              Paper Roll ({history.length} {history.length === 1 ? 'Entry' : 'Entries'})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleExportText}
              title="Download Certified Mathematical Table (.txt)"
              className="p-1 rounded text-[#594931] hover:text-[#211a0f] hover:bg-[#ded4bc] transition-all"
            >
              <Download size={12} />
            </button>
            <button
              onClick={onClearHistory}
              title="Clear Printed Roll"
              className="p-1 rounded text-[#805047] hover:text-[#521c15] hover:bg-[#ded4bc] transition-all"
            >
              <Trash2 size={12} />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded text-[#594931] hover:text-[#211a0f] hover:bg-[#ded4bc] transition-all"
            >
              {isMinimized ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        {/* Scrollable Letterpress Printed Content */}
        {!isMinimized && (
          <div
            ref={scrollRef}
            className="max-h-[190px] overflow-y-auto p-3 font-mono text-xs leading-relaxed select-text"
            style={{
              backgroundImage: 'radial-gradient(rgba(0,0,0,0.03) 1px, transparent 0)',
              backgroundSize: '12px 12px'
            }}
          >
            {/* Victorian Engraved Stamp Header */}
            <div className="text-center pb-2 mb-2 border-b border-dashed border-[#bdae90]">
              <div className="font-serif text-[10px] font-bold tracking-widest uppercase text-[#54462e]">
                Royal Society • Admiralty Tables
              </div>
              <div className="text-[9px] text-[#786b52] italic font-serif">
                "{polynomialFormula}"
              </div>
            </div>

            {/* List of Stamped Table Values */}
            <div className="flex flex-col gap-1.5">
              {history.map((item, idx) => {
                const isLatest = idx === history.length - 1;
                return (
                  <div
                    key={idx}
                    className={`flex items-baseline justify-between p-1 rounded-xs transition-all ${
                      isLatest
                        ? 'bg-[#e5dcbe] font-bold text-[#1a150e] border-l-2 border-[#8a652a] pl-2'
                        : 'text-[#383124] border-l border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#7a6f59] font-mono w-6">
                        #{item.cycle}
                      </span>
                      <span className="font-serif text-[11px] text-[#4d3f28]">
                        x = <strong className="font-mono">{item.x}</strong>
                      </span>
                    </div>

                    <div className="font-mono font-bold tracking-wider text-[11px] text-[#14120e] text-right truncate max-w-[160px]">
                      {item.formattedOutput}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Perforated Edge Bottom Marker */}
            <div className="mt-3 pt-1 border-t border-dashed border-[#a89b80] flex justify-between text-[8px] font-mono text-[#8a7e67] uppercase">
              <span>[STEREO-IMPRESSION]</span>
              <span>INERRANT</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
