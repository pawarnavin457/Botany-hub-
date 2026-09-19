import { createFileRoute } from "@tanstack/react-router";
import { expectedFor, planFor, previousFor } from "@/lib/content";
import { useHub } from "@/lib/store";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/plan")({ component: PlanPage });

function PlanPage() {
  const lang = useHub((s) => s.lang);
  const plan = planFor(lang);
  const expected = expectedFor(lang);
  const previous = previousFor(lang);

  return (
    <div className="grid gap-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {lang === "hi" ? "स्मार्ट रिवीजन" : "Smart revision"}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          {lang === "hi" ? "10-दिन का एग्जाम प्लान" : "10-day exam plan"}
        </h1>
      </header>
      <ol className="grid gap-2">
        {plan.map(([day, task]) => (
          <li key={day} className="grid grid-cols-[7rem_1fr] items-start gap-3 rounded-lg bg-surface px-4 py-3 shadow-border">
            <span className="text-sm font-medium text-accent">{day}</span>
            <span className="text-sm">{task}</span>
          </li>
        ))}
      </ol>
      <section className="grid gap-3">
        <h2 className="font-display text-2xl">
          {lang === "hi" ? "अपेक्षित प्रश्न" : "Expected questions"}
        </h2>
        {expected.map((row) => (
          <Card key={row[1]} className="p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-faint">{row[0]}</p>
            <h3 className="mt-1 font-medium">{row[1]}</h3>
            <p className="mt-2 text-sm text-muted">{row[2]}</p>
          </Card>
        ))}
      </section>
      <section className="grid gap-3">
        <h2 className="font-display text-2xl">
          {lang === "hi" ? "पिछले वर्ष जैसा अभ्यास" : "Previous-year style"}
        </h2>
        {previous.map((row) => (
          <Card key={row[0]} className="p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-faint">{row[0]}</p>
            <h3 className="mt-1 font-medium">{row[1]}</h3>
            <p className="mt-2 text-sm text-muted">{row[2]}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
