import React from 'react';
import { X, Award, Landmark, BookOpen, Compass, Cpu, CheckCircle } from 'lucide-react';

export const HistoryModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto">
      <div className="bg-[#131519] border-2 border-[#8a652a] rounded-sm shadow-2xl max-w-[760px] w-full max-h-[88vh] flex flex-col overflow-hidden text-[#d9d3c5]">
        {/* Victorian Plaque Header */}
        <div className="bg-gradient-to-r from-[#241c10] via-[#3d2c16] to-[#241c10] border-b border-[#8a652a] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Landmark size={20} className="text-[#daa520]" />
            <div>
              <h2 className="font-serif text-[#f7eedf] text-base font-bold tracking-widest uppercase">
                The Science Museum Exhibition Dossier
              </h2>
              <p className="text-[11px] text-[#b89c68] font-mono tracking-wider">
                Charles Babbage’s Difference Engine No. 2 (1847–1849)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#8e816a] hover:text-[#ff9999] hover:bg-[#211a12] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Narrative Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-xs font-serif leading-relaxed">
          {/* Famous Quote Card */}
          <div className="bg-[#1a1c24] border-l-4 border-[#daa520] p-4 rounded-r shadow-inner">
            <blockquote className="text-sm italic text-[#ffd980] leading-snug">
              “I wish to God these calculations had been executed by steam!”
            </blockquote>
            <cite className="block mt-1.5 text-[11px] text-[#a89980] not-italic font-mono">
              — Charles Babbage, to astronomer John Herschel in 1821, upon discovering pervasive human calculation errors in the Nautical Almanac tables.
            </cite>
          </div>

          {/* Key Engineering Specifications Grid */}
          <div>
            <h3 className="font-serif text-xs font-bold text-[#daa520] uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Cpu size={14} /> Machine Specifications & Vital Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-[11px]">
              <div className="bg-[#181a20] border border-[#2b2d36] p-2.5 rounded-sm">
                <span className="text-[#7d7465] uppercase text-[9px] block">Component Count</span>
                <strong className="text-sm text-[#f5efe3]">~8,000 Parts</strong>
                <span className="text-[10px] text-[#8e816a] block mt-0.5">Bronze & hardened steel</span>
              </div>

              <div className="bg-[#181a20] border border-[#2b2d36] p-2.5 rounded-sm">
                <span className="text-[#7d7465] uppercase text-[9px] block">Total Mass</span>
                <strong className="text-sm text-[#f5efe3]">5 Long Tons</strong>
                <span className="text-[10px] text-[#8e816a] block mt-0.5">Cast iron framework</span>
              </div>

              <div className="bg-[#181a20] border border-[#2b2d36] p-2.5 rounded-sm">
                <span className="text-[#7d7465] uppercase text-[9px] block">Physical Scale</span>
                <strong className="text-sm text-[#f5efe3]">11 ft × 7 ft</strong>
                <span className="text-[10px] text-[#8e816a] block mt-0.5">3.4m long × 2.1m high</span>
              </div>

              <div className="bg-[#181a20] border border-[#2b2d36] p-2.5 rounded-sm">
                <span className="text-[#7d7465] uppercase text-[9px] block">Calculating Capacity</span>
                <strong className="text-sm text-[#f5efe3]">8 Cols × 31 Digits</strong>
                <span className="text-[10px] text-[#8e816a] block mt-0.5">7th-degree polynomials</span>
              </div>
            </div>
          </div>

          {/* Historical Narrative */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif text-xs font-bold text-[#daa520] uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen size={14} /> The 150-Year Journey to Vindicator
            </h3>
            
            <p>
              In the early 19th century, navigation, astronomical ephemerides, ballistics, and insurance actuarial rates relied entirely on printed numerical tables. Because these tables were calculated by human "computers" and typeset by hand, they were notoriously riddled with errors. Ships were lost at sea due to navigational inaccuracies, and insurance firms mispriced annuities.
            </p>

            <p>
              Charles Babbage, Lucasian Professor of Mathematics at Cambridge, conceived a mechanical solution: an automated engine that would evaluate mathematical functions through repeated mechanical addition and stamp the results directly into soft metal or plaster stereotype plates, permanently eliminating human transcription error.
            </p>

            <p>
              His first attempt, <em>Difference Engine No. 1</em> (1822–1833), was a massive 25,000-part behemoth that fell victim to escalating costs, political friction with the British Treasury, and disputes with his master machinist, Joseph Clement. Between 1847 and 1849, Babbage synthesized everything he had learned from designing his visionary general-purpose <em>Analytical Engine</em> to create <strong>Difference Engine No. 2</strong> — a radically streamlined machine requiring only one-third the parts while achieving identical mathematical power.
            </p>

            <p>
              Tragically, the British government refused to fund its construction, and Babbage died in 1871 without ever seeing a complete engine built. Critics claimed his tolerances were impossible for 19th-century machine tools.
            </p>
          </div>

          {/* The Science Museum Miracle */}
          <div className="bg-[#171a22] border border-[#2d303b] p-4 rounded-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[#ffd980] font-serif font-bold text-xs uppercase tracking-wider">
              <Award size={16} className="text-[#daa520]" />
              <span>Doron Swade & The 1991 / 2002 Construction</span>
            </div>
            <p>
              In 1985, Dr. Doron Swade, Senior Curator of Computing at the Science Museum in London, spearheaded a historic project: build Difference Engine No. 2 exactly to Babbage’s surviving 1847–1849 technical drawings, using only the manufacturing tolerances achievable in the mid-19th century.
            </p>
            <p>
              Completed in 1991 for Babbage’s bicentenary, the calculating mechanism worked essentially on the first attempt, cleanly generating values for polynomials up to the 7th degree to 31 decimal places. In 2002, the intricate printing and stereotyping mechanism was added, completing the full machine.
            </p>
            <p className="text-[#85e070] flex items-center gap-1.5 font-mono text-[11px] pt-1">
              <CheckCircle size={14} />
              <span>Only two physical working engines exist worldwide: one at the Science Museum in London, and a second replica built for Nathan Myhrvold at the Computer History Museum in Mountain View, California.</span>
            </p>
          </div>

          {/* The Method of Finite Differences Explained */}
          <div className="flex flex-col gap-2">
            <h3 className="font-serif text-xs font-bold text-[#daa520] uppercase tracking-widest flex items-center gap-1.5">
              <Compass size={14} /> The Method of Finite Differences
            </h3>
            <p>
              Any polynomial function of degree $n$ has a constant $n$-th finite difference. For example, for $f(x) = x^2$:
            </p>
            <div className="bg-[#0f1013] border border-[#2b2316] p-3 rounded font-mono text-[11px] text-[#e0dacd]">
              <div>x = 0: f(0) = 0   [Δ¹ = 1, Δ² = 2]</div>
              <div>x = 1: f(1) = 1   [Δ¹ = 3, Δ² = 2]</div>
              <div>x = 2: f(2) = 4   [Δ¹ = 5, Δ² = 2]</div>
              <div>x = 3: f(3) = 9   [Δ¹ = 7, Δ² = 2]</div>
              <div>x = 4: f(4) = 16  [Δ¹ = 9, Δ² = 2]</div>
            </div>
            <p>
              Because the highest difference is constant, every subsequent value of $f(x)$ can be calculated simply by adding the differences from right to left! Babbage ingeniously converted complex mathematical curves into pure, rhythmic mechanical additions.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#181a20] border-t border-[#2d2922] px-5 py-3 flex items-center justify-between">
          <span className="text-[10px] text-[#7d7465] font-mono">
            London Science Museum Archive • Ref. 1849-DE2
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2b2112] text-[#ffebad] border border-[#daa520] rounded-sm font-serif text-xs font-bold uppercase tracking-wider hover:bg-[#3d2e18] transition-all"
          >
            Return to Engine
          </button>
        </div>
      </div>
    </div>
  );
};
