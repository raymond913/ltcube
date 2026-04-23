import { create } from "zustand";
import { CubeEngine, type CubeFaces, parseAlgorithm } from "@/lib/cubeEngine";
import { generateScramble } from "@/lib/scrambleGenerator";

// Singleton engine — lives for the lifetime of the app session.
const _engine = new CubeEngine();

// ---------------------------------------------------------------------------
// Animation bridge — module-level, never serialised into Zustand state
// ---------------------------------------------------------------------------

let _animChain: Promise<void> = Promise.resolve();
let _pendingCount = 0;
let _animHandler: ((move: string, durationMs: number) => Promise<void>) | null = null;
let _instantHandler: ((alg: string | null) => void) | null = null;

/** Called by CubeScene on mount — registers the GSAP animation handler. */
export function registerAnimationHandler(
  fn: (move: string, durationMs: number) => Promise<void>,
): void {
  _animHandler = fn;
}

/** Called by CubeScene on unmount. */
export function unregisterAnimationHandler(): void {
  _animHandler = null;
}

/**
 * Called by CubeScene on mount — registers the instant (no-animation) apply handler.
 * alg: algorithm string to apply from solved, or null to just reset to solved.
 *
 * On registration, immediately consumes any `pendingInstantAlg` that was queued
 * before CubeScene mounted (e.g. on initial page load when the 3D canvas isn't
 * ready yet when AlgorithmPlayer's effects first fire).
 */
export function registerInstantHandler(
  fn: (alg: string | null) => void,
): void {
  _instantHandler = fn;
  // Drain any pending instant that arrived before we were mounted.
  const pending = useCubeStore.getState().pendingInstantAlg;
  if (pending !== null) {
    fn(pending === "" ? null : pending); // "" encodes "reset to solved"
    useCubeStore.setState({ pendingInstantAlg: null });
  }
}

/** Called by CubeScene on unmount. */
export function unregisterInstantHandler(): void {
  _instantHandler = null;
}

/**
 * Called by CubeScene after GSAP completes a move.
 * Applies the move to the engine and pushes the new face state into Zustand.
 */
export function commitAnimatedMove(move: string): void {
  _engine.applyMoveString(move);
  useCubeStore.setState({ faces: _engine.getState() });
}

/** Execute one move — via handler if registered, else instant fallback. */
async function _runSingle(move: string): Promise<void> {
  const durationMs = 650 / useCubeStore.getState().animationSpeed;
  if (_animHandler) {
    await _animHandler(move, durationMs);
  } else {
    _engine.applyMoveString(move);
    useCubeStore.setState({ faces: _engine.getState() });
  }
}

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

interface CubeStore {
  faces: CubeFaces;
  highlights: string[];
  isAnimating: boolean;
  animationSpeed: number;
  /**
   * Holds an alg string that CubeScene should apply instantly as soon as its
   * instant handler is registered.  Set by `applyInstant` when `_instantHandler`
   * is not yet registered (race on initial page load due to next/dynamic).
   * "" encodes "reset to solved".  null means nothing pending.
   */
  pendingInstantAlg: string | null;

  execute: (move: string) => void;
  applyAlgorithm: (alg: string) => void;
  applyInstant: (alg: string) => void;
  reset: () => void;
  scramble: () => void;
  setHighlights: (cubies: string[]) => void;
  clearHighlights: () => void;

  animateMove: (move: string) => Promise<void>;
  animateAlgorithm: (alg: string) => Promise<void>;
  setAnimationSpeed: (speed: number) => void;
}

export const useCubeStore = create<CubeStore>()((set, get) => ({
  faces: _engine.getState(),
  highlights: [],
  isAnimating: false,
  animationSpeed: 1,
  pendingInstantAlg: null,

  execute: (move) => {
    _engine.applyMoveString(move);
    set({ faces: _engine.getState() });
  },

  applyAlgorithm: (alg) => {
    _engine.applyAlgorithm(alg);
    set({ faces: _engine.getState() });
  },

  applyInstant: (alg) => {
    _engine.reset();
    _engine.applyAlgorithm(alg);
    if (_instantHandler) {
      // Handler is registered — apply immediately and leave no pending state.
      _instantHandler(alg || null);
      set({ faces: _engine.getState(), pendingInstantAlg: null });
    } else {
      // CubeScene not mounted yet (next/dynamic still loading on first render).
      // Store the alg so registerInstantHandler can pick it up when ready.
      set({ faces: _engine.getState(), pendingInstantAlg: alg });
    }
  },

  reset: () => {
    _engine.reset();
    // "" encodes "reset to solved" so registerInstantHandler can distinguish
    // "nothing pending" (null) from "pending reset" ("").
    if (_instantHandler) {
      _instantHandler(null);
      set({ faces: _engine.getState(), pendingInstantAlg: null });
    } else {
      set({ faces: _engine.getState(), pendingInstantAlg: "" });
    }
  },

  scramble: () => {
    get().animateAlgorithm(generateScramble(20));
  },

  setHighlights: (cubies) => set({ highlights: cubies }),
  clearHighlights: () => set({ highlights: [] }),

  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),

  animateMove: (move): Promise<void> => {
    _pendingCount++;
    set({ isAnimating: true });
    const p = _animChain.then(() => _runSingle(move));
    _animChain = p.catch(() => {});
    return p.finally(() => {
      _pendingCount--;
      if (_pendingCount === 0) set({ isAnimating: false });
    });
  },

  animateAlgorithm: (alg): Promise<void> => {
    const moves = parseAlgorithm(alg);
    return moves.reduce<Promise<void>>(
      (chain, m) => chain.then(() => get().animateMove(m.notation)),
      Promise.resolve(),
    );
  },
}));

/** Imperative access to the engine for non-React code (e.g. algorithm playback). */
export { _engine as cubeEngine };
