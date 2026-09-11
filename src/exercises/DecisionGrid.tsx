import { Fragment, useMemo, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { GhostButton, IntroGrid, PrimaryButton, TextInput } from "./_shared";

type Option = "yes" | "no";
type Time = "im" | "lt";
type Valence = "b" | "c";
type Zone = `${Option}_${Time}_${Valence}` | "tray";

type Item = { id: string; text: string; zone: Zone };

const ZONES: {
  key: Exclude<Zone, "tray">;
  option: Option;
  time: Time;
  valence: Valence;
  label: string;
}[] = [
  { key: "yes_im_b", option: "yes", time: "im", valence: "b", label: "Benefits now" },
  { key: "yes_im_c", option: "yes", time: "im", valence: "c", label: "Costs now" },
  { key: "yes_lt_b", option: "yes", time: "lt", valence: "b", label: "Benefits long-term" },
  { key: "yes_lt_c", option: "yes", time: "lt", valence: "c", label: "Costs long-term" },
  { key: "no_im_b", option: "no", time: "im", valence: "b", label: "Benefits now" },
  { key: "no_im_c", option: "no", time: "im", valence: "c", label: "Costs now" },
  { key: "no_lt_b", option: "no", time: "lt", valence: "b", label: "Benefits long-term" },
  { key: "no_lt_c", option: "no", time: "lt", valence: "c", label: "Costs long-term" },
];

export default function DecisionGrid() {
  const [decision, setDecision] = usePersistentState("decision-grid", "decision", "");
  const [draft, setDraft] = usePersistentState("decision-grid", "draft", "");
  const [items, setItems] = usePersistentState<Item[]>("decision-grid", "items", []);
  const [dragId, setDragId] = useState<string | null>(null);

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    setItems((xs) => [...xs, { id: crypto.randomUUID(), text: t, zone: "tray" }]);
    setDraft("");
  };
  const remove = (id: string) => setItems((xs) => xs.filter((x) => x.id !== id));
  const moveTo = (id: string, zone: Zone) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, zone } : x)));

  const byZone = useMemo(() => {
    const m: Record<Zone, Item[]> = {
      tray: [],
      yes_im_b: [],
      yes_im_c: [],
      yes_lt_b: [],
      yes_lt_c: [],
      no_im_b: [],
      no_im_c: [],
      no_lt_b: [],
      no_lt_c: [],
    };
    items.forEach((it) => m[it.zone].push(it));
    return m;
  }, [items]);

  const tally = (option: Option, valence: Valence) =>
    ZONES.filter((z) => z.option === option && z.valence === valence).reduce(
      (n, z) => n + byZone[z.key].length,
      0,
    );

  const Grid = ({ option, title, tone }: { option: Option; title: string; tone: string }) => (
    <div className={`rounded-2xl border p-5 ${tone}`}>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          <span className="text-foreground font-medium">{tally(option, "b")}</span> benefits ·{" "}
          <span className="text-foreground font-medium">{tally(option, "c")}</span> costs
        </span>
      </div>
      <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
        <div></div>
        <div className="px-2">Benefits</div>
        <div className="px-2">Costs</div>
        {(["im", "lt"] as Time[]).map((time) => (
          <Fragment key={time}>
            <div className="self-center px-1 text-right">{time === "im" ? "Now" : "Long-term"}</div>
            {(["b", "c"] as Valence[]).map((val) => {
              const key = `${option}_${time}_${val}` as Zone;
              return (
                <DropCell
                  key={key}
                  zone={key}
                  items={byZone[key]}
                  onDrop={(id) => moveTo(id, key)}
                  setDragId={setDragId}
                  dragId={dragId}
                  onRemove={remove}
                  accent={val === "b" ? "primary" : "destructive"}
                />
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <IntroGrid
        what="A 2×2 grid to weigh a difficult decision — the benefits and costs of acting, against staying the same."
        why="Big decisions are easier when you get them out of your head. Equal attention to each option makes the choice more objective."
        how="Name the decision, add factors as chips, then drag each into the quadrant where it belongs."
      />

      <div>
        <label className="text-sm font-medium">What are you trying to decide?</label>
        <TextInput
          value={decision}
          onChange={(e) => setDecision(e.target.value)}
          placeholder="e.g. Should I switch majors?"
          className="mt-2"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex gap-2">
          <TextInput
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add a factor — e.g. 'lose income for 6 months'"
          />
          <PrimaryButton onClick={add}>Add</PrimaryButton>
        </div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (dragId) moveTo(dragId, "tray");
          }}
          className="min-h-[56px] rounded-xl border border-dashed border-border p-3"
        >
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Unsorted
          </p>
          {byZone.tray.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Add factors above — then drag them into a quadrant.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {byZone.tray.map((it) => (
                <Chip
                  key={it.id}
                  item={it}
                  setDragId={setDragId}
                  dragId={dragId}
                  onRemove={remove}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Grid option="yes" title="If I make this decision" tone="border-primary/30 bg-primary/5" />
        <Grid option="no" title="If things stay the same" tone="border-border bg-card" />
      </div>

      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-sm text-muted-foreground">
        Tip: don't decide today. Come back tomorrow with a fresh head — new costs or benefits often
        appear.
      </div>
    </div>
  );
}

function Chip({
  item,
  setDragId,
  dragId,
  onRemove,
}: {
  item: Item;
  setDragId: (id: string | null) => void;
  dragId: string | null;
  onRemove: (id: string) => void;
}) {
  const dragging = dragId === item.id;
  return (
    <span
      draggable
      onDragStart={() => setDragId(item.id)}
      onDragEnd={() => setDragId(null)}
      className={`group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium cursor-grab ${dragging ? "opacity-40" : ""}`}
    >
      {item.text}
      <button
        onClick={() => onRemove(item.id)}
        className="opacity-50 hover:opacity-100"
        aria-label="remove"
      >
        ×
      </button>
    </span>
  );
}

function DropCell({
  zone,
  items,
  onDrop,
  setDragId,
  dragId,
  onRemove,
  accent,
}: {
  zone: Zone;
  items: Item[];
  onDrop: (id: string) => void;
  setDragId: (id: string | null) => void;
  dragId: string | null;
  onRemove: (id: string) => void;
  accent: "primary" | "destructive";
}) {
  const [over, setOver] = useState(false);
  const accentCls = accent === "primary" ? "border-primary/40" : "border-destructive/40";
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = dragId;
        if (id) onDrop(id);
      }}
      className={`rounded-lg border-2 border-dashed p-2 min-h-[88px] transition-colors ${accentCls} ${over ? (accent === "primary" ? "bg-primary/10" : "bg-destructive/10") : "bg-background/40"}`}
    >
      {items.length === 0 ? (
        <p className="text-[11px] normal-case tracking-normal text-muted-foreground">Drop here</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it) => (
            <Chip key={it.id} item={it} setDragId={setDragId} dragId={dragId} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
