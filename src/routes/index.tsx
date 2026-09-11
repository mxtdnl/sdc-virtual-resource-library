import { createFileRoute, Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hult Student Development — Exercise Library" },
      {
        name: "description",
        content:
          "Interactive coaching exercises for undergraduate student development. Work through exercises on screen — no printing, no accounts.",
      },
      { property: "og:title", content: "Hult Student Development — Exercise Library" },
      {
        property: "og:description",
        content:
          "Interactive coaching exercises for undergraduate student development. Work through exercises on screen — no printing, no accounts.",
      },
    ],
  }),
  component: LandingPage,
});

function BauhausIllustration() {
  return (
    <svg
      viewBox="0 0 800 500"
      className="w-full h-auto"
      aria-hidden="true"
      role="img"
    >
      {/* Large ochre circle — bottom right */}
      <circle cx="620" cy="340" r="180" className="fill-ink-ochre/20" />
      {/* Red rectangle — left, angled */}
      <rect
        x="60"
        y="80"
        width="260"
        height="160"
        rx="4"
        className="fill-ink-red/15"
        transform="rotate(-6 190 160)"
      />
      {/* Purple circle — top right */}
      <circle cx="580" cy="100" r="90" className="fill-ink-purple/18" />
      {/* Orange diagonal band */}
      <rect
        x="200"
        y="200"
        width="500"
        height="50"
        rx="2"
        className="fill-ink-orange/14"
        transform="rotate(-12 450 225)"
      />
      {/* Small red circle — left */}
      <circle cx="140" cy="360" r="60" className="fill-ink-red/12" />
      {/* Brown rectangle — bottom left */}
      <rect
        x="30"
        y="300"
        width="180"
        height="100"
        rx="4"
        className="fill-ink-brown/12"
      />
      {/* Purple rectangle — mid */}
      <rect
        x="380"
        y="140"
        width="120"
        height="240"
        rx="4"
        className="fill-ink-purple/10"
        transform="rotate(8 440 260)"
      />
      {/* Ochre small circle — top left */}
      <circle cx="80" cy="60" r="40" className="fill-ink-ochre/16" />
      {/* Thin red diagonal line */}
      <line
        x1="100"
        y1="20"
        x2="700"
        y2="420"
        className="stroke-ink-red/20"
        strokeWidth="3"
      />
      {/* Thin orange horizontal line */}
      <line
        x1="0"
        y1="250"
        x2="800"
        y2="250"
        className="stroke-ink-orange/12"
        strokeWidth="2"
      />
      {/* Small purple square */}
      <rect
        x="520"
        y="50"
        width="40"
        height="40"
        className="fill-ink-purple/22"
        transform="rotate(15 540 70)"
      />
      {/* Ochre semi-circle at bottom */}
      <path
        d="M300,500 A120,120 0 0,1 540,500"
        className="fill-ink-ochre/14"
      />
      {/* Red vertical bar */}
      <rect
        x="700"
        y="60"
        width="30"
        height="300"
        rx="2"
        className="fill-ink-red/10"
      />
    </svg>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-gradient-to-b from-ink-ochre-soft/70 to-card/40 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <span className="text-sm font-medium tracking-tight text-ink-red-deep">
            Student Development Centre
          </span>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <div className="py-12 sm:py-16">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink-red-deep max-w-xl">
            Hult Student Development Exercise Library
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-xl">
            Interactive coaching exercises for undergraduate students. Pick an
            exercise, work through it on screen, and walk away with a structured
            result you can print or save — no PDFs, no accounts.
          </p>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden bg-card/40">
          <BauhausIllustration />
        </div>

        <div className="py-12 sm:py-16 grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="text-xs uppercase tracking-wider text-ink-orange font-semibold">
              How it works
            </h2>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="flex-none w-5 h-5 rounded-full bg-ink-red-soft text-ink-red text-xs font-semibold flex items-center justify-center">
                  1
                </span>
                <span>Browse by category or search for a topic</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-5 h-5 rounded-full bg-ink-red-soft text-ink-red text-xs font-semibold flex items-center justify-center">
                  2
                </span>
                <span>The student works through the exercise on screen</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none w-5 h-5 rounded-full bg-ink-red-soft text-ink-red text-xs font-semibold flex items-center justify-center">
                  3
                </span>
                <span>
                  A structured summary is generated — ready to print or save as
                  PDF
                </span>
              </li>
            </ol>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-wider text-ink-orange font-semibold">
              Why it's different
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed">
              <li className="flex gap-3">
                <span className="flex-none text-ink-orange" aria-hidden="true">
                  —
                </span>
                <span>
                  No accounts, no data collection — every answer stays on the
                  student's device
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none text-ink-orange" aria-hidden="true">
                  —
                </span>
                <span>
                  Time estimates on every exercise so you can plan your session
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-none text-ink-orange" aria-hidden="true">
                  —
                </span>
                <span>
                  Works on any device with a browser — phone, tablet, or laptop
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pb-16 sm:pb-20 flex justify-center">
          <Link
            to="/library"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
          >
            Browse the library
            <span
              className="inline-block transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
