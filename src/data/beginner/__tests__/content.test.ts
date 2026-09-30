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

// ---------------------------------------------------------------------------
// Tests (populated in later tasks)
// ---------------------------------------------------------------------------

describe("beginner tutorial content", () => {
  it.todo("test cases added in subsequent tasks");
});

// ---------------------------------------------------------------------------
// White Cross
// ---------------------------------------------------------------------------
import { cross } from "../cross";

describe("cross — structure", () => {
  it("has unique non-empty substep IDs", () => {
    const ids = cross.substeps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id.length).toBeGreaterThan(0));
  });

  it("every initialState is a valid algorithm or empty string", () => {
    cross.substeps.forEach((s) => {
      if (s.initialState !== "") {
        expect(isValidAlgorithm(s.initialState)).toBe(true);
      }
    });
  });

  it("every solutionMoves is a valid non-empty algorithm", () => {
    cross.substeps.forEach((s) => {
      if (s.solutionMoves !== undefined) {
        expect(isValidAlgorithm(s.solutionMoves)).toBe(true);
      }
    });
  });

  it("every highlightPieces is a non-empty array of non-empty strings", () => {
    cross.substeps.forEach((s) => {
      expect(s.highlightPieces.length).toBeGreaterThan(0);
      s.highlightPieces.forEach((p) => expect(p.length).toBeGreaterThan(0));
    });
  });
});

describe("cross — round-trip", () => {
  cross.substeps.forEach((substep) => {
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

// ---------------------------------------------------------------------------
// White Corners
// ---------------------------------------------------------------------------
import { corners } from "../corners";

describe("corners — structure", () => {
  it("has unique non-empty substep IDs", () => {
    const ids = corners.substeps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id.length).toBeGreaterThan(0));
  });

  it("every initialState is a valid algorithm or empty string", () => {
    corners.substeps.forEach((s) => {
      if (s.initialState !== "") {
        expect(isValidAlgorithm(s.initialState)).toBe(true);
      }
    });
  });

  it("every algorithm is a valid non-empty algorithm", () => {
    corners.substeps.forEach((s) => {
      if (s.algorithm !== undefined) {
        expect(isValidAlgorithm(s.algorithm)).toBe(true);
      }
    });
  });

  it("every solutionMoves is a valid non-empty algorithm", () => {
    corners.substeps.forEach((s) => {
      if (s.solutionMoves !== undefined) {
        expect(isValidAlgorithm(s.solutionMoves)).toBe(true);
      }
    });
  });

  it("every highlightPieces is a non-empty array of non-empty strings", () => {
    corners.substeps.forEach((s) => {
      expect(s.highlightPieces.length).toBeGreaterThan(0);
      s.highlightPieces.forEach((p) => expect(p.length).toBeGreaterThan(0));
    });
  });
});

describe("corners — round-trip", () => {
  corners.substeps.forEach((substep) => {
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

  it("highlightPieces is an array (PLL cases leave it empty; the gray mask uses visibleCubies)", () => {
    twoLookPll.substeps.forEach((s) => {
      expect(Array.isArray(s.highlightPieces)).toBe(true);
      s.highlightPieces.forEach((p) => expect(p.length).toBeGreaterThan(0));
    });
  });

  it("visibleCubies keeps only the top layer and the 4 side centers in color", () => {
    const expected = [
      "-1,1,-1", "0,1,-1", "1,1,-1", "-1,1,0", "0,1,0", "1,1,0", "-1,1,1", "0,1,1", "1,1,1",
      "-1,0,0", "1,0,0", "0,0,-1", "0,0,1",
    ].sort();
    twoLookPll.substeps.forEach((s) => {
      expect([...(s.visibleCubies ?? [])].sort()).toEqual(expected);
    });
  });

  it("cameraPosition is a view from above at the default distance", () => {
    twoLookPll.substeps.forEach((s) => {
      expect(s.cameraPosition).toBeDefined();
      const [x, y, z] = s.cameraPosition!;
      expect([Math.abs(x), y, Math.abs(z)]).toEqual([4, 3, 4]);
    });
  });

  it("every substep has a how-to-spot hint", () => {
    twoLookPll.substeps.forEach((s) => {
      expect((s.howToSpot ?? "").length).toBeGreaterThan(0);
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

  it("OLL has 10 cases and PLL has 6 cases", () => {
    const oll = BEGINNER_STEPS.find((s) => s.id === "two-look-oll")!;
    const pll = BEGINNER_STEPS.find((s) => s.id === "two-look-pll")!;
    expect(oll).toBeDefined();
    expect(pll).toBeDefined();
    expect(twoLookOll.substeps.length).toBe(10);
    expect(twoLookPll.substeps.length).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// Recognition glow — spotStickers
// ---------------------------------------------------------------------------

/** "x,y,z" identity key -> engine cubie ID ("UFR", "UF", "U", ...). */
function cubieIdForKey(key: string): string {
  const [x, y, z] = key.split(",").map(Number);
  return `${y > 0 ? "U" : y < 0 ? "D" : ""}${z > 0 ? "F" : z < 0 ? "B" : ""}${x > 0 ? "R" : x < 0 ? "L" : ""}`;
}

// H needs a left and a right face, T needs a front and a back face: no single
// camera shows both, so those two cases are only required to show one of them.
const SPOT_PARTLY_HIDDEN = new Set(["oll-h", "oll-t"]);

describe("spotStickers — glow targets", () => {
  const cases = [...twoLookOll.substeps, ...twoLookPll.substeps].filter(
    (s) => s.spotStickers && s.spotStickers.length > 0,
  );

  it("every OLL case and the 4 PLL cases that name stickers have spotStickers", () => {
    const ids = cases.map((s) => s.id).sort();
    expect(ids).toEqual(
      [...twoLookOll.substeps.map((s) => s.id), "pll-headlights", "pll-no-headlights", "pll-ua", "pll-ub", "pll-h", "pll-z"].sort(),
    );
  });

  cases.forEach((substep) => {
    it(`${substep.id}: each sticker is a real top-layer sticker and has a how-to-spot hint`, () => {
      expect((substep.howToSpot ?? "").length).toBeGreaterThan(0);
      const engine = applySetup(substep.initialState);
      const state = engine.getState();
      const cam = substep.cameraPosition ?? [4, 3, 4];
      const visibleFaces = new Set(["U", cam[0] > 0 ? "R" : "L", cam[2] > 0 ? "F" : "B"]);
      let visibleCount = 0;

      for (const spot of substep.spotStickers!) {
        const matches = engine
          .getStickersForCubie(cubieIdForKey(spot.piece))
          .filter((st) => state[st.face][st.row][st.col] === spot.color);
        expect(matches).toHaveLength(1);
        const st = matches[0];
        expect(st.face === "U" || st.row === 0).toBe(true);
        if (visibleFaces.has(st.face)) visibleCount++;
        else expect(SPOT_PARTLY_HIDDEN.has(substep.id)).toBe(true);
      }
      expect(visibleCount).toBeGreaterThan(0);
    });
  });
});
