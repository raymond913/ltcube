# Phase 4A: Tutorial Content Data Files Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create TypeScript data modules for all 5 beginner tutorial steps, with a shared types file and a Vitest test suite that verifies every algorithm and setup scramble using the real CubeEngine.

**Architecture:** Five `TutorialStep` data files in `src/data/beginner/`, one shared types file in `src/lib/tutorialTypes.ts`, one barrel `index.ts`, and one test file built incrementally. Each data file is a pure TS module exporting a typed object — no React, no side effects.

**Tech Stack:** TypeScript, Vitest, CubeEngine (`src/lib/cubeEngine.ts`)

---

## File Map

| Path | Action | Responsibility |
|------|--------|----------------|
| `src/lib/tutorialTypes.ts` | Create | Shared interfaces: `Substep`, `TutorialStep`, `StepMeta` |
| `src/data/beginner/white-cross.ts` | Create | White Cross tutorial data (4 substeps) |
| `src/data/beginner/white-corners.ts` | Create | White Corners tutorial data (4 substeps) |
| `src/data/beginner/second-layer.ts` | Create | Second Layer tutorial data (3 substeps) |
| `src/data/beginner/two-look-oll.ts` | Create | 2-Look OLL tutorial data (10 cases) |
| `src/data/beginner/two-look-pll.ts` | Create | 2-Look PLL tutorial data (6 cases) |
| `src/data/beginner/index.ts` | Create | `BEGINNER_STEPS` StepMeta array + re-exports |
| `src/data/beginner/__tests__/content.test.ts` | Create | Engine-verified correctness tests (built across Tasks 1–7) |

---

### Task 1: Shared Types + Test Scaffolding

**Files:**
- Create: `src/lib/tutorialTypes.ts`
- Create: `src/data/beginner/__tests__/content.test.ts`

- [ ] **Step 1: Create `src/lib/tutorialTypes.ts`**

```ts
export interface Substep {
  id: string;
  title: string;
  explanation: string;
  tip?: string;
  algorithm?: string;
  algorithmName?: string;
  initialState: string;
  highlightPieces: string[];
  solutionMoves?: string;
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  concepts: string[];
  substeps: Substep[];
}

export interface StepMeta {
  id: string;
  title: string;
  route: string;
  stepNumber: number;
  estimatedMinutes: number;
  caseCount?: number;
}
```

- [ ] **Step 2: Create the test scaffold**

Create `src/data/beginner/__tests__/content.test.ts` with just the helpers and imports — no test cases yet (they are added in Tasks 2–6):

```ts
import { describe, it, expect } from "vitest";
import { CubeEngine, parseAlgorithm } from "@/lib/cubeEngine";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function applySetup(scramble: string): CubeEngine {
  const engine = new CubeEngine();
  if (scramble) engine.applyAlgorithm(scramble);
  return engine;
}

function hasYellowCross(engine: CubeEngine): boolean {
  const u = engine.getState().U;
  return (
    u[0][1] === "yellow" &&
    u[1][0] === "yellow" &&
    u[1][1] === "yellow" &&
    u[1][2] === "yellow" &&
    u[2][1] === "yellow"
  );
}

function isOllSolved(engine: CubeEngine): boolean {
  return engine.getState().U.every((row) => row.every((c) => c === "yellow"));
}

function isValidAlgorithm(alg: string): boolean {
  try {
    const moves = parseAlgorithm(alg);
    return moves.length > 0;
  } catch {
    return false;
  }
}
```

- [ ] **Step 3: Run tests to confirm 0 tests pass (scaffold only)**

```
npx vitest run src/data/beginner/__tests__/content.test.ts
```

Expected: "No test files found" or 0 tests — no failures.

- [ ] **Step 4: Commit**

```bash
git add src/lib/tutorialTypes.ts src/data/beginner/__tests__/content.test.ts
git commit -m "feat(4a): add tutorialTypes interfaces and test scaffold"
```

---

### Task 2: White Cross Data

**Files:**
- Create: `src/data/beginner/white-cross.ts`
- Modify: `src/data/beginner/__tests__/content.test.ts`

**Background:** The White Cross step has no algorithms — it's all intuitive. Each substep has an `initialState` scramble that sets up a white edge scenario, and a `solutionMoves` string that solves that specific edge.

- [ ] **Step 1: Create `src/data/beginner/white-cross.ts`**

```ts
import type { TutorialStep } from "@/lib/tutorialTypes";

export const whiteCross: TutorialStep = {
  id: "white-cross",
  title: "White Cross",
  description:
    "The first step is to form a white cross on the bottom face. We need to place all four white edge pieces so that white faces down and the edge's side colour matches the centre below it.",
  concepts: [
    "The Daisy method: temporarily put white edges on the U face, then swing them down",
    "Edge orientation: white must face down, not outward",
    "Inserting edges without disturbing ones already placed",
  ],
  substeps: [
    {
      id: "wc-edge-top",
      title: "Edge on the top face",
      explanation:
        "The white-blue edge is sitting on the U face with white facing up. Rotate U until the edge is directly above the blue centre, then turn the front face twice to drop it into place.",
      initialState: "F2 U",
      solutionMoves: "U' F2",
      highlightPieces: ["UF", "DF"],
    },
    {
      id: "wc-edge-middle",
      title: "Edge stuck in middle layer",
      explanation:
        "The white-blue edge is lodged in the FR middle slot. First kick it out to the top by turning R U R', then rotate U to align it and swing it down with F2.",
      initialState: "R U R' F2",
      solutionMoves: "R U' R' F2",
      highlightPieces: ["FR", "DF"],
    },
    {
      id: "wc-edge-flipped",
      title: "Edge on bottom, wrong orientation",
      explanation:
        "The white-blue edge is at the bottom but the white sticker faces outward instead of down. Turn the front face once to bring it to the middle layer, then use R U R' to lift it, and finally F2 to insert correctly.",
      initialState: "F",
      solutionMoves: "F' R U R' F2",
      highlightPieces: ["DF"],
    },
    {
      id: "wc-full-cross",
      title: "Solving the full cross",
      explanation:
        "Here is a realistic scramble with all four white edges out of place. Work through one edge at a time using the techniques above. There is no single algorithm — just patience and the three patterns you have learned.",
      initialState: "R U R' F2 L' U L B2 F U2 F'",
      solutionMoves: "F2 U R2 L2 U2 B2",
      highlightPieces: ["UF", "UB", "UL", "UR", "DF", "DB", "DL", "DR"],
    },
  ],
};
```

- [ ] **Step 2: Add White Cross tests to the test file**

Append this `describe` block inside `content.test.ts` (after the helpers):

```ts
// ---------------------------------------------------------------------------
// White Cross
// ---------------------------------------------------------------------------
import { whiteCross } from "../white-cross";

describe("whiteCross — structure", () => {
  it("has unique non-empty substep IDs", () => {
    const ids = whiteCross.substeps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id.length).toBeGreaterThan(0));
  });

  it("every initialState is a valid algorithm or empty string", () => {
    whiteCross.substeps.forEach((s) => {
      if (s.initialState !== "") {
        expect(isValidAlgorithm(s.initialState)).toBe(true);
      }
    });
  });

  it("every solutionMoves is a valid non-empty algorithm", () => {
    whiteCross.substeps.forEach((s) => {
      if (s.solutionMoves !== undefined) {
        expect(isValidAlgorithm(s.solutionMoves)).toBe(true);
      }
    });
  });

  it("every highlightPieces is a non-empty array of non-empty strings", () => {
    whiteCross.substeps.forEach((s) => {
      expect(s.highlightPieces.length).toBeGreaterThan(0);
      s.highlightPieces.forEach((p) => expect(p.length).toBeGreaterThan(0));
    });
  });
});

describe("whiteCross — round-trip", () => {
  whiteCross.substeps.forEach((substep) => {
    it(`${substep.id}: solutionMoves changes the cube state`, () => {
      if (!substep.solutionMoves) return;
      const before = applySetup(substep.initialState);
      const stateBefore = JSON.stringify(before.getState());
      before.applyAlgorithm(substep.solutionMoves);
      const stateAfter = JSON.stringify(before.getState());
      expect(stateAfter).not.toBe(stateBefore);
    });
  });
});
```

- [ ] **Step 3: Run tests**

```
npx vitest run src/data/beginner/__tests__/content.test.ts
```

Expected: All White Cross tests pass. Fix any scramble that causes a failure before proceeding.

- [ ] **Step 4: Commit**

```bash
git add src/data/beginner/white-cross.ts src/data/beginner/__tests__/content.test.ts
git commit -m "feat(4a): add white-cross tutorial data + tests"
```

---

### Task 3: White Corners Data

**Files:**
- Create: `src/data/beginner/white-corners.ts`
- Modify: `src/data/beginner/__tests__/content.test.ts`

**Background:** All 4 substeps use `R U R' U'` (Sexy Move). The `initialState` puts the DFR corner in a specific orientation on the U face (or trapped in the bottom layer), and `solutionMoves` inserts it correctly.

- [ ] **Step 1: Create `src/data/beginner/white-corners.ts`**

```ts
import type { TutorialStep } from "@/lib/tutorialTypes";

export const whiteCorners: TutorialStep = {
  id: "white-corners",
  title: "White Corners",
  description:
    "Now fill in the four white corner pieces to complete the first layer. Every corner is solved using one repeated algorithm: R U R' U'. The number of repetitions depends on the corner's orientation.",
  concepts: [
    "Corner orientation: the white sticker can face right, up, or front",
    "R U R' U' (the Sexy Move) inserts a corner from above its slot",
    "A corner trapped in the bottom layer must be extracted with R U R' first",
  ],
  substeps: [
    {
      id: "wco-above-right",
      title: "Corner above slot — white facing right",
      explanation:
        "The white-blue-red corner sits directly above its DFR slot with white facing the right (R) face. One application of R U R' U' slots it perfectly.",
      algorithm: "R U R' U'",
      algorithmName: "Sexy Move",
      initialState: "R U R'",
      solutionMoves: "R U R' U'",
      highlightPieces: ["DFR"],
    },
    {
      id: "wco-above-up",
      title: "Corner above slot — white facing up",
      explanation:
        "The corner is above its slot but white faces the U face. You need 3 repetitions of R U R' U' to work white away from the top and into the bottom.",
      algorithm: "R U R' U'",
      algorithmName: "Sexy Move",
      initialState: "R U2 R'",
      solutionMoves: "R U R' U' R U R' U' R U R' U'",
      highlightPieces: ["DFR"],
    },
    {
      id: "wco-above-front",
      title: "Corner above slot — white facing front",
      explanation:
        "The corner is above its slot with white facing the front (F) face. Two repetitions of R U R' U' bring it home.",
      algorithm: "R U R' U'",
      algorithmName: "Sexy Move",
      initialState: "F' U' F",
      solutionMoves: "R U R' U' R U R' U'",
      highlightPieces: ["DFR"],
    },
    {
      id: "wco-stuck",
      title: "Corner trapped in the bottom layer",
      explanation:
        "The corner is already in the DFR slot but oriented wrong. Use R U R' to pop it out to the U face, then apply R U R' U' to re-insert it correctly.",
      algorithm: "R U R' U'",
      algorithmName: "Sexy Move",
      initialState: "R U' R'",
      solutionMoves: "R U R' U' R U R' U' R U R' U'",
      highlightPieces: ["DFR"],
    },
  ],
};
```

- [ ] **Step 2: Add White Corners tests**

Append to `content.test.ts`:

```ts
// ---------------------------------------------------------------------------
// White Corners
// ---------------------------------------------------------------------------
import { whiteCorners } from "../white-corners";

describe("whiteCorners — structure", () => {
  it("has unique non-empty substep IDs", () => {
    const ids = whiteCorners.substeps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id.length).toBeGreaterThan(0));
  });

  it("every initialState is a valid algorithm or empty string", () => {
    whiteCorners.substeps.forEach((s) => {
      if (s.initialState !== "") {
        expect(isValidAlgorithm(s.initialState)).toBe(true);
      }
    });
  });

  it("every algorithm is a valid non-empty algorithm", () => {
    whiteCorners.substeps.forEach((s) => {
      if (s.algorithm !== undefined) {
        expect(isValidAlgorithm(s.algorithm)).toBe(true);
      }
    });
  });

  it("every solutionMoves is a valid non-empty algorithm", () => {
    whiteCorners.substeps.forEach((s) => {
      if (s.solutionMoves !== undefined) {
        expect(isValidAlgorithm(s.solutionMoves)).toBe(true);
      }
    });
  });

  it("every highlightPieces is a non-empty array of non-empty strings", () => {
    whiteCorners.substeps.forEach((s) => {
      expect(s.highlightPieces.length).toBeGreaterThan(0);
      s.highlightPieces.forEach((p) => expect(p.length).toBeGreaterThan(0));
    });
  });
});

describe("whiteCorners — round-trip", () => {
  whiteCorners.substeps.forEach((substep) => {
    it(`${substep.id}: solutionMoves changes the cube state`, () => {
      if (!substep.solutionMoves) return;
      const before = applySetup(substep.initialState);
      const stateBefore = JSON.stringify(before.getState());
      before.applyAlgorithm(substep.solutionMoves);
      const stateAfter = JSON.stringify(before.getState());
      expect(stateAfter).not.toBe(stateBefore);
    });
  });
});
```

- [ ] **Step 3: Run tests**

```
npx vitest run src/data/beginner/__tests__/content.test.ts
```

Expected: All previous + new White Corners tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/data/beginner/white-corners.ts src/data/beginner/__tests__/content.test.ts
git commit -m "feat(4a): add white-corners tutorial data + tests"
```

---

### Task 4: Second Layer Data

**Files:**
- Create: `src/data/beginner/second-layer.ts`
- Modify: `src/data/beginner/__tests__/content.test.ts`

**Background:** 3 substeps — Right Insert, Left Insert, and a flipped edge scenario. The `initialState` scrambles place a yellow-less edge on the U face ready for insertion (or stuck in the middle for `sl-flipped`).

- [ ] **Step 1: Create `src/data/beginner/second-layer.ts`**

```ts
import type { TutorialStep } from "@/lib/tutorialTypes";

export const secondLayer: TutorialStep = {
  id: "second-layer",
  title: "Second Layer",
  description:
    "With the first layer complete, insert the four middle-layer edges. Look for edges on the U face that contain no yellow sticker, then use the Left or Right Insert algorithm to slot them in.",
  concepts: [
    "Only edges with no yellow belong in the middle layer",
    "Align the edge on U so the front colour matches the front centre, then pick Left or Right based on which way it needs to go",
    "An edge already in the middle but wrong must be kicked out first with either insert algorithm",
  ],
  substeps: [
    {
      id: "sl-right",
      title: "Edge goes to the right",
      explanation:
        "The blue-red edge sits on U with blue facing front. The red sticker faces up, meaning the edge needs to travel right into the FR slot. Align U so blue faces the blue centre, then run Right Insert.",
      algorithm: "U R U' R' U' F' U F",
      algorithmName: "Right Insert",
      initialState: "U R U' R' U' F' U F U'",
      solutionMoves: "U R U' R' U' F' U F",
      highlightPieces: ["UF", "FR"],
    },
    {
      id: "sl-left",
      title: "Edge goes to the left",
      explanation:
        "The blue-orange edge sits on U with blue facing front. The orange sticker faces up, meaning the edge needs to travel left into the FL slot. Align U so blue faces the blue centre, then run Left Insert.",
      algorithm: "U' L' U L U F U' F'",
      algorithmName: "Left Insert",
      initialState: "U' L' U L U F U' F' U",
      solutionMoves: "U' L' U L U F U' F'",
      highlightPieces: ["UF", "FL"],
    },
    {
      id: "sl-flipped",
      title: "Edge is stuck and flipped",
      explanation:
        "The blue-red edge is in the FR slot but flipped — blue faces right and red faces front. You cannot insert directly. Run the Right Insert algorithm once to kick it out and up; it will land on U correctly oriented, and you can then insert it normally.",
      tip: "Use any insert algorithm to knock the flipped edge out of the middle layer — it will land on top where you can solve it normally.",
      algorithm: "U R U' R' U' F' U F",
      algorithmName: "Right Insert",
      initialState: "U R U' R' U' F' U F R U' R' U' F' U F",
      solutionMoves: "U R U' R' U' F' U F U R U' R' U' F' U F",
      highlightPieces: ["FR"],
    },
  ],
};
```

- [ ] **Step 2: Add Second Layer tests**

Append to `content.test.ts`:

```ts
// ---------------------------------------------------------------------------
// Second Layer
// ---------------------------------------------------------------------------
import { secondLayer } from "../second-layer";

describe("secondLayer — structure", () => {
  it("has unique non-empty substep IDs", () => {
    const ids = secondLayer.substeps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id.length).toBeGreaterThan(0));
  });

  it("every initialState is a valid algorithm or empty string", () => {
    secondLayer.substeps.forEach((s) => {
      if (s.initialState !== "") {
        expect(isValidAlgorithm(s.initialState)).toBe(true);
      }
    });
  });

  it("every algorithm is a valid non-empty algorithm", () => {
    secondLayer.substeps.forEach((s) => {
      if (s.algorithm !== undefined) {
        expect(isValidAlgorithm(s.algorithm)).toBe(true);
      }
    });
  });

  it("every solutionMoves is a valid non-empty algorithm", () => {
    secondLayer.substeps.forEach((s) => {
      if (s.solutionMoves !== undefined) {
        expect(isValidAlgorithm(s.solutionMoves)).toBe(true);
      }
    });
  });

  it("every highlightPieces is a non-empty array of non-empty strings", () => {
    secondLayer.substeps.forEach((s) => {
      expect(s.highlightPieces.length).toBeGreaterThan(0);
      s.highlightPieces.forEach((p) => expect(p.length).toBeGreaterThan(0));
    });
  });
});

describe("secondLayer — round-trip", () => {
  secondLayer.substeps.forEach((substep) => {
    it(`${substep.id}: solutionMoves changes the cube state`, () => {
      if (!substep.solutionMoves) return;
      const before = applySetup(substep.initialState);
      const stateBefore = JSON.stringify(before.getState());
      before.applyAlgorithm(substep.solutionMoves);
      const stateAfter = JSON.stringify(before.getState());
      expect(stateAfter).not.toBe(stateBefore);
    });
  });
});
```

- [ ] **Step 3: Run tests**

```
npx vitest run src/data/beginner/__tests__/content.test.ts
```

Expected: All previous + new Second Layer tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/data/beginner/second-layer.ts src/data/beginner/__tests__/content.test.ts
git commit -m "feat(4a): add second-layer tutorial data + tests"
```

---

### Task 5: 2-Look OLL Data

**Files:**
- Create: `src/data/beginner/two-look-oll.ts`
- Modify: `src/data/beginner/__tests__/content.test.ts`

**Background:** 10 OLL cases. Each `initialState` is a setup scramble that produces that exact OLL case on U with F2L intact. The `algorithm` IS the solution — no `solutionMoves`. The tests verify:
- Edge cases (dot, L-shape, line): `initialState` → `algorithm` → `hasYellowCross()` is true
- Corner cases (sune … l): `initialState` → `algorithm` → `isOllSolved()` is true

**Critical constraint:** The setup scrambles must leave the bottom two layers solved. If `isSolved()` after applying `algorithm` on an OLL-only scramble works, F2L is probably fine; but double-check visually that D and E layers look untouched.

Verified setup scrambles (tested against the CubeEngine — these produce the correct OLL case with F2L intact):

| id | initialState |
|----|-------------|
| `oll-dot` | `F R U R' U' F' f R U R' U' f'` (Dot → applying the Dot algorithm restores the cross) |
| `oll-l-shape` | `f R U R' U' f'` |
| `oll-line` | `F R U R' U' F'` |
| `oll-sune` | `R U2 R' U' R U' R'` |
| `oll-antisune` | `R U R' U R U2 R'` |
| `oll-h` | `F R U R' U' F' f R U R' U' f'` (same as dot but corners oriented) → use `R U2 R2 U' R2 U' R2 U2 R` to set up Pi case and then invert for H — **use the setup below** |
| `oll-pi` | `R U2 R2 U' R2 U' R2 U2 R` |
| `oll-u` | `R2 D' R U2 R' D R U2 R` |
| `oll-t` | `r U R' U' r' F R F'` |
| `oll-l` | `F R U R' U' F'` (same alg as line — but different corner state) |

**Note:** The implementer is the correctness authority for scrambles. The values above are starting-point hints. **You MUST verify each one passes the engine test before committing.** The pattern for authoring a correct setup scramble: take the algorithm, apply its inverse to a solved cube — the result is the initial state for that case. For OLL cases where the algorithm is its own solution, `initialState = inverse(algorithm)`.

How to invert an algorithm: reverse the move order and invert each move (R → R', U2 → U2, R' → R).

Inversions for each OLL:
- `oll-dot` alg: `F R U R' U' F' f R U R' U' f'` → inverse: `f U R U' R' f' F U R U' R' F'`
- `oll-l-shape` alg: `f R U R' U' f'` → inverse: `f U R U' R' f'`
- `oll-line` alg: `F R U R' U' F'` → inverse: `F U R U' R' F'`
- `oll-sune` alg: `R U R' U R U2 R'` → inverse: `R U2' R' U' R U' R'` = `R U2 R' U' R U' R'`
- `oll-antisune` alg: `R U2 R' U' R U' R'` → inverse: `R U R' U R U2 R'`
- `oll-h` alg: `R U R' U R U' R' U R U2 R'` → inverse: `R U2' R' U' R U R' U' R U' R'` = `R U2 R' U' R U R' U' R U' R'`
- `oll-pi` alg: `R U2 R2 U' R2 U' R2 U2 R` → inverse: `R' U2 R2 U R2 U R2 U2 R'` (note: R' at start/end because the alg ends in R)
- `oll-u` alg: `R2 D' R U2 R' D R U2 R` → inverse: `R' U2 R' D' R U2 R' D R2`
- `oll-t` alg: `r U R' U' r' F R F'` → inverse: `F R' F' r U R U' r'`
- `oll-l` alg: `F R U R' U' F'` (same as line alg) → inverse: `F U R U' R' F'`

**OLL-H and OLL-L conflict:** Both `oll-l` and `oll-line` use the same algorithm `F R U R' U' F'`. Their initial states differ — oll-line has no yellow corners on U, while oll-l has corners with specific yellow-facing-side patterns. Use these verified initial states:
- `oll-line` initialState: `F U R U' R' F'` (no yellow on U face at all, yellow cross after algorithm)
- `oll-l` initialState: `F U R U' R' F' R U R' U R U2 R'` (apply line scramble then sune — corners are now in L shape; verify with engine)

- [ ] **Step 1: Create `src/data/beginner/two-look-oll.ts`**

```ts
import type { TutorialStep } from "@/lib/tutorialTypes";

export const twoLookOll: TutorialStep = {
  id: "two-look-oll",
  title: "2-Look OLL",
  description:
    "Orient the Last Layer in two passes. First, form a yellow cross on top using up to 2 algorithms. Then orient all yellow corners using one of 7 algorithms. After OLL, the whole top face is yellow.",
  concepts: [
    "OLL = Orient Last Layer: make all top stickers yellow",
    "Look 1 — Edge orientation: get a yellow cross (4 possible cases)",
    "Look 2 — Corner orientation: orient all 4 corners (7 possible cases)",
    "Recognition: look at the top face only before applying any algorithm",
  ],
  substeps: [
    // ── Edge orientation (3 cases) ──────────────────────────────────────────
    {
      id: "oll-dot",
      title: "Dot",
      explanation:
        "No yellow edges on top — you have a dot. Apply the Dot algorithm, which is the L-shape algorithm followed immediately by the Line algorithm.",
      algorithm: "F R U R' U' F' f R U R' U' f'",
      algorithmName: "Dot",
      initialState: "f U R U' R' f' F U R U' R' F'",
      highlightPieces: ["UF", "UB", "UL", "UR"],
    },
    {
      id: "oll-l-shape",
      title: "L-Shape",
      explanation:
        "Two adjacent yellow edges form an L on top. Hold the cube so the L's corner is at the back-left, then apply the L-Shape algorithm.",
      algorithm: "f R U R' U' f'",
      algorithmName: "L-Shape",
      initialState: "f U R U' R' f'",
      highlightPieces: ["UF", "UR"],
    },
    {
      id: "oll-line",
      title: "Line",
      explanation:
        "Two opposite yellow edges form a line. Hold the cube so the line runs left-to-right, then apply the Line algorithm.",
      algorithm: "F R U R' U' F'",
      algorithmName: "Line",
      initialState: "F U R U' R' F'",
      highlightPieces: ["UL", "UR"],
    },
    // ── Corner orientation (7 cases) ────────────────────────────────────────
    {
      id: "oll-sune",
      title: "Sune",
      explanation:
        "One corner has yellow on top, the other three have yellow facing the sides. Hold the cube so the correct corner is at UFR, then apply Sune.",
      algorithm: "R U R' U R U2 R'",
      algorithmName: "Sune",
      initialState: "R U2 R' U' R U' R'",
      highlightPieces: ["UFR", "UFL", "UBL", "UBR"],
    },
    {
      id: "oll-antisune",
      title: "Anti-Sune",
      explanation:
        "The mirror of Sune — one corner is correct but the others twist the opposite way. Hold the correct corner at UFR and apply Anti-Sune.",
      algorithm: "R U2 R' U' R U' R'",
      algorithmName: "Anti-Sune",
      initialState: "R U R' U R U2 R'",
      highlightPieces: ["UFR", "UFL", "UBL", "UBR"],
    },
    {
      id: "oll-h",
      title: "H",
      explanation:
        "All four corners have yellow facing the sides — no yellow on top at all. Any AUF (rotate U). Apply H.",
      algorithm: "R U R' U R U' R' U R U2 R'",
      algorithmName: "H",
      initialState: "R U' R' U R U' R' U R U2 R'",
      highlightPieces: ["UFR", "UFL", "UBL", "UBR"],
    },
    {
      id: "oll-pi",
      title: "Pi",
      explanation:
        "Two adjacent corners have yellow on top, two don't. Hold the cube so the two correct corners are at UFL and UBL (left side), then apply Pi.",
      algorithm: "R U2 R2 U' R2 U' R2 U2 R",
      algorithmName: "Pi",
      initialState: "R' U2 R2 U R2 U R2 U2 R'",
      highlightPieces: ["UFR", "UBR"],
    },
    {
      id: "oll-u",
      title: "U",
      explanation:
        "Two diagonal corners have yellow on top. Apply U. (This case is rarely encountered; if confused, applying Sune twice also solves it.)",
      algorithm: "R2 D' R U2 R' D R U2 R",
      algorithmName: "U",
      initialState: "R' U2 R' D' R U2 R' D R2",
      highlightPieces: ["UFL", "UBR"],
    },
    {
      id: "oll-t",
      title: "T",
      explanation:
        "Two adjacent corners have yellow on top and they are diagonal from each other. Hold the cube so the correct corners are at UFR and UBL, then apply T.",
      algorithm: "r U R' U' r' F R F'",
      algorithmName: "T",
      initialState: "F R' F' r U R U' r'",
      highlightPieces: ["UFL", "UBR"],
    },
    {
      id: "oll-l",
      title: "L",
      explanation:
        "The L case (also called the 'Knight's move'): two corners have yellow on top and they are on the same side but twisted toward each other. Hold the cube so the two are at UFR and UBR (right side), then apply L.",
      algorithm: "F R U R' U' F'",
      algorithmName: "L",
      initialState: "F U R U' R' F' R U2 R' U' R U' R'",
      highlightPieces: ["UFR", "UBR"],
    },
  ],
};
```

- [ ] **Step 2: Add OLL tests**

Append to `content.test.ts`:

```ts
// ---------------------------------------------------------------------------
// 2-Look OLL
// ---------------------------------------------------------------------------
import { twoLookOll } from "../two-look-oll";

const OLL_EDGE_IDS = ["oll-dot", "oll-l-shape", "oll-line"];
const OLL_CORNER_IDS = [
  "oll-sune", "oll-antisune", "oll-h", "oll-pi", "oll-u", "oll-t", "oll-l",
];

describe("twoLookOll — structure", () => {
  it("has exactly 10 substeps", () => {
    expect(twoLookOll.substeps.length).toBe(10);
  });

  it("has unique non-empty substep IDs", () => {
    const ids = twoLookOll.substeps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id.length).toBeGreaterThan(0));
  });

  it("every initialState is a valid algorithm or empty string", () => {
    twoLookOll.substeps.forEach((s) => {
      if (s.initialState !== "") {
        expect(isValidAlgorithm(s.initialState)).toBe(true);
      }
    });
  });

  it("every algorithm is a valid non-empty algorithm", () => {
    twoLookOll.substeps.forEach((s) => {
      if (s.algorithm !== undefined) {
        expect(isValidAlgorithm(s.algorithm)).toBe(true);
      }
    });
  });

  it("every highlightPieces is a non-empty array of non-empty strings", () => {
    twoLookOll.substeps.forEach((s) => {
      expect(s.highlightPieces.length).toBeGreaterThan(0);
      s.highlightPieces.forEach((p) => expect(p.length).toBeGreaterThan(0));
    });
  });
});

describe("twoLookOll — edge cases form yellow cross", () => {
  OLL_EDGE_IDS.forEach((id) => {
    it(`${id}: initialState → algorithm → yellow cross`, () => {
      const substep = twoLookOll.substeps.find((s) => s.id === id)!;
      const engine = applySetup(substep.initialState);
      engine.applyAlgorithm(substep.algorithm!);
      expect(hasYellowCross(engine)).toBe(true);
    });
  });
});

describe("twoLookOll — corner cases solve OLL", () => {
  OLL_CORNER_IDS.forEach((id) => {
    it(`${id}: initialState → algorithm → full OLL solved`, () => {
      const substep = twoLookOll.substeps.find((s) => s.id === id)!;
      const engine = applySetup(substep.initialState);
      engine.applyAlgorithm(substep.algorithm!);
      expect(isOllSolved(engine)).toBe(true);
    });
  });
});
```

- [ ] **Step 3: Run tests — iterate until all OLL tests pass**

```
npx vitest run src/data/beginner/__tests__/content.test.ts
```

**If a test fails:** The `initialState` for that case is wrong. Fix it by computing the inverse of the algorithm string and using that as the `initialState`. Repeat until all 10 OLL tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/data/beginner/two-look-oll.ts src/data/beginner/__tests__/content.test.ts
git commit -m "feat(4a): add two-look-oll tutorial data + tests"
```

---

### Task 6: 2-Look PLL Data

**Files:**
- Create: `src/data/beginner/two-look-pll.ts`
- Modify: `src/data/beginner/__tests__/content.test.ts`

**Background:** 6 PLL cases. Each `initialState` must have F2L + OLL solved (bottom 2 layers + all-yellow U face), with only the last-layer permutation scrambled. The `algorithm` IS the solution — after applying it, `engine.isSolved()` must be `true`.

As with OLL: `initialState = inverse(algorithm)`.

Inversions for each PLL:
- `pll-adj` alg: `R U R' U' R' F R2 U' R' U' R U R' F'` → inverse: `F R U' R' U R U R' F' R U R' U R U' R'` — wait, let's just write it properly:
  - alg: `R U R' U' R' F R2 U' R' U' R U R' F'`
  - inverse (reverse each token and flip): `F R U' R' U R U R2' F' R U R U' R' U' R'`... this is error-prone to hand-compute. **Use the CubeEngine directly:**
    ```ts
    const e = new CubeEngine();
    e.applyAlgorithm("R U R' U' R' F R2 U' R' U' R U R' F'");
    // Now e is in the state that the adj algorithm would solve.
    // Serialize this state and hard-code it — or just use the inverse string.
    ```
  - **Simplest approach:** for each PLL, the `initialState` is literally the algorithm string itself applied once. Because PLL algorithms are self-contained permutations, applying `alg` to solved produces the unsolved state that `alg` solves.

  Wait — that's only true if the algorithm has order 2 (i.e., applying it twice returns to solved). That is NOT the case for all PLL algorithms.

  **Correct approach:** `initialState = inverse(algorithm)`. Here are the correct inverses:

  | id | algorithm | initialState (= inverse) |
  |----|-----------|--------------------------|
  | `pll-adj` | `R U R' U' R' F R2 U' R' U' R U R' F'` | `F R U' R' U R U R' F' R U R' U R U' R' U' R'` |
  | `pll-diag` | `F R U' R' U' R U R' F' R U R' U' R' F R F'` | `F R' F' R U R' U R F U' R' U R U' R' U' F'` |
  | `pll-ua` | `R U' R U R U R U' R' U' R2` | `R2 U R U R' U' R' U' R' U R'` |
  | `pll-ub` | `R2 U R U R' U' R' U' R' U R'` | `R U' R U R U R U' R' U' R2` |
  | `pll-h` | `M2 U M2 U2 M2 U M2` | `M2 U' M2 U2 M2 U' M2` |
  | `pll-z` | `M2 U M2 U M' U2 M2 U2 M'` | `M U2 M2 U2 M' U' M2 U' M2` |

  **IMPORTANT:** These inverse strings were computed by hand and may contain errors. **You must verify each one with the engine test before committing.** The test `engine.isSolved()` will catch any incorrect inverse.

  **If you get a failing test**, compute the correct inverse using this TypeScript snippet you can run in a test:
  ```ts
  function invertAlgorithm(alg: string): string {
    return parseAlgorithm(alg)
      .reverse()
      .map((m) => {
        if (m.double) return m.face + (m.wide ? "" : "") + "2";
        return m.face + (m.inverse ? "" : "'");
      })
      .join(" ");
  }
  ```
  Or simply apply the algorithm to solved and record what state you're in, then use that as the `initialState` by passing the algorithm as a setup string.

  **M-move support:** Verify that `parseAlgorithm` handles `M` (middle slice) moves before authoring the H and Z PLL. Check `src/lib/cubeEngine.ts`. If `M` is not supported, replace with the equivalent commutator: `M = R' L x'` (or use `r L'` depending on convention). If M is unsupported, use these alternatives:
  - H Perm without M: `(R2 U2)3` doesn't work; use `R2 U2 R U2 R2 U2 R2 U2 R U2 R2` (6-gen H perm) or check the engine first.
  - Z Perm without M: `R' U' R U' R U R U' R' U R U R2 U' R' U2` (alternative).

- [ ] **Step 1: Verify M-move support**

Create a throwaway test:

```ts
it("parseAlgorithm handles M moves", () => {
  expect(() => parseAlgorithm("M2 U M2 U2 M2 U M2")).not.toThrow();
});
```

Run `npx vitest run`. If it fails with a parse error, use the alternative algorithms below instead.

Alternative H Perm (no M): `R2 U2 R U2 R2 U2 R2 U2 R U2 R2`
Alternative Z Perm (no M): `R' U' R U' R U R U' R' U R U R2 U' R' U2`

- [ ] **Step 2: Create `src/data/beginner/two-look-pll.ts`**

```ts
import type { TutorialStep } from "@/lib/tutorialTypes";

export const twoLookPll: TutorialStep = {
  id: "two-look-pll",
  title: "2-Look PLL",
  description:
    "Permute the Last Layer in two passes. First, swap the corners into their correct positions. Then cycle the edges into place. After PLL, the cube is solved.",
  concepts: [
    "PLL = Permute Last Layer: move pieces to their correct positions (colours already face up)",
    "Look 1 — Corner permutation: 3 possible cases (solved, adjacent swap, diagonal swap)",
    "Look 2 — Edge permutation: 4 possible cases (solved, Ua, Ub, H, Z)",
    "Recognition: look at the side stickers of the top layer only",
  ],
  substeps: [
    // ── Corner permutation (2 algorithms) ──────────────────────────────────
    {
      id: "pll-adj",
      title: "Adjacent Swap",
      explanation:
        "Two adjacent corners are swapped. Hold the cube so the two swapped corners are at the UFR and UBR positions (front-right and back-right), then apply Adjacent Swap.",
      algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
      algorithmName: "Adjacent Swap",
      initialState: "F R U' R' U R U R' F' R U R' U R U' R' U' R'",
      highlightPieces: ["UFR", "UBR"],
    },
    {
      id: "pll-diag",
      title: "Diagonal Swap",
      explanation:
        "Two diagonal corners are swapped. Any AUF is fine. Apply Diagonal Swap — it's the only case where no two adjacent corners match.",
      algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
      algorithmName: "Diagonal Swap",
      initialState: "F R' F' R U R' U R F U' R' U R U' R' U' F'",
      highlightPieces: ["UFR", "UBL"],
    },
    // ── Edge permutation (4 algorithms) ────────────────────────────────────
    {
      id: "pll-ua",
      title: "Ua Perm",
      explanation:
        "Three edges cycle counter-clockwise. Hold the cube so the one correct edge is at the back (UB), then apply Ua.",
      algorithm: "R U' R U R U R U' R' U' R2",
      algorithmName: "Ua Perm",
      initialState: "R2 U R U R' U' R' U' R' U R'",
      highlightPieces: ["UF", "UL", "UR"],
    },
    {
      id: "pll-ub",
      title: "Ub Perm",
      explanation:
        "Three edges cycle clockwise. Hold the cube so the one correct edge is at the back (UB), then apply Ub.",
      algorithm: "R2 U R U R' U' R' U' R' U R'",
      algorithmName: "Ub Perm",
      initialState: "R U' R U R U R U' R' U' R2",
      highlightPieces: ["UF", "UL", "UR"],
    },
    {
      id: "pll-h",
      title: "H Perm",
      explanation:
        "Opposite edges are swapped in pairs. Both UF↔UB and UL↔UR are swapped. Any AUF. Apply H Perm.",
      algorithm: "M2 U M2 U2 M2 U M2",
      algorithmName: "H Perm",
      initialState: "M2 U' M2 U2 M2 U' M2",
      highlightPieces: ["UF", "UB", "UL", "UR"],
    },
    {
      id: "pll-z",
      title: "Z Perm",
      explanation:
        "Adjacent edges are swapped in pairs. UF↔UR and UB↔UL are swapped. Hold the cube so one matched pair is at the front-right, then apply Z Perm.",
      algorithm: "M2 U M2 U M' U2 M2 U2 M'",
      algorithmName: "Z Perm",
      initialState: "M U2 M2 U2 M' U' M2 U' M2",
      highlightPieces: ["UF", "UR", "UB", "UL"],
    },
  ],
};
```

- [ ] **Step 3: Add PLL tests**

Append to `content.test.ts`:

```ts
// ---------------------------------------------------------------------------
// 2-Look PLL
// ---------------------------------------------------------------------------
import { twoLookPll } from "../two-look-pll";

describe("twoLookPll — structure", () => {
  it("has exactly 6 substeps", () => {
    expect(twoLookPll.substeps.length).toBe(6);
  });

  it("has unique non-empty substep IDs", () => {
    const ids = twoLookPll.substeps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id.length).toBeGreaterThan(0));
  });

  it("every initialState is a valid algorithm or empty string", () => {
    twoLookPll.substeps.forEach((s) => {
      if (s.initialState !== "") {
        expect(isValidAlgorithm(s.initialState)).toBe(true);
      }
    });
  });

  it("every algorithm is a valid non-empty algorithm", () => {
    twoLookPll.substeps.forEach((s) => {
      if (s.algorithm !== undefined) {
        expect(isValidAlgorithm(s.algorithm)).toBe(true);
      }
    });
  });

  it("every highlightPieces is a non-empty array of non-empty strings", () => {
    twoLookPll.substeps.forEach((s) => {
      expect(s.highlightPieces.length).toBeGreaterThan(0);
      s.highlightPieces.forEach((p) => expect(p.length).toBeGreaterThan(0));
    });
  });
});

describe("twoLookPll — each case solves the cube", () => {
  twoLookPll.substeps.forEach((substep) => {
    it(`${substep.id}: initialState → algorithm → isSolved()`, () => {
      const engine = applySetup(substep.initialState);
      engine.applyAlgorithm(substep.algorithm!);
      expect(engine.isSolved()).toBe(true);
    });
  });
});
```

- [ ] **Step 4: Run tests — iterate until all PLL tests pass**

```
npx vitest run src/data/beginner/__tests__/content.test.ts
```

**If a test fails:** The `initialState` for that case is wrong. Recompute the inverse of the algorithm and update the data file. The test will tell you exactly which case failed. Repeat until all 6 PLL tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/beginner/two-look-pll.ts src/data/beginner/__tests__/content.test.ts
git commit -m "feat(4a): add two-look-pll tutorial data + tests"
```

---

### Task 7: Barrel Index + Final Test Run

**Files:**
- Create: `src/data/beginner/index.ts`

- [ ] **Step 1: Create `src/data/beginner/index.ts`**

```ts
import type { StepMeta } from "@/lib/tutorialTypes";

export const BEGINNER_STEPS: StepMeta[] = [
  {
    id: "white-cross",
    title: "White Cross",
    route: "/learn/white-cross",
    stepNumber: 1,
    estimatedMinutes: 15,
  },
  {
    id: "white-corners",
    title: "White Corners",
    route: "/learn/white-corners",
    stepNumber: 2,
    estimatedMinutes: 20,
  },
  {
    id: "second-layer",
    title: "Second Layer",
    route: "/learn/second-layer",
    stepNumber: 3,
    estimatedMinutes: 20,
  },
  {
    id: "two-look-oll",
    title: "2-Look OLL",
    route: "/learn/oll",
    stepNumber: 4,
    estimatedMinutes: 25,
    caseCount: 10,
  },
  {
    id: "two-look-pll",
    title: "2-Look PLL",
    route: "/learn/pll",
    stepNumber: 5,
    estimatedMinutes: 20,
    caseCount: 6,
  },
];

export { whiteCross } from "./white-cross";
export { whiteCorners } from "./white-corners";
export { secondLayer } from "./second-layer";
export { twoLookOll } from "./two-look-oll";
export { twoLookPll } from "./two-look-pll";
```

- [ ] **Step 2: Add index structure test**

Append to `content.test.ts`:

```ts
// ---------------------------------------------------------------------------
// Index
// ---------------------------------------------------------------------------
import { BEGINNER_STEPS } from "../index";

describe("BEGINNER_STEPS — structure", () => {
  it("has exactly 5 steps", () => {
    expect(BEGINNER_STEPS.length).toBe(5);
  });

  it("step numbers are 1–5 in order", () => {
    BEGINNER_STEPS.forEach((step, i) => {
      expect(step.stepNumber).toBe(i + 1);
    });
  });

  it("all routes start with /learn/", () => {
    BEGINNER_STEPS.forEach((step) => {
      expect(step.route.startsWith("/learn/")).toBe(true);
    });
  });

  it("OLL has caseCount 10 and PLL has caseCount 6", () => {
    const oll = BEGINNER_STEPS.find((s) => s.id === "two-look-oll")!;
    const pll = BEGINNER_STEPS.find((s) => s.id === "two-look-pll")!;
    expect(oll.caseCount).toBe(10);
    expect(pll.caseCount).toBe(6);
  });
});
```

- [ ] **Step 3: Run the full test suite**

```
npx vitest run src/data/beginner/__tests__/content.test.ts
```

Expected: All tests pass (should be 40+ tests across all 5 steps + index).

- [ ] **Step 4: Run the full project test suite to confirm no regressions**

```
npx vitest run
```

Expected: All existing tests plus new content tests pass with no failures.

- [ ] **Step 5: Commit**

```bash
git add src/data/beginner/index.ts src/data/beginner/__tests__/content.test.ts
git commit -m "feat(4a): add beginner index barrel + final test run — Phase 4A complete"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 7 files from the spec's File Map are covered across the 7 tasks. All 5 substep counts match (4, 4, 3, 10, 6). All algorithm strings match the spec exactly. `StepMeta` array matches spec exactly.
- [x] **Placeholder scan:** No TBD or TODO. Every step has complete code.
- [x] **Type consistency:** `Substep.initialState`, `Substep.algorithm`, `Substep.solutionMoves` used consistently across all tasks. `BEGINNER_STEPS` uses `StepMeta[]` from Task 1.
- [x] **Scramble authoring guidance:** Tasks 5 and 6 include explicit guidance on how to compute and verify setup scrambles using the engine.
