"use client";

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Cubie, type FaceColorKey } from "./Cubie";
import { useCubeStore, cubeEngine } from "@/stores/cubeStore";
import type { CubeFaces } from "@/lib/cubeEngine";

type Vec3 = [number, number, number];

const COLOR_HEX: Record<string, string> = {
  yellow: "#EAB308",
  white:  "#FFFFFF",
  blue:   "#2563EB",
  green:  "#16A34A",
  red:    "#DC2626",
  orange: "#EA580C",
};

// 26 visible cubie positions — all (x,y,z) combos in {-1,0,1}³ except (0,0,0)
const CUBIE_POSITIONS: Vec3[] = [];
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      if (x === 0 && y === 0 && z === 0) continue;
      CUBIE_POSITIONS.push([x, y, z]);
    }
  }
}

/**
 * Compute the sticker color hex values for one cubie at world position [x,y,z].
 * Only populates keys for faces that are actually visible (outer faces only).
 */
function computeFaceColors(
  faces: CubeFaces,
  x: number,
  y: number,
  z: number,
): Partial<Record<FaceColorKey, string>> {
  const c: Partial<Record<FaceColorKey, string>> = {};
  if (x ===  1) c["0_1"]  = COLOR_HEX[faces.R[1 - y][1 - z]];
  if (x === -1) c["0_-1"] = COLOR_HEX[faces.L[1 - y][z + 1]];
  if (y ===  1) c["1_1"]  = COLOR_HEX[faces.U[z + 1][x + 1]];
  if (y === -1) c["1_-1"] = COLOR_HEX[faces.D[1 - z][x + 1]];
  if (z ===  1) c["2_1"]  = COLOR_HEX[faces.F[1 - y][x + 1]];
  if (z === -1) c["2_-1"] = COLOR_HEX[faces.B[1 - y][1 - x]];
  return c;
}

interface CubeSceneProps {
  interactive: boolean;
  /** Optional override: if provided, uses this state instead of the store. */
  cubeState?: CubeFaces;
  /** Cubie IDs to highlight, e.g. ["UFR", "UF"]. */
  highlightedCubies?: string[];
  /** Called once when the Canvas is fully mounted. */
  onReady?: () => void;
}

export function CubeScene({ interactive, cubeState, highlightedCubies, onReady }: CubeSceneProps) {
  const storeFaces      = useCubeStore((s) => s.faces);
  const storeHighlights = useCubeStore((s) => s.highlights);

  const faces      = cubeState         ?? storeFaces;
  const highlights = highlightedCubies ?? storeHighlights;
  const hasHighlight = highlights.length > 0;

  // Resolve highlighted cubie IDs → world positions (Set of "x,y,z" strings for O(1) lookup)
  const highlightedPositions = useMemo(() => {
    if (!hasHighlight) return new Set<string>();
    const set = new Set<string>();
    for (const id of highlights) {
      const pos = cubeEngine.getCubieWorldPosition(id);
      if (pos) set.add(pos.join(","));
    }
    return set;
  }, [highlights, hasHighlight]);

  return (
    <Canvas
      camera={{ position: [4, 3, 4], fov: 42, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      onCreated={() => onReady?.()}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 8, 5]} intensity={1.1} />
      <directionalLight position={[-4, -2, -3]} intensity={0.25} />

      <group>
        {CUBIE_POSITIONS.map(([x, y, z]) => {
          const posKey = `${x},${y},${z}`;
          const isHighlighted = highlightedPositions.has(posKey);
          const isDimmed = hasHighlight && !isHighlighted;
          return (
            <Cubie
              key={posKey}
              position={[x, y, z]}
              faceColors={computeFaceColors(faces, x, y, z)}
              highlighted={isHighlighted}
              dimmed={isDimmed}
            />
          );
        })}
      </group>

      {interactive && (
        <OrbitControls
          enableZoom
          minDistance={3.5}
          maxDistance={8}
          enablePan={false}
          enableDamping
          dampingFactor={0.07}
        />
      )}
    </Canvas>
  );
}
