"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const learnSteps = [
  { href: "/learn/cross", label: "White Cross" },
  { href: "/learn/first-layer", label: "First Layer Corners" },
  { href: "/learn/second-layer", label: "Second Layer" },
  { href: "/learn/top-cross", label: "Top Cross" },
  { href: "/learn/match-cross", label: "Match Cross" },
  { href: "/learn/match-corners", label: "Match Corners" },
  { href: "/learn/solve", label: "Solve" },
];

const navItems = [
  { href: "/learn", label: "Learn" },
  { href: "/trainer", label: "Trainer" },
  { href: "/reference", label: "Reference" },
  { href: "/progress", label: "Progress" },
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
          ? "bg-[#2563EB] text-white"
          : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]"
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
      {/* Learn with sub-links */}
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
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-[#F1F5F9] bg-white shadow-sm z-20">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-[#F1F5F9]">
          <div className="w-7 h-7 rounded-md bg-[#2563EB] flex items-center justify-center">
            <span className="text-white text-xs font-bold">L</span>
          </div>
          <Link href="/" className="text-lg font-bold tracking-tight text-[#1E293B]">
            LTCube
          </Link>
        </div>
        <SidebarContent />
      </aside>

      {/* Mobile header bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-white border-b border-[#F1F5F9] px-4 h-14 shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#2563EB] flex items-center justify-center">
            <span className="text-white text-xs font-bold">L</span>
          </div>
          <span className="text-base font-bold tracking-tight text-[#1E293B]">LTCube</span>
        </Link>
        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation"
          className="p-2 rounded-lg text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
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
        <div className="md:hidden fixed top-14 left-0 right-0 z-20 bg-white border-b border-[#F1F5F9] shadow-md">
          <SidebarContent />
        </div>
      )}

      {/* Mobile top spacer so content isn't hidden behind the header */}
      <div className="md:hidden h-14 w-full" />
    </>
  );
}
