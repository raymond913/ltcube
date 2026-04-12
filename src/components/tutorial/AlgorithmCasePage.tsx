"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { AlgorithmPlayer } from "@/components/cube/AlgorithmPlayer";
import { CaseRecognition } from "./CaseRecognition";
import { useProgressStore } from "@/stores/progressStore";
import { CubeEngine, parseAlgorithm, type CubeFaces } from "@/lib/cubeEngine";
import { BEGINNER_STEPS } from "@/data/beginner";
import type { TutorialStep, StepMeta, Substep } from "@/lib/tutorialTypes";

function scrambleToState(scramble: string): CubeFaces {
  const engine = new CubeEngine();
  if (scramble) {
    const moves = parseAlgorithm(scramble);
    for (const move of moves) engine.applyMove(move);
  }
  return engine.getState();
}

export interface SectionDef {
  title: string;
  /** Short sentence shown above the case grid. */
  description: string;
  substepIds: string[];
}

interface AlgorithmCasePageProps {
  stepData: TutorialStep;
  stepMeta: StepMeta;
  sections: SectionDef[];
  diagramType: "oll" | "pll";
  initialActiveId?: string;
}

export function AlgorithmCasePage({
  stepData,
  stepMeta,
  sections,
  diagramType,
  initialActiveId,
}: AlgorithmCasePageProps) {
  const firstId = initialActiveId ?? stepData.substeps[0]?.id;
  const [activeId, setActiveId] = useState(firstId);

  const activeSubstep: Substep =
    stepData.substeps.find((s) => s.id === activeId) ?? stepData.substeps[0];

  const initialCubeState = useMemo(
    () => scrambleToState(activeSubstep.initialState),
    [activeSubstep.initialState],
  );

  const algorithmToPlay = activeSubstep.solutionMoves ?? activeSubstep.algorithm ?? "";

  const { completeStep, completedSteps } = useProgressStore();
  const isCompleted = completedSteps.includes(stepData.id);

  const currentStepIdx = BEGINNER_STEPS.findIndex((s) => s.id === stepData.id);
  const prevStep = currentStepIdx > 0 ? BEGINNER_STEPS[currentStepIdx - 1] : null;
  const nextStep =
    currentStepIdx < BEGINNER_STEPS.length - 1
      ? BEGINNER_STEPS[currentStepIdx + 1]
      : null;

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <span className="text-sm font-medium text-[#2563EB]">
          Step {stepMeta.stepNumber} of {BEGINNER_STEPS.length}
        </span>
        <h1 className="text-2xl font-bold text-[#1E293B] mt-0.5">{stepData.title}</h1>
        <p className="text-[#64748B] mt-1 leading-relaxed">{stepData.description}</p>
      </div>

      {/* Two-panel layout */}
      <div
        className="flex flex-col md:grid md:items-start md:gap-8"
        style={{ gridTemplateColumns: "minmax(300px, 420px) 1fr" }}
      >
        {/* LEFT — sticky player + active-case detail */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E2E8F0] py-3 md:static md:border-0 md:py-0 md:sticky md:top-6 md:z-auto flex flex-col gap-4">
          <AlgorithmPlayer
            key={activeSubstep.id}
            algorithm={algorithmToPlay}
            initialState={initialCubeState}
            title={activeSubstep.algorithmName ?? activeSubstep.title}
          />

          {/* Active-case explanation */}
          <div className="hidden md:flex flex-col gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
            <p className="text-sm font-semibold text-[#1E293B]">
              {activeSubstep.algorithmName ?? activeSubstep.title}
            </p>
            <p className="text-sm text-[#475569] leading-relaxed">{activeSubstep.explanation}</p>
            {activeSubstep.algorithm && (
              <code className="mt-1 font-mono text-xs text-[#1E293B] tracking-wide break-all">
                {activeSubstep.algorithm}
              </code>
            )}
          </div>

          {/* Mark complete */}
          <button
            onClick={() => completeStep(stepData.id)}
            disabled={isCompleted}
            className={`hidden md:block w-full rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
              isCompleted
                ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A] cursor-default"
                : "border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#EFF6FF]"
            }`}
          >
            {isCompleted ? "✓ Step Completed" : "Mark as Complete"}
          </button>
        </div>

        {/* RIGHT — scrollable case sections */}
        <div className="flex flex-col gap-10 mt-4 md:mt-0">
          {sections.map((section) => {
            const sectionSubsteps = section.substepIds
              .map((id) => stepData.substeps.find((s) => s.id === id))
              .filter((s): s is Substep => s !== undefined);

            return (
              <div key={section.title} className="flex flex-col gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[#1E293B]">{section.title}</h2>
                  <p className="text-sm text-[#64748B] mt-0.5">{section.description}</p>
                </div>

                {/* Case cards grid */}
                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
                >
                  {sectionSubsteps.map((sub) => {
                    const isActive = sub.id === activeId;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setActiveId(sub.id)}
                        className={`flex flex-col items-center gap-2 rounded-xl border bg-white p-3 text-left transition-all ${
                          isActive
                            ? "border-[#2563EB] shadow-md ring-1 ring-[#2563EB]/20"
                            : "border-[#E2E8F0] shadow-sm hover:border-[#93C5FD] hover:shadow-md"
                        }`}
                      >
                        {/* Recognition diagram */}
                        <CaseRecognition
                          substepId={sub.id}
                          type={diagramType}
                          size={72}
                        />

                        {/* Case name */}
                        <span
                          className={`text-xs font-semibold leading-tight text-center ${
                            isActive ? "text-[#2563EB]" : "text-[#1E293B]"
                          }`}
                        >
                          {sub.algorithmName ?? sub.title}
                        </span>

                        {/* Algorithm preview */}
                        {sub.algorithm && (
                          <code className="w-full font-mono text-[10px] text-[#94A3B8] leading-relaxed line-clamp-2 break-all text-center">
                            {sub.algorithm}
                          </code>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Mobile: explanation for active case */}
          <div className="md:hidden rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 flex flex-col gap-2">
            <p className="text-sm font-semibold text-[#1E293B]">
              {activeSubstep.algorithmName ?? activeSubstep.title}
            </p>
            <p className="text-sm text-[#475569] leading-relaxed">{activeSubstep.explanation}</p>
            {activeSubstep.algorithm && (
              <code className="mt-1 font-mono text-xs text-[#1E293B] tracking-wide break-all">
                {activeSubstep.algorithm}
              </code>
            )}
          </div>

          {/* Prev / Next step navigation */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
            <div>
              {prevStep ? (
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
              {nextStep ? (
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

          {/* Mobile: Mark complete */}
          <button
            onClick={() => completeStep(stepData.id)}
            disabled={isCompleted}
            className={`md:hidden w-full rounded-lg border py-2.5 text-sm font-semibold transition-colors ${
              isCompleted
                ? "border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A] cursor-default"
                : "border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#EFF6FF]"
            }`}
          >
            {isCompleted ? "✓ Step Completed" : "Mark as Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
