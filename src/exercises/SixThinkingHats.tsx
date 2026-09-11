import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea, TextInput } from "./_shared";

const HATS = [
  {
    key: "blue",
    short: "Blue",
    name: "Blue · Process",
    color: "#3b82f6",
    ink: "#ffffff",
    desc: "Manage the discussion. What's the goal? How will you bring this together?",
    prompts: [
      "What's the goal of this thinking?",
      "How will I structure the steps?",
      "What does success look like?",
    ],
  },
  {
    key: "white",
    short: "White",
    name: "White · Facts",
    color: "#e5e7eb",
    ink: "#111827",
    desc: "Stay objective. Only what you know, and what info is missing.",
    prompts: [
      "What do I know for sure?",
      "What information is missing?",
      "What does the evidence say?",
    ],
  },
  {
    key: "red",
    short: "Red",
    name: "Red · Feelings",
    color: "#ef4444",
    ink: "#ffffff",
    desc: "Gut reactions and emotions. No justification needed.",
    prompts: [
      "How do I feel about this?",
      "What's my instinct telling me?",
      "What excites or worries me?",
    ],
  },
  {
    key: "black",
    short: "Black",
    name: "Black · Caution",
    color: "#111827",
    ink: "#ffffff",
    desc: "Risks, weaknesses, problems. Not negativity for its own sake.",
    prompts: ["What might go wrong?", "What are the risks?", "Why might this fail?"],
  },
  {
    key: "yellow",
    short: "Yellow",
    name: "Yellow · Optimism",
    color: "#f59e0b",
    ink: "#111827",
    desc: "Value and benefits. Why this could work.",
    prompts: [
      "What are the advantages?",
      "What positive outcomes are possible?",
      "Why might this succeed?",
    ],
  },
  {
    key: "green",
    short: "Green",
    name: "Green · Creativity",
    color: "#10b981",
    ink: "#ffffff",
    desc: "New ideas, alternatives, wild possibilities. Don't filter.",
    prompts: ["What's another way?", "What unusual ideas come up?", "How could we innovate?"],
  },
] as const;

function Hat({ color, size = 96, worn = false }: { color: string; size?: number; worn?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 80"
      width={size}
      height={(size * 80) / 120}
      aria-hidden
      style={{
        transition: "transform 260ms cubic-bezier(.2,.8,.3,1)",
        transform: worn ? "translateY(0) rotate(-4deg)" : "translateY(2px)",
      }}
    >
      <ellipse cx="60" cy="62" rx="54" ry="13" fill={color} opacity={0.95} />
      <path d="M28 62 C28 26 40 12 60 12 C80 12 92 26 92 62 Z" fill={color} />
      <path d="M28 56 C44 66 76 66 92 56 L92 62 C76 70 44 70 28 62 Z" fill="rgba(0,0,0,0.22)" />
    </svg>
  );
}

export default function SixThinkingHats() {
  const [step, setStep] = usePersistentState<
    "intro" | "problem" | "hats" | "board" | "decide" | "summary"
  >("six-thinking-hats", "step", "intro");
  const [problem, setProblem] = usePersistentState("six-thinking-hats", "problem", "");
  const [notes, setNotes] = usePersistentState<Record<string, string>>(
    "six-thinking-hats",
    "notes",
    {},
  );
  const [hatIdx, setHatIdx] = usePersistentState("six-thinking-hats", "hatIdx", 0);
  const [decision, setDecision] = usePersistentState("six-thinking-hats", "decision", "");

  const hat = HATS[hatIdx];
  const done = HATS.filter((h) => (notes[h.key] ?? "").trim()).length;
  const R = 22,
    C = 2 * Math.PI * R;

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A structured way to look at a problem or decision from six distinct perspectives — one 'hat' at a time."
            why="We get stuck in one mode of thinking. Forcing each lens reduces bias and uncovers angles you'd miss."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Name the problem or decision.</li>
                <li>Wear each hat in turn — keep perspectives separate.</li>
                <li>Lay them side by side and act.</li>
              </ol>
            }
          />
          <div className="flex flex-wrap justify-center gap-2 rounded-xl border border-border bg-card p-6">
            {HATS.map((h) => (
              <Hat key={h.key} color={h.color} size={70} />
            ))}
          </div>
          <PrimaryButton onClick={() => setStep("problem")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "problem" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">What are you thinking about?</h2>
          <Field label="The problem or decision">
            <TextInput
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g. Should I take on this internship offer?"
            />
          </Field>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton
              disabled={!problem.trim()}
              onClick={() => {
                setHatIdx(0);
                setStep("hats");
              }}
            >
              Put on the first hat →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "hats" && (
        <section className="space-y-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex gap-1.5 flex-wrap">
              {HATS.map((h, i) => (
                <button
                  key={h.key}
                  onClick={() => setHatIdx(i)}
                  title={h.name}
                  className={`rounded-full p-1 transition ${i === hatIdx ? "ring-2 ring-primary scale-110" : "opacity-60 hover:opacity-100"}`}
                >
                  <span
                    className="block w-5 h-5 rounded-full border border-border"
                    style={{ background: h.color }}
                  />
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <svg width={56} height={56} viewBox="0 0 56 56">
                <circle cx="28" cy="28" r={R} fill="none" stroke="var(--border)" strokeWidth={5} />
                <circle
                  cx="28"
                  cy="28"
                  r={R}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C * (1 - done / HATS.length)}
                  transform="rotate(-90 28 28)"
                  style={{ transition: "stroke-dashoffset 300ms" }}
                />
                <text
                  x="28"
                  y="29"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="13"
                  fontWeight="700"
                  className="fill-foreground"
                >
                  {done}/6
                </text>
              </svg>
            </div>
          </div>

          <div
            className="rounded-2xl border border-border p-6 transition-colors duration-500"
            style={{ background: `linear-gradient(180deg, ${hat.color}1f, transparent 70%)` }}
          >
            <div className="flex items-center gap-4">
              <Hat color={hat.color} size={92} worn />
              <div>
                <h2 className="text-2xl font-semibold">{hat.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">{hat.desc}</p>
              </div>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {hat.prompts.map((p) => (
                <li
                  key={p}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
                >
                  {p}
                </li>
              ))}
            </ul>
            <TextArea
              rows={7}
              className="mt-4"
              placeholder={`Thinking from the ${hat.short} hat about: ${problem}`}
              value={notes[hat.key] ?? ""}
              onChange={(e) => setNotes({ ...notes, [hat.key]: e.target.value })}
            />
          </div>

          <div className="flex justify-between gap-2">
            <GhostButton
              onClick={() => (hatIdx === 0 ? setStep("problem") : setHatIdx(hatIdx - 1))}
            >
              ← {hatIdx === 0 ? "Back" : `${HATS[hatIdx - 1].short} hat`}
            </GhostButton>
            {hatIdx < HATS.length - 1 ? (
              <PrimaryButton onClick={() => setHatIdx(hatIdx + 1)}>
                {HATS[hatIdx + 1].short} hat →
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => setStep("board")}>See all six →</PrimaryButton>
            )}
          </div>
        </section>
      )}

      {step === "board" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">All six perspectives</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Side by side on {problem || "your problem"}. Click any hat to keep writing.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {HATS.map((h, i) => (
              <button
                key={h.key}
                onClick={() => {
                  setHatIdx(i);
                  setStep("hats");
                }}
                className="text-left rounded-xl border border-border bg-card p-4 hover:-translate-y-0.5 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-2">
                  <Hat color={h.color} size={40} />
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    {h.short}
                  </p>
                </div>
                <p className="mt-2 text-sm whitespace-pre-wrap">
                  {notes[h.key]?.trim() || (
                    <span className="text-muted-foreground">Empty — tap to add.</span>
                  )}
                </p>
              </button>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("hats")}>← Back to hats</GhostButton>
            <PrimaryButton onClick={() => setStep("decide")}>Decide →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "decide" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Pull it together</h2>
          <p className="text-sm text-muted-foreground">
            Review the perspectives. What's your decision or next step? What further information do
            you need?
          </p>
          <Field label="Decision or next action">
            <TextArea rows={5} value={decision} onChange={(e) => setDecision(e.target.value)} />
          </Field>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("board")}>← Back to the board</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">{problem || "Your thinking"}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {HATS.map(
              (h) =>
                notes[h.key] && (
                  <div key={h.key} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center gap-2">
                      <Hat color={h.color} size={32} />
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        {h.name}
                      </p>
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{notes[h.key]}</p>
                  </div>
                ),
            )}
            {decision && (
              <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Decision · next action
                </p>
                <p className="mt-2 text-sm whitespace-pre-wrap">{decision}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("decide")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
