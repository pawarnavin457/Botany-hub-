import { createFileRoute, Link } from "@tanstack/react-router";
import { copy, unitsFor } from "@/lib/content";
import { useHub } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/notes")({ component: NotesIndex });

function NotesIndex() {
  const lang = useHub((s) => s.lang);
  const completed = useHub((s) => s.completedUnits);
  const t = copy(lang);
  const units = unitsFor(lang);

  return (
    <div className="grid gap-6">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{t.notesKicker}</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">{t.notesTitle}</h1>
        <p className="mt-3 text-muted">{t.notesP}</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {units.map((unit) => {
          const done = completed.includes(unit.id);
          return (
            <Link key={unit.id} to="/notes/$unitId" params={{ unitId: unit.id }}>
              <Card className="overflow-hidden p-0 transition-[box-shadow] hover:shadow-border-hover">
                <img
                  src={unit.img}
                  alt=""
                  className="h-36 w-full object-cover brightness-[0.78]"
                  crossOrigin="anonymous"
                />
                <div className="grid gap-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={done ? "default" : "muted"}>{unit.roman}</Badge>
                    {done ? <span className="text-xs text-accent">{t.done}</span> : null}
                  </div>
                  <h2 className="font-display text-xl leading-tight">{unit.title}</h2>
                  <p className="text-sm text-muted">{unit.sub}</p>
                  <p className="text-xs text-faint">{unit.topics.length} topics</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
