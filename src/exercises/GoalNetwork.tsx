import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { IntroGrid, InfoCard, TextInput, TextArea, GhostButton, PrimaryButton, Field } from "./_shared";

/**
 * Goal Network — build a hierarchy of superordinate (identity/value level),
 * intermediate (direction) and subordinate (concrete action) goals, then draw
 * the multifinal links: one lower goal feeding several higher ones.
 *
 * Everything lives in a single persisted blob so the whole exercise can be
 * exported to a file and re-imported after a device clears its storage.
 */

const SLUG = "goal-network";
const FILE_VERSION = 1;

type Level = "super" | "inter" | "sub";

type Node = {
  id: string;
  text: string;
  /** Subordinate only: the "when/where" cue that turns intent into a plan. */
  cue?: string;
  /** Subordinate only: planned slack — the allowance that costs a little but isn't failure. */
  slack?: string;
  /** ids of nodes one level up that this node supports. */
  links: string[];
};

type Data = { supers: Node[]; inters: Node[]; subs: Node[] };

const EMPTY: Data = { supers: [], inters: [], subs: [] };

const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id-${Math.random().toString(36).slice(2)}`;

const LEVELS: { key: Level; title: string; kicker: string; blurb: string; placeholder: string }[] = [
  {
    key: "super",
    title: "Superordinate",
    kicker: "Who you are",
    blurb: "Big-picture, identity-level. Closer to a value than a goal. No deadline, no metric.",
    placeholder: "e.g. Be a healthy person",
  },
  {
    key: "inter",
    title: "Intermediate",
    kicker: "Which direction",
    blurb: "Less abstract. A direction of travel that serves one or more of your superordinate goals.",
    placeholder: "e.g. Sleep better",
  },
  {
    key: "sub",
    title: "Subordinate",
    kicker: "What you'll actually do",
    blurb: "Exactly what you'll do, when, and where. Approach-framed and process-focused.",
    placeholder: "e.g. Walk 30 min after dinner",
  },
];

const KEY_OF: Record<Level, keyof Data> = { super: "supers", inter: "inters", sub: "subs" };

export default function GoalNetwork() {
  const [data, setData] = usePersistentState<Data>(SLUG, "data", EMPTY);
  const [drafts, setDrafts] = useState<Record<Level, string>>({ super: "", inter: "", sub: "" });
  const [openId, setOpenId] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);

  const list = (level: Level) => data[KEY_OF[level]];

  const add = (level: Level) => {
    const text = drafts[level].trim();
    if (!text) return;
    const node: Node = { id: newId(), text, links: [] };
    setData((d) => ({ ...d, [KEY_OF[level]]: [...d[KEY_OF[level]], node] }));
    setDrafts((s) => ({ ...s, [level]: "" }));
  };

  const update = (level: Level, id: string, patch: Partial<Node>) =>
    setData((d) => ({
      ...d,
      [KEY_OF[level]]: d[KEY_OF[level]].map((n) => (n.id === id ? { ...n, ...patch } : n)),
    }));

  const remove = (level: Level, id: string) =>
    setData((d) => {
      const next: Data = {
        ...d,
        [KEY_OF[level]]: d[KEY_OF[level]].filter((n) => n.id !== id),
      };
      // Drop links pointing at the deleted node.
      if (level === "super") next.inters = next.inters.map((n) => ({ ...n, links: n.links.filter((l) => l !== id) }));
      if (level === "inter") next.subs = next.subs.map((n) => ({ ...n, links: n.links.filter((l) => l !== id) }));
      return next;
    });

  const toggleLink = (level: "inter" | "sub", id: string, parentId: string) =>
    setData((d) => ({
      ...d,
      [KEY_OF[level]]: d[KEY_OF[level]].map((n) =>
        n.id === id
          ? { ...n, links: n.links.includes(parentId) ? n.links.filter((l) => l !== parentId) : [...n.links, parentId] }
          : n,
      ),
    }));

  // ---- Import / export -----------------------------------------------------

  const exportFile = () => {
    const blob = new Blob(
      [JSON.stringify({ kind: "goal-network", version: FILE_VERSION, savedAt: new Date().toISOString(), data }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goal-network-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as { kind?: string; data?: Data };
      const d = parsed?.data;
      if (parsed?.kind !== "goal-network" || !d || !Array.isArray(d.supers) || !Array.isArray(d.inters) || !Array.isArray(d.subs)) {
        setImportMsg("That file isn't a saved goal network.");
        return;
      }
      const clean = (arr: Node[]): Node[] =>
        arr
          .filter((n) => n && typeof n.text === "string")
          .map((n) => ({
            id: typeof n.id === "string" ? n.id : newId(),
            text: n.text,
            cue: typeof n.cue === "string" ? n.cue : undefined,
            slack: typeof n.slack === "string" ? n.slack : undefined,
            links: Array.isArray(n.links) ? n.links.filter((l) => typeof l === "string") : [],
          }));
      setData({ supers: clean(d.supers), inters: clean(d.inters), subs: clean(d.subs) });
      setImportMsg("Loaded. Your goals are back and editable.");
    } catch {
      setImportMsg("Couldn't read that file — it may be damaged.");
    }
  };

  useEffect(() => {
    if (!importMsg) return;
    const t = setTimeout(() => setImportMsg(null), 6000);
    return () => clearTimeout(t);
  }, [importMsg]);

  const total = data.supers.length + data.inters.length + data.subs.length;

  return (
    <div className="space-y-8">
      <IntroGrid
        what="Build a goal network: a few identity-level superordinate goals, the intermediate directions that serve them, and the concrete subordinate actions underneath — then link each action to every goal above it that it feeds."
        why="Single small goals are fragile. A network gives you a reason to keep going when one motivation dips: one run can serve sleep, stress and fitness at once (multifinality), and one big goal can be served several ways (equifinality)."
        how={
          <ol className="list-decimal pl-4 space-y-1.5">
            <li>Name 1–3 superordinate goals.</li>
            <li>Add intermediate goals and link them upward.</li>
            <li>Add subordinate actions with a when/where cue.</li>
            <li>Link each action to every intermediate it supports.</li>
            <li>Read the map and export a copy.</li>
          </ol>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <InfoCard title="Multifinality">
          One action serving several goals above it. The more links a subordinate goal has, the more reasons you have to
          do it on a low-motivation day.
        </InfoCard>
        <InfoCard title="Make them good goals">
          Favour approach over avoidance ("eat more veg", not "stop snacking"), process over outcome, mastery over
          performance — and build in a little planned slack that costs something but isn't failure.
        </InfoCard>
      </div>

      {LEVELS.map((lv) => {
        const items = list(lv.key);
        const parents = lv.key === "inter" ? data.supers : lv.key === "sub" ? data.inters : [];
        return (
          <section key={lv.key} className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <header className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-orange">{lv.kicker}</p>
                <h3 className="text-lg font-semibold">{lv.title} goals</h3>
              </div>
              <span className="text-xs text-muted-foreground">{items.length} added</span>
            </header>
            <p className="text-sm text-muted-foreground">{lv.blurb}</p>

            <div className="flex flex-wrap gap-2">
              <TextInput
                className="flex-1 min-w-56"
                placeholder={lv.placeholder}
                value={drafts[lv.key]}
                onChange={(e) => setDrafts((s) => ({ ...s, [lv.key]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") add(lv.key);
                }}
              />
              <PrimaryButton onClick={() => add(lv.key)} disabled={!drafts[lv.key].trim()}>
                Add
              </PrimaryButton>
            </div>

            {lv.key !== "super" && items.length > 0 && parents.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Add {lv.key === "inter" ? "a superordinate" : "an intermediate"} goal above to start linking.
              </p>
            )}

            <ul className="space-y-3">
              {items.map((n) => {
                const open = openId === n.id;
                return (
                  <li key={n.id} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex items-start gap-2">
                      <TextInput
                        value={n.text}
                        onChange={(e) => update(lv.key, n.id, { text: e.target.value })}
                        className="flex-1 border-transparent bg-transparent px-1 font-medium"
                      />
                      {lv.key === "sub" && (
                        <button
                          onClick={() => setOpenId(open ? null : n.id)}
                          className="rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary"
                        >
                          {open ? "Hide detail" : "Detail"}
                        </button>
                      )}
                      <button
                        onClick={() => remove(lv.key, n.id)}
                        aria-label="Remove goal"
                        className="px-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    </div>

                    {lv.key === "sub" && open && (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Field label="When and where" hint="If it's Monday at 7am, then…">
                          <TextInput
                            value={n.cue ?? ""}
                            onChange={(e) => update("sub", n.id, { cue: e.target.value })}
                            placeholder="Mon/Wed/Fri, 7am, gym by work"
                          />
                        </Field>
                        <Field label="Planned slack" hint="An allowance that costs a little but isn't failure.">
                          <TextInput
                            value={n.slack ?? ""}
                            onChange={(e) => update("sub", n.id, { slack: e.target.value })}
                            placeholder="Two skipped sessions a month are fine"
                          />
                        </Field>
                      </div>
                    )}

                    {lv.key !== "super" && parents.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted-foreground">Supports:</span>
                        {parents.map((p) => {
                          const on = n.links.includes(p.id);
                          return (
                            <button
                              key={p.id}
                              onClick={() => toggleLink(lv.key as "inter" | "sub", n.id, p.id)}
                              aria-pressed={on}
                              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                                on
                                  ? "border-transparent bg-primary text-primary-foreground"
                                  : "border-border text-muted-foreground hover:bg-secondary"
                              }`}
                            >
                              {p.text || "Untitled"}
                            </button>
                          );
                        })}
                        {n.links.length >= 2 && (
                          <span className="rounded-full bg-ink-ochre-soft px-2 py-0.5 text-[11px] font-medium text-ink-red-deep">
                            multifinal ×{n.links.length}
                          </span>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
              {items.length === 0 && (
                <li className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                  Nothing here yet.
                </li>
              )}
            </ul>
          </section>
        );
      })}

      {total > 0 && <NetworkMap data={data} />}

      <ImportExport onExport={exportFile} onImport={importFile} message={importMsg} hasData={total > 0} />

      {total > 0 && (
        <div className="no-print flex justify-end">
          <button
            onClick={() => window.print()}
            className="rounded-full border border-border bg-card px-5 py-2 text-sm hover:bg-secondary"
          >
            Print / Save PDF
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Three columns of goal cards with curves drawn between linked cards.
 *
 * Positions are measured from the DOM after layout (and on resize) because the
 * cards are ordinary flow content — nothing about the text length is known up
 * front, so the lines have to follow wherever the boxes land.
 */
function NetworkMap({ data }: { data: Data }) {
  const wrap = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef(new Map<string, HTMLElement>());
  const [edges, setEdges] = useState<{ id: string; d: string; strong: boolean }[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<string | null>(null);

  const setRef = (id: string) => (el: HTMLElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  };

  useLayoutEffect(() => {
    const measure = () => {
      const box = wrap.current?.getBoundingClientRect();
      if (!box) return;
      setSize({ w: box.width, h: box.height });
      const next: { id: string; d: string; strong: boolean }[] = [];
      const link = (child: Node, level: "inter" | "sub") => {
        const c = nodeRefs.current.get(child.id)?.getBoundingClientRect();
        if (!c) return;
        for (const parentId of child.links) {
          const p = nodeRefs.current.get(parentId)?.getBoundingClientRect();
          if (!p) continue;
          // Child column sits to the right of its parent column.
          const x1 = p.right - box.left;
          const y1 = p.top + p.height / 2 - box.top;
          const x2 = c.left - box.left;
          const y2 = c.top + c.height / 2 - box.top;
          const mid = (x1 + x2) / 2;
          next.push({
            id: `${child.id}-${parentId}`,
            d: `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`,
            strong: child.links.length >= 2,
          });
        }
        void level;
      };
      data.inters.forEach((n) => link(n, "inter"));
      data.subs.forEach((n) => link(n, "sub"));
      setEdges(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [data]);

  const columns: { level: Level; label: string; nodes: Node[] }[] = [
    { level: "super", label: "Superordinate", nodes: data.supers },
    { level: "inter", label: "Intermediate", nodes: data.inters },
    { level: "sub", label: "Subordinate", nodes: data.subs },
  ];

  const orphanInters = data.inters.filter((n) => n.links.length === 0).length;
  const orphanSubs = data.subs.filter((n) => n.links.length === 0).length;
  const multifinal = data.subs.filter((n) => n.links.length >= 2);
  const equifinal = data.supers.filter((s) => data.inters.filter((i) => i.links.includes(s.id)).length >= 2);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold">Your goal network</h3>
        <span className="text-xs text-muted-foreground">Lines run from a goal to everything that supports it.</span>
      </div>

      <div ref={wrap} className="relative overflow-x-auto rounded-2xl border border-border bg-card p-4">
        <svg
          width={size.w}
          height={size.h}
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          {edges.map((e) => (
            <path
              key={e.id}
              d={e.d}
              fill="none"
              stroke={e.strong ? "var(--primary)" : "var(--border)"}
              strokeWidth={e.strong ? 2 : 1.5}
              opacity={hover ? (e.id.includes(hover) ? 1 : 0.15) : 0.9}
            />
          ))}
        </svg>

        <div className="relative grid min-w-[640px] grid-cols-3 gap-8">
          {columns.map((col) => (
            <div key={col.level} className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</p>
              {col.nodes.map((n) => (
                <div
                  key={n.id}
                  ref={setRef(n.id)}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  className={`rounded-xl border bg-background px-3 py-2 text-sm ${
                    n.links && n.links.length >= 2 ? "border-primary/60" : "border-border"
                  }`}
                >
                  <span className="font-medium">{n.text || "Untitled"}</span>
                  {n.cue && <span className="mt-1 block text-xs text-muted-foreground">{n.cue}</span>}
                  {n.slack && <span className="mt-0.5 block text-xs text-muted-foreground">Slack: {n.slack}</span>}
                </div>
              ))}
              {col.nodes.length === 0 && (
                <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                  Empty
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoCard title="What the map says">
          <ul className="space-y-1.5">
            <li>
              <strong>{multifinal.length}</strong> action{multifinal.length === 1 ? "" : "s"} serve more than one
              intermediate goal.
            </li>
            <li>
              <strong>{equifinal.length}</strong> superordinate goal{equifinal.length === 1 ? " is" : "s are"} supported
              more than one way.
            </li>
            {(orphanInters > 0 || orphanSubs > 0) && (
              <li className="text-muted-foreground">
                {orphanInters + orphanSubs} goal{orphanInters + orphanSubs === 1 ? "" : "s"} not linked to anything
                above — either link them or let them go.
              </li>
            )}
          </ul>
        </InfoCard>
        <InfoCard title="Strengthen a link">
          Pick your least-linked action and ask: what else, higher up, could this already be serving? Writing that link
          down is what makes it a motivator on a bad day.
        </InfoCard>
      </div>
    </section>
  );
}

function ImportExport({
  onExport,
  onImport,
  message,
  hasData,
}: {
  onExport: () => void;
  onImport: (file: File) => void;
  message: string | null;
  hasData: boolean;
}) {
  const input = useRef<HTMLInputElement | null>(null);

  return (
    <section className="no-print rounded-2xl border border-border bg-card p-6 space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-orange">Backup and restore</h3>
      <p className="text-sm text-muted-foreground">
        Your answers are saved on this device only. Download a copy so you can bring your goal network back — on this
        browser or another one — and carry on editing.
      </p>
      <div className="flex flex-wrap gap-2">
        <PrimaryButton onClick={onExport} disabled={!hasData}>
          Download my goal network
        </PrimaryButton>
        <GhostButton onClick={() => input.current?.click()}>Upload a saved file</GhostButton>
        <input
          ref={input}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Upload a saved goal network file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImport(file);
            e.target.value = "";
          }}
        />
      </div>
      {message && (
        <p role="status" className="text-xs text-muted-foreground">
          {message}
        </p>
      )}
      <p className="text-xs text-muted-foreground">Uploading replaces what's currently on screen.</p>
    </section>
  );
}
