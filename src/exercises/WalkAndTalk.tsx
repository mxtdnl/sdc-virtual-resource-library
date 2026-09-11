import { useMemo, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, IntroGrid, TextArea } from "./_shared";

const LEGEND = [
  { mark: ".", action: "Pause, breathe, change direction", color: "bg-primary/15 text-primary" },
  { mark: ",", action: "Brief pause, breathe", color: "bg-ink-brown-soft text-ink-brown" },
  { mark: "—", action: "Swipe your arm", color: "bg-ink-orange-soft text-ink-orange" },
  { mark: "?", action: "Clap your hands", color: "bg-ink-ochre-soft text-ink-ochre" },
  { mark: "!", action: "Jump in place", color: "bg-ink-red-soft text-ink-red" },
  { mark: ":", action: "Snap your fingers", color: "bg-ink-purple-soft text-ink-purple" },
];

const STYLE: Record<string, string> = {
  ".": "bg-primary/20 text-primary",
  ",": "bg-ink-brown-soft text-ink-brown",
  "—": "bg-ink-orange-soft text-ink-orange",
  "-": "bg-ink-orange-soft text-ink-orange",
  "?": "bg-ink-ochre-soft text-ink-ochre",
  "!": "bg-ink-red-soft text-ink-red",
  ":": "bg-ink-purple-soft text-ink-purple",
};

export default function WalkAndTalk() {
  const [text, setText] = usePersistentState("walk-and-talk", "text", "");

  const highlighted = useMemo(() => {
    const parts = text.split(/([.,?!:—-])/g);
    return parts.map((p, i) => {
      const cls = STYLE[p];
      if (cls)
        return (
          <span key={i} className={`rounded px-1 mx-0.5 font-bold ${cls}`}>
            {p}
          </span>
        );
      return <span key={i}>{p}</span>;
    });
  }, [text]);

  return (
    <div className="space-y-8">
      <IntroGrid
        what="A movement-based rehearsal: walk forward as you speak, change direction at every full stop, and add a small action for each other punctuation mark."
        why="Movement engages body and mind together. You'll build clearer articulation, awareness of punctuation, and pacing — and remember the text more deeply."
        how="Paste your text, learn the legend, then deliver it aloud while moving. Afterwards, deliver it again standing still and notice the difference."
      />

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold mb-3">Movement legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {LEGEND.map((l) => (
            <div
              key={l.mark}
              className="flex items-center gap-2 rounded-md border border-border p-2"
            >
              <span
                className={`inline-flex w-7 h-7 items-center justify-center rounded font-bold ${l.color}`}
              >
                {l.mark}
              </span>
              <span className="text-xs">{l.action}</span>
            </div>
          ))}
        </div>
      </div>

      <Field label="Your text" hint="Punctuation will be highlighted so you can see where to move.">
        <TextArea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste a paragraph from your speech or presentation."
        />
      </Field>

      {text && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-sm font-semibold mb-3">Highlighted text</h3>
          <p className="text-base leading-relaxed whitespace-pre-wrap">{highlighted}</p>
          <p className="text-xs text-muted-foreground mt-4">
            If you run out of breath in a long sentence, that's the text telling you to add a comma
            — or simplify.
          </p>
        </div>
      )}
    </div>
  );
}
