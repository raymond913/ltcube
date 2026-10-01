"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useProgressStore } from "@/stores/progressStore";
import { LESSON_COPY } from "@/lib/lessonCopy";
import { STEP_COLORS, tint } from "@/lib/theme";

const LEARN_STEPS = [
  { href: "/learn/cross",        label: LESSON_COPY["cross"].name,        stepNumber: 1, id: "cross" },
  { href: "/learn/corners",      label: LESSON_COPY["corners"].name,      stepNumber: 2, id: "corners" },
  { href: "/learn/second-layer", label: LESSON_COPY["second-layer"].name, stepNumber: 3, id: "second-layer" },
  { href: "/learn/oll",          label: LESSON_COPY["two-look-oll"].name, stepNumber: 4, id: "two-look-oll" },
  { href: "/learn/pll",          label: LESSON_COPY["two-look-pll"].name, stepNumber: 5, id: "two-look-pll" },
].map((step) => ({ ...step, color: STEP_COLORS[step.id] }));

const NAV_ITEMS = [
  { href: "/trainer",   label: "Trainer" },
  { href: "/reference", label: "Reference" },
  { href: "/progress",  label: "Progress" },
];

function CubeIcon() {
  return (
    <svg viewBox="0 0 28 28" width="22" height="22" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <rect x="1"  y="1"  width="8" height="8" rx="2" fill="var(--color-cube-red)" />
      <rect x="10" y="1"  width="8" height="8" rx="2" fill="var(--color-cube-yellow)" />
      <rect x="19" y="1"  width="8" height="8" rx="2" fill="var(--color-primary)" />
      <rect x="1"  y="10" width="8" height="8" rx="2" fill="var(--color-cube-orange)" />
      <rect x="10" y="10" width="8" height="8" rx="2" fill="var(--color-sticker-gray)" opacity="0.9" />
      <rect x="19" y="10" width="8" height="8" rx="2" fill="var(--color-cube-green)" />
      <rect x="1"  y="19" width="8" height="8" rx="2" fill="var(--color-primary)" />
      <rect x="10" y="19" width="8" height="8" rx="2" fill="var(--color-cube-green)" />
      <rect x="19" y="19" width="8" height="8" rx="2" fill="var(--color-cube-red)" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [learnOpen, setLearnOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const learnRef = useRef<HTMLDivElement>(null);
  const learnButtonRef = useRef<HTMLButtonElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
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
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (learnOpen) {
        setLearnOpen(false);
        learnButtonRef.current?.focus();
      }
      if (mobileOpen) {
        setMobileOpen(false);
        hamburgerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [learnOpen, mobileOpen]);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setLearnOpen(false);
    setMobileOpen(false);
  }

  const nextStep = LEARN_STEPS.find((s) => !completedSteps.includes(s.id));

  return (
    <>
      {/* ── Fixed top bar ── */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center h-14 px-5 gap-2 bg-surface-elevated border-b border-border">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 mr-4 flex-shrink-0 min-h-11 rounded-lg"
        >
          <CubeIcon />
          <span
            className="font-display text-base font-bold tracking-tight"
            style={{ color: "var(--color-text)", letterSpacing: "-0.03em" }}
          >
            LTCube
          </span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav aria-label="Main" className="hidden md:flex items-center gap-0.5 flex-1">
          {/* Learn dropdown trigger */}
          <div ref={learnRef} className="relative">
            <button
              onClick={() => setLearnOpen((o) => !o)}
              ref={learnButtonRef}
              aria-expanded={learnOpen}
              aria-controls="learn-menu"
              className="flex min-h-11 items-center gap-1.5 px-3 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface active:bg-border-subtle"
              style={{
                color: learnActive || learnOpen ? "var(--color-primary)" : "var(--color-muted)",
                background: learnActive || learnOpen ? "var(--color-primary-light)" : undefined,
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
                id="learn-menu"
                className="ltc-dropdown-in absolute top-full left-0 mt-2 w-[300px] rounded-2xl overflow-hidden bg-surface-elevated border border-border"
                style={{ boxShadow: "0 8px 24px var(--color-shadow-3)" }}
              >
                {/* Header row */}
                <div
                  className="flex items-center justify-between pl-4 pr-2"
                  style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
                >
                  <span className="text-sm font-semibold" style={{ color: "var(--color-muted)" }}>
                    Five steps
                  </span>
                  <Link
                    href="/learn"
                    className="flex min-h-11 items-center gap-1 px-2 text-sm font-semibold transition-colors duration-150 hover:text-[var(--color-primary-hover)]"
                    style={{ color: "var(--color-primary)" }}
                  >
                    Overview
                    <span aria-hidden="true">→</span>
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
                        aria-current={isActive ? "page" : undefined}
                        className="flex min-h-11 items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-150 hover:bg-surface active:bg-border-subtle"
                        style={{
                          background: isActive ? tint(step.color, 6) : undefined,
                        }}
                      >
                        {/* Step circle */}
                        <span
                          aria-hidden="true"
                          className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                          style={{
                            background: isDone ? step.color : tint(step.color, 9),
                            color: isDone ? "var(--color-on-accent)" : step.color,
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
                            {isDone && <span className="sr-only">, completed</span>}
                          </span>
                        </span>

                        {isNext && (
                          <span
                            className="text-sm font-semibold flex-shrink-0"
                            style={{ color: "var(--color-muted)" }}
                          >
                            Up next
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
                    <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                      {completedCount === 0 ? "Not started" : `${completedCount} of 5 done`}
                    </span>
                  </div>
                  <div aria-hidden="true" className="flex gap-1.5">
                    {LEARN_STEPS.map((s) => (
                      <div
                        key={s.id}
                        className="flex-1 h-1.5 rounded-full"
                        style={{
                          background: completedSteps.includes(s.id) ? "var(--color-text)" : "var(--color-border-subtle)",
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
                className="inline-flex min-h-11 items-center px-3 rounded-lg text-sm font-medium transition-colors duration-150 hover:bg-surface active:bg-border-subtle"
                style={{
                  color: isActive ? "var(--color-primary)" : "var(--color-muted)",
                  background: isActive ? "var(--color-primary-light)" : undefined,
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
              className="flex min-h-11 items-center gap-2 px-3 rounded-full border border-border transition-colors duration-150 hover:bg-surface active:bg-border-subtle"
            >
              <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                {completedCount} of 5 done
              </span>
            </Link>
          )}
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          ref={hamburgerRef}
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          className="md:hidden ml-auto flex items-center justify-center w-11 h-11 rounded-xl transition-colors duration-150 active:bg-border-subtle"
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
          id="mobile-menu"
          role="navigation"
          aria-label="Main"
          className="ltc-dropdown-in md:hidden fixed top-14 left-0 right-0 z-20 overflow-y-auto bg-surface-elevated border-b border-border"
          style={{
            boxShadow: "0 8px 24px var(--color-shadow-3)",
            maxHeight: "calc(100vh - 56px)",
          }}
        >
          <div className="p-3 flex flex-col gap-0.5">
            {/* Learn section */}
            <div className="pl-3 flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: "var(--color-muted)" }}>
                Learn
              </span>
              <Link
                href="/learn"
                className="inline-flex min-h-11 items-center px-3 text-sm font-semibold"
                style={{ color: "var(--color-primary)" }}
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
                        aria-current={isActive ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-150 active:bg-border-subtle"
                  style={{ background: isActive ? tint(step.color, 6) : undefined }}
                >
                  <span
                    aria-hidden="true"
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{
                      background: isDone ? step.color : tint(step.color, 9),
                      color: isDone ? "var(--color-on-accent)" : step.color,
                    }}
                  >
                    {isDone ? "✓" : step.stepNumber}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-semibold" style={{ color: isActive ? step.color : "var(--color-text)" }}>
                      {step.label}
                            {isDone && <span className="sr-only">, completed</span>}
                    </span>
                  </span>
                  {isNext && (
                    <span className="text-sm font-semibold" style={{ color: "var(--color-muted)" }}>
                      Up next
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
                  className="flex min-h-11 items-center px-3 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 active:bg-border-subtle"
                  style={{
                    color: isActive ? "var(--color-primary)" : "var(--color-muted)",
                    background: isActive ? "var(--color-primary-light)" : undefined,
                  }}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Progress strip (mobile) */}
            <div className="mt-2 mb-1 px-3 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {completedCount === 0 ? "Not started" : `${completedCount} of 5 done`}
                </span>
              </div>
              <div aria-hidden="true" className="flex gap-1.5">
                {LEARN_STEPS.map((s) => (
                  <div
                    key={s.id}
                    className="flex-1 h-1.5 rounded-full"
                    style={{
                      background: completedSteps.includes(s.id) ? "var(--color-text)" : "var(--color-border-subtle)",
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
