"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { AlgorithmPlayer } from "@/components/cube/AlgorithmPlayer";
import { StepContent } from "./StepContent";
import { AlgorithmCard } from "./AlgorithmCard";
import { useProgressStore } from "@/stores/progressStore";
import { BEGINNER_STEPS } from "@/data/beginner";
import type { TutorialStep, StepMeta } from "@/lib/tutorialTypes";

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

  // For steps 1–3: solutionMoves shows the cube being solved from the starting position.
  // For OLL/PLL: algorithm IS the solution.
  const algorithmToPlay = activeSubstep.solutionMoves ?? activeSubstep.algorithm ?? "";

  const currentStepIdx = BEGINNER_STEPS.findIndex((s) => s.id === stepData.id);
  const prevStep = currentStepIdx > 0 ? BEGINNER_STEPS[currentStepIdx - 1] : null;
  const nextStep =
    currentStepIdx < BEGINNER_STEPS.length - 1
      ? BEGINNER_STEPS[currentStepIdx + 1]
      : null;

  function goToSubstep(idx: number) {
    setActiveIdx(idx);
    rightPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col">
      {/* Two-panel layout */}
      <div className="flex flex-col md:grid md:items-start md:gap-8" style={{ gridTemplateColumns: "minmax(320px, 460px) 1fr" }}>

        {/* LEFT: AlgorithmPlayer
            Mobile: sticky at top of viewport so cube stays visible while scrolling text.
            Desktop: sticky within its grid column. */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E2E8F0] py-3 px-0 md:static md:border-0 md:py-0 md:sticky md:top-6 md:z-auto">
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

        {/* RIGHT: Step header + substep sidebar + content + nav */}
        <div ref={rightPanelRef} className="flex flex-col gap-6 mt-4 md:mt-0">
          {/* Step header */}
          <div>
            <span className="text-sm font-medium text-[#2563EB]">
              Step {stepMeta.stepNumber} of {BEGINNER_STEPS.length}
            </span>
            <h1 className="text-2xl font-bold text-[#1E293B] mt-0.5">{stepData.title}</h1>
            <p className="text-[#64748B] mt-1 leading-relaxed">{stepData.description}</p>
          </div>

          {/* Substep / case sidebar */}
          <nav className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-1">
              {showAlgorithmGrid ? "Cases" : "Substeps"}
            </p>
            {stepData.substeps.map((sub, idx) => (
              <button
                key={sub.id}
                onClick={() => goToSubstep(idx)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-left transition-colors w-full ${
                  idx === activeIdx
                    ? "bg-[#EFF6FF] text-[#2563EB] font-medium"
                    : "text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                <span
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold transition-colors ${
                    isCompleted
                      ? "bg-[#2563EB] border-[#2563EB] text-white text-[10px]"
                      : idx === activeIdx
                        ? "border-[#2563EB] text-[#2563EB] bg-[#EFF6FF] text-[10px]"
                        : "border-[#CBD5E1] text-[#94A3B8] text-[10px]"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </span>
                <span className="truncate">{sub.algorithmName ?? sub.title}</span>
              </button>
            ))}
          </nav>

          {/* Active substep content */}
          <StepContent
            substep={activeSubstep}
            onNextExample={
              !showAlgorithmGrid && activeIdx < totalSubsteps - 1
                ? () => goToSubstep(activeIdx + 1)
                : undefined
            }
          />

          {/* Prev / Next navigation */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
            <div>
              {activeIdx > 0 ? (
                <button
                  onClick={() => goToSubstep(activeIdx - 1)}
                  className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC] transition-colors shadow-sm"
                >
                  ← Previous
                </button>
              ) : prevStep ? (
                <Link
                  href={prevStep.route}
                  className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC] transition-colors shadow-sm"
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
                  className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors shadow-sm"
                >
                  Next →
                </button>
              ) : nextStep ? (
                <Link
                  href={nextStep.route}
                  className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] transition-colors shadow-sm"
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
            className={`w-full rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
              isCompleted
                ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A] cursor-default"
                : "border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#EFF6FF]"
            }`}
          >
            {isCompleted ? "✓ Step Completed" : "Mark as Complete"}
          </button>
        </div>
      </div>

      {/* Algorithm reference grid — OLL/PLL only */}
      {showAlgorithmGrid && (
        <div className="mt-12 pt-8 border-t border-[#E2E8F0]">
          <h2 className="text-lg font-semibold text-[#1E293B] mb-1">All Cases</h2>
          <p className="text-sm text-[#64748B] mb-4">
            Click Play on any card to load it into the player above.
          </p>
          <div className="grid grid-cols-2 gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
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
