import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, IntroGrid, TextArea } from "./_shared";

const PARTS = [
  {
    key: "specific",
    label: "Specific",
    hint: "Define the goal as clearly as possible.",
    example: "I want to secure an internship at a marketing agency in London.",
  },
  {
    key: "measurable",
    label: "Measurable",
    hint: "How will you measure progress?",
    example: "I will receive at least one job offer.",
  },
  {
    key: "achievable",
    label: "Achievable",
    hint: "Realistic given your circumstances?",
    example: "I'll spend two hours each week on applications and use Career Services.",
  },
  {
    key: "relevant",
    label: "Relevant",
    hint: "Why does this matter to you?",
    example: "Professional work experience matters for my long-term career.",
  },
  {
    key: "timebound",
    label: "Time-bound",
    hint: "Give a clear deadline.",
    example: "By the end of Spring Term.",
  },
] as const;

type K = (typeof PARTS)[number]["key"];

export default function SmartGoals() {
  const [vals, setVals] = usePersistentState<Record<K, string>>("smart-goals", "vals", {
    specific: "",
    measurable: "",
    achievable: "",
    relevant: "",
    timebound: "",
  });
  const [combined, setCombined] = usePersistentState("smart-goals", "combined", "");
  const [confidence, setConfidence] = usePersistentState("smart-goals", "confidence", 70);
  const [boost, setBoost] = usePersistentState("smart-goals", "boost", "");

  return (
    <div className="space-y-8">
      <IntroGrid
        what="SMART goals turn vague intentions into Specific, Measurable, Achievable, Relevant, Time-bound commitments."
        why="Clear goals build their own roadmap and deadline, making completion much more likely than vague aspirations."
        how="Define each component below, then combine them into one clear sentence. Finish with a confidence check."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {PARTS.map((p) => (
          <Field key={p.key} label={p.label} hint={p.hint}>
            <TextArea
              rows={3}
              value={vals[p.key]}
              onChange={(e) => setVals((v) => ({ ...v, [p.key]: e.target.value }))}
              placeholder={`Example: ${p.example}`}
            />
          </Field>
        ))}
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-3">
        <Field label="Combine it all into one clear goal">
          <TextArea
            rows={3}
            value={combined}
            onChange={(e) => setCombined(e.target.value)}
            placeholder="Bring all five together into one sentence."
          />
        </Field>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold">Reflection</h3>
        <div>
          <label className="text-sm" htmlFor="smart-goals-confidence">
            How confident do you feel about this goal? <strong>{confidence}%</strong>
          </label>
          <input
            id="smart-goals-confidence"
            type="range"
            min={0}
            max={100}
            value={confidence}
            onChange={(e) => setConfidence(+e.target.value)}
            className="w-full mt-2"
          />
        </div>
        <Field
          label="What could increase your confidence?"
          hint="Tweak the goal, reach out for support, break it down..."
        >
          <TextArea rows={3} value={boost} onChange={(e) => setBoost(e.target.value)} />
        </Field>
      </div>
    </div>
  );
}
