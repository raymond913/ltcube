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
    bg: "rgba(37,99,235,0.07)",
    border: "rgba(37,99,235,0.18)",
    label: "Bottom Layer",
  },
  "corners": {
    description: "Insert the four white corners to complete the entire first layer.",
    icon: "◼",
    color: "#15803D",
    bg: "rgba(21,128,61,0.07)",
    border: "rgba(21,128,61,0.18)",
    label: "Bottom Layer",
  },
  "second-layer": {
    description: "Solve the four middle-layer edges using right or left insert sequences.",
    icon: "▣",
    color: "#C2410C",
    bg: "rgba(194,65,12,0.07)",
    border: "rgba(194,65,12,0.18)",
    label: "Middle Layer",
  },
  "two-look-oll": {
    description: "Orient all last-layer pieces so the entire top face shows yellow.",
    icon: "✦",
    color: "#B45309",
    bg: "rgba(180,83,9,0.07)",
    border: "rgba(180,83,9,0.18)",
    label: "Last Layer",
  },
  "two-look-pll": {
    description: "Permute the last layer pieces into their solved positions to finish.",
    icon: "★",
    color: "#7C3AED",
    bg: "rgba(124,58,237,0.07)",
    border: "rgba(124,58,237,0.18)",
    label: "Last Layer",
  },
};

const STEP_SCENARIO_COUNTS: Record<string, number> = {
  "cross":        cross.substeps.length,
  "corners":      corners.substeps.length,
  "second-layer": secondLayer.substeps.length,
  "two-look-oll": twoLookOll.substeps.length,
  "two-look-pll": twoLookPll.substeps.length,
};

const GROUPS = [
  { label: "Bottom Layer", ids: ["cross", "corners"] },
  { label: "Middle Layer", ids: ["second-layer"] },
  { label: "Last Layer",   ids: ["two-look-oll", "two-look-pll"] },
];

const LAYER_COLORS: Record<string, string> = {
  "Bottom Layer": "#2563EB",
  "Middle Layer": "#C2410C",
  "Last Layer":   "#7C3AED",
};

export default function LearnPage() {
  const { completedSteps } = useProgressStore();
  const completedCount = BEGINNER_STEPS.filter((s) => completedSteps.includes(s.id)).length;

  return (
    <div className="ltc-page flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "#2563EB" }}
        >
          Beginner Method
        </p>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "oklch(18% 0.01 250)" }}
        >
          Layer by Layer
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "oklch(50% 0.012 250)" }}>
          Five steps to solve the cube. Work through them in order — each builds on the last.
        </p>
      </div>

      {/* Progress card */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "oklch(100% 0 0)",
          border: "1px solid oklch(89% 0.01 250)",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold" style={{ color: "oklch(18% 0.01 250)" }}>
            Your Progress
          </span>
          <span
            className="text-xs font-semibold rounded-full px-2.5 py-1"
            style={{
              color: "#2563EB",
              background: "oklch(94% 0.04 255)",
              border: "1px solid oklch(87% 0.06 255)",
            }}
          >
            {completedCount} of {BEGINNER_STEPS.length} steps
          </span>
        </div>

        {/* Segmented step bar */}
        <div className="flex gap-1.5">
          {BEGINNER_STEPS.map((step) => {
            const done = completedSteps.includes(step.id);
            const meta = STEP_META[step.id];
            return (
              <Link
                key={step.id}
                href={step.route}
                title={step.title}
                className="flex-1 h-2 rounded-full transition-all duration-300 hover:opacity-75"
                style={{
                  backgroundColor: done ? meta.color : "oklch(91% 0.008 250)",
                }}
              />
            );
          })}
        </div>

        {completedCount === BEGINNER_STEPS.length && (
          <p className="mt-3 text-xs font-semibold flex items-center gap-1.5" style={{ color: "#15803D" }}>
            <span
              className="inline-flex w-4 h-4 rounded-full items-center justify-center text-2xs text-white"
              style={{ background: "#15803D" }}
            >✓</span>
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
                className="text-2xs font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full"
                style={{
                  color: layerColor,
                  background: `${layerColor}10`,
                  border: `1px solid ${layerColor}25`,
                }}
              >
                {group.label}
              </span>
              <div className="flex-1 h-px" style={{ background: "oklch(89% 0.01 250)" }} />
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
                      className="ltc-hover-lift group flex items-center gap-4 rounded-xl p-4 transition-all duration-200"
                      style={{
                        background: isDone ? meta.bg : "oklch(100% 0 0)",
                        border: `1px solid ${isDone ? meta.border : "oklch(89% 0.01 250)"}`,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                    >
                      {/* Step number badge */}
                      <span
                        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
                        style={{
                          background: isDone ? meta.color : meta.bg,
                          color: isDone ? "#fff" : meta.color,
                          border: `1.5px solid ${isDone ? meta.color : meta.border}`,
                        }}
                      >
                        {isDone ? "✓" : meta.icon}
                      </span>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="text-xs font-medium"
                            style={{ color: "oklch(62% 0.01 250)" }}
                          >
                            Step {step.stepNumber}
                          </span>
                          <p
                            className="font-semibold text-sm"
                            style={{ color: "oklch(18% 0.01 250)" }}
                          >
                            {step.title}
                          </p>
                          {isDone && (
                            <span
                              className="text-2xs font-semibold rounded-full px-2 py-0.5"
                              style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}
                            >
                              Done
                            </span>
                          )}
                        </div>
                        <p
                          className="text-xs mt-0.5 leading-snug"
                          style={{ color: "oklch(55% 0.01 250)" }}
                        >
                          {meta.description}
                        </p>
                        <p
                          className="text-xs mt-1"
                          style={{ color: "oklch(65% 0.008 250)" }}
                        >
                          {scenarioCount} scenario{scenarioCount !== 1 ? "s" : ""}
                          {" · "}~{step.estimatedMinutes} min
                        </p>
                      </div>

                      {/* Arrow */}
                      <span
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all"
                        style={{
                          background: "oklch(94% 0.04 255)",
                          border: "1px solid oklch(87% 0.06 255)",
                          color: "#2563EB",
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
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: "oklch(94% 0.04 255)",
            border: "1px dashed oklch(82% 0.08 255)",
          }}
        >
          <p className="text-sm mb-4" style={{ color: "oklch(50% 0.012 250)" }}>
            Start with the White Cross — it&apos;s the foundation of everything.
          </p>
          <Link
            href="/learn/white-cross"
            className="ltc-hover-primary inline-flex items-center gap-2 rounded-full text-white text-sm font-semibold px-6 py-2.5 transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]"
            style={{
              backgroundColor: "#2563EB",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 4px 16px rgba(37,99,235,0.25)",
            }}
          >
            Begin Step 1 →
          </Link>
        </div>
      )}
    </div>
  );
}
