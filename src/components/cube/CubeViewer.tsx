"use client";

import dynamic from "next/dynamic";
import type { CubeFaces } from "@/lib/cubeEngine";
import type { Arrow } from "@/lib/tutorialTypes";

const CubeScene = dynamic(
  () => import("./CubeScene").then((m) => m.CubeScene),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center w-full h-full rounded-xl"
        style={{ background: "var(--color-surface)" }}
      >
        <span className="text-sm" style={{ color: "var(--color-muted)" }}>Loading 3D view…</span>
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
  /** Position keys ("x,y,z") of cubies to show normally; all others render as black body with no stickers. */
  visibleCubies?: string[];
  /** Called once when the Canvas is mounted and ready */
  onReady?: () => void;
  /** Camera view mode */
  viewMode?: "default" | "white-up";
  /** Arrows rendered on top of the cube */
  arrows?: Arrow[];
}

export function CubeViewer({
  size = 300,
  interactive = true,
  className = "",
  cubeState,
  visibleCubies,
  onReady,
  viewMode,
  arrows,
}: CubeViewerProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl overflow-hidden ${className}`}
    >
      <CubeScene
        interactive={interactive}
        cubeState={cubeState}
        visibleCubies={visibleCubies}
        onReady={onReady}
        viewMode={viewMode}
        arrows={arrows}
      />
    </div>
  );
}
