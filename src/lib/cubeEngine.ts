// CubeEngine — pure TypeScript, no React dependencies
// Faces: U=Yellow, D=White, F=Blue, B=Green, R=Red, L=Orange

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Color = "yellow" | "white" | "blue" | "green" | "red" | "orange";

export type FaceName = "U" | "D" | "F" | "B" | "R" | "L";

/** A 3×3 face: [row][col], row 0 = top, col 0 = left when looking at the face straight-on. */
export type Face = [[Color, Color, Color], [Color, Color, Color], [Color, Color, Color]];

/** Full cube state: one Face per face name. */
export type CubeFaces = Record<FaceName, Face>;

/** Parallel structure tracking which cubie each sticker belongs to. */
export type CubieGrid = Record<FaceName, [[string, string, string], [string, string, string], [string, string, string]]>;

export interface Move {
  notation: string;  // original token, e.g. "R", "r", "x"
  face: string;      // base face / axis letter
  inverse: boolean;
  double: boolean;
  wide: boolean;     // lowercase wide moves
  rotation: boolean; // x y z
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FACE_ORDER: FaceName[] = ["U", "D", "F", "B", "R", "L"];

const SOLVED_COLORS: Record<FaceName, Color> = {
  U: "yellow",
  D: "white",
  F: "blue",
  B: "green",
  R: "red",
  L: "orange",
};

/**
 * Cubie ID layout per face in solved position.
 * Row-major, [row][col], reading each face straight-on.
 *
 * Face orientation (looking at face from outside):
 *   U: back-left→back-right top row, front-left→front-right bottom row
 *   D: front-left→front-right top row, back-left→back-right bottom row
 *   F: top-left→top-right, bottom-left→bottom-right
 *   B: mirrored horizontally (looking from back)
 *   R: looking from right
 *   L: looking from left
 *
 * Standard cubie IDs use WCA face notation: corners=3 letters, edges=2 letters, centers=1 letter.
 */
const SOLVED_CUBIE_IDS: CubieGrid = {
  U: [
    ["UBL", "UB", "UBR"],
    ["UL",  "U",  "UR"],
    ["UFL", "UF", "UFR"],
  ],
  D: [
    ["DFL", "DF", "DFR"],
    ["DL",  "D",  "DR"],
    ["DBL", "DB", "DBR"],
  ],
  F: [
    ["UFL", "UF", "UFR"],
    ["FL",  "F",  "FR"],
    ["DFL", "DF", "DFR"],
  ],
  B: [
    ["UBR", "UB", "UBL"],
    ["BR",  "B",  "BL"],
    ["DBR", "DB", "DBL"],
  ],
  R: [
    ["UFR", "UR", "UBR"],
    ["FR",  "R",  "BR"],
    ["DFR", "DR", "DBR"],
  ],
  L: [
    ["UBL", "UL", "UFL"],
    ["BL",  "L",  "FL"],
    ["DBL", "DL", "DFL"],
  ],
};

// ---------------------------------------------------------------------------
// Face / sticker rotation helpers
// ---------------------------------------------------------------------------

/** Rotate a 3×3 face 90° clockwise. */
function rotateFaceCW<T>(face: [[T, T, T], [T, T, T], [T, T, T]]): [[T, T, T], [T, T, T], [T, T, T]] {
  return [
    [face[2][0], face[1][0], face[0][0]],
    [face[2][1], face[1][1], face[0][1]],
    [face[2][2], face[1][2], face[0][2]],
  ];
}

/** Rotate a 3×3 face 90° counter-clockwise. */
function rotateFaceCCW<T>(face: [[T, T, T], [T, T, T], [T, T, T]]): [[T, T, T], [T, T, T], [T, T, T]] {
  return rotateFaceCW(rotateFaceCW(rotateFaceCW(face)));
}

function cloneFace<T>(face: [[T, T, T], [T, T, T], [T, T, T]]): [[T, T, T], [T, T, T], [T, T, T]] {
  return [
    [face[0][0], face[0][1], face[0][2]],
    [face[1][0], face[1][1], face[1][2]],
    [face[2][0], face[2][1], face[2][2]],
  ];
}

// ---------------------------------------------------------------------------
// Sticker cycling helpers
// Each move cycles 4 strips of 3 stickers around a face.
// We represent each strip as an array of [face, row, col] triples.
// ---------------------------------------------------------------------------

type Sticker = [FaceName, number, number];

function getStickers(state: CubeFaces, strip: Sticker[]): Color[] {
  return strip.map(([f, r, c]) => state[f][r][c]);
}

function getCubieStickers(grid: CubieGrid, strip: Sticker[]): string[] {
  return strip.map(([f, r, c]) => grid[f][r][c]);
}

function setStickers(state: CubeFaces, strip: Sticker[], values: Color[]): void {
  strip.forEach(([f, r, c], i) => { state[f][r][c] = values[i]; });
}

function setCubieStickers(grid: CubieGrid, strip: Sticker[], values: string[]): void {
  strip.forEach(([f, r, c], i) => { grid[f][r][c] = values[i]; });
}

/**
 * Cycle 4 strips of stickers: strip[0] → strip[1] → strip[2] → strip[3] → strip[0].
 * For an inverse move, pass strips in reverse order before calling (handled by callers).
 */
function cycleStrips(state: CubeFaces, grid: CubieGrid, strips: Sticker[][], times: number): void {
  for (let t = 0; t < times; t++) {
    const saved = getStickers(state, strips[0]);
    const savedCubie = getCubieStickers(grid, strips[0]);
    for (let i = 0; i < 3; i++) {
      setStickers(state, strips[i], getStickers(state, strips[i + 1]));
      setCubieStickers(grid, strips[i], getCubieStickers(grid, strips[i + 1]));
    }
    setStickers(state, strips[3], saved);
    setCubieStickers(grid, strips[3], savedCubie);
  }
}

// ---------------------------------------------------------------------------
// Move definitions — adjacent strips for each face (CW direction)
// For CW rotation: strip[0] ← strip[1] ← strip[2] ← strip[3] ← strip[0]
// i.e. we cycle strips 3→2→1→0→3 so strip[0] gets strip[3]'s old values
// ---------------------------------------------------------------------------

// The strips are listed so that one CW application moves:
//   strip[0] ← strip[1], strip[1] ← strip[2], strip[2] ← strip[3], strip[3] ← strip[0]

const MOVE_STRIPS: Record<string, Sticker[][]> = {
  // U face CW: F-top → L-top → B-top → R-top (viewed from above)
  U: [
    [["F", 0, 0], ["F", 0, 1], ["F", 0, 2]],
    [["R", 0, 0], ["R", 0, 1], ["R", 0, 2]],
    [["B", 0, 0], ["B", 0, 1], ["B", 0, 2]],
    [["L", 0, 0], ["L", 0, 1], ["L", 0, 2]],
  ],
  // D face CW (viewed from below): F-bottom → R-bottom → B-bottom → L-bottom
  D: [
    [["F", 2, 0], ["F", 2, 1], ["F", 2, 2]],
    [["L", 2, 0], ["L", 2, 1], ["L", 2, 2]],
    [["B", 2, 0], ["B", 2, 1], ["B", 2, 2]],
    [["R", 2, 0], ["R", 2, 1], ["R", 2, 2]],
  ],
  // F face CW (viewed from front): U-bottom → R-left-col → D-top(rev) → L-right-col(rev)
  F: [
    [["U", 2, 0], ["U", 2, 1], ["U", 2, 2]],
    [["R", 0, 0], ["R", 1, 0], ["R", 2, 0]],
    [["D", 0, 2], ["D", 0, 1], ["D", 0, 0]],
    [["L", 2, 2], ["L", 1, 2], ["L", 0, 2]],
  ],
  // B face CW (viewed from back): U-top(rev) → L-left-col → D-bottom → R-right-col(rev)
  B: [
    [["U", 0, 2], ["U", 0, 1], ["U", 0, 0]],
    [["L", 0, 0], ["L", 1, 0], ["L", 2, 0]],
    [["D", 2, 0], ["D", 2, 1], ["D", 2, 2]],
    [["R", 2, 2], ["R", 1, 2], ["R", 0, 2]],
  ],
  // R face CW (viewed from right): U-right-col → B-left-col(rev) → D-right-col → F-right-col
  R: [
    [["U", 0, 2], ["U", 1, 2], ["U", 2, 2]],
    [["F", 0, 2], ["F", 1, 2], ["F", 2, 2]],
    [["D", 2, 2], ["D", 1, 2], ["D", 0, 2]],
    [["B", 2, 0], ["B", 1, 0], ["B", 0, 0]],
  ],
  // L face CW (viewed from left): U-left-col → F-left-col(rev) → D-left-col → B-right-col
  L: [
    [["U", 2, 0], ["U", 1, 0], ["U", 0, 0]],
    [["B", 0, 2], ["B", 1, 2], ["B", 2, 2]],
    [["D", 0, 0], ["D", 1, 0], ["D", 2, 0]],
    [["F", 2, 0], ["F", 1, 0], ["F", 0, 0]],
  ],
};

// ---------------------------------------------------------------------------
// Solved state factory
// ---------------------------------------------------------------------------

function makeSolvedFaces(): CubeFaces {
  const faces = {} as CubeFaces;
  for (const f of FACE_ORDER) {
    const color = SOLVED_COLORS[f];
    faces[f] = [
      [color, color, color],
      [color, color, color],
      [color, color, color],
    ];
  }
  return faces;
}

function makeSolvedCubieGrid(): CubieGrid {
  const grid = {} as CubieGrid;
  for (const f of FACE_ORDER) {
    grid[f] = cloneFace(SOLVED_CUBIE_IDS[f]) as CubieGrid[FaceName];
  }
  return grid;
}

// ---------------------------------------------------------------------------
// Algorithm parser
// ---------------------------------------------------------------------------

const WIDE_TO_FACE: Record<string, FaceName> = {
  r: "R", l: "L", u: "U", d: "D", f: "F", b: "B",
};

const ROTATION_AXES: Set<string> = new Set(["x", "y", "z"]);

/**
 * Parse an algorithm string into an array of Move objects.
 * Handles: R R' R2 r r' r2 x x' x2, parentheses (ignored as grouping),
 * both ' (U+2019) and ' (U+0027) as prime characters.
 */
export function parseAlgorithm(alg: string): Move[] {
  // Normalize fancy apostrophes (U+2018, U+2019, U+02BC) to plain ASCII apostrophe
  const normalized = alg.replace(/[\u2018\u2019\u02BC]/g, "'");

  // Tokenize: extract move tokens
  const tokens = normalized.match(/[RLUDFBMESrludfbxyz][w]?['2]?/g) ?? [];

  return tokens.map((token) => {
    const inverse = token.includes("'");
    const double = token.includes("2");
    const baseLetter = token[0];
    const isWide = baseLetter === baseLetter.toLowerCase() && !ROTATION_AXES.has(baseLetter);
    const isRotation = ROTATION_AXES.has(baseLetter);

    let face: string;
    if (isRotation) {
      face = baseLetter; // x, y, z
    } else if (isWide) {
      face = WIDE_TO_FACE[baseLetter] ?? baseLetter.toUpperCase();
    } else {
      face = baseLetter.toUpperCase();
    }

    return { notation: token, face, inverse, double, wide: isWide, rotation: isRotation };
  });
}

// ---------------------------------------------------------------------------
// Inverse algorithm
// ---------------------------------------------------------------------------

export function invertAlgorithm(alg: string): string {
  const moves = parseAlgorithm(alg);
  return moves
    .reverse()
    .map((m) => {
      const base = m.notation.replace(/['2]/g, "");
      if (m.double) return base + "2";
      if (m.inverse) return base;
      return base + "'";
    })
    .join(" ");
}

// ---------------------------------------------------------------------------
// CubeEngine class
// ---------------------------------------------------------------------------

export class CubeEngine {
  private faces: CubeFaces;
  private cubies: CubieGrid;

  constructor() {
    this.faces = makeSolvedFaces();
    this.cubies = makeSolvedCubieGrid();
  }

  // ---- State access --------------------------------------------------------

  getState(): CubeFaces {
    return this.cloneFaces(this.faces);
  }

  setState(state: CubeFaces): void {
    this.faces = this.cloneFaces(state);
    // Rebuild cubie grid from scratch — not tracked across arbitrary setState calls
    this.cubies = makeSolvedCubieGrid();
  }

  reset(): void {
    this.faces = makeSolvedFaces();
    this.cubies = makeSolvedCubieGrid();
  }

  clone(): CubeEngine {
    const engine = new CubeEngine();
    engine.faces = this.cloneFaces(this.faces);
    engine.cubies = this.cloneCubieGrid(this.cubies);
    return engine;
  }

  isSolved(): boolean {
    for (const f of FACE_ORDER) {
      const color = SOLVED_COLORS[f];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (this.faces[f][r][c] !== color) return false;
        }
      }
    }
    return true;
  }

  /**
   * Returns { face, row, col } for each sticker belonging to the given cubie ID.
   * Useful for highlighting a piece in the 3D viewer.
   */
  getStickersForCubie(cubieId: string): Array<{ face: FaceName; row: number; col: number }> {
    const result: Array<{ face: FaceName; row: number; col: number }> = [];
    for (const f of FACE_ORDER) {
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (this.cubies[f][r][c] === cubieId) {
            result.push({ face: f, row: r, col: c });
          }
        }
      }
    }
    return result;
  }

  /**
   * Returns the current 3D world position [x, y, z] of the cubie with the given ID.
   * Derived by reverse-mapping the first sticker's face/row/col back to 3D space.
   * Returns null if the cubie ID is not found.
   */
  getCubieWorldPosition(cubieId: string): [number, number, number] | null {
    const stickers = this.getStickersForCubie(cubieId);
    if (stickers.length === 0) return null;
    let x = 0, y = 0, z = 0;
    for (const { face } of stickers) {
      if (face === "U") y = +1;
      else if (face === "D") y = -1;
      else if (face === "F") z = +1;
      else if (face === "B") z = -1;
      else if (face === "R") x = +1;
      else if (face === "L") x = -1;
    }
    return [x, y, z];
  }

  // ---- Move application ---------------------------------------------------

  applyMove(move: Move): void {
    if (move.rotation) {
      this.applyRotation(move);
      return;
    }

    if (move.face === "M" || move.face === "E" || move.face === "S") {
      const slice = move.face as "M" | "E" | "S";
      if (move.double) {
        this.applyMiddleSliceRaw(slice, false);
        this.applyMiddleSliceRaw(slice, false);
      } else {
        this.applyMiddleSliceRaw(slice, move.inverse);
      }
      return;
    }

    const faceName = move.face as FaceName;
    const strips = MOVE_STRIPS[faceName];
    if (!strips) return;

    const times = move.double ? 2 : 1;

    if (move.inverse) {
      // CCW = 3× CW
      cycleStrips(this.faces, this.cubies, strips, 3 * times);
      for (let t = 0; t < times; t++) {
        this.faces[faceName] = rotateFaceCCW(this.faces[faceName]);
        this.cubies[faceName] = rotateFaceCCW(this.cubies[faceName]);
      }
    } else {
      cycleStrips(this.faces, this.cubies, strips, times);
      for (let t = 0; t < times; t++) {
        this.faces[faceName] = rotateFaceCW(this.faces[faceName]);
        this.cubies[faceName] = rotateFaceCW(this.cubies[faceName]);
      }
    }

    // Wide moves also move the middle slice
    if (move.wide) {
      this.applyMiddleSlice(move);
    }
  }

  applyMoveString(notation: string): void {
    const moves = parseAlgorithm(notation);
    for (const m of moves) this.applyMove(m);
  }

  applyAlgorithm(alg: string): void {
    this.applyMoveString(alg);
  }

  // ---- Whole-cube rotations ------------------------------------------------

  private applyRotation(move: Move): void {
    const times = move.double ? 2 : 1;
    const inverse = move.inverse;
    for (let t = 0; t < times; t++) {
      switch (move.face) {
        case "x": this.rotateX(inverse); break;
        case "y": this.rotateY(inverse); break;
        case "z": this.rotateZ(inverse); break;
      }
    }
  }

  // x rotation: R face turns CW, whole cube rotates around R axis
  private rotateX(inverse: boolean): void {
    if (!inverse) {
      // x = R + middle-M-inverse + L-inverse
      this.applyMoveString("R");
      this.applyMiddleSliceRaw("M", true); // M'
      this.applyMoveString("L'");
    } else {
      this.applyMoveString("R'");
      this.applyMiddleSliceRaw("M", false); // M
      this.applyMoveString("L");
    }
  }

  // y rotation: U face turns CW, whole cube rotates around U axis
  private rotateY(inverse: boolean): void {
    if (!inverse) {
      this.applyMoveString("U");
      this.applyMiddleSliceRaw("E", true); // E'
      this.applyMoveString("D'");
    } else {
      this.applyMoveString("U'");
      this.applyMiddleSliceRaw("E", false); // E
      this.applyMoveString("D");
    }
  }

  // z rotation: F face turns CW, whole cube rotates around F axis
  private rotateZ(inverse: boolean): void {
    if (!inverse) {
      this.applyMoveString("F");
      this.applyMiddleSliceRaw("S", false); // S
      this.applyMoveString("B'");
    } else {
      this.applyMoveString("F'");
      this.applyMiddleSliceRaw("S", true); // S'
      this.applyMoveString("B");
    }
  }

  // ---- Middle slice moves --------------------------------------------------

  // M slice strips (between L and R): same direction as L
  private static M_STRIPS: Sticker[][] = [
    [["U", 2, 1], ["U", 1, 1], ["U", 0, 1]],
    [["B", 0, 1], ["B", 1, 1], ["B", 2, 1]],
    [["D", 0, 1], ["D", 1, 1], ["D", 2, 1]],
    [["F", 2, 1], ["F", 1, 1], ["F", 0, 1]],
  ];

  // E slice strips (between U and D): same direction as D
  private static E_STRIPS: Sticker[][] = [
    [["F", 1, 0], ["F", 1, 1], ["F", 1, 2]],
    [["L", 1, 0], ["L", 1, 1], ["L", 1, 2]],
    [["B", 1, 0], ["B", 1, 1], ["B", 1, 2]],
    [["R", 1, 0], ["R", 1, 1], ["R", 1, 2]],
  ];

  // S slice strips (between F and B): same direction as F
  private static S_STRIPS: Sticker[][] = [
    [["U", 1, 0], ["U", 1, 1], ["U", 1, 2]],
    [["R", 0, 1], ["R", 1, 1], ["R", 2, 1]],
    [["D", 1, 2], ["D", 1, 1], ["D", 1, 0]],
    [["L", 2, 1], ["L", 1, 1], ["L", 0, 1]],
  ];

  private applyMiddleSliceRaw(slice: "M" | "E" | "S", inverse: boolean): void {
    const stripsMap = { M: CubeEngine.M_STRIPS, E: CubeEngine.E_STRIPS, S: CubeEngine.S_STRIPS };
    const strips = stripsMap[slice];
    const times = inverse ? 3 : 1;
    cycleStrips(this.faces, this.cubies, strips, times);
  }

  private applyMiddleSlice(move: Move): void {
    // Wide moves: r = R + M', l = L + M, u = U + E', d = D + E, f = F + S, b = B + S'
    const sliceMap: Record<string, { slice: "M" | "E" | "S"; defaultInverse: boolean }> = {
      R: { slice: "M", defaultInverse: true },
      L: { slice: "M", defaultInverse: false },
      U: { slice: "E", defaultInverse: true },
      D: { slice: "E", defaultInverse: false },
      F: { slice: "S", defaultInverse: false },
      B: { slice: "S", defaultInverse: true },
    };
    const config = sliceMap[move.face];
    if (!config) return;
    // XOR: if the move is inverse, flip the slice direction
    const sliceInverse = move.inverse ? !config.defaultInverse : config.defaultInverse;
    const times = move.double ? 2 : 1;
    for (let t = 0; t < times; t++) {
      this.applyMiddleSliceRaw(config.slice, sliceInverse);
    }
  }

  // ---- Clone helpers -------------------------------------------------------

  private cloneFaces(src: CubeFaces): CubeFaces {
    const out = {} as CubeFaces;
    for (const f of FACE_ORDER) {
      out[f] = cloneFace(src[f]);
    }
    return out;
  }

  private cloneCubieGrid(src: CubieGrid): CubieGrid {
    const out = {} as CubieGrid;
    for (const f of FACE_ORDER) {
      out[f] = cloneFace(src[f]) as CubieGrid[FaceName];
    }
    return out;
  }
}

// ---------------------------------------------------------------------------
// Re-export types from cubeUtils for backwards compat
// ---------------------------------------------------------------------------

export type { Move as CubeMove };
