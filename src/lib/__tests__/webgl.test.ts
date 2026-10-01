import { afterEach, describe, it, expect, vi } from "vitest";

function stubDocument(ctx: unknown) {
  const createElement = vi.fn(() => ({ getContext: () => ctx }));
  vi.stubGlobal("document", { createElement });
  return createElement;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("canUseWebGL", () => {
  it("probes the browser only once, however many components ask", async () => {
    const createElement = stubDocument({ getExtension: () => ({ loseContext: () => {} }) });
    const { canUseWebGL } = await import("../webgl");
    expect(canUseWebGL()).toBe(true);
    expect(canUseWebGL()).toBe(true);
    expect(canUseWebGL()).toBe(true);
    expect(createElement).toHaveBeenCalledTimes(1);
  });

  it("remembers a failed probe too", async () => {
    const createElement = stubDocument(null);
    const { canUseWebGL } = await import("../webgl");
    expect(canUseWebGL()).toBe(false);
    expect(canUseWebGL()).toBe(false);
    expect(createElement).toHaveBeenCalledTimes(1);
  });

  it("returns false instead of throwing when there is no DOM", async () => {
    const { canUseWebGL } = await import("../webgl");
    expect(canUseWebGL()).toBe(false);
  });
});
