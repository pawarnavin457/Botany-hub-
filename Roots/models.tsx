import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { MODELS } from "@/lib/content";
import { useHub } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Search = { open?: string };

export const Route = createFileRoute("/models")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    open: typeof search.open === "string" ? search.open : undefined,
  }),
  component: ModelsPage,
});

function ModelsPage() {
  const lang = useHub((s) => s.lang);
  const course = useHub((s) => s.course);
  const setCourse = useHub((s) => s.setCourse);
  const search = Route.useSearch();
  const list = MODELS[course];
  const papers = useMemo(() => ["All", ...new Set(list.map((m) => m.paper))], [list]);
  const [filter, setFilter] = useState("All");
  const [openId, setOpenId] = useState<string | null>(search.open ?? null);
  const visible = filter === "All" ? list : list.filter((m) => m.paper === filter);
  const active = list.find((m) => m.sketchfabId === openId) ?? MODELS.minor.find((m) => m.sketchfabId === openId);

  return (
    <div className="grid gap-6">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {lang === "hi" ? "इंटरैक्टिव विज़ुअल लाइब्रेरी" : "Interactive visual library"}
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          {lang === "hi" ? "3D लैब" : "3D Lab"}
        </h1>
        <p className="mt-3 text-muted">
          {lang === "hi"
            ? "मॉडल तभी लोड होते हैं जब आप उन्हें खोलते हैं — पेज हल्का रहता है।"
            : "Models load only when you open them, so the page stays light on phones."}
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {(["major", "minor"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCourse(c);
              setFilter("All");
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
      <div className="flex gap-2 overflow-x-auto pb-1">
        {papers.map((paper) => (
          <button
            key={paper}
            type="button"
            onClick={() => setFilter(paper)}
            className={cn(
              "h-9 shrink-0 rounded-full px-3 text-sm",
              filter === paper ? "bg-surface-2 text-fg" : "text-muted shadow-border",
            )}
          >
            {paper}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((model) => {
          const isOpen = openId === model.sketchfabId;
          return (
            <article
              key={`${model.paper}-${model.sketchfabId}-${model.name}`}
              className={cn(
                "overflow-hidden rounded-xl bg-surface text-left shadow-border transition-[box-shadow] hover:shadow-border-hover",
                isOpen && "sm:col-span-2 lg:col-span-1",
              )}
            >
              {isOpen ? (
                <div className="relative h-[280px] w-full bg-black sm:h-[320px] lg:h-[300px]">
                  <iframe
                    title={model.name}
                    className="absolute inset-0 h-full w-full border-0"
                    src={`https://sketchfab.com/models/${model.sketchfabId}/embed?autostart=1&ui_infos=0&ui_controls=1&ui_stop=1&preload=1`}
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    allowFullScreen={false}
                  />
                  <button
                    type="button"
                    onClick={() => setOpenId(null)}
                    className="absolute right-2 top-2 z-10 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/85"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="block w-full text-left"
                  onClick={() => setOpenId(model.sketchfabId)}
                >
                  <div className="relative">
                    <img
                      src={model.image}
                      alt=""
                      className="h-40 w-full object-cover brightness-[0.8]"
                      crossOrigin="anonymous"
                    />
                    <Badge className="absolute left-3 top-3">{model.paper}</Badge>
                  </div>
                </button>
              )}
              <div className="grid gap-1 p-4">
                <h2 className="font-display text-lg leading-tight">{model.name}</h2>
                <p className="text-sm text-muted">{model.blurb}</p>
                <p className="text-xs text-faint">{model.unit}</p>
                {isOpen ? (
                  <p className="pt-2 text-xs font-medium text-accent">Interactive 3D model · drag to rotate</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenId(model.sketchfabId)}
                    className="pt-2 text-left text-xs font-semibold text-accent hover:underline"
                  >
                    Open 3D model in this card →
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
