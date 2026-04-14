"use client";

import { useState } from "react";
import { PatternTrainer } from "@/components/trainer/PatternTrainer";
import { SolveAlong } from "@/components/trainer/SolveAlong";

type Tab = "pattern" | "solve-along";

export default function TrainerPage() {
  const [tab, setTab] = useState<Tab>("pattern");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Trainer</h1>
        <p className="mt-1 text-[#64748B]">
          Practice pattern recognition or solve along with the beginner method.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-[#F1F5F9] p-1 w-fit">
        <button
          onClick={() => setTab("pattern")}
          className={`min-h-[36px] rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "pattern"
              ? "bg-white text-[#1E293B] shadow-sm"
              : "text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          Pattern Quiz
        </button>
        <button
          onClick={() => setTab("solve-along")}
          className={`min-h-[36px] rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "solve-along"
              ? "bg-white text-[#1E293B] shadow-sm"
              : "text-[#64748B] hover:text-[#1E293B]"
          }`}
        >
          Solve Along
        </button>
      </div>

      {tab === "pattern" ? <PatternTrainer /> : <SolveAlong />}
    </div>
  );
}
