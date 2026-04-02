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
