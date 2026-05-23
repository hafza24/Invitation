import { useSyncExternalStore } from "react";
import { siteConfig as defaults } from "@/config/siteConfig";

export type EventItem = {
  id: string;
  name: string;
  date: string;
  day: string;
  time: string;
  venue: string;
  address: string;
  mapsUrl: string;
  mapsEmbedUrl?: string;
  description: string;
  theme: string;
  activities: string[];
  image?: string;
};

export type Contact = {
  label: string;
  name: string;
  phone: string;
  whatsapp: string;
  email?: string;
};

export type Theme = {
  background: string;
  gold: string;
  goldSoft: string;
  ivory: string;
  marigold: string;
  barat: string;
};

export type SiteState = {
  wedding: {
    bride: string;
    groom: string;
    tagline: string;
    date: string;
    dateLabel: string;
    story: string;
    heroImage?: string;
    rukhsatiImage?: string;
  };
  family: {
    brideFather: string;
    brideMother: string;
    groomFather: string;
    groomMother: string;
    blessing: string;
  };
  events: EventItem[];
  contacts: Contact[];
  theme: Theme;
};

const DEFAULT_THEME: Theme = {
  background: "oklch(0.13 0.02 270)",
  gold: "oklch(0.82 0.13 85)",
  goldSoft: "oklch(0.88 0.08 90)",
  ivory: "oklch(0.96 0.02 90)",
  marigold: "oklch(0.72 0.18 55)",
  barat: "oklch(0.45 0.18 25)",
};

const KEY = "wedding-site-state-v1";

function initial(): SiteState {
  return {
    wedding: { ...defaults.wedding },
    family: { ...defaults.family },
    events: defaults.events.map((e) => ({ ...e, activities: [...e.activities] })),
    contacts: defaults.contacts.map((c) => ({ ...c })),
    theme: { ...DEFAULT_THEME },
  };
}

function load(): SiteState {
  if (typeof window === "undefined") return initial();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial();
    const parsed = JSON.parse(raw);
    const base = initial();
    return {
      wedding: { ...base.wedding, ...parsed.wedding },
      family: { ...base.family, ...parsed.family },
      events: Array.isArray(parsed.events) && parsed.events.length ? parsed.events : base.events,
      contacts: Array.isArray(parsed.contacts) && parsed.contacts.length ? parsed.contacts : base.contacts,
      theme: { ...base.theme, ...parsed.theme },
    };
  } catch {
    return initial();
  }
}

let state: SiteState = initial();
let hydrated = false;
const listeners = new Set<() => void>();

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  state = load();
  hydrated = true;
  applyTheme(state.theme);
}

function emit() {
  for (const l of listeners) l();
}

export function setState(updater: (s: SiteState) => SiteState) {
  ensureHydrated();
  state = updater(state);
  localStorage.setItem(KEY, JSON.stringify(state));
  applyTheme(state.theme);
  emit();
}

export function resetState() {
  state = initial();
  localStorage.removeItem(KEY);
  applyTheme(state.theme);
  emit();
}

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const r = document.documentElement.style;
  r.setProperty("--background", t.background);
  r.setProperty("--gold", t.gold);
  r.setProperty("--gold-soft", t.goldSoft);
  r.setProperty("--ivory", t.ivory);
  r.setProperty("--marigold", t.marigold);
  r.setProperty("--barat", t.barat);
}

export function useSite(): SiteState {
  return useSyncExternalStore(
    (cb) => {
      ensureHydrated();
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => {
      ensureHydrated();
      return state;
    },
    () => initial(),
  );
}

// Admin auth (simple, client-only)
const AUTH_KEY = "wedding-admin-auth";
export const ADMIN_PASSWORD = "admin123";

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "1";
}
export function login(pw: string): boolean {
  if (pw === ADMIN_PASSWORD) {
    localStorage.setItem(AUTH_KEY, "1");
    return true;
  }
  return false;
}
export function logout() {
  localStorage.removeItem(AUTH_KEY);
}
