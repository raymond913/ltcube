"use client";

import dynamic from "next/dynamic";
import type { CubeFaces } from "@/lib/cubeEngine";

const CubeScene = dynamic(
  () => import("./CubeScene").then((m) => m.CubeScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center w-full h-full bg-[#F8FAFC] rounded-xl">
        <span className="text-sm text-[#64748B]">Loading 3D view…</span>
      </div>
    ),
  }
);

interface CubeViewerProps {
  /** Canvas width and height in pixels (default 300) */
  size?: number;
  /** Enable OrbitControls mouse/touch rotation (default true) */
  interactive?: boolean;
  /** Extra Tailwind / CSS classes for the container */
  className?: string;
  /** Override cube state (uses store state if omitted) */
  cubeState?: CubeFaces;
  /** Cubie IDs to highlight, e.g. ["UFR", "UF"] */
  highlightedCubies?: string[];
  /** Position keys ("x,y,z") of cubies to show normally; all others are grayed out. */
  visibleCubies?: string[];
  /** Called once when the Canvas is mounted and ready */
  onReady?: () => void;
}

export function CubeViewer({
  size = 300,
  interactive = true,
  className = "",
  cubeState,
  highlightedCubies,
  visibleCubies,
  onReady,
}: CubeViewerProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl overflow-hidden ${className}`}
    >
      <CubeScene
        interactive={interactive}
        cubeState={cubeState}
        highlightedCubies={highlightedCubies}
        visibleCubies={visibleCubies}
        onReady={onReady}
      />
    </div>
  );
}
