// Rendering helpers.
//
// Several exercises (and both route components) use <Link>, which throws
// outside a router. These helpers mount the unit under test inside a real
// in-memory TanStack router whose paths mirror the app's, so links resolve and
// navigation is observable without booting the whole app.
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, type RenderResult, act } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

type Options = {
  /** Initial URL. Defaults to "/". */
  path?: string;
  /** Rendered at /exercise/$slug. Defaults to a stub, so links are followable. */
  exerciseRoute?: () => ReactNode;
};

export type RouterRenderResult = RenderResult & {
  /** Current location pathname, for asserting that a link navigated. */
  currentPath: () => string;
};

export async function renderWithRouter(
  ui: ReactElement,
  { path = "/", exerciseRoute }: Options = {},
): Promise<RouterRenderResult> {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => ui,
  });

  const libraryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/library",
    component: () => ui,
  });

  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/exercise/$slug",
    component: exerciseRoute ?? (() => <div data-testid="exercise-route" />),
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, libraryRoute, detailRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
    defaultPendingMinMs: 0,
  });

  let result!: RenderResult;
  await act(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result = render(<RouterProvider router={router as any} />);
  });
  await act(async () => {
    await router.load();
  });

  return Object.assign(result, {
    currentPath: () => router.state.location.pathname,
  });
}

/**
 * Mounts the real application router — the generated route tree, the root
 * layout and both real routes — at a given URL, in memory.
 *
 * This is the closest a unit test gets to the deployed app: loaders run,
 * `notFound()` resolves to the route's own not-found component, and links
 * navigate for real.
 */
// The root route object is shared across every helper call, so the shell it was
// created with is captured once rather than swapped in and out per render.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let capturedShell: any;

/** The root route's SSR shell component, whether or not renderApp has run. */
export async function rootShellComponent() {
  const { routeTree } = await import("@/routeTree.gen");
  return capturedShell ?? (routeTree.options as { shellComponent?: unknown }).shellComponent;
}

export async function renderApp(path = "/"): Promise<RouterRenderResult> {
  const [{ QueryClient }, { routeTree }] = await Promise.all([
    import("@tanstack/react-query"),
    import("@/routeTree.gen"),
  ]);

  // The root route's shellComponent renders a whole <html> document, which is
  // meaningful only for SSR; inside a jsdom container it would nest <html> in a
  // <div>. Route rendering is what these tests are about, so the shell is put
  // aside for the rest of the file (rootShellComponent() hands it back, and
  // src/routes/__tests__/root.test.tsx covers it directly).
  // `shellComponent` is a Start-only root option that the router's public types
  // don't model, hence the narrow cast.
  const rootOptions = routeTree.options as { shellComponent?: unknown };
  if (!capturedShell) capturedShell = rootOptions.shellComponent;
  rootOptions.shellComponent = undefined;

  const router = createRouter({
    routeTree,
    context: { queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  let result!: RenderResult;
  await act(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result = render(<RouterProvider router={router as any} />);
  });
  await act(async () => {
    await router.load();
  });

  return Object.assign(result, {
    currentPath: () => router.state.location.pathname,
  });
}
