"use client";

import dynamic from "next/dynamic";
import { WebGLErrorBoundary } from "./WebGLErrorBoundary";
import { useWebGLSupport } from "@/lib/webgl";

const CaseThumbnailScene = dynamic(
  () => import("./CaseThumbnailScene").then((m) => m.CaseThumbnailScene),
  { ssr: false, loading: () => <div /> },
);

interface CaseThumbnailProps {
  initialState: string;
  visibleCubies?: string[];
  title: string;
  size?: number;
}

export function CaseThumbnail({
  initialState,
  visibleCubies,
  title,
  size = 88,
}: CaseThumbnailProps) {
  const webglOk = useWebGLSupport();

  const fallback = (
    <div
      className="flex items-center justify-center w-full h-full"
      style={{ background: "var(--color-surface)" }}
    >
      <span
        className="text-center px-1 text-sm leading-tight"
        style={{ color: "var(--color-muted)" }}
      >
        {title}
      </span>
    </div>
  );

  return (
    <div style={{ width: size, height: size, overflow: "hidden", flexShrink: 0 }}>
      {webglOk === false ? (
        fallback
      ) : (
        <WebGLErrorBoundary fallback={fallback}>
          <CaseThumbnailScene
            size={size}
            initialState={initialState}
            visibleCubies={visibleCubies}
          />
        </WebGLErrorBoundary>
      )}
    </div>
  );
}
