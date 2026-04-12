import type { TutorialStep } from "@/lib/tutorialTypes";

export const secondLayer: TutorialStep = {
  id: "second-layer",
  title: "Second Layer",
  description: "Solve the middle layer by inserting the four edge pieces into their correct slots using the Right Insert or Left Insert algorithm.",
  concepts: ["right insert", "left insert", "extract stuck edge"],
  substeps: [
    {
      id: "sl-right",
      title: "Edge Goes Right",
      explanation: "The edge is on the top layer and needs to go to the right slot. Align it with U so its side colour matches the front center, then run U R U' R' U' F' U F.",
      tip: "Look at the side sticker of the edge on the U layer — if it matches the front center, use the Right Insert.",
      algorithmName: "Right Insert",
      algorithm: "U R U' R' U' F' U F",
      initialState: "F' U' F U R U R' U'",
      solutionMoves: "U R U' R' U' F' U F",
      highlightPieces: ["blue-red-edge", "blue-center", "red-center"],
      visibleCubies: ["1,0,1", "0,0,1", "1,0,0"],
      arrows: [
        { from: [0, 1, 1], to: [1, 0, 1], color: "#2563EB" },
      ],
    },
    {
      id: "sl-left",
      title: "Edge Goes Left",
      explanation: "The edge is on the top layer and needs to go to the left slot. Align it with U so its side colour matches the front center, then run U' L' U L U F U' F'.",
      tip: "If the side sticker matches the front center but you need to go left, use the Left Insert.",
      algorithmName: "Left Insert",
      algorithm: "U' L' U L U F U' F'",
      initialState: "F U F' U' L' U' L U",
      solutionMoves: "U' L' U L U F U' F'",
      highlightPieces: ["blue-orange-edge", "blue-center", "orange-center"],
      visibleCubies: ["-1,0,1", "0,0,1", "-1,0,0"],
      arrows: [
        { from: [0, 1, 1], to: [-1, 0, 1], color: "#2563EB" },
      ],
    },
    {
      id: "sl-stuck",
      title: "Edge Stuck in Second Layer",
      explanation: "The edge is already in a middle-layer slot but wrongly placed or flipped. Run the Right Insert to pop it out to the top layer, then solve it normally with the correct algorithm.",
      tip: "Use any insert algorithm to knock the flipped edge out of the middle layer — it'll land on top, where you can then solve it normally.",
      algorithmName: "Kick Out",
      algorithm: "U R U' R' U' F' U F",
      initialState: "",
      solutionMoves: "U R U' R' U' F' U F",
      highlightPieces: ["blue-red-edge", "blue-center", "red-center"],
      visibleCubies: ["1,0,1", "0,0,1", "1,0,0"],
      arrows: [
        { from: [1, 0, 1], to: [0, 1, 1], color: "#2563EB" },
      ],
    },
  ],
};
