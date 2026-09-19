import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { QUIZ_POOL, papersByCourse, type Course } from "@/lib/content";
import { useHub } from "@/lib/store";
import { cn, shuffle } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/quiz")({ component: QuizPage });

type Phase = "setup" | "play" | "result";

function QuizPage() {
  const lang = useHub((s) => s.lang);
  const course = useHub((s) => s.course);
  const setCourse = useHub((s) => s.setCourse);
  const studentName = useHub((s) => s.studentName);
  const setStudentName = useHub((s) => s.setStudentName);
  const usedQuizIds = useHub((s) => s.usedQuizIds);
  const consumeQuizIds = useHub((s) => s.consumeQuizIds);
  const resetQuizKey = useHub((s) => s.resetQuizKey);
  const addXp = useHub((s) => s.addXp);
  const papers = papersByCourse[course];
  const [paper, setPaper] = useState(papers[0]?.paper ?? "Major Paper I");
  const [size, setSize] = useState(10);
  const [phase, setPhase] = useState<Phase>("setup");
  const [round, setRound] = useState<typeof QUIZ_POOL>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [seconds, setSeconds] = useState(30);
  const [review, setReview] = useState(false);

  useEffect(() => {
    if (!papers.some((p) => p.paper === paper)) setPaper(papers[0]!.paper);
  }, [course, paper, papers]);

  const current = round[idx];
  const options = useMemo(
    () => (current ? current.options.map((label, i) => ({ label, i })) : []),
    [current],
  );

  useEffect(() => {
    if (phase !== "play" || picked !== null) return undefined;
    setSeconds(30);
    const timer = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, idx, picked]);

  useEffect(() => {
    if (phase === "play" && seconds === 0 && picked === null) {
      lockAnswer(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, phase, picked]);

  function start() {
    const key = `${course}:${paper}`;
    const pool = QUIZ_POOL.filter((q) => q.course === course && q.paper === paper);
    let used = usedQuizIds[key] ?? [];
    let fresh = pool.filter((q) => !used.includes(q.id));
    if (!fresh.length) {
      resetQuizKey(key);
      used = [];
      fresh = pool;
    }
    const next = shuffle(fresh).slice(0, Math.min(size, fresh.length));
    consumeQuizIds(
      key,
      next.map((q) => q.id),
    );
    setRound(next);
    setIdx(0);
    setScore(0);
    setAnswers([]);
    setPicked(null);
    setReview(false);
    setPhase("play");
  }

  function finishRound(finalScore: number) {
    addXp(finalScore * 12);
    setPhase("result");
  }

  function lockAnswer(choice: number) {
    if (!current || picked !== null) return;
    setPicked(choice);
    const correct = choice === current.answer;
    const nextScore = score + (correct ? 1 : 0);
    if (correct) setScore(nextScore);
    setAnswers((a) => [...a, choice]);
    window.setTimeout(() => {
      if (idx + 1 >= round.length) finishRound(nextScore);
      else {
        setIdx((i) => i + 1);
        setPicked(null);
      }
    }, 650);
  }

  if (phase === "play" && current) {
    return (
      <div className="mx-auto grid max-w-2xl gap-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-faint">{paper}</p>
            <h1 className="font-display text-2xl tabular-nums">
              {lang === "hi" ? "प्रश्न" : "Question"} {idx + 1} / {round.length}
            </h1>
          </div>
          <div className="grid size-16 place-items-center rounded-full bg-surface font-display text-2xl tabular-nums shadow-border">
            {seconds}
          </div>
        </div>
        <Progress value={(seconds / 30) * 100} />
        <Card className="p-5">
          <p className="text-lg leading-snug">{current.question}</p>
          <div className="mt-5 grid gap-2">
            {options.map((opt) => {
              const state =
                picked === null
                  ? ""
                  : opt.i === current.answer
                    ? "bg-accent-dim text-accent"
                    : opt.i === picked
                      ? "bg-surface-2 text-danger"
                      : "";
              return (
                <button
                  key={opt.i}
                  type="button"
                  disabled={picked !== null}
                  onClick={() => lockAnswer(opt.i)}
                  className={cn(
                    "min-h-12 rounded-lg px-4 py-3 text-left text-sm shadow-border",
                    state || "bg-surface-2 hover:shadow-border-hover",
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Card>
        <Button variant="ghost" onClick={() => setPhase("setup")}>
          {lang === "hi" ? "रद्द करें" : "Cancel"}
        </Button>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="mx-auto grid max-w-xl gap-5 text-center">
        <Badge className="mx-auto">Quiz complete</Badge>
        <h1 className="font-display text-4xl">{lang === "hi" ? "अच्छा प्रयास।" : "Strong attempt."}</h1>
        <p className="font-display text-5xl tabular-nums text-accent">
          {score}/{round.length}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={start}>{lang === "hi" ? "फिर से" : "Restart"}</Button>
          <Button variant="secondary" onClick={() => setPhase("setup")}>
            {lang === "hi" ? "पेपर बदलें" : "Change paper"}
          </Button>
          <Button variant="outline" onClick={() => setReview((v) => !v)}>
            {lang === "hi" ? "उत्तर देखें" : "Review"}
          </Button>
        </div>
        {review ? (
          <div className="grid gap-2 text-left">
            {round.map((q, i) => (
              <Card key={q.id} className="p-4">
                <p className="text-sm">{q.question}</p>
                <p className="mt-2 text-xs text-accent">
                  {q.options[q.answer]}
                  {answers[i] !== q.answer ? (
                    <span className="ml-2 text-muted">
                      · {lang === "hi" ? "आपका उत्तर गलत" : "your pick missed"}
                    </span>
                  ) : null}
                </p>
              </Card>
            ))}
          </div>
        ) : null}
        <Certificate
          name={studentName || (lang === "hi" ? "बॉटनी विद्यार्थी" : "Botany student")}
          paper={paper}
          score={`${score}/${round.length}`}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {lang === "hi" ? "30-सेकंड चुनौती" : "30-second challenge"}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          {lang === "hi" ? "अपनी क्विज़ चुनें।" : "Choose your quiz."}
        </h1>
      </header>
      <div className="flex gap-2">
        {(["major", "minor"] as Course[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCourse(c)}
            className={cn(
              "h-10 rounded-full px-4 text-sm capitalize",
              course === c ? "bg-accent text-accent-fg" : "bg-surface text-muted shadow-border",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-2">
        {papers.map((p) => (
          <button
            key={p.paper}
            type="button"
            onClick={() => setPaper(p.paper)}
            className={cn(
              "rounded-xl p-4 text-left shadow-border",
              paper === p.paper ? "bg-elevated" : "bg-surface",
            )}
          >
            <b>{p.paper}</b>
            <span className="mt-1 block text-sm text-muted">{p.label}</span>
          </button>
        ))}
      </div>
      <Input
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
        placeholder={lang === "hi" ? "प्रमाणपत्र के लिए नाम (वैकल्पिक)" : "Name for the certificate (optional)"}
      />
      <label className="grid gap-2 text-sm text-muted">
        {lang === "hi" ? "प्रश्नों की संख्या" : "Questions"}
        <select
          className="h-11 rounded-md bg-surface-2 px-3 text-fg shadow-border"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        >
          {[5, 10, 15].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <Button size="lg" onClick={start}>
        {lang === "hi" ? "चुनौती शुरू करें" : "Start 30-second challenge"}
      </Button>
    </div>
  );
}

function Certificate({ name, paper, score }: { name: string; paper: string; score: string }) {
  const date = new Date().toLocaleDateString();
  return (
    <div className="certificate-print rounded-xl p-8 text-left shadow-border">
      <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">Botany Hub Multai</p>
      <h2 className="mt-3 font-display text-3xl text-ink">Certificate of revision</h2>
      <p className="mt-4 text-sm text-ink-muted">
        This certifies that <b>{name}</b> completed a timed Botany quiz in <b>{paper}</b> with a score of{" "}
        <b>{score}</b> on {date}.
      </p>
      <Button className="mt-5" variant="secondary" onClick={() => window.print()}>
        Print / save
      </Button>
    </div>
  );
}
