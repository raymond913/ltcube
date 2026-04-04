import { TutorialLayout } from "@/components/tutorial/TutorialLayout";
import { whiteCross, BEGINNER_STEPS } from "@/data/beginner";

export default async function WhiteCrossPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const initialSubstepIndex = step ? Math.max(0, parseInt(step) - 1) : 0;
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "white-cross")!;

  return (
    <TutorialLayout
      stepData={whiteCross}
      stepMeta={stepMeta}
      initialSubstepIndex={initialSubstepIndex}
    />
  );
}
