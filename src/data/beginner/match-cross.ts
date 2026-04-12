import type { TutorialStep } from "@/lib/tutorialTypes";

export const matchCross: TutorialStep = {
  id: "match-cross",
  title: "Match Cross",
  description: "Align the yellow cross edges so each side colour matches its centre. Use R U R' U R U2 R' — hold the two matching edges at the back and right before starting.",
  concepts: ["edge permutation", "U cycle", "headlights"],
  substeps: [
    {
      id: "mc-adjacent",
      title: "Two matching edges — adjacent",
      explanation: "Two neighbouring cross edges already match their centres. Hold them at the back and right, then run R U R' U R U2 R' U once to cycle the remaining two into place.",
      tip: "Look at the side stickers of the cross from the side — find two adjacent edges that match, then hold those at back and right.",
      algorithmName: "U Cycle",
      algorithm: "R U R' U R U2 R' U",
      initialState: "U' R U2 R' U' R U' R'",
      solutionMoves: "R U R' U R U2 R' U",
      highlightPieces: ["UF", "UB", "UL", "UR"],
      visibleCubies: ["0,1,1", "0,1,-1", "-1,1,0", "1,1,0"],
      arrows: [
        { from: [0, 1, 1], to: [1, 1, 0], color: "#EAB308" },
        { from: [1, 1, 0], to: [0, 1, -1], color: "#EAB308" },
      ],
    },
    {
      id: "mc-opposite",
      title: "Two matching edges — opposite",
      explanation: "Two opposite cross edges match, but the other two don't. Run R U R' U R U2 R' U from any angle — this creates the adjacent case, then do it once more from the correct angle.",
      tip: "After the first run you'll have two adjacent matching edges — position them at back and right, then run the algorithm again.",
      algorithmName: "U Cycle (×2)",
      algorithm: "R U R' U R U2 R' U",
      initialState: "y U' R U2 R' U' R U' R'",
      solutionMoves: "R U R' U R U2 R' U",
      highlightPieces: ["UF", "UB", "UL", "UR"],
      visibleCubies: ["0,1,1", "0,1,-1", "-1,1,0", "1,1,0"],
      arrows: [
        { from: [0, 1, 1], to: [-1, 1, 0], color: "#EAB308" },
        { from: [-1, 1, 0], to: [0, 1, -1], color: "#EAB308" },
      ],
    },
  ],
};
