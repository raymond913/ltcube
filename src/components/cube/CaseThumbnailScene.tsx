"use client";

import { useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { parseAlgorithm } from "@/lib/cubeEngine";
import {
  CUBIE_POSITIONS,
  createCubieGroup,
  applyMoveInstant,
  snapCubiesToGrid,
  applyAppearance,
} from "./CubeScene";

interface Props {
  size: number;
  initialState: string;
  visibleCubies?: string[];
}

function ThumbnailInner({ initialState, visibleCubies }: Omit<Props, "size">) {
  const { scene, invalidate } = useThree();
  const visibleKey = visibleCubies?.join(",") ?? "";

  useEffect(() => {
    const pivot = new THREE.Group();
    scene.add(pivot);

    const cubies = CUBIE_POSITIONS.map(([x, y, z]) => createCubieGroup(x, y, z));
    cubies.forEach((c) => scene.add(c));

    const moves = parseAlgorithm(initialState);
    for (const m of moves) {
      applyMoveInstant(m.notation, cubies, scene, pivot);
      snapCubiesToGrid(cubies);
    }

    applyAppearance(cubies, new Set(visibleCubies ?? []), "stickered");
    invalidate();

    return () => {
      cubies.forEach((c) => {
        c.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const mat = obj.material;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat.dispose();
          }
        });
        scene.remove(c);
      });
      scene.remove(pivot);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, invalidate, initialState, visibleKey]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 6]} intensity={0.9} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} />
    </>
  );
}

export function CaseThumbnailScene({ size, initialState, visibleCubies }: Props) {
  return (
    <Canvas
      camera={{ position: [4, 3, 4], fov: 42, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      dpr={[1, 1.5]}
      frameloop="demand"
      style={{ width: size, height: size, display: "block" }}
    >
      <ThumbnailInner initialState={initialState} visibleCubies={visibleCubies} />
    </Canvas>
  );
}
