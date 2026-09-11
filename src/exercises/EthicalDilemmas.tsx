import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea, TextInput } from "./_shared";

type Dilemma = {
  key: string;
  group: "Classical" | "Business";
  title: string;
  body: string;
  question: string;
  optionA: string;
  optionB: string;
  stakeholders: string[];
};

const DILEMMAS: Dilemma[] = [
  {
    key: "trolley",
    group: "Classical",
    title: "The Trolley Problem",
    body: "A runaway trolley is heading toward five people tied to the tracks. You can pull a lever to divert the trolley onto another track, but doing so will kill one person standing there.",
    question:
      "Do you act and take responsibility for one death to save five, or do you do nothing and allow the five to die?",
    optionA: "Pull the lever",
    optionB: "Do nothing",
    stakeholders: ["The five on the track", "The one person", "You", "Their families"],
  },
  {
    key: "lifeboat",
    group: "Classical",
    title: "The Lifeboat Scenario",
    body: "A ship sinks, and the lifeboat you're on is overcrowded. Unless someone is removed, everyone risks drowning.",
    question:
      "Do you push someone out to save the rest, volunteer yourself, or refuse to choose and risk all lives?",
    optionA: "Remove someone (or volunteer)",
    optionB: "Refuse to choose",
    stakeholders: ["Everyone in the boat", "The person removed", "You", "Rescuers"],
  },
  {
    key: "secret",
    group: "Classical",
    title: "The Friend's Secret",
    body: "Your best friend confides that they have been cheating on an exam. Later, your teacher asks if you know anything about widespread cheating in the class. If the cheating isn't resolved, the whole class will fail the exam.",
    question:
      "Do you protect your friend's trust, or speak up to uphold fairness — and protect your own grade?",
    optionA: "Speak up",
    optionB: "Protect your friend's trust",
    stakeholders: ["Your friend", "The rest of the class", "Your teacher", "You"],
  },
  {
    key: "inflated",
    group: "Business",
    title: "The Inflated Results",
    body: "You discover that a teammate has exaggerated their performance metrics in a project report. Their actions make the whole team look good and may secure future funding.",
    question:
      "Do you report the dishonesty, risking the team's success, or stay silent to protect the group?",
    optionA: "Report it",
    optionB: "Stay silent",
    stakeholders: ["Your teammate", "The team", "Funders / clients", "You"],
  },
  {
    key: "faulty",
    group: "Business",
    title: "The Faulty Product",
    body: "Your company is about to launch a product you know has a small flaw. It's unlikely to cause harm in most cases, but in rare situations it could. Speaking up will delay the launch and cost millions.",
    question: "Do you raise the concern, or stay silent to protect the business and jobs?",
    optionA: "Raise the concern",
    optionB: "Stay silent",
    stakeholders: ["Customers", "Colleagues & their jobs", "Shareholders", "You"],
  },
  {
    key: "supplier",
    group: "Business",
    title: "The Unethical Supplier",
    body: "You're negotiating a contract with a supplier who offers the best prices, but you know they use questionable labour practices overseas. Choosing them saves significant money and lets the business grow faster.",
    question:
      "Do you work with them for the sake of growth, or walk away and pay more for ethical sourcing?",
    optionA: "Walk away",
    optionB: "Work with them",
    stakeholders: ["Overseas workers", "Your customers", "Your team", "You"],
  },
];

const VALUES = [
  "Fairness",
  "Honesty",
  "Loyalty",
  "Results",
  "Care",
  "Integrity",
  "Responsibility",
  "Courage",
  "Safety",
  "Growth",
  "Respect",
  "Justice",
];

export default function EthicalDilemmas() {
  const [step, setStep] = usePersistentState<
    "intro" | "pick" | "gut" | "weigh" | "decide" | "summary"
  >("ethical-dilemmas", "step", "intro");
  const [group, setGroup] = usePersistentState<"Classical" | "Business">(
    "ethical-dilemmas",
    "group",
    "Classical",
  );
  const [key, setKey] = usePersistentState<string | null>("ethical-dilemmas", "key", null);
  const [gut, setGut] = usePersistentState<"A" | "B" | null>("ethical-dilemmas", "gut", null);
  const [gutWhy, setGutWhy] = usePersistentState("ethical-dilemmas", "gutWhy", "");
  const [conseq, setConseq] = usePersistentState<Record<string, string>>(
    "ethical-dilemmas",
    "conseq",
    {},
  );
  const [values, setValues] = usePersistentState<string[]>("ethical-dilemmas", "values", []);
  const [views, setViews] = usePersistentState<Record<string, string>>(
    "ethical-dilemmas",
    "views",
    {},
  );
  const [finalChoice, setFinal] = usePersistentState<"A" | "B" | null>(
    "ethical-dilemmas",
    "finalChoice",
    null,
  );
  const [reason, setReason] = usePersistentState("ethical-dilemmas", "reason", "");

  const d = DILEMMAS.find((x) => x.key === key) ?? null;
  const label = (c: "A" | "B" | null) => (!d || !c ? "—" : c === "A" ? d.optionA : d.optionB);

  const toggleValue = (v: string) =>
    setValues((s) => (s.includes(v) ? s.filter((x) => x !== v) : s.length < 5 ? [...s, v] : s));

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="An ethical dilemma is a situation where you face a difficult choice between two or more options, none of which are fully 'right' or 'wrong'."
            why="Reflecting on dilemmas clarifies your values, reveals the complexity of real decisions, builds empathy, and prepares you for the moments that test integrity and judgment."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Choose a dilemma.</li>
                <li>Capture your gut reaction.</li>
                <li>Weigh consequences, values and stakeholders.</li>
                <li>Decide — and compare it to your instinct.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("pick")}>Choose a dilemma →</PrimaryButton>
        </section>
      )}

      {step === "pick" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Pick a dilemma</h2>
          <div className="flex gap-2">
            {(["Classical", "Business"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${group === g ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-secondary"}`}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {DILEMMAS.filter((x) => x.group === group).map((x) => (
              <button
                key={x.key}
                onClick={() => {
                  setKey(x.key);
                  setGut(null);
                  setGutWhy("");
                  setConseq({});
                  setValues([]);
                  setViews({});
                  setFinal(null);
                  setReason("");
                  setStep("gut");
                }}
                className={`text-left rounded-xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${key === x.key ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              >
                <h3 className="font-semibold">{x.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{x.body}</p>
              </button>
            ))}
          </div>
          <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
        </section>
      )}

      {step === "gut" && d && (
        <section className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">{d.title}</h2>
            <p className="mt-2 text-sm leading-relaxed">{d.body}</p>
            <p className="mt-3 text-sm font-medium">{d.question}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Gut check — don't overthink it.</p>
            <div className="grid gap-3 md:grid-cols-2 mt-3">
              {(["A", "B"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setGut(c)}
                  className={`rounded-xl border p-5 text-left transition ${gut === c ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary"}`}
                >
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Option {c}
                  </span>
                  <p className="mt-1 font-medium">{label(c)}</p>
                </button>
              ))}
            </div>
          </div>
          <Field label="Why? First reaction, one or two lines.">
            <TextArea rows={3} value={gutWhy} onChange={(e) => setGutWhy(e.target.value)} />
          </Field>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("pick")}>← Choose another</GhostButton>
            <PrimaryButton disabled={!gut} onClick={() => setStep("weigh")}>
              Weigh it up →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "weigh" && d && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Weigh the options</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {(["A", "B"] as const).map((c) => (
              <div key={c} className="rounded-xl border border-border bg-card p-5 space-y-3">
                <p className="font-semibold">{label(c)}</p>
                <Field label="Short-term consequences">
                  <TextArea
                    rows={3}
                    value={conseq[c + "-short"] ?? ""}
                    onChange={(e) => setConseq({ ...conseq, [c + "-short"]: e.target.value })}
                  />
                </Field>
                <Field label="Long-term consequences">
                  <TextArea
                    rows={3}
                    value={conseq[c + "-long"] ?? ""}
                    onChange={(e) => setConseq({ ...conseq, [c + "-long"]: e.target.value })}
                  />
                </Field>
              </div>
            ))}
          </div>

          <div>
            <p className="text-sm font-medium">
              Which values are you prioritising?{" "}
              <span className="text-muted-foreground font-normal">(pick up to 5)</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {VALUES.map((v) => (
                <button
                  key={v}
                  onClick={() => toggleValue(v)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${values.includes(v) ? "border-primary bg-primary/10 font-semibold" : "border-border bg-card hover:bg-secondary"}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Stakeholders — how might each see this?</p>
            {d.stakeholders.map((s) => (
              <div key={s} className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="md:w-56 text-sm text-muted-foreground">{s}</span>
                <TextInput
                  value={views[s] ?? ""}
                  onChange={(e) => setViews({ ...views, [s]: e.target.value })}
                  placeholder="Their perspective…"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("gut")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("decide")}>Make a decision →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "decide" && d && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your decision</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {(["A", "B"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setFinal(c)}
                className={`rounded-xl border p-5 text-left transition ${finalChoice === c ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-secondary"}`}
              >
                <p className="font-medium">{label(c)}</p>
              </button>
            ))}
          </div>
          <Field label="Why — and which values decided it?">
            <TextArea rows={5} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("weigh")}>← Back</GhostButton>
            <PrimaryButton disabled={!finalChoice} onClick={() => setStep("summary")}>
              See summary →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && d && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">{d.title}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Your gut said
              </p>
              <p className="mt-1 font-medium">{label(gut)}</p>
              {gutWhy && (
                <p className="mt-2 text-sm whitespace-pre-wrap text-muted-foreground">{gutWhy}</p>
              )}
            </div>
            <div
              className={`rounded-lg border p-4 ${gut === finalChoice ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}
            >
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                You decided
              </p>
              <p className="mt-1 font-medium">{label(finalChoice)}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {gut === finalChoice
                  ? "Your reasoning confirmed your instinct."
                  : "Reflection changed your mind — worth noticing what shifted."}
              </p>
            </div>
          </div>
          {values.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Values in play
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {values.map((v) => (
                  <span key={v} className="rounded-full bg-secondary px-3 py-1 text-xs">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}
          {reason && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Reasoning
              </p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{reason}</p>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {(["A", "B"] as const).map((c) => (
              <div key={c} className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-semibold">{label(c)}</p>
                {conseq[c + "-short"] && (
                  <p className="mt-2 text-sm">
                    <span className="text-muted-foreground">Short-term: </span>
                    {conseq[c + "-short"]}
                  </p>
                )}
                {conseq[c + "-long"] && (
                  <p className="mt-1 text-sm">
                    <span className="text-muted-foreground">Long-term: </span>
                    {conseq[c + "-long"]}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("decide")}>← Back</GhostButton>
            <GhostButton onClick={() => setStep("pick")}>Try another dilemma</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
