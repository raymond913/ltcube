"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CubeViewer } from "@/components/cube/CubeViewer";
import { AlgorithmPlayer } from "@/components/cube/AlgorithmPlayer";
import { useCubeStore } from "@/stores/cubeStore";
import { useProgressStore } from "@/stores/progressStore";
import { twoLookOll } from "@/data/beginner/two-look-oll";
import { twoLookPll } from "@/data/beginner/two-look-pll";

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

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (advanceRef.current) { clearTimeout(advanceRef.current); advanceRef.current = null; }
  }, []);

  const applyCase = useCallback((c: QuizCase) => {
    useCubeStore.getState().reset();
    useCubeStore.getState().applyInstant(c.initialState);
  }, []);

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

  const startQuiz = useCallback(() => {
    const pool = CATEGORY_CASES[category];
    const roundList = buildRounds(pool);
    setRounds(roundList);
    setRoundIndex(0);
    setResults([]);
    setPhase("quiz");
  }, [category]);

  useEffect(() => {
    if (phase === "quiz" && rounds.length > 0) {
      startRound(roundIndex, rounds, CATEGORY_CASES[category]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIndex, rounds]);

  useEffect(() => {
    if (phase === "results" && results.length > 0) {
      const correct = results.filter((r) => r.correct).length;
      const avgTime = Math.round(results.reduce((s, r) => s + r.timeMs, 0) / results.length);
      recordTrainerSession(correct, results.length, avgTime);
      updateStreak();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const currentCase = rounds[roundIndex];

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

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Score + round */}
      <div className="flex w-full items-center justify-between">
        <span className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
          Round {roundIndex + 1} / {ROUNDS}
        </span>
        <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          Score: {results.filter((r) => r.correct).length} / {results.length}
        </span>
      </div>

      {/* Timer bar */}
      {timed && phase === "quiz" && (
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: "var(--color-border-subtle)" }}
        >
          <div
            className="h-full rounded-full transition-none"
            style={{
              width: `${timerPct}%`,
              backgroundColor: timerPct > 40 ? "#2563EB" : timerPct > 20 ? "#EAB308" : "#DC2626",
            }}
          />
        </div>
      )}

      {/* Cube with feedback ring */}
      <div
        className="rounded-xl overflow-hidden transition-all duration-300"
        style={
          phase === "feedback" && isCorrect === true
            ? { outline: "4px solid #15803D", outlineOffset: "2px" }
            : phase === "feedback" && isCorrect === false
            ? { outline: "4px solid #DC2626", outlineOffset: "2px" }
            : {}
        }
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

      {/* Screen-reader live region for feedback */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {phase === "feedback" && (isCorrect
          ? `Correct! ${currentCase?.algorithmName}`
          : `${selected === null ? "Time's up." : "Incorrect."} Answer: ${currentCase?.title}`
        )}
        {phase === "quiz" && currentCase && `Question ${roundIndex + 1}: Identify the case`}
      </div>

      {/* Feedback message */}
      {phase === "feedback" && (
        <div
          className="w-full rounded-lg px-4 py-3 text-sm font-medium"
          style={
            isCorrect
              ? {
                  background: "rgba(21,128,61,0.07)",
                  border: "1px solid rgba(21,128,61,0.22)",
                  color: "#15803D",
                }
              : {
                  background: "rgba(220,38,38,0.07)",
                  border: "1px solid rgba(220,38,38,0.22)",
                  color: "#DC2626",
                }
          }
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
              className="ltc-hover-choice min-h-[44px] rounded-lg px-4 py-3 text-sm font-medium text-left transition-all duration-150"
              style={{
                background: "var(--color-surface-elevated)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
              }}
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
            className="ltc-hover-blue flex-1 min-h-[44px] rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150"
            style={{
              background: "var(--color-surface-elevated)",
              border: "1px solid #2563EB",
              color: "#2563EB",
            }}
          >
            {showSolution ? "Hide Solution" : "Watch Solution"}
          </button>
          <button
            onClick={() => advanceRound(roundIndex + 1, rounds)}
            className="ltc-hover-primary flex-1 min-h-[44px] rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150"
            style={{ backgroundColor: "#2563EB" }}
          >
            {roundIndex + 1 >= ROUNDS ? "See Results" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

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
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--color-text)" }}>
          Choose category
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {cats.map(([key, label]) => (
            <button
              key={key}
              onClick={() => onCategoryChange(key)}
              className={`min-h-[44px] rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 ${category !== key ? "ltc-hover-subtle" : ""}`}
              style={
                category === key
                  ? {
                      background: "var(--color-primary-light)",
                      border: "1px solid #2563EB",
                      color: "#2563EB",
                    }
                  : {
                      background: "var(--color-surface-elevated)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--color-text)" }}>
          Timer
        </h2>
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
              className={`min-h-[44px] flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 ${timed !== val ? "ltc-hover-subtle" : ""}`}
              style={
                timed === val
                  ? {
                      background: "var(--color-primary-light)",
                      border: "1px solid #2563EB",
                      color: "#2563EB",
                    }
                  : {
                      background: "var(--color-surface-elevated)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                    }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="ltc-hover-primary min-h-[44px] w-full rounded-lg px-4 py-3 text-base font-semibold text-white transition-colors"
        style={{
          backgroundColor: "#2563EB",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
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

  const missedUniq = Array.from(new Map(missed.map((r) => [r.caseId, r])).values());

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      <div
        className="rounded-xl p-6 flex flex-col gap-4"
        style={{
          background: "var(--color-surface-elevated)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h2 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>Results</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-display text-3xl font-bold" style={{ color: "#2563EB" }}>
              {correct}/{total}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>Correct</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold" style={{ color: "var(--color-text)" }}>
              {pct}%
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>Accuracy</p>
          </div>
          <div>
            <p className="font-display text-3xl font-bold" style={{ color: "var(--color-text)" }}>
              {avgSec}s
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--color-muted)" }}>Avg time</p>
          </div>
        </div>

        {missedUniq.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-text)" }}>
              Cases to review
            </p>
            <ul className="flex flex-col gap-1.5">
              {missedUniq.map((r) => (
                <li key={r.caseId} className="flex items-center gap-2 text-sm" style={{ color: "var(--color-muted)" }}>
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "#DC2626" }} />
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
          className="ltc-hover-primary flex-1 min-h-[44px] rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150"
          style={{ backgroundColor: "#2563EB" }}
        >
          Try Again
        </button>
        <button
          onClick={onChangeSettings}
          className="ltc-hover-subtle flex-1 min-h-[44px] rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-150"
          style={{
            background: "var(--color-surface-elevated)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        >
          Change Settings
        </button>
      </div>
    </div>
  );
}
