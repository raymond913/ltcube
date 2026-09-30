import type { TutorialStep } from "@/lib/tutorialTypes";

export const secondLayer: TutorialStep = {
  id: "second-layer",
  title: "Second Layer",
  description: "Solve the middle layer by inserting the four edge pieces into their correct slots using the Right Insert or Left Insert algorithm.",
  concepts: ["right insert", "left insert", "extract stuck edge"],
  substeps: [
    {
      id: "sl-right",
      title: "Edge goes to the right",
      explanation: "An edge piece on the top belongs in the middle row, over on the right side. Line it up, then run these moves to send it down and to the right.",
      howToSpot: "Find a top edge with no yellow on it, whose front color matches the center below it, that needs to go right.",
      algorithmName: "Right Insert",
      algorithm: "U R U' R' U' F' U F",
      initialState: "F' U' F U R U R' U'",
      highlightPieces: ["blue-red-edge", "blue-center", "red-center"],
      visibleCubies: [
        "1,-1,1","-1,-1,1","1,-1,-1","-1,-1,-1","0,-1,1","0,-1,-1","1,-1,0","-1,-1,0","0,-1,0",
        "0,0,1","0,0,-1","1,0,0","-1,0,0",
        "1,0,1",
      ],
      arrows: [
        { from: [0, 1, 1], to: [1, 0, 1], color: "#2563EB" },
      ],
    },
    {
      id: "sl-left",
      title: "Edge goes to the left",
      explanation: "Same as before, but this edge belongs on the left side. This mirrored set of moves sends it down to the left.",
      howToSpot: "Find a top edge with no yellow, matching the center below it, that needs to go left.",
      algorithmName: "Left Insert",
      algorithm: "U' L' U L U F U' F'",
      initialState: "F U F' U' L' U' L U",
      highlightPieces: ["blue-orange-edge", "blue-center", "orange-center"],
      visibleCubies: [
        "1,-1,1","-1,-1,1","1,-1,-1","-1,-1,-1","0,-1,1","0,-1,-1","1,-1,0","-1,-1,0","0,-1,0",
        "0,0,1","0,0,-1","1,0,0","-1,0,0",
        "-1,0,1",
      ],
      arrows: [
        { from: [0, 1, 1], to: [-1, 0, 1], color: "#2563EB" },
      ],
    },
    {
      id: "sl-flipped",
      title: "Edge flipped in its own slot",
      explanation: "The blue-red edge is in the right spot but flipped the wrong way. The first 8 moves pop it up to the top. Then the top turns to line it up, and the last moves put it back facing the right way.",
      howToSpot: "A middle edge is in its home spot, but its colors don't match the centers next to it. Each color is on the wrong side.",
      algorithmName: "Pop out, then Right Insert",
      algorithm: "U R U' R' U' F' U F U' R U' R' U' F' U F",
      initialState: "F' U' F U R U R' U F' U' F U R U R' U'",
      highlightPieces: ["blue-red-edge", "blue-center", "red-center"],
      visibleCubies: [
        "1,-1,1","-1,-1,1","1,-1,-1","-1,-1,-1","0,-1,1","0,-1,-1","1,-1,0","-1,-1,0","0,-1,0",
        "0,0,1","0,0,-1","1,0,0","-1,0,0",
        "1,0,1",
      ],
      arrows: [
        { from: [1, 0, 1], to: [0, 1, 1], color: "#2563EB" },
      ],
    },
    {
      id: "sl-wrong-slot",
      title: "Edge in the wrong slot",
      explanation: "The blue-red edge is trapped in the wrong middle spot. Pop it out with the first moves, turn the top to line it up, then send it to its real home.",
      howToSpot: "A middle edge sits in a spot where neither of its colors matches the centers beside it.",
      algorithmName: "Pop out, then insert",
      algorithm: "U' L' U L U F U' F' U' R U' R' U' F' U F",
      initialState: "F' U' F U R U R' U F U F' U' L' U' L U",
      highlightPieces: ["blue-red-edge", "blue-center", "red-center", "orange-center"],
      visibleCubies: [
        "1,-1,1","-1,-1,1","1,-1,-1","-1,-1,-1","0,-1,1","0,-1,-1","1,-1,0","-1,-1,0","0,-1,0",
        "0,0,1","0,0,-1","1,0,0","-1,0,0",
        "1,0,1",
      ],
      arrows: [
        { from: [-1, 0, 1], to: [1, 0, 1], color: "#DC2626" },
      ],
    },
  ],
};
