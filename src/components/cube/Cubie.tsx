"use client";

import { RoundedBox } from "@react-three/drei";
import { BODY_COLOR, FACE_COLORS, GHOST_BODY_COLOR } from "@/lib/sceneColors";

const BODY_SIZE      = 0.93;
const STICKER_SIZE   = BODY_SIZE * 0.82;
const STICKER_OFFSET = BODY_SIZE / 2 + 0.006;

type Vec3 = [number, number, number];

export type FaceColorKey = `${number}_${number}`;

const FACE_MAP = [
  { axis: 0, sign:  1 as const, color: FACE_COLORS.R, pos: [ STICKER_OFFSET, 0,              0             ] as Vec3, rot: [0,            Math.PI / 2, 0] as Vec3 },
  { axis: 0, sign: -1 as const, color: FACE_COLORS.L, pos: [-STICKER_OFFSET, 0,              0             ] as Vec3, rot: [0,           -Math.PI / 2, 0] as Vec3 },
  { axis: 1, sign:  1 as const, color: FACE_COLORS.U, pos: [0,               STICKER_OFFSET, 0             ] as Vec3, rot: [-Math.PI / 2, 0,           0] as Vec3 },
  { axis: 1, sign: -1 as const, color: FACE_COLORS.D, pos: [0,              -STICKER_OFFSET, 0             ] as Vec3, rot: [ Math.PI / 2, 0,           0] as Vec3 },
  { axis: 2, sign:  1 as const, color: FACE_COLORS.F, pos: [0,               0,              STICKER_OFFSET] as Vec3, rot: [0,            0,           0] as Vec3 },
  { axis: 2, sign: -1 as const, color: FACE_COLORS.B, pos: [0,               0,             -STICKER_OFFSET] as Vec3, rot: [0,            Math.PI,     0] as Vec3 },
];

interface CubieProps {
  position: Vec3;
  faceColors?: Partial<Record<FaceColorKey, string>>;
  grayedOut?: boolean;
}

export function Cubie({ position, faceColors, grayedOut = false }: CubieProps) {
  const bodyColor   = grayedOut ? GHOST_BODY_COLOR : BODY_COLOR;
  const bodyOpacity = grayedOut ? 0.25 : 1;

  return (
    <group position={position}>
      <RoundedBox args={[BODY_SIZE, BODY_SIZE, BODY_SIZE]} radius={0.12} smoothness={4}>
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.7}
          metalness={0.1}
          transparent={grayedOut}
          opacity={bodyOpacity}
        />
      </RoundedBox>

      {FACE_MAP.map(({ axis, sign, color, pos, rot }) => {
        const coord = Math.round(position[axis]);
        if (coord !== sign) return null;
        const key          = `${axis}_${sign}` as FaceColorKey;
        const stickerColor = faceColors?.[key] ?? color;
        return (
          <mesh key={`${axis}${sign}`} position={pos} rotation={rot}>
            <planeGeometry args={[STICKER_SIZE, STICKER_SIZE]} />
            <meshStandardMaterial
              color={stickerColor}
              roughness={0.35}
              metalness={0.05}
              transparent={grayedOut}
              opacity={grayedOut ? 0.25 : 1}
            />
          </mesh>
        );
      })}
    </group>
  );
}
