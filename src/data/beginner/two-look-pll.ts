import type { TutorialStep } from "@/lib/tutorialTypes";

export const twoLookPll: TutorialStep = {
  id: "two-look-pll",
  title: "2-Look PLL",
  description:
    "Permute the Last Layer in two passes. First, swap the corners into their correct positions. Then cycle the edges into place. After PLL, the cube is solved.",
  concepts: [
    "PLL = Permute Last Layer: move pieces to their correct positions (colours already face up)",
    "Look 1 — Corner permutation: 3 possible cases (solved, adjacent swap, diagonal swap)",
    "Look 2 — Edge permutation: 4 possible cases (solved, Ua, Ub, H, Z)",
    "Recognition: look at the side stickers of the top layer only",
  ],
  substeps: [
    {
      id: "pll-adj",
      title: "Adjacent Swap",
      explanation:
        "Two adjacent corners are swapped. Hold the cube so the two swapped corners are at the UFR and UBR positions (front-right and back-right), then apply Adjacent Swap.",
      algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
      algorithmName: "Adjacent Swap",
      initialState: "F R U' R' U R U R2' F' R U R U' R'",
      highlightPieces: ["UFR", "UBR"],
    },
    {
      id: "pll-diag",
      title: "Diagonal Swap",
      explanation:
        "Two diagonal corners are swapped. Any AUF is fine. Apply Diagonal Swap — it's the only case where no two adjacent corners match.",
      algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
      algorithmName: "Diagonal Swap",
      initialState: "F R' F' R U R U' R' F R' U' R U R U' R' F'",
      highlightPieces: ["UFR", "UBL"],
    },
    {
      id: "pll-ua",
      title: "Ua Perm",
      explanation:
        "Three edges cycle counter-clockwise. Hold the cube so the one correct edge is at the back (UB), then apply Ua.",
      algorithm: "R U' R U R U R U' R' U' R2",
      algorithmName: "Ua Perm",
      initialState: "R2' U U R U R U R' U R' U' R'",
      highlightPieces: ["UF", "UL", "UR"],
    },
    {
      id: "pll-ub",
      title: "Ub Perm",
      explanation:
        "Three edges cycle clockwise. Hold the cube so the one correct edge is at the back (UB), then apply Ub.",
      algorithm: "R2 U R U R' U' R' U' R' U R'",
      algorithmName: "Ub Perm",
      initialState: "R U' R U R U R U' R' U' R2'",
      highlightPieces: ["UF", "UL", "UR"],
    },
    {
      id: "pll-h",
      title: "H Perm",
      explanation:
        "Opposite edges are swapped in pairs. Both UF↔UB and UL↔UR are swapped. Any AUF. Apply H Perm.",
      algorithm: "M2 U M2 U2 M2 U M2",
      algorithmName: "H Perm",
      initialState: "M2' U' M2' U2' M2' U' M2'",
      highlightPieces: ["UF", "UB", "UL", "UR"],
    },
    {
      id: "pll-z",
      title: "Z Perm",
      explanation:
        "Adjacent edges are swapped in pairs. UF↔UR and UB↔UL are swapped. Hold the cube so one matched pair is at the front-right, then apply Z Perm.",
      algorithm: "M2 U M2 U M' U2 M2 U2 M'",
      algorithmName: "Z Perm",
      initialState: "M U2' M2' U2' M U' M2' U' M2'",
      highlightPieces: ["UF", "UR", "UB", "UL"],
    },
  ],
};
