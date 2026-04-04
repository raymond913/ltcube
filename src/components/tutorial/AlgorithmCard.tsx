import type { Substep } from "@/lib/tutorialTypes";

interface AlgorithmCardProps {
  substep: Substep;
  isActive: boolean;
  onPlay: () => void;
}

export function AlgorithmCard({ substep, isActive, onPlay }: AlgorithmCardProps) {
  return (
    <div
      className={`rounded-lg border bg-white p-3 flex flex-col gap-2 transition-all ${
        isActive
          ? "border-[#2563EB] shadow-md ring-1 ring-[#2563EB]/20"
          : "border-[#E2E8F0] shadow-sm hover:border-[#93C5FD] hover:shadow-md"
      }`}
    >
      <p className="text-sm font-semibold text-[#1E293B] truncate">
        {substep.algorithmName ?? substep.title}
      </p>
      <code className="font-mono text-xs text-[#64748B] leading-relaxed line-clamp-3 break-all">
        {substep.algorithm}
      </code>
      <button
        onClick={onPlay}
        className="mt-auto self-start rounded-md bg-[#2563EB] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
      >
        Play ▶
      </button>
    </div>
  );
}
