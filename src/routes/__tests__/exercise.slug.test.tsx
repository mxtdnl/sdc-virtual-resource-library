import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { EXERCISES, getExercise } from "@/lib/exercises";
import { Route } from "@/routes/exercise.$slug";
import { renderApp } from "@/test/render";
import { routeLoader, routeMeta } from "@/test/route-options";

const IKIGAI = getExercise("ikigai")!;

describe("exercise page", () => {
  it("renders the exercise named in the URL", async () => {
    const { container } = await renderApp("/exercise/ikigai");
    const header = within(container.querySelector("header")!);
    expect(header.getByRole("heading", { name: IKIGAI.title, level: 1 })).toBeInTheDocument();
  });

  it("shows the category and duration alongside the title", async () => {
    await renderApp("/exercise/ikigai");
    expect(
      screen.getByText(`${IKIGAI.category} · ~${IKIGAI.estimatedMinutes} min`),
    ).toBeInTheDocument();
  });

  it("links back to the library", async () => {
    const user = userEvent.setup();
    const app = await renderApp("/exercise/ikigai");

    await user.click(screen.getByRole("link", { name: /library/i }));
    await waitFor(() => expect(app.currentPath()).toBe("/library"));
  });

  it("shows a not-found page for an unknown slug", async () => {
    await renderApp("/exercise/does-not-exist");
    expect(screen.getByRole("heading", { name: /exercise not found/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to library/i })).toBeInTheDocument();
  });

  it("offers the theme toggle on the exercise page too", async () => {
    await renderApp("/exercise/ikigai");
    expect(screen.getByRole("radiogroup", { name: "Colour theme" })).toBeInTheDocument();
  });

  it("hides the chrome from print output", async () => {
    const { container } = await renderApp("/exercise/ikigai");
    expect(container.querySelector("header")!.className).toContain("no-print");
  });

  it("adds a print-only heading block with the date", async () => {
    const { container } = await renderApp("/exercise/ikigai");
    const printBlock = container.querySelector(".print\\:block")!;
    expect(printBlock).toHaveTextContent(IKIGAI.title);
    expect(printBlock).toHaveTextContent(new Date().toLocaleDateString());
  });

  describe("saved-answer banner", () => {
    it("stays hidden until something is saved", async () => {
      await renderApp("/exercise/ikigai");
      expect(screen.queryByText(/answers are saved on this device/i)).not.toBeInTheDocument();
    });

    it("appears once the exercise saves something", async () => {
      window.localStorage.setItem("sdc-vrl:v1:ikigai:love", '"writing"');
      await renderApp("/exercise/ikigai");
      expect(await screen.findByText(/answers are saved on this device/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /clear saved answers/i })).toBeInTheDocument();
    });

    it("asks before clearing, and cancelling keeps the answers", async () => {
      window.localStorage.setItem("sdc-vrl:v1:ikigai:love", '"writing"');
      const user = userEvent.setup();
      await renderApp("/exercise/ikigai");

      await user.click(await screen.findByRole("button", { name: /clear saved answers/i }));
      expect(screen.getByText(/clear your answers\?/i)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /^cancel$/i }));
      expect(window.localStorage.getItem("sdc-vrl:v1:ikigai:love")).toBe('"writing"');
    });

    it("clears this exercise only, leaving other exercises alone", async () => {
      window.localStorage.setItem("sdc-vrl:v1:ikigai:love", '"writing"');
      window.localStorage.setItem("sdc-vrl:v1:box-breathing:totalCycles", "6");
      const user = userEvent.setup();
      await renderApp("/exercise/ikigai");

      await user.click(await screen.findByRole("button", { name: /clear saved answers/i }));
      await user.click(screen.getByRole("button", { name: /yes, clear/i }));

      await waitFor(() => expect(window.localStorage.getItem("sdc-vrl:v1:ikigai:love")).toBeNull());
      expect(window.localStorage.getItem("sdc-vrl:v1:box-breathing:totalCycles")).toBe("6");
      expect(screen.queryByText(/answers are saved on this device/i)).not.toBeInTheDocument();
    });

    it("resets the exercise back to its defaults when cleared", async () => {
      const user = userEvent.setup();
      await renderApp("/exercise/smart-goals");

      const goal = screen.getAllByRole("textbox")[0];
      await user.type(goal, "Land an internship");
      await waitFor(() =>
        expect(screen.getByText(/answers are saved on this device/i)).toBeInTheDocument(),
      );

      await user.click(screen.getByRole("button", { name: /clear saved answers/i }));
      await user.click(screen.getByRole("button", { name: /yes, clear/i }));

      await waitFor(() => expect(screen.getAllByRole("textbox")[0]).toHaveValue(""));
    });
  });

  describe("route configuration", () => {
    it("loads only serializable metadata, not the component", () => {
      const data = routeLoader<Record<string, unknown>>(Route.options.loader, {
        params: { slug: "ikigai" },
      });
      expect(data).toEqual({
        slug: IKIGAI.slug,
        title: IKIGAI.title,
        description: IKIGAI.description,
        category: IKIGAI.category,
        tags: IKIGAI.tags,
        estimatedMinutes: IKIGAI.estimatedMinutes,
      });
      expect(data).not.toHaveProperty("component");
    });

    it("throws a not-found for an unknown slug", () => {
      expect(() => routeLoader(Route.options.loader, { params: { slug: "nope" } })).toThrow();
    });

    it("titles the page after the exercise", () => {
      const meta = routeMeta(Route.options.head, {
        loaderData: { title: "Ikigai", description: "desc" },
      });
      expect(meta).toEqual(
        expect.arrayContaining([
          { title: "Ikigai — Coaching Exercise Library" },
          { name: "description", content: "desc" },
          { property: "og:title", content: "Ikigai" },
          { property: "og:description", content: "desc" },
        ]),
      );
    });

    it("falls back to a not-found title when there is no loader data", () => {
      const meta = routeMeta(Route.options.head, { loaderData: undefined });
      expect(meta).toEqual([{ title: "Exercise not found" }]);
    });
  });

  describe.each(EXERCISES.map((e) => [e.slug, e.title] as const))("/exercise/%s", (slug, title) => {
    it(`serves ${title}`, async () => {
      const app = await renderApp(`/exercise/${slug}`);
      expect(app.currentPath()).toBe(`/exercise/${slug}`);
      // The title appears twice: in the page header and in the print block.
      expect(screen.getAllByRole("heading", { name: title, level: 1 })).toHaveLength(2);
      expect(
        screen.queryByRole("heading", { name: /exercise not found/i }),
      ).not.toBeInTheDocument();
    });
  });
});
