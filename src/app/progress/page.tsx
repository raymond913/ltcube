"use client";

import { useRouter } from "next/navigation";
import { useProgressStore } from "@/stores/progressStore";

const STEPS = [
  { id: "white-cross", title: "White Cross", route: "/learn/white-cross" },
  { id: "white-corners", title: "White Corners", route: "/learn/white-corners" },
  { id: "second-layer", title: "Second Layer", route: "/learn/second-layer" },
  { id: "two-look-oll", title: "2-Look OLL", route: "/learn/oll" },
  { id: "two-look-pll", title: "2-Look PLL", route: "/learn/pll" },
];

const OLL_CASES = [
  { id: "oll-dot", title: "Dot" },
  { id: "oll-l-shape", title: "Small L" },
  { id: "oll-line", title: "Line" },
  { id: "oll-sune", title: "Sune" },
  { id: "oll-antisune", title: "Anti-Sune" },
  { id: "oll-h", title: "H Pattern" },
  { id: "oll-pi", title: "Pi" },
  { id: "oll-u", title: "U Pattern" },
  { id: "oll-t", title: "T Pattern" },
  { id: "oll-l", title: "L Pattern" },
];

const PLL_CASES = [
  { id: "pll-adjacent", title: "Adjacent Swap" },
  { id: "pll-diagonal", title: "Diagonal Swap" },
  { id: "pll-ua", title: "Ua Perm" },
  { id: "pll-ub", title: "Ub Perm" },
  { id: "pll-h", title: "H Perm" },
  { id: "pll-z", title: "Z Perm" },
];

function AccuracyChart({ sessions }: { sessions: { date: string; accuracy: number }[] }) {
  if (sessions.length < 2) return null;
  const W = 400;
  const H = 80;
  const pad = { l: 28, r: 8, t: 8, b: 20 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const points = sessions.map((s, i) => {
    const x = pad.l + (i / (sessions.length - 1)) * plotW;
    const y = pad.t + plotH - (s.accuracy / 100) * plotH;
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const area = [
    `${pad.l},${pad.t + plotH}`,
    ...points,
    `${pad.l + plotW},${pad.t + plotH}`,
  ].join(" ");

  const yLabels = [0, 50, 100];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
      {yLabels.map((v) => {
        const y = pad.t + plotH - (v / 100) * plotH;
        return (
          <g key={v}>
            <line
              x1={pad.l} y1={y} x2={pad.l + plotW} y2={y}
              stroke="#E2E8F0" strokeWidth="1"
            />
            <text x={pad.l - 4} y={y + 4} fontSize="8" fill="#94A3B8" textAnchor="end">
              {v}%
            </text>
          </g>
        );
      })}
      <polygon points={area} fill="#2563EB" fillOpacity="0.08" />
      <polyline points={polyline} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" />
      {sessions.map((s, i) => {
        const x = pad.l + (i / (sessions.length - 1)) * plotW;
        const y = pad.t + plotH - (s.accuracy / 100) * plotH;
        return <circle key={i} cx={x} cy={y} r="2.5" fill="#2563EB" />;
      })}
    </svg>
  );
}

function CalendarGrid({ activityDates }: { activityDates: string[] }) {
  const today = new Date();
  const days: { date: string; active: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const str = d.toISOString().slice(0, 10);
    days.push({ date: str, active: activityDates.includes(str) });
  }

  return (
    <div className="flex flex-wrap gap-1">
      {days.map(({ date, active }) => (
        <div
          key={date}
          title={date}
          className="w-6 h-6 rounded-sm"
          style={{ backgroundColor: active ? "#16A34A" : "#E2E8F0" }}
        />
      ))}
    </div>
  );
}

export default function ProgressPage() {
  const router = useRouter();
  const {
    completedSteps,
    learnedCases,
    trainerStats,
    streakCount,
    bestStreak,
    sessionHistory,
    activityDates,
  } = useProgressStore();

  const completedCount = completedSteps.length;
  const accuracy =
    trainerStats.totalAnswers > 0
      ? Math.round((trainerStats.correctAnswers / trainerStats.totalAnswers) * 100)
      : null;
  const avgSec =
    trainerStats.avgTimeMs > 0 ? (trainerStats.avgTimeMs / 1000).toFixed(1) : null;

  function stepStatus(id: string) {
    if (completedSteps.includes(id)) return "completed";
    const idx = STEPS.findIndex((s) => s.id === id);
    const prevDone = idx === 0 || completedSteps.includes(STEPS[idx - 1].id);
    return prevDone ? "in-progress" : "not-started";
  }

  function caseStatus(id: string): "learned" | "in-progress" | "not-started" {
    if (learnedCases.includes(id)) return "learned";
    return "not-started";
  }

  const statusColors: Record<string, string> = {
    completed: "#16A34A",
    "in-progress": "#2563EB",
    "not-started": "#CBD5E1",
  };

  const statusBg: Record<string, string> = {
    completed: "#F0FDF4",
    "in-progress": "#EFF6FF",
    "not-started": "#F8FAFC",
  };

  const statusLabels: Record<string, string> = {
    completed: "Completed",
    "in-progress": "In Progress",
    "not-started": "Not Started",
  };

  const caseColors: Record<string, string> = {
    learned: "#16A34A",
    "in-progress": "#EAB308",
    "not-started": "#CBD5E1",
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Progress</h1>
        <p className="text-[#64748B] mt-1">Track your learning journey.</p>
      </div>

      {/* Learning Progress */}
      <section className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[#1E293B]">Learning Progress</h2>
        <div>
          <div className="flex justify-between text-sm text-[#64748B] mb-1.5">
            <span>{completedCount} of 5 steps completed</span>
            <span>{Math.round((completedCount / 5) * 100)}%</span>
          </div>
          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(completedCount / 5) * 100}%`,
                backgroundColor: "#2563EB",
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {STEPS.map((step, i) => {
            const status = stepStatus(step.id);
            return (
              <button
                key={step.id}
                onClick={() => router.push(step.route)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-colors hover:opacity-80"
                style={{
                  backgroundColor: statusBg[status],
                  borderColor: statusColors[status] + "40",
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: statusColors[status], color: "#fff" }}
                >
                  {status === "completed" ? "✓" : i + 1}
                </span>
                <span className="flex-1 font-medium text-[#1E293B] text-sm">{step.title}</span>
                <span
                  className="text-xs font-medium"
                  style={{ color: statusColors[status] }}
                >
                  {statusLabels[status]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Cases Mastered */}
      <section className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1E293B]">Cases Mastered</h2>
          <span className="text-sm text-[#64748B]">
            {learnedCases.length} / 16
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-2">OLL — 10 cases</p>
          <div className="grid grid-cols-5 gap-2">
            {OLL_CASES.map((c) => {
              const s = caseStatus(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => router.push("/learn/oll")}
                  className="rounded-lg border p-2 text-center transition-colors hover:opacity-80"
                  style={{
                    borderColor: caseColors[s] + "60",
                    backgroundColor: s === "learned" ? "#F0FDF4" : "#F8FAFC",
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: caseColors[s] }}
                  />
                  <p className="text-xs font-medium text-[#1E293B] leading-tight">{c.title}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-2">PLL — 6 cases</p>
          <div className="grid grid-cols-6 gap-2">
            {PLL_CASES.map((c) => {
              const s = caseStatus(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => router.push("/learn/pll")}
                  className="rounded-lg border p-2 text-center transition-colors hover:opacity-80"
                  style={{
                    borderColor: caseColors[s] + "60",
                    backgroundColor: s === "learned" ? "#F0FDF4" : "#F8FAFC",
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full mx-auto mb-1"
                    style={{ backgroundColor: caseColors[s] }}
                  />
                  <p className="text-xs font-medium text-[#1E293B] leading-tight">{c.title}</p>
                </button>
              );
            })}
          </div>
        </div>

        {learnedCases.length === 0 && (
          <p className="text-sm text-[#94A3B8] text-center py-2">
            Complete OLL and PLL tutorials to track mastered cases here.
          </p>
        )}
      </section>

      {/* Trainer Stats */}
      <section className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[#1E293B]">Trainer Stats</h2>
        {trainerStats.totalSessions === 0 ? (
          <p className="text-sm text-[#94A3B8]">
            No trainer sessions yet. Head to the{" "}
            <button
              onClick={() => router.push("/trainer")}
              className="text-[#2563EB] underline underline-offset-2"
            >
              Trainer
            </button>{" "}
            to get started.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F8FAFC] rounded-lg p-3 text-center border border-[#E2E8F0]">
                <p className="text-2xl font-bold text-[#1E293B]">{trainerStats.totalSessions}</p>
                <p className="text-xs text-[#64748B] mt-0.5">Sessions</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-3 text-center border border-[#E2E8F0]">
                <p className="text-2xl font-bold text-[#1E293B]">
                  {accuracy !== null ? `${accuracy}%` : "—"}
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">Accuracy</p>
              </div>
              <div className="bg-[#F8FAFC] rounded-lg p-3 text-center border border-[#E2E8F0]">
                <p className="text-2xl font-bold text-[#1E293B]">
                  {avgSec !== null ? `${avgSec}s` : "—"}
                </p>
                <p className="text-xs text-[#64748B] mt-0.5">Avg Time</p>
              </div>
            </div>
            {sessionHistory.length >= 5 && (
              <div>
                <p className="text-xs text-[#94A3B8] mb-2">Accuracy over last {sessionHistory.length} sessions</p>
                <AccuracyChart sessions={sessionHistory} />
              </div>
            )}
          </>
        )}
      </section>

      {/* Streak */}
      <section className="bg-white rounded-xl border border-[#E2E8F0] p-5 flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-[#1E293B]">Streak</h2>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-[#FFF7ED] border border-[#FED7AA] rounded-lg px-4 py-3 flex-1">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-2xl font-bold text-[#EA580C]">{streakCount}</p>
              <p className="text-xs text-[#9A3412]">Current streak</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-4 py-3 flex-1">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-2xl font-bold text-[#1E293B]">{bestStreak}</p>
              <p className="text-xs text-[#64748B]">Best streak</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs text-[#94A3B8] mb-2">Last 30 days</p>
          <CalendarGrid activityDates={activityDates} />
          {activityDates.length === 0 && (
            <p className="text-sm text-[#94A3B8] mt-2">
              Complete a tutorial step or trainer session to start your streak.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
