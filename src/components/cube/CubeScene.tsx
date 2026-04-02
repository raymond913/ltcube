"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { flushSync } from "react-dom";
import gsap from "gsap";
import * as THREE from "three";
import { Cubie, type FaceColorKey } from "./Cubie";
import {
  useCubeStore,
  cubeEngine,
  registerAnimationHandler,
  unregisterAnimationHandler,
  commitAnimatedMove,
} from "@/stores/cubeStore";
import { parseAlgorithm } from "@/lib/cubeEngine";
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

const FACE_ANIM: Record<string, { axisIndex: 0 | 1 | 2; cwAngle: number }> = {
  R: { axisIndex: 0, cwAngle: -Math.PI / 2 },
  L: { axisIndex: 0, cwAngle:  Math.PI / 2 },
  U: { axisIndex: 1, cwAngle: -Math.PI / 2 },
  D: { axisIndex: 1, cwAngle:  Math.PI / 2 },
  // F and B use +Z/-Z axis. The engine's F/B strip cycle direction is CCW
  // when viewed from the front, so the animation angle is the mirror of R/L/U/D.
  F: { axisIndex: 2, cwAngle:  Math.PI / 2 },
  B: { axisIndex: 2, cwAngle: -Math.PI / 2 },
};

function isInFace(face: string | undefined, x: number, y: number, z: number): boolean {
  switch (face) {
    case "R": return x === 1;
    case "L": return x === -1;
    case "U": return y === 1;
    case "D": return y === -1;
    case "F": return z === 1;
    case "B": return z === -1;
    default:  return false;
  }
}

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

interface CurrentAnim {
  face: string;
  axisIndex: 0 | 1 | 2;
  targetAngle: number;
}

interface CubeSceneProps {
  interactive: boolean;
  cubeState?: CubeFaces;
  highlightedCubies?: string[];
  onReady?: () => void;
}

function AnimatedScene({ interactive, cubeState, highlightedCubies }: CubeSceneProps) {
  const storeFaces      = useCubeStore((s) => s.faces);
  const storeHighlights = useCubeStore((s) => s.highlights);

  const highlights   = highlightedCubies ?? storeHighlights;
  const hasHighlight = highlights.length > 0;

  // frozenFacesRef holds the face colors that should be rendered.
  //
  // Using a plain ref (not useState) is the key to preventing the F/B snap.
  // useState values are subject to React's batching and useSyncExternalStore's
  // forced synchronous re-renders — their final value in any given render
  // depends on React's internal scheduling. A ref is read synchronously at
  // render time and always reflects exactly what we last wrote to it.
  //
  // isAnimatingRef gates whether we use the frozen ref or live storeFaces:
  //   idle:       faces = storeFaces (Zustand drives colors normally)
  //   animating:  faces = frozenFacesRef.current (immune to Zustand re-renders)
  const frozenFacesRef = useRef<CubeFaces>(storeFaces);
  const isAnimatingRef = useRef(false);

  const [currentAnim, setCurrentAnim] = useState<CurrentAnim | null>(null);

  // When idle, keep frozenFacesRef in sync so the next freeze captures
  // up-to-date state (e.g. after a reset or instant applyAlgorithm).
  if (!isAnimatingRef.current) {
    frozenFacesRef.current = storeFaces;
  }

  const faces = cubeState ?? (isAnimatingRef.current ? frozenFacesRef.current : storeFaces);

  const pivotRef = useRef<THREE.Group>(null);

  const highlightedPositions = useMemo(() => {
    if (!hasHighlight) return new Set<string>();
    const set = new Set<string>();
    for (const id of highlights) {
      const pos = cubeEngine.getCubieWorldPosition(id);
      if (pos) set.add(pos.join(","));
    }
    return set;
  }, [highlights, hasHighlight]);

  useEffect(() => {
    const handler = (move: string, durationMs: number): Promise<void> => {
      return new Promise((resolve) => {
        const parsed  = parseAlgorithm(move)[0];
        const animDef = parsed ? FACE_ANIM[parsed.face] : undefined;

        if (!parsed || !animDef) {
          commitAnimatedMove(move);
          resolve();
          return;
        }

        let targetAngle = animDef.cwAngle;
        if (parsed.inverse) targetAngle *= -1;
        if (parsed.double)  targetAngle *= 2;

        // Freeze the ref to the pre-move snapshot and mark animating.
        // From this point, Zustand re-renders read frozenFacesRef.current
        // instead of storeFaces — immune to useSyncExternalStore firing.
        frozenFacesRef.current = useCubeStore.getState().faces;
        isAnimatingRef.current = true;
        flushSync(() => {
          setCurrentAnim({ face: parsed.face, axisIndex: animDef.axisIndex, targetAngle });
        });

        const pivot = pivotRef.current;
        if (!pivot) {
          commitAnimatedMove(move);
          resolve();
          return;
        }

        const axisKeys = ["x", "y", "z"] as const;
        const axisKey  = axisKeys[animDef.axisIndex];

        gsap.to(pivot.rotation, {
          [axisKey]: targetAngle,
          duration: durationMs / 1000,
          ease: "power2.inOut",
          onComplete: () => {
            // Step 1: Apply the move to the engine and read post-move faces.
            // We do NOT update Zustand yet — that would trigger a sync re-render
            // while currentAnim is still set, causing the color snap.
            cubeEngine.applyMoveString(move);
            const newFaces = cubeEngine.getState();

            // Step 2: Write post-move colors into the ref, then clear the
            // animation — one React commit. The ref is read synchronously during
            // this render, so cubies get new colors at their final positions
            // with no intermediate frame showing old colors.
            frozenFacesRef.current = newFaces;
            flushSync(() => {
              setCurrentAnim(null);
            });
            // Animation is done — idle reads will go back to storeFaces.
            isAnimatingRef.current = false;

            // Step 3: Pivot is now empty — reset is invisible.
            pivot.rotation.set(0, 0, 0);

            // Step 4: Bring Zustand in sync. frozenFacesRef.current === newFaces,
            // and isAnimatingRef is false, so the next Zustand re-render will
            // read storeFaces which now matches — no visual change.
            useCubeStore.setState({ faces: newFaces });

            resolve();
          },
        });
      });
    };

    registerAnimationHandler(handler);
    return () => unregisterAnimationHandler();
  }, []);

  const renderCubie = ([x, y, z]: Vec3) => {
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
  };

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 8, 5]} intensity={1.1} />
      <directionalLight position={[-4, -2, -3]} intensity={0.25} />

      {/* 17 non-rotating cubies */}
      <group>
        {CUBIE_POSITIONS
          .filter(([x, y, z]) => !isInFace(currentAnim?.face, x, y, z))
          .map(renderCubie)}
      </group>

      {/* Pivot group — holds the 9 face cubies during a rotation */}
      <group ref={pivotRef}>
        {CUBIE_POSITIONS
          .filter(([x, y, z]) => isInFace(currentAnim?.face, x, y, z))
          .map(renderCubie)}
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
    </>
  );
}

export function CubeScene({ interactive, cubeState, highlightedCubies, onReady }: CubeSceneProps) {
  return (
    <Canvas
      camera={{ position: [4, 3, 4], fov: 42, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      onCreated={() => onReady?.()}
    >
      <AnimatedScene
        interactive={interactive}
        cubeState={cubeState}
        highlightedCubies={highlightedCubies}
      />
    </Canvas>
  );
}
