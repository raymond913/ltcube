"use client";

// 80×80 SVG top-face diagram
// Layout: padding=6, cellSize=20, gap=4  →  6+(20+4)×3−4+6 = 80 ✓
const S = 80;
const PAD = 6;
const CELL = 20;
const GAP = 4;

const YELLOW = "#EAB308";
const GRAY = "#CBD5E1";
const SWAP_COLOR = "#DC2626";
const CYCLE_COLOR = "#2563EB";

// Grid coordinate helpers
// col 0=left(UBL/UL/UFL), 1=mid(UB/U/UF), 2=right(UBR/UR/UFR)
// row 0=back, 1=mid, 2=front
function gx(col: number) { return PAD + col * (CELL + GAP); }
function gy(row: number) { return PAD + row * (CELL + GAP); }
function gcx(col: number) { return gx(col) + CELL / 2; }
function gcy(row: number) { return gy(row) + CELL / 2; }

// OLL: [row][col] = true means that sticker faces yellow up
// Row 0 = back (UBL, UB, UBR)
// Row 1 = mid  (UL,  U,  UR)
// Row 2 = front(UFL, UF, UFR)
const Y = true, N = false;
const OLL_PATTERNS: Record<string, boolean[][]> = {
  "oll-dot":      [[N,N,N],[N,Y,N],[N,N,N]],
  "oll-l-shape":  [[N,N,N],[N,Y,Y],[N,Y,N]], // center + UR + UF
  "oll-line":     [[N,N,N],[Y,Y,Y],[N,N,N]], // center + UL + UR
  "oll-h":        [[N,Y,N],[Y,Y,Y],[N,Y,N]], // cross only
  "oll-sune":     [[N,Y,N],[Y,Y,Y],[N,Y,Y]], // cross + UFR
  "oll-antisune": [[N,Y,N],[Y,Y,Y],[Y,Y,N]], // cross + UFL (mirror of sune)
  "oll-pi":       [[Y,Y,Y],[Y,Y,Y],[N,Y,N]], // cross + UBL + UBR
  "oll-u":        [[N,Y,Y],[Y,Y,Y],[Y,Y,N]], // cross + UBR + UFL diagonal
  "oll-t":        [[Y,Y,N],[Y,Y,Y],[N,Y,Y]], // cross + UBL + UFR diagonal
  "oll-l":        [[N,Y,N],[Y,Y,Y],[Y,Y,Y]], // cross + UFL + UFR (front pair)
};

// PLL arrows: from/to in [row, col] grid coordinates
interface ArrowDef {
  from: [number, number];
  to: [number, number];
  swap?: boolean; // two-way swap vs one-way cycle
}

const PLL_ARROWS: Record<string, ArrowDef[]> = {
  "pll-adj":  [{ from: [0, 2], to: [2, 2], swap: true }],
  "pll-diag": [{ from: [0, 0], to: [2, 2], swap: true }],
  "pll-ua":   [
    { from: [2, 1], to: [1, 0] },
    { from: [1, 0], to: [1, 2] },
    { from: [1, 2], to: [2, 1] },
  ],
  "pll-ub":   [
    { from: [2, 1], to: [1, 2] },
    { from: [1, 2], to: [1, 0] },
    { from: [1, 0], to: [2, 1] },
  ],
  "pll-h": [
    { from: [0, 1], to: [2, 1], swap: true },
    { from: [1, 0], to: [1, 2], swap: true },
  ],
  "pll-z": [
    { from: [2, 1], to: [1, 2], swap: true },
    { from: [0, 1], to: [1, 0], swap: true },
  ],
};

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

// Perpendicular unit vector scaled by `amount`
function perpOffset(x1: number, y1: number, x2: number, y2: number, amount: number) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return { px: 0, py: 0 };
  return { px: -dy / len * amount, py: dx / len * amount };
}

interface Props {
  substepId: string;
  type: "oll" | "pll";
  /** Rendered size in px — viewBox always 80×80, scaled via SVG width/height. */
  size?: number;
}

export function CaseRecognition({ substepId, type, size = 80 }: Props) {
  // OLL: color cells yellow or gray based on the pattern
  if (type === "oll") {
    const pattern = OLL_PATTERNS[substepId];
    if (!pattern) return null;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${S} ${S}`} style={{ display: "block" }}>
        {pattern.flatMap((row, r) =>
          row.map((yellow, c) => (
            <rect
              key={`${r}-${c}`}
              x={gx(c)} y={gy(r)}
              width={CELL} height={CELL}
              rx={3}
              fill={yellow ? YELLOW : GRAY}
            />
          )),
        )}
      </svg>
    );
  }

  // PLL: all-yellow cells + directional arrows
  const arrows = PLL_ARROWS[substepId] ?? [];
  const uid = substepId.replace(/[^a-z0-9]/g, ""); // safe SVG id fragment
  const hasSwap  = arrows.some((a) => a.swap);
  const hasCycle = arrows.some((a) => !a.swap);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${S} ${S}`} style={{ display: "block" }}>
      <defs>
        {hasCycle && (
          <marker id={`cyc-${uid}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <path d="M0,0 L0,5 L5,2.5 z" fill={CYCLE_COLOR} />
          </marker>
        )}
        {hasSwap && (
          <marker id={`swp-${uid}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
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

      {/* Arrows overlaid on top */}
      {arrows.map((arrow, i) => {
        const ax = gcx(arrow.from[1]), ay = gcy(arrow.from[0]);
        const bx = gcx(arrow.to[1]),   by = gcy(arrow.to[0]);

        if (arrow.swap) {
          // Draw two parallel one-way arrows offset perpendicularly
          const { px, py } = perpOffset(ax, ay, bx, by, 3.5);
          // Arrow 1: from → to, offset +perp
          const s1 = shrink(ax + px, ay + py, bx + px, by + py, 9);
          // Arrow 2: to → from, offset −perp
          const s2 = shrink(bx - px, by - py, ax - px, ay - py, 9);
          return (
            <g key={i}>
              <line
                x1={s1.x1} y1={s1.y1} x2={s1.x2} y2={s1.y2}
                stroke={SWAP_COLOR} strokeWidth={1.8}
                markerEnd={`url(#swp-${uid})`}
              />
              <line
                x1={s2.x1} y1={s2.y1} x2={s2.x2} y2={s2.y2}
                stroke={SWAP_COLOR} strokeWidth={1.8}
                markerEnd={`url(#swp-${uid})`}
              />
            </g>
          );
        }

        // One-way cycle arrow
        const s = shrink(ax, ay, bx, by, 9);
        return (
          <line
            key={i}
            x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke={CYCLE_COLOR} strokeWidth={1.8}
            markerEnd={`url(#cyc-${uid})`}
          />
        );
      })}
    </svg>
  );
}
