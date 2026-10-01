"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CaseRecognition } from "@/components/tutorial/CaseRecognition";
import { CaseThumbnail } from "@/components/cube/CaseThumbnail";
import { BEGINNER_STEPS, cross, corners, secondLayer, twoLookOll, twoLookPll } from "@/data/beginner";
import type { TutorialStep } from "@/lib/tutorialTypes";
import { tint } from "@/lib/theme";

type CaseType = "oll" | "pll" | "beginner";

type CaseEntry = {
  id: string;
  name: string;
  alias?: string;
  algorithm: string;
  type: CaseType;
  badge: string;
  href: string;
  initialState: string;
  visibleCubies?: string[];
};

type Filter = "all" | CaseType;

type Group = {
  id: string;
  filter: CaseType;
  label: string;
  route: string;
  entries: CaseEntry[];
};

function buildGroup(step: TutorialStep, type: CaseType, label: string, badge: string): Group {
  const route = BEGINNER_STEPS.find((s) => s.id === step.id)!.route;
  return {
    id: step.id,
    filter: type,
    label,
    route,
    entries: step.substeps.map((sub, i) => ({
      id: sub.id,
      name: sub.title,
      alias: sub.algorithmName,
      algorithm: sub.algorithm ?? sub.solutionMoves ?? "",
      type,
      badge,
      href: type === "beginner" ? `${route}?step=${i + 1}` : `${route}?case=${sub.id}`,
      initialState: sub.initialState,
      visibleCubies: sub.visibleCubies,
    })),
  };
}

const GROUPS: Group[] = [
  buildGroup(twoLookOll, "oll", "OLL", "OLL"),
  buildGroup(twoLookPll, "pll", "PLL", "PLL"),
  buildGroup(cross, "beginner", "White Cross", "Cross"),
  buildGroup(corners, "beginner", "White Corners", "Corners"),
  buildGroup(secondLayer, "beginner", "Second Layer", "2nd Layer"),
];

const countOf = (type: CaseType) =>
  GROUPS.filter((g) => g.filter === type).reduce((n, g) => n + g.entries.length, 0);

const FILTER_TABS: { id: Filter; label: string; color: string }[] = [
  { id: "all",      label: "All Cases", color: "var(--color-primary)" },
  { id: "oll",      label: "OLL",       color: "var(--color-step-oll)" },
  { id: "pll",      label: "PLL",       color: "var(--color-step-pll)" },
  { id: "beginner", label: "Beginner",  color: "var(--color-primary)" },
];

const TYPE_COLORS = {
  oll:      { color: "var(--color-step-oll)", bg: "color-mix(in srgb, var(--color-step-oll) 7%, transparent)",    border: "color-mix(in srgb, var(--color-step-oll) 22%, transparent)"    },
  pll:      { color: "var(--color-step-pll)", bg: "color-mix(in srgb, var(--color-step-pll) 7%, transparent)",  border: "color-mix(in srgb, var(--color-step-pll) 22%, transparent)"  },
  beginner: { color: "var(--color-primary)", bg: "color-mix(in srgb, var(--color-primary) 7%, transparent)",   border: "color-mix(in srgb, var(--color-primary) 22%, transparent)"   },
};

function CaseCard({ entry }: { entry: CaseEntry }) {
  const theme = TYPE_COLORS[entry.type];

  return (
    <Link href={entry.href} className="block">
      <div
        className="ltc-hover-lift-lg group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
        style={{
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
          boxShadow: "0 1px 3px var(--color-shadow-1)",
          ["--ltc-hover-border" as string]: theme.border,
        }}
      >
        {/* Diagram area */}
        <div
          className="flex items-center justify-center py-5"
          style={{ background: "var(--color-surface)" }}
        >
          {entry.type === "beginner" ? (
            <CaseThumbnail
              initialState={entry.initialState}
              visibleCubies={entry.visibleCubies}
              title={entry.name}
              size={120}
            />
          ) : (
            <CaseRecognition substepId={entry.id} type={entry.type} size={120} />
          )}
        </div>

        {/* Info area */}
        <div className="flex flex-col gap-2 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className="text-sm font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ color: theme.color, background: theme.bg, border: `1px solid ${theme.border}` }}
            >
              {entry.badge}
            </span>
            <span
              className="min-w-0 text-sm font-semibold leading-tight"
              style={{ color: "var(--color-text)" }}
            >
              {entry.name}
            </span>
          </div>

          <code
            className="font-mono block text-sm break-all leading-relaxed rounded-lg px-2.5 py-1.5"
            style={{
              color: "var(--color-primary)",
              background: "var(--color-primary-light)",
              border: "1px solid var(--color-primary-light-border)",
            }}
          >
            {entry.algorithm}
          </code>
        </div>
      </div>
    </Link>
  );
}

function matchesSearch(entry: CaseEntry, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    entry.name.toLowerCase().includes(lower) ||
    (entry.alias?.toLowerCase().includes(lower) ?? false) ||
    entry.algorithm.toLowerCase().includes(lower)
  );
}

export default function ReferencePage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const sections = useMemo(
    () =>
      GROUPS.filter((g) => filter === "all" || g.filter === filter)
        .map((g) => ({ group: g, entries: g.entries.filter((e) => matchesSearch(e, search)) }))
        .filter((s) => s.entries.length > 0),
    [filter, search],
  );

  return (
    <div className="ltc-page flex flex-col gap-8">
      {/* Header */}
      <div>
        <p
          className="text-sm font-semibold tracking-widest uppercase mb-1"
          style={{ color: "var(--color-primary)" }}
        >
          Cheat Sheet
        </p>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          Algorithm Reference
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>
          {countOf("oll")} OLL cases · {countOf("pll")} PLL cases · {countOf("beginner")} beginner cases — click any card to open the interactive tutorial
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter pills */}
        <div
          className="flex gap-1 rounded-xl p-1"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          {FILTER_TABS.map((t) => {
            const isActive = filter === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setFilter(t.id)}
                className="rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-150"
                style={{
                  background: isActive ? "var(--color-surface-elevated)" : "transparent",
                  color: isActive ? t.color : "var(--color-muted)",
                  border: isActive ? `1px solid ${tint(t.color, 13)}` : "1px solid transparent",
                  boxShadow: isActive ? "0 1px 4px var(--color-shadow-2)" : "none",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--color-muted)" }}
            width="14" height="14" viewBox="0 0 16 16" fill="none"
            stroke="currentColor" strokeWidth="1.5"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3 3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            aria-label="Search algorithms"
            placeholder="Search by name or notation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl pl-8 pr-3 py-2 text-sm transition-all duration-200"
            style={{
              background: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              outline: "none",
              fontFamily: "inherit",
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "var(--color-primary)";
              (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--color-primary) 12%, transparent)";
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "var(--color-border)";
              (e.target as HTMLInputElement).style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-12">
        {sections.map(({ group, entries }) => {
          const theme = TYPE_COLORS[group.filter];
          return (
            <div key={group.id} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-bold px-3 py-1 rounded-full"
                  style={{
                    color: theme.color,
                    background: theme.bg,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {group.label}
                </span>
                <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {entries.length} case{entries.length !== 1 ? "s" : ""}
                </span>
                <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
                <Link
                  href={group.route}
                  className="ltc-hover-primary-color inline-flex min-h-11 min-w-11 items-center justify-end text-sm font-medium transition-colors duration-150"
                  style={{ color: "var(--color-primary)" }}
                >
                  Open tutorial →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {entries.map((c) => (
                  <CaseCard key={c.id} entry={c} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {sections.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: "var(--color-primary-light)", border: "1px solid var(--color-primary-light-border)" }}
            >
              🔍
            </div>
            <p style={{ color: "var(--color-muted)" }}>No cases match &ldquo;{search}&rdquo;</p>
            <button
              onClick={() => setSearch("")}
              className="ltc-hover-primary-color text-sm font-medium transition-colors duration-150"
              style={{ color: "var(--color-primary)" }}
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
