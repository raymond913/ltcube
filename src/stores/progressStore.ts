import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TrainerStats {
  totalSessions: number;
  correctAnswers: number;
  totalAnswers: number;
  avgTimeMs: number;
  lastSessionDate: string | null;
}

interface ProgressState {
  completedSteps: string[];
  learnedCases: string[];
  trainerStats: TrainerStats;
  streakCount: number;
  bestStreak: number;

  // Actions
  completeStep: (id: string) => void;
  markCaseLearned: (id: string) => void;
  recordTrainerSession: (correct: number, total: number, avgTime: number) => void;
  updateStreak: () => void;
  resetProgress: () => void;
}

const defaultStats: TrainerStats = {
  totalSessions: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  avgTimeMs: 0,
  lastSessionDate: null,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedSteps: [],
      learnedCases: [],
      trainerStats: defaultStats,
      streakCount: 0,
      bestStreak: 0,

      completeStep: (id) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(id)) {
          set({ completedSteps: [...completedSteps, id] });
        }
      },

      markCaseLearned: (id) => {
        const { learnedCases } = get();
        if (!learnedCases.includes(id)) {
          set({ learnedCases: [...learnedCases, id] });
        }
      },

      recordTrainerSession: (correct, total, avgTime) => {
        const { trainerStats } = get();
        const sessions = trainerStats.totalSessions + 1;
        // Running weighted average for avgTimeMs
        const newAvg =
          (trainerStats.avgTimeMs * trainerStats.totalSessions + avgTime) / sessions;

        set({
          trainerStats: {
            totalSessions: sessions,
            correctAnswers: trainerStats.correctAnswers + correct,
            totalAnswers: trainerStats.totalAnswers + total,
            avgTimeMs: Math.round(newAvg),
            lastSessionDate: new Date().toISOString(),
          },
        });
      },

      updateStreak: () => {
        const { streakCount, bestStreak, trainerStats } = get();
        const today = new Date().toDateString();
        const lastSession = trainerStats.lastSessionDate
          ? new Date(trainerStats.lastSessionDate).toDateString()
          : null;

        if (lastSession === today) return; // already updated today

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive = lastSession === yesterday.toDateString();

        const newStreak = isConsecutive ? streakCount + 1 : 1;
        set({
          streakCount: newStreak,
          bestStreak: Math.max(bestStreak, newStreak),
        });
      },

      resetProgress: () => {
        set({
          completedSteps: [],
          learnedCases: [],
          trainerStats: defaultStats,
          streakCount: 0,
          bestStreak: 0,
        });
      },
    }),
    {
      name: "ltcube-progress",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
