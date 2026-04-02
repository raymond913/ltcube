import { describe, it, expect } from "vitest";
import { CubeEngine } from "@/lib/cubeEngine";
import { buildPlaybackState } from "../AlgorithmPlayer";

describe("buildPlaybackState", () => {
  it("produces snapshots.length === moves.length + 1", () => {
    const { snapshots, moves } = buildPlaybackState("R U R'");
    expect(snapshots).toHaveLength(moves.length + 1);
    expect(moves).toHaveLength(3);
  });

  it("snapshot[0] is solved when no initialState provided", () => {
    const { snapshots } = buildPlaybackState("R U");
    const solvedEngine = new CubeEngine();
    expect(snapshots[0]).toEqual(solvedEngine.getState());
  });

  it("snapshot[0] matches a provided initialState", () => {
    const engine = new CubeEngine();
    engine.applyAlgorithm("R U R'");
    const scrambled = engine.getState();

    const { snapshots } = buildPlaybackState("U", scrambled);
    expect(snapshots[0]).toEqual(scrambled);
  });

  it("snapshot[n] equals applying the first n moves from initialState", () => {
    const { snapshots, moves } = buildPlaybackState("R U");

    // Manually replay and compare
    const engine = new CubeEngine();
    engine.applyMove(moves[0]);
    expect(snapshots[1]).toEqual(engine.getState());

    engine.applyMove(moves[1]);
    expect(snapshots[2]).toEqual(engine.getState());
  });

  it("does not mutate a provided initialState object", () => {
    const engine = new CubeEngine();
    engine.applyAlgorithm("R");
    const state = engine.getState();
    const stateCopy = JSON.parse(JSON.stringify(state)) as typeof state;

    buildPlaybackState("U R U'", state);

    expect(state).toEqual(stateCopy);
  });

  it("handles an empty algorithm", () => {
    const { snapshots, moves } = buildPlaybackState("");
    expect(moves).toHaveLength(0);
    expect(snapshots).toHaveLength(1);
  });
});
