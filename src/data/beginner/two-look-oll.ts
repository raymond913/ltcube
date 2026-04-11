import type { TutorialStep } from "@/lib/tutorialTypes";

export const twoLookOll: TutorialStep = {
  id: "two-look-oll",
  title: "2-Look OLL",
  description:
    "Orient the Last Layer in two passes. First, form a yellow cross on top using up to 2 algorithms. Then orient all yellow corners using one of 7 algorithms. After OLL, the whole top face is yellow.",
  concepts: [
    "OLL = Orient Last Layer: make all top stickers yellow",
    "Look 1 — Edge orientation: get a yellow cross (4 possible cases)",
    "Look 2 — Corner orientation: orient all 4 corners (7 possible cases)",
    "Recognition: look at the top face only before applying any algorithm",
  ],
  substeps: [
    // ── Edge orientation (3 cases) ──────────────────────────────────────────
    {
      id: "oll-dot",
      title: "Dot",
      explanation:
        "No yellow edges on top — you have a dot. Apply the Dot algorithm, which is the L-shape algorithm followed immediately by the Line algorithm.",
      algorithm: "F R U R' U' F' f R U R' U' f'",
      algorithmName: "Dot",
      initialState: "f U R U' R' f' F U R U' R' F'",
      highlightPieces: ["UF", "UB", "UL", "UR"],
    },
    {
      id: "oll-l-shape",
      title: "L-Shape",
      explanation:
        "Two adjacent yellow edges form an L on top. Hold the cube so the L's corner is at the back-left, then apply the L-Shape algorithm.",
      algorithm: "f R U R' U' f'",
      algorithmName: "L-Shape",
      initialState: "f U R U' R' f'",
      highlightPieces: ["UF", "UR"],
    },
    {
      id: "oll-line",
      title: "Line",
      explanation:
        "Two opposite yellow edges form a line. Hold the cube so the line runs left-to-right, then apply the Line algorithm.",
      algorithm: "F R U R' U' F'",
      algorithmName: "Line",
      initialState: "F U R U' R' F'",
      highlightPieces: ["UL", "UR"],
    },
    // ── Corner orientation (7 cases) ────────────────────────────────────────
    {
      id: "oll-sune",
      title: "Sune",
      explanation:
        "One corner has yellow on top, the other three have yellow facing the sides. Hold the cube so the correct corner is at UFR, then apply Sune.",
      algorithm: "R U R' U R U2 R'",
      algorithmName: "Sune",
      initialState: "R U2' R' U' R U' R'",
      highlightPieces: ["UFR", "UFL", "UBL", "UBR"],
    },
    {
      id: "oll-antisune",
      title: "Anti-Sune",
      explanation:
        "The mirror of Sune — one corner is correct but the others twist the opposite way. Hold the correct corner at UFR and apply Anti-Sune.",
      algorithm: "R U2 R' U' R U' R'",
      algorithmName: "Anti-Sune",
      initialState: "R U R' U R U2' R'",
      highlightPieces: ["UFR", "UFL", "UBL", "UBR"],
    },
    {
      id: "oll-h",
      title: "H",
      explanation:
        "All four corners have yellow facing the sides — no yellow on top at all. Any AUF. Apply H.",
      algorithm: "R U R' U R U' R' U R U2 R'",
      algorithmName: "H",
      initialState: "R U2' R' U' R U R' U' R U' R'",
      highlightPieces: ["UFR", "UFL", "UBL", "UBR"],
    },
    {
      id: "oll-pi",
      title: "Pi",
      explanation:
        "Two adjacent corners have yellow on top, two don't. Hold the cube so the two correct corners are at UFL and UBL (left side), then apply Pi.",
      algorithm: "R U2 R2 U' R2 U' R2 U2 R",
      algorithmName: "Pi",
      initialState: "R' U2' R2 U R2 U R2 U2' R'",
      highlightPieces: ["UFR", "UBR"],
    },
    {
      id: "oll-u",
      title: "U",
      explanation:
        "Two diagonal corners have yellow on top. Apply U. (This case is rarely encountered; if confused, applying Sune twice also solves it.)",
      algorithm: "R2 D' R U2 R' D R U2 R",
      algorithmName: "U",
      initialState: "R' U2' R' D' R U2 R' D R2",
      highlightPieces: ["UFL", "UBR"],
    },
    {
      id: "oll-t",
      title: "T",
      explanation:
        "Two adjacent corners have yellow on top and they are diagonal from each other. Hold the cube so the correct corners are at UFR and UBL, then apply T.",
      algorithm: "r U R' U' r' F R F'",
      algorithmName: "T",
      initialState: "F R' F' r U R U' r'",
      highlightPieces: ["UFL", "UBR"],
    },
    {
      id: "oll-l",
      title: "L",
      explanation:
        "The L case: two adjacent corners have yellow on top. Hold the cube so the two correct corners are at the front, then apply L.",
      algorithm: "F R U R' U' F'",
      algorithmName: "L",
      initialState: "F U R U' R' F'",
      highlightPieces: ["UFR", "UBR"],
    },
  ],
};
