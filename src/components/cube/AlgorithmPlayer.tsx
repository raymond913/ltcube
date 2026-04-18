"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { CubeViewer } from "@/components/cube/CubeViewer";
import {
  CubeEngine,
  parseAlgorithm,
  invertAlgorithm,
  type CubeFaces,
  type Move,
} from "@/lib/cubeEngine";
import { useCubeStore, cubeEngine } from "@/stores/cubeStore";
import type { Arrow } from "@/lib/tutorialTypes";

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function computeFacesFromAlg(alg: string): CubeFaces {
  const engine = new CubeEngine();
  if (alg) engine.applyAlgorithm(alg);
  return engine.getState();
}

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
  initialStateAlg?: string;
  initialState?: CubeFaces;
  visibleCubies?: string[];
  title?: string;
  description?: string;
  showViewToggle?: boolean;
  arrows?: Arrow[];
}

const SPEEDS = [0.5, 1, 1.5, 2] as const;
type Speed = (typeof SPEEDS)[number];

export function AlgorithmPlayer({
  algorithm,
  initialStateAlg,
  initialState,
  visibleCubies,
  title,
  description,
  showViewToggle,
  arrows,
}: AlgorithmPlayerProps) {
  const { animateMove, isAnimating, setAnimationSpeed } = useCubeStore();
  const [viewMode, setViewMode] = useState<"default" | "white-up">("default");

  const [playback, setPlayback] = useState(() => {
    const initFaces = initialStateAlg !== undefined
      ? computeFacesFromAlg(initialStateAlg)
      : initialState;
    return buildPlaybackState(algorithm, initFaces);
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>(1);

  const { snapshots, moves } = playback;

  const showTeachingState = !isPlaying && (currentStep === 0 || currentStep >= moves.length);

  const stepFiredRef = useRef(false);

  useEffect(() => {
    const initFaces = initialStateAlg !== undefined
      ? computeFacesFromAlg(initialStateAlg)
      : initialState;
    const pb = buildPlaybackState(algorithm, initFaces);
    setPlayback(pb);
    setCurrentStep(0);
    setIsPlaying(false);
    stepFiredRef.current = false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm, initialStateAlg]);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 50;
    const algToApply = initialStateAlg !== undefined
      ? initialStateAlg
      : invertAlgorithm(algorithm);

    const tryApply = () => {
      attempts++;
      const store = useCubeStore.getState();
      store.reset();
      if (algToApply && algToApply.trim() !== '') {
        store.applyInstant(algToApply);
      }
      if (useCubeStore.getState().pendingInstantAlg !== null && attempts < maxAttempts) {
        setTimeout(tryApply, 50);
      }
    };

    setTimeout(tryApply, 100);
    return () => { attempts = maxAttempts; };
  }, [initialStateAlg, algorithm]);

  useEffect(() => {
    setAnimationSpeed(speed);
  }, [speed, setAnimationSpeed]);

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

  const stepBack = useCallback(() => {
    if (isAnimating || currentStep === 0) return;
    const newStep = currentStep - 1;
    setCurrentStep(newStep);
    cubeEngine.setState(snapshots[newStep]);
    useCubeStore.setState({ faces: snapshots[newStep] });
  }, [isAnimating, currentStep, snapshots]);

  const jumpToStep = useCallback((target: number) => {
    if (isAnimating) return;
    setIsPlaying(false);
    stepFiredRef.current = false;
    const clamped = Math.max(0, Math.min(target, moves.length));
    setCurrentStep(clamped);
    cubeEngine.setState(snapshots[clamped]);
    useCubeStore.setState({ faces: snapshots[clamped] });
  }, [isAnimating, moves.length, snapshots]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    stepFiredRef.current = false;
    if (initialStateAlg !== undefined) {
      useCubeStore.getState().applyInstant(initialStateAlg);
    } else {
      useCubeStore.getState().applyInstant(invertAlgorithm(algorithm));
    }
  }, [initialStateAlg, algorithm]);

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

  const progressPct = moves.length > 0 ? (currentStep / moves.length) * 100 : 0;
  const isAtEnd = currentStep >= moves.length;
  const isAtStart = currentStep === 0;

  return (
    <div
      className="w-full max-w-[500px] mx-auto flex flex-col gap-0 focus-visible:outline-none"
      style={{
        background: "var(--color-surface-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: "18px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* ── Optional header ── */}
      {(title || description) && (
        <div
          className="px-5 pt-4 pb-3"
          style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
        >
          {title && (
            <p
              className="font-display font-semibold text-sm leading-tight"
              style={{ color: "var(--color-text)" }}
            >
              {title}
            </p>
          )}
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
              {description}
            </p>
          )}
        </div>
      )}

      {/* ── 3D cube ── */}
      <div className="flex flex-col items-center gap-2 px-5 pt-4 pb-3">
        <CubeViewer
          size={300}
          interactive
          visibleCubies={showTeachingState ? visibleCubies : undefined}
          viewMode={viewMode}
          arrows={showTeachingState ? arrows : undefined}
        />
        {showViewToggle && (
          <button
            onClick={() => setViewMode((v) => v === "white-up" ? "default" : "white-up")}
            className="rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150"
            style={{
              background: viewMode === "white-up" ? "var(--color-primary-light)" : "oklch(97% 0.003 250)",
              border: `1px solid ${viewMode === "white-up" ? "var(--color-primary-light-border)" : "var(--color-border)"}`,
              color: viewMode === "white-up" ? "#2563EB" : "oklch(52% 0.012 250)",
            }}
          >
            {viewMode === "white-up" ? "Default view" : "View white face"}
          </button>
        )}
      </div>

      {/* ── Thin progress bar ── */}
      <div className="mx-5 mb-3" style={{ height: "2px", background: "var(--color-border-subtle)", borderRadius: "1px", overflow: "hidden" }}>
        <div
          className="h-full w-full rounded-full transition-transform duration-300 origin-left"
          style={{
            transform: `scaleX(${progressPct / 100})`,
            background: "#2563EB",
          }}
        />
      </div>

      {/* Screen-reader live region for step changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {currentStep === 0
          ? "Start position"
          : currentStep >= moves.length
          ? `Done. All ${moves.length} moves complete.`
          : `Move ${currentStep} of ${moves.length}: ${moves[currentStep - 1]?.notation}`}
      </div>

      {/* ── Algorithm notation + step counter ── */}
      <div
        className="flex flex-col gap-2 mx-5 mb-3 px-3 py-3 rounded-xl"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Dot navigator — each button has padding for 44px touch target */}
        <div className="flex flex-wrap items-center" style={{ gap: "0 2px", margin: "0 -4px" }}>
          {Array.from({ length: moves.length + 1 }, (_, i) => (
            <button
              key={i}
              onClick={() => jumpToStep(i)}
              disabled={isAnimating}
              title={i === 0 ? "Start" : moves[i - 1]?.notation}
              aria-label={i === 0 ? "Go to start" : `Go to move ${i}: ${moves[i - 1]?.notation}`}
              className="flex items-center justify-center transition-all duration-150 disabled:cursor-not-allowed"
              style={{
                padding: "22px 4px",
                background: "transparent",
                border: "none",
              }}
            >
              <span
                className="block rounded-full transition-all duration-150"
                style={{
                  width:  i === currentStep ? "12px" : "8px",
                  height: i === currentStep ? "12px" : "8px",
                  background: i === currentStep
                    ? "#2563EB"
                    : i < currentStep
                    ? "oklch(72% 0.01 250)"
                    : "oklch(87% 0.008 250)",
                  transform: i === currentStep ? "scale(1.1)" : "scale(1)",
                }}
              />
            </button>
          ))}
        </div>

        {/* Algorithm tokens + counter */}
        <div className="flex items-start justify-between gap-2">
          <div
            className="font-mono flex flex-wrap gap-x-1.5 gap-y-0.5 text-sm leading-relaxed"
          >
            {moves.map((m, i) => {
              const isPast    = i < currentStep;
              const isCurrent = i === currentStep;
              return (
                <button
                  key={i}
                  onClick={() => jumpToStep(i)}
                  disabled={isAnimating}
                  style={{
                    color: isPast
                      ? "oklch(75% 0.008 250)"
                      : isCurrent
                      ? "#2563EB"
                      : "oklch(40% 0.01 250)",
                    fontWeight: isCurrent ? 700 : 400,
                    transition: "all 0.15s ease",
                  }}
                  className="hover:opacity-70 disabled:cursor-not-allowed px-0.5 py-0.5 rounded"
                >
                  {m.notation}
                </button>
              );
            })}
          </div>
          <span
            className="font-mono shrink-0 text-xs whitespace-nowrap tabular-nums"
            style={{ color: "oklch(60% 0.01 250)" }}
          >
            {currentStep}&nbsp;/&nbsp;{moves.length}
          </span>
        </div>
      </div>

      {/* ── Transport controls ── */}
      <div
        className="flex items-center justify-between gap-3 px-5 pt-3 pb-4 flex-wrap"
        style={{ borderTop: "1px solid var(--color-border-subtle)" }}
      >
        {/* Playback buttons */}
        <div className="flex items-center gap-1.5">
          {/* Step back */}
          <button
            onClick={stepBack}
            disabled={isAnimating || isAtStart}
            aria-label="Step back"
            title="Step back (←)"
            className="ltc-hover-transport flex items-center justify-center rounded-xl transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              width: "40px",
              height: "40px",
              background: "oklch(97% 0.003 250)",
              border: "1px solid var(--color-border)",
              color: "var(--color-muted)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 3h1.5v4.5L13 3v10L4.5 8.5V13H3z" />
            </svg>
          </button>

          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying((p) => !p)}
            disabled={!isPlaying && isAtEnd}
            aria-label={isPlaying ? "Pause" : "Play"}
            title="Play / Pause (Space)"
            className="flex items-center justify-center rounded-xl font-semibold transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.04] active:scale-[0.97]"
            style={{
              width: "44px",
              height: "44px",
              backgroundColor: isPlaying ? "var(--color-primary-light)" : "#2563EB",
              border: isPlaying ? "1px solid var(--color-primary-light-border)" : "none",
              color: isPlaying ? "#2563EB" : "#fff",
              boxShadow: !isPlaying && !isAtEnd ? "0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(37,99,235,0.3)" : "none",
            }}
          >
            {isPlaying ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3" y="2" width="4" height="12" rx="1" />
                <rect x="9" y="2" width="4" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2.5l10 5.5-10 5.5z" />
              </svg>
            )}
          </button>

          {/* Step forward */}
          <button
            onClick={() => void stepForward()}
            disabled={isAnimating || isAtEnd}
            aria-label="Step forward"
            title="Step forward (→)"
            className="ltc-hover-transport flex items-center justify-center rounded-xl transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              width: "40px",
              height: "40px",
              background: "oklch(97% 0.003 250)",
              border: "1px solid var(--color-border)",
              color: "var(--color-muted)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13 3h-1.5v4.5L3 3v10l8.5-4.5V13H13z" />
            </svg>
          </button>

          {/* Reset */}
          <button
            onClick={reset}
            aria-label="Reset"
            title="Reset (R)"
            className="ltc-hover-transport flex items-center justify-center rounded-xl transition-all duration-150"
            style={{
              width: "40px",
              height: "40px",
              background: "oklch(97% 0.003 250)",
              border: "1px solid var(--color-border)",
              color: "oklch(62% 0.01 250)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8a5 5 0 1 0 1-3" />
              <path d="M3 3v3h3" />
            </svg>
          </button>
        </div>

        {/* Speed selector — pill group */}
        <div
          className="flex items-center rounded-xl overflow-hidden"
          style={{
            background: "oklch(97% 0.003 250)",
            border: "1px solid var(--color-border)",
          }}
        >
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className="font-mono px-2.5 py-2.5 text-xs font-semibold transition-all duration-150"
              style={{
                background: speed === s ? "#2563EB" : "transparent",
                color: speed === s ? "#fff" : "oklch(52% 0.012 250)",
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
