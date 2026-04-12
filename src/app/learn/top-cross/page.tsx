import { TutorialLayout } from "@/components/tutorial/TutorialLayout";
import { topCross, BEGINNER_STEPS } from "@/data/beginner";

export default async function TopCrossPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const initialSubstepIndex = step ? Math.max(0, parseInt(step) - 1) : 0;
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "top-cross")!;

  return (
    <TutorialLayout
      stepData={topCross}
      stepMeta={stepMeta}
      initialSubstepIndex={initialSubstepIndex}
    />
  );
}
