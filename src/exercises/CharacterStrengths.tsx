import { useMemo, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { IntroGrid, PrimaryButton, GhostButton } from "./_shared";

type Virtue = "Wisdom" | "Courage" | "Humanity" | "Justice" | "Temperance" | "Transcendence";
type Zone = "bank" | "top" | "middle" | "lesser";

type Strength = {
  id: string;
  name: string;
  virtue: Virtue;
  balance: string;
  overused: string;
  underused: string;
};

const VIRTUE_COLORS: Record<Virtue, string> = {
  Wisdom: "#2563eb",
  Courage: "#dc2626",
  Humanity: "#db2777",
  Justice: "#0d9488",
  Temperance: "#059669",
  Transcendence: "#7c3aed",
};

const STRENGTHS: Strength[] = [
  {
    id: "creativity",
    name: "Creativity",
    virtue: "Wisdom",
    balance:
      "You come up with original ways to look at situations and things, discovering inventive ways to solve problems, create products, or express ideas.",
    overused: "You can be seen as eccentric or odd, prioritizing novelty over usefulness.",
    underused: "You conform to the well-known path and rarely innovate.",
  },
  {
    id: "curiosity",
    name: "Curiosity",
    virtue: "Wisdom",
    balance:
      "You’re drawn to new experiences and topics simply for their own sake. You ask questions, explore the unfamiliar, and enjoy discovering.",
    overused: "You can be nosy or lose yourself chasing details that don’t matter.",
    underused: "You come across as uninterested and closed off to new things.",
  },
  {
    id: "judgment",
    name: "Judgment",
    virtue: "Wisdom",
    balance:
      "You think critically, avoid jumping to conclusions, and change your opinion in light of new evidence. You weigh things objectively.",
    overused:
      "You can get stuck seeing pitfalls and problems, sliding into negativity or cynicism.",
    underused: "You don’t reflect on your own or others’ behavior and can come across as naive.",
  },
  {
    id: "love-of-learning",
    name: "Love of Learning",
    virtue: "Wisdom",
    balance:
      "You want to build your skills and knowledge, in school, at work, or just for fun. You enjoy mastering new things.",
    overused:
      "You can come across as a know-it-all, needing to know every detail of how something works.",
    underused: "You repeat the same routines and rarely push yourself to learn or grow.",
  },
  {
    id: "perspective",
    name: "Perspective",
    virtue: "Wisdom",
    balance:
      "You can view a situation from multiple angles, connect it to the bigger picture, and offer wise counsel that others value.",
    overused: "You can come across as arrogant, as if you’ve got it all figured out.",
    underused: "You’re shortsighted and miss the bigger picture.",
  },
  {
    id: "bravery",
    name: "Bravery",
    virtue: "Courage",
    balance:
      "You don’t shy away from threat, challenge, or pain. You speak up for what’s right, even facing resistance, and act on your beliefs.",
    overused: "You’re reckless, ignoring real dangers to yourself or others.",
    underused: "You let fear dictate your decisions and let others do the hard part.",
  },
  {
    id: "perseverance",
    name: "Perseverance",
    virtue: "Courage",
    balance:
      "You finish what you start and push through obstacles. You’re industrious and satisfied by completing a task.",
    overused: "You can become obsessive, struggling to let go even when that would be wiser.",
    underused: "You give up easily and feel defeated by setbacks.",
  },
  {
    id: "honesty",
    name: "Honesty",
    virtue: "Courage",
    balance:
      "You’re authentic and act with integrity, take responsibility for your actions and feelings, and present yourself as who you truly are.",
    overused:
      "You’re bluntly honest with no regard for others’ feelings, and can come across as self-righteous.",
    underused: "You come across as phony, withholding your real thoughts and feelings.",
  },
  {
    id: "zest",
    name: "Zest",
    virtue: "Courage",
    balance:
      "You’re energetic and enthusiastic. You approach life as an adventure rather than going through the motions.",
    overused: "You can be hyperactive or overwhelming, leaving little room for others.",
    underused: "You can come across as passive or boring.",
  },
  {
    id: "love",
    name: "Love",
    virtue: "Humanity",
    balance:
      "You value close, meaningful relationships. Sharing, caring, and reciprocity matter to you, and you like being genuinely connected to others.",
    overused: "You open up too quickly, even when it isn’t appropriate.",
    underused: "You’re emotionally closed off and don’t let others in.",
  },
  {
    id: "kindness",
    name: "Kindness",
    virtue: "Humanity",
    balance:
      "You like doing favors and good deeds for others. You are generous, compassionate, and can extend that same care to yourself.",
    overused: "You’re intrusive with your help, not letting others do things for themselves.",
    underused: "You’re indifferent to others, or you lose yourself entirely in caring for them.",
  },
  {
    id: "social-intelligence",
    name: "Social Intelligence",
    virtue: "Humanity",
    balance:
      "You’re aware of your own and others’ motives and feelings, and you adapt well across social situations.",
    overused: "You overanalyze people’s behavior, hunting for meaning in every act.",
    underused: "You don’t pick up on others’ feelings and can seem blunt or insensitive.",
  },
  {
    id: "teamwork",
    name: "Teamwork",
    virtue: "Justice",
    balance:
      "You cooperate well as a team member, take responsibility, contribute your share, and stay loyal to the group.",
    overused: "You become dependent on others and don’t act on your own easily.",
    underused: "You don’t care about the group’s interests and act selfishly.",
  },
  {
    id: "fairness",
    name: "Fairness",
    virtue: "Justice",
    balance:
      "You treat everyone alike, in a just way, without letting personal feelings bias your decisions. You give everyone a fair chance.",
    overused: "You strictly obey rules without empathy, and can come across as uninvolved.",
    underused: "You choose sides or let your own preferences lead you.",
  },
  {
    id: "leadership",
    name: "Leadership",
    virtue: "Justice",
    balance:
      "You encourage groups to get things done while caring for the relationships within the group, organizing activities and making sure they happen.",
    overused: "You can be dictatorial, controlling people without letting them have a voice.",
    underused: "You don’t take the lead or make decisions, and you’re overly accommodating.",
  },
  {
    id: "forgiveness",
    name: "Forgiveness",
    virtue: "Temperance",
    balance:
      "You forgive others’ mistakes, give people second chances, and aren’t vengeful — including toward yourself.",
    overused: "You’re overly permissive and let people take advantage of you.",
    underused: "You hold onto resentment and show little mercy.",
  },
  {
    id: "humility",
    name: "Humility",
    virtue: "Temperance",
    balance:
      "You let your actions speak for themselves, without presenting yourself as more special or important than you are.",
    overused:
      "You don’t acknowledge your own abilities and can seem insecure or unable to speak up.",
    underused: "You come across as full of yourself or arrogant.",
  },
  {
    id: "prudence",
    name: "Prudence",
    virtue: "Temperance",
    balance:
      "You’re careful in your choices, avoiding unnecessary risks, and thoughtful about things you might later regret.",
    overused: "You can become anxious, worrying excessively about outcomes.",
    underused: "You act without thinking and take on too much risk.",
  },
  {
    id: "self-regulation",
    name: "Self-Regulation",
    virtue: "Temperance",
    balance:
      "You control what you do, say, and feel. You are disciplined, manage your emotions well, and can overcome your vices.",
    overused: "You push past your limits and are rarely kind to yourself.",
    underused: "You act impulsively with your emotions or actions, or become self-indulgent.",
  },
  {
    id: "appreciation-of-beauty",
    name: "Appreciation of Beauty",
    virtue: "Transcendence",
    balance:
      "You notice and value beauty and excellence in nature and in great performances across every domain of life, and you experience awe.",
    overused: "You can become perfectionistic or elitist, overly demanding of yourself or others.",
    underused: "You don’t have an eye for what’s good and aren’t moved by beauty you encounter.",
  },
  {
    id: "gratitude",
    name: "Gratitude",
    virtue: "Transcendence",
    balance:
      "You feel and express thankfulness for the good things in life, directed at people or at something greater than yourself.",
    overused: "You can be overly flattering or theatrical in showing thanks.",
    underused: "You take things for granted and feel entitled to the good that comes your way.",
  },
  {
    id: "hope",
    name: "Hope",
    virtue: "Transcendence",
    balance:
      "You’re optimistic and future-oriented, expecting the best and working to make it happen.",
    overused: "You view the world through rose-tinted glasses and can be naive.",
    underused: "You’re cynical about the future and can feel like your efforts don’t matter.",
  },
  {
    id: "humor",
    name: "Humor",
    virtue: "Transcendence",
    balance:
      "You love to laugh and joke, bringing lightness to life and making others laugh without ridiculing anyone.",
    overused: "You don’t take anything seriously and can be brash at others’ expense.",
    underused: "You’re overly serious and short on perspective.",
  },
  {
    id: "spirituality",
    name: "Spirituality",
    virtue: "Transcendence",
    balance:
      "You hold coherent beliefs about a higher purpose and the meaning of life, which shape your behavior and bring you comfort.",
    overused: "You can become rigid in your worldview or try to convert others to it.",
    underused: "You lack strong guiding values and can experience life as meaningless.",
  },
];

const VIRTUES: Virtue[] = [
  "Wisdom",
  "Courage",
  "Humanity",
  "Justice",
  "Temperance",
  "Transcendence",
];

const ZONES: { key: Zone; label: string; hint: string }[] = [
  { key: "top", label: "Top strengths", hint: "Come naturally — how do you use these daily?" },
  { key: "middle", label: "Middle strengths", hint: "Available when you reach for them." },
  { key: "lesser", label: "Lesser strengths", hint: "Growth edges — practice these on purpose." },
];

export default function CharacterStrengths() {
  const [started, setStarted] = usePersistentState("character-strengths", "started", false);
  const [placements, setPlacements] = usePersistentState<Record<string, Zone>>(
    "character-strengths",
    "placements",
    {},
  );
  const [filter, setFilter] = useState<Virtue | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  const byId = useMemo(() => Object.fromEntries(STRENGTHS.map((s) => [s.id, s])), []);

  const sorted = Object.values(placements).filter((z) => z !== "bank").length;

  const strengthsInZone = (zone: Zone) =>
    STRENGTHS.filter(
      (s) => (placements[s.id] ?? "bank") === zone && (!filter || s.virtue === filter),
    );

  const virtueCounts = useMemo(() => {
    const counts: Record<Virtue, number> = {
      Wisdom: 0,
      Courage: 0,
      Humanity: 0,
      Justice: 0,
      Temperance: 0,
      Transcendence: 0,
    };
    for (const s of STRENGTHS) counts[s.virtue]++;
    return counts;
  }, []);

  const move = (id: string, zone: Zone) => {
    setPlacements((p) => ({ ...p, [id]: zone }));
    setDetail(null);
  };

  const reset = () => {
    setPlacements({});
    setDetail(null);
    setFilter(null);
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDragId(id);
  };

  const onDragEnd = () => setDragId(null);

  const onDrop = (e: React.DragEvent, zone: Zone) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (id && byId[id]) move(id, zone);
  };

  const detailCard = detail ? byId[detail] : null;

  if (!started) {
    return (
      <div className="space-y-6">
        <IntroGrid
          what="Sort 24 character strengths into Top, Middle, and Lesser based on how naturally each one shows up for you."
          why="Knowing your strengths helps you use them deliberately. Lesser strengths aren't weaknesses — they're growth edges you can develop with practice."
          how={
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>Read each strength card.</li>
              <li>Drag or tap to sort into three tiers.</li>
              <li>Tap any card for its full description.</li>
            </ol>
          }
        />
        <PrimaryButton onClick={() => setStarted(true)}>Begin sorting</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Character Strengths &amp; Mindset
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">Sort your strengths</h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            Drag each card into <strong>Top</strong>, <strong>Middle</strong>, or{" "}
            <strong>Lesser</strong> based on how naturally it shows up for you. Tap any card to read
            what it looks like in balance, overused, and underused.
          </p>
          <p className="mt-2 text-sm italic text-muted-foreground">
            Lesser strengths aren&apos;t weaknesses &mdash; they&apos;re just used less often. Every
            strength can grow with deliberate practice.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <GhostButton onClick={reset}>Reset board</GhostButton>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">Sorted</span>
            <div className="text-sm font-medium tabular-nums">
              {sorted} / {STRENGTHS.length}
            </div>
            <div className="mt-1 h-1.5 w-24 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${(sorted / STRENGTHS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Virtue filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !filter
              ? "bg-foreground text-background"
              : "bg-secondary text-foreground hover:bg-secondary/80"
          }`}
        >
          All {STRENGTHS.length}
        </button>
        {VIRTUES.map((v) => (
          <button
            key={v}
            onClick={() => setFilter(filter === v ? null : v)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === v
                ? "bg-foreground text-background"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: VIRTUE_COLORS[v] }}
            />
            {v} {virtueCounts[v]}
          </button>
        ))}
      </div>

      {/* Strength Bank */}
      {strengthsInZone("bank").length > 0 && (
        <div className="rounded-xl border border-dashed border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Strength Bank
          </p>
          <div
            className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, "bank")}
          >
            {strengthsInZone("bank").map((s) => (
              <StrengthCard
                key={s.id}
                strength={s}
                isDragging={dragId === s.id}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onClick={() => setDetail(s.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Drop zones */}
      <div className="grid gap-6 lg:grid-cols-3">
        {ZONES.map((zone) => {
          const cards = strengthsInZone(zone.key);
          return (
            <div
              key={zone.key}
              className="rounded-xl border border-border bg-card p-4 min-h-[160px] transition-colors"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("border-primary/50");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("border-primary/50");
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove("border-primary/50");
                onDrop(e, zone.key);
              }}
            >
              <h3 className="text-sm font-semibold">{zone.label}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{zone.hint}</p>
              {cards.length === 0 ? (
                <p className="mt-6 text-center text-sm text-muted-foreground/60">
                  Drag strengths here
                </p>
              ) : (
                <div className="mt-3 grid gap-2 grid-cols-2 sm:grid-cols-1 md:grid-cols-2">
                  {cards.map((s) => (
                    <StrengthCard
                      key={s.id}
                      strength={s}
                      isDragging={dragId === s.id}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      onClick={() => setDetail(s.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Tap any card for its full description, and a quick way to move it without dragging.
      </p>

      {/* Summary + print once all sorted */}
      {sorted === STRENGTHS.length && (
        <div className="flex gap-2 flex-wrap">
          <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          <GhostButton
            onClick={() => {
              setPlacements({});
              setStarted(false);
            }}
          >
            Start again
          </GhostButton>
        </div>
      )}

      {/* Detail modal */}
      {detailCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: VIRTUE_COLORS[detailCard.virtue] }}
            >
              {detailCard.virtue}
            </p>
            <h3 className="text-xl font-semibold">{detailCard.name}</h3>

            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  In Balance
                </p>
                <p className="mt-1">{detailCard.balance}</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Overused
                </p>
                <p className="mt-1">{detailCard.overused}</p>
              </div>
              <div className="rounded-lg border border-border bg-secondary/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Underused
                </p>
                <p className="mt-1">{detailCard.underused}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Move to:</p>
              <div className="flex flex-wrap gap-2">
                {(["top", "middle", "lesser", "bank"] as Zone[]).map((z) => (
                  <button
                    key={z}
                    onClick={() => move(detailCard.id, z)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      (placements[detailCard.id] ?? "bank") === z
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:bg-secondary/70"
                    }`}
                  >
                    {z === "bank"
                      ? "Bank"
                      : z === "top"
                        ? "Top"
                        : z === "middle"
                          ? "Middle"
                          : "Lesser"}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setDetail(null)}
              className="w-full rounded-lg border border-border bg-card py-2 text-sm font-medium hover:bg-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StrengthCard({
  strength,
  isDragging,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  strength: Strength;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
  return (
    <button
      draggable
      onDragStart={(e) => onDragStart(e, strength.id)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`rounded-lg border border-border bg-card p-3 text-left transition-all hover:shadow-sm cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <div
        className="mb-1.5 h-1 w-6 rounded-full"
        style={{ backgroundColor: VIRTUE_COLORS[strength.virtue] }}
      />
      <p className="text-sm font-semibold leading-tight">{strength.name}</p>
      <p className="text-[11px] text-muted-foreground">{strength.virtue}</p>
    </button>
  );
}
