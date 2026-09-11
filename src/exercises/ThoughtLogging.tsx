import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { IntroGrid, PrimaryButton, TextArea, TextInput } from "./_shared";

type Log = {
  id: string;
  trigger: string;
  thought: string;
  emotionBefore: string;
  evidenceFor: string;
  evidenceAgainst: string;
  challenge: string;
  emotionAfter: string;
  pattern: string;
};

const empty = (): Log => ({
  id: crypto.randomUUID(),
  trigger: "",
  thought: "",
  emotionBefore: "",
  evidenceFor: "",
  evidenceAgainst: "",
  challenge: "",
  emotionAfter: "",
  pattern: "",
});

export default function ThoughtLogging() {
  const [step, setStep] = usePersistentState<"intro" | "logs">("thought-logging", "step", "intro");
  const [logs, setLogs] = usePersistentState<Log[]>("thought-logging", "logs", [empty()]);
  // Persisted so a student returning mid-log lands back inside the entry they
  // were writing, rather than on a collapsed list.
  const [openId, setOpenId] = usePersistentState<string | null>("thought-logging", "openId", null);

  const update = (id: string, patch: Partial<Log>) =>
    setLogs((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const remove = (id: string) => setLogs((ls) => ls.filter((l) => l.id !== id));
  const add = () => {
    const l = empty();
    setLogs((ls) => [...ls, l]);
    setOpenId(l.id);
  };

  if (step === "intro") {
    return (
      <div className="space-y-6">
        <IntroGrid
          what="An ongoing tool for tracking and challenging unhelpful thoughts that contribute to stress or anxiety."
          why="Thoughts feel like facts. Externalising them and weighing the evidence builds self-awareness and clearer thinking."
          how={
            <ol className="list-decimal pl-4 space-y-1.5">
              <li>Note a trigger and the automatic thought.</li>
              <li>Rate the emotion, weigh the evidence.</li>
              <li>Reframe and re-rate.</li>
            </ol>
          }
        />
        <PrimaryButton
          onClick={() => {
            setStep("logs");
            setOpenId(logs[0].id);
          }}
        >
          Start a log →
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">Thought logs ({logs.length})</h2>
        <button
          onClick={add}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-secondary"
        >
          + New log
        </button>
      </div>
      <div className="space-y-3">
        {logs.map((log, i) => (
          <div key={log.id} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setOpenId(openId === log.id ? null : log.id)}
              className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-secondary/30"
            >
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Log {i + 1}</p>
                <p className="text-sm font-medium truncate">{log.trigger || "Untitled trigger…"}</p>
              </div>
              <div className="flex items-center gap-3">
                {logs.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(log.id);
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                  >
                    Remove
                  </span>
                )}
                <span className="text-muted-foreground text-sm">
                  {openId === log.id ? "−" : "+"}
                </span>
              </div>
            </button>
            {openId === log.id && (
              <div className="border-t border-border p-5 space-y-4">
                <LogField label="1. Identify a trigger" hint="What happened? Keep it factual.">
                  <TextArea
                    rows={2}
                    value={log.trigger}
                    onChange={(e) => update(log.id, { trigger: e.target.value })}
                  />
                </LogField>
                <LogField label="2. Record the thought" hint="The automatic thought that came up.">
                  <TextArea
                    rows={2}
                    value={log.thought}
                    onChange={(e) => update(log.id, { thought: e.target.value })}
                  />
                </LogField>
                <LogField
                  label="3. Note the emotion"
                  hint="Name it and rate intensity, e.g. Anxiety (8/10)."
                >
                  <TextInput
                    value={log.emotionBefore}
                    onChange={(e) => update(log.id, { emotionBefore: e.target.value })}
                    placeholder="Anxiety (8/10), Shame (6/10)"
                  />
                </LogField>
                <div className="grid gap-3 md:grid-cols-2">
                  <LogField label="4a. Evidence FOR the thought">
                    <TextArea
                      rows={4}
                      value={log.evidenceFor}
                      onChange={(e) => update(log.id, { evidenceFor: e.target.value })}
                    />
                  </LogField>
                  <LogField label="4b. Evidence AGAINST">
                    <TextArea
                      rows={4}
                      value={log.evidenceAgainst}
                      onChange={(e) => update(log.id, { evidenceAgainst: e.target.value })}
                    />
                  </LogField>
                </div>
                <LogField
                  label="5. Challenge / reframe the thought"
                  hint="A more balanced, realistic version."
                >
                  <TextArea
                    rows={3}
                    value={log.challenge}
                    onChange={(e) => update(log.id, { challenge: e.target.value })}
                  />
                </LogField>
                <LogField label="6. Re-rate the emotion">
                  <TextInput
                    value={log.emotionAfter}
                    onChange={(e) => update(log.id, { emotionAfter: e.target.value })}
                    placeholder="Anxiety (5/10), Shame (2/10)"
                  />
                </LogField>
                <LogField
                  label="7. Pattern reflection"
                  hint="What triggers/thoughts keep coming up across your logs?"
                >
                  <TextArea
                    rows={3}
                    value={log.pattern}
                    onChange={(e) => update(log.id, { pattern: e.target.value })}
                  />
                </LogField>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStep("intro")}
          className="rounded-md border border-border bg-card px-4 py-2 text-sm hover:bg-secondary"
        >
          ← Intro
        </button>
        <button
          onClick={() => window.print()}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
        >
          Print / Save PDF
        </button>
      </div>
    </div>
  );
}

function LogField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}
