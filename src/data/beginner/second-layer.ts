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
      title: "Edge goes to the right",
      explanation:
        "The blue-red edge sits on U with blue facing front. The red sticker faces up, meaning the edge needs to travel right into the FR slot. Align U so blue faces the blue centre, then run Right Insert.",
      algorithm: "U R U' R' U' F' U F",
      algorithmName: "Right Insert",
      initialState: "U R U' R' U' F' U F U'",
      solutionMoves: "U R U' R' U' F' U F",
      highlightPieces: ["UF", "FR"],
    },
    {
      id: "sl-left",
      title: "Edge goes to the left",
      explanation:
        "The blue-orange edge sits on U with blue facing front. The orange sticker faces up, meaning the edge needs to travel left into the FL slot. Align U so blue faces the blue centre, then run Left Insert.",
      algorithm: "U' L' U L U F U' F'",
      algorithmName: "Left Insert",
      initialState: "U' L' U L U F U' F' U",
      solutionMoves: "U' L' U L U F U' F'",
      highlightPieces: ["UF", "FL"],
    },
    {
      id: "sl-flipped",
      title: "Edge is stuck and flipped",
      explanation:
        "The blue-red edge is in the FR slot but flipped — blue faces right and red faces front. You cannot insert directly. Run the Right Insert algorithm once to kick it out and up; it will land on U correctly oriented, and you can then insert it normally.",
      tip: "Use any insert algorithm to knock the flipped edge out of the middle layer — it will land on top where you can solve it normally.",
      algorithm: "U R U' R' U' F' U F",
      algorithmName: "Right Insert",
      initialState: "U R U' R' U' F' U F R U' R' U' F' U F",
      solutionMoves: "U R U' R' U' F' U F U R U' R' U' F' U F",
      highlightPieces: ["FR"],
    },
  ],
};
