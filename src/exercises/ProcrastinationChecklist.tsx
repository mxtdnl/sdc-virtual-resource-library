import { useMemo, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea, TextInput } from "./_shared";

const CATEGORIES = [
  {
    name: "Academics",
    items: [
      "Going to class on time",
      "Class readings",
      "Individual assignments",
      "Group assignment tasks",
      "Writing assignments",
      "Team meetings (planning / attending)",
      "Presentations (creating / practicing)",
      "Self-directed learning",
      "Extracurricular work",
      "Booking coaching meetings",
      "Attending coaching meetings",
      "Using campus resources",
      "Course enrolment",
      "Speaking with professors",
    ],
  },
  {
    name: "Personal Wellness & Self-Care",
    items: [
      "Exercise",
      "Eating well",
      "Sleep routine",
      "Drinking water",
      "Mental health activities",
      "Taking breaks",
      "Planning vacations / trips",
      "Therapy / check-ins",
    ],
  },
  {
    name: "Home & Life Admin",
    items: [
      "Regular chores",
      "Decluttering space",
      "Washing up",
      "Laundry",
      "Grocery shopping",
      "Cleaning",
      "Household maintenance",
      "Paying bills / rent",
      "Checking / setting budget",
      "Living arrangements",
      "Contacting landlord",
      "Organizing schedule",
    ],
  },
  {
    name: "Work & Professional Life",
    items: [
      "Writing CV",
      "Job searching",
      "Contacting employers",
      "Applying for jobs",
      "Going to work",
      "Career planning",
    ],
  },
  {
    name: "Family & Social Life",
    items: [
      "Talking with friends",
      "Responding to messages",
      "Making social plans",
      "Calling family",
      "Addressing conflict",
      "Joining societies / clubs",
      "Ending a relationship",
    ],
  },
] as const;

export default function ProcrastinationChecklist() {
  const [step, setStep] = usePersistentState<"intro" | "check" | "plan" | "summary">(
    "procrastination-checklist",
    "step",
    "intro",
  );
  const [checked, setChecked] = usePersistentState<Set<string>>(
    "procrastination-checklist",
    "checked",
    new Set(),
  );
  const [extras, setExtras] = usePersistentState<Record<string, string>>(
    "procrastination-checklist",
    "extras",
    {},
  );
  const [plan, setPlan] = usePersistentState("procrastination-checklist", "plan", "");

  const toggle = (item: string) => {
    const next = new Set(checked);
    next.has(item) ? next.delete(item) : next.add(item);
    setChecked(next);
  };

  const totals = useMemo(
    () =>
      CATEGORIES.map((c) => {
        const count =
          c.items.filter((i) => checked.has(`${c.name}::${i}`)).length +
          (extras[c.name]?.trim() ? 1 : 0);
        return { name: c.name, count, total: c.items.length };
      }),
    [checked, extras],
  );

  const topCategory = useMemo(() => [...totals].sort((a, b) => b.count - a.count)[0], [totals]);

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A checklist for spotting where you actually procrastinate — not as a global trait, but in specific contexts."
            why='Calling yourself "a procrastinator" makes it feel unfixable. Naming the exact areas turns it into something you can address.'
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Tick everything you often delay.</li>
                <li>Notice which categories cluster.</li>
                <li>Set a small, specific plan.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("check")}>Begin →</PrimaryButton>
        </section>
      )}

      {step === "check" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Tick what you tend to put off</h2>
          <div className="space-y-5">
            {CATEGORIES.map((c) => (
              <div key={c.name} className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-base font-semibold">{c.name}</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {c.items.map((i) => {
                    const id = `${c.name}::${i}`;
                    const on = checked.has(id);
                    return (
                      <label key={i} className="flex items-start gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggle(id)}
                          className="mt-1 accent-[var(--primary)]"
                        />
                        <span>{i}</span>
                      </label>
                    );
                  })}
                </div>
                <TextInput
                  className="mt-3"
                  placeholder="Add your own…"
                  value={extras[c.name] ?? ""}
                  onChange={(e) => setExtras({ ...extras, [c.name]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("plan")}>See your patterns →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "plan" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Where it shows up</h2>
          <div className="space-y-2">
            {totals.map((t) => (
              <div key={t.name} className="rounded-lg border border-border bg-card p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {t.count} / {t.total}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${t.total ? (t.count / t.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {topCategory && topCategory.count > 0 && (
            <p className="text-sm text-muted-foreground">
              Your biggest cluster is{" "}
              <span className="font-medium text-foreground">{topCategory.name}</span>. Start there.
            </p>
          )}
          <Field
            label="One specific action you'll take this week"
            hint="Pick a single ticked item and decide exactly when and how you'll do it."
          >
            <TextArea rows={4} value={plan} onChange={(e) => setPlan(e.target.value)} />
          </Field>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("check")}>← Edit list</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your snapshot</h2>
          <div className="space-y-3">
            {CATEGORIES.map((c) => {
              const items = c.items.filter((i) => checked.has(`${c.name}::${i}`));
              const extra = extras[c.name]?.trim();
              if (items.length === 0 && !extra) return null;
              return (
                <div key={c.name} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {c.name}
                  </p>
                  <ul className="mt-2 text-sm list-disc pl-5 space-y-0.5">
                    {items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                    {extra && <li>{extra}</li>}
                  </ul>
                </div>
              );
            })}
            {plan && (
              <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  This week's action
                </p>
                <p className="mt-2 text-sm whitespace-pre-wrap">{plan}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("plan")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
