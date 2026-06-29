/**
 * Generic case validator — run with:
 *   npx tsx src/scripts/caseValidator.ts
 *
 * Parameterised by a cases array + an "in-scope pieces" list so it can be
 * reused for cross, corners, second-layer, OLL, and PLL.
 */

import { CubeEngine } from "../lib/cubeEngine";
import type { Substep } from "../lib/tutorialTypes";
import { cross } from "../data/beginner/cross";

// ---------------------------------------------------------------------------
// Sticker slot tables (position ↔ face/row/col)
// ---------------------------------------------------------------------------

type FN = "U" | "D" | "F" | "B" | "R" | "L";

interface SlotDef {
  id: string;
  stickers: Array<{ f: FN; r: number; c: number }>;
  pos: [number, number, number];
}

const EDGE_SLOTS: SlotDef[] = [
  { id:"UF", stickers:[{f:"U",r:2,c:1},{f:"F",r:0,c:1}],           pos:[ 0, 1, 1] },
  { id:"UB", stickers:[{f:"U",r:0,c:1},{f:"B",r:0,c:1}],           pos:[ 0, 1,-1] },
  { id:"UR", stickers:[{f:"U",r:1,c:2},{f:"R",r:0,c:1}],           pos:[ 1, 1, 0] },
  { id:"UL", stickers:[{f:"U",r:1,c:0},{f:"L",r:0,c:1}],           pos:[-1, 1, 0] },
  { id:"DF", stickers:[{f:"D",r:0,c:1},{f:"F",r:2,c:1}],           pos:[ 0,-1, 1] },
  { id:"DB", stickers:[{f:"D",r:2,c:1},{f:"B",r:2,c:1}],           pos:[ 0,-1,-1] },
  { id:"DR", stickers:[{f:"D",r:1,c:2},{f:"R",r:2,c:1}],           pos:[ 1,-1, 0] },
  { id:"DL", stickers:[{f:"D",r:1,c:0},{f:"L",r:2,c:1}],           pos:[-1,-1, 0] },
  { id:"FR", stickers:[{f:"F",r:1,c:2},{f:"R",r:1,c:0}],           pos:[ 1, 0, 1] },
  { id:"FL", stickers:[{f:"F",r:1,c:0},{f:"L",r:1,c:2}],           pos:[-1, 0, 1] },
  { id:"BR", stickers:[{f:"B",r:1,c:0},{f:"R",r:1,c:2}],           pos:[ 1, 0,-1] },
  { id:"BL", stickers:[{f:"B",r:1,c:2},{f:"L",r:1,c:0}],           pos:[-1, 0,-1] },
];

const CORNER_SLOTS: SlotDef[] = [
  { id:"UFR", stickers:[{f:"U",r:2,c:2},{f:"F",r:0,c:2},{f:"R",r:0,c:0}], pos:[ 1, 1, 1] },
  { id:"UFL", stickers:[{f:"U",r:2,c:0},{f:"F",r:0,c:0},{f:"L",r:0,c:2}], pos:[-1, 1, 1] },
  { id:"UBR", stickers:[{f:"U",r:0,c:2},{f:"B",r:0,c:0},{f:"R",r:0,c:2}], pos:[ 1, 1,-1] },
  { id:"UBL", stickers:[{f:"U",r:0,c:0},{f:"B",r:0,c:2},{f:"L",r:0,c:0}], pos:[-1, 1,-1] },
  { id:"DFR", stickers:[{f:"D",r:0,c:2},{f:"F",r:2,c:2},{f:"R",r:2,c:0}], pos:[ 1,-1, 1] },
  { id:"DFL", stickers:[{f:"D",r:0,c:0},{f:"F",r:2,c:0},{f:"L",r:2,c:2}], pos:[-1,-1, 1] },
  { id:"DBR", stickers:[{f:"D",r:2,c:2},{f:"B",r:2,c:0},{f:"R",r:2,c:2}], pos:[ 1,-1,-1] },
  { id:"DBL", stickers:[{f:"D",r:2,c:0},{f:"B",r:2,c:2},{f:"L",r:2,c:0}], pos:[-1,-1,-1] },
];

const FACE_POS: Record<FN, [number, number, number]> = {
  U:[ 0, 1, 0], D:[ 0,-1, 0],
  F:[ 0, 0, 1], B:[ 0, 0,-1],
  R:[ 1, 0, 0], L:[-1, 0, 0],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function posKey(p: number[]): string { return p.join(","); }
function posEq(a: number[], b: number[]): boolean {
  return a[0]===b[0] && a[1]===b[1] && a[2]===b[2];
}

function describePos(pos: [number,number,number]): string {
  const [x,y,z] = pos;
  const layer = y===1 ? "U-layer" : y===-1 ? "D-layer" : "mid-layer";
  const xPart = x===1 ? " right(R)" : x===-1 ? " left(L)" : "";
  const zPart = z===1 ? " front(F)" : z===-1 ? " back(B)" : "";
  return `[${pos}] ${layer}${xPart}${zPart}`;
}

/** Map a visibleCubies home-position key to the sticker colors of that piece. */
function homeToColors(key: string): string[] {
  const [x,y,z] = key.split(",").map(Number);
  const out: string[] = [];
  if (x!==0) out.push(x>0 ? "red"    : "orange");
  if (y!==0) out.push(y>0 ? "yellow" : "white");
  if (z!==0) out.push(z>0 ? "blue"   : "green");
  return out;
}

/** Map piece colors back to the home-position key. */
function colorsToHomeKey(colors: string[]): string {
  let x=0, y=0, z=0;
  for (const c of colors) {
    if (c==="red")    x= 1; else if (c==="orange") x=-1;
    if (c==="yellow") y= 1; else if (c==="white")  y=-1;
    if (c==="blue")   z= 1; else if (c==="green")  z=-1;
  }
  return `${x},${y},${z}`;
}

function homeType(key: string): "center"|"edge"|"corner" {
  const n = key.split(",").map(Number).filter(v=>v!==0).length;
  return n===1 ? "center" : n===2 ? "edge" : "corner";
}

/** Find a piece by its sticker colors; returns its current 3-D position. */
function findPiece(eng: CubeEngine, colors: string[]): [number,number,number]|null {
  const s = eng.getState();
  const target = [...colors].sort().join(",");
  const table = colors.length===3 ? CORNER_SLOTS : EDGE_SLOTS;
  for (const slot of table) {
    const got = slot.stickers.map(({f,r,c})=>String(s[f][r][c])).sort().join(",");
    if (got===target) return slot.pos;
  }
  return null;
}

/** Which face is the white sticker on in the current engine state? */
function whiteStickerFace(eng: CubeEngine, colors: string[]): FN|null {
  const s = eng.getState();
  const target = [...colors].sort().join(",");
  const table = colors.length===3 ? CORNER_SLOTS : EDGE_SLOTS;
  for (const slot of table) {
    const got = slot.stickers.map(({f,r,c})=>String(s[f][r][c]));
    if ([...got].sort().join(",")!==target) continue;
    for (let i=0; i<got.length; i++) if (got[i]==="white") return slot.stickers[i].f;
  }
  return null;
}

/** Find the face whose center sticker currently shows `color`. */
function faceOfCenterColor(eng: CubeEngine, color: string): FN|null {
  const s = eng.getState();
  const faces: FN[] = ["U","D","F","B","R","L"];
  for (const f of faces) if (String(s[f][1][1])===color) return f;
  return null;
}

/** Home key of the center piece currently occupying a specific face. */
function centerHomeOnFace(eng: CubeEngine, face: FN): string {
  const s = eng.getState();
  const color = String(s[face][1][1]);
  const colorToHome: Record<string,string> = {
    yellow:"0,1,0", white:"0,-1,0", blue:"0,0,1",
    green:"0,0,-1", red:"1,0,0", orange:"-1,0,0",
  };
  return colorToHome[color] ?? "";
}

function faceForAxisVal(axis: number, val: number): FN {
  if (axis===0) return val>0 ? "R" : "L";
  if (axis===1) return val>0 ? "U" : "D";
  return val>0 ? "F" : "B";
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------

export interface ValidatorConfig {
  stepId: string;
  cases: Substep[];
  /** All piece color-sets "in scope" for the step (used by Check 2). */
  inScopePieces: string[][];
}

function result(pass: boolean, label: string, detail = ""): boolean {
  const tag = pass ? "PASS" : "FAIL";
  console.log(`    [${tag}] ${label}${detail ? `  →  ${detail}` : ""}`);
  return pass;
}

export function runValidator(cfg: ValidatorConfig): void {
  console.log(`\n${"═".repeat(80)}`);
  console.log(`CASE VALIDATOR  step=${cfg.stepId}  cases=${cfg.cases.length}`);
  console.log("═".repeat(80));

  let totalFail = 0;

  for (const sub of cfg.cases) {
    console.log(`\n▶ ${sub.id} — "${sub.title}"`);
    console.log(`  initialState="${sub.initialState}"  algorithm="${sub.algorithm ?? ""}"`);
    let caseFail = 0;

    const engInit = new CubeEngine();
    engInit.applyAlgorithm(sub.initialState);

    const engAfter = new CubeEngine();
    engAfter.applyAlgorithm(sub.initialState);
    if (sub.algorithm) engAfter.applyAlgorithm(sub.algorithm);

    const visKeys = new Set(sub.visibleCubies ?? []);
    const movableKeys = [...visKeys].filter(k => homeType(k) !== "center");
    const centerKeys  = [...visKeys].filter(k => homeType(k) === "center");

    interface PieceInfo {
      key: string; colors: string[];
      initPos: [number,number,number]|null;
      solvedPos: [number,number,number]|null;
    }
    const pieces: PieceInfo[] = movableKeys.map(key => ({
      key, colors: homeToColors(key),
      initPos:   findPiece(engInit,  homeToColors(key)),
      solvedPos: findPiece(engAfter, homeToColors(key)),
    }));

    // -------------------------------------------------------------------
    // CHECK 1 — highlighted pieces actually move (not already solved)
    // A piece counts as "moving" if its slot changes OR — for a piece that
    // stays in its home slot — its white sticker's facing flips (a real,
    // valid case: an edge correctly placed but oriented wrong).
    // -------------------------------------------------------------------
    console.log("\n  CHECK 1 — highlighted pieces actually move");
    for (const pc of pieces) {
      if (!pc.initPos || !pc.solvedPos) {
        if (!result(false, `${pc.key}`, "findPiece returned null")) caseFail++;
        continue;
      }
      const samePos = posEq(pc.initPos, pc.solvedPos);
      const flippedInPlace = samePos && whiteStickerFace(engInit, pc.colors) !== whiteStickerFace(engAfter, pc.colors);
      const moves = !samePos || flippedInPlace;
      if (!result(moves,
        `${pc.key} (${pc.colors.join("+")})`,
        !samePos
          ? `${describePos(pc.initPos)} → ${describePos(pc.solvedPos)}`
          : flippedInPlace
            ? `flipped in place at ${describePos(pc.solvedPos)} (white sticker ${whiteStickerFace(engInit, pc.colors)} → ${whiteStickerFace(engAfter, pc.colors)})`
            : `ALREADY at solved slot ${describePos(pc.solvedPos)} — should NOT be highlighted`
      )) caseFail++;
    }

    // -------------------------------------------------------------------
    // CHECK 2 — every displaced in-scope piece is highlighted
    // -------------------------------------------------------------------
    console.log("\n  CHECK 2 — displaced in-scope pieces are highlighted");
    for (const scopeColors of cfg.inScopePieces) {
      const initPos   = findPiece(engInit,  scopeColors);
      const solvedPos = findPiece(engAfter, scopeColors);
      if (!initPos || !solvedPos) continue;
      const samePos = posEq(initPos, solvedPos);
      const flippedInPlace = samePos && whiteStickerFace(engInit, scopeColors) !== whiteStickerFace(engAfter, scopeColors);
      if (samePos && !flippedInPlace) continue; // not displaced

      const homeKey = colorsToHomeKey(scopeColors);
      const highlighted = visKeys.has(homeKey);
      if (!result(highlighted,
        `${scopeColors.join("+")} displaced`,
        highlighted
          ? `highlighted as "${homeKey}"`
          : `at ${describePos(initPos)}, solved=${describePos(solvedPos)}, but home="${homeKey}" NOT in visibleCubies`
      )) caseFail++;
    }

    // -------------------------------------------------------------------
    // CHECK 3 — highlighted centers are relevant; destination centers present
    // -------------------------------------------------------------------
    console.log("\n  CHECK 3 — face centers match highlighted pieces");

    // 3a: every highlighted center must be touched by a highlighted piece
    for (const ck of centerKeys) {
      const centerColor = homeToColors(ck)[0];
      const face = faceOfCenterColor(engInit, centerColor);
      if (!face) { if (!result(false, `center ${ck}`, "can't resolve current face")) caseFail++; continue; }
      const cp = FACE_POS[face];
      const axis = cp[0]!==0 ? 0 : cp[1]!==0 ? 1 : 2;
      const sign = cp[axis];
      const relevant = pieces.some(pc =>
        (pc.initPos   && pc.initPos[axis]   === sign) ||
        (pc.solvedPos && pc.solvedPos[axis] === sign)
      );
      if (!result(relevant,
        `center ${ck} (${centerColor}, currently face=${face})`,
        relevant ? "touched by a highlighted piece" : `IRRELEVANT — no highlighted piece passes face ${face}`
      )) caseFail++;
    }

    // 3b: for each highlighted piece, its destination non-y face center must be highlighted
    for (const pc of pieces) {
      if (!pc.solvedPos) continue;
      const [sx,, sz] = pc.solvedPos;
      for (const [axis, val] of [[0,sx],[2,sz]] as [number,number][]) {
        if (val===0) continue;
        const face = faceForAxisVal(axis, val);
        const homeKey = centerHomeOnFace(engInit, face);
        if (!homeKey) continue;
        const present = visKeys.has(homeKey);
        if (!result(present,
          `destination-face center ${homeKey} for ${pc.key}`,
          present ? `present (face=${face})` : `MISSING — ${pc.key} ends at ${describePos(pc.solvedPos)} but face-${face} center "${homeKey}" not in visibleCubies`
        )) caseFail++;
      }
    }

    // -------------------------------------------------------------------
    // CHECK 4 — arrow origins match actual piece positions after initialState
    // -------------------------------------------------------------------
    console.log("\n  CHECK 4 — arrow origins match piece positions after initialState");
    const arrows = sub.arrows ?? [];
    if (arrows.length===0) { console.log("    (no arrows)"); }
    for (const arrow of arrows) {
      const from = arrow.from as [number,number,number];
      const match = pieces.find(pc => pc.initPos && posEq(pc.initPos, from));
      if (!result(!!match,
        `arrow from [${posKey(from)}]`,
        match
          ? `matches ${match.key} (${match.colors.join("+")}) at ${describePos(match.initPos!)}`
          : `NO highlighted piece at [${posKey(from)}] — actual positions: ${pieces.map(pc=>`${pc.key}=[${posKey(pc.initPos??[])}]`).join(", ")}`
      )) caseFail++;
    }

    // -------------------------------------------------------------------
    // CHECK 5 — HUMAN-CHECK: surface ground truth for description review
    // -------------------------------------------------------------------
    console.log("\n  CHECK 5 — HUMAN-CHECK (verify description text matches)");
    for (const pc of pieces) {
      if (!pc.initPos) continue;
      const wf = whiteStickerFace(engInit, pc.colors);
      console.log(`    ${pc.key} (${pc.colors.join("+")}):`);
      console.log(`      position  : ${describePos(pc.initPos)}`);
      console.log(`      white face: ${wf ?? "N/A"} (${wf ? { U:"up",D:"down",F:"front",B:"back",R:"right",L:"left" }[wf] : ""})`);
    }
    console.log(`    description: "${sub.explanation}"`);

    console.log(caseFail>0
      ? `\n  ✗ ${caseFail} FAILURE(S)\n`
      : `\n  ✓ all checks PASS\n`);
    totalFail += caseFail;
  }

  console.log("═".repeat(80));
  console.log(totalFail===0 ? "OVERALL: ✓ ALL PASS" : `OVERALL: ✗ ${totalFail} FAILURE(S)`);
  console.log("═".repeat(80));
}

// ---------------------------------------------------------------------------
// Cross entry point
// ---------------------------------------------------------------------------
runValidator({
  stepId: "white-cross",
  cases: cross.substeps,
  inScopePieces: [
    ["white","red"],
    ["white","green"],
    ["white","blue"],
    ["white","orange"],
  ],
});
