import { CubeEngine } from "../lib/cubeEngine";

const EDGE_IDS = ["UF","UB","UL","UR","DF","DB","DL","DR","FL","FR","BL","BR"];
const CENTER_IDS = ["U","D","F","B","L","R"];

function findEdge(eng: CubeEngine, c1: string, c2: string): string | null {
  const state = eng.getState();
  for (const id of EDGE_IDS) {
    const stickers = eng.getStickersForCubie(id);
    const colors = stickers.map(s => state[s.face][s.row][s.col]);
    if ((colors as string[]).includes(c1) && (colors as string[]).includes(c2)) {
      const pos = eng.getCubieWorldPosition(id);
      return pos ? pos.join(",") : null;
    }
  }
  return null;
}

function findCenter(eng: CubeEngine, color: string): string | null {
  const state = eng.getState();
  for (const id of CENTER_IDS) {
    const stickers = eng.getStickersForCubie(id);
    const colors = stickers.map(s => state[s.face][s.row][s.col]);
    if ((colors as string[]).includes(color)) {
      const pos = eng.getCubieWorldPosition(id);
      return pos ? pos.join(",") : null;
    }
  }
  return null;
}

const solvedX2 = new CubeEngine();
solvedX2.applyAlgorithm("x2");
const HOME = findEdge(solvedX2, "white", "green")!;
const sv = solvedX2.getState();

function stateMatch(eng: CubeEngine): boolean {
  const s = eng.getState();
  return s.U[0][1] === sv.U[0][1] && s.B[0][1] === sv.B[0][1];
}

// Camera: [4, 3, 4] — visible faces: +X (R), +Y (U), +Z (F)
function isFrontVisible(posStr: string): boolean {
  const [x, y, z] = posStr.split(",").map(Number);
  if (x > 0) return true;  // R face
  if (y > 0) return true;  // U face
  if (z > 0) return true;  // F face (visible from [4,3,4])
  return false;
}

// Home slot visibility from camera [4,3,4]
function isHomeVisible(): boolean {
  // Home at [0,1,1]: y=+1 and z=+1 → visible ✓
  return true;
}

console.log(`HOME slot: [${HOME}]`);
console.log(`Camera: [4, 3, 4]  →  visible: +X(R), +Y(U), +Z(F)\n`);

const substeps = [
  {
    id: "wc-white-front",
    title: "White layer, front slot",
    explanation: "The white-green edge is in the top layer at the front slot. Two top-layer turns (U2) spin it 180° to the green home slot.",
    algorithm: "U2",
    initialState: "x2 U2",
    arrows: [{ from: [0, 1, -1], to: [0, 1, 1] }],
  },
  {
    id: "wc-middle-front",
    title: "White layer, right slot",
    explanation: "The white-green edge is in the top layer at the right slot. One top-layer turn (U) slides it to the green home slot.",
    algorithm: "U",
    initialState: "x2 U' R",
    arrows: [{ from: [1, 1, 0], to: [0, 1, 1] }],
  },
  {
    id: "wc-yellow-right",
    title: "White layer, right side",
    explanation: "The white-green edge is in the top (white) layer on the right. A single U turn carries it to the green home slot.",
    algorithm: "U",
    initialState: "x2 U' R2",
    arrows: [{ from: [1, 1, 0], to: [0, 1, 1] }],
  },
  {
    id: "wc-yellow-front",
    title: "White layer, back slot",
    explanation: "The white-green edge is in the top layer at the back slot. Two top-layer turns (U2) carry it to the green home slot.",
    algorithm: "U2",
    initialState: "x2 U2 B2",
    arrows: [{ from: [0, 1, -1], to: [0, 1, 1] }],
  },
  {
    id: "wc-middle-back",
    title: "Green slot, wrong orientation",
    explanation: "The white-green edge is in the home slot but turned the wrong way. F' flips it into the correct orientation.",
    algorithm: "F'",
    initialState: "x2 F",
    arrows: [],
  },
];

console.log("─".repeat(80));

for (const s of substeps) {
  const eng = new CubeEngine();
  eng.applyAlgorithm(s.initialState);
  const edgePos = findEdge(eng, "white", "green");

  const eng2 = new CubeEngine();
  eng2.applyAlgorithm(s.initialState);
  eng2.applyAlgorithm(s.algorithm);
  const solvable = stateMatch(eng2);

  const edgeVis = edgePos ? isFrontVisible(edgePos) : false;

  let arrowOK = s.arrows.length === 0 ? "N/A" :
    (s.arrows[0].from.join(",") === edgePos && s.arrows[0].to.join(",") === HOME) ? "✓" : "✗";

  const homeVis = isFrontVisible(HOME);

  const yCoord = edgePos ? Number(edgePos.split(",")[1]) : 0;
  const layer = yCoord > 0 ? "white(U) layer" : yCoord < 0 ? "yellow(D) layer" : "middle layer";

  console.log(`\n▶ ${s.id}`);
  console.log(`  title:       ${s.title}`);
  console.log(`  edge at:     [${edgePos}]  layer: ${layer}  visible: ${edgeVis}`);
  console.log(`  algo:        "${s.algorithm}"  solvable: ${solvable ? "✓ PASS" : "✗ FAIL"}`);
  console.log(`  arrow:       ${arrowOK}  from=[${s.arrows[0]?.from}]  to=[${s.arrows[0]?.to ?? "N/A"}]`);
  console.log(`  home vis:    ${homeVis ? "✓" : "✗"}  [${HOME}]`);
}

console.log("\n" + "═".repeat(80));
console.log("SUMMARY TABLE");
console.log("═".repeat(80));
console.log("| Substep             | Solvable | Pieces OK | Arrow OK | Layer OK | Home Vis |");
console.log("|---------------------|----------|-----------|----------|----------|----------|");

for (const s of substeps) {
  const eng = new CubeEngine();
  eng.applyAlgorithm(s.initialState);
  const edgePos = findEdge(eng, "white", "green");
  const wPos = findCenter(eng, "white");
  const gPos = findCenter(eng, "green");

  const eng2 = new CubeEngine();
  eng2.applyAlgorithm(s.initialState);
  eng2.applyAlgorithm(s.algorithm);
  const solvable = stateMatch(eng2) ? "✓" : "✗";

  const edgeVis = edgePos && isFrontVisible(edgePos);
  const wVis = wPos && isFrontVisible(wPos);
  const gVis = gPos && isFrontVisible(gPos);
  const piecesOK = (edgeVis && wVis) ? "✓" : "✗";

  const arrowOK = s.arrows.length === 0 ? "N/A" :
    (s.arrows[0].from.join(",") === edgePos && s.arrows[0].to.join(",") === HOME) ? "✓ " : "✗ ";

  const yCoord = edgePos ? Number(edgePos.split(",")[1]) : 0;
  const layerOK = yCoord > 0 ? "✓" : "✗";

  const homeVis = isFrontVisible(HOME) ? "✓" : "✗";

  console.log(`| ${s.id.padEnd(19)} |    ${solvable}     |     ${piecesOK}     |   ${arrowOK.padEnd(5)}  |    ${layerOK}     |    ${homeVis}     |`);
}
console.log("");
