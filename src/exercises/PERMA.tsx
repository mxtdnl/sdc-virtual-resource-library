import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { IntroGrid, PrimaryButton, TextArea } from "./_shared";
import { DraggableRadar } from "./WheelOfLife";

const AREAS = [
  {
    key: "P",
    name: "Positive Emotions",
    prompt:
      "How often do you experience joy, gratitude, or contentment? What brings these into your life?",
  },
  {
    key: "E",
    name: "Engagement",
    prompt:
      "When do you enter a state of 'flow'? How often do you engage in activities that challenge and energise you?",
  },
  {
    key: "R",
    name: "Relationships",
    prompt: "How is the quality of your connections with others? How could you deepen them?",
  },
  {
    key: "M",
    name: "Meaning",
    prompt: "How purposeful does your life feel? What gives it meaning?",
  },
  {
    key: "A",
    name: "Accomplishment",
    prompt: "How satisfied are you with your progress and achievements?",
  },
] as const;

type Entry = { score: number; notes: string };

export default function PERMA() {
  const [step, setStep] = usePersistentState<"intro" | "reflect" | "summary">(
    "perma-model",
    "step",
    "intro",
  );
  const [data, setData] = usePersistentState<Record<string, Entry>>("perma-model", "data", () =>
    Object.fromEntries(AREAS.map((a) => [a.key, { score: 5, notes: "" }])),
  );
  const [focus, setFocus] = usePersistentState("perma-model", "focus", "");

  const update = (k: string, patch: Partial<Entry>) =>
    setData((d) => ({ ...d, [k]: { ...d[k], ...patch } }));

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="The PERMA Model, developed by Martin Seligman, captures five core elements of wellbeing: Positive Emotions, Engagement, Relationships, Meaning, and Accomplishment."
            why="It encourages a balanced approach to wellbeing — not just fleeting happiness but enduring satisfaction. The check-in shows where you're thriving and where to focus."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Reflect on each of the 5 areas.</li>
                <li>Rate where you are now.</li>
                <li>Pick where to focus next.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("reflect")}>Start the check-in →</PrimaryButton>
        </section>
      )}

      {step === "reflect" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Shape your PERMA profile</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Drag each dot along its spoke — outward is thriving (10), inward is depleted (1). The
              shape morphs as you drag.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 flex justify-center">
            <DraggableRadar
              categories={AREAS.map((a) => a.name)}
              scores={Object.fromEntries(AREAS.map((a) => [a.name, data[a.key].score]))}
              setScores={(s) =>
                setData(
                  (d) =>
                    Object.fromEntries(
                      AREAS.map((a) => [a.key, { ...d[a.key], score: s[a.name] }]),
                    ) as Record<string, Entry>,
                )
              }
            />
          </div>
          <div className="space-y-4">
            {AREAS.map((a) => (
              <div key={a.key} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 grid place-items-center rounded-md bg-primary text-primary-foreground font-mono font-semibold">
                    {a.key}
                  </span>
                  <h3 className="text-lg font-semibold">{a.name}</h3>
                  <span className="ml-auto text-2xl font-semibold tabular-nums">
                    {data[a.key].score}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{a.prompt}</p>
                <TextArea
                  rows={2}
                  value={data[a.key].notes}
                  onChange={(e) => update(a.key, { notes: e.target.value })}
                  placeholder="Notes…"
                  className="mt-2"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your PERMA profile</h2>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            {AREAS.map((a) => (
              <div key={a.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{a.name}</span>
                  <span className="tabular-nums text-muted-foreground">{data[a.key].score}/10</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden mt-1">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${data[a.key].score * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="text-sm font-medium">
              Where do you want to focus your energy next?
            </label>
            <TextArea
              rows={3}
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="mt-2"
              placeholder="One or two areas to nurture…"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStep("reflect")}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-secondary"
            >
              ← Back
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
