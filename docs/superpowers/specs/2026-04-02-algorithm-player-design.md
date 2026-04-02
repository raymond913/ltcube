# AlgorithmPlayer — Phase 3 Design Spec

**Date:** 2026-04-02
**Status:** Approved

---

## Overview

`AlgorithmPlayer` is a self-contained React component that wraps `CubeViewer` and provides full VCR-style playback of a Rubik's Cube algorithm. It pre-computes state snapshots for every step, enabling instant backward navigation, and drives forward animation through the existing global `cubeStore` / GSAP system.

---

## Architecture

### Engine Strategy — Global Store (Option A)

`AlgorithmPlayer` uses the existing global `cubeEngine` singleton and `useCubeStore` for all playback:

- **Snapshot pre-computation:** On mount (and when `algorithm`/`initialState` props change), a *throw-away* local `CubeEngine` instance applies each move in sequence to build `snapshots: CubeFaces[]` without touching global state.
- **Forward animation:** Calls `useCubeStore.animateMove(notation)` — goes through the normal GSAP queue in `CubeScene`, exactly like Phase 2D moves.
- **Backward / reset:** Calls `cubeEngine.setState(snapshot)` + `useCubeStore.setState({ faces: snapshot })` — the same pattern used by `commitAnimatedMove`, bypasses animation.
- **On mount / algorithm change:** Resets global engine + store to `snapshots[0]` (the initial state).

### State

```
snapshots: CubeFaces[]          // length = moves.length + 1
                                // [0] = initial, [n] = after n moves
moves: Move[]                   // parsed once from algorithm prop
currentStep: number             // 0..moves.length
isPlaying: boolean
speed: 0.5 | 1 | 1.5 | 2       // maps to animationSpeed in store
```

### Snapshot Array

| Index | Meaning |
|-------|---------|
| 0 | Initial state (before any moves) |
| 1 | After move 0 |
| n | After move n−1 |
| moves.length | After all moves |

---

## Component Interface

```ts
interface AlgorithmPlayerProps {
  algorithm: string;                        // e.g. "R U R' U R U2 R'"
  initialState?: CubeFaces;                 // solved if omitted
  highlights?: Record<number, string[]>;    // step index → cubie IDs to highlight
  title?: string;                           // e.g. "Sune"
  description?: string;
}
```

---

## Features

### 1. Snapshot Pre-computation

On mount and on `algorithm`/`initialState` prop change:
1. Create local `CubeEngine`, call `setState(initialState)` or leave solved.
2. Push `engine.getState()` → `snapshots[0]`.
3. For each move: `engine.applyMove(m)`, push `engine.getState()` → `snapshots[i+1]`.
4. Set global engine + store to `snapshots[0]`.
5. Set `currentStep = 0`, `isPlaying = false`.

### 2. Transport Controls

| Button | Action | Disabled when |
|--------|--------|---------------|
| Play/Pause | Toggle `isPlaying` | At end AND playing → auto-stop |
| Step Forward (►\|) | Animate one move forward | `isAnimating` or at end |
| Step Back (\|◄) | Instant restore to previous snapshot | `isAnimating` or at step 0 |
| Reset (⟲) | Instant restore to snapshot[0] | — |
| 0.5x / 1x / 1.5x / 2x | Set speed via `setAnimationSpeed` | — |

### 3. Auto-play Loop

Uses a `useEffect` watching `[isPlaying, isAnimating, currentStep]`:
```
if (isPlaying && !isAnimating && currentStep < moves.length) → stepForward()
if (isPlaying && currentStep >= moves.length) → setIsPlaying(false)
```

`stepForward()`:
1. Guard: return if `isAnimating` or `currentStep >= moves.length`.
2. Await `animateMove(moves[currentStep].notation)`.
3. Increment `currentStep`.

`stepBack()`:
1. Guard: return if `isAnimating` or `currentStep === 0`.
2. Decrement `currentStep`.
3. `cubeEngine.setState(snapshots[newStep])`.
4. `useCubeStore.setState({ faces: snapshots[newStep] })`.

### 4. Algorithm Notation Display

- Parses moves from `algorithm` string for display.
- Completed moves (index < `currentStep`): dimmed (`text-[#94A3B8]`).
- Current move (index === `currentStep`): bold, blue (`font-bold text-[#2563EB]`), used when the *next* move to execute is this one.
- Upcoming moves (index > `currentStep`): normal (`text-[#1E293B]`).
- Move counter: "Move {currentStep} of {moves.length}".

### 5. Progress Bar

Thin bar (h-1) below the cube, filled width = `(currentStep / moves.length) * 100%`. Blue fill.

### 6. Highlights

`highlights` prop maps step index → cubie IDs. Pass `highlights?.[currentStep] ?? []` to `CubeViewer`'s `highlightedCubies` prop.

### 7. Keyboard Shortcuts

Container div has `tabIndex={0}` and `onKeyDown` handler:
- `Space` → play/pause
- `ArrowRight` → step forward
- `ArrowLeft` → step back
- `r` / `R` → reset

### 8. Speed and Store

When speed changes, call `useCubeStore.getState().setAnimationSpeed(speed)`. Restore to `1` on unmount to avoid leaving a stale speed.

---

## Layout

```
┌─────────────────────────────────────────┐
│  Title (if provided)                    │
│  Description (if provided)              │
│  ─────────────────────────────────────  │
│         [ 3D CubeViewer 300×300 ]       │
│  ──────────────────── progress bar ──── │
│  R  U  R'  U  R  U2  R'   Move 3 of 7  │
│  ─────────────────────────────────────  │
│  |◄   ◄   ▶/II   ►   ⟲  [0.5 1 1.5 2] │
└─────────────────────────────────────────┘
```

- White card, rounded-xl, shadow-sm, border border-[#E2E8F0]
- Max-width 500px on desktop, full-width on mobile
- Cube centered, notation below, controls below that

---

## Landing Page Change

Remove the Phase 2D test controls block from `src/app/page.tsx`. Replace with:

```tsx
<AlgorithmPlayer algorithm="R U R' U'" title="Test Playback" />
```

The player is positioned where the test controls were — below the hero section, above the feature grid.

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/cube/AlgorithmPlayer.tsx` | New file |
| `src/app/page.tsx` | Remove test buttons, add AlgorithmPlayer demo |
