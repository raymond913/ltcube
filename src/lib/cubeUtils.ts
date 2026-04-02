import { parseAlgorithm, invertAlgorithm } from "./cubeEngine";

export type Move = string; // e.g. "R", "U'", "F2"

/** Parse a move string into its base face, direction, and repeat. */
export function parseMove(move: Move): { face: string; inverse: boolean; double: boolean } {
  const parsed = parseAlgorithm(move);
  if (parsed.length === 0) return { face: "", inverse: false, double: false };
  const m = parsed[0];
  return { face: m.face, inverse: m.inverse, double: m.double };
}

/** Return the inverse of a move sequence as an array of move strings. */
export function invertMoves(moves: Move[]): Move[] {
  const alg = moves.join(" ");
  return invertAlgorithm(alg).split(" ").filter(Boolean);
}
