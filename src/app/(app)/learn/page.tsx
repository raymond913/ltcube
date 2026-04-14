"use client";

import Link from "next/link";
import { useProgressStore } from "@/stores/progressStore";
import { BEGINNER_STEPS, cross, corners, secondLayer, twoLookOll, twoLookPll } from "@/data/beginner";

const STEP_META: Record<string, {
  description: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
  label: string;
}> = {
  "cross": {
    description: "Place all four white edge pieces to form the white cross on the bottom.",
    icon: "✛",
    color: "#2563EB",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    label: "Bottom Layer",
  },
  "corners": {
    description: "Insert the four white corners to complete the entire first layer.",
    icon: "◼",
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
    label: "Bottom Layer",
  },
  "second-layer": {
    description: "Solve the four middle-layer edges using right or left insert sequences.",
    icon: "▣",
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FED7AA",
    label: "Middle Layer",
  },
  "two-look-oll": {
    description: "Orient all last-layer pieces so the entire top face shows yellow.",
    icon: "✦",
    color: "#CA8A04",
    bg: "#FEFCE8",
    border: "#FEF08A",
    label: "Last Layer",
  },
  "two-look-pll": {
    description: "Permute the last layer pieces into their solved positions to finish.",
    icon: "★",
    color: "#9333EA",
    bg: "#FDF4FF",
    border: "#E9D5FF",
    label: "Last Layer",
  },
};

const STEP_SCENARIO_COUNTS: Record<string, number> = {
  "cross": cross.substeps.length,
  "corners": corners.substeps.length,
  "second-layer": secondLayer.substeps.length,
  "two-look-oll": twoLookOll.substeps.length,
  "two-look-pll": twoLookPll.substeps.length,
};

const GROUPS = [
  { label: "Bottom Layer",  ids: ["cross", "corners"] },
  { label: "Middle Layer",  ids: ["second-layer"] },
  { label: "Last Layer",    ids: ["two-look-oll", "two-look-pll"] },
];

const LAYER_COLORS: Record<string, string> = {
  "Bottom Layer": "#2563EB",
  "Middle Layer": "#EA580C",
  "Last Layer":   "#9333EA",
};

export default function LearnPage() {
  const { completedSteps } = useProgressStore();
  const completedCount = BEGINNER_STEPS.filter((s) => completedSteps.includes(s.id)).length;
  const progressPercent = (completedCount / BEGINNER_STEPS.length) * 100;

  return (
    <div className="ltc-page flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#2563EB] mb-1">
          Beginner Method
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-[#0F172A]">
          Layer by Layer
        </h1>
        <p className="text-[#64748B] text-sm leading-relaxed">
          Five steps to solve the cube. Work through them in order — each builds on the last.
        </p>
      </div>

      {/* Progress card */}
      <div className="rounded-2xl bg-white border border-[#E2E8F0] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#0F172A]">Your Progress</span>
          <span className="text-xs font-medium text-[#64748B] bg-[#F1F5F9] rounded-full px-2.5 py-1">
            {completedCount} of {BEGINNER_STEPS.length} steps
          </span>
        </div>

        {/* Segmented step bar */}
        <div className="flex gap-1.5 mb-3">
          {BEGINNER_STEPS.map((step) => {
            const done = completedSteps.includes(step.id);
            const meta = STEP_META[step.id];
            return (
              <Link
                key={step.id}
                href={step.route}
                title={step.title}
                className="flex-1 h-2 rounded-full transition-all duration-300 hover:opacity-80"
                style={{ backgroundColor: done ? meta.color : "#E2E8F0" }}
              />
            );
          })}
        </div>

        {/* Overall fill bar */}
        <div className="h-1 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPercent}%`,
              background: "linear-gradient(90deg, #2563EB 0%, #9333EA 100%)",
            }}
          />
        </div>

        {completedCount === BEGINNER_STEPS.length && (
          <p className="mt-3 text-xs font-semibold text-[#16A34A] flex items-center gap-1.5">
            <span className="inline-flex w-4 h-4 rounded-full bg-[#16A34A] text-white items-center justify-center text-[10px]">✓</span>
            All steps complete — you can solve the cube!
          </p>
        )}
      </div>

      {/* Step groups */}
      {GROUPS.map((group) => {
        const groupSteps = BEGINNER_STEPS.filter((s) => group.ids.includes(s.id));
        const layerColor = LAYER_COLORS[group.label];

        return (
          <div key={group.label} className="flex flex-col gap-3">
            {/* Group label */}
            <div className="flex items-center gap-3">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                style={{ color: layerColor, backgroundColor: layerColor + "15", border: `1px solid ${layerColor}30` }}
              >
                {group.label}
              </span>
              <div className="flex-1 h-px bg-[#E2E8F0]" />
            </div>

            <ol className="flex flex-col gap-2">
              {groupSteps.map((step) => {
                const isDone = completedSteps.includes(step.id);
                const meta = STEP_META[step.id];
                const scenarioCount = STEP_SCENARIO_COUNTS[step.id];

                return (
                  <li key={step.id}>
                    <Link
                      href={step.route}
                      className="group flex items-center gap-4 rounded-xl bg-white border p-4 shadow-sm hover:shadow-md transition-all duration-200"
                      style={{
                        borderColor: isDone ? meta.color + "60" : "#E2E8F0",
                        borderLeftColor: meta.color,
                        borderLeftWidth: "3px",
                      }}
                    >
                      {/* Icon */}
                      <span
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
                        style={{
                          backgroundColor: isDone ? meta.color : meta.bg,
                          color: isDone ? "#fff" : meta.color,
                          border: `1.5px solid ${isDone ? meta.color : meta.border}`,
                        }}
                      >
                        {isDone ? "✓" : meta.icon}
                      </span>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-medium text-[#94A3B8]">
                            Step {step.stepNumber}
                          </span>
                          <p className="font-semibold text-[#0F172A] text-sm">{step.title}</p>
                          {isDone && (
                            <span
                              className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                              style={{ color: meta.color, backgroundColor: meta.bg, border: `1px solid ${meta.border}` }}
                            >
                              Done
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5 leading-snug">{meta.description}</p>
                        <p className="text-[11px] text-[#94A3B8] mt-1">
                          {scenarioCount} scenario{scenarioCount !== 1 ? "s" : ""}
                          {" · "}~{step.estimatedMinutes} min
                        </p>
                      </div>

                      {/* Arrow */}
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all"
                        style={{
                          backgroundColor: "#F1F5F9",
                          color: "#94A3B8",
                        }}
                      >
                        →
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        );
      })}

      {/* Bottom CTA */}
      {completedCount === 0 && (
        <div className="rounded-2xl border border-dashed border-[#2563EB]/30 bg-[#EFF6FF]/50 p-6 text-center">
          <p className="text-sm text-[#64748B] mb-3">Start with the White Cross — it's the foundation of everything.</p>
          <Link
            href="/learn/white-cross"
            className="inline-flex items-center gap-2 rounded-full bg-[#2563EB] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[#1D4ED8] transition-colors"
          >
            Begin Step 1 →
          </Link>
        </div>
      )}
    </div>
  );
}
