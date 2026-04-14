"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CubeViewer } from "@/components/cube/CubeViewer";
import { AlgorithmPlayer } from "@/components/cube/AlgorithmPlayer";
import { useCubeStore } from "@/stores/cubeStore";
import { useProgressStore } from "@/stores/progressStore";
import { twoLookOll } from "@/data/beginner/two-look-oll";
import { twoLookPll } from "@/data/beginner/two-look-pll";

// ---------------------------------------------------------------------------
// Types & data
// ---------------------------------------------------------------------------

type Category = "oll-edges" | "oll-corners" | "oll-all" | "pll-corners" | "pll-edges" | "pll-all";
type Phase = "setup" | "quiz" | "feedback" | "results";

interface QuizCase {
  id: string;
  title: string;
  algorithm: string;
  algorithmName: string;
  initialState: string;
}

interface RoundResult {
  caseId: string;
  caseTitle: string;
  correct: boolean;
  timeMs: number;
}

const toQuizCase = (s: NonNullable<typeof twoLookOll.substeps>[number]): QuizCase => ({
  id: s.id,
  title: s.title,
  algorithm: s.algorithm ?? "",
  algorithmName: s.algorithmName ?? s.title,
  initialState: s.initialState ?? "",
});

const OLL_EDGES = twoLookOll.substeps!.slice(0, 3).map(toQuizCase);
const OLL_CORNERS = twoLookOll.substeps!.slice(3).map(toQuizCase);
const OLL_ALL = [...OLL_EDGES, ...OLL_CORNERS];
const PLL_CORNERS = twoLookPll.substeps!.slice(0, 2).map(toQuizCase);
const PLL_EDGES = twoLookPll.substeps!.slice(2).map(toQuizCase);
const PLL_ALL = [...PLL_CORNERS, ...PLL_EDGES];

const CATEGORY_CASES: Record<Category, QuizCase[]> = {
  "oll-edges": OLL_EDGES,
  "oll-corners": OLL_CORNERS,
  "oll-all": OLL_ALL,
  "pll-corners": PLL_CORNERS,
  "pll-edges": PLL_EDGES,
  "pll-all": PLL_ALL,
};

const CATEGORY_LABELS: Record<Category, string> = {
  "oll-edges": "OLL Edges",
  "oll-corners": "OLL Corners",
  "oll-all": "OLL All",
  "pll-corners": "PLL Corners",
  "pll-edges": "PLL Edges",
  "pll-all": "PLL All",
};

const CATEGORY_COUNTS: Record<Category, number> = {
  "oll-edges": 3,
  "oll-corners": 7,
  "oll-all": 10,
  "pll-corners": 2,
  "pll-edges": 4,
  "pll-all": 6,
};

const ALL_CASES = [...OLL_ALL, ...PLL_ALL];
const ROUNDS = 10;
const TIMER_SECONDS = 15;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickChoices(correct: QuizCase, pool: QuizCase[]): QuizCase[] {
  const samePool = pool.filter((c) => c.id !== correct.id);
  const fallback = ALL_CASES.filter((c) => c.id !== correct.id && !samePool.includes(c));
  const wrongSource = [...samePool, ...(samePool.length < 3 ? fallback : [])];
  const wrongs = shuffle(wrongSource).slice(0, 3);
  return shuffle([correct, ...wrongs]);
}

function buildRounds(pool: QuizCase[]): QuizCase[] {
  if (pool.length === 0) return [];
  const rounds: QuizCase[] = [];
  for (let i = 0; i < ROUNDS; i++) {
    rounds.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  return rounds;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PatternTrainer() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [category, setCategory] = useState<Category>("oll-all");
  const [timed, setTimed] = useState(false);

  const [rounds, setRounds] = useState<QuizCase[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [choices, setChoices] = useState<QuizCase[]>([]);
  const [selected, setSelected] = useState<QuizCase | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [timerPct, setTimerPct] = useState(100);

  const roundStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const advanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recordTrainerSession = useProgressStore((s) => s.recordTrainerSession);
  const updateStreak = useProgressStore((s) => s.updateStreak);

  // Clear any pending timers
  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (advanceRef.current) { clearTimeout(advanceRef.current); advanceRef.current = null; }
  }, []);

  // Apply a case to the cube
  const applyCase = useCallback((c: QuizCase) => {
    useCubeStore.getState().reset();
    useCubeStore.getState().applyInstant(c.initialState);
  }, []);

  // Start a quiz round
  const startRound = useCallback((roundIdx: number, roundList: QuizCase[], pool: QuizCase[]) => {
    clearTimers();
    const c = roundList[roundIdx];
    applyCase(c);
    setChoices(pickChoices(c, pool));
    setSelected(null);
    setIsCorrect(null);
    setShowSolution(false);
    setTimerPct(100);
    roundStartRef.current = Date.now();

    if (timed) {
      const start = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.max(0, 100 - (elapsed / (TIMER_SECONDS * 1000)) * 100);
        setTimerPct(pct);
        if (pct <= 0) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          handleAnswer(null, roundIdx, roundList);
        }
      }, 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timed, clearTimers, applyCase]);

  const handleAnswer = useCallback(
    (picked: QuizCase | null, rIdx: number, roundList: QuizCase[]) => {
      clearTimers();
      const timeMs = Date.now() - roundStartRef.current;
      const correct = roundList[rIdx];
      const isRight = picked !== null && picked.id === correct.id;

      setSelected(picked);
      setIsCorrect(isRight);
      setPhase("feedback");

      const newResult: RoundResult = {
        caseId: correct.id,
        caseTitle: correct.title,
        correct: isRight,
        timeMs,
      };
      setResults((prev) => [...prev, newResult]);

      if (isRight) {
        advanceRef.current = setTimeout(() => {
          advanceRound(rIdx + 1, roundList);
        }, 1500);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clearTimers],
  );

  const advanceRound = useCallback(
    (nextIdx: number, roundList: QuizCase[]) => {
      if (nextIdx >= ROUNDS) {
        setPhase("results");
        return;
      }
      setRoundIndex(nextIdx);
      setPhase("quiz");
    },
    [],
  );

  // Start quiz
  const startQuiz = useCallback(() => {
    const pool = CATEGORY_CASES[category];
    const roundList = buildRounds(pool);
    setRounds(roundList);
    setRoundIndex(0);
    setResults([]);
    setPhase("quiz");
  }, [category]);

  // Load cube state when entering quiz phase
  useEffect(() => {
    if (phase === "quiz" && rounds.length > 0) {
      startRound(roundIndex, rounds, CATEGORY_CASES[category]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIndex, rounds]);

  // Save results when results phase reached
  useEffect(() => {
    if (phase === "results" && results.length > 0) {
      const correct = results.filter((r) => r.correct).length;
      const avgTime = Math.round(results.reduce((s, r) => s + r.timeMs, 0) / results.length);
      recordTrainerSession(correct, results.length, avgTime);
      updateStreak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Cleanup on unmount
  useEffect(() => () => clearTimers(), [clearTimers]);

  const currentCase = rounds[roundIndex];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (phase === "setup") {
    return <SetupScreen category={category} timed={timed} onCategoryChange={setCategory} onTimedChange={setTimed} onStart={startQuiz} />;
  }

  if (phase === "results") {
    const correct = results.filter((r) => r.correct).length;
    const avgTime = Math.round(results.reduce((s, r) => s + r.timeMs, 0) / results.length);
    const missed = results.filter((r) => !r.correct);
    return (
      <ResultsScreen
        correct={correct}
        total={results.length}
        avgTimeMs={avgTime}
        missed={missed}
        onTryAgain={startQuiz}
        onChangeSettings={() => setPhase("setup")}
      />
    );
  }

  // quiz or feedback
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Score + round */}
      <div className="flex w-full items-center justify-between">
        <span className="text-sm font-medium text-[#64748B]">
          Round {roundIndex + 1} / {ROUNDS}
        </span>
        <span className="text-sm font-semibold text-[#1E293B]">
          Score: {results.filter((r) => r.correct).length} / {results.length}
        </span>
      </div>

      {/* Timer bar */}
      {timed && phase === "quiz" && (
        <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-none"
            style={{
              width: `${timerPct}%`,
              backgroundColor: timerPct > 40 ? "#2563EB" : timerPct > 20 ? "#EAB308" : "#DC2626",
            }}
          />
        </div>
      )}

      {/* Cube */}
      <div
        className={`rounded-xl overflow-hidden transition-all duration-300 ${
          phase === "feedback" && isCorrect === true
            ? "ring-4 ring-[#16A34A] shadow-lg shadow-green-100"
            : phase === "feedback" && isCorrect === false
            ? "ring-4 ring-[#DC2626] shadow-lg shadow-red-100"
            : ""
        }`}
      >
        {showSolution && currentCase ? (
          <AlgorithmPlayer
            algorithm={currentCase.algorithm}
            initialStateAlg={currentCase.initialState}
            title={currentCase.title}
          />
        ) : (
          <CubeViewer size={300} interactive />
        )}
      </div>

      {/* Feedback message */}
      {phase === "feedback" && (
        <div
          className={`w-full rounded-lg px-4 py-3 text-sm font-medium ${
            isCorrect
              ? "bg-[#F0FDF4] border border-[#86EFAC] text-[#166534]"
              : "bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]"
          }`}
        >
          {isCorrect ? (
            <>
              Correct! <span className="font-semibold">{currentCase?.algorithmName}</span>
              {" — "}
              <span className="font-mono text-xs">{currentCase?.algorithm}</span>
            </>
          ) : (
            <>
              {selected === null ? "Time's up! " : "Incorrect. "}
              Answer: <span className="font-semibold">{currentCase?.title}</span>
              {" — "}
              <span className="font-mono text-xs">{currentCase?.algorithm}</span>
            </>
          )}
        </div>
      )}

      {/* Choices */}
      {phase === "quiz" && (
        <div className="grid grid-cols-2 gap-3 w-full">
          {choices.map((c) => (
            <button
              key={c.id}
              onClick={() => handleAnswer(c, roundIndex, rounds)}
              className="min-h-[44px] rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-medium text-[#1E293B] hover:bg-[#EFF6FF] hover:border-[#2563EB] transition-colors text-left"
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      {/* Feedback actions */}
      {phase === "feedback" && !isCorrect && (
        <div className="flex gap-3 w-full">
          <button
            onClick={() => setShowSolution((s) => !s)}
            className="flex-1 min-h-[44px] rounded-lg border border-[#2563EB] bg-white px-4 py-2.5 text-sm font-semibold text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
          >
            {showSolution ? "Hide Solution" : "Watch Solution"}
          </button>
          <button
            onClick={() => advanceRound(roundIndex + 1, rounds)}
            className="flex-1 min-h-[44px] rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
          >
            {roundIndex + 1 >= ROUNDS ? "See Results" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-screens
// ---------------------------------------------------------------------------

function SetupScreen({
  category,
  timed,
  onCategoryChange,
  onTimedChange,
  onStart,
}: {
  category: Category;
  timed: boolean;
  onCategoryChange: (c: Category) => void;
  onTimedChange: (t: boolean) => void;
  onStart: () => void;
}) {
  const cats: [Category, string][] = [
    ["oll-edges", `OLL Edges (${CATEGORY_COUNTS["oll-edges"]})`],
    ["oll-corners", `OLL Corners (${CATEGORY_COUNTS["oll-corners"]})`],
    ["oll-all", `OLL All (${CATEGORY_COUNTS["oll-all"]})`],
    ["pll-corners", `PLL Corners (${CATEGORY_COUNTS["pll-corners"]})`],
    ["pll-edges", `PLL Edges (${CATEGORY_COUNTS["pll-edges"]})`],
    ["pll-all", `PLL All (${CATEGORY_COUNTS["pll-all"]})`],
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      <div>
        <h2 className="text-lg font-semibold text-[#1E293B] mb-3">Choose category</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {cats.map(([key, label]) => (
            <button
              key={key}
              onClick={() => onCategoryChange(key)}
              className={`min-h-[44px] rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                category === key
                  ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                  : "border-[#E2E8F0] bg-white text-[#1E293B] hover:bg-[#F1F5F9]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-[#1E293B] mb-3">Timer</h2>
        <div className="flex gap-2">
          {(
            [
              [false, "Untimed"],
              [true, `Timed (${TIMER_SECONDS}s)`],
            ] as [boolean, string][]
          ).map(([val, label]) => (
            <button
              key={String(val)}
              onClick={() => onTimedChange(val)}
              className={`min-h-[44px] flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                timed === val
                  ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                  : "border-[#E2E8F0] bg-white text-[#1E293B] hover:bg-[#F1F5F9]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="min-h-[44px] w-full rounded-lg bg-[#2563EB] px-4 py-3 text-base font-semibold text-white hover:bg-[#1D4ED8] transition-colors shadow-sm"
      >
        Start — {ROUNDS} rounds of {CATEGORY_LABELS[category]}
      </button>
    </div>
  );
}

function ResultsScreen({
  correct,
  total,
  avgTimeMs,
  missed,
  onTryAgain,
  onChangeSettings,
}: {
  correct: number;
  total: number;
  avgTimeMs: number;
  missed: RoundResult[];
  onTryAgain: () => void;
  onChangeSettings: () => void;
}) {
  const pct = Math.round((correct / total) * 100);
  const avgSec = (avgTimeMs / 1000).toFixed(1);

  // Deduplicate missed cases
  const missedUniq = Array.from(new Map(missed.map((r) => [r.caseId, r])).values());

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-[#1E293B]">Results</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-[#2563EB]">{correct}/{total}</p>
            <p className="text-xs text-[#64748B] mt-1">Correct</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#1E293B]">{pct}%</p>
            <p className="text-xs text-[#64748B] mt-1">Accuracy</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-[#1E293B]">{avgSec}s</p>
            <p className="text-xs text-[#64748B] mt-1">Avg time</p>
          </div>
        </div>

        {missedUniq.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-[#1E293B] mb-2">Cases to review</p>
            <ul className="flex flex-col gap-1.5">
              {missedUniq.map((r) => (
                <li key={r.caseId} className="flex items-center gap-2 text-sm text-[#64748B]">
                  <span className="w-2 h-2 rounded-full bg-[#DC2626] shrink-0" />
                  {r.caseTitle}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onTryAgain}
          className="flex-1 min-h-[44px] rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onChangeSettings}
          className="flex-1 min-h-[44px] rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#1E293B] hover:bg-[#F1F5F9] transition-colors"
        >
          Change Settings
        </button>
      </div>
    </div>
  );
}
