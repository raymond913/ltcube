import type { Substep } from "@/lib/tutorialTypes";

interface AlgorithmCardProps {
  substep: Substep;
  isActive: boolean;
  onPlay: () => void;
}

export function AlgorithmCard({ substep, isActive, onPlay }: AlgorithmCardProps) {
  return (
    <div
      className={`rounded-lg border p-3 flex flex-col gap-2 transition-[border-color,box-shadow] duration-150 ${
        isActive ? "ltc-hover-lift-bordered" : "ltc-hover-lift-bordered"
      }`}
      style={{
        background: "var(--color-surface-elevated)",
        border: isActive
          ? "1px solid var(--color-primary)"
          : "1px solid var(--color-border)",
        boxShadow: isActive
          ? "0 2px 8px color-mix(in srgb, var(--color-primary) 12%, transparent)"
          : "0 1px 3px var(--color-shadow-1)",
        ["--ltc-hover-border" as string]: "var(--color-primary-light-border)",
      }}
    >
      <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text)" }}>
        {substep.algorithmName ?? substep.title}
      </p>
      <code
        className="font-mono text-sm leading-relaxed line-clamp-3 break-all"
        style={{ color: "var(--color-muted)" }}
      >
        {substep.algorithm}
      </code>
      <button
        onClick={onPlay}
        aria-label={`Play ${substep.algorithmName ?? substep.title}`}
        className="ltc-hover-primary mt-auto self-start rounded-md px-3 py-2 text-sm font-semibold text-on-accent transition-colors min-h-11"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        Play ▶
      </button>
    </div>
  );
}
