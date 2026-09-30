import type { TutorialStep } from "@/lib/tutorialTypes";

export const corners: TutorialStep = {
  id: "corners",
  title: "White Corners",
  description: "Place the four white corner pieces to finish the first layer. Solve corners in the bottom layer first — inserting a bottom-layer corner automatically knocks any wrongly-placed corner out of the top layer, so you fix two problems with one algorithm. If a white corner is stuck in the top layer in the wrong slot or orientation, hold the cube so that corner is at the front-right and do F D F' (or any insert move). This drops it into the bottom layer so you can solve it normally using the cases below.",
  concepts: ["find the corner below its slot in the D layer", "the white sticker's direction tells you which algorithm to use"],
  substeps: [
    {
      id: "co-white-right",
      title: "White corner on the right",
      explanation: "A white corner piece is on the bottom, tucked under where it needs to go, with white facing right. These three moves lift it up and lock it into the top corner.",
      howToSpot: "Find a bottom corner with white on its right side, sitting under an empty top corner spot.",
      algorithm: "R' D' R",
      initialState: "x2 R' D R",
      holdInstruction: "White on top. Hold the white corner at the bottom front-right, white facing right.",
      highlightPieces: ["white-green-red", "white-center", "green-center", "red-center"],
      // visibleCubies = everything solved in prior steps + the piece(s) this case moves + relevant centers
      // Prior steps: white cross edges (DF/DR/DB/DL) + white center. This case: white-green-red corner + green center + red center.
      visibleCubies: ["1,-1,-1", "0,-1,0", "0,-1,1", "1,-1,0", "0,-1,-1", "-1,-1,0", "0,0,-1", "1,0,0"],
      whiteOnTop: true,
      arrows: [{ from: [1, -1, 1], to: [1, 1, 1], color: "#DC2626" }],
    },
    {
      id: "co-white-front",
      title: "White corner facing you",
      explanation: "Same idea, but the white sticker faces toward you instead of right. This mirror set of moves drops it into place.",
      howToSpot: "Find a bottom corner with white facing you, under the spot it belongs in.",
      algorithm: "F D F'",
      initialState: "x2 F D' F'",
      holdInstruction: "White on top. Hold the white corner at the bottom front-right, white facing you.",
      highlightPieces: ["white-green-red", "white-center", "green-center", "red-center"],
      // visibleCubies = everything solved in prior steps + the piece(s) this case moves + relevant centers
      // Prior steps: white cross edges (DF/DR/DB/DL) + white center. This case: white-green-red corner + green center + red center.
      visibleCubies: ["1,-1,-1", "0,-1,0", "0,-1,1", "1,-1,0", "0,-1,-1", "-1,-1,0", "0,0,-1", "1,0,0"],
      whiteOnTop: true,
      arrows: [{ from: [1, -1, 1], to: [1, 1, 1], color: "#2563EB" }],
    },
    {
      id: "co-white-down",
      title: "White corner facing down",
      explanation: "The trickiest one — the white sticker points straight down. It takes a few extra moves to spin it around and seat it correctly.",
      howToSpot: "Find a bottom corner where you can't see white from the side — it's hiding on the bottom face.",
      algorithm: "R' D R F D2 F'",
      initialState: "x2 F D2 F' R' D' R",
      holdInstruction: "White on top. Hold the white corner at the bottom front-right, white facing down.",
      highlightPieces: ["white-green-red", "white-center", "green-center", "red-center"],
      // visibleCubies = everything solved in prior steps + the piece(s) this case moves + relevant centers
      // Prior steps: white cross edges (DF/DR/DB/DL) + white center. This case: white-green-red corner + green center + red center.
      visibleCubies: ["1,-1,-1", "0,-1,0", "0,-1,1", "1,-1,0", "0,-1,-1", "-1,-1,0", "0,0,-1", "1,0,0"],
      whiteOnTop: true,
      arrows: [{ from: [1, -1, 1], to: [1, 1, 1], color: "#FFFFFF" }],
    },
    {
      id: "co-twisted",
      title: "Corner stuck in the wrong way",
      explanation: "The corner is already up top but twisted the wrong direction. Pop it out first, then put it back correctly.",
      howToSpot: "Look for a top corner that's in the right place but has its colors turned the wrong way.",
      algorithm: "R' D R F D F'",
      initialState: "x2 F D' F' R' D' R",
      holdInstruction: "White on top. Hold the twisted white corner at the top front-right, white facing you.",
      highlightPieces: ["white-green-red", "white-center", "green-center", "red-center"],
      // visibleCubies = everything solved in prior steps + the piece(s) this case moves + relevant centers
      // Prior steps: white cross edges (DF/DR/DB/DL) + white center. This case: white-green-red corner + green center + red center.
      visibleCubies: ["1,-1,-1", "0,-1,0", "0,-1,1", "1,-1,0", "0,-1,-1", "-1,-1,0", "0,0,-1", "1,0,0"],
      whiteOnTop: true,
      arrows: [{ from: [1, 1, 1], to: [1, -1, 1], color: "#EAB308" }],
    },
  ],
};
