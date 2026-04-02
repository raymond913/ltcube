"use client";

import Link from "next/link";
import { CubeViewer } from "@/components/cube/CubeViewer";
import { AlgorithmPlayer } from "@/components/cube/AlgorithmPlayer";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <div className="flex flex-col-reverse gap-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-5 max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight text-[#1E293B] leading-tight">
            Learn to Solve the
            <br />
            Rubik&apos;s Cube
          </h1>
          <p className="text-lg text-[#64748B] leading-relaxed">
            Step-by-step interactive tutorials for beginners using the
            layer-by-layer method. Visualise every algorithm on a live 3D cube.
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
              View Algorithms
            </Link>
          </div>
        </div>

        {/* 3D Cube demo */}
        <div className="flex items-center justify-center">
          <CubeViewer size={320} interactive className="shadow-xl" />
        </div>
      </div>

      {/* Algorithm Player demo */}
      <AlgorithmPlayer
        algorithm="R U R' U'"
        title="Algorithm Playback"
        description="Use the controls below to step through moves, or press Space to play."
      />

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#F1F5F9] pt-8">
        {[
          { title: "3D Interactive Cube", desc: "Visualise any algorithm with live animated playback on a real 3D cube." },
          { title: "Step-by-step Tutorials", desc: "White Cross → White Corners → F2L → 2-Look OLL → 2-Look PLL." },
          { title: "Pattern Recognition Trainer", desc: "Drill all 16 OLL/PLL cases until recognition becomes instant." },
          { title: "Progress Tracking", desc: "Streak counter, session stats, and per-case mastery — stored locally." },
        ].map((f) => (
          <div key={f.title} className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <p className="font-semibold text-[#1E293B]">{f.title}</p>
            <p className="mt-1 text-sm text-[#64748B]">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
