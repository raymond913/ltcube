"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";

const AlgorithmPlayer = dynamic(
  () => import("@/components/cube/AlgorithmPlayer").then((m) => m.AlgorithmPlayer),
  { ssr: false }
);

type CaseEntry = {
  id: string;
  name: string;
  algorithm: string;
  initialStateAlg?: string;
};

type Section = {
  id: string;
  label: string;
  color: string;
  subsections: { heading: string; cases: CaseEntry[] }[];
};

const OLL_SECTION: Section = {
  id: "oll",
  label: "OLL",
  color: "#CA8A04",
  subsections: [
    {
      heading: "Edge Orientation",
      cases: [
        { id: "oll-dot",      name: "Dot",         algorithm: "F R U R' U' F' f R U R' U' f'",      initialStateAlg: "f U R U' R' f' F U R U' R' F'" },
        { id: "oll-l-shape",  name: "Small L",      algorithm: "f R U R' U' f'",                      initialStateAlg: "f U R U' R' f'" },
        { id: "oll-line",     name: "Line",          algorithm: "F R U R' U' F'",                      initialStateAlg: "F U R U' R' F'" },
      ],
    },
    {
      heading: "Corner Orientation",
      cases: [
        { id: "oll-sune",     name: "Sune",          algorithm: "R U R' U R U2 R'",                   initialStateAlg: "R U2' R' U' R U' R'" },
        { id: "oll-antisune", name: "Anti-Sune",      algorithm: "R U2 R' U' R U' R'",                 initialStateAlg: "R U R' U R U2' R'" },
        { id: "oll-h",        name: "H Pattern",      algorithm: "R U R' U R U' R' U R U2 R'",         initialStateAlg: "R U2' R' U' R U R' U' R U' R'" },
        { id: "oll-pi",       name: "Pi (Bowtie)",    algorithm: "R U2 R2 U' R2 U' R2 U2 R",           initialStateAlg: "R' U2' R2 U R2 U R2 U2' R'" },
        { id: "oll-u",        name: "U (Headlights)", algorithm: "R2 D' R U2 R' D R U2 R",             initialStateAlg: "R' U2' R' D' R U2 R' D R2" },
        { id: "oll-t",        name: "T Pattern",      algorithm: "r U R' U' r' F R F'",                initialStateAlg: "F R' F' r U R U' r'" },
        { id: "oll-l",        name: "L Pattern",      algorithm: "F R U R' U' F'",                      initialStateAlg: "F U R U' R' F'" },
      ],
    },
  ],
};

const PLL_SECTION: Section = {
  id: "pll",
  label: "PLL",
  color: "#9333EA",
  subsections: [
    {
      heading: "Corner Permutation",
      cases: [
        { id: "pll-adjacent", name: "Adjacent Swap",  algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",           initialStateAlg: "F R U' R' U R U R2' F' R U R U' R'" },
        { id: "pll-diagonal", name: "Diagonal Swap",  algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",     initialStateAlg: "F R' F' R U R U' R' F R' U' R U R U' R' F'" },
      ],
    },
    {
      heading: "Edge Permutation",
      cases: [
        { id: "pll-ua", name: "Ua Perm", algorithm: "R U' R U R U R U' R' U' R2",    initialStateAlg: "R2' U R U R U' R' U' R' U' R" },
        { id: "pll-ub", name: "Ub Perm", algorithm: "R2 U R U R' U' R' U' R' U R'", initialStateAlg: "R U' R U R U R U' R' U' R2'" },
        { id: "pll-h",  name: "H Perm",  algorithm: "M2 U M2 U2 M2 U M2",            initialStateAlg: "M2' U' M2' U2' M2' U' M2'" },
        { id: "pll-z",  name: "Z Perm",  algorithm: "M2 U M2 U M' U2 M2 U2 M'",     initialStateAlg: "M U2' M2' U2' M U' M2' U' M2'" },
      ],
    },
  ],
};

const BEGINNER_SECTION: Section = {
  id: "beginner",
  label: "Beginner",
  color: "#2563EB",
  subsections: [
    {
      heading: "F2L Insertions",
      cases: [
        { id: "beg-right-insert", name: "Right Insert", algorithm: "U R U' R' U' F' U F" },
        { id: "beg-left-insert",  name: "Left Insert",  algorithm: "U' L' U L U F U' F'" },
      ],
    },
    {
      heading: "Building Blocks",
      cases: [
        { id: "beg-sexy", name: "Sexy Move", algorithm: "R U R' U'" },
      ],
    },
  ],
};

const ALL_SECTIONS = [OLL_SECTION, PLL_SECTION, BEGINNER_SECTION];

function matchesSearch(entry: CaseEntry, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return entry.name.toLowerCase().includes(lower) || entry.algorithm.toLowerCase().includes(lower);
}

function AlgorithmCard({
  entry,
  expanded,
  onToggle,
  sectionColor,
}: {
  entry: CaseEntry;
  expanded: boolean;
  onToggle: () => void;
  sectionColor: string;
}) {
  return (
    <div
      className="rounded-xl border bg-white overflow-hidden transition-all"
      style={{
        borderColor: expanded ? sectionColor + "50" : "#E2E8F0",
        boxShadow: expanded ? `0 0 0 2px ${sectionColor}15, 0 2px 8px rgba(0,0,0,0.06)` : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-sm text-[#0F172A] leading-tight">{entry.name}</p>
          <button
            onClick={onToggle}
            className="no-print shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: expanded ? sectionColor : "#F1F5F9",
              color: expanded ? "#fff" : sectionColor,
            }}
          >
            {expanded ? "Close" : "Demo"}
          </button>
        </div>
        <code
          className="block font-mono text-xs text-[#0F172A] rounded-lg px-3 py-2 break-all leading-relaxed"
          style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}
        >
          {entry.algorithm}
        </code>
      </div>
      {expanded && (
        <div className="no-print border-t border-[#E2E8F0] bg-[#FAFAFA] p-4">
          <AlgorithmPlayer
            algorithm={entry.algorithm}
            initialStateAlg={entry.initialStateAlg}
            title={entry.name}
          />
        </div>
      )}
    </div>
  );
}

function SectionBlock({
  section,
  search,
  expandedId,
  onToggle,
}: {
  section: Section;
  search: string;
  expandedId: string | null;
  onToggle: (id: string) => void;
}) {
  const subsectionsFiltered = section.subsections
    .map((sub) => ({ ...sub, cases: sub.cases.filter((c) => matchesSearch(c, search)) }))
    .filter((sub) => sub.cases.length > 0);

  if (subsectionsFiltered.length === 0) return null;

  const totalCases = subsectionsFiltered.reduce((sum, sub) => sum + sub.cases.length, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <span
          className="text-sm font-bold px-3 py-1 rounded-full"
          style={{ color: section.color, backgroundColor: section.color + "15", border: `1px solid ${section.color}30` }}
        >
          {section.label}
        </span>
        <span className="text-xs text-[#94A3B8]">{totalCases} algorithm{totalCases !== 1 ? "s" : ""}</span>
        <div className="flex-1 h-px bg-[#E2E8F0]" />
      </div>

      {subsectionsFiltered.map((sub) => (
        <div key={sub.heading} className="flex flex-col gap-3">
          <h3
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "#94A3B8" }}
          >
            {sub.heading}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 print:grid-cols-3">
            {sub.cases.map((entry) => (
              <AlgorithmCard
                key={entry.id}
                entry={entry}
                expanded={expandedId === entry.id}
                onToggle={() => onToggle(entry.id)}
                sectionColor={section.color}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type Filter = "all" | "oll" | "pll" | "beginner";

const FILTER_TABS: { id: Filter; label: string; color: string }[] = [
  { id: "all",      label: "All",      color: "#0F172A" },
  { id: "oll",      label: "OLL",      color: "#CA8A04" },
  { id: "pll",      label: "PLL",      color: "#9333EA" },
  { id: "beginner", label: "Beginner", color: "#2563EB" },
];

export default function ReferencePage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visibleSections = useMemo(() => {
    if (filter === "all") return ALL_SECTIONS;
    return ALL_SECTIONS.filter((s) => s.id === filter);
  }, [filter]);

  function handleToggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const activeFilter = FILTER_TABS.find((t) => t.id === filter)!;

  return (
    <>
      <style>{`
        @media print {
          nav, aside, [data-sidebar] { display: none !important; }
          .no-print { display: none !important; }
          body { background: white !important; }
          main { margin-left: 0 !important; }
        }
      `}</style>

      <div className="ltc-page flex flex-col gap-8">
        {/* Header */}
        <div className="print:hidden">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#2563EB] mb-1">Cheat Sheet</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Algorithm Reference</h1>
          <p className="text-[#64748B] text-sm mt-1">
            OLL (10 cases) · PLL (6 cases) · F2L insertions
          </p>
        </div>

        {/* Toolbar */}
        <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                    backgroundColor: isActive ? tab.color : "#F1F5F9",
                    color: isActive ? "#fff" : "#64748B",
                    border: `1px solid ${isActive ? tab.color : "#E2E8F0"}`,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-60">
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
              placeholder="Search algorithms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#E2E8F0] bg-white pl-8 pr-3 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
            />
          </div>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-10">
          {visibleSections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              search={search}
              expandedId={expandedId}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {/* Empty */}
        {visibleSections.every((s) =>
          s.subsections.every((sub) => sub.cases.every((c) => !matchesSearch(c, search)))
        ) && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-4xl">🔍</span>
            <p className="text-[#64748B]">No algorithms match &ldquo;{search}&rdquo;</p>
            <button onClick={() => setSearch("")} className="text-sm text-[#2563EB] hover:underline underline-offset-2">
              Clear search
            </button>
          </div>
        )}
      </div>
    </>
  );
}
