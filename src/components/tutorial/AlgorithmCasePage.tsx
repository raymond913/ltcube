"use client";

import { useState } from "react";
import Link from "next/link";
import { AlgorithmPlayer } from "@/components/cube/AlgorithmPlayer";
import { CaseRecognition } from "./CaseRecognition";
import { HowToSpotTip } from "./HowToSpotTip";
import { useProgressStore } from "@/stores/progressStore";
import { BEGINNER_STEPS } from "@/data/beginner";
import type { TutorialStep, StepMeta, Substep } from "@/lib/tutorialTypes";

export interface SectionDef {
  title: string;
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

const TYPE_COLORS = {
  oll: { color: "#B45309", bg: "rgba(180,83,9,0.07)", border: "rgba(180,83,9,0.22)" },
  pll: { color: "#7C3AED", bg: "rgba(124,58,237,0.07)", border: "rgba(124,58,237,0.22)" },
};

const GLOW_NOTE = "The glowing stickers on the cube show what to look for.";

function HowToSpotCallout({ text, note }: { text: string; note?: string }) {
  return (
    <div
      className="rounded-lg px-3 py-2.5"
      style={{
        background: "rgba(37,99,235,0.06)",
        border: "1px solid rgba(37,99,235,0.18)",
      }}
    >
      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#2563EB" }}>
        How to spot this
      </p>
      <p className="text-sm leading-relaxed" style={{ color: "#1E3A8A" }}>
        {text}
      </p>
      {note && (
        <p className="mt-1.5 text-xs font-medium" style={{ color: "#2563EB" }}>
          {note}
        </p>
      )}
    </div>
  );
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

  const algorithmToPlay = activeSubstep.solutionMoves ?? activeSubstep.algorithm ?? "";

  const { completeStep, completedSteps } = useProgressStore();
  const isCompleted = completedSteps.includes(stepData.id);

  const currentStepIdx = BEGINNER_STEPS.findIndex((s) => s.id === stepData.id);
  const prevStep = currentStepIdx > 0 ? BEGINNER_STEPS[currentStepIdx - 1] : null;
  const nextStep =
    currentStepIdx < BEGINNER_STEPS.length - 1
      ? BEGINNER_STEPS[currentStepIdx + 1]
      : null;

  const typeTheme = TYPE_COLORS[diagramType];

  return (
    <div className="ltc-page flex flex-col gap-8">
      {/* Page header */}
      <div>
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-1"
          style={{ color: "#2563EB" }}
        >
          Step {stepMeta.stepNumber} of {BEGINNER_STEPS.length}
        </p>
        <h1
          className="text-2xl font-bold mt-0.5"
          style={{ color: "var(--color-text)" }}
        >
          {stepData.title}
        </h1>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
          {stepData.description}
        </p>
      </div>

      {/* Two-panel layout */}
      <div
        className="flex flex-col md:grid md:items-start md:gap-8"
        style={{ gridTemplateColumns: "minmax(300px, 420px) 1fr" }}
      >
        {/* LEFT — sticky player + active-case detail */}
        <div
          className="sticky top-0 z-10 border-b py-3 md:static md:border-0 md:py-0 md:sticky md:top-6 md:z-auto flex flex-col gap-4"
          style={{
            borderBottomColor: "var(--color-border)",
            backgroundColor: "var(--color-background)",
          }}
        >
          <AlgorithmPlayer
            key={activeSubstep.id}
            algorithm={algorithmToPlay}
            initialStateAlg={activeSubstep.initialState}
            title={activeSubstep.algorithmName ?? activeSubstep.title}
            stickerMask={activeSubstep.stickerMask}
            visibleCubies={activeSubstep.visibleCubies}
            cameraPosition={activeSubstep.cameraPosition}
            spotStickers={activeSubstep.spotStickers}
          />

          {/* Active-case explanation */}
          <div
            className="hidden md:flex flex-col gap-2 rounded-xl px-4 py-3"
            style={{
              background: "var(--color-surface-elevated)",
              border: `1px solid ${typeTheme.border}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              {activeSubstep.algorithmName ?? activeSubstep.title}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              {activeSubstep.explanation}
            </p>
            {activeSubstep.howToSpot && (
              <HowToSpotCallout
                text={activeSubstep.howToSpot}
                note={activeSubstep.spotStickers?.length ? GLOW_NOTE : undefined}
              />
            )}
            {activeSubstep.algorithm && (
              <code
                className="mt-1 text-xs tracking-wide break-all rounded-lg px-2.5 py-1.5"
                style={{
                  color: "#2563EB",
                  background: "var(--color-primary-light)",
                  border: "1px solid var(--color-primary-light-border)",
                }}
              >
                {activeSubstep.algorithm}
              </code>
            )}
          </div>

          {/* Mark complete */}
          <button
            onClick={() => completeStep(stepData.id)}
            disabled={isCompleted}
            className={`hidden md:block w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-150 ${!isCompleted ? "ltc-hover-primary" : ""}`}
            style={
              isCompleted
                ? {
                    background: "rgba(21,128,61,0.07)",
                    color: "#15803D",
                    border: "2px solid rgba(21,128,61,0.22)",
                    cursor: "default",
                  }
                : {
                    backgroundColor: "#2563EB",
                    color: "#fff",
                    border: "2px solid transparent",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 4px 16px rgba(37,99,235,0.25)",
                  }
            }
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
                  <h2
                    className="text-base font-semibold"
                    style={{ color: "var(--color-text)" }}
                  >
                    {section.title}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
                    {section.description}
                  </p>
                </div>

                {/* Case cards grid */}
                <div
                  className="grid gap-3"
                  style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}
                >
                  {sectionSubsteps.map((sub) => {
                    const isActive = sub.id === activeId;
                    const caseName = sub.algorithmName ?? sub.title;
                    return (
                      <div key={sub.id} className="relative">
                      <button
                        onClick={() => setActiveId(sub.id)}
                        className={`flex h-full w-full flex-col items-center gap-2 rounded-xl p-3 text-left transition-[transform,box-shadow,border-color,background] duration-150 ${!isActive ? "ltc-hover-lift-bordered" : ""}`}
                        style={{
                          background: isActive ? typeTheme.bg : "var(--color-surface-elevated)",
                          border: `1px solid ${isActive ? typeTheme.border : "var(--color-border)"}`,
                          boxShadow: isActive ? "0 2px 8px rgba(0,0,0,0.08)" : "0 1px 3px rgba(0,0,0,0.04)",
                          transform: isActive ? "translateY(-1px)" : "translateY(0)",
                          ["--ltc-hover-border" as string]: typeTheme.border,
                        }}
                      >
                        {/* Recognition diagram */}
                        <CaseRecognition
                          substepId={sub.id}
                          type={diagramType}
                          size={72}
                        />

                        {/* Case name */}
                        <span
                          className="text-xs font-semibold leading-tight text-center"
                          style={{ color: isActive ? typeTheme.color : "oklch(40% 0.01 250)" }}
                        >
                          {caseName}
                        </span>

                        {/* Algorithm preview */}
                        {sub.algorithm && (
                          <code
                            className="font-mono w-full text-xs leading-relaxed line-clamp-2 break-all text-center"
                            style={{
                                          color: isActive ? typeTheme.color : "oklch(55% 0.01 250)",
                            }}
                          >
                            {sub.algorithm}
                          </code>
                        )}
                      </button>
                      {sub.howToSpot && (
                        <HowToSpotTip
                          text={sub.howToSpot}
                          label={`How to spot ${caseName}`}
                          color={typeTheme.color}
                          note={sub.spotStickers?.length ? GLOW_NOTE : undefined}
                        />
                      )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Mobile: explanation for active case */}
          <div
            className="md:hidden rounded-xl px-4 py-3 flex flex-col gap-2"
            style={{
              background: "var(--color-surface-elevated)",
              border: `1px solid ${typeTheme.border}`,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              {activeSubstep.algorithmName ?? activeSubstep.title}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>
              {activeSubstep.explanation}
            </p>
            {activeSubstep.howToSpot && (
              <HowToSpotCallout
                text={activeSubstep.howToSpot}
                note={activeSubstep.spotStickers?.length ? GLOW_NOTE : undefined}
              />
            )}
            {activeSubstep.algorithm && (
              <code
                className="mt-1 text-xs tracking-wide break-all rounded-lg px-2.5 py-1.5"
                style={{
                  color: "#2563EB",
                  background: "var(--color-primary-light)",
                  border: "1px solid var(--color-primary-light-border)",
                }}
              >
                {activeSubstep.algorithm}
              </code>
            )}
          </div>

          {/* Prev / Next step navigation */}
          <div
            className="flex items-center justify-between gap-3 pt-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <div>
              {prevStep ? (
                <Link
                  href={prevStep.route}
                  className="rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150"
                  style={{
                    background: "var(--color-surface-elevated)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-muted)",
                  }}
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
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] active:scale-[0.97]"
                  style={{
                    backgroundColor: "#2563EB",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
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
            className={`md:hidden w-full rounded-xl py-3 text-sm font-bold transition-all duration-150 ${!isCompleted ? "ltc-hover-primary" : ""}`}
            style={
              isCompleted
                ? {
                    background: "rgba(21,128,61,0.07)",
                    color: "#15803D",
                    border: "2px solid rgba(21,128,61,0.22)",
                    cursor: "default",
                  }
                : {
                    backgroundColor: "#2563EB",
                    color: "#fff",
                    border: "2px solid transparent",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 4px 16px rgba(37,99,235,0.25)",
                  }
            }
          >
            {isCompleted ? "✓ Step Completed" : "Mark as Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
