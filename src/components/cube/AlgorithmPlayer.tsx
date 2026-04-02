"use client";

import { useEffect, useCallback, useState } from "react";
import { CubeViewer } from "@/components/cube/CubeViewer";
import {
  CubeEngine,
  parseAlgorithm,
  type CubeFaces,
  type Move,
} from "@/lib/cubeEngine";
import { useCubeStore, cubeEngine } from "@/stores/cubeStore";

// ---------------------------------------------------------------------------
// Pure helper — pre-computes one CubeFaces snapshot per step.
// Uses a throw-away local engine so the global singleton is untouched.
// ---------------------------------------------------------------------------

export function buildPlaybackState(
  algorithm: string,
  initialState?: CubeFaces,
): { snapshots: CubeFaces[]; moves: Move[] } {
  const engine = new CubeEngine();
  if (initialState) engine.setState(initialState);

  const moves = parseAlgorithm(algorithm);
  const snapshots: CubeFaces[] = [engine.getState()];

  for (const move of moves) {
    engine.applyMove(move);
    snapshots.push(engine.getState());
  }

  return { snapshots, moves };
}

// Component placeholder — filled in Task 2
export function AlgorithmPlayer() {
  return null;
}
