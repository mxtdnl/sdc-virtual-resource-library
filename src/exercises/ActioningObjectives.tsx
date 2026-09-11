import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { IntroGrid, TextArea, TextInput, PrimaryButton, GhostButton, Field } from "./_shared";

const VERBS = [
  "Explain",
  "Persuade",
  "Impress",
  "Invite",
  "Inspire",
  "Inform",
  "Educate",
  "Coach",
  "Enlighten",
  "Direct",
  "Reassure",
  "Validate",
  "Comfort",
  "Entrust",
  "Encourage",
  "Embolden",
  "Challenge",
  "Warn",
  "Amuse",
  "Provoke",
  "Soothe",
  "Urge",
  "Confide",
  "Celebrate",
];

type Point = { id: string; text: string; verb: string };
type Section = { id: string; title: string; objective: string; points: Point[] };

const newSection = (): Section => ({
  id: crypto.randomUUID(),
  title: "",
  objective: "",
  points: [],
});

export default function ActioningObjectives() {
  const [step, setStep] = usePersistentState("actioning-and-objectives", "step", 0);
  const [overall, setOverall] = usePersistentState("actioning-and-objectives", "overall", "");
  const [sections, setSections] = usePersistentState<Section[]>(
    "actioning-and-objectives",
    "sections",
    [newSection()],
  );
  const [rehearsed, setRehearsed] = usePersistentState<Record<string, boolean>>(
    "actioning-and-objectives",
    "rehearsed",
    {},
  );

  const updateSection = (id: string, patch: Partial<Section>) =>
    setSections((s) => s.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const addPoint = (id: string, text: string) =>
    updateSection(id, {
      points: [
        ...(sections.find((s) => s.id === id)?.points ?? []),
        { id: crypto.randomUUID(), text, verb: "" },
      ],
    });
  const setVerb = (sid: string, pid: string, verb: string) => {
    const sec = sections.find((s) => s.id === sid);
    if (!sec) return;
    updateSection(sid, {
      points: sec.points.map((p) =>
        p.id === pid ? { ...p, verb: p.verb === verb ? "" : verb } : p,
      ),
    });
  };
  const removePoint = (sid: string, pid: string) => {
    const sec = sections.find((s) => s.id === sid);
    if (!sec) return;
    updateSection(sid, { points: sec.points.filter((p) => p.id !== pid) });
  };

  const allPoints = sections.flatMap((s) => s.points.map((p) => ({ ...p, section: s.title })));
  const actioned = allPoints.filter((p) => p.verb).length;

  const steps = ["Objective", "Sections", "Action verbs", "Rehearse"];

  return (
    <div className="space-y-8">
      <IntroGrid
        what="An acting technique for presentations: give every section an objective, and every point an action verb that serves it."
        why="Delivering a long stretch of prepared text at one energy level reads as monotonous. Objectives and action verbs make every moment purposeful — and your delivery more dynamic."
        how={
          <ol className="list-decimal pl-4 space-y-1.5">
            <li>Set the overall objective of the talk.</li>
            <li>Break it into sections, each with its own objective.</li>
            <li>Give each point an action verb.</li>
            <li>Rehearse embodying the verb — over the top is fine.</li>
          </ol>
        }
      />

      <div className="flex items-center gap-2 text-xs">
        {steps.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`rounded-full px-3 py-1.5 border ${
              i === step
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <Field
            label="Presentation objective"
            hint="What do you want the audience to do, feel, or understand by the end?"
          >
            <TextArea
              rows={3}
              value={overall}
              onChange={(e) => setOverall(e.target.value)}
              placeholder="For the panel of investors to understand our business model and grant us funding."
            />
          </Field>
          <PrimaryButton onClick={() => setStep(1)} disabled={!overall.trim()}>
            Next: sections →
          </PrimaryButton>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {sections.map((s, i) => (
            <div key={s.id} className="rounded-2xl border border-border bg-card p-6 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Section {i + 1}
                </span>
                {sections.length > 1 && (
                  <button
                    onClick={() => setSections((x) => x.filter((y) => y.id !== s.id))}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </button>
                )}
              </div>
              <TextInput
                placeholder="Section title (e.g. Financials)"
                value={s.title}
                onChange={(e) => updateSection(s.id, { title: e.target.value })}
              />
              <TextArea
                rows={2}
                placeholder="Objective for this section — e.g. For the investors to trust us."
                value={s.objective}
                onChange={(e) => updateSection(s.id, { objective: e.target.value })}
              />
            </div>
          ))}
          <div className="flex gap-2">
            <GhostButton onClick={() => setSections((s) => [...s, newSection()])}>
              + Add section
            </GhostButton>
            <PrimaryButton
              onClick={() => setStep(2)}
              disabled={!sections.some((s) => s.title.trim())}
            >
              Next: action verbs →
            </PrimaryButton>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {sections
            .filter((s) => s.title.trim())
            .map((s) => (
              <SectionActioning
                key={s.id}
                section={s}
                onAddPoint={(text) => addPoint(s.id, text)}
                onSetVerb={(pid, verb) => setVerb(s.id, pid, verb)}
                onRemovePoint={(pid) => removePoint(s.id, pid)}
              />
            ))}
          <PrimaryButton onClick={() => setStep(3)} disabled={actioned === 0}>
            Next: rehearse →
          </PrimaryButton>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Overall objective
            </p>
            <p className="mt-1 font-medium">{overall}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Run each point out loud, playing the verb fully. Tick it off, then run the whole thing
              once more without thinking about the verbs — and notice what stuck.
            </p>
          </div>
          {sections
            .filter((s) => s.points.length)
            .map((s) => (
              <div key={s.id} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold">{s.title || "Untitled section"}</h3>
                {s.objective && (
                  <p className="text-sm text-muted-foreground italic">{s.objective}</p>
                )}
                <ul className="mt-3 space-y-2">
                  {s.points.map((p) => (
                    <li key={p.id} className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={!!rehearsed[p.id]}
                        onChange={() => setRehearsed((r) => ({ ...r, [p.id]: !r[p.id] }))}
                      />
                      <span className="flex-1">{p.text}</span>
                      {p.verb && (
                        <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                          {p.verb}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          <div className="flex justify-end">
            <button
              onClick={() => window.print()}
              className="rounded-full border border-border bg-card px-5 py-2 text-sm hover:bg-secondary"
            >
              Print / Save PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionActioning({
  section,
  onAddPoint,
  onSetVerb,
  onRemovePoint,
}: {
  section: Section;
  onAddPoint: (text: string) => void;
  onSetVerb: (pid: string, verb: string) => void;
  onRemovePoint: (pid: string) => void;
}) {
  const [draft, setDraft] = usePersistentState("actioning-and-objectives", "draft", "");
  // Not persisted: this component is rendered once per section, so a shared
  // storage key would make every section's open point track the same value.
  const [openPoint, setOpenPoint] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
      <div>
        <h3 className="font-semibold">{section.title}</h3>
        {section.objective && (
          <p className="text-sm text-muted-foreground italic">{section.objective}</p>
        )}
      </div>

      <div className="flex gap-2">
        <TextInput
          placeholder="Add a point you'll make in this section…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              onAddPoint(draft.trim());
              setDraft("");
            }
          }}
        />
        <GhostButton
          onClick={() => {
            if (draft.trim()) {
              onAddPoint(draft.trim());
              setDraft("");
            }
          }}
          disabled={!draft.trim()}
        >
          Add
        </GhostButton>
      </div>

      <ul className="space-y-2">
        {section.points.map((p) => (
          <li key={p.id} className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-center gap-3">
              <span className="flex-1 text-sm">{p.text}</span>
              <button
                onClick={() => setOpenPoint(openPoint === p.id ? null : p.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium border ${
                  p.verb
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-dashed border-border text-muted-foreground"
                }`}
              >
                {p.verb || "Choose a verb"}
              </button>
              <button
                onClick={() => onRemovePoint(p.id)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            {openPoint === p.id && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {VERBS.map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      onSetVerb(p.id, v);
                      setOpenPoint(null);
                    }}
                    className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-secondary"
                  >
                    {v}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
        {section.points.length === 0 && (
          <li className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
            No points yet
          </li>
        )}
      </ul>
    </div>
  );
}
