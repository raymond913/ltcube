import { TutorialLayout } from "@/components/tutorial/TutorialLayout";
import { firstLayer, BEGINNER_STEPS } from "@/data/beginner";

export default async function FirstLayerPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const initialSubstepIndex = step ? Math.max(0, parseInt(step) - 1) : 0;
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "first-layer")!;

  return (
    <TutorialLayout
      stepData={firstLayer}
      stepMeta={stepMeta}
      initialSubstepIndex={initialSubstepIndex}
    />
  );
}
