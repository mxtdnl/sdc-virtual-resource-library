import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";

const QUESTIONS = [
  { key: "feel", label: "How do you feel approaching the end of the year? Why?" },
  { key: "goals", label: "What did you want to achieve this academic year? What were your goals?" },
  { key: "achieved", label: "Do you feel you achieved your goals? Why or why not?" },
  { key: "biggest", label: "What was your biggest achievement?" },
  { key: "next", label: "What do you want to focus on next?" },
] as const;

export default function EndOfYearReview() {
  const [step, setStep] = usePersistentState<"intro" | "reflect" | "summary">(
    "end-of-year-review",
    "step",
    "intro",
  );
  const [answers, setAnswers] = usePersistentState<Record<string, string>>(
    "end-of-year-review",
    "answers",
    {},
  );

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A simple set of questions to reflect on your past academic year."
            why="Reflection drives growth. Spotting what worked — and what didn't — lets you set sharper goals for what comes next."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Answer each question honestly.</li>
                <li>Take your time — there's no right length.</li>
                <li>Review and decide your next focus.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("reflect")}>Begin →</PrimaryButton>
        </section>
      )}

      {step === "reflect" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Reflect on your year</h2>
          <div className="space-y-5">
            {QUESTIONS.map((q) => (
              <Field key={q.key} label={q.label}>
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
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your year in review</h2>
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
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("reflect")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
