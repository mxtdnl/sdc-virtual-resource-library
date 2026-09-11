import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Link } from "@tanstack/react-router";
import { Field, IntroGrid, TextArea } from "./_shared";

const AFFIRMATIONS = [
  "My achievements don't define my worth",
  "Most people are not as hard on me as I am on myself",
  "My health is more important than perfection",
  "Excellence and perfection are two different things",
  "I do not need to control everything",
  "I am confident in my abilities",
  "'Good enough' is still good",
];

const BUSTERS = [
  {
    title: "Sorting Tasks",
    body: "Sort tasks into 'must be 100% perfect', '90%', and '80%'. Notice how your mindset shifts when you allow some to be 80%.",
  },
  {
    title: "Let It Go!",
    body: "When you spot a mistake, try saying 'oh well!' instead of holding the anxiety. A radically different thought opens a new perspective.",
  },
  {
    title: "Logging Experiences",
    body: "When something goes wrong, note what you learned. Build a record — errors drive learning.",
  },
  {
    title: "The 'Let Them' Mindset",
    body: "When stuck trying to control others' perceptions, say 'let them'. You'll never control their opinions; this saves energy.",
  },
  {
    title: "Learning from Others",
    body: "Rank people you admire 0–100 on how 'perfect' they are. Why do you demand 100% from yourself but not from them?",
  },
  {
    title: "Emotional Check-In",
    body: "Ask: what am I feeling, what triggered it, what was I thinking? What could I do instead to cope with this emotion?",
  },
  {
    title: "Sitting with Negative Emotions",
    body: "Set a 2-minute timer and just let the feelings exist without acting. They are feelings, not necessarily a call to action.",
  },
  {
    title: "A New Bad Hobby",
    body: "Deliberately try something you know you'll be terrible at. What does it feel like to be the opposite of perfect?",
  },
  {
    title: "Converse with your Worries",
    body: "Complete: 'If I lower my standards then...'. Then what? Is the price you pay for striving too high?",
  },
];

const LINKED = [
  { slug: "rules-and-assumptions-check", label: "Rules and Assumptions Check" },
  { slug: "high-standards-check-in", label: "High Standards Check-In" },
  { slug: "challenging-rules-and-assumptions", label: "Challenging Rules and Assumptions" },
  { slug: "thought-logging", label: "Thought Log" },
  { slug: "self-compassion", label: "Self Compassion" },
  { slug: "chimp-brain", label: "The Chimp Mind Model" },
];

export default function PerfectionismInfo() {
  const [a, setA] = usePersistentState("perfectionism-hub", "a", "");
  const [b, setB] = usePersistentState("perfectionism-hub", "b", "");
  const [c, setC] = usePersistentState("perfectionism-hub", "c", "");
  const [d, setD] = usePersistentState("perfectionism-hub", "d", "");

  return (
    <div className="space-y-10">
      <IntroGrid
        what="Perfectionism is demanding flawlessness in excess of what's required. It can motivate — or trap us in procrastination, self-criticism, and avoidance."
        why="At its root, perfectionism tries to control others' perceptions of us. Hiding flaws feels safer than risking criticism — but blocks growth."
        how="Use this hub to understand your perfectionism, link to deeper exercises, and try the perfectionism busters and affirmation script."
      />

      <section className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h2 className="font-semibold">Three flavours of perfectionism</h2>
        <ul className="text-sm space-y-2">
          <li>
            <strong>Self-oriented</strong> — unrealistic expectations on yourself.
          </li>
          <li>
            <strong>Other-oriented</strong> — unrealistic expectations on others.
          </li>
          <li>
            <strong>Socially prescribed</strong> — perceiving unrealistic expectations from others.
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Deeper exercises</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {LINKED.map((l) => (
            <Link
              key={l.slug}
              to="/exercise/$slug"
              params={{ slug: l.slug }}
              className="rounded-md border border-border p-3 text-sm hover:bg-secondary"
            >
              → {l.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold">Perfectionism busters</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {BUSTERS.map((b) => (
            <div key={b.title} className="rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold">{b.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h2 className="font-semibold">Affirmations</h2>
        <p className="text-xs text-muted-foreground">
          Say them aloud or write them out. Repetition rewires the inner script.
        </p>
        <ul className="grid md:grid-cols-2 gap-2 text-sm">
          {AFFIRMATIONS.map((x) => (
            <li key={x} className="rounded-md border border-border bg-background/40 p-2">
              {x}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-primary/30 bg-primary/5 p-6 space-y-4">
        <h2 className="font-semibold">The Perfectionism Script</h2>
        <p className="text-sm text-muted-foreground">
          Fill in the blanks so this script is yours. Keep it on your phone for moments of
          perfectionism anxiety.
        </p>
        <p className="text-sm leading-relaxed">
          It's understandable that I am anxious because I have an old script running in my mind that
          says I am not really as good as others, or not up to scratch, and so I feel I have to
          strive all the time. This script has been running all my life because{" "}
          <InlineFill value={a} onChange={setA} placeholder="why has it been running?" />.
        </p>
        <p className="text-sm leading-relaxed">
          Actually what I need to remind myself is that I have achieved a great deal and that what
          other people say about me is{" "}
          <InlineFill value={b} onChange={setB} placeholder="what do they actually say?" />.
        </p>
        <p className="text-sm leading-relaxed">
          The reason I feel anxious is because I am running an old script, and I need to see it as
          such. It hasn't been updated with recent and important information such as{" "}
          <InlineFill value={c} onChange={setC} placeholder="recent evidence" />. I will continue to
          remind myself that <InlineFill value={d} onChange={setD} placeholder="the new truth" />.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="font-semibold">Reflection</h2>
        <Field label="What problems does perfectionism cause for you?">
          <TextArea rows={2} />
        </Field>
        <Field label="What do you think your perfectionism is trying to protect you from?">
          <TextArea rows={2} />
        </Field>
        <Field label="How will your life be better if you can be less perfectionistic?">
          <TextArea rows={2} />
        </Field>
      </section>
    </div>
  );
}

function InlineFill({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="inline-block min-w-[12ch] rounded border-b border-primary/60 bg-transparent px-1 text-sm focus:outline-none focus:border-primary"
      style={{ width: `${Math.max(value.length + 2, 14)}ch` }}
    />
  );
}
