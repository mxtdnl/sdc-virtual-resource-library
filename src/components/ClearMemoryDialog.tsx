import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EXERCISES } from "@/lib/exercises";
import { clearExercises, useSavedMemory, type SavedMemory } from "@/lib/exercise-storage";

type Row = SavedMemory & { title: string; category: string | null };

const TITLES = new Map(EXERCISES.map((e) => [e.slug, e] as const));

/** Saved entries, named and ordered the way the library lists them. */
function toRows(entries: SavedMemory[]): Row[] {
  const order = new Map(EXERCISES.map((e, i) => [e.slug, i] as const));
  return entries
    .map(({ slug, fields }) => {
      const exercise = TITLES.get(slug);
      return {
        slug,
        fields,
        // Data can outlive an exercise being renamed or retired; it still has
        // to be listable and clearable, so fall back to the raw slug.
        title: exercise?.title ?? slug,
        category: exercise?.category ?? null,
      };
    })
    .sort((a, b) => (order.get(a.slug) ?? Infinity) - (order.get(b.slug) ?? Infinity));
}

/**
 * "Clear memory" — shows exactly what is stored on this device, per exercise,
 * and clears whichever boxes the student ticks (or all of them).
 */
export function ClearMemoryDialog({ onClose }: { onClose: () => void }) {
  const entries = useSavedMemory();
  const rows = useMemo(() => toRows(entries), [entries]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [confirming, setConfirming] = useState(false);
  const [cleared, setCleared] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Anything cleared elsewhere (another tab, the exercise page) must not stay
  // ticked, or "Clear selected" would report a count it cannot deliver.
  useEffect(() => {
    const live = new Set(rows.map((r) => r.slug));
    setSelected((prev) => {
      const next = new Set([...prev].filter((slug) => live.has(slug)));
      return next.size === prev.size ? prev : next;
    });
  }, [rows]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    cardRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const someSelected = selected.size > 0 && !allSelected;

  // Indeterminate is a DOM property, not an attribute — React cannot set it.
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

  const toggle = useCallback((slug: string) => {
    setConfirming(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (!next.delete(slug)) next.add(slug);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setConfirming(false);
    setSelected((prev) =>
      prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.slug)),
    );
  }, [rows]);

  const clearSelected = () => {
    const count = selected.size;
    clearExercises(selected);
    setSelected(new Set());
    setConfirming(false);
    setCleared(count);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-memory-title"
        tabIndex={-1}
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-[0_24px_60px_-20px_oklch(0.44_0.165_27_/_45%)] outline-none"
      >
        <h2
          id="clear-memory-title"
          className="text-lg font-semibold tracking-tight text-ink-red-deep"
        >
          Clear memory
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          These exercises are storing your answers in this browser. Nothing is uploaded anywhere.
          Tick the ones you want to forget.
        </p>

        {rows.length === 0 ? (
          <p className="mt-6 rounded-lg border border-border bg-secondary/50 px-4 py-6 text-center text-sm text-muted-foreground">
            {cleared === null
              ? "No exercises are storing anything on this device."
              : `Cleared ${cleared} exercise${cleared === 1 ? "" : "s"}. Nothing is stored on this device now.`}
          </p>
        ) : (
          <>
            {cleared !== null && (
              <p
                role="status"
                className="mt-4 rounded-md bg-ink-purple-soft px-3 py-2 text-xs text-ink-purple"
              >
                Cleared {cleared} exercise{cleared === 1 ? "" : "s"}.
              </p>
            )}

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm font-medium hover:bg-secondary">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 shrink-0 accent-[var(--color-ink-red)]"
              />
              Select all ({rows.length})
            </label>

            <ul className="mt-2 space-y-1.5">
              {rows.map((row) => (
                <li key={row.slug}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm hover:border-border hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={selected.has(row.slug)}
                      onChange={() => toggle(row.slug)}
                      className="h-4 w-4 shrink-0 accent-[var(--color-ink-red)]"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{row.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {row.category ? `${row.category} · ` : ""}
                        {row.fields} saved item{row.fields === 1 ? "" : "s"}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2 text-sm">
          {confirming ? (
            <>
              <p className="mr-auto text-xs text-muted-foreground">
                Clear {selected.size} exercise{selected.size === 1 ? "" : "s"}? This cannot be
                undone.
              </p>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-md border border-border px-3 py-1.5 hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={clearSelected}
                className="rounded-md bg-destructive px-3 py-1.5 font-medium text-destructive-foreground hover:opacity-90"
              >
                Yes, clear {selected.size === rows.length ? "everything" : "selected"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-border px-3 py-1.5 hover:bg-secondary"
              >
                Close
              </button>
              {rows.length > 0 && (
                <button
                  type="button"
                  disabled={selected.size === 0}
                  onClick={() => setConfirming(true)}
                  className="rounded-md bg-destructive px-3 py-1.5 font-medium text-destructive-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear selected ({selected.size})
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** Library-header entry point: the button plus the card it opens. */
export function ClearMemoryButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const entries = useSavedMemory();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`no-print inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-ink-red/40 hover:bg-secondary hover:text-foreground ${className}`}
      >
        Clear memory
        {entries.length > 0 && (
          <span className="rounded-full bg-ink-purple-soft px-1.5 py-0.5 text-[10px] font-semibold text-ink-purple">
            {entries.length}
          </span>
        )}
      </button>
      {open && <ClearMemoryDialog onClose={() => setOpen(false)} />}
    </>
  );
}
