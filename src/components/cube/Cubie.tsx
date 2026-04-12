"use client";

import { RoundedBox } from "@react-three/drei";

const BODY_SIZE      = 0.93;
const STICKER_SIZE   = BODY_SIZE * 0.82;
const STICKER_OFFSET = BODY_SIZE / 2 + 0.006;

type Vec3 = [number, number, number];

export type FaceColorKey = `${number}_${number}`;

const FACE_MAP = [
  { axis: 0, sign:  1 as  1, color: "#DC2626", pos: [ STICKER_OFFSET, 0,              0             ] as Vec3, rot: [0,            Math.PI / 2, 0] as Vec3 },
  { axis: 0, sign: -1 as -1, color: "#EA580C", pos: [-STICKER_OFFSET, 0,              0             ] as Vec3, rot: [0,           -Math.PI / 2, 0] as Vec3 },
  { axis: 1, sign:  1 as  1, color: "#EAB308", pos: [0,               STICKER_OFFSET, 0             ] as Vec3, rot: [-Math.PI / 2, 0,           0] as Vec3 },
  { axis: 1, sign: -1 as -1, color: "#FFFFFF", pos: [0,              -STICKER_OFFSET, 0             ] as Vec3, rot: [ Math.PI / 2, 0,           0] as Vec3 },
  { axis: 2, sign:  1 as  1, color: "#2563EB", pos: [0,               0,              STICKER_OFFSET] as Vec3, rot: [0,            0,           0] as Vec3 },
  { axis: 2, sign: -1 as -1, color: "#16A34A", pos: [0,               0,             -STICKER_OFFSET] as Vec3, rot: [0,            Math.PI,     0] as Vec3 },
];

interface CubieProps {
  position: Vec3;
  faceColors?: Partial<Record<FaceColorKey, string>>;
  grayedOut?: boolean;
  hidden?: boolean;
}

export function Cubie({ position, faceColors, grayedOut = false, hidden = false }: CubieProps) {
  const bodyColor   = grayedOut ? "#4B5563" : "#111111";
  const bodyOpacity = grayedOut ? 0.5 : 1;

  return (
    <group position={position}>
      {/* Black body — always rendered */}
      <RoundedBox args={[BODY_SIZE, BODY_SIZE, BODY_SIZE]} radius={0.12} smoothness={4}>
        <meshStandardMaterial
          color={hidden ? "#111111" : bodyColor}
          roughness={0.7}
          metalness={0.1}
          transparent={grayedOut && !hidden}
          opacity={hidden ? 1 : bodyOpacity}
        />
      </RoundedBox>

      {/* Stickers — only on outward-facing sides, hidden when hidden=true */}
      {!hidden && FACE_MAP.map(({ axis, sign, color, pos, rot }) => {
        const coord = Math.round(position[axis]);
        if (coord !== sign) return null;
        const key          = `${axis}_${sign}` as FaceColorKey;
        const stickerColor = grayedOut ? "#9CA3AF" : (faceColors?.[key] ?? color);
        return (
          <mesh key={`${axis}${sign}`} position={pos} rotation={rot}>
            <planeGeometry args={[STICKER_SIZE, STICKER_SIZE]} />
            <meshStandardMaterial
              color={stickerColor}
              roughness={0.35}
              metalness={0.05}
              transparent={grayedOut}
              opacity={grayedOut ? 0.6 : 1}
            />
          </mesh>
        );
      })}
    </group>
  );
}
