import { describe, it, expect } from "vitest";
import { CubeEngine, parseAlgorithm } from "@/lib/cubeEngine";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function applySetup(scramble: string): CubeEngine {
  const engine = new CubeEngine();
  if (scramble) engine.applyAlgorithm(scramble);
  return engine;
}

function hasYellowCross(engine: CubeEngine): boolean {
  const u = engine.getState().U;
  return (
    u[0][1] === "yellow" &&
    u[1][0] === "yellow" &&
    u[1][1] === "yellow" &&
    u[1][2] === "yellow" &&
    u[2][1] === "yellow"
  );
}

function isOllSolved(engine: CubeEngine): boolean {
  return engine.getState().U.every((row) => row.every((c) => c === "yellow"));
}

function isValidAlgorithm(alg: string): boolean {
  try {
    const moves = parseAlgorithm(alg);
    return moves.length > 0;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Tests (populated in later tasks)
// ---------------------------------------------------------------------------

describe("beginner tutorial content", () => {
  it.todo("test cases added in subsequent tasks");
});
