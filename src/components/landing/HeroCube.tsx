"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

type Vec3 = [number, number, number];

const BODY_SIZE      = 0.93;
const STICKER_SIZE   = 0.80;
const STICKER_OFFSET = 0.472;  // slightly more raised: BODY_SIZE/2 + 0.007

const HERO_BODY_COLOR = "#0a0a0a";

const HERO_FACE_COLORS: Record<string, { color: string; emissive: string; emissiveIntensity: number }> = {
  R: { color: "#FF3B3B", emissive: "#FF0000", emissiveIntensity: 0.3 },
  L: { color: "#FF8B1F", emissive: "#FF6600", emissiveIntensity: 0.3 },
  U: { color: "#FFD93D", emissive: "#FFD700", emissiveIntensity: 0.3 },
  D: { color: "#FFFFFF", emissive: "#FFFFFF", emissiveIntensity: 0.2 },
  F: { color: "#3B82F6", emissive: "#2563EB", emissiveIntensity: 0.4 },
  B: { color: "#10B981", emissive: "#059669", emissiveIntensity: 0.3 },
};

const CUBIE_POSITIONS: Vec3[] = [];
for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      if (x === 0 && y === 0 && z === 0) continue;
      CUBIE_POSITIONS.push([x, y, z]);
    }
  }
}

// ---------------------------------------------------------------------------
// Cubie creation
// ---------------------------------------------------------------------------

function createHeroCubieGroup(x: number, y: number, z: number): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  const bodyGeo = new RoundedBoxGeometry(BODY_SIZE, BODY_SIZE, BODY_SIZE, 3, 0.15);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: HERO_BODY_COLOR,
    roughness: 0.15,
    metalness: 0.6,
  });
  group.add(new THREE.Mesh(bodyGeo, bodyMat));

  const addSticker = (
    face: string,
    px: number, py: number, pz: number,
    rx: number, ry: number, rz: number,
  ) => {
    const { color, emissive, emissiveIntensity } = HERO_FACE_COLORS[face];
    const geo = new THREE.PlaneGeometry(STICKER_SIZE, STICKER_SIZE);
    const mat = new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity,
      roughness: 0.25,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(px, py, pz);
    mesh.rotation.set(rx, ry, rz);
    group.add(mesh);
  };

  if (x ===  1) addSticker("R",  STICKER_OFFSET, 0,              0,             0,            Math.PI / 2,  0);
  if (x === -1) addSticker("L", -STICKER_OFFSET, 0,              0,             0,           -Math.PI / 2,  0);
  if (y ===  1) addSticker("U",  0,              STICKER_OFFSET,  0,            -Math.PI / 2,  0,            0);
  if (y === -1) addSticker("D",  0,             -STICKER_OFFSET,  0,             Math.PI / 2,  0,            0);
  if (z ===  1) addSticker("F",  0,              0,               STICKER_OFFSET, 0,            0,            0);
  if (z === -1) addSticker("B",  0,              0,              -STICKER_OFFSET, 0,            Math.PI,      0);

  return group;
}

// ---------------------------------------------------------------------------
// Inner R3F scene
// ---------------------------------------------------------------------------

function HeroCubeScene() {
  const { scene } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<any>(null);
  const lastInteractRef = useRef(0);
  const autoRotYRef = useRef(0);

  // Build cubies once
  useEffect(() => {
    const cubies = CUBIE_POSITIONS.map(([x, y, z]) => createHeroCubieGroup(x, y, z));
    cubies.forEach((c) => scene.add(c));

    // Attach to groupRef via a parent group for collective transforms
    if (groupRef.current) {
      cubies.forEach((c) => {
        scene.remove(c);
        groupRef.current!.add(c);
      });
    }

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
      });
    };
  }, [scene]);

  // Auto-rotate + bob, pause during user interaction
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const t = clock.getElapsedTime();
    const sinceInteract = Date.now() - lastInteractRef.current;
    const isIdle = sinceInteract > 2000;

    if (isIdle) {
      // 1 full rotation per 20 seconds
      autoRotYRef.current = (t / 20) * Math.PI * 2;
      groupRef.current.rotation.y = autoRotYRef.current;
    }

    // Vertical bob: ±0.1 over 3s cycle
    groupRef.current.position.y = Math.sin((t / 3) * Math.PI * 2) * 0.1;
  });

  const onStart = () => { lastInteractRef.current = Date.now(); };

  return (
    <>
      {/* Moody dark ambient */}
      <ambientLight intensity={0.15} />

      {/* Main directional — slight blue tint */}
      <directionalLight
        position={[3, 4, 5]}
        intensity={0.8}
        color="#E0E8FF"
      />

      {/* Rim / backlight — purple */}
      <pointLight
        position={[0, 5, -5]}
        intensity={1.5}
        color="#9333EA"
      />

      {/* Subtle bottom fill */}
      <directionalLight
        position={[0, -4, 2]}
        intensity={0.2}
        color="#FFFFFF"
      />

      <group ref={groupRef} />

      <OrbitControls
        ref={orbitRef}
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        onStart={onStart}
        onEnd={onStart}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

interface HeroCubeProps {
  size?: number;
}

export function HeroCube({ size = 300 }: HeroCubeProps) {
  return (
    <div style={{ width: size, height: size }}>
      <Canvas
        camera={{ position: [4, 3, 4], fov: 42, near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <HeroCubeScene />
      </Canvas>
    </div>
  );
}
