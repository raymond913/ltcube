# Persistent Cubie Architecture — Design Spec

**Date:** 2026-04-03
**Files changed:** `src/components/cube/CubeScene.tsx`, `src/components/cube/Cubie.tsx`, `src/stores/cubeStore.ts`
**Files frozen:** `src/lib/cubeEngine.ts`, `src/components/cube/AlgorithmPlayer.tsx`

---

## Problem

The current architecture re-derives cubie colors from Zustand (engine) state every frame, and re-places all 26 cubies at fixed grid positions. On animation complete, the pivot is hidden and all cubies re-render at their original positions with updated colors in the same React commit. This creates a visible snap: cubies teleport from their animated endpoint back to the grid while colors change simultaneously.

---

## Architecture

### Core invariant

Each of the 26 visible cubies is a persistent `THREE.Group` object created once on mount. It:
- Carries its own colored sticker meshes that **never change** after creation
- Tracks its own position and quaternion that **accumulate** across moves
- Is never re-created or teleported back to a grid position

React/R3F is used only for lights, OrbitControls, and the MoveArrow overlay. Cubie objects live imperatively in the Three.js scene.

---

## CubeScene.tsx — Full Rewrite

### Mount (`useEffect` on `scene` from `useThree`)

1. Create a shared `THREE.Group` pivot (stays in scene throughout, identity transform when idle).
2. For each of the 26 `CUBIE_POSITIONS [x, y, z]`:
   - Create a `THREE.Group` at `position [x, y, z]`, identity quaternion.
   - Add a `THREE.Mesh` body: `RoundedBoxGeometry(0.93, 0.93, 0.93, 2, 0.08)` with `MeshStandardMaterial({ color: '#1E1E1E' })`.
   - For each outer face the cubie touches (e.g. `x === 1` → R face): add a `THREE.Mesh` sticker with `PlaneGeometry(0.79, 0.79)`, positioned `0.001` beyond the body face (`offset = 0.93/2 + 0.001 = 0.466`), rotated to face outward. Color is baked from the solved-state color for that face.
   - Add the group to `scene`.
3. Store all 26 groups in `cubieObjectsRef.current`.
4. Maintain a `moveLogRef.current: string[]` (empty on mount) tracking every move applied via the animation handler.
5. On unmount: remove all 26 groups and the pivot from scene.

### Sticker placement (imperative, matches FACE_MAP)

| Face | Axis | Sign | Position in group | Rotation |
|------|------|------|-------------------|----------|
| R    | 0    | +1   | [0.466, 0, 0]     | [0, π/2, 0] |
| L    | 0    | -1   | [-0.466, 0, 0]    | [0, -π/2, 0] |
| U    | 1    | +1   | [0, 0.466, 0]     | [-π/2, 0, 0] |
| D    | 1    | -1   | [0, -0.466, 0]    | [π/2, 0, 0] |
| F    | 2    | +1   | [0, 0, 0.466]     | [0, 0, 0] |
| B    | 2    | -1   | [0, 0, -0.466]    | [0, π, 0] |

Sticker material: `MeshStandardMaterial({ color: stickerColor, side: THREE.DoubleSide })`.
No emissive, no transparency, no opacity.

### Solved-state sticker colors (baked at creation)

```
x === 1  → Red    (#DC2626)
x === -1 → Orange (#EA580C)
y === 1  → Yellow (#EAB308)
y === -1 → White  (#FFFFFF)
z === 1  → Blue   (#2563EB)
z === -1 → Green  (#16A34A)
```

### Face membership (world-space, tolerance 0.1)

```typescript
function isCubieInFace(cubie: THREE.Group, face: string): boolean {
  const pos = new THREE.Vector3();
  cubie.getWorldPosition(pos);
  const EPS = 0.1;
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
```

### Animation handler (registered with cubeStore on mount)

On each `animateMove(move, durationMs)` call:

1. Parse `move` → get `face`, `axisIndex`, base CW angle; apply inverse/double modifiers.
2. Select face cubies: `cubies.filter(c => isCubieInFace(c, face))` — always exactly 9.
3. For each face cubie: save world position + quaternion via `getWorldPosition` / `getWorldQuaternion`.
4. Reparent to pivot (pivot is at origin, identity):
   - `scene.remove(cubie)` → `pivot.add(cubie)`
   - Restore cubie local position/quaternion to the saved world values (identical because pivot = identity).
5. GSAP tween `pivot.rotation[axisKey]` from 0 → `targetAngle`, `ease: "power2.inOut"`.
6. `onComplete`:
   - `pivot.updateMatrixWorld(true)`
   - Read each cubie's new world position + quaternion.
   - Reparent back: `pivot.remove(cubie)` → `scene.add(cubie)`, set local position/quat to captured world values.
   - Reset pivot rotation to identity.
   - Push `move` to `moveLogRef.current`.
   - Update engine: `_engine.applyMoveString(move)` + `useCubeStore.setState({ faces: _engine.getState() })`.
   - `resolve()`.

### Axis / direction table (right-hand rule)

| Move | Axis | Angle |
|------|------|-------|
| R    | X    | -π/2  |
| R'   | X    | +π/2  |
| L    | X    | +π/2  |
| L'   | X    | -π/2  |
| U    | Y    | -π/2  |
| U'   | Y    | +π/2  |
| D    | Y    | +π/2  |
| D'   | Y    | -π/2  |
| F    | Z    | -π/2  |
| F'   | Z    | +π/2  |
| B    | Z    | +π/2  |
| B'   | Z    | -π/2  |
| X2   | X    | ×2    |

**Note:** F and B angles are FLIPPED from the old architecture. The old CubeScene used `F: +π/2, B: -π/2` to compensate for the engine's strip-cycle direction in the COLOR rendering path. The new architecture drives 3D objects directly; these angles are verified correct by tracing the cubie at `[-1,1,1]` through F CW → it lands at `[1,1,1]` under `-π/2` Z rotation. ✓

### Instant apply (for AlgorithmPlayer step-back / reset — Option A)

The 3D scene subscribes to Zustand `faces` changes via `useCubeStore.subscribe`. When `faces` changes while `isAnimatingRef.current === false`:

1. **Move-log matching:** Simulate from solved using a local `CubeEngine`, applying `moveLogRef.current` moves one by one. At each prefix length `k`, compare the simulated face state with `newFaces`. If a match is found at `k`:
   - Reset all cubie objects to solved positions (identity quaternions, original grid positions).
   - Apply `moveLogRef.current.slice(0, k)` instantly via `applyMoveInstant`.
   - Set `moveLogRef.current = moveLogRef.current.slice(0, k)`.
2. **No match found** (new algorithm or non-log state): Reset all cubie objects to solved positions. Set `moveLogRef.current = []`. (Accepted limitation: non-log states such as tutorial initial setups reset visually to solved; the user then plays forward from there.)

`applyMoveInstant` is the same reparent/rotate/reparent-back logic as the animation handler but without GSAP — sets `pivot.rotation[key] = targetAngle` then calls `pivot.updateMatrixWorld(true)` before reading world transforms.

### Lighting

```
ambientLight intensity={0.6}
directionalLight position={[5, 8, 5]} intensity={0.8}
```

### MoveArrow

Kept from existing implementation. Updated to use new `currentAnim` React state (face + clockwise) set at animation start, cleared at animation end.

### Highlights / dimming

Removed entirely. `highlightedCubies` prop accepted for API compatibility but ignored visually. No opacity or emissive changes on any cubie.

---

## Cubie.tsx — Visual Update Only

React component retained for any static display usage. Changes:

| Property | Old | New |
|----------|-----|-----|
| `RoundedBox` radius | 0.06 | 0.08 |
| `STICKER_SIZE` | 0.82 | 0.79 (≈ 0.85 × 0.93) |
| `STICKER_OFFSET` | `0.93/2 + 0.003` | `0.93/2 + 0.001 = 0.466` |
| Body color | `#1a1a1a` | `#1E1E1E` |
| `highlighted` prop | present | removed |
| `dimmed` prop | present | removed |
| Opacity / transparency | conditional | always fully opaque |
| Emissive | conditional | none |

---

## cubeStore.ts — Updates

### Duration formula

`durationMs = 400 / animationSpeed`

| Speed | Duration |
|-------|----------|
| 0.5×  | 800 ms   |
| 1×    | 400 ms   |
| 1.5×  | 267 ms   |
| 2×    | 200 ms   |

### New export: `applyInstant(alg: string)`

```typescript
applyInstant: (alg) => {
  _engine.applyAlgorithm(alg);
  useCubeStore.setState({ faces: _engine.getState() });
  _instantHandler?.(alg); // calls registered 3D scene handler
}
```

The 3D scene registers `_instantHandler` alongside `_animHandler` via `registerInstantHandler`. This provides a clean API for any callers (outside AlgorithmPlayer) that need instant state application. AlgorithmPlayer's direct `useCubeStore.setState` calls are handled by the Zustand subscribe approach above.

### `reset()` update

Calls `_engine.reset()`, sets Zustand faces to solved, and calls `_instantHandler?.("") ` (empty alg = reset to solved).

---

## Known Limitation

AlgorithmPlayer sets an `initialState` from tutorial data (a non-solved face configuration) via `cubeEngine.setState(initialState)` + `useCubeStore.setState({ faces: initialState })`. Since this state is not reachable via the move log, the 3D scene will reset to solved when it detects the external change. The visual is incorrect until the user plays the algorithm forward. This affects tutorial pages with a pre-set initial cube state. A future fix would add an `applyInstantFromState(faces)` that reconstructs cubie positions by color-matching, or require tutorial pages to use `applyInstant(setupAlg)` instead.

---

## Test Sequence

On a solved cube, apply: `R U F B' L D' R2 U' F2`

Each move must show cubies rotating smoothly with colors permanently attached. Zero snapping. Zero color reassignment.
