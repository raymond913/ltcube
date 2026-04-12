import { TutorialLayout } from "@/components/tutorial/TutorialLayout";
import { cross, BEGINNER_STEPS } from "@/data/beginner";

export default async function CrossPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const initialSubstepIndex = step ? Math.max(0, parseInt(step) - 1) : 0;
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "cross")!;

  return (
    <TutorialLayout
      stepData={cross}
      stepMeta={stepMeta}
      initialSubstepIndex={initialSubstepIndex}
      showViewToggle
    />
  );
}
