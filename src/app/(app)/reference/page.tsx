"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";

const AlgorithmPlayer = dynamic(
  () => import("@/components/cube/AlgorithmPlayer").then((m) => m.AlgorithmPlayer),
  { ssr: false }
);

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

type CaseEntry = {
  id: string;
  name: string;
  algorithm: string;
  initialStateAlg?: string;
};

type Section = {
  id: string;
  label: string;
  subsections: { heading: string; cases: CaseEntry[] }[];
};

const OLL_SECTION: Section = {
  id: "oll",
  label: "OLL",
  subsections: [
    {
      heading: "Edge Orientation",
      cases: [
        {
          id: "oll-dot",
          name: "Dot",
          algorithm: "F R U R' U' F' f R U R' U' f'",
          initialStateAlg: "f U R U' R' f' F U R U' R' F'",
        },
        {
          id: "oll-l-shape",
          name: "Small L Shape",
          algorithm: "f R U R' U' f'",
          initialStateAlg: "f U R U' R' f'",
        },
        {
          id: "oll-line",
          name: "Line",
          algorithm: "F R U R' U' F'",
          initialStateAlg: "F U R U' R' F'",
        },
      ],
    },
    {
      heading: "Corner Orientation",
      cases: [
        {
          id: "oll-sune",
          name: "Sune",
          algorithm: "R U R' U R U2 R'",
          initialStateAlg: "R U2' R' U' R U' R'",
        },
        {
          id: "oll-antisune",
          name: "Anti-Sune",
          algorithm: "R U2 R' U' R U' R'",
          initialStateAlg: "R U R' U R U2' R'",
        },
        {
          id: "oll-h",
          name: "H Pattern",
          algorithm: "R U R' U R U' R' U R U2 R'",
          initialStateAlg: "R U2' R' U' R U R' U' R U' R'",
        },
        {
          id: "oll-pi",
          name: "Pi (Bowtie)",
          algorithm: "R U2 R2 U' R2 U' R2 U2 R",
          initialStateAlg: "R' U2' R2 U R2 U R2 U2' R'",
        },
        {
          id: "oll-u",
          name: "U Pattern (Headlights)",
          algorithm: "R2 D' R U2 R' D R U2 R",
          initialStateAlg: "R' U2' R' D' R U2 R' D R2",
        },
        {
          id: "oll-t",
          name: "T Pattern",
          algorithm: "r U R' U' r' F R F'",
          initialStateAlg: "F R' F' r U R U' r'",
        },
        {
          id: "oll-l",
          name: "L Pattern (Big L)",
          algorithm: "F R U R' U' F'",
          initialStateAlg: "F U R U' R' F'",
        },
      ],
    },
  ],
};

const PLL_SECTION: Section = {
  id: "pll",
  label: "PLL",
  subsections: [
    {
      heading: "Corner Permutation",
      cases: [
        {
          id: "pll-adjacent",
          name: "Adjacent Corner Swap",
          algorithm: "R U R' U' R' F R2 U' R' U' R U R' F'",
          initialStateAlg: "F R U' R' U R U R2' F' R U R U' R'",
        },
        {
          id: "pll-diagonal",
          name: "Diagonal Corner Swap",
          algorithm: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
          initialStateAlg: "F R' F' R U R U' R' F R' U' R U R U' R' F'",
        },
      ],
    },
    {
      heading: "Edge Permutation",
      cases: [
        {
          id: "pll-ua",
          name: "Ua Perm",
          algorithm: "R U' R U R U R U' R' U' R2",
          initialStateAlg: "R2' U R U R U' R' U' R' U' R",
        },
        {
          id: "pll-ub",
          name: "Ub Perm",
          algorithm: "R2 U R U R' U' R' U' R' U R'",
          initialStateAlg: "R U' R U R U R U' R' U' R2'",
        },
        {
          id: "pll-h",
          name: "H Perm",
          algorithm: "M2 U M2 U2 M2 U M2",
          initialStateAlg: "M2' U' M2' U2' M2' U' M2'",
        },
        {
          id: "pll-z",
          name: "Z Perm",
          algorithm: "M2 U M2 U M' U2 M2 U2 M'",
          initialStateAlg: "M U2' M2' U2' M U' M2' U' M2'",
        },
      ],
    },
  ],
};

const BEGINNER_SECTION: Section = {
  id: "beginner",
  label: "Beginner Algorithms",
  subsections: [
    {
      heading: "F2L Insertions",
      cases: [
        {
          id: "beg-right-insert",
          name: "Right Insert",
          algorithm: "U R U' R' U' F' U F",
        },
        {
          id: "beg-left-insert",
          name: "Left Insert",
          algorithm: "U' L' U L U F U' F'",
        },
      ],
    },
    {
      heading: "Building Blocks",
      cases: [
        {
          id: "beg-sexy",
          name: "Sexy Move",
          algorithm: "R U R' U'",
        },
      ],
    },
  ],
};

const ALL_SECTIONS = [OLL_SECTION, PLL_SECTION, BEGINNER_SECTION];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function matchesSearch(entry: CaseEntry, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    entry.name.toLowerCase().includes(lower) ||
    entry.algorithm.toLowerCase().includes(lower)
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AlgorithmCard({
  entry,
  expanded,
  onToggle,
}: {
  entry: CaseEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden print:shadow-none print:border-[#CBD5E1]">
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold text-sm text-[#1E293B] leading-tight">{entry.name}</p>
          <button
            onClick={onToggle}
            className="no-print shrink-0 rounded-md border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs font-medium text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
          >
            {expanded ? "Close" : "Demo"}
          </button>
        </div>
        <code className="block font-mono text-xs text-[#1E293B] bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2 py-1.5 break-all leading-relaxed">
          {entry.algorithm}
        </code>
      </div>
      {expanded && (
        <div className="no-print border-t border-[#E2E8F0] p-4">
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
  const subsectionsFiltered = section.subsections.map((sub) => ({
    ...sub,
    cases: sub.cases.filter((c) => matchesSearch(c, search)),
  })).filter((sub) => sub.cases.length > 0);

  if (subsectionsFiltered.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-[#1E293B] border-b border-[#E2E8F0] pb-2">
        {section.label}
      </h2>
      {subsectionsFiltered.map((sub) => (
        <div key={sub.heading} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide">
            {sub.heading}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3">
            {sub.cases.map((entry) => (
              <AlgorithmCard
                key={entry.id}
                entry={entry}
                expanded={expandedId === entry.id}
                onToggle={() => onToggle(entry.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Filter = "all" | "oll" | "pll" | "beginner";

const TABS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "oll", label: "OLL" },
  { id: "pll", label: "PLL" },
  { id: "beginner", label: "Beginner Algorithms" },
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

      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-1 print:hidden">
          <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Algorithm Reference</h1>
          <p className="text-[#64748B]">
            All beginner method algorithms — OLL (10 cases), PLL (6 cases), and F2L insertions.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
          {/* Filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === tab.id
                    ? "bg-[#2563EB] text-white"
                    : "border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F1F5F9]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="search"
            placeholder="Search by name or notation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#1E293B] placeholder-[#94A3B8] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent w-full sm:w-60"
          />
        </div>

        {/* Sections */}
        {visibleSections.map((section) => (
          <SectionBlock
            key={section.id}
            section={section}
            search={search}
            expandedId={expandedId}
            onToggle={handleToggle}
          />
        ))}

        {/* Empty state */}
        {visibleSections.every((s) =>
          s.subsections.every((sub) => sub.cases.every((c) => !matchesSearch(c, search)))
        ) && (
          <p className="text-center text-[#94A3B8] py-12">No algorithms match &ldquo;{search}&rdquo;</p>
        )}
      </div>
    </>
  );
}
