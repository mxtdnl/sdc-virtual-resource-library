import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { IntroGrid, PrimaryButton, TextArea } from "./_shared";

const STEPS = [
  {
    key: "reflect",
    title: "1. Reflect",
    prompt: "Write down a situation where you criticised yourself harshly or felt 'less than'.",
    example: "I tried to answer a question in class and got it wrong. It was really awkward.",
  },
  {
    key: "ack",
    title: "2. Acknowledge the feeling",
    prompt: "Notice how it made you feel — without pushing the emotion away.",
    example: "I feel ashamed and angry at myself. It hurts my confidence.",
  },
  {
    key: "human",
    title: "3. Recognise shared humanity",
    prompt: "Widen the perspective — struggle is part of being human.",
    example:
      "Everyone has had a moment where they got something wrong. It doesn't mean they're stupid.",
  },
  {
    key: "kind",
    title: "4. Offer kindness",
    prompt: "What would you say to a friend in this situation? Now say it to yourself.",
    example: "At least you raised your hand and tried — that's how you learn.",
  },
  {
    key: "action",
    title: "5. Comforting action",
    prompt: "Think of one small action you can take right now to care for yourself.",
    example: "I'm going to put on some music and chill for a bit.",
  },
] as const;

type Key = (typeof STEPS)[number]["key"];

export default function SelfCompassion() {
  const [idx, setIdx] = usePersistentState("self-compassion", "idx", -1);
  const [data, setData] = usePersistentState<Record<string, string>>("self-compassion", "data", {});

  if (idx === -1) {
    return (
      <div className="space-y-6">
        <IntroGrid
          what="A guided practice in treating yourself with the same kindness you'd offer a friend — especially when things go wrong."
          why="Harsh self-criticism compounds difficulty. Self-compassion builds resilience, motivation, and self-esteem."
          how={
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>Reflect on a difficult moment.</li>
              <li>Move through five short steps.</li>
              <li>Close with one kind action.</li>
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
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
        placeholder={`Example: ${step.example}`}
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
