"use client";

import { useState } from "react";
import { PatternTrainer } from "@/components/trainer/PatternTrainer";
import { SolveAlong } from "@/components/trainer/SolveAlong";

type Tab = "pattern" | "solve-along";

const TABS: { id: Tab; label: string; description: string; icon: string }[] = [
  {
    id: "pattern",
    label: "Pattern Quiz",
    description: "Identify OLL & PLL cases from the 3D cube",
    icon: "⚡",
  },
  {
    id: "solve-along",
    label: "Solve Along",
    description: "Practice full solves with step guidance",
    icon: "🔄",
  },
];

export default function TrainerPage() {
  const [tab, setTab] = useState<Tab>("pattern");

  return (
    <div className="ltc-page flex flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#2563EB] mb-1">Practice Mode</p>
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">Trainer</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Drill pattern recognition and build solve speed.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all"
            style={{
              backgroundColor: tab === t.id ? "#EFF6FF" : "#FFFFFF",
              borderColor: tab === t.id ? "#2563EB" : "#E2E8F0",
              boxShadow: tab === t.id ? "0 0 0 2px #2563EB20" : "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{t.icon}</span>
              <span
                className="text-sm font-semibold"
                style={{ color: tab === t.id ? "#2563EB" : "#0F172A" }}
              >
                {t.label}
              </span>
              {tab === t.id && (
                <span className="text-[10px] font-bold bg-[#2563EB] text-white rounded-full px-2 py-0.5">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-[#64748B] leading-snug">{t.description}</p>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-[#E2E8F0]" />

      {/* Content */}
      {tab === "pattern" ? <PatternTrainer /> : <SolveAlong />}
    </div>
  );
}
