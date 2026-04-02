export default function SecondLayerPage() {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-sm font-medium text-[#2563EB]">Step 3 of 5</span>
      <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Second Layer</h1>
      <p className="text-[#64748B]">
        Solve the middle layer by inserting the four edge pieces into their
        correct positions using two mirror algorithms.
      </p>
      <p className="text-sm text-[#64748B] bg-[#F8FAFC] rounded-lg px-4 py-3 border border-[#E2E8F0]">
        Interactive 3D tutorial with step-by-step algorithm playback will be
        built in Phases 2–4.
      </p>
    </div>
  );
}
