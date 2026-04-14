"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { AlgorithmPlayer } from "@/components/cube/AlgorithmPlayer";
import { StepContent } from "./StepContent";
import { AlgorithmCard } from "./AlgorithmCard";
import { useProgressStore } from "@/stores/progressStore";
import { BEGINNER_STEPS } from "@/data/beginner";
import type { TutorialStep, StepMeta } from "@/lib/tutorialTypes";

const STEP_COLORS: Record<string, string> = {
  "cross":         "#2563EB",
  "corners":       "#16A34A",
  "second-layer":  "#EA580C",
  "two-look-oll":  "#CA8A04",
  "two-look-pll":  "#9333EA",
};

interface TutorialLayoutProps {
  stepData: TutorialStep;
  stepMeta: StepMeta;
  initialSubstepIndex?: number;
  showAlgorithmGrid?: boolean;
  showViewToggle?: boolean;
}

export function TutorialLayout({
  stepData,
  stepMeta,
  initialSubstepIndex = 0,
  showAlgorithmGrid = false,
  showViewToggle = false,
}: TutorialLayoutProps) {
  const [activeIdx, setActiveIdx] = useState(
    Math.min(initialSubstepIndex, stepData.substeps.length - 1),
  );
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const { completeStep, completedSteps } = useProgressStore();
  const isCompleted = completedSteps.includes(stepData.id);

  const activeSubstep = stepData.substeps[activeIdx];
  const totalSubsteps = stepData.substeps.length;
  const algorithmToPlay = activeSubstep.solutionMoves ?? activeSubstep.algorithm ?? "";

  const currentStepIdx = BEGINNER_STEPS.findIndex((s) => s.id === stepData.id);
  const prevStep = currentStepIdx > 0 ? BEGINNER_STEPS[currentStepIdx - 1] : null;
  const nextStep = currentStepIdx < BEGINNER_STEPS.length - 1 ? BEGINNER_STEPS[currentStepIdx + 1] : null;

  const accentColor = STEP_COLORS[stepData.id] ?? "#2563EB";

  function goToSubstep(idx: number) {
    setActiveIdx(idx);
    rightPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col">
      <div
        className="flex flex-col md:grid md:items-start md:gap-8"
        style={{ gridTemplateColumns: "minmax(300px, 420px) 1fr" }}
      >
        {/* LEFT: AlgorithmPlayer — sticky */}
        <div className="sticky top-0 z-10 bg-[#F4F6FB] border-b border-[#E2E8F0] py-3 px-0 md:static md:border-0 md:py-0 md:sticky md:top-6 md:z-auto">
          <div className="rounded-2xl overflow-hidden shadow-md border border-[#E2E8F0] bg-white">
            <AlgorithmPlayer
              key={`${stepData.id}-${activeIdx}`}
              algorithm={algorithmToPlay}
              initialStateAlg={activeSubstep.initialState}
              title={activeSubstep.title}
              showViewToggle={showViewToggle}
              arrows={activeSubstep.arrows}
              {...(!showAlgorithmGrid && activeSubstep.visibleCubies
                ? { visibleCubies: activeSubstep.visibleCubies }
                : {})}
            />
          </div>
        </div>

        {/* RIGHT: content panel */}
        <div ref={rightPanelRef} className="flex flex-col gap-5 mt-4 md:mt-0">
          {/* Step header */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ color: accentColor, backgroundColor: accentColor + "15", border: `1px solid ${accentColor}30` }}
              >
                Step {stepMeta.stepNumber} of {BEGINNER_STEPS.length}
              </span>
              {isCompleted && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0]">
                  ✓ Complete
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-[#0F172A]">{stepData.title}</h1>
            <p className="text-sm text-[#64748B] mt-1 leading-relaxed">{stepData.description}</p>
          </div>

          {/* Substep navigation */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
            <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2.5">
              {showAlgorithmGrid ? "Cases" : "Substeps"}
            </p>
            <nav className="flex flex-col gap-1">
              {stepData.substeps.map((sub, idx) => {
                const isActive = idx === activeIdx;
                return (
                  <button
                    key={sub.id}
                    onClick={() => goToSubstep(idx)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-left transition-all w-full"
                    style={{
                      backgroundColor: isActive ? accentColor + "12" : "transparent",
                      color: isActive ? accentColor : "#64748B",
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-[10px] transition-all"
                      style={{
                        borderColor: isCompleted
                          ? accentColor
                          : isActive
                          ? accentColor
                          : "#CBD5E1",
                        backgroundColor: isCompleted
                          ? accentColor
                          : isActive
                          ? accentColor + "20"
                          : "transparent",
                        color: isCompleted
                          ? "#fff"
                          : isActive
                          ? accentColor
                          : "#94A3B8",
                      }}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </span>
                    <span className="truncate">{sub.algorithmName ?? sub.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
            <StepContent
              substep={activeSubstep}
              onNextExample={
                !showAlgorithmGrid && activeIdx < totalSubsteps - 1
                  ? () => goToSubstep(activeIdx + 1)
                  : undefined
              }
            />
          </div>

          {/* Prev / Next navigation */}
          <div className="flex items-center justify-between gap-3">
            <div>
              {activeIdx > 0 ? (
                <button
                  onClick={() => goToSubstep(activeIdx - 1)}
                  className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm"
                >
                  ← Previous
                </button>
              ) : prevStep ? (
                <Link
                  href={prevStep.route}
                  className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors shadow-sm"
                >
                  ← {prevStep.title}
                </Link>
              ) : (
                <span />
              )}
            </div>

            <div>
              {activeIdx < totalSubsteps - 1 ? (
                <button
                  onClick={() => goToSubstep(activeIdx + 1)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  Next →
                </button>
              ) : nextStep ? (
                <Link
                  href={nextStep.route}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors shadow-sm"
                  style={{ backgroundColor: accentColor }}
                >
                  Next: {nextStep.title} →
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>

          {/* Mark as Complete */}
          <button
            onClick={() => completeStep(stepData.id)}
            disabled={isCompleted}
            className="w-full rounded-xl py-3 text-sm font-bold transition-all"
            style={
              isCompleted
                ? {
                    backgroundColor: "#F0FDF4",
                    color: "#16A34A",
                    border: "2px solid #BBF7D0",
                    cursor: "default",
                  }
                : {
                    backgroundColor: accentColor,
                    color: "#fff",
                    border: `2px solid ${accentColor}`,
                    boxShadow: `0 4px 14px ${accentColor}40`,
                  }
            }
          >
            {isCompleted ? "✓ Step Completed" : "Mark as Complete"}
          </button>
        </div>
      </div>

      {/* Algorithm reference grid — OLL/PLL only */}
      {showAlgorithmGrid && (
        <div className="mt-12 pt-8 border-t border-[#E2E8F0]">
          <h2 className="text-lg font-bold text-[#0F172A] mb-1">All Cases</h2>
          <p className="text-sm text-[#64748B] mb-4">
            Click Play on any card to load it into the player above.
          </p>
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
            {stepData.substeps.map((sub, idx) => (
              <AlgorithmCard
                key={sub.id}
                substep={sub}
                isActive={idx === activeIdx}
                onPlay={() => {
                  goToSubstep(idx);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
