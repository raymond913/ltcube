import { create } from "zustand";
import { CubeEngine, type CubeFaces } from "@/lib/cubeEngine";
import { generateScramble } from "@/lib/scrambleGenerator";

// Singleton engine — lives for the lifetime of the app session.
// Not stored in Zustand state to avoid serialization issues.
const _engine = new CubeEngine();

interface CubeStore {
  /** Snapshot of the engine's face color state — updated after every action. */
  faces: CubeFaces;
  /** Cubie IDs to highlight (e.g. ["UFR", "UF"] for a tutorial step). */
  highlights: string[];

  /** Apply a single move string, e.g. "R", "U'", "F2". */
  execute: (move: string) => void;
  /** Apply a full algorithm string, e.g. "R U R' U'". */
  applyAlgorithm: (alg: string) => void;
  /** Return cube to solved state. */
  reset: () => void;
  /** Apply a random 20-move scramble. */
  scramble: () => void;
  /** Set which cubie IDs are highlighted. */
  setHighlights: (cubies: string[]) => void;
  /** Remove all highlights. */
  clearHighlights: () => void;
}

export const useCubeStore = create<CubeStore>()((set) => ({
  faces: _engine.getState(),
  highlights: [],

  execute: (move) => {
    _engine.applyMoveString(move);
    set({ faces: _engine.getState() });
  },

  applyAlgorithm: (alg) => {
    _engine.applyAlgorithm(alg);
    set({ faces: _engine.getState() });
  },

  reset: () => {
    _engine.reset();
    set({ faces: _engine.getState() });
  },

  scramble: () => {
    _engine.applyAlgorithm(generateScramble(20));
    set({ faces: _engine.getState() });
  },

  setHighlights: (cubies) => set({ highlights: cubies }),
  clearHighlights: () => set({ highlights: [] }),
}));

/** Imperative access to the engine for non-React code (e.g. algorithm playback). */
export { _engine as cubeEngine };
