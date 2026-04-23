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
  { href: "/trainer",   label: "Trainer",   icon: "◈" },
  { href: "/reference", label: "Reference", icon: "⊞" },
  { href: "/progress",  label: "Progress",  icon: "◉" },
];

function CubeIcon() {
  return (
    <svg viewBox="0 0 28 28" width="22" height="22" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="1"  y="1"  width="8" height="8" rx="2" fill="#DC2626" />
      <rect x="10" y="1"  width="8" height="8" rx="2" fill="#EAB308" />
      <rect x="19" y="1"  width="8" height="8" rx="2" fill="#2563EB" />
      <rect x="1"  y="10" width="8" height="8" rx="2" fill="#EA580C" />
      <rect x="10" y="10" width="8" height="8" rx="2" fill="#D1D5DB" opacity="0.9" />
      <rect x="19" y="10" width="8" height="8" rx="2" fill="#16A34A" />
      <rect x="1"  y="19" width="8" height="8" rx="2" fill="#2563EB" />
      <rect x="10" y="19" width="8" height="8" rx="2" fill="#16A34A" />
      <rect x="19" y="19" width="8" height="8" rx="2" fill="#DC2626" />
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

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (learnRef.current && !learnRef.current.contains(e.target as Node)) {
        setLearnOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    setLearnOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const nextStep = LEARN_STEPS.find((s) => !completedSteps.includes(s.id));

  return (
    <>
      {/* ── Fixed top bar ── */}
      <header
        className="ltc-glass fixed top-0 left-0 right-0 z-30 flex items-center h-14 px-5 gap-2"
        style={{
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.8), 0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 mr-4 flex-shrink-0 group"
        >
          <div
            className="flex-shrink-0 rounded-lg p-1 transition-transform duration-200 group-hover:scale-105"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.08) 100%)",
              border: "1px solid rgba(37,99,235,0.2)",
            }}
          >
            <CubeIcon />
          </div>
          <span
            className="font-display text-[15px] font-bold tracking-tight"
            style={{ color: "var(--color-text)", letterSpacing: "-0.03em" }}
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
                color: learnActive || learnOpen ? "#2563EB" : "var(--color-muted)",
                background: learnActive || learnOpen ? "var(--color-primary-light)" : "transparent",
              }}
            >
              Learn
              <svg
                width="10" height="10" viewBox="0 0 10 10" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                className="transition-transform duration-200"
                style={{ transform: learnOpen ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.7 }}
              >
                <path d="M2 3.5l3 3 3-3" />
              </svg>
            </button>

            {/* Dropdown panel */}
            {learnOpen && (
              <div
                className="ltc-dropdown-in absolute top-full left-0 mt-2 w-[300px] rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.97)",
                  border: "1px solid var(--color-border)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.5)",
                  backdropFilter: "blur(16px)",
                }}
              >
                {/* Header row */}
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                >
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: "var(--color-dim)" }}
                  >
                    5-Step Method
                  </span>
                  <Link
                    href="/learn"
                    className="text-xs font-semibold transition-opacity hover:opacity-70 flex items-center gap-1"
                    style={{ color: "#2563EB" }}
                  >
                    Overview
                    <span style={{ opacity: 0.7 }}>→</span>
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
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                        style={{
                          background: isActive ? `${step.color}0f` : "transparent",
                        }}
                        onMouseEnter={e => {
                          if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--color-surface)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = isActive ? `${step.color}0f` : "transparent";
                        }}
                      >
                        {/* Step circle */}
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-150"
                          style={{
                            background: isDone
                              ? `linear-gradient(135deg, ${step.color} 0%, ${step.color}cc 100%)`
                              : `${step.color}18`,
                            color: isDone ? "#fff" : step.color,
                            boxShadow: isDone ? `0 2px 8px ${step.color}40` : "none",
                          }}
                        >
                          {isDone ? "✓" : step.stepNumber}
                        </span>

                        <span className="flex-1 min-w-0">
                          <span
                            className="block text-sm font-semibold leading-tight"
                            style={{ color: isActive ? step.color : "var(--color-text)" }}
                          >
                            {step.label}
                          </span>
                          <span className="text-xs" style={{ color: "var(--color-dim)" }}>
                            ~{step.minutes} min
                          </span>
                        </span>

                        {isNext && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{
                              color: step.color,
                              background: `${step.color}14`,
                              border: `1px solid ${step.color}30`,
                              letterSpacing: "0.04em",
                            }}
                          >
                            UP NEXT
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Footer progress */}
                <div
                  className="px-4 py-3"
                  style={{ borderTop: "1px solid var(--color-border-subtle)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium" style={{ color: "var(--color-dim)" }}>
                      {completedCount === 0 ? "Not started" : `${completedCount} of 5 complete`}
                    </span>
                    {completedCount > 0 && (
                      <span className="text-xs font-bold" style={{ color: "#2563EB" }}>
                        {Math.round((completedCount / 5) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {LEARN_STEPS.map((s) => (
                      <div
                        key={s.id}
                        className="flex-1 h-1.5 rounded-full transition-all duration-500"
                        style={{
                          background: completedSteps.includes(s.id) ? s.color : "var(--color-border-subtle)",
                          boxShadow: completedSteps.includes(s.id) ? `0 0 6px ${s.color}50` : "none",
                        }}
                      />
                    ))}
                  </div>
                </div>
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
                  color: isActive ? "#2563EB" : "var(--color-muted)",
                  background: isActive ? "var(--color-primary-light)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Progress badge (desktop, right side) */}
        <div className="hidden md:flex items-center gap-2 ml-auto flex-shrink-0">
          {completedCount > 0 && (
            <Link
              href="/progress"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-150 hover:opacity-80"
              style={{
                background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.06) 100%)",
                border: "1px solid rgba(37,99,235,0.18)",
              }}
            >
              <span className="text-xs font-bold" style={{ color: "#2563EB" }}>
                {completedCount}/5
              </span>
              <div className="flex gap-0.5">
                {LEARN_STEPS.map((s) => (
                  <div
                    key={s.id}
                    className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      background: completedSteps.includes(s.id) ? s.color : "oklch(84% 0.01 250)",
                      boxShadow: completedSteps.includes(s.id) ? `0 0 4px ${s.color}70` : "none",
                    }}
                  />
                ))}
              </div>
            </Link>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          className="md:hidden ml-auto flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150"
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
          className="ltc-dropdown-in md:hidden fixed top-14 left-0 right-0 z-20 overflow-y-auto"
          style={{
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--color-border)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            maxHeight: "calc(100vh - 56px)",
          }}
        >
          <div className="p-3 flex flex-col gap-0.5">
            {/* Learn section */}
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--color-dim)" }}>
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
                  style={{ background: isActive ? `${step.color}0f` : "transparent" }}
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: isDone
                        ? `linear-gradient(135deg, ${step.color} 0%, ${step.color}cc 100%)`
                        : `${step.color}18`,
                      color: isDone ? "#fff" : step.color,
                      boxShadow: isDone ? `0 2px 8px ${step.color}40` : "none",
                    }}
                  >
                    {isDone ? "✓" : step.stepNumber}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold" style={{ color: isActive ? step.color : "var(--color-text)" }}>
                      {step.label}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-dim)" }}>~{step.minutes} min</span>
                  </span>
                  {isNext && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: step.color, background: `${step.color}14`, border: `1px solid ${step.color}30` }}
                    >
                      UP NEXT
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="mx-3 my-2 h-px" style={{ background: "var(--color-border)" }} />

            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
                  style={{
                    color: isActive ? "#2563EB" : "var(--color-muted)",
                    background: isActive ? "var(--color-primary-light)" : "transparent",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Progress strip (mobile) */}
            <div
              className="mx-3 mt-2 mb-1 px-4 py-3 rounded-xl"
              style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: "var(--color-dim)" }}>
                  {completedCount === 0 ? "Start your journey" : `${completedCount} of 5 steps complete`}
                </span>
                {completedCount > 0 && (
                  <span className="text-xs font-bold" style={{ color: "#2563EB" }}>
                    {Math.round((completedCount / 5) * 100)}%
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                {LEARN_STEPS.map((s) => (
                  <div
                    key={s.id}
                    className="flex-1 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      background: completedSteps.includes(s.id) ? s.color : "var(--color-border-subtle)",
                      boxShadow: completedSteps.includes(s.id) ? `0 0 6px ${s.color}50` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-14 w-full flex-shrink-0" />
    </>
  );
}
