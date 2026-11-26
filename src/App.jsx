import React, { useState, useRef, useCallback } from 'react';
import { DifferenceEngineState, HISTORICAL_PRESETS } from './math/finiteDifferences.js';
import { soundEngine } from './audio/soundEffects.js';
import { DifferenceEngine3D } from './components/DifferenceEngine3D.jsx';
import { ControlPanel } from './components/ControlPanel.jsx';
import { PolynomialSelector } from './components/PolynomialSelector.jsx';
import { PrinterOutput } from './components/PrinterOutput.jsx';
import { LedgerTable } from './components/LedgerTable.jsx';
import { HistoryModal } from './components/HistoryModal.jsx';
import { Landmark, Sparkles } from 'lucide-react';

export default function App() {
  const initialPreset = HISTORICAL_PRESETS[0]; // Euler primes
  const [engine, setEngine] = useState(() => new DifferenceEngineState(initialPreset.coefficients, 0));
  const engine3DRef = useRef(null);

  const [currentPresetId, setCurrentPresetId] = useState(initialPreset.id);
  const [currentCoeffs, setCurrentCoeffs] = useState([...initialPreset.coefficients]);
  const [startX, setStartX] = useState(0);

  // Operating Modes
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [autoSpeed, setAutoSpeed] = useState(1.0);
  const [currentPhase, setCurrentPhase] = useState(0); // 0: Idle, 1: Add, 2: Carry, 3: Typeface, 4: Print

  // View & Audio Settings
  const [isXRay, setIsXRay] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [cameraPreset, setCameraPreset] = useState('full');
  const [isMuted, setIsMuted] = useState(false);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);

  // Find active preset metadata
  const activePreset = HISTORICAL_PRESETS.find(p => p.id === currentPresetId) || {
    name: 'Custom Polynomial',
    formula: 'f(x) custom function'
  };

  /**
   * Helper to trigger state change and re-render
   */
  const triggerEngineUpdate = useCallback((mutator) => {
    setEngine((prev) => {
      mutator(prev);
      // Return new object reference with same prototype to trigger React 19 render
      const copy = Object.assign(Object.create(Object.getPrototypeOf(prev)), prev);
      return copy;
    });
  }, []);

  /**
   * Called when 3D crank handle completes a full 360° turn (either manual or auto-run)
   */
  const handleCrankTurned = useCallback(() => {
    triggerEngineUpdate((eng) => {
      eng.executeFullCycle();
    });
    soundEngine.playPrinterStamp();
    setCurrentPhase(0);
  }, [triggerEngineUpdate]);

  /**
   * Manual Crank Operation:
   * isSubPhase = true -> Advances step-by-step through phases 1 to 4
   * isSubPhase = false -> Runs complete 1 full cycle
   */
  const handleManualStep = useCallback((isSubPhase = false) => {
    if (isSubPhase) {
      const nextPhase = (currentPhase % 4) + 1;
      if (nextPhase === 1) {
        triggerEngineUpdate((eng) => eng.executeAdditionPhase());
        soundEngine.playGearRatchet();
        if (engine3DRef.current) engine3DRef.current.triggerCrankStep(90);
      } else if (nextPhase === 2) {
        let carriesCount = 0;
        triggerEngineUpdate((eng) => {
          const carries = eng.executeCarryPhase();
          carriesCount = carries.length;
        });
        soundEngine.playHelicalSweep(carriesCount);
        if (engine3DRef.current) engine3DRef.current.triggerCrankStep(120);
      } else if (nextPhase === 3) {
        triggerEngineUpdate((eng) => eng.executeTypefaceAlignPhase());
        soundEngine.playPrinterAlign();
        if (engine3DRef.current) engine3DRef.current.triggerCrankStep(60);
      } else if (nextPhase === 4) {
        triggerEngineUpdate((eng) => eng.executePrintPhase());
        soundEngine.playPrinterStamp();
        if (engine3DRef.current) engine3DRef.current.triggerCrankStep(90);
      }
      setCurrentPhase(nextPhase === 4 ? 0 : nextPhase);
    } else {
      handleCrankTurned();
      if (engine3DRef.current) {
        engine3DRef.current.triggerCrankStep(360);
      }
    }
  }, [currentPhase, handleCrankTurned, triggerEngineUpdate]);

  /**
   * Load a new polynomial into the Difference Engine
   */
  const handleLoadPolynomial = useCallback((coeffs, startVal, presetId) => {
    setIsAutoRunning(false);
    setCurrentPresetId(presetId);
    setCurrentCoeffs([...coeffs]);
    setStartX(startVal);
    setEngine(new DifferenceEngineState(coeffs, startVal));
    setCurrentPhase(0);
  }, []);

  /**
   * Clear Printed Paper Roll
   */
  const handleClearHistory = useCallback(() => {
    triggerEngineUpdate((eng) => {
      eng.history = [
        {
          cycle: 0,
          x: eng.x,
          value: eng.getColumnValue(0),
          differences: Array.from({ length: 8 }, (_, c) => eng.getColumnValue(c)),
          formattedOutput: eng.formatValue(eng.getColumnValue(0)),
          timestamp: Date.now()
        }
      ];
    });
  }, [triggerEngineUpdate]);

  const handleToggleMute = useCallback(() => {
    const nextMute = soundEngine.toggleMute();
    setIsMuted(nextMute);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0b0c0e] text-[#f2ede4] select-none font-sans">
      {/* 3D WebGL Difference Engine Canvas */}
      <DifferenceEngine3D
        ref={engine3DRef}
        engineState={engine}
        isXRay={isXRay}
        showLabels={showLabels}
        cameraPreset={cameraPreset}
        onCrankTurned={handleCrankTurned}
        isAutoRunning={isAutoRunning}
        autoSpeed={autoSpeed}
      />

      {/* Museum Exhibition Top Banner (Center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden md:flex items-center gap-3 bg-[#131518]/85 border border-[#8a652a] px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 text-[#daa520] font-serif text-xs uppercase tracking-widest font-bold">
          <Landmark size={14} />
          <span>Science Museum London Reference</span>
        </div>
        <div className="w-[1px] h-3.5 bg-[#423724]" />
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#b89e70]">
          <span>8,000 Bronze/Steel Parts</span>
          <span>•</span>
          <span>5 Long Tons</span>
          <span>•</span>
          <span>31-Digit Precision</span>
        </div>
      </div>

      {/* Top Left: Engine Control Panel */}
      <ControlPanel
        isAutoRunning={isAutoRunning}
        onToggleAutoRun={() => setIsAutoRunning(!isAutoRunning)}
        autoSpeed={autoSpeed}
        onChangeAutoSpeed={setAutoSpeed}
        onManualStep={handleManualStep}
        currentPhase={currentPhase}
        isXRay={isXRay}
        onToggleXRay={() => setIsXRay(!isXRay)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
        cameraPreset={cameraPreset}
        onChangeCameraPreset={setCameraPreset}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenLedger={() => setIsLedgerOpen(true)}
        isLedgerOpen={isLedgerOpen}
      />

      {/* Top Right: Polynomial Selector & Presets */}
      <PolynomialSelector
        currentPresetId={currentPresetId}
        currentCoeffs={currentCoeffs}
        startX={startX}
        onLoadPolynomial={handleLoadPolynomial}
        isAutoRunning={isAutoRunning}
      />

      {/* Bottom Left: Integral Stamped Paper Roll Output */}
      <PrinterOutput
        history={engine.history}
        polynomialFormula={activePreset.formula}
        onClearHistory={handleClearHistory}
      />

      {/* Bottom Right: Quick Telemetry & Status Badge */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none flex flex-col items-end gap-1.5">
        <div className="bg-[#141518]/90 border border-[#8a652a] px-3.5 py-2 rounded-sm shadow-xl backdrop-blur-md flex items-center gap-3">
          <div>
            <span className="text-[9px] text-[#8e816a] uppercase tracking-widest font-mono block">
              Latest Output
            </span>
            <div className="font-mono text-sm text-[#ffd980] font-bold">
              f({engine.x}) = {engine.getColumnValue(0).toString()}
            </div>
          </div>
          <div className="w-[1px] h-7 bg-[#382f22]" />
          <div className="text-right">
            <span className="text-[9px] text-[#8e816a] uppercase tracking-widest font-mono block">
              Cycle Count
            </span>
            <div className="font-mono text-xs text-[#e8e2d5]">
              #{engine.history.length - 1} Completed
            </div>
          </div>
        </div>

        <div className="text-[9px] font-serif italic text-[#7d715d] flex items-center gap-1">
          <Sparkles size={10} className="text-[#daa520]" />
          <span>Click & drag 3D scene to orbit • Scroll to zoom</span>
        </div>
      </div>

      {/* Modals */}
      <LedgerTable
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        engineState={engine}
        history={engine.history}
        currentPresetName={activePreset.name}
        polynomialFormula={activePreset.formula}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
}
