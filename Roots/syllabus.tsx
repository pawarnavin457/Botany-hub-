import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { syllabusFor } from "@/lib/content";
import { useHub } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PDF_DATA } from "@/data/pdf-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Search = { course?: "major" | "minor"; paper?: string };

export const Route = createFileRoute("/syllabus")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    course: search.course === "minor" ? "minor" : search.course === "major" ? "major" : undefined,
    paper: typeof search.paper === "string" ? search.paper : undefined,
  }),
  component: SyllabusPage,
});

function SyllabusPage() {
  const lang = useHub((s) => s.lang);
  const course = useHub((s) => s.course);
  const setCourse = useHub((s) => s.setCourse);
  const search = Route.useSearch();
  const papers = syllabusFor(course);
  const [paperId, setPaperId] = useState(search.paper ?? papers[0]?.id ?? "");

  useEffect(() => {
    const requestedCourse = search.course;
    if (requestedCourse && requestedCourse !== course) {
      setCourse(requestedCourse);
      return;
    }
    if (search.paper && papers.some((p) => p.id === search.paper)) {
      setPaperId(search.paper);
      return;
    }
    if (!papers.some((p) => p.id === paperId)) setPaperId(papers[0]?.id ?? "");
  }, [search.course, search.paper, course, papers, paperId, setCourse]);
  const [pdfKey, setPdfKey] = useState<string | null>(null);
  const paper = useMemo(
    () => papers.find((p) => p.id === paperId) ?? papers[0],
    [papers, paperId],
  );

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {lang === "hi" ? "आधिकारिक सिलेबस संरचना" : "Official syllabus structure"}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          {lang === "hi" ? "सिलेबस" : "Syllabus"}
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          {lang === "hi"
            ? "बी.एससी. प्रथम वर्ष · बरकतउल्लाह विश्वविद्यालय · मेजर और माइनर पेपर।"
            : "B.Sc. first year · Barkatullah University · Major and Minor papers, unit by unit."}
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {(["major", "minor"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCourse(c);
              setPaperId(syllabusFor(c)[0]?.id ?? "");
            }}
            className={cn(
              "h-10 rounded-full px-4 text-sm capitalize",
              course === c ? "bg-accent text-accent-fg" : "bg-surface text-muted shadow-border",
            )}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {papers.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPaperId(item.id)}
            className={cn(
              "rounded-xl p-4 text-left shadow-border",
              item.id === paper?.id ? "bg-elevated" : "bg-surface",
            )}
          >
            <Badge variant="muted">{item.label}</Badge>
            <h2 className="mt-2 font-display text-lg leading-tight">{item.title}</h2>
            <p className="mt-1 text-xs text-muted">{item.meta}</p>
          </button>
        ))}
      </div>
      {paper ? (
        <Card className="grid gap-5 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl">{paper.title}</h2>
              <p className="text-sm text-muted">{paper.meta}</p>
            </div>
            {Object.keys(PDF_DATA[paper.id as keyof typeof PDF_DATA] ?? {}).length ? (
              <div className="flex flex-wrap gap-2">
                {Object.keys(PDF_DATA[paper.id as keyof typeof PDF_DATA] ?? {}).map((key) => (
                  <Button key={key} size="sm" variant="secondary" onClick={() => setPdfKey(`${paper.id}:${key}`)}>Open Unit {key} PDF</Button>
                ))}
              </div>
            ) : null}
          </div>
          {paper.units.map(([title, items]) => (
            <section key={title}>
              <h3 className="text-sm font-semibold text-accent">{title}</h3>
              <ul className="mt-2 grid gap-1.5 text-sm text-fg">
                {items.map((item) => (
                  <li key={item} className="rounded-md bg-surface-2 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </Card>
      ) : null}
      <Dialog open={Boolean(pdfKey)} onOpenChange={(open) => !open && setPdfKey(null)}>
        <DialogContent className="max-w-5xl p-0">
          <DialogHeader className="p-5 pb-2">
            <DialogTitle>Syllabus PDF</DialogTitle>
          </DialogHeader>
          {pdfKey ? (() => {
            const [paperIdForPdf, key] = pdfKey.split(":");
            const paperData = PDF_DATA[paperIdForPdf as keyof typeof PDF_DATA];
            const data = paperData ? (paperData as Record<string, string>)[key] : undefined;
            return data ? <iframe title={`Syllabus ${paperIdForPdf} unit ${key}`} src={data} className="h-[78vh] w-full border-0 bg-white" /> : null;
          })() : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
