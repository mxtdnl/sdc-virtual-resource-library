import { useMemo, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea, TextInput } from "./_shared";

type Zone = "unsorted" | "control" | "influence" | "concern";
type Item = { id: string; text: string; zone: Zone };

const ZONE_META: Record<Exclude<Zone, "unsorted">, { title: string; sub: string }> = {
  control: { title: "Control", sub: "Fully within my power" },
  influence: { title: "Influence", sub: "I can affect, not decide" },
  concern: { title: "Concern", sub: "Outside my power — let go" },
};

// Concentric ring geometry (viewBox 400x400)
const CX = 200;
const CY = 200;
const R = { control: 70, influence: 130, concern: 190 } as const;

export default function CirclesOfControl() {
  const [step, setStep] = usePersistentState<
    "intro" | "problem" | "brainstorm" | "sort" | "action" | "summary"
  >("circles-of-control", "step", "intro");
  const [problem, setProblem] = usePersistentState("circles-of-control", "problem", "");
  const [items, setItems] = usePersistentState<Item[]>("circles-of-control", "items", []);
  const [draft, setDraft] = usePersistentState("circles-of-control", "draft", "");
  const [action, setAction] = usePersistentState("circles-of-control", "action", "");
  const [letGo, setLetGo] = usePersistentState("circles-of-control", "letGo", "");
  const [dragId, setDragId] = useState<string | null>(null);
  const [hoverZone, setHoverZone] = useState<Zone | null>(null);

  const grouped = useMemo(
    () => ({
      unsorted: items.filter((i) => i.zone === "unsorted"),
      control: items.filter((i) => i.zone === "control"),
      influence: items.filter((i) => i.zone === "influence"),
      concern: items.filter((i) => i.zone === "concern"),
    }),
    [items],
  );

  const addItem = () => {
    const t = draft.trim();
    if (!t) return;
    setItems((arr) => [...arr, { id: crypto.randomUUID(), text: t, zone: "unsorted" }]);
    setDraft("");
  };

  const moveTo = (id: string, zone: Zone) =>
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, zone } : i)));
  const remove = (id: string) => setItems((arr) => arr.filter((i) => i.id !== id));

  const onDragStart = (id: string) => setDragId(id);
  const onDragEnd = () => {
    setDragId(null);
    setHoverZone(null);
  };
  const onDropZone = (zone: Zone) => {
    if (dragId) moveTo(dragId, zone);
    onDragEnd();
  };

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what={
              <>
                Separate concerns into what you can <strong>control</strong>,{" "}
                <strong>influence</strong>, and what's <strong>outside</strong> your power — then
                focus energy where it counts.
              </>
            }
            why="Stress amplifies when we dwell on what we can't change. Letting go of the uncontrollable frees energy for meaningful action."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Name the problem.</li>
                <li>Brainstorm the factors involved.</li>
                <li>Drag each one into the right ring.</li>
                <li>Plan action; release the rest.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("problem")}>Start the exercise →</PrimaryButton>
        </section>
      )}

      {step === "problem" && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">1. Name the problem</h2>
          <p className="text-sm text-muted-foreground">
            Be as specific as possible about what's causing stress or concern.
          </p>
          <TextArea
            rows={4}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g. Stress about a big report due this week"
          />
          <div className="flex justify-end">
            <PrimaryButton disabled={!problem.trim()} onClick={() => setStep("brainstorm")}>
              Next →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "brainstorm" && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">2. List the factors</h2>
          <p className="text-sm text-muted-foreground">
            Everything tangled up in this problem — feelings, people, deadlines, tasks. One per
            line.
          </p>
          <div className="flex flex-col md:flex-row gap-2">
            <TextInput
              placeholder="e.g. The deadline"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <PrimaryButton onClick={addItem}>Add</PrimaryButton>
          </div>
          {items.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap gap-2">
                {items.map((i) => (
                  <span
                    key={i.id}
                    className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs"
                  >
                    {i.text}
                    <button
                      onClick={() => remove(i.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("problem")}>← Back</GhostButton>
            <PrimaryButton disabled={items.length < 2} onClick={() => setStep("sort")}>
              Next →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "sort" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">3. Drag into the rings</h2>
          <p className="text-sm text-muted-foreground">
            Drag each factor inward toward what you can actually act on. Tap a chip to cycle through
            rings if drag isn't handy.
          </p>

          <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            {/* Concentric circles */}
            <div className="relative">
              <svg viewBox="0 0 400 400" className="w-full h-auto">
                {(["concern", "influence", "control"] as const).map((z) => (
                  <circle
                    key={z}
                    cx={CX}
                    cy={CY}
                    r={R[z]}
                    className={
                      z === "control"
                        ? "fill-primary/20 stroke-primary"
                        : z === "influence"
                          ? "fill-primary/10 stroke-primary/60"
                          : "fill-muted/30 stroke-border"
                    }
                    strokeWidth={hoverZone === z ? 3 : 1.5}
                    style={{ transition: "stroke-width 120ms" }}
                  />
                ))}
                <text
                  x={CX}
                  y={CY - R.control - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[11px] font-semibold uppercase tracking-wider"
                >
                  Control
                </text>
                <text
                  x={CX}
                  y={CY - R.influence - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[11px] font-semibold uppercase tracking-wider"
                >
                  Influence
                </text>
                <text
                  x={CX}
                  y={CY - R.concern - 8}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[11px] font-semibold uppercase tracking-wider"
                >
                  Concern
                </text>
              </svg>

              {/* Drop zones layered as concentric absolute regions. Order matters — innermost on top. */}
              <DropRing
                zone="concern"
                hover={hoverZone === "concern"}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoverZone("concern");
                }}
                onDrop={() => onDropZone("concern")}
                style={{ inset: 0, borderRadius: "9999px" }}
              />
              <DropRing
                zone="influence"
                hover={hoverZone === "influence"}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoverZone("influence");
                }}
                onDrop={() => onDropZone("influence")}
                style={{ inset: `${(1 - R.influence / R.concern) * 50}%`, borderRadius: "9999px" }}
              />
              <DropRing
                zone="control"
                hover={hoverZone === "control"}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoverZone("control");
                }}
                onDrop={() => onDropZone("control")}
                style={{ inset: `${(1 - R.control / R.concern) * 50}%`, borderRadius: "9999px" }}
              />

              {/* Render placed chips positioned inside their ring */}
              <div className="pointer-events-none absolute inset-0">
                {(["control", "influence", "concern"] as Zone[]).map(
                  (z) =>
                    z !== "unsorted" && (
                      <RingChips
                        key={z}
                        zone={z}
                        items={grouped[z]}
                        onCycle={(id) => moveTo(id, nextZone(z))}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                      />
                    ),
                )}
              </div>
            </div>

            {/* Unsorted tray */}
            <div
              className={`rounded-xl border-2 border-dashed p-4 min-h-[200px] transition-colors ${hoverZone === "unsorted" ? "border-primary bg-primary/5" : "border-border bg-card"}`}
              onDragOver={(e) => {
                e.preventDefault();
                setHoverZone("unsorted");
              }}
              onDragLeave={() => setHoverZone(null)}
              onDrop={() => onDropZone("unsorted")}
            >
              <h4 className="text-sm font-semibold">Unsorted</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Drag onto a ring →</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {grouped.unsorted.map((i) => (
                  <Chip
                    key={i.id}
                    item={i}
                    onCycle={() => moveTo(i.id, "control")}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onRemove={() => remove(i.id)}
                  />
                ))}
                {grouped.unsorted.length === 0 && (
                  <p className="text-xs italic text-muted-foreground">All sorted ✓</p>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex gap-2">
                  <TextInput
                    placeholder="Add another"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addItem()}
                  />
                  <button
                    onClick={addItem}
                    className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground hover:opacity-90"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("brainstorm")}>← Back</GhostButton>
            <PrimaryButton
              disabled={grouped.unsorted.length === items.length}
              onClick={() => setStep("action")}
            >
              Next →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "action" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">4. Act & release</h2>
          <Field label="Small, actionable steps from what you control or influence">
            <TextArea
              rows={4}
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="What's the first step you can take?"
            />
          </Field>
          <Field label="How will you let go of what's outside your control?">
            <TextArea
              rows={4}
              value={letGo}
              onChange={(e) => setLetGo(e.target.value)}
              placeholder="An affirmation, reminder, or practice"
            />
          </Field>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("sort")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your circles</h2>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Problem
            </p>
            <p className="mt-1 text-sm">{problem}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {(["control", "influence", "concern"] as const).map((k) => (
              <div
                key={k}
                className={`rounded-xl border p-4 ${k === "control" ? "border-primary/40 bg-primary/5" : k === "influence" ? "border-primary/20 bg-primary/[0.03]" : "border-border bg-muted/30"}`}
              >
                <h3 className="text-sm font-semibold">{ZONE_META[k].title}</h3>
                <p className="text-xs text-muted-foreground">{ZONE_META[k].sub}</p>
                <ul className="mt-2 space-y-1">
                  {grouped[k].length === 0 && (
                    <li className="text-xs text-muted-foreground italic">—</li>
                  )}
                  {grouped[k].map((i) => (
                    <li key={i.id} className="text-sm">
                      • {i.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Action steps
              </p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{action || "—"}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Letting go
              </p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{letGo || "—"}</p>
            </div>
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

function nextZone(z: Zone): Zone {
  const order: Zone[] = ["control", "influence", "concern", "unsorted"];
  return order[(order.indexOf(z) + 1) % order.length];
}

function DropRing({
  zone,
  hover,
  style,
  onDragOver,
  onDrop,
}: {
  zone: Zone;
  hover: boolean;
  style: React.CSSProperties;
  onDragOver: React.DragEventHandler;
  onDrop: React.DragEventHandler;
}) {
  return (
    <div
      className={`absolute ${hover ? "ring-2 ring-primary" : ""}`}
      style={style}
      onDragOver={onDragOver}
      onDrop={onDrop}
    />
  );
}

function RingChips({
  zone,
  items,
  onCycle,
  onDragStart,
  onDragEnd,
}: {
  zone: Exclude<Zone, "unsorted">;
  items: Item[];
  onCycle: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
}) {
  // Place chips around a circle at the mid-radius of each ring.
  const mid =
    zone === "control"
      ? R.control * 0.45
      : zone === "influence"
        ? (R.control + R.influence) / 2
        : (R.influence + R.concern) / 2;
  return (
    <>
      {items.map((i, idx) => {
        const angle = (idx / Math.max(items.length, 1)) * Math.PI * 2 - Math.PI / 2;
        const xPct = ((CX + Math.cos(angle) * mid) / 400) * 100;
        const yPct = ((CY + Math.sin(angle) * mid) / 400) * 100;
        return (
          <div
            key={i.id}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
          >
            <Chip
              item={i}
              onCycle={() => onCycle(i.id)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          </div>
        );
      })}
    </>
  );
}

function Chip({
  item,
  onCycle,
  onDragStart,
  onDragEnd,
  onRemove,
}: {
  item: Item;
  onCycle: () => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onRemove?: () => void;
}) {
  return (
    <span
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", item.id);
        onDragStart(item.id);
      }}
      onDragEnd={onDragEnd}
      onClick={onCycle}
      className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border shadow-sm px-3 py-1 text-xs cursor-grab active:cursor-grabbing select-none hover:border-primary"
      title="Drag onto a ring, or click to cycle"
    >
      {item.text}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-muted-foreground hover:text-destructive"
        >
          ×
        </button>
      )}
    </span>
  );
}
