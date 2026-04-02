# Phase 2D — Smooth Rotation Animations

**Date:** 2026-04-01  
**Status:** Approved

## Goal

Add smooth 3D face-rotation animations to every cube move. When a move is executed (e.g. R), the 9 cubies on that face visually rotate 90° (or 180° for double moves) around the correct axis with an ease-in-out tween, then settle into their final positions. Moves queue sequentially if dispatched rapidly.

## Approach

JSX pivot group + GSAP (Approach A). React manages which cubies are inside the pivot group; GSAP animates the pivot's rotation imperatively without triggering React re-renders mid-tween. On completion, the engine state commits and React re-renders once with correct colors.

## Dependencies

- **gsap** — installed with `--legacy-peer-deps`

## Files Changed

| File | Change |
|---|---|
| `package.json` | +gsap |
| `src/stores/cubeStore.ts` | Animation state, actions, and bridge |
| `src/components/cube/CubeScene.tsx` | Pivot group, GSAP tween, handler registration |
| `src/app/page.tsx` | Buttons use `animateMove`; scramble uses `animateAlgorithm` |

## cubeStore

### New Zustand state

```ts
isAnimating: boolean       // true while any animation is in-flight
animationSpeed: number     // multiplier, default 1
```

### New Zustand actions

```ts
animateMove(move: string): Promise<void>
animateAlgorithm(alg: string): Promise<void>
setAnimationSpeed(speed: number): void
// scramble now calls animateAlgorithm internally
```

### Module-level bridge (outside Zustand, never serialised)

```ts
// Promise chain — serialises the animation queue
let _animChain: Promise<void> = Promise.resolve();

// Tracks in-flight count so isAnimating stays true until the last move finishes
let _pendingCount = 0;

// Registered by CubeScene; receives (move, durationMs) => Promise<void>
let _animHandler: ((move: string, durationMs: number) => Promise<void>) | null = null;
```

### Exported bridge functions

```ts
// CubeScene calls these on mount/unmount
registerAnimationHandler(fn): void
unregisterAnimationHandler(): void

// CubeScene calls this after GSAP completes to commit the move to the engine
commitAnimatedMove(move: string): void
```

### Queue behaviour

`animateMove` appends to `_animChain` so moves always execute one-at-a-time:

```ts
animateMove = (move) => {
  _pendingCount++;
  useCubeStore.setState({ isAnimating: true });
  const p = _animChain.then(() => runSingle(move));
  _animChain = p.catch(() => {});
  return p.finally(() => {
    _pendingCount--;
    if (_pendingCount === 0) useCubeStore.setState({ isAnimating: false });
  });
};
```

`animateAlgorithm` parses the alg string and calls `animateMove` for each move in order.

### Fallback

If `_animHandler` is null (CubeScene not mounted), `animateMove` falls back to instant `execute`.

## CubeScene

### New local state

```ts
currentAnim: {
  face: 'R' | 'L' | 'U' | 'D' | 'F' | 'B';
  axisIndex: 0 | 1 | 2;   // 0=x, 1=y, 2=z
  targetAngle: number;      // radians
} | null
```

### New ref

```ts
pivotRef: RefObject<THREE.Group>
```

### JSX structure

```tsx
{/* 17 non-rotating cubies */}
{CUBIE_POSITIONS
  .filter(([x,y,z]) => !isInFace(currentAnim?.face, x, y, z))
  .map(pos => <Cubie ... />)}

{/* 9 rotating cubies inside pivot group */}
<group ref={pivotRef}>
  {CUBIE_POSITIONS
    .filter(([x,y,z]) => isInFace(currentAnim?.face, x, y, z))
    .map(pos => <Cubie ... />)}
</group>
```

When `currentAnim` is null, `isInFace` returns false for all positions — all 26 cubies render outside the pivot, and the pivot group is empty and invisible.

### Face membership

| Face | Condition |
|---|---|
| R | x === 1 |
| L | x === -1 |
| U | y === 1 |
| D | y === -1 |
| F | z === 1 |
| B | z === -1 |

### Rotation axis + CW angle

| Face | Axis index | CW base angle |
|---|---|---|
| R | 0 (x) | −π/2 |
| L | 0 (x) | +π/2 |
| U | 1 (y) | −π/2 |
| D | 1 (y) | +π/2 |
| F | 2 (z) | −π/2 |
| B | 2 (z) | +π/2 |

Final angle = `cwAngle × (inverse ? -1 : 1) × (double ? 2 : 1)`

### Animation handler (registered on mount)

1. Parse the move token (face letter, isInverse, isDouble) using `parseAlgorithm`
2. If face is not R/L/U/D/F/B (wide move or rotation): fall back to instant `execute`, resolve immediately
3. Compute `targetAngle`
4. Set `currentAnim` → React re-renders, 9 cubies enter the pivot group
5. Wait one microtask (ensure React has flushed the re-render)
6. GSAP tween:
   ```ts
   gsap.to(pivotRef.current.rotation, {
     [axis]: targetAngle,
     duration: durationMs / 1000,
     ease: 'power2.inOut',
     onComplete: () => {
       pivotRef.current.rotation.set(0, 0, 0); // reset before re-render
       commitAnimatedMove(move);               // engine applies move, faces update
       setCurrentAnim(null);                   // React re-renders with new colors
       resolve();
     }
   });
   ```

### Mount / unmount

```ts
useEffect(() => {
  registerAnimationHandler(handler);
  return () => unregisterAnimationHandler();
}, []);
```

The handler receives `durationMs` as a parameter (computed by the store from `animationSpeed` at call time), so the handler does not close over speed and deps is `[]`.

## Duration formula

```
durationMs = 300 / animationSpeed
```

| Speed | Duration |
|---|---|
| 0.5× | 600 ms |
| 1× | 300 ms |
| 1.5× | 200 ms |
| 2× | 150 ms |

## Wide moves and cube rotations

`r`, `l`, `u`, `d`, `f`, `b`, `x`, `y`, `z` — no single-face slice to identify, so these fall back to instant `execute`. This is correct behaviour for Phase 2D; animated slice moves can be added in a future phase if needed.

## Landing page (page.tsx)

- Move buttons: `onClick={() => animateMove(move)}`
- Scramble button: `onClick={scramble}` — the store's `scramble` action now calls `animateAlgorithm` internally
- Reset button: stays instant (`reset()`)

## Error handling

- If GSAP tween is interrupted (component unmounts mid-animation): `unregisterAnimationHandler` clears `_animHandler`; in-flight promises resolve via the `onComplete` path or are abandoned — no crash.
- Rapid button clicks: each call appends to `_animChain`, so they execute cleanly in order. `isAnimating` stays true until the last move finishes.

## Testing notes

The existing `cubeEngine.test.ts` tests are unaffected — the engine is still exercised synchronously. Manual test: click R repeatedly and observe moves queue and play through sequentially, with no overlap.
