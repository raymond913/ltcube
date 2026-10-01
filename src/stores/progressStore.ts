import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TrainerStats {
  totalSessions: number;
  correctAnswers: number;
  totalAnswers: number;
  avgTimeMs: number;
  lastSessionDate: string | null;
}

interface SessionRecord {
  date: string;
  accuracy: number;
}

interface ProgressState {
  completedSteps: string[];
  learnedCases: string[];
  trainerStats: TrainerStats;
  streakCount: number;
  bestStreak: number;
  lastStreakDate: string | null;
  sessionHistory: SessionRecord[];
  activityDates: string[];

  // Actions
  completeStep: (id: string) => void;
  markCaseLearned: (id: string) => void;
  recordTrainerSession: (correct: number, total: number, avgTime: number) => void;
  updateStreak: (now?: Date) => void;
  resetProgress: () => void;
}

const defaultStats: TrainerStats = {
  totalSessions: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  avgTimeMs: 0,
  lastSessionDate: null,
};

export function localDateKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function dayBefore(d: Date): Date {
  const prev = new Date(d);
  prev.setDate(prev.getDate() - 1);
  return prev;
}

/** The streak to show: a streak only stays alive through today or yesterday. */
export function getEffectiveStreak(
  streakCount: number,
  lastStreakDate: string | null,
  now: Date = new Date(),
): number {
  if (!lastStreakDate) return 0;
  const alive = lastStreakDate === localDateKey(now) || lastStreakDate === localDateKey(dayBefore(now));
  return alive ? streakCount : 0;
}

function todayStr() {
  return localDateKey();
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedSteps: [],
      learnedCases: [],
      trainerStats: defaultStats,
      streakCount: 0,
      bestStreak: 0,
      lastStreakDate: null,
      sessionHistory: [],
      activityDates: [],

      completeStep: (id) => {
        const { completedSteps, activityDates } = get();
        if (!completedSteps.includes(id)) {
          const today = todayStr();
          set({
            completedSteps: [...completedSteps, id],
            activityDates: activityDates.includes(today)
              ? activityDates
              : [...activityDates, today],
          });
        }
      },

      markCaseLearned: (id) => {
        const { learnedCases } = get();
        if (!learnedCases.includes(id)) {
          set({ learnedCases: [...learnedCases, id] });
        }
      },

      recordTrainerSession: (correct, total, avgTime) => {
        const { trainerStats, sessionHistory, activityDates } = get();
        const sessions = trainerStats.totalSessions + 1;
        const newAvg =
          (trainerStats.avgTimeMs * trainerStats.totalSessions + avgTime) / sessions;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        const today = todayStr();

        set({
          trainerStats: {
            totalSessions: sessions,
            correctAnswers: trainerStats.correctAnswers + correct,
            totalAnswers: trainerStats.totalAnswers + total,
            avgTimeMs: Math.round(newAvg),
            lastSessionDate: new Date().toISOString(),
          },
          sessionHistory: [
            ...sessionHistory.slice(-19),
            { date: today, accuracy },
          ],
          activityDates: activityDates.includes(today)
            ? activityDates
            : [...activityDates, today],
        });
      },

      updateStreak: (now = new Date()) => {
        const { streakCount, bestStreak, lastStreakDate } = get();
        const today = localDateKey(now);

        if (lastStreakDate === today) return;

        const isConsecutive = lastStreakDate === localDateKey(dayBefore(now));
        const newStreak = isConsecutive ? streakCount + 1 : 1;
        set({
          streakCount: newStreak,
          bestStreak: Math.max(bestStreak, newStreak),
          lastStreakDate: today,
        });
      },

      resetProgress: () => {
        set({
          completedSteps: [],
          learnedCases: [],
          trainerStats: defaultStats,
          streakCount: 0,
          bestStreak: 0,
          lastStreakDate: null,
          sessionHistory: [],
          activityDates: [],
        });
      },
    }),
    {
      name: "ltcube-progress",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as Partial<ProgressState>;
        if (version < 1 && state.lastStreakDate === undefined) {
          const last = state.trainerStats?.lastSessionDate;
          state.lastStreakDate = last ? localDateKey(new Date(last)) : null;
        }
        return state as ProgressState;
      },
    }
  )
);
