import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { GhostButton, IntroGrid, PrimaryButton, TextArea, TextInput } from "./_shared";

type Zone = "love" | "good" | "world" | "paid" | "ikigai";
type Chip = { id: string; text: string; zone: Zone };

const ZONES: Record<Zone, { label: string; sub: string; hint: string; color: string }> = {
  love: {
    label: "Love",
    sub: "Passion",
    hint: "Activities that make you feel alive.",
    color: "var(--ink-red)",
  },
  good: {
    label: "Good at",
    sub: "Vocation",
    hint: "Your talents and natural strengths.",
    color: "var(--ink-purple)",
  },
  world: {
    label: "World needs",
    sub: "Mission",
    hint: "How you make a positive impact.",
    color: "var(--ink-brown)",
  },
  paid: {
    label: "Paid for",
    sub: "Profession",
    hint: "Where your skills meet a market.",
    color: "var(--ink-orange)",
  },
  ikigai: {
    label: "Ikigai",
    sub: "All four meet",
    hint: "Drag here what sits in all four.",
    color: "var(--primary)",
  },
};

// Circle layout (viewBox 400x400)
const CIRCLES: Record<Exclude<Zone, "ikigai">, { cx: number; cy: number }> = {
  love: { cx: 160, cy: 150 },
  world: { cx: 240, cy: 150 },
  good: { cx: 160, cy: 230 },
  paid: { cx: 240, cy: 230 },
};
const R = 105;
const CENTRE = { cx: 200, cy: 190 };

export default function Ikigai() {
  const [step, setStep] = usePersistentState<"intro" | "fill" | "summary">(
    "ikigai",
    "step",
    "intro",
  );
  const [chips, setChips] = usePersistentState<Chip[]>("ikigai", "chips", []);
  const [draft, setDraft] = usePersistentState("ikigai", "draft", "");
  const [draftZone, setDraftZone] = usePersistentState<Zone>("ikigai", "draftZone", "love");
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverZone, setHoverZone] = useState<Zone | null>(null);

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    setChips((c) => [...c, { id: crypto.randomUUID(), text: t, zone: draftZone }]);
    setDraft("");
  };
  const move = (id: string, zone: Zone) =>
    setChips((c) => c.map((x) => (x.id === id ? { ...x, zone } : x)));
  const remove = (id: string) => setChips((c) => c.filter((x) => x.id !== id));

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A reflection on what you love, what you're good at, what the world needs, and what you can be paid for."
            why="Aligning passion, mission, vocation, and profession gives life meaning — a reason to jump out of bed."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Add short phrases tagged to one of the four circles.</li>
                <li>
                  Drag a phrase into another circle — or the centre — if it fits more than one.
                </li>
                <li>Phrases in the centre are your Ikigai.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("fill")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "fill" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Add a phrase, then drag it</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Short phrases work best. Drag chips between circles — or into the centre when
              something belongs to all four.
            </p>
          </div>

          {/* Add input */}
          <div className="rounded-xl border border-border bg-card p-4 flex flex-col md:flex-row gap-2">
            <TextInput
              placeholder="e.g. Writing stories"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
            />
            <select
              value={draftZone}
              onChange={(e) => setDraftZone(e.target.value as Zone)}
              className="rounded-md border border-input bg-card px-3 py-2 text-sm"
            >
              {(["love", "good", "world", "paid"] as Zone[]).map((z) => (
                <option key={z} value={z}>
                  {ZONES[z].label}
                </option>
              ))}
            </select>
            <PrimaryButton onClick={add}>Add</PrimaryButton>
          </div>

          {/* Diagram */}
          <div className="relative rounded-xl border border-border bg-card p-4">
            <div className="relative mx-auto" style={{ maxWidth: 520 }}>
              <svg viewBox="0 0 400 400" className="w-full h-auto">
                {(["love", "world", "good", "paid"] as const).map((z) => (
                  <circle
                    key={z}
                    cx={CIRCLES[z].cx}
                    cy={CIRCLES[z].cy}
                    r={R}
                    fill={ZONES[z].color}
                    fillOpacity={hoverZone === z ? 0.28 : 0.15}
                    stroke={ZONES[z].color}
                    strokeWidth={hoverZone === z ? 2.5 : 1.5}
                    style={{ transition: "all 120ms" }}
                  />
                ))}
                {/* Centre marker */}
                <circle
                  cx={CENTRE.cx}
                  cy={CENTRE.cy}
                  r={26}
                  fill="var(--background)"
                  stroke="var(--primary)"
                  strokeWidth={hoverZone === "ikigai" ? 3 : 1.5}
                  strokeDasharray="4 3"
                  style={{ transition: "all 120ms" }}
                />
                <text
                  x={CENTRE.cx}
                  y={CENTRE.cy + 4}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={700}
                  className="fill-primary"
                >
                  IKIGAI
                </text>

                {/* Outer labels */}
                <g fontSize={11} fontWeight={700} textAnchor="middle" className="fill-foreground">
                  <text x={90} y={70}>
                    LOVE
                  </text>
                  <text x={310} y={70}>
                    WORLD NEEDS
                  </text>
                  <text x={90} y={340}>
                    GOOD AT
                  </text>
                  <text x={310} y={340}>
                    PAID FOR
                  </text>
                </g>
              </svg>

              {/* Drop zones — order matters: centre on top */}
              {(["love", "world", "good", "paid"] as Zone[]).map((z) => (
                <DropZone
                  key={z}
                  hover={hoverZone === z}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setHoverZone(z);
                  }}
                  onDragLeave={() => setHoverZone((h) => (h === z ? null : h))}
                  onDrop={() => {
                    if (dragId) move(dragId, z);
                    setDragId(null);
                    setHoverZone(null);
                  }}
                  style={zoneStyle(z as Exclude<Zone, "ikigai">)}
                />
              ))}
              <DropZone
                hover={hoverZone === "ikigai"}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoverZone("ikigai");
                }}
                onDragLeave={() => setHoverZone((h) => (h === "ikigai" ? null : h))}
                onDrop={() => {
                  if (dragId) move(dragId, "ikigai");
                  setDragId(null);
                  setHoverZone(null);
                }}
                style={centreStyle()}
              />

              {/* Chips overlay grouped by zone */}
              <div className="pointer-events-none absolute inset-0">
                {(Object.keys(ZONES) as Zone[]).map((z) => {
                  const items = chips.filter((c) => c.zone === z);
                  const anchor = z === "ikigai" ? CENTRE : CIRCLES[z as Exclude<Zone, "ikigai">];
                  return (
                    <div
                      key={z}
                      className="absolute"
                      style={{
                        left: `${(anchor.cx / 400) * 100}%`,
                        top: `${(anchor.cy / 400) * 100}%`,
                        transform: "translate(-50%, -50%)",
                        width: z === "ikigai" ? 110 : 150,
                      }}
                    >
                      <div className="pointer-events-auto flex flex-wrap justify-center gap-1.5">
                        {items.map((c) => (
                          <ChipEl
                            key={c.id}
                            chip={c}
                            onDragStart={(id) => setDragId(id)}
                            onDragEnd={() => setDragId(null)}
                            onRemove={() => remove(c.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Tip: drag a chip onto another circle to recategorize, or onto the dashed centre to mark
            it as your ikigai.
          </p>

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your ikigai sketch</h2>
          {chips.filter((c) => c.zone === "ikigai").length > 0 && (
            <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-5">
              <p className="text-xs uppercase tracking-wider text-primary font-semibold">
                Ikigai — where all four meet
              </p>
              <ul className="mt-2 space-y-1">
                {chips
                  .filter((c) => c.zone === "ikigai")
                  .map((c) => (
                    <li key={c.id} className="text-base font-medium">
                      • {c.text}
                    </li>
                  ))}
              </ul>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {(["love", "good", "world", "paid"] as Zone[]).map((z) => {
              const items = chips.filter((c) => c.zone === z);
              return (
                <div key={z} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: ZONES[z].color }}
                    />
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      {ZONES[z].sub} · {ZONES[z].label}
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {items.length === 0 && (
                      <li className="text-xs italic text-muted-foreground">—</li>
                    )}
                    {items.map((c) => (
                      <li key={c.id} className="text-sm">
                        • {c.text}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("fill")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}

function zoneStyle(z: Exclude<Zone, "ikigai">): React.CSSProperties {
  const { cx, cy } = CIRCLES[z];
  return {
    position: "absolute",
    left: `${((cx - R) / 400) * 100}%`,
    top: `${((cy - R) / 400) * 100}%`,
    width: `${((2 * R) / 400) * 100}%`,
    height: `${((2 * R) / 400) * 100}%`,
    borderRadius: "9999px",
  };
}

function centreStyle(): React.CSSProperties {
  const r = 32;
  return {
    position: "absolute",
    left: `${((CENTRE.cx - r) / 400) * 100}%`,
    top: `${((CENTRE.cy - r) / 400) * 100}%`,
    width: `${((2 * r) / 400) * 100}%`,
    height: `${((2 * r) / 400) * 100}%`,
    borderRadius: "9999px",
  };
}

function DropZone({
  hover,
  style,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  hover: boolean;
  style: React.CSSProperties;
  onDragOver: React.DragEventHandler;
  onDragLeave: React.DragEventHandler;
  onDrop: React.DragEventHandler;
}) {
  return (
    <div
      style={style}
      className={hover ? "ring-2 ring-primary/60" : ""}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    />
  );
}

function ChipEl({
  chip,
  onDragStart,
  onDragEnd,
  onRemove,
}: {
  chip: Chip;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onRemove: () => void;
}) {
  return (
    <span
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", chip.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart(chip.id);
      }}
      onDragEnd={onDragEnd}
      className="inline-flex items-center gap-1 rounded-full bg-card border border-border shadow-sm px-2 py-0.5 text-[11px] cursor-grab active:cursor-grabbing select-none hover:border-primary max-w-[140px]"
      title="Drag onto another circle"
    >
      <span className="truncate">{chip.text}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="text-muted-foreground hover:text-destructive"
      >
        ×
      </button>
    </span>
  );
}
