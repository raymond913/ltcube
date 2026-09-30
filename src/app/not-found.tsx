import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen gap-8 text-center px-6"
      style={{
        backgroundColor: "var(--color-background)",
        backgroundImage: "radial-gradient(circle, oklch(87% 0.008 250) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* Scattered cube pieces */}
      <div style={{ animation: "ltc-page-in 0.4s ease-out both" }}>
        <svg
          viewBox="0 0 80 80"
          width="80"
          height="80"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="2"  y="2"  width="22" height="22" rx="3" fill="#DC2626" opacity="0.75" transform="rotate(-12 13 13)" />
          <rect x="30" y="0"  width="22" height="22" rx="3" fill="#EAB308" opacity="0.75" transform="rotate(8 41 11)" />
          <rect x="56" y="4"  width="18" height="18" rx="3" fill="#2563EB" opacity="0.7"  transform="rotate(-5 65 13)" />
          <rect x="0"  y="32" width="20" height="20" rx="3" fill="#FF7A00" opacity="0.7"  transform="rotate(15 10 42)" />
          <rect x="29" y="30" width="22" height="22" rx="3" fill="#94A3B8" opacity="0.5"  transform="rotate(-4 40 41)" />
          <rect x="58" y="28" width="20" height="20" rx="3" fill="#16A34A" opacity="0.7"  transform="rotate(10 68 38)" />
          <rect x="4"  y="56" width="18" height="18" rx="3" fill="#2563EB" opacity="0.6"  transform="rotate(-8 13 65)" />
          <rect x="30" y="58" width="20" height="20" rx="3" fill="#16A34A" opacity="0.65" transform="rotate(6 40 68)" />
          <rect x="58" y="56" width="18" height="18" rx="3" fill="#DC2626" opacity="0.65" transform="rotate(-14 67 65)" />
        </svg>
      </div>

      <div className="flex flex-col items-center gap-3" style={{ animation: "ltc-page-in 0.4s ease-out 0.1s both" }}>
        <p
          className="font-display text-8xl font-black leading-none tracking-tighter"
          style={{ color: "#2563EB" }}
        >
          404
        </p>
        <h1
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          Page not found
        </h1>
        <p
          className="max-w-xs leading-relaxed text-sm"
          style={{ color: "var(--color-muted)" }}
        >
          That page doesn&apos;t exist — but the cube does. Let&apos;s get you back on track.
        </p>
      </div>

      <div style={{ animation: "ltc-page-in 0.4s ease-out 0.2s both" }}>
        <Link
          href="/"
          className="ltc-hover-primary inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.03] active:scale-[0.98]"
          style={{
            backgroundColor: "#2563EB",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1), 0 4px 16px rgba(37,99,235,0.25)",
          }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
