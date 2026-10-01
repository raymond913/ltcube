import type { Metadata } from "next";
import { AlgorithmCasePage, type SectionDef } from "@/components/tutorial/AlgorithmCasePage";
import { twoLookOll, BEGINNER_STEPS } from "@/data/beginner";
import { LESSON_COPY } from "@/lib/lessonCopy";
import { parseStepIndex } from "@/lib/stepParam";

export const metadata: Metadata = { title: LESSON_COPY["two-look-oll"].name };

const OLL_SECTIONS: SectionDef[] = [
  {
    title: "Look 1 — Edge Orientation",
    description:
      "Identify the yellow-edge pattern on top. If you already have a yellow cross, skip to Look 2.",
    substepIds: ["oll-dot", "oll-l-shape", "oll-line"],
  },
  {
    title: "Look 2 — Corner Orientation",
    description:
      "The yellow cross is done. Count how many corner tops are yellow and match the pattern.",
    substepIds: [
      "oll-h",
      "oll-sune",
      "oll-antisune",
      "oll-pi",
      "oll-u",
      "oll-t",
      "oll-l",
    ],
  },
];

export default async function OllPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; case?: string }>;
}) {
  const { step, case: caseId } = await searchParams;
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "two-look-oll")!;

  const initialActiveId = caseId
    ? caseId
    : step
    ? twoLookOll.substeps[parseStepIndex(step, twoLookOll.substeps.length)]?.id
    : undefined;

  return (
    <AlgorithmCasePage
      stepData={twoLookOll}
      stepMeta={stepMeta}
      sections={OLL_SECTIONS}
      diagramType="oll"
      initialActiveId={initialActiveId}
    />
  );
}
