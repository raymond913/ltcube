"use client";

import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const BODY_SIZE      = 0.93;
const STICKER_SIZE   = 0.79;    // ≈ 0.85 × BODY_SIZE
const STICKER_OFFSET = 0.466;   // BODY_SIZE / 2 + 0.001

type Vec3 = [number, number, number];

/**
 * Key format for faceColors: `${axis}_${sign}` e.g. "0_1" = R face, "1_-1" = D face.
 */
export type FaceColorKey = `${number}_${number}`;

const FACE_MAP = [
  { axis: 0, sign:  1, color: "#DC2626", pos: [ STICKER_OFFSET,  0,              0             ] as Vec3, rot: [0,            Math.PI / 2, 0] as Vec3 },
  { axis: 0, sign: -1, color: "#EA580C", pos: [-STICKER_OFFSET,  0,              0             ] as Vec3, rot: [0,           -Math.PI / 2, 0] as Vec3 },
  { axis: 1, sign:  1, color: "#EAB308", pos: [ 0,              STICKER_OFFSET,  0             ] as Vec3, rot: [-Math.PI / 2, 0,           0] as Vec3 },
  { axis: 1, sign: -1, color: "#FFFFFF", pos: [ 0,             -STICKER_OFFSET,  0             ] as Vec3, rot: [ Math.PI / 2, 0,           0] as Vec3 },
  { axis: 2, sign:  1, color: "#2563EB", pos: [ 0,              0,               STICKER_OFFSET] as Vec3, rot: [0,            0,           0] as Vec3 },
  { axis: 2, sign: -1, color: "#16A34A", pos: [ 0,              0,              -STICKER_OFFSET] as Vec3, rot: [0,            Math.PI,     0] as Vec3 },
] as const;

interface CubieProps {
  position: Vec3;
  faceColors?: Partial<Record<FaceColorKey, string>>;
}

export function Cubie({ position, faceColors }: CubieProps) {
  return (
    <group position={position}>
      <RoundedBox args={[BODY_SIZE, BODY_SIZE, BODY_SIZE]} radius={0.08} smoothness={2}>
        <meshStandardMaterial color="#1E1E1E" />
      </RoundedBox>

      {FACE_MAP.map(({ axis, sign, color, pos, rot }) => {
        if (position[axis] !== sign) return null;
        const key = `${axis}_${sign}` as FaceColorKey;
        const stickerColor = faceColors?.[key] ?? color;
        return (
          <mesh key={`${axis}${sign}`} position={pos} rotation={rot}>
            <planeGeometry args={[STICKER_SIZE, STICKER_SIZE]} />
            <meshStandardMaterial
              color={stickerColor}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}
