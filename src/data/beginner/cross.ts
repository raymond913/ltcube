import type { TutorialStep } from "@/lib/tutorialTypes";

export const cross: TutorialStep = {
  id: "cross",
  title: "White Cross",
  description: "Build the white cross on top by placing all four white edge pieces with their matching side colours facing outward.",
  concepts: ["white on top", "U layer", "insert moves"],
  substeps: [
    {
      id: "wc-case1",
      title: "Edge in front-right slot, white facing front",
      explanation: "The white-red edge sits in the middle layer between the right (red) and front (green) faces, with its white sticker facing front. R swings the right face upward, carrying the piece directly into the red cross slot with white facing up.",
      algorithm: "R",
      initialState: "x2 R'",
      highlightPieces: ["white-red", "white-center", "red-center"],
      visibleCubies: ["1,-1,0","0,-1,0","1,0,0"],
      whiteOnTop: true,
      arrows: [{ from: [1, 0, 1], to: [1, 1, 0], color: "#86EFAC" }],
    },
    {
      id: "wc-case2",
      title: "White-red flipped on top, white-green in the middle layer",
      explanation: "The white-red edge is already in the top layer but sits in the front slot with its white sticker facing forward instead of up. The white-green edge sits in the middle layer between the front (green) and left (orange) faces, white facing left. F lifts the green edge into the front cross slot while moving the red edge out of the way, then R carries the red edge up into its slot on the right.",
      algorithm: "F R",
      initialState: "x2 R' F'",
      highlightPieces: ["white-red", "white-green", "white-center", "red-center", "green-center"],
      visibleCubies: ["1,-1,0","0,-1,-1","0,-1,0","1,0,0","0,0,-1"],
      whiteOnTop: true,
      arrows: [
        { from: [0, 1, 1], to: [1, 1, 0], color: "#86EFAC" },
        { from: [-1, 0, 1], to: [0, 1, 1], color: "#86EFAC" },
      ],
    },
    {
      id: "wc-case3",
      title: "Three white edges out of place in the top layer",
      explanation: "White-red sits in the back slot and white-blue sits in the left slot — both already in the top layer but in the wrong spots — while white-orange sits in the middle layer between the front (green) and left (orange) faces with white facing left. F and R shuffle the front-layer pieces into place, then the final U rotates all four top-layer edges at once, sending red, blue, and orange into their correct slots together.",
      algorithm: "F R U",
      initialState: "x2 U' R' F'",
      highlightPieces: ["white-red", "white-blue", "white-orange", "white-center", "red-center", "blue-center", "orange-center"],
      visibleCubies: ["1,-1,0","0,-1,1","-1,-1,0","0,-1,0","1,0,0","0,0,1","-1,0,0"],
      whiteOnTop: true,
      arrows: [
        { from: [0, 1, -1], to: [1, 1, 0], color: "#86EFAC" },
        { from: [-1, 1, 0], to: [0, 1, -1], color: "#86EFAC" },
        { from: [-1, 0, 1], to: [-1, 1, 0], color: "#86EFAC" },
      ],
    },
    {
      id: "wc-case4",
      title: "Two adjacent cross edges swapped",
      explanation: "The white-red piece sits in the front slot and white-green sits in the right slot — the two adjacent cross edges have swapped places. R' U' R U R' cycles both pieces through the middle layer and returns each to its correct position.",
      algorithm: "R' U' R U R'",
      initialState: "x2 R U' R' U R",
      highlightPieces: ["white-red", "white-green", "white-center", "red-center", "green-center"],
      visibleCubies: ["1,-1,0","0,-1,-1","0,-1,0","1,0,0","0,0,-1"],
      whiteOnTop: true,
      arrows: [
        { from: [0, 1, 1], to: [1, 1, 0], color: "#86EFAC" },
        { from: [1, 1, 0], to: [0, 1, 1], color: "#86EFAC" },
      ],
    },
  ],
};
