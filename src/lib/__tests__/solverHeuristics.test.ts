import { describe, it, expect } from "vitest";
import { CubeEngine } from "../cubeEngine";
import type { CubeFaces } from "../cubeEngine";
import {
  isCrossSolved,
  areCornersSolved,
  isF2LSolved,
  isOLLSolved,
  isPLLSolved,
  detectStage,
} from "../solverHeuristics";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function solved(): CubeFaces {
  return new CubeEngine().getState();
}

function deepClone(f: CubeFaces): CubeFaces {
  return JSON.parse(JSON.stringify(f));
}

/**
 * Build a faces object that is fully solved but with specific overrides applied.
 * Overrides are arrays of [face, row, col, color].
 */
function withOverrides(
  overrides: [keyof CubeFaces, number, number, CubeFaces["U"][0][0]][],
): CubeFaces {
  const f = deepClone(solved());
  for (const [face, row, col, color] of overrides) {
    f[face][row][col] = color;
  }
  return f;
}

// ---------------------------------------------------------------------------
// isPLLSolved — fully solved check
// ---------------------------------------------------------------------------

describe("isPLLSolved", () => {
  it("returns true for solved cube (complete)", () => {
    expect(isPLLSolved(solved())).toBe(true);
  });

  it("returns false when one sticker is wrong", () => {
    // Swap UF and UR side stickers — cube orientation is off, not solved
    const f = withOverrides([
      ["F", 0, 1, "red"],
      ["R", 0, 1, "blue"],
    ]);
    expect(isPLLSolved(f)).toBe(false);
  });

  it("matches CubeEngine.isSolved for fresh engine", () => {
    const e = new CubeEngine();
    expect(isPLLSolved(e.getState())).toBe(e.isSolved());
  });

  it("returns false after D move", () => {
    const e = new CubeEngine();
    e.applyAlgorithm("D");
    expect(isPLLSolved(e.getState())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isOLLSolved — F2L done + U face all yellow
// ---------------------------------------------------------------------------

describe("isOLLSolved", () => {
  it("returns true for solved cube", () => {
    expect(isOLLSolved(solved())).toBe(true);
  });

  it("returns false when U face has a non-yellow sticker", () => {
    // Break U face only — F2L is still intact
    const f = withOverrides([["U", 0, 0, "blue"]]);
    expect(isOLLSolved(f)).toBe(false);
  });

  it("returns false when F2L is broken (even if U is all yellow)", () => {
    // Break a middle edge — OLL can't be true without F2L
    const f = withOverrides([
      ["F", 1, 2, "orange"],
      ["R", 1, 0, "blue"],
    ]);
    expect(isOLLSolved(f)).toBe(false);
  });

  it("returns true after U (F2L intact, U face still all yellow) — ready for PLL", () => {
    // U only rotates yellows within U face — OLL stays solved
    const e = new CubeEngine();
    e.applyAlgorithm("U");
    expect(isOLLSolved(e.getState())).toBe(true);
    expect(isPLLSolved(e.getState())).toBe(false);
  });

  it("detectStage returns 4 after U (OLL done, PLL not)", () => {
    const e = new CubeEngine();
    e.applyAlgorithm("U");
    expect(detectStage(e.getState())).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// isF2LSolved — first two layers done
// ---------------------------------------------------------------------------

describe("isF2LSolved", () => {
  it("returns true for solved cube", () => {
    expect(isF2LSolved(solved())).toBe(true);
  });

  it("returns false when a middle edge is wrong", () => {
    // FL edge (F[1][0]=blue, L[1][2]=orange in solved) — swap them
    const f = withOverrides([
      ["F", 1, 0, "orange"],
      ["L", 1, 2, "blue"],
    ]);
    expect(isF2LSolved(f)).toBe(false);
  });

  it("returns false when cross is broken", () => {
    const f = withOverrides([["D", 0, 1, "yellow"]]);
    expect(isF2LSolved(f)).toBe(false);
  });

  it("returns true when only U face is broken", () => {
    // Changing a U face sticker doesn't affect F2L
    const f = withOverrides([["U", 0, 0, "blue"]]);
    expect(isF2LSolved(f)).toBe(true);
  });

  it("detectStage returns 3 when F2L done but U face not all yellow — ready for OLL", () => {
    const f = withOverrides([["U", 0, 0, "blue"]]);
    expect(detectStage(f)).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// areCornersSolved — first layer complete (cross + 4 corners)
// ---------------------------------------------------------------------------

describe("areCornersSolved", () => {
  it("returns true for solved cube", () => {
    expect(areCornersSolved(solved())).toBe(true);
  });

  it("returns false when a D corner is wrong", () => {
    // DFR corner: D[0][2]=white, F[2][2]=blue, R[2][0]=red in solved
    // Flip the D sticker of DFR to yellow
    const f = withOverrides([["D", 0, 2, "yellow"]]);
    expect(areCornersSolved(f)).toBe(false);
  });

  it("returns false when cross is broken (dependency)", () => {
    const f = withOverrides([["D", 0, 1, "yellow"]]);
    expect(areCornersSolved(f)).toBe(false);
  });

  it("returns true when only a middle edge is wrong", () => {
    const f = withOverrides([
      ["F", 1, 0, "orange"],
      ["L", 1, 2, "blue"],
    ]);
    expect(areCornersSolved(f)).toBe(true);
  });

  it("detectStage returns 2 when corners done but F2L not — ready for second layer", () => {
    const f = withOverrides([
      ["F", 1, 0, "orange"],
      ["L", 1, 2, "blue"],
    ]);
    expect(detectStage(f)).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// isCrossSolved — white cross on D face
// ---------------------------------------------------------------------------

describe("isCrossSolved", () => {
  it("returns true for solved cube", () => {
    expect(isCrossSolved(solved())).toBe(true);
  });

  it("returns false when a D edge is wrong color", () => {
    // DF edge: D[0][1] should be white
    const f = withOverrides([["D", 0, 1, "yellow"]]);
    expect(isCrossSolved(f)).toBe(false);
  });

  it("returns false when F side of DF edge is wrong", () => {
    // F[2][1] should be blue
    const f = withOverrides([["F", 2, 1, "red"]]);
    expect(isCrossSolved(f)).toBe(false);
  });

  it("returns false when R side of DR edge is wrong", () => {
    const f = withOverrides([["R", 2, 1, "green"]]);
    expect(isCrossSolved(f)).toBe(false);
  });

  it("returns true when only a D corner is wrong", () => {
    // D corners don't affect cross check
    const f = withOverrides([["D", 0, 2, "yellow"]]);
    expect(isCrossSolved(f)).toBe(true);
  });

  it("detectStage returns 1 when cross done but corners not — ready for first-layer-corners", () => {
    // Break a D corner without touching D edges
    const f = withOverrides([["D", 0, 2, "yellow"]]);
    expect(detectStage(f)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// detectStage — full stage ladder
// ---------------------------------------------------------------------------

describe("detectStage", () => {
  it("returns 5 for solved cube (complete)", () => {
    expect(detectStage(solved())).toBe(5);
  });

  it("returns 4 when OLL is done but PLL is not", () => {
    // Swap two U-layer side stickers: UF↔UR (U face stays all yellow, F2L intact)
    const f = withOverrides([
      ["F", 0, 1, "red"],   // UF edge F-side: was blue
      ["R", 0, 1, "blue"],  // UR edge R-side: was red
    ]);
    expect(detectStage(f)).toBe(4);
  });

  it("returns 3 when F2L is done but OLL is not", () => {
    const f = withOverrides([["U", 1, 1, "blue"]]);
    expect(detectStage(f)).toBe(3);
  });

  it("returns 2 when corners are done but F2L is not", () => {
    // Break FR middle edge
    const f = withOverrides([
      ["F", 1, 2, "orange"],
      ["R", 1, 0, "blue"],
    ]);
    expect(detectStage(f)).toBe(2);
  });

  it("returns 1 when cross is done but corners are not", () => {
    const f = withOverrides([["D", 0, 0, "yellow"]]);
    expect(detectStage(f)).toBe(1);
  });

  it("returns 0 when cross is not done", () => {
    const f = withOverrides([["D", 0, 1, "yellow"]]);
    expect(detectStage(f)).toBe(0);
  });

  it("returns 0 for a fully scrambled cube", () => {
    const e = new CubeEngine();
    e.applyAlgorithm("R U2 F' B L2 D R' U F2 L D2 B' R2 U' F L' D' B2 R U");
    expect(detectStage(e.getState())).toBe(0);
  });

  it("returns 5 after applying a scramble then its inverse", () => {
    const e = new CubeEngine();
    e.applyAlgorithm("R U2 F' B L2 D R' U F2 L D2 B' R2 U' F L' D' B2 R U");
    e.applyAlgorithm("U' R' B2 D L F' U R2 B D2 L' F2 U' R D' L2 B' F U2 R'");
    expect(detectStage(e.getState())).toBe(5);
  });

  it("is monotonically consistent — higher stages imply lower stages pass", () => {
    // OLL done (stage 4) implies all lower checks pass
    const f = withOverrides([
      ["F", 0, 1, "red"],
      ["R", 0, 1, "blue"],
    ]);
    expect(isCrossSolved(f)).toBe(true);
    expect(areCornersSolved(f)).toBe(true);
    expect(isF2LSolved(f)).toBe(true);
    expect(isOLLSolved(f)).toBe(true);
    expect(isPLLSolved(f)).toBe(false);
  });
});
