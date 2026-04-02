"use client";

import { useEffect, useCallback, useState } from "react";
import { CubeViewer } from "@/components/cube/CubeViewer";
import {
  CubeEngine,
  parseAlgorithm,
  type CubeFaces,
  type Move,
} from "@/lib/cubeEngine";
import { useCubeStore, cubeEngine } from "@/stores/cubeStore";

// ---------------------------------------------------------------------------
// Pure helper — pre-computes one CubeFaces snapshot per step.
// Uses a throw-away local engine so the global singleton is untouched.
// ---------------------------------------------------------------------------

export function buildPlaybackState(
  algorithm: string,
  initialState?: CubeFaces,
): { snapshots: CubeFaces[]; moves: Move[] } {
  const engine = new CubeEngine();
  if (initialState) engine.setState(initialState);

  const moves = parseAlgorithm(algorithm);
  const snapshots: CubeFaces[] = [engine.getState()];

  for (const move of moves) {
    engine.applyMove(move);
    snapshots.push(engine.getState());
  }

  return { snapshots, moves };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface AlgorithmPlayerProps {
  algorithm: string;
  initialState?: CubeFaces;
  highlights?: Record<number, string[]>;
  title?: string;
  description?: string;
}

const SPEEDS = [0.5, 1, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];

export function AlgorithmPlayer({
  algorithm,
  initialState,
  highlights,
  title,
  description,
}: AlgorithmPlayerProps) {
  const { animateMove, isAnimating, setAnimationSpeed } = useCubeStore();

  const [playback, setPlayback] = useState(() =>
    buildPlaybackState(algorithm, initialState),
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);

  const { snapshots, moves } = playback;

  // Re-build when algorithm or initialState changes
  useEffect(() => {
    const pb = buildPlaybackState(algorithm, initialState);
    setPlayback(pb);
    setCurrentStep(0);
    setIsPlaying(false);
    cubeEngine.setState(pb.snapshots[0]);
    useCubeStore.setState({ faces: pb.snapshots[0] });
  }, [algorithm, initialState]);

  // Sync speed to store
  useEffect(() => {
    setAnimationSpeed(speed);
  }, [speed, setAnimationSpeed]);

  // Restore speed on unmount so other components aren't affected
  useEffect(() => {
    return () => setAnimationSpeed(1);
  }, [setAnimationSpeed]);

  const stepForward = useCallback(async () => {
    if (isAnimating || currentStep >= moves.length) return;
    await animateMove(moves[currentStep].notation);
    setCurrentStep((s) => s + 1);
  }, [isAnimating, currentStep, moves, animateMove]);

  const stepBack = useCallback(() => {
    if (isAnimating || currentStep === 0) return;
    const newStep = currentStep - 1;
    setCurrentStep(newStep);
    cubeEngine.setState(snapshots[newStep]);
    useCubeStore.setState({ faces: snapshots[newStep] });
  }, [isAnimating, currentStep, snapshots]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    cubeEngine.setState(snapshots[0]);
    useCubeStore.setState({ faces: snapshots[0] });
  }, [snapshots]);

  // Auto-play loop — triggers on every relevant state change
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= moves.length) {
      setIsPlaying(false);
      return;
    }
    if (!isAnimating) {
      stepForward();
    }
  }, [isPlaying, isAnimating, currentStep, moves.length, stepForward]);

  // Keyboard shortcuts (component must have focus — tabIndex={0} below)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case " ":
          e.preventDefault();
          setIsPlaying((p) => !p);
          break;
        case "ArrowRight":
          e.preventDefault();
          void stepForward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          stepBack();
          break;
        case "r":
        case "R":
          reset();
          break;
      }
    },
    [stepForward, stepBack, reset],
  );

  const progressPercent =
    moves.length > 0 ? (currentStep / moves.length) * 100 : 0;
  const currentHighlights = highlights?.[currentStep] ?? [];

  return (
    <div
      className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm p-5 w-full max-w-[500px] mx-auto flex flex-col gap-4 outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* Optional header */}
      {(title || description) && (
        <div>
          {title && (
            <p className="font-semibold text-[#1E293B]">{title}</p>
          )}
          {description && (
            <p className="mt-0.5 text-sm text-[#64748B]">{description}</p>
          )}
        </div>
      )}

      {/* 3D cube */}
      <div className="flex justify-center">
        <CubeViewer
          size={300}
          interactive
          highlightedCubies={currentHighlights}
        />
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Algorithm notation + move counter */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-x-1.5 gap-y-1 font-mono text-sm leading-relaxed">
          {moves.map((m, i) => {
            let cls = "text-[#1E293B]";
            if (i < currentStep) cls = "text-[#94A3B8]";
            else if (i === currentStep) cls = "font-bold text-[#2563EB]";
            return (
              <span key={i} className={cls}>
                {m.notation}
              </span>
            );
          })}
        </div>
        <span className="shrink-0 text-xs text-[#64748B] pt-0.5 whitespace-nowrap">
          Move {currentStep} of {moves.length}
        </span>
      </div>

      {/* Transport controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Playback buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={stepBack}
            disabled={isAnimating || currentStep === 0}
            title="Step back (←)"
            className="rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm font-semibold text-[#1E293B] shadow-sm hover:bg-[#F1F5F9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            |◄
          </button>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            disabled={!isPlaying && currentStep >= moves.length}
            title="Play / Pause (Space)"
            className="rounded-md bg-[#2563EB] px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            onClick={() => void stepForward()}
            disabled={isAnimating || currentStep >= moves.length}
            title="Step forward (→)"
            className="rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm font-semibold text-[#1E293B] shadow-sm hover:bg-[#F1F5F9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ►|
          </button>
          <button
            onClick={reset}
            title="Reset (R)"
            className="rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm font-semibold text-[#64748B] shadow-sm hover:bg-[#F1F5F9] transition-colors"
          >
            ⟲
          </button>
        </div>

        {/* Speed selector */}
        <div className="flex items-center gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
                speed === s
                  ? "bg-[#2563EB] text-white"
                  : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9]"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
