import { useEffect, useRef, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";

const DEFAULT_AREAS = [
  "Finances",
  "Physical Environment",
  "Personal Growth",
  "Health",
  "Career",
  "Relationships",
  "Academics",
  "Fun & Recreation",
] as const;

const REFLECTIONS = [
  { key: "balance", label: "How balanced is your wheel?" },
  { key: "surprise", label: "What has surprised you about how you've ranked each area?" },
  { key: "attention", label: "Which areas need attention?" },
  { key: "goals", label: "What goal could lift one area by 1? By 2?" },
] as const;

export default function WheelOfLife() {
  const [step, setStep] = usePersistentState<"intro" | "rate" | "summary">(
    "wheel-of-life",
    "step",
    "intro",
  );
  const [areas] = useState<string[]>([...DEFAULT_AREAS]);
  const [scores, setScores] = usePersistentState<Record<string, number>>(
    "wheel-of-life",
    "scores",
    () => Object.fromEntries(DEFAULT_AREAS.map((a) => [a, 5])),
  );
  const [notes, setNotes] = usePersistentState<Record<string, string>>(
    "wheel-of-life",
    "notes",
    {},
  );

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A visual snapshot of your satisfaction across eight life areas."
            why="Balance matters. The wheel shows where you're thriving and where things need attention."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Drag each dot along its spoke to rate that area.</li>
                <li>Watch your wheel reshape live.</li>
                <li>Reflect and set a small goal.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => setStep("rate")}>Start →</PrimaryButton>
        </section>
      )}

      {step === "rate" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Drag each dot</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Outward = more satisfaction (10). Inward = less (1). The shape morphs as you drag.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 flex justify-center">
            <DraggableRadar scores={scores} setScores={setScores} categories={areas} />
          </div>

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
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your wheel of life</h2>
          <div className="rounded-xl border border-border bg-card p-6 flex justify-center">
            <DraggableRadar scores={scores} setScores={setScores} categories={areas} readOnly />
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
            <GhostButton onClick={() => setStep("rate")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}

/** Break a spoke label into short lines so long names don't run off the viewBox. */
function wrapLabel(text: string, maxChars = 14): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function DraggableRadar({
  scores,
  setScores,
  categories,
  readOnly = false,
  labels,
  min = 1,
  color = "var(--primary)",
  overlay,
  clampValue,
  showValues = true,
  setOnPress = false,
  hideZeroHandles = false,
  ariaLabel = "Interactive wheel of life",
}: {
  scores: Record<string, number>;
  setScores: (s: Record<string, number>) => void;
  categories: readonly string[];
  readOnly?: boolean;
  /** Display names, when they differ from the score keys (e.g. a student-defined area). */
  labels?: readonly string[];
  /** Lowest value a spoke can be dragged to. Defaults to 1; use 0 for budgets. */
  min?: number;
  /** Accent for the polygon and handles. */
  color?: string;
  /** A second, dashed polygon drawn behind the primary one for comparison. */
  overlay?: { scores: Record<string, number>; color?: string };
  /** Final say on a dragged value — used to enforce a shared budget. */
  clampValue?: (index: number, value: number) => number;
  showValues?: boolean;
  /** Place a value on press rather than waiting for movement, so a click alone sets a spoke. */
  setOnPress?: boolean;
  /** Draw no handle for a spoke sitting at 0 — an unallocated spoke, not a spoke rated zero. */
  hideZeroHandles?: boolean;
  ariaLabel?: string;
}) {
  const size = 460;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 90;
  const n = categories.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, value: number) => {
    const a = angle(i);
    const d = (value / 10) * r;
    return [cx + Math.cos(a) * d, cy + Math.sin(a) * d];
  };

  const svgRef = useRef<SVGSVGElement>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  /** Project a pointer position onto one spoke and write the value it lands on. */
  const setFromPointer = (idx: number, clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * size - cx;
    const y = ((clientY - rect.top) / rect.height) * size - cy;
    const a = angle(idx);
    const proj = x * Math.cos(a) + y * Math.sin(a);
    const raw = Math.max(min, Math.min(10, Math.round((proj / r) * 10)));
    setScores({ ...scores, [categories[idx]]: clampValue ? clampValue(idx, raw) : raw });
  };

  useEffect(() => {
    if (dragIdx === null) return;
    const move = (e: PointerEvent) => setFromPointer(dragIdx, e.clientX, e.clientY);
    const up = () => setDragIdx(null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // setFromPointer is recreated each render but reads only current props/state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragIdx, scores, setScores, categories, r, cx, cy, min, clampValue]);

  const polygon = categories.map((c, i) => point(i, scores[c]).join(",")).join(" ");

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${size} ${size}`}
      className="w-full max-w-[480px] touch-none select-none"
      role="img"
      aria-label={ariaLabel}
    >
      {[2, 4, 6, 8, 10].map((g) => (
        <polygon
          key={g}
          points={categories.map((_, i) => point(i, g).join(",")).join(" ")}
          fill="none"
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray={g === 10 ? "0" : "2 3"}
        />
      ))}
      {categories.map((_, i) => {
        const [x, y] = point(i, 10);
        const lit = !readOnly && (hover === i || dragIdx === i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke={lit ? color : "var(--border)"}
            strokeWidth={lit ? 2 : 1}
            strokeOpacity={lit ? 0.5 : 1}
          />
        );
      })}
      {overlay && (
        <polygon
          points={categories.map((c, i) => point(i, overlay.scores[c] ?? 0).join(",")).join(" ")}
          fill={overlay.color ?? "var(--muted-foreground)"}
          fillOpacity={0.12}
          stroke={overlay.color ?? "var(--muted-foreground)"}
          strokeWidth={2}
          strokeDasharray="5 4"
        />
      )}
      <polygon
        points={polygon}
        fill={color}
        fillOpacity={0.22}
        stroke={color}
        strokeWidth={2}
        style={{ transition: dragIdx === null ? "all 180ms ease-out" : "none" }}
      />
      {/* Grab anywhere along a spoke, not just on its dot: when several areas share a
          value their dots overlap, and at 0 all of them sit on top of each other. */}
      {!readOnly &&
        categories.map((c, i) => {
          const [x, y] = point(i, 10.2);
          return (
            <line
              key={c + "-hit"}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="transparent"
              strokeWidth={30}
              strokeLinecap="round"
              style={{ cursor: "grab" }}
              onPointerDown={(e) => {
                (e.target as Element).setPointerCapture(e.pointerId);
                setDragIdx(i);
                if (setOnPress) setFromPointer(i, e.clientX, e.clientY);
              }}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
            />
          );
        })}
      {categories.map((c, i) => {
        const [x, y] = point(i, scores[c]);
        const isActive = dragIdx === i || hover === i;
        if (hideZeroHandles && (scores[c] ?? 0) <= 0 && dragIdx !== i) return null;
        return (
          <g key={c}>
            <circle
              cx={x}
              cy={y}
              r={isActive ? 11 : 8}
              fill={color}
              stroke="var(--background)"
              strokeWidth={2}
              style={{ pointerEvents: "none", transition: dragIdx === null ? "r 120ms" : "none" }}
            />
          </g>
        );
      })}
      {categories.map((c, i) => {
        // Spokes pointing left or right get their labels anchored just outside the
        // outer ring rather than centred on it, so a long name can't sit on the shape.
        const cos = Math.cos(angle(i));
        const side = cos > 0.2 ? "start" : cos < -0.2 ? "end" : "middle";
        const [x, y] = point(i, side === "middle" ? 11.5 : 10.4);
        const lines = wrapLabel(labels?.[i] ?? c, side === "middle" ? 14 : 12);
        const lineHeight = 13;
        const total = lines.length + (showValues ? 1 : 0);
        const top = y - ((total - 1) * lineHeight) / 2;
        return (
          <text
            key={c + "-label"}
            x={x}
            textAnchor={side}
            dominantBaseline="middle"
            className="fill-foreground"
            fontSize={11}
            fontWeight={600}
          >
            {lines.map((line, li) => (
              <tspan key={li} x={x} y={top + li * lineHeight}>
                {line}
              </tspan>
            ))}
            {showValues && (
              <tspan
                x={x}
                y={top + lines.length * lineHeight}
                className="fill-muted-foreground"
                fontWeight={500}
              >
                {scores[c]}
                {overlay ? ` · ${overlay.scores[c] ?? 0}` : ""}
              </tspan>
            )}
          </text>
        );
      })}
    </svg>
  );
}
