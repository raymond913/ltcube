"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { AlgorithmPlayer } from "@/components/cube/AlgorithmPlayer";
import { CaseThumbnail } from "@/components/cube/CaseThumbnail";
import { StepContent } from "./StepContent";
import { AlgorithmCard } from "./AlgorithmCard";
import { useProgressStore } from "@/stores/progressStore";
import { BEGINNER_STEPS } from "@/data/beginner";
import { HOLD_VIEW } from "@/lib/cameraViews";
import type { TutorialStep, StepMeta } from "@/lib/tutorialTypes";
import { STEP_COLORS, tint } from "@/lib/theme";

interface TutorialLayoutProps {
  stepData: TutorialStep;
  stepMeta: StepMeta;
  initialSubstepIndex?: number;
  showAlgorithmGrid?: boolean;
  showViewToggle?: boolean;
  showCaseThumbnails?: boolean;
}

export function TutorialLayout({
  stepData,
  stepMeta,
  initialSubstepIndex = 0,
  showAlgorithmGrid = false,
  showViewToggle = false,
  showCaseThumbnails = false,
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

  const accentColor = STEP_COLORS[stepData.id] ?? "var(--color-primary)";

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
        <div
          className="sticky top-0 z-10 border-b py-3 px-0 md:static md:border-0 md:py-0 md:sticky md:top-6 md:z-auto"
          style={{
            borderBottomColor: "var(--color-border)",
            backgroundColor: "var(--color-background)",
          }}
        >
          <AlgorithmPlayer
            key={`${stepData.id}-${activeIdx}`}
            algorithm={algorithmToPlay}
            initialStateAlg={activeSubstep.initialState}
            title={activeSubstep.title}
            showViewToggle={showViewToggle}
            arrows={activeSubstep.arrows}
            whiteOnTop={activeSubstep.whiteOnTop}
            stickerMask={activeSubstep.stickerMask}
            holdView={HOLD_VIEW}
            spotView={activeSubstep.cameraPosition}
            spotStickers={activeSubstep.spotStickers}
            spotLabels={activeSubstep.spotLabels}
            {...(!showAlgorithmGrid && activeSubstep.visibleCubies
              ? { visibleCubies: activeSubstep.visibleCubies }
              : {})}
          />
        </div>

        {/* RIGHT: content panel */}
        <div ref={rightPanelRef} className="flex flex-col gap-4 mt-4 md:mt-0">
          {/* Step header */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 1px 4px var(--color-shadow-1)",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-sm font-bold px-2.5 py-0.5 rounded-full"
                style={{
                  color: accentColor,
                  background: tint(accentColor, 6),
                  border: `1px solid ${tint(accentColor, 15)}`,
                }}
              >
                Step {stepMeta.stepNumber} of {BEGINNER_STEPS.length}
              </span>
              {isCompleted && (
                <span
                  className="text-sm font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    color: "var(--color-step-corners)",
                    background: "color-mix(in srgb, var(--color-step-corners) 8%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--color-step-corners) 22%, transparent)",
                  }}
                >
                  ✓ Complete
                </span>
              )}
            </div>
            <h1
              className="text-xl font-bold"
              style={{ color: "var(--color-text)" }}
            >
              {stepData.title}
            </h1>
            <p
              className="text-sm mt-1 leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              {stepData.description}
            </p>
          </div>

          {/* Substep navigation */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 1px 4px var(--color-shadow-1)",
            }}
          >
            {showCaseThumbnails ? (
              <div className="grid grid-cols-2 gap-2">
                {stepData.substeps.map((sub, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => goToSubstep(idx)}
                      aria-current={isActive ? "step" : undefined}
                      className="flex flex-col items-center gap-1.5 rounded-xl p-1.5 transition-all duration-150 w-full"
                      style={{
                        background: isActive ? tint(accentColor, 3) : "var(--color-surface)",
                        border: `2px solid ${isActive ? accentColor : isCompleted ? tint(accentColor, 33) : "var(--color-border)"}`,
                        boxShadow: isActive ? `0 0 0 3px ${tint(accentColor, 9)}` : "none",
                      }}
                    >
                      <div className="relative rounded-lg overflow-hidden" style={{ width: 88, height: 88 }}>
                        <CaseThumbnail
                          initialState={sub.initialState}
                          visibleCubies={sub.visibleCubies}
                          title={sub.algorithmName ?? sub.title}
                          size={88}
                        />
                        <span
                          className="absolute top-1 left-1 w-6 h-6 rounded-full flex items-center justify-center font-bold pointer-events-none"
                          style={{
                            background: isCompleted ? accentColor : isActive ? accentColor : "var(--color-scrim)",
                            color: "var(--color-on-accent)",
                            fontSize: "14px",
                          }}
                        >
                          {isCompleted ? "✓" : idx + 1}
                        </span>
                      </div>
                      <span
                        className="text-center leading-tight w-full"
                        style={{
                          color: isActive ? accentColor : "var(--color-muted)",
                          fontWeight: isActive ? 600 : 400,
                          fontSize: "14px",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {sub.algorithmName ?? sub.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <nav className="flex flex-col gap-1">
                {stepData.substeps.map((sub, idx) => {
                  const isActive = idx === activeIdx;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => goToSubstep(idx)}
                      aria-current={isActive ? "step" : undefined}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-[background,color,border-color,font-weight] duration-150 w-full"
                      style={{
                        background: isActive ? tint(accentColor, 6) : "transparent",
                        color: isActive ? accentColor : "var(--color-muted)",
                        fontWeight: isActive ? 600 : 400,
                        border: isActive ? `1px solid ${tint(accentColor, 13)}` : "1px solid transparent",
                      }}
                    >
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all"
                        style={{
                          borderColor: isCompleted ? accentColor : isActive ? accentColor : "var(--color-border-bright)",
                          background: isCompleted ? accentColor : isActive ? tint(accentColor, 8) : "transparent",
                          color: isCompleted ? "var(--color-on-accent)" : isActive ? accentColor : "var(--color-muted)",
                        }}
                      >
                        {isCompleted ? "✓" : idx + 1}
                      </span>
                      <span className="truncate">{sub.algorithmName ?? sub.title}</span>
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Content */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "var(--color-surface-elevated)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 1px 4px var(--color-shadow-1)",
            }}
          >
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
                  className="ltc-hover-prev min-h-11 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150"
                  style={{
                    background: "var(--color-surface-elevated)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-muted)",
                  }}
                >
                  ← Previous
                </button>
              ) : prevStep ? (
                <Link
                  href={prevStep.route}
                  className="inline-flex min-h-11 items-center rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150"
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
              {activeIdx < totalSubsteps - 1 ? (
                <button
                  onClick={() => goToSubstep(activeIdx + 1)}
                  className="min-h-11 rounded-xl px-4 py-2 text-sm font-semibold text-on-accent transition-all duration-150 hover:scale-[1.02] active:scale-[0.97]"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: "0 1px 3px var(--color-shadow-3)",
                  }}
                >
                  Next →
                </button>
              ) : nextStep ? (
                <Link
                  href={nextStep.route}
                  className="inline-flex min-h-11 items-center rounded-xl px-4 py-2 text-sm font-semibold text-on-accent transition-all duration-150 hover:scale-[1.02] active:scale-[0.97]"
                  style={{
                    backgroundColor: accentColor,
                    boxShadow: "0 1px 3px var(--color-shadow-3)",
                  }}
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
            className={`w-full rounded-xl py-3 text-sm font-bold transition-all duration-150 ${!isCompleted ? "ltc-hover-primary" : ""}`}
            style={
              isCompleted
                ? {
                    background: "color-mix(in srgb, var(--color-step-corners) 7%, transparent)",
                    color: "var(--color-step-corners)",
                    border: "2px solid color-mix(in srgb, var(--color-step-corners) 22%, transparent)",
                    cursor: "default",
                  }
                : {
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-on-accent)",
                    border: "2px solid transparent",
                    boxShadow: "0 1px 3px var(--color-shadow-3), 0 4px 16px color-mix(in srgb, var(--color-primary) 25%, transparent)",
                  }
            }
          >
            {isCompleted ? "✓ Step Completed" : "Mark as Complete"}
          </button>
        </div>
      </div>

      {/* Algorithm reference grid — OLL/PLL only */}
      {showAlgorithmGrid && (
        <div
          className="mt-12 pt-8"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <h2
            className="text-lg font-bold mb-1"
            style={{ color: "var(--color-text)" }}
          >
            All Cases
          </h2>
          <p className="text-sm mb-4" style={{ color: "var(--color-muted)" }}>
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
