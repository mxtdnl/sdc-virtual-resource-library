import { useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Field, GhostButton, IntroGrid, PrimaryButton, TextArea } from "./_shared";

const CATEGORIES = [
  { name: "Citizenship", levels: ["Undocumented", "Documented", "Citizen"] },
  { name: "Skin colour", levels: ["Dark", "Different shades", "White"] },
  { name: "Formal education", levels: ["Elementary", "High school", "Post-secondary"] },
  { name: "Ability", levels: ["Significant disability", "Some disability", "Able-bodied"] },
  { name: "Sexuality", levels: ["Lesbian, bi, pan, asexual", "Gay men", "Heterosexual"] },
  {
    name: "Neurodiversity",
    levels: ["Significant neurodivergence", "Neuro-atypical", "Neuro-typical"],
  },
  { name: "Mental health", levels: ["Vulnerable", "Mostly stable", "Robust"] },
  { name: "Body size", levels: ["Large", "Average", "Slim"] },
  { name: "Housing", levels: ["Homeless", "Sheltered / renting", "Owns property"] },
  { name: "Wealth", levels: ["Poor", "Middle class", "Rich"] },
  { name: "Language", levels: ["Non-English monolingual", "Learned English", "English"] },
  { name: "Gender", levels: ["Trans, intersex, non-binary", "Cisgender woman", "Cisgender man"] },
] as const;

const REFLECTIONS = [
  { key: "first", label: "Which aspects of your identity came to mind first? Why?" },
  { key: "daily", label: "How do you notice privilege or power showing up in your daily life?" },
  {
    key: "impact",
    label:
      "How might your social position affect the kind of impact you can make in different spaces?",
  },
  { key: "use", label: "Where could you use your privilege to create space for others?" },
] as const;

export default function WheelOfPower() {
  const [step, setStep] = usePersistentState<"intro" | "map" | "reflect" | "summary">(
    "wheel-of-power-and-privilege",
    "step",
    "intro",
  );
  const [positions, setPositions] = usePersistentState<Record<string, number | null>>(
    "wheel-of-power-and-privilege",
    "positions",
    {},
  );
  const [notes, setNotes] = usePersistentState<Record<string, string>>(
    "wheel-of-power-and-privilege",
    "notes",
    {},
  );

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <section className="space-y-6">
          <IntroGrid
            what="A reflection on how different parts of your identity carry different degrees of privilege or disadvantage."
            why="Privilege is rarely about blame — it's about awareness. Seeing it helps you navigate diverse spaces and support others responsibly."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>
                  For each identity dimension, place yourself in the inner, middle, or outer ring.
                </li>
                <li>Reflect on what you notice.</li>
                <li>Consider where you can amplify others.</li>
              </ol>
            }
          />
          <p className="text-xs text-muted-foreground">
            Remember: agency matters. You're not a saviour — start by listening.
          </p>
          <PrimaryButton onClick={() => setStep("map")}>Begin →</PrimaryButton>
        </section>
      )}

      {step === "map" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Place yourself</h2>
          <p className="text-sm text-muted-foreground">
            Inner = closer to societal privilege. Outer = closer to marginalization. Context matters
            — answer as honestly as feels true to you.
          </p>
          <div className="space-y-3">
            {CATEGORIES.map((c) => (
              <div key={c.name} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold">{c.name}</p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {c.levels.map((l, i) => {
                    const ringIdx = 2 - i; // 0 = inner privilege; we want index 2 (last) = inner
                    const active = positions[c.name] === ringIdx;
                    const labels = ["Outer · marginalized", "Middle", "Inner · privilege"];
                    return (
                      <button
                        key={l}
                        onClick={() => setPositions({ ...positions, [c.name]: ringIdx })}
                        className={`rounded-lg border px-3 py-2 text-left text-xs transition ${active ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-secondary"}`}
                      >
                        <p className="font-semibold">{l}</p>
                        <p
                          className={`mt-0.5 text-[10px] uppercase tracking-wider ${active ? "opacity-80" : "text-muted-foreground"}`}
                        >
                          {labels[ringIdx]}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <GhostButton onClick={() => setStep("intro")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("reflect")}>Reflect →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "reflect" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Reflect</h2>
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
            <GhostButton onClick={() => setStep("map")}>← Back</GhostButton>
            <PrimaryButton onClick={() => setStep("summary")}>See summary →</PrimaryButton>
          </div>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold tracking-tight">Your map</h2>
          <div className="rounded-xl border border-border bg-card p-4">
            <table className="w-full text-sm">
              <tbody>
                {CATEGORIES.map((c) => {
                  const pos = positions[c.name];
                  const label = pos == null ? "—" : c.levels[2 - pos];
                  return (
                    <tr key={c.name} className="border-b border-border last:border-0">
                      <td className="py-2 font-medium">{c.name}</td>
                      <td className="py-2 text-muted-foreground">{label}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
            <GhostButton onClick={() => setStep("reflect")}>← Back</GhostButton>
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
          </div>
        </section>
      )}
    </div>
  );
}
