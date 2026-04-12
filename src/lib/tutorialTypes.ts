export interface Arrow {
  from: [number, number, number];
  to: [number, number, number];
  color?: string;
}

export interface Substep {
  id: string;
  title: string;
  explanation: string;
  tip?: string;
  algorithm?: string;
  algorithmName?: string;
  initialState: string;
  highlightPieces: string[];
  visibleCubies?: string[];
  solutionMoves?: string;
  arrows?: Arrow[];
  whiteOnTop?: boolean;
}

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
