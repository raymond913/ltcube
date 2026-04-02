# Algorithm Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `AlgorithmPlayer` — a card component with transport controls, notation display, progress bar, and keyboard shortcuts that animates a Rubik's Cube algorithm step-by-step using the existing store/GSAP system.

**Architecture:** A throw-away local `CubeEngine` pre-computes a `CubeFaces[]` snapshot array at mount time. Forward animation calls the global `animateMove` (GSAP). Backward steps restore snapshots instantly by calling `cubeEngine.setState` + `useCubeStore.setState`. An auto-play loop is driven by a `useEffect` watching `[isPlaying, isAnimating, currentStep]`.

**Tech Stack:** React, TypeScript, Tailwind CSS v4, Zustand (`useCubeStore`), existing `CubeEngine` + `CubeViewer`, Vitest for pure-logic tests.

---

## File Map

| Path | Action | Responsibility |
|------|--------|----------------|
| `src/components/cube/AlgorithmPlayer.tsx` | Create | Full component + exported `buildPlaybackState` helper |
| `src/components/cube/__tests__/AlgorithmPlayer.test.ts` | Create | Unit tests for `buildPlaybackState` |
| `src/app/page.tsx` | Modify | Remove test buttons, add `<AlgorithmPlayer>` demo |

---

## Task 1 — `buildPlaybackState` helper + tests

**Files:**
- Create: `src/components/cube/AlgorithmPlayer.tsx`
- Create: `src/components/cube/__tests__/AlgorithmPlayer.test.ts`

This task creates only the pure snapshot-computation helper. No React yet.

- [ ] **Step 1: Create `AlgorithmPlayer.tsx` with just the helper export**

Create `src/components/cube/AlgorithmPlayer.tsx` with this exact content:

```tsx
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

// Component placeholder — filled in Task 2
export function AlgorithmPlayer() {
  return null;
}
```

- [ ] **Step 2: Create the test file**

Create `src/components/cube/__tests__/AlgorithmPlayer.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { CubeEngine } from "@/lib/cubeEngine";
import { buildPlaybackState } from "../AlgorithmPlayer";

describe("buildPlaybackState", () => {
  it("produces snapshots.length === moves.length + 1", () => {
    const { snapshots, moves } = buildPlaybackState("R U R'");
    expect(snapshots).toHaveLength(moves.length + 1);
    expect(moves).toHaveLength(3);
  });

  it("snapshot[0] is solved when no initialState provided", () => {
    const { snapshots } = buildPlaybackState("R U");
    const solvedEngine = new CubeEngine();
    expect(snapshots[0]).toEqual(solvedEngine.getState());
  });

  it("snapshot[0] matches a provided initialState", () => {
    const engine = new CubeEngine();
    engine.applyAlgorithm("R U R'");
    const scrambled = engine.getState();

    const { snapshots } = buildPlaybackState("U", scrambled);
    expect(snapshots[0]).toEqual(scrambled);
  });

  it("snapshot[n] equals applying the first n moves from initialState", () => {
    const { snapshots, moves } = buildPlaybackState("R U");

    // Manually replay and compare
    const engine = new CubeEngine();
    engine.applyMove(moves[0]);
    expect(snapshots[1]).toEqual(engine.getState());

    engine.applyMove(moves[1]);
    expect(snapshots[2]).toEqual(engine.getState());
  });

  it("does not mutate a provided initialState object", () => {
    const engine = new CubeEngine();
    engine.applyAlgorithm("R");
    const state = engine.getState();
    const stateCopy = JSON.parse(JSON.stringify(state)) as typeof state;

    buildPlaybackState("U R U'", state);

    expect(state).toEqual(stateCopy);
  });

  it("handles an empty algorithm", () => {
    const { snapshots, moves } = buildPlaybackState("");
    expect(moves).toHaveLength(0);
    expect(snapshots).toHaveLength(1);
  });
});
```

- [ ] **Step 3: Run the tests — expect all 6 to pass**

```bash
cd C:/Users/raymo/OneDrive/Desktop/Projects/LTCube/ltcube && npx vitest run src/components/cube/__tests__/AlgorithmPlayer.test.ts
```

Expected output: `6 passed`.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/raymo/OneDrive/Desktop/Projects/LTCube/ltcube && git add src/components/cube/AlgorithmPlayer.tsx src/components/cube/__tests__/AlgorithmPlayer.test.ts && git commit -m "feat: add buildPlaybackState helper with tests"
```

---

## Task 2 — Full `AlgorithmPlayer` component

**Files:**
- Modify: `src/components/cube/AlgorithmPlayer.tsx` (replace placeholder component)

Replace the entire file with the complete component. The `buildPlaybackState` export stays identical.

- [ ] **Step 1: Replace `AlgorithmPlayer.tsx` with the full implementation**

```tsx
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
```

- [ ] **Step 2: Re-run the existing tests to confirm `buildPlaybackState` is unchanged**

```bash
cd C:/Users/raymo/OneDrive/Desktop/Projects/LTCube/ltcube && npx vitest run src/components/cube/__tests__/AlgorithmPlayer.test.ts
```

Expected: `6 passed` (same as before — implementation didn't change the helper).

- [ ] **Step 3: Run full test suite to check for regressions**

```bash
cd C:/Users/raymo/OneDrive/Desktop/Projects/LTCube/ltcube && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
cd C:/Users/raymo/OneDrive/Desktop/Projects/LTCube/ltcube && git add src/components/cube/AlgorithmPlayer.tsx && git commit -m "feat: implement AlgorithmPlayer component"
```

---

## Task 3 — Landing page: swap test buttons for AlgorithmPlayer demo

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
"use client";

import Link from "next/link";
import { CubeViewer } from "@/components/cube/CubeViewer";
import { AlgorithmPlayer } from "@/components/cube/AlgorithmPlayer";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <div className="flex flex-col-reverse gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-5 max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight text-[#1E293B] leading-tight">
            Learn to Solve the
            <br />
            Rubik&apos;s Cube
          </h1>
          <p className="text-lg text-[#64748B] leading-relaxed">
            Step-by-step interactive tutorials for beginners using the
            layer-by-layer method. Visualise every algorithm on a live 3D cube.
          </p>
          <div className="flex gap-3">
            <Link
              href="/learn"
              className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors"
            >
              Start Learning
            </Link>
            <Link
              href="/reference"
              className="inline-flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-semibold text-[#1E293B] shadow-sm hover:bg-[#F8FAFC] transition-colors"
            >
              View Algorithms
            </Link>
          </div>
        </div>

        {/* 3D Cube demo */}
        <div className="flex items-center justify-center">
          <CubeViewer size={320} interactive className="shadow-xl" />
        </div>
      </div>

      {/* Algorithm Player demo */}
      <AlgorithmPlayer
        algorithm="R U R' U'"
        title="Algorithm Playback"
        description="Use the controls below to step through moves, or press Space to play."
      />

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#F1F5F9] pt-8">
        {[
          { title: "3D Interactive Cube", desc: "Visualise any algorithm with live animated playback on a real 3D cube." },
          { title: "Step-by-step Tutorials", desc: "White Cross → White Corners → F2L → 2-Look OLL → 2-Look PLL." },
          { title: "Pattern Recognition Trainer", desc: "Drill all 16 OLL/PLL cases until recognition becomes instant." },
          { title: "Progress Tracking", desc: "Streak counter, session stats, and per-case mastery — stored locally." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <p className="font-semibold text-[#1E293B]">{f.title}</p>
            <p className="mt-1 text-sm text-[#64748B]">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run full test suite one final time**

```bash
cd C:/Users/raymo/OneDrive/Desktop/Projects/LTCube/ltcube && npx vitest run
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
cd C:/Users/raymo/OneDrive/Desktop/Projects/LTCube/ltcube && git add src/app/page.tsx && git commit -m "feat: replace test controls with AlgorithmPlayer demo on landing page"
```

---

## Manual Verification Checklist

After all tasks complete, open the app (`npm run dev`) and verify:

- [ ] Landing page loads without error; hero cube is visible
- [ ] AlgorithmPlayer card is visible with title "Algorithm Playback"
- [ ] Notation shows `R U R' U'` with `R` highlighted blue at start
- [ ] Progress bar starts empty
- [ ] **Step Forward** button animates `R`, then `U`, then `R'`, then `U'`; notation dim/highlight advances correctly
- [ ] **Step Back** button instantly restores previous state with no animation
- [ ] **Reset** button returns to solved; progress bar empties
- [ ] **Play** button auto-advances through all 4 moves, then stops
- [ ] **Pause** mid-play stops at the current step
- [ ] Speed buttons change animation speed (2x noticeably faster than 0.5x)
- [ ] Keyboard: click card to focus → Space plays/pauses, ← / → step, R resets
- [ ] Hero cube (top-right) animates in sync with the player
