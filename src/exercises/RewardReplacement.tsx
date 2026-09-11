import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";

const STEPS = ["Identify", "Replace", "Implement", "Track"] as const;

export default function RewardReplacement() {
  const [step, setStep] = usePersistentState("reward-replacement", "step", 0);
  const [behavior, setBehavior] = usePersistentState("reward-replacement", "behavior", "");
  const [reward, setReward] = usePersistentState("reward-replacement", "reward", "");
  const [cost, setCost] = usePersistentState("reward-replacement", "cost", "");
  const [alternative, setAlternative] = usePersistentState("reward-replacement", "alternative", "");
  const [trigger, setTrigger] = usePersistentState("reward-replacement", "trigger", "");
  const [tracking, setTracking] = usePersistentState("reward-replacement", "tracking", "");

  return (
    <div className="space-y-8">
      <IntroGrid
        what="Identify the hidden reward driving an unhelpful habit, then design an alternative that delivers the same reward at lower cost."
        why="Habits stick because they reward us — even costly ones like perfectionism (reward: validation; cost: stress). Change the reward path, not just the willpower."
        how="Work through four steps: spot the reward, design a replacement, commit to a trigger, then check in."
      />

      <div className="flex gap-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className={`flex-1 rounded-md border px-3 py-2 text-xs ${step === i ? "border-primary bg-primary/10" : "border-border bg-card"}`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        {step === 0 && (
          <>
            <Field
              label="Habit or pattern you want to change"
              hint="Be honest — name it specifically."
            >
              <TextArea
                rows={2}
                value={behavior}
                onChange={(e) => setBehavior(e.target.value)}
                placeholder="e.g. Procrastinating on hard assignments"
              />
            </Field>
            <Field
              label="What reward do you actually get from it?"
              hint="Relief, validation, control, comfort, avoidance..."
            >
              <TextArea
                rows={2}
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                placeholder="e.g. Short-term relief from discomfort"
              />
            </Field>
            <Field label="What is it costing you?">
              <TextArea
                rows={2}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. Late nights, lower-quality work, anxiety"
              />
            </Field>
          </>
        )}
        {step === 1 && (
          <Field
            label="A new action that delivers the same reward — at lower cost"
            hint="Keep the payoff, change the path."
          >
            <TextArea
              rows={5}
              value={alternative}
              onChange={(e) => setAlternative(e.target.value)}
              placeholder="e.g. Schedule a 25-min focus block followed by a real break, so relief is built in rather than earned through avoidance."
            />
          </Field>
        )}
        {step === 2 && (
          <Field
            label="When you feel the old pull, what's your trigger to do the new action instead?"
            hint="The more specific, the better."
          >
            <TextArea
              rows={4}
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="e.g. When I open my laptop and feel resistance, I start a 25-min timer before checking my phone."
            />
          </Field>
        )}
        {step === 3 && (
          <Field
            label="How will you check in on whether it's working?"
            hint="After a few attempts — what to keep, what to adjust."
          >
            <TextArea
              rows={5}
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="e.g. Note each evening: did I default to the old habit or the new one? What reward did I actually feel?"
            />
          </Field>
        )}
      </div>

      <div className="flex justify-between">
        <GhostButton onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          Back
        </GhostButton>
        <PrimaryButton
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
        >
          Next
        </PrimaryButton>
      </div>

      {step === STEPS.length - 1 && behavior && alternative && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-2 text-sm">
          <h3 className="font-semibold">Your replacement plan</h3>
          <p>
            <strong>Instead of:</strong> {behavior}
          </p>
          <p>
            <strong>I'll try:</strong> {alternative}
          </p>
          {trigger && (
            <p>
              <strong>Cue:</strong> {trigger}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
