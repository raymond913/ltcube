"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface MoveArrowProps {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
}

const Y_AXIS = new THREE.Vector3(0, 1, 0);

export function MoveArrow({ from, to, color = "#FFFFFF" }: MoveArrowProps) {
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

  const THICKNESS = 0.08;
  const CONE_H = 0.32;
  const shaftL = Math.max(0, length - CONE_H);

  return (
    <group position={from} rotation={euler}>
      <mesh position={[0, shaftL / 2, 0]} renderOrder={2}>
        <cylinderGeometry args={[THICKNESS / 2, THICKNESS / 2, shaftL, 10]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, shaftL + CONE_H / 2, 0]} renderOrder={2}>
        <coneGeometry args={[THICKNESS * 1.8, CONE_H, 10]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
