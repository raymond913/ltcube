/** Turns a 1-based `?step=` URL value into a safe 0-based index. Bad input falls back to 0. */
export function parseStepIndex(raw: string | null | undefined, count: number): number {
  const last = Math.max(0, count - 1);
  const n = parseInt(raw ?? "", 10);
  if (!Number.isFinite(n)) return 0;
  return Math.min(Math.max(0, n - 1), last);
}
