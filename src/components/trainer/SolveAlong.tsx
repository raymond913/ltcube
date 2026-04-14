"use client";

import { useState, useEffect, useCallback } from "react";
import { CubeViewer } from "@/components/cube/CubeViewer";
import { useCubeStore } from "@/stores/cubeStore";
import { useProgressStore } from "@/stores/progressStore";
import { generateScramble } from "@/lib/scrambleGenerator";
import { detectStage, isCrossSolved, areCornersSolved, isF2LSolved, isOLLSolved, isPLLSolved } from "@/lib/solverHeuristics";

// ---------------------------------------------------------------------------
// Stage data
// ---------------------------------------------------------------------------

const STAGES = [
  {
    id: "white-cross",
    name: "White Cross",
    instruction: "Solve the white cross on the bottom face.",
    tip: "Hold the cube with white on the bottom. Find white edge pieces and bring them to the D face — each edge's side color must match its center.",
    check: isCrossSolved,
  },
  {
    id: "white-corners",
    name: "First Layer Corners",
    instruction: "Insert the four white corner pieces.",
    tip: "Find a white corner on the top layer above its slot. Use R U R' or L' U' L to insert it. If a corner is stuck in the bottom, move it up first.",
    check: areCornersSolved,
  },
  {
    id: "second-layer",
    name: "Second Layer",
    instruction: "Solve the four middle layer edges.",
    tip: "Look for a top-layer edge with no yellow. Align it with its front center, then use U R U' R' U' F' U F (goes right) or U' L' U L U F U' F' (goes left).",
    check: isF2LSolved,
  },
  {
    id: "oll",
    name: "OLL — Orient Last Layer",
    instruction: "Make the entire top face yellow.",
    tip: "First make a yellow cross (F R U R' U' F'). Then orient the corners with Sune (R U R' U R U2 R') or Anti-Sune (R' U' R U' R' U2 R) until all corners face up.",
    check: isOLLSolved,
  },
  {
    id: "pll",
    name: "PLL — Permute Last Layer",
    instruction: "Solve the final layer to complete the cube.",
    tip: "Fix corners first (Aa/Ab perm or Y perm), then cycle edges (Ua/Ub perm for 3-cycle, H/Z perm for swaps). Rotate the top layer to align when done.",
    check: isPLLSolved,
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Screen = "scramble" | "solving" | "done";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SolveAlong() {
  const [screen, setScreen] = useState<Screen>("scramble");
  const [scramble, setScramble] = useState(() => generateScramble(20));
  const [customInput, setCustomInput] = useState("");
  const [usingCustom, setUsingCustom] = useState(false);
  const [stageIndex, setStageIndex] = useState(0); // 0-based index into STAGES
  const [detectedStage, setDetectedStage] = useState(0);
  const [autoAdvanced, setAutoAdvanced] = useState(false);

  const faces = useCubeStore((s) => s.faces);
  const isAnimating = useCubeStore((s) => s.isAnimating);
  const completeStep = useProgressStore((s) => s.completeStep);
  const updateStreak = useProgressStore((s) => s.updateStreak);

  const activeScramble = usingCustom ? customInput.trim() : scramble;

  // Detect stage from live cube state
  useEffect(() => {
    if (screen !== "solving") return;
    const stage = detectStage(faces);
    setDetectedStage(stage);
  }, [faces, screen]);

  // Auto-advance when detection passes current stage
  useEffect(() => {
    if (screen !== "solving") return;
    if (detectedStage > stageIndex && !autoAdvanced) {
      setAutoAdvanced(true);
      setTimeout(() => {
        if (stageIndex + 1 >= STAGES.length) {
          handleDone();
        } else {
          setStageIndex((i) => i + 1);
          setAutoAdvanced(false);
        }
      }, 800);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedStage, stageIndex, screen]);

  const handleGenerateNew = useCallback(() => {
    const s = generateScramble(20);
    setScramble(s);
    setUsingCustom(false);
    setCustomInput("");
    useCubeStore.getState().reset();
  }, []);

  const handleApplyScramble = useCallback(() => {
    useCubeStore.getState().reset();
    useCubeStore.getState().applyInstant(activeScramble);
  }, [activeScramble]);

  const handleReady = useCallback(() => {
    setStageIndex(0);
    setDetectedStage(0);
    setAutoAdvanced(false);
    setScreen("solving");
  }, []);

  const handleManualAdvance = useCallback(() => {
    if (stageIndex + 1 >= STAGES.length) {
      handleDone();
    } else {
      setStageIndex((i) => i + 1);
      setAutoAdvanced(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIndex]);

  const handleDone = useCallback(() => {
    completeStep("solve-along");
    updateStreak();
    setScreen("done");
  }, [completeStep, updateStreak]);

  const handleReset = useCallback(() => {
    useCubeStore.getState().reset();
    useCubeStore.getState().applyInstant(activeScramble);
    setStageIndex(0);
    setDetectedStage(0);
    setAutoAdvanced(false);
  }, [activeScramble]);

  const handleStartOver = useCallback(() => {
    useCubeStore.getState().reset();
    setScreen("scramble");
    setScramble(generateScramble(20));
    setUsingCustom(false);
    setCustomInput("");
  }, []);

  // ---------------------------------------------------------------------------
  // Screens
  // ---------------------------------------------------------------------------

  if (screen === "done") {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto py-8">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-[#1E293B] mb-2">You solved it!</h2>
          <p className="text-[#64748B]">Excellent work completing all 5 stages.</p>
        </div>
        <div className="w-full rounded-xl border border-[#E2E8F0] bg-white p-4">
          <p className="text-sm font-semibold text-[#1E293B] mb-3">Stages completed</p>
          <div className="flex flex-col gap-2">
            {STAGES.map((s) => (
              <div key={s.id} className="flex items-center gap-3 text-sm">
                <span className="text-[#16A34A] font-bold">✓</span>
                <span className="text-[#1E293B]">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={handleStartOver}
          className="w-full min-h-[44px] rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
        >
          Solve Again
        </button>
      </div>
    );
  }

  if (screen === "scramble") {
    return (
      <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#1E293B]">Scramble</h2>
            <button
              onClick={handleGenerateNew}
              className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              Generate new
            </button>
          </div>

          <div className="font-mono text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3 text-[#1E293B] tracking-wide break-all">
            {usingCustom ? (customInput.trim() || <span className="text-[#94A3B8]">Enter moves above…</span>) : scramble}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Paste custom scramble (optional)</label>
            <input
              type="text"
              value={customInput}
              onChange={(e) => { setCustomInput(e.target.value); setUsingCustom(e.target.value.trim().length > 0); }}
              placeholder="R U R' U' R' F R2 U' R' U' R U R' F'…"
              className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-mono text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>

          <button
            onClick={handleApplyScramble}
            disabled={isAnimating}
            className="min-h-[44px] w-full rounded-lg border border-[#2563EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#2563EB] hover:bg-[#EFF6FF] disabled:opacity-50 transition-colors"
          >
            Apply to Cube
          </button>
        </div>

        <div className="rounded-xl overflow-hidden border border-[#E2E8F0]">
          <CubeViewer size={300} interactive />
        </div>

        <button
          onClick={handleReady}
          className="min-h-[44px] w-full rounded-lg bg-[#2563EB] px-4 py-3 text-base font-semibold text-white hover:bg-[#1D4ED8] transition-colors shadow-sm"
        >
          I&apos;m Ready
        </button>
      </div>
    );
  }

  // solving screen
  const stage = STAGES[stageIndex];
  const stagePassed = detectedStage > stageIndex;

  return (
    <div className="flex flex-col gap-5 w-full max-w-lg mx-auto">
      {/* Progress dots */}
      <div className="flex items-center gap-2">
        {STAGES.map((s, i) => (
          <div
            key={s.id}
            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
              i < stageIndex
                ? "bg-[#16A34A]"
                : i === stageIndex
                ? "bg-[#2563EB]"
                : "bg-[#E2E8F0]"
            }`}
          />
        ))}
      </div>

      {/* Stage header */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-xs font-medium text-[#64748B] mb-0.5">
              Stage {stageIndex + 1} of {STAGES.length}
            </p>
            <h2 className="text-lg font-bold text-[#1E293B]">{stage.name}</h2>
          </div>
          {stagePassed && (
            <span className="shrink-0 rounded-full bg-[#F0FDF4] border border-[#86EFAC] px-3 py-1 text-xs font-semibold text-[#16A34A]">
              Done ✓
            </span>
          )}
        </div>
        <p className="text-sm font-medium text-[#1E293B] mb-3">{stage.instruction}</p>
        <div className="rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] px-4 py-3">
          <p className="text-xs font-semibold text-[#1E40AF] mb-1">Tip</p>
          <p className="text-sm text-[#1E40AF]">{stage.tip}</p>
        </div>
      </div>

      {/* Cube */}
      <div className="rounded-xl overflow-hidden border border-[#E2E8F0]">
        <CubeViewer size={300} interactive />
      </div>

      {/* Detection status */}
      <div className={`rounded-lg border px-4 py-3 text-sm ${
        stagePassed
          ? "bg-[#F0FDF4] border-[#86EFAC] text-[#166534]"
          : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
      }`}>
        {stagePassed
          ? `${stage.name} detected as solved — advancing…`
          : `Solve the cube, then click "I solved this stage" or keep going and detection will advance automatically.`}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="min-h-[44px] rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
        >
          Reset to start
        </button>
        <button
          onClick={handleManualAdvance}
          className="flex-1 min-h-[44px] rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
        >
          {stageIndex + 1 >= STAGES.length ? "Finish" : "I solved this stage"}
        </button>
      </div>
    </div>
  );
}
