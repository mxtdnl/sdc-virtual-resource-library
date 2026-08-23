# SDC Virtual Resource Library

A virtual resource hub for **coaches working with undergraduate students**. It replaces a
folder of printable worksheets with a browsable library of interactive coaching exercises
that students work through on screen and leave with a clear, structured result.

**Live app**: https://coach-spark-space.lovable.app

Full technical and design specification: [`SPEC.md`](./SPEC.md).

---

## What's in it

**37 exercises across 15 categories** — Beliefs & Thinking, Calming Techniques, Communication,
Creativity, Decision-Making, Habits & Behaviour, Prioritization, Productivity, Public
Speaking, Purpose & Direction, Reflection, Self-Awareness, Stress & Anxiety, Teamwork, and
Wellbeing — ranging from a 3-minute box-breathing timer to a 45-minute team alignment session.

Exercises are genuinely interactive rather than digitised paper: draggable satisfaction
wheels, drag-and-drop sorting into circles of control, a pairwise comparison engine for
prioritisation, card decks, timed brainstorming sprints, and guided step-by-step builders.

## Who it's for

| Audience | How they use it |
| --- | --- |
| **Coach, 1:1** | Works the exercise alongside a student; it structures the conversation and captures the output. |
| **Coach, group** | Projects a facilitator-shaped exercise (e.g. Team Alignment) and runs it with a team. |
| **Student, self-serve** | Browses by category or search between sessions and works something alone. |
| **Student, pre/post-session** | Completes an exercise as prep or homework and brings the result to the next session. |

## How it works

- **Every exercise opens with What / Why / How** so a student can use it with no coach present.
- **One step at a time.** Each exercise is a step machine with explicit forward/back controls.
- **Every exercise ends in a summary** — the student's own inputs played back as a clean,
  readable document, ready to print or save as a PDF.
- **Honest time estimates** on every card, so a coach can pick something that fits the slot.
- **Exercises cross-link.** The Skills & Mindset cards point at the activities that develop
  each skill; the perfectionism hub links out to six related exercises.

### Privacy

**Nothing a student writes leaves their browser.** There are no accounts, no server-side
storage, and no analytics on answers.

Work in progress is autosaved to `localStorage` on the student's own device, namespaced per
exercise (`sdc-vrl:v1:<slug>:<field>`), so a refresh or an accidental navigation doesn't lose
a session. Exercises with saved work show an "In progress" badge in the library, and answers
can be cleared per exercise, or from the library's "Clear memory" card, which lists what each
exercise is storing and clears whichever ones are ticked.

### Theme

Light, dark, and follow-the-system, chosen from the control in the header. The choice is
stored on the device and applied before first paint, and it survives clearing saved answers.

## Development

Node.js 22 and npm (or Bun).

```sh
git clone <this-repository-url>
cd sdc-virtual-resource-library
npm install
npm run dev        # dev server
npm run build      # production build
npm test           # the full test suite
npm run test:watch # re-run affected tests while editing
npm run typecheck  # tsc --noEmit
npm run verify     # typecheck + tests (what CI gates on)
npm run lint       # eslint
npm run format     # prettier
```

### Testing

Every feature is covered by a Vitest + Testing Library suite that runs on every build, and
the GitHub Pages deploy publishes nothing unless it passes. The per-exercise contract test
covers each exercise automatically from the catalogue, so a new exercise is tested the
moment it is registered. See [`TESTING.md`](./TESTING.md).

### Stack

TypeScript · React 19 · TanStack Start & Router (file-based routing, SSR/prerender) ·
Tailwind CSS 4 with oklch design tokens · Vite 7. No backend, no database.

### Project layout

```
src/routes/           index (library) and exercise/$slug; __root is the app shell
src/lib/exercises.ts  the catalogue — the single source of truth
src/lib/exercise-storage.ts  per-exercise localStorage autosave
src/components/ClearMemoryDialog.tsx  "Clear memory" button + per-exercise clear card
src/lib/theme.ts      light / dark / system theme
src/exercises/        one component per exercise, plus _shared.tsx primitives
src/styles.css        design tokens (light + dark) and Tailwind entry
```

### Adding an exercise

It's a two-file change — no route, no config:

1. Create `src/exercises/YourExercise.tsx` with a default-exported, zero-prop component.
   Keep content in module-level consts, open with `IntroGrid`, use the primitives in
   `_shared.tsx`, and end with a summary step offering print/save.
2. Append an entry to `EXERCISES` in `src/lib/exercises.ts` (slug, title, description,
   category, tags, estimated minutes, component).

Categories, filters, search, routing, page metadata — and the test suite — all derive from
the catalogue: registering the exercise is what puts it under test.
Use `usePersistentState(slug, field, initial)` from `@/lib/exercise-storage` in place of
`useState` for anything the student types or chooses — keep transient UI state (drag targets,
timers, hover) on plain `useState`.

See [`SPEC.md`](./SPEC.md) §6 for the full exercise format and §10 for the contribution
checklist.

## Deployment

Two targets build from the same source:

- **Lovable / SSR** — `vite.config.ts` (Lovable owns this file; changes made in the
  [Lovable editor](https://lovable.dev/projects/4951fccf-ea14-447e-a1ae-d8802f359c80) commit
  straight to this repository, and pushes to `main` sync back).
- **GitHub Pages** — `vite.config.pages.ts` prerenders every route to static HTML;
  `.github/workflows/deploy-pages.yml` builds and deploys on push to `main`. The base path is
  derived from the repository name at run time, overridable with the `PAGES_BASE` repository
  variable.
