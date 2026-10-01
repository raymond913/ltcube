"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ARROW_BLUE } from "@/lib/sceneColors";

interface DirectionArrowProps {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
}

const Y_AXIS = new THREE.Vector3(0, 1, 0);

export function DirectionArrow({ from, to, color = ARROW_BLUE }: DirectionArrowProps) {
  const { length, euler } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    if (len < 0.001) return { length: 0, euler: new THREE.Euler() };
    const quat = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir.normalize());
    return { length: len, euler: new THREE.Euler().setFromQuaternion(quat) };
  }, [from, to]);

  if (length < 0.001) return null;

  const coneH = 0.32;
  const shaftL = Math.max(0, length - coneH);

  return (
    <group position={from} rotation={euler}>
      {/* Shaft */}
      <mesh position={[0, shaftL / 2, 0]} renderOrder={2}>
        <cylinderGeometry args={[0.07, 0.07, shaftL, 10]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.15}
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </mesh>
      {/* Cone tip */}
      <mesh position={[0, shaftL + coneH / 2, 0]} renderOrder={2}>
        <coneGeometry args={[0.15, coneH, 10]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          metalness={0.15}
          transparent
          opacity={0.92}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
