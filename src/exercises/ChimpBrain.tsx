import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { IntroGrid, PrimaryButton, TextArea } from "./_shared";

const STEPS = [
  {
    key: "recognise",
    title: "1. Recognise the Chimp",
    prompt:
      "Ask yourself: 'Do I want these thoughts, feelings, or behaviours?' If the answer is no, you're likely in Chimp mode. What's happening?",
  },
  {
    key: "express",
    title: "2. Exercise the Chimp",
    prompt:
      "Let the Chimp speak. Write out the feelings — no matter how irrational or exaggerated they seem.",
  },
  {
    key: "slow",
    title: "3. Slow down",
    prompt:
      "Use a grounding technique — slow breathing, step away, sensory check. Note what helped.",
  },
  {
    key: "box",
    title: "4. Box the Chimp",
    prompt: "Now bring in facts and logic. What's true here? What's the more measured view?",
  },
  {
    key: "action",
    title: "5. Action step",
    prompt: "What's one small, concrete action you can take right now to move forward?",
  },
  {
    key: "care",
    title: "6. Comforting action",
    prompt: "Choose one kind thing to do for yourself to close the loop.",
  },
] as const;

export default function ChimpBrain() {
  const [idx, setIdx] = usePersistentState("chimp-brain", "idx", -1);
  const [data, setData] = usePersistentState<Record<string, string>>("chimp-brain", "data", {});

  if (idx === -1) {
    return (
      <div className="space-y-6">
        <IntroGrid
          what="A step-by-step way to handle moments when your emotional, instinctive 'Chimp' brain hijacks your thinking — bringing panic, anxiety, or stress."
          why="The Chimp is a fight/flight/freeze response, often out of proportion. Managing it lets you return to clearer, proactive thinking."
          how={
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>Spot it.</li>
              <li>Let it speak.</li>
              <li>Slow down, then bring in logic.</li>
              <li>Take one small action.</li>
            </ol>
          }
        />
        <PrimaryButton onClick={() => setIdx(0)}>Begin →</PrimaryButton>
      </div>
    );
  }

  if (idx >= STEPS.length) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight">Your reflection</h2>
        {STEPS.map((s) => (
          <div key={s.key} className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm whitespace-pre-wrap">
              {data[s.key] || <span className="text-muted-foreground italic">—</span>}
            </p>
          </div>
        ))}
        <p className="text-sm text-muted-foreground">
          Consider following this up with a thought log, rules &amp; assumptions check, or
          self-compassion practice.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => {
              setIdx(-1);
              setData({});
            }}
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
      </div>
    );
  }

  const step = STEPS[idx];
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-primary" : "bg-secondary"}`}
          />
        ))}
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{step.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{step.prompt}</p>
      </div>
      <TextArea
        rows={6}
        value={data[step.key] ?? ""}
        onChange={(e) => setData({ ...data, [step.key]: e.target.value })}
      />
      <div className="flex justify-between">
        <button
          onClick={() => setIdx(idx - 1)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>
        <PrimaryButton onClick={() => setIdx(idx + 1)}>
          {idx === STEPS.length - 1 ? "See reflection →" : "Next →"}
        </PrimaryButton>
      </div>
    </div>
  );
}
