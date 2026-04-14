"use client";

import { useRouter } from "next/navigation";
import { useProgressStore } from "@/stores/progressStore";

const STEPS = [
  { id: "white-cross",   title: "White Cross",    route: "/learn/white-cross",   color: "#2563EB", bg: "#EFF6FF" },
  { id: "white-corners", title: "White Corners",  route: "/learn/white-corners", color: "#16A34A", bg: "#F0FDF4" },
  { id: "second-layer",  title: "Second Layer",   route: "/learn/second-layer",  color: "#EA580C", bg: "#FFF7ED" },
  { id: "two-look-oll",  title: "2-Look OLL",     route: "/learn/oll",           color: "#CA8A04", bg: "#FEFCE8" },
  { id: "two-look-pll",  title: "2-Look PLL",     route: "/learn/pll",           color: "#9333EA", bg: "#FDF4FF" },
];

const OLL_CASES = [
  { id: "oll-dot",       title: "Dot" },
  { id: "oll-l-shape",   title: "L Shape" },
  { id: "oll-line",      title: "Line" },
  { id: "oll-sune",      title: "Sune" },
  { id: "oll-antisune",  title: "Anti-Sune" },
  { id: "oll-h",         title: "H Pattern" },
  { id: "oll-pi",        title: "Pi" },
  { id: "oll-u",         title: "U Pattern" },
  { id: "oll-t",         title: "T Pattern" },
  { id: "oll-l",         title: "L Pattern" },
];

const PLL_CASES = [
  { id: "pll-adjacent",  title: "Adjacent" },
  { id: "pll-diagonal",  title: "Diagonal" },
  { id: "pll-ua",        title: "Ua Perm" },
  { id: "pll-ub",        title: "Ub Perm" },
  { id: "pll-h",         title: "H Perm" },
  { id: "pll-z",         title: "Z Perm" },
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
  const area = [`${pad.l},${pad.t + plotH}`, ...points, `${pad.l + plotW},${pad.t + plotH}`].join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
      {[0, 50, 100].map((v) => {
        const y = pad.t + plotH - (v / 100) * plotH;
        return (
          <g key={v}>
            <line x1={pad.l} y1={y} x2={pad.l + plotW} y2={y} stroke="#E2E8F0" strokeWidth="1" />
            <text x={pad.l - 4} y={y + 4} fontSize="8" fill="#94A3B8" textAnchor="end">{v}%</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#areaGrad)" />
      <polyline points={polyline} fill="none" stroke="#2563EB" strokeWidth="2" strokeLinejoin="round" />
      {sessions.map((s, i) => {
        const x = pad.l + (i / (sessions.length - 1)) * plotW;
        const y = pad.t + plotH - (s.accuracy / 100) * plotH;
        return <circle key={i} cx={x} cy={y} r="3" fill="#2563EB" stroke="white" strokeWidth="1.5" />;
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
    <div className="flex flex-wrap gap-1.5">
      {days.map(({ date, active }) => (
        <div
          key={date}
          title={date}
          className="w-6 h-6 rounded-md transition-colors"
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
  const accuracy = trainerStats.totalAnswers > 0
    ? Math.round((trainerStats.correctAnswers / trainerStats.totalAnswers) * 100)
    : null;
  const avgSec = trainerStats.avgTimeMs > 0
    ? (trainerStats.avgTimeMs / 1000).toFixed(1)
    : null;

  function stepStatus(id: string) {
    if (completedSteps.includes(id)) return "completed";
    const idx = STEPS.findIndex((s) => s.id === id);
    const prevDone = idx === 0 || completedSteps.includes(STEPS[idx - 1].id);
    return prevDone ? "in-progress" : "not-started";
  }

  function caseStatus(id: string): "learned" | "not-started" {
    return learnedCases.includes(id) ? "learned" : "not-started";
  }

  const progressPct = (completedCount / 5) * 100;

  return (
    <div className="ltc-page flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#2563EB] mb-1">Dashboard</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Progress</h1>
        <p className="text-[#64748B] text-sm mt-1">Your learning journey at a glance.</p>
      </div>

      {/* Hero stat row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col gap-1">
          <p className="text-3xl font-bold text-[#0F172A]">{completedCount}<span className="text-lg text-[#94A3B8] font-medium">/5</span></p>
          <p className="text-xs text-[#64748B] font-medium">Steps done</p>
          <div className="mt-auto pt-2 h-1 w-full rounded-full bg-[#E2E8F0] overflow-hidden">
            <div className="h-full rounded-full bg-[#2563EB] transition-all" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col gap-1">
          <p className="text-3xl font-bold text-[#0F172A]">
            {accuracy !== null ? `${accuracy}%` : <span className="text-2xl text-[#CBD5E1]">—</span>}
          </p>
          <p className="text-xs text-[#64748B] font-medium">Trainer accuracy</p>
          <p className="mt-auto pt-1 text-[11px] text-[#94A3B8]">
            {trainerStats.totalAnswers > 0 ? `${trainerStats.totalAnswers} answers` : "No data yet"}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col gap-1">
          <p className="text-3xl font-bold" style={{ color: streakCount > 0 ? "#EA580C" : "#0F172A" }}>
            {streakCount}<span className="text-lg text-[#94A3B8] font-medium"> day{streakCount !== 1 ? "s" : ""}</span>
          </p>
          <p className="text-xs text-[#64748B] font-medium">Current streak</p>
          <p className="mt-auto pt-1 text-[11px] text-[#94A3B8]">Best: {bestStreak} days</p>
        </div>
      </div>

      {/* Learning Progress */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F172A]">Learning Steps</h2>
          <span className="text-xs text-[#64748B]">{completedCount} / 5 completed</span>
        </div>
        <div className="flex flex-col gap-2">
          {STEPS.map((step, i) => {
            const status = stepStatus(step.id);
            const isDone = status === "completed";
            const isActive = status === "in-progress";
            return (
              <button
                key={step.id}
                onClick={() => router.push(step.route)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all hover:shadow-sm"
                style={{
                  backgroundColor: isDone ? step.bg : isActive ? "#FAFAFA" : "#F8FAFC",
                  borderColor: isDone ? step.color + "50" : isActive ? step.color + "30" : "#E2E8F0",
                  borderLeftColor: step.color,
                  borderLeftWidth: "3px",
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: isDone ? step.color : isActive ? step.color + "20" : "#E2E8F0", color: isDone ? "#fff" : isActive ? step.color : "#94A3B8" }}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span className="flex-1 font-medium text-[#0F172A] text-sm">{step.title}</span>
                <span className="text-xs font-semibold" style={{ color: isDone ? step.color : isActive ? step.color : "#CBD5E1" }}>
                  {isDone ? "Complete" : isActive ? "Up next" : "Locked"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Cases Mastered */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F172A]">Cases Mastered</h2>
          <span className="text-xs text-[#64748B]">
            {learnedCases.length} / 16
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-widest mb-2">OLL — 10 cases</p>
            <div className="grid grid-cols-5 gap-1.5">
              {OLL_CASES.map((c) => {
                const learned = caseStatus(c.id) === "learned";
                return (
                  <button
                    key={c.id}
                    onClick={() => router.push("/learn/oll")}
                    className="rounded-lg border p-2 text-center transition-all hover:opacity-80"
                    style={{
                      borderColor: learned ? "#16A34A50" : "#E2E8F0",
                      backgroundColor: learned ? "#F0FDF4" : "#F8FAFC",
                    }}
                  >
                    <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: learned ? "#16A34A" : "#CBD5E1" }} />
                    <p className="text-[10px] font-medium text-[#0F172A] leading-tight">{c.title}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-widest mb-2">PLL — 6 cases</p>
            <div className="grid grid-cols-6 gap-1.5">
              {PLL_CASES.map((c) => {
                const learned = caseStatus(c.id) === "learned";
                return (
                  <button
                    key={c.id}
                    onClick={() => router.push("/learn/pll")}
                    className="rounded-lg border p-2 text-center transition-all hover:opacity-80"
                    style={{
                      borderColor: learned ? "#9333EA50" : "#E2E8F0",
                      backgroundColor: learned ? "#FDF4FF" : "#F8FAFC",
                    }}
                  >
                    <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: learned ? "#9333EA" : "#CBD5E1" }} />
                    <p className="text-[10px] font-medium text-[#0F172A] leading-tight">{c.title}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {learnedCases.length === 0 && (
          <p className="text-sm text-[#94A3B8] text-center py-1">
            Complete OLL and PLL tutorials to track cases here.
          </p>
        )}
      </section>

      {/* Trainer Stats */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col gap-4">
        <h2 className="text-base font-bold text-[#0F172A]">Trainer Stats</h2>
        {trainerStats.totalSessions === 0 ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center text-lg">⚡</div>
            <p className="text-sm text-[#64748B]">No sessions yet.</p>
            <button
              onClick={() => router.push("/trainer")}
              className="text-sm font-semibold text-[#2563EB] hover:underline underline-offset-2"
            >
              Start the Trainer →
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: trainerStats.totalSessions, label: "Sessions" },
                { value: accuracy !== null ? `${accuracy}%` : "—", label: "Accuracy" },
                { value: avgSec !== null ? `${avgSec}s` : "—", label: "Avg Time" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-3 text-center">
                  <p className="text-2xl font-bold text-[#0F172A]">{value}</p>
                  <p className="text-xs text-[#64748B] mt-0.5 font-medium">{label}</p>
                </div>
              ))}
            </div>
            {sessionHistory.length >= 5 && (
              <div>
                <p className="text-xs text-[#94A3B8] mb-2 font-medium">Accuracy over last {sessionHistory.length} sessions</p>
                <AccuracyChart sessions={sessionHistory} />
              </div>
            )}
          </>
        )}
      </section>

      {/* Streak + Calendar */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F172A]">Activity</h2>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 bg-[#FFF7ED] border border-[#FED7AA] rounded-lg px-3 py-1.5">
              <span className="text-base">🔥</span>
              <div>
                <p className="text-sm font-bold text-[#EA580C] leading-none">{streakCount}</p>
                <p className="text-[10px] text-[#9A3412] leading-none">streak</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5">
              <span className="text-base">🏆</span>
              <div>
                <p className="text-sm font-bold text-[#0F172A] leading-none">{bestStreak}</p>
                <p className="text-[10px] text-[#64748B] leading-none">best</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] text-[#94A3B8] mb-2 font-medium uppercase tracking-widest">Last 30 days</p>
          <CalendarGrid activityDates={activityDates} />
          {activityDates.length === 0 && (
            <p className="text-sm text-[#94A3B8] mt-3 text-center">
              Complete a step or trainer session to start your streak.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
