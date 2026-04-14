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
  sessionHistory: SessionRecord[];
  activityDates: string[];

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

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedSteps: [],
      learnedCases: [],
      trainerStats: defaultStats,
      streakCount: 0,
      bestStreak: 0,
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

      updateStreak: () => {
        const { streakCount, bestStreak, trainerStats } = get();
        const today = new Date().toDateString();
        const lastSession = trainerStats.lastSessionDate
          ? new Date(trainerStats.lastSessionDate).toDateString()
          : null;

        if (lastSession === today) return;

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
          sessionHistory: [],
          activityDates: [],
        });
      },
    }),
    {
      name: "ltcube-progress",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
