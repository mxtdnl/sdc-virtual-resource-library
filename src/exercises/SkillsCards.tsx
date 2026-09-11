import { useMemo, useState } from "react";
import { usePersistentState } from "@/lib/exercise-storage";
import { Link } from "@tanstack/react-router";
import { IntroGrid, PrimaryButton, GhostButton, TextArea } from "./_shared";

type Card = {
  id: string;
  title: string;
  blurb: string;
  hue: number;
  levels: [string, string, string];
  questions: string[];
  activities: { name: string; note?: string; slug?: string }[];
};

const CARDS: Card[] = [
  {
    id: "communication",
    title: "Communication",
    blurb: "Sharing your thoughts clearly, whether you are talking or writing.",
    hue: 18,
    levels: [
      "Hard to understand, not really thinking about who you are communicating with.",
      "Communicate clearly and adjust tone depending on who you're talking to.",
      "Can clearly articulate your ideas, engage with people as needed, and handle tricky conversations with ease.",
    ],
    questions: [
      "In your opinion, who is a really great communicator? Why?",
      "What communication skills have you been wanting to learn, but have been unsure how to approach?",
      "Tell me about a time you know you were a good communicator. How about a time when you communicated poorly?",
    ],
    activities: [
      {
        name: "Coaching Question Cards",
        note: "Talk through big concepts, explaining them so your ideas land fully.",
      },
      {
        name: "'As If' Acting Exercise",
        note: "How do you change your speaking style depending on context?",
        slug: "as-if-exercise",
      },
      {
        name: "Objectives and Actions",
        note: "Identify what you want from communicating, then craft the message.",
        slug: "actioning-and-objectives",
      },
    ],
  },
  {
    id: "critical-thinking",
    title: "Critical Thinking",
    blurb: "Thinking things through, asking questions, and forming your own opinion.",
    hue: 315,
    levels: [
      "Accepts everything without questioning; logic is unclear and all over the place.",
      "Can weigh pros and cons, checks facts, and builds solid arguments when needed.",
      "Spots hidden flaws, sees through complexity, and thinks outside the box.",
    ],
    questions: [
      "Tell me about how you would go about making a big decision.",
      "How do you know an idea is 'true' for you?",
      "How do you make sense of differing opinions when there isn't a clear answer?",
      "How open are you to changing your long-held beliefs? What would it take?",
    ],
    activities: [
      {
        name: "Socratic Questioning",
        note: "Clarify thoughts, probe the idea, challenge assumptions, follow implications, identify viewpoints, question the question.",
      },
      {
        name: "Decision Grid",
        note: "Evaluate your options when making big or difficult decisions.",
        slug: "decision-grid",
      },
    ],
  },
  {
    id: "collaboration",
    title: "Collaboration",
    blurb: "Working well with others: sharing ideas, listening, and sometimes taking the lead.",
    hue: 45,
    levels: [
      "Struggles to work in a group, or accept ideas that aren't your own. Not sure what you contribute.",
      "Can listen, share, and know when to lead or follow. Confident in what you offer a group.",
      "Brings people together, values different opinions, and very assured in what you offer any group.",
    ],
    questions: [
      "How would you describe yourself in a team?",
      "Tell me about a really good / really bad team experience.",
      "What makes a good team environment? How do you make that happen?",
      "What role would you want to challenge yourself to try?",
    ],
    activities: [
      {
        name: "Shared Identity Activity",
        note: "Find commonalities with peers to build connection and trust.",
      },
      {
        name: "BEAR Feedback Model",
        note: "Support change that is respectful, clear, and actionable.",
        slug: "bear-feedback-model",
      },
      {
        name: "'Yes And' Improv Exercise",
        note: "What changes when someone builds on your idea instead of blocking it?",
      },
    ],
  },
  {
    id: "creative-thinking",
    title: "Creative Thinking",
    blurb: "Coming up with new ideas, and the ability to problem solve.",
    hue: 300,
    levels: [
      "Sticks to what's familiar, doesn't explore options, has no process for solving problems.",
      "Thinks creatively, can test ideas and learn from trial and error. Some confidence in solving problems.",
      "Has a clear process for thinking up new ideas, openly challenges problems, and fuels creativity in others.",
    ],
    questions: [
      "What does creativity mean to you? How does it differ from artistic thought?",
      "What kind of problems get you curious?",
      "What kind of problems or situations make you feel blocked?",
    ],
    activities: [
      {
        name: "Idea Generation Quickfire",
        note: "Make sense of a ridiculous concept and generate new ideas fast.",
        slug: "idea-generation-quickfire",
      },
      {
        name: "5-D Design Cycle",
        note: "A multi-step model for thinking through problems and designing solutions.",
      },
      {
        name: "6 Thinking Hats",
        note: "Look at a topic from six distinct perspectives.",
        slug: "six-thinking-hats",
      },
    ],
  },
  {
    id: "learning-to-learn",
    title: "Learning to Learn",
    blurb: "Being in charge of your own growth, development, and learning.",
    hue: 68,
    levels: [
      "Does not reflect much (or at all); learning is sporadic and unorganised, or waiting for direction from others.",
      "Follows a plan for learning, takes feedback, and adjusts along the way. Keeps an eye out for new methods.",
      "Knows what works to learn effectively, tries new methods and can help others learn too.",
    ],
    questions: [
      "How do you go about learning something new?",
      "In regard to learning, when are you at your best? At your worst?",
      "What sort of topics come naturally to you? What do you struggle with?",
      "If you had all the time in the world and no restrictions, what would you spend time learning?",
    ],
    activities: [
      {
        name: "Metacognition Learning Reflection",
        note: "Do another activity, then reflect on your learning process using Kolb's Learning Cycle.",
      },
    ],
  },
  {
    id: "life-skills",
    title: "Life Skills",
    blurb: "Managing everyday life — your time, energy, and well-being.",
    hue: 30,
    levels: [
      "Often stressed or disorganised, struggles with the basics.",
      "Can stay on top of things, keeps routines, and can manage stress.",
      "Easily able to balance life, with clear time management and strong self-management.",
    ],
    questions: [
      "What do your routines look like?",
      "Where do you feel confident, and where do you think you could improve things?",
      "What or who has influenced how you live your day-to-day life?",
      "If you woke up tomorrow and everything in your life was solved, what would be different?",
    ],
    activities: [
      { name: "Prioritization Matrix", slug: "prioritization-matrix" },
      { name: "Enhanced To-Do List", slug: "enhanced-to-do-list" },
      { name: "Project Breakdown", slug: "project-breakdown" },
      { name: "SMART Goals", slug: "smart-goals" },
      { name: "Wheel of Life", slug: "wheel-of-life" },
      { name: "Self-Care Wheel", slug: "self-care-wheel" },
    ],
  },
  {
    id: "self-awareness",
    title: "Self-Awareness",
    blurb: "Knowing your strengths, triggers, and how you affect others.",
    hue: 345,
    levels: [
      "Does not do any reflection; reacts emotionally without thinking. No idea of strengths or how to use them.",
      "Can identify some strengths and how they present themselves. Takes feedback well and can adjust behaviour.",
      "Understands self deeply and uses strengths to your advantage; good emotional intelligence and relates well.",
    ],
    questions: [
      "How would you describe yourself?",
      "What would you say are your strengths? What do you need to develop more or dial up?",
      "How do others experience you? How do you know?",
      "What qualities do you most admire about yourself?",
    ],
    activities: [
      {
        name: "VIA Character Strengths",
        note: "Identify your most-used strengths, and figure out how to dial up others.",
      },
      {
        name: "The Table of Truth",
        note: "What unhelpful beliefs do you hold about yourself? How do they hold up to evidence?",
        slug: "rules-and-assumptions-check",
      },
      {
        name: "Self-Awareness Jenga",
        note: "Build a Jenga tower while answering self-awareness coaching questions.",
      },
      { name: "Circle of Control", slug: "circles-of-control" },
    ],
  },
  {
    id: "identity-meaning",
    title: "Identity & Meaning",
    blurb: "Knowing what matters to you and making choices that reflect who you are.",
    hue: 285,
    levels: [
      "Unsure of values or direction: easily influenced by others' opinions.",
      "Has a sense of purpose and values, and tries to make choices that align with it.",
      "Can clearly articulate your chosen meaning and purpose; a sense of authenticity in identity.",
    ],
    questions: [
      "What are your top values that you live by? What has influenced these?",
      "When do you feel most like yourself? Least like yourself?",
      "If you could do anything, regardless of money or time, what would you do?",
      "What is the meaning of life to you? Is meaning discovered or created?",
    ],
    activities: [
      { name: "Directional Values Exercise", slug: "core-values" },
      {
        name: "Ikigai",
        note: "Reflect on your passions, skills, and motivations.",
        slug: "ikigai",
      },
      { name: "Meeting Your Future Self", slug: "future-self" },
    ],
  },
  {
    id: "global-mindset",
    title: "Global Mindset",
    blurb: "Being open to different cultures, views, and people.",
    hue: 58,
    levels: [
      "Sticks to what's familiar; may miss, ignore, or openly dismiss differences.",
      "Welcomes other perspectives; can adjust to different cultural settings as needed.",
      "Builds bridges across cultures and creates an inclusive working environment.",
    ],
    questions: [
      "What cultures or perspectives have shaped your thinking?",
      "Tell me about a time you've learned something from someone different than you.",
      "Is there a culture or perspective that you want to learn more about?",
      "Is it better to be firmly grounded in one culture, or to embody aspects of many?",
    ],
    activities: [
      {
        name: "Create a Growth Plan",
        note: "Four components: engaging with new cultural experience; curiosity over judgement; self-awareness and adaptation; building respect for other ways of thinking.",
      },
    ],
  },
  {
    id: "ethical-mindset",
    title: "Ethical Mindset",
    blurb: "Doing the right thing — even when it's hard.",
    hue: 10,
    levels: [
      "Does not consider the impact of choices at all. No personal code of ethics.",
      "Follows rules, speaks up when needed, and acts fairly. Can articulate ethical dilemmas.",
      "Thinks ahead about what's right and leads with integrity. Confident standing by your choices.",
    ],
    questions: [
      "What does 'right' mean to you? How do you know this is true?",
      "How do you view people with strongly contrasting views?",
      "Is there anything in particular that guides your life and your choices?",
      "Where do you notice you have more privilege than others? How about less?",
    ],
    activities: [
      { name: "Core Values Exercise", slug: "core-values" },
      { name: "Wheel of Privilege and Power", slug: "wheel-of-power-and-privilege" },
      { name: "Ethical Dilemmas", slug: "ethical-dilemmas" },
    ],
  },
  {
    id: "growth-mindset",
    title: "Growth Mindset",
    blurb: "Believing that you can grow through effort, even in the face of failure.",
    hue: 38,
    levels: [
      "Avoids challenges and takes failure personally. Fully in a fixed mindset.",
      "Tries new things, makes mistakes and keeps going. Able to identify areas of growth.",
      "Sees every failure as a lesson and models this process. Challenges yourself past the comfort zone.",
    ],
    questions: [
      "How have you changed over time?",
      "Tell me about a time you've failed. What is your view of failure?",
      "What challenge are you currently avoiding? Why?",
      "In your view, how does change happen? Gradually? Event-based?",
    ],
    activities: [
      {
        name: "BRIDGES reflection",
        note: "Bravery, Resourcefulness, Integrity, Discovery, Grit, Emotional Intelligence, Self-Discipline.",
      },
    ],
  },
  {
    id: "entrepreneurial-mindset",
    title: "Entrepreneurial Mindset",
    blurb: "Taking initiative and turning ideas into action.",
    hue: 325,
    levels: [
      "Focuses on problems and complains. Does not take action.",
      "Recognises problems as they occur and solves them.",
      "Proactively spots problems and works towards building solutions.",
    ],
    questions: [
      "What problems are you most curious to solve?",
      "What is your biggest complaint at the moment? What have you done to work on it?",
      "If you could do anything, what would you want to do right now?",
      "Tell me about a time you took initiative. What are you stopping yourself from doing right now?",
    ],
    activities: [
      {
        name: "Mini-Case Studies",
        note: "A team not working well; an unclear high-stakes assignment; someone often late due to travel; a person frequently tired for unknown reasons. What is your first instinct? What actions should they take?",
      },
    ],
  },
];

type Step = "intro" | "spread" | "strengths" | "develop" | "focus" | "work" | "summary";
const STEPS: Step[] = ["intro", "spread", "strengths", "develop", "focus", "work", "summary"];

/*
 * Cards keep their own hue so the twelve stay distinguishable, but the hues
 * are drawn from the house range (deep red through orange and ochre to
 * purple) and desaturated so a spread of them reads as one warm deck. They
 * stay light in both themes — these are printed cards on a table.
 */
function cardStyle(hue: number) {
  return {
    background: `linear-gradient(150deg, hsl(${hue} 45% 95%), hsl(${hue} 38% 86%))`,
    borderColor: `hsl(${hue} 32% 70%)`,
  } as React.CSSProperties;
}

/** Ink for text sitting on a card: the card's own hue, taken almost to brown. */
function cardInk(hue: number) {
  return `hsl(${hue} 50% 24%)`;
}

export default function SkillsCards() {
  const [step, setStep] = usePersistentState<Step>("skills-and-mindset-cards", "step", "intro");
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [top, setTop] = usePersistentState<string[]>("skills-and-mindset-cards", "top", []);
  const [low, setLow] = usePersistentState<string[]>("skills-and-mindset-cards", "low", []);
  const [why, setWhy] = usePersistentState<Record<string, string>>(
    "skills-and-mindset-cards",
    "why",
    {},
  );
  const [focus, setFocus] = usePersistentState<string | null>(
    "skills-and-mindset-cards",
    "focus",
    null,
  );
  const [answers, setAnswers] = usePersistentState<Record<string, string>>(
    "skills-and-mindset-cards",
    "answers",
    {},
  );
  const [plan, setPlan] = usePersistentState("skills-and-mindset-cards", "plan", "");
  const [bridge, setBridge] = usePersistentState<Record<string, string>>(
    "skills-and-mindset-cards",
    "bridge",
    {},
  );

  const byId = useMemo(() => Object.fromEntries(CARDS.map((c) => [c.id, c])), []);
  const focusCard = focus ? byId[focus] : null;

  const togglePick = (id: string, which: "top" | "low") => {
    const [list, set] = which === "top" ? [top, setTop] : [low, setLow];
    const other = which === "top" ? low : top;
    if (other.includes(id)) return;
    if (list.includes(id)) set(list.filter((x) => x !== id) as never);
    else if (list.length < 3) set([...list, id] as never);
  };

  const go = (dir: 1 | -1) => {
    const i = STEPS.indexOf(step);
    const next = STEPS[Math.min(STEPS.length - 1, Math.max(0, i + dir))];
    setStep(next);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {step === "intro" && (
        <>
          <IntroGrid
            what="The Skills & Mindset cards, laid out digitally. Twelve cards, each with a description on the front and coaching questions plus activities on the back."
            why="Picking what you're strongest at — and what you most want to develop — turns a vague 'I want to get better' into one clear focus with a route into it."
            how={
              <ol className="list-decimal pl-4 space-y-1.5">
                <li>Read the spread; flip any card to see its questions.</li>
                <li>Pick your top 3 and say why.</li>
                <li>Pick 3 you'd most like to develop.</li>
                <li>Choose one to focus on and work its back-of-card prompts.</li>
                <li>See which strengths can help you get there.</li>
              </ol>
            }
          />
          <PrimaryButton onClick={() => go(1)}>Lay out the cards</PrimaryButton>
        </>
      )}

      {step !== "intro" && (
        <div className="flex flex-wrap items-center gap-3">
          <GhostButton onClick={() => go(-1)}>← Back</GhostButton>
          <span className="text-sm text-muted-foreground">
            Step {STEPS.indexOf(step)} of {STEPS.length - 1}
          </span>
        </div>
      )}

      {(step === "spread" || step === "develop") && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">
              {step === "spread" ? "Pick your top 3" : "Now pick 3 to develop"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {step === "spread"
                ? "The three that feel most like you right now. Click a card to select it; use Flip to read the questions and activities on the back."
                : "The three you'd most like to develop — not necessarily your weakest, just the ones you want to grow. Your top 3 are locked out."}
            </p>
            <p className="mt-2 text-sm font-medium">
              Selected: {(step === "spread" ? top : low).length} / 3
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CARDS.map((c) => {
              const selectedTop = top.includes(c.id);
              const selectedLow = low.includes(c.id);
              const active = step === "spread" ? selectedTop : selectedLow;
              const locked = step === "develop" && selectedTop;
              const isFlipped = flipped[c.id];
              return (
                <div
                  key={c.id}
                  className={`rounded-2xl border p-4 transition ${
                    active ? "ring-2 ring-primary shadow-lg" : ""
                  } ${locked ? "opacity-50" : ""}`}
                  style={cardStyle(c.hue)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="text-sm font-bold uppercase tracking-wide"
                      style={{ color: cardInk(c.hue) }}
                    >
                      {c.title}
                    </h3>
                    <button
                      onClick={() => setFlipped((f) => ({ ...f, [c.id]: !f[c.id] }))}
                      className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-[#4a3327] hover:bg-white"
                    >
                      {isFlipped ? "Front" : "Flip"}
                    </button>
                  </div>

                  {!isFlipped ? (
                    <div className="mt-3 space-y-3 text-[#33231a]">
                      <p className="text-sm">{c.blurb}</p>
                      <div className="grid gap-1.5">
                        {c.levels.map((l, i) => (
                          <div
                            key={i}
                            className="rounded-lg bg-white/60 px-2.5 py-1.5 text-[11px] leading-snug"
                          >
                            <span className="font-semibold">
                              {["Starting out", "Getting there", "Strong"][i]}:{" "}
                            </span>
                            {l}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3 text-[#33231a]">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider">Questions</p>
                        <ul className="mt-1 list-disc pl-4 text-[12px] leading-snug space-y-1">
                          {c.questions.map((q) => (
                            <li key={q}>{q}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider">Activities</p>
                        <ul className="mt-1 space-y-1 text-[12px]">
                          {c.activities.map((a) => (
                            <li key={a.name}>
                              <span className="font-medium">{a.name}</span>
                              {a.note && <span className="text-[#6b5040]"> — {a.note}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={locked}
                    onClick={() => togglePick(c.id, step === "spread" ? "top" : "low")}
                    className="mt-4 w-full rounded-full bg-[#5a1e1a]/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-[#5a1e1a] disabled:opacity-40"
                  >
                    {locked
                      ? "In your top 3"
                      : active
                        ? "Selected — remove"
                        : step === "spread"
                          ? "This is a strength"
                          : "I want to develop this"}
                  </button>
                </div>
              );
            })}
          </div>

          <PrimaryButton
            disabled={(step === "spread" ? top : low).length !== 3}
            onClick={() => go(1)}
          >
            Continue
          </PrimaryButton>
        </section>
      )}

      {step === "strengths" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Why these three?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              What makes each one a strength? Give an example if you can.
            </p>
          </div>
          {top.map((id) => (
            <div key={id} className="rounded-2xl border p-4" style={cardStyle(byId[id].hue)}>
              <h3
                className="text-sm font-bold uppercase tracking-wide"
                style={{ color: cardInk(byId[id].hue) }}
              >
                {byId[id].title}
              </h3>
              <TextArea
                rows={3}
                className="mt-2 bg-white/80"
                placeholder="I picked this because…"
                value={why[id] ?? ""}
                onChange={(e) => setWhy((w) => ({ ...w, [id]: e.target.value }))}
              />
            </div>
          ))}
          <PrimaryButton onClick={() => go(1)}>Continue</PrimaryButton>
        </section>
      )}

      {step === "focus" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Pick one to focus on</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Of the three you want to develop, which one would make the biggest difference right
              now?
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {low.map((id) => (
              <button
                key={id}
                onClick={() => setFocus(id)}
                className={`rounded-2xl border p-4 text-left transition ${focus === id ? "ring-2 ring-primary shadow-lg" : ""}`}
                style={cardStyle(byId[id].hue)}
              >
                <h3
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{ color: cardInk(byId[id].hue) }}
                >
                  {byId[id].title}
                </h3>
                <p className="mt-2 text-sm text-[#33231a]">{byId[id].blurb}</p>
              </button>
            ))}
          </div>
          {low.map((id) => (
            <div key={id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium">
                {byId[id].title} — why do you want to develop this?
              </p>
              <TextArea
                rows={2}
                className="mt-2"
                value={why[id] ?? ""}
                onChange={(e) => setWhy((w) => ({ ...w, [id]: e.target.value }))}
              />
            </div>
          ))}
          <PrimaryButton disabled={!focus} onClick={() => go(1)}>
            Work on this card
          </PrimaryButton>
        </section>
      )}

      {step === "work" && focusCard && (
        <section className="space-y-4">
          <div className="rounded-2xl border p-5" style={cardStyle(focusCard.hue)}>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#6b5040]">
              Focus card
            </p>
            <h2 className="text-xl font-bold" style={{ color: cardInk(focusCard.hue) }}>
              {focusCard.title}
            </h2>
            <p className="mt-1 text-sm text-[#33231a]">{focusCard.blurb}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {focusCard.levels.map((l, i) => (
                <div key={i} className="rounded-lg bg-white/70 px-3 py-2 text-[11px] leading-snug">
                  <span className="font-semibold">
                    {["Starting out", "Getting there", "Strong"][i]}:{" "}
                  </span>
                  {l}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Questions
            </h3>
            {focusCard.questions.map((q) => (
              <div key={q}>
                <p className="text-sm font-medium">{q}</p>
                <TextArea
                  rows={2}
                  className="mt-1.5"
                  value={answers[q] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Activities
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {focusCard.activities.map((a) => (
                <li key={a.name} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{a.name}</span>
                    {a.slug && (
                      <Link
                        to="/exercise/$slug"
                        params={{ slug: a.slug }}
                        className="rounded-full bg-primary px-3 py-0.5 text-xs text-primary-foreground"
                      >
                        Open exercise →
                      </Link>
                    )}
                  </div>
                  {a.note && <p className="mt-1 text-xs text-muted-foreground">{a.note}</p>}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold">Use your strengths</h3>
              <p className="text-sm text-muted-foreground">
                How could each of your top three help you develop {focusCard.title}?
              </p>
            </div>
            {top.map((id) => (
              <div key={id}>
                <p className="text-sm font-medium">{byId[id].title}</p>
                <TextArea
                  rows={2}
                  className="mt-1.5"
                  placeholder={`I could use my ${byId[id].title.toLowerCase()} to…`}
                  value={bridge[id] ?? ""}
                  onChange={(e) => setBridge((b) => ({ ...b, [id]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold">One step you'll take</h3>
            <TextArea
              rows={3}
              className="mt-2"
              placeholder="Before our next session I will…"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            />
          </div>

          <PrimaryButton onClick={() => go(1)}>See summary</PrimaryButton>
        </section>
      )}

      {step === "summary" && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <h2 className="text-xl font-semibold">Your card spread</h2>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Top 3 strengths
              </p>
              <ul className="mt-2 space-y-2">
                {top.map((id) => (
                  <li key={id} className="rounded-lg border border-border p-3 text-sm">
                    <span className="font-medium">{byId[id].title}</span>
                    {why[id] && <p className="mt-1 text-muted-foreground">{why[id]}</p>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Want to develop
              </p>
              <ul className="mt-2 space-y-2">
                {low.map((id) => (
                  <li key={id} className="rounded-lg border border-border p-3 text-sm">
                    <span className="font-medium">{byId[id].title}</span>
                    {id === focus && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground">
                        Focus
                      </span>
                    )}
                    {why[id] && <p className="mt-1 text-muted-foreground">{why[id]}</p>}
                  </li>
                ))}
              </ul>
            </div>
            {focusCard && (
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Working on {focusCard.title}
                </p>
                <ul className="mt-2 space-y-2 text-sm">
                  {focusCard.questions
                    .filter((q) => answers[q]?.trim())
                    .map((q) => (
                      <li key={q} className="rounded-lg border border-border p-3">
                        <p className="font-medium">{q}</p>
                        <p className="mt-1 text-muted-foreground whitespace-pre-wrap">
                          {answers[q]}
                        </p>
                      </li>
                    ))}
                  {top
                    .filter((id) => bridge[id]?.trim())
                    .map((id) => (
                      <li key={id} className="rounded-lg border border-border p-3">
                        <p className="font-medium">Using {byId[id].title}</p>
                        <p className="mt-1 text-muted-foreground whitespace-pre-wrap">
                          {bridge[id]}
                        </p>
                      </li>
                    ))}
                </ul>
              </div>
            )}
            {plan.trim() && (
              <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
                <p className="text-sm font-semibold">Next step</p>
                <p className="mt-1 text-sm whitespace-pre-wrap">{plan}</p>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
            <GhostButton
              onClick={() => {
                setStep("intro");
                setTop([]);
                setLow([]);
                setFocus(null);
              }}
            >
              Start again
            </GhostButton>
          </div>
        </section>
      )}
    </div>
  );
}
