"use client";

import { CubeEngine, type CubeFaces, type FaceName } from "@/lib/cubeEngine";
import { twoLookOll } from "@/data/beginner/two-look-oll";
import { twoLookPll } from "@/data/beginner/two-look-pll";

// 80×80 SVG top-face diagram
// Layout: padding=6, cellSize=20, gap=4  →  6+(20+4)×3−4+6 = 80 ✓
const S = 80;
const PAD = 6;
const CELL = 20;
const GAP = 4;
const BAR = 3.5;

const YELLOW = "#EAB308";
const GRAY = "#CBD5E1";
const SWAP_COLOR = "#DC2626";
const CYCLE_COLOR = "#2563EB";

// Side-sticker colors, mirroring FACE_COLORS in CubeScene.tsx (not imported
// here so this SVG component stays free of three.js).
const STICKER_HEX: Record<string, string> = {
  yellow: YELLOW,
  white:  "#FFFFFF",
  blue:   "#2563EB",
  green:  "#16A34A",
  red:    "#DC2626",
  orange: "#FF7A00",
};

// Grid coordinate helpers
// col 0=left(UBL/UL/UFL), 1=mid(UB/U/UF), 2=right(UBR/UR/UFR)
// row 0=back, 1=mid, 2=front
function gx(col: number) { return PAD + col * (CELL + GAP); }
function gy(row: number) { return PAD + row * (CELL + GAP); }
function gcx(col: number) { return gx(col) + CELL / 2; }
function gcy(row: number) { return gy(row) + CELL / 2; }

// Top-layer side strips, read from the engine state. Left→right (back/front)
// or back→front (left/right) as seen from above.
function sideStrips(st: CubeFaces) {
  return {
    back:  [st.B[0][2], st.B[0][1], st.B[0][0]],
    front: [st.F[0][0], st.F[0][1], st.F[0][2]],
    left:  [st.L[0][0], st.L[0][1], st.L[0][2]],
    right: [st.R[0][2], st.R[0][1], st.R[0][0]],
  };
}

// OLL diagrams are derived from the real cube state: apply the case's
// initialState in the engine, then read the top face and the four rows of
// side stickers that belong to the top layer.
interface OllDiagram {
  top: boolean[][];   // [row][col], row 0 = back, col 0 = left
  back: boolean[];    // left -> right
  front: boolean[];   // left -> right
  left: boolean[];    // back -> front
  right: boolean[];   // back -> front
}

const ollDiagramCache = new Map<string, OllDiagram | null>();

function buildOllDiagram(substepId: string): OllDiagram | null {
  if (ollDiagramCache.has(substepId)) return ollDiagramCache.get(substepId)!;
  const sub = twoLookOll.substeps.find((s) => s.id === substepId);
  if (!sub) { ollDiagramCache.set(substepId, null); return null; }

  const engine = new CubeEngine();
  engine.applyAlgorithm(sub.initialState);
  const st = engine.getState();
  const isY = (c: string) => c === "yellow";
  const edgesOnly = sub.stickerMask === "oll-edges";
  const corner = (r: number, c: number) => (r === 0 || r === 2) && (c === 0 || c === 2);
  const along = (i: number) => i === 0 || i === 2; // corner position along a side strip
  const strips = sideStrips(st);

  const diagram: OllDiagram = {
    top: [0, 1, 2].map((r) => [0, 1, 2].map((c) => isY(st.U[r][c]) && !(edgesOnly && corner(r, c)))),
    back:  strips.back.map((c, i) => isY(c) && !(edgesOnly && along(i))),
    front: strips.front.map((c, i) => isY(c) && !(edgesOnly && along(i))),
    left:  strips.left.map((c, i) => isY(c) && !(edgesOnly && along(i))),
    right: strips.right.map((c, i) => isY(c) && !(edgesOnly && along(i))),
  };
  ollDiagramCache.set(substepId, diagram);
  return diagram;
}

// PLL diagrams are also derived from the engine: the top layer's real side
// colors come from the state after initialState, and the arrows come from
// comparing where each top-layer piece sits before and after the algorithm.
interface PllArrow {
  from: [number, number]; // [row, col]
  to: [number, number];
  swap: boolean;          // two-way swap vs one-way cycle
}

interface PllDiagram {
  back: string[];         // side-sticker colors, left -> right
  front: string[];        // left -> right
  left: string[];         // back -> front
  right: string[];        // back -> front
  arrows: PllArrow[];
}

interface PieceSlot {
  pos: [number, number];
  stickers: [FaceName, number, number][];
}

const PLL_EDGE_SLOTS: PieceSlot[] = [
  { pos: [0, 1], stickers: [["U", 0, 1], ["B", 0, 1]] },
  { pos: [1, 0], stickers: [["U", 1, 0], ["L", 0, 1]] },
  { pos: [1, 2], stickers: [["U", 1, 2], ["R", 0, 1]] },
  { pos: [2, 1], stickers: [["U", 2, 1], ["F", 0, 1]] },
];

const PLL_CORNER_SLOTS: PieceSlot[] = [
  { pos: [0, 0], stickers: [["U", 0, 0], ["B", 0, 2], ["L", 0, 0]] },
  { pos: [0, 2], stickers: [["U", 0, 2], ["B", 0, 0], ["R", 0, 2]] },
  { pos: [2, 0], stickers: [["U", 2, 0], ["F", 0, 0], ["L", 0, 2]] },
  { pos: [2, 2], stickers: [["U", 2, 2], ["F", 0, 2], ["R", 0, 0]] },
];

function pieceKey(st: CubeFaces, slot: PieceSlot): string {
  return slot.stickers.map(([f, r, c]) => String(st[f][r][c])).sort().join("+");
}

/** Arrows for every piece in `slots` that changes slot between `before` and `after`. */
function pieceArrows(before: CubeFaces, after: CubeFaces, slots: PieceSlot[]): PllArrow[] {
  const dest = slots.map((slot) => {
    const key = pieceKey(before, slot);
    return slots.findIndex((d) => pieceKey(after, d) === key);
  });
  const arrows: PllArrow[] = [];
  slots.forEach((slot, i) => {
    const d = dest[i];
    if (d < 0 || d === i) return;
    if (dest[d] === i) {
      if (i < d) arrows.push({ from: slot.pos, to: slots[d].pos, swap: true });
    } else {
      arrows.push({ from: slot.pos, to: slots[d].pos, swap: false });
    }
  });
  return arrows;
}

/** Are all four corners home once the top layer is turned by some number of U moves? */
function cornersSolvedWithAuf(initialState: string): boolean {
  const solved = new CubeEngine().getState();
  for (let k = 0; k < 4; k++) {
    const engine = new CubeEngine();
    engine.applyAlgorithm(`${initialState} ${"U ".repeat(k)}`);
    const st = engine.getState();
    if (PLL_CORNER_SLOTS.every((s) => pieceKey(st, s) === pieceKey(solved, s))) return true;
  }
  return false;
}

const pllDiagramCache = new Map<string, PllDiagram | null>();

function buildPllDiagram(substepId: string): PllDiagram | null {
  if (pllDiagramCache.has(substepId)) return pllDiagramCache.get(substepId)!;
  const sub = twoLookPll.substeps.find((s) => s.id === substepId);
  if (!sub) { pllDiagramCache.set(substepId, null); return null; }

  const before = new CubeEngine();
  before.applyAlgorithm(sub.initialState);
  const after = before.clone();
  if (sub.algorithm) after.applyAlgorithm(sub.algorithm);
  const st = before.getState();

  // Corner cases move corners; once the corners are home (up to a top-layer
  // turn) the case is about edges, so only edge arrows are drawn.
  const slots = cornersSolvedWithAuf(sub.initialState) ? PLL_EDGE_SLOTS : PLL_CORNER_SLOTS;
  const hex = (c: string) => STICKER_HEX[c] ?? GRAY;
  const strips = sideStrips(st);

  const diagram: PllDiagram = {
    back:  strips.back.map((c) => hex(String(c))),
    front: strips.front.map((c) => hex(String(c))),
    left:  strips.left.map((c) => hex(String(c))),
    right: strips.right.map((c) => hex(String(c))),
    arrows: pieceArrows(st, after.getState(), slots),
  };
  pllDiagramCache.set(substepId, diagram);
  return diagram;
}

// Shrink a line segment by `d` pixels at each end (for arrowhead clearance)
function shrink(
  x1: number, y1: number, x2: number, y2: number, d: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { x1, y1, x2, y2 };
  const ux = dx / len, uy = dy / len;
  return { x1: x1 + ux * d, y1: y1 + uy * d, x2: x2 - ux * d, y2: y2 - uy * d };
}

interface Props {
  substepId: string;
  type: "oll" | "pll";
  /** Rendered size in px — viewBox always 80×80, scaled via SVG width/height. */
  size?: number;
}

function SideBars({ back, front, left, right }: { back: string[]; front: string[]; left: string[]; right: string[] }) {
  return (
    <>
      {back.map((fill, c) => (
        <rect key={`b${c}`} x={gx(c) + 2} y={1} width={CELL - 4} height={BAR} rx={1.2} fill={fill} />
      ))}
      {front.map((fill, c) => (
        <rect key={`f${c}`} x={gx(c) + 2} y={S - 1 - BAR} width={CELL - 4} height={BAR} rx={1.2} fill={fill} />
      ))}
      {left.map((fill, r) => (
        <rect key={`l${r}`} x={1} y={gy(r) + 2} width={BAR} height={CELL - 4} rx={1.2} fill={fill} />
      ))}
      {right.map((fill, r) => (
        <rect key={`r${r}`} x={S - 1 - BAR} y={gy(r) + 2} width={BAR} height={CELL - 4} rx={1.2} fill={fill} />
      ))}
    </>
  );
}

export function CaseRecognition({ substepId, type, size = 80 }: Props) {
  // OLL: top-face cells plus a thin bar per side sticker, all read from the engine state
  if (type === "oll") {
    const d = buildOllDiagram(substepId);
    if (!d) return null;
    const fill = (yellow: boolean) => (yellow ? YELLOW : GRAY);
    return (
      <svg width={size} height={size} viewBox={`0 0 ${S} ${S}`} style={{ display: "block" }}>
        {d.top.flatMap((row, r) =>
          row.map((yellow, c) => (
            <rect
              key={`${r}-${c}`}
              x={gx(c)} y={gy(r)}
              width={CELL} height={CELL}
              rx={3}
              fill={fill(yellow)}
            />
          )),
        )}
        <SideBars
          back={d.back.map(fill)}
          front={d.front.map(fill)}
          left={d.left.map(fill)}
          right={d.right.map(fill)}
        />
      </svg>
    );
  }

  // PLL: yellow top, real side colors, and arrows for the pieces that move
  const d = buildPllDiagram(substepId);
  if (!d) return null;
  const uid = substepId.replace(/[^a-z0-9]/g, ""); // safe SVG id fragment
  const hasSwap  = d.arrows.some((a) => a.swap);
  const hasCycle = d.arrows.some((a) => !a.swap);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${S} ${S}`} style={{ display: "block" }}>
      <defs>
        {hasCycle && (
          <marker id={`cyc-${uid}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L5,2.5 z" fill={CYCLE_COLOR} />
          </marker>
        )}
        {hasSwap && (
          <marker id={`swp-${uid}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto-start-reverse">
            <path d="M0,0 L0,5 L5,2.5 z" fill={SWAP_COLOR} />
          </marker>
        )}
      </defs>

      {/* All-yellow 3×3 grid */}
      {[0, 1, 2].flatMap((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={gx(c)} y={gy(r)}
            width={CELL} height={CELL}
            rx={3}
            fill={YELLOW}
          />
        )),
      )}

      {/* Actual side color of every top-layer piece */}
      <SideBars back={d.back} front={d.front} left={d.left} right={d.right} />

      {/* Arrows: current slot → destination; double-headed for swaps */}
      {d.arrows.map((arrow, i) => {
        const s = shrink(
          gcx(arrow.from[1]), gcy(arrow.from[0]),
          gcx(arrow.to[1]),   gcy(arrow.to[0]),
          arrow.swap ? 5 : 9,
        );
        return (
          <line
            key={i}
            x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke={arrow.swap ? SWAP_COLOR : CYCLE_COLOR}
            strokeWidth={1.8}
            markerEnd={`url(#${arrow.swap ? "swp" : "cyc"}-${uid})`}
            markerStart={arrow.swap ? `url(#swp-${uid})` : undefined}
          />
        );
      })}
    </svg>
  );
}
