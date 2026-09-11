import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";

const VISUALS = [
  {
    key: "appearance",
    label: "Appearance",
    hint: "What are they wearing? What's their energy or presence like?",
  },
  {
    key: "environment",
    label: "Environment",
    hint: "Where do they live? What is their home like?",
  },
  {
    key: "lifestyle",
    label: "Lifestyle",
    hint: "What is a typical day like? What do they value most?",
  },
  {
    key: "occupation",
    label: "Occupation & passions",
    hint: "What do they do for work? How do they spend free time?",
  },
  { key: "wisdom", label: "Wisdom", hint: "What life lessons or perspectives have they gained?" },
] as const;

const MESSAGES = [
  { key: "advice", label: "What advice do you have for me right now?" },
  { key: "challenge", label: "What was the biggest challenge you overcame — and how?" },
  { key: "hopes", label: "What hopes do you have for me today?" },
] as const;

type Notes = Record<string, string>;

export default function FutureSelf() {
  const [step, setStep] = usePersistentState<
    "intro" | "ground" | "visualize" | "messages" | "summary"
  >("future-self", "step", "intro");
  const [notes, setNotes] = usePersistentState<Notes>("future-self", "notes", {});
  const update = (k: string, v: string) => setNotes((n) => ({ ...n, [k]: v }));

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="Imagine yourself 15 years from now — who you are, not just what you do."
            why="Picturing a wiser future self clarifies goals today and gives you an inner guide for encouragement and advice."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Ground yourself with a few breaths.</li>
                <li>Visualize meeting your future self.</li>
                <li>Listen for their message and write it down.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("ground")}>Begin →</PrimaryButton>
        </section>
      )}

      {step === "ground" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Ground yourself</h2>
          <div className="rounded-xl border border-border bg-card p-6 space-y-3 text-sm leading-relaxed">
            <p>
              Take three slow breaths. Soften your shoulders. If it feels right, close your eyes for
              a moment.
            </p>
            <p>
              Picture a comfortable place — a café, a bench in a park, somewhere quiet. A version of
              you fifteen years older walks over and sits down. Notice how that feels.
            </p>
            <p>When you're ready, open your eyes and start the conversation.</p>
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("visualize")}>I'm ready →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "visualize" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Meet your future self</h2>
          <div className="space-y-4">
            {VISUALS.map((v) => (
              <Field key={v.key} label={v.label} hint={v.hint}>
                <TextArea
                  rows={3}
                  value={notes[v.key] ?? ""}
                  onChange={(e) => update(v.key, e.target.value)}
                  placeholder="What do you notice?"
                />
              </Field>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("ground")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("messages")}>Ask them →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "messages" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Their message to you</h2>
          <div className="space-y-4">
            {MESSAGES.map((m) => (
              <Field key={m.key} label={m.label}>
                <TextArea
                  rows={3}
                  value={notes[m.key] ?? ""}
                  onChange={(e) => update(m.key, e.target.value)}
                />
              </Field>
            ))}
            <Field label="Anything else — a reflection, takeaway, or action you'll commit to?">
              <TextArea
                rows={3}
                value={notes.action ?? ""}
                onChange={(e) => update("action", e.target.value)}
              />
            </Field>
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("visualize")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">A note from your future self</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ...VISUALS,
              ...MESSAGES,
              { key: "action", label: "Reflection / action" } as const,
            ].map((f) =>
              notes[f.key] ? (
                <div key={f.key} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {f.label}
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap">{notes[f.key]}</p>
                </div>
              ) : null,
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("messages")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
