import { useSyncExternalStore } from "react";

let cached: boolean | undefined;

export function canUseWebGL(): boolean {
  if (typeof document === "undefined") return false;
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement("canvas");
    const ctx =
      canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!ctx) {
      cached = false;
      return cached;
    }
    const ext = (ctx as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    ext?.loseContext();
    cached = true;
  } catch {
    cached = false;
  }
  return cached;
}

const subscribe = () => () => {};
const serverSnapshot = () => null;

/** null while rendering on the server and during hydration, then true/false. */
export function useWebGLSupport(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribe, canUseWebGL, serverSnapshot);
}
