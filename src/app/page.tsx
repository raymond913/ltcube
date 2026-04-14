"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useProgressStore } from "@/stores/progressStore";

const CubeViewer = dynamic(
  () => import("@/components/cube/CubeViewer").then((m) => m.CubeViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-xl bg-[#F8FAFC]" style={{ width: 320, height: 320 }}>
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

const STEPS = [
  { label: "White Cross", href: "/learn/white-cross", id: "white-cross" },
  { label: "Corners", href: "/learn/white-corners", id: "white-corners" },
  { label: "2nd Layer", href: "/learn/second-layer", id: "second-layer" },
  { label: "OLL", href: "/learn/oll", id: "oll" },
  { label: "PLL", href: "/learn/pll", id: "pll" },
];

const FEATURES = [
  {
    title: "Step-by-Step Guides",
    desc: "Clear, beginner-friendly tutorials walk you through each stage of the layer-by-layer method.",
    icon: (
      <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: "3D Algorithm Demos",
    desc: "Watch every move play out on a live 3D cube. Step forward, backward, or scrub at your own pace.",
    icon: (
      <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
      </svg>
    ),
  },
  {
    title: "Practice & Track",
    desc: "Pattern recognition trainer for OLL/PLL, streak counters, and per-case mastery — all stored locally.",
    icon: (
      <svg className="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

function RoadmapBadge({ label, href, done }: { label: string; href: string; done: boolean }) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
        done
          ? "bg-[#DCFCE7] border-[#86EFAC] text-[#166534] hover:bg-[#BBF7D0]"
          : "bg-white border-[#E2E8F0] text-[#475569] hover:bg-[#F8FAFC]"
      }`}
    >
      {done && (
        <svg className="w-3.5 h-3.5 text-[#16A34A]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
      {label}
    </Link>
  );
}

export default function HomePage() {
  const completedSteps = useProgressStore((s) => s.completedSteps);

  return (
    <div className="flex flex-col gap-14">
      {/* Hero */}
      <div className="flex flex-col-reverse gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-5 max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight text-[#1E293B] leading-tight">
            Learn to Solve the
            <br />
            Rubik&apos;s Cube
          </h1>
          <p className="text-lg text-[#64748B] leading-relaxed">
            Interactive 3D tutorials that show you every move.
          </p>
          <div className="flex gap-3">
            <Link
              href="/learn"
              className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors"
            >
              Start Learning
            </Link>
            <Link
              href="/reference"
              className="inline-flex items-center justify-center rounded-lg border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-semibold text-[#1E293B] shadow-sm hover:bg-[#F8FAFC] transition-colors"
            >
              Algorithm Reference
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Suspense fallback={
            <div className="flex items-center justify-center rounded-xl bg-[#F8FAFC]" style={{ width: 320, height: 320 }}>
              <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            </div>
          }>
            <CubeViewer size={320} interactive className="shadow-xl" />
          </Suspense>
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-[#1E293B]">Everything you need to learn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm flex flex-col gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-[#1E293B]">{f.title}</p>
                <p className="mt-1 text-sm text-[#64748B]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Method Roadmap */}
      <div className="flex flex-col gap-4 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-[#1E293B]">Your Learning Path</h2>
          <p className="mt-1 text-sm text-[#64748B]">Follow the layer-by-layer method step by step.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <RoadmapBadge
                label={step.label}
                href={step.href}
                done={completedSteps.includes(step.id)}
              />
              {i < STEPS.length - 1 && (
                <svg className="w-4 h-4 text-[#CBD5E1] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#F1F5F9] pt-6 flex items-center justify-between text-sm text-[#94A3B8]">
        <span>LTCube — Learn to Cube</span>
        <span>Built by Ray</span>
      </footer>
    </div>
  );
}
