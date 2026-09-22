# CLAUDE.md — LTCube

## Coding Rules — ALWAYS FOLLOW
- NEVER spend more than 30 seconds thinking. Start writing code immediately.
- Do not plan. Do not analyze. Do not explain. Just make the changes.
- Do not read files unless absolutely necessary to make the edit.
- Make the smallest possible change to accomplish the task.
- No comments, no explanations, no summaries unless asked.
- Commit changes automatically after completing each task.
- Provide complete file replacements, not partial snippets.
- Only create/modify files specified in the task. Do not touch unrelated files.
- After making changes, list what files you changed in one sentence each. Nothing more.
- Do NOT run npm run dev, npm start, or any dev server after completing a task.
- Use TypeScript. Use --legacy-peer-deps for npm installs.

## Project
LTCube — beginner Rubik's Cube learning app with 3D interactive cube.

## Stack
Next.js App Router, TypeScript, React Three Fiber, Tailwind CSS v4, Zustand + localStorage, GSAP

## 3D Cube Look
- Classic stickered look: colored stickers on black (#111111) rounded body
- RoundedBox body with corner radius 0.12 (speedcube style)
- Stickers: 0.82 scale of face, raised 0.005, slight corner rounding
- Sticker material: MeshStandardMaterial, roughness 0.35, metalness 0.05
- Body material: roughness 0.7, metalness 0.1
- Cubie gap: 0.06 units
- Lighting: ambient 0.5, directional [5,8,6] at 0.7, fill [-3,-2,-4] at 0.3
- Ghost system: non-visibleCubies render as transparent ghost (body #3A3A3A + stickers at 0.25 opacity, transparent: true)
- Persistent cubie architecture: colors never reassigned, cubies carry stickers permanently

## Cube Colors
R(+X): #DC2626, L(-X): #EA580C, U(+Y): #EAB308, D(-Y): #FFFFFF, F(+Z): #2563EB, B(-Z): #16A34A

## Tutorial Design
- Cross: white on top (x2 prefix), short intuitive moves (1-4 moves), visibleCubies ghosts irrelevant pieces
- Corners: short example moves (3-6 moves), visibleCubies ghosts irrelevant pieces
- Second Layer: "Edge Goes Right" / "Edge Goes Left" / "Edge in Wrong Slot" / "Edge Flipped in Slot"
- OLL: 10 cases in recognition order — 3 edge orientation (Dot, Small L, Line) then 7 corner orientation (Sune, Anti-Sune, H, Pi, U, T, L)
- PLL: 6 cases in recognition order — 2 corner perms (Adjacent, Diagonal) then 4 edge perms (Ua, Ub, H, Z)
- OLL/PLL: no visibleCubies (all pieces visible), F2L solved in starting state
- initialState = inverse of algorithm, guarantees playing the algorithm solves the case
- visibleCubies prop flows: TutorialLayout → AlgorithmPlayer → CubeViewer → CubeScene.applyAppearance

## 3D Cube Architecture
- 26 persistent THREE.Group cubie objects — colors NEVER reassigned
- On face turn: 9 cubies reparented to pivot, animated, reparented back with new world transforms
- Face detection uses world position checks with floating point tolerance
- cubeEngine tracks state for game logic but does NOT drive rendering
- cubeStore.animateMove() triggers 3D animation AND updates engine
- cubeStore.applyInstant(alg) applies moves without animation
- cubeStore.reset() resets both 3D positions and engine state

## Animation
400ms/move at 1x. 0.5x=800ms, 1.5x=267ms, 2x=200ms. Ease: power2.inOut. Sequential queue.

## Design
Light/clean theme. White/#F8FAFC backgrounds, blue #2563EB accent, Inter font.

## Routes
/, /learn, /learn/cross, /learn/corners, /learn/second-layer, /learn/oll, /learn/pll, /trainer, /progress, /reference

## Build Status
Phases 1-5: ✅ (tutorial data, ghost system, visibleCubies wiring complete)
Phase 6-7: pending
