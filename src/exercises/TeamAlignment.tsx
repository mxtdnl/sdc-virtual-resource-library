import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { GhostButton, InfoCard, IntroGrid, PrimaryButton, TextArea, TextInput } from "./_shared";

type QType = "scale" | "text" | "number";
type Question = {
  key: string;
  prompt: string;
  hint?: string;
  type: QType;
  min?: number;
  max?: number;
  placeholder?: string;
};

const QUESTIONS: Question[] = [
  {
    key: "importance",
    prompt: "On a scale of 1–5, how important is getting an A?",
    type: "scale",
    min: 1,
    max: 5,
  },
  {
    key: "confident",
    prompt: "Which subject area do you feel most confident in?",
    type: "text",
    placeholder: "Most confident in…",
  },
  {
    key: "weakest",
    prompt: "Which do you feel least confident in?",
    type: "text",
    placeholder: "Least confident in…",
  },
  {
    key: "goal",
    prompt: "What is your individual goal for this challenge?",
    hint: "Look for common themes across the team.",
    type: "text",
    placeholder: "My goal is…",
  },
  {
    key: "role",
    prompt: "What role do you want to assume in the team dynamic?",
    type: "text",
    placeholder: "e.g. organiser, ideas person, editor…",
  },
  {
    key: "friends",
    prompt: "Do you need to be friends to work well in a team?",
    hint: "If no — what keeps you working well together? If yes — what does that look like practically?",
    type: "text",
    placeholder: "Your answer…",
  },
  {
    key: "meetings",
    prompt: "How many times a week would you like to meet?",
    type: "number",
    min: 0,
    max: 7,
  },
  {
    key: "submit",
    prompt: "If a deadline is midnight on Friday, when do you want to submit?",
    type: "text",
    placeholder: "e.g. Thursday evening",
  },
];

const SESSION_GOALS = [
  "Introductory alignment",
  "Reflection on strengths",
  "Goal setting",
  "Address conflict / team issues",
  "Identify team roles",
];

const GROUND_RULES = [
  {
    title: "Everyone present",
    body: "Team coaching is a mandatory part of the curriculum — all team members in the room, in person.",
  },
  {
    title: "Participate",
    body: "The more you put into the session, the more you get out of it. 45 minutes, fully engaged.",
  },
  {
    title: "Solution-focused & respectful",
    body: "Approach every discussion looking for a way forward, not for blame.",
  },
];

const CHECKLIST = [
  "We agreed how often we'll meet and where.",
  "We know each other's individual goals.",
  "We've named the roles each person will take.",
  "We agreed a submission time ahead of the deadline.",
  "We agreed how we'll raise problems with each other.",
  "Everyone had airtime in this session.",
];

export default function TeamAlignment() {
  const [step, setStep] = usePersistentState<
    "intro" | "setup" | "round" | "themes" | "closing" | "checklist" | "summary"
  >("team-alignment", "step", "intro");
  const [members, setMembers] = usePersistentState<string[]>("team-alignment", "members", [
    "",
    "",
    "",
    "",
  ]);
  const [goals, setGoals] = usePersistentState<string[]>("team-alignment", "goals", []);
  const [qIdx, setQIdx] = usePersistentState("team-alignment", "qIdx", 0);
  const [answers, setAnswers] = usePersistentState<Record<string, string>>(
    "team-alignment",
    "answers",
    {},
  );
  const [closing, setClosing] = usePersistentState<Record<string, string>>(
    "team-alignment",
    "closing",
    {},
  );
  const [ticked, setTicked] = usePersistentState<string[]>("team-alignment", "ticked", []);

  const names = members.map((m) => m.trim()).filter(Boolean);
  const q = QUESTIONS[qIdx];
  const a = (name: string, key: string) => answers[`${name}::${key}`] ?? "";
  const setA = (name: string, key: string, v: string) =>
    setAnswers((s) => ({ ...s, [`${name}::${key}`]: v }));

  const average = (key: string) => {
    const vals = names.map((n) => Number(a(n, key))).filter((v) => !Number.isNaN(v) && v > 0);
    return vals.length ? (vals.reduce((x, y) => x + y, 0) / vals.length).toFixed(1) : "—";
  };

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A 45-minute team alignment session. You'll agree what today is for, answer the same questions individually, then compare answers as a team."
            why="Teamwork is learned by experience. Navigating dynamics, naming roles, and aligning expectations early is what turns a group into a highly effective team."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Agree the ground rules (2 min).</li>
                <li>Choose the focus of the session (5 min).</li>
                <li>Answer the questions individually (20 min).</li>
                <li>Compare, commit, and check the list (5 min).</li>
              </ol>
            }
          />
          <div className="grid gap-4 md:grid-cols-3">
            {GROUND_RULES.map((r) => (
              <InfoCard key={r.title} title={r.title}>
                {r.body}
              </InfoCard>
            ))}
          </div>
          <PrimaryButton onClick={() => setStep("setup")}>Start the session →</PrimaryButton>
        </section>
      )}

      {step === "setup" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Who's here, and what's today for?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add every team member in the room. Then agree together what this session should give
              you.
            </p>
          </div>

          <div className="space-y-2">
            {members.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-8 h-8 grid place-items-center rounded-full bg-secondary text-sm font-semibold">
                  {i + 1}
                </span>
                <TextInput
                  value={m}
                  onChange={(e) =>
                    setMembers(members.map((x, j) => (j === i ? e.target.value : x)))
                  }
                  placeholder={`Team member ${i + 1}`}
                />
                <button
                  onClick={() =>
                    members.length > 2 && setMembers(members.filter((_, j) => j !== i))
                  }
                  disabled={members.length <= 2}
                  className="text-xs text-muted-foreground hover:text-destructive disabled:opacity-30"
                >
                  Remove
                </button>
              </div>
            ))}
            <GhostButton
              onClick={() => members.length < 10 && setMembers([...members, ""])}
              disabled={members.length >= 10}
            >
              + Add member
            </GhostButton>
          </div>

          <div>
            <p className="text-sm font-medium">As a team, how do we want this session to go?</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {SESSION_GOALS.map((g) => (
                <button
                  key={g}
                  onClick={() =>
                    setGoals((s) => (s.includes(g) ? s.filter((x) => x !== g) : [...s, g]))
                  }
                  className={`rounded-full border px-3 py-1.5 text-sm transition ${goals.includes(g) ? "border-primary bg-primary/10 font-semibold" : "border-border bg-card hover:bg-secondary"}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton
              disabled={names.length < 2}
              onClick={() => {
                setQIdx(0);
                setStep("round");
              }}
            >
              Start the questions →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "round" && (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h2 className="text-2xl font-semibold tracking-tight">Goals &amp; expectations</h2>
            <p className="text-sm text-muted-foreground">
              Question {qIdx + 1} of {QUESTIONS.length}
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((qIdx + 1) / QUESTIONS.length) * 100}%` }}
            />
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{q.prompt}</h3>
              {q.hint && <p className="text-sm text-muted-foreground mt-1">{q.hint}</p>}
            </div>
            {names.map((n) => (
              <div key={n} className="flex flex-col md:flex-row md:items-center gap-3">
                <span className="md:w-40 text-sm font-medium shrink-0">{n}</span>
                {q.type === "scale" ? (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setA(n, q.key, String(v))}
                        className={`w-10 h-10 rounded-lg border text-sm font-semibold transition ${a(n, q.key) === String(v) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                ) : q.type === "number" ? (
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((v) => (
                      <button
                        key={v}
                        onClick={() => setA(n, q.key, String(v))}
                        className={`w-9 h-9 rounded-lg border text-sm font-semibold transition ${a(n, q.key) === String(v) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                ) : (
                  <TextInput
                    value={a(n, q.key)}
                    onChange={(e) => setA(n, q.key, e.target.value)}
                    placeholder={q.placeholder}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-between gap-2">
            <GhostButton onClick={() => (qIdx === 0 ? setStep("setup") : setQIdx(qIdx - 1))}>
              ← {qIdx === 0 ? "Back" : "Previous question"}
            </GhostButton>
            {qIdx < QUESTIONS.length - 1 ? (
              <PrimaryButton onClick={() => setQIdx(qIdx + 1)}>Next question →</PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => setStep("themes")}>Compare answers →</PrimaryButton>
            )}
          </div>
        </section>
      )}

      {step === "themes" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Common themes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Where do you agree? Where's the gap? Talk through anything that surprises you.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Importance of an A
              </p>
              <p className="text-3xl font-semibold mt-1">
                {average("importance")}
                <span className="text-base text-muted-foreground"> / 5 avg</span>
              </p>
              <div className="mt-3 space-y-1 text-sm">
                {names.map((n) => (
                  <div key={n} className="flex justify-between">
                    <span>{n}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {a(n, "importance") || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Meetings per week
              </p>
              <p className="text-3xl font-semibold mt-1">
                {average("meetings")}
                <span className="text-base text-muted-foreground"> avg</span>
              </p>
              <div className="mt-3 space-y-1 text-sm">
                {names.map((n) => (
                  <div key={n} className="flex justify-between">
                    <span>{n}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {a(n, "meetings") || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {QUESTIONS.filter((x) => x.type === "text").map((x) => (
            <div key={x.key} className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                {x.prompt}
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {names.map((n) => (
                  <div key={n} className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs font-semibold">{n}</p>
                    <p className="text-sm mt-0.5">
                      {a(n, x.key) || <span className="text-muted-foreground">—</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("round")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("closing")}>Closing round →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "closing" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Closing round</h2>
            <p className="text-sm text-muted-foreground mt-1">
              One takeaway and one commitment each — say them out loud before writing.
            </p>
          </div>
          {names.map((n) => (
            <div key={n} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <p className="font-semibold">{n}</p>
              <TextArea
                rows={2}
                placeholder="One key takeaway from today…"
                value={closing[n + "::take"] ?? ""}
                onChange={(e) => setClosing({ ...closing, [n + "::take"]: e.target.value })}
              />
              <TextArea
                rows={2}
                placeholder="One commitment to the team from here on…"
                value={closing[n + "::commit"] ?? ""}
                onChange={(e) => setClosing({ ...closing, [n + "::commit"]: e.target.value })}
              />
            </div>
          ))}
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("themes")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("checklist")}>
              Team-working checklist →
            </PrimaryButton>
          </div>
        </section>
      )}

      {step === "checklist" && (
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Rules for team-working</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Tick what's true right now. Anything unticked is your next conversation.
            </p>
          </div>
          <div className="space-y-2">
            {CHECKLIST.map((c) => (
              <label
                key={c}
                className={`flex items-center gap-3 rounded-lg border p-4 text-sm cursor-pointer transition ${ticked.includes(c) ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-secondary"}`}
              >
                <input
                  type="checkbox"
                  checked={ticked.includes(c)}
                  onChange={() =>
                    setTicked((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))
                  }
                  className="accent-[var(--primary)]"
                />
                <span>{c}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("closing")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See session record →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Session record</h2>
          {goals.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Focus of the session
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {goals.map((g) => (
                  <span key={g} className="rounded-full bg-secondary px-3 py-1 text-xs">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            {names.map((n) => (
              <div key={n} className="rounded-lg border border-border bg-card p-4">
                <p className="font-semibold">{n}</p>
                <dl className="mt-2 space-y-1 text-sm">
                  {QUESTIONS.map(
                    (x) =>
                      a(n, x.key) && (
                        <div key={x.key} className="flex gap-2">
                          <dt className="text-muted-foreground shrink-0">
                            {x.key === "importance"
                              ? "A matters"
                              : x.key === "meetings"
                                ? "Meetings/wk"
                                : x.key === "confident"
                                  ? "Confident"
                                  : x.key === "weakest"
                                    ? "Weakest"
                                    : x.key === "goal"
                                      ? "Goal"
                                      : x.key === "role"
                                        ? "Role"
                                        : x.key === "friends"
                                          ? "Friends?"
                                          : "Submit"}
                            :
                          </dt>
                          <dd>{a(n, x.key)}</dd>
                        </div>
                      ),
                  )}
                </dl>
                {(closing[n + "::take"] || closing[n + "::commit"]) && (
                  <div className="mt-3 border-t border-border pt-2 text-sm space-y-1">
                    {closing[n + "::take"] && (
                      <p>
                        <span className="text-muted-foreground">Takeaway: </span>
                        {closing[n + "::take"]}
                      </p>
                    )}
                    {closing[n + "::commit"] && (
                      <p>
                        <span className="text-muted-foreground">Commitment: </span>
                        {closing[n + "::commit"]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Checklist
            </p>
            <ul className="mt-2 text-sm space-y-1">
              {CHECKLIST.map((c) => (
                <li key={c} className={ticked.includes(c) ? "" : "text-muted-foreground"}>
                  {ticked.includes(c) ? "✓" : "○"} {c}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2 flex-wrap">
            <GhostButton onClick={() => setStep("checklist")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
