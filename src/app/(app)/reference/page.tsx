"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CaseRecognition } from "@/components/tutorial/CaseRecognition";

type CaseEntry = {
  id: string;
  name: string;
  algorithm: string;
  type: "oll" | "pll" | "beginner";
  tutorialHref?: string;
};

const OLL_CASES: CaseEntry[] = [
  { id: "oll-dot",      name: "Dot",           algorithm: "F R U R' U' F' f R U R' U' f'",     type: "oll", tutorialHref: "/learn/oll?case=oll-dot" },
  { id: "oll-l-shape",  name: "Small L",        algorithm: "f R U R' U' f'",                     type: "oll", tutorialHref: "/learn/oll?case=oll-l-shape" },
  { id: "oll-line",     name: "Line",           algorithm: "F R U R' U' F'",                     type: "oll", tutorialHref: "/learn/oll?case=oll-line" },
  { id: "oll-sune",     name: "Sune",           algorithm: "R U R' U R U2 R'",                  type: "oll", tutorialHref: "/learn/oll?case=oll-sune" },
  { id: "oll-antisune", name: "Anti-Sune",      algorithm: "R U2 R' U' R U' R'",                type: "oll", tutorialHref: "/learn/oll?case=oll-antisune" },
  { id: "oll-h",        name: "H Pattern",      algorithm: "R U R' U R U' R' U R U2 R'",        type: "oll", tutorialHref: "/learn/oll?case=oll-h" },
  { id: "oll-pi",       name: "Pi (Bowtie)",    algorithm: "R U2 R2 U' R2 U' R2 U2 R",          type: "oll", tutorialHref: "/learn/oll?case=oll-pi" },
  { id: "oll-u",        name: "U (Headlights)", algorithm: "R2 D' R U2 R' D R U2 R",            type: "oll", tutorialHref: "/learn/oll?case=oll-u" },
  { id: "oll-t",        name: "T Pattern",      algorithm: "r U R' U' r' F R F'",               type: "oll", tutorialHref: "/learn/oll?case=oll-t" },
  { id: "oll-l",        name: "L Pattern",      algorithm: "F R U R' U' F'",                     type: "oll", tutorialHref: "/learn/oll?case=oll-l" },
];

const PLL_CASES: CaseEntry[] = [
  { id: "pll-adj",  name: "Adjacent Swap", algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",       type: "pll", tutorialHref: "/learn/pll?case=pll-adj" },
  { id: "pll-diag", name: "Diagonal Swap", algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'", type: "pll", tutorialHref: "/learn/pll?case=pll-diag" },
  { id: "pll-ua",   name: "Ua Perm",       algorithm: "R U' R U R U R U' R' U' R2",                 type: "pll", tutorialHref: "/learn/pll?case=pll-ua" },
  { id: "pll-ub",   name: "Ub Perm",       algorithm: "R2 U R U R' U' R' U' R' U R'",              type: "pll", tutorialHref: "/learn/pll?case=pll-ub" },
  { id: "pll-h",    name: "H Perm",        algorithm: "M2 U M2 U2 M2 U M2",                         type: "pll", tutorialHref: "/learn/pll?case=pll-h" },
  { id: "pll-z",    name: "Z Perm",        algorithm: "M2 U M2 U M' U2 M2 U2 M'",                  type: "pll", tutorialHref: "/learn/pll?case=pll-z" },
];

const ALL_CASES = [...OLL_CASES, ...PLL_CASES];

type Filter = "all" | "oll" | "pll";

const FILTER_TABS: { id: Filter; label: string; color: string }[] = [
  { id: "all", label: "All Cases", color: "#2563EB" },
  { id: "oll", label: "OLL",       color: "#B45309" },
  { id: "pll", label: "PLL",       color: "#7C3AED" },
];

const TYPE_COLORS = {
  oll:      { color: "#B45309", bg: "rgba(180,83,9,0.07)",    border: "rgba(180,83,9,0.22)"    },
  pll:      { color: "#7C3AED", bg: "rgba(124,58,237,0.07)",  border: "rgba(124,58,237,0.22)"  },
  beginner: { color: "#2563EB", bg: "rgba(37,99,235,0.07)",   border: "rgba(37,99,235,0.22)"   },
};

function CaseCard({ entry }: { entry: CaseEntry }) {
  const hasLinkable = Boolean(entry.tutorialHref);
  const theme = TYPE_COLORS[entry.type as keyof typeof TYPE_COLORS] ?? TYPE_COLORS.oll;

  const inner = (
    <div
      className="ltc-hover-lift-lg group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
      style={{
        background: "oklch(100% 0 0)",
        border: "1px solid oklch(89% 0.01 250)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        ["--ltc-hover-border" as string]: theme.border,
      }}
    >
      {/* Diagram area */}
      <div
        className="flex items-center justify-center py-5"
        style={{ background: "oklch(97.5% 0.005 250)" }}
      >
        <CaseRecognition substepId={entry.id} type={entry.type as "oll" | "pll"} size={120} />
      </div>

      {/* Info area */}
      <div className="flex flex-col gap-2 px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ color: theme.color, background: theme.bg, border: `1px solid ${theme.border}` }}
          >
            {entry.type.toUpperCase()}
          </span>
          <span
            className="text-sm font-semibold truncate"
            style={{ color: "oklch(18% 0.01 250)" }}
          >
            {entry.name}
          </span>
        </div>

        <code
          className="font-mono block text-xs break-all leading-relaxed rounded-lg px-2.5 py-1.5"
          style={{
            color: "#2563EB",
            background: "oklch(94% 0.04 255)",
            border: "1px solid oklch(87% 0.06 255)",
          }}
        >
          {entry.algorithm}
        </code>
      </div>
    </div>
  );

  if (hasLinkable) {
    return <Link href={entry.tutorialHref!} className="block">{inner}</Link>;
  }
  return inner;
}

function matchesSearch(entry: CaseEntry, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    entry.name.toLowerCase().includes(lower) ||
    entry.algorithm.toLowerCase().includes(lower)
  );
}

export default function ReferencePage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const filteredCases = useMemo(() => {
    const base = filter === "all" ? ALL_CASES : ALL_CASES.filter((c) => c.type === filter);
    return base.filter((c) => matchesSearch(c, search));
  }, [filter, search]);

  const ollCases = filteredCases.filter((c) => c.type === "oll");
  const pllCases = filteredCases.filter((c) => c.type === "pll");

  const showSection = (type: "oll" | "pll") =>
    filter === "all" || filter === type;

  return (
    <div className="ltc-page flex flex-col gap-8">
      {/* Header */}
      <div>
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "#2563EB" }}
        >
          Cheat Sheet
        </p>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "oklch(18% 0.01 250)" }}
        >
          Algorithm Reference
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(50% 0.012 250)" }}>
          10 OLL cases · 6 PLL cases — click any card to open the interactive tutorial
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter pills */}
        <div
          className="flex gap-1 rounded-xl p-1"
          style={{
            background: "oklch(97.5% 0.005 250)",
            border: "1px solid oklch(89% 0.01 250)",
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
                  background: isActive ? "oklch(100% 0 0)" : "transparent",
                  color: isActive ? t.color : "oklch(55% 0.01 250)",
                  border: isActive ? `1px solid ${t.color}22` : "1px solid transparent",
                  boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
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
            style={{ color: "oklch(62% 0.01 250)" }}
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
              background: "oklch(100% 0 0)",
              border: "1px solid oklch(89% 0.01 250)",
              color: "oklch(18% 0.01 250)",
              outline: "none",
              fontFamily: "inherit",
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "#2563EB";
              (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)";
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = "oklch(89% 0.01 250)";
              (e.target as HTMLInputElement).style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-12">
        {/* OLL */}
        {showSection("oll") && ollCases.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-bold px-3 py-1 rounded-full"
                style={{
                  color: "#B45309",
                  background: "rgba(180,83,9,0.07)",
                  border: "1px solid rgba(180,83,9,0.2)",
                }}
              >
                OLL
              </span>
              <span className="text-xs" style={{ color: "oklch(60% 0.01 250)" }}>
                {ollCases.length} case{ollCases.length !== 1 ? "s" : ""}
              </span>
              <div className="flex-1 h-px" style={{ background: "oklch(89% 0.01 250)" }} />
              <Link
                href="/learn/oll"
                className="ltc-hover-primary-color text-xs font-medium transition-colors duration-150"
                style={{ color: "#2563EB" }}
              >
                Open tutorial →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {ollCases.map((c) => (
                <CaseCard key={c.id} entry={c} />
              ))}
            </div>
          </div>
        )}

        {/* PLL */}
        {showSection("pll") && pllCases.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-bold px-3 py-1 rounded-full"
                style={{
                  color: "#7C3AED",
                  background: "rgba(124,58,237,0.07)",
                  border: "1px solid rgba(124,58,237,0.2)",
                }}
              >
                PLL
              </span>
              <span className="text-xs" style={{ color: "oklch(60% 0.01 250)" }}>
                {pllCases.length} case{pllCases.length !== 1 ? "s" : ""}
              </span>
              <div className="flex-1 h-px" style={{ background: "oklch(89% 0.01 250)" }} />
              <Link
                href="/learn/pll"
                className="ltc-hover-primary-color text-xs font-medium transition-colors duration-150"
                style={{ color: "#2563EB" }}
              >
                Open tutorial →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {pllCases.map((c) => (
                <CaseCard key={c.id} entry={c} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {filteredCases.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: "oklch(94% 0.04 255)", border: "1px solid oklch(87% 0.06 255)" }}
            >
              🔍
            </div>
            <p style={{ color: "oklch(55% 0.01 250)" }}>No cases match &ldquo;{search}&rdquo;</p>
            <button
              onClick={() => setSearch("")}
              className="ltc-hover-primary-color text-sm font-medium transition-colors duration-150"
              style={{ color: "#2563EB" }}
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
