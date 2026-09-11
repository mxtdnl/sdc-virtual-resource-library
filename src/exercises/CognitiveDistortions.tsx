import { useMemo, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";

const DISTORTIONS = [
  {
    name: "All-or-nothing thinking",
    desc: "Black-and-white thinking — 'If I'm not perfect I've failed.'",
    example: "I got one question wrong, so the whole exam is ruined.",
  },
  {
    name: "Over-generalising",
    desc: "Drawing a big conclusion from a single event.",
    example: "He didn't text back. Nobody ever wants to hang out with me.",
  },
  {
    name: "Mental filter",
    desc: "Noticing only failures, missing the successes.",
    example: "My boss praised four things and flagged one. All I can think about is the flag.",
  },
  {
    name: "Disqualifying the positive",
    desc: "Discounting good things — 'That doesn't count.'",
    example: "She only complimented my work because she felt sorry for me.",
  },
  {
    name: "Jumping to conclusions",
    desc: "Mind reading or fortune telling without evidence.",
    example: "They're going to hate my presentation, I just know it.",
  },
  {
    name: "Magnification / minimisation",
    desc: "Blowing things out of proportion or shrinking them.",
    example: "Forgetting that email means I'm completely unreliable.",
  },
  {
    name: "Emotional reasoning",
    desc: "'I feel it, so it must be true.'",
    example: "I feel like a fraud, so I must actually be one.",
  },
  {
    name: "Should / must",
    desc: "'Should' statements that breed guilt and frustration.",
    example: "I should be further along in my career by now.",
  },
  {
    name: "Labelling",
    desc: "Assigning a global label from one event.",
    example: "I missed the deadline. I'm a failure.",
  },
  {
    name: "Personalisation",
    desc: "Blaming yourself for things that aren't fully your fault.",
    example: "My friend seems off today — it must be something I did.",
  },
] as const;

type Phase = "intro" | "quiz" | "situation" | "identify" | "challenge" | "reframe" | "summary";

export default function CognitiveDistortions() {
  const [step, setStep] = usePersistentState<Phase>(
    "challenging-cognitive-distortions",
    "step",
    "intro",
  );
  const [situation, setSituation] = usePersistentState(
    "challenging-cognitive-distortions",
    "situation",
    "",
  );
  const [thought, setThought] = usePersistentState(
    "challenging-cognitive-distortions",
    "thought",
    "",
  );
  const [selected, setSelected] = usePersistentState<Record<string, boolean>>(
    "challenging-cognitive-distortions",
    "selected",
    {},
  );
  const [facts, setFacts] = usePersistentState("challenging-cognitive-distortions", "facts", "");
  const [friend, setFriend] = usePersistentState("challenging-cognitive-distortions", "friend", "");
  const [reframe, setReframe] = usePersistentState(
    "challenging-cognitive-distortions",
    "reframe",
    "",
  );

  // Quiz / swipe-deck warm-up
  const deck = useMemo(() => {
    const idxs = DISTORTIONS.map((_, i) => i).sort(() => Math.random() - 0.5);
    return idxs.map((i) => ({ answer: i, example: DISTORTIONS[i].example }));
  }, [step === "quiz"]);
  const [cardIdx, setCardIdx] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const card = deck[cardIdx];

  const submitGuess = () => {
    if (guess === null) return;
    if (guess === card.answer) setScore((s) => s + 1);
  };
  const nextCard = () => {
    setGuess(null);
    if (cardIdx + 1 < deck.length) setCardIdx((i) => i + 1);
    else setStep("situation");
  };

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="Identify and reframe common cognitive distortions — unhelpful thinking patterns that hurt mood and decision-making."
            why="Distortions warp reality and create stress. Reframing builds healthier patterns and resilience."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Warm up with a quick card-spot quiz.</li>
                <li>Bring your own thought.</li>
                <li>Identify, challenge, and rewrite it.</li>
              </ol>
            }
          />
          <div className="flex gap-2 flex-wrap">
            <PrimaryButton
              onClick={() => {
                setCardIdx(0);
                setGuess(null);
                setScore(0);
                setStep("quiz");
              }}
            >
              Warm up with cards →
            </PrimaryButton>
            <GhostButton onClick={() => setStep("situation")}>Skip to my thought →</GhostButton>
          </div>
        </section>
      )}

      {step === "quiz" && card && (
        <section className="space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Spot the distortion</h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {cardIdx + 1} / {deck.length} · score {score}
            </span>
          </div>

          <div className="relative h-[180px]">
            {[2, 1, 0].map((offset) => {
              const i = cardIdx + offset;
              if (i >= deck.length) return null;
              const isTop = offset === 0;
              return (
                <div
                  key={i}
                  className="absolute inset-0 rounded-2xl border border-border bg-card p-6 shadow-sm transition-transform"
                  style={{
                    transform: `translateY(${offset * 8}px) scale(${1 - offset * 0.03})`,
                    zIndex: 10 - offset,
                    opacity: isTop ? 1 : 0.6,
                  }}
                >
                  {isTop && (
                    <>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                        Thought
                      </p>
                      <p className="mt-2 text-lg font-medium leading-snug">"{deck[i].example}"</p>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {DISTORTIONS.map((d, i) => {
              const isPick = guess === i;
              const revealed = guess !== null;
              const isAnswer = card.answer === i;
              const tone = revealed
                ? isAnswer
                  ? "border-primary bg-primary/10"
                  : isPick
                    ? "border-destructive/60 bg-destructive/10"
                    : "border-border bg-card opacity-60"
                : isPick
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-secondary/40";
              return (
                <button
                  key={d.name}
                  disabled={revealed}
                  onClick={() => setGuess(i)}
                  className={`text-left rounded-xl border p-3 text-sm transition-colors ${tone}`}
                >
                  <span className="font-medium">{d.name}</span>
                </button>
              );
            })}
          </div>

          {guess !== null && (
            <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm">
              <p className="font-semibold">{DISTORTIONS[card.answer].name}</p>
              <p className="text-muted-foreground mt-1">{DISTORTIONS[card.answer].desc}</p>
            </div>
          )}

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            {guess === null ? (
              <PrimaryButton onClick={submitGuess} disabled={guess === null}>
                Check
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={nextCard}>
                {cardIdx + 1 < deck.length ? "Next card →" : "Bring my own thought →"}
              </PrimaryButton>
            )}
          </div>
        </section>
      )}

      {step === "situation" && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">1. The situation and thought</h2>
          <div>
            <label className="text-sm font-medium">
              Recent situation where you felt stressed, anxious, or upset
            </label>
            <TextArea
              rows={3}
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">What thoughts came up?</label>
            <TextArea
              rows={3}
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton
              onClick={() => setStep("identify")}
              disabled={!situation.trim() || !thought.trim()}
            >
              Next →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "identify" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            2. Which distortions are at play?
          </h2>
          <p className="text-sm text-muted-foreground">Tap all that match the thought you wrote.</p>
          <div className="grid gap-3 md:grid-cols-2">
            {DISTORTIONS.map((d) => {
              const on = !!selected[d.name];
              return (
                <button
                  key={d.name}
                  onClick={() => setSelected((p) => ({ ...p, [d.name]: !p[d.name] }))}
                  className={`text-left rounded-xl border p-4 transition-colors ${on ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary/40"}`}
                >
                  <h3 className="text-sm font-semibold">{d.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{d.desc}</p>
                </button>
              );
            })}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("situation")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("challenge")}>Next →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "challenge" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">3. Challenge the thought</h2>
          <div>
            <label className="text-sm font-medium">
              Is this based on facts or assumptions? What evidence supports or refutes it?
            </label>
            <TextArea
              rows={4}
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              Would you think this about a friend in the same situation? What would you tell them?
            </label>
            <TextArea
              rows={4}
              value={friend}
              onChange={(e) => setFriend(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("identify")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("reframe")}>Next →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "reframe" && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">4. Reframe</h2>
          <p className="text-sm text-muted-foreground">
            Write a more balanced, fact-based version of the thought.
          </p>
          <TextArea rows={5} value={reframe} onChange={(e) => setReframe(e.target.value)} />
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("challenge")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")} disabled={!reframe.trim()}>
              See summary →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">Your reframed thought</h2>
          <Card label="Situation">{situation}</Card>
          <Card label="Original thought">{thought}</Card>
          <Card label="Distortions">
            {Object.entries(selected)
              .filter(([, v]) => v)
              .map(([k]) => k)
              .join(" · ") || "—"}
          </Card>
          <Card label="Evidence">{facts}</Card>
          <Card label="What you'd tell a friend">{friend}</Card>
          <div className="rounded-xl border border-primary/40 bg-primary/5 p-5">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">
              Reframed thought
            </p>
            <p className="mt-2 text-base font-medium whitespace-pre-wrap">{reframe}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("intro")}>Start over</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
        {label}
      </p>
      <p className="mt-1 text-sm whitespace-pre-wrap">{children || "—"}</p>
    </div>
  );
}
