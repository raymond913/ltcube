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
    id: "first-layer",
    title: "First Layer Corners",
    route: "/learn/first-layer",
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
    id: "top-cross",
    title: "Top Cross",
    route: "/learn/top-cross",
    stepNumber: 4,
    estimatedMinutes: 10,
  },
  {
    id: "match-cross",
    title: "Match Cross",
    route: "/learn/match-cross",
    stepNumber: 5,
    estimatedMinutes: 10,
  },
  {
    id: "match-corners",
    title: "Match Corners",
    route: "/learn/match-corners",
    stepNumber: 6,
    estimatedMinutes: 15,
  },
  {
    id: "solve",
    title: "Solve",
    route: "/learn/solve",
    stepNumber: 7,
    estimatedMinutes: 15,
  },
];

export { cross } from "./cross";
export { firstLayer } from "./first-layer";
export { secondLayer } from "./second-layer";
export { topCross } from "./top-cross";
export { matchCross } from "./match-cross";
export { matchCorners } from "./match-corners";
export { solve } from "./solve";
