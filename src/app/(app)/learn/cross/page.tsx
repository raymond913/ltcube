import type { Metadata } from "next";
import { TutorialLayout } from "@/components/tutorial/TutorialLayout";
import { cross, BEGINNER_STEPS } from "@/data/beginner";
import { LESSON_COPY } from "@/lib/lessonCopy";
import { parseStepIndex } from "@/lib/stepParam";

export const metadata: Metadata = { title: LESSON_COPY["cross"].name };

export default async function CrossPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const initialSubstepIndex = parseStepIndex(step, cross.substeps.length);
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "cross")!;

  return (
    <TutorialLayout
      stepData={cross}
      stepMeta={stepMeta}
      initialSubstepIndex={initialSubstepIndex}
      showViewToggle
      showCaseThumbnails
    />
  );
}
