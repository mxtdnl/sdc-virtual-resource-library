import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";
import { DraggableRadar } from "./WheelOfLife";

const CATEGORIES = [
  {
    name: "Personal",
    examples: [
      "Learning about yourself",
      "Planning goals",
      "Fostering friendships",
      "Social events",
      "Seeing family",
      "Learning new skills",
    ],
  },
  {
    name: "Physical",
    examples: [
      "Safe housing & medical wellness",
      "Eating healthy",
      "Exercise",
      "Sleep",
      "Massages",
      "Taking a walk",
      "Physical affection",
    ],
  },
  {
    name: "Psychological",
    examples: [
      "Self-reflection",
      "Therapy",
      "Consume/create art",
      "Relax",
      "Read a self-help book",
      "Joining a support group",
    ],
  },
  {
    name: "Emotional",
    examples: [
      "Self-love & self-compassion",
      "Laughing",
      "Buying yourself a treat",
      "Practising forgiveness",
      "Crying",
      "Emotional release",
    ],
  },
  {
    name: "Spiritual",
    examples: [
      "Going into nature",
      "Spiritual community",
      "Meditate",
      "Being inspired",
      "Volunteering",
      "Reflection on beliefs",
    ],
  },
  {
    name: "Professional",
    examples: [
      "Taking lunch / breaks",
      "Setting boundaries",
      "Logging off",
      "Planning career moves",
      "Days off when needed",
      "Support from colleagues",
    ],
  },
] as const;

type Scores = Record<string, number>;

export default function SelfCareWheel() {
  const [step, setStep] = usePersistentState<"intro" | "rate" | "summary">(
    "self-care-wheel",
    "step",
    "intro",
  );
  const [scores, setScores] = usePersistentState<Scores>("self-care-wheel", "scores", () =>
    Object.fromEntries(CATEGORIES.map((c) => [c.name, 5])),
  );
  const [reflections, setReflections] = usePersistentState("self-care-wheel", "reflections", {
    balance: "",
    surprise: "",
    attention: "",
    goals: "",
  });

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A visual check-in on your wellbeing across six dimensions — physical, psychological, emotional, personal, spiritual, and professional."
            why="Self-care is holistic, not just relaxing. The wheel shows where you're balanced and where you may be lacking."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Drag each dot along its spoke (outward = more satisfaction).</li>
                <li>Watch your wheel reshape live.</li>
                <li>Reflect and set one small goal.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("rate")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "rate" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Drag each dot to rate</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Outer ring = thriving (10). Centre = struggling (1).
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 flex justify-center">
            <DraggableRadar
              scores={scores}
              setScores={setScores}
              categories={CATEGORIES.map((c) => c.name)}
            />
          </div>

          <details className="rounded-xl border border-border bg-card p-4 text-sm">
            <summary className="cursor-pointer font-medium">Examples for each area</summary>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {CATEGORIES.map((c) => (
                <div key={c.name}>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.examples.join(" · ")}</p>
                </div>
              ))}
            </div>
          </details>

          <div className="space-y-4">
            <Reflect
              label="How balanced is your wheel?"
              value={reflections.balance}
              onChange={(v) => setReflections({ ...reflections, balance: v })}
            />
            <Reflect
              label="What surprised you about your ratings?"
              value={reflections.surprise}
              onChange={(v) => setReflections({ ...reflections, surprise: v })}
            />
            <Reflect
              label="Which areas need attention?"
              value={reflections.attention}
              onChange={(v) => setReflections({ ...reflections, attention: v })}
            />
            <Reflect
              label="What small goal could lift one area by 1 or 2?"
              value={reflections.goals}
              onChange={(v) => setReflections({ ...reflections, goals: v })}
            />
          </div>

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your self-care wheel</h2>
          <div className="rounded-xl border border-border bg-card p-6 flex justify-center">
            <DraggableRadar
              scores={scores}
              setScores={setScores}
              categories={CATEGORIES.map((c) => c.name)}
              readOnly
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(reflections).map(
              ([k, v]) =>
                v && (
                  <div key={k} className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {k}
                    </p>
                    <p className="mt-1 text-sm whitespace-pre-wrap">{v}</p>
                  </div>
                ),
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("rate")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}

function Reflect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <TextArea
        rows={2}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2"
      />
    </div>
  );
}
