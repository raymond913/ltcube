import { TutorialLayout } from "@/components/tutorial/TutorialLayout";
import { matchCross, BEGINNER_STEPS } from "@/data/beginner";

export default async function MatchCrossPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const initialSubstepIndex = step ? Math.max(0, parseInt(step) - 1) : 0;
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "match-cross")!;

  return (
    <TutorialLayout
      stepData={matchCross}
      stepMeta={stepMeta}
      initialSubstepIndex={initialSubstepIndex}
    />
  );
}
