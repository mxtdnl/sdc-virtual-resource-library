import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { IntroGrid, PrimaryButton, TextArea, TextInput } from "./_shared";

const CATEGORIES: { name: string; items: string[] }[] = [
  {
    name: "Fear of Failure",
    items: [
      "I must do things perfectly",
      "I must not fail",
      "I can't have other people think poorly of me",
      "If I try, then I will only fail",
      "If I make a mistake, I will be rejected",
      "If I try something and I'm not good at it, then I should never do it again",
      "Getting criticism means I failed",
    ],
  },
  {
    name: "All-or-Nothing Thinking",
    items: [
      "If I don't get an A then I should drop out of school",
      "People didn't like my idea, so I must not be smart enough",
      "There is a right and a wrong way to do things",
      "My work is never good enough",
      "I missed one day of my new habit, so I should just give up",
    ],
  },
  {
    name: "Shoulds / Musts",
    items: [
      "I must be perfect or other people will realise what I am really like",
      "Other people must like me",
      "I should never ask for help",
      "I must be the leader",
      "I should not stop and relax when I have work to do",
    ],
  },
  {
    name: "Constant Checking",
    items: [
      "I have to go over my work several times",
      "I need to make sure people around me like me",
      "I should triple-check assignment requirements",
      "I should keep my phone on me in case someone replies",
    ],
  },
  {
    name: "Structure and Control",
    items: [
      "I must know what is going to happen",
      "I must be prepared for every possible outcome",
      "I can't let anyone else do a task in case it goes wrong",
      "I need to stay on top of my teammates' work",
      "I need to keep strict track of my time",
    ],
  },
  {
    name: "Setting Demanding Standards",
    items: [
      "Doing well isn't good enough, I have to do even better",
      "If I don't continually strive for high standards, I am lazy",
      "I need to constantly stay busy with extra-curricular activities",
      "If I don't win, it was a complete waste of time",
    ],
  },
];

export default function RulesAndAssumptions() {
  const [step, setStep] = usePersistentState<
    "intro" | "check" | "custom" | "behaviour" | "summary"
  >("rules-and-assumptions-check", "step", "intro");
  const [selected, setSelected] = usePersistentState<Record<string, boolean>>(
    "rules-and-assumptions-check",
    "selected",
    {},
  );
  const [customRules, setCustomRules] = usePersistentState<string[]>(
    "rules-and-assumptions-check",
    "customRules",
    ["", "", ""],
  );
  const [customAssumptions, setCustomAssumptions] = useState<
    Array<{ ifPart: string; then: string }>
  >([{ ifPart: "", then: "" }]);
  const [behaviour, setBehaviour] = usePersistentState(
    "rules-and-assumptions-check",
    "behaviour",
    "",
  );

  const toggle = (s: string) => setSelected((p) => ({ ...p, [s]: !p[s] }));
  const selectedItems = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([k]) => k);

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A reflection exercise to surface the personal rules you live by and the assumptions that drive them — the unconscious script that plays when you get anxious."
            why="Rules become unhelpful when they're inaccurate or inflexible. Bringing them to light is the first step to challenging and changing them."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Tick the rules that resonate.</li>
                <li>Add your own.</li>
                <li>Notice how they shape your behaviour.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("check")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "check" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Common rules and assumptions</h2>
            <p className="text-sm text-muted-foreground mt-1">Tick any that feel true for you.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold mb-3">{cat.name}</h3>
                <ul className="space-y-2">
                  {cat.items.map((item) => (
                    <li key={item}>
                      <label className="flex items-start gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!selected[item]}
                          onChange={() => toggle(item)}
                          className="mt-0.5 accent-[var(--primary)]"
                        />
                        <span>{item}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <PrimaryButton onClick={() => setStep("custom")}>Next →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "custom" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Your own rules and assumptions
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add any specific to you that aren't in the list.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Unhelpful rules</h3>
            {customRules.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-20">I must / should / can't…</span>
                <TextInput
                  value={r}
                  onChange={(e) => {
                    const n = [...customRules];
                    n[i] = e.target.value;
                    setCustomRules(n);
                  }}
                  className="flex-1"
                />
              </div>
            ))}
            <button
              onClick={() => setCustomRules([...customRules, ""])}
              className="text-xs text-primary hover:underline"
            >
              + Add another
            </button>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="text-sm font-semibold">Unhelpful assumptions</h3>
            {customAssumptions.map((a, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-8">If…</span>
                  <TextInput
                    value={a.ifPart}
                    onChange={(e) => {
                      const n = [...customAssumptions];
                      n[i] = { ...n[i], ifPart: e.target.value };
                      setCustomAssumptions(n);
                    }}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-12">then…</span>
                  <TextInput
                    value={a.then}
                    onChange={(e) => {
                      const n = [...customAssumptions];
                      n[i] = { ...n[i], then: e.target.value };
                      setCustomAssumptions(n);
                    }}
                    className="flex-1"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => setCustomAssumptions([...customAssumptions, { ifPart: "", then: "" }])}
              className="text-xs text-primary hover:underline"
            >
              + Add another
            </button>
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setStep("check")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <PrimaryButton onClick={() => setStep("behaviour")}>Next →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "behaviour" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            How does this shape your behaviour?
          </h2>
          <p className="text-sm text-muted-foreground">
            Consider how these rules and assumptions guide what you do — or avoid doing — day to
            day.
          </p>
          <TextArea
            rows={6}
            value={behaviour}
            onChange={(e) => setBehaviour(e.target.value)}
            placeholder="What do you do as a result of these beliefs?"
          />
          <div className="flex justify-between">
            <button
              onClick={() => setStep("custom")}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your unconscious script</h2>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">
              Rules you identified ({selectedItems.length + customRules.filter(Boolean).length})
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              {selectedItems.map((s) => (
                <li key={s}>{s}</li>
              ))}
              {customRules.filter(Boolean).map((r, i) => (
                <li key={`c${i}`}>{r}</li>
              ))}
              {selectedItems.length + customRules.filter(Boolean).length === 0 && (
                <li className="text-muted-foreground italic list-none">None selected</li>
              )}
            </ul>
          </div>
          {customAssumptions.some((a) => a.ifPart || a.then) && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3">Your assumptions</h3>
              <ul className="space-y-1 text-sm">
                {customAssumptions
                  .filter((a) => a.ifPart || a.then)
                  .map((a, i) => (
                    <li key={i}>
                      <span className="text-muted-foreground">If</span> {a.ifPart || "…"}{" "}
                      <span className="text-muted-foreground">then</span> {a.then || "…"}
                    </li>
                  ))}
              </ul>
            </div>
          )}
          {behaviour && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-2">How they shape your behaviour</h3>
              <p className="text-sm whitespace-pre-wrap">{behaviour}</p>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Next: try the <em>Challenging Rules and Assumptions</em> exercise to start shifting one
            of these.
          </p>
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
