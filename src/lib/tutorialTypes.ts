export interface Substep {
  id: string;
  title: string;
  explanation: string;
  tip?: string;
  algorithm?: string;
  algorithmName?: string;
  initialState: string;
  highlightPieces: string[];
  solutionMoves?: string;
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
