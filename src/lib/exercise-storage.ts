import { useCallback, useEffect, useRef, useState } from "react";

// Per-exercise autosave.
//
// Everything a student types stays on their own device: one localStorage key
// per exercise field, namespaced by the exercise slug so exercises can never
// read each other's answers. Nothing is sent anywhere.
//
//   sdc-vrl:v1:<slug>:<field>
//
// Bump VERSION if a stored shape changes incompatibly — old keys are then
// ignored (and swept on next write) rather than fed to a component that no
// longer understands them.

const VERSION = "v1";
const PREFIX = `sdc-vrl:${VERSION}:`;
const CHANGE_EVENT = "sdc-vrl:storage";

const storageKey = (slug: string, field: string) => `${PREFIX}${slug}:${field}`;

/** localStorage throws in private modes and when disabled; never let that break an exercise. */
function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const s = window.localStorage;
    const probe = `${PREFIX}__probe`;
    s.setItem(probe, "1");
    s.removeItem(probe);
    return s;
  } catch {
    return null;
  }
}

// Sets aren't JSON-representable but some exercises hold their answers in one
// (e.g. the Procrastination Checklist), so they get an explicit envelope.
type SetEnvelope = { __t: "Set"; v: unknown[] };

const replacer = (_key: string, value: unknown) =>
  value instanceof Set ? ({ __t: "Set", v: [...value] } satisfies SetEnvelope) : value;

const reviver = (_key: string, value: unknown) => {
  if (value && typeof value === "object" && (value as SetEnvelope).__t === "Set") {
    return new Set((value as SetEnvelope).v);
  }
  return value;
};

function notifyChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Subscribe to saves/clears for this device. Returns an unsubscribe fn. */
export function onStorageChange(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, listener);
  // Also react to another tab clearing or editing the same exercise.
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

/** True if this exercise has anything saved on this device. */
export function hasSavedWork(slug: string): boolean {
  const s = getStorage();
  if (!s) return false;
  const prefix = `${PREFIX}${slug}:`;
  for (let i = 0; i < s.length; i++) {
    const key = s.key(i);
    if (key && key.startsWith(prefix)) return true;
  }
  return false;
}

/** How many stored fields one exercise is holding on this device. */
export function savedFieldCount(slug: string): number {
  const s = getStorage();
  if (!s) return 0;
  const prefix = `${PREFIX}${slug}:`;
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    const key = s.key(i);
    if (key && key.startsWith(prefix)) count++;
  }
  return count;
}

/** Delete every saved field for one exercise. */
export function clearExercise(slug: string) {
  const s = getStorage();
  if (!s) return;
  const prefix = `${PREFIX}${slug}:`;
  const doomed: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const key = s.key(i);
    if (key && key.startsWith(prefix)) doomed.push(key);
  }
  doomed.forEach((k) => s.removeItem(k));
  notifyChange();
}

/** Delete the saved fields for several exercises at once, announcing one change. */
export function clearExercises(slugs: Iterable<string>) {
  const s = getStorage();
  if (!s) return;
  const prefixes = [...slugs].map((slug) => `${PREFIX}${slug}:`);
  if (prefixes.length === 0) return;
  const doomed: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const key = s.key(i);
    if (key && prefixes.some((p) => key.startsWith(p))) doomed.push(key);
  }
  doomed.forEach((k) => s.removeItem(k));
  notifyChange();
}

/** Delete every saved answer for every exercise. */
export function clearAllExercises() {
  const s = getStorage();
  if (!s) return;
  const doomed: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const key = s.key(i);
    if (key && key.startsWith(PREFIX)) doomed.push(key);
  }
  doomed.forEach((k) => s.removeItem(k));
  notifyChange();
}

/** Slugs with saved work on this device. */
export function savedSlugs(): string[] {
  const s = getStorage();
  if (!s) return [];
  const out = new Set<string>();
  for (let i = 0; i < s.length; i++) {
    const key = s.key(i);
    if (!key || !key.startsWith(PREFIX)) continue;
    const slug = key.slice(PREFIX.length).split(":")[0];
    if (slug) out.add(slug);
  }
  return [...out];
}

/** JSON.stringify that returns null rather than throwing on a cyclic value. */
function safeSerialise(value: unknown): string | null {
  try {
    return JSON.stringify(value, replacer) ?? null;
  } catch {
    return null;
  }
}

type Initial<T> = T | (() => T);

const resolve = <T>(initial: Initial<T>): T =>
  typeof initial === "function" ? (initial as () => T)() : initial;

/**
 * Drop-in replacement for useState that autosaves to localStorage.
 *
 * The first render always returns the initial value — reading storage during
 * render would desync SSR/prerendered HTML from the client. The saved value is
 * applied in a mount effect, and writes are suppressed until that has happened
 * so a default can never overwrite saved work.
 */
export function usePersistentState<T>(
  slug: string,
  field: string,
  initial: Initial<T>,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => resolve(initial));
  const hydrated = useRef(false);
  // Serialised form of what is already in storage (or of the untouched
  // default). Writes are skipped while the value still matches it, so opening
  // an exercise and reading it never creates a save, and clearing answers is
  // not instantly undone by every field re-saving its default.
  const lastSaved = useRef<string | null>(null);

  useEffect(() => {
    const s = getStorage();
    let raw: string | null = null;
    if (s) {
      try {
        raw = s.getItem(storageKey(slug, field));
        if (raw !== null) setValue(JSON.parse(raw, reviver) as T);
      } catch {
        // Corrupt or unreadable entry — fall back to the initial value.
        raw = null;
      }
    }
    lastSaved.current = raw ?? safeSerialise(value);
    hydrated.current = true;
    // Slug and field are fixed for the lifetime of an exercise component, and
    // `value` is deliberately read once, as the mount-time default.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const serialised = safeSerialise(value);
    if (serialised === null || serialised === lastSaved.current) return;
    const s = getStorage();
    if (!s) return;
    try {
      s.setItem(storageKey(slug, field), serialised);
      lastSaved.current = serialised;
      notifyChange();
    } catch {
      // Quota exceeded or storage revoked mid-session — the exercise keeps
      // working in memory, it just stops being restorable.
    }
  }, [slug, field, value]);

  return [value, setValue];
}

/** Reports which exercises have saved work on this device, live. */
export function useSavedSlugs(): Set<string> {
  const [slugs, setSlugs] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const sync = () => setSlugs(new Set(savedSlugs()));
    sync();
    return onStorageChange(sync);
  }, []);

  return slugs;
}

export type SavedMemory = { slug: string; fields: number };

/** One entry per exercise holding data on this device, with its field count. */
export function savedMemory(): SavedMemory[] {
  const counts = new Map<string, number>();
  const s = getStorage();
  if (!s) return [];
  for (let i = 0; i < s.length; i++) {
    const key = s.key(i);
    if (!key || !key.startsWith(PREFIX)) continue;
    const slug = key.slice(PREFIX.length).split(":")[0];
    if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return [...counts].map(([slug, fields]) => ({ slug, fields }));
}

/** Reports what each exercise is storing on this device, live. */
export function useSavedMemory(): SavedMemory[] {
  const [entries, setEntries] = useState<SavedMemory[]>([]);

  useEffect(() => {
    const sync = () => setEntries(savedMemory());
    sync();
    return onStorageChange(sync);
  }, []);

  return entries;
}

/** Reports whether this exercise currently has saved work, live. */
export function useHasSavedWork(slug: string): boolean {
  const [saved, setSaved] = useState(false);
  const check = useCallback(() => setSaved(hasSavedWork(slug)), [slug]);

  useEffect(() => {
    check();
    return onStorageChange(check);
  }, [check]);

  return saved;
}
