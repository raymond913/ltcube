import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { BEGINNER_STEPS } from "@/data/beginner";
import { STEP_COLORS, tint } from "../theme";

describe("tint", () => {
  it("mixes a CSS color with transparency at the given percentage", () => {
    expect(tint("var(--color-primary)", 8)).toBe(
      "color-mix(in srgb, var(--color-primary) 8%, transparent)",
    );
  });

  it("rounds to a whole percent and clamps to 0-100", () => {
    expect(tint("red", 7.6)).toBe("color-mix(in srgb, red 8%, transparent)");
    expect(tint("red", -5)).toBe("color-mix(in srgb, red 0%, transparent)");
    expect(tint("red", 140)).toBe("color-mix(in srgb, red 100%, transparent)");
  });
});

describe("STEP_COLORS", () => {
  const css = readFileSync(path.resolve(__dirname, "../../app/globals.css"), "utf8");

  it("has a color for every lesson", () => {
    expect(Object.keys(STEP_COLORS).sort()).toEqual(BEGINNER_STEPS.map((s) => s.id).sort());
  });

  it("only points at step tokens that exist in globals.css", () => {
    for (const value of Object.values(STEP_COLORS)) {
      const name = value.match(/^var\((--color-step-[a-z]+)\)$/)?.[1];
      expect(name, value).toBeDefined();
      expect(css).toContain(`${name}:`);
    }
  });
});
