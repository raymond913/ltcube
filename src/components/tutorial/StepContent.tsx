import type { Substep } from "@/lib/tutorialTypes";

interface StepContentProps {
  substep: Substep;
  onNextExample?: () => void;
}

export function StepContent({ substep, onNextExample }: StepContentProps) {
  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: "65ch" }}>
      <h2 className="text-xl font-semibold text-[#1E293B]">{substep.title}</h2>

      <p className="text-[#475569] leading-relaxed">{substep.explanation}</p>

      {substep.tip && (
        <div className="flex gap-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] px-4 py-3">
          <span className="flex-shrink-0 mt-0.5 text-[#2563EB]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1Zm0 1.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM8 6.75a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8 6.75Zm0-2.5a.875.875 0 1 1 0 1.75.875.875 0 0 1 0-1.75Z" />
            </svg>
          </span>
          <p className="text-sm text-[#1E40AF] leading-relaxed">{substep.tip}</p>
        </div>
      )}

      {(substep.algorithmName || substep.algorithm) && (
        <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          {substep.algorithmName && (
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
              {substep.algorithmName}
            </p>
          )}
          <code className="font-mono text-sm text-[#1E293B] tracking-wide break-all">
            {substep.algorithm}
          </code>
        </div>
      )}

      {onNextExample && (
        <button
          onClick={onNextExample}
          className="self-start rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#2563EB] hover:bg-[#EFF6FF] transition-colors shadow-sm"
        >
          Try Another Example →
        </button>
      )}
    </div>
  );
}
