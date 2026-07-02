import type { TutorialStep } from "@/lib/tutorialTypes";

export const corners: TutorialStep = {
  id: "corners",
  title: "White Corners",
  description: "Place the four white corner pieces to finish the first layer. Solve corners in the bottom layer first — inserting a bottom-layer corner automatically knocks any wrongly-placed corner out of the top layer, so you fix two problems with one algorithm. If a white corner is stuck in the top layer in the wrong slot or orientation, hold the cube so that corner is at the front-right and do F D F' (or any insert move). This drops it into the bottom layer so you can solve it normally using the cases below.",
  concepts: ["find the corner below its slot in the D layer", "the white sticker's direction tells you which algorithm to use"],
  substeps: [
    {
      id: "co-white-right",
      title: "Corner below slot, white on right",
      explanation: "The white-green-red corner is directly below its home slot with white facing right (the R face). R' D' R slots it in.",
      algorithm: "R' D' R",
      initialState: "x2 R' D R",
      highlightPieces: ["white-green-red", "white-center", "green-center", "red-center"],
      // visibleCubies = everything solved in prior steps + the piece(s) this case moves + relevant centers
      // Prior steps: white cross edges (DF/DR/DB/DL) + white center. This case: white-green-red corner + green center + red center.
      visibleCubies: ["1,-1,-1", "0,-1,0", "0,-1,1", "1,-1,0", "0,-1,-1", "-1,-1,0", "0,0,-1", "1,0,0"],
      whiteOnTop: true,
      arrows: [{ from: [1, -1, 1], to: [1, 1, 1], color: "#DC2626" }],
    },
    {
      id: "co-white-front",
      title: "Corner below slot, white on front",
      explanation: "Same corner, but white faces the front (the F face). F D F' slides it into place.",
      algorithm: "F D F'",
      initialState: "x2 F D' F'",
      highlightPieces: ["white-green-red", "white-center", "green-center", "red-center"],
      // visibleCubies = everything solved in prior steps + the piece(s) this case moves + relevant centers
      // Prior steps: white cross edges (DF/DR/DB/DL) + white center. This case: white-green-red corner + green center + red center.
      visibleCubies: ["1,-1,-1", "0,-1,0", "0,-1,1", "1,-1,0", "0,-1,-1", "-1,-1,0", "0,0,-1", "1,0,0"],
      whiteOnTop: true,
      arrows: [{ from: [1, -1, 1], to: [1, 1, 1], color: "#2563EB" }],
    },
    {
      id: "co-white-down",
      title: "Corner below slot, white facing down",
      explanation: "White is facing straight down — neither algorithm fits directly. First use R' D R to kick the corner sideways, then F D2 F' inserts it cleanly.",
      algorithm: "R' D R F D2 F'",
      initialState: "x2 F D2 F' R' D' R",
      highlightPieces: ["white-green-red", "white-center", "green-center", "red-center"],
      // visibleCubies = everything solved in prior steps + the piece(s) this case moves + relevant centers
      // Prior steps: white cross edges (DF/DR/DB/DL) + white center. This case: white-green-red corner + green center + red center.
      visibleCubies: ["1,-1,-1", "0,-1,0", "0,-1,1", "1,-1,0", "0,-1,-1", "-1,-1,0", "0,0,-1", "1,0,0"],
      whiteOnTop: true,
      arrows: [{ from: [1, -1, 1], to: [1, 1, 1], color: "#FFFFFF" }],
    },
    {
      id: "co-twisted",
      title: "Corner in slot but twisted",
      explanation: "The corner is already in the right slot but rotated incorrectly. Extract it with R' D R, then F D F' reinserts it with the correct orientation.",
      algorithm: "R' D R F D F'",
      initialState: "x2 F D' F' R' D' R",
      highlightPieces: ["white-green-red", "white-center", "green-center", "red-center"],
      // visibleCubies = everything solved in prior steps + the piece(s) this case moves + relevant centers
      // Prior steps: white cross edges (DF/DR/DB/DL) + white center. This case: white-green-red corner + green center + red center.
      visibleCubies: ["1,-1,-1", "0,-1,0", "0,-1,1", "1,-1,0", "0,-1,-1", "-1,-1,0", "0,0,-1", "1,0,0"],
      whiteOnTop: true,
      arrows: [{ from: [1, 1, 1], to: [1, -1, 1], color: "#EAB308" }],
    },
  ],
};
