import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { IntroGrid, PrimaryButton, TextInput } from "./_shared";

type Q = "do" | "schedule" | "delegate" | "delete";
type Task = { id: string; text: string; q: Q | "unsorted" };

const META: Record<Q, { title: string; sub: string; eg: string; tone: string; ring: string }> = {
  do: {
    title: "Do Now",
    sub: "Important · Urgent",
    eg: "Assignments, team meetings, wellbeing",
    tone: "border-primary/40 bg-primary/5",
    ring: "ring-primary",
  },
  schedule: {
    title: "Schedule It",
    sub: "Important · Not Urgent",
    eg: "Self-reflection, socialising, training",
    tone: "border-ink-purple/40 bg-ink-purple/5",
    ring: "ring-ink-purple",
  },
  delegate: {
    title: "Delegate",
    sub: "Not Important · Urgent",
    eg: "Chores, replying to emails",
    tone: "border-ink-orange/40 bg-ink-orange/5",
    ring: "ring-ink-orange",
  },
  delete: {
    title: "Delete or Reduce",
    sub: "Not Important · Not Urgent",
    eg: "Doomscrolling, over-analysis",
    tone: "border-muted bg-card",
    ring: "ring-muted-foreground",
  },
};

export default function UrgentImportant() {
  const [tasks, setTasks] = usePersistentState<Task[]>("urgent-important-matrix", "tasks", []);
  const [draft, setDraft] = usePersistentState("urgent-important-matrix", "draft", "");
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverQ, setHoverQ] = useState<Q | "tray" | null>(null);

  const add = () => {
    if (!draft.trim()) return;
    setTasks((t) => [...t, { id: crypto.randomUUID(), text: draft.trim(), q: "unsorted" }]);
    setDraft("");
  };

  const move = (id: string, q: Q | "unsorted") =>
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, q } : x)));
  const remove = (id: string) => setTasks((t) => t.filter((x) => x.id !== id));

  const unsorted = tasks.filter((t) => t.q === "unsorted");

  return (
    <div className="space-y-8">
      <IntroGrid
        what="The Eisenhower Matrix — sort each task by urgency and importance to decide what actually deserves your attention."
        why="Research shows we naturally favour urgent-but-unimportant tasks over important ones with bigger payoffs. This makes the trade-off visible."
        how="Add tasks, then drag each card into the right quadrant. Drag back to the tray to reset."
      />

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col md:flex-row gap-2">
          <TextInput
            placeholder="Add a task…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <PrimaryButton onClick={add}>Add</PrimaryButton>
        </div>
      </div>

      {/* Tray */}
      <div
        className={`rounded-xl border-2 border-dashed p-4 min-h-[80px] transition-colors ${hoverQ === "tray" ? "border-primary bg-primary/5" : "border-border bg-card"}`}
        onDragOver={(e) => {
          e.preventDefault();
          setHoverQ("tray");
        }}
        onDragLeave={() => setHoverQ(null)}
        onDrop={() => {
          if (dragId) move(dragId, "unsorted");
          setDragId(null);
          setHoverQ(null);
        }}
      >
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
          Unsorted — drag into a quadrant ↓
        </p>
        <div className="flex flex-wrap gap-2">
          {unsorted.length === 0 && (
            <p className="text-xs italic text-muted-foreground">No tasks to sort.</p>
          )}
          {unsorted.map((t) => (
            <TaskChip
              key={t.id}
              task={t}
              onDragStart={setDragId}
              onDragEnd={() => setDragId(null)}
              onRemove={() => remove(t.id)}
            />
          ))}
        </div>
      </div>

      {/* 2x2 matrix with axis labels */}
      <div className="relative">
        <div className="hidden md:flex absolute -top-7 left-0 right-0 justify-around text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          <span>← Urgent</span>
          <span>Not Urgent →</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(["do", "schedule", "delegate", "delete"] as Q[]).map((k) => {
            const items = tasks.filter((t) => t.q === k);
            const hot = hoverQ === k;
            return (
              <div
                key={k}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoverQ(k);
                }}
                onDragLeave={() => setHoverQ(null)}
                onDrop={() => {
                  if (dragId) move(dragId, k);
                  setDragId(null);
                  setHoverQ(null);
                }}
                className={`relative rounded-xl border-2 p-4 min-h-[180px] transition-all ${META[k].tone} ${hot ? `ring-2 ${META[k].ring} scale-[1.01]` : ""}`}
              >
                <h4 className="font-semibold">{META[k].title}</h4>
                <p className="text-xs text-muted-foreground">{META[k].sub}</p>
                <p className="text-xs italic text-muted-foreground/80 mt-0.5">e.g. {META[k].eg}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {items.map((t) => (
                    <TaskChip
                      key={t.id}
                      task={t}
                      onDragStart={setDragId}
                      onDragEnd={() => setDragId(null)}
                      onRemove={() => remove(t.id)}
                    />
                  ))}
                  {items.length === 0 && (
                    <p className="text-xs italic text-muted-foreground/70">Drop tasks here</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="hidden md:block absolute -left-6 top-0 bottom-0">
          <div
            className="h-full flex flex-col justify-around text-xs uppercase tracking-wider text-muted-foreground font-semibold"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            <span>Important ↑</span>
            <span>↓ Not Important</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskChip({
  task,
  onDragStart,
  onDragEnd,
  onRemove,
}: {
  task: Task;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onRemove: () => void;
}) {
  return (
    <span
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-background/80 px-2.5 py-1.5 text-sm shadow-sm cursor-grab active:cursor-grabbing hover:border-primary"
    >
      <span className="text-muted-foreground/60 text-xs">⋮⋮</span>
      {task.text}
      <button
        onClick={onRemove}
        className="text-xs text-muted-foreground hover:text-destructive"
        title="Remove"
      >
        ×
      </button>
    </span>
  );
}
