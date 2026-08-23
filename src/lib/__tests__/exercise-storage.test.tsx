import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearAllExercises,
  clearExercise,
  clearExercises,
  hasSavedWork,
  onStorageChange,
  savedFieldCount,
  savedMemory,
  savedSlugs,
  usePersistentState,
  useSavedMemory,
  useHasSavedWork,
  useSavedSlugs,
} from "@/lib/exercise-storage";
import { THEME_KEY } from "@/lib/theme";

const key = (slug: string, field: string) => `sdc-vrl:v1:${slug}:${field}`;

/** Replace window.localStorage for one test, restoring it afterwards. */
const originalStorage = Object.getOwnPropertyDescriptor(window, "localStorage")!;
function stubStorage(stub: unknown) {
  Object.defineProperty(window, "localStorage", { value: stub, configurable: true });
}
afterEach(() => {
  Object.defineProperty(window, "localStorage", originalStorage);
});

describe("key namespacing", () => {
  it("writes under sdc-vrl:v1:<slug>:<field>", async () => {
    const { result } = renderHook(() => usePersistentState<string>("demo", "note", "start"));
    act(() => result.current[1]("typed"));

    await waitFor(() => expect(window.localStorage.getItem(key("demo", "note"))).toBe('"typed"'));
  });

  it("keeps two exercises' answers apart", async () => {
    const a = renderHook(() => usePersistentState<string>("alpha", "note", ""));
    const b = renderHook(() => usePersistentState<string>("beta", "note", ""));

    act(() => a.result.current[1]("from alpha"));
    act(() => b.result.current[1]("from beta"));

    await waitFor(() => {
      expect(window.localStorage.getItem(key("alpha", "note"))).toBe('"from alpha"');
      expect(window.localStorage.getItem(key("beta", "note"))).toBe('"from beta"');
    });
  });
});

describe("usePersistentState", () => {
  it("returns the initial value on first render", () => {
    const { result } = renderHook(() => usePersistentState("demo", "field", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("accepts a lazy initial value", () => {
    const factory = vi.fn(() => ({ count: 1 }));
    const { result } = renderHook(() => usePersistentState("demo", "field", factory));
    expect(result.current[0]).toEqual({ count: 1 });
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("does not write anything when the value is never touched", async () => {
    renderHook(() => usePersistentState("demo", "field", "default"));
    await act(async () => {});
    expect(window.localStorage.length).toBe(0);
    expect(hasSavedWork("demo")).toBe(false);
  });

  it("restores a saved value on mount", async () => {
    window.localStorage.setItem(key("demo", "field"), JSON.stringify("saved"));

    const { result } = renderHook(() => usePersistentState("demo", "field", "default"));
    await waitFor(() => expect(result.current[0]).toBe("saved"));
  });

  it("restores a falsy saved value rather than falling back to the default", async () => {
    window.localStorage.setItem(key("demo", "flag"), JSON.stringify(false));

    const { result } = renderHook(() => usePersistentState("demo", "flag", true));
    await waitFor(() => expect(result.current[0]).toBe(false));
  });

  it("supports functional updates", async () => {
    const { result } = renderHook(() => usePersistentState<number>("demo", "count", 0));
    act(() => result.current[1]((n) => n + 1));
    act(() => result.current[1]((n) => n + 1));

    expect(result.current[0]).toBe(2);
    await waitFor(() => expect(window.localStorage.getItem(key("demo", "count"))).toBe("2"));
  });

  it("round-trips objects and arrays", async () => {
    const value = { rows: [{ text: "a", done: true }], tags: ["x", "y"] };
    const first = renderHook(() =>
      usePersistentState<typeof value>("demo", "rows", { rows: [], tags: [] }),
    );
    act(() => first.result.current[1](value));
    await waitFor(() => expect(window.localStorage.getItem(key("demo", "rows"))).toBeTruthy());
    first.unmount();

    const second = renderHook(() =>
      usePersistentState<typeof value>("demo", "rows", { rows: [], tags: [] }),
    );
    await waitFor(() => expect(second.result.current[0]).toEqual(value));
  });

  it("round-trips a Set through its envelope", async () => {
    const first = renderHook(() =>
      usePersistentState<Set<string>>("demo", "picked", () => new Set()),
    );
    act(() => first.result.current[1](new Set(["a", "b"])));
    await waitFor(() =>
      expect(window.localStorage.getItem(key("demo", "picked"))).toBe(
        '{"__t":"Set","v":["a","b"]}',
      ),
    );
    first.unmount();

    const second = renderHook(() =>
      usePersistentState<Set<string>>("demo", "picked", () => new Set()),
    );
    await waitFor(() => {
      expect(second.result.current[0]).toBeInstanceOf(Set);
      expect([...second.result.current[0]]).toEqual(["a", "b"]);
    });
  });

  it("round-trips a Set nested inside an object", async () => {
    type Shape = { chosen: Set<number> };
    const first = renderHook(() =>
      usePersistentState<Shape>("demo", "nested", () => ({ chosen: new Set<number>() })),
    );
    act(() => first.result.current[1]({ chosen: new Set([1, 2]) }));
    await waitFor(() => expect(window.localStorage.getItem(key("demo", "nested"))).toBeTruthy());
    first.unmount();

    const second = renderHook(() =>
      usePersistentState<Shape>("demo", "nested", () => ({ chosen: new Set<number>() })),
    );
    await waitFor(() => expect([...second.result.current[0].chosen]).toEqual([1, 2]));
  });

  it("falls back to the initial value when the stored entry is corrupt", async () => {
    window.localStorage.setItem(key("demo", "field"), "{not json");

    const { result } = renderHook(() => usePersistentState("demo", "field", "default"));
    await act(async () => {});
    expect(result.current[0]).toBe("default");
  });

  it("keeps a corrupt entry until the value actually changes", async () => {
    window.localStorage.setItem(key("demo", "field"), "{not json");
    const { result } = renderHook(() => usePersistentState("demo", "field", "default"));

    act(() => result.current[1]("repaired"));
    await waitFor(() =>
      expect(window.localStorage.getItem(key("demo", "field"))).toBe('"repaired"'),
    );
  });

  it("does not re-save a value that matches what is already stored", async () => {
    window.localStorage.setItem(key("demo", "field"), JSON.stringify("saved"));
    const { result } = renderHook(() => usePersistentState("demo", "field", "default"));
    await waitFor(() => expect(result.current[0]).toBe("saved"));

    const spy = vi.spyOn(Storage.prototype, "setItem");
    act(() => result.current[1]("saved"));
    await act(async () => {});
    expect(spy).not.toHaveBeenCalled();
  });

  it("survives a cyclic value instead of throwing", async () => {
    type Cyclic = { self?: unknown };
    const cyclic: Cyclic = {};
    cyclic.self = cyclic;

    const { result } = renderHook(() => usePersistentState<Cyclic>("demo", "cyclic", {}));
    act(() => result.current[1](cyclic));
    await act(async () => {});

    expect(result.current[0]).toBe(cyclic);
    expect(window.localStorage.getItem(key("demo", "cyclic"))).toBeNull();
  });

  it("keeps working in memory when localStorage is unavailable", async () => {
    stubStorage({
      get length(): number {
        throw new Error("denied");
      },
      getItem: () => {
        throw new Error("denied");
      },
      setItem: () => {
        throw new Error("denied");
      },
      removeItem: () => {
        throw new Error("denied");
      },
      key: () => {
        throw new Error("denied");
      },
    });

    const { result } = renderHook(() => usePersistentState("demo", "field", "default"));
    act(() => result.current[1]("typed"));
    await act(async () => {});
    expect(result.current[0]).toBe("typed");
  });

  it("keeps working when a write is rejected mid-session (quota exceeded)", async () => {
    const { result } = renderHook(() => usePersistentState("demo", "field", "default"));
    await act(async () => {});

    vi.spyOn(Storage.prototype, "setItem").mockImplementation((k: string) => {
      if (String(k).startsWith("sdc-vrl:v1:demo")) throw new Error("QuotaExceededError");
    });

    act(() => result.current[1]("typed"));
    await act(async () => {});
    expect(result.current[0]).toBe("typed");
  });

  it("drives a real controlled input end to end", async () => {
    const user = userEvent.setup();
    function Demo() {
      const [text, setText] = usePersistentState("demo", "note", "");
      return (
        <label>
          Note
          <textarea value={text} onChange={(e) => setText(e.target.value)} />
        </label>
      );
    }

    const { unmount } = render(<Demo />);
    await user.type(screen.getByLabelText("Note"), "hello");
    await waitFor(() => expect(window.localStorage.getItem(key("demo", "note"))).toBe('"hello"'));

    unmount();
    render(<Demo />);
    await waitFor(() => expect(screen.getByLabelText("Note")).toHaveValue("hello"));
  });
});

describe("hasSavedWork / savedSlugs", () => {
  it("reports nothing for a clean device", () => {
    expect(hasSavedWork("demo")).toBe(false);
    expect(savedSlugs()).toEqual([]);
  });

  it("detects saved work per slug", () => {
    window.localStorage.setItem(key("alpha", "note"), '"x"');
    expect(hasSavedWork("alpha")).toBe(true);
    expect(hasSavedWork("beta")).toBe(false);
  });

  it("does not confuse a slug with one that has it as a prefix", () => {
    window.localStorage.setItem(key("wheel-of-life-extended", "note"), '"x"');
    expect(hasSavedWork("wheel-of-life")).toBe(false);
    expect(savedSlugs()).toEqual(["wheel-of-life-extended"]);
  });

  it("lists each slug once, regardless of how many fields it saved", () => {
    window.localStorage.setItem(key("alpha", "a"), '"1"');
    window.localStorage.setItem(key("alpha", "b"), '"2"');
    window.localStorage.setItem(key("beta", "a"), '"3"');
    expect(savedSlugs().sort()).toEqual(["alpha", "beta"]);
  });

  it("ignores unrelated keys, including the theme choice", () => {
    window.localStorage.setItem(THEME_KEY, "dark");
    window.localStorage.setItem("some-other-app", "value");
    window.localStorage.setItem("sdc-vrl:v0:legacy:note", '"old"');
    expect(savedSlugs()).toEqual([]);
    expect(hasSavedWork("legacy")).toBe(false);
  });

  it("reports nothing when storage is unavailable", () => {
    stubStorage(null);
    expect(hasSavedWork("alpha")).toBe(false);
    expect(savedSlugs()).toEqual([]);
  });
});

describe("clearExercise / clearAllExercises", () => {
  it("clears only the named exercise", () => {
    window.localStorage.setItem(key("alpha", "a"), '"1"');
    window.localStorage.setItem(key("alpha", "b"), '"2"');
    window.localStorage.setItem(key("beta", "a"), '"3"');

    clearExercise("alpha");

    expect(hasSavedWork("alpha")).toBe(false);
    expect(window.localStorage.getItem(key("beta", "a"))).toBe('"3"');
  });

  it("clears every exercise but leaves the theme and foreign keys alone", () => {
    window.localStorage.setItem(key("alpha", "a"), '"1"');
    window.localStorage.setItem(key("beta", "a"), '"2"');
    window.localStorage.setItem(THEME_KEY, "dark");
    window.localStorage.setItem("unrelated", "keep");

    clearAllExercises();

    expect(savedSlugs()).toEqual([]);
    expect(window.localStorage.getItem(THEME_KEY)).toBe("dark");
    expect(window.localStorage.getItem("unrelated")).toBe("keep");
  });

  it("is a no-op on a clean device", () => {
    expect(() => clearExercise("nothing")).not.toThrow();
    expect(() => clearAllExercises()).not.toThrow();
  });

  it("is a no-op when storage is unavailable", () => {
    stubStorage(null);
    expect(() => clearExercise("alpha")).not.toThrow();
    expect(() => clearAllExercises()).not.toThrow();
  });
});

describe("savedFieldCount / savedMemory", () => {
  it("counts the fields each exercise is storing", () => {
    window.localStorage.setItem(key("alpha", "a"), '"1"');
    window.localStorage.setItem(key("alpha", "b"), '"2"');
    window.localStorage.setItem(key("beta", "a"), '"3"');
    window.localStorage.setItem(THEME_KEY, "dark");

    expect(savedFieldCount("alpha")).toBe(2);
    expect(savedFieldCount("beta")).toBe(1);
    expect(savedFieldCount("gamma")).toBe(0);
    expect(savedMemory().sort((x, y) => x.slug.localeCompare(y.slug))).toEqual([
      { slug: "alpha", fields: 2 },
      { slug: "beta", fields: 1 },
    ]);
  });

  it("reports nothing on a clean device or when storage is unavailable", () => {
    expect(savedMemory()).toEqual([]);
    stubStorage(null);
    expect(savedMemory()).toEqual([]);
    expect(savedFieldCount("alpha")).toBe(0);
  });
});

describe("clearExercises (several at once)", () => {
  it("clears exactly the named exercises", () => {
    window.localStorage.setItem(key("alpha", "a"), '"1"');
    window.localStorage.setItem(key("beta", "a"), '"2"');
    window.localStorage.setItem(key("gamma", "a"), '"3"');

    clearExercises(["alpha", "gamma"]);

    expect(savedSlugs()).toEqual(["beta"]);
  });

  it("does not clear a slug that merely shares a prefix", () => {
    window.localStorage.setItem(key("wheel-of-life", "a"), '"1"');
    window.localStorage.setItem(key("wheel-of-life-extended", "a"), '"2"');

    clearExercises(["wheel-of-life"]);

    expect(savedSlugs()).toEqual(["wheel-of-life-extended"]);
  });

  it("announces a single change for the whole batch", () => {
    window.localStorage.setItem(key("alpha", "a"), '"1"');
    window.localStorage.setItem(key("beta", "a"), '"2"');
    const listener = vi.fn();
    const unsubscribe = onStorageChange(listener);

    clearExercises(["alpha", "beta"]);

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("is a no-op for an empty list, a clean device, or unavailable storage", () => {
    window.localStorage.setItem(key("alpha", "a"), '"1"');
    clearExercises([]);
    expect(savedSlugs()).toEqual(["alpha"]);

    expect(() => clearExercises(["nothing"])).not.toThrow();
    stubStorage(null);
    expect(() => clearExercises(["alpha"])).not.toThrow();
  });
});

describe("useSavedMemory", () => {
  it("starts empty and then reports what is stored, live", async () => {
    window.localStorage.setItem(key("alpha", "a"), '"1"');
    const { result } = renderHook(() => useSavedMemory());

    await waitFor(() => expect(result.current).toEqual([{ slug: "alpha", fields: 1 }]));

    act(() => clearExercises(["alpha"]));
    await waitFor(() => expect(result.current).toEqual([]));
  });
});

describe("onStorageChange", () => {
  it("fires on a save and on a clear", async () => {
    const listener = vi.fn();
    const unsubscribe = onStorageChange(listener);

    const { result } = renderHook(() => usePersistentState("demo", "field", ""));
    act(() => result.current[1]("typed"));
    await waitFor(() => expect(listener).toHaveBeenCalled());

    listener.mockClear();
    act(() => clearExercise("demo"));
    expect(listener).toHaveBeenCalled();

    unsubscribe();
  });

  it("fires on a 'storage' event from another tab", () => {
    const listener = vi.fn();
    const unsubscribe = onStorageChange(listener);
    window.dispatchEvent(new Event("storage"));
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("stops firing once unsubscribed", () => {
    const listener = vi.fn();
    onStorageChange(listener)();
    clearAllExercises();
    window.dispatchEvent(new Event("storage"));
    expect(listener).not.toHaveBeenCalled();
  });
});

describe("useSavedSlugs / useHasSavedWork", () => {
  it("starts empty and picks up saved work live", async () => {
    const { result } = renderHook(() => useSavedSlugs());
    expect(result.current.size).toBe(0);

    const hook = renderHook(() => usePersistentState("alpha", "field", ""));
    act(() => hook.result.current[1]("typed"));

    await waitFor(() => expect(result.current.has("alpha")).toBe(true));

    act(() => clearAllExercises());
    await waitFor(() => expect(result.current.size).toBe(0));
  });

  it("tracks one exercise's saved state live", async () => {
    const { result } = renderHook(() => useHasSavedWork("alpha"));
    expect(result.current).toBe(false);

    const hook = renderHook(() => usePersistentState("alpha", "field", ""));
    act(() => hook.result.current[1]("typed"));
    await waitFor(() => expect(result.current).toBe(true));

    act(() => clearExercise("alpha"));
    await waitFor(() => expect(result.current).toBe(false));
  });

  it("re-checks when the watched slug changes", async () => {
    window.localStorage.setItem(key("beta", "field"), '"x"');
    const { result, rerender } = renderHook(({ slug }) => useHasSavedWork(slug), {
      initialProps: { slug: "alpha" },
    });
    await waitFor(() => expect(result.current).toBe(false));

    rerender({ slug: "beta" });
    await waitFor(() => expect(result.current).toBe(true));
  });

  it("unsubscribes on unmount", () => {
    const { unmount } = renderHook(() => useSavedSlugs());
    const spy = vi.spyOn(window, "removeEventListener");
    unmount();
    expect(spy).toHaveBeenCalledWith("sdc-vrl:storage", expect.any(Function));
    expect(spy).toHaveBeenCalledWith("storage", expect.any(Function));
  });
});

describe("remount-after-clear (how the exercise page resets state)", () => {
  it("comes back at its defaults after clearExercise + remount", async () => {
    function Demo() {
      const [text, setText] = usePersistentState("demo", "note", "default");
      return <button onClick={() => setText("typed")}>{text}</button>;
    }
    function Host() {
      const [generation, setGeneration] = useState(0);
      return (
        <>
          <button
            onClick={() => {
              clearExercise("demo");
              setGeneration((g) => g + 1);
            }}
          >
            clear
          </button>
          <Demo key={generation} />
        </>
      );
    }

    const user = userEvent.setup();
    render(<Host />);

    await user.click(screen.getByRole("button", { name: "default" }));
    await waitFor(() => expect(window.localStorage.getItem(key("demo", "note"))).toBe('"typed"'));

    await user.click(screen.getByRole("button", { name: "clear" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "default" })).toBeInTheDocument(),
    );
    await act(async () => {});
    expect(window.localStorage.getItem(key("demo", "note"))).toBeNull();
  });
});
