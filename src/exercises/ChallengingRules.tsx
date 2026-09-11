import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { IntroGrid, PrimaryButton, TextArea } from "./_shared";

export default function ChallengingRules() {
  const [step, setStep] = usePersistentState<
    "intro" | "identify" | "experiment" | "results" | "reflect" | "summary"
  >("challenging-rules-and-assumptions", "step", "intro");
  const [data, setData] = usePersistentState("challenging-rules-and-assumptions", "data", {
    belief: "",
    origin: "",
    unreasonable: "",
    consequences: "",
    prediction: "",
    predictionChance: 50,
    experiment: "",
    outcome: "",
    anxBefore: 5,
    anxDuring: 5,
    anxAfter: 5,
    learning: "",
  });
  const u = (patch: Partial<typeof data>) => setData((d) => ({ ...d, ...patch }));

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="Challenge a rule or assumption you'd like to shift — usually one tied to perfectionism, anxiety, or avoidance — by running a small behavioural experiment."
            why="Identifying a belief is half the work. Testing it gently in real life is what creates change and builds confidence."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Name the belief and what it costs you.</li>
                <li>Predict, then run an experiment.</li>
                <li>Compare prediction with reality.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("identify")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "identify" && (
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight">1. Name the belief</h2>
          <Field label="What's the unhelpful rule or assumption you'd like to adjust? What do you do (or avoid) because of it?">
            <TextArea
              rows={3}
              value={data.belief}
              onChange={(e) => u({ belief: e.target.value })}
            />
          </Field>
          <Field label="Where did this belief come from?">
            <TextArea
              rows={2}
              value={data.origin}
              onChange={(e) => u({ origin: e.target.value })}
            />
          </Field>
          <Field label="In what ways is it unreasonable, unrealistic, unfair, or unhelpful?">
            <TextArea
              rows={3}
              value={data.unreasonable}
              onChange={(e) => u({ unreasonable: e.target.value })}
            />
          </Field>
          <Field label="What are the negative consequences of holding it?">
            <TextArea
              rows={3}
              value={data.consequences}
              onChange={(e) => u({ consequences: e.target.value })}
            />
          </Field>
          <div className="flex justify-end">
            <PrimaryButton onClick={() => setStep("experiment")}>Next →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "experiment" && (
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight">2. Design the experiment</h2>
          <Field label="What do you predict will happen if your belief is true?">
            <TextArea
              rows={3}
              value={data.prediction}
              onChange={(e) => u({ prediction: e.target.value })}
            />
          </Field>
          <div>
            <label className="text-sm font-medium">
              How likely is your prediction?{" "}
              <span className="ml-2 tabular-nums text-primary font-semibold">
                {data.predictionChance}%
              </span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={data.predictionChance}
              onChange={(e) => u({ predictionChance: Number(e.target.value) })}
              className="w-full mt-2 accent-[var(--primary)]"
            />
          </div>
          <Field
            label="What's a small experiment to test it?"
            hint="e.g. Arrive 10 minutes early to class instead of 30."
          >
            <TextArea
              rows={3}
              value={data.experiment}
              onChange={(e) => u({ experiment: e.target.value })}
            />
          </Field>
          <div className="flex justify-between">
            <button
              onClick={() => setStep("identify")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <PrimaryButton onClick={() => setStep("results")}>Next →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "results" && (
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight">3. After the experiment</h2>
          <Field label="What actually happened?">
            <TextArea
              rows={4}
              value={data.outcome}
              onChange={(e) => u({ outcome: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            {(["anxBefore", "anxDuring", "anxAfter"] as const).map((k, i) => (
              <div key={k} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  {["Before", "During", "After"][i]}
                </p>
                <p className="text-3xl font-semibold mt-1 tabular-nums">
                  {data[k]}
                  <span className="text-sm text-muted-foreground">/10</span>
                </p>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={data[k]}
                  onChange={(e) => u({ [k]: Number(e.target.value) } as Partial<typeof data>)}
                  className="w-full mt-2 accent-[var(--primary)]"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setStep("experiment")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <PrimaryButton onClick={() => setStep("reflect")}>Next →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "reflect" && (
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold tracking-tight">4. Reflect</h2>
          <Field label="Compare prediction with reality — what did you learn?">
            <TextArea
              rows={5}
              value={data.learning}
              onChange={(e) => u({ learning: e.target.value })}
            />
          </Field>
          <div className="flex justify-between">
            <button
              onClick={() => setStep("results")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Experiment results</h2>
          <SummaryRow label="Belief tested">{data.belief}</SummaryRow>
          <SummaryRow label="Prediction">
            {data.prediction}{" "}
            <span className="text-muted-foreground">({data.predictionChance}% likely)</span>
          </SummaryRow>
          <SummaryRow label="Experiment">{data.experiment}</SummaryRow>
          <SummaryRow label="What actually happened">{data.outcome}</SummaryRow>
          <SummaryRow label="Anxiety levels">
            Before {data.anxBefore}/10 · During {data.anxDuring}/10 · After {data.anxAfter}/10
          </SummaryRow>
          <SummaryRow label="Learning">{data.learning}</SummaryRow>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStep("intro")}
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
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="mt-1 text-sm whitespace-pre-wrap">{children || "—"}</p>
    </div>
  );
}
