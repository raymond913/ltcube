import type { Metadata } from "next";
import { AlgorithmCasePage, type SectionDef } from "@/components/tutorial/AlgorithmCasePage";
import { twoLookPll, BEGINNER_STEPS } from "@/data/beginner";
import { LESSON_COPY } from "@/lib/lessonCopy";
import { parseStepIndex } from "@/lib/stepParam";

export const metadata: Metadata = { title: LESSON_COPY["two-look-pll"].name };

const PLL_SECTIONS: SectionDef[] = [
  {
    title: "Look 1 — Corner Permutation",
    description:
      "Look at the top-layer corner stickers from the sides. Find two corners that match each other, then check if the swap is adjacent or diagonal.",
    substepIds: ["pll-headlights", "pll-no-headlights"],
  },
  {
    title: "Look 2 — Edge Permutation",
    description:
      "After the corners are solved, identify the edge cycle. The one solved edge should face back before applying the algorithm.",
    substepIds: ["pll-ua", "pll-ub", "pll-h", "pll-z"],
  },
];

export default async function PllPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; case?: string }>;
}) {
  const { step, case: caseId } = await searchParams;
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "two-look-pll")!;

  const initialActiveId = caseId
    ? caseId
    : step
    ? twoLookPll.substeps[parseStepIndex(step, twoLookPll.substeps.length)]?.id
    : undefined;

  return (
    <AlgorithmCasePage
      stepData={twoLookPll}
      stepMeta={stepMeta}
      sections={PLL_SECTIONS}
      diagramType="pll"
      initialActiveId={initialActiveId}
    />
  );
}
