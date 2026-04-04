# CLAUDE.md — LTCube

## Coding Rules — ALWAYS FOLLOW
- NEVER spend more than 30 seconds thinking. Start writing code immediately.
- Do not plan. Do not analyze. Do not explain. Just make the changes.
- Do not read files unless absolutely necessary to make the edit.
- Do not verify or validate your work unless asked.
- Make the smallest possible change to accomplish the task.
- No comments, no explanations, no summaries unless asked.
- Commit changes automatically after completing each task. Do not ask for confirmation.
- Provide complete file replacements, not partial snippets.
- Only create/modify files specified in the task. Do not touch unrelated files.
- After making changes, list what files you changed in one sentence each. Nothing more.
- Do NOT run npm run dev, npm start, or any dev server after completing a task.
- Use TypeScript for all files.
- Use --legacy-peer-deps for npm installs if conflicts arise.

## Project
LTCube — interactive web app teaching beginners to solve a 3x3 Rubik's Cube. 3D cube with algorithm playback, tutorials, trainers, progress tracking. Beginner method only for v1.

## Stack
- Next.js (App Router, TypeScript)
- React Three Fiber + Three.js (dynamic import, ssr: false)
- Tailwind CSS v4 (CSS-based @theme)
- Zustand + localStorage persist
- GSAP for cube animations

## 3D Cube Architecture
- 26 persistent THREE.Group cubie objects — colors NEVER reassigned
- On face turn: 9 cubies reparented to pivot, animated, reparented back with new world transforms
- Face detection uses world position checks with floating point tolerance
- cubeEngine tracks state for game logic but does NOT drive rendering
- cubeStore.animateMove() triggers 3D animation AND updates engine
- cubeStore.applyInstant(alg) applies moves without animation
- cubeStore.reset() resets both 3D positions and engine state

## Cube Colors
R(+X): #DC2626, L(-X): #EA580C, U(+Y): #EAB308, D(-Y): #FFFFFF, F(+Z): #2563EB, B(-Z): #16A34A, Internal: #1E1E1E

## Animation
400ms/move at 1x. 0.5x=800ms, 1.5x=267ms, 2x=200ms. Ease: power2.inOut. Sequential queue.

## Design
Light/clean theme. White/#F8FAFC backgrounds, blue #2563EB accent, Inter font.

## Routes
/, /learn, /learn/white-cross, /learn/white-corners, /learn/second-layer, /learn/oll, /learn/pll, /trainer, /progress, /reference

## Build Phases
1. ✅ Project Foundation
2. ✅ 3D Cube Engine
3. ✅ Algorithm Playback System
4. ✅ Tutorial Content & Pages (4A ✅, 4B ✅, 4C ✅)
5. Trainer Modes (5A pattern recognition, 5B solve-along)
6. Progress Dashboard & Reference Page
7. Landing Page & Polish
