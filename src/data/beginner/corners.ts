import type { TutorialStep } from "@/lib/tutorialTypes";

export const corners: TutorialStep = {
  id: "corners",
  title: "White Corners",
  description:
    "Now fill in the four white corner pieces to complete the first layer. Every corner is solved using one repeated algorithm: R U R' U'. The number of repetitions depends on the corner's orientation.",
  concepts: [
    "Corner orientation: the white sticker can face right, up, or front",
    "R U R' U' (the Sexy Move) inserts a corner from above its slot",
    "A corner trapped in the bottom layer must be extracted with R U R' first",
  ],
  substeps: [
    {
      id: "wco-white-right",
      title: "Corner below slot — white faces right",
      explanation:
        "The white-blue-red corner is in the bottom layer below its slot. The white sticker faces the right side. Use R' D' R to slot it in.",
      algorithm: "R' D' R",
      initialState: "R' D R",
      arrows: [
        { from: [1, -1, -1], to: [1, -1, 1] },
      ],
      tip: "This is the most common corner case. Get comfortable with R' D' R.",
    },
    {
      id: "wco-white-front",
      title: "Corner below slot — white faces front",
      explanation:
        "Same corner, but now white faces the front. Use F D F' to insert.",
      algorithm: "F D F'",
      initialState: "F D' F'",
      arrows: [
        { from: [-1, -1, 1], to: [1, -1, 1] },
      ],
      tip: "Notice how this is a mirror of the first case — F D F' instead of R' D' R.",
    },
    {
      id: "wco-white-down",
      title: "Corner below slot — white faces down",
      explanation:
        "The tricky case — white faces downward. Use R' D R F D2 F' to reorient and insert.",
      algorithm: "R' D R F D2 F'",
      initialState: "F D2' R' D' R F'",
      arrows: [
        { from: [-1, -1, -1], to: [1, -1, 1] },
      ],
      tip: "This is the longest corner case. The first 3 moves kick it out, the last 3 slot it correctly.",
    },
    {
      id: "wco-stuck-twisted",
      title: "Corner in slot but twisted",
      explanation:
        "The corner is in the right place but rotated wrong. Use R' D R to pop it out to the bottom layer, then solve it normally.",
      algorithm: "R' D R D' R' D' R",
      initialState: "R' D R D R' D' R",
      tip: "If a corner is twisted in place, always extract it first — don't try to fix it in place.",
    },
  ],
};
