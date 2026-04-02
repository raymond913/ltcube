import type { StepMeta } from "@/lib/tutorialTypes";

export const BEGINNER_STEPS: StepMeta[] = [
  {
    id: "white-cross",
    title: "White Cross",
    route: "/learn/white-cross",
    stepNumber: 1,
    estimatedMinutes: 15,
  },
  {
    id: "white-corners",
    title: "White Corners",
    route: "/learn/white-corners",
    stepNumber: 2,
    estimatedMinutes: 20,
  },
  {
    id: "second-layer",
    title: "Second Layer",
    route: "/learn/second-layer",
    stepNumber: 3,
    estimatedMinutes: 20,
  },
  {
    id: "two-look-oll",
    title: "2-Look OLL",
    route: "/learn/oll",
    stepNumber: 4,
    estimatedMinutes: 25,
    caseCount: 10,
  },
  {
    id: "two-look-pll",
    title: "2-Look PLL",
    route: "/learn/pll",
    stepNumber: 5,
    estimatedMinutes: 20,
    caseCount: 6,
  },
];

export { whiteCross } from "./white-cross";
export { whiteCorners } from "./white-corners";
export { secondLayer } from "./second-layer";
export { twoLookOll } from "./two-look-oll";
export { twoLookPll } from "./two-look-pll";
