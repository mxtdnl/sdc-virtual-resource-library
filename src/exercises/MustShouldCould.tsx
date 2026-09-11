import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { IntroGrid, TextInput, GhostButton } from "./_shared";

type Bucket = "must" | "should" | "could";
type Task = { id: string; text: string; bucket: Bucket; done: boolean };

const BUCKETS: { key: Bucket; label: string; blurb: string }[] = [
  { key: "must", label: "Must Do", blurb: "Non-negotiable. Real consequences if it slips." },
  { key: "should", label: "Should Do", blurb: "Important, but the world won't end today." },
  { key: "could", label: "Could Do", blurb: "Nice to have. Only if there's room." },
];

export default function MustShouldCould() {
  const [period, setPeriod] = usePersistentState("must-should-could", "period", "");
  const [draft, setDraft] = usePersistentState("must-should-could", "draft", "");
  const [tasks, setTasks] = usePersistentState<Task[]>("must-should-could", "tasks", []);
  const [dragId, setDragId] = useState<string | null>(null);

  const add = (bucket: Bucket) => {
    const text = draft.trim();
    if (!text) return;
    setTasks((t) => [...t, { id: crypto.randomUUID(), text, bucket, done: false }]);
    setDraft("");
  };
  const move = (id: string, bucket: Bucket) =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, bucket } : x)));
  const toggle = (id: string) =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const remove = (id: string) => setTasks((t) => t.filter((x) => x.id !== id));

  const cycle = (task: Task) => {
    const order: Bucket[] = ["must", "should", "could"];
    move(task.id, order[(order.indexOf(task.bucket) + 1) % 3]);
  };

  return (
    <div className="space-y-8">
      <IntroGrid
        what="A fast way to sort everything on your plate into three levels of importance: Must Do, Should Do, Could Do."
        why="When the list is long it's hard to know where to start — and planning shouldn't eat the time you need for the work. This takes 10-15 minutes."
        how={
          <ol className="list-decimal pl-4 space-y-1.5">
            <li>Name the period (day, week, month).</li>
            <li>Add each task into a column.</li>
            <li>Drag between columns as priorities shift.</li>
            <li>Start with Must Do.</li>
          </ol>
        }
      />

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
          <TextInput
            placeholder="List for… (e.g. this week)"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          />
          <div className="flex gap-2">
            <TextInput
              placeholder="Add a task…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") add("must");
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-muted-foreground self-center">Add to:</span>
          {BUCKETS.map((b) => (
            <GhostButton key={b.key} onClick={() => add(b.key)} disabled={!draft.trim()}>
              {b.label}
            </GhostButton>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {BUCKETS.map((b, i) => {
          const items = tasks.filter((t) => t.bucket === b.key);
          return (
            <div
              key={b.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) move(dragId, b.key);
                setDragId(null);
              }}
              className="rounded-2xl border border-border bg-card p-4 min-h-56"
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold">{b.label}</h3>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{b.blurb}</p>
              <div
                className="mt-2 h-1 rounded-full"
                style={{ background: "var(--primary)", opacity: 1 - i * 0.3 }}
              />
              <ul className="mt-3 space-y-2">
                {items.map((t) => (
                  <li
                    key={t.id}
                    draggable
                    onDragStart={() => setDragId(t.id)}
                    onDragEnd={() => setDragId(null)}
                    className="group flex items-start gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm cursor-grab active:cursor-grabbing"
                  >
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggle(t.id)}
                      className="mt-0.5"
                    />
                    <span
                      className={`flex-1 ${t.done ? "line-through text-muted-foreground" : ""}`}
                    >
                      {t.text}
                    </span>
                    <button
                      onClick={() => cycle(t)}
                      title="Move to next column"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      →
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </li>
                ))}
                {items.length === 0 && (
                  <li className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                    Drop tasks here
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>

      {tasks.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => window.print()}
            className="rounded-full border border-border bg-card px-5 py-2 text-sm hover:bg-secondary"
          >
            Print / Save PDF
          </button>
        </div>
      )}
      {period && <p className="text-xs text-muted-foreground">List for {period}</p>}
    </div>
  );
}
