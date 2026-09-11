import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";

const AREAS = [
  "Academic performance",
  "Social life",
  "Physical & mental health",
  "Personal ethics",
  "Organisation",
  "Home environment",
  "Productivity",
  "Finances",
];

type Entry = {
  area: string;
  standard: string;
  realistic: "" | "yes" | "no";
  flexible: "" | "yes" | "no";
  adjusted: string;
};

const blank = (area: string): Entry => ({
  area,
  standard: "",
  realistic: "",
  flexible: "",
  adjusted: "",
});

export default function HighStandards() {
  const [entries, setEntries] = usePersistentState<Entry[]>(
    "high-standards-check-in",
    "entries",
    AREAS.map(blank),
  );

  const update = (i: number, patch: Partial<Entry>) =>
    setEntries((arr) => arr.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

  const needsAdjusting = entries.filter(
    (e) => e.standard && (e.realistic === "no" || e.flexible === "no"),
  );

  return (
    <div className="space-y-8">
      <IntroGrid
        what="Surface the personal standards you hold across life areas, check whether they're realistic and flexible, then adjust the ones that aren't."
        why="Rigid, unrelenting standards turn small setbacks into self-criticism spirals. Adjusting them creates space for compassion, flexibility, and resilience."
        how="For each area, name the standard you hold yourself to. Mark whether it's realistic and flexible. Rewrite the ones that fail either test."
      />

      <div className="space-y-4">
        {entries.map((e, i) => (
          <div key={e.area} className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm">{e.area}</h3>
            <TextArea
              rows={2}
              value={e.standard}
              onChange={(ev) => update(i, { standard: ev.target.value })}
              placeholder="The standard you set yourself here..."
            />
            {e.standard && (
              <>
                <div className="flex flex-wrap gap-4 text-sm">
                  <Toggle
                    label="Realistic for me?"
                    value={e.realistic}
                    onChange={(v) => update(i, { realistic: v })}
                  />
                  <Toggle
                    label="Allows flexibility?"
                    value={e.flexible}
                    onChange={(v) => update(i, { flexible: v })}
                  />
                </div>
                {(e.realistic === "no" || e.flexible === "no") && (
                  <div className="rounded-md border border-ink-orange/30 bg-ink-orange/10 p-3">
                    <label className="text-xs text-ink-orange font-medium">
                      Adjusted standard — more realistic & flexible
                    </label>
                    <TextArea
                      rows={2}
                      value={e.adjusted}
                      onChange={(ev) => update(i, { adjusted: ev.target.value })}
                      className="mt-2"
                      placeholder="Rewrite it so it leaves room for being human."
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {needsAdjusting.length > 0 && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-sm space-y-2">
          <p>
            <strong>{needsAdjusting.length}</strong> standard
            {needsAdjusting.length === 1 ? "" : "s"} to live by differently this week. After a few
            days, reflect: how did it feel? Did anything good happen? Did the feared consequences
            actually occur?
          </p>
        </div>
      )}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: "" | "yes" | "no";
  onChange: (v: "yes" | "no") => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{label}</span>
      <button
        onClick={() => onChange("yes")}
        className={`rounded-md border px-3 py-1 text-xs ${value === "yes" ? "border-primary bg-primary/10" : "border-border"}`}
      >
        Yes
      </button>
      <button
        onClick={() => onChange("no")}
        className={`rounded-md border px-3 py-1 text-xs ${value === "no" ? "border-ink-orange bg-ink-orange/15" : "border-border"}`}
      >
        No
      </button>
    </div>
  );
}
