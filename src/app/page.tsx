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
        <div className="w-8 h-8 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
      </div>
    ),
  }
);

const STEPS = [
  { label: "White Cross",   color: "#2563EB", num: 1 },
  { label: "Corners",       color: "#15803D", num: 2 },
  { label: "Second Layer",  color: "#C2410C", num: 3 },
  { label: "OLL",           color: "#B45309", num: 4 },
  { label: "PLL",           color: "#7C3AED", num: 5 },
];

export default function HomePage() {
  return (
    <div
      className="min-h-screen w-full flex flex-col relative overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 80% 60% at 15% -5%, rgba(37,99,235,0.10) 0%, transparent 65%),
          radial-gradient(ellipse 60% 50% at 90% 110%, rgba(124,58,237,0.07) 0%, transparent 65%),
          radial-gradient(ellipse 40% 30% at 50% 50%, rgba(234,179,8,0.025) 0%, transparent 70%),
          var(--color-background)
        `,
      }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, oklch(82% 0.010 250) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          opacity: 0.55,
        }}
      />

      {/* Main content — vertically centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 relative z-10">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* LEFT: Text content */}
            <div className="flex flex-col gap-7 text-center lg:text-left lg:flex-1 ltc-page">
              {/* Eyebrow */}
              <div className="flex justify-center lg:justify-start">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest"
                  style={{
                    color: "#2563EB",
                    background: "rgba(37,99,235,0.08)",
                    border: "1px solid rgba(37,99,235,0.18)",
                    letterSpacing: "0.12em",
                  }}
                >
                  <span style={{ fontSize: "8px" }}>●</span>
                  Beginner Method
                </span>
              </div>

              {/* Headline */}
              <div className="flex flex-col gap-3">
                <h1
                  className="font-display text-5xl md:text-6xl lg:text-[64px] font-bold leading-[1.05] tracking-tight"
                  style={{ color: "var(--color-text)", letterSpacing: "-0.03em" }}
                >
                  Learn to solve<br />
                  <span className="ltc-gradient-text">the Rubik&apos;s Cube</span>
                </h1>
                <p
                  className="text-base md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0"
                  style={{ color: "var(--color-muted)" }}
                >
                  Step through every algorithm on a live 3D cube.
                  Beginner-friendly — done in an afternoon.
                </p>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3 justify-center lg:justify-start">
                <Link
                  href="/learn"
                  className="ltc-hover-primary inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold text-white transition-all duration-150 hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.12), 0 6px 24px rgba(37,99,235,0.32), inset 0 1px 0 rgba(255,255,255,0.12)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Start Learning
                  <span style={{ opacity: 0.85 }}>→</span>
                </Link>
                <Link
                  href="/reference"
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition-all duration-150 hover:opacity-80"
                  style={{
                    color: "var(--color-muted)",
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid var(--color-border)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  Algorithm Reference
                </Link>
              </div>

              {/* 5-step roadmap */}
              <div className="flex flex-col gap-2.5">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-dim)", letterSpacing: "0.10em" }}>
                  5-step method
                </p>
                <div className="flex items-center gap-1 flex-wrap justify-center lg:justify-start">
                  {STEPS.map((step, i) => (
                    <div key={step.label} className="flex items-center gap-1">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-all duration-150 hover:opacity-80"
                        style={{
                          color: step.color,
                          background: `${step.color}0e`,
                          border: `1px solid ${step.color}28`,
                        }}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0"
                          style={{ background: step.color }}
                        >
                          {step.num}
                        </span>
                        {step.label}
                      </span>
                      {i < STEPS.length - 1 && (
                        <span style={{ color: "var(--color-border-bright)", fontSize: "10px" }}>→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: 3D Cube */}
            <div className="flex-shrink-0 lg:flex-shrink relative">
              {/* Glow behind cube */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(37,99,235,0.12) 0%, transparent 70%)",
                  filter: "blur(20px)",
                  transform: "scale(1.2)",
                }}
              />
              <div className="relative ltc-cube-float">
                <Suspense
                  fallback={
                    <div style={{ width: 300, height: 300 }} className="flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                  }
                >
                  <HeroCube size={300} />
                </Suspense>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pb-6 flex justify-center">
        <p className="text-xs" style={{ color: "var(--color-dim)" }}>
          Built by Ray
        </p>
      </div>
    </div>
  );
}
