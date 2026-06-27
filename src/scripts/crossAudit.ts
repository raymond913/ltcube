import { CubeEngine } from "../lib/cubeEngine";

type FN = "U"|"D"|"F"|"B"|"R"|"L";

const EDGE_SLOTS = [
  { id:"UF", s1:{f:"U" as FN,r:2,c:1}, s2:{f:"F" as FN,r:0,c:1}, pos:[0, 1, 1]  },
  { id:"UB", s1:{f:"U" as FN,r:0,c:1}, s2:{f:"B" as FN,r:0,c:1}, pos:[0, 1,-1]  },
  { id:"UR", s1:{f:"U" as FN,r:1,c:2}, s2:{f:"R" as FN,r:0,c:1}, pos:[1, 1, 0]  },
  { id:"UL", s1:{f:"U" as FN,r:1,c:0}, s2:{f:"L" as FN,r:0,c:1}, pos:[-1,1, 0]  },
  { id:"DF", s1:{f:"D" as FN,r:0,c:1}, s2:{f:"F" as FN,r:2,c:1}, pos:[0,-1, 1]  },
  { id:"DB", s1:{f:"D" as FN,r:2,c:1}, s2:{f:"B" as FN,r:2,c:1}, pos:[0,-1,-1]  },
  { id:"DR", s1:{f:"D" as FN,r:1,c:2}, s2:{f:"R" as FN,r:2,c:1}, pos:[1,-1, 0]  },
  { id:"DL", s1:{f:"D" as FN,r:1,c:0}, s2:{f:"L" as FN,r:2,c:1}, pos:[-1,-1,0]  },
  { id:"FR", s1:{f:"F" as FN,r:1,c:2}, s2:{f:"R" as FN,r:1,c:0}, pos:[1, 0, 1]  },
  { id:"FL", s1:{f:"F" as FN,r:1,c:0}, s2:{f:"L" as FN,r:1,c:2}, pos:[-1, 0, 1] },
  { id:"BR", s1:{f:"B" as FN,r:1,c:0}, s2:{f:"R" as FN,r:1,c:2}, pos:[1, 0,-1]  },
  { id:"BL", s1:{f:"B" as FN,r:1,c:2}, s2:{f:"L" as FN,r:1,c:0}, pos:[-1, 0,-1] },
];

const CROSS_HOMES: Record<string, number[]> = {
  "green+white":  [0, 1, 1],
  "white+green":  [0, 1, 1],
  "red+white":    [1, 1, 0],
  "white+red":    [1, 1, 0],
  "blue+white":   [0, 1,-1],
  "white+blue":   [0, 1,-1],
  "orange+white": [-1,1, 0],
  "white+orange": [-1,1, 0],
};

function getColor(s: ReturnType<CubeEngine["getState"]>, f: FN, r: number, c: number): string {
  return String(s[f][r][c]);
}

function findEdge(eng: CubeEngine, c1: string, c2: string): number[] | null {
  const s = eng.getState();
  for (const slot of EDGE_SLOTS) {
    const a = getColor(s, slot.s1.f, slot.s1.r, slot.s1.c);
    const b = getColor(s, slot.s2.f, slot.s2.r, slot.s2.c);
    if ((a === c1 && b === c2) || (a === c2 && b === c1)) return slot.pos;
  }
  return null;
}

function crossSolved(eng: CubeEngine): boolean {
  const s = eng.getState();
  for (const slot of EDGE_SLOTS) {
    const a = getColor(s, slot.s1.f, slot.s1.r, slot.s1.c);
    const b = getColor(s, slot.s2.f, slot.s2.r, slot.s2.c);
    if (a !== "white" && b !== "white") continue;
    const whiteFace = a === "white" ? slot.s1.f : slot.s2.f;
    if (whiteFace !== "U") return false;
  }
  return true;
}

// Camera at [4,3,4]: visible faces +X(R), +Y(U), +Z(F)
function isVisible(pos: number[]): boolean {
  return pos[0] > 0 || pos[1] > 0 || pos[2] > 0;
}

function posEq(a: number[], b: number[]): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

const substeps = [
  {
    id: "wc-case1",
    title: "Edge in front-right slot, white facing forward",
    algorithm: "R",
    initialState: "x2 R'",
    targetEdge: ["white","red"] as [string,string],
    arrows: [{ from: [1, 0, 1], to: [1, 1, 0] }],
    visibleCubies: ["1,-1,0","0,-1,0","1,0,0"],
    expectedY: 0,
  },
  {
    id: "wc-case2",
    title: "Edge in front-right slot, white facing right",
    algorithm: "F R",
    initialState: "x2 R' F'",
    targetEdge: ["white","green"] as [string,string],
    arrows: [{ from: [1, 0, 1], to: [0, 1, 1] }],
    visibleCubies: ["0,-1,-1","0,-1,0","0,0,-1"],
    expectedY: 0,
  },
  {
    id: "wc-case3",
    title: "Edge in front-right slot, top layer mixed",
    algorithm: "F R U",
    initialState: "x2 U' R' F'",
    targetEdge: ["white","green"] as [string,string],
    arrows: [{ from: [1, 0, 1], to: [0, 1, 1] }],
    visibleCubies: ["0,-1,-1","0,-1,0","0,0,-1"],
    expectedY: 0,
  },
  {
    id: "wc-case4",
    title: "Two adjacent cross edges swapped",
    algorithm: "R' U' R U R'",
    initialState: "x2 R U' R' U R",
    targetEdge: ["white","green"] as [string,string],
    arrows: [{ from: [0, 1, 1], to: [1, 1, 0] }, { from: [1, 1, 0], to: [0, 1, 1] }],
    visibleCubies: ["0,-1,-1","1,-1,0","0,-1,0","0,0,-1","1,0,0"],
    expectedY: 1,
  },
];

console.log("Camera: [4, 3, 4]  → visible: +X(R), +Y(U), +Z(F)");
console.log("─".repeat(80));

for (const sub of substeps) {
  const eng = new CubeEngine();
  eng.applyAlgorithm(sub.initialState);
  const edgePos = findEdge(eng, sub.targetEdge[0], sub.targetEdge[1]);

  const eng2 = new CubeEngine();
  eng2.applyAlgorithm(sub.initialState);
  eng2.applyAlgorithm(sub.algorithm);
  const solved = crossSolved(eng2);

  const edgeVis = edgePos ? isVisible(edgePos) : false;
  const yCoord = edgePos ? edgePos[1] : 0;
  const layer = yCoord > 0 ? "U-layer" : yCoord < 0 ? "D-layer" : "mid-layer";

  const home = edgePos ? CROSS_HOMES[[sub.targetEdge[0],sub.targetEdge[1]].sort().join("+")] : null;

  let arrowOK = "N/A";
  if (sub.arrows.length === 1 && edgePos && home) {
    const fromOK = posEq(sub.arrows[0].from, edgePos);
    const toOK = posEq(sub.arrows[0].to, home);
    arrowOK = (fromOK && toOK) ? "✓" : "✗";
  } else if (sub.arrows.length === 2 && edgePos) {
    // Case 4: arrow[0] = red piece from UF→UR, arrow[1] = green piece from UR→UF
    const redPos = findEdge(eng, "white", "red");
    const greenPos = findEdge(eng, "white", "green");
    const greenHome = CROSS_HOMES["white+green"];
    const redHome = CROSS_HOMES["white+red"];
    const a0ok = redPos && posEq(sub.arrows[0].from, redPos) && posEq(sub.arrows[0].to, redHome);
    const a1ok = greenPos && posEq(sub.arrows[1].from, greenPos) && posEq(sub.arrows[1].to, greenHome);
    arrowOK = (a0ok && a1ok) ? "✓" : "✗";
  }

  const homeVis = home ? isVisible(home) : false;

  console.log(`\n▶ ${sub.id}`);
  console.log(`  title:      ${sub.title}`);
  console.log(`  edge at:    [${edgePos}]  layer: ${layer}  visible: ${edgeVis ? "✓" : "✗"}`);
  console.log(`  algo:       "${sub.algorithm}"  cross solved: ${solved ? "✓ PASS" : "✗ FAIL"}`);
  console.log(`  arrow:      ${arrowOK}  from=[${sub.arrows[0].from}] to=[${sub.arrows[0].to}]`);
  console.log(`  home vis:   ${homeVis ? "✓" : "✗"}  [${home}]`);
}

console.log("\n" + "═".repeat(80));
console.log("SUMMARY TABLE");
console.log("═".repeat(80));
console.log("| Substep      | Solvable | Piece OK | Arrow OK | Layer OK | Home Vis |");
console.log("|--------------|----------|----------|----------|----------|----------|");

for (const sub of substeps) {
  const eng = new CubeEngine();
  eng.applyAlgorithm(sub.initialState);
  const edgePos = findEdge(eng, sub.targetEdge[0], sub.targetEdge[1]);

  const eng2 = new CubeEngine();
  eng2.applyAlgorithm(sub.initialState);
  eng2.applyAlgorithm(sub.algorithm);
  const solvable = crossSolved(eng2) ? "✓" : "✗";

  const edgeVis = edgePos && isVisible(edgePos) ? "✓" : "✗";
  const home = edgePos ? CROSS_HOMES[[sub.targetEdge[0],sub.targetEdge[1]].sort().join("+")] : null;

  let arrowOK = "N/A";
  if (sub.arrows.length === 1 && edgePos && home) {
    const fromOK = posEq(sub.arrows[0].from, edgePos);
    const toOK = posEq(sub.arrows[0].to, home);
    arrowOK = (fromOK && toOK) ? "✓ " : "✗ ";
  } else if (sub.arrows.length === 2 && edgePos) {
    const redPos = findEdge(eng, "white", "red");
    const greenPos = findEdge(eng, "white", "green");
    const redHome = CROSS_HOMES["white+red"];
    const greenHome = CROSS_HOMES["white+green"];
    const a0ok = redPos && posEq(sub.arrows[0].from, redPos) && posEq(sub.arrows[0].to, redHome);
    const a1ok = greenPos && posEq(sub.arrows[1].from, greenPos) && posEq(sub.arrows[1].to, greenHome);
    arrowOK = (a0ok && a1ok) ? "✓ " : "✗ ";
  }

  const yCoord = edgePos ? edgePos[1] : null;
  const layerOK = yCoord === sub.expectedY ? "✓" : "✗";
  const homeVis = home && isVisible(home) ? "✓" : "✗";

  console.log(`| ${sub.id.padEnd(12)} |    ${solvable}     |    ${edgeVis}     |   ${arrowOK.padEnd(4)}   |    ${layerOK}     |    ${homeVis}     |`);
}
console.log("");
