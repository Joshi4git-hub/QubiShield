"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import SimulationScene, { SimulationStage } from "@/components/SimulationScene";
import {
  runBB84Simulation,
  SimulationConfig,
  SimulationResult,
  QubitRecord,
} from "@/lib/bb84";

export type TableFilter =
  | "all"
  | "intercepted"
  | "not_intercepted"
  | "sifted"
  | "discarded"
  | "errors"
  | "test_sample";

interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  numQubits: number;
  eveEnabled: boolean;
  eveProbability: number;
  channelNoise: number;
}

const PRESETS: ScenarioPreset[] = [
  {
    id: "ideal",
    name: "Ideal Channel",
    description: "No Eve, 0% Noise: Perfect transmission, 0% error rate.",
    numQubits: 16,
    eveEnabled: false,
    eveProbability: 0.0,
    channelNoise: 0.0,
  },
  {
    id: "full_eve",
    name: "Full Intercept (100%)",
    description: "Eve intercepts every qubit: Induces ~25% QBER in sifted bits.",
    numQubits: 16,
    eveEnabled: true,
    eveProbability: 1.0,
    channelNoise: 0.0,
  },
  {
    id: "partial_eve",
    name: "Partial Intercept (50%)",
    description: "Eve intercepts half: Induces ~12.5% QBER.",
    numQubits: 16,
    eveEnabled: true,
    eveProbability: 0.5,
    channelNoise: 0.0,
  },
  {
    id: "noisy_channel",
    name: "Noisy Channel (10%)",
    description: "Eve OFF, 10% Noise: Thermal/fiber noise induces ~10% QBER.",
    numQubits: 16,
    eveEnabled: false,
    eveProbability: 0.0,
    channelNoise: 0.1,
  },
  {
    id: "combined",
    name: "Eve (100%) + Noise (10%)",
    description: "Full eavesdropping plus channel noise: Combined ~30% QBER.",
    numQubits: 16,
    eveEnabled: true,
    eveProbability: 1.0,
    channelNoise: 0.1,
  },
];

export default function SimulationPage() {
  // Configuration State
  const [numQubits, setNumQubits] = useState<number>(16);
  const [eveEnabled, setEveEnabled] = useState<boolean>(true);
  const [eveProbability, setEveProbability] = useState<number>(1.0);
  const [channelNoise, setChannelNoise] = useState<number>(0.0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0); // 0.5x, 1x, 2x
  const [mode, setMode] = useState<"explore" | "guided">("explore");
  const [tableFilter, setTableFilter] = useState<TableFilter>("all");

  // Simulation State — initialized directly to avoid setState-in-effect
  const [simResult, setSimResult] = useState<SimulationResult>(() =>
    runBB84Simulation({
      numQubits: 16,
      eveEnabled: true,
      eveProbability: 1.0,
      channelNoise: 0.0,
      testFraction: 0.4,
    })
  );

  const [currentQubitIndex, setCurrentQubitIndex] = useState<number>(0);
  const [stage, setStage] = useState<SimulationStage>("idle");
  const [subProgress, setSubProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [explanationOpen, setExplanationOpen] = useState<boolean>(false);

  // Animation Frame / Timer Reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a simulation dataset
  const generateNewSimulation = useCallback(
    (overrides?: Partial<SimulationConfig>) => {
      const config: SimulationConfig = {
        numQubits: overrides?.numQubits ?? numQubits,
        eveEnabled: overrides?.eveEnabled ?? eveEnabled,
        eveProbability: overrides?.eveProbability ?? eveProbability,
        channelNoise: overrides?.channelNoise ?? channelNoise,
        testFraction: 0.4,
      };
      const result = runBB84Simulation(config);
      setSimResult(result);
      setCurrentQubitIndex(0);
      setStage("idle");
      setSubProgress(0);
      setIsPlaying(false);
    },
    [numQubits, eveEnabled, eveProbability, channelNoise]
  );

  // Preset Selection
  const applyPreset = (preset: ScenarioPreset) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setNumQubits(preset.numQubits);
    setEveEnabled(preset.eveEnabled);
    setEveProbability(preset.eveProbability);
    setChannelNoise(preset.channelNoise);
    generateNewSimulation({
      numQubits: preset.numQubits,
      eveEnabled: preset.eveEnabled,
      eveProbability: preset.eveProbability,
      channelNoise: preset.channelNoise,
    });
  };

  // Reset
  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    generateNewSimulation();
  };

  // Step Forward manually (protocol timeline execution)
  const stepForward = useCallback(() => {
    if (!simResult || simResult.qubits.length === 0) return;

    setStage((prevStage) => {
      if (prevStage === "idle") {
        return "prep";
      }
      if (prevStage === "prep") {
        setSubProgress(0.5);
        return "transmission";
      }
      if (prevStage === "transmission") {
        const currentQubit = simResult.qubits[currentQubitIndex];
        // If intercepted: Eve stage executes. Otherwise: Eve stage is skipped!
        if (currentQubit && currentQubit.eveIntercepted) {
          return "eve_intercept";
        }
        return "bob_measure";
      }
      if (prevStage === "eve_intercept") {
        return "bob_measure";
      }
      if (prevStage === "bob_measure") {
        if (currentQubitIndex + 1 < simResult.qubits.length) {
          setCurrentQubitIndex((idx) => idx + 1);
          setSubProgress(0);
          return "prep";
        } else {
          // After all qubits are measured, Basis Reconciliation executes
          return "reconcile";
        }
      }
      if (prevStage === "reconcile") {
        // Basis reconciliation is followed by Error Detection
        return "error_detection";
      }
      if (prevStage === "error_detection") {
        setIsPlaying(false);
        return "completed";
      }
      return prevStage;
    });
  }, [simResult, currentQubitIndex]);

  // Auto-play loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalTime = Math.max(120, Math.floor(400 / playbackSpeed));
    timerRef.current = setInterval(() => {
      setStage((prevStage) => {
        if (prevStage === "idle") {
          return "prep";
        }
        if (prevStage === "prep") {
          return "transmission";
        }
        if (prevStage === "transmission") {
          const currentQubit = simResult?.qubits[currentQubitIndex];
          if (currentQubit && currentQubit.eveIntercepted) {
            return "eve_intercept";
          }
          return "bob_measure";
        }
        if (prevStage === "eve_intercept") {
          return "bob_measure";
        }
        if (prevStage === "bob_measure") {
          if (simResult && currentQubitIndex + 1 < simResult.qubits.length) {
            setCurrentQubitIndex((idx) => idx + 1);
            return "prep";
          } else {
            return "reconcile";
          }
        }
        if (prevStage === "reconcile") {
          return "error_detection";
        }
        if (prevStage === "error_detection") {
          setIsPlaying(false);
          return "completed";
        }
        if (prevStage === "completed") {
          setIsPlaying(false);
          return "completed";
        }
        return prevStage;
      });
    }, intervalTime);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, simResult, currentQubitIndex]);

  const activeQubit: QubitRecord | null =
    simResult && simResult.qubits[currentQubitIndex] ? simResult.qubits[currentQubitIndex] : null;

  // Timeline progress highlight (1 through 6)
  const getTimelineStepIndex = () => {
    switch (stage) {
      case "idle":
        return 0;
      case "prep":
        return 1;
      case "transmission":
        return 2;
      case "eve_intercept":
        return 3;
      case "bob_measure":
        return 4;
      case "reconcile":
        return 5;
      case "error_detection":
        return 6;
      case "completed":
        return 7;
      default:
        return 0;
    }
  };

  const timelineStep = getTimelineStepIndex();

  // CSV Export
  const handleExportCSV = () => {
    if (!simResult) return;
    const headers = [
      "Qubit_Index",
      "Alice_Bit",
      "Alice_Basis",
      "Eve_Intercepted",
      "Eve_Basis",
      "Eve_Measured_Bit",
      "Bob_Basis",
      "Bob_Measured_Bit",
      "Bases_Match",
      "Is_Sifted",
      "Is_Test_Bit",
      "Is_Error",
      "Final_Status",
    ];
    const rows = simResult.qubits.map((q) => [
      q.index,
      q.aliceBit,
      q.aliceBasis,
      q.eveIntercepted ? "Yes" : "No",
      q.eveBasis ?? "N/A",
      q.eveMeasuredBit ?? "N/A",
      q.bobBasis,
      q.bobMeasuredBit,
      q.basesMatch ? "Match" : "Discard",
      q.isSifted ? "Yes" : "No",
      q.isTestBit ? "Yes" : "No",
      q.isError ? "Error" : "OK",
      !q.isSifted
        ? "Discarded"
        : q.isTestBit
        ? q.isError
          ? "Test_Error"
          : "Test_Match"
        : "Candidate_Key",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `qubitshield_bb84_simulation_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered rows for the results table
  const filteredQubits = simResult
    ? simResult.qubits.filter((q) => {
        if (tableFilter === "intercepted") return q.eveIntercepted;
        if (tableFilter === "not_intercepted") return !q.eveIntercepted;
        if (tableFilter === "sifted") return q.isSifted;
        if (tableFilter === "discarded") return !q.isSifted;
        if (tableFilter === "errors")
          return (q.isTestBit && q.isError) || (q.isSifted && q.aliceBit !== q.bobMeasuredBit);
        if (tableFilter === "test_sample") return q.isTestBit;
        return true;
      })
    : [];

  return (
    <main className="relative min-h-screen w-full bg-[#040308] text-white selection:bg-violet-500 selection:text-white pb-28">
      {/* Shared Navigation */}
      <Navbar />

      <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        {/* Preset Scenarios Header */}
        <section className="mb-6 max-w-7xl mx-auto">
          <div className="p-4 rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-xs uppercase tracking-[0.2em] text-violet-400 font-mono font-semibold">
                  Scenario Presets
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Select a classic BB84 scenario to test protocol mechanics under varying quantum channel conditions.
                </p>
              </div>

              {/* Guided Mode vs Explore Mode Toggle */}
              <div className="flex items-center space-x-1.5 p-1 rounded-lg border border-white/[0.08] bg-black/40 text-xs">
                <button
                  type="button"
                  onClick={() => setMode("explore")}
                  className={`px-3 py-1 rounded text-[11px] font-medium transition-all ${
                    mode === "explore"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Explore Mode
                </button>
                <button
                  type="button"
                  onClick={() => setMode("guided")}
                  className={`px-3 py-1 rounded text-[11px] font-medium transition-all ${
                    mode === "guided"
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Guided Mode
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {PRESETS.map((preset) => {
                const isSelected =
                  numQubits === preset.numQubits &&
                  eveEnabled === preset.eveEnabled &&
                  eveProbability === preset.eveProbability &&
                  channelNoise === preset.channelNoise;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className={`p-2.5 rounded-lg text-left border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? "border-violet-500 bg-violet-950/40 text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                        : "border-white/[0.05] bg-white/[0.02] text-zinc-300 hover:bg-white/[0.05] hover:border-white/[0.1]"
                    }`}
                  >
                    <span className="font-semibold tracking-wide text-zinc-200">{preset.name}</span>
                    <span className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{preset.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Guided Mode Pedagogical Callout */}
        {mode === "guided" && (
          <section className="mb-6 max-w-7xl mx-auto">
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 backdrop-blur-md">
              <div className="flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 mt-1 animate-pulse shrink-0" />
                <div>
                  <h4 className="text-xs uppercase font-mono font-semibold tracking-wider text-indigo-300 mb-1">
                    Guided Walkthrough — Stage Explanation
                  </h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {stage === "idle" &&
                      "Simulation is ready. Click 'Start' to begin the protocol transmission, or 'Step' to inspect individual quantum operations one by one."}
                    {stage === "prep" &&
                      `Alice generates a random bit (${activeQubit?.aliceBit}) and encodes it into a polarized photon using the ${
                        activeQubit?.aliceBasis === "+" ? "Rectilinear (+)" : "Diagonal (×)"
                      } basis. Due to the No-Cloning Theorem, unknown quantum states cannot be duplicated without alteration.`}
                    {stage === "transmission" &&
                      (activeQubit?.eveIntercepted
                        ? "The photon traverses the optical channel and enters Eve's interception beam path."
                        : "The photon travels directly through the channel unperturbed. Eve's interception did not trigger for this qubit.")}
                    {stage === "eve_intercept" &&
                      `Eve intercepts the qubit! She measures it using the ${
                        activeQubit?.eveBasis === "+" ? "Rectilinear (+)" : "Diagonal (×)"
                      } basis and obtains bit ${
                        activeQubit?.eveMeasuredBit
                      }. She resends a new photon prepared in her measurement basis, altering any qubit where her basis guessed incorrectly.`}
                    {stage === "bob_measure" &&
                      `Bob independently selects the ${
                        activeQubit?.bobBasis === "+" ? "Rectilinear (+)" : "Diagonal (×)"
                      } basis and measures the incoming photon, obtaining bit ${
                        activeQubit?.bobMeasuredBit
                      }.`}
                    {stage === "reconcile" &&
                      "All qubits have been measured. Alice and Bob publicly announce their basis choices over an authenticated classical channel. Matching bases form the Sifted Key; mismatched bases are permanently discarded."}
                    {stage === "error_detection" &&
                      "Alice and Bob randomly reveal a fraction of their sifted bits to calculate the Quantum Bit Error Rate (QBER). If QBER > 11%, the channel is compromised and the key exchange is aborted."}
                    {stage === "completed" && simResult.statusMessage}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Side-by-side: 3D Scene (left) + Controls Sidebar (right) */}
        <div className="flex flex-col lg:flex-row gap-5 mb-8">
          {/* LEFT — 3D Simulation Scene */}
          <section className="w-full lg:w-[65%] shrink-0">
            <SimulationScene
              stage={stage}
              progress={subProgress}
              currentQubit={activeQubit}
              eveEnabled={eveEnabled}
              qubitIndex={currentQubitIndex}
              totalQubits={numQubits}
            />
          </section>

          {/* RIGHT — Sidebar: Timeline + Controls */}
          <aside className="w-full lg:w-[35%] flex flex-col gap-4">
            {/* Timeline Steps (vertical) */}
            <div className="p-4 rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-3">
                Protocol Stage
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { num: "01", label: "Alice Prepares" },
                  { num: "02", label: "Transmission" },
                  { num: "03", label: "Eve Intercepts" },
                  { num: "04", label: "Bob Measures" },
                  { num: "05", label: "Basis Reconciliation" },
                  { num: "06", label: "Error Detection" },
                ].map((step, idx) => {
                  const isPast = timelineStep > idx + 1;
                  const isCurrent = timelineStep === idx + 1;
                  return (
                    <div
                      key={step.num}
                      className={`flex items-center space-x-2.5 text-xs uppercase tracking-wider transition-colors duration-300 ${
                        isCurrent
                          ? "text-violet-400 font-semibold"
                          : isPast
                          ? "text-zinc-300 font-medium"
                          : "text-zinc-600 font-normal"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border shrink-0 transition-all ${
                          isCurrent
                            ? "border-violet-400 bg-violet-950/60 shadow-[0_0_10px_#a855f7]"
                            : isPast
                            ? "border-zinc-700 bg-zinc-900 text-zinc-300"
                            : "border-zinc-800 text-zinc-600"
                        }`}
                      >
                        {step.num}
                      </span>
                      <span>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md flex flex-col gap-4">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono">Controls</h3>

              {/* Number of Qubits */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-400 flex justify-between">
                  <span>Number of Qubits</span>
                  <span className="text-violet-400 font-semibold">{numQubits}</span>
                </label>
                <input
                  type="range"
                  min={8}
                  max={32}
                  step={4}
                  value={numQubits}
                  onChange={(e) => {
                    const count = parseInt(e.target.value);
                    setNumQubits(count);
                    generateNewSimulation({ numQubits: count });
                  }}
                  className="w-full accent-violet-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  aria-label="Number of Qubits"
                />
              </div>

              {/* Eve Interception Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-white/[0.04] bg-white/[0.02]">
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wider text-zinc-300 font-medium">
                    Eve Eavesdropping
                  </span>
                  <span className="text-[10px] text-zinc-500">Intercept &amp; Resend attack</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextEnabled = !eveEnabled;
                    setEveEnabled(nextEnabled);
                    generateNewSimulation({ eveEnabled: nextEnabled });
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    eveEnabled ? "bg-rose-500" : "bg-zinc-800"
                  }`}
                  aria-label="Toggle Eve Eavesdropping"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      eveEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Eve Probability Slider (Supports 0% to 100%) */}
              <div
                className={`flex flex-col space-y-2 transition-opacity ${
                  eveEnabled ? "opacity-100" : "opacity-40"
                }`}
              >
                <label className="text-xs uppercase tracking-wider text-zinc-400 flex justify-between">
                  <span>Eve Intercept Prob</span>
                  <span className="text-rose-400 font-semibold">
                    {Math.round(eveProbability * 100)}%
                  </span>
                </label>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.05}
                  disabled={!eveEnabled}
                  value={eveProbability}
                  onChange={(e) => {
                    const prob = parseFloat(e.target.value);
                    setEveProbability(prob);
                    generateNewSimulation({ eveProbability: prob });
                  }}
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  aria-label="Eve Intercept Probability"
                />
              </div>

              {/* Channel Noise Slider */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs uppercase tracking-wider text-zinc-400 flex justify-between">
                  <span>Channel Noise</span>
                  <span className="text-cyan-400 font-semibold">
                    {Math.round(channelNoise * 100)}%
                  </span>
                </label>
                <input
                  type="range"
                  min={0.0}
                  max={0.25}
                  step={0.05}
                  value={channelNoise}
                  onChange={(e) => {
                    const noise = parseFloat(e.target.value);
                    setChannelNoise(noise);
                    generateNewSimulation({ channelNoise: noise });
                  }}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  aria-label="Channel Noise"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Start / Pause */}
                <button
                  type="button"
                  onClick={() => {
                    if (stage === "completed") {
                      generateNewSimulation();
                      setIsPlaying(true);
                    } else {
                      setIsPlaying(!isPlaying);
                    }
                  }}
                  className={`px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider font-semibold transition-all shadow-lg ${
                    isPlaying
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40"
                      : "bg-violet-600 hover:bg-violet-500 text-white shadow-violet-950/50"
                  }`}
                >
                  {isPlaying ? "Pause" : stage === "completed" ? "Restart" : "Start"}
                </button>

                {/* Step */}
                <button
                  type="button"
                  onClick={stepForward}
                  disabled={isPlaying || stage === "completed"}
                  className="px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-medium border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  Step
                </button>

                {/* Reset */}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider font-medium border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Playback Speed */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-zinc-500 text-[11px] uppercase tracking-wider">Speed:</span>
                {[0.5, 1.0, 2.0].map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                      playbackSpeed === spd
                        ? "border-violet-500 bg-violet-950/60 text-violet-300"
                        : "border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Below the side-by-side area: full-width content */}
        <div className="max-w-7xl mx-auto">
          {/* 4. Metrics Panel */}
          {simResult && (
            <section className="mb-10">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3 sm:gap-4 mb-4">
                {/* Total Qubits */}
                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400">Total Qubits</span>
                  <span className="text-2xl font-bold text-white mt-1">{simResult.totalQubits}</span>
                </div>

                {/* Eve Interceptions */}
                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400">Eve Intercepts</span>
                  <span
                    className={`text-2xl font-bold mt-1 ${
                      simResult.eveInterceptionCount > 0 ? "text-rose-400" : "text-zinc-300"
                    }`}
                  >
                    {simResult.eveInterceptionCount}
                  </span>
                </div>

                {/* Matching Bases */}
                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400">Matching Bases</span>
                  <span className="text-2xl font-bold text-violet-400 mt-1">{simResult.matchingBasesCount}</span>
                  <span className="text-[10px] text-zinc-600 mt-0.5">Discarded: {simResult.discardedCount}</span>
                </div>

                {/* Sifted Key Length */}
                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400">Sifted Key</span>
                  <span className="text-2xl font-bold text-indigo-400 mt-1">{simResult.siftedKeyLength}</span>
                </div>

                {/* Test Sample */}
                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400">Test Sample</span>
                  <span className="text-2xl font-bold text-cyan-400 mt-1">{simResult.testSampleSize}</span>
                  <span className="text-[10px] text-zinc-600 mt-0.5">of {simResult.siftedKeyLength} sifted</span>
                </div>

                {/* Detected Errors */}
                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400">Detected Errors</span>
                  <span
                    className={`text-2xl font-bold mt-1 ${
                      simResult.detectedErrorsCount > 0 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {simResult.detectedErrorsCount}
                  </span>
                  <span className="text-[10px] text-zinc-600 mt-0.5">in test sample</span>
                </div>

                {/* QBER — null-safe */}
                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md flex flex-col">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400">QBER</span>
                  {simResult.qber === null ? (
                    <span className="text-sm font-bold mt-1 text-zinc-500">Unavailable</span>
                  ) : (
                    <>
                      <span
                        className={`text-2xl font-bold mt-1 ${
                          simResult.qber > 0.11 ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {(simResult.qber * 100).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-zinc-600 mt-0.5">
                        {simResult.detectedErrorsCount}/{simResult.testSampleSize} tested
                      </span>
                    </>
                  )}
                </div>

                {/* Protocol Status */}
                <div className="p-4 rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md flex flex-col justify-center">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-400">Protocol Status</span>
                  <div className="mt-1 flex items-center space-x-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full animate-pulse shrink-0 ${
                        simResult.protocolStatus === "candidate"
                          ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                          : simResult.protocolStatus === "aborted"
                          ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
                          : "bg-zinc-600"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-semibold tracking-wide uppercase leading-tight ${
                        simResult.protocolStatus === "candidate"
                          ? "text-emerald-400"
                          : simResult.protocolStatus === "aborted"
                          ? "text-rose-400"
                          : "text-zinc-500"
                      }`}
                    >
                      {simResult.protocolStatus === "candidate"
                        ? "Low Error Rate"
                        : simResult.protocolStatus === "aborted"
                        ? "Abort Advised"
                        : "No Sample"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status message */}
              <div
                className={`mb-4 p-4 rounded-xl border text-xs leading-relaxed ${
                  simResult.protocolStatus === "candidate"
                    ? "border-emerald-500/20 bg-emerald-950/20 text-emerald-200/70"
                    : simResult.protocolStatus === "aborted"
                    ? "border-rose-500/20 bg-rose-950/20 text-rose-200/70"
                    : "border-zinc-700/30 bg-zinc-900/30 text-zinc-400"
                }`}
              >
                <p className="mb-1">{simResult.statusMessage}</p>
                <p className="text-zinc-500 text-[10px] italic">{simResult.disclaimer}</p>
              </div>

              {/* Candidate Key Display — Alice and Bob separately */}
              {simResult.candidateKeyLength > 0 && (
                <div className="p-4 rounded-xl border border-violet-500/15 bg-violet-950/10 backdrop-blur-md space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs uppercase tracking-wider text-violet-300 font-medium">
                      Candidate Raw Key ({simResult.candidateKeyLength} bits — test positions removed)
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {simResult.testSampleSize} test bit{simResult.testSampleSize !== 1 ? "s" : ""} publicly revealed &amp; discarded
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-cyan-400 block mb-1">
                        Alice&apos;s candidate raw key
                      </span>
                      <div className="font-mono text-sm tracking-[0.25em] text-cyan-300 bg-black/40 px-3 py-1.5 rounded border border-cyan-500/15 break-all">
                        {simResult.aliceCandidateKey.join("")}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-violet-400 block mb-1">
                        Bob&apos;s candidate raw key
                      </span>
                      <div className="font-mono text-sm tracking-[0.25em] text-violet-300 bg-black/40 px-3 py-1.5 rounded border border-violet-500/15 break-all">
                        {simResult.bobCandidateKey.join("")}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 italic">
                    Candidate keys are not automatically declared secure. Alice and Bob&apos;s keys may differ due to
                    residual disturbances in untested positions. Further classical error correction and privacy
                    amplification are required for production key establishment.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* 5. Detailed Qubit Transmission Table with Filters & CSV Export */}
          {simResult && (
            <section className="mb-12">
              <div className="rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md overflow-hidden">
                <div className="p-4 border-b border-white/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-zinc-300">
                      Quantum Transmission Log ({simResult.qubits.length} Qubits)
                    </h3>
                    <span className="text-[11px] text-zinc-500">
                      {stage === "completed"
                        ? "Complete"
                        : `Active Qubit: #${Math.min(currentQubitIndex + 1, simResult.totalQubits)}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* CSV Export Button */}
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="px-3 py-1.5 rounded-lg border border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] text-xs font-mono tracking-wider uppercase text-zinc-300 hover:text-white transition-colors flex items-center space-x-1.5"
                    >
                      <svg className="w-3.5 h-3.5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Table Filters */}
                <div className="px-4 py-2.5 bg-black/30 border-b border-white/[0.04] flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <span className="text-zinc-500 uppercase tracking-wider text-[10px] mr-1">Filter:</span>
                  {[
                    { id: "all" as TableFilter, label: "All", count: simResult.qubits.length },
                    {
                      id: "intercepted" as TableFilter,
                      label: "Intercepted",
                      count: simResult.qubits.filter((q) => q.eveIntercepted).length,
                    },
                    {
                      id: "not_intercepted" as TableFilter,
                      label: "Not Intercepted",
                      count: simResult.qubits.filter((q) => !q.eveIntercepted).length,
                    },
                    {
                      id: "sifted" as TableFilter,
                      label: "Sifted",
                      count: simResult.qubits.filter((q) => q.isSifted).length,
                    },
                    {
                      id: "discarded" as TableFilter,
                      label: "Discarded",
                      count: simResult.qubits.filter((q) => !q.isSifted).length,
                    },
                    {
                      id: "errors" as TableFilter,
                      label: "Errors",
                      count: simResult.qubits.filter(
                        (q) => (q.isTestBit && q.isError) || (q.isSifted && q.aliceBit !== q.bobMeasuredBit)
                      ).length,
                    },
                    {
                      id: "test_sample" as TableFilter,
                      label: "Test Sample",
                      count: simResult.qubits.filter((q) => q.isTestBit).length,
                    },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setTableFilter(f.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                        tableFilter === f.id
                          ? "bg-violet-600/80 text-white font-medium shadow-sm"
                          : "text-zinc-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05]"
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/50 text-zinc-300">
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.04] bg-white/[0.01] text-[11px] uppercase tracking-wider text-zinc-400">
                        <th className="py-3 px-3">#</th>
                        <th className="py-3 px-3 text-cyan-400">Alice Bit</th>
                        <th className="py-3 px-3 text-cyan-400">Alice Basis</th>
                        <th className="py-3 px-3 text-rose-400">Eve?</th>
                        <th className="py-3 px-3 text-rose-400">Eve Basis</th>
                        <th className="py-3 px-3 text-rose-400">Eve Meas.</th>
                        <th className="py-3 px-3 text-violet-400">Bob Basis</th>
                        <th className="py-3 px-3 text-violet-400">Bob Meas.</th>
                        <th className="py-3 px-3">Basis Match?</th>
                        <th className="py-3 px-3 text-cyan-400">Alice Sifted</th>
                        <th className="py-3 px-3 text-violet-400">Bob Sifted</th>
                        <th className="py-3 px-3">Test?</th>
                        <th className="py-3 px-3">Error?</th>
                        <th className="py-3 px-3">Final Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {filteredQubits.length === 0 ? (
                        <tr>
                          <td colSpan={14} className="py-6 text-center text-zinc-500 font-mono text-xs">
                            No qubits match the selected filter ({tableFilter}).
                          </td>
                        </tr>
                      ) : (
                        filteredQubits.map((q) => {
                          const isCurrent =
                            q.index === currentQubitIndex + 1 && stage !== "completed";
                          return (
                            <tr
                              key={q.index}
                              className={`transition-colors font-mono ${
                                isCurrent
                                  ? "bg-violet-950/40 text-white font-medium"
                                  : "hover:bg-white/[0.02] text-zinc-300"
                              }`}
                            >
                              <td className="py-2 px-3 text-zinc-500">{q.index}</td>
                              <td className="py-2 px-3 font-semibold text-cyan-300">{q.aliceBit}</td>
                              <td className="py-2 px-3 text-cyan-400">{q.aliceBasis === "+" ? "+" : "×"}</td>

                              {/* Eve intercepted? */}
                              <td className="py-2 px-3">
                                {q.eveIntercepted ? (
                                  <span className="text-rose-400 font-semibold">Yes</span>
                                ) : (
                                  <span className="text-zinc-600">No</span>
                                )}
                              </td>

                              {/* Eve basis */}
                              <td className="py-2 px-3 text-rose-300">
                                {q.eveIntercepted && q.eveBasis ? (
                                  q.eveBasis === "+" ? "+" : "×"
                                ) : (
                                  <span className="text-zinc-600">—</span>
                                )}
                              </td>

                              {/* Eve measurement */}
                              <td className="py-2 px-3 text-rose-300">
                                {q.eveIntercepted && q.eveMeasuredBit !== undefined ? (
                                  q.eveMeasuredBit
                                ) : (
                                  <span className="text-zinc-600">—</span>
                                )}
                              </td>

                              {/* Bob basis */}
                              <td className="py-2 px-3 text-violet-400">{q.bobBasis === "+" ? "+" : "×"}</td>

                              {/* Bob measured */}
                              <td className="py-2 px-3 font-semibold text-violet-300">{q.bobMeasuredBit}</td>

                              {/* Basis match? */}
                              <td className="py-2 px-3">
                                {q.basesMatch ? (
                                  <span className="text-emerald-400">Match ✓</span>
                                ) : (
                                  <span className="text-zinc-600">Discard ✗</span>
                                )}
                              </td>

                              {/* Alice sifted bit */}
                              <td className="py-2 px-3">
                                {q.isSifted ? (
                                  <span className="text-cyan-400 font-bold">{q.aliceBit}</span>
                                ) : (
                                  <span className="text-zinc-700">—</span>
                                )}
                              </td>

                              {/* Bob sifted bit */}
                              <td className="py-2 px-3">
                                {q.isSifted ? (
                                  <span
                                    className={`font-bold ${
                                      q.aliceBit !== q.bobMeasuredBit ? "text-rose-400" : "text-violet-400"
                                    }`}
                                  >
                                    {q.bobMeasuredBit}
                                  </span>
                                ) : (
                                  <span className="text-zinc-700">—</span>
                                )}
                              </td>

                              {/* Test sample? */}
                              <td className="py-2 px-3">
                                {q.isTestBit ? (
                                  <span className="text-amber-400">Yes</span>
                                ) : q.isSifted ? (
                                  <span className="text-zinc-600">No</span>
                                ) : (
                                  <span className="text-zinc-700">—</span>
                                )}
                              </td>

                              {/* Error? */}
                              <td className="py-2 px-3">
                                {q.isTestBit ? (
                                  q.isError ? (
                                    <span className="text-rose-400 font-bold">Error!</span>
                                  ) : (
                                    <span className="text-emerald-400">OK</span>
                                  )
                                ) : (
                                  <span className="text-zinc-700">—</span>
                                )}
                              </td>

                              {/* Final Status */}
                              <td className="py-2 px-3 text-[10px] uppercase tracking-wide">
                                {!q.isSifted ? (
                                  <span className="text-zinc-600">Discarded</span>
                                ) : q.isTestBit ? (
                                  q.isError ? (
                                    <span className="text-rose-400">Test — Error</span>
                                  ) : (
                                    <span className="text-emerald-400">Test — Match</span>
                                  )
                                ) : (
                                  <span className="text-indigo-400">Candidate Key</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* 6. Collapsible Explanation of How BB84 Works */}
          <section className="mb-12 rounded-xl border border-white/[0.06] bg-[#070611]/80 backdrop-blur-md overflow-hidden">
            <button
              type="button"
              onClick={() => setExplanationOpen(!explanationOpen)}
              className="w-full p-5 text-left flex items-center justify-between text-zinc-300 hover:text-white transition-colors"
              aria-expanded={explanationOpen}
            >
              <span className="text-xs uppercase tracking-widest font-semibold">
                How the BB84 Quantum Cryptography Protocol Works
              </span>
              <span className="text-xs text-violet-400 font-mono">
                {explanationOpen ? "− Collapse" : "+ Expand"}
              </span>
            </button>

            {explanationOpen && (
              <div className="p-6 pt-2 border-t border-white/[0.04] text-xs leading-relaxed text-zinc-400 space-y-4">
                <p>
                  Invented by Charles Bennett and Gilles Brassard in 1984, the{" "}
                  <strong className="text-zinc-200">BB84 protocol</strong> provides unconditional cryptographic
                  security rooted in the fundamental laws of quantum physics rather than computational assumptions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <h4 className="text-violet-300 font-semibold uppercase tracking-wider text-[11px] mb-1">
                      1. Quantum Preparation (Alice)
                    </h4>
                    <p>
                      Alice encodes random bits into photons using two non-orthogonal polarization bases: Rectilinear (+)
                      and Diagonal (×). Because of the Quantum No-Cloning Theorem, unknown quantum states cannot be copied
                      perfectly.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <h4 className="text-rose-300 font-semibold uppercase tracking-wider text-[11px] mb-1">
                      2. Eavesdropping Detection (Eve)
                    </h4>
                    <p>
                      If Eve intercepts the photon, she must guess a basis to measure it. By the Heisenberg Uncertainty
                      Principle, measuring in the wrong basis inevitably alters the quantum state, inducing a measurable
                      ~25% error rate on intercepted bits.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <h4 className="text-cyan-300 font-semibold uppercase tracking-wider text-[11px] mb-1">
                      3. Measurement & Sifting (Bob)
                    </h4>
                    <p>
                      Bob independently measures each incoming photon with a randomly chosen basis. Afterwards, Alice
                      and Bob publicly announce their chosen bases (not the bits) and keep only the bits where their
                      bases matched.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <h4 className="text-emerald-300 font-semibold uppercase tracking-wider text-[11px] mb-1">
                      4. Error Estimation (QBER)
                    </h4>
                    <p>
                      Alice and Bob compare a random public sample of their sifted bits. If the Quantum Bit Error Rate
                      (QBER) exceeds 11%, eavesdropping is confirmed and the key is aborted. Otherwise, the remaining
                      bits form candidate raw keys subject to further error correction and privacy amplification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* 7. Educational Disclaimer */}
          <footer className="text-center text-[11px] text-zinc-600 tracking-wider">
            <p>
              Educational demonstration of the BB84 Quantum Key Distribution protocol. Simulated in-browser for
              educational purposes; not a production cryptographic system.
            </p>
          </footer>
        </div>
      </div>
    </main>
  );
}
