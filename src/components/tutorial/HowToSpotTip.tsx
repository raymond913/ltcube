"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const TIP_WIDTH = 224;
const VIEWPORT_GAP = 8;

interface HowToSpotTipProps {
  /** The how-to-spot text shown in the popup */
  text: string;
  /** Accessible name for the "?" button, e.g. "How to spot L-Shape" */
  label: string;
  /** Accent color for the open state */
  color: string;
  /** How to hold the cube, shown under the how-to-spot text */
  hold?: string;
  /** Optional last line, e.g. the glowing-stickers note */
  note?: string;
}

/**
 * Small "?" button for a case card. Shows `text` in a tooltip:
 *  - mouse: on hover
 *  - keyboard: on focus
 *  - touch: tap the "?" to toggle
 * Closes on Escape, on a press outside, and when the mouse leaves.
 * Render it as a sibling of the card button (never inside it).
 */
export function HowToSpotTip({ text, label, color, hold, note }: HowToSpotTipProps) {
  const tipId = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const open = hovered || focused || pinned;

  const close = useCallback(() => {
    setHovered(false);
    setFocused(false);
    setPinned(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  // Keep the popup inside the viewport: right-align to the icon, then clamp.
  useLayoutEffect(() => {
    if (!open || !wrapRef.current) return;
    const icon = wrapRef.current.getBoundingClientRect();
    const width = Math.min(TIP_WIDTH, window.innerWidth - VIEWPORT_GAP * 2);
    const left = Math.min(
      Math.max(icon.right - width, VIEWPORT_GAP),
      window.innerWidth - width - VIEWPORT_GAP,
    );
    setOffsetLeft(left - icon.left);
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className="absolute right-0 top-0 z-20"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setHovered(true); }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") close(); }}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? tipId : undefined}
        onClick={() => setPinned((p) => !p)}
        onFocus={(e) => { if (e.currentTarget.matches(":focus-visible")) setFocused(true); }}
        onBlur={() => setFocused(false)}
        className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-[-4px]"
        style={{ outlineColor: color }}
      >
        <span
          aria-hidden="true"
          className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[11px] font-bold leading-none transition-colors duration-150"
          style={{
            background: open ? color : "var(--color-surface)",
            color: open ? "#fff" : "oklch(52% 0.012 250)",
            border: `1px solid ${open ? color : "var(--color-border)"}`,
          }}
        >
          ?
        </span>
      </button>

      {open && (
        <span
          id={tipId}
          role="tooltip"
          className="pointer-events-none absolute top-full mt-1 block rounded-lg px-3 py-2 text-left text-xs font-normal leading-relaxed"
          style={{
            left: offsetLeft,
            width: `min(${TIP_WIDTH}px, calc(100vw - ${VIEWPORT_GAP * 2}px))`,
            background: "var(--color-surface-elevated)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
          }}
        >
          {text}
          {hold && (
            <span className="mt-1.5 block">
              <span className="font-semibold">How to hold it: </span>
              {hold}
            </span>
          )}
          {note && (
            <span className="mt-1.5 block font-medium" style={{ color }}>
              {note}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
