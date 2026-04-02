"use client";

import { RoundedBox } from "@react-three/drei";

const BODY_SIZE = 0.93;
const STICKER_SIZE = 0.82;
const STICKER_OFFSET = BODY_SIZE / 2 + 0.003;

type Vec3 = [number, number, number];

/**
 * Key format for faceColors: `${axis}_${sign}` e.g. "0_1" = R face, "1_-1" = D face.
 * Matches the axis/sign fields in FACE_MAP below.
 */
export type FaceColorKey = `${number}_${number}`;

const FACE_MAP = [
  { axis: 0, sign:  1, color: "#DC2626", pos: [ STICKER_OFFSET,  0,               0             ] as Vec3, rot: [0,              Math.PI / 2, 0] as Vec3 },
  { axis: 0, sign: -1, color: "#EA580C", pos: [-STICKER_OFFSET,  0,               0             ] as Vec3, rot: [0,             -Math.PI / 2, 0] as Vec3 },
  { axis: 1, sign:  1, color: "#EAB308", pos: [ 0,               STICKER_OFFSET,  0             ] as Vec3, rot: [-Math.PI / 2,  0,           0] as Vec3 },
  { axis: 1, sign: -1, color: "#FFFFFF", pos: [ 0,              -STICKER_OFFSET,  0             ] as Vec3, rot: [ Math.PI / 2,  0,           0] as Vec3 },
  { axis: 2, sign:  1, color: "#2563EB", pos: [ 0,               0,               STICKER_OFFSET] as Vec3, rot: [0,             0,           0] as Vec3 },
  { axis: 2, sign: -1, color: "#16A34A", pos: [ 0,               0,              -STICKER_OFFSET] as Vec3, rot: [0,             Math.PI,     0] as Vec3 },
] as const;

interface CubieProps {
  position: Vec3;
  /**
   * Override sticker colors keyed by face. If absent for a face, falls back to
   * the solved-state default color for that face.
   */
  faceColors?: Partial<Record<FaceColorKey, string>>;
  /** Boosted emissive glow — use for tutorial highlighting. */
  highlighted?: boolean;
  /**
   * Reduced opacity — applied to cubies that are NOT highlighted when at least
   * one highlight is active.
   */
  dimmed?: boolean;
}

export function Cubie({ position, faceColors, highlighted = false, dimmed = false }: CubieProps) {
  const bodyOpacity    = dimmed ? 0.2  : 1;
  const stickerOpacity = dimmed ? 0.35 : 1;
  const emissiveIntensity = highlighted ? 0.4 : 0;

  return (
    <group position={position}>
      {/* Dark body */}
      <RoundedBox args={[BODY_SIZE, BODY_SIZE, BODY_SIZE]} radius={0.06} smoothness={2}>
        <meshStandardMaterial color="#1a1a1a" transparent opacity={bodyOpacity} />
      </RoundedBox>

      {/* Colored sticker on each visible (outer) face */}
      {FACE_MAP.map(({ axis, sign, color, pos, rot }) => {
        if (position[axis] !== sign) return null;
        const key = `${axis}_${sign}` as FaceColorKey;
        const stickerColor = faceColors?.[key] ?? color;
        return (
          <mesh key={`${axis}${sign}`} position={pos} rotation={rot}>
            <planeGeometry args={[STICKER_SIZE, STICKER_SIZE]} />
            <meshStandardMaterial
              color={stickerColor}
              transparent
              opacity={stickerOpacity}
              emissive={stickerColor}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
        );
      })}
    </group>
  );
}
