import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { FACE_COLORS } from "../sceneColors";

const CSS = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");
const cssToken = (name: string) =>
  CSS.match(new RegExp(String.raw`--color-${name}:\s*(#[0-9A-Fa-f]{6})`))?.[1].toUpperCase();

describe("sceneColors", () => {
  it("keeps the 3D cube face colors in sync with the --color-cube-* tokens", () => {
    expect({
      R: cssToken("cube-red"),
      L: cssToken("cube-orange"),
      U: cssToken("cube-yellow"),
      D: cssToken("cube-white"),
      F: cssToken("cube-blue"),
      B: cssToken("cube-green"),
    }).toEqual(
      Object.fromEntries(Object.entries(FACE_COLORS).map(([k, v]) => [k, v.toUpperCase()])),
    );
  });

  it("defines a color for every face", () => {
    expect(Object.keys(FACE_COLORS).sort()).toEqual(["B", "D", "F", "L", "R", "U"]);
  });
});
