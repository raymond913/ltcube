# Phase 2C: Connect Engine to 3D Viewer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the CubeEngine state into the React Three Fiber cube renderer so sticker colors, highlights, and dimming all react to Zustand store updates.

**Architecture:** `cubeStore` holds a singleton `CubeEngine` instance and exposes a plain `faces: CubeFaces` snapshot that React can diff. `CubeScene` reads from the store, computes per-cubie sticker colors via a position→face-cell mapping, and passes them as props to `Cubie`. `Cubie` renders colors dynamically and supports `highlighted` / `dimmed` material overrides.

**Tech Stack:** Next.js 16 App Router, React Three Fiber 9, Zustand 5, TypeScript — no new dependencies.

---

## File Map

| File | Change |
|------|--------|
| `src/lib/cubeEngine.ts` | Add `getCubieWorldPosition(cubieId)` public method |
| `src/lib/__tests__/cubeEngine.test.ts` | Add tests for `getCubieWorldPosition` |
| `src/stores/cubeStore.ts` | Replace stub with engine-backed store |
| `src/components/cube/Cubie.tsx` | Accept `faceColors`, `highlighted`, `dimmed` props |
| `src/components/cube/CubeScene.tsx` | Read store; compute + pass colors/highlights to Cubie |
| `src/components/cube/CubeViewer.tsx` | Accept `cubeState`, `highlightedCubies`, `onReady` props |
| `src/app/page.tsx` | Add temporary test button row |

---

## Position → Face-Cell Mapping Reference

Every cubie at 3D position `[x, y, z]` (coords in `{-1, 0, 1}`) has stickers on each face it touches. This mapping converts position + axis/sign into a `faces[Face][row][col]` lookup:

| Face | Condition | row | col |
|------|-----------|-----|-----|
| R (axis 0, sign +1) | x = 1  | `1 - y` | `1 - z` |
| L (axis 0, sign -1) | x = -1 | `1 - y` | `z + 1` |
| U (axis 1, sign +1) | y = 1  | `z + 1` | `x + 1` |
| D (axis 1, sign -1) | y = -1 | `1 - z` | `x + 1` |
| F (axis 2, sign +1) | z = 1  | `1 - y` | `x + 1` |
| B (axis 2, sign -1) | z = -1 | `1 - y` | `1 - x` |

Reverse mapping (face, row, col → world [x,y,z]), used by `getCubieWorldPosition`:

| Face | x | y | z |
|------|---|---|---|
| U | `col - 1` | `1` | `row - 1` |
| D | `col - 1` | `-1` | `1 - row` |
| F | `col - 1` | `1 - row` | `1` |
| B | `1 - col` | `1 - row` | `-1` |
| R | `1` | `1 - row` | `1 - col` |
| L | `-1` | `1 - row` | `col - 1` |

---

## Task 1: Add `getCubieWorldPosition` to CubeEngine

**Files:**
- Modify: `src/lib/cubeEngine.ts`
- Modify: `src/lib/__tests__/cubeEngine.test.ts`

- [ ] **Step 1: Add the failing tests**

Open `src/lib/__tests__/cubeEngine.test.ts` and append this describe block at the end of the file:

```typescript
// ---------------------------------------------------------------------------
// getCubieWorldPosition
// ---------------------------------------------------------------------------

describe("getCubieWorldPosition", () => {
  it("returns correct position for UFR corner in solved state", () => {
    const e = freshEngine();
    expect(e.getCubieWorldPosition("UFR")).toEqual([1, 1, 1]);
  });

  it("returns correct position for UF edge in solved state", () => {
    const e = freshEngine();
    expect(e.getCubieWorldPosition("UF")).toEqual([0, 1, 1]);
  });

  it("returns correct position for U center in solved state", () => {
    const e = freshEngine();
    expect(e.getCubieWorldPosition("U")).toEqual([0, 1, 0]);
  });

  it("returns null for unknown cubie ID", () => {
    const e = freshEngine();
    expect(e.getCubieWorldPosition("XYZ")).toBeNull();
  });

  it("tracks UFR corner to UBR after R move", () => {
    const e = freshEngine();
    e.applyAlgorithm("R");
    // R CW moves UFR → UBR
    expect(e.getCubieWorldPosition("UFR")).toEqual([1, 1, -1]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd ltcube && npm test -- --reporter=verbose 2>&1 | tail -20
```

Expected: 5 new failures referencing `getCubieWorldPosition is not a function`.

- [ ] **Step 3: Add `getCubieWorldPosition` to the CubeEngine class**

Open `src/lib/cubeEngine.ts`. Find the `getStickersForCubie` method (around line 195) and add this method directly after it:

```typescript
  /**
   * Returns the current 3D world position [x, y, z] of the cubie with the given ID.
   * Derived by reverse-mapping the first sticker's face/row/col back to 3D space.
   * Returns null if the cubie ID is not found.
   */
  getCubieWorldPosition(cubieId: string): [number, number, number] | null {
    const stickers = this.getStickersForCubie(cubieId);
    if (stickers.length === 0) return null;
    const { face, row, col } = stickers[0];
    switch (face) {
      case "U": return [col - 1,  1,       row - 1];
      case "D": return [col - 1, -1,       1 - row];
      case "F": return [col - 1,  1 - row, 1      ];
      case "B": return [1 - col,  1 - row, -1     ];
      case "R": return [1,        1 - row, 1 - col];
      case "L": return [-1,       1 - row, col - 1];
    }
  }
```

- [ ] **Step 4: Run tests to verify all pass**

```bash
npm test 2>&1 | tail -10
```

Expected:
```
Test Files  1 passed (1)
     Tests  36 passed (36)
```

---

## Task 2: Update cubeStore

**Files:**
- Modify: `src/stores/cubeStore.ts`

No new tests (Zustand stores are integration-tested via UI). Verification is via the test buttons added in Task 6.

- [ ] **Step 1: Replace the file entirely**

```typescript
import { create } from "zustand";
import { CubeEngine, type CubeFaces } from "@/lib/cubeEngine";
import { generateScramble } from "@/lib/scrambleGenerator";

// Singleton engine — lives for the lifetime of the app session.
// Not stored in Zustand state to avoid serialization issues.
const _engine = new CubeEngine();

interface CubeStore {
  /** Snapshot of the engine's face color state — updated after every action. */
  faces: CubeFaces;
  /** Cubie IDs to highlight (e.g. ["UFR", "UF"] for a tutorial step). */
  highlights: string[];

  /** Apply a single move string, e.g. "R", "U'", "F2". */
  execute: (move: string) => void;
  /** Apply a full algorithm string, e.g. "R U R' U'". */
  applyAlgorithm: (alg: string) => void;
  /** Return cube to solved state. */
  reset: () => void;
  /** Apply a random 20-move scramble. */
  scramble: () => void;
  /** Set which cubie IDs are highlighted. */
  setHighlights: (cubies: string[]) => void;
  /** Remove all highlights. */
  clearHighlights: () => void;
}

export const useCubeStore = create<CubeStore>()((set) => ({
  faces: _engine.getState(),
  highlights: [],

  execute: (move) => {
    _engine.applyMoveString(move);
    set({ faces: _engine.getState() });
  },

  applyAlgorithm: (alg) => {
    _engine.applyAlgorithm(alg);
    set({ faces: _engine.getState() });
  },

  reset: () => {
    _engine.reset();
    set({ faces: _engine.getState() });
  },

  scramble: () => {
    _engine.applyAlgorithm(generateScramble(20));
    set({ faces: _engine.getState() });
  },

  setHighlights: (cubies) => set({ highlights: cubies }),
  clearHighlights: () => set({ highlights: [] }),
}));

/** Imperative access to the engine for non-React code (e.g. algorithm playback). */
export { _engine as cubeEngine };
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
```

Expected: no output (zero errors).

---

## Task 3: Update Cubie Component

**Files:**
- Modify: `src/components/cube/Cubie.tsx`

- [ ] **Step 1: Replace the file entirely**

```typescript
"use client";

import { RoundedBox } from "@react-three/drei";

const BODY_SIZE = 0.93;
const STICKER_SIZE = 0.82;
const STICKER_OFFSET = BODY_SIZE / 2 + 0.003;

type Vec3 = [number, number, number];

/**
 * Key format for faceColors: `${axis}_${sign}` e.g. "0_1" = R face, "1_-1" = D face.
 * Matches the axis/sign fields in FACE_MAP below.
 */
export type FaceColorKey = `${number}_${number}`;

const FACE_MAP = [
  { axis: 0, sign:  1, color: "#DC2626", pos: [ STICKER_OFFSET,  0,               0             ] as Vec3, rot: [0,              Math.PI / 2, 0] as Vec3 },
  { axis: 0, sign: -1, color: "#EA580C", pos: [-STICKER_OFFSET,  0,               0             ] as Vec3, rot: [0,             -Math.PI / 2, 0] as Vec3 },
  { axis: 1, sign:  1, color: "#EAB308", pos: [ 0,               STICKER_OFFSET,  0             ] as Vec3, rot: [-Math.PI / 2,  0,           0] as Vec3 },
  { axis: 1, sign: -1, color: "#FFFFFF", pos: [ 0,              -STICKER_OFFSET,  0             ] as Vec3, rot: [ Math.PI / 2,  0,           0] as Vec3 },
  { axis: 2, sign:  1, color: "#2563EB", pos: [ 0,               0,               STICKER_OFFSET] as Vec3, rot: [0,             0,           0] as Vec3 },
  { axis: 2, sign: -1, color: "#16A34A", pos: [ 0,               0,              -STICKER_OFFSET] as Vec3, rot: [0,             Math.PI,     0] as Vec3 },
] as const;

interface CubieProps {
  position: Vec3;
  /**
   * Override sticker colors keyed by face. If absent for a face, falls back to
   * the solved-state default color for that face.
   */
  faceColors?: Partial<Record<FaceColorKey, string>>;
  /** Boosted emissive glow — use for tutorial highlighting. */
  highlighted?: boolean;
  /**
   * Reduced opacity — applied to cubies that are NOT highlighted when at least
   * one highlight is active.
   */
  dimmed?: boolean;
}

export function Cubie({ position, faceColors, highlighted = false, dimmed = false }: CubieProps) {
  const bodyOpacity    = dimmed ? 0.2  : 1;
  const stickerOpacity = dimmed ? 0.35 : 1;
  const emissiveIntensity = highlighted ? 0.4 : 0;

  return (
    <group position={position}>
      {/* Dark body */}
      <RoundedBox args={[BODY_SIZE, BODY_SIZE, BODY_SIZE]} radius={0.06} smoothness={2}>
        <meshStandardMaterial color="#1a1a1a" transparent opacity={bodyOpacity} />
      </RoundedBox>

      {/* Colored sticker on each visible (outer) face */}
      {FACE_MAP.map(({ axis, sign, color, pos, rot }) => {
        if (position[axis] !== sign) return null;
        const key = `${axis}_${sign}` as FaceColorKey;
        const stickerColor = faceColors?.[key] ?? color;
        return (
          <mesh key={`${axis}${sign}`} position={pos} rotation={rot}>
            <planeGeometry args={[STICKER_SIZE, STICKER_SIZE]} />
            <meshStandardMaterial
              color={stickerColor}
              transparent
              opacity={stickerOpacity}
              emissive={stickerColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );
      })}
    </group>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
```

Expected: no output.

---

## Task 4: Update CubeScene — Drive Colors From Store

**Files:**
- Modify: `src/components/cube/CubeScene.tsx`

- [ ] **Step 1: Replace the file entirely**

```typescript
"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Cubie, type FaceColorKey } from "./Cubie";
import { useCubeStore, cubeEngine } from "@/stores/cubeStore";
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

/**
 * Compute the sticker color hex values for one cubie at world position [x,y,z].
 * Only populates keys for faces that are actually visible (outer faces only).
 */
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

interface CubeSceneProps {
  interactive: boolean;
  /** Optional override: if provided, uses this state instead of the store. */
  cubeState?: CubeFaces;
  /** Cubie IDs to highlight, e.g. ["UFR", "UF"]. */
  highlightedCubies?: string[];
  /** Called once when the Canvas is fully mounted. */
  onReady?: () => void;
}

export function CubeScene({ interactive, cubeState, highlightedCubies, onReady }: CubeSceneProps) {
  const storeFaces      = useCubeStore((s) => s.faces);
  const storeHighlights = useCubeStore((s) => s.highlights);

  const faces      = cubeState         ?? storeFaces;
  const highlights = highlightedCubies ?? storeHighlights;
  const hasHighlight = highlights.length > 0;

  // Resolve highlighted cubie IDs → world positions (Set of "x,y,z" strings for O(1) lookup)
  const highlightedPositions = useMemo(() => {
    if (!hasHighlight) return new Set<string>();
    const set = new Set<string>();
    for (const id of highlights) {
      const pos = cubeEngine.getCubieWorldPosition(id);
      if (pos) set.add(pos.join(","));
    }
    return set;
  }, [highlights, hasHighlight]);

  return (
    <Canvas
      camera={{ position: [4, 3, 4], fov: 42, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      onCreated={() => onReady?.()}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 8, 5]} intensity={1.1} />
      <directionalLight position={[-4, -2, -3]} intensity={0.25} />

      <group>
        {CUBIE_POSITIONS.map(([x, y, z]) => {
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
        })}
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
    </Canvas>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
```

Expected: no output.

---

## Task 5: Update CubeViewer Props

**Files:**
- Modify: `src/components/cube/CubeViewer.tsx`

- [ ] **Step 1: Replace the file entirely**

```typescript
"use client";

import dynamic from "next/dynamic";
import type { CubeFaces } from "@/lib/cubeEngine";

const CubeScene = dynamic(
  () => import("./CubeScene").then((m) => m.CubeScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-[#F8FAFC] rounded-xl">
        <span className="text-sm text-[#64748B]">Loading 3D view…</span>
      </div>
    ),
  }
);

interface CubeViewerProps {
  /** Canvas width and height in pixels (default 300) */
  size?: number;
  /** Enable OrbitControls mouse/touch rotation (default true) */
  interactive?: boolean;
  /** Extra Tailwind / CSS classes for the container */
  className?: string;
  /** Override cube state (uses store state if omitted) */
  cubeState?: CubeFaces;
  /** Cubie IDs to highlight, e.g. ["UFR", "UF"] */
  highlightedCubies?: string[];
  /** Called once when the Canvas is mounted and ready */
  onReady?: () => void;
}

export function CubeViewer({
  size = 300,
  interactive = true,
  className = "",
  cubeState,
  highlightedCubies,
  onReady,
}: CubeViewerProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl overflow-hidden ${className}`}
    >
      <CubeScene
        interactive={interactive}
        cubeState={cubeState}
        highlightedCubies={highlightedCubies}
        onReady={onReady}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
```

Expected: no output.

---

## Task 6: Add Temporary Test UI to Landing Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace the file entirely**

```typescript
"use client";

import Link from "next/link";
import { CubeViewer } from "@/components/cube/CubeViewer";
import { useCubeStore } from "@/stores/cubeStore";

export default function HomePage() {
  const { execute, applyAlgorithm, reset, scramble } = useCubeStore();

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

      {/* Temporary Phase 2C test controls — remove before Phase 3 */}
      <div className="flex flex-col gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">
          Phase 2C Test Controls (temporary)
        </p>
        <div className="flex flex-wrap gap-2">
          {(["R", "U", "R'", "U'", "F", "L", "D", "B"] as const).map((move) => (
            <button
              key={move}
              onClick={() => execute(move)}
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

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | grep -E "error TS" | head -20
```

Expected: no output.

- [ ] **Step 3: Run tests to confirm nothing regressed**

```bash
npm test 2>&1 | tail -6
```

Expected:
```
Test Files  1 passed (1)
     Tests  36 passed (36)
```

- [ ] **Step 4: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Confirm:
1. Cube renders with correct solved-state colors (yellow top, white bottom, blue front, green back, red right, orange left)
2. Clicking "R" rotates the right face — right column stickers update correctly
3. Clicking "U'" rotates the top face CCW
4. Clicking "Scramble" randomizes all sticker colors
5. Clicking "Reset" returns to solved colors
6. No TypeScript or console errors (aside from the pre-existing THREE.Clock deprecation warning)
