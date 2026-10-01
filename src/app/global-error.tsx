"use client";

export default function GlobalError({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#FAFBFD",
          color: "#16181D",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24 }}>Something went wrong</h1>
        <p style={{ margin: 0, maxWidth: 360, lineHeight: 1.6, color: "#4B5059" }}>
          LTCube couldn&apos;t load. Your progress is saved on this device.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          style={{
            minHeight: 44,
            padding: "0 24px",
            borderRadius: 999,
            border: "none",
            background: "#2563EB",
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
