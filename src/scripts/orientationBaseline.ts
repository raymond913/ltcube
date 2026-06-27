import { CubeEngine } from "../lib/cubeEngine";

const EDGE_IDS = ["UF","UB","UL","UR","DF","DB","DL","DR","FL","FR","BL","BR"];
const CENTER_IDS = ["U","D","F","B","L","R"];

// Read color at a face-array position (absolute position in state)
function faceColor(eng: CubeEngine, face: "U"|"D"|"F"|"B"|"L"|"R", r: number, c: number): string {
  return String(eng.getState()[face][r][c]);
}

// Which color is currently in the center of a face ARRAY (not which piece)
function faceArrayCenter(eng: CubeEngine, face: "U"|"D"|"F"|"B"|"L"|"R"): string {
  return faceColor(eng, face, 1, 1);
}

// Which cubie piece is at world position [x,y,z] and what colors are its stickers
function cubieAt(eng: CubeEngine, x: number, y: number, z: number): string {
  const state = eng.getState();
  for (const id of [...EDGE_IDS, ...CENTER_IDS]) {
    const stickers = eng.getStickersForCubie(id);
    const pos = eng.getCubieWorldPosition(id);
    if (pos && pos[0]===x && pos[1]===y && pos[2]===z) {
      const colors = stickers.map(s => state[s.face][s.row][s.col]);
      return `${id}(${colors.join("+")})`;
    }
  }
  return "?";
}

// Find edge piece by color pair → world position
function edgePos(eng: CubeEngine, c1: string, c2: string): [number,number,number] | null {
  const state = eng.getState();
  for (const id of EDGE_IDS) {
    const stickers = eng.getStickersForCubie(id);
    const colors = stickers.map(s => state[s.face][s.row][s.col]) as string[];
    if (colors.includes(c1) && colors.includes(c2)) {
      return eng.getCubieWorldPosition(id);
    }
  }
  return null;
}

// ─── ROTATION TEST ────────────────────────────────────────────────────────────
console.log("═".repeat(60));
console.log("STEP 1 — ROTATION TEST: z2 vs x2");
console.log("═".repeat(60));

for (const rot of ["z2", "x2"] as const) {
  const eng = new CubeEngine();
  eng.applyAlgorithm(rot);

  // Which face ARRAY has white (= what does "U" notation actually turn)?
  const uArrayColor  = faceArrayCenter(eng, "U");
  const fArrayColor  = faceArrayCenter(eng, "F");

  // Where are the cubie pieces physically?
  const whiteCubie = cubieAt(eng, 0,  1, 0);   // top world pos
  const greenCubieF= cubieAt(eng, 0,  0, 1);   // front world pos
  const greenCubieB= cubieAt(eng, 0,  0,-1);   // back world pos

  const whiteTop   = uArrayColor === "white";
  const greenFront = fArrayColor === "green";

  console.log(`\n── ${rot} ──`);
  console.log(`  U face array center: ${uArrayColor.padEnd(8)} (white? ${whiteTop  ? "YES ✓":"NO ✗"})`);
  console.log(`  F face array center: ${fArrayColor.padEnd(8)} (green? ${greenFront? "YES ✓":"NO ✗"})`);
  console.log(`  cubie at [0,1,0](top)  : ${whiteCubie}`);
  console.log(`  cubie at [0,0,1](front): ${greenCubieF}`);
  console.log(`  cubie at [0,0,-1](back): ${greenCubieB}`);
  console.log(`  ACHIEVES U=white + F=green: ${whiteTop&&greenFront?"YES ✓":"NO ✗"}`);
}

// ─── PICK WINNER ──────────────────────────────────────────────────────────────
const engZ2 = new CubeEngine(); engZ2.applyAlgorithm("z2");
const engX2 = new CubeEngine(); engX2.applyAlgorithm("x2");
const z2ok  = faceArrayCenter(engZ2,"U")==="white" && faceArrayCenter(engZ2,"F")==="green";
const x2ok  = faceArrayCenter(engX2,"U")==="white" && faceArrayCenter(engX2,"F")==="green";
const ROT   = z2ok ? "z2" : x2ok ? "x2" : "NONE";

console.log(`\n► WINNER: ${ROT}\n`);
if (ROT==="NONE") { console.error("Neither rotation works."); process.exit(1); }

const eng = new CubeEngine();
eng.applyAlgorithm(ROT);

// ─── FULL BASELINE ────────────────────────────────────────────────────────────
console.log("═".repeat(60));
console.log(`STEP 2 — BASELINE after "${ROT}"`);
console.log("═".repeat(60));

console.log("\n── 6 face arrays (what each face notation actually turns) ──");
const faces = ["U","D","F","B","L","R"] as const;
const worldLabels: Record<string,string> = {
  U:"top  (+Y)", D:"bot  (-Y)", F:"front(+Z)", B:"back (-Z)", L:"left (-X)", R:"right(+X)"
};
for (const f of faces) {
  const color = faceArrayCenter(eng, f);
  console.log(`  ${f} face array: ${color.padEnd(8)} ${worldLabels[f]}`);
}

console.log("\n── 6 cubie piece world positions ──────────────────────────");
for (const id of CENTER_IDS) {
  const stickers = eng.getStickersForCubie(id);
  const color = String(eng.getState()[stickers[0].face][stickers[0].row][stickers[0].col]);
  const pos   = eng.getCubieWorldPosition(id);
  console.log(`  piece "${id}" (${color.padEnd(7)}) at world [${pos?.join(",")}]`);
}

console.log("\n── 4 white-layer edge home positions ───────────────────────");
const pairs = [["white","green"],["white","red"],["white","blue"],["white","orange"]];
for (const [c1,c2] of pairs) {
  const p = edgePos(eng, c1, c2);
  const slot = p ? `[${p.join(",")}]` : "null";
  console.log(`  ${c1}-${c2}: ${slot}`);
}

// ─── U NOTATION CHECK ─────────────────────────────────────────────────────────
console.log("\n── U notation: does it rotate the white (top) face? ───────");
{
  const before = faceArrayCenter(eng, "U");
  const wgBefore = edgePos(eng,"white","green");

  const e = new CubeEngine(); e.applyAlgorithm(ROT);
  e.applyAlgorithm("U");

  const after   = faceArrayCenter(e, "U");
  const wgAfter = edgePos(e,"white","green");
  const moved   = wgBefore && wgAfter && (wgBefore[0]!==wgAfter[0]||wgBefore[2]!==wgAfter[2]);
  const staysUp = wgAfter?.[1] === 1;

  console.log(`  U face array before U: ${before}`);
  console.log(`  U face array after  U: ${after}`);
  console.log(`  white-green edge: [${wgBefore?.join(",")}] → [${wgAfter?.join(",")}]`);
  console.log(`  edge moved within U layer: ${moved?"YES ✓":"NO ✗"}`);
  console.log(`  edge stays in y=+1 layer:  ${staysUp?"YES ✓":"NO ✗"}`);
  console.log(`  U ROTATES THE WHITE FACE: ${before==="white"&&after==="white"&&moved?"YES ✓":"NO ✗"}`);
}

// ─── F NOTATION CHECK ─────────────────────────────────────────────────────────
console.log("\n── F notation: does it rotate the green (front) face? ─────");
{
  // Place white-green at UF world position first to test if F moves it
  // After ROT, white-green home = [0,1,-1]. We need a piece ON the F face.
  // Use white-blue edge (should be at UF=[0,1,1] after ROT per cross layout)
  const e = new CubeEngine(); e.applyAlgorithm(ROT);
  const fBefore = faceArrayCenter(e,"F");

  // Find any edge on the F face (z=+1)
  let testEdge: [number,number,number]|null = null;
  let testColors = "";
  for (const id of EDGE_IDS) {
    const p = e.getCubieWorldPosition(id);
    if (p && p[2]===1) { // on front face (z=+1)
      const st = e.getStickersForCubie(id);
      const colors = st.map(s=>String(e.getState()[s.face][s.row][s.col]));
      testEdge = p; testColors = colors.join("+"); break;
    }
  }

  const edgeBefore = testEdge ? `[${testEdge.join(",")}](${testColors})` : "none at z=+1";
  e.applyAlgorithm("F");
  const fAfter = faceArrayCenter(e,"F");

  // Find where that piece went
  let edgeAfter = "";
  if (testEdge) {
    for (const id of EDGE_IDS) {
      const st = e.getStickersForCubie(id);
      const colors = st.map(s=>String(e.getState()[s.face][s.row][s.col]));
      if (colors.join("+")===testColors || colors.slice().reverse().join("+")===testColors) {
        const p = e.getCubieWorldPosition(id);
        edgeAfter = p ? `[${p.join(",")}]` : "null";
        break;
      }
    }
  }

  console.log(`  F face array before F: ${fBefore}`);
  console.log(`  F face array after  F: ${fAfter}`);
  console.log(`  sample edge on F face: ${edgeBefore}`);
  console.log(`  that edge after F:     ${edgeAfter || "(see above)"}`);
  console.log(`  F ROTATES THE GREEN FACE: ${fBefore==="green"&&fAfter==="green"?"YES ✓":"NO ✗"}`);
}

// ─── HOME SLOT ANALYSIS ───────────────────────────────────────────────────────
console.log("\n── Home slot geometry analysis ─────────────────────────────");
{
  const wg = edgePos(eng,"white","green");
  console.log(`  white-green home: [${wg?.join(",")}]`);
  console.log(`  green center at:  [${(() => {
    for (const id of CENTER_IDS) {
      const st = eng.getStickersForCubie(id);
      const color = String(eng.getState()[st[0].face][st[0].row][st[0].col]);
      if (color==="green") { const p=eng.getCubieWorldPosition(id); return p?.join(","); }
    }
    return "?";
  })()}]`);
  const home = wg ? `[${wg.join(",")}]` : "?";
  const isUF = wg?.[2]===1 && wg?.[1]===1;
  const isUB = wg?.[2]===-1 && wg?.[1]===1;
  console.log(`  home is UF [0,1,+1]: ${isUF?"YES":"NO"}`);
  console.log(`  home is UB [0,1,-1]: ${isUB?"YES":"NO"}`);
  console.log(`  NOTE: green center at [0,0,1]=F face; white-green home at ${home}`);
  if (!isUF) console.log(`  ⚠ DISCREPANCY: home is not adjacent to green center!`);
}

// ─── CAMERA RECOMMENDATION ────────────────────────────────────────────────────
console.log("\n── Camera recommendation ────────────────────────────────────");
console.log("  For cross tutorial: need to see white top (U) + green front (F=+Z)");
console.log("  + the white-green home slot");
const wgHome = edgePos(eng,"white","green");
console.log(`  White-green home at: [${wgHome?.join(",")}]`);
console.log(`  Camera [4,3,4]  → sees +X,+Y,+Z: white✓ green✓ home(${wgHome?.[2]===1?"✓":"✗"} z=${wgHome?.[2]})`);
console.log(`  Camera [4,3,-4] → sees +X,+Y,-Z: white✓ green✗ home(${wgHome?.[2]===-1?"✓":"✗"} z=${wgHome?.[2]})`);
console.log(`  RECOMMENDED: [4, 3, ${wgHome?.[2]===1?"4":"−4"}]`);

// ─── FINAL SUMMARY ────────────────────────────────────────────────────────────
console.log("\n" + "═".repeat(60));
console.log("FINAL SUMMARY");
console.log("═".repeat(60));
console.log(`Rotation to put white on top: "${ROT}"`);
console.log(`U face array color (what U notation turns): ${faceArrayCenter(eng,"U")}`);
console.log(`F face array color (what F notation turns): ${faceArrayCenter(eng,"F")}`);
console.log("White-layer edge homes:");
for (const [c1,c2] of pairs) {
  const p = edgePos(eng,c1,c2);
  console.log(`  ${(c1+"-"+c2).padEnd(16)}: [${p?.join(",")}]`);
}
