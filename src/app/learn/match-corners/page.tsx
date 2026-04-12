import { TutorialLayout } from "@/components/tutorial/TutorialLayout";
import { matchCorners, BEGINNER_STEPS } from "@/data/beginner";

export default async function MatchCornersPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const initialSubstepIndex = step ? Math.max(0, parseInt(step) - 1) : 0;
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "match-corners")!;

  return (
    <TutorialLayout
      stepData={matchCorners}
      stepMeta={stepMeta}
      initialSubstepIndex={initialSubstepIndex}
    />
  );
}
