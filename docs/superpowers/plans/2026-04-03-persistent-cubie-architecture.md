# Persistent Cubie Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite CubeScene to use persistent imperative Three.js cubie objects that carry their own colors and accumulate world transforms across moves, eliminating the post-animation color snap.

**Architecture:** 26 `THREE.Group` objects are created once on mount and managed imperatively. Colors are baked at creation from the solved state and never change. Animations reparent 9 cubies into a pivot group, GSAP animates the pivot, then cubies are reparented back with updated world transforms. A Zustand subscribe + move-log matching handles AlgorithmPlayer's direct setState calls (step-back/reset).

**Tech Stack:** React Three Fiber (`useThree`), Three.js (imperative), GSAP, Zustand v5, `three-stdlib` (RoundedBoxGeometry via `@react-three/drei` dep), TypeScript

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/components/cube/Cubie.tsx` | Modify | Updated visual spec (radius, sticker size, no opacity/dim) |
| `src/stores/cubeStore.ts` | Modify | Duration formula 400ms, `applyInstant`, instant handler registration |
| `src/components/cube/CubeScene.tsx` | Full rewrite | Imperative cubie creation, pivot animation, Zustand subscribe |
| `CLAUDE.md` | Modify | Update F/B angle docs and speed table |

---

## Task 1: Update Cubie.tsx

**Files:**
- Modify: `src/components/cube/Cubie.tsx`

- [ ] **Step 1: Replace Cubie.tsx with updated visual spec**

The changes: radius 0.06→0.08, sticker size 0.82→0.79, sticker offset to 0.466 (body/2 + 0.001), body color #1a1a1a→#1E1E1E, remove `highlighted`/`dimmed` props, remove all opacity/transparency/emissive logic.

Write this complete file to `src/components/cube/Cubie.tsx`:

```tsx
"use client";

import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const BODY_SIZE   = 0.93;
const STICKER_SIZE   = 0.79;    // ≈ 0.85 × BODY_SIZE
const STICKER_OFFSET = 0.466;   // BODY_SIZE / 2 + 0.001

type Vec3 = [number, number, number];

/**
 * Key format for faceColors: `${axis}_${sign}` e.g. "0_1" = R face, "1_-1" = D face.
 */
export type FaceColorKey = `${number}_${number}`;

const FACE_MAP = [
  { axis: 0, sign:  1, color: "#DC2626", pos: [ STICKER_OFFSET,  0,              0             ] as Vec3, rot: [0,            Math.PI / 2, 0] as Vec3 },
  { axis: 0, sign: -1, color: "#EA580C", pos: [-STICKER_OFFSET,  0,              0             ] as Vec3, rot: [0,           -Math.PI / 2, 0] as Vec3 },
  { axis: 1, sign:  1, color: "#EAB308", pos: [ 0,              STICKER_OFFSET,  0             ] as Vec3, rot: [-Math.PI / 2, 0,           0] as Vec3 },
  { axis: 1, sign: -1, color: "#FFFFFF", pos: [ 0,             -STICKER_OFFSET,  0             ] as Vec3, rot: [ Math.PI / 2, 0,           0] as Vec3 },
  { axis: 2, sign:  1, color: "#2563EB", pos: [ 0,              0,               STICKER_OFFSET] as Vec3, rot: [0,            0,           0] as Vec3 },
  { axis: 2, sign: -1, color: "#16A34A", pos: [ 0,              0,              -STICKER_OFFSET] as Vec3, rot: [0,            Math.PI,     0] as Vec3 },
] as const;

interface CubieProps {
  position: Vec3;
  faceColors?: Partial<Record<FaceColorKey, string>>;
}

export function Cubie({ position, faceColors }: CubieProps) {
  return (
    <group position={position}>
      <RoundedBox args={[BODY_SIZE, BODY_SIZE, BODY_SIZE]} radius={0.08} smoothness={2}>
        <meshStandardMaterial color="#1E1E1E" />
      </RoundedBox>

      {FACE_MAP.map(({ axis, sign, color, pos, rot }) => {
        if (position[axis] !== sign) return null;
        const key = `${axis}_${sign}` as FaceColorKey;
        const stickerColor = faceColors?.[key] ?? color;
        return (
          <mesh key={`${axis}${sign}`} position={pos} rotation={rot}>
            <planeGeometry args={[STICKER_SIZE, STICKER_SIZE]} />
            <meshStandardMaterial
              color={stickerColor}
              side={THREE.DoubleSide}
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
cd ltcube && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors from Cubie.tsx. (Other errors from CubeScene are expected since it still references the old `highlighted`/`dimmed` props — those get fixed in Task 3.)

- [ ] **Step 3: Commit**

```bash
cd ltcube && git add src/components/cube/Cubie.tsx
git commit -m "refactor(cubie): update radius/sticker-size, remove opacity/dim system"
```

---

## Task 2: Update cubeStore.ts

**Files:**
- Modify: `src/stores/cubeStore.ts`

- [ ] **Step 1: Write the updated cubeStore.ts**

Changes:
- Duration: `300 / speed` → `400 / speed`
- Add `_instantHandler` module-level var
- Export `registerInstantHandler` / `unregisterInstantHandler`
- Add `applyInstant(alg)` action (updates engine + Zustand + calls handler with alg string)
- Update `reset()` to call `_instantHandler?.(null)` (null = reset to solved)

Write this complete file to `src/stores/cubeStore.ts`:

```ts
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
let _instantHandler: ((alg: string | null) => void) | null = null;

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
 * Called by CubeScene on mount — registers the instant (no-animation) apply handler.
 * alg: algorithm string to apply from solved, or null to just reset to solved.
 */
export function registerInstantHandler(
  fn: (alg: string | null) => void,
): void {
  _instantHandler = fn;
}

/** Called by CubeScene on unmount. */
export function unregisterInstantHandler(): void {
  _instantHandler = null;
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
  const durationMs = 400 / useCubeStore.getState().animationSpeed;
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
  applyInstant: (alg: string) => void;
  reset: () => void;
  scramble: () => void;
  setHighlights: (cubies: string[]) => void;
  clearHighlights: () => void;

  animateMove: (move: string) => Promise<void>;
  animateAlgorithm: (alg: string) => Promise<void>;
  setAnimationSpeed: (speed: number) => void;
}

export const useCubeStore = create<CubeStore>()((set, get) => ({
  faces: _engine.getState(),
  highlights: [],
  isAnimating: false,
  animationSpeed: 1,

  execute: (move) => {
    _engine.applyMoveString(move);
    set({ faces: _engine.getState() });
  },

  applyAlgorithm: (alg) => {
    _engine.applyAlgorithm(alg);
    set({ faces: _engine.getState() });
  },

  applyInstant: (alg) => {
    _engine.reset();
    _engine.applyAlgorithm(alg);
    set({ faces: _engine.getState() });
    _instantHandler?.(alg);
  },

  reset: () => {
    _engine.reset();
    set({ faces: _engine.getState() });
    _instantHandler?.(null);
  },

  scramble: () => {
    get().animateAlgorithm(generateScramble(20));
  },

  setHighlights: (cubies) => set({ highlights: cubies }),
  clearHighlights: () => set({ highlights: [] }),

  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),

  animateMove: (move): Promise<void> => {
    _pendingCount++;
    set({ isAnimating: true });
    const p = _animChain.then(() => _runSingle(move));
    _animChain = p.catch(() => {});
    return p.finally(() => {
      _pendingCount--;
      if (_pendingCount === 0) set({ isAnimating: false });
    });
  },

  animateAlgorithm: (alg): Promise<void> => {
    const moves = parseAlgorithm(alg);
    return moves.reduce<Promise<void>>(
      (chain, m) => chain.then(() => get().animateMove(m.notation)),
      Promise.resolve(),
    );
  },
}));

/** Imperative access to the engine for non-React code (e.g. algorithm playback). */
export { _engine as cubeEngine };
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd ltcube && npx tsc --noEmit 2>&1 | head -30
```

Expected: no new errors from cubeStore.ts. (CubeScene errors from old props are still expected.)

- [ ] **Step 3: Commit**

```bash
cd ltcube && git add src/stores/cubeStore.ts
git commit -m "feat(store): 400ms base duration, applyInstant, instant handler registration"
```

---

## Task 3: Rewrite CubeScene.tsx

**Files:**
- Modify: `src/components/cube/CubeScene.tsx`

This is the full rewrite. The complete file is shown in one step. Read it carefully — there are several moving parts that must stay in sync.

- [ ] **Step 1: Write CubeScene.tsx**

Write this complete file to `src/components/cube/CubeScene.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import {
  useCubeStore,
  registerAnimationHandler,
  unregisterAnimationHandler,
  registerInstantHandler,
  unregisterInstantHandler,
  commitAnimatedMove,
} from "@/stores/cubeStore";
import { CubeEngine, parseAlgorithm } from "@/lib/cubeEngine";
import type { CubeFaces } from "@/lib/cubeEngine";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type Vec3 = [number, number, number];

const BODY_SIZE      = 0.93;
const STICKER_SIZE   = 0.79;    // ≈ 0.85 × BODY_SIZE
const STICKER_OFFSET = 0.466;   // BODY_SIZE / 2 + 0.001

/** Solved-state sticker colors keyed by face letter. */
const FACE_COLORS: Record<string, string> = {
  R: "#DC2626",
  L: "#EA580C",
  U: "#EAB308",
  D: "#FFFFFF",
  F: "#2563EB",
  B: "#16A34A",
};

/** All 26 visible cubie positions (every {-1,0,1}³ excluding origin). */
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
 * Axis config per face.
 * cwAngle is the Three.js rotation angle for a clockwise (viewed from outside) face turn.
 * F and B are -π/2 and +π/2 respectively — verified: cubie at [-1,1,1] → [1,1,1] under
 * F cwAngle (-π/2 around Z). This is OPPOSITE to the old architecture, which had a
 * compensating flip for the color-rendering path.
 */
const FACE_ANIM: Record<string, { axisIndex: 0 | 1 | 2; cwAngle: number }> = {
  R: { axisIndex: 0, cwAngle: -Math.PI / 2 },
  L: { axisIndex: 0, cwAngle:  Math.PI / 2 },
  U: { axisIndex: 1, cwAngle: -Math.PI / 2 },
  D: { axisIndex: 1, cwAngle:  Math.PI / 2 },
  F: { axisIndex: 2, cwAngle: -Math.PI / 2 },
  B: { axisIndex: 2, cwAngle:  Math.PI / 2 },
};

// ---------------------------------------------------------------------------
// Move arrow (visual indicator during animation)
// ---------------------------------------------------------------------------

const ARROW_R    = 0.78;
const ARROW_TUBE = 0.045;
const ARROW_ARC  = Math.PI * 1.5;

const FACE_ARROW: Record<string, { pos: Vec3; rot: Vec3 }> = {
  R: { pos: [ 1.65, 0, 0    ], rot: [0,            -Math.PI / 2, 0] },
  L: { pos: [-1.65, 0, 0    ], rot: [0,             Math.PI / 2, 0] },
  U: { pos: [0,  1.65, 0    ], rot: [ Math.PI / 2, 0,            0] },
  D: { pos: [0, -1.65, 0    ], rot: [-Math.PI / 2, 0,            0] },
  F: { pos: [0,  0,    1.65 ], rot: [0,             0,            0] },
  B: { pos: [0,  0,   -1.65 ], rot: [0,             Math.PI,      0] },
};

function MoveArrow({ face, clockwise }: { face: string; clockwise: boolean }) {
  const tf = FACE_ARROW[face];
  if (!tf) return null;
  const sx = clockwise ? -1 : 1;
  const coneRotZ = clockwise ? Math.PI / 2 : -Math.PI / 2;
  return (
    <group position={tf.pos} rotation={tf.rot as [number, number, number]}>
      <group scale={[sx, 1, 1]}>
        <mesh>
          <torusGeometry args={[ARROW_R, ARROW_TUBE, 8, 64, ARROW_ARC]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.92} depthTest={false} depthWrite={false} />
        </mesh>
        <mesh position={[0, -ARROW_R, 0]} rotation={[0, 0, coneRotZ]}>
          <coneGeometry args={[0.13, 0.28, 8]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.92} depthTest={false} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Imperative helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if this cubie's world position places it on the given face.
 * Uses a 0.1 tolerance to absorb floating-point accumulation across many moves.
 */
function isCubieInFace(cubie: THREE.Group, face: string): boolean {
  const pos = new THREE.Vector3();
  cubie.getWorldPosition(pos);
  const EPS = 0.1;
  switch (face) {
    case "R": return Math.abs(pos.x - 1)  < EPS;
    case "L": return Math.abs(pos.x + 1)  < EPS;
    case "U": return Math.abs(pos.y - 1)  < EPS;
    case "D": return Math.abs(pos.y + 1)  < EPS;
    case "F": return Math.abs(pos.z - 1)  < EPS;
    case "B": return Math.abs(pos.z + 1)  < EPS;
    default:  return false;
  }
}

/**
 * Deep equality check on CubeFaces.
 * Used by the move-log matching logic to find AlgorithmPlayer's step target.
 */
function faceStatesMatch(a: CubeFaces, b: CubeFaces): boolean {
  const faces = ["U", "D", "F", "B", "R", "L"] as const;
  for (const face of faces) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (a[face][r][c] !== b[face][r][c]) return false;
      }
    }
  }
  return true;
}

/**
 * Create one imperative Three.js Group for a cubie at the given solved-state position.
 * Colors are baked in permanently — they never change after creation.
 */
function createCubieGroup(x: number, y: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  // Body
  const bodyGeo = new RoundedBoxGeometry(BODY_SIZE, BODY_SIZE, BODY_SIZE, 2, 0.08);
  const bodyMat = new THREE.MeshStandardMaterial({ color: "#1E1E1E" });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  // Stickers — one per outer face this cubie touches
  const addSticker = (
    color: string,
    px: number, py: number, pz: number,
    rx: number, ry: number, rz: number,
  ) => {
    const geo = new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE);
    const mat = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px, py, pz);
    mesh.rotation.set(rx, ry, rz);
    group.add(mesh);
  };

  if (x ===  1) addSticker(FACE_COLORS.R,  STICKER_OFFSET, 0, 0,  0,  Math.PI / 2, 0);
  if (x === -1) addSticker(FACE_COLORS.L, -STICKER_OFFSET, 0, 0,  0, -Math.PI / 2, 0);
  if (y ===  1) addSticker(FACE_COLORS.U,  0,  STICKER_OFFSET, 0, -Math.PI / 2, 0, 0);
  if (y === -1) addSticker(FACE_COLORS.D,  0, -STICKER_OFFSET, 0,  Math.PI / 2, 0, 0);
  if (z ===  1) addSticker(FACE_COLORS.F,  0, 0,  STICKER_OFFSET, 0, 0, 0);
  if (z === -1) addSticker(FACE_COLORS.B,  0, 0, -STICKER_OFFSET, 0, Math.PI, 0);

  return group;
}

/**
 * Reset all 26 cubie groups back to their original solved-state positions and
 * identity quaternions (no rotation).
 */
function resetCubiesToSolved(cubies: THREE.Group[]): void {
  cubies.forEach((c, idx) => {
    const [x, y, z] = CUBIE_POSITIONS[idx];
    c.position.set(x, y, z);
    c.quaternion.identity();
  });
}

/**
 * Apply a single move to the cubie objects instantly (no animation).
 * Performs the same reparent-rotate-reparent sequence as the animated handler
 * but without GSAP — sets the pivot rotation directly and calls updateMatrixWorld.
 */
function applyMoveInstant(
  move: string,
  cubies: THREE.Group[],
  scene: THREE.Scene,
  pivot: THREE.Group,
): void {
  const parsed = parseAlgorithm(move)[0];
  if (!parsed) return;
  const animDef = FACE_ANIM[parsed.face];
  if (!animDef) return;

  let targetAngle = animDef.cwAngle;
  if (parsed.inverse) targetAngle *= -1;
  if (parsed.double)  targetAngle *= 2;

  const faceCubies = cubies.filter((c) => isCubieInFace(c, parsed.face));
  if (faceCubies.length === 0) return;

  const savedPos  = faceCubies.map(() => new THREE.Vector3());
  const savedQuat = faceCubies.map(() => new THREE.Quaternion());

  // Save world transforms
  faceCubies.forEach((c, i) => {
    c.getWorldPosition(savedPos[i]);
    c.getWorldQuaternion(savedQuat[i]);
  });

  // Reparent to pivot (at origin, identity)
  pivot.rotation.set(0, 0, 0);
  faceCubies.forEach((c, i) => {
    scene.remove(c);
    pivot.add(c);
    c.position.copy(savedPos[i]);
    c.quaternion.copy(savedQuat[i]);
  });

  // Apply rotation instantly
  const axisKeys = ["x", "y", "z"] as const;
  pivot.rotation[axisKeys[animDef.axisIndex]] = targetAngle;
  pivot.updateMatrixWorld(true);

  // Read new world transforms
  faceCubies.forEach((c, i) => {
    c.getWorldPosition(savedPos[i]);
    c.getWorldQuaternion(savedQuat[i]);
  });

  // Reparent back to scene
  faceCubies.forEach((c, i) => {
    pivot.remove(c);
    scene.add(c);
    c.position.copy(savedPos[i]);
    c.quaternion.copy(savedQuat[i]);
  });

  pivot.rotation.set(0, 0, 0);
}

// ---------------------------------------------------------------------------
// AnimatedScene — the inner R3F component
// ---------------------------------------------------------------------------

interface CubeSceneProps {
  interactive: boolean;
  /** Accepted for API compatibility with CubeViewer — not used for rendering. */
  cubeState?: CubeFaces;
  /** Accepted for API compatibility — highlights are removed per spec. */
  highlightedCubies?: string[];
  onReady?: () => void;
}

function AnimatedScene({ interactive }: CubeSceneProps) {
  const { scene } = useThree();

  const cubiesRef      = useRef<THREE.Group[]>([]);
  const pivotRef       = useRef(new THREE.Group());
  const isAnimatingRef = useRef(false);
  const moveLogRef     = useRef<string[]>([]);

  const [currentAnim, setCurrentAnim] = useState<{ face: string; clockwise: boolean } | null>(null);

  // ---- Mount: create cubie objects ----------------------------------------
  useEffect(() => {
    const pivot = pivotRef.current;
    scene.add(pivot);

    const cubies = CUBIE_POSITIONS.map(([x, y, z]) => createCubieGroup(x, y, z));
    cubies.forEach((c) => scene.add(c));
    cubiesRef.current = cubies;

    return () => {
      cubies.forEach((c) => {
        c.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const mat = obj.material;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat.dispose();
          }
        });
        scene.remove(c);
      });
      scene.remove(pivot);
    };
  }, [scene]);

  // ---- Animation handler --------------------------------------------------
  useEffect(() => {
    const handler = (move: string, durationMs: number): Promise<void> =>
      new Promise((resolve) => {
        const parsed  = parseAlgorithm(move)[0];
        const animDef = parsed ? FACE_ANIM[parsed.face] : undefined;

        if (!parsed || !animDef) {
          commitAnimatedMove(move);
          resolve();
          return;
        }

        let targetAngle = animDef.cwAngle;
        if (parsed.inverse) targetAngle *= -1;
        if (parsed.double)  targetAngle *= 2;

        const clockwise = Math.sign(targetAngle) === Math.sign(animDef.cwAngle);
        isAnimatingRef.current = true;
        setCurrentAnim({ face: parsed.face, clockwise });

        const allCubies  = cubiesRef.current;
        const faceCubies = allCubies.filter((c) => isCubieInFace(c, parsed.face));

        const savedPos  = faceCubies.map(() => new THREE.Vector3());
        const savedQuat = faceCubies.map(() => new THREE.Quaternion());

        // Save world transforms
        faceCubies.forEach((c, i) => {
          c.getWorldPosition(savedPos[i]);
          c.getWorldQuaternion(savedQuat[i]);
        });

        // Reparent to pivot
        const pivot = pivotRef.current;
        pivot.rotation.set(0, 0, 0);
        faceCubies.forEach((c, i) => {
          scene.remove(c);
          pivot.add(c);
          c.position.copy(savedPos[i]);
          c.quaternion.copy(savedQuat[i]);
        });

        const axisKeys = ["x", "y", "z"] as const;
        const axisKey  = axisKeys[animDef.axisIndex];

        gsap.to(pivot.rotation, {
          [axisKey]: targetAngle,
          duration: durationMs / 1000,
          ease: "power2.inOut",
          onComplete: () => {
            pivot.updateMatrixWorld(true);

            // Read new world transforms
            faceCubies.forEach((c, i) => {
              c.getWorldPosition(savedPos[i]);
              c.getWorldQuaternion(savedQuat[i]);
            });

            // Reparent back to scene
            faceCubies.forEach((c, i) => {
              pivot.remove(c);
              scene.add(c);
              c.position.copy(savedPos[i]);
              c.quaternion.copy(savedQuat[i]);
            });

            pivot.rotation.set(0, 0, 0);

            // Update move log — BEFORE commitAnimatedMove so that the Zustand
            // subscribe fires while isAnimatingRef is still true (preventing
            // the external-change handler from misidentifying this as a step-back).
            moveLogRef.current.push(move);
            commitAnimatedMove(move);   // updates engine + Zustand (triggers subscribe)
            isAnimatingRef.current = false;
            setCurrentAnim(null);

            resolve();
          },
        });
      });

    registerAnimationHandler(handler);
    return () => unregisterAnimationHandler();
  }, [scene]);

  // ---- Instant handler (cubeStore.reset / cubeStore.applyInstant) ---------
  useEffect(() => {
    const handler = (alg: string | null) => {
      const cubies = cubiesRef.current;
      const pivot  = pivotRef.current;

      resetCubiesToSolved(cubies);

      if (alg) {
        const moves = parseAlgorithm(alg);
        for (const m of moves) {
          applyMoveInstant(m.notation, cubies, scene, pivot);
        }
        moveLogRef.current = moves.map((m) => m.notation);
      } else {
        moveLogRef.current = [];
      }
    };

    registerInstantHandler(handler);
    return () => unregisterInstantHandler();
  }, [scene]);

  // ---- Zustand subscribe: AlgorithmPlayer step-back / reset ---------------
  //
  // When AlgorithmPlayer calls useCubeStore.setState({ faces }) directly
  // (step-back or reset), the faces change while isAnimating === false.
  // We use move-log matching to find how many moves lead to the new state,
  // then replay that prefix instantly so cubie objects are at the right positions.
  useEffect(() => {
    const unsub = useCubeStore.subscribe((state, prevState) => {
      if (state.faces === prevState.faces)   return;
      if (isAnimatingRef.current)            return;  // our own commitAnimatedMove — skip

      const newFaces = state.faces;
      const log      = moveLogRef.current;
      const cubies   = cubiesRef.current;
      const pivot    = pivotRef.current;

      // Try to find a prefix of the current move log that matches newFaces
      const localEngine = new CubeEngine();
      let matchedK: number | null = null;

      for (let k = 0; k <= log.length; k++) {
        if (faceStatesMatch(localEngine.getState(), newFaces)) {
          matchedK = k;
          break;
        }
        if (k < log.length) localEngine.applyMoveString(log[k]);
      }

      if (matchedK !== null) {
        // Replay first matchedK moves from solved
        resetCubiesToSolved(cubies);
        for (let i = 0; i < matchedK; i++) {
          applyMoveInstant(log[i], cubies, scene, pivot);
        }
        moveLogRef.current = log.slice(0, matchedK);
      } else {
        // State not in our log (e.g. tutorial initial state) — snap to solved
        resetCubiesToSolved(cubies);
        moveLogRef.current = [];
      }
    });

    return () => unsub();
  }, [scene]);

  // ---- Render -------------------------------------------------------------
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={0.8} />

      {currentAnim && (
        <MoveArrow face={currentAnim.face} clockwise={currentAnim.clockwise} />
      )}

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
// Public export
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
      />
    </Canvas>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles clean**

```bash
cd ltcube && npx tsc --noEmit 2>&1 | head -40
```

Expected: zero errors. If you get "Cannot find module 'three-stdlib'" run:

```bash
cd ltcube && npm ls three-stdlib 2>&1 | head -5
```

`three-stdlib` is a dependency of `@react-three/drei` so it should be available. If missing:

```bash
cd ltcube && npm install three-stdlib --legacy-peer-deps
```

- [ ] **Step 3: Commit**

```bash
cd ltcube && git add src/components/cube/CubeScene.tsx
git commit -m "feat(cube-scene): persistent imperative cubie objects, no color snap"
```

---

## Task 4: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

The F/B angle docs and speed table are now stale. Update them to match the new architecture.

- [ ] **Step 1: Update the rotation axis map section**

Find and replace the "Rotation axis map" table in CLAUDE.md. The old table had `F: +π/2, B: -π/2`. Replace it with the new values and explanation:

```markdown
### Rotation axis map
| Face | Axis | Angle (persistent cubie convention) |
|---|---|---|
| R | X | −π/2 |
| L | X | +π/2 |
| U | Y | −π/2 |
| D | Y | +π/2 |
| F | Z | −π/2 |
| B | Z | +π/2 |

Note: F is now −π/2 and B is now +π/2 (opposite of the old color-rendering architecture).
The old values (+π/2 / −π/2) were a compensating flip for the engine's Z-face strip direction.
The persistent cubie architecture drives objects directly — no compensation needed.
```

- [ ] **Step 2: Update the speed reference table**

Find and replace the "Speed reference" table. Change 300ms base to 400ms:

```markdown
### Speed reference
| Multiplier | Duration |
|---|---|
| 0.5× | 800 ms |
| 1× | 400 ms |
| 1.5× | 267 ms |
| 2× | 200 ms |
```

Also update the duration formula line: `duration = 400 / speed ms`

- [ ] **Step 3: Commit**

```bash
cd ltcube && git add CLAUDE.md
git commit -m "docs: update F/B angle convention and speed table for persistent cubie arch"
```

---

## Task 5: Build Verification + Browser Test

- [ ] **Step 1: Run the Next.js dev build**

```bash
cd ltcube && npm run dev 2>&1 &
```

Wait ~5 seconds for the build to complete, then open `http://localhost:3000` in a browser.

- [ ] **Step 2: Verify the cube renders**

Navigate to `http://localhost:3000`. The 3D cube should:
- Appear with dark gray body and colored stickers
- Be fully visible (not black / invisible)
- Be rotatable with mouse drag (OrbitControls)

If the cube is blank/black: check the browser console for Three.js errors. Common issue: `RoundedBoxGeometry` not found — verify `three-stdlib` import resolves.

- [ ] **Step 3: Run the test sequence**

Open the browser console. In the app, trigger the test sequence `R U F B' L D' R2 U' F2`. This can be done via the scramble button, or if there's a dev console, via:

```javascript
// Paste in browser console:
const { animateAlgorithm } = window.__zustandStore ?? {};
// OR use the UI controls to fire each move
```

For each move observe:
- ✅ 9 cubies rotate smoothly as a group
- ✅ Colors stay attached to the rotating cubies (no snap)
- ✅ After animation, cubies stay at their new positions (no teleport back)
- ✅ Next move picks up from the physically correct position

- [ ] **Step 4: Test AlgorithmPlayer step-back**

Navigate to any tutorial page with an AlgorithmPlayer. Play 3 moves forward, then click the step-back button. Verify:
- ✅ Cube snaps to previous state (1 step back) correctly
- ✅ Colors and positions match the pre-move state

- [ ] **Step 5: Test reset**

On the landing page or trainer, press the reset/scramble button, then the reset button. Verify:
- ✅ Cube snaps back to solved (all correct face colors at correct positions)

- [ ] **Step 6: Final commit if any fixes were needed**

```bash
cd ltcube && git add -p
git commit -m "fix(cube-scene): <describe any fix>"
```

---

## Self-Review Against Spec

### Spec coverage check

| Requirement | Task |
|-------------|------|
| Persistent THREE.js Object3D for each cubie | Task 3 (createCubieGroup, useEffect mount) |
| Colors baked at creation, never changed | Task 3 (createCubieGroup sticker colors) |
| World-position face detection (EPS 0.1) | Task 3 (isCubieInFace) |
| Reparent → pivot → animate → reparent back | Task 3 (animation handler onComplete) |
| No color reassignment | Task 3 (colors never referenced post-mount) |
| F: −π/2, B: +π/2 (verified against engine) | Task 3 (FACE_ANIM), Task 4 (docs) |
| RoundedBox radius 0.08 | Task 1 (Cubie.tsx), Task 3 (createCubieGroup) |
| Sticker size 0.79 (≈0.85 × 0.93) | Task 1, Task 3 |
| Sticker offset 0.466 (body/2 + 0.001) | Task 1, Task 3 |
| Body color #1E1E1E | Task 1, Task 3 |
| No opacity/dim/highlight system | Task 1 (removed from Cubie), Task 3 (no highlight code) |
| Ambient 0.6, directional [5,8,5] 0.8 | Task 3 (AnimatedScene render) |
| 400ms base, speed multipliers | Task 2 (cubeStore _runSingle) |
| power2.inOut ease | Task 3 (gsap.to ease) |
| Sequential queue, never overlapping | Task 2 (unchanged _animChain logic) |
| cubeStore.applyInstant(alg) | Task 2 |
| cubeStore.reset() resets 3D scene | Task 2 (calls _instantHandler null) |
| AlgorithmPlayer step-back (Option A) | Task 3 (Zustand subscribe + move-log matching) |
| Test sequence R U F B' L D' R2 U' F2 | Task 5 |

### Placeholder scan

No TBD/TODO in the implementation. All code is complete.

### Type consistency

- `registerInstantHandler` in cubeStore takes `(alg: string | null) => void` ✓
- `instantHandler` in CubeScene uses `(alg: string | null)` ✓
- `applyMoveInstant` takes `(move: string, cubies: THREE.Group[], scene: THREE.Scene, pivot: THREE.Group)` — used consistently in handler, Zustand subscribe, and instant handler ✓
- `commitAnimatedMove(move: string)` — unchanged signature, called correctly ✓
- `CUBIE_POSITIONS[idx]` indexing in resetCubiesToSolved matches the creation order in mount useEffect ✓
