import { useMemo, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";

const SCENARIOS = [
  "Teaching a group of beginners something you're passionate about",
  "Explaining a topic to a curious child",
  "Having a dramatic 'aha' in a pivotal movie scene",
  "Doing a TikTok video",
  "Pitching an idea to a supportive mentor",
  "Sharing exciting news with a best friend",
  "Talking about an exciting sports match",
  "Hosting a casual podcast discussion",
  "Trying to impress someone you're on a date with",
  "Leading a brainstorming session with your team",
  "Motivating a team as a coach",
  "Narrating an adventure to an eager audience",
  "Calming someone's nerves with practical advice",
  "Leading a book club discussion",
  "Unveiling a new product to an excited crowd",
  "Telling friends about an amazing first date",
  "Reciting a bedtime story to a child",
  "Introducing a famous speaker at an event",
  "Defending your favourite film in a debate",
  "Showing friends around your new house",
  "Answering interview questions for a dream job",
  "Narrating a nature documentary",
  "Explaining a historical event to time travellers",
  "Guiding a tour in your favourite museum",
  "Hosting a talk show and interviewing a celebrity",
  "Rallying a crowd at a protest",
  "Delivering an urgent weather report",
  "Comforting a friend with uplifting words",
  "Rehearsing a stand-up comedy routine",
  "Speeding through it before going on holiday",
];

export default function AsIfExercise() {
  const [text, setText] = usePersistentState("as-if-exercise", "text", "");
  const [tried, setTried] = usePersistentState<string[]>("as-if-exercise", "tried", []);
  const [current, setCurrent] = usePersistentState<string | null>(
    "as-if-exercise",
    "current",
    null,
  );
  const [note, setNote] = usePersistentState("as-if-exercise", "note", "");

  const pool = useMemo(() => SCENARIOS.filter((s) => !tried.includes(s)), [tried]);

  const pick = () => {
    if (pool.length === 0) return;
    const next = pool[Math.floor(Math.random() * pool.length)];
    setCurrent(next);
  };

  const commit = () => {
    if (current && !tried.includes(current)) setTried((t) => [...t, current]);
    setCurrent(null);
    setNote("");
  };

  return (
    <div className="space-y-8">
      <IntroGrid
        what="A Stanislavski-inspired theatre technique: deliver your text 'as if' you were in a completely different scenario — without changing a word."
        why="Grounding a speech in a familiar emotional context brings naturalness, energy, and reduces anxiety on the day."
        how="Paste your text, draw a scenario, deliver it out loud in that mode, then notice what shifted. Try a few contrasting ones."
      />

      <Field label="Your text" hint="A few sentences from your speech or presentation.">
        <TextArea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste an excerpt you want to rehearse."
        />
      </Field>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Scenario draw</h3>
          <span className="text-xs text-muted-foreground">
            {tried.length} tried · {pool.length} left
          </span>
        </div>

        {current ? (
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-5 space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Deliver your text as if you're...
            </p>
            <p className="text-lg font-medium">{current}</p>
            <TextArea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What shifted? Tone, pace, body, emotion..."
            />
            <div className="flex gap-2">
              <PrimaryButton onClick={commit}>Done — try another</PrimaryButton>
              <GhostButton onClick={pick}>Skip</GhostButton>
            </div>
          </div>
        ) : (
          <PrimaryButton onClick={pick} disabled={pool.length === 0}>
            {tried.length === 0 ? "Draw a scenario" : "Draw another"}
          </PrimaryButton>
        )}

        {tried.length > 0 && (
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Tried</h4>
            <ul className="text-sm space-y-1">
              {tried.map((t) => (
                <li key={t}>✓ {t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
