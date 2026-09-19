import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { copy, unitById } from "@/lib/content";
import { useHub } from "@/lib/store";
import { NotesHtml } from "@/components/NotesHtml";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/notes/$unitId")({ component: UnitPage });

function UnitPage() {
  const { unitId } = Route.useParams();
  const lang = useHub((s) => s.lang);
  const t = copy(lang);
  const unit = unitById(lang, unitId);
  const completed = useHub((s) => s.completedUnits);
  const markUnit = useHub((s) => s.markUnit);
  if (!unit) throw notFound();
  const done = completed.includes(unit.id);

  return (
    <div className="grid gap-6">
      <Link to="/notes" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" />
        {lang === "hi" ? "सभी यूनिट" : "All units"}
      </Link>
      <header className="overflow-hidden rounded-xl bg-surface shadow-border">
        <img
          src={unit.img}
          alt=""
          className="h-44 w-full object-cover brightness-[0.7] sm:h-56"
          crossOrigin="anonymous"
        />
        <div className="grid gap-3 p-5 sm:p-6">
          <Badge>{unit.roman}</Badge>
          <h1 className="font-display text-3xl tracking-tight">{unit.title}</h1>
          <p className="max-w-2xl text-sm text-muted">{unit.sub}</p>
          <div>
            <Button
              variant={done ? "secondary" : "default"}
              onClick={() => markUnit(unit.id)}
              disabled={done}
            >
              <Check />
              {done ? t.done : t.complete}
            </Button>
          </div>
        </div>
      </header>
      <div className="grid gap-3">
        {unit.topics.map((topic) => (
          <details
            key={topic[0]}
            id={topic[0]}
            className="group rounded-xl bg-surface p-2 shadow-border open:bg-elevated"
          >
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 rounded-lg px-3 py-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-md bg-surface-2 text-xs font-semibold text-accent">
                {topic[0]}
              </span>
              <span className="min-w-0">
                <span className="block font-medium leading-tight">{topic[1]}</span>
                <span className="block text-sm text-muted">{topic[2]}</span>
              </span>
            </summary>
            <div className="px-3 pb-4 pt-1">
              <NotesHtml html={topic[3]} />
              {topic[4] ? (
                <p className="mt-4 rounded-md bg-surface-2 px-3 py-3 text-sm text-muted">
                  <span className="mr-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                    {t.diagram}
                  </span>
                  {topic[4]}
                </p>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
