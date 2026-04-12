import { TutorialLayout } from "@/components/tutorial/TutorialLayout";
import { solve, BEGINNER_STEPS } from "@/data/beginner";

export default async function SolvePage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const initialSubstepIndex = step ? Math.max(0, parseInt(step) - 1) : 0;
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "solve")!;

  return (
    <TutorialLayout
      stepData={solve}
      stepMeta={stepMeta}
      initialSubstepIndex={initialSubstepIndex}
    />
  );
}
