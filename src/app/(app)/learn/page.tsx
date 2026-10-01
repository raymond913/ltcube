"use client";

import Link from "next/link";
import { useProgressStore } from "@/stores/progressStore";
import { BEGINNER_STEPS } from "@/data/beginner";
import { LESSON_COPY } from "@/lib/lessonCopy";

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3.5l4.5 4.5L6 12.5" />
    </svg>
  );
}

export default function LearnPage() {
  const { completedSteps } = useProgressStore();
  const total = BEGINNER_STEPS.length;
  const completedCount = BEGINNER_STEPS.filter((s) => completedSteps.includes(s.id)).length;
  const nextId = BEGINNER_STEPS.find((s) => !completedSteps.includes(s.id))?.id;

  return (
    <div className="ltc-page mx-auto flex max-w-2xl flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold text-text">Five steps to a solved cube</h1>
        <p className="max-w-[34rem] text-pretty text-base leading-relaxed text-muted">
          Go in order. Each lesson builds on the one before. Your progress saves on this device.
        </p>
      </header>

      <section aria-label="Your progress" className="flex flex-col gap-3">
        <p className="text-base text-text">
          <span className="font-semibold">{completedCount} of {total}</span> lessons done
        </p>
        <div
          role="progressbar"
          aria-label="Lessons done"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={completedCount}
          className="flex gap-2"
        >
          {BEGINNER_STEPS.map((step) => (
            <span
              key={step.id}
              className={`h-2 flex-1 rounded-full ${completedSteps.includes(step.id) ? "bg-text" : "bg-border-subtle"}`}
            />
          ))}
        </div>
        {completedCount === total && (
          <>
            <p className="text-base text-text">You finished every lesson. You can solve the cube!</p>
            <Link
              href="/trainer"
              className="inline-flex min-h-11 items-center self-start text-base font-semibold text-primary underline-offset-4 hover:text-primary-hover hover:underline"
            >
              Practice in the trainer
            </Link>
          </>
        )}
      </section>

      <ol className="flex flex-col divide-y divide-border">
        {BEGINNER_STEPS.map((step) => {
          const copy = LESSON_COPY[step.id];
          const isDone = completedSteps.includes(step.id);
          const isNext = step.id === nextId;

          return (
            <li key={step.id}>
              <Link
                href={step.route}
                className="group -mx-3 flex items-center gap-4 rounded-xl px-3 py-4 transition-colors duration-150 hover:bg-surface active:bg-border-subtle"
              >
                <span
                  aria-hidden="true"
                  className={`flex size-10 shrink-0 items-center justify-center rounded-full text-base font-semibold ${
                    isDone ? "bg-text text-on-accent" : "border border-border-bright text-text"
                  }`}
                >
                  {isDone ? <CheckIcon /> : step.stepNumber}
                </span>

                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex flex-wrap items-baseline gap-x-3">
                    <span className="text-base font-semibold text-text">
                      <span className="sr-only">Lesson {step.stepNumber}: </span>
                      {copy.name}
                    </span>
                    <span className="text-sm text-muted">
                      {isDone ? "Done" : `${step.estimatedMinutes} min`}
                    </span>
                  </span>
                  <span className="text-sm leading-relaxed text-muted">{copy.summary}</span>
                </span>

                {isNext ? (
                  <span className="shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-accent transition-colors duration-150 group-hover:bg-primary-hover">
                    {completedCount === 0 ? "Start" : "Continue"}
                  </span>
                ) : (
                  <span className="shrink-0 text-muted">
                    <ChevronIcon />
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
