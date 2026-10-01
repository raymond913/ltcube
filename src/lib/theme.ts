/** A translucent version of a CSS color, for tinted backgrounds and borders. */
export function tint(color: string, percent: number): string {
  const pct = Math.min(100, Math.max(0, Math.round(percent)));
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}

/** Accent color per lesson, as CSS variables defined in globals.css. */
export const STEP_COLORS: Record<string, string> = {
  "cross": "var(--color-step-cross)",
  "corners": "var(--color-step-corners)",
  "second-layer": "var(--color-step-layer)",
  "two-look-oll": "var(--color-step-oll)",
  "two-look-pll": "var(--color-step-pll)",
};
