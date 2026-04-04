import { TutorialLayout } from "@/components/tutorial/TutorialLayout";
import { whiteCorners, BEGINNER_STEPS } from "@/data/beginner";

export default async function WhiteCornersPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const initialSubstepIndex = step ? Math.max(0, parseInt(step) - 1) : 0;
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "white-corners")!;

  return (
    <TutorialLayout
      stepData={whiteCorners}
      stepMeta={stepMeta}
      initialSubstepIndex={initialSubstepIndex}
    />
  );
}
