import type { Metadata } from "next";
import { TutorialLayout } from "@/components/tutorial/TutorialLayout";
import { corners, BEGINNER_STEPS } from "@/data/beginner";
import { LESSON_COPY } from "@/lib/lessonCopy";
import { parseStepIndex } from "@/lib/stepParam";

export const metadata: Metadata = { title: LESSON_COPY["corners"].name };

export default async function CornersPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const initialSubstepIndex = parseStepIndex(step, corners.substeps.length);
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "corners")!;

  return (
    <TutorialLayout
      stepData={corners}
      stepMeta={stepMeta}
      initialSubstepIndex={initialSubstepIndex}
      showCaseThumbnails
    />
  );
}
