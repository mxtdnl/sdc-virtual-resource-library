import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { EXERCISES, getCategories } from "@/lib/exercises";
import { useSavedSlugs } from "@/lib/exercise-storage";
import { ClearMemoryButton } from "@/components/ClearMemoryDialog";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Coaching Exercise Library — Interactive Worksheets" },
      {
        name: "description",
        content:
          "A growing library of interactive coaching exercises. Pick one, work through it online, and walk away with a clear result.",
      },
      { property: "og:title", content: "Coaching Exercise Library" },
      {
        property: "og:description",
        content:
          "Interactive versions of coaching exercises — no printing required.",
      },
    ],
  }),
  component: LibraryHome,
});

function LibraryHome() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const categories = getCategories();
  const inProgress = useSavedSlugs();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      if (category && e.category !== category) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-gradient-to-b from-ink-ochre-soft/70 to-card/40 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-semibold tracking-tight text-ink-red-deep">
              Coaching Exercise Library
            </h1>
            <div className="flex items-center gap-2">
              <ClearMemoryButton />
              <ThemeToggle />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Interactive versions of coaching worksheets. Pick one, work through it
            online, and get a clear result without printing anything.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div className="space-y-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="w-full rounded-full border border-input bg-card px-4 py-2.5 text-sm shadow-sm outline-none placeholder:text-muted-foreground/80 focus:border-ink-orange focus:ring-2 focus:ring-ring"
          />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory(null)}
              className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                category === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">
            No exercises match your search.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {filtered.map((e) => (
              <li key={e.slug}>
                <Link
                  to="/exercise/$slug"
                  params={{ slug: e.slug }}
                  className="group block h-full rounded-xl border border-border bg-card p-6 shadow-[0_1px_0_oklch(0.4_0.075_58_/_8%)] transition-all hover:-translate-y-0.5 hover:border-ink-orange/50 hover:bg-secondary/50 hover:shadow-[0_10px_24px_-12px_oklch(0.44_0.165_27_/_35%)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs uppercase tracking-wider text-ink-orange font-semibold">
                      {e.category}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      {inProgress.has(e.slug) && (
                        <span className="rounded-full bg-ink-purple-soft px-2 py-0.5 text-[10px] font-medium text-ink-purple">
                          In progress
                        </span>
                      )}
                      ~{e.estimatedMinutes} min
                    </span>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold tracking-tight">
                    {e.title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {e.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {e.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-ink-brown-soft/60 px-2 py-0.5 text-[10px] text-ink-brown"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 text-sm font-medium text-primary">
                    Start exercise{" "}
                    <span className="inline-block transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {inProgress.size > 0 && (
          <p className="rounded-lg border border-ink-brown/25 bg-ink-brown-soft/50 px-4 py-3 text-center text-xs text-muted-foreground">
            {inProgress.size} exercise{inProgress.size === 1 ? "" : "s"} saved on this device.
            Nothing is uploaded — use “Clear memory” above to choose what to forget.
          </p>
        )}

        <p className="text-xs text-muted-foreground text-center pt-8">
          More exercises coming soon.
        </p>
      </main>
    </div>
  );
}
