import type { Substep } from "@/lib/tutorialTypes";

interface StepContentProps {
  substep: Substep;
  onNextExample?: () => void;
}

export function StepContent({ substep, onNextExample }: StepContentProps) {
  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: "65ch" }}>
      <h2 className="text-xl font-semibold" style={{ color: "oklch(18% 0.01 250)" }}>
        {substep.title}
      </h2>

      <p className="leading-relaxed" style={{ color: "oklch(45% 0.012 250)" }}>
        {substep.explanation}
      </p>

      {substep.tip && (
        <div
          className="flex gap-3 rounded-lg px-4 py-3"
          style={{
            background: "oklch(94% 0.04 255)",
            border: "1px solid oklch(87% 0.06 255)",
          }}
        >
          <span className="flex-shrink-0 mt-0.5" style={{ color: "#2563EB" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM8 6.75a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 6.75Zm0-2.5a.875.875 0 1 1 0 1.75.875.875 0 0 1 0-1.75Z" />
            </svg>
          </span>
          <p className="text-sm leading-relaxed" style={{ color: "#2563EB" }}>
            {substep.tip}
          </p>
        </div>
      )}

      {(substep.algorithmName || substep.algorithm) && (
        <div
          className="rounded-lg px-4 py-3"
          style={{
            background: "oklch(97.5% 0.005 250)",
            border: "1px solid oklch(89% 0.01 250)",
          }}
        >
          {substep.algorithmName && (
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: "oklch(50% 0.012 250)" }}
            >
              {substep.algorithmName}
            </p>
          )}
          <code className="font-mono text-sm tracking-wide break-all" style={{ color: "oklch(18% 0.01 250)" }}>
            {substep.algorithm}
          </code>
        </div>
      )}

      {onNextExample && (
        <button
          onClick={onNextExample}
          className="ltc-hover-blue self-start rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background: "oklch(100% 0 0)",
            border: "1px solid oklch(89% 0.01 250)",
            color: "#2563EB",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          Try Another Example →
        </button>
      )}
    </div>
  );
}
