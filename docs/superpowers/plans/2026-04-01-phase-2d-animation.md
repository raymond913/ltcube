# Phase 2D — Smooth Rotation Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add smooth GSAP-powered face-rotation animations to every cube move, with a promise-based move queue, configurable speed, and animated scramble.

**Architecture:** A JSX pivot group inside `CubeScene` holds the 9 face cubies during a move; GSAP tweens the group's rotation directly (bypassing React); on complete the engine commits the move and React re-renders once with updated colors. The store serialises moves via promise-chaining so rapid clicks queue cleanly.

**Tech Stack:** GSAP 3 (bundled types), React 19 `flushSync`, Zustand 5, Three.js Euler, React Three Fiber

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `vitest.config.ts` | Modify | Add `@/` path alias so store tests can import from `@/stores/...` |
| `src/stores/__tests__/cubeStore.test.ts` | Create | Tests for `commitAnimatedMove`, `animateMove` fallback, handler registration, speed, `animateAlgorithm` |
| `src/stores/cubeStore.ts` | Modify | Animation bridge (module-level), `isAnimating`, `animationSpeed`, `animateMove`, `animateAlgorithm`, `setAnimationSpeed`, updated `scramble` |
| `src/components/cube/CubeScene.tsx` | Modify | `currentAnim` state, `pivotRef`, split cubie render, `useEffect` registering GSAP animation handler |
| `src/app/page.tsx` | Modify | Buttons call `animateMove`; scramble button calls `scramble` (which already delegates to `animateAlgorithm`) |

---

### Task 1: Install GSAP and add vitest path alias

**Files:**
- Modify: `vitest.config.ts`
- (run npm install)

- [ ] **Step 1: Install GSAP**

```bash
cd ltcube && npm install gsap --legacy-peer-deps
```

Expected output ends with: `added N packages` (no errors).

- [ ] **Step 2: Update vitest.config.ts to add the `@/` alias**

Replace the full file:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Run existing tests to confirm nothing broke**

```bash
npm test
```

Expected: all existing tests pass.

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts package.json package-lock.json
git commit -m "chore: install gsap, add @ path alias to vitest"
```

---

### Task 2: Write failing cubeStore animation tests

**Files:**
- Create: `src/stores/__tests__/cubeStore.test.ts`

- [ ] **Step 1: Create the test file**

```typescript
import { beforeEach, describe, it, expect, vi } from "vitest";
import {
  useCubeStore,
  commitAnimatedMove,
  registerAnimationHandler,
  unregisterAnimationHandler,
} from "../cubeStore";

beforeEach(() => {
  useCubeStore.getState().reset();
  useCubeStore.setState({ isAnimating: false, animationSpeed: 1 });
  unregisterAnimationHandler();
});

// ---------------------------------------------------------------------------
// commitAnimatedMove
// ---------------------------------------------------------------------------

describe("commitAnimatedMove", () => {
  it("applies the move to the engine and updates faces", () => {
    const before = useCubeStore.getState().faces;
    commitAnimatedMove("R");
    const after = useCubeStore.getState().faces;
    expect(after).not.toEqual(before);
  });

  it("R then R' returns to solved state", () => {
    const solved = useCubeStore.getState().faces;
    commitAnimatedMove("R");
    commitAnimatedMove("R'");
    expect(useCubeStore.getState().faces).toEqual(solved);
  });
});

// ---------------------------------------------------------------------------
// animateMove — no handler registered (instant fallback)
// ---------------------------------------------------------------------------

describe("animateMove fallback (no handler)", () => {
  it("applies the move instantly and resolves", async () => {
    const before = useCubeStore.getState().faces;
    await useCubeStore.getState().animateMove("U");
    expect(useCubeStore.getState().faces).not.toEqual(before);
  });

  it("isAnimating is false after resolving", async () => {
    await useCubeStore.getState().animateMove("F");
    expect(useCubeStore.getState().isAnimating).toBe(false);
  });

  it("isAnimating is true during the move", async () => {
    let duringMove = false;
    registerAnimationHandler(async () => {
      duringMove = useCubeStore.getState().isAnimating;
    });
    await useCubeStore.getState().animateMove("R");
    expect(duringMove).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// animateMove — with registered handler
// ---------------------------------------------------------------------------

describe("animateMove with handler", () => {
  it("calls the registered handler with the move notation", async () => {
    const handler = vi.fn(async (_move: string, _ms: number) => {});
    registerAnimationHandler(handler);
    await useCubeStore.getState().animateMove("R");
    expect(handler).toHaveBeenCalledWith("R", 300);
  });

  it("computes durationMs = 300 / speed (speed 2 → 150ms)", async () => {
    const handler = vi.fn(async (_move: string, _ms: number) => {});
    registerAnimationHandler(handler);
    useCubeStore.getState().setAnimationSpeed(2);
    await useCubeStore.getState().animateMove("L");
    expect(handler).toHaveBeenCalledWith("L", 150);
  });

  it("computes durationMs = 300 / speed (speed 0.5 → 600ms)", async () => {
    const handler = vi.fn(async (_move: string, _ms: number) => {});
    registerAnimationHandler(handler);
    useCubeStore.getState().setAnimationSpeed(0.5);
    await useCubeStore.getState().animateMove("B");
    expect(handler).toHaveBeenCalledWith("B", 600);
  });
});

// ---------------------------------------------------------------------------
// animateAlgorithm
// ---------------------------------------------------------------------------

describe("animateAlgorithm", () => {
  it("calls animateMove for each token in the alg string, in order", async () => {
    const received: string[] = [];
    registerAnimationHandler(async (move) => { received.push(move); });
    await useCubeStore.getState().animateAlgorithm("R U R'");
    expect(received).toEqual(["R", "U", "R'"]);
  });

  it("resolves immediately for an empty string", async () => {
    await expect(useCubeStore.getState().animateAlgorithm("")).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// setAnimationSpeed
// ---------------------------------------------------------------------------

describe("setAnimationSpeed", () => {
  it("updates animationSpeed in state", () => {
    useCubeStore.getState().setAnimationSpeed(1.5);
    expect(useCubeStore.getState().animationSpeed).toBe(1.5);
  });
});
```

- [ ] **Step 2: Run tests and confirm they all fail (functions not yet exported)**

```bash
npm test
```

Expected: multiple failures — `commitAnimatedMove is not a function`, `registerAnimationHandler is not a function`, etc.

---

### Task 3: Implement cubeStore animation bridge and actions

**Files:**
- Modify: `src/stores/cubeStore.ts`

- [ ] **Step 1: Replace the full file with the updated implementation**

```typescript
import { create } from "zustand";
import { CubeEngine, type CubeFaces, parseAlgorithm } from "@/lib/cubeEngine";
import { generateScramble } from "@/lib/scrambleGenerator";

// Singleton engine — lives for the lifetime of the app session.
const _engine = new CubeEngine();

// ---------------------------------------------------------------------------
// Animation bridge — module-level, never serialised into Zustand state
// ---------------------------------------------------------------------------

let _animChain: Promise<void> = Promise.resolve();
let _pendingCount = 0;
let _animHandler: ((move: string, durationMs: number) => Promise<void>) | null = null;

/** Called by CubeScene on mount — registers the GSAP animation handler. */
export function registerAnimationHandler(
  fn: (move: string, durationMs: number) => Promise<void>,
): void {
  _animHandler = fn;
}

/** Called by CubeScene on unmount. */
export function unregisterAnimationHandler(): void {
  _animHandler = null;
}

/**
 * Called by CubeScene after GSAP completes a move.
 * Applies the move to the engine and pushes the new face state into Zustand.
 */
export function commitAnimatedMove(move: string): void {
  _engine.applyMoveString(move);
  useCubeStore.setState({ faces: _engine.getState() });
}

/** Execute one move — via handler if registered, else instant fallback. */
async function _runSingle(move: string): Promise<void> {
  const { animationSpeed } = useCubeStore.getState();
  const durationMs = 300 / animationSpeed;
  if (_animHandler) {
    await _animHandler(move, durationMs);
  } else {
    _engine.applyMoveString(move);
    useCubeStore.setState({ faces: _engine.getState() });
  }
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface CubeStore {
  faces: CubeFaces;
  highlights: string[];
  isAnimating: boolean;
  animationSpeed: number;

  execute: (move: string) => void;
  applyAlgorithm: (alg: string) => void;
  reset: () => void;
  scramble: () => void;
  setHighlights: (cubies: string[]) => void;
  clearHighlights: () => void;

  animateMove: (move: string) => Promise<void>;
  animateAlgorithm: (alg: string) => Promise<void>;
  setAnimationSpeed: (speed: number) => void;
}

export const useCubeStore = create<CubeStore>()(() => ({
  faces: _engine.getState(),
  highlights: [],
  isAnimating: false,
  animationSpeed: 1,

  execute: (move) => {
    _engine.applyMoveString(move);
    useCubeStore.setState({ faces: _engine.getState() });
  },

  applyAlgorithm: (alg) => {
    _engine.applyAlgorithm(alg);
    useCubeStore.setState({ faces: _engine.getState() });
  },

  reset: () => {
    _engine.reset();
    useCubeStore.setState({ faces: _engine.getState() });
  },

  scramble: () => {
    useCubeStore.getState().animateAlgorithm(generateScramble(20));
  },

  setHighlights: (cubies) => useCubeStore.setState({ highlights: cubies }),
  clearHighlights: () => useCubeStore.setState({ highlights: [] }),

  setAnimationSpeed: (speed) => useCubeStore.setState({ animationSpeed: speed }),

  animateMove: (move) => {
    _pendingCount++;
    useCubeStore.setState({ isAnimating: true });
    const p = _animChain.then(() => _runSingle(move));
    _animChain = p.catch(() => {});
    return p.finally(() => {
      _pendingCount--;
      if (_pendingCount === 0) useCubeStore.setState({ isAnimating: false });
    });
  },

  animateAlgorithm: (alg) => {
    const moves = parseAlgorithm(alg);
    return moves.reduce<Promise<void>>(
      (chain, m) => chain.then(() => useCubeStore.getState().animateMove(m.notation)),
      Promise.resolve(),
    );
  },
}));

/** Imperative access to the engine for non-React code (e.g. algorithm playback). */
export { _engine as cubeEngine };
```

- [ ] **Step 2: Run tests and confirm they all pass**

```bash
npm test
```

Expected: all tests pass including the new cubeStore tests.

- [ ] **Step 3: Commit**

```bash
git add src/stores/cubeStore.ts src/stores/__tests__/cubeStore.test.ts
git commit -m "feat: add animation bridge and animated move actions to cubeStore"
```

---

### Task 4: Update CubeScene with pivot group and GSAP animation handler

**Files:**
- Modify: `src/components/cube/CubeScene.tsx`

- [ ] **Step 1: Replace the full file with the animated version**

```typescript
"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { flushSync } from "react-dom";
import gsap from "gsap";
import * as THREE from "three";
import { Cubie, type FaceColorKey } from "./Cubie";
import {
  useCubeStore,
  cubeEngine,
  registerAnimationHandler,
  unregisterAnimationHandler,
  commitAnimatedMove,
} from "@/stores/cubeStore";
import { parseAlgorithm } from "@/lib/cubeEngine";
import type { CubeFaces } from "@/lib/cubeEngine";

type Vec3 = [number, number, number];

const COLOR_HEX: Record<string, string> = {
  yellow: "#EAB308",
  white:  "#FFFFFF",
  blue:   "#2563EB",
  green:  "#16A34A",
  red:    "#DC2626",
  orange: "#EA580C",
};

// 26 visible cubie positions — all (x,y,z) combos in {-1,0,1}³ except (0,0,0)
const CUBIE_POSITIONS: Vec3[] = [];
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      if (x === 0 && y === 0 && z === 0) continue;
      CUBIE_POSITIONS.push([x, y, z]);
    }
  }
}

// Rotation axis index and clockwise base angle for each face.
// Axis index: 0=x, 1=y, 2=z.  Angles verified against cubeEngine move strips.
const FACE_ANIM: Record<string, { axisIndex: 0 | 1 | 2; cwAngle: number }> = {
  R: { axisIndex: 0, cwAngle: -Math.PI / 2 },
  L: { axisIndex: 0, cwAngle:  Math.PI / 2 },
  U: { axisIndex: 1, cwAngle: -Math.PI / 2 },
  D: { axisIndex: 1, cwAngle:  Math.PI / 2 },
  F: { axisIndex: 2, cwAngle: -Math.PI / 2 },
  B: { axisIndex: 2, cwAngle:  Math.PI / 2 },
};

/** Returns true when position [x,y,z] belongs to the named face slice. */
function isInFace(face: string | undefined, x: number, y: number, z: number): boolean {
  switch (face) {
    case "R": return x === 1;
    case "L": return x === -1;
    case "U": return y === 1;
    case "D": return y === -1;
    case "F": return z === 1;
    case "B": return z === -1;
    default:  return false;
  }
}

function computeFaceColors(
  faces: CubeFaces,
  x: number,
  y: number,
  z: number,
): Partial<Record<FaceColorKey, string>> {
  const c: Partial<Record<FaceColorKey, string>> = {};
  if (x ===  1) c["0_1"]  = COLOR_HEX[faces.R[1 - y][1 - z]];
  if (x === -1) c["0_-1"] = COLOR_HEX[faces.L[1 - y][z + 1]];
  if (y ===  1) c["1_1"]  = COLOR_HEX[faces.U[z + 1][x + 1]];
  if (y === -1) c["1_-1"] = COLOR_HEX[faces.D[1 - z][x + 1]];
  if (z ===  1) c["2_1"]  = COLOR_HEX[faces.F[1 - y][x + 1]];
  if (z === -1) c["2_-1"] = COLOR_HEX[faces.B[1 - y][1 - x]];
  return c;
}

interface CurrentAnim {
  face: string;
  axisIndex: 0 | 1 | 2;
  targetAngle: number;
}

interface CubeSceneProps {
  interactive: boolean;
  cubeState?: CubeFaces;
  highlightedCubies?: string[];
  onReady?: () => void;
}

// ---------------------------------------------------------------------------
// AnimatedScene — lives inside the Canvas, has access to R3F context
// ---------------------------------------------------------------------------

function AnimatedScene({ interactive, cubeState, highlightedCubies, onReady }: CubeSceneProps) {
  const storeFaces      = useCubeStore((s) => s.faces);
  const storeHighlights = useCubeStore((s) => s.highlights);

  const faces      = cubeState         ?? storeFaces;
  const highlights = highlightedCubies ?? storeHighlights;
  const hasHighlight = highlights.length > 0;

  const [currentAnim, setCurrentAnim] = useState<CurrentAnim | null>(null);
  const pivotRef = useRef<THREE.Group>(null);

  // Resolve highlighted cubie IDs → world positions for O(1) lookup
  const highlightedPositions = useMemo(() => {
    if (!hasHighlight) return new Set<string>();
    const set = new Set<string>();
    for (const id of highlights) {
      const pos = cubeEngine.getCubieWorldPosition(id);
      if (pos) set.add(pos.join(","));
    }
    return set;
  }, [highlights, hasHighlight]);

  // Register the GSAP animation handler with the store on mount
  useEffect(() => {
    const handler = (move: string, durationMs: number): Promise<void> => {
      return new Promise((resolve) => {
        const parsed  = parseAlgorithm(move)[0];
        const animDef = parsed ? FACE_ANIM[parsed.face] : undefined;

        if (!parsed || !animDef) {
          // Wide move or cube rotation — no face slice, fall back to instant
          commitAnimatedMove(move);
          resolve();
          return;
        }

        let targetAngle = animDef.cwAngle;
        if (parsed.inverse) targetAngle *= -1;
        if (parsed.double)  targetAngle *= 2;

        // flushSync forces React to commit the state update synchronously so
        // the 9 face cubies are inside the pivot group before GSAP starts.
        flushSync(() => {
          setCurrentAnim({ face: parsed.face, axisIndex: animDef.axisIndex, targetAngle });
        });

        const pivot = pivotRef.current;
        if (!pivot) {
          commitAnimatedMove(move);
          resolve();
          return;
        }

        const axisKeys = ["x", "y", "z"] as const;
        const axisKey  = axisKeys[animDef.axisIndex];

        gsap.to(pivot.rotation, {
          [axisKey]: targetAngle,
          duration: durationMs / 1000,
          ease: "power2.inOut",
          onComplete: () => {
            // Reset pivot before the re-render so there is no visual snap
            pivot.rotation.set(0, 0, 0);
            // Commit the logical move — updates engine + pushes new faces into Zustand
            commitAnimatedMove(move);
            // Clear currentAnim — all 26 cubies return to the normal render path
            setCurrentAnim(null);
            resolve();
          },
        });
      });
    };

    registerAnimationHandler(handler);
    return () => unregisterAnimationHandler();
  }, []);

  // Shared cubie renderer
  const renderCubie = ([x, y, z]: Vec3) => {
    const posKey = `${x},${y},${z}`;
    const isHighlighted = highlightedPositions.has(posKey);
    const isDimmed = hasHighlight && !isHighlighted;
    return (
      <Cubie
        key={posKey}
        position={[x, y, z]}
        faceColors={computeFaceColors(faces, x, y, z)}
        highlighted={isHighlighted}
        dimmed={isDimmed}
      />
    );
  };

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 8, 5]} intensity={1.1} />
      <directionalLight position={[-4, -2, -3]} intensity={0.25} />

      {/* 17 non-rotating cubies */}
      <group>
        {CUBIE_POSITIONS
          .filter(([x, y, z]) => !isInFace(currentAnim?.face, x, y, z))
          .map(renderCubie)}
      </group>

      {/* Pivot group — holds the 9 face cubies during a rotation */}
      <group ref={pivotRef}>
        {CUBIE_POSITIONS
          .filter(([x, y, z]) => isInFace(currentAnim?.face, x, y, z))
          .map(renderCubie)}
      </group>

      {interactive && (
        <OrbitControls
          enableZoom
          minDistance={3.5}
          maxDistance={8}
          enablePan={false}
          enableDamping
          dampingFactor={0.07}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// CubeScene — public export, wraps AnimatedScene in a Canvas
// ---------------------------------------------------------------------------

export function CubeScene({ interactive, cubeState, highlightedCubies, onReady }: CubeSceneProps) {
  return (
    <Canvas
      camera={{ position: [4, 3, 4], fov: 42, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      onCreated={() => onReady?.()}
    >
      <AnimatedScene
        interactive={interactive}
        cubeState={cubeState}
        highlightedCubies={highlightedCubies}
        onReady={onReady}
      />
    </Canvas>
  );
}
```

- [ ] **Step 2: Run tests to confirm nothing broke**

```bash
npm test
```

Expected: all tests still pass (CubeScene is not unit-tested — it requires a browser/WebGL environment).

- [ ] **Step 3: Commit**

```bash
git add src/components/cube/CubeScene.tsx
git commit -m "feat: add pivot group and GSAP rotation animation to CubeScene"
```

---

### Task 5: Update landing page buttons to use animated moves

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the full file**

```typescript
"use client";

import Link from "next/link";
import { CubeViewer } from "@/components/cube/CubeViewer";
import { useCubeStore } from "@/stores/cubeStore";

export default function HomePage() {
  const { animateMove, reset, scramble } = useCubeStore();

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

      {/* Temporary Phase 2D test controls — remove before Phase 3 */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
          Phase 2D Test Controls (temporary)
        </p>
        <div className="flex flex-wrap gap-2">
          {(["R", "U", "R'", "U'", "F", "L", "D", "B"] as const).map((move) => (
            <button
              key={move}
              onClick={() => animateMove(move)}
              className="rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm font-mono font-semibold text-[#1E293B] shadow-sm hover:bg-[#F1F5F9] transition-colors"
            >
              {move}
            </button>
          ))}
          <button
            onClick={scramble}
            className="rounded-md bg-[#2563EB] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors"
          >
            Scramble
          </button>
          <button
            onClick={reset}
            className="rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm font-semibold text-[#64748B] shadow-sm hover:bg-[#F1F5F9] transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

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

- [ ] **Step 2: Run tests**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire landing page buttons to animated moves (Phase 2D)"
```

---

### Task 6: Manual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Open http://localhost:3000 and verify**

Checklist:
- Click **R** — the right face (red stickers) rotates 90° clockwise with smooth ease-in-out over ~300ms, then colors update
- Click **U** — top face (yellow) rotates 90° smoothly
- Click **R'** — right face rotates the opposite direction
- Click **R** rapidly 4 times — all 4 moves queue and play through sequentially without overlapping
- Click **R** then **U** — both play sequentially, never simultaneously
- Click **Scramble** — 20 moves play through one-by-one animatedly
- Click **Reset** — cube snaps instantly to solved, no animation

- [ ] **Step 3: Verify build has no TypeScript errors**

```bash
npm run build
```

Expected: build succeeds with no type errors.

- [ ] **Step 4: Final commit (if any last fixes were needed)**

```bash
git add -A
git commit -m "fix: phase 2d cleanup" # only if changes were made
```
