import type { StepMeta } from "@/lib/tutorialTypes";

export const BEGINNER_STEPS: StepMeta[] = [
  {
    id: "cross",
    title: "White Cross",
    route: "/learn/cross",
    stepNumber: 1,
    estimatedMinutes: 15,
  },
  {
    id: "corners",
    title: "First Layer Corners",
    route: "/learn/corners",
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
    title: "OLL",
    route: "/learn/oll",
    stepNumber: 4,
    estimatedMinutes: 25,
  },
  {
    id: "two-look-pll",
    title: "PLL",
    route: "/learn/pll",
    stepNumber: 5,
    estimatedMinutes: 20,
  },
];

export { cross } from "./cross";
export { corners } from "./corners";
export { secondLayer } from "./second-layer";
export { twoLookOll } from "./two-look-oll";
export { twoLookPll } from "./two-look-pll";
