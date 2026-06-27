import { CubeEngine } from "../lib/cubeEngine";

// Direct inspection of what x2 does
const eng = new CubeEngine();
console.log("BEFORE x2:");
const EDGE_IDS = ["UF","UB","UL","UR","DF","DB","DL","DR","FL","FR","BL","BR"];
for (const id of EDGE_IDS) {
  const pos = eng.getCubieWorldPosition(id);
  const stickers = eng.getStickersForCubie(id);
  const state = eng.getState();
  const colors = stickers.map(s => `${s.face}[${s.row}][${s.col}]=${state[s.face][s.row][s.col]}`);
  console.log(`  ${id}: pos=[${pos}]  stickers: ${colors.join(", ")}`);
}

eng.applyAlgorithm("x2");
console.log("\nAFTER x2:");
for (const id of EDGE_IDS) {
  const pos = eng.getCubieWorldPosition(id);
  const stickers = eng.getStickersForCubie(id);
  const state = eng.getState();
  const colors = stickers.map(s => `${s.face}[${s.row}][${s.col}]=${state[s.face][s.row][s.col]}`);
  if (colors.some(c => c.includes("white") || c.includes("green"))) {
    console.log(`  ${id}: pos=[${pos}]  stickers: ${colors.join(", ")}`);
  }
}
