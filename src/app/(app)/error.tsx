"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-text">Something went wrong</h1>
      <p className="max-w-sm text-base leading-relaxed text-muted">
        That page hit a snag. Your progress is saved. Try again, or head back to the start.
      </p>
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-base font-semibold text-on-accent transition-colors duration-150 hover:bg-primary-hover"
        >
          Try again
        </button>
        <Link
          href="/learn"
          className="inline-flex min-h-11 items-center px-3 text-base font-semibold text-primary underline-offset-4 hover:underline"
        >
          Back to lessons
        </Link>
      </div>
    </div>
  );
}
