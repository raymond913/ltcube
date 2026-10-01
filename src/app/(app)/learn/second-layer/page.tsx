import type { Metadata } from "next";
import { TutorialLayout } from "@/components/tutorial/TutorialLayout";
import { secondLayer, BEGINNER_STEPS } from "@/data/beginner";
import { LESSON_COPY } from "@/lib/lessonCopy";
import { parseStepIndex } from "@/lib/stepParam";

export const metadata: Metadata = { title: LESSON_COPY["second-layer"].name };

export default async function SecondLayerPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const initialSubstepIndex = parseStepIndex(step, secondLayer.substeps.length);
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "second-layer")!;

  return (
    <TutorialLayout
      stepData={secondLayer}
      stepMeta={stepMeta}
      initialSubstepIndex={initialSubstepIndex}
    />
  );
}
