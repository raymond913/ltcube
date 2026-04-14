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
      explanation: "Edge on top needs to go into the right slot. Use the right insert.",
      algorithmName: "Right Insert",
      algorithm: "U R U' R' U' F' U F",
      initialState: "F' U' F U R U R' U'",
      highlightPieces: ["blue-red-edge", "blue-center", "red-center"],
      visibleCubies: ["0,1,0", "0,0,1", "1,0,0", "0,1,1", "1,0,1"],
      arrows: [
        { from: [0, 1, 1], to: [1, 0, 1], color: "#2563EB" },
      ],
    },
    {
      id: "sl-left",
      title: "Edge Goes Left",
      explanation: "Edge on top needs to go into the left slot. Use the left insert.",
      algorithmName: "Left Insert",
      algorithm: "U' L' U L U F U' F'",
      initialState: "F U F' U' L' U' L U",
      highlightPieces: ["blue-orange-edge", "blue-center", "orange-center"],
      visibleCubies: ["0,1,0", "0,0,1", "-1,0,0", "0,1,1", "-1,0,1"],
      arrows: [
        { from: [0, 1, 1], to: [-1, 0, 1], color: "#2563EB" },
      ],
    },
    {
      id: "sl-flipped",
      title: "Edge in correct slot but flipped",
      explanation: "Edge is in the right slot but oriented wrong. Run the right insert once to extract it to the top, then re-insert correctly.",
      algorithmName: "Right Insert",
      algorithm: "U R U' R' U' F' U F",
      initialState: "F' U' F U R U R' U'",
      highlightPieces: ["blue-red-edge", "blue-center", "red-center"],
      visibleCubies: ["0,1,0", "0,0,1", "1,0,0", "1,0,1"],
      arrows: [
        { from: [1, 0, 1], to: [0, 1, 1], color: "#2563EB" },
      ],
    },
    {
      id: "sl-wrong-slot",
      title: "Edge in wrong slot entirely",
      explanation: "Edge is stuck in the wrong middle slot. Run any insert algorithm to kick it out to the top, then solve normally.",
      algorithmName: "Right Insert",
      algorithm: "U R U' R' U' F' U F",
      initialState: "F U F' U' L' U' L U",
      highlightPieces: ["blue-red-edge", "blue-center", "red-center", "orange-center"],
      visibleCubies: ["0,1,0", "0,0,1", "1,0,0", "-1,0,0", "1,0,1", "-1,0,1"],
      arrows: [
        { from: [-1, 0, 1], to: [0, 1, 1], color: "#DC2626" },
      ],
    },
  ],
};
