import type { Substep } from "@/lib/tutorialTypes";
import { HoldInstruction } from "./HoldInstruction";

interface StepContentProps {
  substep: Substep;
  onNextExample?: () => void;
}

export function StepContent({ substep, onNextExample }: StepContentProps) {
  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: "65ch" }}>
      <h2 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
        {substep.title}
      </h2>

      <p className="leading-relaxed" style={{ color: "oklch(45% 0.012 250)" }}>
        {substep.explanation}
      </p>

      {substep.holdInstruction && <HoldInstruction text={substep.holdInstruction} />}

      {substep.howToSpot && (
        <div
          className="rounded-lg px-4 py-3"
          style={{
            background: "rgba(37,99,235,0.06)",
            border: "1px solid rgba(37,99,235,0.18)",
          }}
        >
          <p
            className="text-xs font-bold uppercase tracking-wider mb-1"
            style={{ color: "#2563EB" }}
          >
            How to spot this
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#1E3A8A" }}>
            {substep.howToSpot}
          </p>
        </div>
      )}

      {substep.tip && (
        <div
          className="flex gap-3 rounded-lg px-4 py-3"
          style={{
            background: "var(--color-primary-light)",
            border: "1px solid var(--color-primary-light-border)",
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
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          {substep.algorithmName && (
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: "var(--color-muted)" }}
            >
              {substep.algorithmName}
            </p>
          )}
          <code className="font-mono text-sm tracking-wide break-all" style={{ color: "var(--color-text)" }}>
            {substep.algorithm}
          </code>
        </div>
      )}

      {onNextExample && (
        <button
          onClick={onNextExample}
          className="ltc-hover-blue self-start rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          style={{
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border)",
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
