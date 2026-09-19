import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { EVO, MORPH, PLANTS, RUSH } from "@/lib/content";
import { useHub } from "@/lib/store";
import { shuffle } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/games")({ component: GamesPage });

type GameId = "specimen" | "morph" | "evolution" | "rush" | null;

export function GamesPage() {
  const lang = useHub((s) => s.lang);
  const addXp = useHub((s) => s.addXp);
  const [game, setGame] = useState<GameId>(null);

  return (
    <div className="grid gap-6">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {lang === "hi" ? "खेलकर सीखें" : "Learn by playing"}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          {lang === "hi" ? "गेम एरिना" : "Game Arena"}
        </h1>
        <p className="mt-3 text-muted">
          {lang === "hi"
            ? "नमूना पहचान, आकृति-विज्ञान, विकास क्रम और 60-सेकंड रिवीजन।"
            : "Specimen ID, practical morphology, evolution order and a 60-second rush."}
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { id: "specimen" as const, title: lang === "hi" ? "पौधा जासूस" : "Plant detective", meta: "10 specimens" },
          { id: "morph" as const, title: lang === "hi" ? "आकृति-विज्ञान लैब" : "Morphology lab", meta: "15 terms" },
          { id: "evolution" as const, title: lang === "hi" ? "विकास पथ" : "Evolution trail", meta: "10 missions" },
          { id: "rush" as const, title: lang === "hi" ? "बॉटनी रश" : "Botany rush", meta: "60 seconds" },
        ].map((card) => (
          <Card key={card.id} className="p-5">
            <Badge variant="muted">{card.meta}</Badge>
            <h2 className="mt-3 font-display text-2xl">{card.title}</h2>
            <Button className="mt-4" onClick={() => setGame(card.id)}>
              {lang === "hi" ? "खेलें" : "Play"}
            </Button>
          </Card>
        ))}
      </div>
      <Dialog open={game !== null} onOpenChange={(v) => !v && setGame(null)}>
        <DialogContent className="max-w-3xl">
          {game === "specimen" ? <SpecimenRound onXp={addXp} /> : null}
          {game === "morph" ? <MorphRound onXp={addXp} /> : null}
          {game === "evolution" ? <EvoRound onXp={addXp} /> : null}
          {game === "rush" ? <RushRound onXp={addXp} /> : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Result({ title, xp }: { title: string; xp: number }) {
  return (
    <div className="grid gap-3 py-6 text-center">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="tabular-nums">{xp} XP this round</DialogDescription>
      </DialogHeader>
    </div>
  );
}

function ChoiceGrid({
  options,
  onPick,
  disabled,
  correct,
  picked,
}: {
  options: string[];
  onPick: (opt: string) => void;
  disabled: boolean;
  correct?: string;
  picked?: string | null;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onPick(opt)}
          className={cn(
            "min-h-12 rounded-md px-3 py-2 text-left text-sm shadow-border",
            picked && opt === correct && "bg-accent-dim text-accent",
            picked === opt && opt !== correct && "text-danger",
            !picked && "bg-surface-2 hover:shadow-border-hover",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SpecimenRound({ onXp }: { onXp: (n: number) => void }) {
  const round = useMemo(() => shuffle(PLANTS).slice(0, 10), []);
  const [i, setI] = useState(0);
  const [xp, setXp] = useState(0);
  const [lock, setLock] = useState<string | null>(null);
  const plant = round[i];
  const opts = useMemo(() => (plant ? shuffle(plant[4]) : []), [i, plant]);
  if (!plant) return <Result title="Specimen round complete" xp={xp} />;
  return (
    <div className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Identify this specimen</DialogTitle>
        <DialogDescription>
          {i + 1} / {round.length} · {xp} XP
        </DialogDescription>
      </DialogHeader>
      <img src={plant[3]} alt="" className="h-52 w-full rounded-lg object-cover" crossOrigin="anonymous" />
      <p className="text-sm text-muted">{plant[5]}</p>
      <ChoiceGrid
        options={opts}
        disabled={Boolean(lock)}
        correct={plant[0]}
        picked={lock}
        onPick={(opt) => {
          const ok = opt === plant[0];
          setLock(opt);
          const nextXp = xp + (ok ? 25 : 0);
          setXp(nextXp);
          window.setTimeout(() => {
            if (i + 1 >= round.length) onXp(nextXp);
            setI((n) => n + 1);
            setLock(null);
          }, 500);
        }}
      />
    </div>
  );
}

function MorphRound({ onXp }: { onXp: (n: number) => void }) {
  const round = useMemo(() => shuffle(MORPH).slice(0, 15), []);
  const [i, setI] = useState(0);
  const [xp, setXp] = useState(0);
  const [lock, setLock] = useState<string | null>(null);
  const q = round[i];
  const opts = useMemo(() => (q ? shuffle(q[2]) : []), [i, q]);
  if (!q) return <Result title="Morphology lab complete" xp={xp} />;
  return (
    <div className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Match the practical term</DialogTitle>
        <DialogDescription>
          {i + 1} / {round.length}
        </DialogDescription>
      </DialogHeader>
      <p className="text-lg">{q[0]}</p>
      <ChoiceGrid
        options={opts}
        disabled={Boolean(lock)}
        correct={q[1]}
        picked={lock}
        onPick={(opt) => {
          const ok = opt === q[1];
          setLock(opt);
          const nextXp = xp + (ok ? 20 : 0);
          setXp(nextXp);
          window.setTimeout(() => {
            if (i + 1 >= round.length) onXp(nextXp);
            setI((n) => n + 1);
            setLock(null);
          }, 450);
        }}
      />
    </div>
  );
}

function EvoRound({ onXp }: { onXp: (n: number) => void }) {
  const round = useMemo(() => shuffle(EVO).slice(0, 10), []);
  const [i, setI] = useState(0);
  const [xp, setXp] = useState(0);
  const [lock, setLock] = useState<string | null>(null);
  const q = round[i];
  const opts = useMemo(() => (q ? shuffle(q[2]) : []), [i, q]);
  if (!q) return <Result title="Evolution trail complete" xp={xp} />;
  return (
    <div className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{q[0]}</DialogTitle>
        <DialogDescription>
          Mission {i + 1} / {round.length}
        </DialogDescription>
      </DialogHeader>
      <ChoiceGrid
        options={opts}
        disabled={Boolean(lock)}
        correct={q[1]}
        picked={lock}
        onPick={(opt) => {
          const ok = opt === q[1];
          setLock(opt);
          const nextXp = xp + (ok ? 8 : 0);
          setXp(nextXp);
          window.setTimeout(() => {
            if (i + 1 >= round.length) onXp(nextXp);
            setI((n) => n + 1);
            setLock(null);
          }, 400);
        }}
      />
    </div>
  );
}

function RushRound({ onXp }: { onXp: (n: number) => void }) {
  const round = useMemo(() => shuffle(RUSH).slice(0, 20), []);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const [done, setDone] = useState(false);
  const q = round[i];
  const opts = useMemo(() => (q ? shuffle(q[1]) : []), [i, q]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setTime((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          setDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    if (done) onXp(score * 5);
  }, [done, onXp, score]);

  if (done || !q) return <Result title={time <= 0 ? "Time up" : "Rush complete"} xp={score * 5} />;

  return (
    <div className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Botany rush</DialogTitle>
        <DialogDescription className="tabular-nums">
          {time}s · {score} correct
        </DialogDescription>
      </DialogHeader>
      <p className="text-lg">{q[0]}</p>
      <ChoiceGrid
        options={opts}
        disabled={false}
        onPick={(opt) => {
          const ok = opt === q[2];
          const nextScore = score + (ok ? 1 : 0);
          setScore(nextScore);
          if (i + 1 >= round.length) {
            setDone(true);
            return;
          }
          setI((n) => n + 1);
        }}
      />
    </div>
  );
}
