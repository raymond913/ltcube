# CLAUDE.md — LTCube Project Context

## Project Overview
LTCube (Learn to Cube) is an interactive web app that teaches beginners how to solve a 3x3 Rubik's Cube. It features a 3D interactive cube with algorithm playback, step-by-step tutorials, pattern recognition trainers, solve-along mode, and progress tracking.

**v1 Scope:** Beginner method only — White Cross, White Corners, Second Layer, 2-Look OLL (10 cases), 2-Look PLL (6 cases).

## Tech Stack
- **Framework:** Next.js (App Router, TypeScript)
- **3D Engine:** React Three Fiber + Three.js
- **Styling:** Tailwind CSS (v4, uses CSS-based @theme not tailwind.config.ts)
- **State:** Zustand with localStorage persist middleware
- **Animation:** GSAP (installed) for cube face rotation tweens
- **Deployment:** Vercel

## Design Direction
Light, clean theme. White/light gray backgrounds, subtle shadows, blue (#2563EB) primary accent. Inter font. Approachable documentation-style UI — not gamified.

## Key Architecture Decisions
- All R3F components must use `dynamic(() => import(...), { ssr: false })` — Three.js cannot server-render
- All algorithm/case data lives in JSON files in `src/data/beginner/` — content-driven, no hardcoded algorithms in components
- CubeEngine (`src/lib/cubeEngine.ts`) is pure TypeScript with zero React dependencies — portable and testable
- Use `--legacy-peer-deps` for all npm installs if peer dependency conflicts arise
- Progress stored in localStorage via Zustand persist — no backend for v1
- Animation handler is registered imperatively by CubeScene on mount via `registerAnimationHandler` — decouples the store from React/Three.js
- Instant-reset handler registered via `registerInstantHandler` — called by `cubeStore.reset()` and `cubeStore.applyInstant(alg)`
- **Persistent cubie architecture:** 26 `THREE.Group` objects created once on mount; colors baked permanently; world transforms accumulate across moves via reparent→pivot-GSAP→reparent-back
- F: `−π/2` around Z, B: `+π/2` around Z (physical rotation convention — no compensating flip needed because rendering is no longer color-derived from engine state)
- AlgorithmPlayer step-back handled via Zustand `subscribe` + move-log prefix matching in CubeScene
- Sticker planes use `THREE.DoubleSide` so they remain visible from both sides during rotation

## Cube Color Scheme (standard)
- Right (+X): Red #DC2626
- Left (-X): Orange #EA580C
- Top (+Y): Yellow #EAB308
- Bottom (-Y): White #FFFFFF
- Front (+Z): Blue #2563EB
- Back (-Z): Green #16A34A
- Internal faces: Dark gray #1E1E1E

## Site Routes
- `/` — Landing page
- `/learn` — Beginner method overview (5 steps)
- `/learn/white-cross` — Step 1 tutorial
- `/learn/white-corners` — Step 2 tutorial
- `/learn/second-layer` — Step 3 tutorial
- `/learn/oll` — Step 4: 2-Look OLL (10 cases)
- `/learn/pll` — Step 5: 2-Look PLL (6 cases)
- `/trainer` — Pattern recognition quiz + Solve Along mode
- `/progress` — Dashboard with stats, streaks, mastery grid
- `/reference` — Quick algorithm lookup / cheat sheet

## Build Phases
1. ✅ Project Foundation (scaffold, routes, layout, stores)
2. ✅ 3D Cube Engine (static render → state engine → connect to render → animated moves)
   - 2A ✅ Static 3D cube render (26 cubies, correct colors, OrbitControls)
   - 2B ✅ CubeEngine pure TS state engine (moves, algorithm parser, cubie tracking)
   - 2C ✅ Connect engine state to 3D render (colors update on moves)
   - 2D ✅ Smooth rotation animations (GSAP pivot group, move queue, animateAlgorithm, speed multiplier)
3. Algorithm Playback System (play/pause/step/rewind + highlighting)
4. Tutorial Content & Pages (JSON data + tutorial UI + OLL/PLL recognition)
5. Trainer Modes (pattern recognition + solve-along)
6. Progress Dashboard & Reference Page
7. Landing Page & Polish

**Update the checkmarks above as phases are completed.**

## Animation System (Phase 2D)

### cubeStore exports
- `animateMove(move): Promise<void>` — queues and animates a single move
- `animateAlgorithm(alg): Promise<void>` — animates all moves in an alg string sequentially
- `applyInstant(alg): void` — applies moves instantly from solved (for loading states)
- `isAnimating: boolean` — true while any animation is in progress
- `animationSpeed: number` — multiplier (default 1); duration = 400 / speed ms
- `setAnimationSpeed(speed): void`
- `scramble()` — animates 20 moves
- `registerAnimationHandler(fn)` / `unregisterAnimationHandler()` — bridge between store and CubeScene
- `registerInstantHandler(fn)` / `unregisterInstantHandler()` — instant-apply bridge
- `commitAnimatedMove(move)` — exported for CubeScene to call post-tween

### Speed reference
| Multiplier | Duration |
|---|---|
| 0.5× | 800 ms |
| 1× | 400 ms |
| 1.5× | 267 ms |
| 2× | 200 ms |

### Rotation axis map (persistent cubie convention)
| Face | Axis | Angle |
|---|---|---|
| R | X | −π/2 |
| L | X | +π/2 |
| U | Y | −π/2 |
| D | Y | +π/2 |
| F | Z | −π/2 |
| B | Z | +π/2 |

**Note:** F is −π/2 and B is +π/2. The old architecture used +π/2 / −π/2 as a compensating
flip for the engine's Z-face strip direction in color rendering. The persistent cubie
architecture drives THREE.js objects directly — no compensation needed.

## File Structure Reference
```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── cube/         # CubeViewer, CubeScene, Cubie, (AlgorithmPlayer — Phase 3)
│   ├── tutorial/     # TutorialLayout, StepContent, CaseRecognition
│   ├── trainer/      # PatternTrainer, SolveAlong
│   ├── progress/     # Dashboard components
│   └── ui/           # Sidebar, shared UI components
├── data/
│   └── beginner/     # JSON content for all tutorial steps
├── lib/              # cubeEngine.ts, cubeUtils.ts, scrambleGenerator.ts, solverHeuristics.ts
└── stores/           # cubeStore.ts, progressStore.ts (Zustand)
```

## Coding Preferences
- Provide complete file replacements, not partial snippets
- Use TypeScript for all files
- Keep components focused — one responsibility per file
- When fixing bugs, show the exact error context and fix
