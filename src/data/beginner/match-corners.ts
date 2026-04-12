import type { TutorialStep } from "@/lib/tutorialTypes";

export const matchCorners: TutorialStep = {
  id: "match-corners",
  title: "Match Corners",
  description: "Permute the top layer corners into their correct positions using U R U' L' U R' U' L — without disturbing the cross.",
  concepts: ["corner permutation", "Y perm style", "anchor corner"],
  substeps: [
    {
      id: "mcr-one-correct",
      title: "One corner already correct",
      explanation: "Find the one corner that belongs in its current position (colours match, even if not oriented). Hold that corner at front-right, then run U R U' L' U R' U' L to cycle the other three into place.",
      tip: "A corner is 'correct' if its three colours match the three centres at that corner — it might still be twisted, and that's fine for this step.",
      algorithmName: "Corner Cycle",
      algorithm: "U R U' L' U R' U' L",
      initialState: "L' U L U' R U' L' U R'",
      solutionMoves: "U R U' L' U R' U' L",
      highlightPieces: ["UFR", "UBR", "UBL", "UFL"],
      visibleCubies: ["1,1,1", "1,1,-1", "-1,1,-1", "-1,1,1"],
      arrows: [
        { from: [-1, 1, 1], to: [1, 1, 1], color: "#EAB308" },
        { from: [1, 1, -1], to: [-1, 1, 1], color: "#EAB308" },
        { from: [-1, 1, -1], to: [1, 1, -1], color: "#EAB308" },
      ],
    },
    {
      id: "mcr-none-correct",
      title: "No corners correct",
      explanation: "None of the four corners is in the right position. Hold any corner at front-right and run U R U' L' U R' U' L once — this will put exactly one corner in the correct position. Then find it and do the algorithm once more.",
      tip: "After the first run, look at all four corners again — one will now match. Move that one to front-right and repeat.",
      algorithmName: "Corner Cycle (×2)",
      algorithm: "U R U' L' U R' U' L",
      initialState: "y2 L' U L U' R U' L' U R'",
      solutionMoves: "U R U' L' U R' U' L",
      highlightPieces: ["UFR", "UBR", "UBL", "UFL"],
      visibleCubies: ["1,1,1", "1,1,-1", "-1,1,-1", "-1,1,1"],
      arrows: [
        { from: [1, 1, 1], to: [-1, 1, -1], color: "#EAB308" },
        { from: [-1, 1, 1], to: [1, 1, 1], color: "#EAB308" },
        { from: [1, 1, -1], to: [-1, 1, 1], color: "#EAB308" },
        { from: [-1, 1, -1], to: [1, 1, -1], color: "#EAB308" },
      ],
    },
  ],
};
