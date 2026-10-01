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

// Solve Along is hidden for v1 (its cube can't be moved, and its stage tips
// contradict the lessons). The component is kept; flip this to bring it back.
const SOLVE_ALONG_ENABLED = false;

const VISIBLE_TABS = TABS.filter((t) => t.id !== "solve-along" || SOLVE_ALONG_ENABLED);

export default function TrainerPage() {
  const [tab, setTab] = useState<Tab>("pattern");

  return (
    <div className="ltc-page flex flex-col gap-6">
      {/* Header */}
      <div>
        <p
          className="text-sm font-semibold tracking-widest uppercase mb-1"
          style={{ color: "var(--color-primary)" }}
        >
          Practice Mode
        </p>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          Trainer
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--color-muted)" }}>
          {VISIBLE_TABS.length > 1
            ? "Drill pattern recognition and build solve speed."
            : "Drill pattern recognition: identify OLL and PLL cases from the 3D cube."}
        </p>
      </div>

      {/* Tab switcher (only when there is more than one tab to switch between) */}
      {VISIBLE_TABS.length > 1 && (
      <div
        className="flex rounded-2xl p-1 gap-1"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {VISIBLE_TABS.map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 flex flex-col gap-0.5 rounded-xl px-4 py-3 text-left transition-[background,border-color,box-shadow] duration-200"
              style={{
                background: isActive ? "var(--color-surface-elevated)" : "transparent",
                border: isActive ? "1px solid var(--color-border)" : "1px solid transparent",
                boxShadow: isActive ? "0 1px 4px var(--color-shadow-2)" : "none",
              }}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: isActive ? "var(--color-primary)" : "var(--color-muted)" }}
              >
                {t.label}
              </span>
              <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                {t.description}
              </p>
            </button>
          );
        })}
      </div>
      )}

      {/* Divider */}
      <div className="h-px" style={{ background: "var(--color-border)" }} />

      {/* Content */}
      {tab === "solve-along" && SOLVE_ALONG_ENABLED ? <SolveAlong /> : <PatternTrainer />}
    </div>
  );
}
