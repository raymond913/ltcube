import type { TutorialStep } from "@/lib/tutorialTypes";

export const whiteCorners: TutorialStep = {
  id: "white-corners",
  title: "White Corners",
  description:
    "Now fill in the four white corner pieces to complete the first layer. Every corner is solved using one repeated algorithm: R U R' U'. The number of repetitions depends on the corner's orientation.",
  concepts: [
    "Corner orientation: the white sticker can face right, up, or front",
    "R U R' U' (the Sexy Move) inserts a corner from above its slot",
    "A corner trapped in the bottom layer must be extracted with R U R' first",
  ],
  substeps: [
    {
      id: "wco-above-right",
      title: "Corner above slot — white facing right",
      explanation:
        "The white-blue-red corner sits directly above its DFR slot with white facing the right (R) face. One application of R U R' U' slots it perfectly.",
      algorithm: "R U R' U'",
      algorithmName: "Sexy Move",
      initialState: "U R U' R'",
      solutionMoves: "R U R' U'",
      highlightPieces: ["DFR"],
    },
    {
      id: "wco-above-up",
      title: "Corner above slot — white facing up",
      explanation:
        "The corner is above its slot but white faces the U face. You need 3 repetitions of R U R' U' to work white away from the top and into the bottom.",
      algorithm: "R U R' U'",
      algorithmName: "Sexy Move",
      initialState: "U R U' R' U R U' R' U R U' R'",
      solutionMoves: "R U R' U' R U R' U' R U R' U'",
      highlightPieces: ["DFR"],
    },
    {
      id: "wco-above-front",
      title: "Corner above slot — white facing front",
      explanation:
        "The corner is above its slot with white facing the front (F) face. Two repetitions of R U R' U' bring it home.",
      algorithm: "R U R' U'",
      algorithmName: "Sexy Move",
      initialState: "U R U' R' U R U' R'",
      solutionMoves: "R U R' U' R U R' U'",
      highlightPieces: ["DFR"],
    },
    {
      id: "wco-stuck",
      title: "Corner trapped in the bottom layer",
      explanation:
        "The corner is already in the DFR slot but oriented wrong. Use R U R' to pop it out to the U face, then apply R U R' U' to re-insert it correctly.",
      algorithm: "R U R' U'",
      algorithmName: "Sexy Move",
      initialState: "U R U' R' U R U' R' U R U' R'",
      solutionMoves: "R U R' U' R U R' U' R U R' U'",
      highlightPieces: ["DFR"],
    },
  ],
};
