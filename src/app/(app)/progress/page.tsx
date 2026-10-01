"use client";

import { useRouter } from "next/navigation";
import { useProgressStore, getEffectiveStreak, localDateKey } from "@/stores/progressStore";
import { twoLookOll, twoLookPll } from "@/data/beginner";
import { tint } from "@/lib/theme";

const STEPS = [
  { id: "cross",          title: "White Cross",         route: "/learn/cross",        color: "var(--color-primary)",  bg: "color-mix(in srgb, var(--color-primary) 7%, transparent)"   },
  { id: "corners",        title: "First Layer Corners", route: "/learn/corners",      color: "var(--color-step-corners)",  bg: "color-mix(in srgb, var(--color-step-corners) 7%, transparent)"   },
  { id: "second-layer",   title: "Second Layer",        route: "/learn/second-layer", color: "var(--color-step-layer)",  bg: "color-mix(in srgb, var(--color-step-layer) 7%, transparent)"   },
  { id: "two-look-oll",   title: "2-Look OLL",          route: "/learn/oll",          color: "var(--color-step-oll)",  bg: "color-mix(in srgb, var(--color-step-oll) 7%, transparent)"    },
  { id: "two-look-pll",   title: "2-Look PLL",          route: "/learn/pll",          color: "var(--color-step-pll)",  bg: "color-mix(in srgb, var(--color-step-pll) 7%, transparent)"  },
];

const OLL_CASES = twoLookOll.substeps.map((s) => ({ id: s.id, title: s.algorithmName ?? s.title }));
const PLL_CASES = twoLookPll.substeps.map((s) => ({ id: s.id, title: s.algorithmName ?? s.title }));

function AccuracyChart({ sessions }: { sessions: { date: string; accuracy: number }[] }) {
  if (sessions.length < 2) return null;
  const W = 300;
  const H = 100;
  const pad = { l: 46, r: 8, t: 12, b: 12 };
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
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: H }}
      role="img"
      aria-label={`Accuracy over your last ${sessions.length} sessions: from ${sessions[0].accuracy}% to ${sessions[sessions.length - 1].accuracy}%`}
    >
      {[0, 50, 100].map((v) => {
        const y = pad.t + plotH - (v / 100) * plotH;
        return (
          <g key={v}>
            <line x1={pad.l} y1={y} x2={pad.l + plotW} y2={y} stroke="var(--color-border)" strokeWidth="1" />
            <text x={pad.l - 4} y={y + 4} fontSize="14" fill="var(--color-muted)" textAnchor="end">{v}%</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#areaGrad)" />
      <polyline points={polyline} fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinejoin="round" />
      {sessions.map((s, i) => {
        const x = pad.l + (i / (sessions.length - 1)) * plotW;
        const y = pad.t + plotH - (s.accuracy / 100) * plotH;
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--color-primary)" />;
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
    const str = localDateKey(d);
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
            background: active ? "var(--color-primary)" : "var(--color-border-subtle)",
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
        border: `1px solid ${accentColor ? tint(accentColor, 13) : "var(--color-border)"}`,
        boxShadow: "0 1px 4px var(--color-shadow-1)",
      }}
    >
      <p
        className="font-display text-3xl font-bold"
        style={{ color: accentColor ?? "var(--color-text)" }}
      >
        {value}
      </p>
      <p className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>{label}</p>
      {sub && <p className="mt-auto pt-1 text-sm" style={{ color: "var(--color-muted)" }}>{sub}</p>}
    </div>
  );
}

export default function ProgressPage() {
  const router = useRouter();
  const {
    completedSteps,
    learnedCases,
    trainerStats,
    streakCount: storedStreak,
    lastStreakDate,
    bestStreak,
    sessionHistory,
    activityDates,
  } = useProgressStore();
  const streakCount = getEffectiveStreak(storedStreak, lastStreakDate);

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
          className="text-sm font-semibold tracking-widest uppercase mb-1"
          style={{ color: "var(--color-primary)" }}
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
          value={<>{completedCount}<span className="text-lg font-medium" style={{ color: "var(--color-muted)" }}>/5</span></>}
          label="Steps done"
          accentColor="var(--color-primary)"
        />
        <StatCard
          value={accuracy !== null ? `${accuracy}%` : <span className="text-2xl" style={{ color: "var(--color-border-bright)" }}>—</span>}
          label="Trainer accuracy"
          sub={trainerStats.totalAnswers > 0 ? `${trainerStats.totalAnswers} answers` : "No data yet"}
          accentColor={accuracy !== null ? "var(--color-step-corners)" : undefined}
        />
        <div
          className="rounded-2xl p-4 flex flex-col gap-1"
          style={{
            background: "var(--color-surface-elevated)",
            border: streakCount > 0 ? "1px solid color-mix(in srgb, var(--color-step-layer) 20%, transparent)" : "1px solid var(--color-border)",
            boxShadow: "0 1px 4px var(--color-shadow-1)",
          }}
        >
          <p
            className="font-display text-3xl font-bold"
            style={{ color: streakCount > 0 ? "var(--color-step-layer)" : "var(--color-text)" }}
          >
            {streakCount}
            <span
              className="text-lg font-medium"
              style={{ color: streakCount > 0 ? "var(--color-step-layer)" : "var(--color-muted)" }}
            >
              {" "}day{streakCount !== 1 ? "s" : ""}
            </span>
          </p>
          <p className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--color-muted)" }}>
            {streakCount > 0 && "🔥 "}Current streak
          </p>
          <p className="mt-auto pt-1 text-sm" style={{ color: "var(--color-muted)" }}>
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
          boxShadow: "0 1px 4px var(--color-shadow-1)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2
            className="text-base font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Learning Steps
          </h2>
          <span className="text-sm" style={{ color: "var(--color-muted)" }}>
            {completedCount} / 5 completed
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "var(--color-border-subtle)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%`, backgroundColor: "var(--color-primary)" }}
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
                  border: `1px solid ${isDone ? tint(step.color, 15) : isActive ? tint(step.color, 9) : "var(--color-border)"}`,
                }}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: isDone ? step.color : isActive ? tint(step.color, 8) : "var(--color-border-subtle)",
                    color: isDone ? "var(--color-on-accent)" : isActive ? step.color : "var(--color-muted)",
                  }}
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span className="flex-1 font-medium text-sm" style={{ color: "var(--color-text)" }}>
                  {step.title}
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: isDone ? step.color : isActive ? step.color : "var(--color-muted)",
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
          boxShadow: "0 1px 4px var(--color-shadow-1)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: "var(--color-text)" }}>
            Cases Mastered
          </h2>
          <span className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>
            {learnedCases.length} / 16
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <p
              className="text-sm font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-muted)" }}
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
                    className="hover:opacity-75 rounded-lg border py-2.5 px-1.5 text-center transition-all duration-150 min-h-11"
                    style={{
                      borderColor: learned ? "color-mix(in srgb, var(--color-step-oll) 30%, transparent)" : "var(--color-border)",
                      background: learned ? "color-mix(in srgb, var(--color-step-oll) 7%, transparent)" : "var(--color-surface)",
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mx-auto mb-1"
                      style={{ background: learned ? "var(--color-step-oll)" : "var(--color-border-bright)" }}
                    />
                    <p
                      className="text-sm font-medium leading-tight"
                      style={{ color: learned ? "var(--color-step-oll)" : "var(--color-muted)" }}
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
              className="text-sm font-bold uppercase tracking-widest mb-2"
              style={{ color: "var(--color-muted)" }}
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
                    className="hover:opacity-75 rounded-lg border py-2.5 px-1.5 text-center transition-all duration-150 min-h-11"
                    style={{
                      borderColor: learned ? "color-mix(in srgb, var(--color-step-pll) 30%, transparent)" : "var(--color-border)",
                      background: learned ? "color-mix(in srgb, var(--color-step-pll) 7%, transparent)" : "var(--color-surface)",
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mx-auto mb-1"
                      style={{ background: learned ? "var(--color-step-pll)" : "var(--color-border-bright)" }}
                    />
                    <p
                      className="text-sm font-medium leading-tight"
                      style={{ color: learned ? "var(--color-step-pll)" : "var(--color-muted)" }}
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
          <p className="text-sm text-center py-1" style={{ color: "var(--color-muted)" }}>
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
          boxShadow: "0 1px 4px var(--color-shadow-1)",
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
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>No sessions yet.</p>
            <button
              onClick={() => router.push("/trainer")}
              className="ltc-hover-primary-color text-sm font-semibold transition-colors duration-150"
              style={{ color: "var(--color-primary)" }}
            >
              Start the Trainer →
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: trainerStats.totalSessions, label: "Sessions",  color: "var(--color-primary)" },
                { value: accuracy !== null ? `${accuracy}%` : "—", label: "Accuracy", color: "var(--color-step-corners)" },
                { value: avgSec !== null ? `${avgSec}s` : "—",     label: "Avg Time",  color: "var(--color-step-pll)" },
              ].map(({ value, label, color }) => (
                <div
                  key={label}
                  className="rounded-xl border p-3 text-center"
                  style={{
                    background: tint(color, 3),
                    borderColor: tint(color, 9),
                  }}
                >
                  <p
                    className="font-display text-2xl font-bold"
                    style={{ color }}
                  >
                    {value}
                  </p>
                  <p className="text-sm mt-0.5 font-medium" style={{ color: "var(--color-muted)" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
            {sessionHistory.length >= 5 && (
              <div>
                <p className="text-sm mb-2 font-medium" style={{ color: "var(--color-muted)" }}>
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
          boxShadow: "0 1px 4px var(--color-shadow-1)",
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
                background: "color-mix(in srgb, var(--color-step-layer) 7%, transparent)",
                border: "1px solid color-mix(in srgb, var(--color-step-layer) 18%, transparent)",
              }}
            >
              <span className="text-base">🔥</span>
              <div>
                <p className="text-sm font-bold leading-none" style={{ color: "var(--color-step-layer)" }}>
                  {streakCount}
                </p>
                <p className="text-sm leading-none" style={{ color: "var(--color-step-layer)" }}>streak</p>
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
                <p className="text-sm leading-none" style={{ color: "var(--color-muted)" }}>best</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p
            className="text-sm font-bold uppercase tracking-widest mb-2"
            style={{ color: "var(--color-muted)" }}
          >
            Last 30 days
          </p>
          <CalendarGrid activityDates={activityDates} />
          {activityDates.length === 0 && (
            <p className="text-sm mt-3 text-center" style={{ color: "var(--color-muted)" }}>
              Complete a step or trainer session to start your streak.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
