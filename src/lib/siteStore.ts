import { useSyncExternalStore } from "react";
import { getSiteConfig, saveSiteConfig } from "@/lib/siteConfig.functions";
import { supabase } from "@/integrations/supabase/client";

// ============ Types ============

export type RevealAnim =
  | "fade-up"
  | "fade-in"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "zoom-out"
  | "blur"
  | "letter"
  | "word"
  | "mask"
  | "cinematic";

export type SectionKind =
  | "hero"
  | "countdown"
  | "chapter"
  | "profiles"
  | "functions"
  | "timeline"
  | "gallery"
  | "video"
  | "music"
  | "wishes"
  | "contacts";

export interface SectionBase {
  id: string;
  kind: SectionKind;
  enabled: boolean;
  title?: string;
  background?: BackgroundConfig;
  anim?: RevealAnim;
}

export interface HeroPerson {
  name: string;
  photo?: string;
  relation?: string; // "Daughter of...", "Son of..."
  description?: string;
  personality?: string;
  remark?: string;
}

export interface HeroSectionData extends SectionBase {
  kind: "hero";
  mode: "single" | "couple";
  eyebrow?: string; // event type label
  tagline?: string;
  story?: string;
  person?: HeroPerson; // single
  bride?: HeroPerson;
  groom?: HeroPerson;
  separator?: string; // e.g. "♥", "weds", "&"
}

export interface CountdownSectionData extends SectionBase {
  kind: "countdown";
  date: string; // ISO
  label?: string;
}

export interface ChapterSectionData extends SectionBase {
  kind: "chapter";
  subtitle?: string;
  body?: string;
  image?: string;
  layout?: "left" | "right" | "center" | "fullbleed";
}

export interface ProfilesSectionData extends SectionBase {
  kind: "profiles";
  profiles: HeroPerson[];
}

export interface EventFunction {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  address: string;
  description?: string;
  theme?: string;
  dressCode?: string;
  cover?: string;
  mapsUrl?: string;
  mapsEmbedUrl?: string;
}

export interface FunctionsSectionData extends SectionBase {
  kind: "functions";
  functions: EventFunction[];
}

export interface TimelineMilestone {
  id: string;
  title: string;
  date: string;
  description?: string;
  icon?: string;
  image?: string;
}

export interface TimelineSectionData extends SectionBase {
  kind: "timeline";
  layout: "vertical" | "horizontal" | "curved";
  milestones: TimelineMilestone[];
}

export interface GalleryItem {
  id: string;
  src: string;
  kind: "image" | "video";
  caption?: string;
}

export interface GallerySectionData extends SectionBase {
  kind: "gallery";
  layout: "masonry" | "grid" | "carousel" | "filmstrip";
  items: GalleryItem[];
}

export interface VideoSectionData extends SectionBase {
  kind: "video";
  source: "mp4" | "youtube" | "vimeo";
  url: string;
  display: "fullscreen" | "card" | "background";
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  caption?: string;
}

export interface MusicSectionData extends SectionBase {
  kind: "music";
  url: string;
  trackTitle?: string;
  artist?: string;
  coverArt?: string;
  autoplay?: boolean;
  loop?: boolean;
  display?: "floating" | "card";
}

export interface WishesSectionData extends SectionBase {
  kind: "wishes";
  prompt?: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}

export interface ContactsSectionData extends SectionBase {
  kind: "contacts";
  contacts: Contact[];
}

export type Section =
  | HeroSectionData
  | CountdownSectionData
  | ChapterSectionData
  | ProfilesSectionData
  | FunctionsSectionData
  | TimelineSectionData
  | GallerySectionData
  | VideoSectionData
  | MusicSectionData
  | WishesSectionData
  | ContactsSectionData;

// ============ Theme ============

export type BackgroundConfig =
  | { type: "color"; color: string }
  | { type: "gradient"; from: string; to: string; angle?: number; animated?: boolean }
  | { type: "image"; url: string; overlay?: number }
  | { type: "video"; url: string; overlay?: number }
  | { type: "animated"; variant: "particles" | "stars" | "aurora" | "rays" | "fireflies" | "petals"; color?: string };

export type CursorEffect = "none" | "petals" | "hearts" | "sparkles" | "fireflies" | "snow" | "confetti" | "glow";

export interface Theme {
  preset: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  headingFont: string;
  bodyFont: string;
  fontPreset: string;
  defaultBackground: BackgroundConfig;
  cursorEffect: CursorEffect;
  cursorColor?: string;
  cursorDensity?: number;
  smoothScroll: boolean;
  snapSections: boolean;
}

export interface SiteMeta {
  configured: boolean;
  eventType: string; // Wedding, Birthday, etc
  eventName: string;
  tagline?: string;
  adminPassword: string;
}

export interface SiteState {
  meta: SiteMeta;
  theme: Theme;
  sections: Section[];
}

// ============ Presets ============

export const THEME_PRESETS: Record<string, Partial<Theme>> = {
  "Luxury Gold": {
    primary: "oklch(0.82 0.13 85)",
    secondary: "oklch(0.45 0.05 270)",
    accent: "oklch(0.88 0.08 90)",
    background: "oklch(0.13 0.02 270)",
    surface: "oklch(0.18 0.02 270)",
    text: "oklch(0.96 0.02 90)",
    muted: "oklch(0.65 0.02 90)",
  },
  "Royal Blue": {
    primary: "oklch(0.55 0.18 260)",
    secondary: "oklch(0.78 0.12 80)",
    accent: "oklch(0.7 0.15 260)",
    background: "oklch(0.12 0.04 260)",
    surface: "oklch(0.17 0.04 260)",
    text: "oklch(0.96 0.01 260)",
    muted: "oklch(0.65 0.03 260)",
  },
  "Modern Minimal": {
    primary: "oklch(0.2 0 0)",
    secondary: "oklch(0.5 0 0)",
    accent: "oklch(0.65 0.15 25)",
    background: "oklch(0.98 0 0)",
    surface: "oklch(0.94 0 0)",
    text: "oklch(0.15 0 0)",
    muted: "oklch(0.5 0 0)",
  },
  "Elegant Black": {
    primary: "oklch(0.95 0 0)",
    secondary: "oklch(0.6 0 0)",
    accent: "oklch(0.78 0.12 85)",
    background: "oklch(0.08 0 0)",
    surface: "oklch(0.13 0 0)",
    text: "oklch(0.96 0 0)",
    muted: "oklch(0.6 0 0)",
  },
  "Romantic Rose": {
    primary: "oklch(0.7 0.15 10)",
    secondary: "oklch(0.85 0.05 30)",
    accent: "oklch(0.78 0.1 350)",
    background: "oklch(0.97 0.02 20)",
    surface: "oklch(0.93 0.03 20)",
    text: "oklch(0.25 0.05 10)",
    muted: "oklch(0.55 0.05 10)",
  },
  Traditional: {
    primary: "oklch(0.5 0.18 25)",
    secondary: "oklch(0.78 0.13 85)",
    accent: "oklch(0.6 0.18 140)",
    background: "oklch(0.15 0.04 25)",
    surface: "oklch(0.2 0.04 25)",
    text: "oklch(0.95 0.03 80)",
    muted: "oklch(0.7 0.05 80)",
  },
  Corporate: {
    primary: "oklch(0.45 0.1 240)",
    secondary: "oklch(0.55 0.02 240)",
    accent: "oklch(0.7 0.15 200)",
    background: "oklch(0.98 0 0)",
    surface: "oklch(0.95 0 0)",
    text: "oklch(0.2 0.02 240)",
    muted: "oklch(0.5 0.02 240)",
  },
  Celebration: {
    primary: "oklch(0.75 0.18 320)",
    secondary: "oklch(0.78 0.18 60)",
    accent: "oklch(0.78 0.18 180)",
    background: "oklch(0.12 0.05 290)",
    surface: "oklch(0.17 0.05 290)",
    text: "oklch(0.97 0.02 80)",
    muted: "oklch(0.7 0.05 80)",
  },
};

export const FONT_PRESETS: Record<string, { heading: string; body: string; gfonts: string[] }> = {
  "Modern Sans Serif": {
    heading: "'Outfit', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    gfonts: ["Outfit:wght@300;500;700;900", "Inter:wght@300;400;500;700"],
  },
  "Luxury Serif": {
    heading: "'Cormorant Garamond', serif",
    body: "'Cormorant', serif",
    gfonts: ["Cormorant+Garamond:wght@300;400;500;700", "Cormorant:wght@300;400;500"],
  },
  "Elegant Script": {
    heading: "'Cormorant Garamond', serif",
    body: "'Jost', sans-serif",
    gfonts: ["Cormorant+Garamond:wght@300;500;700", "Jost:wght@300;400;500", "Great+Vibes"],
  },
  "Traditional Style": {
    heading: "'Playfair Display', serif",
    body: "'Lora', serif",
    gfonts: ["Playfair+Display:wght@400;500;700;900", "Lora:wght@400;500;600"],
  },
  "Corporate Style": {
    heading: "'Manrope', sans-serif",
    body: "'Manrope', sans-serif",
    gfonts: ["Manrope:wght@300;400;500;700;800"],
  },
  "Display Bold": {
    heading: "'Syne', sans-serif",
    body: "'Jost', sans-serif",
    gfonts: ["Syne:wght@500;700;800", "Jost:wght@300;400;500"],
  },
};

// ============ Defaults ============

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function defaultTheme(): Theme {
  return {
    preset: "Luxury Gold",
    ...THEME_PRESETS["Luxury Gold"],
    headingFont: FONT_PRESETS["Luxury Serif"].heading,
    bodyFont: FONT_PRESETS["Luxury Serif"].body,
    fontPreset: "Luxury Serif",
    defaultBackground: { type: "animated", variant: "particles" },
    cursorEffect: "sparkles",
    cursorColor: "oklch(0.88 0.08 90)",
    cursorDensity: 3,
    smoothScroll: true,
    snapSections: false,
  } as Theme;
}

function blankState(): SiteState {
  return {
    meta: {
      configured: false,
      eventType: "Wedding",
      eventName: "",
      tagline: "",
      adminPassword: "admin123",
    },
    theme: defaultTheme(),
    sections: [],
  };
}

export function seedSections(opts: { eventType: string; eventName: string; date?: string }): Section[] {
  const date = opts.date || new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString();
  return [
    {
      id: uid(),
      kind: "hero",
      enabled: true,
      mode: "couple",
      eyebrow: opts.eventType,
      tagline: "Together with our families",
      story: "Two hearts. One story. Being celebrated at last.",
      separator: "&",
      bride: { name: "Bride", relation: "Daughter of [Father] & [Mother]" },
      groom: { name: "Groom", relation: "Son of [Father] & [Mother]" },
      anim: "cinematic",
    } as HeroSectionData,
    {
      id: uid(),
      kind: "countdown",
      enabled: true,
      title: "Counting the moments",
      date,
      label: "Until the celebration",
      anim: "fade-up",
    } as CountdownSectionData,
    {
      id: uid(),
      kind: "chapter",
      enabled: true,
      title: "Our Story",
      subtitle: "Chapter One",
      body: "Every great story begins with a single moment. Ours began here.",
      layout: "center",
      anim: "letter",
    } as ChapterSectionData,
    {
      id: uid(),
      kind: "functions",
      enabled: true,
      title: "The Celebration",
      functions: [],
      anim: "fade-up",
    } as FunctionsSectionData,
    {
      id: uid(),
      kind: "timeline",
      enabled: true,
      title: "Our Journey",
      layout: "vertical",
      milestones: [],
      anim: "fade-up",
    } as TimelineSectionData,
    {
      id: uid(),
      kind: "gallery",
      enabled: false,
      title: "Moments",
      layout: "masonry",
      items: [],
      anim: "zoom-in",
    } as GallerySectionData,
    {
      id: uid(),
      kind: "wishes",
      enabled: true,
      title: "Leave a Wish",
      prompt: "Your words become part of our forever.",
      anim: "fade-up",
    } as WishesSectionData,
    {
      id: uid(),
      kind: "contacts",
      enabled: true,
      title: "RSVP & Contact",
      contacts: [],
      anim: "fade-up",
    } as ContactsSectionData,
  ];
}

// ============ Store ============

const CACHE_KEY = "lovable-event-platform-cache-v3";
const AUTH_KEY = "lovable-event-admin-auth-v2";
const PW_KEY = "lovable-event-admin-pw-v2";

export type SyncStatus = "idle" | "loading" | "ready" | "saving" | "error";

let state: SiteState = blankState();
let hydrated = false;
let loading = false;
let syncStatus: SyncStatus = "idle";
let syncError: string | null = null;
let lastSavedAt: string | null = null;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let saveSeq = 0;
let realtimeBound = false;
const listeners = new Set<() => void>();

function readCache(): SiteState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SiteState;
  } catch {
    return null;
  }
}

function writeCache(s: SiteState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(s));
  } catch {
    /* quota */
  }
}

function mergeWithDefaults(parsed: Partial<SiteState> | null | undefined): SiteState {
  const base = blankState();
  if (!parsed) return base;
  return {
    meta: { ...base.meta, ...(parsed.meta ?? {}) },
    theme: { ...base.theme, ...(parsed.theme ?? {}) },
    sections: Array.isArray(parsed.sections) ? (parsed.sections as Section[]) : [],
  };
}

let syncSnapshot: { status: SyncStatus; error: string | null; lastSavedAt: string | null } = {
  status: "idle",
  error: null,
  lastSavedAt: null,
};

function refreshSyncSnapshot() {
  syncSnapshot = { status: syncStatus, error: syncError, lastSavedAt };
}

function setSync(status: SyncStatus, error: string | null = null) {
  syncStatus = status;
  syncError = error;
  refreshSyncSnapshot();
  emit();
}

async function hydrateFromRemote(force = false) {
  if (typeof window === "undefined") return;
  if (loading && !force) return;
  loading = true;
  setSync("loading");
  try {
    const { config, updatedAt } = await getSiteConfig();
    if (config && Object.keys(config).length > 0) {
      state = mergeWithDefaults(config as unknown as Partial<SiteState>);
    } else {
      // First-ever load: keep the cached draft if present (e.g. user filled
      // onboarding before the table existed), otherwise stay blank.
      const cached = readCache();
      if (cached) state = mergeWithDefaults(cached);
    }
    writeCache(state);
    applyTheme(state.theme);
    lastSavedAt = updatedAt;
    setSync("ready");
  } catch (e) {
    // Fall back to cache so the site is still usable offline.
    const cached = readCache();
    if (cached) {
      state = mergeWithDefaults(cached);
      applyTheme(state.theme);
    }
    setSync("error", e instanceof Error ? e.message : String(e));
  } finally {
    loading = false;
    emit();
  }
}

function bindRealtime() {
  if (realtimeBound || typeof window === "undefined") return;
  realtimeBound = true;
  try {
    supabase
      .channel("site_config_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_config", filter: "id=eq.default" },
        (payload) => {
          const next = (payload.new as { config?: unknown; updated_at?: string } | null)?.config;
          if (!next) return;
          // Ignore echoes of our own in-flight saves.
          if (syncStatus === "saving") return;
          state = mergeWithDefaults(next as Partial<SiteState>);
          writeCache(state);
          applyTheme(state.theme);
          lastSavedAt = (payload.new as { updated_at?: string } | null)?.updated_at ?? lastSavedAt;
          emit();
        },
      )
      .subscribe();
  } catch {
    /* realtime is best-effort */
  }
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const cached = readCache();
  if (cached) {
    state = mergeWithDefaults(cached);
    applyTheme(state.theme);
  }
  void hydrateFromRemote();
  bindRealtime();
}

function emit() {
  for (const l of listeners) l();
}

function scheduleSave() {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void flushSave();
  }, 600);
}

async function flushSave() {
  const pw = typeof window !== "undefined" ? localStorage.getItem(PW_KEY) : null;
  if (!pw) {
    // No admin password = can't persist remotely yet; cache only.
    return;
  }
  const mySeq = ++saveSeq;
  setSync("saving");
  try {
    const { updatedAt } = await saveSiteConfig({
      data: { password: pw, config: state as unknown as Record<string, unknown> },
    });
    if (mySeq !== saveSeq) return; // newer save already in flight
    lastSavedAt = updatedAt;
    setSync("ready");
  } catch (e) {
    setSync("error", e instanceof Error ? e.message : String(e));
  }
}

export function setState(updater: (s: SiteState) => SiteState) {
  ensureHydrated();
  state = updater(state);
  writeCache(state);
  applyTheme(state.theme);
  emit();
  scheduleSave();
}

export function resetState() {
  state = blankState();
  if (typeof window !== "undefined") localStorage.removeItem(CACHE_KEY);
  applyTheme(state.theme);
  emit();
  scheduleSave();
}

export function getState(): SiteState {
  ensureHydrated();
  return state;
}

export function getSyncSnapshot() {
  return { status: syncStatus, error: syncError, lastSavedAt };
}

export async function refreshFromRemote() {
  await hydrateFromRemote(true);
}

export async function saveNow() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  await flushSave();
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
    () => blankState(),
  );
}

export function useSync() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSyncSnapshot,
    () => ({ status: "idle" as SyncStatus, error: null, lastSavedAt: null }),
  );
}

// ============ Theme application ============

const LOADED_FONTS = new Set<string>();

export function applyTheme(t: Theme) {
  if (typeof document === "undefined") return;
  const r = document.documentElement.style;
  r.setProperty("--background", t.background);
  r.setProperty("--foreground", t.text);
  r.setProperty("--primary", t.primary);
  r.setProperty("--primary-foreground", t.background);
  r.setProperty("--secondary", t.secondary);
  r.setProperty("--accent", t.accent);
  r.setProperty("--card", t.surface);
  r.setProperty("--muted", t.surface);
  r.setProperty("--muted-foreground", t.muted);
  r.setProperty("--border", `color-mix(in oklab, ${t.text} 15%, transparent)`);
  r.setProperty("--input", `color-mix(in oklab, ${t.text} 12%, transparent)`);
  r.setProperty("--ring", t.primary);
  r.setProperty("--font-heading", t.headingFont);
  r.setProperty("--font-body", t.bodyFont);

  // Load Google Fonts
  const preset = FONT_PRESETS[t.fontPreset];
  if (preset) {
    const families = preset.gfonts.filter((f) => !LOADED_FONTS.has(f));
    if (families.length) {
      families.forEach((f) => LOADED_FONTS.add(f));
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
      document.head.appendChild(link);
    }
  }

  document.body.style.fontFamily = t.bodyFont;
  document.body.style.background = t.background;
  document.body.style.color = t.text;
}

// ============ Auth ============

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "1" && !!localStorage.getItem(PW_KEY);
}

/** Validates the admin password by attempting a save. Persists on success. */
export async function login(pw: string): Promise<boolean> {
  ensureHydrated();
  if (typeof window === "undefined") return false;
  try {
    await saveSiteConfig({
      data: { password: pw, config: state as unknown as Record<string, unknown> },
    });
    localStorage.setItem(PW_KEY, pw);
    localStorage.setItem(AUTH_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(PW_KEY);
}

// ============ Helpers ============

export { uid };
