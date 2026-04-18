"use client";

import { useRouter } from "next/navigation";
import { useProgressStore } from "@/stores/progressStore";

const STEPS = [
  { id: "white-cross",   title: "White Cross",    route: "/learn/white-cross",   color: "#2563EB",  bg: "rgba(37,99,235,0.07)"   },
  { id: "white-corners", title: "White Corners",  route: "/learn/white-corners", color: "#15803D",  bg: "rgba(21,128,61,0.07)"   },
  { id: "second-layer",  title: "Second Layer",   route: "/learn/second-layer",  color: "#C2410C",  bg: "rgba(194,65,12,0.07)"   },
  { id: "two-look-oll",  title: "2-Look OLL",     route: "/learn/oll",           color: "#B45309",  bg: "rgba(180,83,9,0.07)"    },
  { id: "two-look-pll",  title: "2-Look PLL",     route: "/learn/pll",           color: "#7C3AED",  bg: "rgba(124,58,237,0.07)"  },
];

const OLL_CASES = [
  { id: "oll-dot",      title: "Dot"       },
  { id: "oll-l-shape",  title: "L Shape"   },
  { id: "oll-line",     title: "Line"      },
  { id: "oll-sune",     title: "Sune"      },
  { id: "oll-antisune", title: "Anti-Sune" },
  { id: "oll-h",        title: "H"         },
  { id: "oll-pi",       title: "Pi"        },
  { id: "oll-u",        title: "U"         },
  { id: "oll-t",        title: "T"         },
  { id: "oll-l",        title: "L"         },
];

const PLL_CASES = [
  { id: "pll-adjacent", title: "Adjacent" },
  { id: "pll-diagonal", title: "Diagonal" },
  { id: "pll-ua",       title: "Ua"       },
  { id: "pll-ub",       title: "Ub"       },
  { id: "pll-h",        title: "H"        },
  { id: "pll-z",        title: "Z"        },
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
            <line x1={pad.l} y1={y} x2={pad.l + plotW} y2={y} stroke="var(--color-border)" strokeWidth="1" />
            <text x={pad.l - 4} y={y + 4} fontSize="8" fill="oklch(62% 0.01 250)" textAnchor="end">{v}%</text>
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
        return <circle key={i} cx={x} cy={y} r="3" fill="#2563EB" />;
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
          className="w-6 h-6 rounded-md transition-all duration-200"
          style={{
            background: active ? "#2563EB" : "var(--color-border-subtle)",
          }}
        />
      ))}
    </div>
  );
}

function StatCard({ value, label, sub, accentColor }: { value: React.ReactNode; label: string; sub?: string; accentColor?: string }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1"
      style={{
        background: "var(--color-surface-elevated)",
        border: `1px solid ${accentColor ? `${accentColor}20` : "var(--color-border)"}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <p
        className="font-display text-3xl font-bold"
        style={{ color: accentColor ?? "var(--color-text)" }}
      >
        {value}
      </p>
      <p className="text-xs font-medium" style={{ color: "oklch(55% 0.01 250)" }}>{label}</p>
      {sub && <p className="mt-auto pt-1 text-xs" style={{ color: "oklch(65% 0.008 250)" }}>{sub}</p>}
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
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "#2563EB" }}
        >
          Dashboard
        </p>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          Progress
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          Your learning journey at a glance.
        </p>
      </div>

      {/* Hero stat row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          value={<>{completedCount}<span className="text-lg font-medium" style={{ color: "oklch(62% 0.01 250)" }}>/5</span></>}
          label="Steps done"
          accentColor="#2563EB"
        />
        <StatCard
          value={accuracy !== null ? `${accuracy}%` : <span className="text-2xl" style={{ color: "oklch(82% 0.01 250)" }}>—</span>}
          label="Trainer accuracy"
          sub={trainerStats.totalAnswers > 0 ? `${trainerStats.totalAnswers} answers` : "No data yet"}
          accentColor={accuracy !== null ? "#15803D" : undefined}
        />
        <div
          className="rounded-2xl p-4 flex flex-col gap-1"
          style={{
            background: "var(--color-surface-elevated)",
            border: streakCount > 0 ? "1px solid rgba(234,88,12,0.2)" : "1px solid var(--color-border)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <p
            className="font-display text-3xl font-bold"
            style={{ color: streakCount > 0 ? "#C2410C" : "var(--color-text)" }}
          >
            {streakCount}
            <span
              className="text-lg font-medium"
              style={{ color: streakCount > 0 ? "#C2410C" : "oklch(62% 0.01 250)" }}
            >
              {" "}day{streakCount !== 1 ? "s" : ""}
            </span>
          </p>
          <p className="text-xs font-medium flex items-center gap-1" style={{ color: "oklch(55% 0.01 250)" }}>
            {streakCount > 0 && "🔥 "}Current streak
          </p>
          <p className="mt-auto pt-1 text-xs" style={{ color: "oklch(65% 0.008 250)" }}>
            Best: {bestStreak} days
          </p>
        </div>
      </div>

      {/* Learning Steps */}
      <section
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-base font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Learning Steps
          </h2>
          <span className="text-xs" style={{ color: "oklch(62% 0.01 250)" }}>
            {completedCount} / 5 completed
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "var(--color-border-subtle)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%`, backgroundColor: "#2563EB" }}
          />
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
                className="ltc-hover-shadow flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-[box-shadow,background] duration-150"
                style={{
                  background: isDone ? step.bg : isActive ? "var(--color-surface)" : "var(--color-background)",
                  border: `1px solid ${isDone ? `${step.color}25` : isActive ? `${step.color}18` : "var(--color-border)"}`,
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: isDone ? step.color : isActive ? `${step.color}15` : "var(--color-border-subtle)",
                    color: isDone ? "#fff" : isActive ? step.color : "oklch(62% 0.01 250)",
                  }}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span className="flex-1 font-medium text-sm" style={{ color: "var(--color-text)" }}>
                  {step.title}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: isDone ? step.color : isActive ? step.color : "oklch(75% 0.008 250)",
                  }}
                >
                  {isDone ? "Complete" : isActive ? "Up next" : "Locked"}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Cases Mastered */}
      <section
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: "var(--color-text)" }}>
            Cases Mastered
          </h2>
          <span className="text-xs font-semibold" style={{ color: "#2563EB" }}>
            {learnedCases.length} / 16
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "oklch(62% 0.01 250)" }}
            >
              OLL — 10 cases
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {OLL_CASES.map((c) => {
                const learned = caseStatus(c.id) === "learned";
                return (
                  <button
                    key={c.id}
                    onClick={() => router.push("/learn/oll")}
                    className="hover:opacity-75 rounded-lg border py-2.5 px-1.5 text-center transition-all duration-150 min-h-[40px]"
                    style={{
                      borderColor: learned ? "rgba(180,83,9,0.3)" : "var(--color-border)",
                      background: learned ? "rgba(180,83,9,0.07)" : "var(--color-surface)",
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mx-auto mb-1"
                      style={{ background: learned ? "#B45309" : "oklch(82% 0.01 250)" }}
                    />
                    <p
                      className="text-xs font-medium leading-tight"
                      style={{ color: learned ? "#B45309" : "oklch(62% 0.01 250)" }}
                    >
                      {c.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: "oklch(62% 0.01 250)" }}
            >
              PLL — 6 cases
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {PLL_CASES.map((c) => {
                const learned = caseStatus(c.id) === "learned";
                return (
                  <button
                    key={c.id}
                    onClick={() => router.push("/learn/pll")}
                    className="hover:opacity-75 rounded-lg border py-2.5 px-1.5 text-center transition-all duration-150 min-h-[40px]"
                    style={{
                      borderColor: learned ? "rgba(124,58,237,0.3)" : "var(--color-border)",
                      background: learned ? "rgba(124,58,237,0.07)" : "var(--color-surface)",
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mx-auto mb-1"
                      style={{ background: learned ? "#7C3AED" : "oklch(82% 0.01 250)" }}
                    />
                    <p
                      className="text-xs font-medium leading-tight"
                      style={{ color: learned ? "#7C3AED" : "oklch(62% 0.01 250)" }}
                    >
                      {c.title}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {learnedCases.length === 0 && (
          <p className="text-sm text-center py-1" style={{ color: "oklch(60% 0.01 250)" }}>
            Complete OLL and PLL tutorials to track cases here.
          </p>
        )}
      </section>

      {/* Trainer Stats */}
      <section
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <h2 className="text-base font-bold" style={{ color: "var(--color-text)" }}>
          Trainer Stats
        </h2>
        {trainerStats.totalSessions === 0 ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ background: "var(--color-primary-light)", border: "1px solid var(--color-primary-light-border)" }}
            >
              ⚡
            </div>
            <p className="text-sm" style={{ color: "oklch(55% 0.01 250)" }}>No sessions yet.</p>
            <button
              onClick={() => router.push("/trainer")}
              className="ltc-hover-primary-color text-sm font-semibold transition-colors duration-150"
              style={{ color: "#2563EB" }}
            >
              Start the Trainer →
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: trainerStats.totalSessions, label: "Sessions",  color: "#2563EB" },
                { value: accuracy !== null ? `${accuracy}%` : "—", label: "Accuracy", color: "#15803D" },
                { value: avgSec !== null ? `${avgSec}s` : "—",     label: "Avg Time",  color: "#7C3AED" },
              ].map(({ value, label, color }) => (
                <div
                  key={label}
                  className="rounded-xl border p-3 text-center"
                  style={{
                    background: `${color}07`,
                    borderColor: `${color}18`,
                  }}
                >
                  <p
                    className="font-display text-2xl font-bold"
                    style={{ color }}
                  >
                    {value}
                  </p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: "oklch(55% 0.01 250)" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
            {sessionHistory.length >= 5 && (
              <div>
                <p className="text-xs mb-2 font-medium" style={{ color: "oklch(60% 0.01 250)" }}>
                  Accuracy over last {sessionHistory.length} sessions
                </p>
                <AccuracyChart sessions={sessionHistory} />
              </div>
            )}
          </>
        )}
      </section>

      {/* Activity + Streak */}
      <section
        className="rounded-2xl p-5 flex flex-col gap-4"
        style={{
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: "var(--color-text)" }}>
            Activity
          </h2>
          <div className="flex gap-2">
            <div
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
              style={{
                background: "rgba(194,65,12,0.07)",
                border: "1px solid rgba(194,65,12,0.18)",
              }}
            >
              <span className="text-base">🔥</span>
              <div>
                <p className="text-sm font-bold leading-none" style={{ color: "#C2410C" }}>
                  {streakCount}
                </p>
                <p className="text-xs leading-none" style={{ color: "#C2410C" }}>streak</p>
              </div>
            </div>
            <div
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span className="text-base">🏆</span>
              <div>
                <p className="text-sm font-bold leading-none" style={{ color: "var(--color-text)" }}>
                  {bestStreak}
                </p>
                <p className="text-xs leading-none" style={{ color: "oklch(60% 0.01 250)" }}>best</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p
            className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color: "oklch(62% 0.01 250)" }}
          >
            Last 30 days
          </p>
          <CalendarGrid activityDates={activityDates} />
          {activityDates.length === 0 && (
            <p className="text-sm mt-3 text-center" style={{ color: "oklch(60% 0.01 250)" }}>
              Complete a step or trainer session to start your streak.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
