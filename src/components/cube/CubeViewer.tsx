"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { CubeFaces } from "@/lib/cubeEngine";
import type { Arrow, StickerMask } from "@/lib/tutorialTypes";
import { WebGLErrorBoundary } from "./WebGLErrorBoundary";
import { canUseWebGL } from "@/lib/webgl";

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
  /** When true, orient the scene so white is on top */
  whiteOnTop?: boolean;
  /** OLL display mask: only yellow stickers stay coloured */
  stickerMask?: StickerMask;
}

const cubeUnavailableFallback = (
  <div
    className="flex flex-col items-center justify-center w-full h-full rounded-xl gap-2"
    style={{ background: "var(--color-surface)" }}
  >
    <span className="text-2xl" aria-hidden>🧊</span>
    <span className="text-xs text-center px-2" style={{ color: "var(--color-muted)" }}>
      3D view unavailable on this device
    </span>
  </div>
);

export function CubeViewer({
  size = 300,
  interactive = true,
  className = "",
  cubeState,
  visibleCubies,
  onReady,
  viewMode,
  arrows,
  whiteOnTop,
  stickerMask,
}: CubeViewerProps) {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglOk(canUseWebGL());
  }, []);

  return (
    <div
      style={{ width: size, height: size }}
      className={`rounded-xl overflow-hidden ${className}`}
    >
      {webglOk === false ? (
        cubeUnavailableFallback
      ) : (
        <WebGLErrorBoundary fallback={cubeUnavailableFallback}>
          <CubeScene
            interactive={interactive}
            cubeState={cubeState}
            visibleCubies={visibleCubies}
            onReady={onReady}
            viewMode={viewMode}
            arrows={arrows}
            whiteOnTop={whiteOnTop}
            stickerMask={stickerMask}
          />
        </WebGLErrorBoundary>
      )}
    </div>
  );
}
