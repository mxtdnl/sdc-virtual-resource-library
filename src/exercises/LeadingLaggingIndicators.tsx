import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import {
  IntroGrid,
  InfoCard,
  TextInput,
  TextArea,
  GhostButton,
  PrimaryButton,
  Field,
} from "./_shared";

const SLUG = "leading-lagging-indicators";
const FILE_VERSION = 1;

type Goal = { id: string; text: string; level?: "super" | "inter" | "sub" };
type LaggingIndicator = {
  id: string;
  text: string;
  measure: string;
  timeframe: string;
  goalIds: string[];
};
type LeadingIndicator = {
  id: string;
  text: string;
  frequency: string;
  laggingIds: string[];
  goalIds: string[];
};
type Commitment = { leadingIds: string[]; unit: string; checkIn: string };

type Data = {
  goals: Goal[];
  lagging: LaggingIndicator[];
  leading: LeadingIndicator[];
  commitment: Commitment;
};

const EMPTY: Data = {
  goals: [],
  lagging: [],
  leading: [],
  commitment: { leadingIds: [], unit: "", checkIn: "" },
};

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`;

type Step = "intro" | "goals" | "indicators" | "network" | "reflect" | "summary";
const STEPS: Step[] = ["intro", "goals", "indicators", "network", "reflect", "summary"];
const STEP_LABELS: Record<Step, string> = {
  intro: "Intro",
  goals: "Goals",
  indicators: "Indicators",
  network: "Network",
  reflect: "Reflect",
  summary: "Summary",
};

function AutoTextArea({
  value,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
  return <textarea ref={ref} value={value} rows={1} className={className} {...props} />;
}

export default function LeadingLaggingIndicators() {
  const [data, setData] = usePersistentState<Data>(SLUG, "data", EMPTY);
  const [step, setStep] = usePersistentState<Step>(SLUG, "step", "intro");
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const go = (s: Step) => {
    setStep(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stepIdx = STEPS.indexOf(step);
  const canBack = stepIdx > 0;
  const canNext = stepIdx < STEPS.length - 1;

  // ---- Goal Network import --------------------------------------------------

  const importGoalNetwork = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as {
        kind?: string;
        data?: {
          supers?: { id: string; text: string }[];
          inters?: { id: string; text: string }[];
          subs?: { id: string; text: string }[];
        };
      };
      if (parsed?.kind !== "goal-network" || !parsed.data) {
        setImportMsg("That file isn't a saved goal network.");
        return;
      }
      const { supers = [], inters = [], subs = [] } = parsed.data;
      const valid = (n: { text?: string }) => n && typeof n.text === "string" && n.text.trim();
      const goals: Goal[] = [
        ...supers
          .filter(valid)
          .map((n) => ({ id: newId(), text: n.text.trim(), level: "super" as const })),
        ...inters
          .filter(valid)
          .map((n) => ({ id: newId(), text: n.text.trim(), level: "inter" as const })),
        ...subs
          .filter(valid)
          .map((n) => ({ id: newId(), text: n.text.trim(), level: "sub" as const })),
      ];
      if (goals.length === 0) {
        setImportMsg("That goal network has no goals to import.");
        return;
      }
      setData((d) => ({ ...d, goals: [...d.goals, ...goals] }));
      setImportMsg(
        `Imported ${goals.length} goal${goals.length === 1 ? "" : "s"} from your goal network.`,
      );
    } catch {
      setImportMsg("Couldn't read that file — it may be damaged.");
    }
  };

  // ---- Own export / import --------------------------------------------------

  const exportFile = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { kind: SLUG, version: FILE_VERSION, savedAt: new Date().toISOString(), data },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${SLUG}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as { kind?: string; data?: Data };
      const d = parsed?.data;
      if (
        parsed?.kind !== SLUG ||
        !d ||
        !Array.isArray(d.goals) ||
        !Array.isArray(d.lagging) ||
        !Array.isArray(d.leading)
      ) {
        setImportMsg("That file isn't a saved indicators exercise.");
        return;
      }
      setData({
        goals: d.goals.filter((g) => g && typeof g.text === "string"),
        lagging: d.lagging.filter((l) => l && typeof l.text === "string"),
        leading: d.leading
          .filter((l) => l && typeof l.text === "string")
          .map((l) => ({ ...l, goalIds: Array.isArray(l.goalIds) ? l.goalIds : [] })),
        commitment: d.commitment ?? EMPTY.commitment,
      });
      setImportMsg("Loaded. Your indicators are back and editable.");
    } catch {
      setImportMsg("Couldn't read that file — it may be damaged.");
    }
  };

  useEffect(() => {
    if (!importMsg) return;
    const t = setTimeout(() => setImportMsg(null), 6000);
    return () => clearTimeout(t);
  }, [importMsg]);

  // ---- Mutations ------------------------------------------------------------

  const addGoal = (text: string) => {
    if (!text.trim()) return;
    setData((d) => ({ ...d, goals: [...d.goals, { id: newId(), text: text.trim() }] }));
  };

  const removeGoal = (id: string) =>
    setData((d) => ({
      ...d,
      goals: d.goals.filter((g) => g.id !== id),
      lagging: d.lagging.map((l) => ({ ...l, goalIds: l.goalIds.filter((gid) => gid !== id) })),
      leading: d.leading.map((l) => ({ ...l, goalIds: l.goalIds.filter((gid) => gid !== id) })),
    }));

  const updateGoal = (id: string, text: string) =>
    setData((d) => ({ ...d, goals: d.goals.map((g) => (g.id === id ? { ...g, text } : g)) }));

  const addLagging = (text: string) => {
    if (!text.trim()) return;
    setData((d) => ({
      ...d,
      lagging: [
        ...d.lagging,
        { id: newId(), text: text.trim(), measure: "", timeframe: "", goalIds: [] },
      ],
    }));
  };

  const removeLagging = (id: string) =>
    setData((d) => ({
      ...d,
      lagging: d.lagging.filter((l) => l.id !== id),
      leading: d.leading.map((l) => ({
        ...l,
        laggingIds: l.laggingIds.filter((lid) => lid !== id),
      })),
    }));

  const updateLagging = (id: string, patch: Partial<LaggingIndicator>) =>
    setData((d) => ({
      ...d,
      lagging: d.lagging.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));

  const toggleLaggingGoal = (laggingId: string, goalId: string) =>
    setData((d) => ({
      ...d,
      lagging: d.lagging.map((l) =>
        l.id === laggingId
          ? {
              ...l,
              goalIds: l.goalIds.includes(goalId)
                ? l.goalIds.filter((g) => g !== goalId)
                : [...l.goalIds, goalId],
            }
          : l,
      ),
    }));

  const addLeading = (text: string) => {
    if (!text.trim()) return;
    setData((d) => ({
      ...d,
      leading: [
        ...d.leading,
        { id: newId(), text: text.trim(), frequency: "", laggingIds: [], goalIds: [] },
      ],
    }));
  };

  const removeLeading = (id: string) =>
    setData((d) => ({
      ...d,
      leading: d.leading.filter((l) => l.id !== id),
      commitment: {
        ...d.commitment,
        leadingIds: d.commitment.leadingIds.filter((lid) => lid !== id),
      },
    }));

  const updateLeading = (id: string, patch: Partial<LeadingIndicator>) =>
    setData((d) => ({
      ...d,
      leading: d.leading.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));

  const toggleLeadingLagging = (leadingId: string, laggingId: string) =>
    setData((d) => ({
      ...d,
      leading: d.leading.map((l) =>
        l.id === leadingId
          ? {
              ...l,
              laggingIds: l.laggingIds.includes(laggingId)
                ? l.laggingIds.filter((lid) => lid !== laggingId)
                : [...l.laggingIds, laggingId],
            }
          : l,
      ),
    }));

  const toggleLeadingGoal = (leadingId: string, goalId: string) =>
    setData((d) => ({
      ...d,
      leading: d.leading.map((l) =>
        l.id === leadingId
          ? {
              ...l,
              goalIds: l.goalIds.includes(goalId)
                ? l.goalIds.filter((gid) => gid !== goalId)
                : [...l.goalIds, goalId],
            }
          : l,
      ),
    }));

  const toggleCommitLeading = (leadingId: string) =>
    setData((d) => ({
      ...d,
      commitment: {
        ...d.commitment,
        leadingIds: d.commitment.leadingIds.includes(leadingId)
          ? d.commitment.leadingIds.filter((id) => id !== leadingId)
          : [...d.commitment.leadingIds, leadingId],
      },
    }));

  const total = data.goals.length + data.lagging.length + data.leading.length;

  return (
    <div className="space-y-8">
      {/* Step nav */}
      <div className="no-print flex flex-wrap gap-1.5 text-xs">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => go(s)}
            className={`rounded-full border px-3 py-1 transition-colors ${
              s === step
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {i + 1}. {STEP_LABELS[s]}
          </button>
        ))}
      </div>

      {step === "intro" && <IntroStep onNext={() => go("goals")} />}

      {step === "goals" && (
        <GoalsStep
          goals={data.goals}
          addGoal={addGoal}
          removeGoal={removeGoal}
          updateGoal={updateGoal}
          importGoalNetwork={importGoalNetwork}
          importMsg={importMsg}
        />
      )}

      {step === "indicators" && (
        <IndicatorsStep
          data={data}
          addLagging={addLagging}
          removeLagging={removeLagging}
          updateLagging={updateLagging}
          toggleLaggingGoal={toggleLaggingGoal}
          addLeading={addLeading}
          removeLeading={removeLeading}
          updateLeading={updateLeading}
          toggleLeadingLagging={toggleLeadingLagging}
          toggleLeadingGoal={toggleLeadingGoal}
        />
      )}

      {step === "network" && <NetworkStep data={data} />}

      {step === "reflect" && (
        <ReflectStep data={data} setData={setData} toggleCommitLeading={toggleCommitLeading} />
      )}

      {step === "summary" && <SummaryStep data={data} />}

      {/* Navigation */}
      <div className="no-print flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {canBack && (
            <GhostButton onClick={() => go(STEPS[stepIdx - 1])}>
              ← {STEP_LABELS[STEPS[stepIdx - 1]]}
            </GhostButton>
          )}
          {canNext && (
            <PrimaryButton onClick={() => go(STEPS[stepIdx + 1])}>
              {STEP_LABELS[STEPS[stepIdx + 1]]} →
            </PrimaryButton>
          )}
        </div>
        <div className="flex gap-2">
          {total > 0 && <GhostButton onClick={exportFile}>Download backup</GhostButton>}
          <UploadButton label="Upload backup" accept=".json" onFile={importFile} />
          {total > 0 && (
            <button
              onClick={() => window.print()}
              className="rounded-full border border-border bg-card px-5 py-2 text-sm hover:bg-secondary"
            >
              Print / Save PDF
            </button>
          )}
        </div>
      </div>

      {importMsg && step !== "goals" && (
        <p role="status" className="text-xs text-muted-foreground">
          {importMsg}
        </p>
      )}
    </div>
  );
}

// ── Intro ────────────────────────────────────────────────────────────────────

function IntroStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-8">
      <IntroGrid
        what="Identify the leading (input) and lagging (outcome) indicators for your goals, then map which daily actions drive which results."
        why="Lagging indicators only tell you how you did. Leading indicators tell you what to do today. Focusing on inputs you control builds agency, catches drift early, and keeps you moving when the outcome is still weeks away."
        how={
          <ol className="list-decimal pl-4 space-y-1.5">
            <li>Enter 2–4 goals (or import from your Goal Network).</li>
            <li>Name the lagging indicators — outcomes you'd measure.</li>
            <li>Name the leading indicators — actions that drive them.</li>
            <li>Link them in a network and spot your highest-leverage actions.</li>
            <li>Pick 1–2 leading indicators to track this week.</li>
          </ol>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard title="Leading vs lagging">
          A <strong>leading indicator</strong> is something you can directly do or control — hours
          studied, meals prepped, applications sent. A <strong>lagging indicator</strong> is the
          result that follows — exam grade, weight, job offer. Leading indicators are predictive and
          influenceable; lagging indicators are confirmable but only after the fact.
        </InfoCard>
        <InfoCard title="From your Goal Network">
          If you've completed the{" "}
          <a href="/exercise/goal-network" className="underline text-ink-orange hover:text-ink-red">
            Goal Network
          </a>{" "}
          exercise, import your goals and they'll be tagged by level. Superordinate and intermediate
          goals link to lagging indicators (outcomes), while subordinate goals link to leading
          indicators (actions). This exercise makes that relationship explicit and adds measurement.
        </InfoCard>
      </div>

      <div className="no-print flex justify-center">
        <PrimaryButton onClick={onNext}>Get started →</PrimaryButton>
      </div>
    </div>
  );
}

// ── Goals ────────────────────────────────────────────────────────────────────

function GoalsStep({
  goals,
  addGoal,
  removeGoal,
  updateGoal,
  importGoalNetwork,
  importMsg,
}: {
  goals: Goal[];
  addGoal: (text: string) => void;
  removeGoal: (id: string) => void;
  updateGoal: (id: string, text: string) => void;
  importGoalNetwork: (file: File) => void;
  importMsg: string | null;
}) {
  const [draft, setDraft] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Your goals</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter 2–4 goals you want to track. These are the outcomes you care about — they'll become
          the top tier of your indicator network.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-ink-orange/40 bg-ink-ochre-soft/30 p-4 space-y-3">
        <p className="text-sm font-medium">Import from Goal Network</p>
        <p className="text-xs text-muted-foreground">
          Upload a saved goal network file to pull in your superordinate, intermediate, and
          subordinate goals. On the next step, supers and inters will link to lagging indicators
          while subs will link to leading indicators.
        </p>
        <UploadButton label="Upload goal network .json" accept=".json" onFile={importGoalNetwork} />
        {importMsg && (
          <p role="status" className="text-xs text-muted-foreground">
            {importMsg}
          </p>
        )}
      </div>

      <div className="no-print flex flex-wrap gap-2">
        <TextInput
          className="flex-1 min-w-48 text-sm"
          placeholder="e.g. Get a first in my dissertation"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addGoal(draft);
              setDraft("");
            }
          }}
        />
        <PrimaryButton
          onClick={() => {
            addGoal(draft);
            setDraft("");
          }}
          disabled={!draft.trim()}
        >
          Add
        </PrimaryButton>
      </div>

      <div className="space-y-2">
        {goals.map((g) => (
          <div
            key={g.id}
            className="flex items-center gap-2 rounded-xl border border-border bg-background p-3"
          >
            {g.level && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  g.level === "super"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                    : g.level === "inter"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                }`}
              >
                {g.level === "super"
                  ? "superordinate"
                  : g.level === "inter"
                    ? "intermediate"
                    : "subordinate"}
              </span>
            )}
            <AutoTextArea
              value={g.text}
              onChange={(e) => updateGoal(g.id, e.target.value)}
              className="flex-1 resize-none overflow-hidden border-transparent bg-transparent px-1 text-sm font-medium"
            />
            <button
              onClick={() => removeGoal(g.id)}
              aria-label="Remove goal"
              className="no-print px-1 text-xs text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        ))}
        {goals.length === 0 && (
          <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            No goals yet — type one above or import from your Goal Network.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Indicators ──────────────────────────────────────────────────────────────

function IndicatorsStep({
  data,
  addLagging,
  removeLagging,
  updateLagging,
  toggleLaggingGoal,
  addLeading,
  removeLeading,
  updateLeading,
  toggleLeadingLagging,
  toggleLeadingGoal,
}: {
  data: Data;
  addLagging: (text: string) => void;
  removeLagging: (id: string) => void;
  updateLagging: (id: string, patch: Partial<LaggingIndicator>) => void;
  toggleLaggingGoal: (laggingId: string, goalId: string) => void;
  addLeading: (text: string) => void;
  removeLeading: (id: string) => void;
  updateLeading: (id: string, patch: Partial<LeadingIndicator>) => void;
  toggleLeadingLagging: (leadingId: string, laggingId: string) => void;
  toggleLeadingGoal: (leadingId: string, goalId: string) => void;
}) {
  const [lagDraft, setLagDraft] = useState("");
  const [leadDraft, setLeadDraft] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const laggingGoals = data.goals.filter((g) => g.level !== "sub");
  const subGoals = data.goals.filter((g) => g.level === "sub");

  return (
    <div className="space-y-10">
      {/* Lagging indicators */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-orange">Outcomes</p>
          <h3 className="text-lg font-semibold">Lagging indicators</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            For each goal, what results would tell you you're succeeding? These are the outcomes you
            measure but can't directly control day-to-day.
          </p>
        </div>

        <div className="no-print flex flex-wrap gap-2">
          <TextInput
            className="flex-1 min-w-48 text-sm"
            placeholder="e.g. Dissertation grade"
            value={lagDraft}
            onChange={(e) => setLagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addLagging(lagDraft);
                setLagDraft("");
              }
            }}
          />
          <PrimaryButton
            onClick={() => {
              addLagging(lagDraft);
              setLagDraft("");
            }}
            disabled={!lagDraft.trim()}
          >
            Add
          </PrimaryButton>
        </div>

        <div className="space-y-3">
          {data.lagging.map((l) => {
            const open = openId === l.id;
            return (
              <div
                key={l.id}
                className="rounded-xl border border-border bg-background p-3 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <AutoTextArea
                    value={l.text}
                    onChange={(e) => updateLagging(l.id, { text: e.target.value })}
                    className="flex-1 resize-none overflow-hidden border-transparent bg-transparent px-1 text-sm font-medium"
                  />
                  <button
                    onClick={() => setOpenId(open ? null : l.id)}
                    className="no-print rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary"
                  >
                    {open ? "Hide" : "Detail"}
                  </button>
                  <button
                    onClick={() => removeLagging(l.id)}
                    aria-label="Remove lagging indicator"
                    className="no-print px-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                {open && (
                  <div className="space-y-2 pl-1">
                    <Field
                      label="How would you measure this?"
                      hint="The specific metric or evidence."
                    >
                      <TextInput
                        value={l.measure}
                        onChange={(e) => updateLagging(l.id, { measure: e.target.value })}
                        placeholder="e.g. Final mark out of 100"
                        className="text-sm"
                      />
                    </Field>
                    <Field label="Timeframe" hint="How long before you'd expect to see movement?">
                      <TextInput
                        value={l.timeframe}
                        onChange={(e) => updateLagging(l.id, { timeframe: e.target.value })}
                        placeholder="e.g. End of semester"
                        className="text-sm"
                      />
                    </Field>
                  </div>
                )}

                {/* Print-only detail */}
                {!open && (l.measure || l.timeframe) && (
                  <div className="hidden print:block text-xs text-muted-foreground space-y-0.5 pl-1">
                    {l.measure && <p>Measure: {l.measure}</p>}
                    {l.timeframe && <p>Timeframe: {l.timeframe}</p>}
                  </div>
                )}

                {laggingGoals.length > 0 && (
                  <div className="no-print flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Goal:</span>
                    {laggingGoals.map((g) => {
                      const on = l.goalIds.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          onClick={() => toggleLaggingGoal(l.id, g.id)}
                          aria-pressed={on}
                          className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                            on
                              ? "border-transparent bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          {g.text || "Untitled"}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {data.lagging.length === 0 && (
            <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              No lagging indicators yet.
            </p>
          )}
        </div>
      </section>

      {/* Leading indicators */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-orange">Inputs</p>
          <h3 className="text-lg font-semibold">Leading indicators</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            What actions or habits, done consistently, would drive those outcomes? These are the
            things you can do today.
          </p>
        </div>

        <div className="no-print flex flex-wrap gap-2">
          <TextInput
            className="flex-1 min-w-48 text-sm"
            placeholder="e.g. Hours of focused writing per week"
            value={leadDraft}
            onChange={(e) => setLeadDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addLeading(leadDraft);
                setLeadDraft("");
              }
            }}
          />
          <PrimaryButton
            onClick={() => {
              addLeading(leadDraft);
              setLeadDraft("");
            }}
            disabled={!leadDraft.trim()}
          >
            Add
          </PrimaryButton>
        </div>

        <div className="space-y-3">
          {data.leading.map((l) => {
            const open = openId === l.id;
            return (
              <div
                key={l.id}
                className="rounded-xl border border-border bg-background p-3 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <AutoTextArea
                    value={l.text}
                    onChange={(e) => updateLeading(l.id, { text: e.target.value })}
                    className="flex-1 resize-none overflow-hidden border-transparent bg-transparent px-1 text-sm font-medium"
                  />
                  <button
                    onClick={() => setOpenId(open ? null : l.id)}
                    className="no-print rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary"
                  >
                    {open ? "Hide" : "Detail"}
                  </button>
                  <button
                    onClick={() => removeLeading(l.id)}
                    aria-label="Remove leading indicator"
                    className="no-print px-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>

                {open && (
                  <div className="space-y-2 pl-1">
                    <Field label="Frequency / target" hint="How often, or how much?">
                      <TextInput
                        value={l.frequency}
                        onChange={(e) => updateLeading(l.id, { frequency: e.target.value })}
                        placeholder="e.g. 3 sessions per week, 2 hours each"
                        className="text-sm"
                      />
                    </Field>
                  </div>
                )}

                {!open && l.frequency && (
                  <p className="hidden print:block text-xs text-muted-foreground pl-1">
                    Frequency: {l.frequency}
                  </p>
                )}

                {data.lagging.length > 0 && (
                  <div className="no-print flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Drives:</span>
                    {data.lagging.map((lag) => {
                      const on = l.laggingIds.includes(lag.id);
                      return (
                        <button
                          key={lag.id}
                          onClick={() => toggleLeadingLagging(l.id, lag.id)}
                          aria-pressed={on}
                          className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                            on
                              ? "border-transparent bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          {lag.text || "Untitled"}
                        </button>
                      );
                    })}
                    {l.laggingIds.length >= 2 && (
                      <span className="rounded-full bg-ink-ochre-soft px-2 py-0.5 text-[11px] font-medium text-ink-red-deep">
                        high-leverage ×{l.laggingIds.length}
                      </span>
                    )}
                  </div>
                )}

                {subGoals.length > 0 && (
                  <div className="no-print flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Sub-goal:</span>
                    {subGoals.map((g) => {
                      const on = l.goalIds.includes(g.id);
                      return (
                        <button
                          key={g.id}
                          onClick={() => toggleLeadingGoal(l.id, g.id)}
                          aria-pressed={on}
                          className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                            on
                              ? "border-transparent bg-emerald-600 text-white dark:bg-emerald-700"
                              : "border-border text-muted-foreground hover:bg-secondary"
                          }`}
                        >
                          {g.text || "Untitled"}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {data.leading.length === 0 && (
            <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
              No leading indicators yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

// ── Network visualisation ───────────────────────────────────────────────────

const EDGE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function NetworkStep({ data }: { data: Data }) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef(new Map<string, HTMLElement>());
  const [edges, setEdges] = useState<{ id: string; d: string; strong: boolean; color: string }[]>(
    [],
  );
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<string | null>(null);

  const setRef = (id: string) => (el: HTMLElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  };

  const measure = useCallback(() => {
    const box = wrap.current?.getBoundingClientRect();
    if (!box) return;
    setSize({ w: box.width, h: box.height });

    const parentColorMap = new Map<string, string>();
    data.goals.forEach((n, i) => parentColorMap.set(n.id, EDGE_COLORS[i % EDGE_COLORS.length]));
    data.lagging.forEach((n, i) => parentColorMap.set(n.id, EDGE_COLORS[i % EDGE_COLORS.length]));

    const next: typeof edges = [];

    for (const lag of data.lagging) {
      const c = nodeRefs.current.get(lag.id)?.getBoundingClientRect();
      if (!c) continue;
      for (const goalId of lag.goalIds) {
        const p = nodeRefs.current.get(goalId)?.getBoundingClientRect();
        if (!p) continue;
        const x1 = p.left + p.width / 2 - box.left;
        const y1 = p.bottom - box.top;
        const x2 = c.left + c.width / 2 - box.left;
        const y2 = c.top - box.top;
        const mid = (y1 + y2) / 2;
        next.push({
          id: `${lag.id}-${goalId}`,
          d: `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`,
          strong: lag.goalIds.length >= 2,
          color: parentColorMap.get(goalId) ?? "var(--border)",
        });
      }
    }

    for (const lead of data.leading) {
      const c = nodeRefs.current.get(lead.id)?.getBoundingClientRect();
      if (!c) continue;
      for (const lagId of lead.laggingIds) {
        const p = nodeRefs.current.get(lagId)?.getBoundingClientRect();
        if (!p) continue;
        const x1 = p.left + p.width / 2 - box.left;
        const y1 = p.bottom - box.top;
        const x2 = c.left + c.width / 2 - box.left;
        const y2 = c.top - box.top;
        const mid = (y1 + y2) / 2;
        next.push({
          id: `${lead.id}-${lagId}`,
          d: `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`,
          strong: lead.laggingIds.length >= 2,
          color: parentColorMap.get(lagId) ?? "var(--border)",
        });
      }
      for (const goalId of lead.goalIds) {
        const p = nodeRefs.current.get(goalId)?.getBoundingClientRect();
        if (!p) continue;
        const x1 = p.left + p.width / 2 - box.left;
        const y1 = p.bottom - box.top;
        const x2 = c.left + c.width / 2 - box.left;
        const y2 = c.top - box.top;
        const mid = (y1 + y2) / 2;
        next.push({
          id: `${lead.id}-${goalId}`,
          d: `M ${x1} ${y1} C ${x1} ${mid}, ${x2} ${mid}, ${x2} ${y2}`,
          strong: false,
          color: parentColorMap.get(goalId) ?? "var(--border)",
        });
      }
    }

    setEdges(next);
  }, [data]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    window.addEventListener("resize", measure);
    window.addEventListener("beforeprint", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("beforeprint", measure);
    };
  }, [measure]);

  const highLeverage = data.leading.filter((l) => l.laggingIds.length >= 2);
  const unsupported = data.lagging.filter(
    (l) => data.leading.filter((lead) => lead.laggingIds.includes(l.id)).length === 0,
  );
  const unlinkedLagging = data.lagging.filter((l) => l.goalIds.length === 0);

  const colWidth = (count: number) =>
    count <= 1
      ? 280
      : count <= 2
        ? 240
        : count <= 3
          ? 200
          : count <= 4
            ? 170
            : count <= 5
              ? 150
              : 130;

  const topGoals = data.goals.filter((g) => g.level !== "sub");
  const subGoals = data.goals.filter((g) => g.level === "sub");

  const rows: {
    key: string;
    label: string;
    sublabel: string;
    items: { id: string; text: string; linkCount: number }[];
  }[] = [
    {
      key: "goals",
      label: topGoals.some((g) => g.level) ? "Superordinate & intermediate goals" : "Goals",
      sublabel: "What you're working toward",
      items: topGoals.map((g) => ({ id: g.id, text: g.text, linkCount: 0 })),
    },
    {
      key: "lagging",
      label: "Lagging indicators",
      sublabel: "Outcomes you measure",
      items: data.lagging.map((l) => ({ id: l.id, text: l.text, linkCount: l.goalIds.length })),
    },
    ...(subGoals.length > 0
      ? [
          {
            key: "subs",
            label: "Subordinate goals",
            sublabel: "Concrete actions from your goal network",
            items: subGoals.map((g) => ({ id: g.id, text: g.text, linkCount: 0 })),
          },
        ]
      : []),
    {
      key: "leading",
      label: "Leading indicators",
      sublabel: "Inputs you control",
      items: data.leading.map((l) => ({
        id: l.id,
        text: l.text,
        linkCount: l.laggingIds.length + l.goalIds.length,
      })),
    },
  ];

  return (
    <section className="indicator-network-section space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold">Your indicator network</h3>
        <span className="text-xs text-muted-foreground">
          Lines run from each indicator to what it supports above.
        </span>
      </div>

      <div
        ref={wrap}
        className="indicator-network-container relative rounded-2xl border border-border bg-card p-4"
      >
        <svg
          viewBox={`0 0 ${size.w} ${size.h}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {edges.map((e) => (
            <path
              key={e.id}
              d={e.d}
              fill="none"
              stroke={e.color}
              strokeWidth={2}
              strokeDasharray={e.strong ? "6 3" : undefined}
              opacity={hover ? (e.id.includes(hover) ? 1 : 0.15) : 0.9}
            />
          ))}
        </svg>

        <div className="relative space-y-10">
          {rows.map((row) => (
            <div key={row.key} className="space-y-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-orange">
                    {row.sublabel}
                  </p>
                  <p className="text-sm font-semibold">{row.label}</p>
                </div>
                <span className="text-xs text-muted-foreground">{row.items.length} added</span>
              </div>

              <div
                className="grid justify-center gap-4"
                style={{
                  gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${colWidth(row.items.length)}px), 1fr))`,
                }}
              >
                {row.items.map((item) => (
                  <div
                    key={item.id}
                    ref={setRef(item.id)}
                    onMouseEnter={() => setHover(item.id)}
                    onMouseLeave={() => setHover(null)}
                    className={`min-w-0 rounded-xl border bg-background p-3 text-sm break-words ${
                      item.linkCount >= 2 ? "border-primary/60" : "border-border"
                    }`}
                  >
                    <p className="font-medium">{item.text || "Untitled"}</p>
                    {row.key === "leading" && item.linkCount >= 2 && (
                      <span className="mt-1 inline-block rounded-full bg-ink-ochre-soft px-2 py-0.5 text-[11px] font-medium text-ink-red-deep">
                        high-leverage ×{item.linkCount}
                      </span>
                    )}
                  </div>
                ))}
                {row.items.length === 0 && (
                  <p className="w-full rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                    Nothing here yet — add items in previous steps.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="What the map says">
          <ul className="space-y-1.5">
            <li>
              <strong>{highLeverage.length}</strong> leading indicator
              {highLeverage.length === 1 ? "" : "s"}{" "}
              {highLeverage.length === 1 ? "drives" : "drive"} more than one outcome.
              {highLeverage.length > 0 && <> ({highLeverage.map((l) => l.text).join(", ")})</>}
            </li>
            <li>
              <strong>{unsupported.length}</strong> lagging indicator
              {unsupported.length === 1 ? "" : "s"} {unsupported.length === 1 ? "has" : "have"} no
              leading indicator feeding {unsupported.length === 1 ? "it" : "them"} — a blind spot.
              {unsupported.length > 0 && <> ({unsupported.map((l) => l.text).join(", ")})</>}
            </li>
            {unlinkedLagging.length > 0 && (
              <li className="text-muted-foreground">
                {unlinkedLagging.length} lagging indicator{unlinkedLagging.length === 1 ? "" : "s"}{" "}
                not linked to a goal — link {unlinkedLagging.length === 1 ? "it" : "them"} in the
                Indicators step.
              </li>
            )}
          </ul>
        </InfoCard>
        <InfoCard title="Strengthen a link">
          Pick an unsupported outcome and ask: what action, done consistently, would make this
          result more likely? That's a missing leading indicator. Write it down and link it.
        </InfoCard>
      </div>
    </section>
  );
}

// ── Reflect ─────────────────────────────────────────────────────────────────

function ReflectStep({
  data,
  setData,
  toggleCommitLeading,
}: {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  toggleCommitLeading: (leadingId: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Reflection and commitment</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You can't move every leading indicator at once. Pick 1–2 to track this week — the ones you
          believe will have the biggest effect on your outcomes.
        </p>
      </div>

      {data.leading.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Which leading indicators will you track this week?</p>
          <div className="flex flex-wrap gap-2">
            {data.leading.map((l) => {
              const on = data.commitment.leadingIds.includes(l.id);
              return (
                <button
                  key={l.id}
                  onClick={() => toggleCommitLeading(l.id)}
                  aria-pressed={on}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    on
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {l.text || "Untitled"}
                  {l.laggingIds.length >= 2 && " ★"}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">
            ★ marks high-leverage indicators that drive multiple outcomes.
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Go back and add some leading indicators first.
        </p>
      )}

      <Field
        label="What's the smallest unit of measurement?"
        hint="How will you know you did it today? e.g. 'Did I write for at least 30 minutes? Yes/No'"
      >
        <TextArea
          value={data.commitment.unit}
          onChange={(e) =>
            setData((d) => ({ ...d, commitment: { ...d.commitment, unit: e.target.value } }))
          }
          rows={2}
          placeholder="e.g. Yes/No — did I do a writing session today?"
        />
      </Field>

      <Field
        label="When will you check your lagging indicators?"
        hint="The lagging indicators take time. When will you look at the outcomes to see if the inputs are working?"
      >
        <TextInput
          value={data.commitment.checkIn}
          onChange={(e) =>
            setData((d) => ({ ...d, commitment: { ...d.commitment, checkIn: e.target.value } }))
          }
          placeholder="e.g. End of month, after the mock exam, in 6 weeks"
        />
      </Field>
    </div>
  );
}

// ── Summary ─────────────────────────────────────────────────────────────────

function SummaryStep({ data }: { data: Data }) {
  const highLeverage = data.leading.filter((l) => l.laggingIds.length >= 2);
  const committed = data.leading.filter((l) => data.commitment.leadingIds.includes(l.id));

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold">Summary</h3>

      {data.goals.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-ink-orange">Goals</h4>
          <ul className="space-y-1 text-sm">
            {data.goals.map((g) => (
              <li key={g.id}>
                • {g.text}
                {g.level && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    (
                    {g.level === "super"
                      ? "superordinate"
                      : g.level === "inter"
                        ? "intermediate"
                        : "subordinate"}
                    )
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.lagging.length > 0 && (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-ink-orange">
            Lagging indicators (outcomes)
          </h4>
          <div className="space-y-2">
            {data.lagging.map((l) => {
              const goals = data.goals.filter((g) => l.goalIds.includes(g.id));
              return (
                <div
                  key={l.id}
                  className="rounded-xl border border-border bg-card p-3 text-sm space-y-1"
                >
                  <p className="font-medium">{l.text}</p>
                  {l.measure && <p className="text-muted-foreground">Measure: {l.measure}</p>}
                  {l.timeframe && <p className="text-muted-foreground">Timeframe: {l.timeframe}</p>}
                  {goals.length > 0 && (
                    <p className="text-muted-foreground">
                      Goal{goals.length > 1 ? "s" : ""}: {goals.map((g) => g.text).join(", ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {data.leading.length > 0 && (
        <section className="space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-ink-orange">
            Leading indicators (inputs)
          </h4>
          <div className="space-y-2">
            {data.leading.map((l) => {
              const lagging = data.lagging.filter((lag) => l.laggingIds.includes(lag.id));
              const linkedSubs = data.goals.filter((g) => l.goalIds.includes(g.id));
              return (
                <div
                  key={l.id}
                  className="rounded-xl border border-border bg-card p-3 text-sm space-y-1"
                >
                  <p className="font-medium">
                    {l.text}
                    {l.laggingIds.length >= 2 && (
                      <span className="ml-2 rounded-full bg-ink-ochre-soft px-2 py-0.5 text-[11px] font-medium text-ink-red-deep">
                        high-leverage
                      </span>
                    )}
                  </p>
                  {l.frequency && <p className="text-muted-foreground">Frequency: {l.frequency}</p>}
                  {lagging.length > 0 && (
                    <p className="text-muted-foreground">
                      Drives: {lagging.map((lag) => lag.text).join(", ")}
                    </p>
                  )}
                  {linkedSubs.length > 0 && (
                    <p className="text-muted-foreground">
                      Sub-goal{linkedSubs.length > 1 ? "s" : ""}:{" "}
                      {linkedSubs.map((g) => g.text).join(", ")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {(committed.length > 0 || data.commitment.unit || data.commitment.checkIn) && (
        <section className="rounded-2xl border border-primary/30 bg-card p-6 space-y-3">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-ink-orange">
            This week's commitment
          </h4>
          {committed.length > 0 && (
            <div className="space-y-1 text-sm">
              <p className="font-medium">Tracking:</p>
              <ul>
                {committed.map((l) => (
                  <li key={l.id}>
                    • {l.text}
                    {l.frequency && <span className="text-muted-foreground"> — {l.frequency}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {data.commitment.unit && (
            <p className="text-sm">
              <span className="font-medium">Measurement: </span>
              {data.commitment.unit}
            </p>
          )}
          {data.commitment.checkIn && (
            <p className="text-sm">
              <span className="font-medium">Check lagging indicators: </span>
              {data.commitment.checkIn}
            </p>
          )}
        </section>
      )}

      {highLeverage.length > 0 && (
        <InfoCard title="Your highest-leverage actions">
          {highLeverage.map((l) => l.text).join(", ")}{" "}
          {highLeverage.length === 1 ? "feeds" : "each feed"} multiple outcomes. On a low-motivation
          day, these are the ones worth protecting.
        </InfoCard>
      )}
    </div>
  );
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function UploadButton({
  label,
  accept,
  onFile,
}: {
  label: string;
  accept: string;
  onFile: (file: File) => void;
}) {
  const input = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <GhostButton onClick={() => input.current?.click()}>{label}</GhostButton>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="sr-only"
        aria-label={label}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
    </>
  );
}
