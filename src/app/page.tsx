"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { BEGINNER_STEPS } from "@/data/beginner";
import { LESSON_COPY } from "@/lib/lessonCopy";

const CUBE_SIZE = 300;

function CubePlaceholder() {
  return (
    <div
      role="status"
      style={{ width: CUBE_SIZE, height: CUBE_SIZE }}
      className="flex max-w-full items-center justify-center rounded-3xl border border-border bg-surface"
    >
      <p className="animate-pulse text-sm text-muted">Loading the 3D cube…</p>
    </div>
  );
}

const HeroCube = dynamic(
  () => import("@/components/landing/HeroCube").then((m) => m.HeroCube),
  { ssr: false, loading: () => <CubePlaceholder /> }
);

export default function HomePage() {
  const totalMinutes = BEGINNER_STEPS.reduce((sum, s) => sum + s.estimatedMinutes, 0);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <main className="flex flex-1 items-center px-6 py-12 lg:py-16">
        <div className="mx-auto grid w-full max-w-5xl gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="ltc-page flex flex-col gap-6 lg:col-start-1 lg:row-start-1">
            <p className="text-sm font-semibold text-muted">LTCube</p>
            <h1 className="font-display text-balance text-4xl font-bold leading-[1.1] tracking-tight text-text lg:text-[56px]">
              Solve your Rubik&apos;s Cube, one step at a time.
            </h1>
            <p className="max-w-[30rem] text-xl leading-relaxed text-muted">
              Watch each move on a 3D cube you can rotate and replay. No experience needed.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
              <Link
                href="/learn"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-on-accent transition-colors duration-150 hover:bg-primary-hover active:scale-[0.98] active:bg-primary-hover sm:w-auto"
              >
                Start learning
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
              <Link
                href="/reference"
                className="inline-flex min-h-11 items-center text-base font-semibold text-muted underline-offset-4 transition-colors duration-150 hover:text-text hover:underline"
              >
                Move reference
              </Link>
            </div>
          </div>

          <div className="flex justify-center overflow-hidden lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <HeroCube size={CUBE_SIZE} />
          </div>

          <section aria-labelledby="steps-heading" className="ltc-page lg:col-start-1 lg:row-start-2">
            <h2 id="steps-heading" className="text-xl font-semibold text-text">
              What you&apos;ll learn
            </h2>
            <ol className="mt-3 flex max-w-xs flex-col gap-1">
              {BEGINNER_STEPS.map((step) => (
                <li key={step.id} className="flex items-baseline gap-3 text-base text-text">
                  <span className="w-4 font-semibold tabular-nums text-muted">{step.stepNumber}</span>
                  <span>{LESSON_COPY[step.id].name}</span>
                  <span className="ml-auto text-sm text-muted">{step.estimatedMinutes} min</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-muted">
              About {totalMinutes} minutes in all. Go at your own pace.
            </p>
          </section>
        </div>
      </main>

      <footer className="px-6 pb-6">
        <p className="mx-auto max-w-5xl text-sm text-muted">Built by Ray</p>
      </footer>
    </div>
  );
}
