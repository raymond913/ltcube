"use client";

import { useState, useEffect, useCallback } from "react";
import { CubeViewer } from "@/components/cube/CubeViewer";
import { useCubeStore } from "@/stores/cubeStore";
import { useProgressStore } from "@/stores/progressStore";
import { generateScramble } from "@/lib/scrambleGenerator";
import { detectStage, isCrossSolved, areCornersSolved, isF2LSolved, isOLLSolved, isPLLSolved } from "@/lib/solverHeuristics";

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

type Screen = "scramble" | "solving" | "done";

export function SolveAlong() {
  const [screen, setScreen] = useState<Screen>("scramble");
  const [scramble, setScramble] = useState(() => generateScramble(20));
  const [customInput, setCustomInput] = useState("");
  const [usingCustom, setUsingCustom] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [detectedStage, setDetectedStage] = useState(0);
  const [autoAdvanced, setAutoAdvanced] = useState(false);

  const faces = useCubeStore((s) => s.faces);
  const isAnimating = useCubeStore((s) => s.isAnimating);
  const completeStep = useProgressStore((s) => s.completeStep);
  const updateStreak = useProgressStore((s) => s.updateStreak);

  const activeScramble = usingCustom ? customInput.trim() : scramble;

  useEffect(() => {
    if (screen !== "solving") return;
    const stage = detectStage(faces);
    setDetectedStage(stage);
  }, [faces, screen]);

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

  if (screen === "done") {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto py-8">
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text)" }}>
            You solved it!
          </h2>
          <p style={{ color: "var(--color-muted)" }}>Excellent work completing all 5 stages.</p>
        </div>
        <div
          className="w-full rounded-xl p-4"
          style={{
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border)",
          }}
        >
          <p className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>
            Stages completed
          </p>
          <div className="flex flex-col gap-2">
            {STAGES.map((s) => (
              <div key={s.id} className="flex items-center gap-3 text-sm">
                <span className="font-bold" style={{ color: "var(--color-step-corners)" }}>✓</span>
                <span style={{ color: "var(--color-text)" }}>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={handleStartOver}
          className="ltc-hover-primary w-full min-h-[44px] rounded-lg px-4 py-3 text-sm font-semibold text-on-accent transition-colors"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          Solve Again
        </button>
      </div>
    );
  }

  if (screen === "scramble") {
    return (
      <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
        <div
          className="rounded-xl p-5 flex flex-col gap-4"
          style={{
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
              Scramble
            </h2>
            <button
              onClick={handleGenerateNew}
              className="ltc-hover-primary-color text-sm font-medium transition-colors"
              style={{ color: "var(--color-primary)" }}
            >
              Generate new
            </button>
          </div>

          <div
            className="font-mono text-sm rounded-lg px-4 py-3 tracking-wide break-all"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
            }}
          >
            {usingCustom
              ? (customInput.trim() || <span style={{ color: "var(--color-dim)" }}>Enter moves above…</span>)
              : scramble}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-muted)" }}>
              Paste custom scramble (optional)
            </label>
            <input
              type="text"
              value={customInput}
              onChange={(e) => { setCustomInput(e.target.value); setUsingCustom(e.target.value.trim().length > 0); }}
              placeholder="R U R' U' R' F R2 U' R' U' R U R' F'…"
              className="w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              style={{
                background: "var(--color-surface-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
            />
          </div>

          <button
            onClick={handleApplyScramble}
            disabled={isAnimating}
            className="ltc-hover-blue min-h-[44px] w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
            style={{
              background: "var(--color-surface-elevated)",
              border: "1px solid var(--color-primary)",
              color: "var(--color-primary)",
            }}
          >
            Apply to Cube
          </button>
        </div>

        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--color-border)" }}
        >
          <CubeViewer size={300} interactive />
        </div>

        <button
          onClick={handleReady}
          className="ltc-hover-primary min-h-[44px] w-full rounded-lg px-4 py-3 text-base font-semibold text-on-accent transition-colors"
          style={{
            backgroundColor: "var(--color-primary)",
            boxShadow: "0 1px 3px var(--color-shadow-2)",
          }}
        >
          I&apos;m Ready
        </button>
      </div>
    );
  }

  const stage = STAGES[stageIndex];
  const stagePassed = detectedStage > stageIndex;

  return (
    <div className="flex flex-col gap-5 w-full max-w-lg mx-auto">
      {/* Progress segments */}
      <div className="flex items-center gap-2">
        {STAGES.map((s, i) => (
          <div
            key={s.id}
            className="h-2 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i < stageIndex
                  ? "var(--color-step-corners)"
                  : i === stageIndex
                  ? "var(--color-primary)"
                  : "var(--color-border-subtle)",
            }}
          />
        ))}
      </div>

      {/* Screen-reader live region for stage changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Stage ${stageIndex + 1} of ${STAGES.length}: ${stage.name}. ${stage.instruction}`}
        {stagePassed ? " Stage solved." : ""}
      </div>

      {/* Stage header */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-sm font-medium mb-0.5" style={{ color: "var(--color-muted)" }}>
              Stage {stageIndex + 1} of {STAGES.length}
            </p>
            <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>
              {stage.name}
            </h2>
          </div>
          {stagePassed && (
            <span
              className="shrink-0 rounded-full px-3 py-1 text-sm font-semibold"
              style={{
                background: "color-mix(in srgb, var(--color-step-corners) 7%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-step-corners) 22%, transparent)",
                color: "var(--color-step-corners)",
              }}
            >
              Done ✓
            </span>
          )}
        </div>
        <p className="text-sm font-medium mb-3" style={{ color: "var(--color-text)" }}>
          {stage.instruction}
        </p>
        <div
          className="rounded-lg px-4 py-3"
          style={{
            background: "var(--color-primary-light)",
            border: "1px solid var(--color-primary-light-border)",
          }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--color-primary)" }}>Tip</p>
          <p className="text-sm" style={{ color: "var(--color-primary)" }}>{stage.tip}</p>
        </div>
      </div>

      {/* Cube */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--color-border)" }}
      >
        <CubeViewer size={300} interactive />
      </div>

      {/* Detection status */}
      <div
        className="rounded-lg px-4 py-3 text-sm"
        style={
          stagePassed
            ? {
                background: "color-mix(in srgb, var(--color-step-corners) 7%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-step-corners) 22%, transparent)",
                color: "var(--color-step-corners)",
              }
            : {
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                color: "var(--color-muted)",
              }
        }
      >
        {stagePassed
          ? `${stage.name} detected as solved — advancing…`
          : `Solve the cube, then click "I solved this stage" or keep going and detection will advance automatically.`}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="ltc-hover-subtle min-h-[44px] rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors"
          style={{
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border)",
            color: "var(--color-muted)",
          }}
        >
          Reset to start
        </button>
        <button
          onClick={handleManualAdvance}
          className="ltc-hover-primary flex-1 min-h-[44px] rounded-lg px-4 py-2.5 text-sm font-semibold text-on-accent transition-colors"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {stageIndex + 1 >= STAGES.length ? "Finish" : "I solved this stage"}
        </button>
      </div>
    </div>
  );
}
