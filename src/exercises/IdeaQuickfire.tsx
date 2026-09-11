import { useEffect, useRef, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea, TextInput } from "./_shared";

const REFLECTIONS = [
  { key: "go", label: "How did it go?" },
  { key: "stuck", label: "Where did you get stuck? When did you run out of steam?" },
  { key: "develop", label: "What part of your creative process do you want to develop?" },
] as const;

const DURATIONS = [3, 5, 10] as const;

export default function IdeaQuickfire() {
  const [step, setStep] = usePersistentState<
    "intro" | "prompt" | "brainstorm" | "reflect" | "summary"
  >("idea-generation-quickfire", "step", "intro");
  const [prompt, setPrompt] = usePersistentState("idea-generation-quickfire", "prompt", "");
  const [ideas, setIdeas] = usePersistentState<string[]>("idea-generation-quickfire", "ideas", []);
  const [draft, setDraft] = usePersistentState("idea-generation-quickfire", "draft", "");
  const [duration, setDuration] = usePersistentState<number>(
    "idea-generation-quickfire",
    "duration",
    5,
  );
  const [remaining, setRemaining] = useState<number>(5 * 60);
  const [running, setRunning] = useState(false);
  const [notes, setNotes] = usePersistentState<Record<string, string>>(
    "idea-generation-quickfire",
    "notes",
    {},
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);

  const addIdea = () => {
    const v = draft.trim();
    if (!v) return;
    setIdeas([...ideas, v]);
    setDraft("");
    inputRef.current?.focus();
  };

  const startBrainstorm = () => {
    setRemaining(duration * 60);
    setRunning(true);
    setStep("brainstorm");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const mm = Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0");
  const ss = (remaining % 60).toString().padStart(2, "0");

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A timed brainstorming sprint that gets your creative mind moving — wild ideas welcome."
            why="Creative thinking is a muscle. Quickfire idea sessions build the habit of generating before judging."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Pick a prompt (or pull a random one).</li>
                <li>Set a timer and capture every idea — no editing.</li>
                <li>Reflect on your process.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("prompt")}>Begin →</PrimaryButton>
        </section>
      )}

      {step === "prompt" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Set the prompt</h2>
          <Field
            label="What are you generating ideas for?"
            hint='Try something playful, e.g. "uses for an old shoebox" — or a real challenge.'
          >
            <TextInput
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Type your prompt or challenge…"
            />
          </Field>
          <p className="text-xs text-muted-foreground">
            Need a random one? Try{" "}
            <a
              className="underline"
              href="https://molly.is/experimenting/protobot/#en"
              target="_blank"
              rel="noreferrer"
            >
              protobot
            </a>{" "}
            or ask an LLM for a wild brief.
          </p>
          <Field label="How long?">
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`rounded-full border px-4 py-1.5 text-sm ${duration === d ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-secondary"}`}
                >
                  {d} min
                </button>
              ))}
            </div>
          </Field>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton disabled={!prompt.trim()} onClick={startBrainstorm}>
              Start the timer →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "brainstorm" && (
        <section className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Prompt
            </p>
            <p className="mt-1 text-base font-medium">{prompt}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Time left
              </p>
              <p className="text-4xl font-semibold tabular-nums mt-1">
                {mm}:{ss}
              </p>
            </div>
            <div className="flex gap-2">
              <GhostButton onClick={() => setRunning((r) => !r)}>
                {running ? "Pause" : "Resume"}
              </GhostButton>
              <GhostButton
                onClick={() => {
                  setRemaining(duration * 60);
                  setRunning(false);
                }}
              >
                Reset
              </GhostButton>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIdea()}
              placeholder="Type an idea and hit Enter…"
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <PrimaryButton onClick={addIdea}>Add</PrimaryButton>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Ideas · {ideas.length}
            </p>
            <ol className="mt-2 space-y-1 text-sm list-decimal pl-5">
              {ideas.map((i, idx) => (
                <li key={idx} className="flex items-start gap-2 group">
                  <span className="flex-1">{i}</span>
                  <button
                    onClick={() => setIdeas(ideas.filter((_, j) => j !== idx))}
                    className="opacity-0 group-hover:opacity-100 text-xs text-muted-foreground hover:text-foreground"
                  >
                    remove
                  </button>
                </li>
              ))}
              {ideas.length === 0 && (
                <li className="list-none text-muted-foreground italic">
                  No ideas yet. Anything counts — go wild.
                </li>
              )}
            </ol>
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("prompt")}>← Back</GhostButton>
            <PrimaryButton
              onClick={() => {
                setRunning(false);
                setStep("reflect");
              }}
            >
              Done — reflect →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "reflect" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Reflect on the process</h2>
          <div className="space-y-4">
            {REFLECTIONS.map((r) => (
              <Field key={r.key} label={r.label}>
                <TextArea
                  rows={3}
                  value={notes[r.key] ?? ""}
                  onChange={(e) => setNotes({ ...notes, [r.key]: e.target.value })}
                />
              </Field>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("brainstorm")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">{prompt}</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Ideas · {ideas.length}
            </p>
            <ol className="mt-2 space-y-1 text-sm list-decimal pl-5">
              {ideas.map((i, idx) => (
                <li key={idx}>{i}</li>
              ))}
            </ol>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {REFLECTIONS.map(
              (r) =>
                notes[r.key] && (
                  <div key={r.key} className="rounded-lg border border-border bg-card p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {r.label}
                    </p>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{notes[r.key]}</p>
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
