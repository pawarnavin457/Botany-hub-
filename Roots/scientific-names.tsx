import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Leaf, Search } from "lucide-react";
import { SCIENTIFIC_NAMES } from "@/data/scientific-names";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/scientific-names")({ component: ScientificNamesPage });

function ScientificNamesPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SCIENTIFIC_NAMES.filter((name) => !q || name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Plant identification</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Scientific Names</h1>
        <p className="mt-3 max-w-2xl text-muted">A quick reference for scientific names appearing across the Botany Hub syllabus and study material.</p>
      </header>
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search a plant or scientific name…" className="pl-9" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((name) => (
          <Card key={name} className="flex items-center gap-3 p-4">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-dim text-accent"><Leaf className="size-4" /></div>
            <div><div className="font-medium italic">{name}</div><div className="text-xs text-muted">Botany Hub reference</div></div>
          </Card>
        ))}
      </div>
      {!filtered.length ? <p className="text-sm text-muted">No matching scientific name.</p> : null}
    </div>
  );
}
