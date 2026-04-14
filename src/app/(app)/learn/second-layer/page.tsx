import { TutorialLayout } from "@/components/tutorial/TutorialLayout";
import { secondLayer, BEGINNER_STEPS } from "@/data/beginner";

export default async function SecondLayerPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const initialSubstepIndex = step ? Math.max(0, parseInt(step) - 1) : 0;
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "second-layer")!;

  return (
    <TutorialLayout
      stepData={secondLayer}
      stepMeta={stepMeta}
      initialSubstepIndex={initialSubstepIndex}
    />
  );
}
