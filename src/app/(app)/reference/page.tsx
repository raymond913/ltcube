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
  { id: "oll-dot",      name: "Dot",           algorithm: "F R U R' U' F' f R U R' U' f'",      type: "oll", tutorialHref: "/learn/oll?case=oll-dot" },
  { id: "oll-l-shape",  name: "Small L",        algorithm: "f R U R' U' f'",                      type: "oll", tutorialHref: "/learn/oll?case=oll-l-shape" },
  { id: "oll-line",     name: "Line",           algorithm: "F R U R' U' F'",                      type: "oll", tutorialHref: "/learn/oll?case=oll-line" },
  { id: "oll-sune",     name: "Sune",           algorithm: "R U R' U R U2 R'",                   type: "oll", tutorialHref: "/learn/oll?case=oll-sune" },
  { id: "oll-antisune", name: "Anti-Sune",      algorithm: "R U2 R' U' R U' R'",                 type: "oll", tutorialHref: "/learn/oll?case=oll-antisune" },
  { id: "oll-h",        name: "H Pattern",      algorithm: "R U R' U R U' R' U R U2 R'",         type: "oll", tutorialHref: "/learn/oll?case=oll-h" },
  { id: "oll-pi",       name: "Pi (Bowtie)",    algorithm: "R U2 R2 U' R2 U' R2 U2 R",           type: "oll", tutorialHref: "/learn/oll?case=oll-pi" },
  { id: "oll-u",        name: "U (Headlights)", algorithm: "R2 D' R U2 R' D R U2 R",             type: "oll", tutorialHref: "/learn/oll?case=oll-u" },
  { id: "oll-t",        name: "T Pattern",      algorithm: "r U R' U' r' F R F'",                type: "oll", tutorialHref: "/learn/oll?case=oll-t" },
  { id: "oll-l",        name: "L Pattern",      algorithm: "F R U R' U' F'",                      type: "oll", tutorialHref: "/learn/oll?case=oll-l" },
];

const PLL_CASES: CaseEntry[] = [
  { id: "pll-adj",  name: "Adjacent Swap", algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",        type: "pll", tutorialHref: "/learn/pll?case=pll-adj" },
  { id: "pll-diag", name: "Diagonal Swap", algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",  type: "pll", tutorialHref: "/learn/pll?case=pll-diag" },
  { id: "pll-ua",   name: "Ua Perm",       algorithm: "R U' R U R U R U' R' U' R2",                  type: "pll", tutorialHref: "/learn/pll?case=pll-ua" },
  { id: "pll-ub",   name: "Ub Perm",       algorithm: "R2 U R U R' U' R' U' R' U R'",               type: "pll", tutorialHref: "/learn/pll?case=pll-ub" },
  { id: "pll-h",    name: "H Perm",        algorithm: "M2 U M2 U2 M2 U M2",                          type: "pll", tutorialHref: "/learn/pll?case=pll-h" },
  { id: "pll-z",    name: "Z Perm",        algorithm: "M2 U M2 U M' U2 M2 U2 M'",                   type: "pll", tutorialHref: "/learn/pll?case=pll-z" },
];

const ALL_CASES = [...OLL_CASES, ...PLL_CASES];

type Filter = "all" | "oll" | "pll";

const FILTER_TABS: { id: Filter; label: string; color: string; bg: string }[] = [
  { id: "all", label: "All",  color: "#0F172A", bg: "#0F172A" },
  { id: "oll", label: "OLL",  color: "#CA8A04", bg: "#CA8A04" },
  { id: "pll", label: "PLL",  color: "#9333EA", bg: "#9333EA" },
];

function CaseCard({ entry }: { entry: CaseEntry }) {
  const hasLinkable = Boolean(entry.tutorialHref);
  const accentColor = entry.type === "oll" ? "#CA8A04" : "#9333EA";

  const inner = (
    <div
      className="group flex flex-col rounded-2xl border bg-white overflow-hidden transition-all duration-200 hover:-translate-y-1 cursor-pointer"
      style={{
        borderColor: "#E2E8F0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
        el.style.borderColor = accentColor + "60";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)";
        el.style.borderColor = "#E2E8F0";
      }}
    >
      {/* Diagram area */}
      <div
        className="flex items-center justify-center py-5"
        style={{ backgroundColor: "#F8FAFC" }}
      >
        <CaseRecognition substepId={entry.id} type={entry.type as "oll" | "pll"} size={120} />
      </div>

      {/* Info area */}
      <div className="flex flex-col gap-2 px-4 py-3">
        {/* Tag + Name row */}
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ color: accentColor, backgroundColor: accentColor + "15" }}
          >
            {entry.type.toUpperCase()}
          </span>
          <span className="text-sm font-semibold text-[#0F172A] truncate">{entry.name}</span>
        </div>

        {/* Algorithm */}
        <code
          className="block font-mono text-[11px] text-[#475569] break-all leading-relaxed rounded-lg px-2.5 py-1.5"
          style={{ backgroundColor: "#F1F5F9", border: "1px solid #E2E8F0" }}
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
        <p className="text-xs font-semibold tracking-widest uppercase text-[#2563EB] mb-1">
          Cheat Sheet
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
          Algorithm Reference
        </h1>
        <p className="text-[#64748B] text-sm mt-1">
          10 OLL cases · 6 PLL cases — click any card to open the interactive tutorial
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_TABS.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className="rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all"
                style={{
                  backgroundColor: isActive ? tab.bg : "#F1F5F9",
                  color: isActive ? "#fff" : "#64748B",
                  border: `1px solid ${isActive ? tab.bg : "#E2E8F0"}`,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            width="14" height="14" viewBox="0 0 16 16" fill="none"
            stroke="currentColor" strokeWidth="1.5"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3 3" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search by name or notation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-8 pr-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
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
                style={{ color: "#CA8A04", backgroundColor: "#CA8A0415", border: "1px solid #CA8A0430" }}
              >
                OLL
              </span>
              <span className="text-xs text-[#94A3B8]">
                {ollCases.length} case{ollCases.length !== 1 ? "s" : ""}
              </span>
              <div className="flex-1 h-px bg-[#E2E8F0]" />
              <Link href="/learn/oll" className="text-xs text-[#2563EB] hover:underline underline-offset-2">
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
                style={{ color: "#9333EA", backgroundColor: "#9333EA15", border: "1px solid #9333EA30" }}
              >
                PLL
              </span>
              <span className="text-xs text-[#94A3B8]">
                {pllCases.length} case{pllCases.length !== 1 ? "s" : ""}
              </span>
              <div className="flex-1 h-px bg-[#E2E8F0]" />
              <Link href="/learn/pll" className="text-xs text-[#2563EB] hover:underline underline-offset-2">
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
            <p className="text-[#64748B]">No cases match &ldquo;{search}&rdquo;</p>
            <button
              onClick={() => setSearch("")}
              className="text-sm text-[#2563EB] hover:underline underline-offset-2"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
