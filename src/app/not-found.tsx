import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-6xl font-bold text-[#E2E8F0]">404</p>
        <h1 className="text-2xl font-semibold text-[#1E293B]">Page not found</h1>
        <p className="text-[#64748B]">That page doesn&apos;t exist — but the cube does.</p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
