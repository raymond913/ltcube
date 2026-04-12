import type { TutorialStep } from "@/lib/tutorialTypes";

export const whiteCross: TutorialStep = {
  id: "white-cross",
  title: "White Cross",
  description:
    "The first step is to form a white cross on the bottom face. We need to place all four white edge pieces so that white faces down and the edge's side colour matches the centre below it.",
  concepts: [
    "The Daisy method: temporarily put white edges on the U face, then swing them down",
    "Edge orientation: white must face down, not outward",
    "Inserting edges without disturbing ones already placed",
  ],
  substeps: [
    {
      id: "wc-edge-bottom",
      title: "Edge on the bottom",
      explanation:
        "The white-blue edge is directly below its home on the bottom face. A simple F2 swings it into place.",
      algorithm: "F2",
      initialState: "x2 F2",
      highlightPieces: [],
      visibleCubies: ["0,1,0", "0,1,-1", "1,1,0", "-1,1,0", "0,1,1", "0,-1,1"],
      tip: "Always look for edges on the bottom first — they're the easiest to place.",
    },
    {
      id: "wc-edge-middle",
      title: "Edge stuck in the middle",
      explanation:
        "The white-red edge is lodged in the FR middle slot. One R move lifts it to the top layer, then U' aligns it, then F2 drops it home.",
      algorithm: "R U' F2",
      initialState: "x2 F2 U R'",
      highlightPieces: [],
      visibleCubies: ["0,1,0", "1,0,1", "1,1,0", "-1,1,0", "0,1,1", "0,1,-1"],
      tip: "If an edge is in the middle layer, look for a single face turn that brings it to the top.",
    },
    {
      id: "wc-edge-flipped",
      title: "Edge on top but flipped",
      explanation:
        "The white-green edge is on top but the white sticker faces up instead of to the side. Use F' to flip it into the front face, then reposition.",
      algorithm: "U F' U' F2",
      initialState: "x2 F2 U' F U'",
      highlightPieces: [],
      visibleCubies: ["0,1,0", "0,1,1", "1,1,0", "-1,1,0", "0,1,-1", "-1,0,-1"],
      tip: "A flipped edge needs to be rotated before it can be inserted.",
    },
    {
      id: "wc-full-cross",
      title: "Solving the full cross",
      explanation:
        "Now try solving all four white edges from a light scramble. Think about each edge — where is it and what's the shortest path to its home?",
      algorithm: "F2 R2 B2 L2",
      initialState: "x2 L2 B2 R2 F2",
      highlightPieces: [],
      visibleCubies: ["0,1,0", "0,1,1", "0,1,-1", "1,1,0", "-1,1,0"],
      tip: "Try to solve edges without disturbing ones you've already placed.",
    },
  ],
};
