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
  cameraPosition?: [number, number, number];
  /** Stickers that glow on the 3D cube to show what howToSpot refers to */
  spotStickers?: SpotSticker[];
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
