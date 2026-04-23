import type { TutorialStep } from "@/lib/tutorialTypes";

export const cross: TutorialStep = {
  id: "cross",
  title: "White Cross",
  description: "Build the white cross on top by placing all four white edge pieces with their matching side colours facing outward.",
  concepts: ["white on top", "F2 insert", "D layer setup", "edge orientation"],
  substeps: [
    {
      id: "wc-bottom-matched",
      title: "Edge on bottom, matched",
      explanation: "The white-blue edge sits directly below its home slot. A single F2 brings it straight up into place.",
      algorithm: "F2",
      initialState: "x2 F2",
      highlightPieces: ["white-blue", "white-center", "blue-center"],
      visibleCubies: ["1,1,0", "-1,1,0", "0,1,1", "0,1,-1", "0,1,0", "0,-1,1"],
      whiteOnTop: true,
      arrows: [
        { from: [0, -1, 1], to: [0, 1, 1], color: "#60A5FA" },
      ],
    },
    {
      id: "wc-bottom-unmatched",
      title: "Edge on bottom, needs alignment",
      explanation: "The white-red edge is on the bottom but not under its slot. Turn D to slide it into position, then F2 lifts it up.",
      algorithm: "D F2",
      initialState: "x2 F2 D'",
      highlightPieces: ["white-red", "white-center", "red-center"],
      visibleCubies: ["1,1,0", "-1,1,0", "0,1,1", "0,1,-1", "0,1,0", "0,-1,1", "1,-1,0"],
      whiteOnTop: true,
      arrows: [
        { from: [1, -1, 0], to: [0, -1, 1], color: "#F87171" },
        { from: [0, -1, 1], to: [0, 1, 1],  color: "#60A5FA" },
      ],
    },
    {
      id: "wc-flipped",
      title: "Edge flipped on top",
      explanation: "The white-green edge is already on top but flipped — white faces forward instead of up. Use F U' R U to kick it out and re-insert it correctly.",
      algorithm: "F U' R U",
      initialState: "x2 U' R' U F'",
      highlightPieces: ["white-green", "white-center", "green-center"],
      visibleCubies: ["1,1,0", "-1,1,0", "0,1,1", "0,1,-1", "0,1,0"],
      whiteOnTop: true,
      arrows: [
        { from: [0, 1, 1], to: [1, 0, 1],  color: "#86EFAC" },
        { from: [1, 0, 1], to: [0, 1, 1],  color: "#60A5FA" },
      ],
    },
    {
      id: "wc-middle",
      title: "Edge stuck in middle",
      explanation: "The white edge is wedged in the middle layer. R lifts it to the top, U' lines it up, then F2 drops it into the cross.",
      algorithm: "R U' F2",
      initialState: "x2 F2 U R'",
      highlightPieces: ["white-blue", "white-center", "blue-center"],
      visibleCubies: ["1,1,0", "-1,1,0", "0,1,1", "0,1,-1", "0,1,0", "1,0,1"],
      whiteOnTop: true,
      arrows: [
        { from: [1, 0, 1], to: [1, 1, 0],  color: "#F87171" },
        { from: [1, 1, 0], to: [0, 1, 1],  color: "#60A5FA" },
      ],
    },
  ],
};
