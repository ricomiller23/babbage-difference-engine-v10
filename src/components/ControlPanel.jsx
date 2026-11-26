import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCw, 
  StepForward, 
  Volume2, 
  VolumeX, 
  Layers, 
  Tag, 
  BookOpen, 
  ListOrdered
} from 'lucide-react';
import { soundEngine } from '../audio/soundEffects.js';

export const ControlPanel = ({
  isAutoRunning,
  onToggleAutoRun,
  autoSpeed,
  onChangeAutoSpeed,
  onManualStep,
  currentPhase,
  isXRay,
  onToggleXRay,
  showLabels,
  onToggleLabels,
  cameraPreset,
  onChangeCameraPreset,
  isMuted,
  onToggleMute,
  onOpenHistory,
  onOpenLedger,
  isLedgerOpen
}) => {
  // Plain language descriptions for each mechanical calculating phase
  const phaseDescriptions = {
    0: { title: 'Rest / Primed', detail: 'Mechanism at top dead-center. Awaiting crank turn.' },
    1: { title: 'Phase I: Mechanical Addition', detail: 'Camshaft lifts sector gears; higher difference columns donate into adjacent receiving columns.' },
    2: { title: 'Phase II: Helical Carry Sweep', detail: 'Spiral carry shafts rotate 360°, sweeping arms upward to resolve 9→0 carries and ripple cascades.' },
    3: { title: 'Phase III: Typeface Alignment', detail: 'Slideway linkages index Column 0 digits onto the 31 printer lead typewheels.' },
    4: { title: 'Phase IV: Stereotype Impression', detail: 'Heavy hammer strikes typewheels into paper & plaster; paper feeds for next value.' }
  };

  const activePhaseInfo = phaseDescriptions[currentPhase] || phaseDescriptions[0];

  return (
    <div className="absolute top-4 left-4 z-20 flex flex-col gap-3 max-w-[360px] pointer-events-auto">
      {/* Victorian Engine Control Header Plaque */}
      <div className="bg-[#141518]/92 border border-[#8a652a] rounded-sm p-4 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Brass Screws in Corners */}
        <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#daa520] border border-[#523d14] flex items-center justify-center text-[7px] text-[#2e1508] font-bold">✕</div>
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#daa520] border border-[#523d14] flex items-center justify-center text-[7px] text-[#2e1508] font-bold">✕</div>
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-[#daa520] border border-[#523d14] flex items-center justify-center text-[7px] text-[#2e1508] font-bold">✕</div>
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-[#daa520] border border-[#523d14] flex items-center justify-center text-[7px] text-[#2e1508] font-bold">✕</div>

        <div className="flex items-center justify-between pb-2 border-b border-[#3b3223]">
          <div>
            <h1 className="font-serif text-[#f2e6cf] text-sm font-bold tracking-widest uppercase">
              Difference Engine No. 2
            </h1>
            <p className="text-[10px] text-[#b89758] tracking-wider uppercase font-mono">
              C. Babbage • 1849 / Swade • 1991
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleMute}
              title={isMuted ? "Unmute Mechanical Sound" : "Mute Sound"}
              className={`p-1.5 rounded border transition-all ${
                isMuted 
                  ? 'bg-[#211b15] text-[#8a7657] border-[#473b2b]' 
                  : 'bg-[#2a2215] text-[#f7d88b] border-[#8a652a] hover:border-[#daa520]'
              }`}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <button
              onClick={onOpenHistory}
              title="Exhibition History & Design Notes"
              className="p-1.5 rounded bg-[#2a2215] text-[#f7d88b] border border-[#8a652a] hover:border-[#daa520] transition-all"
            >
              <BookOpen size={14} />
            </button>
          </div>
        </div>

        {/* Phase Status Readout */}
        <div className="mt-3 bg-[#0d0e11] border border-[#2b251b] p-2.5 rounded-sm">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#8e816a] uppercase tracking-wider font-mono">Mechanical Cycle</span>
            <span className="text-[#daa520] font-bold tracking-wider uppercase text-[10px]">
              {activePhaseInfo.title}
            </span>
          </div>
          <p className="text-[11px] text-[#d6cdb8] leading-tight font-serif italic">
            "{activePhaseInfo.detail}"
          </p>

          {/* 4-Step Cycle Indicator Dots */}
          <div className="grid grid-cols-4 gap-1.5 mt-2.5">
            {[1, 2, 3, 4].map((step) => {
              const isActive = currentPhase === step;
              const isPast = currentPhase > step;
              return (
                <div
                  key={step}
                  className={`h-1.5 rounded-sm transition-all ${
                    isActive 
                      ? 'bg-[#daa520] shadow-[0_0_8px_#daa520]' 
                      : isPast 
                      ? 'bg-[#6b5327]' 
                      : 'bg-[#24262c]'
                  }`}
                  title={`Sub-Phase ${step}`}
                />
              );
            })}
          </div>
        </div>

        {/* Primary Mechanical Controls */}
        <div className="mt-3.5 flex flex-col gap-2">
          {/* Turn Crank One Full Cycle Button */}
          <button
            onClick={() => {
              soundEngine.playCrankTick();
              onManualStep(false);
            }}
            disabled={isAutoRunning}
            className={`w-full py-2.5 px-3 rounded flex items-center justify-center gap-2 border font-serif text-xs font-bold uppercase tracking-widest transition-all shadow-lg ${
              isAutoRunning
                ? 'bg-[#1a1b20] text-[#555861] border-[#292c34] cursor-not-allowed'
                : 'bg-gradient-to-b from-[#3a2c16] via-[#2d2211] to-[#1e160a] text-[#ffebad] border-[#daa520] hover:border-[#ffe28a] hover:from-[#47361b] active:scale-[0.98]'
            }`}
          >
            <RotateCw size={15} className="text-[#daa520]" />
            Turn Crank (1 Full Cycle)
          </button>

          <div className="grid grid-cols-2 gap-2">
            {/* Step Sub-Phase Button */}
            <button
              onClick={() => {
                soundEngine.playGearRatchet();
                onManualStep(true);
              }}
              disabled={isAutoRunning}
              className={`py-2 px-2.5 rounded border text-[11px] font-mono tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                isAutoRunning
                  ? 'bg-[#1a1b20] text-[#555861] border-[#292c34] cursor-not-allowed'
                  : 'bg-[#201912] text-[#d6c7a7] border-[#6b522b] hover:border-[#b8860b] hover:text-[#fff0cc]'
              }`}
            >
              <StepForward size={13} className="text-[#b8860b]" />
              Step Sub-Phase
            </button>

            {/* Auto-Run Toggle */}
            <button
              onClick={onToggleAutoRun}
              className={`py-2 px-2.5 rounded border text-[11px] font-mono tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                isAutoRunning
                  ? 'bg-[#3b1212] text-[#ff9999] border-[#aa3333] hover:bg-[#4d1919]'
                  : 'bg-[#1b2518] text-[#b4e6a8] border-[#3e6634] hover:bg-[#23351f]'
              }`}
            >
              {isAutoRunning ? (
                <>
                  <Pause size={13} />
                  Halt Engine
                </>
              ) : (
                <>
                  <Play size={13} />
                  Continuous Run
                </>
              )}
            </button>
          </div>

          {/* Speed Slider for Auto-Run */}
          {isAutoRunning && (
            <div className="flex items-center gap-2 px-2 py-1 bg-[#0f1013] border border-[#2b2316] rounded mt-1">
              <span className="text-[10px] text-[#8e816a] font-mono uppercase">Speed:</span>
              <input
                type="range"
                min="0.3"
                max="3"
                step="0.1"
                value={autoSpeed}
                onChange={(e) => onChangeAutoSpeed(parseFloat(e.target.value))}
                className="w-full accent-[#daa520] h-1 bg-[#26241e] rounded"
              />
              <span className="text-[10px] text-[#f2e2be] font-mono w-7 text-right">
                {autoSpeed.toFixed(1)}x
              </span>
            </div>
          )}
        </div>

        {/* View and Inspection Toggles */}
        <div className="mt-3.5 pt-3 border-t border-[#3b3223] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleXRay}
              title="Exploded X-Ray Mode: Make frame translucent to view internal gear trains"
              className={`px-2 py-1 rounded text-[10px] font-mono tracking-wider border flex items-center gap-1 transition-all ${
                isXRay 
                  ? 'bg-[#3d321d] text-[#ffe6a3] border-[#daa520]' 
                  : 'bg-[#1a1713] text-[#9c8e76] border-[#423727] hover:border-[#735e3e]'
              }`}
            >
              <Layers size={12} />
              X-Ray
            </button>

            <button
              onClick={onToggleLabels}
              title="Toggle Subsystem Identification Pins"
              className={`px-2 py-1 rounded text-[10px] font-mono tracking-wider border flex items-center gap-1 transition-all ${
                showLabels 
                  ? 'bg-[#3d321d] text-[#ffe6a3] border-[#daa520]' 
                  : 'bg-[#1a1713] text-[#9c8e76] border-[#423727] hover:border-[#735e3e]'
              }`}
            >
              <Tag size={12} />
              Labels
            </button>
          </div>

          <button
            onClick={onOpenLedger}
            className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-wider border flex items-center gap-1.5 transition-all ${
              isLedgerOpen
                ? 'bg-[#3d321d] text-[#ffe6a3] border-[#daa520]'
                : 'bg-[#1e1913] text-[#d6c7a7] border-[#6b522b] hover:border-[#b8860b]'
            }`}
          >
            <ListOrdered size={12} className="text-[#daa520]" />
            31-Digit Ledger
          </button>
        </div>

        {/* Camera Tour Preset Selector */}
        <div className="mt-3">
          <span className="text-[9px] text-[#8e816a] font-mono uppercase tracking-widest block mb-1.5">
            Observational Viewpoint (Tour)
          </span>
          <div className="grid grid-cols-5 gap-1">
            {[
              { id: 'full', label: 'Full' },
              { id: 'columns', label: 'Columns' },
              { id: 'carriage', label: 'Carry' },
              { id: 'printer', label: 'Printer' },
              { id: 'crank', label: 'Crank' }
            ].map((cam) => {
              const isSelected = cameraPreset === cam.id;
              return (
                <button
                  key={cam.id}
                  onClick={() => onChangeCameraPreset(cam.id)}
                  className={`py-1 text-[9px] font-mono uppercase tracking-wider rounded border transition-all ${
                    isSelected
                      ? 'bg-[#daa520] text-[#1e160a] border-[#ffe28a] font-bold shadow-sm'
                      : 'bg-[#181613] text-[#a89980] border-[#382f22] hover:border-[#6e5836] hover:text-[#f0e3cc]'
                  }`}
                >
                  {cam.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
