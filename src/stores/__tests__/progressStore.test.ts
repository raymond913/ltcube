import { beforeEach, describe, it, expect, vi } from "vitest";

vi.hoisted(() => {
  const mem = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
    removeItem: (k: string) => void mem.delete(k),
  });
});

import { useProgressStore, localDateKey, getEffectiveStreak } from "../progressStore";

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h, 0, 0);
const store = () => useProgressStore.getState();

beforeEach(() => {
  store().resetProgress();
});

describe("localDateKey", () => {
  it("uses the local calendar day, not the UTC day", () => {
    expect(localDateKey(at(2026, 1, 10, 23))).toBe("2026-01-10");
    expect(localDateKey(at(2026, 1, 10, 0))).toBe("2026-01-10");
  });
});

describe("updateStreak", () => {
  it("starts a streak at 1 on the first ever session", () => {
    store().updateStreak(at(2026, 3, 10));
    expect(store().streakCount).toBe(1);
    expect(store().bestStreak).toBe(1);
  });

  it("counts the first trainer session when recordTrainerSession runs first", () => {
    store().recordTrainerSession(8, 10, 3000);
    store().updateStreak();
    expect(store().streakCount).toBe(1);
  });

  it("extends the streak once on consecutive days", () => {
    store().updateStreak(at(2026, 3, 10));
    store().updateStreak(at(2026, 3, 11));
    store().updateStreak(at(2026, 3, 12));
    expect(store().streakCount).toBe(3);
    expect(store().bestStreak).toBe(3);
  });

  it("does not count the same day twice", () => {
    store().updateStreak(at(2026, 3, 10));
    store().updateStreak(at(2026, 3, 11, 9));
    store().updateStreak(at(2026, 3, 11, 20));
    store().updateStreak(at(2026, 3, 11, 23));
    expect(store().streakCount).toBe(2);
  });

  it("restarts at 1 after a missed day but keeps the best streak", () => {
    store().updateStreak(at(2026, 3, 10));
    store().updateStreak(at(2026, 3, 11));
    store().updateStreak(at(2026, 3, 14));
    expect(store().streakCount).toBe(1);
    expect(store().bestStreak).toBe(2);
  });

  it("handles month boundaries", () => {
    store().updateStreak(at(2026, 2, 28));
    store().updateStreak(at(2026, 3, 1));
    expect(store().streakCount).toBe(2);
  });
});

describe("getEffectiveStreak", () => {
  it("shows the streak while it is alive today or yesterday", () => {
    expect(getEffectiveStreak(4, "2026-03-11", at(2026, 3, 11))).toBe(4);
    expect(getEffectiveStreak(4, "2026-03-11", at(2026, 3, 12))).toBe(4);
  });

  it("shows 0 once a full day has been missed", () => {
    expect(getEffectiveStreak(4, "2026-03-11", at(2026, 3, 13))).toBe(0);
  });

  it("shows 0 when there has never been a streak date", () => {
    expect(getEffectiveStreak(5, null, at(2026, 3, 13))).toBe(0);
  });
});

describe("persisted-state migration", () => {
  const migrate = (old: unknown, v: number) =>
    useProgressStore.persist.getOptions().migrate!(old, v) as { lastStreakDate: string | null };

  it("seeds lastStreakDate from the last trainer session of a version-0 save", () => {
    const old = { streakCount: 2, trainerStats: { lastSessionDate: at(2026, 3, 10).toISOString() } };
    expect(migrate(old, 0).lastStreakDate).toBe("2026-03-10");
  });

  it("uses null when a version-0 save has no sessions", () => {
    expect(migrate({ streakCount: 0, trainerStats: { lastSessionDate: null } }, 0).lastStreakDate).toBeNull();
  });
});

describe("activity dates", () => {
  it("records the local day when a step is completed", () => {
    vi.useFakeTimers();
    vi.setSystemTime(at(2026, 1, 10, 23));
    store().completeStep("cross");
    vi.useRealTimers();
    expect(store().activityDates).toEqual(["2026-01-10"]);
  });
});
