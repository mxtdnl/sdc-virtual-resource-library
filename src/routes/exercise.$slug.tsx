import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getExercise } from "@/lib/exercises";
import { clearExercise, useHasSavedWork } from "@/lib/exercise-storage";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/exercise/$slug")({
  loader: ({ params }) => {
    const exercise = getExercise(params.slug);
    if (!exercise) throw notFound();
    // Return only serializable metadata; the component is resolved client-side.
    return {
      slug: exercise.slug,
      title: exercise.title,
      description: exercise.description,
      category: exercise.category,
      tags: exercise.tags,
      estimatedMinutes: exercise.estimatedMinutes,
    };
  },
  head: ({ loaderData }) => {
    const e = loaderData;
    if (!e) return { meta: [{ title: "Exercise not found" }] };
    return {
      meta: [
        { title: `${e.title} — Coaching Exercise Library` },
        { name: "description", content: e.description },
        { property: "og:title", content: e.title },
        { property: "og:description", content: e.description },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Exercise not found</h1>
        <Link to="/" className="text-sm text-primary hover:underline">
          ← Back to library
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen grid place-items-center bg-background text-foreground p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  ),
  component: ExercisePage,
});

function ExercisePage() {
  const meta = Route.useLoaderData();
  const exercise = getExercise(meta.slug);
  if (!exercise) throw notFound();
  const Component = exercise.component;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="no-print border-b border-border bg-gradient-to-b from-ink-ochre-soft/70 to-card/40 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
              ← Library
            </Link>
            <h1 className="text-lg font-semibold tracking-tight truncate text-ink-red-deep">
              {exercise.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground whitespace-nowrap sm:inline">
              {exercise.category} · ~{exercise.estimatedMinutes} min
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Printed summaries carry their own heading block; nothing else prints. */}
      <div className="hidden print:block px-6 pt-6">
        <h1 className="text-xl font-semibold">{exercise.title}</h1>
        <p className="text-sm">
          {exercise.category} · {new Date().toLocaleDateString()}
        </p>
      </div>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <ExerciseHost slug={meta.slug} Component={Component} />
      </main>
    </div>
  );
}

/**
 * Hosts the exercise and owns the "clear my answers" affordance.
 *
 * Clearing wipes the saved fields and then bumps `generation`, which is used as
 * the component's React key. Remounting is what resets the in-memory state:
 * each persisted field re-reads storage on mount and finds nothing, so the
 * exercise comes back at its defaults.
 */
function ExerciseHost({ slug, Component }: { slug: string; Component: React.ComponentType }) {
  const [generation, setGeneration] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const saved = useHasSavedWork(slug);

  const clear = () => {
    clearExercise(slug);
    setGeneration((g) => g + 1);
    setConfirming(false);
  };

  return (
    <>
      {saved && (
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-ink-brown/25 bg-ink-brown-soft/50 px-4 py-2.5 text-xs">
          <p className="text-muted-foreground">
            <span aria-hidden="true">💾 </span>
            Your answers are saved on this device only — they are never uploaded.
          </p>
          {confirming ? (
            <span className="flex items-center gap-2">
              <span className="text-muted-foreground">Clear your answers?</span>
              <button
                onClick={clear}
                className="rounded-md bg-destructive px-2.5 py-1 font-medium text-destructive-foreground hover:opacity-90"
              >
                Yes, clear
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-md border border-border px-2.5 py-1 hover:bg-secondary"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="rounded-md border border-border px-2.5 py-1 hover:bg-secondary"
            >
              Clear saved answers
            </button>
          )}
        </div>
      )}
      <Component key={generation} />
    </>
  );
}
