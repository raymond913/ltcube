"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const learnSteps = [
  { href: "/learn/white-cross", label: "White Cross" },
  { href: "/learn/white-corners", label: "First Layer Corners" },
  { href: "/learn/second-layer", label: "Second Layer" },
  { href: "/learn/oll", label: "OLL" },
  { href: "/learn/pll", label: "PLL" },
];

function NavLink({
  href,
  label,
  indent = false,
}: {
  href: string;
  label: string;
  indent?: boolean;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        indent ? "ml-3 text-xs" : ""
      } ${
        isActive
          ? "bg-white/10 text-[#60a5fa]"
          : "text-white/50 hover:bg-white/5 hover:text-white/90"
      }`}
    >
      {label}
    </Link>
  );
}

function SidebarContent() {
  const pathname = usePathname();
  const learnActive = pathname.startsWith("/learn");

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      <NavLink href="/learn" label="Learn" />
      {learnActive && (
        <div className="flex flex-col gap-0.5 my-0.5">
          {learnSteps.map((step) => (
            <NavLink key={step.href} href={step.href} label={step.label} indent />
          ))}
        </div>
      )}
      <NavLink href="/trainer" label="Trainer" />
      <NavLink href="/reference" label="Reference" />
      <NavLink href="/progress" label="Progress" />
    </nav>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col z-20"
        style={{
          background: "rgba(10,10,10,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 px-5 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
              boxShadow: "0 0 12px rgba(96,165,250,0.4)",
            }}
          >
            <span className="text-white text-xs font-bold">L</span>
          </div>
          <Link href="/" className="text-lg font-bold tracking-tight text-white/90">
            LTCube
          </Link>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile header bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14"
        style={{
          background: "rgba(10,10,10,0.9)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
              boxShadow: "0 0 10px rgba(96,165,250,0.4)",
            }}
          >
            <span className="text-white text-xs font-bold">L</span>
          </div>
          <span className="text-base font-bold tracking-tight text-white/90">LTCube</span>
        </Link>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation"
          className="p-2 rounded-lg text-white/50 hover:text-white/90 hover:bg-white/5 transition-colors"
        >
          {mobileOpen ? (
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div
          className="md:hidden fixed top-14 left-0 right-0 z-20"
          style={{
            background: "rgba(10,10,10,0.95)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <SidebarContent />
        </div>
      )}

      {/* Mobile top spacer */}
      <div className="md:hidden h-14 w-full" />
    </>
  );
}
