"use client";

import { useEffect, useLayoutEffect, useCallback, useState, useRef } from "react";
import { CubeViewer } from "@/components/cube/CubeViewer";
import {
  CubeEngine,
  parseAlgorithm,
  invertAlgorithm,
  type CubeFaces,
  type Move,
} from "@/lib/cubeEngine";
import { useCubeStore, cubeEngine } from "@/stores/cubeStore";

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/**
 * Build a CubeFaces snapshot from an algorithm string applied to a solved cube.
 * Used to derive the initial cube state from a raw scramble/setup string.
 */
function computeFacesFromAlg(alg: string): CubeFaces {
  const engine = new CubeEngine();
  if (alg) engine.applyAlgorithm(alg);
  return engine.getState();
}

/**
 * Pre-computes one CubeFaces snapshot per step.
 * Uses a throw-away local engine so the global singleton is untouched.
 */
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

/**
 * @param initialStateAlg  Raw algorithm string applied from solved to reach the
 *   starting state (preferred).  When provided, the 3D cube is set via
 *   `cubeStore.applyInstant()` so CubeScene builds the correct visual state
 *   without triggering the subscribe-reset path.
 *
 * @param initialState  Pre-computed CubeFaces — kept for API compatibility with
 *   non-tutorial callers.  Ignored when `initialStateAlg` is provided.
 *   Must be referentially stable (e.g. from useMemo).
 */
interface AlgorithmPlayerProps {
  algorithm: string;
  initialStateAlg?: string;
  initialState?: CubeFaces;
  highlights?: Record<number, string[]>;
  visibleCubies?: string[];
  title?: string;
  description?: string;
}

const SPEEDS = [0.5, 1, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];

export function AlgorithmPlayer({
  algorithm,
  initialStateAlg,
  initialState,
  highlights,
  visibleCubies,
  title,
  description,
}: AlgorithmPlayerProps) {
  const { animateMove, isAnimating, setAnimationSpeed } = useCubeStore();

  // Derive CubeFaces for the initial step, preferring initialStateAlg.
  // This is only used for buildPlaybackState — the 3D canvas is updated via
  // applyInstant (when initialStateAlg is provided) or setState (legacy path).
  const [playback, setPlayback] = useState(() => {
    const initFaces = initialStateAlg !== undefined
      ? computeFacesFromAlg(initialStateAlg)
      : initialState;
    // Apply to 3D scene before first render so the cube never shows solved.
    if (initialStateAlg !== undefined) {
      useCubeStore.getState().applyInstant(initialStateAlg);
    } else {
      useCubeStore.getState().applyInstant(invertAlgorithm(algorithm));
    }
    return buildPlaybackState(algorithm, initFaces);
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);

  const { snapshots, moves } = playback;

  // Highlights are pinned to step 0 so they persist on the target piece
  // throughout the algorithm (the glow follows the cubie as it moves).
  const currentHighlights = highlights?.[0] ?? [];

  // Tracks whether a stepForward animation is in-flight. Prevents the
  // auto-play effect from re-triggering the same move when isAnimating flips
  // false before React has processed the setCurrentStep(s+1) state update.
  const stepFiredRef = useRef(false);

  // Re-build snapshots and sync 3D state when algorithm or initial state changes.
  // useLayoutEffect fires before the browser paint so the cube never flashes solved.
  useLayoutEffect(() => {
    const alg = initialStateAlg !== undefined ? initialStateAlg : invertAlgorithm(algorithm);
    console.log("[AlgorithmPlayer] initialState alg:", alg);

    const initFaces = initialStateAlg !== undefined
      ? computeFacesFromAlg(initialStateAlg)
      : initialState;
    const pb = buildPlaybackState(algorithm, initFaces);
    setPlayback(pb);
    setCurrentStep(0);
    setIsPlaying(false);
    stepFiredRef.current = false;

    // Reset first to guarantee a clean visual state, then apply setup.
    useCubeStore.getState().reset();
    useCubeStore.getState().applyInstant(alg);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm, initialStateAlg, initialState]);

  // Sync speed to store
  useEffect(() => {
    setAnimationSpeed(speed);
  }, [speed, setAnimationSpeed]);

  // Restore speed on unmount so other components aren't affected
  useEffect(() => {
    return () => setAnimationSpeed(1);
  }, [setAnimationSpeed]);

  const stepForward = useCallback(async () => {
    if (isAnimating || currentStep >= moves.length || stepFiredRef.current) return;
    stepFiredRef.current = true;
    await animateMove(moves[currentStep].notation);
    stepFiredRef.current = false;
    setCurrentStep((s) => s + 1);
  }, [isAnimating, currentStep, moves, animateMove]);

  // NOTE: The isAnimating guard is necessary but not sufficient — a GSAP tween
  // that completes mid-flight will call commitAnimatedMove, potentially
  // overwriting a just-restored snapshot. This window is extremely narrow in
  // practice and requires simultaneous user input during the animation frame.
  const stepBack = useCallback(() => {
    if (isAnimating || currentStep === 0) return;
    const newStep = currentStep - 1;
    setCurrentStep(newStep);
    // CubeScene's Zustand subscribe will match newStep's faces against the
    // move log and replay the correct prefix — no need to call applyInstant here.
    cubeEngine.setState(snapshots[newStep]);
    useCubeStore.setState({ faces: snapshots[newStep] });
  }, [isAnimating, currentStep, snapshots]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    stepFiredRef.current = false;
    if (initialStateAlg !== undefined) {
      // applyInstant resets the 3D scene back to the scrambled initial state
      // and rebuilds the move log so subsequent step-back/reset work correctly.
      useCubeStore.getState().applyInstant(initialStateAlg);
    } else {
      useCubeStore.getState().applyInstant(invertAlgorithm(algorithm));
    }
  }, [initialStateAlg, algorithm]);

  // Auto-play loop. stepForward is in deps (not isAnimating directly) because
  // stepForward closes over isAnimating — changing it here would break the
  // useCallback memoisation and cause infinite re-renders.
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

  return (
    <div
      className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm p-5 w-full max-w-[500px] mx-auto flex flex-col gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
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
          visibleCubies={visibleCubies}
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
            aria-label="Step back"
            title="Step back (←)"
            className="rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm font-semibold text-[#1E293B] shadow-sm hover:bg-[#F1F5F9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            |◄
          </button>
          <button
            onClick={() => setIsPlaying((p) => !p)}
            disabled={!isPlaying && currentStep >= moves.length}
            aria-label={isPlaying ? "Pause" : "Play"}
            title="Play / Pause (Space)"
            className="rounded-md bg-[#2563EB] px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button
            onClick={() => void stepForward()}
            disabled={isAnimating || currentStep >= moves.length}
            aria-label="Step forward"
            title="Step forward (→)"
            className="rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm font-semibold text-[#1E293B] shadow-sm hover:bg-[#F1F5F9] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ►|
          </button>
          <button
            onClick={reset}
            aria-label="Reset"
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
