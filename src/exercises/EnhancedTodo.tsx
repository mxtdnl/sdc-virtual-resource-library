import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { IntroGrid, TextInput, PrimaryButton } from "./_shared";

type Priority = "A" | "B" | "C" | "D";
type Row = {
  id: string;
  priority: Priority;
  task: string;
  estimate: string;
  actual: string;
  done: boolean;
};

const PRIORITIES: Priority[] = ["A", "B", "C", "D"];
const PRIORITY_OPACITY: Record<Priority, number> = { A: 1, B: 0.75, C: 0.5, D: 0.3 };

const parseMins = (s: string) => {
  const m = s.match(/(\d+(?:\.\d+)?)\s*(h|hr|hour|m|min)?/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = (m[2] ?? "m").toLowerCase();
  return unit.startsWith("h") ? n * 60 : n;
};

export default function EnhancedTodo() {
  const [period, setPeriod] = usePersistentState("enhanced-to-do-list", "period", "");
  const [rows, setRows] = usePersistentState<Row[]>("enhanced-to-do-list", "rows", []);
  const [draft, setDraft] = usePersistentState("enhanced-to-do-list", "draft", {
    priority: "A" as Priority,
    task: "",
    estimate: "",
  });

  const add = () => {
    if (!draft.task.trim()) return;
    setRows((r) => [
      ...r,
      {
        id: crypto.randomUUID(),
        priority: draft.priority,
        task: draft.task.trim(),
        estimate: draft.estimate.trim(),
        actual: "",
        done: false,
      },
    ]);
    setDraft({ priority: draft.priority, task: "", estimate: "" });
  };
  const update = (id: string, patch: Partial<Row>) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const remove = (id: string) => setRows((r) => r.filter((x) => x.id !== id));

  const sorted = [...rows].sort(
    (a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority),
  );

  const totalEst = rows.reduce((s, r) => s + (parseMins(r.estimate) ?? 0), 0);
  const compared = rows.filter((r) => parseMins(r.estimate) && parseMins(r.actual));
  const drift = compared.length
    ? Math.round(
        compared.reduce((s, r) => s + (parseMins(r.actual)! - parseMins(r.estimate)!), 0) /
          compared.length,
      )
    : null;

  return (
    <div className="space-y-8">
      <IntroGrid
        what="An upgraded to-do list: every task carries a priority (A–D), a time estimate, and — once done — how long it actually took."
        why="A flat list gets overwhelming fast. Priorities tell you what to hit first; time estimates let you schedule realistically, and comparing estimate vs. actual sharpens your planning over time."
        how={
          <ol className="list-decimal pl-4 space-y-1.5">
            <li>Set the period this list covers.</li>
            <li>Add single tasks (not whole projects) with a priority and estimate.</li>
            <li>Tick tasks off and log the real time.</li>
            <li>Compare — were you faster or slower than expected?</li>
          </ol>
        }
      />

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <TextInput
          placeholder="To-do list for… (day, week, month)"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-[auto_1fr_140px_auto] sm:items-center">
          <div className="flex gap-1">
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setDraft((d) => ({ ...d, priority: p }))}
                className={`h-9 w-9 rounded-full text-sm font-semibold border ${
                  draft.priority === p
                    ? "border-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
                style={
                  draft.priority === p
                    ? { background: "var(--primary)", opacity: PRIORITY_OPACITY[p] + 0.0 }
                    : undefined
                }
              >
                {p}
              </button>
            ))}
          </div>
          <TextInput
            placeholder="Single task, not a whole project"
            value={draft.task}
            onChange={(e) => setDraft((d) => ({ ...d, task: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
          />
          <TextInput
            placeholder="Est. e.g. 45m"
            value={draft.estimate}
            onChange={(e) => setDraft((d) => ({ ...d, estimate: e.target.value }))}
          />
          <PrimaryButton onClick={add} disabled={!draft.task.trim()}>
            Add
          </PrimaryButton>
        </div>
        <p className="text-xs text-muted-foreground">A is the highest priority, D the lowest.</p>
      </div>

      {rows.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left w-16">Priority</th>
                <th className="px-4 py-3 text-left">Task</th>
                <th className="px-4 py-3 text-left w-28">Estimate</th>
                <th className="px-4 py-3 text-left w-28">Actual</th>
                <th className="px-4 py-3 text-left w-20">Done</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-2">
                    <span
                      className="inline-grid h-7 w-7 place-items-center rounded-full text-xs font-semibold text-primary-foreground"
                      style={{
                        background: "var(--primary)",
                        opacity: PRIORITY_OPACITY[r.priority],
                      }}
                    >
                      {r.priority}
                    </span>
                  </td>
                  <td className={`px-4 py-2 ${r.done ? "line-through text-muted-foreground" : ""}`}>
                    {r.task}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{r.estimate || "—"}</td>
                  <td className="px-4 py-2">
                    <input
                      value={r.actual}
                      onChange={(e) => update(r.id, { actual: e.target.value })}
                      placeholder="—"
                      className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={r.done}
                      onChange={(e) => update(r.id, { done: e.target.checked })}
                    />
                  </td>
                  <td className="px-2">
                    <button
                      onClick={() => remove(r.id)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rows.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Stat
            label="Tasks"
            value={`${rows.filter((r) => r.done).length} / ${rows.length} done`}
          />
          <Stat
            label="Estimated time"
            value={totalEst ? `${Math.round(totalEst / 6) / 10} h` : "—"}
          />
          <Stat
            label="Estimate accuracy"
            value={
              drift === null
                ? "Log actuals"
                : drift === 0
                  ? "Spot on"
                  : drift > 0
                    ? `+${drift} min slower`
                    : `${-drift} min faster`
            }
          />
        </div>
      )}

      {rows.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => window.print()}
            className="rounded-full border border-border bg-card px-5 py-2 text-sm hover:bg-secondary"
          >
            Print / Save PDF
          </button>
        </div>
      )}
      {period && <p className="text-xs text-muted-foreground">To-do list for {period}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
