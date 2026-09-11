import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";

const QUESTIONS = [
  {
    key: "energize",
    label: "What energizes you?",
    hint: "Activities, subjects, or moments when you lose track of time — your flow states.",
  },
  {
    key: "strengths",
    label: "What are your strengths?",
    hint: "What you excel at with minimal effort — including people skills, creativity, problem solving.",
  },
  {
    key: "inspires",
    label: "What inspires you?",
    hint: "People, ideas, causes, or environments that resonate with you on a personal level.",
  },
  {
    key: "ideal",
    label: "What would your ideal life look like?",
    hint: "Five years from now, everything went exactly as planned. Where are you? What are you doing?",
  },
  {
    key: "overlap",
    label: "How do the above overlap?",
    hint: "Look for patterns, themes, or common threads.",
  },
] as const;

export default function FindingPassions() {
  const [step, setStep] = usePersistentState<"intro" | "reflect" | "actions" | "summary">(
    "finding-your-passions",
    "step",
    "intro",
  );
  const [answers, setAnswers] = usePersistentState<Record<string, string>>(
    "finding-your-passions",
    "answers",
    {},
  );
  const [action1, setAction1] = usePersistentState("finding-your-passions", "action1", "");
  const [action2, setAction2] = usePersistentState("finding-your-passions", "action2", "");

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A reflection exercise to surface your passions and a clearer sense of direction."
            why="Identifying passions brings clarity and motivation. Passions shift over time — revisiting this keeps you aligned."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Answer each question honestly and in detail.</li>
                <li>Spot the patterns between answers.</li>
                <li>Pick one or two small experiments to test what you found.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("reflect")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "reflect" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Reflect</h2>
          <div className="space-y-5">
            {QUESTIONS.map((q) => (
              <Field key={q.key} label={q.label} hint={q.hint}>
                <TextArea
                  rows={4}
                  value={answers[q.key] ?? ""}
                  onChange={(e) => setAnswers({ ...answers, [q.key]: e.target.value })}
                />
              </Field>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("actions")}>Test it out →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "actions" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Small experiments</h2>
          <p className="text-sm text-muted-foreground">
            Pick one or two concrete actions to test what came through. e.g. join a club, try a
            class, talk to someone in that field.
          </p>
          <Field label="Action 1">
            <TextArea rows={3} value={action1} onChange={(e) => setAction1(e.target.value)} />
          </Field>
          <Field label="Action 2 (optional)">
            <TextArea rows={3} value={action2} onChange={(e) => setAction2(e.target.value)} />
          </Field>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("reflect")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your passions snapshot</h2>
          <div className="space-y-3">
            {QUESTIONS.map(
              (q) =>
                answers[q.key] && (
                  <div key={q.key} className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {q.label}
                    </p>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{answers[q.key]}</p>
                  </div>
                ),
            )}
            {(action1 || action2) && (
              <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Next experiments
                </p>
                {action1 && <p className="mt-2 text-sm whitespace-pre-wrap">→ {action1}</p>}
                {action2 && <p className="mt-1 text-sm whitespace-pre-wrap">→ {action2}</p>}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("actions")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
