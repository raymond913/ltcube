/**
 * Colors for three.js materials, which cannot read CSS variables. The face
 * colors must match the --color-cube-* tokens in globals.css (enforced by a test).
 */
export const FACE_COLORS: Record<string, string> = {
  R: "#DC2626",
  L: "#FF7A00",
  U: "#EAB308",
  D: "#FFFFFF",
  F: "#2563EB",
  B: "#16A34A",
};

export const BODY_COLOR = "#111111";
export const GHOST_BODY_COLOR = "#3A3A3A";
export const MASK_STICKER_COLOR = "#52525B";
export const MASK_BODY_COLOR = "#3F3F46";

export const ARROW_LIGHT = "#FFFFFF";
export const ARROW_BLUE = "#2563EB";

export const HERO_BODY_COLOR = "#0a0a0a";

export const HERO_FACE_COLORS: Record<string, { color: string; emissive: string; emissiveIntensity: number }> = {
  R: { color: "#FF3B3B", emissive: "#FF0000", emissiveIntensity: 0.3 },
  L: { color: "#FF8B1F", emissive: "#FF6600", emissiveIntensity: 0.3 },
  U: { color: "#FFD93D", emissive: "#FFD700", emissiveIntensity: 0.3 },
  D: { color: "#FFFFFF", emissive: "#FFFFFF", emissiveIntensity: 0.2 },
  F: { color: "#3B82F6", emissive: "#2563EB", emissiveIntensity: 0.4 },
  B: { color: "#10B981", emissive: "#059669", emissiveIntensity: 0.3 },
};

export const HERO_LIGHT_KEY = "#E0E8FF";
export const HERO_LIGHT_RIM = "#9333EA";
export const HERO_LIGHT_FILL = "#FFFFFF";
