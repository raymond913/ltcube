import type { CubeFaces } from "./cubeEngine";

export function isCrossSolved(faces: CubeFaces): boolean {
  const { D, F, R, L, B } = faces;
  return (
    D[0][1] === "white" && D[1][0] === "white" &&
    D[1][2] === "white" && D[2][1] === "white" &&
    F[2][1] === "blue" && R[2][1] === "red" &&
    L[2][1] === "orange" && B[2][1] === "green"
  );
}

export function areCornersSolved(faces: CubeFaces): boolean {
  if (!isCrossSolved(faces)) return false;
  const { D, F, R, L, B } = faces;
  return (
    D[0][2] === "white" && F[2][2] === "blue" && R[2][0] === "red" &&
    D[0][0] === "white" && F[2][0] === "blue" && L[2][2] === "orange" &&
    D[2][2] === "white" && B[2][0] === "green" && R[2][2] === "red" &&
    D[2][0] === "white" && B[2][2] === "green" && L[2][0] === "orange"
  );
}

export function isF2LSolved(faces: CubeFaces): boolean {
  if (!areCornersSolved(faces)) return false;
  const { F, R, L, B } = faces;
  return (
    F[1][0] === "blue" && F[1][2] === "blue" &&
    R[1][0] === "red" && R[1][2] === "red" &&
    L[1][0] === "orange" && L[1][2] === "orange" &&
    B[1][0] === "green" && B[1][2] === "green"
  );
}

export function isOLLSolved(faces: CubeFaces): boolean {
  if (!isF2LSolved(faces)) return false;
  return faces.U.every((row) => row.every((c) => c === "yellow"));
}

export function isPLLSolved(faces: CubeFaces): boolean {
  for (const face of Object.values(faces)) {
    const center = face[1][1];
    if (!face.every((row) => row.every((c) => c === center))) return false;
  }
  return true;
}

/** Returns the highest completed stage index (0=nothing, 1=cross, 2=corners, 3=F2L, 4=OLL, 5=PLL/solved). */
export function detectStage(faces: CubeFaces): number {
  if (isPLLSolved(faces)) return 5;
  if (isOLLSolved(faces)) return 4;
  if (isF2LSolved(faces)) return 3;
  if (areCornersSolved(faces)) return 2;
  if (isCrossSolved(faces)) return 1;
  return 0;
}
