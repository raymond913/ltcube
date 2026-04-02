import { describe, it, expect } from "vitest";
import { CubeEngine, parseAlgorithm, invertAlgorithm } from "../cubeEngine";
import { generateScramble } from "../scrambleGenerator";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function freshEngine() {
  return new CubeEngine();
}

// ---------------------------------------------------------------------------
// isSolved
// ---------------------------------------------------------------------------

describe("isSolved", () => {
  it("returns true for a fresh cube", () => {
    expect(freshEngine().isSolved()).toBe(true);
  });

  it("returns false after a single move", () => {
    const e = freshEngine();
    e.applyAlgorithm("R");
    expect(e.isSolved()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Basic move inverses
// ---------------------------------------------------------------------------

describe("move inverses", () => {
  it("R then R' returns to solved", () => {
    const e = freshEngine();
    e.applyAlgorithm("R R'");
    expect(e.isSolved()).toBe(true);
  });

  it("R four times returns to solved", () => {
    const e = freshEngine();
    e.applyAlgorithm("R R R R");
    expect(e.isSolved()).toBe(true);
  });

  it("U then U' returns to solved", () => {
    const e = freshEngine();
    e.applyAlgorithm("U U'");
    expect(e.isSolved()).toBe(true);
  });

  it("F then F' returns to solved", () => {
    const e = freshEngine();
    e.applyAlgorithm("F F'");
    expect(e.isSolved()).toBe(true);
  });

  it("L then L' returns to solved", () => {
    const e = freshEngine();
    e.applyAlgorithm("L L'");
    expect(e.isSolved()).toBe(true);
  });

  it("D then D' returns to solved", () => {
    const e = freshEngine();
    e.applyAlgorithm("D D'");
    expect(e.isSolved()).toBe(true);
  });

  it("B then B' returns to solved", () => {
    const e = freshEngine();
    e.applyAlgorithm("B B'");
    expect(e.isSolved()).toBe(true);
  });

  it("R2 twice returns to solved", () => {
    const e = freshEngine();
    e.applyAlgorithm("R2 R2");
    expect(e.isSolved()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Sexy move cycle
// ---------------------------------------------------------------------------

describe("sexy move cycle", () => {
  it("R U R' U' applied 6 times returns to solved", () => {
    const e = freshEngine();
    for (let i = 0; i < 6; i++) {
      e.applyAlgorithm("R U R' U'");
    }
    expect(e.isSolved()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Scramble + inverse scramble
// ---------------------------------------------------------------------------

describe("scramble inverse", () => {
  it("scramble then inverse scramble returns to solved", () => {
    const scramble = "R U2 F' B L2 D R' U F2 L D2 B' R2 U' F L' D' B2 R U";
    const inverse = invertAlgorithm(scramble);
    const e = freshEngine();
    e.applyAlgorithm(scramble);
    expect(e.isSolved()).toBe(false);
    e.applyAlgorithm(inverse);
    expect(e.isSolved()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// parseAlgorithm
// ---------------------------------------------------------------------------

describe("parseAlgorithm", () => {
  it("parses single moves", () => {
    const moves = parseAlgorithm("R U F");
    expect(moves).toHaveLength(3);
    expect(moves[0]).toMatchObject({ face: "R", inverse: false, double: false });
    expect(moves[1]).toMatchObject({ face: "U", inverse: false, double: false });
    expect(moves[2]).toMatchObject({ face: "F", inverse: false, double: false });
  });

  it("parses prime (inverse) moves", () => {
    const moves = parseAlgorithm("R' U' F'");
    expect(moves[0]).toMatchObject({ face: "R", inverse: true, double: false });
    expect(moves[1]).toMatchObject({ face: "U", inverse: true, double: false });
  });

  it("parses double moves", () => {
    const moves = parseAlgorithm("R2 U2");
    expect(moves[0]).toMatchObject({ face: "R", inverse: false, double: true });
    expect(moves[1]).toMatchObject({ face: "U", inverse: false, double: true });
  });

  it("parses wide moves (lowercase)", () => {
    const moves = parseAlgorithm("r u f");
    expect(moves[0]).toMatchObject({ face: "R", wide: true, rotation: false });
    expect(moves[1]).toMatchObject({ face: "U", wide: true });
    expect(moves[2]).toMatchObject({ face: "F", wide: true });
  });

  it("parses rotation moves x y z", () => {
    const moves = parseAlgorithm("x y z x'");
    expect(moves[0]).toMatchObject({ face: "x", rotation: true, inverse: false });
    expect(moves[3]).toMatchObject({ face: "x", rotation: true, inverse: true });
  });

  it("handles curly apostrophe as prime", () => {
    const moves = parseAlgorithm("R\u2019 U\u2019");
    expect(moves[0]).toMatchObject({ face: "R", inverse: true });
    expect(moves[1]).toMatchObject({ face: "U", inverse: true });
  });

  it("returns empty array for empty string", () => {
    expect(parseAlgorithm("")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// invertAlgorithm
// ---------------------------------------------------------------------------

describe("invertAlgorithm", () => {
  it("reverses and inverts each move", () => {
    expect(invertAlgorithm("R U F")).toBe("F' U' R'");
  });

  it("double stays double", () => {
    expect(invertAlgorithm("R2")).toBe("R2");
  });
});

// ---------------------------------------------------------------------------
// Scramble generator
// ---------------------------------------------------------------------------

describe("generateScramble", () => {
  it("produces the correct number of moves", () => {
    const scramble = generateScramble(20);
    const tokens = scramble.trim().split(/\s+/);
    expect(tokens).toHaveLength(20);
  });

  it("produces only valid move tokens", () => {
    const valid = new Set(["R", "R'", "R2", "L", "L'", "L2", "U", "U'", "U2", "D", "D'", "D2", "F", "F'", "F2", "B", "B'", "B2"]);
    const scramble = generateScramble(20);
    for (const token of scramble.split(" ")) {
      expect(valid.has(token)).toBe(true);
    }
  });

  it("has no consecutive same-face moves", () => {
    const scramble = generateScramble(20);
    const tokens = scramble.split(" ");
    for (let i = 1; i < tokens.length; i++) {
      expect(tokens[i][0]).not.toBe(tokens[i - 1][0]);
    }
  });

  it("respects custom length", () => {
    expect(generateScramble(10).split(" ")).toHaveLength(10);
    expect(generateScramble(5).split(" ")).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// clone / getState / setState
// ---------------------------------------------------------------------------

describe("clone and setState", () => {
  it("clone produces an independent copy", () => {
    const e = freshEngine();
    e.applyAlgorithm("R U");
    const copy = e.clone();
    copy.applyAlgorithm("F");
    // original should not be affected
    const stateAfterRU = e.getState();
    const stateAfterRUF = copy.getState();
    expect(stateAfterRU).not.toEqual(stateAfterRUF);
  });

  it("setState loads a specific state", () => {
    const e = freshEngine();
    e.applyAlgorithm("R U F");
    const saved = e.getState();
    const e2 = freshEngine();
    e2.setState(saved);
    expect(e2.getState()).toEqual(saved);
    expect(e2.isSolved()).toBe(false);
  });

  it("reset returns to solved", () => {
    const e = freshEngine();
    e.applyAlgorithm("R U F B L D");
    expect(e.isSolved()).toBe(false);
    e.reset();
    expect(e.isSolved()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getStickersForCubie
// ---------------------------------------------------------------------------

describe("getStickersForCubie", () => {
  it("UFR corner has 3 stickers in solved state", () => {
    const e = freshEngine();
    const stickers = e.getStickersForCubie("UFR");
    expect(stickers).toHaveLength(3);
  });

  it("UF edge has 2 stickers in solved state", () => {
    const e = freshEngine();
    const stickers = e.getStickersForCubie("UF");
    expect(stickers).toHaveLength(2);
  });

  it("U center has 1 sticker in solved state", () => {
    const e = freshEngine();
    const stickers = e.getStickersForCubie("U");
    expect(stickers).toHaveLength(1);
  });
});

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
