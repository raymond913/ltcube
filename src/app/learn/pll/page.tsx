import { AlgorithmCasePage, type SectionDef } from "@/components/tutorial/AlgorithmCasePage";
import { twoLookPll, BEGINNER_STEPS } from "@/data/beginner";

const PLL_SECTIONS: SectionDef[] = [
  {
    title: "Look 1 — Corner Permutation",
    description:
      "Look at the top-layer corner stickers from the sides. Find two corners that match each other, then check if the swap is adjacent or diagonal.",
    substepIds: ["pll-adj", "pll-diag"],
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
  searchParams: Promise<{ step?: string }>;
}) {
  const { step } = await searchParams;
  const stepMeta = BEGINNER_STEPS.find((s) => s.id === "two-look-pll")!;

  const initialActiveId = step
    ? twoLookPll.substeps[Math.max(0, parseInt(step) - 1)]?.id
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
