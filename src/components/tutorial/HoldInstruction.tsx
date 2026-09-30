/** "How to hold it" line shown above the how-to-spot callout. */
export function HoldInstruction({ text }: { text: string }) {
  return (
    <p className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
      <svg
        className="mt-0.5 flex-shrink-0"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="#2563EB"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 1.5 2 4.75v6.5L8 14.5l6-3.25v-6.5L8 1.5Z" />
        <path d="M2 4.75 8 8l6-3.25M8 8v6.5" />
      </svg>
      <span>
        <span className="font-semibold">How to hold it:</span> {text}
      </span>
    </p>
  );
}
