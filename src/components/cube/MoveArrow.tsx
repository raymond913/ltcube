"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ARROW_LIGHT } from "@/lib/sceneColors";

interface MoveArrowProps {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
}

const Y_AXIS = new THREE.Vector3(0, 1, 0);

export function MoveArrow({ from, to, color = ARROW_LIGHT }: MoveArrowProps) {
  const groupRef = useRef<THREE.Group>(null);

  const { length, euler } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    if (len < 0.001) return { length: 0, euler: new THREE.Euler() };
    const quat = new THREE.Quaternion().setFromUnitVectors(Y_AXIS, dir.normalize());
    return { length: len, euler: new THREE.Euler().setFromQuaternion(quat) };
  }, [from, to]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const opacity = 0.55 + 0.40 * Math.sin(t * 2.8);
    groupRef.current.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        (obj.material as THREE.MeshStandardMaterial).opacity = opacity;
      }
    });
  });

  if (length < 0.001) return null;

  const THICKNESS = 0.115;
  const CONE_H = 0.38;
  const shaftL = Math.max(0, length - CONE_H);

  return (
    <group ref={groupRef} position={from} rotation={euler}>
      <mesh position={[0, shaftL / 2, 0]} renderOrder={2}>
        <cylinderGeometry args={[THICKNESS / 2, THICKNESS / 2, shaftL, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.0}
          transparent
          opacity={0.9}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, shaftL + CONE_H / 2, 0]} renderOrder={2}>
        <coneGeometry args={[THICKNESS * 2.0, CONE_H, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.2}
          roughness={0.2}
          metalness={0.0}
          transparent
          opacity={0.9}
          depthTest={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/** Pulsing glowing ring rendered at the target destination slot. */
export function TargetSlot({
  position,
  color = ARROW_LIGHT,
}: {
  position: [number, number, number];
  color?: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.30 + 0.55 * Math.abs(Math.sin(t * 2.2));
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]} renderOrder={3}>
      <torusGeometry args={[0.38, 0.055, 8, 40]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.7}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}
