"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LEARN_STEPS = [
  { href: "/learn/white-cross",  label: "White Cross",         color: "#2563EB" },
  { href: "/learn/corners",      label: "First Layer Corners", color: "#15803D" },
  { href: "/learn/second-layer", label: "Second Layer",        color: "#C2410C" },
  { href: "/learn/oll",          label: "OLL",                 color: "#B45309" },
  { href: "/learn/pll",          label: "PLL",                 color: "#7C3AED" },
];

function CubeIcon() {
  return (
    <svg viewBox="0 0 28 28" width="26" height="26" xmlns="http://www.w3.org/2000/svg" aria-hidden>
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

function IconLearn() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.5h5.5m-5.5 3h8m-8 3h6" />
      <rect x="10" y="2" width="4" height="12" rx="1" />
    </svg>
  );
}

function IconTrainer() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 2L3 9h5l-2 5 6.5-7.5H7.5L8.5 2z" />
    </svg>
  );
}

function IconReference() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="1.5" width="11" height="13" rx="1.5" />
      <path d="M5 5.5h6M5 8h6M5 10.5h4" />
    </svg>
  );
}

function IconProgress() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor">
      <rect x="1.5" y="9"    width="3" height="5.5" rx="0.75" />
      <rect x="6.5" y="6"    width="3" height="8.5" rx="0.75" />
      <rect x="11.5" y="2.5" width="3" height="12"  rx="0.75" />
    </svg>
  );
}

function NavItem({
  href,
  label,
  icon,
  indent = false,
  dotColor,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
  indent?: boolean;
  dotColor?: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (indent) {
    return (
      <Link
        href={href}
        className={`flex items-center gap-2.5 pl-8 pr-3 py-2 text-xs font-medium rounded-lg transition-all duration-150 ${!isActive ? "ltc-hover-subtle" : ""}`}
        style={{
          color: isActive ? dotColor : "oklch(50% 0.012 250)",
          backgroundColor: isActive ? `${dotColor}12` : "transparent",
        }}
      >
        <span
          className="flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-150"
          style={{ backgroundColor: isActive ? dotColor : "oklch(80% 0.01 250)" }}
        />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${!isActive ? "ltc-hover-subtle" : ""}`}
      style={{
        color: isActive ? "#2563EB" : "oklch(40% 0.012 250)",
        backgroundColor: isActive ? "oklch(94% 0.04 255)" : "transparent",
      }}
    >
      {icon && (
        <span
          className="flex-shrink-0 transition-all duration-150"
          style={{ color: isActive ? "#2563EB" : "oklch(62% 0.01 250)" }}
        >
          {icon}
        </span>
      )}
      {label}
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const learnActive = pathname.startsWith("/learn");

  return (
    <nav className="flex flex-col gap-0.5 px-3 py-4" onClick={onNavigate}>
      <NavItem href="/learn" label="Learn" icon={<IconLearn />} />
      {learnActive && (
        <div className="flex flex-col gap-0 my-0.5 pb-1">
          {LEARN_STEPS.map((step) => (
            <NavItem
              key={step.href}
              href={step.href}
              label={step.label}
              indent
              dotColor={step.color}
            />
          ))}
        </div>
      )}

      <div className="my-2 mx-3 h-px" style={{ background: "oklch(89% 0.01 250)" }} />

      <NavItem href="/trainer"   label="Trainer"   icon={<IconTrainer />} />
      <NavItem href="/reference" label="Reference" icon={<IconReference />} />
      <NavItem href="/progress"  label="Progress"  icon={<IconProgress />} />
    </nav>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarStyle = {
    background: "oklch(100% 0 0)",
    borderRight: "1px solid oklch(89% 0.01 250)",
  };

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col z-20"
        style={sidebarStyle}
      >
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 px-5 py-5 transition-all duration-200"
          style={{ borderBottom: "1px solid oklch(91% 0.008 250)" }}
        >
          <div
            className="flex-shrink-0 rounded-xl p-1 transition-all duration-200"
            style={{
              background: "oklch(94% 0.04 255)",
              border: "1px solid oklch(87% 0.06 255)",
            }}
          >
            <CubeIcon />
          </div>
          <p
            className="font-display text-base font-bold tracking-tight"
            style={{ color: "oklch(18% 0.01 250)" }}
          >
            LTCube
          </p>
        </Link>

        <div className="flex-1 overflow-y-auto">
          <SidebarContent />
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 text-2xs"
          style={{
            borderTop: "1px solid oklch(91% 0.008 250)",
            color: "oklch(72% 0.008 250)",
          }}
        >
          Built by Ray
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14"
        style={{
          background: "oklch(100% 0 0)",
          borderBottom: "1px solid oklch(89% 0.01 250)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex-shrink-0 rounded-lg p-0.5"
            style={{
              background: "oklch(94% 0.04 255)",
              border: "1px solid oklch(87% 0.06 255)",
            }}
          >
            <CubeIcon />
          </div>
          <span
            className="font-display text-base font-bold tracking-tight"
            style={{ color: "oklch(18% 0.01 250)" }}
          >
            LTCube
          </span>
        </Link>

        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation"
          className="p-3 rounded-lg transition-all duration-150"
          style={{
            color: "oklch(50% 0.012 250)",
            border: "1px solid oklch(89% 0.01 250)",
          }}
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div
          className="md:hidden fixed top-14 left-0 right-0 z-20"
          style={{
            background: "oklch(100% 0 0)",
            borderBottom: "1px solid oklch(89% 0.01 250)",
          }}
        >
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="md:hidden h-14 w-full" />
    </>
  );
}
