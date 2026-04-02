import { beforeEach, describe, it, expect, vi } from "vitest";
import {
  useCubeStore,
  commitAnimatedMove,
  registerAnimationHandler,
  unregisterAnimationHandler,
} from "../cubeStore";

beforeEach(() => {
  useCubeStore.getState().reset();
  useCubeStore.setState({ isAnimating: false, animationSpeed: 1 });
  unregisterAnimationHandler();
});

// ---------------------------------------------------------------------------
// commitAnimatedMove
// ---------------------------------------------------------------------------

describe("commitAnimatedMove", () => {
  it("applies the move to the engine and updates faces", () => {
    const before = useCubeStore.getState().faces;
    commitAnimatedMove("R");
    const after = useCubeStore.getState().faces;
    expect(after).not.toEqual(before);
  });

  it("R then R' returns to solved state", () => {
    const solved = useCubeStore.getState().faces;
    commitAnimatedMove("R");
    commitAnimatedMove("R'");
    expect(useCubeStore.getState().faces).toEqual(solved);
  });
});

// ---------------------------------------------------------------------------
// animateMove — no handler registered (instant fallback)
// ---------------------------------------------------------------------------

describe("animateMove fallback (no handler)", () => {
  it("applies the move instantly and resolves", async () => {
    const before = useCubeStore.getState().faces;
    await useCubeStore.getState().animateMove("U");
    expect(useCubeStore.getState().faces).not.toEqual(before);
  });

  it("isAnimating is false after resolving", async () => {
    await useCubeStore.getState().animateMove("F");
    expect(useCubeStore.getState().isAnimating).toBe(false);
  });

  it("isAnimating is true during the move", async () => {
    let duringMove = false;
    registerAnimationHandler(async () => {
      duringMove = useCubeStore.getState().isAnimating;
    });
    await useCubeStore.getState().animateMove("R");
    expect(duringMove).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// animateMove — with registered handler
// ---------------------------------------------------------------------------

describe("animateMove with handler", () => {
  it("calls the registered handler with the move notation", async () => {
    const handler = vi.fn(async (_move: string, _ms: number) => {});
    registerAnimationHandler(handler);
    await useCubeStore.getState().animateMove("R");
    expect(handler).toHaveBeenCalledWith("R", 300);
  });

  it("computes durationMs = 300 / speed (speed 2 → 150ms)", async () => {
    const handler = vi.fn(async (_move: string, _ms: number) => {});
    registerAnimationHandler(handler);
    useCubeStore.getState().setAnimationSpeed(2);
    await useCubeStore.getState().animateMove("L");
    expect(handler).toHaveBeenCalledWith("L", 150);
  });

  it("computes durationMs = 300 / speed (speed 0.5 → 600ms)", async () => {
    const handler = vi.fn(async (_move: string, _ms: number) => {});
    registerAnimationHandler(handler);
    useCubeStore.getState().setAnimationSpeed(0.5);
    await useCubeStore.getState().animateMove("B");
    expect(handler).toHaveBeenCalledWith("B", 600);
  });
});

// ---------------------------------------------------------------------------
// animateAlgorithm
// ---------------------------------------------------------------------------

describe("animateAlgorithm", () => {
  it("calls animateMove for each token in the alg string, in order", async () => {
    const received: string[] = [];
    registerAnimationHandler(async (move) => { received.push(move); });
    await useCubeStore.getState().animateAlgorithm("R U R'");
    expect(received).toEqual(["R", "U", "R'"]);
  });

  it("resolves immediately for an empty string", async () => {
    await expect(useCubeStore.getState().animateAlgorithm("")).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// setAnimationSpeed
// ---------------------------------------------------------------------------

describe("setAnimationSpeed", () => {
  it("updates animationSpeed in state", () => {
    useCubeStore.getState().setAnimationSpeed(1.5);
    expect(useCubeStore.getState().animationSpeed).toBe(1.5);
  });
});
