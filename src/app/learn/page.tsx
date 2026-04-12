"use client";

import Link from "next/link";
import { useProgressStore } from "@/stores/progressStore";
import { BEGINNER_STEPS, cross, firstLayer, secondLayer, topCross, matchCross, matchCorners, solve } from "@/data/beginner";

const STEP_DESCRIPTIONS: Record<string, string> = {
  "cross": "Place all four white edge pieces to form the white cross.",
  "first-layer": "Insert the four white corners to complete the white face.",
  "second-layer": "Solve the middle layer edges using the right or left insert.",
  "top-cross": "Orient the yellow edges to form a cross on top.",
  "match-cross": "Cycle the yellow edges until each matches its centre.",
  "match-corners": "Permute the top corners into their correct positions.",
  "solve": "Orient the final corners one at a time to finish the cube.",
};

const STEP_ICONS: Record<string, string> = {
  "cross":         "✛",
  "first-layer":   "⬜",
  "second-layer":  "▣",
  "top-cross":     "✦",
  "match-cross":   "↔",
  "match-corners": "◈",
  "solve":         "★",
};

const STEP_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "cross":         { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" },
  "first-layer":   { bg: "#F0FDF4", text: "#16A34A", border: "#BBF7D0" },
  "second-layer":  { bg: "#FFF7ED", text: "#EA580C", border: "#FED7AA" },
  "top-cross":     { bg: "#FEFCE8", text: "#CA8A04", border: "#FEF08A" },
  "match-cross":   { bg: "#FEFCE8", text: "#CA8A04", border: "#FEF08A" },
  "match-corners": { bg: "#FDF4FF", text: "#9333EA", border: "#E9D5FF" },
  "solve":         { bg: "#FDF4FF", text: "#9333EA", border: "#E9D5FF" },
};

const STEP_SCENARIO_COUNTS: Record<string, number> = {
  "cross": cross.substeps.length,
  "first-layer": firstLayer.substeps.length,
  "second-layer": secondLayer.substeps.length,
  "top-cross": topCross.substeps.length,
  "match-cross": matchCross.substeps.length,
  "match-corners": matchCorners.substeps.length,
  "solve": solve.substeps.length,
};

const GROUPS = [
  { label: "Bottom Layer", ids: ["cross", "first-layer"] },
  { label: "Middle Layer", ids: ["second-layer"] },
  { label: "Last Layer",   ids: ["top-cross", "match-cross", "match-corners", "solve"] },
];

export default function LearnPage() {
  const { completedSteps } = useProgressStore();
  const completedCount = BEGINNER_STEPS.filter((s) => completedSteps.includes(s.id)).length;
  const progressPercent = (completedCount / BEGINNER_STEPS.length) * 100;

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Beginner Method</h1>
        <p className="mt-2 text-[#64748B]">
          Seven steps to solve the cube, layer by layer. Work through them in order.
        </p>
      </div>

      {/* Overall progress */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#1E293B]">Overall Progress</span>
          <span className="text-sm text-[#64748B]">{completedCount} / {BEGINNER_STEPS.length} steps</span>
        </div>
        {/* Coloured step segments */}
        <div className="flex items-center gap-1">
          {BEGINNER_STEPS.map((step) => {
            const done = completedSteps.includes(step.id);
            const colors = STEP_COLORS[step.id];
            return (
              <Link
                key={step.id}
                href={step.route}
                title={step.title}
                className="flex-1 h-2.5 rounded-full transition-all hover:opacity-80"
                style={{ backgroundColor: done ? colors.text : "#E2E8F0" }}
              />
            );
          })}
        </div>
        <div className="h-1 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step groups */}
      {GROUPS.map((group) => {
        const groupSteps = BEGINNER_STEPS.filter((s) => group.ids.includes(s.id));
        return (
          <div key={group.label} className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] px-1">
              {group.label}
            </p>
            <ol className="flex flex-col">
              {groupSteps.map((step, localIdx) => {
                const isDone = completedSteps.includes(step.id);
                const scenarioCount = STEP_SCENARIO_COUNTS[step.id];
                const colors = STEP_COLORS[step.id];
                const icon = STEP_ICONS[step.id];
                const isLast = localIdx === groupSteps.length - 1;

                return (
                  <li key={step.id} className="relative flex flex-col">
                    <Link
                      href={step.route}
                      className={`flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-all group ${
                        isDone ? "border-[#BBF7D0]" : "border-[#E2E8F0] hover:border-[#2563EB]"
                      }`}
                    >
                      {/* Icon badge */}
                      <span
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold transition-all"
                        style={{
                          backgroundColor: isDone ? colors.text : colors.bg,
                          color: isDone ? "#fff" : colors.text,
                          border: `1.5px solid ${isDone ? colors.text : colors.border}`,
                        }}
                      >
                        {isDone ? "✓" : icon}
                      </span>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-[#94A3B8]">Step {step.stepNumber}</span>
                          <p className="font-semibold text-[#1E293B]">{step.title}</p>
                          {isDone && (
                            <span className="text-xs font-medium text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] rounded-full px-2 py-0.5">
                              Done
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#64748B] mt-0.5 leading-snug">
                          {STEP_DESCRIPTIONS[step.id]}
                        </p>
                        <p className="text-xs text-[#94A3B8] mt-1">
                          {scenarioCount} scenario{scenarioCount !== 1 ? "s" : ""}
                          {" · "}~{step.estimatedMinutes} min
                        </p>
                      </div>

                      {/* Arrow */}
                      <span className="flex-shrink-0 text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors text-lg">
                        →
                      </span>
                    </Link>

                    {/* Connector between items in same group */}
                    {!isLast && (
                      <div className="w-px h-2 bg-[#E2E8F0] ml-[1.375rem]" />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}
    </div>
  );
}
