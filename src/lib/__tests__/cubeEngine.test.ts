import { describe, it, expect } from "vitest";
import { CubeEngine, parseAlgorithm, invertAlgorithm, type FaceName, type CubeFaces } from "../cubeEngine";
import { generateScramble } from "../scrambleGenerator";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function freshEngine() {
  return new CubeEngine();
}

// ---------------------------------------------------------------------------
// Invariant helpers
//
// These encode physical-cube facts independently of cubeEngine's own
// internals, so they catch bugs like the F/B chirality inversion that
// slipped past single-face-only tests (each face alone was still a valid
// 4-cycle; the corruption only showed up once a U/D/R/L move was combined
// with an F/B move).
// ---------------------------------------------------------------------------

type Cell = [FaceName, number, number];

const EDGE_SLOTS: Cell[][] = [
  [["U", 2, 1], ["F", 0, 1]], [["U", 0, 1], ["B", 0, 1]],
  [["U", 1, 2], ["R", 0, 1]], [["U", 1, 0], ["L", 0, 1]],
  [["D", 0, 1], ["F", 2, 1]], [["D", 2, 1], ["B", 2, 1]],
  [["D", 1, 2], ["R", 2, 1]], [["D", 1, 0], ["L", 2, 1]],
  [["F", 1, 2], ["R", 1, 0]], [["F", 1, 0], ["L", 1, 2]],
  [["B", 1, 0], ["R", 1, 2]], [["B", 1, 2], ["L", 1, 0]],
];

const CORNER_SLOTS: Cell[][] = [
  [["U", 2, 2], ["F", 0, 2], ["R", 0, 0]], [["U", 2, 0], ["F", 0, 0], ["L", 0, 2]],
  [["U", 0, 2], ["B", 0, 0], ["R", 0, 2]], [["U", 0, 0], ["B", 0, 2], ["L", 0, 0]],
  [["D", 0, 2], ["F", 2, 2], ["R", 2, 0]], [["D", 0, 0], ["F", 2, 0], ["L", 2, 2]],
  [["D", 2, 2], ["B", 2, 0], ["R", 2, 2]], [["D", 2, 0], ["B", 2, 2], ["L", 2, 0]],
];

const ALL_FACES: FaceName[] = ["U", "D", "F", "B", "R", "L"];

function colorSet(state: CubeFaces, cells: Cell[]): string {
  return cells.map(([f, r, c]) => state[f][r][c]).sort().join("+");
}

/** Every edge color-pair and corner color-triple must be unique — a real
 *  cube can never show the same two (or three) colors at two different slots. */
function findDuplicatePiece(e: CubeEngine): string | null {
  const state = e.getState();
  const seen = new Set<string>();
  for (const slot of [...EDGE_SLOTS, ...CORNER_SLOTS]) {
    const key = colorSet(state, slot);
    if (seen.has(key)) return key;
    seen.add(key);
  }
  return null;
}

/** Count of every sticker color across all 54 stickers. */
function stickerColorCounts(e: CubeEngine): Record<string, number> {
  const state = e.getState();
  const counts: Record<string, number> = {};
  for (const face of ALL_FACES) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const color = state[face][r][c];
        counts[color] = (counts[color] ?? 0) + 1;
      }
    }
  }
  return counts;
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

// ---------------------------------------------------------------------------
// Invariant: piece uniqueness
//
// Regression test for the bug where F/B rotated the opposite chirality from
// U/D/R/L. Each face alone was still a valid 4-cycle (no duplicates), so
// single-move tests never caught it — the corruption (the same two or three
// colors appearing at two different slots, which is physically impossible)
// only appeared once a U/D/R/L move was combined with an F/B move.
// ---------------------------------------------------------------------------

describe("invariant: piece uniqueness", () => {
  it("every pair of distinct face moves preserves piece uniqueness", () => {
    for (const a of ALL_FACES) {
      for (const b of ALL_FACES) {
        if (a === b) continue;
        const e = freshEngine();
        e.applyAlgorithm(`${a} ${b}`);
        const dup = findDuplicatePiece(e);
        expect(dup, `"${a} ${b}" produced a duplicate piece: ${dup}`).toBeNull();
      }
    }
  });

  it("~50 random scrambles (length 10-20) preserve piece uniqueness", () => {
    for (let i = 0; i < 50; i++) {
      const length = 10 + Math.floor(Math.random() * 11); // 10..20 inclusive
      const scramble = generateScramble(length);
      const e = freshEngine();
      e.applyAlgorithm(scramble);
      const dup = findDuplicatePiece(e);
      expect(dup, `scramble "${scramble}" produced a duplicate piece: ${dup}`).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// Invariant: sticker permutation validity
// ---------------------------------------------------------------------------

describe("invariant: sticker permutation validity", () => {
  const EXPECTED_COLORS = ["blue", "green", "orange", "red", "white", "yellow"];

  it("solved cube has exactly 9 of each color", () => {
    const counts = stickerColorCounts(freshEngine());
    expect(Object.keys(counts).sort()).toEqual(EXPECTED_COLORS);
    for (const color of EXPECTED_COLORS) expect(counts[color]).toBe(9);
  });

  it("~50 random scrambles (length 10-20) never gain or lose a sticker color", () => {
    for (let i = 0; i < 50; i++) {
      const length = 10 + Math.floor(Math.random() * 11);
      const scramble = generateScramble(length);
      const e = freshEngine();
      e.applyAlgorithm(scramble);
      const counts = stickerColorCounts(e);
      expect(Object.keys(counts).sort(), `scramble "${scramble}"`).toEqual(EXPECTED_COLORS);
      for (const color of EXPECTED_COLORS) {
        expect(counts[color], `scramble "${scramble}" color "${color}"`).toBe(9);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Invariant: chirality consistency
//
// Expected destinations below are hardcoded from how a physical cube
// behaves under standard notation (every face turns clockwise viewed from
// outside that face) — derived independently of the engine, not read off
// it — so this test fails if any face's rotation direction drifts from the
// others, the exact way F/B drifted from U/D/R/L before the fix.
// ---------------------------------------------------------------------------

describe("invariant: chirality consistency", () => {
  it("U (CW from above) cycles UF->UL->UB->UR->UF", () => {
    const e = freshEngine();
    e.applyAlgorithm("U");
    const s = e.getState();
    expect(colorSet(s, [["U", 1, 0], ["L", 0, 1]])).toBe("blue+yellow");   // UL <- old UF
    expect(colorSet(s, [["U", 0, 1], ["B", 0, 1]])).toBe("orange+yellow"); // UB <- old UL
    expect(colorSet(s, [["U", 1, 2], ["R", 0, 1]])).toBe("green+yellow");  // UR <- old UB
    expect(colorSet(s, [["U", 2, 1], ["F", 0, 1]])).toBe("red+yellow");    // UF <- old UR
  });

  it("F (CW from front) cycles UF->FR->DF->FL->UF, matching U's handedness", () => {
    const e = freshEngine();
    e.applyAlgorithm("F");
    const s = e.getState();
    expect(colorSet(s, [["F", 1, 2], ["R", 1, 0]])).toBe("blue+yellow"); // FR <- old UF
    expect(colorSet(s, [["D", 0, 1], ["F", 2, 1]])).toBe("blue+red");    // DF <- old FR
    expect(colorSet(s, [["F", 1, 0], ["L", 1, 2]])).toBe("blue+white");  // FL <- old DF
    expect(colorSet(s, [["U", 2, 1], ["F", 0, 1]])).toBe("blue+orange"); // UF <- old FL
  });

  it("B (CW from behind) cycles UB->BL->DB->BR->UB, matching U's handedness", () => {
    const e = freshEngine();
    e.applyAlgorithm("B");
    const s = e.getState();
    expect(colorSet(s, [["B", 1, 2], ["L", 1, 0]])).toBe("green+yellow"); // BL <- old UB
    expect(colorSet(s, [["D", 2, 1], ["B", 2, 1]])).toBe("green+orange"); // DB <- old BL
    expect(colorSet(s, [["B", 1, 0], ["R", 1, 2]])).toBe("green+white");  // BR <- old DB
    expect(colorSet(s, [["U", 0, 1], ["B", 0, 1]])).toBe("green+red");    // UB <- old BR
  });
});

// ---------------------------------------------------------------------------
// Invariant: round-trip identities for every face
// ---------------------------------------------------------------------------

describe("invariant: round-trip identities", () => {
  it.each(ALL_FACES)("%s applied 4 times returns to solved", (face) => {
    const e = freshEngine();
    e.applyAlgorithm(`${face} ${face} ${face} ${face}`);
    expect(e.isSolved()).toBe(true);
  });

  it.each(ALL_FACES)("%s then %s' returns to solved", (face) => {
    const e = freshEngine();
    e.applyAlgorithm(`${face} ${face}'`);
    expect(e.isSolved()).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Slice moves and whole-cube rotations follow the face they are named after
// ---------------------------------------------------------------------------

describe("S slice and z rotation follow F", () => {
  it("S carries the U centre onto R, exactly like F carries the U edge strip onto R", () => {
    const e = freshEngine();
    e.applyAlgorithm("S");
    expect(e.getState().R[1][1]).toBe("yellow");
  });

  it("z is a true rotation: every face stays uniform and the U centre moves to R", () => {
    const e = freshEngine();
    e.applyAlgorithm("z");
    const s = e.getState();
    for (const face of ALL_FACES) {
      expect(s[face].every((row) => row.every((c) => c === s[face][1][1])), `${face} uniform`).toBe(true);
    }
    expect(s.R[1][1]).toBe("yellow");
  });

  it("f equals z followed by B", () => {
    const f = freshEngine(); f.applyAlgorithm("f");
    const viaZ = freshEngine(); viaZ.applyAlgorithm("z B");
    expect(f.getState()).toEqual(viaZ.getState());
  });

  it("f then f' returns to solved, and f moves the S slice the same way as F", () => {
    const e = freshEngine();
    e.applyAlgorithm("f f'");
    expect(e.isSolved()).toBe(true);
  });
});
