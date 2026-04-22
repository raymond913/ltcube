import type { TutorialStep } from "@/lib/tutorialTypes";

export const twoLookPll: TutorialStep = {
  id: "two-look-pll",
  title: "2-Look PLL",
  description:
    "Permute the Last Layer in two passes. First, swap corners into their correct positions. Then cycle edges to complete the solve.",
  concepts: [
    "PLL = Permute Last Layer: move pieces to correct positions",
    "Look 1 — Corner permutation: fix all 4 corners (2 possible cases)",
    "Look 2 — Edge permutation: fix all 4 edges (4 possible cases)",
    "Recognition: look at the side stickers of the top layer",
  ],
  substeps: [
    {
      id: "pll-headlights",
      title: "Headlights (Adjacent Corner Swap)",
      algorithmName: "Headlights",
      explanation:
        "Two corners on the RIGHT side match colors (they look like headlights). Hold the headlights on the RIGHT, then apply the algorithm.",
      algorithm: "L U L' U' L' B L2 U' L' U' L U L' B'",
      initialState: "B L U' L' U L U L2 B' L U L U' L'",
      highlightPieces: [],
    },
    {
      id: "pll-no-headlights",
      title: "No Headlights (Diagonal Corner Swap)",
      algorithmName: "No Headlights",
      explanation:
        "No two adjacent corners match on any side. Two diagonal corners need to swap. Apply the algorithm from any angle.",
      algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
      initialState: "F R' F' R U R U' R' F R U' R' U R U R' F'",
      highlightPieces: [],
    },
    {
      id: "pll-ua",
      title: "Ua Perm (3-edge cycle clockwise)",
      algorithmName: "Ua Perm",
      explanation:
        "Three edges cycle clockwise. Hold the solved edge at the back.",
      algorithm: "R U' R U R U R U' R' U' R2",
      initialState: "R2 U R U R' U' R' U' R' U R'",
      highlightPieces: [],
    },
    {
      id: "pll-ub",
      title: "Ub Perm (3-edge cycle counter-clockwise)",
      algorithmName: "Ub Perm",
      explanation:
        "Three edges cycle counter-clockwise. Hold the solved edge at the back.",
      algorithm: "R2 U R U R' U' R' U' R' U R'",
      initialState: "R U' R U R U R U' R' U' R2",
      highlightPieces: [],
    },
    {
      id: "pll-h",
      title: "H Perm (opposite edges swap)",
      algorithmName: "H Perm",
      explanation: "Two pairs of opposite edges swap. Any starting angle works.",
      algorithm: "M2 U M2 U2 M2 U M2",
      initialState: "M2 U' M2 U2 M2 U' M2",
      highlightPieces: [],
    },
    {
      id: "pll-z",
      title: "Z Perm (adjacent edges swap)",
      algorithmName: "Z Perm",
      explanation: "Two pairs of adjacent edges swap in a Z pattern.",
      algorithm: "M2 U M2 U M' U2 M2 U2 M'",
      initialState: "M U2 M2 U2 M U' M2 U' M2",
      highlightPieces: [],
    },
  ],
};
