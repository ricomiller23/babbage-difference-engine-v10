import React, { useState } from 'react';
import { HISTORICAL_PRESETS, computeInitialDifferences } from '../math/finiteDifferences.js';
import { soundEngine } from '../audio/soundEffects.js';
import { Settings, Sparkles, ChevronDown, Check, ArrowRight } from 'lucide-react';

export const PolynomialSelector = ({
  currentPresetId,
  currentCoeffs,
  startX,
  onLoadPolynomial,
  isAutoRunning
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'custom'
  const [customCoeffs, setCustomCoeffs] = useState([...currentCoeffs]);
  const [customStartX, setCustomStartX] = useState(startX);
  const [isLoadingAnimation, setIsLoadingAnimation] = useState(false);

  const selectedPreset = HISTORICAL_PRESETS.find(p => p.id === currentPresetId) || HISTORICAL_PRESETS[0];

  const handleSelectPreset = (preset) => {
    setCustomCoeffs([...preset.coefficients]);
    triggerLoad(preset.coefficients, 0, preset.id);
  };

  const handleCustomCoeffChange = (index, value) => {
    const next = [...customCoeffs];
    const parsed = parseInt(value, 10);
    next[index] = isNaN(parsed) ? 0 : parsed;
    setCustomCoeffs(next);
  };

  const triggerLoad = (coeffs, startVal, presetId = 'custom') => {
    setIsLoadingAnimation(true);
    soundEngine.playGearRatchet();

    // Staggered mechanical ratchet sound during wheel loading
    const interval = setInterval(() => {
      soundEngine.playGearRatchet();
    }, 90);

    setTimeout(() => {
      clearInterval(interval);
      soundEngine.playBellChime();
      onLoadPolynomial(coeffs, startVal, presetId);
      setIsLoadingAnimation(false);
      setIsOpen(false);
    }, 450);
  };

  // Preview calculated initial differences
  const previewDifferences = computeInitialDifferences(customCoeffs, customStartX);

  return (
    <div className="absolute top-4 right-4 z-20 pointer-events-auto">
      {/* Victorian Active Polynomial Plaque */}
      <div className="bg-[#141518]/92 border border-[#8a652a] rounded-sm p-3 shadow-2xl backdrop-blur-md min-w-[280px]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] text-[#8e816a] uppercase tracking-widest font-mono block">
              Programmed Polynomial
            </span>
            <div className="font-serif text-[#ffd980] text-sm font-bold tracking-wide">
              {selectedPreset.name}
            </div>
            <div className="font-mono text-[#e3ded3] text-xs mt-0.5">
              {selectedPreset.formula}
            </div>
          </div>
          <button
            onClick={() => !isAutoRunning && setIsOpen(!isOpen)}
            disabled={isAutoRunning}
            className={`px-2.5 py-1.5 rounded border text-xs font-mono flex items-center gap-1.5 transition-all ${
              isAutoRunning
                ? 'bg-[#181a1f] text-[#525660] border-[#292c34] cursor-not-allowed'
                : 'bg-[#2a2215] text-[#f7d88b] border-[#8a652a] hover:border-[#daa520] hover:text-[#fff0cc]'
            }`}
          >
            <Settings size={13} className="text-[#daa520]" />
            <span>Select</span>
            <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Loading Animated Status */}
        {isLoadingAnimation && (
          <div className="mt-2.5 pt-2 border-t border-[#382f22] flex items-center justify-center gap-2 text-xs text-[#daa520] font-mono animate-pulse">
            <Sparkles size={13} />
            <span>Priming 248 Figure Wheels...</span>
          </div>
        )}
      </div>

      {/* Expanded Modal / Dropdown for Historical Presets & Custom Equation */}
      {isOpen && (
        <div className="mt-2 bg-[#121417]/96 border border-[#8a652a] rounded-sm p-4 shadow-2xl backdrop-blur-lg w-[380px] max-h-[540px] overflow-y-auto">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#382f22] pb-2 mb-3">
            <button
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1 text-xs font-serif uppercase tracking-wider text-center transition-all ${
                activeTab === 'presets'
                  ? 'text-[#daa520] font-bold border-b-2 border-[#daa520]'
                  : 'text-[#8e816a] hover:text-[#d6cbb6]'
              }`}
            >
              Historical Presets
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 py-1 text-xs font-serif uppercase tracking-wider text-center transition-all ${
                activeTab === 'custom'
                  ? 'text-[#daa520] font-bold border-b-2 border-[#daa520]'
                  : 'text-[#8e816a] hover:text-[#d6cbb6]'
              }`}
            >
              Custom Polynomial (≤ 7th)
            </button>
          </div>

          {/* Historical Presets Tab */}
          {activeTab === 'presets' && (
            <div className="flex flex-col gap-2">
              {HISTORICAL_PRESETS.map((preset) => {
                const isSelected = preset.id === currentPresetId;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-sm border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#2b2112] border-[#daa520] shadow-md'
                        : 'bg-[#17191d] border-[#292c34] hover:border-[#6b5228] hover:bg-[#1f1d18]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-[#f2e6cf]">
                        {preset.name}
                      </span>
                      {isSelected ? (
                        <span className="text-[#daa520] flex items-center text-[10px] font-mono gap-1">
                          <Check size={12} /> Primed
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-[#7d715d] uppercase">
                          Degree {preset.degree}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[#d4af37] text-xs mt-1">
                      {preset.formula}
                    </div>
                    <p className="text-[11px] text-[#a89e8b] font-serif italic mt-1 leading-snug">
                      {preset.description}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom Polynomial Editor Tab */}
          {activeTab === 'custom' && (
            <div className="flex flex-col gap-3">
              <p className="text-[11px] text-[#a89e8b] font-serif leading-snug">
                Configure coefficients $f(x) = a_7 x^7 + \dots + a_1 x + a_0$ across the 8 columns.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((power) => (
                  <div key={power} className="flex items-center bg-[#17191e] border border-[#2a2d36] rounded px-2 py-1">
                    <span className="text-[11px] font-mono text-[#daa520] w-10">
                      {power === 0 ? 'a₀' : `a_${power}`}:
                    </span>
                    <input
                      type="number"
                      value={customCoeffs[power] || 0}
                      onChange={(e) => handleCustomCoeffChange(power, e.target.value)}
                      className="w-full bg-transparent text-xs font-mono text-[#e8e4da] focus:outline-none text-right"
                    />
                  </div>
                ))}
              </div>

              {/* Starting X */}
              <div className="flex items-center justify-between bg-[#17191e] border border-[#2a2d36] rounded px-2 py-1.5">
                <span className="text-xs font-mono text-[#daa520]">Initial x:</span>
                <input
                  type="number"
                  value={customStartX}
                  onChange={(e) => setCustomStartX(parseInt(e.target.value, 10) || 0)}
                  className="w-20 bg-transparent text-xs font-mono text-[#e8e4da] focus:outline-none text-right"
                />
              </div>

              {/* Initial Difference Preview Plaque */}
              <div className="bg-[#0e1013] border border-[#28251e] p-2 rounded text-[10px] font-mono">
                <span className="text-[#8e816a] uppercase tracking-wider block mb-1">
                  Computed Column Seed Values:
                </span>
                <div className="grid grid-cols-4 gap-1 text-[#d6c7a7]">
                  {previewDifferences.map((diff, idx) => (
                    <div key={idx} className="truncate">
                      <span className="text-[#daa520]">Δ^{idx}:</span> {diff.toString()}
                    </div>
                  ))}
                </div>
              </div>

              {/* Load Engine Button */}
              <button
                onClick={() => triggerLoad(customCoeffs, customStartX, 'custom')}
                className="w-full py-2 px-3 rounded bg-gradient-to-b from-[#3a2c16] to-[#241a0b] text-[#ffebad] border border-[#daa520] font-serif text-xs font-bold uppercase tracking-widest hover:from-[#47361b] flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Load Engine & Prime Wheels</span>
                <ArrowRight size={13} className="text-[#daa520]" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
