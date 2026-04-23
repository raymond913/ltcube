import type { TutorialStep } from "@/lib/tutorialTypes";

export const corners: TutorialStep = {
  id: "corners",
  title: "White Corners",
  description: "Fill in the four white corner pieces to complete the first layer. Short algorithms insert each corner from the D layer into its slot.",
  concepts: ["corner orientation: white faces right, front, or down", "R' D' R insert", "F D F' insert", "extract twisted corner"],
  substeps: [
    {
      id: "co-white-right",
      title: "Corner below slot, white on right",
      explanation: "The corner is in the D layer below its slot with white facing right. R' D' R slots it in directly.",
      algorithm: "R' D' R",
      initialState: "R' D R",
      highlightPieces: ["white-blue-red", "white-center", "blue-center", "red-center"],
      visibleCubies: [
        "0,-1,0", "0,-1,1", "1,-1,0", "0,-1,-1", "-1,-1,0",
        "0,0,1", "1,0,0",
        "1,-1,1", "1,-1,-1",
      ],
      arrows: [
        { from: [1, -1, -1], to: [1, -1, 1], color: "#EAB308" },
      ],
    },
    {
      id: "co-white-front",
      title: "Corner below slot, white on front",
      explanation: "Same corner, white is facing the front instead. F D F' does the job.",
      algorithm: "F D F'",
      initialState: "F D' F'",
      highlightPieces: ["white-blue-red", "white-center", "blue-center", "red-center"],
      visibleCubies: [
        "0,-1,0", "0,-1,1", "1,-1,0", "0,-1,-1", "-1,-1,0",
        "0,0,1", "1,0,0",
        "1,-1,1", "-1,-1,1",
      ],
      arrows: [
        { from: [-1, -1, 1], to: [1, -1, 1], color: "#EAB308" },
      ],
    },
    {
      id: "co-white-down",
      title: "Corner below slot, white facing down",
      explanation: "White faces downward — the trickiest orientation. R' D R kicks it to a better spot, then F D2 F' inserts it.",
      algorithm: "R' D R F D2 F'",
      initialState: "F D2 F' R' D' R",
      highlightPieces: ["white-blue-red", "white-center", "blue-center", "red-center"],
      visibleCubies: [
        "0,-1,0", "0,-1,1", "1,-1,0", "0,-1,-1", "-1,-1,0",
        "0,0,1", "1,0,0",
        "1,-1,1", "-1,-1,1",
      ],
      arrows: [
        { from: [-1, -1, 1], to: [1, -1, 1], color: "#EAB308" },
      ],
    },
    {
      id: "co-twisted",
      title: "Corner in slot, twisted",
      explanation: "The corner is physically in the right slot but rotated wrong. Extract it with R' D R, rotate with D', then reinsert.",
      algorithm: "R' D R D' R' D' R",
      initialState: "R' D R D R' D' R",
      highlightPieces: ["white-blue-red", "white-center", "blue-center", "red-center"],
      visibleCubies: [
        "0,-1,0", "0,-1,1", "1,-1,0", "0,-1,-1", "-1,-1,0",
        "0,0,1", "1,0,0",
        "1,-1,1",
      ],
    },
  ],
};
