import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const SRC = path.resolve(__dirname, "..");
const CSS = readFileSync(path.join(SRC, "app/globals.css"), "utf8");

// ---------------------------------------------------------------------------
// Color math (WCAG 2.x relative luminance)
// ---------------------------------------------------------------------------

type RGB = [number, number, number];
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function oklchToLinear(L: number, C: number, h: number): RGB {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function hexToLinear(hex: string): RGB {
  const f = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return [f(1), f(3), f(5)];
}

const luminance = ([r, g, b]: RGB) => 0.2126 * clamp01(r) + 0.7152 * clamp01(g) + 0.0722 * clamp01(b);

function contrast(a: RGB, b: RGB): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function token(name: string): RGB {
  const re = new RegExp(`--color-${name}:\\s*([^;]+);`);
  const raw = CSS.match(re)?.[1].trim();
  if (!raw) throw new Error(`token --color-${name} not found in globals.css`);
  if (raw.startsWith("#")) return hexToLinear(raw);
  const m = raw.match(/oklch\(\s*([\d.]+)%\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!m) throw new Error(`unsupported value for --color-${name}: ${raw}`);
  return oklchToLinear(Number(m[1]) / 100, Number(m[2]), Number(m[3]));
}

// ---------------------------------------------------------------------------
// Palette contrast (WCAG AA: 4.5:1 for text)
// ---------------------------------------------------------------------------

const SURFACES = ["background", "surface", "surface-elevated"];
const TEXT_TOKENS = [
  "text", "muted", "dim", "primary", "primary-hover", "primary-ink",
  "step-cross", "step-corners", "step-layer", "step-oll", "step-pll",
];

describe("palette contrast", () => {
  for (const t of TEXT_TOKENS) {
    for (const s of SURFACES) {
      it(`--color-${t} on --color-${s} is at least 4.5:1`, () => {
        expect(contrast(token(t), token(s))).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  for (const t of ["primary", "primary-hover", "step-cross", "step-corners", "step-layer", "step-oll", "step-pll"]) {
    it(`white text on --color-${t} is at least 4.5:1`, () => {
      expect(contrast(token("on-accent"), token(t))).toBeGreaterThanOrEqual(4.5);
    });
  }

  for (const t of ["text", "muted", "primary", "primary-ink"]) {
    it(`--color-${t} on --color-primary-light is at least 4.5:1`, () => {
      expect(contrast(token(t), token("primary-light"))).toBeGreaterThanOrEqual(4.5);
    });
  }
});

// ---------------------------------------------------------------------------
// Source rules
// ---------------------------------------------------------------------------

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) {
      if (name === "__tests__" || name === "scripts") continue;
      walk(full, out);
    } else if (full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

const FILES = walk(SRC).map((f) => ({
  rel: path.relative(SRC, f).replace(/\\/g, "/"),
  text: readFileSync(f, "utf8"),
}));

/** Renders when the root layout (and its CSS) failed, so it cannot use tokens. */
const COLOR_LITERAL_ALLOWLIST = new Set(["app/global-error.tsx"]);

interface Hit {
  where: string;
  line: string;
}

function scan(re: RegExp, skip: Set<string> = new Set()): Hit[] {
  const hits: Hit[] = [];
  for (const { rel, text } of FILES) {
    if (skip.has(rel)) continue;
    text.split("\n").forEach((line, i) => {
      if (re.test(line)) hits.push({ where: `${rel}:${i + 1}`, line });
    });
  }
  return hits;
}

const show = (hits: Hit[]) => hits.map((h) => `${h.where}  ${h.line.trim().slice(0, 90)}`);

function offenders(re: RegExp, skip: Set<string> = new Set()): string[] {
  return show(scan(re, skip));
}

describe("type size (nothing under 14px)", () => {
  it("uses no text-xs or text-2xs", () => {
    expect(offenders(/\btext-(xs|2xs)\b/)).toEqual([]);
  });

  it("uses no arbitrary text-[Npx] below 14px", () => {
    const hits = scan(/\btext-\[(\d+(?:\.\d+)?)(px|rem)\]/).filter((h) => {
      const m = h.line.match(/text-\[(\d+(?:\.\d+)?)(px|rem)\]/)!;
      return Number(m[1]) * (m[2] === "rem" ? 16 : 1) < 14;
    });
    expect(show(hits)).toEqual([]);
  });

  it("sets no inline fontSize below 14px", () => {
    const hits = scan(/fontSize:\s*"?\d/).filter((h) => {
      const m = h.line.match(/fontSize:\s*"?(\d+(?:\.\d+)?)(px|rem)?/)!;
      return Number(m[1]) * (m[2] === "rem" ? 16 : 1) < 14;
    });
    expect(show(hits)).toEqual([]);
  });
});

describe("svg text size", () => {
  it("sets no SVG fontSize attribute below 14", () => {
    const hits = scan(/fontSize="(\d+(?:\.\d+)?)"/).filter(
      (h) => Number(h.line.match(/fontSize="(\d+(?:\.\d+)?)"/)![1]) < 14,
    );
    expect(show(hits)).toEqual([]);
  });
});

describe("touch targets and focus", () => {
  it("has no explicit min-height under 44px", () => {
    const hits = scan(/min-h-\[(\d+)px\]/).filter((h) => Number(h.line.match(/min-h-\[(\d+)px\]/)![1]) < 44);
    expect(show(hits)).toEqual([]);
  });

  it("never removes the keyboard focus outline with focus-visible:outline-none", () => {
    expect(offenders(/focus-visible:outline-none/)).toEqual([]);
  });
});

describe("theming (colors come from tokens)", () => {
  it("has no hex colors in components", () => {
    expect(offenders(/#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/, COLOR_LITERAL_ALLOWLIST)).toEqual([]);
  });

  it("uses no raw Tailwind palette colors (white, black, gray-*, etc.) instead of tokens", () => {
    expect(
      offenders(/\b(?:bg|text|border|ring|fill|stroke|from|to|via)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b/),
    ).toEqual([]);
  });

  it("has no rgb/rgba/hsl/oklch literals in components", () => {
    expect(offenders(/\b(?:rgba?|hsla?|oklch)\(/, COLOR_LITERAL_ALLOWLIST)).toEqual([]);
  });
});
