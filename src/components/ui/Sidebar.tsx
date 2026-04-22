"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useProgressStore } from "@/stores/progressStore";

const LEARN_STEPS = [
  { href: "/learn/cross",        label: "White Cross",         stepNumber: 1, color: "#2563EB", id: "cross",        minutes: 15 },
  { href: "/learn/corners",      label: "First Layer Corners", stepNumber: 2, color: "#15803D", id: "corners",      minutes: 20 },
  { href: "/learn/second-layer", label: "Second Layer",        stepNumber: 3, color: "#C2410C", id: "second-layer", minutes: 20 },
  { href: "/learn/oll",          label: "OLL",                 stepNumber: 4, color: "#B45309", id: "two-look-oll", minutes: 25 },
  { href: "/learn/pll",          label: "PLL",                 stepNumber: 5, color: "#7C3AED", id: "two-look-pll", minutes: 20 },
];

const NAV_ITEMS = [
  { href: "/trainer",   label: "Trainer"   },
  { href: "/reference", label: "Reference" },
  { href: "/progress",  label: "Progress"  },
];

function CubeIcon() {
  return (
    <svg viewBox="0 0 28 28" width="24" height="24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="1"  y="1"  width="8" height="8" rx="1.5" fill="#DC2626" />
      <rect x="10" y="1"  width="8" height="8" rx="1.5" fill="#EAB308" />
      <rect x="19" y="1"  width="8" height="8" rx="1.5" fill="#2563EB" />
      <rect x="1"  y="10" width="8" height="8" rx="1.5" fill="#EA580C" />
      <rect x="10" y="10" width="8" height="8" rx="1.5" fill="#D1D5DB" opacity="0.9" />
      <rect x="19" y="10" width="8" height="8" rx="1.5" fill="#16A34A" />
      <rect x="1"  y="19" width="8" height="8" rx="1.5" fill="#2563EB" />
      <rect x="10" y="19" width="8" height="8" rx="1.5" fill="#16A34A" />
      <rect x="19" y="19" width="8" height="8" rx="1.5" fill="#DC2626" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [learnOpen, setLearnOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const learnRef = useRef<HTMLDivElement>(null);
  const { completedSteps } = useProgressStore();

  const learnActive = pathname.startsWith("/learn");
  const completedCount = LEARN_STEPS.filter((s) => completedSteps.includes(s.id)).length;

  // Close learn dropdown on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (learnRef.current && !learnRef.current.contains(e.target as Node)) {
        setLearnOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Close everything on route change
  useEffect(() => {
    setLearnOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Find next uncompleted step for "Continue" hint
  const nextStep = LEARN_STEPS.find((s) => !completedSteps.includes(s.id));

  return (
    <>
      {/* ── Fixed top bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-30 flex items-center h-14 px-4 gap-2"
        style={{
          background: "var(--color-surface-elevated)",
          borderBottom: "1px solid var(--color-border)",
          boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 mr-3 flex-shrink-0 transition-opacity duration-150 hover:opacity-80"
        >
          <div
            className="flex-shrink-0 rounded-lg p-0.5"
            style={{
              background: "var(--color-primary-light)",
              border: "1px solid var(--color-primary-light-border)",
            }}
          >
            <CubeIcon />
          </div>
          <span
            className="font-display text-base font-bold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            LTCube
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {/* Learn dropdown trigger */}
          <div ref={learnRef} className="relative">
            <button
              onClick={() => setLearnOpen((o) => !o)}
              aria-expanded={learnOpen}
              aria-haspopup="true"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={{
                color: learnActive || learnOpen ? "#2563EB" : "oklch(40% 0.012 250)",
                background: learnActive || learnOpen ? "var(--color-primary-light)" : "transparent",
              }}
            >
              Learn
              <svg
                width="11" height="11" viewBox="0 0 11 11" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                className="transition-transform duration-200"
                style={{ transform: learnOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <path d="M2 3.5l3.5 3.5 3.5-3.5" />
              </svg>
            </button>

            {/* Dropdown panel */}
            {learnOpen && (
              <div
                className="absolute top-full left-0 mt-1.5 w-72 rounded-2xl overflow-hidden"
                style={{
                  background: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                {/* Header row */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                >
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(58% 0.01 250)" }}>
                    5-Step Method
                  </span>
                  <Link
                    href="/learn"
                    className="text-xs font-semibold transition-opacity hover:opacity-70"
                    style={{ color: "#2563EB" }}
                  >
                    Overview →
                  </Link>
                </div>

                {/* Step list */}
                <div className="p-2">
                  {LEARN_STEPS.map((step) => {
                    const isActive = pathname === step.href || pathname.startsWith(step.href + "/");
                    const isDone = completedSteps.includes(step.id);
                    const isNext = !isDone && nextStep?.id === step.id;
                    return (
                      <Link
                        key={step.href}
                        href={step.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 hover:opacity-85"
                        style={{
                          background: isActive ? `${step.color}10` : "transparent",
                        }}
                      >
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-150"
                          style={{
                            background: isDone ? step.color : `${step.color}15`,
                            color: isDone ? "#fff" : step.color,
                          }}
                        >
                          {isDone ? "✓" : step.stepNumber}
                        </span>

                        <span className="flex-1 min-w-0">
                          <span
                            className="block text-sm font-medium leading-tight"
                            style={{ color: isActive ? step.color : "var(--color-text)" }}
                          >
                            {step.label}
                          </span>
                          <span className="text-xs" style={{ color: "oklch(65% 0.008 250)" }}>
                            ~{step.minutes} min
                          </span>
                        </span>

                        {isNext && (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{
                              color: step.color,
                              background: `${step.color}12`,
                              border: `1px solid ${step.color}30`,
                            }}
                          >
                            Next
                          </span>
                        )}
                        {isDone && (
                          <span className="text-xs flex-shrink-0" style={{ color: "oklch(72% 0.008 250)" }}>
                            Done
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Footer: progress bar */}
                {completedCount > 0 && (
                  <div
                    className="px-4 pb-3 pt-1"
                    style={{ borderTop: "1px solid var(--color-border-subtle)" }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs" style={{ color: "oklch(60% 0.01 250)" }}>Progress</span>
                      <span className="text-xs font-semibold" style={{ color: "#2563EB" }}>
                        {completedCount}/5 steps
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {LEARN_STEPS.map((s) => (
                        <div
                          key={s.id}
                          className="flex-1 h-1.5 rounded-full transition-colors duration-300"
                          style={{ background: completedSteps.includes(s.id) ? s.color : "var(--color-border-subtle)" }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Other nav links */}
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  color: isActive ? "#2563EB" : "oklch(40% 0.012 250)",
                  background: isActive ? "var(--color-primary-light)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Progress badge (desktop, right side) */}
        {completedCount > 0 && (
          <Link
            href="/progress"
            className="hidden md:flex items-center gap-1.5 ml-auto flex-shrink-0 px-2.5 py-1 rounded-full transition-opacity hover:opacity-75"
            style={{
              background: "var(--color-primary-light)",
              border: "1px solid var(--color-primary-light-border)",
            }}
          >
            <span className="text-xs font-semibold" style={{ color: "#2563EB" }}>
              {completedCount}/5
            </span>
            <div className="flex gap-0.5">
              {LEARN_STEPS.map((s) => (
                <div
                  key={s.id}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: completedSteps.includes(s.id) ? s.color : "oklch(84% 0.01 250)" }}
                />
              ))}
            </div>
          </Link>
        )}

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          className="md:hidden ml-auto flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150"
          style={{
            color: "var(--color-muted)",
            border: "1px solid var(--color-border)",
            background: mobileOpen ? "var(--color-surface)" : "transparent",
          }}
        >
          {mobileOpen ? (
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 4h12M2 8h12M2 12h12" />
            </svg>
          )}
        </button>
      </header>

      {/* ── Mobile menu panel ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed top-14 left-0 right-0 z-20 overflow-y-auto"
          style={{
            background: "var(--color-surface-elevated)",
            borderBottom: "1px solid var(--color-border)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            maxHeight: "calc(100vh - 56px)",
          }}
        >
          <div className="p-3 flex flex-col gap-0.5">
            {/* Learn section header */}
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "oklch(58% 0.01 250)" }}>
                Learn
              </span>
              <Link
                href="/learn"
                className="text-xs font-semibold"
                style={{ color: "#2563EB" }}
                onClick={() => setMobileOpen(false)}
              >
                Overview →
              </Link>
            </div>

            {/* Learn steps */}
            {LEARN_STEPS.map((step) => {
              const isActive = pathname === step.href || pathname.startsWith(step.href + "/");
              const isDone = completedSteps.includes(step.id);
              const isNext = !isDone && nextStep?.id === step.id;
              return (
                <Link
                  key={step.href}
                  href={step.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150"
                  style={{ background: isActive ? `${step.color}10` : "transparent" }}
                >
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: isDone ? step.color : `${step.color}15`, color: isDone ? "#fff" : step.color }}
                  >
                    {isDone ? "✓" : step.stepNumber}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium" style={{ color: isActive ? step.color : "var(--color-text)" }}>
                      {step.label}
                    </span>
                    <span className="text-xs" style={{ color: "oklch(65% 0.008 250)" }}>~{step.minutes} min</span>
                  </span>
                  {isNext && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: step.color, background: `${step.color}12`, border: `1px solid ${step.color}30` }}>
                      Next
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="mx-3 my-2 h-px" style={{ background: "var(--color-border)" }} />

            {/* Other nav items */}
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150"
                  style={{
                    color: isActive ? "#2563EB" : "oklch(40% 0.012 250)",
                    background: isActive ? "var(--color-primary-light)" : "transparent",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Progress summary (mobile) */}
            {completedCount > 0 && (
              <div
                className="mx-3 mt-2 mb-1 px-3 py-2.5 rounded-xl flex items-center gap-3"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
              >
                <div className="flex gap-1 flex-1">
                  {LEARN_STEPS.map((s) => (
                    <div
                      key={s.id}
                      className="flex-1 h-1.5 rounded-full transition-colors duration-300"
                      style={{ background: completedSteps.includes(s.id) ? s.color : "var(--color-border-subtle)" }}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold flex-shrink-0" style={{ color: "#2563EB" }}>
                  {completedCount}/5 steps
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Spacer so content doesn't hide under the fixed nav */}
      <div className="h-14 w-full flex-shrink-0" />
    </>
  );
}
