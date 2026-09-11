import { useMemo, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { GhostButton, IntroGrid, PrimaryButton, TextInput } from "./_shared";

const VALUES = [
  "Abundance",
  "Acceptance",
  "Accountability",
  "Achievement",
  "Adventure",
  "Advocacy",
  "Ambition",
  "Appreciation",
  "Attractiveness",
  "Autonomy",
  "Balance",
  "Being the Best",
  "Benevolence",
  "Boldness",
  "Brilliance",
  "Calmness",
  "Caring",
  "Challenge",
  "Charity",
  "Cheerfulness",
  "Cleverness",
  "Community",
  "Commitment",
  "Compassion",
  "Cooperation",
  "Collaboration",
  "Consistency",
  "Contribution",
  "Creativity",
  "Credibility",
  "Curiosity",
  "Daring",
  "Decisiveness",
  "Dedication",
  "Dependability",
  "Diversity",
  "Empathy",
  "Encouragement",
  "Enthusiasm",
  "Ethics",
  "Excellence",
  "Expressiveness",
  "Fairness",
  "Family",
  "Friendships",
  "Flexibility",
  "Freedom",
  "Fun",
  "Generosity",
  "Grace",
  "Growth",
  "Happiness",
  "Health",
  "Honesty",
  "Humility",
  "Humor",
  "Inclusiveness",
  "Independence",
  "Individuality",
  "Innovation",
  "Inspiration",
  "Intelligence",
  "Intuition",
  "Joy",
  "Kindness",
  "Knowledge",
  "Leadership",
  "Learning",
  "Love",
  "Loyalty",
  "Making a Difference",
  "Mindfulness",
  "Motivation",
  "Optimism",
  "Open-Mindedness",
  "Originality",
  "Passion",
  "Peace",
  "Perfection",
  "Performance",
  "Personal Development",
  "Playfulness",
  "Popularity",
  "Power",
  "Preparedness",
  "Proactivity",
  "Professionalism",
  "Punctuality",
  "Quality",
  "Recognition",
  "Relationships",
  "Reliability",
  "Resilience",
  "Resourcefulness",
  "Responsibility",
  "Responsiveness",
  "Risk Taking",
  "Safety",
  "Security",
  "Self-Control",
  "Selflessness",
  "Service",
  "Simplicity",
  "Spirituality",
  "Stability",
  "Success",
  "Teamwork",
  "Thankfulness",
  "Thoughtfulness",
  "Traditionalism",
  "Trustworthiness",
  "Understanding",
  "Uniqueness",
  "Usefulness",
  "Versatility",
  "Vision",
  "Warmth",
  "Wealth",
  "Well-Being",
  "Wisdom",
  "Zeal",
];

type Phase = "intro" | "swipe" | "rank" | "action" | "summary";

export default function CoreValues() {
  const [step, setStep] = usePersistentState<Phase>("core-values", "step", "intro");

  // Swipe deck
  const [deck, setDeck] = usePersistentState<string[]>("core-values", "deck", () =>
    [...VALUES].sort(() => Math.random() - 0.5),
  );
  const [kept, setKept] = usePersistentState<string[]>("core-values", "kept", []);
  const [custom, setCustom] = usePersistentState("core-values", "custom", "");

  // Ranking podium
  const [podium, setPodium] = useState<(string | null)[]>([null, null, null, null, null]);
  const [actions, setActions] = usePersistentState<Record<string, string>>(
    "core-values",
    "actions",
    {},
  );

  const top = deck[0];

  const swipe = (keep: boolean) => {
    if (!top) return;
    if (keep) setKept((k) => [...k, top]);
    setDeck((d) => d.slice(1));
  };
  const addCustom = () => {
    const v = custom.trim();
    if (!v) return;
    setKept((k) => (k.includes(v) ? k : [...k, v]));
    setCustom("");
  };

  const remaining = useMemo(() => kept.filter((v) => !podium.includes(v)), [kept, podium]);

  const place = (slot: number, v: string) => {
    setPodium((p) => {
      const next = [...p];
      // remove v from any existing slot first
      const existing = next.indexOf(v);
      if (existing >= 0) next[existing] = null;
      next[slot] = v;
      return next;
    });
  };
  const clearSlot = (slot: number) => setPodium((p) => p.map((x, i) => (i === slot ? null : x)));

  const onDrop = (e: React.DragEvent, slot: number) => {
    e.preventDefault();
    const v = e.dataTransfer.getData("text/plain");
    if (v) place(slot, v);
  };

  const ranked = podium.filter((v): v is string => !!v);

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="Surface and rank your core values so decisions and goals align with what matters."
            why="When you act in line with your values, you feel confident and purposeful. When you don't, you feel lost or stressed."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Swipe through values — keep or pass.</li>
                <li>Drag your top 5 onto the podium.</li>
                <li>Turn each into a daily action.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("swipe")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "swipe" && (
        <section className="space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">Step 1 · Keep or pass</h2>
            <span className="text-xs text-muted-foreground tabular-nums">
              {deck.length} left · {kept.length} kept
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Trust your gut. If it resonates, keep it.</p>

          <div className="relative h-[200px] mx-auto max-w-md">
            {top ? (
              [2, 1, 0].map((offset) => {
                const v = deck[offset];
                if (!v) return null;
                const isTop = offset === 0;
                return (
                  <div
                    key={v + offset}
                    className="absolute inset-0 rounded-2xl border border-border bg-card flex items-center justify-center shadow-sm transition-transform"
                    style={{
                      transform: `translateY(${offset * 10}px) scale(${1 - offset * 0.04})`,
                      zIndex: 10 - offset,
                      opacity: isTop ? 1 : 0.55,
                    }}
                  >
                    <span className="text-3xl font-semibold tracking-tight">{v}</span>
                  </div>
                );
              })
            ) : (
              <div className="absolute inset-0 rounded-2xl border border-dashed border-border flex items-center justify-center text-sm text-muted-foreground">
                Deck empty — add your own below or continue.
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => swipe(false)}
              disabled={!top}
              className="rounded-full border border-border bg-card px-6 py-2.5 text-sm font-medium hover:bg-secondary disabled:opacity-40"
            >
              ✕ Pass
            </button>
            <button
              onClick={() => swipe(true)}
              disabled={!top}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
            >
              ♥ Keep
            </button>
          </div>

          <div className="flex gap-2">
            <TextInput
              placeholder="Add your own value…"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
            />
            <GhostButton onClick={addCustom}>Add</GhostButton>
          </div>

          {kept.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Kept ({kept.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {kept.map((v) => (
                  <span
                    key={v}
                    className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-medium"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton disabled={kept.length === 0} onClick={() => setStep("rank")}>
              Rank them →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "rank" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Step 2 · Build your podium</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Drag your top 5 into the slots. Drop into a filled slot to swap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              {podium.map((v, i) => (
                <div
                  key={i}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => onDrop(e, i)}
                  className={`flex items-center gap-3 rounded-xl border p-3 min-h-[58px] transition-colors ${v ? "border-primary/40 bg-primary/5" : "border-dashed border-border bg-card"}`}
                >
                  <span className="font-semibold text-lg w-7 text-center text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  {v ? (
                    <>
                      <span
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", v)}
                        className="flex-1 cursor-grab rounded-md bg-card border border-border px-3 py-1.5 text-sm font-medium"
                      >
                        {v}
                      </span>
                      <GhostButton onClick={() => clearSlot(i)}>×</GhostButton>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Drop a value here</span>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                Your kept values
              </p>
              <div className="flex flex-wrap gap-2">
                {remaining.length === 0 && (
                  <span className="text-xs text-muted-foreground">All placed.</span>
                )}
                {remaining.map((v) => (
                  <span
                    key={v}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", v)}
                    className="cursor-grab rounded-full bg-secondary px-3 py-1 text-sm font-medium hover:bg-secondary/70"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("swipe")}>← Back</GhostButton>
            <PrimaryButton disabled={ranked.length === 0} onClick={() => setStep("action")}>
              Turn into actions →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "action" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Step 3 · As a verb</h2>
            <p className="text-sm text-muted-foreground mt-1">
              A value lives in action. Turn each into something you can do — "practise honesty in
              hard conversations".
            </p>
          </div>
          <div className="space-y-2">
            {ranked.map((v, i) => (
              <div
                key={v}
                className="rounded-xl border border-border bg-card p-4 flex items-center gap-3"
              >
                <span className="font-semibold text-lg w-7 text-center text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{v}</p>
                  <TextInput
                    placeholder="As an action…"
                    value={actions[v] ?? ""}
                    onChange={(e) => setActions((a) => ({ ...a, [v]: e.target.value }))}
                    className="mt-2"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("rank")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>Finish →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your core values</h2>
          <ol className="space-y-3">
            {ranked.map((v, i) => (
              <li key={v} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-semibold text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-lg font-semibold">{v}</p>
                    {actions[v] && (
                      <p className="text-sm text-muted-foreground mt-1">{actions[v]}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("action")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
