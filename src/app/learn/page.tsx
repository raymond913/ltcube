import Link from "next/link";

const steps = [
  {
    href: "/learn/white-cross",
    number: 1,
    title: "White Cross",
    description: "Form a cross on the white face by placing all four white edge pieces.",
  },
  {
    href: "/learn/white-corners",
    number: 2,
    title: "White Corners",
    description: "Complete the white face by inserting the four white corner pieces.",
  },
  {
    href: "/learn/second-layer",
    number: 3,
    title: "Second Layer",
    description: "Solve the middle layer by inserting the four edge pieces.",
  },
  {
    href: "/learn/oll",
    number: 4,
    title: "2-Look OLL",
    description: "Orient the last layer — first the cross, then the corners (10 cases).",
  },
  {
    href: "/learn/pll",
    number: 5,
    title: "2-Look PLL",
    description: "Permute the last layer — corners first, then edges (6 cases).",
  },
];

export default function LearnPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Beginner Method</h1>
        <p className="mt-2 text-[#64748B]">
          Learn to solve the cube in five stages using the layer-by-layer method.
          Work through each step in order.
        </p>
      </div>
      <ol className="flex flex-col gap-3">
        {steps.map((step) => (
          <li key={step.href}>
            <Link
              href={step.href}
              className="flex items-start gap-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm hover:border-[#2563EB] hover:shadow-md transition-all group"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] font-bold text-sm flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                {step.number}
              </span>
              <div>
                <p className="font-semibold text-[#1E293B]">{step.title}</p>
                <p className="text-sm text-[#64748B] mt-0.5">{step.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
