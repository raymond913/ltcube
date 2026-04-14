import { PatternTrainer } from "@/components/trainer/PatternTrainer";

export default function TrainerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#1E293B]">Trainer</h1>
        <p className="mt-1 text-[#64748B]">
          Identify OLL and PLL cases — 10 rounds, track your score and time.
        </p>
      </div>
      <PatternTrainer />
    </div>
  );
}
