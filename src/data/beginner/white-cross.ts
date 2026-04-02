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
      id: "wc-edge-top",
      title: "Edge on the top face",
      explanation:
        "The white-blue edge is sitting on the U face with white facing up. Rotate U until the edge is directly above the blue centre, then turn the front face twice to drop it into place.",
      initialState: "F2 U",
      solutionMoves: "U' F2",
      highlightPieces: ["UF", "DF"],
    },
    {
      id: "wc-edge-middle",
      title: "Edge stuck in middle layer",
      explanation:
        "The white-blue edge is lodged in the FR middle slot. First kick it out to the top by turning R U R', then rotate U to align it and swing it down with F2.",
      initialState: "R U R' F2",
      solutionMoves: "R U' R' F2",
      highlightPieces: ["FR", "DF"],
    },
    {
      id: "wc-edge-flipped",
      title: "Edge on bottom, wrong orientation",
      explanation:
        "The white-blue edge is at the bottom but the white sticker faces outward instead of down. Turn the front face once to bring it to the middle layer, then use R U R' to lift it, and finally F2 to insert correctly.",
      initialState: "F",
      solutionMoves: "F' R U R' F2",
      highlightPieces: ["DF"],
    },
    {
      id: "wc-full-cross",
      title: "Solving the full cross",
      explanation:
        "Here is a realistic scramble with all four white edges out of place. Work through one edge at a time using the techniques above. There is no single algorithm — just patience and the three patterns you have learned.",
      initialState: "R U R' F2 L' U L B2 F U2 F'",
      solutionMoves: "F2 U R2 L2 U2 B2",
      highlightPieces: ["UF", "UB", "UL", "UR", "DF", "DB", "DL", "DR"],
    },
  ],
};
