import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";

const STEPS = [
  {
    key: "behavior",
    letter: "B",
    name: "Behavior",
    guide:
      "Describe a specific behavior you observed. Focus on just the facts, rather than adding value judgements.",
    example:
      "I noticed that you did not show up to our team meeting after agreeing that you would attend that time.",
    placeholder: "I've noticed that…",
  },
  {
    key: "effect",
    letter: "E",
    name: "Effect",
    guide:
      "Explain the impact of the behavior — how it affected the task or other people, or what it could lead to.",
    example:
      "We weren't able to get your input on task allocation, meaning we didn't know if the part we assigned you would be something you're comfortable with.",
    placeholder: "The effect of this is…",
  },
  {
    key: "alternative",
    letter: "A",
    name: "Alternative",
    guide:
      "Offer a constructive suggestion for another action. Be clear about what that could look like.",
    example:
      "If you aren't able to make a time we decided on, let us know so we can schedule an alternate time.",
    placeholder: "Something that could work instead is…",
  },
  {
    key: "result",
    letter: "R",
    name: "Result",
    guide: "Detail how the alternative behavior could lead to a more positive outcome.",
    example:
      "This means we can all work together and get your input, so that you can work on the things you want.",
    placeholder: "That way…",
  },
] as const;

const CHECKS = [
  "I've described what I saw, not what I assumed.",
  "I've avoided words like 'always', 'never', or 'lazy'.",
  "I'm addressing the behavior, not the person.",
];

const EXAMPLES = [
  {
    title: "Missing references",
    behavior:
      "I've noticed that you did not include any references or citations with your part of the business report.",
    effect:
      "Our professor could flag this as a concern, as not including references and a bibliography goes against the academic integrity requirements. The consequences would impact not only you, but our whole team.",
    alternative:
      "The best thing would be to incorporate the references as you write. But if you're unsure about in-text citations, you can ask the team and we can figure it out together.",
    result:
      "That way you get a better understanding of how it works, and we can ensure our work still aligns to the requirements.",
  },
  {
    title: "Reading notes off a phone",
    behavior: "I've noticed that in presentations, you read your notes off of your phone.",
    effect:
      "This means you aren't able to engage with the audience, and your delivery isn't as strong as it could be. That has an impact on the information you're trying to share.",
    alternative:
      "Writing notes on a piece of paper could be an option rather than your phone. You could also review them ahead of time so you're able to look up as you present.",
    result:
      "This will look more professional, and by writing them down you may get more comfortable with the content so you can be more confident in what you want to say.",
  },
];

export default function BearFeedback() {
  const [step, setStep] = usePersistentState<"intro" | "examples" | "build" | "summary">(
    "bear-feedback-model",
    "step",
    "intro",
  );
  const [exIdx, setExIdx] = useState(0);
  const [idx, setIdx] = usePersistentState("bear-feedback-model", "idx", 0);
  const [text, setText] = usePersistentState<Record<string, string>>(
    "bear-feedback-model",
    "text",
    {},
  );
  const [checked, setChecked] = usePersistentState<string[]>("bear-feedback-model", "checked", []);

  const current = STEPS[idx];
  const script = STEPS.map((s) => text[s.key]?.trim())
    .filter(Boolean)
    .join(" ");
  const ex = EXAMPLES[exIdx];

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A way to deliver feedback that is clear, respectful, actionable, and non-confrontational. BEAR stands for Behavior, Effect, Alternative, Result."
            why="Feedback that just says 'you are wrong' rarely gets the result you want — especially in a team of equals. Addressing the behavior, solution-first, reduces defensiveness and opens up conversation."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>See the model in action.</li>
                <li>Build your own feedback one letter at a time.</li>
                <li>Read the finished script back before you say it.</li>
              </ol>
            }
          />
          <div className="flex gap-2 flex-wrap">
            <PrimaryButton onClick={() => setStep("examples")}>See an example →</PrimaryButton>
            <GhostButton
              onClick={() => {
                setIdx(0);
                setStep("build");
              }}
            >
              Skip to building
            </GhostButton>
          </div>
        </section>
      )}

      {step === "examples" && (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="text-2xl font-semibold tracking-tight">Worked example</h2>
            <div className="flex gap-2">
              {EXAMPLES.map((e, i) => (
                <button
                  key={e.title}
                  onClick={() => setExIdx(i)}
                  className={`rounded-full px-3 py-1.5 text-xs transition ${i === exIdx ? "bg-primary text-primary-foreground" : "border border-border bg-card hover:bg-secondary"}`}
                >
                  {e.title}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {STEPS.map((s) => (
              <div key={s.key} className="rounded-xl border border-border bg-card p-5 flex gap-4">
                <span className="w-9 h-9 shrink-0 grid place-items-center rounded-md bg-primary text-primary-foreground font-mono font-semibold">
                  {s.letter}
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {s.name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">
                    {ex[s.key as keyof typeof ex] as string}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton
              onClick={() => {
                setIdx(0);
                setStep("build");
              }}
            >
              Build your own →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "build" && (
        <section className="space-y-6">
          <div className="flex gap-2">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setIdx(i)}
                className={`flex-1 rounded-lg border px-3 py-2 text-left transition ${i === idx ? "border-primary bg-primary/10" : text[s.key]?.trim() ? "border-border bg-secondary" : "border-border bg-card hover:bg-secondary"}`}
              >
                <span className="font-mono font-semibold">{s.letter}</span>
                <span className="ml-2 text-xs text-muted-foreground hidden sm:inline">
                  {s.name}
                </span>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-xl font-semibold">
              {current.letter} · {current.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">{current.guide}</p>
            <p className="mt-3 text-sm italic text-muted-foreground border-l-2 border-border pl-3">
              e.g. “{current.example}”
            </p>
            <TextArea
              rows={5}
              className="mt-4"
              placeholder={current.placeholder}
              value={text[current.key] ?? ""}
              onChange={(e) => setText({ ...text, [current.key]: e.target.value })}
            />
            {current.key === "behavior" && (
              <div className="mt-4 space-y-2">
                {CHECKS.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked.includes(c)}
                      onChange={() =>
                        setChecked((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))
                      }
                      className="accent-[var(--primary)]"
                    />
                    <span
                      className={checked.includes(c) ? "text-muted-foreground line-through" : ""}
                    >
                      {c}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Your feedback so far
            </p>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
              {script || (
                <span className="text-muted-foreground">It'll assemble here as you write…</span>
              )}
            </p>
          </div>

          <div className="flex justify-between gap-2">
            <GhostButton onClick={() => (idx === 0 ? setStep("examples") : setIdx(idx - 1))}>
              ← {idx === 0 ? "Back" : STEPS[idx - 1].name}
            </GhostButton>
            {idx < STEPS.length - 1 ? (
              <PrimaryButton onClick={() => setIdx(idx + 1)}>{STEPS[idx + 1].name} →</PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => setStep("summary")}>See your feedback →</PrimaryButton>
            )}
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your feedback</h2>
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-6">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {script || "Nothing written yet."}
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {STEPS.map(
              (s) =>
                text[s.key]?.trim() && (
                  <div key={s.key} className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {s.letter} · {s.name}
                    </p>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{text[s.key]}</p>
                  </div>
                ),
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("build")}>← Back</GhostButton>
            <GhostButton onClick={() => navigator.clipboard?.writeText(script)}>
              Copy feedback
            </GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
