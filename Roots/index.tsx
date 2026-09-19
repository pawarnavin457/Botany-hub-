import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Boxes, Timer } from "lucide-react";
import { copy, unitsFor } from "@/lib/content";
import { useHub } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const lang = useHub((s) => s.lang);
  const course = useHub((s) => s.course);
  const year = useHub((s) => s.year);
  const setCourse = useHub((s) => s.setCourse);
  const setYear = useHub((s) => s.setYear);
  const completed = useHub((s) => s.completedUnits);
  const xp = useHub((s) => s.xp);
  const streak = useHub((s) => s.streak);
  const t = copy(lang);
  const units = unitsFor(lang);
  const growth = Math.round((completed.length / Math.max(1, units.length)) * 100);

  return (
    <div className="grid gap-10">
      <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {lang === "hi" ? "बी.एससी. बॉटनी · बरकतउल्लाह विश्वविद्यालय" : "B.Sc. Botany · Barkatullah University"}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,5.4rem)] leading-[0.95] tracking-[-0.04em]">
            {t.heroA}
            <span className="block text-muted">{t.heroB}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted">{t.heroP}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {(["1", "2", "3"] as const).map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={cn(
                  "h-10 rounded-full px-4 text-sm",
                  year === y ? "bg-accent text-accent-fg" : "bg-surface text-muted shadow-border",
                )}
              >
                {lang === "hi" ? `${y} वर्ष` : `Year ${y}`}
              </button>
            ))}
            {(["major", "minor"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCourse(c)}
                className={cn(
                  "h-10 rounded-full px-4 text-sm capitalize",
                  course === c ? "bg-surface-2 text-fg shadow-border-hover" : "text-muted shadow-border",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          {year !== "1" ? (
            <div className="mt-5 rounded-lg bg-surface p-4 text-sm text-muted shadow-border">
              {lang === "hi"
                ? "दूसरे और तीसरे वर्ष की सामग्री तैयार हो रही है। पहला वर्ष पूरी तरह उपलब्ध है।"
                : "Year 2 and Year 3 notes are being prepared. First-year material is fully available."}
            </div>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/notes">
                {t.start}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link to="/quiz">{lang === "hi" ? "क्विज़ शुरू करें" : "Start a quiz"}</Link>
            </Button>
          </div>
          <p className="mt-5 text-sm text-faint">
            {lang === "hi" ? "गाइड: प्रा. प्रियंका मैम" : "Guided by Prof. Priyanka Mam"}
          </p>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-elevated shadow-border">
          <img
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80"
            alt="Forest canopy used as the study portal visual"
            className="h-[min(420px,58vw)] w-full object-cover brightness-[0.72]"
            crossOrigin="anonymous"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/70 to-transparent p-5">
            <Badge>First year · Major & Minor</Badge>
            <h2 className="mt-2 font-display text-2xl">
              {lang === "hi" ? "एक यूनिट, एक स्पष्ट पाठ।" : "One unit. One clear lesson."}
            </h2>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { n: `${completed.length}/${units.length}`, l: t.progress },
          { n: `${xp}`, l: "XP" },
          { n: `${Math.max(streak, 0)}`, l: lang === "hi" ? "दिन की स्ट्रीक" : "Day streak" },
        ].map((stat) => (
          <Card key={stat.l} className="p-5">
            <div className="font-display text-3xl tabular-nums tracking-tight">{stat.n}</div>
            <div className="mt-1 text-sm text-muted">{stat.l}</div>
          </Card>
        ))}
      </section>

      <section className="rounded-xl bg-surface p-5 shadow-border">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-faint">
              {lang === "hi" ? "अधिगम वृक्ष" : "Learning tree"}
            </p>
            <h2 className="font-display text-2xl">{growth}% grown</h2>
          </div>
          <span className="text-sm text-muted tabular-nums">{completed.length} / {units.length}</span>
        </div>
        <Progress value={growth} />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <CardHeader>
            <BookOpen className="size-5 text-accent" />
            <CardTitle className="mt-3">{t.notesTitle}</CardTitle>
            <CardDescription>{t.notesP}</CardDescription>
          </CardHeader>
          <Button asChild className="mt-4" variant="secondary">
            <Link to="/notes">{lang === "hi" ? "नोट्स खोलें" : "Open notes"}</Link>
          </Button>
        </Card>
        <Card className="p-5">
          <CardHeader>
            <Boxes className="size-5 text-accent" />
            <CardTitle className="mt-3">{lang === "hi" ? "3D लैब" : "3D Lab"}</CardTitle>
            <CardDescription>
              {lang === "hi"
                ? "Sketchfab पर आधारित पाठ्यक्रम से जुड़े नमूने।"
                : "Syllabus-linked Sketchfab specimens, one model at a time."}
            </CardDescription>
          </CardHeader>
          <Button asChild className="mt-4" variant="secondary">
            <Link to="/models">{lang === "hi" ? "मॉडल देखें" : "Browse models"}</Link>
          </Button>
        </Card>
        <Card className="p-5">
          <CardHeader>
            <Timer className="size-5 text-accent" />
            <CardTitle className="mt-3">{lang === "hi" ? "30-सेकंड क्विज़" : "30-second quiz"}</CardTitle>
            <CardDescription>
              {lang === "hi"
                ? "मेजर और माइनर पेपर के लिए सिलेबस-आधारित प्रश्न।"
                : "Timed, paper-specific questions drawn from the uploaded syllabus."}
            </CardDescription>
          </CardHeader>
          <Button asChild className="mt-4" variant="secondary">
            <Link to="/quiz">{lang === "hi" ? "चुनौती लें" : "Take the challenge"}</Link>
          </Button>
        </Card>
      </section>
    </div>
  );
}
