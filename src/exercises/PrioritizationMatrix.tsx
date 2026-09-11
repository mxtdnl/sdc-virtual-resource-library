import { useMemo, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const EXAMPLE_TASKS = [
  "Reading for Thursday class",
  "Finish assignment (due Wednesday)",
  "Go shopping for food",
  "Talk to Careers about internships",
  "Team project prep (Finish intro for Friday)",
  "Type up notes from Monday",
  "Go to Oxford Circus to buy new running shoes",
  "Plan dinner with Sam",
  "Call parents",
  "Gym",
];

type Step = "what" | "tasks" | "compare" | "results";

export default function PrioritizationMatrix() {
  const [step, setStep] = usePersistentState<Step>("prioritization-matrix", "step", "what");
  const [tasks, setTasks] = usePersistentState<string[]>("prioritization-matrix", "tasks", [
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [choices, setChoices] = usePersistentState<Record<string, number>>(
    "prioritization-matrix",
    "choices",
    {},
  );

  const validTasks = tasks.map((t) => t.trim()).filter(Boolean);
  const n = validTasks.length;

  const pairs = useMemo(() => {
    const out: Array<[number, number]> = [];
    for (let i = 1; i < n; i++) for (let j = 0; j < i; j++) out.push([i, j]);
    return out;
  }, [n]);

  const key = (i: number, j: number) => `${i}-${j}`;
  const decidedCount = pairs.filter(([i, j]) => choices[key(i, j)] !== undefined).length;
  const allDecided = pairs.length > 0 && decidedCount === pairs.length;

  const tallies = useMemo(() => {
    const counts = new Array(n).fill(0) as number[];
    for (const [i, j] of pairs) {
      const w = choices[key(i, j)];
      if (w !== undefined) counts[w]++;
    }
    return counts;
  }, [choices, pairs, n]);

  const ranking = useMemo(
    () =>
      validTasks
        .map((task, idx) => ({ task, idx, score: tallies[idx], letter: LETTERS[idx] }))
        .sort((a, b) => b.score - a.score),
    [validTasks, tallies],
  );

  const updateTask = (i: number, v: string) => {
    const next = [...tasks];
    next[i] = v;
    setTasks(next);
  };

  const addTask = () => tasks.length < 12 && setTasks([...tasks, ""]);
  const removeTask = (i: number) =>
    tasks.length > 2 && setTasks(tasks.filter((_, idx) => idx !== i));

  const loadExample = () => setTasks([...EXAMPLE_TASKS]);

  const reset = () => {
    setChoices({});
    setTasks(["", "", "", "", "", ""]);
    setStep("what");
  };

  return (
    <>
      <nav className="flex items-center gap-1 text-xs mb-8 flex-wrap">
        {(["what", "tasks", "compare", "results"] as Step[]).map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(s)}
            className={`rounded-full px-3 py-1.5 capitalize transition-colors ${
              step === s
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            {i + 1}. {s === "what" ? "Intro" : s}
          </button>
        ))}
      </nav>

      {step === "what" && (
        <section className="grid gap-6 md:grid-cols-3">
          <Card title="What">
            A simple way to rank a list of tasks, goals, or options when everything feels important.
            You compare them two at a time — never more than a pair at once.
          </Card>
          <Card title="Why">
            Choosing between two things is much easier than ranking a whole list. Pairwise
            comparison removes overwhelm and surfaces what genuinely matters most to you.
          </Card>
          <Card title="How">
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>List the items you want to prioritise.</li>
              <li>For each pair, click the one that matters more.</li>
              <li>Tally the wins — highest score is your top priority.</li>
            </ol>
          </Card>
          <div className="md:col-span-3 flex justify-center">
            <button
              onClick={() => setStep("tasks")}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Start the exercise →
            </button>
          </div>
        </section>
      )}

      {step === "tasks" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Your tasks</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter the items you want to prioritise (2–12). Each will be assigned a letter.
            </p>
          </div>

          <div className="space-y-2">
            {tasks.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 h-8 grid place-items-center rounded-md bg-secondary text-secondary-foreground font-mono text-sm font-semibold">
                  {LETTERS[i]}
                </span>
                <input
                  value={t}
                  onChange={(e) => updateTask(i, e.target.value)}
                  placeholder={`Task ${i + 1}`}
                  className="flex-1 rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  onClick={() => removeTask(i)}
                  disabled={tasks.length <= 2}
                  className="text-xs text-muted-foreground hover:text-destructive disabled:opacity-30"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={addTask}
              disabled={tasks.length >= 12}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-secondary disabled:opacity-40"
            >
              + Add task
            </button>
            <button
              onClick={loadExample}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-secondary"
            >
              Load example
            </button>
            <div className="flex-1" />
            <button
              onClick={() => {
                setChoices({});
                setStep("compare");
              }}
              disabled={n < 2}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
            >
              Compare {n} tasks →
            </button>
          </div>
        </section>
      )}

      {step === "compare" && (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Pairwise comparison</h2>
              <p className="text-sm text-muted-foreground mt-1">
                For each cell, click the task that matters more to you.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {decidedCount} / {pairs.length} decided
            </div>
          </div>

          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${pairs.length ? (decidedCount / pairs.length) * 100 : 0}%` }}
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Live standings
            </p>
            <div className="mt-3 relative" style={{ height: ranking.length * 40 }}>
              {ranking.map((r, pos) => (
                <div
                  key={r.idx}
                  className="absolute left-0 right-0 flex items-center gap-3"
                  style={{
                    transform: `translateY(${pos * 40}px)`,
                    transition: "transform 320ms cubic-bezier(.2,.8,.3,1)",
                  }}
                >
                  <span className="w-6 text-sm tabular-nums text-muted-foreground">{pos + 1}</span>
                  <span className="w-6 h-6 grid place-items-center rounded bg-secondary font-mono text-xs font-semibold shrink-0">
                    {r.letter}
                  </span>
                  <span className="text-sm truncate w-40 md:w-64">{r.task}</span>
                  <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(r.score / Math.max(1, n - 1)) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 text-sm tabular-nums text-right">{r.score}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="p-3 text-left font-medium text-muted-foreground sticky left-0 bg-card">
                    Task
                  </th>
                  {validTasks.slice(0, -1).map((_, j) => (
                    <th
                      key={j}
                      className="p-2 font-mono text-xs font-semibold text-muted-foreground w-12"
                    >
                      {LETTERS[j]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {validTasks.map((task, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-3 sticky left-0 bg-card">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 grid place-items-center rounded bg-secondary font-mono text-xs font-semibold">
                          {LETTERS[i]}
                        </span>
                        <span className="text-foreground">{task}</span>
                      </div>
                    </td>
                    {validTasks.slice(0, -1).map((_, j) => {
                      if (j >= i) return <td key={j} className="bg-muted/30" />;
                      const k = key(i, j);
                      const winner = choices[k];
                      const pick = (w: number) => setChoices((c) => ({ ...c, [k]: w }));
                      return (
                        <td key={j} className="p-1.5 text-center">
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => pick(i)}
                              className={`rounded text-xs font-mono font-semibold py-1 transition-colors ${
                                winner === i
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-muted-foreground hover:bg-accent"
                              }`}
                              title={task}
                            >
                              {LETTERS[i]}
                            </button>
                            <button
                              onClick={() => pick(j)}
                              className={`rounded text-xs font-mono font-semibold py-1 transition-colors ${
                                winner === j
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-muted-foreground hover:bg-accent"
                              }`}
                              title={validTasks[j]}
                            >
                              {LETTERS[j]}
                            </button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="border-t-2 border-border bg-secondary/30">
                  <td className="p-3 sticky left-0 bg-secondary/30 font-medium text-muted-foreground">
                    Total wins
                  </td>
                  {validTasks.slice(0, -1).map((_, j) => (
                    <td key={j} className="p-2 text-center font-mono font-semibold">
                      {tallies[j]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep("tasks")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Edit tasks
            </button>
            <button
              onClick={() => setStep("results")}
              disabled={!allDecided}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
            >
              See priorities →
            </button>
          </div>
        </section>
      )}

      {step === "results" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Your priorities</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Ranked from highest to lowest by number of wins.
            </p>
          </div>

          <ol className="space-y-2">
            {ranking.map((r, idx) => (
              <li
                key={r.idx}
                className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
              >
                <span className="text-2xl font-semibold tabular-nums text-muted-foreground w-8">
                  {idx + 1}
                </span>
                <span className="w-8 h-8 grid place-items-center rounded-md bg-secondary font-mono text-sm font-semibold">
                  {r.letter}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium block truncate">{r.task}</span>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(r.score / Math.max(1, n - 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground tabular-nums shrink-0">
                  {r.score} {r.score === 1 ? "win" : "wins"}
                </span>
              </li>
            ))}
          </ol>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStep("compare")}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-secondary"
            >
              ← Back to matrix
            </button>
            <button
              onClick={reset}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-secondary"
            >
              Start over
            </button>
            <button
              onClick={() => window.print()}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
            >
              Print / Save PDF
            </button>
          </div>
        </section>
      )}
    </>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-foreground">{children}</div>
    </div>
  );
}
