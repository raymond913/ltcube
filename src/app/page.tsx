"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const HeroCube = dynamic(
  () => import("@/components/landing/HeroCube").then((m) => m.HeroCube),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: 320, height: 320 }} className="flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    ),
  }
);

const STEPS = [
  { label: "White Cross",  color: "#2563EB" },
  { label: "Corners",      color: "#15803D" },
  { label: "Second Layer", color: "#C2410C" },
  { label: "OLL",          color: "#B45309" },
  { label: "PLL",          color: "#7C3AED" },
];

export default function HomePage() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-16 relative"
      style={{
        backgroundColor: "var(--color-background)",
        backgroundImage: "radial-gradient(circle, oklch(87% 0.008 250) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* Centered content */}
      <div className="flex flex-col items-center gap-8 text-center max-w-lg w-full">

        {/* 3D Cube — the hero */}
        <div className="ltc-cube-float">
          <Suspense
            fallback={
              <div style={{ width: 320, height: 320 }} className="flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            }
          >
            <HeroCube size={320} />
          </Suspense>
        </div>

        {/* Headline + subhead */}
        <div className="flex flex-col gap-3">
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            Learn to solve<br />the Rubik&apos;s Cube
          </h1>
          <p
            className="text-base md:text-lg leading-relaxed max-w-sm mx-auto"
            style={{ color: "var(--color-muted)" }}
          >
            Interactive 3D tutorials. Step through every algorithm on a live cube. Beginner-friendly — done in an afternoon.
          </p>
        </div>

        {/* CTA + step pills */}
        <div className="flex flex-col items-center gap-5">
          <Link
            href="/learn"
            className="ltc-hover-primary inline-flex items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold text-white transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]"
            style={{
              backgroundColor: "#2563EB",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 4px 20px rgba(37,99,235,0.28)",
            }}
          >
            Start Learning →
          </Link>

          {/* 5-step roadmap pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {STEPS.map((step, i) => (
              <span
                key={step.label}
                className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1"
                style={{
                  color: step.color,
                  backgroundColor: `${step.color}10`,
                  border: `1px solid ${step.color}25`,
                }}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: step.color }}
                >
                  {i + 1}
                </span>
                {step.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <p
        className="absolute bottom-6 text-xs"
        style={{ color: "oklch(72% 0.008 250)" }}
      >
        Built by Ray
      </p>
    </div>
  );
}
