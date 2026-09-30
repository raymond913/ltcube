export interface Arrow {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
}

/** One sticker on the cube: `piece` is the cubie's identity key ("x,y,z", same as visibleCubies), `color` its original color name. */
export interface SpotSticker {
  piece: string;
  color: string;
}

/** Short floating label on the 3D cube, placed above `side` of the cube. */
export interface SpotLabel {
  text: string;
  side: "front" | "back" | "left" | "right";
}

export interface Substep {
  id: string;
  title: string;
  explanation: string;
  howToSpot?: string;
  tip?: string;
  algorithm?: string;
  algorithmName?: string;
  initialState: string;
  highlightPieces: string[];
  visibleCubies?: string[];
  solutionMoves?: string;
  arrows?: Arrow[];
  whiteOnTop?: boolean;
  stickerMask?: StickerMask;
  /**
   * Spot view: where the camera starts when the key feature is hidden from the
   * hold view (see lib/cameraViews). It holds here with the glow on, then glides
   * to the hold view. Leave unset when the feature is visible from the hold view.
   */
  cameraPosition?: [number, number, number];
  /** Stickers that glow on the 3D cube to show what howToSpot refers to */
  spotStickers?: SpotSticker[];
  /** Plain instruction for how to hold the cube, derived from the engine state after initialState */
  holdInstruction?: string;
  /** Floating labels for features on faces hidden from the hold view */
  spotLabels?: SpotLabel[];
}

export type StickerMask = "oll" | "oll-edges";

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  concepts: string[];
  substeps: Substep[];
}

export interface StepMeta {
  id: string;
  title: string;
  route: string;
  stepNumber: number;
  estimatedMinutes: number;
  caseCount?: number;
}
