"use client";

import Link from "next/link";
import { useProgressStore } from "@/stores/progressStore";
import {
  BEGINNER_STEPS,
  whiteCross,
  whiteCorners,
  secondLayer,
  twoLookOll,
  twoLookPll,
} from "@/data/beginner";

const STEP_DESCRIPTIONS: Record<string, string> = {
  "white-cross": "Form a cross on the white face by placing all four white edge pieces correctly.",
  "white-corners": "Complete the white face by inserting the four white corner pieces.",
  "second-layer": "Solve the middle layer by inserting the four edge pieces.",
  "two-look-oll": "Orient the last layer — first the cross, then the corners.",
  "two-look-pll": "Permute the last layer — corners first, then edges.",
};

const STEP_SCENARIO_COUNTS: Record<string, number> = {
  "white-cross": whiteCross.substeps.length,
  "white-corners": whiteCorners.substeps.length,
  "second-layer": secondLayer.substeps.length,
  "two-look-oll": twoLookOll.substeps.length,
  "two-look-pll": twoLookPll.substeps.length,
};

export default function LearnPage() {
  const { completedSteps } = useProgressStore();
  const completedCount = BEGINNER_STEPS.filter((s) =>
    completedSteps.includes(s.id),
  ).length;
  const progressPercent = (completedCount / BEGINNER_STEPS.length) * 100;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Beginner Method</h1>
        <p className="mt-2 text-[#64748B]">
          Learn to solve the cube in five stages using the layer-by-layer method.
          Work through each step in order.
        </p>
      </div>

      {/* Overall progress */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[#1E293B]">Overall Progress</span>
          <span className="text-sm text-[#64748B]">
            {completedCount} of {BEGINNER_STEPS.length} steps completed
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#F1F5F9] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#2563EB] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Step cards */}
      <ol className="flex flex-col gap-3">
        {BEGINNER_STEPS.map((step) => {
          const isDone = completedSteps.includes(step.id);
          const scenarioCount = STEP_SCENARIO_COUNTS[step.id];
          const isAlgorithmPage = step.caseCount !== undefined;

          return (
            <li key={step.id}>
              <Link
                href={step.route}
                className={`flex items-start gap-4 rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-all group ${
                  isDone
                    ? "border-[#BBF7D0]"
                    : "border-[#E2E8F0] hover:border-[#2563EB]"
                }`}
              >
                {/* Step number / checkmark */}
                <span
                  className={`flex-shrink-0 w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center transition-colors ${
                    isDone
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#EFF6FF] text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white"
                  }`}
                >
                  {isDone ? "✓" : step.stepNumber}
                </span>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-[#1E293B]">{step.title}</p>
                    {isDone && (
                      <span className="text-xs font-medium text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] rounded-full px-2 py-0.5">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#64748B] mt-0.5">
                    {STEP_DESCRIPTIONS[step.id]}
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    {isAlgorithmPage
                      ? `${scenarioCount} algorithm cases`
                      : `${scenarioCount} example scenarios`}
                    {" · "}
                    {step.estimatedMinutes} min
                  </p>
                </div>

                {/* Arrow */}
                <span className="flex-shrink-0 text-[#CBD5E1] group-hover:text-[#2563EB] transition-colors mt-1">
                  →
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
