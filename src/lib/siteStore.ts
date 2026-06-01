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

const KEY = "lovable-event-platform-v2";
const AUTH_KEY = "lovable-event-admin-auth-v2";

let state: SiteState = blankState();
let hydrated = false;
const listeners = new Set<() => void>();

function load(): SiteState {
  if (typeof window === "undefined") return blankState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw) as SiteState;
    const base = blankState();
    return {
      meta: { ...base.meta, ...parsed.meta },
      theme: { ...base.theme, ...parsed.theme },
      sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    };
  } catch {
    return blankState();
  }
}

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
  state = blankState();
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
  applyTheme(state.theme);
  emit();
}

export function getState(): SiteState {
  ensureHydrated();
  return state;
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
  return localStorage.getItem(AUTH_KEY) === "1";
}
export function login(pw: string): boolean {
  ensureHydrated();
  if (pw === state.meta.adminPassword) {
    localStorage.setItem(AUTH_KEY, "1");
    return true;
  }
  return false;
}
export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(AUTH_KEY);
}

// ============ Helpers ============

export { uid };
