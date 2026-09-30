import { describe, it, expect } from "vitest";
import { CubeEngine } from "@/lib/cubeEngine";
import { HOLD_VIEW, HOLD_VISIBLE_FACES } from "@/lib/cameraViews";
import type { Substep } from "@/lib/tutorialTypes";
import { cross } from "../cross";
import { corners } from "../corners";
import { secondLayer } from "../second-layer";
import { twoLookOll } from "../two-look-oll";
import { twoLookPll } from "../two-look-pll";

// ---------------------------------------------------------------------------
// Engine helpers
// ---------------------------------------------------------------------------

type Face = "U" | "D" | "F" | "B" | "R" | "L";
type Stk = [Face, number, number];
type Faces = Record<Face, string[][]>;

const SLOTS: Record<string, Stk[]> = {
  UF: [["U", 2, 1], ["F", 0, 1]], UB: [["U", 0, 1], ["B", 0, 1]], UR: [["U", 1, 2], ["R", 0, 1]], UL: [["U", 1, 0], ["L", 0, 1]],
  DF: [["D", 0, 1], ["F", 2, 1]], DB: [["D", 2, 1], ["B", 2, 1]], DR: [["D", 1, 2], ["R", 2, 1]], DL: [["D", 1, 0], ["L", 2, 1]],
  FR: [["F", 1, 2], ["R", 1, 0]], FL: [["F", 1, 0], ["L", 1, 2]], BR: [["B", 1, 0], ["R", 1, 2]], BL: [["B", 1, 2], ["L", 1, 0]],
  UFR: [["U", 2, 2], ["F", 0, 2], ["R", 0, 0]], UFL: [["U", 2, 0], ["F", 0, 0], ["L", 0, 2]],
  UBR: [["U", 0, 2], ["B", 0, 0], ["R", 0, 2]], UBL: [["U", 0, 0], ["B", 0, 2], ["L", 0, 0]],
  DFR: [["D", 0, 2], ["F", 2, 2], ["R", 2, 0]], DFL: [["D", 0, 0], ["F", 2, 0], ["L", 2, 2]],
  DBR: [["D", 2, 2], ["B", 2, 0], ["R", 2, 2]], DBL: [["D", 2, 0], ["B", 2, 2], ["L", 2, 0]],
};
const TOP_EDGES = ["UF", "UB", "UR", "UL"];
const TOP_CORNERS = ["UFR", "UFL", "UBR", "UBL"];

function stateAfter(...algs: string[]): Faces {
  const engine = new CubeEngine();
  for (const a of algs) if (a) engine.applyAlgorithm(a);
  return engine.getState() as unknown as Faces;
}

const colorsAt = (s: Faces, slot: string) => SLOTS[slot].map(([f, r, c]) => s[f][r][c]);
const keyOf = (colors: string[]) => [...colors].sort().join("+");

/** Where the piece made of `colors` sits, and which face each of its colors points at. */
function whereIs(s: Faces, colors: string[]): { slot: string; face: Record<string, Face> } {
  for (const slot of Object.keys(SLOTS)) {
    const got = colorsAt(s, slot);
    if (keyOf(got) === keyOf(colors)) {
      const face: Record<string, Face> = {};
      SLOTS[slot].forEach(([f], i) => { face[got[i]] = f; });
      return { slot, face };
    }
  }
  throw new Error(`piece ${colors.join("+")} not found`);
}

/** The slot a piece currently in `slot` ends up in after the algorithm. */
function destination(before: Faces, after: Faces, slot: string): string {
  return whereIs(after, colorsAt(before, slot)).slot;
}

const yellowUp = (s: Faces, slots: string[]) =>
  slots.filter((n) => s[SLOTS[n][0][0]][SLOTS[n][0][1]][SLOTS[n][0][2]] === "yellow").sort();

/** Yellow stickers on the side faces of the top-layer corners. */
const sideYellows = (s: Faces) =>
  TOP_CORNERS.flatMap((n) =>
    SLOTS[n].slice(1).filter(([f, r, c]) => s[f][r][c] === "yellow").map(([f]) => ({ slot: n, face: f })),
  );
const countOn = (list: { face: Face }[], face: Face) => list.filter((x) => x.face === face).length;

/** Sides whose two top corner stickers match each other (headlights). */
const headlightSides = (s: Faces) =>
  (["F", "R", "B", "L"] as Face[]).filter((f) => s[f][0][0] === s[f][0][2]);
/** Sides whose top edge already matches that face's center. */
const solvedEdgeSides = (s: Faces) =>
  (["F", "R", "B", "L"] as Face[]).filter((f) => s[f][0][1] === s[f][1][1]);

// ---------------------------------------------------------------------------
// Hold view geometry
// ---------------------------------------------------------------------------

const FACES: Record<Face, { center: [number, number, number]; normal: [number, number, number] }> = {
  U: { center: [0, 1.5, 0], normal: [0, 1, 0] },
  D: { center: [0, -1.5, 0], normal: [0, -1, 0] },
  F: { center: [0, 0, 1.5], normal: [0, 0, 1] },
  B: { center: [0, 0, -1.5], normal: [0, 0, -1] },
  R: { center: [1.5, 0, 0], normal: [1, 0, 0] },
  L: { center: [-1.5, 0, 0], normal: [-1, 0, 0] },
};

/** How squarely a face points at the camera: 1 = head on, 0 = edge on, < 0 = facing away. */
function facing(face: Face, cam: readonly number[]): number {
  const { center, normal } = FACES[face];
  const v = [cam[0] - center[0], cam[1] - center[1], cam[2] - center[2]];
  const len = Math.hypot(v[0], v[1], v[2]);
  return (v[0] * normal[0] + v[1] * normal[1] + v[2] * normal[2]) / len;
}

/** Faces a camera at `cam` can see (U plus one of R/L and one of F/B). */
const seenFrom = (cam: readonly number[]): Set<Face> =>
  new Set<Face>(["U", cam[0] > 0 ? "R" : "L", cam[2] > 0 ? "F" : "B"]);

describe("HOLD_VIEW", () => {
  it("makes the front face the obvious main face", () => {
    const f = facing("F", HOLD_VIEW);
    (["U", "D", "B", "R", "L"] as Face[]).forEach((face) => expect(f).toBeGreaterThan(facing(face, HOLD_VIEW)));
    expect(f).toBeGreaterThan(2 * facing("R", HOLD_VIEW));
  });

  it("HOLD_VISIBLE_FACES are exactly the faces readable from the hold view", () => {
    const readable = (Object.keys(FACES) as Face[]).filter((f) => facing(f, HOLD_VIEW) >= 0.15).sort();
    expect(readable).toEqual([...HOLD_VISIBLE_FACES].sort());
  });
});

// ---------------------------------------------------------------------------
// Spot-then-hold: a case glides only when its key feature is hidden from the hold view
// ---------------------------------------------------------------------------

const SIDE_OF: Record<Face, string> = { F: "front", B: "back", L: "left", R: "right", U: "top", D: "bottom" };
const ANY_ANGLE = ["oll-dot", "pll-no-headlights", "pll-h"];

describe("spot-then-hold camera", () => {
  const spotCases = [...twoLookOll.substeps, ...twoLookPll.substeps].filter((s) => s.spotStickers?.length);

  spotCases.forEach((sub) => {
    it(`${sub.id}: glides (with labels) iff a glowing sticker is hidden from the hold view`, () => {
      const engine = new CubeEngine();
      engine.applyAlgorithm(sub.initialState);
      const state = engine.getState() as unknown as Faces;
      const faces = sub.spotStickers!.map((spot) => {
        const [x, y, z] = spot.piece.split(",").map(Number);
        const id = `${y > 0 ? "U" : y < 0 ? "D" : ""}${z > 0 ? "F" : z < 0 ? "B" : ""}${x > 0 ? "R" : x < 0 ? "L" : ""}`;
        const st = engine.getStickersForCubie(id).filter((s2) => state[s2.face][s2.row][s2.col] === spot.color);
        expect(st).toHaveLength(1);
        return st[0].face as Face;
      });
      const hidden = [...new Set(faces.filter((f) => !(HOLD_VISIBLE_FACES as readonly string[]).includes(f)))];

      if (hidden.length === 0) {
        expect(sub.cameraPosition).toBeUndefined();
        expect(sub.spotLabels).toBeUndefined();
        return;
      }
      expect(ANY_ANGLE).not.toContain(sub.id);
      // the spot view shows every hidden face...
      expect(sub.cameraPosition).toBeDefined();
      const spotSees = seenFrom(sub.cameraPosition!);
      hidden.forEach((f) => expect(spotSees.has(f)).toBe(true));
      // ...and each hidden side gets one short floating label
      expect((sub.spotLabels ?? []).map((l) => l.side).sort()).toEqual(hidden.map((f) => SIDE_OF[f]).sort());
      (sub.spotLabels ?? []).forEach((l) => {
        const words = l.text.trim().split(/\s+/).length;
        expect(words).toBeGreaterThanOrEqual(2);
        expect(words).toBeLessThanOrEqual(4);
      });
    });
  });

  it("'Any angle works' cases start at the hold view with no glide and no label", () => {
    ANY_ANGLE.forEach((id) => {
      const sub = [...twoLookOll.substeps, ...twoLookPll.substeps].find((s) => s.id === id)!;
      expect(sub.holdInstruction).toBe("Any angle works.");
      expect(sub.cameraPosition).toBeUndefined();
      expect(sub.spotLabels).toBeUndefined();
    });
  });

  it("spot views are views from above at the usual distance", () => {
    spotCases.filter((s) => s.cameraPosition).forEach((s) => {
      const [x, y, z] = s.cameraPosition!;
      expect([Math.abs(x), y, Math.abs(z)]).toEqual([4, 3, 4]);
    });
  });
});

// ---------------------------------------------------------------------------
// holdInstruction: every direction word checked against the engine state
// ---------------------------------------------------------------------------

type Check = (init: Faces, after: Faces) => void;

const CHECKS: Record<string, Check> = {
  // ---- cross: white on top; front = green, right = red
  "wc-case1": (s) => {
    expect(s.U[1][1]).toBe("white");
    const p = whereIs(s, ["red", "white"]);
    expect([p.slot, p.face.white]).toEqual(["FR", "F"]);
  },
  "wc-case2": (s) => {
    const a = whereIs(s, ["red", "white"]);
    expect([a.slot, a.face.white]).toEqual(["UF", "F"]);
    expect(whereIs(s, ["green", "white"]).slot).toBe("FL");
  },
  "wc-case3": (s) => {
    const p = whereIs(s, ["red", "white"]);
    expect([p.slot, p.face.white]).toEqual(["UR", "R"]);
  },
  "wc-case4": (s) => {
    expect(whereIs(s, ["red", "white"]).slot).toBe("UF");
    expect(whereIs(s, ["green", "white"]).slot).toBe("UR");
  },
  // ---- corners: the white-green-red corner
  "co-white-right": (s) => {
    expect(s.U[1][1]).toBe("white");
    const p = whereIs(s, ["green", "red", "white"]);
    expect([p.slot, p.face.white]).toEqual(["DFR", "R"]);
  },
  "co-white-front": (s) => {
    const p = whereIs(s, ["green", "red", "white"]);
    expect([p.slot, p.face.white]).toEqual(["DFR", "F"]);
  },
  "co-white-down": (s) => {
    const p = whereIs(s, ["green", "red", "white"]);
    expect([p.slot, p.face.white]).toEqual(["DFR", "D"]);
  },
  "co-twisted": (s) => {
    const p = whereIs(s, ["green", "red", "white"]);
    expect([p.slot, p.face.white]).toEqual(["UFR", "F"]);
  },
  // ---- second layer: yellow on top; front = blue, right = red
  "sl-right": (s, a) => {
    expect(s.U[1][1]).toBe("yellow");
    const p = whereIs(s, ["blue", "red"]);
    expect([p.slot, p.face.blue]).toEqual(["UF", "F"]);
    expect(s.F[1][1]).toBe("blue");
    expect(whereIs(a, ["blue", "red"]).slot).toBe("FR");
  },
  "sl-left": (s, a) => {
    const p = whereIs(s, ["blue", "orange"]);
    expect([p.slot, p.face.blue]).toEqual(["UF", "F"]);
    expect(whereIs(a, ["blue", "orange"]).slot).toBe("FL");
  },
  "sl-flipped": (s) => {
    const p = whereIs(s, ["blue", "red"]);
    expect([p.slot, p.face.red, p.face.blue]).toEqual(["FR", "F", "R"]);
  },
  "sl-wrong-slot": (s) => {
    const p = whereIs(s, ["blue", "red"]);
    expect([p.slot, p.face.red, p.face.blue]).toEqual(["FL", "F", "L"]);
  },
  // ---- OLL
  "oll-dot": (s) => expect(yellowUp(s, TOP_EDGES)).toEqual([]),
  "oll-l-shape": (s) => expect(yellowUp(s, TOP_EDGES)).toEqual(["UB", "UL"]),
  "oll-line": (s) => expect(yellowUp(s, TOP_EDGES)).toEqual(["UL", "UR"]),
  "oll-sune": (s) => expect(yellowUp(s, TOP_CORNERS)).toEqual(["UFL"]),
  "oll-antisune": (s) => expect(yellowUp(s, TOP_CORNERS)).toEqual(["UBR"]),
  "oll-h": (s) => {
    expect(yellowUp(s, TOP_CORNERS)).toEqual([]);
    expect([countOn(sideYellows(s), "L"), countOn(sideYellows(s), "R")]).toEqual([2, 2]);
  },
  "oll-pi": (s) => {
    expect(yellowUp(s, TOP_CORNERS)).toEqual([]);
    expect(countOn(sideYellows(s), "L")).toBe(2);
  },
  "oll-u": (s) => {
    expect(yellowUp(s, TOP_CORNERS)).toEqual(["UFL", "UFR"]);
    expect(countOn(sideYellows(s), "B")).toBe(2);
  },
  "oll-t": (s) => {
    expect(yellowUp(s, TOP_CORNERS)).toEqual(["UBR", "UFR"]);
    expect([countOn(sideYellows(s), "F"), countOn(sideYellows(s), "B")]).toEqual([1, 1]);
  },
  "oll-l": (s) => expect(yellowUp(s, TOP_CORNERS)).toEqual(["UBR", "UFL"]),
  // ---- PLL
  "pll-headlights": (s, a) => {
    expect(headlightSides(s)).toEqual(["L"]);
    expect(destination(s, a, "UFR")).toBe("UBR");
  },
  "pll-no-headlights": (s, a) => {
    expect(headlightSides(s)).toEqual([]);
    expect(destination(s, a, "UFR")).toBe("UBL");
  },
  "pll-ua": (s, a) => {
    expect(solvedEdgeSides(s)).toEqual(["B"]);
    // counter-clockwise from above: front -> right -> left -> front
    expect([destination(s, a, "UF"), destination(s, a, "UR"), destination(s, a, "UL")]).toEqual(["UR", "UL", "UF"]);
  },
  "pll-ub": (s, a) => {
    expect(solvedEdgeSides(s)).toEqual(["B"]);
    // clockwise from above: front -> left -> right -> front
    expect([destination(s, a, "UF"), destination(s, a, "UL"), destination(s, a, "UR")]).toEqual(["UL", "UR", "UF"]);
  },
  "pll-h": (s, a) => {
    expect(solvedEdgeSides(s)).toEqual([]);
    expect([destination(s, a, "UF"), destination(s, a, "UL")]).toEqual(["UB", "UR"]);
  },
  "pll-z": (s, a) => {
    expect(solvedEdgeSides(s)).toEqual([]);
    expect([destination(s, a, "UF"), destination(s, a, "UB")]).toEqual(["UL", "UR"]);
  },
};

const ALL_CASES: Substep[] = [
  ...cross.substeps,
  ...corners.substeps,
  ...secondLayer.substeps,
  ...twoLookOll.substeps,
  ...twoLookPll.substeps,
];

describe("holdInstruction", () => {
  it("every one of the 28 cases has a check and a short plain instruction", () => {
    expect(ALL_CASES).toHaveLength(28);
    expect(Object.keys(CHECKS).sort()).toEqual(ALL_CASES.map((s) => s.id).sort());
    ALL_CASES.forEach((s) => {
      expect((s.holdInstruction ?? "").length).toBeGreaterThan(0);
      expect(s.holdInstruction!.endsWith(".")).toBe(true);
    });
  });

  ALL_CASES.forEach((sub) => {
    it(`${sub.id}: "${sub.holdInstruction}" matches the engine state`, () => {
      CHECKS[sub.id](stateAfter(sub.initialState), stateAfter(sub.initialState, sub.algorithm ?? ""));
    });
  });
});
