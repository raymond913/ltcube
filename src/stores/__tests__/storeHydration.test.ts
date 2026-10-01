import { afterEach, describe, it, expect, vi } from "vitest";

function seedStorage(entries: Record<string, unknown>) {
  const mem = new Map<string, string>(
    Object.entries(entries).map(([k, v]) => [k, JSON.stringify(v)]),
  );
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", { localStorage: storage });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("progress store hydration", () => {
  it("starts from defaults so the first client render matches the server", async () => {
    seedStorage({
      "ltcube-progress": { state: { completedSteps: ["cross", "corners"] }, version: 1 },
    });
    const { useProgressStore } = await import("../progressStore");
    expect(useProgressStore.getState().completedSteps).toEqual([]);
  });

  it("loads saved progress once rehydrate() is called", async () => {
    seedStorage({
      "ltcube-progress": { state: { completedSteps: ["cross", "corners"] }, version: 1 },
    });
    const { useProgressStore } = await import("../progressStore");
    await useProgressStore.persist.rehydrate();
    expect(useProgressStore.getState().completedSteps).toEqual(["cross", "corners"]);
  });
});

describe("preferences store hydration", () => {
  it("starts stickered and loads the saved style after rehydrate()", async () => {
    seedStorage({ "ltcube-preferences": { state: { cubeStyle: "stickerless" }, version: 0 } });
    const { usePreferencesStore } = await import("../preferencesStore");
    expect(usePreferencesStore.getState().cubeStyle).toBe("stickered");
    await usePreferencesStore.persist.rehydrate();
    expect(usePreferencesStore.getState().cubeStyle).toBe("stickerless");
  });
});

describe("rehydrateStores", () => {
  it("loads both stores from saved data", async () => {
    seedStorage({
      "ltcube-progress": { state: { completedSteps: ["cross"] }, version: 1 },
      "ltcube-preferences": { state: { cubeStyle: "stickerless" }, version: 0 },
    });
    const { rehydrateStores } = await import("../rehydrate");
    const { useProgressStore } = await import("../progressStore");
    const { usePreferencesStore } = await import("../preferencesStore");
    await rehydrateStores();
    expect(useProgressStore.getState().completedSteps).toEqual(["cross"]);
    expect(usePreferencesStore.getState().cubeStyle).toBe("stickerless");
  });

  it("does not throw when browser storage is blocked", async () => {
    const { rehydrateStores } = await import("../rehydrate");
    await expect(rehydrateStores()).resolves.toBeUndefined();
  });
});
