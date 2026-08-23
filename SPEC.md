# SPEC — SDC Virtual Resource Library

**Status:** describes the build as it exists on `main` at the time of writing, plus the
design principles and forward specification the build is working toward.

---

## 1. Purpose

### 1.1 What this is

A **virtual resource hub for coaches working with undergraduate students**. It replaces a
folder of printable PDF worksheets with a browsable library of interactive, self-contained
web exercises. A student (or a coach and student together) opens an exercise, works through
it on screen, and ends with a structured, readable summary of their own thinking that they
can take away as a PDF.

The original brief, preserved in `README.md`, is the seed of everything here:

> "Please create me an interactive version of this coaching exercise. I would like students
> to be able to fill this in online rather than using the file to do the exercise."

### 1.2 Who uses it

| Audience | How they use it |
| --- | --- |
| **Coach, 1:1** | Screen-shares or sits alongside a student; the exercise structures the conversation and captures the output. |
| **Coach, group/workshop** | Projects a facilitator-shaped exercise (e.g. Team Alignment) and works it with a team. |
| **Student, self-serve** | Browses the library between sessions, picks something by category or search, works it alone. |
| **Student, pre/post-session** | Completes an exercise as prep or homework and brings the exported PDF to the next session. |

### 1.3 Non-goals (current build)

- No accounts, login, or student identity.
- No server-side storage of anything a student writes.
- No coach dashboard, cohort management, or analytics on student answers.
- No content management system — exercises are code, added by a developer.

These are deliberate. The absence of accounts is what allows the site to be a static,
zero-backend, zero-data-protection-surface deployment (§4.4, §8.1).

---

## 2. Design principles

These principles are inferred from the built code and the planning notes in
`.lovable/plan/`, and are stated here as the standard new work should meet.

### P1 — Interaction over form-filling

A worksheet's questions are the *floor*, not the ceiling. Where direct manipulation teaches
something a text box cannot, build the manipulation. The build already carries this through
in several distinct interaction families (§6.2): draggable radar spokes, drag-and-drop
sorting into geometric zones, pairwise comparison engines, timed sprints, card decks, and
guided animation.

The corollary, stated explicitly in the planning notes, is the discipline that keeps this
honest:

> "Not redesigning: the journaling-led exercises … writing *is* the exercise there."

Interactivity is added where it earns its place, not everywhere.

### P2 — One screen, one job

Every exercise is a **step machine**. The student sees one stage of the exercise at a time —
`intro → …work stages… → summary` — with explicit forward/back controls and, in the richer
exercises, a visible step counter or clickable step nav. No exercise presents its whole
worksheet as a single wall of fields.

### P3 — Always start with What / Why / How

Every exercise opens on a three-card grid (`IntroGrid` in `src/exercises/_shared.tsx`)
answering:

- **What** — what this exercise is,
- **Why** — why it's worth the student's time,
- **How** — a numbered list of the steps ahead.

This is the contract that makes the library browsable by a student with no coach present.

### P4 — Always end with a summary the student owns

Every exercise terminates in a **summary step**: their inputs, played back as a clean,
readable document rather than as form controls. The summary is the artefact — it is what
gets printed, saved, screenshotted, or discussed. Empty answers are filtered out of
summaries rather than rendered as blanks.

### P5 — Low-stakes, reversible, non-judgemental

Selections toggle. Steps go backward. Most exercises offer "Start again". Several offer a
"load example" affordance (e.g. Prioritization Matrix) so a student who is stuck can see
what good input looks like. Nothing scores the student; where a quiz exists (Cognitive
Distortions) it is a warm-up with a score the student alone sees.

### P6 — Honest time estimates

Every catalogue entry carries `estimatedMinutes`, surfaced on the card and in the exercise
header. Estimates range from 3 minutes (Box Breathing) to 45 (Team Alignment) so a coach can
pick something that fits the slot they actually have.

### P7 — Cross-linking, not silos

Exercises reference each other by slug. Skills & Mindset Cards links each card's suggested
activities to the relevant exercise; the Perfectionism hub links to six related exercises.
The library is a connected resource, not a list.

### P8 — One design system, semantic tokens only

All colour flows through CSS custom properties defined in `src/styles.css` (oklch, light and
`.dark` variants) and consumed as Tailwind utilities (`bg-card`, `text-muted-foreground`,
`border-border`). Exercise-specific colour (card hues, Ikigai zones, thinking hats) is the
only sanctioned exception, and is used as accent on top of the token system.

The palette is warm: a light ochre ground in the light theme (burnt umber after dark), with
deep red carrying `--primary`, and brown, orange and purple as the supporting accents. There
are no blue-grey neutrals — the greys are all warm. Alongside the shadcn tokens, the four
house accents are exposed as their own utilities so colour-coded content stays on-palette:

| Token | Utility | Typical use |
| --- | --- | --- |
| `--ink-red` / `--ink-red-soft` | `text-ink-red`, `bg-ink-red-soft` | Emphasis, the strongest of a set |
| `--ink-red-deep` | `text-ink-red-deep` | Page titles — oxblood in light, lifted in dark |
| `--ink-brown` / `--ink-brown-soft` | `text-ink-brown`, `bg-ink-brown-soft` | Quiet chrome — tags, saved-work banners |
| `--ink-orange` / `--ink-orange-soft` | `text-ink-orange`, `bg-ink-orange-soft` | Section eyebrows, focus borders, warnings |
| `--ink-purple` / `--ink-purple-soft` | `text-ink-purple`, `bg-ink-purple-soft` | Second accent — status pills, contrasting quadrants |
| `--ink-ochre` / `--ink-ochre-soft` | `text-ink-ochre`, `bg-ink-ochre-soft` | Header washes, the ground itself |

The `-soft` companion of each is a tint sized to take its solid partner as text in both
themes. Reach for these instead of a Tailwind palette colour (`amber-500`, `sky-700`) —
those don't follow the theme and read as foreign against the ochre.

### P9 — Shared primitives, not shared abstractions

`src/exercises/_shared.tsx` provides small, unopinionated building blocks — `InfoCard`,
`IntroGrid`, `PrimaryButton`, `GhostButton`, `Field`, `TextInput`, `TextArea`. Exercises
compose these but are otherwise free-form. There is no "exercise framework" forcing every
exercise into one shape, because the exercises are genuinely different shapes.

### P10 — Privacy by architecture

Student answers never leave the student's own device. No network calls, no server-side
storage, no telemetry. Work in progress is autosaved to `localStorage` under a per-exercise
namespace (§5.1) so a refresh doesn't cost a session, and the student can delete it at any
time — per exercise or all at once. Exporting is the only way work leaves the browser, and
the student initiates it.

---

## 3. Technology stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Language | TypeScript 5.8, `strict: true` | `@/*` path alias → `src/*` |
| UI | React 19 | Function components, hooks only |
| Framework | TanStack Start 1.x (`@tanstack/react-start`) | SSR-capable; file-based routing |
| Routing | TanStack Router 1.x | `src/routes/`, generated `routeTree.gen.ts` |
| Build | Vite 7 via `@lovable.dev/vite-tanstack-config` | Wrapper preconfigures the plugin set |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite`) + `tw-animate-css` | CSS-first config in `src/styles.css` |
| Component library | shadcn/ui (new-york, slate) vendored into `src/components/ui/` | **Entirely unused by the app** — 46 components, 0 imports; see §9.4 |
| Data fetching | TanStack Query 5 | Provider mounted in `__root.tsx`; no queries yet |
| Package manager | Bun (`bun.lock`, `bunfig.toml`); npm on CI | `minimumReleaseAge = 86400` supply-chain guard |
| Lint/format | ESLint 9 flat config + Prettier | `npm run lint`, `npm run format` |
| Origin | Lovable (`.lovable/project.json`, template `tanstack_start_ts`) | Lovable owns `vite.config.ts` |

### 3.1 Scripts

```
npm run dev        # vite dev
npm run build      # vite build (Lovable/Cloudflare target)
npm run build:dev  # development-mode build
npm run preview    # preview server
npm run lint       # eslint .
npm run format     # prettier --write .
```

---

## 4. Architecture

### 4.1 File layout

```
src/
├── routes/
│   ├── __root.tsx           App shell: <html>, head/meta, QueryClientProvider,
│   │                        404 and error components
│   ├── index.tsx            "/" — library home: search, category filter, card grid
│   ├── exercise.$slug.tsx   "/exercise/:slug" — exercise host page
│   └── README.md            File-based routing conventions (do not add src/pages/)
├── routeTree.gen.ts         Generated — never hand-edit
├── router.tsx               createRouter + QueryClient wiring
├── start.ts                 createStart + server error middleware
├── server.ts                SSR entry wrapper; normalises h3-swallowed 500s
├── lib/
│   ├── exercises.ts         THE CATALOGUE — single source of truth
│   ├── exercise-storage.ts  Per-exercise localStorage autosave + clear
│   ├── theme.ts             light / dark / system theme, pre-paint init script
│   ├── utils.ts             cn() helper (clsx + tailwind-merge)
│   ├── config.server.ts     Server-only env access pattern (unused stub)
│   ├── error-capture.ts     Captures last SSR error for the error page
│   ├── error-page.ts        Static HTML fallback error page
│   └── api/example.functions.ts  createServerFn example (unused stub)
├── exercises/
│   ├── _shared.tsx          Shared UI primitives
│   └── <38 exercise components>.tsx
├── components/
│   ├── ClearMemoryDialog.tsx  "Clear memory" button + per-exercise clear card
│   ├── ThemeToggle.tsx      Light / system / dark control
│   └── ui/                  shadcn/ui primitives (vendored, entirely unused)
├── hooks/use-mobile.tsx
└── styles.css               Design tokens + Tailwind entry
```

### 4.2 The catalogue (`src/lib/exercises.ts`)

The catalogue is the spine of the application. Everything — home page, filters, search,
routing, metadata, `<title>` tags — derives from it.

```ts
export type Exercise = {
  slug: string;              // URL segment, kebab-case, stable
  title: string;             // Display title
  description: string;       // One-sentence outcome-focused summary
  category: string;          // Free-form; categories derived, not enumerated
  tags: string[];            // Lowercase kebab-case, searchable
  estimatedMinutes: number;  // Honest estimate
  component: ComponentType;  // Default-exported exercise component
};

export const EXERCISES: Exercise[] = [ /* 38 entries */ ];
export const getExercise  = (slug: string) => EXERCISES.find(e => e.slug === slug);
export const getCategories = () => Array.from(new Set(EXERCISES.map(e => e.category))).sort();
```

**Adding an exercise is a two-file change**: create `src/exercises/Foo.tsx` with a default
export, then append an entry to `EXERCISES`. Categories, filters, search, routing, and meta
tags update automatically. There is no registry, no config file, no route to add.

### 4.3 Routing and page composition

**`/` — Library home (`src/routes/index.tsx`)**

- Client-side `query` state; substring match, case-insensitive, across `title`,
  `description`, and `tags`.
- Client-side `category` state; pill row rendered from `getCategories()` with an "All" reset.
- Filtering is a `useMemo` over `EXERCISES` — instant, no network.
- Results render as a responsive card grid (1 col → 2 cols at `sm`), each card showing
  category, minutes, title, description, tag chips, and a "Start exercise →" affordance.
- Empty state: "No exercises match your search."

**`/exercise/$slug` — Exercise host (`src/routes/exercise.$slug.tsx`)**

- `loader` resolves the slug and returns **only serializable metadata** (never the component
  reference — that would break SSR serialization). It throws `notFound()` for unknown slugs.
- `head` sets per-exercise `<title>`, description, and Open Graph tags from loader data.
- The component re-resolves the full exercise (including `component`) client-side from the
  catalogue and renders it inside a standard header shell showing title, back-link,
  category, and estimated minutes.
- Dedicated `notFoundComponent` and `errorComponent` (with a `reset` retry).

**`__root.tsx`** — supplies the HTML shell, default and OG/Twitter meta, the stylesheet link,
`QueryClientProvider`, a styled 404, and a top-level error boundary that logs and offers
"Try again" / "Go home".

### 4.4 Two build targets

| Target | Config | Output |
| --- | --- | --- |
| **Lovable / SSR** | `vite.config.ts` | Nitro build, Cloudflare Worker default target. Lovable owns this file. |
| **GitHub Pages (static)** | `vite.config.pages.ts` | `nitro: false`, `spa.enabled: false`, `prerender: { enabled: true, crawlLinks: true }` → real HTML files per route. |

The Pages workflow (`.github/workflows/deploy-pages.yml`) runs on push to `main`:

1. Node 22, `npm install --registry=https://registry.npmjs.org` (the public registry is
   forced because `bunfig.toml` points Bun at a Lovable-private cache unreachable from CI).
2. Derives the base path from the repository's *current* name at run time
   (`/${GITHUB_REPOSITORY##*/}/`), overridable via the `PAGES_BASE` repo variable — this
   survives repository renames, which the event payload does not.
3. `npx vite build --config vite.config.pages.ts`.
4. Adds `.nojekyll` and copies `index.html` → `404.html` as the SPA fallback.
5. Uploads `dist/client` and deploys via `actions/deploy-pages@v4`.

Because prerendering crawls links from `/`, every exercise in the catalogue is emitted as a
static HTML page with correct meta tags — good for sharing a single exercise link into a
coaching conversation.

### 4.5 Error handling

Three layers, all present in the build:

1. `src/lib/error-capture.ts` records the last thrown SSR error.
2. `src/server.ts` detects h3's habit of swallowing in-handler throws into an opaque
   `{"unhandled":true,"message":"HTTPError"}` JSON 500 and replaces it with a real HTML
   error page (`src/lib/error-page.ts`).
3. `start.ts` request middleware catches non-HTTP errors and returns the same page.

Client-side, `__root.tsx` and the exercise route each carry error boundaries.

---

## 5. State model

Every exercise is a **local, ephemeral state machine**:

- A `step` (or `idx`) state variable driving which section renders.
- One `useState` per logical field, or `Record<string, string>` maps for question sets.
- List-shaped exercises use arrays of objects keyed by `crypto.randomUUID()`.
- Timers (Box Breathing, Idea Quickfire) use `useEffect` intervals; Box Breathing
  additionally keeps authoritative timer state in a `useRef` so React re-render timing cannot
  skip a phase.
- Derived values (rankings, tallies, groupings, valid-task filters) use `useMemo`.

There is **no** global store and **no** URL state.

### 5.1 Persistence (`src/lib/exercise-storage.ts`)

Anything the student types or chooses is autosaved to `localStorage` on their own device.
`usePersistentState(slug, field, initial)` is a drop-in replacement for `useState`:

```ts
const [notes, setNotes] = usePersistentState<Record<string, string>>(
  "wheel-of-life", "notes", {},
);
```

Contract:

| Concern | Behaviour |
| --- | --- |
| **Key shape** | `sdc-vrl:v1:<slug>:<field>` — namespaced per exercise, so exercises cannot read each other's answers. `VERSION` is bumped if a stored shape changes incompatibly. |
| **SSR / prerender** | The first render always returns the initial value; the stored value is applied in a mount effect. Reading storage during render would desync the prerendered HTML from the client. |
| **No spurious saves** | A write happens only when the serialised value actually differs from what is stored (or from the untouched default). Opening an exercise and reading it never creates a save. |
| **Sets** | `Set` values are serialised through an explicit `{ __t: "Set", v: [...] }` envelope, since some exercises hold answers in a `Set`. |
| **Failure** | Private modes, disabled storage, and quota errors are caught: the exercise keeps working in memory, it just stops being restorable. |
| **Clearing** | Per exercise from the banner on the exercise page, or from the library's **Clear memory** card, which lists every exercise holding data (with its field count) and clears whichever boxes are ticked — one, several, or all. Clearing removes the keys and remounts the component (via a `key` bump) so in-memory state resets too. |

**What is *not* persisted:** transient UI and timer state — drag targets, hover zones,
card-flip state, quiz progress, and running countdowns. `_shared`-level subcomponents that
are rendered more than once per page (e.g. `SectionActioning`) must also stay on plain
`useState`, since a single storage key would be shared across every instance.

Three surfaces expose the saved state: an "In progress" badge on library cards, a banner on
the exercise page stating that answers are device-local with the clear control, and the
**Clear memory** button in the library header (`src/components/ClearMemoryDialog.tsx`). That
button opens a modal card listing exactly what this device is storing — exercise title,
category and number of saved fields, with data from a renamed or retired slug still listed by
its slug so it can be cleared. A checkbox per row plus a "select all" row choose what to
forget; a confirmation step precedes the delete. The card is keyboard-dismissable (Escape) and
backdrop-dismissable, and it leaves the theme choice alone.

---

## 6. Exercise format specification

### 6.1 Canonical anatomy

Every exercise component:

1. Lives at `src/exercises/<PascalCase>.tsx` and **default-exports** a zero-prop component.
2. Declares its content as module-level `const` data (cards, prompts, scenarios, categories)
   separated from the component — content is data, not JSX.
3. Declares an explicit step union type, e.g.
   `type Step = "intro" | "problem" | "sort" | "summary"`.
4. Renders `<IntroGrid what why how />` as its first step, ending in a `PrimaryButton` that
   starts the exercise.
5. Renders work stages with `Field` + `TextInput`/`TextArea`, custom interactive surfaces, or
   both, and forward/back controls (`PrimaryButton` / `GhostButton`).
6. Renders a summary step: heading, the student's inputs formatted as read-only prose
   (`whitespace-pre-wrap` for multi-line), empty entries omitted.
7. Offers export and, where sensible, "Start again" from the summary.

### 6.2 Interaction families in the build

| Family | Mechanism | Exercises |
| --- | --- | --- |
| **Draggable radar** | SVG polygon, drag anywhere along a spoke, live morph; shared `DraggableRadar` exported from `WheelOfLife.tsx` and reused. Optional props cover display labels distinct from score keys, a `min` of 0, an accent colour, a dashed comparison `overlay` polygon, a `clampValue` hook for budget-constrained wheels, and `setOnPress` + `hideZeroHandles` for a wheel that starts empty and places a handle where the student clicks | Wheel of Life (8 areas), Self-Care Wheel (6), PERMA (5), Wheel of Hult (8, twice — rating and budget) |
| **Constrained budget** | A fixed pot of points spread across areas; every control clamps to both a per-area cap and the remaining budget. The budget radar starts with no handles at all — clicking a spoke places one at the clicked value, or at the most the remaining budget affords; dragging one back to the centre returns its points to the pool | Wheel of Hult (35 points, max 10 per area) |
| **Drag-and-drop zones** | HTML5 `draggable` / `onDragStart` / `onDrop`, hover-zone highlighting, click fallback | Circles of Control (concentric SVG rings), Ikigai (four overlapping circles), Urgent-Important (2×2), Must/Should/Could (3 columns), Decision Grid (2×2), Core Values (ranking) |
| **Card deck** | Flip, select, lock-out, shuffle | Skills & Mindset Cards (12 cards, flip to reveal questions + linked activities), Ethical Dilemmas (6 scenarios, Classical/Business), Cognitive Distortions (shuffled quiz deck with scoring), Core Values (swipe/keep-discard) |
| **Timers** | `useEffect` interval; countdown or phase animation | Box Breathing (4-4-4-4, configurable seconds/cycles, ref-authoritative timer), Idea Quickfire (3/5/10-minute sprint with live idea capture) |
| **Comparison engines** | Derived ranking from discrete choices | Prioritization Matrix (pairwise, n·(n−1)/2 comparisons, tally → ranking) |
| **Guided sequence** | One prompt at a time, `idx`-driven | Chimp Brain (6 steps), Self-Compassion (5 steps), Reward Replacement (Identify/Replace/Implement/Track) |
| **Structured builder** | Assembles a live artefact as the student types | BEAR Feedback (Behavior→Effect→Alternative→Result assembling a script), SMART Goals (five parts → combined statement + confidence slider), Actioning & Objectives (sections → objectives → action verbs per point) |
| **Perspective carousel** | One "lens" at a time, colour-shifting backdrop | Six Thinking Hats (6 hats → shared board → decision) |
| **Log / table** | Add-remove-edit rows | Thought Logging (expandable log entries), Enhanced To-Do (priority A–D, estimate vs actual with minute parsing), Project Breakdown (tasks grouped into 5 phases) |
| **Checklist audit** | Multi-select over categorised statements | Procrastination Checklist, High Standards Check-In (per-area entries), Rules & Assumptions |
| **Facilitator companion** | Multi-member, round-based capture | Team Alignment (members, session goals, 8 questions round-robin, themes/averages, closing, checklist) |
| **Reference hub** | Content-led with reflective inputs and cross-links | Perfectionism: A Practical Guide (mindsets, busters, affirmations, personal script, 6 outbound links) |
| **Journaling** | Prompted long-form writing — deliberately un-gamified (P1) | Future Self, End-of-Year Review, Finding Passions, As-If, Walk and Talk |

### 6.3 Catalogue (38 exercises, 16 categories)

Categories in use: Beliefs & Thinking, Calming Techniques, Communication, Creativity,
Decision-Making, Habits & Behaviour, Prioritization, Productivity, Public Speaking,
Purpose & Direction, Reflection, Self-Awareness, Stress & Anxiety, Student Life, Teamwork,
Wellbeing.

| Slug | Title | Category | Min | Structure | Export |
| --- | --- | --- | --- | --- | --- |
| `skills-and-mindset-cards` | Skills & Mindset Cards | Self-Awareness | 30 | intro → spread → strengths → develop → focus → work → summary | ✅ |
| `prioritization-matrix` | Prioritization Matrix | Prioritization | 10 | intro → tasks → compare → results | ✅ |
| `circles-of-control` | Circles of Control, Influence, Concern | Stress & Anxiety | 10 | intro → problem → brainstorm → sort → action → summary | ✅ |
| `perma-model` | PERMA Model of Wellbeing | Wellbeing | 10 | intro → reflect (radar) → summary | ✅ |
| `rules-and-assumptions-check` | Rules and Assumptions Check | Beliefs & Thinking | 12 | intro → check → custom → behaviour → summary | ✅ |
| `self-care-wheel` | Self-Care Wheel | Wellbeing | 10 | intro → rate (radar) → summary | ✅ |
| `self-compassion` | Practising Self-Compassion | Wellbeing | 8 | 5 guided steps → summary | ✅ |
| `thought-logging` | Thought Logging | Beliefs & Thinking | 12 | intro → logs (repeating 8-field entries) | ✅ |
| `box-breathing` | Box Breathing | Calming Techniques | 3 | intro → animated timer | ❌ (nothing to export) |
| `challenging-cognitive-distortions` | Challenging Cognitive Distortions | Beliefs & Thinking | 12 | intro → quiz → situation → identify → challenge → reframe → summary | ✅ |
| `challenging-rules-and-assumptions` | Challenging Rules and Assumptions | Beliefs & Thinking | 15 | intro → identify → experiment → results → reflect → summary | ✅ |
| `chimp-brain` | The Chimp Mind Model | Stress & Anxiety | 10 | 6 guided steps → summary | ✅ |
| `future-self` | Meeting Your Future Self | Purpose & Direction | 15 | intro → ground → visualize → messages → summary | ✅ |
| `core-values` | Core Values | Purpose & Direction | 15 | intro → swipe → rank → action → summary | ✅ |
| `end-of-year-review` | End-of-Year Review | Reflection | 15 | intro → reflect → summary | ✅ |
| `finding-your-passions` | Finding Your Passions | Purpose & Direction | 15 | intro → reflect → actions → summary | ✅ |
| `ikigai` | Ikigai | Purpose & Direction | 20 | intro → fill (drag chips into 4 circles) → summary | ✅ |
| `procrastination-checklist` | Procrastination Checklist | Productivity | 10 | intro → check → plan → summary | ✅ |
| `wheel-of-power-and-privilege` | Wheel of Privilege & Power | Reflection | 15 | intro → map → reflect → summary | ✅ |
| `wheel-of-life` | Wheel of Life | Wellbeing | 10 | intro → rate (radar) → summary | ✅ |
| `six-thinking-hats` | The Six Thinking Hats | Decision-Making | 20 | intro → problem → hats → board → decide → summary | ✅ |
| `idea-generation-quickfire` | Idea Generation Quickfire | Creativity | 10 | intro → prompt → timed brainstorm → reflect → summary | ✅ |
| `project-breakdown` | Project Breakdown | Productivity | 12 | single view: project, deadline, phase-grouped tasks | ❌ |
| `reward-replacement` | Reward Replacement | Habits & Behaviour | 12 | Identify → Replace → Implement → Track | ❌ |
| `smart-goals` | SMART Goals | Purpose & Direction | 12 | 5 parts → combined statement + confidence | ❌ |
| `urgent-important-matrix` | Urgent-Important Matrix | Prioritization | 10 | single view: tray → drag into 2×2 | ❌ |
| `decision-grid` | Decision Grid | Decision-Making | 15 | single view: decision → items → drag into 2×2 | ❌ |
| `as-if-exercise` | 'As If' Presentation Exercise | Public Speaking | 15 | text → scenario picker → tried-list → notes | ❌ |
| `walk-and-talk` | Walk and Talk | Public Speaking | 12 | text → annotated movement legend | ❌ |
| `high-standards-check-in` | High Standards Check-In | Beliefs & Thinking | 15 | per-area entry table | ❌ |
| `perfectionism-hub` | Perfectionism: A Practical Guide | Beliefs & Thinking | 20 | reference hub + 4 reflective inputs + cross-links | ❌ |
| `ethical-dilemmas` | Ethical Dilemmas | Decision-Making | 15 | intro → pick → gut → weigh → decide → summary | ✅ |
| `bear-feedback-model` | BEAR Feedback Model | Communication | 12 | intro → examples → build → summary | ✅ |
| `team-alignment` | Team Alignment Session | Teamwork | 45 | intro → setup → round → themes → closing → checklist → summary | ✅ |
| `must-should-could` | Must Do, Should Do, Could Do | Prioritization | 10 | single view: tray → drag into 3 columns | ✅ |
| `enhanced-to-do-list` | Enhanced To-Do List | Productivity | 12 | single view: priority/estimate/actual table | ✅ |
| `actioning-and-objectives` | Actioning and Objectives | Public Speaking | 20 | numbered steps: overall objective → sections → points → verbs → rehearse | ✅ |
| `wheel-of-hult` | Wheel of Hult | Student Life | 20 | intro → rate (radar) → allocate (budget radar) → compare (overlay + gap table) → actions → summary | ✅ |

**Export column:** ✅ = a "Print / Save PDF" control exists today; ❌ = none. 28 of 38 have
one; 10 do not. Box Breathing legitimately produces no artefact; the other nine are gaps
(§7.3).

---

## 7. PDF export

### 7.1 What exists today

Export is implemented as **browser print-to-PDF**: a `PrimaryButton` on the summary step
calling `window.print()`. There is no PDF library, no server-side rendering of documents, and
no client-side canvas capture. The student gets the OS/browser print dialog and chooses
"Save as PDF".

```tsx
<PrimaryButton onClick={() => window.print()}>Print / Save PDF</PrimaryButton>
```

This is a deliberate, dependency-free choice consistent with P10 (nothing leaves the browser)
and with the planning note: *"No backend; state stays local to the session, with print/save as
the export path."*

### 7.2 Known limitations of the current implementation

1. **No print stylesheet exists.** `src/styles.css` contains no `@media print` block and no
   `print:` Tailwind utilities are used anywhere in `src/`. Consequences:
   - The site header, back-link, category/time chip, and the export button itself print.
   - Interactive controls (buttons, step navs, textareas mid-exercise) print as form chrome.
   - Backgrounds and accent colours are dropped by default browser print settings, which
     matters for colour-coded content (thinking hats, Ikigai zones, card hues).
   - No control over page breaks — summary sections can split mid-card.
   - SVG visuals (radars, circles) are not explicitly sized for print.
2. **Whole-page scope.** `window.print()` prints the document, not the summary region.
3. **No filename control.** The PDF is named from the document title / browser default.
4. **Nine exercises have no export at all** despite producing exportable output (§6.3).
5. **No non-PDF export path** — no copy-to-clipboard, no email, no `.txt`/`.md` download,
   nothing a student can paste into a coaching journal.

### 7.3 Specification for export (target state)

**E1 — Every exercise that produces an artefact exports it.** A shared export control appears
on every summary step. The nine exercises currently missing one gain one:
Project Breakdown, Reward Replacement, SMART Goals, Urgent-Important, Decision Grid, As-If,
Walk and Talk, High Standards, Perfectionism hub. Exercises without a captured artefact (Box
Breathing) are explicitly exempt.

**E2 — A dedicated print stylesheet.** Add an `@media print` layer to `src/styles.css` that:
- hides non-content chrome via a `.no-print` class applied to headers, nav, step controls,
  and buttons;
- forces a light, ink-efficient palette (white background, near-black text) while retaining
  accent colour where it is semantically load-bearing, using
  `print-color-adjust: exact` on those elements only;
- sets `@page { size: A4; margin: 16mm; }`;
- applies `break-inside: avoid` to summary cards and `break-after: avoid` to headings;
- expands `overflow` containers so nothing is clipped;
- constrains SVG visuals to a fixed print width.

**E3 — A shared `ExerciseExport` primitive** in `_shared.tsx`, so export is one import rather
than a copy-pasted `window.print()`:

```tsx
<ExerciseExport
  title="Wheel of Life"        // becomes the document heading and PDF filename stem
  studentName={name}           // optional, printed in the header block
/>
```

It renders the export button (marked `.no-print`), sets `document.title` to
`<Exercise Title> — <YYYY-MM-DD>` around the print call so the suggested filename is
meaningful, and restores it afterwards.

**E4 — A print header block.** Every printed summary carries: exercise title, category,
optional student name, and date completed. Rendered `print:block hidden` so it appears only
on paper.

**E5 — A dedicated print region.** Summary content is wrapped in a `data-print-root` element;
the print stylesheet hides everything outside it. This makes the printed output the summary,
not the page.

**E6 — Secondary export paths** (lower priority, same principle — nothing leaves the browser):
- **Copy as text** — the summary serialised to Markdown, into the clipboard.
- **Download `.md`** — the same string as a Blob download, so a student can archive it or
  paste it into a coach's system.

Both require exercises to expose their summary as structured data (§7.4), which is the one
piece of shared plumbing worth building.

**E7 — Optional: true generated PDF.** Only if E2–E5 prove insufficient (e.g. coaches need
identical, branded output across browsers). This would mean a client-side PDF library
(`pdf-lib` / `jspdf`) plus per-exercise layout code — a significant increase in cost and
maintenance for output quality that a good print stylesheet largely achieves. **Not
recommended as the first move.**

### 7.4 Enabling structure: the summary model

To make E6/E7 tractable without rewriting every exercise, exercises should (incrementally)
expose their result as data alongside their JSX:

```ts
export type SummarySection = {
  heading: string;
  items: Array<{ label?: string; value: string }>;
};

export type ExerciseSummary = {
  exerciseSlug: string;
  completedAt: string;          // ISO date
  sections: SummarySection[];
};
```

A shared `renderSummary(summary)` component then produces both the on-screen summary and the
print/Markdown/clipboard forms from one source, eliminating the current pattern where each
exercise hand-writes its summary layout.

---

## 8. Deployment, privacy, and accessibility

### 8.1 Privacy posture

No student input is ever transmitted. Answers are held in the browser and autosaved to
`localStorage` on the student's own device (§5.1), so:

- the operator holds no personal data — nothing reaches a server, so there is no
  data-subject request surface and no retention policy to run;
- the site can be served as static files with no backend and no database;
- the data that does exist at rest sits on the student's own machine, under their control,
  and is deletable from the UI at any time (per exercise, or all at once).

The one residual risk is a **shared device**: on a lab or library machine, the next person
using the same browser profile can open the same exercise and see the previous student's
answers. The saved-work banner names where answers live, and §9.1 tracks the stronger
mitigations. Private/incognito windows are unaffected either way — storage there is
discarded when the window closes, and the exercises degrade gracefully if storage is blocked.

The stub server pieces (`config.server.ts`, `api/example.functions.ts`) exist as template
scaffolding only; neither is imported by the app. Introducing *server-side* persistence
would change this posture materially and should be an explicit, documented decision.

### 8.2 Accessibility — current state and requirements

Current build: semantic headings, real `<label>` elements via `Field`, visible focus rings
(`focus:ring-2 focus:ring-ring`), responsive layouts from mobile up, and a token system with a
defined dark palette.

Gaps to close (specification for new and revised work):

- **A1** — Every drag-and-drop interaction must have a keyboard/click-only equivalent. The
  planning notes commit to "click/tap fallbacks for touch"; the same affordance must be
  reachable by keyboard.
- **A2** — The radar drag (`DraggableRadar`) needs an accessible numeric input per spoke
  (or arrow-key adjustment on a focusable handle with `role="slider"` and `aria-valuenow`).
  **Pattern established:** Wheel of Hult pairs each radar with a labelled row of −/number/+
  controls, so every spoke is reachable and adjustable by keyboard. The Wheel of Life,
  Self-Care Wheel and PERMA still need the same treatment. Grabbing is also no longer
  limited to the dot itself — the whole spoke is a drag target, which is what makes a
  wheel usable when several areas share a value (or all sit at 0).
- **A3** — Step changes should move focus to the new step's heading and announce via a live
  region, not only scroll to top.
- **A4** — Timed exercises (Box Breathing, Idea Quickfire) should announce phase changes to
  screen readers and offer a reduced-motion path (`prefers-reduced-motion`).
- **A5** — Colour must never be the sole carrier of meaning (thinking hats, priority A–D
  opacity, Ikigai zones all currently lean on colour).
- **A6** — Contrast: hue-derived inline colours (`cardInk(hue)` on card titles) should be
  checked against their backgrounds in both themes.
- **A7** — ~~The dark theme is defined in tokens but the app never sets `.dark`.~~
  **Done.** `src/lib/theme.ts` + `ThemeToggle` give light / dark / system; the choice is
  applied by an inline head script before first paint, and `color-scheme` is set so native
  controls follow. Remaining check: the hue-derived card colours in Skills & Mindset Cards
  keep their own light surfaces in dark mode — deliberate, but worth a contrast pass (A6).

### 8.3 Content and safeguarding

Several exercises touch anxiety, perfectionism, self-criticism, privilege, and ethical
distress. Specification for the hub:

- **C1** — Exercises in Stress & Anxiety / Beliefs & Thinking should carry a short framing
  note that they are coaching tools, not therapy.
- **C2** — A signposting line to student support services should be available from those
  exercises (configurable per institution).
- **C3** — Wheel of Privilege & Power in particular should state that it is for personal
  reflection and is not to be compared or shared without consent.

---

## 9. Known gaps and roadmap

### 9.1 Persistence — resolved for the single-device case

Losing a 45-minute Team Alignment session to an accidental navigation was the highest-impact
gap in the build. **Resolved:** per-exercise `localStorage` autosave with per-exercise and
global clear controls (§5.1), which keeps the no-backend, nothing-leaves-the-device posture.

Still open, in increasing order of cost:

1. **Import/export of a session file** (JSON download + upload) so work can move between
   devices, or be handed to a coach deliberately.
2. **Storage housekeeping** — nothing currently expires. A student who works twenty exercises
   keeps twenty saves indefinitely. Consider surfacing a "last worked on" date and an age-based
   prompt rather than silent deletion.
3. **Shared-device caution.** On a lab or library machine the next user of the same browser
   profile can read the previous student's answers. The banner says answers are saved on the
   device, but a coach-facing note about shared machines — or an explicit "don't save on this
   device" toggle — would be a genuine improvement.
4. Accounts and server-side storage — only if the hub's remit changes to include coach
   visibility of student work (§1.3), and only with an explicit data-protection review.

### 9.2 Export gaps

See §7.3. Priority order: print stylesheet (E2) → shared export primitive (E3/E4/E5) → the
nine missing export buttons (E1) → secondary formats (E6).

### 9.3 Coach-facing features (not yet built)

- A **coach mode / facilitator view** distinguishing solo-student exercises from
  coach-led ones (Team Alignment is already facilitator-shaped but is presented identically).
- **Session packs** — a curated sequence of exercises a coach can send as one link.
- **Deep-linkable state** for demonstrations (e.g. a pre-filled worked example).
- **Printable blank worksheets** for sessions without screens.

### 9.4 Housekeeping

- **shadcn/ui is entirely unused** — see §9.5 for the full analysis and recommendation.
- **TanStack Query** is mounted but performs no queries; keep only if server data is planned.
- **Template stubs** (`lib/api/example.functions.ts`, `lib/config.server.ts`) are unreferenced.
- **`CognitiveDistortions.tsx`** passes an expression (`step === "quiz"`) as a `useMemo`
  dependency to reshuffle the deck — it works but violates the rules-of-hooks convention and
  will trip lint tooling; it should key off `step` directly.
- **`README.md`** ~~still describes the project as a single-exercise request~~ — **done**,
  rewritten around the hub, its audience, and how to add an exercise.
- **The home page footer** ~~reads "Send a PDF to add it to the library"~~ — **done**, the
  internal workflow note is removed.
- **`hsl(var(--token))` was invalid everywhere it appeared** (24 occurrences across 11
  exercises). The design tokens hold oklch values, so wrapping them in `hsl()` produced an
  invalid colour: radar grids and spokes rendered as nothing, handles as black, and range
  and checkbox accents fell back to the browser default. **Fixed** to `var(--token)` — this
  was a light-mode bug too, dark mode just made it obvious.

### 9.5 The unused UI layer — analysis and recommendation

**The facts.**

| Measure | Value |
| --- | --- |
| Vendored shadcn/ui components in `src/components/ui/` | 46 files, ~4,360 lines |
| Imports of those components from any route or exercise | **0** |
| `package.json` dependencies reachable *only* from `src/components/ui/` | 24 `@radix-ui/*` packages plus `recharts`, `react-hook-form`, `@hookform/resolvers`, `sonner`, `date-fns`, `embla-carousel-react`, `lucide-react`, `input-otp`, `vaul`, `cmdk`, `react-day-picker`, `react-resizable-panels`, `class-variance-authority` |
| Disk footprint of those packages in `node_modules` | ≈ 92 MB of ~355 MB (`lucide-react` 45 MB, `date-fns` 28 MB, `recharts` 5.4 MB, `@radix-ui/*` 5.1 MB, `react-day-picker` 5.2 MB) |
| Bytes of that code in the shipped client bundle | **0** — the whole `assets/` output is 712 KB and contains no Radix, shadcn, or Recharts code |
| Share of the repo's non-prettier lint warnings coming from these files | 6 of 8 |

**What this does and doesn't cost.** It does *not* cost the student anything: Vite tree-shakes
unimported modules, so none of it ships. What it costs is everything around the build —
install and CI time on every run, ~92 MB of disk, 24+ extra packages of supply-chain surface
that must be audited and patched (the repo already carries a `seroval` override and a 24-hour
`minimumReleaseAge` guard, so this is a live concern here), lint noise that hides real
warnings, and — the biggest one — a misleading signal. A contributor opening
`src/components/ui/` reasonably concludes that shadcn is this project's component layer and
starts writing `<Card>`/`<Button>`/`<Dialog>` markup, while all 38 existing exercises compose
the seven primitives in `src/exercises/_shared.tsx`. That divergence would be much more
expensive to unpick later than it is to prevent now.

**Why it exists.** It is Lovable scaffolding: `components.json` and the whole `ui/` directory
come from the `tanstack_start_ts` template, not from a decision made for this project.

**The three options.**

1. **Adopt it.** Rebuild `_shared.tsx` on top of shadcn primitives and use them in new
   exercises. Gains accessible behaviour for free — Radix handles focus traps, keyboard
   navigation, and ARIA wiring that the hand-rolled primitives don't (directly relevant to
   the A1–A5 gaps in §8.2). Costs a migration across 38 exercises to avoid a two-system split,
   and buys components most of these exercises don't need (menubar, carousel, OTP input,
   date picker, sidebar, resizable panels).
2. **Prune it.** Delete `src/components/ui/`, `components.json`, and the dependencies reachable
   only from it. Smallest, fastest, most honest reflection of how the app is actually built.
   Risk: re-adding a component later means `npx shadcn add <name>` — which is a one-line
   operation, and the versions come back current rather than frozen.
3. **Prune selectively** — keep the handful worth adopting (`dialog`, `tooltip`,
   `radio-group`, `slider`, `checkbox`, `select`), drop the other 40 and their dependencies.

**Recommendation: option 3, in two steps.**

First, delete the components nothing plausibly needs and the dependencies that go with them:
`carousel` (+`embla-carousel-react`), `chart` (+`recharts` — the exercises draw their own SVG),
`calendar` (+`react-day-picker`, `date-fns`), `input-otp` (+`input-otp`), `menubar`,
`navigation-menu`, `context-menu`, `sidebar`, `resizable` (+`react-resizable-panels`),
`drawer` (+`vaul`), `command` (+`cmdk`), `form` (+`react-hook-form`, `@hookform/resolvers`),
`sonner` (+`sonner`), `pagination`, `breadcrumb`, `input-otp`, `aspect-ratio`, `table`,
`menubar`. That removes the great majority of the 92 MB and most of the supply-chain surface
without foreclosing anything.

Second, keep the small accessible set above and actually use it where it closes a real gap —
specifically `slider` and `radio-group`, which would give the radar exercises and the 1–5
scales the keyboard-operable equivalents that A1/A2 call for. Keeping components that are
used is not dead code; keeping 46 that aren't is.

Whichever option is taken, record it: if the answer is "prune", `components.json` should go
with it so `npx shadcn add` doesn't silently reintroduce the directory; if the answer is
"adopt", `_shared.tsx` should be re-expressed in terms of shadcn primitives so there is one
component layer rather than two.

### 9.6 Testing

There is no test tooling in the repository. Minimum useful coverage for a build of this shape:

- A catalogue integrity test: unique slugs, non-empty required fields, every `component`
  defined, `estimatedMinutes > 0`.
- Smoke render of every exercise's intro step (catches import/registration mistakes).
- Logic unit tests for the derived engines: pairwise tally/ranking (Prioritization Matrix),
  minute parsing (Enhanced To-Do), radar geometry, and the Box Breathing phase machine.

---

## 10. Contribution guide — adding an exercise

1. **Design the flow first.** Write the step list. Decide, per P1, whether any stage genuinely
   benefits from direct manipulation, or whether writing *is* the exercise.
2. **Create `src/exercises/<PascalCase>.tsx`** with a default-exported, zero-prop component.
3. **Put content in module-level consts**, not inline JSX.
4. **Open with `IntroGrid`** (What / Why / How).
5. **Use `_shared.tsx` primitives** for fields, buttons, and cards; use design tokens for
   colour (`var(--primary)`, never `hsl(var(--primary))` — the tokens are oklch values);
   reserve custom colour for semantic accents, and check it in both themes.
6. **Persist the student's work** with `usePersistentState(slug, field, initial)` from
   `@/lib/exercise-storage` in place of `useState`. Keep transient UI and timer state on
   plain `useState`, and never persist state that lives in a subcomponent rendered more than
   once (§5.1).
7. **End with a summary step** that omits empty answers and offers export.
8. **Register it in `src/lib/exercises.ts`** — slug (kebab-case, stable, never renamed once
   shared), title, one-sentence outcome-focused description, category (reuse an existing one
   unless genuinely new), lowercase tags, honest minute estimate, component.
9. **Cross-link** to related exercises by slug where relevant (P7).
10. **Check keyboard and mobile paths** for any drag interaction (A1), and check the exercise
    in both light and dark themes.
11. Run `npm run lint`.

No route needs to be added; the `/exercise/$slug` route and the home page pick it up from the
catalogue automatically.
