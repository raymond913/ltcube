import { describe, it, expect } from "vitest";
import { parseStepIndex } from "../stepParam";

describe("parseStepIndex", () => {
  it("converts a 1-based step to a 0-based index", () => {
    expect(parseStepIndex("1", 4)).toBe(0);
    expect(parseStepIndex("3", 4)).toBe(2);
  });

  it("falls back to the first step when missing", () => {
    expect(parseStepIndex(undefined, 4)).toBe(0);
    expect(parseStepIndex(null, 4)).toBe(0);
    expect(parseStepIndex("", 4)).toBe(0);
  });

  it("never returns NaN for garbage input", () => {
    for (const raw of ["abc", "NaN", "Infinity", "-Infinity", "1e999", " ", "--1"]) {
      expect(Number.isNaN(parseStepIndex(raw, 4))).toBe(false);
      expect(parseStepIndex(raw, 4)).toBe(0);
    }
  });

  it("clamps out-of-range values into the valid index range", () => {
    expect(parseStepIndex("0", 4)).toBe(0);
    expect(parseStepIndex("-3", 4)).toBe(0);
    expect(parseStepIndex("99", 4)).toBe(3);
  });

  it("truncates decimals like parseInt does", () => {
    expect(parseStepIndex("2.9", 4)).toBe(1);
  });

  it("returns 0 for an empty list instead of -1", () => {
    expect(parseStepIndex("2", 0)).toBe(0);
  });
});
