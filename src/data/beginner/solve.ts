import type { TutorialStep } from "@/lib/tutorialTypes";

export const solve: TutorialStep = {
  id: "solve",
  title: "Solve",
  description: "Orient the final corners one at a time using R U R' U' until each shows yellow on top. Only rotate the bottom layer between corners — never move the whole cube.",
  concepts: ["corner orientation", "D layer rotation", "perseverance"],
  substeps: [
    {
      id: "sv-one-corner",
      title: "Orient one corner",
      explanation: "Bring an unsolved corner to the front-right-bottom slot. Apply R U R' U' repeatedly (2–5 times) until that corner shows yellow on top. The rest of the cube will look scrambled — that's normal. Once that corner is solved, only rotate the bottom layer (D or U') to bring the next unsolved corner to front-right, then repeat.",
      tip: "Never rotate the whole cube between corners — only use D or U' moves to bring the next corner to front-right.",
      algorithmName: "Orient Corner",
      algorithm: "R U R' U' R U R' U' R U R' U' R U R' U'",
      initialState: "U R U' R' U R U' R' U R U' R' U R U' R'",
      solutionMoves: "R U R' U' R U R' U' R U R' U' R U R' U'",
      highlightPieces: ["DFR-corner"],
      visibleCubies: ["1,-1,1", "0,-1,0", "0,0,1", "1,0,0"],
      arrows: [
        { from: [1, -1, 1], to: [1, 1, 1], color: "#EAB308" },
      ],
    },
    {
      id: "sv-multi-corner",
      title: "Rotate bottom and repeat",
      explanation: "After orienting one corner, turn only the bottom layer (D move) to bring the next unsolved corner to front-right. Apply R U R' U' again until it solves. Continue for all four corners. When the last corner is done the cube is complete.",
      tip: "The last D rotation returns the bottom layer to its correct position automatically — no extra moves needed at the end.",
      algorithmName: "Orient Corner",
      algorithm: "R U R' U' R U R' U'",
      initialState: "U R U' R' U R U' R'",
      solutionMoves: "R U R' U' R U R' U'",
      highlightPieces: ["DFR-corner", "DBR-corner"],
      visibleCubies: ["1,-1,1", "1,-1,-1", "0,-1,0"],
      arrows: [
        { from: [1, -1, 1], to: [1, 1, 1], color: "#EAB308" },
        { from: [1, -1, -1], to: [1, 1, -1], color: "#EAB308" },
      ],
    },
  ],
};
