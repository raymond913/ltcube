"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import gsap from "gsap";
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
import { CubeEngine, parseAlgorithm } from "@/lib/cubeEngine";
import type { CubeFaces } from "@/lib/cubeEngine";
import type { Arrow } from "@/lib/tutorialTypes";
import { DirectionArrow } from "./DirectionArrow";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type Vec3 = [number, number, number];

const BODY_SIZE      = 0.93;
const STICKER_SIZE   = 0.79;    // ≈ 0.85 × BODY_SIZE
const STICKER_OFFSET = 0.466;   // BODY_SIZE / 2 + 0.001

/** Solved-state sticker colors keyed by face letter. */
const FACE_COLORS: Record<string, string> = {
  R: "#DC2626",
  L: "#EA580C",
  U: "#EAB308",
  D: "#FFFFFF",
  F: "#2563EB",
  B: "#16A34A",
};

/** All 26 visible cubie positions (every {-1,0,1}³ excluding origin). */
const CUBIE_POSITIONS: Vec3[] = [];
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      if (x === 0 && y === 0 && z === 0) continue;
      CUBIE_POSITIONS.push([x, y, z]);
    }
  }
}

/**
 * Axis config per face.
 * cwAngle is the Three.js rotation angle for a clockwise (viewed from outside) face turn.
 *
 * F: −π/2 around Z  (verified: cubie [-1,1,1] → [1,1,1] under F cwAngle)
 * B: +π/2 around Z
 *
 * These are OPPOSITE to the old architecture, which had a compensating flip (+π/2 / −π/2)
 * for the color-rendering path. The persistent cubie architecture drives objects directly —
 * no compensation needed.
 */
const FACE_ANIM: Record<string, { axisIndex: 0 | 1 | 2; cwAngle: number }> = {
  R: { axisIndex: 0, cwAngle: -Math.PI / 2 },
  L: { axisIndex: 0, cwAngle:  Math.PI / 2 },
  U: { axisIndex: 1, cwAngle: -Math.PI / 2 },
  D: { axisIndex: 1, cwAngle:  Math.PI / 2 },
  F: { axisIndex: 2, cwAngle: -Math.PI / 2 },
  B: { axisIndex: 2, cwAngle:  Math.PI / 2 },
};

// ---------------------------------------------------------------------------
// Move arrow (visual indicator during animation)
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

function MoveArrow({ face, clockwise }: { face: string; clockwise: boolean }) {
  const tf = FACE_ARROW[face];
  if (!tf) return null;
  const sx = clockwise ? -1 : 1;
  const coneRotZ = clockwise ? Math.PI / 2 : -Math.PI / 2;
  return (
    <group position={tf.pos} rotation={tf.rot as [number, number, number]}>
      <group scale={[sx, 1, 1]}>
        <mesh>
          <torusGeometry args={[ARROW_R, ARROW_TUBE, 8, 64, ARROW_ARC]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.92} depthTest={false} depthWrite={false} />
        </mesh>
        <mesh position={[0, -ARROW_R, 0]} rotation={[0, 0, coneRotZ]}>
          <coneGeometry args={[0.13, 0.28, 8]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.92} depthTest={false} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Imperative helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if this cubie's world position places it on the given face.
 * Uses a 0.1 tolerance to absorb floating-point accumulation across many moves.
 */
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
    default:  return false;
  }
}

/**
 * Deep equality check on CubeFaces.
 * Used by the move-log matching logic to identify AlgorithmPlayer's step target.
 */
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

/**
 * Create one imperative Three.js Group for a cubie at the given solved-state position.
 * Colors are baked in permanently — they never change after creation.
 */
function createCubieGroup(x: number, y: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  // Body
  const bodyGeo = new RoundedBoxGeometry(BODY_SIZE, BODY_SIZE, BODY_SIZE, 2, 0.08);
  const bodyMat = new THREE.MeshStandardMaterial({ color: "#1E1E1E" });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.userData.originalColor = "#1E1E1E";
  group.add(bodyMesh);

  // Stickers — one per outer face this cubie touches
  const addSticker = (
    color: string,
    px: number, py: number, pz: number,
    rx: number, ry: number, rz: number,
  ) => {
    const geo  = new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE);
    const mat  = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px, py, pz);
    mesh.rotation.set(rx, ry, rz);
    mesh.userData.originalColor = color;
    group.add(mesh);
  };

  if (x ===  1) addSticker(FACE_COLORS.R,  STICKER_OFFSET, 0,              0,             0,            Math.PI / 2,  0);
  if (x === -1) addSticker(FACE_COLORS.L, -STICKER_OFFSET, 0,              0,             0,           -Math.PI / 2,  0);
  if (y ===  1) addSticker(FACE_COLORS.U,  0,              STICKER_OFFSET,  0,            -Math.PI / 2,  0,            0);
  if (y === -1) addSticker(FACE_COLORS.D,  0,             -STICKER_OFFSET,  0,             Math.PI / 2,  0,            0);
  if (z ===  1) addSticker(FACE_COLORS.F,  0,              0,               STICKER_OFFSET, 0,            0,            0);
  if (z === -1) addSticker(FACE_COLORS.B,  0,              0,              -STICKER_OFFSET, 0,            Math.PI,      0);

  return group;
}

/**
 * Reset all 26 cubie groups back to their original solved-state positions and
 * identity quaternions (no rotation).
 */
function resetCubiesToSolved(cubies: THREE.Group[]): void {
  cubies.forEach((c, idx) => {
    const [x, y, z] = CUBIE_POSITIONS[idx];
    c.position.set(x, y, z);
    c.quaternion.identity();
  });
}

/**
 * Apply a single move to the cubie objects instantly (no animation).
 * Performs the same reparent → rotate → reparent sequence as the animated handler
 * but without GSAP — sets the pivot rotation directly and calls updateMatrixWorld.
 */
function applyMoveInstant(
  move: string,
  cubies: THREE.Group[],
  scene: THREE.Scene,
  pivot: THREE.Group,
): void {
  const parsed  = parseAlgorithm(move)[0];
  if (!parsed) return;
  const animDef = FACE_ANIM[parsed.face];
  if (!animDef) return;

  let targetAngle = animDef.cwAngle;
  if (parsed.inverse) targetAngle *= -1;
  if (parsed.double)  targetAngle *= 2;

  const faceCubies = cubies.filter((c) => isCubieInFace(c, parsed.face, parsed.wide));
  if (faceCubies.length === 0) return;

  const savedPos  = faceCubies.map(() => new THREE.Vector3());
  const savedQuat = faceCubies.map(() => new THREE.Quaternion());

  // Save world transforms
  faceCubies.forEach((c, i) => {
    c.getWorldPosition(savedPos[i]);
    c.getWorldQuaternion(savedQuat[i]);
  });

  // Reparent to pivot (at origin, identity)
  pivot.rotation.set(0, 0, 0);
  faceCubies.forEach((c, i) => {
    scene.remove(c);
    pivot.add(c);
    c.position.copy(savedPos[i]);
    c.quaternion.copy(savedQuat[i]);
  });

  // Apply rotation instantly
  const axisKeys = ["x", "y", "z"] as const;
  pivot.rotation[axisKeys[animDef.axisIndex]] = targetAngle;
  pivot.updateMatrixWorld(true);

  // Read new world transforms
  faceCubies.forEach((c, i) => {
    c.getWorldPosition(savedPos[i]);
    c.getWorldQuaternion(savedQuat[i]);
  });

  // Reparent back to scene
  faceCubies.forEach((c, i) => {
    pivot.remove(c);
    scene.add(c);
    c.position.copy(savedPos[i]);
    c.quaternion.copy(savedQuat[i]);
  });

  pivot.rotation.set(0, 0, 0);
}

// ---------------------------------------------------------------------------
// Highlight helpers
// ---------------------------------------------------------------------------

/**
 * Map a cubie notation string (e.g. "UFR", "UL") to its expected world-space
 * integer position.  Missing axes default to 0 (middle slice).
 */
function notationToWorldPos(id: string): THREE.Vector3 {
  let x = 0, y = 0, z = 0;
  for (const ch of id) {
    if      (ch === "U") y =  1;
    else if (ch === "D") y = -1;
    else if (ch === "R") x =  1;
    else if (ch === "L") x = -1;
    else if (ch === "F") z =  1;
    else if (ch === "B") z = -1;
  }
  return new THREE.Vector3(x, y, z);
}

// ---------------------------------------------------------------------------
// AnimatedScene — the inner R3F component
// ---------------------------------------------------------------------------

interface CubeSceneProps {
  interactive: boolean;
  /** Accepted for API compatibility with CubeViewer — not used for rendering in this architecture. */
  cubeState?: CubeFaces;
  /** Accepted for API compatibility — highlight/dim system removed per spec. */
  highlightedCubies?: string[];
  /** Position keys ("x,y,z") of cubies that should render normally; all others are grayed out. When undefined or empty, all cubies render normally. */
  visibleCubies?: string[];
  onReady?: () => void;
  /** Camera view mode: "default" = standard angle, "white-up" = top-down showing white face */
  viewMode?: "default" | "white-up";
  /** Ghost mode: all cubies 15% opacity except visibleCubies which stay solid */
  ghostMode?: boolean;
  /** Arrows rendered only when ghostMode is true */
  arrows?: Arrow[];
}

function applyAppearance(cubies: THREE.Group[], visibleKeys: Set<string>, ghostMode: boolean): void {
  cubies.forEach((cubie, idx) => {
    const [x, y, z] = CUBIE_POSITIONS[idx];
    const key = `${x},${y},${z}`;
    const isTarget = visibleKeys.size === 0 || visibleKeys.has(key);
    cubie.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mat = obj.material as THREE.MeshStandardMaterial;
      if (ghostMode) {
        mat.color.set((obj.userData.originalColor as string) ?? "#1E1E1E");
        mat.opacity = isTarget ? 1 : 0.15;
        mat.transparent = !isTarget;
      } else {
        const isGrayed = visibleKeys.size > 0 && !isTarget;
        if (isGrayed) {
          mat.color.set("#9CA3AF");
          mat.opacity = 0.6;
          mat.transparent = true;
        } else {
          mat.color.set((obj.userData.originalColor as string) ?? "#1E1E1E");
          mat.opacity = 1;
          mat.transparent = false;
        }
      }
    });
  });
}

function AnimatedScene({ interactive, highlightedCubies, visibleCubies, viewMode, ghostMode, arrows }: CubeSceneProps) {
  const { scene, camera } = useThree();
  const orbitRef = useRef<any>(null);

  const cubiesRef      = useRef<THREE.Group[]>([]);
  const pivotRef       = useRef(new THREE.Group());
  const isAnimatingRef = useRef(false);
  const moveLogRef     = useRef<string[]>([]);

  // ---- Highlight state ----------------------------------------------------
  const highlightedCubiesRef = useRef<string[]>([]);
  const highlightMeshesRef   = useRef<THREE.Mesh[]>([]);
  // Keep the ref in sync on every render so handlers always read the latest list
  highlightedCubiesRef.current = highlightedCubies ?? [];

  // ---- Gray-out / ghost state -----------------------------------------------------
  const visibleCubiesRef = useRef<string[]>([]);
  visibleCubiesRef.current = visibleCubies ?? [];
  const ghostModeRef = useRef<boolean>(false);
  ghostModeRef.current = ghostMode ?? false;

  const [currentAnim, setCurrentAnim] = useState<{ face: string; clockwise: boolean } | null>(null);

  // ---- attachHighlights: find cubies by world pos and attach glow meshes ---
  const attachHighlights = useCallback(() => {
    const cubies = cubiesRef.current;
    // Detach and dispose previous highlight meshes
    for (const mesh of highlightMeshesRef.current) {
      mesh.parent?.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    highlightMeshesRef.current = [];

    const ids = highlightedCubiesRef.current;
    if (!ids.length || !cubies.length) return;

    const tmp = new THREE.Vector3();
    for (const id of ids) {
      const target = notationToWorldPos(id);
      // Find the cubie whose current world position is nearest to the target
      let nearest: THREE.Group | null = null;
      let nearestDist = Infinity;
      for (const c of cubies) {
        c.getWorldPosition(tmp);
        const d = tmp.distanceTo(target);
        if (d < nearestDist) { nearestDist = d; nearest = c; }
      }
      if (!nearest || nearestDist > 0.4) continue;

      // Slightly-larger back-face box creates a coloured glow halo around the cubie
      const geo = new THREE.BoxGeometry(1.1, 1.1, 1.1);
      const mat = new THREE.MeshBasicMaterial({
        color: "#2563EB",
        transparent: true,
        opacity: 0.35,
        side: THREE.BackSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      nearest.add(mesh);
      highlightMeshesRef.current.push(mesh);
    }
  }, []);

  // ---- Mount: create all 26 cubie objects imperatively --------------------
  useEffect(() => {
    const pivot = pivotRef.current;
    scene.add(pivot);

    const cubies = CUBIE_POSITIONS.map(([x, y, z]) => createCubieGroup(x, y, z));
    cubies.forEach((c) => scene.add(c));
    cubiesRef.current = cubies;

    return () => {
      // Dispose highlight meshes (they are children of cubies, removed with them)
      for (const mesh of highlightMeshesRef.current) {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      }
      highlightMeshesRef.current = [];

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

  // ---- GSAP animation handler (registered with cubeStore on mount) --------
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

        // Save current world transforms
        faceCubies.forEach((c, i) => {
          c.getWorldPosition(savedPos[i]);
          c.getWorldQuaternion(savedQuat[i]);
        });

        // Reparent cubies into pivot group (pivot is at origin with identity rotation)
        const pivot = pivotRef.current;
        pivot.rotation.set(0, 0, 0);
        faceCubies.forEach((c, i) => {
          scene.remove(c);
          pivot.add(c);
          // Restore world transform as local transform — valid because pivot = identity
          c.position.copy(savedPos[i]);
          c.quaternion.copy(savedQuat[i]);
        });

        const axisKeys = ["x", "y", "z"] as const;
        const axisKey  = axisKeys[animDef.axisIndex];

        gsap.to(pivot.rotation, {
          [axisKey]: targetAngle,
          duration: durationMs / 1000,
          ease: "power2.inOut",
          onComplete: () => {
            pivot.updateMatrixWorld(true);

            // Read post-rotation world transforms
            faceCubies.forEach((c, i) => {
              c.getWorldPosition(savedPos[i]);
              c.getWorldQuaternion(savedQuat[i]);
            });

            // Reparent cubies back to scene root with their new world transforms
            faceCubies.forEach((c, i) => {
              pivot.remove(c);
              scene.add(c);
              c.position.copy(savedPos[i]);
              c.quaternion.copy(savedQuat[i]);
            });

            pivot.rotation.set(0, 0, 0);

            // Append to move log BEFORE commitAnimatedMove so that the
            // Zustand subscribe fires while isAnimatingRef is still true,
            // preventing the external-change handler from misidentifying
            // this update as an AlgorithmPlayer step-back.
            moveLogRef.current.push(move);
            commitAnimatedMove(move);   // updates engine + Zustand state
            isAnimatingRef.current = false;
            setCurrentAnim(null);

            resolve();
          },
        });
      });

    registerAnimationHandler(handler);
    return () => unregisterAnimationHandler();
  }, [scene]);

  // ---- Instant handler (cubeStore.reset / cubeStore.applyInstant) ---------
  useEffect(() => {
    const handler = (alg: string | null) => {
      const cubies = cubiesRef.current;
      const pivot  = pivotRef.current;

      resetCubiesToSolved(cubies);

      if (alg) {
        const moves = parseAlgorithm(alg);
        for (const m of moves) {
          applyMoveInstant(m.notation, cubies, scene, pivot);
        }
        moveLogRef.current = moves.map((m) => m.notation);
      } else {
        moveLogRef.current = [];
      }

      // Re-attach highlights and re-apply appearance after cubies have been repositioned
      attachHighlights();
      applyAppearance(cubies, new Set(visibleCubiesRef.current), ghostModeRef.current);
    };

    registerInstantHandler(handler);
    return () => unregisterInstantHandler();
  }, [scene, attachHighlights]);

  // ---- Zustand subscribe: handle AlgorithmPlayer step-back / reset --------
  //
  // AlgorithmPlayer calls useCubeStore.setState({ faces }) directly for step-back
  // and reset (not via animateMove). When faces change while we are not animating,
  // we use move-log matching to find the matching prefix and replay it instantly.
  useEffect(() => {
    const unsub = useCubeStore.subscribe((state, prevState) => {
      if (state.faces === prevState.faces) return;
      if (isAnimatingRef.current)          return; // our own commitAnimatedMove — ignore

      const newFaces = state.faces;
      const log      = moveLogRef.current;
      const cubies   = cubiesRef.current;
      const pivot    = pivotRef.current;

      // Try to find a prefix of the current move log whose end-state matches newFaces
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
        // Replay exactly the first matchedK moves from solved
        resetCubiesToSolved(cubies);
        for (let i = 0; i < matchedK; i++) {
          applyMoveInstant(log[i], cubies, scene, pivot);
        }
        moveLogRef.current = log.slice(0, matchedK);
      } else {
        // State not reachable via our log (e.g. tutorial initial state) — snap to solved
        resetCubiesToSolved(cubies);
        moveLogRef.current = [];
      }
    });

    return () => unsub();
  }, [scene]);

  // ---- Highlight glow: re-attach when the highlighted set changes ----------
  useEffect(() => {
    if (cubiesRef.current.length) attachHighlights();
  }, [highlightedCubies, scene, attachHighlights]);

  // ---- Appearance: update cubie materials when visibleCubies or ghostMode changes ---------
  useEffect(() => {
    if (cubiesRef.current.length) {
      applyAppearance(cubiesRef.current, new Set(visibleCubies ?? []), ghostMode ?? false);
    }
  }, [visibleCubies, ghostMode]);

  // ---- Camera view mode animation -----------------------------------------
  useEffect(() => {
    const [tx, ty, tz] = viewMode === "white-up" ? [0, 7, 1.5] : [4, 3, 4];
    gsap.to(camera.position, {
      x: tx, y: ty, z: tz,
      duration: 0.6,
      ease: "power2.inOut",
      onUpdate: () => { orbitRef.current?.update(); },
    });
  }, [viewMode, camera]);

  // ---- Pulse the highlight opacity each frame ------------------------------
  useFrame(({ clock }) => {
    if (!highlightMeshesRef.current.length) return;
    const t = clock.getElapsedTime();
    const opacity = 0.2 + 0.2 * Math.sin(t * 2.5);
    for (const mesh of highlightMeshesRef.current) {
      (mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  // ---- Declarative R3F scene (lights, controls, arrow) --------------------
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 6]} intensity={0.7} />
      <directionalLight position={[-3, -2, -4]} intensity={0.3} />

      {currentAnim && (
        <MoveArrow face={currentAnim.face} clockwise={currentAnim.clockwise} />
      )}

      {ghostMode && arrows?.map((a, i) => (
        <DirectionArrow key={i} from={a.from} to={a.to} color={a.color} />
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
        />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

export function CubeScene({ interactive, cubeState, highlightedCubies, visibleCubies, onReady, viewMode, ghostMode, arrows }: CubeSceneProps) {
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
        visibleCubies={visibleCubies}
        viewMode={viewMode}
        ghostMode={ghostMode}
        arrows={arrows}
      />
    </Canvas>
  );
}
