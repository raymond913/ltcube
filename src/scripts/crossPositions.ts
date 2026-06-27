import { CubeEngine } from "../lib/cubeEngine";

const edges = ["UF","UB","UL","UR","DF","DB","DL","DR","FL","FR","BL","BR"];

function findWhiteGreen(eng: CubeEngine): string {
  const state = eng.getState();
  for (const id of edges) {
    const stickers = eng.getStickersForCubie(id);
    const colors = stickers.map(s => state[s.face][s.row][s.col]);
    if (colors.includes("white") && colors.includes("green")) {
      const pos = eng.getCubieWorldPosition(id);
      return pos ? pos.join(",") : "?";
    }
  }
  return "not found";
}

const cases = [
  { name: "wc-white-front",  moves: ["U2"],     initialState: "x2 U2"    },
  { name: "wc-middle-front", moves: ["R'","U"],  initialState: "x2 U' R"  },
  { name: "wc-yellow-right", moves: ["R2","U"],  initialState: "x2 U' R2" },
  { name: "wc-yellow-front", moves: ["B2","U2"], initialState: "x2 U2 B2" },
  { name: "wc-middle-back",  moves: ["F'"],      initialState: "x2 F"     },
];

for (const c of cases) {
  console.log(`\n=== ${c.name} ===`);
  const eng = new CubeEngine();
  eng.applyAlgorithm(c.initialState);
  console.log(`  START:  [${findWhiteGreen(eng)}]`);
  for (const m of c.moves) {
    eng.applyAlgorithm(m);
    console.log(`  after ${m.padEnd(3)}: [${findWhiteGreen(eng)}]`);
  }
}
