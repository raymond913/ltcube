"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const CubeViewer = dynamic(
  () => import("@/components/cube/CubeViewer").then((m) => m.CubeViewer),
  {
    ssr: false,
    loading: () => (
      <div style={{ width: 300, height: 300 }} className="flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    ),
  }
);

const Starfield = dynamic(
  () => import("@/components/landing/Starfield").then((m) => m.Starfield),
  { ssr: false }
);

export default function HomePage() {
  return (
    <>
      <style>{`
        @keyframes ltc-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        @keyframes ltc-pulse-glow {
          0%, 100% {
            box-shadow: 0 0 18px rgba(96,165,250,0.45), 0 0 36px rgba(139,92,246,0.2);
          }
          50% {
            box-shadow: 0 0 32px rgba(96,165,250,0.75), 0 0 64px rgba(139,92,246,0.4);
          }
        }
        .ltc-cube-float { animation: ltc-float 3s ease-in-out infinite; }
        .ltc-btn-glow  { animation: ltc-pulse-glow 2.5s ease-in-out infinite; }
      `}</style>

      {/* Full-viewport panel — sits in the main content area next to the sidebar */}
      <div
        className="fixed inset-0 md:left-64 z-10 overflow-hidden flex flex-col items-center justify-center"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 35%, #1e003d 0%, #0a0018 45%, #000000 100%)",
        }}
      >
        {/* Animated starfield */}
        <Starfield />

        {/* Centred content stack */}
        <div className="relative z-10 flex flex-col items-center gap-5 text-center px-6 select-none">
          {/* Wordmark */}
          <span
            className="text-xs font-bold tracking-[0.35em] uppercase"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            LTCube
          </span>

          {/* 3D Cube with bobbing animation */}
          <div className="ltc-cube-float">
            <Suspense
              fallback={
                <div
                  style={{ width: 300, height: 300 }}
                  className="flex items-center justify-center"
                >
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              }
            >
              <CubeViewer size={300} interactive />
            </Suspense>
          </div>

          {/* Headline */}
          <h1
            className="text-4xl md:text-5xl font-bold leading-tight tracking-tight"
            style={{ color: "#ffffff" }}
          >
            Learn to Solve the Cube
          </h1>

          {/* Subheadline */}
          <p
            className="text-sm md:text-base max-w-xs"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            Interactive 3D tutorials, beginner-friendly
          </p>

          {/* CTA button */}
          <Link
            href="/learn"
            className="ltc-btn-glow mt-1 inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white transition-all"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%)",
            }}
          >
            Start Learning
          </Link>
        </div>

        {/* Footer */}
        <p
          className="absolute bottom-5 text-xs"
          style={{ color: "rgba(255,255,255,0.18)" }}
        >
          Built by Ray
        </p>
      </div>
    </>
  );
}
