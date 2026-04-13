import { TutorialLayout } from "@/components/tutorial/TutorialLayout";
import { corners, BEGINNER_STEPS } from "@/data/beginner";

export default async function CornersPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const initialSubstepIndex = step ? Math.max(0, parseInt(step) - 1) : 0;
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "corners")!;

  return (
    <TutorialLayout
      stepData={corners}
      stepMeta={stepMeta}
      initialSubstepIndex={initialSubstepIndex}
    />
  );
}
