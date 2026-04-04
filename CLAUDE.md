# CLAUDE.md — LTCube Project Context

## Project Overview
LTCube (Learn to Cube) — interactive web app teaching beginners to solve a 3x3 Rubik's Cube. 3D cube with algorithm playback, tutorials, trainers, progress tracking.

v1 Scope: Beginner method — White Cross, White Corners, Second Layer, 2-Look OLL (10 cases), 2-Look PLL (6 cases).

## Tech Stack
- Next.js (App Router, TypeScript)
- React Three Fiber + Three.js (all R3F components use dynamic import with ssr: false)
- Tailwind CSS v4 (CSS-based @theme, no tailwind.config.ts)
- Zustand + localStorage persist
- GSAP for cube face rotation animations

## Design
Light/clean theme. White/light gray (#F8FAFC) backgrounds, blue (#2563EB) accent, Inter font. Subtle shadows, rounded corners.

## 3D Cube Architecture (IMPORTANT — recently rewritten)
The cube uses a PERSISTENT CUBIE architecture:
- 26 cubies are persistent Three.js Object3D refs — NOT re-created on render
- Each cubie carries its colored stickers permanently — colors are NEVER reassigned
- On a face turn: 9 cubies are grouped under a pivot, animated, then reparented back with updated world transforms — they STAY at their new positions
- Face detection uses world position checks (e.g., R face = cubies with worldPosition.x ≈ 1) with floating point tolerance
- cubeEngine tracks state for game logic (isSolved, stage detection) but does NOT drive rendering
- The 3D scene tracks positions independently from the engine
- cubeStore.animateMove() triggers 3D animation AND updates engine
- cubeStore.applyInstant(alg) applies moves without animation (for loading states)
- cubeStore.reset() resets both 3D positions and engine state
- NO transparency or dimming on cubies — all fully opaque

## Cube Colors
- Right (+X): Red #DC2626
- Left (-X): Orange #EA580C
- Top (+Y): Yellow #EAB308
- Bottom (-Y): White #FFFFFF
- Front (+Z): Blue #2563EB
- Back (-Z): Green #16A34A
- Internal: Dark gray #1E1E1E

## Animation Settings
- Default: 400ms per move at 1x
- 0.5x = 800ms, 1x = 400ms, 1.5x = 267ms, 2x = 200ms
- Ease: "power2.inOut"
- Move queue: sequential, never overlapping

## Routes
/, /learn, /learn/white-cross, /learn/white-corners, /learn/second-layer, /learn/oll, /learn/pll, /trainer, /progress, /reference

## File Structure
```
src/
├── app/              # Next.js App Router pages
├── components/
│   ├── cube/         # CubeViewer, CubeScene, Cubie, AlgorithmPlayer
│   ├── tutorial/     # TutorialLayout, StepContent, AlgorithmCard, CaseRecognition
│   ├── trainer/      # (Phase 5)
│   ├── progress/     # (Phase 6)
│   └── ui/           # Sidebar, shared UI
├── data/beginner/    # JSON content for all tutorial steps
├── lib/              # cubeEngine, cubeUtils, scrambleGenerator, solverHeuristics
└── stores/           # cubeStore, progressStore (Zustand)
```

## Build Phases
1. ✅ Project Foundation
2. ✅ 3D Cube Engine (persistent cubie architecture with GSAP animation)
3. ✅ Algorithm Playback System
4. ✅ Tutorial Content & Pages (4A ✅, 4B ✅, 4C ✅)
5. Trainer Modes (5A pattern recognition, 5B solve-along)
6. Progress Dashboard & Reference Page (6A dashboard, 6B reference)
7. Landing Page & Polish

## Coding Rules — FOLLOW THESE ON EVERY TASK
- Do not explain your reasoning or add code comments unless asked.
- Do not refactor or modify any working code that isn't part of the current task.
- Provide complete file replacements, not partial snippets.
- Only create/modify files specified in the task. Do not touch unrelated files.
- After making changes, list what files you changed and what you did in one sentence each. Nothing more.
- If you need to read a file, read it silently. Do not print its contents back to me unless I ask.
- Use TypeScript for all files.
- Use --legacy-peer-deps for npm installs if conflicts arise.
