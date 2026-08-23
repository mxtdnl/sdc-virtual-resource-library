import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { EXERCISES, getCategories } from "@/lib/exercises";
import { Route } from "@/routes/index";
import { renderApp } from "@/test/render";
import { routeMeta } from "@/test/route-options";

const savedKey = (slug: string) => `sdc-vrl:v1:${slug}:field`;

describe("library home", () => {
  it("lists every exercise", async () => {
    await renderApp("/");
    for (const exercise of EXERCISES) {
      expect(screen.getByRole("heading", { name: exercise.title })).toBeInTheDocument();
    }
  });

  it("shows each card's category, duration and tags", async () => {
    await renderApp("/");
    const first = EXERCISES[0];
    const card = screen.getByRole("heading", { name: first.title }).closest("a")!;

    expect(card).toHaveTextContent(first.category);
    expect(card).toHaveTextContent(`~${first.estimatedMinutes} min`);
    for (const tag of first.tags) expect(card).toHaveTextContent(tag);
    expect(card).toHaveAttribute("href", `/exercise/${first.slug}`);
  });

  it("offers a filter button per category, plus All", async () => {
    await renderApp("/");
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    for (const category of getCategories()) {
      expect(screen.getByRole("button", { name: category })).toBeInTheDocument();
    }
  });

  it("filters by category and back again", async () => {
    const user = userEvent.setup();
    await renderApp("/");
    const wellbeing = EXERCISES.filter((e) => e.category === "Wellbeing");

    await user.click(screen.getByRole("button", { name: "Wellbeing" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(wellbeing.length);

    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(EXERCISES.length);
  });

  it("searches titles", async () => {
    const user = userEvent.setup();
    await renderApp("/");

    await user.type(screen.getByPlaceholderText("Search exercises…"), "box breathing");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Box Breathing" })).toBeInTheDocument();
  });

  it("searches descriptions and tags too", async () => {
    const user = userEvent.setup();
    await renderApp("/");
    const search = screen.getByPlaceholderText("Search exercises…");

    await user.type(search, "eisenhower");
    expect(screen.getByRole("heading", { name: "Urgent-Important Matrix" })).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "perfectionism");
    const byTag = EXERCISES.filter((e) => e.tags.includes("perfectionism"));
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(byTag.length);
  });

  it("ignores case and surrounding whitespace in the search", async () => {
    const user = userEvent.setup();
    await renderApp("/");
    await user.type(screen.getByPlaceholderText("Search exercises…"), "  IKIGAI  ");
    expect(screen.getByRole("heading", { name: "Ikigai" })).toBeInTheDocument();
  });

  it("combines search with the category filter", async () => {
    const user = userEvent.setup();
    await renderApp("/");

    await user.click(screen.getByRole("button", { name: "Wellbeing" }));
    await user.type(screen.getByPlaceholderText("Search exercises…"), "ikigai");
    expect(screen.getByText("No exercises match your search.")).toBeInTheDocument();
  });

  it("explains an empty result", async () => {
    const user = userEvent.setup();
    await renderApp("/");
    await user.type(screen.getByPlaceholderText("Search exercises…"), "zzzzzz");

    expect(screen.getByText("No exercises match your search.")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("navigates to an exercise when its card is clicked", async () => {
    const user = userEvent.setup();
    const app = await renderApp("/");

    await user.click(screen.getByRole("heading", { name: "Ikigai" }).closest("a")!);
    await waitFor(() => expect(app.currentPath()).toBe("/exercise/ikigai"));
  });

  it("says nothing about saved work on a clean device", async () => {
    await renderApp("/");
    expect(screen.queryByText(/saved on this device/)).not.toBeInTheDocument();
  });

  it("badges exercises that have saved work and counts them", async () => {
    window.localStorage.setItem(savedKey("ikigai"), '"in progress"');
    window.localStorage.setItem(savedKey("box-breathing"), '"in progress"');
    await renderApp("/");

    await waitFor(() => expect(screen.getAllByText("In progress")).toHaveLength(2));
    expect(screen.getByText(/2 exercises saved on this device/)).toBeInTheDocument();

    const card = screen.getByRole("heading", { name: "Ikigai" }).closest("a")!;
    expect(within(card).getByText("In progress")).toBeInTheDocument();
  });

  it("uses the singular for one saved exercise", async () => {
    window.localStorage.setItem(savedKey("ikigai"), '"in progress"');
    await renderApp("/");
    await waitFor(() =>
      expect(screen.getByText(/1 exercise saved on this device/)).toBeInTheDocument(),
    );
  });

  it("offers the clear-memory button even on a clean device", async () => {
    const user = userEvent.setup();
    await renderApp("/");

    await user.click(screen.getByRole("button", { name: /clear memory/i }));
    expect(
      screen.getByText("No exercises are storing anything on this device."),
    ).toBeInTheDocument();
  });

  it("lists which exercises are storing memory, with their field counts", async () => {
    window.localStorage.setItem(savedKey("ikigai"), '"in progress"');
    window.localStorage.setItem("sdc-vrl:v1:ikigai:other", '"more"');
    window.localStorage.setItem(savedKey("box-breathing"), '"in progress"');
    const user = userEvent.setup();
    await renderApp("/");

    await user.click(await screen.findByRole("button", { name: /clear memory/i }));
    const card = screen.getByRole("dialog");

    expect(within(card).getByRole("checkbox", { name: /ikigai/i })).toBeInTheDocument();
    expect(within(card).getByText(/2 saved items/)).toBeInTheDocument();
    expect(within(card).getByText(/1 saved item$/)).toBeInTheDocument();
    expect(within(card).getByRole("checkbox", { name: /select all \(2\)/i })).toBeInTheDocument();
    // Untouched exercises are not listed.
    expect(within(card).queryByRole("checkbox", { name: /wheel of life/i })).toBeNull();
  });

  it("clears only the ticked exercises", async () => {
    window.localStorage.setItem(savedKey("ikigai"), '"in progress"');
    window.localStorage.setItem(savedKey("box-breathing"), '"in progress"');
    const user = userEvent.setup();
    await renderApp("/");

    await user.click(await screen.findByRole("button", { name: /clear memory/i }));
    const card = screen.getByRole("dialog");
    await user.click(within(card).getByRole("checkbox", { name: /ikigai/i }));
    await user.click(within(card).getByRole("button", { name: /clear selected \(1\)/i }));
    await user.click(within(card).getByRole("button", { name: /yes, clear selected/i }));

    await waitFor(() => expect(window.localStorage.getItem(savedKey("ikigai"))).toBeNull());
    expect(window.localStorage.getItem(savedKey("box-breathing"))).toBe('"in progress"');
    expect(within(card).getByRole("checkbox", { name: /box breathing/i })).toBeInTheDocument();
  });

  it("can cancel the confirmation without clearing", async () => {
    window.localStorage.setItem(savedKey("ikigai"), '"in progress"');
    const user = userEvent.setup();
    await renderApp("/");

    await user.click(await screen.findByRole("button", { name: /clear memory/i }));
    const card = screen.getByRole("dialog");
    await user.click(within(card).getByRole("checkbox", { name: /ikigai/i }));
    await user.click(within(card).getByRole("button", { name: /clear selected \(1\)/i }));
    await user.click(within(card).getByRole("button", { name: /^cancel$/i }));

    expect(window.localStorage.getItem(savedKey("ikigai"))).toBe('"in progress"');
    expect(within(card).getByRole("button", { name: /clear selected \(1\)/i })).toBeInTheDocument();
  });

  it("cannot clear with nothing ticked", async () => {
    window.localStorage.setItem(savedKey("ikigai"), '"in progress"');
    const user = userEvent.setup();
    await renderApp("/");

    await user.click(await screen.findByRole("button", { name: /clear memory/i }));
    expect(screen.getByRole("button", { name: /clear selected \(0\)/i })).toBeDisabled();
  });

  it("select all clears everything at once, leaving the theme alone", async () => {
    window.localStorage.setItem(savedKey("ikigai"), '"in progress"');
    window.localStorage.setItem(savedKey("box-breathing"), '"in progress"');
    window.localStorage.setItem("sdc-vrl:theme", "dark");
    const user = userEvent.setup();
    await renderApp("/");

    await user.click(await screen.findByRole("button", { name: /clear memory/i }));
    const card = screen.getByRole("dialog");
    await user.click(within(card).getByRole("checkbox", { name: /select all/i }));
    await user.click(within(card).getByRole("button", { name: /clear selected \(2\)/i }));
    await user.click(within(card).getByRole("button", { name: /yes, clear everything/i }));

    await waitFor(() => expect(screen.queryByText("In progress")).not.toBeInTheDocument());
    expect(window.localStorage.getItem(savedKey("ikigai"))).toBeNull();
    expect(window.localStorage.getItem(savedKey("box-breathing"))).toBeNull();
    // The theme is not exercise data and must survive.
    expect(window.localStorage.getItem("sdc-vrl:theme")).toBe("dark");
  });

  it("closes the card without touching anything", async () => {
    window.localStorage.setItem(savedKey("ikigai"), '"in progress"');
    const user = userEvent.setup();
    await renderApp("/");

    await user.click(await screen.findByRole("button", { name: /clear memory/i }));
    await user.click(screen.getByRole("button", { name: /^close$/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.localStorage.getItem(savedKey("ikigai"))).toBe('"in progress"');
  });

  it("closes the card on Escape", async () => {
    const user = userEvent.setup();
    await renderApp("/");

    await user.click(screen.getByRole("button", { name: /clear memory/i }));
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("offers the theme toggle", async () => {
    await renderApp("/");
    expect(screen.getByRole("radiogroup", { name: "Colour theme" })).toBeInTheDocument();
  });

  it("declares page metadata for search engines and link previews", () => {
    const meta = routeMeta(Route.options.head);
    const title = meta.find((m) => "title" in m);
    const description = meta.find((m) => m.name === "description");

    expect(title).toEqual({ title: "Coaching Exercise Library — Interactive Worksheets" });
    expect(description?.content).toMatch(/library of interactive coaching exercises/i);
    expect(meta.find((m) => m.property === "og:title")).toBeTruthy();
    expect(meta.find((m) => m.property === "og:description")).toBeTruthy();
  });
});
