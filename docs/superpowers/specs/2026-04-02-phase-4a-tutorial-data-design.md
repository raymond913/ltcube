# Phase 4A — Tutorial Content Data Files Design Spec

**Date:** 2026-04-02
**Status:** Approved

---

## Overview

Phase 4A creates the content data layer for the beginner tutorial. Five TypeScript data modules export typed `TutorialStep` objects covering all 5 beginner method steps. A shared types file in `src/lib/` provides interfaces used by both data and future 4B components. A single test file runs every algorithm and setup scramble through the real `CubeEngine` to catch errors automatically.

---

## Approach

TypeScript data modules (`.ts` files exporting typed objects), not JSON. This gives full type-checking and autocomplete when authoring cubie IDs and algorithm strings. The roadmap's intent of "data-driven content" is fully preserved — components import from the data files, not hardcode content.

---

## File Map

| Path | Action | Responsibility |
|------|--------|----------------|
| `src/lib/tutorialTypes.ts` | Create | Shared TypeScript interfaces (`TutorialStep`, `Substep`, `StepMeta`) |
| `src/data/beginner/white-cross.ts` | Create | White Cross tutorial data (4 substeps) |
| `src/data/beginner/white-corners.ts` | Create | White Corners tutorial data (4 substeps) |
| `src/data/beginner/second-layer.ts` | Create | Second Layer tutorial data (3 substeps) |
| `src/data/beginner/two-look-oll.ts` | Create | 2-Look OLL tutorial data (10 cases) |
| `src/data/beginner/two-look-pll.ts` | Create | 2-Look PLL tutorial data (6 cases) |
| `src/data/beginner/index.ts` | Create | `StepMeta[]` array + re-exports of all 5 steps |
| `src/data/beginner/__tests__/content.test.ts` | Create | Engine-verified correctness tests |

---

## TypeScript Interfaces

Defined in `src/lib/tutorialTypes.ts`:

```ts
export interface Substep {
  id: string;
  title: string;
  explanation: string;       // What to look for, what we're doing, why
  tip?: string;              // Pro tip or common mistake warning
  algorithm?: string;        // Standard notation, e.g. "R U R' U'"
  algorithmName?: string;    // Display name, e.g. "Sexy Move"
  initialState: string;      // Algorithm string applied to solved cube to reach this position.
                             // Empty string "" means start from solved.
  highlightPieces: string[]; // Cubie IDs to highlight, e.g. ["UF", "UFR"]
  solutionMoves?: string;    // For cross/corners/F2L examples: the specific solution moves
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;   // Overview paragraph shown at top of tutorial page
  concepts: string[];    // Key ideas listed as bullet points
  substeps: Substep[];
}

export interface StepMeta {
  id: string;                // Matches TutorialStep.id
  title: string;
  route: string;             // e.g. "/learn/white-cross"
  stepNumber: number;        // 1–5
  estimatedMinutes: number;
  caseCount?: number;        // Only for OLL (10) and PLL (6)
}
```

**`initialState` contract:** The string is parsed by `CubeEngine.applyAlgorithm()` on a fresh solved engine. The result is the starting position for that substep. An empty string `""` means the cube starts solved.

---

## Content Specification

### white-cross.ts

**Step id:** `"white-cross"`
**Concepts:** Daisy method, edge orientation, inserting edges without disturbing others

4 substeps demonstrating edge positions the learner will encounter:

| id | Title | Scenario | highlightPieces |
|----|-------|----------|----------------|
| `wc-edge-top` | Edge on the top face | White edge sitting on U face above its target slot, needs to be swung down and aligned | `["UF", "DF"]` |
| `wc-edge-middle` | Edge stuck in middle layer | White edge lodged in the middle layer (FR slot), needs to be kicked out and inserted correctly | `["FR", "DF"]` |
| `wc-edge-flipped` | Edge on bottom, wrong orientation | White edge is at bottom but oriented incorrectly (white facing out instead of down) | `["DF"]` |
| `wc-full-cross` | Solving the full cross | A realistic scramble requiring all four white edges to be placed; demonstrates full cross solve | `["UF","UB","UL","UR","DF","DB","DL","DR"]` |

All substeps have `solutionMoves` showing the solution. No `algorithm` or `algorithmName` — White Cross is intuitive.

---

### white-corners.ts

**Step id:** `"white-corners"`
**Concepts:** Corner orientation, inserting corners using R U R' U', dealing with trapped corners

Core algorithm shown across substeps: `R U R' U'` (the "Sexy Move")

4 substeps:

| id | Title | Scenario | algorithm | highlightPieces |
|----|-------|----------|-----------|----------------|
| `wco-above-right` | Corner above slot, white facing right | Target corner is directly above its slot with white sticker facing the right face — insert in 1 application of R U R' U' | `"R U R' U'"` | `["DFR"]` |
| `wco-above-up` | Corner above slot, white facing up | Target corner above slot but white faces upward — requires setup before insertion | `"R U R' U'"` | `["DFR"]` |
| `wco-above-front` | Corner above slot, white facing front | Target corner above slot with white facing front — different number of R U R' U' repetitions needed | `"R U R' U'"` | `["DFR"]` |
| `wco-stuck` | Corner trapped in bottom layer | Target corner already in the bottom layer but in the wrong slot or wrong orientation — need to extract it first | `"R U R' U'"` | `["DFR"]` |

All substeps have `algorithmName: "Sexy Move"` and `solutionMoves`.

---

### second-layer.ts

**Step id:** `"second-layer"`
**Concepts:** Identifying left vs right insertion, not disturbing the white cross

3 substeps:

| id | Title | Algorithm | algorithmName |
|----|-------|-----------|---------------|
| `sl-right` | Edge goes to the right | `"U R U' R' U' F' U F"` | `"Right Insert"` |
| `sl-left` | Edge goes to the left | `"U' L' U L U F U' F'"` | `"Left Insert"` |
| `sl-flipped` | Edge is stuck and flipped | Use either Right or Left Insert to kick the edge out, then solve normally | `"Kick Out & Reinsert"` |

`sl-flipped` has `tip`: "Use any insert algorithm to knock the flipped edge out of the middle layer — it'll land on top, where you can then solve it normally."

All substeps have `solutionMoves`.

---

### two-look-oll.ts

**Step id:** `"two-look-oll"`
**Concepts:** What OLL means, edge orientation first, corner orientation second, recognising each case

10 substeps in 2 logical groups (distinguished by an optional `section` field — see note below):

#### Edge Orientation (3 cases — form the yellow cross)

| id | algorithmName | algorithm |
|----|---------------|-----------|
| `oll-dot` | Dot | `"F (R U R' U') F' f (R U R' U') f'"` — stored as `"F R U R' U' F' f R U R' U' f'"` |
| `oll-l-shape` | L-Shape | `"f R U R' U' f'"` |
| `oll-line` | Line | `"F R U R' U' F'"` |

#### Corner Orientation (7 cases)

| id | algorithmName | algorithm |
|----|---------------|-----------|
| `oll-sune` | Sune | `"R U R' U R U2 R'"` |
| `oll-antisune` | Anti-Sune | `"R U2 R' U' R U' R'"` |
| `oll-h` | H | `"R U R' U R U' R' U R U2 R'"` |
| `oll-pi` | Pi | `"R U2 R2 U' R2 U' R2 U2 R"` |
| `oll-u` | U | `"R2 D' R U2 R' D R U2 R"` |
| `oll-t` | T | `"r U R' U' r' F R F'"` |
| `oll-l` | L | `"F R U R' U' F'"` |

Each OLL substep has:
- `initialState`: a setup scramble that produces that exact OLL case with F2L intact (implementer must verify with engine)
- `highlightPieces`: the U-face corners/edges that are misoriented
- `explanation`: how to recognise this case (which stickers are yellow on top)
- No `solutionMoves` — algorithm IS the solution

**Note on `section`:** The `Substep` interface does not include a `section` field — grouping for the OLL/PLL pages is handled by the 4C UI consuming the data. The two-look-oll.ts file exports the 10 cases as a flat `substeps` array; the first 3 are edge cases, the last 7 are corner cases. The index order is the section boundary.

---

### two-look-pll.ts

**Step id:** `"two-look-pll"`
**Concepts:** What PLL means, corner permutation first, edge permutation second, recognising each case

6 substeps:

#### Corner Permutation (2 cases)

| id | algorithmName | algorithm |
|----|---------------|-----------|
| `pll-adj` | Adjacent Swap | `"R U R' U' R' F R2 U' R' U' R U R' F'"` |
| `pll-diag` | Diagonal Swap | `"F R U' R' U' R U R' F' R U R' U' R' F R F'"` |

#### Edge Permutation (4 cases)

| id | algorithmName | algorithm |
|----|---------------|-----------|
| `pll-ua` | Ua Perm | `"R U' R U R U R U' R' U' R2"` |
| `pll-ub` | Ub Perm | `"R2 U R U R' U' R' U' R' U R'"` |
| `pll-h` | H Perm | `"M2 U M2 U2 M2 U M2"` |
| `pll-z` | Z Perm | `"M2 U M2 U M' U2 M2 U2 M'"` |

Each PLL substep has:
- `initialState`: a setup scramble producing that exact PLL case with F2L + OLL solved (implementer must verify)
- `highlightPieces`: the corners/edges that need to be permuted
- `explanation`: how to recognise this case
- No `solutionMoves`

---

### index.ts

Exports:

```ts
export const BEGINNER_STEPS: StepMeta[] = [
  { id: "white-cross",   title: "White Cross",  route: "/learn/white-cross",   stepNumber: 1, estimatedMinutes: 15 },
  { id: "white-corners", title: "White Corners", route: "/learn/white-corners", stepNumber: 2, estimatedMinutes: 20 },
  { id: "second-layer",  title: "Second Layer",  route: "/learn/second-layer",  stepNumber: 3, estimatedMinutes: 20 },
  { id: "two-look-oll",  title: "2-Look OLL",    route: "/learn/oll",           stepNumber: 4, estimatedMinutes: 25, caseCount: 10 },
  { id: "two-look-pll",  title: "2-Look PLL",    route: "/learn/pll",           stepNumber: 5, estimatedMinutes: 20, caseCount: 6  },
];

export { whiteCross }   from "./white-cross";
export { whiteCorners } from "./white-corners";
export { secondLayer }  from "./second-layer";
export { twoLookOll }   from "./two-look-oll";
export { twoLookPll }   from "./two-look-pll";
```

---

## Testing Strategy

All tests in `src/data/beginner/__tests__/content.test.ts` using Vitest + the real `CubeEngine`.

### Helper functions used in tests

```ts
function applySetup(scramble: string): CubeEngine {
  const engine = new CubeEngine();
  if (scramble) engine.applyAlgorithm(scramble);
  return engine;
}

function hasYellowCross(engine: CubeEngine): boolean {
  const u = engine.getState().U;
  // Center + 4 edge positions
  return u[0][1] === "yellow" && u[1][0] === "yellow" &&
         u[1][1] === "yellow" && u[1][2] === "yellow" && u[2][1] === "yellow";
}

function isOllSolved(engine: CubeEngine): boolean {
  return engine.getState().U.every(row => row.every(c => c === "yellow"));
}
```

### Test suites

**Structure tests (all 5 files):**
- All substep IDs are non-empty strings
- All substep IDs are unique within each file
- `initialState` is a valid parseable algorithm (or empty string)
- `solutionMoves` (when present) is a non-empty parseable algorithm
- `highlightPieces` is a non-empty array of non-empty strings
- `algorithm` (when present) is a non-empty parseable algorithm

**OLL edge cases (`oll-dot`, `oll-l-shape`, `oll-line`):**
```
apply initialState → apply algorithm → hasYellowCross() === true
```

**OLL corner cases (`oll-sune` … `oll-l`):**
```
apply initialState → apply algorithm → isOllSolved() === true
```

**PLL cases (all 6):**
```
apply initialState → apply algorithm → engine.isSolved() === true
```

**Tutorial example round-trip (cross/corners/second-layer — all substeps with `solutionMoves`):**
```
apply initialState → apply solutionMoves → result !== initialState-only state
(i.e. solutionMoves actually changed the cube — guards against empty/no-op solutions)
```

---

## Implementation Constraints

1. **The implementer is the correctness authority for scrambles.** The design specifies *what each substep must demonstrate* and *what the test verifies*. The implementer must author setup scrambles that pass the engine tests.

2. **OLL/PLL setup scrambles must keep F2L intact.** For OLL cases, the bottom two layers must be solved; only the last layer is scrambled to the case pattern. For PLL cases, the bottom two layers and the U face must be solved; only the last-layer permutation is scrambled. The engine tests will catch F2L disruption for PLL (isSolved fails) but not automatically for OLL — the implementer must manually verify F2L is intact.

3. **Algorithm strings must use only moves supported by `parseAlgorithm`:** standard face moves (R L U D F B), wide moves (r l u d f b), and rotations (x y z). Parentheses are parsed as grouping only (stripped). Use `'` for inverse, `2` for double.

4. **Run `npx vitest run` after authoring each file** — don't save all files and run tests at the end. Catch errors file by file.
