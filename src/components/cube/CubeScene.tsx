"use client";

import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import gsap from "gsap";
import {
  ARROW_LIGHT,
  BODY_COLOR,
  FACE_COLORS,
  MASK_BODY_COLOR,
  MASK_STICKER_COLOR,
} from "@/lib/sceneColors";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import {
  useCubeStore,
  registerAnimationHandler,
  unregisterAnimationHandler,
  registerInstantHandler,
  unregisterInstantHandler,
  commitAnimatedMove,
} from "@/stores/cubeStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { CubeEngine, parseAlgorithm } from "@/lib/cubeEngine";
import type { CubeFaces } from "@/lib/cubeEngine";
import type { Arrow, SpotLabel, SpotSticker, StickerMask } from "@/lib/tutorialTypes";
import type { Vec3 as CameraVec3 } from "@/lib/cameraViews";
import { MoveArrow, TargetSlot } from "./MoveArrow";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type Vec3 = [number, number, number];

const BODY_SIZE = 0.93;

// Stickered mode — raised plastic stickers
const S_SIZE   = 0.82;
const S_DEPTH  = 0.008;
const S_OFFSET = BODY_SIZE / 2 + S_DEPTH / 2 + 0.003;
const S_RADIUS = 0.06;

// Stickerless mode — flush colored plastic panels
const SL_SIZE   = 0.915;
const SL_DEPTH  = 0.012;
const SL_OFFSET = BODY_SIZE / 2 - SL_DEPTH / 2 + 0.001;
const SL_RADIUS = 0.10;

/** Sticker color names (as used by SpotSticker) -> original sticker hex. */
const COLOR_NAME_HEX: Record<string, string> = {
  red:    FACE_COLORS.R,
  orange: FACE_COLORS.L,
  yellow: FACE_COLORS.U,
  white:  FACE_COLORS.D,
  blue:   FACE_COLORS.F,
  green:  FACE_COLORS.B,
};

const GLOW_MIN = 0.25;
const GLOW_MAX = 0.6;
const GLOW_STEADY = 0.45;
const GLOW_PERIOD_S = 1.2;
const GLOW_PEAK_SCALE = 1.06;

/** Lookup keys ("x,y,z|#HEX") for the stickers that must stay colored and glow. */
export function spotKeySet(spots?: SpotSticker[]): Set<string> {
  const keys = new Set<string>();
  for (const s of spots ?? []) {
    const hex = COLOR_NAME_HEX[s.color];
    if (hex) keys.add(`${s.piece}|${hex.toUpperCase()}`);
  }
  return keys;
}

function resetGlow(meshes: THREE.Mesh[]): void {
  meshes.forEach((m) => {
    const mat = m.material as THREE.MeshPhysicalMaterial;
    mat.emissive.set(0x000000);
    mat.emissiveIntensity = 0;
    m.scale.setScalar(1);
  });
}


/** All 26 visible cubie positions (every {-1,0,1}³ excluding origin). */
export const CUBIE_POSITIONS: Vec3[] = [];
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
  F: { axisIndex: 2, cwAngle: -Math.PI / 2 },
  B: { axisIndex: 2, cwAngle:  Math.PI / 2 },
  M: { axisIndex: 0, cwAngle:  Math.PI / 2 },
  E: { axisIndex: 1, cwAngle:  Math.PI / 2 },
  S: { axisIndex: 2, cwAngle: -Math.PI / 2 },
};

/** Whole-cube rotation axes — x/y/z move ALL cubies, not just a face. */
const WHOLE_CUBE_ANIM: Record<string, { axisIndex: 0 | 1 | 2; cwAngle: number }> = {
  x: { axisIndex: 0, cwAngle: -Math.PI / 2 },
  y: { axisIndex: 1, cwAngle: -Math.PI / 2 },
  z: { axisIndex: 2, cwAngle: -Math.PI / 2 },
};

// ---------------------------------------------------------------------------
// Move arrow
// ---------------------------------------------------------------------------

const ARROW_R    = 0.78;
const ARROW_TUBE = 0.045;
const ARROW_ARC  = Math.PI * 1.5;

const FACE_ARROW: Record<string, { pos: Vec3; rot: Vec3 }> = {
  R: { pos: [ 1.65, 0, 0    ], rot: [0,            -Math.PI / 2, 0] },
  L: { pos: [-1.65, 0, 0    ], rot: [0,             Math.PI / 2, 0] },
  U: { pos: [0,  1.65, 0    ], rot: [ Math.PI / 2, 0,            0] },
  D: { pos: [0, -1.65, 0    ], rot: [-Math.PI / 2, 0,            0] },
  F: { pos: [0,  0,    1.65 ], rot: [0,             0,            0] },
  B: { pos: [0,  0,   -1.65 ], rot: [0,             Math.PI,      0] },
};

function FaceArrow({ face, clockwise }: { face: string; clockwise: boolean }) {
  const tf = FACE_ARROW[face];
  if (!tf) return null;
  const sx = clockwise ? -1 : 1;
  const coneRotZ = clockwise ? Math.PI / 2 : -Math.PI / 2;
  return (
    <group position={tf.pos} rotation={tf.rot as [number, number, number]}>
      <group scale={[sx, 1, 1]}>
        <mesh>
          <torusGeometry args={[ARROW_R, ARROW_TUBE, 8, 64, ARROW_ARC]} />
          <meshBasicMaterial color={ARROW_LIGHT} transparent opacity={0.92} depthTest={false} depthWrite={false} />
        </mesh>
        <mesh position={[0, -ARROW_R, 0]} rotation={[0, 0, coneRotZ]}>
          <coneGeometry args={[0.13, 0.28, 8]} />
          <meshBasicMaterial color={ARROW_LIGHT} transparent opacity={0.92} depthTest={false} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Imperative helpers
// ---------------------------------------------------------------------------

function isCubieInFace(cubie: THREE.Group, face: string, wide = false): boolean {
  const pos = new THREE.Vector3();
  cubie.getWorldPosition(pos);
  const EPS = 0.1;
  if (wide) {
    switch (face) {
      case "R": return pos.x >= -EPS;
      case "L": return pos.x <=  EPS;
      case "U": return pos.y >= -EPS;
      case "D": return pos.y <=  EPS;
      case "F": return pos.z >= -EPS;
      case "B": return pos.z <=  EPS;
      default:  return false;
    }
  }
  switch (face) {
    case "R": return Math.abs(pos.x - 1)  < EPS;
    case "L": return Math.abs(pos.x + 1)  < EPS;
    case "U": return Math.abs(pos.y - 1)  < EPS;
    case "D": return Math.abs(pos.y + 1)  < EPS;
    case "F": return Math.abs(pos.z - 1)  < EPS;
    case "B": return Math.abs(pos.z + 1)  < EPS;
    case "M": return Math.abs(pos.x)      < EPS;
    case "E": return Math.abs(pos.y)      < EPS;
    case "S": return Math.abs(pos.z)      < EPS;
    default:  return false;
  }
}

function faceStatesMatch(a: CubeFaces, b: CubeFaces): boolean {
  const faces = ["U", "D", "F", "B", "R", "L"] as const;
  for (const face of faces) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (a[face][r][c] !== b[face][r][c]) return false;
      }
    }
  }
  return true;
}

function makeBodyMat(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: BODY_COLOR,
    roughness: 0.55,
    metalness: 0.0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.3,
  });
}

function makeStickerMat(color: string, stickerless: boolean): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: stickerless ? 0.45 : 0.30,
    metalness: 0.0,
    clearcoat: stickerless ? 0.6 : 0.9,
    clearcoatRoughness: stickerless ? 0.25 : 0.10,
    side: THREE.DoubleSide,
  });
}

export function createCubieGroup(x: number, y: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  const bodyGeo = new RoundedBoxGeometry(BODY_SIZE, BODY_SIZE, BODY_SIZE, 3, 0.10);
  const bodyMat = makeBodyMat();
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.userData.isBody = true;
  bodyMesh.userData.originalColor = BODY_COLOR;
  group.add(bodyMesh);

  const addSticker = (
    color: string,
    px: number, py: number, pz: number,
    rx: number, ry: number, rz: number,
    nx: number, ny: number, nz: number,
  ) => {
    const geo = new RoundedBoxGeometry(S_SIZE, S_SIZE, S_DEPTH, 2, S_RADIUS);
    const mat = makeStickerMat(color, false);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px, py, pz);
    mesh.rotation.set(rx, ry, rz);
    mesh.userData.originalColor = color;
    mesh.userData.isSticker = true;
    mesh.userData.faceNormal = [nx, ny, nz];
    group.add(mesh);
  };

  if (x ===  1) addSticker(FACE_COLORS.R,  S_OFFSET, 0, 0,  0,  Math.PI/2, 0,  1, 0, 0);
  if (x === -1) addSticker(FACE_COLORS.L, -S_OFFSET, 0, 0,  0, -Math.PI/2, 0, -1, 0, 0);
  if (y ===  1) addSticker(FACE_COLORS.U,  0,  S_OFFSET, 0, -Math.PI/2, 0, 0,  0,  1, 0);
  if (y === -1) addSticker(FACE_COLORS.D,  0, -S_OFFSET, 0,  Math.PI/2, 0, 0,  0, -1, 0);
  if (z ===  1) addSticker(FACE_COLORS.F,  0, 0,  S_OFFSET,  0, 0, 0,  0, 0,  1);
  if (z === -1) addSticker(FACE_COLORS.B,  0, 0, -S_OFFSET,  0, Math.PI, 0,  0, 0, -1);

  return group;
}

function resetCubiesToSolved(cubies: THREE.Group[]): void {
  cubies.forEach((c, idx) => {
    const [x, y, z] = CUBIE_POSITIONS[idx];
    c.position.set(x, y, z);
    c.quaternion.identity();
  });
}

export function applyMoveInstant(
  move: string,
  cubies: THREE.Group[],
  scene: THREE.Scene,
  pivot: THREE.Group,
): void {
  const parsed  = parseAlgorithm(move)[0];
  if (!parsed) return;
  const animDef = FACE_ANIM[parsed.face] ?? WHOLE_CUBE_ANIM[parsed.face];
  if (!animDef) return;

  let targetAngle = animDef.cwAngle;
  if (parsed.inverse) targetAngle *= -1;
  if (parsed.double)  targetAngle *= 2;

  // Whole-cube rotations (x/y/z) rotate every cubie; face moves filter by position.
  const isWholeCube = !!WHOLE_CUBE_ANIM[parsed.face];
  const faceCubies = isWholeCube
    ? cubies
    : cubies.filter((c) => isCubieInFace(c, parsed.face, parsed.wide));
  if (faceCubies.length === 0) return;

  const savedPos  = faceCubies.map(() => new THREE.Vector3());
  const savedQuat = faceCubies.map(() => new THREE.Quaternion());

  faceCubies.forEach((c, i) => {
    c.getWorldPosition(savedPos[i]);
    c.getWorldQuaternion(savedQuat[i]);
  });

  pivot.rotation.set(0, 0, 0);
  faceCubies.forEach((c, i) => {
    scene.remove(c);
    pivot.add(c);
    c.position.copy(savedPos[i]);
    c.quaternion.copy(savedQuat[i]);
  });

  const axisKeys = ["x", "y", "z"] as const;
  pivot.rotation[axisKeys[animDef.axisIndex]] = targetAngle;
  pivot.updateMatrixWorld(true);

  faceCubies.forEach((c, i) => {
    c.getWorldPosition(savedPos[i]);
    c.getWorldQuaternion(savedQuat[i]);
  });

  faceCubies.forEach((c, i) => {
    pivot.remove(c);
    scene.add(c);
    c.position.copy(savedPos[i]);
    c.quaternion.copy(savedQuat[i]);
  });

  pivot.rotation.set(0, 0, 0);
}

export function snapCubiesToGrid(cubies: THREE.Group[]): void {
  cubies.forEach((cubie) => {
    cubie.position.x = Math.round(cubie.position.x);
    cubie.position.y = Math.round(cubie.position.y);
    cubie.position.z = Math.round(cubie.position.z);
  });
}

function applyCubeStyle(cubies: THREE.Group[], style: "stickered" | "stickerless"): void {
  const sl = style === "stickerless";
  const size   = sl ? SL_SIZE   : S_SIZE;
  const depth  = sl ? SL_DEPTH  : S_DEPTH;
  const offset = sl ? SL_OFFSET : S_OFFSET;
  const radius = sl ? SL_RADIUS : S_RADIUS;

  cubies.forEach((cubie) => {
    cubie.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;

      if (obj.userData.isBody) {
        const mat = obj.material as THREE.MeshPhysicalMaterial;
        if (sl) {
          mat.color.set(BODY_COLOR);
          mat.clearcoat = 0.2;
        } else {
          mat.color.set(BODY_COLOR);
          mat.clearcoat = 0.4;
        }
        mat.needsUpdate = true;
        return;
      }

      if (!obj.userData.isSticker) return;
      const [nx, ny, nz] = obj.userData.faceNormal as [number, number, number];

      // Update geometry
      obj.geometry.dispose();
      obj.geometry = new RoundedBoxGeometry(size, size, depth, 2, radius);

      if (nx !== 0) obj.position.set(nx * offset, 0, 0);
      else if (ny !== 0) obj.position.set(0, ny * offset, 0);
      else obj.position.set(0, 0, nz * offset);

      // Update material
      const oldMat = obj.material as THREE.MeshPhysicalMaterial;
      const baseColor = obj.userData.originalColor as string;
      const currentOpacity = oldMat.opacity;
      const currentTransparent = oldMat.transparent;
      oldMat.dispose();

      const newMat = makeStickerMat(baseColor, sl);
      newMat.opacity = currentOpacity;
      newMat.transparent = currentTransparent;
      obj.material = newMat;
    });
  });
}

// ---------------------------------------------------------------------------
// applyAppearance
// ---------------------------------------------------------------------------

export function applyAppearance(
  cubies: THREE.Group[],
  visibleKeys: Set<string>,
  style: "stickered" | "stickerless",
  stickerMask?: StickerMask,
  spotKeys?: Set<string>,
): void {
  cubies.forEach((cubie, idx) => {
    const [x, y, z] = CUBIE_POSITIONS[idx];
    const key = `${x},${y},${z}`;
    const isVisible = visibleKeys.size === 0 || visibleKeys.has(key);
    const isTopCorner = y === 1 && x !== 0 && z !== 0;
    cubie.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mat = obj.material as THREE.MeshPhysicalMaterial;
      // Recognition stickers keep their own color: never grayed by the mask or visibleCubies.
      if (
        spotKeys?.size &&
        obj.userData.isSticker &&
        spotKeys.has(`${key}|${String(obj.userData.originalColor).toUpperCase()}`)
      ) {
        mat.color.set(obj.userData.originalColor as string);
        mat.opacity = 1;
        mat.transparent = false;
        mat.needsUpdate = true;
        return;
      }
      if (!isVisible) {
        mat.color.set(obj.userData.isSticker ? MASK_STICKER_COLOR : MASK_BODY_COLOR);
        mat.opacity = 1;
        mat.transparent = false;
      } else {
        let color = (obj.userData.originalColor as string) ?? BODY_COLOR;
        if (stickerMask && obj.userData.isSticker) {
          const isYellow = color.toUpperCase() === FACE_COLORS.U.toUpperCase();
          if (!isYellow || (stickerMask === "oll-edges" && isTopCorner)) color = MASK_STICKER_COLOR;
        }
        mat.color.set(color);
        mat.opacity = 1;
        mat.transparent = false;
      }
      mat.needsUpdate = true;
    });
  });
}

// ---------------------------------------------------------------------------
// AnimatedScene
// ---------------------------------------------------------------------------

interface CubeSceneProps {
  interactive: boolean;
  cubeState?: CubeFaces;
  visibleCubies?: string[];
  onReady?: () => void;
  viewMode?: "default" | "white-up";
  arrows?: Arrow[];
  whiteOnTop?: boolean;
  stickerMask?: StickerMask;
  /** Where the camera settles and where Reset / default view return (default [4, 3, 4]) */
  holdView?: CameraVec3;
  /** If set, the camera starts here, holds, then glides to holdView */
  spotView?: CameraVec3;
  /** Bump to replay the spot-then-hold move */
  replayKey?: number;
  /** Bump to animate the camera back to holdView */
  cameraResetKey?: number;
  spotStickers?: SpotSticker[];
  spotLabels?: SpotLabel[];
  /** Glow and labels are on only while true (player at move 0, not playing) */
  glowActive?: boolean;
}

const DEFAULT_CAMERA: CameraVec3 = [4, 3, 4];
const SPOT_HOLD_S = 1.5;
const GLIDE_S = 1.2;

/** Where a floating label sits: just above the top edge of the named side. */
const LABEL_ANCHOR: Record<SpotLabel["side"], CameraVec3> = {
  front: [0, 2.05, 1.75],
  back:  [0, 2.05, -1.75],
  left:  [-1.75, 2.05, 0],
  right: [1.75, 2.05, 0],
};

function AnimatedScene({ interactive, visibleCubies, viewMode, arrows, stickerMask, holdView, spotView, replayKey, cameraResetKey, spotStickers, spotLabels, glowActive }: CubeSceneProps) {
  const { scene, camera } = useThree();
  const orbitRef = useRef<ComponentRef<typeof OrbitControls>>(null);

  const cubiesRef      = useRef<THREE.Group[]>([]);
  const pivotRef       = useRef(new THREE.Group());
  const isAnimatingRef = useRef(false);
  const moveLogRef     = useRef<string[]>([]);

  const visibleCubiesRef = useRef<string[]>([]);
  visibleCubiesRef.current = visibleCubies ?? [];

  const stickerMaskRef = useRef<StickerMask | undefined>(stickerMask);
  stickerMaskRef.current = stickerMask;

  const spotKeys = useMemo(() => spotKeySet(spotStickers), [spotStickers]);
  const spotKeysRef = useRef(spotKeys);
  spotKeysRef.current = spotKeys;
  const glowMeshesRef = useRef<THREE.Mesh[]>([]);
  const glowActiveRef = useRef(!!glowActive);
  glowActiveRef.current = !!glowActive;
  const glowWasOnRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const cubeStyle = usePreferencesStore((s) => s.cubeStyle);
  const cubeStyleRef = useRef(cubeStyle);

  const [currentAnim, setCurrentAnim] = useState<{ face: string; clockwise: boolean } | null>(null);
  const [, setInstantRevision] = useState(0);

  // ---- Mount: create cubies -----------------------------------------------
  useEffect(() => {
    const pivot = pivotRef.current;
    scene.add(pivot);

    const cubies = CUBIE_POSITIONS.map(([x, y, z]) => createCubieGroup(x, y, z));
    cubies.forEach((c) => scene.add(c));
    cubiesRef.current = cubies;

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
  }, [scene]);

  // ---- Style changes -------------------------------------------------------
  useEffect(() => {
    cubeStyleRef.current = cubeStyle;
    if (cubiesRef.current.length) {
      applyCubeStyle(cubiesRef.current, cubeStyle);
      applyAppearance(cubiesRef.current, new Set(visibleCubiesRef.current), cubeStyle, stickerMaskRef.current, spotKeysRef.current);
    }
  }, [cubeStyle]);

  // ---- GSAP animation handler ---------------------------------------------
  useEffect(() => {
    const handler = (move: string, durationMs: number): Promise<void> =>
      new Promise((resolve) => {
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

        const clockwise = Math.sign(targetAngle) === Math.sign(animDef.cwAngle);
        isAnimatingRef.current = true;
        setCurrentAnim({ face: parsed.face, clockwise });

        const allCubies  = cubiesRef.current;
        const faceCubies = allCubies.filter((c) => isCubieInFace(c, parsed.face, parsed.wide));

        const savedPos  = faceCubies.map(() => new THREE.Vector3());
        const savedQuat = faceCubies.map(() => new THREE.Quaternion());

        faceCubies.forEach((c, i) => {
          c.getWorldPosition(savedPos[i]);
          c.getWorldQuaternion(savedQuat[i]);
        });

        const pivot = pivotRef.current;
        pivot.rotation.set(0, 0, 0);
        faceCubies.forEach((c, i) => {
          scene.remove(c);
          pivot.add(c);
          c.position.copy(savedPos[i]);
          c.quaternion.copy(savedQuat[i]);
        });

        const axisKeys = ["x", "y", "z"] as const;
        const axisKey  = axisKeys[animDef.axisIndex];

        gsap.to(pivot.rotation, {
          [axisKey]: targetAngle,
          duration: durationMs / 1000,
          ease: "power3.out",
          onComplete: () => {
            pivot.updateMatrixWorld(true);

            faceCubies.forEach((c, i) => {
              c.getWorldPosition(savedPos[i]);
              c.getWorldQuaternion(savedQuat[i]);
            });

            faceCubies.forEach((c, i) => {
              pivot.remove(c);
              scene.add(c);
              c.position.copy(savedPos[i]);
              c.quaternion.copy(savedQuat[i]);
            });

            pivot.rotation.set(0, 0, 0);
            snapCubiesToGrid(faceCubies);

            moveLogRef.current.push(move);
            commitAnimatedMove(move);
            isAnimatingRef.current = false;
            setCurrentAnim(null);

            resolve();
          },
        });
      });

    registerAnimationHandler(handler);
    return () => unregisterAnimationHandler();
  }, [scene]);

  // ---- Instant handler ----------------------------------------------------
  useEffect(() => {
    const handler = (alg: string | null) => {
      const cubies = cubiesRef.current;
      const pivot  = pivotRef.current;

      resetCubiesToSolved(cubies);

      if (alg) {
        const moves = parseAlgorithm(alg);
        for (const m of moves) {
          applyMoveInstant(m.notation, cubies, scene, pivot);
          snapCubiesToGrid(cubies);
        }
        moveLogRef.current = moves.map((m) => m.notation);
      } else {
        moveLogRef.current = [];
      }

      applyAppearance(cubies, new Set(visibleCubiesRef.current), cubeStyleRef.current, stickerMaskRef.current, spotKeysRef.current);
    };

    const hadPending = useCubeStore.getState().pendingInstantAlg !== null;
    registerInstantHandler(handler);
    if (hadPending) {
      setInstantRevision((r) => r + 1);
    }
    return () => unregisterInstantHandler();
  }, [scene]);

  // ---- Zustand subscribe: step-back / reset --------------------------------
  useEffect(() => {
    const unsub = useCubeStore.subscribe((state, prevState) => {
      if (state.faces === prevState.faces) return;
      if (isAnimatingRef.current)          return;

      const newFaces = state.faces;
      const log      = moveLogRef.current;
      const cubies   = cubiesRef.current;
      const pivot    = pivotRef.current;

      const localEngine = new CubeEngine();
      let matchedK: number | null = null;

      for (let k = 0; k <= log.length; k++) {
        if (faceStatesMatch(localEngine.getState(), newFaces)) {
          matchedK = k;
          break;
        }
        if (k < log.length) localEngine.applyMoveString(log[k]);
      }

      if (matchedK !== null) {
        resetCubiesToSolved(cubies);
        for (let i = 0; i < matchedK; i++) {
          applyMoveInstant(log[i], cubies, scene, pivot);
          snapCubiesToGrid(cubies);
        }
        moveLogRef.current = log.slice(0, matchedK);
      } else {
        resetCubiesToSolved(cubies);
        for (const m of log) {
          applyMoveInstant(m, cubies, scene, pivot);
          snapCubiesToGrid(cubies);
        }
        moveLogRef.current = [...log];
      }
    });

    return () => unsub();
  }, [scene]);

  // ---- Appearance: visibleCubies changes ----------------------------------
  useEffect(() => {
    if (cubiesRef.current.length) {
      applyAppearance(cubiesRef.current, new Set(visibleCubies ?? []), cubeStyleRef.current, stickerMask, spotKeys);
    }
  }, [visibleCubies, stickerMask, spotKeys]);

  // ---- Recognition glow -----------------------------------------------------
  // Find the sticker meshes named by spotStickers; reset them when the set
  // changes or the scene unmounts so a glow never carries into the next case.
  useEffect(() => {
    const meshes: THREE.Mesh[] = [];
    cubiesRef.current.forEach((cubie, idx) => {
      const [x, y, z] = CUBIE_POSITIONS[idx];
      const pieceKey = `${x},${y},${z}`;
      cubie.traverse((obj) => {
        if (
          obj instanceof THREE.Mesh &&
          obj.userData.isSticker &&
          spotKeys.has(`${pieceKey}|${String(obj.userData.originalColor).toUpperCase()}`)
        ) {
          meshes.push(obj);
        }
      });
    });
    glowMeshesRef.current = meshes;
    glowWasOnRef.current = false;
    return () => {
      resetGlow(meshes);
      glowMeshesRef.current = [];
      glowWasOnRef.current = false;
    };
  }, [scene, spotKeys]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => { reducedMotionRef.current = e.matches; };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useFrame(({ clock }) => {
    const meshes = glowMeshesRef.current;
    if (meshes.length === 0) return;

    if (!glowActiveRef.current) {
      if (glowWasOnRef.current) {
        resetGlow(meshes);
        glowWasOnRef.current = false;
      }
      return;
    }
    glowWasOnRef.current = true;

    let intensity = GLOW_STEADY;
    let scale = 1;
    if (!reducedMotionRef.current) {
      const t = (Math.sin((clock.elapsedTime * 2 * Math.PI) / GLOW_PERIOD_S) + 1) / 2;
      intensity = GLOW_MIN + (GLOW_MAX - GLOW_MIN) * t;
      scale = 1 + (GLOW_PEAK_SCALE - 1) * t;
    }
    meshes.forEach((m) => {
      const mat = m.material as THREE.MeshPhysicalMaterial;
      mat.emissive.set(m.userData.originalColor as string);
      mat.emissiveIntensity = intensity;
      m.scale.setScalar(scale);
    });
  });

  // ---- Camera view mode ---------------------------------------------------
  // Spot-then-hold: start at spotView, hold with the glow on, glide to holdView.
  // A drag, or pressing play, cancels the glide. Reset / view-mode changes go
  // straight to holdView (second effect). The first effect is unconditional so it
  // stays correct when React dev mode mounts, unmounts and remounts it.
  const holdTarget = holdView ?? DEFAULT_CAMERA;
  const holdKey = holdTarget.join(",");
  const spotKey = spotView?.join(",") ?? "";
  const glideRef = useRef<gsap.core.Timeline | null>(null);
  const moveKeyRef = useRef(`${viewMode}|${cameraResetKey}`);

  useEffect(() => {
    const update = () => { orbitRef.current?.update(); };
    const [hx, hy, hz] = holdTarget;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    camera.up.set(0, 1, 0);

    if (spotView && !reduced) {
      camera.position.set(...spotView);
      update();
      const tl = gsap.timeline({ onComplete: () => { glideRef.current = null; } });
      tl.to({}, { duration: SPOT_HOLD_S });
      tl.to(camera.position, { x: hx, y: hy, z: hz, duration: GLIDE_S, ease: "power2.inOut", onUpdate: update });
      glideRef.current = tl;
    } else {
      camera.position.set(hx, hy, hz);
      update();
    }
    return () => {
      glideRef.current?.kill();
      glideRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, holdKey, spotKey, replayKey]);

  useEffect(() => {
    const moveKey = `${viewMode}|${cameraResetKey}`;
    if (moveKey === moveKeyRef.current) return;
    moveKeyRef.current = moveKey;
    glideRef.current?.kill();
    glideRef.current = null;
    const [hx, hy, hz] = holdTarget;
    const tween = gsap.to(camera.position, {
      x: hx, y: hy, z: hz,
      duration: 0.6,
      ease: "power2.inOut",
      onUpdate: () => { orbitRef.current?.update(); },
    });
    return () => { tween.kill(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, cameraResetKey, camera]);

  // Pressing play (or stepping) mid-glide: jump to the hold view immediately.
  useEffect(() => {
    if (glowActive || !glideRef.current) return;
    glideRef.current.kill();
    glideRef.current = null;
    camera.position.set(...holdTarget);
    orbitRef.current?.update();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glowActive, camera]);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 6]} intensity={2.0} castShadow />
      <directionalLight position={[-4, 2, -3]} intensity={0.9} />
      <pointLight position={[0, 4, 4]} intensity={0.8} />

      {currentAnim && (
        <FaceArrow face={currentAnim.face} clockwise={currentAnim.clockwise} />
      )}

      {glowActive && spotLabels?.map((label) => (
        <Html
          key={`${label.side}-${label.text}`}
          position={LABEL_ANCHOR[label.side]}
          center
          zIndexRange={[20, 0]}
          style={{ pointerEvents: "none" }}
        >
          <div
            aria-hidden="true"
            style={{
              whiteSpace: "nowrap",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              lineHeight: 1.3,
              color: "var(--color-primary-ink)",
              background: "color-mix(in srgb, var(--color-surface-elevated) 94%, transparent)",
              border: "1px solid color-mix(in srgb, var(--color-primary) 35%, transparent)",
              boxShadow: "0 2px 8px var(--color-shadow-3)",
            }}
          >
            {label.text}
          </div>
        </Html>
      ))}

      {arrows?.map((a, i) => (
        <MoveArrow key={i} from={a.from} to={a.to} color={a.color} />
      ))}

      {arrows?.map((a, i) => (
        <TargetSlot
          key={`target-${i}`}
          position={[a.to[0], a.to[1] + 0.08, a.to[2]]}
          color={a.color ?? ARROW_LIGHT}
        />
      ))}

      {interactive && (
        <OrbitControls
          ref={orbitRef}
          enableZoom
          minDistance={3.5}
          maxDistance={8}
          enablePan={false}
          enableDamping
          dampingFactor={0.07}
          onStart={() => { glideRef.current?.kill(); glideRef.current = null; }}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

export function CubeScene({ interactive, cubeState, visibleCubies, onReady, viewMode, arrows, whiteOnTop, stickerMask, holdView, spotView, replayKey, cameraResetKey, spotStickers, spotLabels, glowActive }: CubeSceneProps) {
  // Start where the camera will be for the first frame: the spot view if it
  // will glide, otherwise straight at the hold view (reduced motion skips the glide).
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const initialCamera = spotView && !reduced ? spotView : holdView ?? DEFAULT_CAMERA;
  return (
    <Canvas
      flat
      camera={{ position: initialCamera, fov: 42, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      onCreated={() => onReady?.()}
    >
      <AnimatedScene
        interactive={interactive}
        cubeState={cubeState}
        visibleCubies={visibleCubies}
        viewMode={viewMode}
        arrows={arrows}
        whiteOnTop={whiteOnTop}
        stickerMask={stickerMask}
        holdView={holdView}
        spotView={spotView}
        replayKey={replayKey}
        cameraResetKey={cameraResetKey}
        spotStickers={spotStickers}
        spotLabels={spotLabels}
        glowActive={glowActive}
      />
    </Canvas>
  );
}
