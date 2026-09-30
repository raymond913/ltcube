export interface LessonCopy {
  name: string;
  summary: string;
}

export const LESSON_COPY: Record<string, LessonCopy> = {
  cross: {
    name: "White cross",
    summary: "Make a plus sign with the four white edge pieces.",
  },
  corners: {
    name: "First-layer corners",
    summary: "Fit the four white corners to finish the first layer.",
  },
  "second-layer": {
    name: "Second layer",
    summary: "Slide the four middle edge pieces into place.",
  },
  "two-look-oll": {
    name: "Top face (OLL)",
    summary: "Turn the last layer until the whole top face is yellow.",
  },
  "two-look-pll": {
    name: "Last pieces (PLL)",
    summary: "Move the last pieces into their right spots. Then you're done.",
  },
};
