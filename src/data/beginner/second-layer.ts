import type { TutorialStep } from "@/lib/tutorialTypes";

export const secondLayer: TutorialStep = {
  id: "second-layer",
  title: "Second Layer",
  description:
    "With the first layer complete, insert the four middle-layer edges. Look for edges on the U face that contain no yellow sticker, then use the Left or Right Insert algorithm to slot them in.",
  concepts: [
    "Only edges with no yellow belong in the middle layer",
    "Align the edge on U so the front colour matches the front centre, then pick Left or Right based on which way it needs to go",
    "An edge already in the middle but wrong must be kicked out first with either insert algorithm",
  ],
  substeps: [
    {
      id: "sl-right",
      title: "Edge Goes Right",
      explanation:
        "The edge in the top layer needs to go into the right slot. Align it with the center, then execute the Right Insert.",
      algorithm: "U R U' R' U' F' U F",
      algorithmName: "Right Insert",
      initialState: "F' U' F U R U R' U'",
      solutionMoves: "U R U' R' U' F' U F",
      highlightPieces: ["UF", "FR"],
      arrows: [
        { from: [0, 1, 1], to: [1, 0, 1] },
      ],
    },
    {
      id: "sl-left",
      title: "Edge Goes Left",
      explanation:
        "This edge needs to go left. Align and execute the Left Insert.",
      algorithm: "U' L' U L U F U' F'",
      algorithmName: "Left Insert",
      initialState: "F U F' U' L' U' L U",
      solutionMoves: "U' L' U L U F U' F'",
      highlightPieces: ["UF", "FL"],
      arrows: [
        { from: [0, 1, 1], to: [-1, 0, 1] },
      ],
    },
    {
      id: "sl-flipped",
      title: "Edge Stuck & Flipped",
      explanation:
        "The edge is in the correct slot but flipped. First, extract it using the Right Insert to kick it to the top layer. Once it's on top and correctly oriented, re-insert it with the appropriate algorithm.",
      tip: "Use any insert algorithm to knock the flipped edge out of the middle layer — it will land on top where you can solve it normally.",
      algorithm: "U R U' R' U' F' U F U R U' R' U' F' U F",
      algorithmName: "Right Insert",
      initialState: "F' U' F U R U R' U' F' U' F U R U R' U'",
      solutionMoves: "U R U' R' U' F' U F U R U' R' U' F' U F",
      highlightPieces: ["FR"],
      arrows: [
        { from: [1, 0, 1], to: [0, 1, 1] },
      ],
    },
  ],
};
