"use client";

import { useState } from "react";
import { PatternTrainer } from "@/components/trainer/PatternTrainer";
import { SolveAlong } from "@/components/trainer/SolveAlong";

type Tab = "pattern" | "solve-along";

const TABS: { id: Tab; label: string; description: string }[] = [
  {
    id: "pattern",
    label: "Pattern Quiz",
    description: "Identify OLL & PLL cases from the 3D cube",
  },
  {
    id: "solve-along",
    label: "Solve Along",
    description: "Practice full solves with step guidance",
  },
];

export default function TrainerPage() {
  const [tab, setTab] = useState<Tab>("pattern");

  return (
    <div className="ltc-page flex flex-col gap-6">
      {/* Header */}
      <div>
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "#2563EB" }}
        >
          Practice Mode
        </p>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "oklch(18% 0.01 250)" }}
        >
          Trainer
        </h1>
        <p className="mt-1 text-sm" style={{ color: "oklch(50% 0.012 250)" }}>
          Drill pattern recognition and build solve speed.
        </p>
      </div>

      {/* Tab switcher */}
      <div
        className="flex rounded-2xl p-1 gap-1"
        style={{
          background: "oklch(97.5% 0.005 250)",
          border: "1px solid oklch(89% 0.01 250)",
        }}
      >
        {TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex flex-col gap-0.5 rounded-xl px-4 py-3 text-left transition-all duration-200"
              style={{
                background: isActive ? "oklch(100% 0 0)" : "transparent",
                border: isActive ? "1px solid oklch(89% 0.01 250)" : "1px solid transparent",
                boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
              }}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: isActive ? "#2563EB" : "oklch(52% 0.012 250)" }}
              >
                {t.label}
              </span>
              <p className="text-xs" style={{ color: "oklch(60% 0.01 250)" }}>
                {t.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Divider */}
      <div className="h-px" style={{ background: "oklch(89% 0.01 250)" }} />

      {/* Content */}
      {tab === "pattern" ? <PatternTrainer /> : <SolveAlong />}
    </div>
  );
}
