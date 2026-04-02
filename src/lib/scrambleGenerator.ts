import { parseAlgorithm } from "./cubeEngine";
import type { Move } from "./cubeEngine";

const SCRAMBLE_MOVES = ["R", "R'", "R2", "L", "L'", "L2", "U", "U'", "U2", "D", "D'", "D2", "F", "F'", "F2", "B", "B'", "B2"];

// Map each move notation to its face letter so we can avoid consecutive same-face moves
const FACE_OF: Record<string, string> = {};
for (const m of SCRAMBLE_MOVES) {
  FACE_OF[m] = m[0];
}

/**
 * Generate a random scramble string of the given length (default 20).
 * Avoids consecutive moves on the same face.
 */
export function generateScramble(length = 20): string {
  const moves: string[] = [];
  let lastFace = "";

  while (moves.length < length) {
    const candidate = SCRAMBLE_MOVES[Math.floor(Math.random() * SCRAMBLE_MOVES.length)];
    if (FACE_OF[candidate] !== lastFace) {
      moves.push(candidate);
      lastFace = FACE_OF[candidate];
    }
  }

  return moves.join(" ");
}

/**
 * Generate a scramble as an array of Move objects.
 */
export function generateScrambleMoves(length = 20): Move[] {
  return parseAlgorithm(generateScramble(length));
}
