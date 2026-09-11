import { useMemo, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { GhostButton, IntroGrid, PrimaryButton, TextArea, TextInput } from "./_shared";

type Task = { id: string; text: string; phase: string };
const PHASES = ["Research", "Planning", "Doing", "Review", "Admin"];

export default function ProjectBreakdown() {
  const [project, setProject] = usePersistentState("project-breakdown", "project", "");
  const [deadline, setDeadline] = usePersistentState("project-breakdown", "deadline", "");
  const [tasks, setTasks] = usePersistentState<Task[]>("project-breakdown", "tasks", []);
  const [draft, setDraft] = usePersistentState("project-breakdown", "draft", "");
  const [draftPhase, setDraftPhase] = usePersistentState(
    "project-breakdown",
    "draftPhase",
    PHASES[0],
  );

  const add = () => {
    if (!draft.trim()) return;
    setTasks((t) => [...t, { id: crypto.randomUUID(), text: draft.trim(), phase: draftPhase }]);
    setDraft("");
  };

  const grouped = useMemo(() => {
    const g: Record<string, Task[]> = {};
    PHASES.forEach((p) => (g[p] = []));
    tasks.forEach((t) => (g[t.phase] ||= []).push(t));
    return g;
  }, [tasks]);

  return (
    <div className="space-y-8">
      <IntroGrid
        what="Take a large project and break it down into small, actionable tasks across its natural phases."
        why="Big projects feel daunting, leading to procrastination and underestimation. Smaller tasks keep motivation high and let you schedule realistically."
        how="Capture the project, then brainstorm every task. Group them into phases. No item is too small."
      />

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <TextInput
          placeholder="Project name (e.g. Final marketing report)"
          value={project}
          onChange={(e) => setProject(e.target.value)}
        />
        <TextInput
          placeholder="Deadline / key dates"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h3 className="text-sm font-semibold">Add a task</h3>
        <div className="flex flex-col md:flex-row gap-2">
          <TextInput
            placeholder="e.g. Decide on a topic"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <select
            value={draftPhase}
            onChange={(e) => setDraftPhase(e.target.value)}
            className="rounded-md border border-input bg-card px-3 py-2 text-sm"
          >
            {PHASES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <PrimaryButton onClick={add}>Add</PrimaryButton>
        </div>
        <p className="text-xs text-muted-foreground">
          Tip: think about phases (research, writing, editing) and categories (intro, data,
          conclusion). Email coach. Book room. Anything counts.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PHASES.map((p) => (
          <div key={p} className="rounded-xl border border-border bg-card p-4">
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              {p} <span className="text-foreground">({grouped[p].length})</span>
            </h4>
            <ul className="space-y-1">
              {grouped[p].map((t) => (
                <li key={t.id} className="flex items-start justify-between gap-2 text-sm">
                  <span>• {t.text}</span>
                  <button
                    onClick={() => setTasks((arr) => arr.filter((x) => x.id !== t.id))}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </li>
              ))}
              {grouped[p].length === 0 && (
                <li className="text-xs text-muted-foreground italic">No tasks yet</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {tasks.length >= 3 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
          <p className="text-sm">
            Nice — <strong>{tasks.length}</strong> tasks captured for {project || "your project"}.
            Now you can schedule them however suits you best.
          </p>
        </div>
      )}
    </div>
  );
}
