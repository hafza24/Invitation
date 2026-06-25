import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import {
  useSite,
  useSync,
  setState,
  resetState,
  saveNow,
  login,
  logout,
  isAuthed,
  getAdminPassword,
  uid,
  THEME_PRESETS,
  FONT_PRESETS,
  type Section,
  type SiteState,
  type Theme,
  type CursorEffect,
  type BackgroundConfig,
  type EventFunction,
  type Contact,
  type TimelineMilestone,
  type GalleryItem,
  type HeroSectionData,
  type ChapterSectionData,
  type FunctionsSectionData,
  type TimelineSectionData,
  type GallerySectionData,
  type VideoSectionData,
  type MusicSectionData,
  type ContactsSectionData,
  type WishesSectionData,
  type CountdownSectionData,
  type ProfilesSectionData,
  type ScratchCardSectionData,
  type ScratchCard,
  type RevealAnim,
} from "@/lib/siteStore";
import { useServerFn } from "@tanstack/react-start";
import { listWishes } from "@/lib/wishes.functions";
import { v, useFieldError, useValidationSnapshot, type Validator } from "@/lib/validation";
import { setSaveBlocked } from "@/lib/siteStore";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Event Platform" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => setAuthed(isAuthed()), []);
  if (!authed) return <Login onLogin={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => { logout(); setAuthed(false); }} />;
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="min-h-dvh flex items-center justify-center p-5 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
          const ok = await login(pw);
          setBusy(false);
          if (ok) onLogin();
          else setErr("Wrong password");
        }}
        aria-labelledby="admin-login-title"
        className="w-full max-w-sm space-y-5 p-7 sm:p-8 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 shadow-2xl shadow-black/40"
      >
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.35em] text-amber-300/80">Event Studio</p>
          <h1 id="admin-login-title" className="text-2xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-slate-400">Enter your admin password to continue.</p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-xs uppercase tracking-wider text-slate-400">Password</span>
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="••••••••"
            aria-invalid={!!err}
            aria-describedby={err ? "admin-login-error" : undefined}
            className="w-full p-3 rounded-lg bg-slate-800/80 border border-slate-700 placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 outline-none transition"
          />
        </label>
        {err && <p id="admin-login-error" role="alert" className="text-sm text-red-400">{err}</p>}
        <button
          type="submit"
          disabled={busy || !pw}
          className="w-full p-3 rounded-lg bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="text-xs text-slate-500 text-center">
          Default password <code className="text-slate-400">admin123</code> — override with the <code className="text-slate-400">ADMIN_PASSWORD</code> backend secret.
        </p>
        <Link to="/" className="text-xs text-slate-400 hover:text-slate-200 underline block text-center">← Back to site</Link>
      </form>
    </main>
  );
}

function SyncIndicator() {
  const { status, error, lastSavedAt } = useSync();
  const label =
    status === "loading" ? "Loading…" :
    status === "saving" ? "Saving…" :
    status === "error" ? "Save failed" :
    lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` :
    "Synced";
  const color =
    status === "error" ? "text-red-400" :
    status === "saving" || status === "loading" ? "text-amber-300" :
    "text-emerald-400";
  return (
    <div className={`text-xs ${color}`} title={error ?? ""}>
      <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle" style={{ background: "currentColor" }} />
      {label}
      {status === "error" && (
        <button onClick={() => void saveNow()} className="ml-2 underline">Retry</button>
      )}
    </div>
  );
}

function ValidationBanner() {
  const { count, messages } = useValidationSnapshot();
  useEffect(() => {
    setSaveBlocked(count > 0, count > 0 ? `${count} field${count === 1 ? "" : "s"} need${count === 1 ? "s" : ""} attention` : null);
    return () => setSaveBlocked(false);
  }, [count]);
  if (count === 0) return null;
  return (
    <div role="alert" className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-100">
      <p className="font-medium">
        Changes paused — {count} field{count === 1 ? "" : "s"} need{count === 1 ? "s" : ""} attention before saving.
      </p>
      <ul className="mt-2 list-disc list-inside text-xs text-red-200/90 space-y-0.5 max-h-32 overflow-auto">
        {messages.slice(0, 8).map((m, i) => <li key={i}>{m}</li>)}
        {messages.length > 8 && <li>…and {messages.length - 8} more</li>}
      </ul>
    </div>
  );
}

type Tab = "theme" | "sections" | "wishes" | "settings";

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const site = useSite();
  const [tab, setTab] = useState<Tab>("sections");
  const [preview, setPreview] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const { status, lastSavedAt } = useSync();
  // Refresh the preview iframe shortly after a save completes so the latest
  // realtime payload is reflected even if the iframe missed the channel update.
  useEffect(() => {
    if (status === "ready" && preview) {
      const t = setTimeout(() => setPreviewKey((k) => k + 1), 400);
      return () => clearTimeout(t);
    }
  }, [lastSavedAt, status, preview]);

  const tabs: [Tab, string][] = [
    ["sections", "Sections"],
    ["theme", "Theme & Effects"],
    ["wishes", "Wishes"],
    ["settings", "Settings"],
  ];

  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80">Studio</p>
            <h1 className="text-sm font-semibold leading-tight truncate">{site.meta.eventName || site.meta.eventType || "Event"}</h1>
          </div>
          <SyncIndicator />
        </div>
        <nav
          aria-label="Studio sections"
          className="flex gap-1 overflow-x-auto px-3 pb-2 [-webkit-overflow-scrolling:touch]"
        >
          {tabs.map(([k, l]) => {
            const active = tab === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 ${
                  active
                    ? "bg-amber-400 text-slate-950 font-medium"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {l}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:min-h-dvh flex-col border-r border-slate-800/80 p-6 sticky top-0 self-start bg-slate-950/60 backdrop-blur z-20">
        <div className="mb-7">
          <p className="text-[10px] uppercase tracking-[0.35em] text-amber-300/80">Event Studio</p>
          <h1 className="text-lg font-semibold tracking-tight mt-1">{site.meta.eventName || "Untitled event"}</h1>
          <p className="text-xs text-slate-500 truncate">{site.meta.eventType}</p>
        </div>

        <nav aria-label="Studio sections" className="flex flex-col gap-1">
          {tabs.map(([k, l]) => {
            const active = tab === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setTab(k)}
                aria-current={active ? "page" : undefined}
                className={`text-left px-3 py-2 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 ${
                  active
                    ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30"
                    : "text-slate-300 hover:bg-slate-900 hover:text-slate-100"
                }`}
              >
                {l}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 space-y-2 border-t border-slate-800/80">
          <SyncIndicator />
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            aria-pressed={preview}
            className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 ${preview ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30" : "bg-slate-900 hover:bg-slate-800 text-slate-300"}`}
          >
            {preview ? "✓ Live preview on" : "Show live preview"}
          </button>
          <div className="flex items-center gap-4 text-xs text-slate-400 px-1">
            <Link to="/" className="hover:text-slate-200 underline-offset-2 hover:underline">View site</Link>
            <button type="button" onClick={onLogout} className="hover:text-slate-200 underline-offset-2 hover:underline">Sign out</button>
          </div>
        </div>
      </aside>

      <main className={`flex-1 p-5 sm:p-6 md:p-10 overflow-auto ${preview ? "max-w-2xl" : "max-w-5xl"}`}>
        <ValidationBanner />
        {tab === "sections" && <SectionsTab site={site} />}
        {tab === "theme" && <ThemeTab site={site} />}
        {tab === "wishes" && <WishesTab />}
        {tab === "settings" && <SettingsTab site={site} />}

        {/* Mobile footer actions */}
        <div className="md:hidden mt-10 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-400">
          <Link to="/" className="underline hover:text-slate-200">View site →</Link>
          <button type="button" onClick={onLogout} className="underline hover:text-slate-200">Sign out</button>
        </div>
      </main>

      {preview && (
        <aside className="hidden lg:flex flex-col w-[480px] xl:w-[560px] border-l border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs">
            <span className="text-slate-400">Live preview</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setPreviewKey((k) => k + 1)} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60">Refresh</button>
              <a href="/" target="_blank" rel="noreferrer" className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60">Open ↗</a>
            </div>
          </div>
          <iframe
            key={previewKey}
            src="/"
            title="Live preview"
            className="flex-1 w-full bg-black"
          />
        </aside>
      )}
    </div>
  );
}

// ============ Sections Tab ============

function SectionsTab({ site }: { site: SiteState }) {
  const [selectedId, setSelectedId] = useState<string | null>(site.sections[0]?.id ?? null);
  const selected = site.sections.find((s) => s.id === selectedId);

  const add = (kind: Section["kind"]) => {
    const base = { id: uid(), kind, enabled: true, anim: "fade-up" as RevealAnim };
    let next: Section;
    switch (kind) {
      case "hero": next = { ...base, kind: "hero", mode: "couple", eyebrow: site.meta.eventType, tagline: "", bride: { name: "Bride" }, groom: { name: "Groom" }, separator: "&" } as HeroSectionData; break;
      case "countdown": next = { ...base, kind: "countdown", date: new Date(Date.now() + 86400000 * 30).toISOString(), label: "Until the day" } as CountdownSectionData; break;
      case "chapter": next = { ...base, kind: "chapter", title: "New Chapter", subtitle: "", body: "", layout: "center" } as ChapterSectionData; break;
      case "profiles": next = { ...base, kind: "profiles", title: "About", profiles: [] } as ProfilesSectionData; break;
      case "functions": next = { ...base, kind: "functions", title: "Events", functions: [] } as FunctionsSectionData; break;
      case "timeline": next = { ...base, kind: "timeline", title: "Journey", layout: "vertical", milestones: [] } as TimelineSectionData; break;
      case "gallery": next = { ...base, kind: "gallery", title: "Gallery", layout: "masonry", items: [] } as GallerySectionData; break;
      case "video": next = { ...base, kind: "video", title: "Watch", source: "youtube", url: "", display: "fullscreen", muted: true } as VideoSectionData; break;
      case "music": next = { ...base, kind: "music", title: "Our Song", url: "", trackTitle: "", artist: "", loop: true, display: "card" } as MusicSectionData; break;
      case "wishes": next = { ...base, kind: "wishes", title: "Leave a Wish", prompt: "Your words become part of our forever." } as WishesSectionData; break;
      case "contacts": next = { ...base, kind: "contacts", title: "Contact", contacts: [] } as ContactsSectionData; break;
      case "scratchcard": next = { ...base, kind: "scratchcard", title: "Scratch to reveal", prompt: "A little surprise for you.", brushSize: 28, revealThreshold: 0.55, cards: [{ id: uid(), label: "Surprise", revealTitle: "You're invited!", revealMessage: "Scratch the surface to see our message.", coverColor: "#b08a4f", coverText: "SCRATCH HERE" }] } as ScratchCardSectionData; break;
      default: return;
    }
    setState((s) => ({ ...s, sections: [...s.sections, next] }));
    setSelectedId(next.id);
  };

  const update = (id: string, patch: Partial<Section>) =>
    setState((s) => ({ ...s, sections: s.sections.map((x) => x.id === id ? ({ ...x, ...patch } as Section) : x) }));
  const remove = (id: string) => setState((s) => ({ ...s, sections: s.sections.filter((x) => x.id !== id) }));
  const move = (id: string, dir: -1 | 1) => setState((s) => {
    const i = s.sections.findIndex((x) => x.id === id); if (i < 0) return s;
    const j = i + dir; if (j < 0 || j >= s.sections.length) return s;
    const arr = [...s.sections]; const [it] = arr.splice(i, 1); arr.splice(j, 0, it);
    return { ...s, sections: arr };
  });

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Sections</h2>
          <span className="text-xs text-slate-500">{site.sections.length}</span>
        </div>
        <div className="space-y-1.5">
          {site.sections.map((s) => {
            const active = selectedId === s.id;
            const title = (s as { title?: string }).title?.trim();
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                aria-current={active ? "true" : undefined}
                className={`group w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 ${
                  active
                    ? "bg-amber-500/10 border-amber-400/40 text-amber-100"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full shrink-0 ${s.enabled ? "bg-emerald-400" : "bg-slate-600"}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-slate-100">{title || <span className="capitalize text-slate-300">{s.kind}</span>}</span>
                  {title && <span className="block truncate text-[11px] uppercase tracking-wider text-slate-500">{s.kind}</span>}
                </span>
                {!s.enabled && <span className="text-[10px] uppercase tracking-wider text-slate-500">Off</span>}
              </button>
            );
          })}
        </div>
        <details className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 open:bg-slate-900">
          <summary className="cursor-pointer text-sm text-slate-200 select-none">+ Add section</summary>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {(["hero","countdown","chapter","profiles","functions","timeline","gallery","video","music","wishes","contacts","scratchcard"] as Section["kind"][]).map(k => (
              <button key={k} type="button" onClick={() => add(k)} className="p-2 text-xs rounded-md bg-slate-800/80 hover:bg-slate-700 capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60">{k}</button>
            ))}
          </div>
        </details>
      </div>
      <div>
        {selected ? (
          <SectionEditor
            section={selected}
            onChange={(patch) => update(selected.id, patch)}
            onDelete={() => { remove(selected.id); setSelectedId(null); }}
            onMoveUp={() => move(selected.id, -1)}
            onMoveDown={() => move(selected.id, 1)}
          />
        ) : (
          <div className="text-slate-400 text-sm">Select a section, or add a new one.</div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, error, hint }: { label: string; children: React.ReactNode; error?: string | null; hint?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="block text-xs text-red-400">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}

/**
 * ValidatedInput — a single-line input wired to a field validator.
 * Registers its error in the global validation registry so the admin shell
 * can show a banner and block save while anything is invalid.
 */
function ValidatedInput({
  label,
  value,
  onChange,
  validator,
  placeholder,
  type = "text",
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  validator?: Validator | Validator[];
  placeholder?: string;
  type?: string;
  hint?: string;
  className?: string;
}) {
  const err = useFieldError(value, validator);
  return (
    <Field label={label} error={err} hint={hint}>
      <input
        type={type}
        className={`${inputCls} ${err ? "border-red-500/60 focus:border-red-400 focus:ring-red-400/20" : ""} ${className ?? ""}`}
        value={value}
        placeholder={placeholder}
        aria-invalid={!!err}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

/** Bare input (no Field wrapper) for grid layouts that don't have a label. */
function ValidatedBareInput({
  value,
  onChange,
  validator,
  placeholder,
  type = "text",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  validator?: Validator | Validator[];
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  const err = useFieldError(value, validator);
  return (
    <div className="space-y-1">
      <input
        type={type}
        className={`${inputCls} ${err ? "border-red-500/60 focus:border-red-400 focus:ring-red-400/20" : ""} ${className ?? ""}`}
        value={value}
        placeholder={placeholder}
        aria-invalid={!!err}
        aria-label={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {err && <span role="alert" className="block text-xs text-red-400">{err}</span>}
    </div>
  );
}

const inputCls = "w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-sm placeholder:text-slate-500 transition-colors focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20 focus:outline-none";

function SectionEditor({ section, onChange, onDelete, onMoveUp, onMoveDown }: { section: Section; onChange: (p: Partial<Section>) => void; onDelete: () => void; onMoveUp: () => void; onMoveDown: () => void; }) {
  const title = (section as { title?: string }).title?.trim();
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/80">Editing</p>
          <h3 className="text-lg font-semibold capitalize truncate">{title || section.kind}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 overflow-hidden">
            <button type="button" onClick={onMoveUp} aria-label="Move section up" title="Move up" className="min-h-10 min-w-10 px-3 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60">↑</button>
            <span className="w-px bg-slate-800" aria-hidden="true" />
            <button type="button" onClick={onMoveDown} aria-label="Move section down" title="Move down" className="min-h-10 min-w-10 px-3 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60">↓</button>
          </div>
          <label className={`min-h-10 px-3 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${section.enabled ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-slate-800 bg-slate-900 text-slate-400"}`}>
            <input type="checkbox" className="accent-emerald-400" checked={section.enabled} onChange={(e) => onChange({ enabled: e.target.checked })} />
            {section.enabled ? "Enabled" : "Disabled"}
          </label>
          <button type="button" onClick={onDelete} aria-label="Delete section" className="min-h-10 px-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60">Delete</button>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Title (optional)"><input className={inputCls} value={(section as { title?: string }).title ?? ""} onChange={(e) => onChange({ title: e.target.value } as Partial<Section>)} /></Field>
        <Field label="Reveal animation">
          <select className={inputCls} value={section.anim ?? "fade-up"} onChange={(e) => onChange({ anim: e.target.value as RevealAnim })}>
            {(["fade-up","fade-in","fade-down","fade-left","fade-right","zoom-in","zoom-out","blur","letter","mask","cinematic"] as RevealAnim[]).map(a => <option key={a}>{a}</option>)}
          </select>
        </Field>
      </div>
      <BackgroundEditor bg={section.background} onChange={(bg) => onChange({ background: bg } as Partial<Section>)} />

      {section.kind === "hero" && <HeroEditor section={section} onChange={onChange as (p: Partial<HeroSectionData>) => void} />}
      {section.kind === "countdown" && <CountdownEditor section={section} onChange={onChange as (p: Partial<CountdownSectionData>) => void} />}
      {section.kind === "chapter" && <ChapterEditor section={section} onChange={onChange as (p: Partial<ChapterSectionData>) => void} />}
      {section.kind === "profiles" && <ProfilesEditor section={section} onChange={onChange as (p: Partial<ProfilesSectionData>) => void} />}
      {section.kind === "functions" && <FunctionsEditor section={section} onChange={onChange as (p: Partial<FunctionsSectionData>) => void} />}
      {section.kind === "timeline" && <TimelineEditor section={section} onChange={onChange as (p: Partial<TimelineSectionData>) => void} />}
      {section.kind === "gallery" && <GalleryEditor section={section} onChange={onChange as (p: Partial<GallerySectionData>) => void} />}
      {section.kind === "video" && <VideoEditor section={section} onChange={onChange as (p: Partial<VideoSectionData>) => void} />}
      {section.kind === "music" && <MusicEditor section={section} onChange={onChange as (p: Partial<MusicSectionData>) => void} />}
      {section.kind === "wishes" && <Field label="Prompt"><input className={inputCls} value={section.prompt ?? ""} onChange={(e) => onChange({ prompt: e.target.value })} /></Field>}
      {section.kind === "contacts" && <ContactsEditor section={section} onChange={onChange as (p: Partial<ContactsSectionData>) => void} />}
      {section.kind === "scratchcard" && <ScratchCardEditor section={section} onChange={onChange as (p: Partial<ScratchCardSectionData>) => void} />}
    </div>
  );
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });
}
function ImageInput({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 items-start">
      <input className={inputCls} placeholder="Image URL" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      <label className="px-3 py-2.5 rounded-lg bg-slate-800 text-xs cursor-pointer whitespace-nowrap">
        Upload
        <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) onChange(await fileToBase64(f)); }} />
      </label>
      {value && <img src={value} alt="" className="w-12 h-12 rounded object-cover" />}
    </div>
  );
}

function BackgroundEditor({ bg, onChange }: { bg?: BackgroundConfig; onChange: (b?: BackgroundConfig) => void }) {
  const t = bg?.type ?? "inherit";
  return (
    <details className="bg-slate-900 rounded-lg p-4">
      <summary className="cursor-pointer text-sm font-medium">Background override</summary>
      <div className="mt-3 space-y-3">
        <select className={inputCls} value={t} onChange={(e) => {
          const v = e.target.value;
          if (v === "inherit") onChange(undefined);
          else if (v === "color") onChange({ type: "color", color: "#0b1020" });
          else if (v === "gradient") onChange({ type: "gradient", from: "#1a1a2e", to: "#16213e", angle: 135, animated: true });
          else if (v === "image") onChange({ type: "image", url: "", overlay: 0.45 });
          else if (v === "video") onChange({ type: "video", url: "", overlay: 0.5 });
          else if (v === "animated") onChange({ type: "animated", variant: "particles", color: "rgba(255,210,120,0.6)" });
        }}>
          <option value="inherit">Inherit theme default</option>
          <option value="color">Solid color</option>
          <option value="gradient">Gradient</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="animated">Animated</option>
        </select>
        {bg?.type === "color" && <input className={inputCls} value={bg.color} onChange={(e) => onChange({ ...bg, color: e.target.value })} />}
        {bg?.type === "gradient" && (
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} value={bg.from} onChange={(e) => onChange({ ...bg, from: e.target.value })} placeholder="From" />
            <input className={inputCls} value={bg.to} onChange={(e) => onChange({ ...bg, to: e.target.value })} placeholder="To" />
            <label className="text-xs flex items-center gap-2 col-span-2"><input type="checkbox" checked={!!bg.animated} onChange={(e) => onChange({ ...bg, animated: e.target.checked })} /> Animated</label>
          </div>
        )}
        {bg?.type === "image" && <ImageInput value={bg.url} onChange={(v) => onChange({ ...bg, url: v })} />}
        {bg?.type === "video" && <input className={inputCls} placeholder="Video URL (mp4)" value={bg.url} onChange={(e) => onChange({ ...bg, url: e.target.value })} />}
        {bg?.type === "animated" && (
          <select className={inputCls} value={bg.variant} onChange={(e) => onChange({ ...bg, variant: e.target.value as "particles" })}>
            {["particles","stars","aurora","rays","fireflies","petals"].map(v => <option key={v}>{v}</option>)}
          </select>
        )}
      </div>
    </details>
  );
}

function HeroEditor({ section, onChange }: { section: HeroSectionData; onChange: (p: Partial<HeroSectionData>) => void }) {
  return (
    <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mode">
          <select className={inputCls} value={section.mode} onChange={(e) => onChange({ mode: e.target.value as "single" | "couple" })}>
            <option value="couple">Couple (two people)</option>
            <option value="single">Single person</option>
          </select>
        </Field>
        <Field label="Eyebrow"><input className={inputCls} value={section.eyebrow ?? ""} onChange={(e) => onChange({ eyebrow: e.target.value })} /></Field>
      </div>
      <Field label="Tagline"><input className={inputCls} value={section.tagline ?? ""} onChange={(e) => onChange({ tagline: e.target.value })} /></Field>
      <Field label="Story"><textarea className={inputCls} rows={2} value={section.story ?? ""} onChange={(e) => onChange({ story: e.target.value })} /></Field>
      {section.mode === "couple" ? (
        <>
          <Field label="Separator"><input className={inputCls} value={section.separator ?? "&"} onChange={(e) => onChange({ separator: e.target.value })} /></Field>
          <div className="grid md:grid-cols-2 gap-4">
            <PersonEditor label="Bride / Partner 1" p={section.bride ?? { name: "" }} onChange={(p) => onChange({ bride: p })} />
            <PersonEditor label="Groom / Partner 2" p={section.groom ?? { name: "" }} onChange={(p) => onChange({ groom: p })} />
          </div>
        </>
      ) : (
        <PersonEditor label="Person" p={section.person ?? { name: "" }} onChange={(p) => onChange({ person: p })} />
      )}
    </div>
  );
}

type PersonLike = { name: string; photo?: string; relation?: string; description?: string; personality?: string; remark?: string };
function PersonEditor({ label, p, onChange }: { label: string; p: PersonLike; onChange: (p: PersonLike) => void }) {
  return (
    <div className="space-y-2 p-3 rounded-lg bg-slate-950/50 border border-slate-800">
      <p className="text-xs uppercase tracking-wider text-amber-400">{label}</p>
      <input className={inputCls} placeholder="Name" value={p.name} onChange={(e) => onChange({ ...p, name: e.target.value })} />
      <input className={inputCls} placeholder="Relation (e.g. Daughter of...)" value={p.relation ?? ""} onChange={(e) => onChange({ ...p, relation: e.target.value })} />
      <ImageInput value={p.photo} onChange={(v) => onChange({ ...p, photo: v })} />
      <textarea className={inputCls} rows={2} placeholder="Description" value={p.description ?? ""} onChange={(e) => onChange({ ...p, description: e.target.value })} />
      <input className={inputCls} placeholder="Personality" value={p.personality ?? ""} onChange={(e) => onChange({ ...p, personality: e.target.value })} />
      <input className={inputCls} placeholder="Remark / quote" value={p.remark ?? ""} onChange={(e) => onChange({ ...p, remark: e.target.value })} />
    </div>
  );
}

function CountdownEditor({ section, onChange }: { section: CountdownSectionData; onChange: (p: Partial<CountdownSectionData>) => void }) {
  const local = section.date ? new Date(section.date).toISOString().slice(0,16) : "";
  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Date"><input type="datetime-local" className={inputCls} value={local} onChange={(e) => onChange({ date: new Date(e.target.value).toISOString() })} /></Field>
      <Field label="Label"><input className={inputCls} value={section.label ?? ""} onChange={(e) => onChange({ label: e.target.value })} /></Field>
    </div>
  );
}

function ChapterEditor({ section, onChange }: { section: ChapterSectionData; onChange: (p: Partial<ChapterSectionData>) => void }) {
  return (
    <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg">
      <Field label="Subtitle"><input className={inputCls} value={section.subtitle ?? ""} onChange={(e) => onChange({ subtitle: e.target.value })} /></Field>
      <Field label="Body"><textarea className={inputCls} rows={4} value={section.body ?? ""} onChange={(e) => onChange({ body: e.target.value })} /></Field>
      <Field label="Layout">
        <select className={inputCls} value={section.layout ?? "center"} onChange={(e) => onChange({ layout: e.target.value as "left" })}>
          <option value="center">Center</option><option value="left">Image left</option><option value="right">Image right</option><option value="fullbleed">Fullbleed</option>
        </select>
      </Field>
      <Field label="Image"><ImageInput value={section.image} onChange={(v) => onChange({ image: v })} /></Field>
    </div>
  );
}

function ProfilesEditor({ section, onChange }: { section: ProfilesSectionData; onChange: (p: Partial<ProfilesSectionData>) => void }) {
  const set = (i: number, p: typeof section.profiles[number]) => onChange({ profiles: section.profiles.map((x, j) => i === j ? p : x) });
  return (
    <div className="space-y-3">
      {section.profiles.map((p, i) => (
        <div key={i} className="flex gap-3 items-start">
          <PersonEditor label={`Profile ${i+1}`} p={p} onChange={(np) => set(i, np)} />
          <button onClick={() => onChange({ profiles: section.profiles.filter((_, j) => j !== i) })} className="px-3 py-2 rounded bg-red-600/70 text-xs">×</button>
        </div>
      ))}
      <button onClick={() => onChange({ profiles: [...section.profiles, { name: "New profile" }] })} className="px-3 py-2 rounded bg-amber-500 text-slate-950 text-sm">+ Add profile</button>
    </div>
  );
}

function FunctionsEditor({ section, onChange }: { section: FunctionsSectionData; onChange: (p: Partial<FunctionsSectionData>) => void }) {
  const upd = (i: number, f: EventFunction) => onChange({ functions: section.functions.map((x, j) => i === j ? f : x) });
  return (
    <div className="space-y-3">
      {section.functions.map((f, i) => (
        <div key={f.id} className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center"><strong>{f.name || "Function"}</strong>
            <button onClick={() => onChange({ functions: section.functions.filter((_, j) => j !== i) })} className="text-red-400 text-xs">Remove</button>
          </div>
          <input className={inputCls} placeholder="Name" value={f.name} onChange={(e) => upd(i, { ...f, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className={inputCls} placeholder="Date" value={f.date} onChange={(e) => upd(i, { ...f, date: e.target.value })} />
            <input className={inputCls} placeholder="Time" value={f.time} onChange={(e) => upd(i, { ...f, time: e.target.value })} />
            <input className={inputCls} placeholder="Venue" value={f.venue} onChange={(e) => upd(i, { ...f, venue: e.target.value })} />
            <input className={inputCls} placeholder="Dress code" value={f.dressCode ?? ""} onChange={(e) => upd(i, { ...f, dressCode: e.target.value })} />
          </div>
          <input className={inputCls} placeholder="Address" value={f.address} onChange={(e) => upd(i, { ...f, address: e.target.value })} />
          <input className={inputCls} placeholder="Theme" value={f.theme ?? ""} onChange={(e) => upd(i, { ...f, theme: e.target.value })} />
          <textarea className={inputCls} rows={2} placeholder="Description" value={f.description ?? ""} onChange={(e) => upd(i, { ...f, description: e.target.value })} />
          <ImageInput value={f.cover} onChange={(v) => upd(i, { ...f, cover: v })} />
          <input className={inputCls} placeholder="Google Maps link" value={f.mapsUrl ?? ""} onChange={(e) => upd(i, { ...f, mapsUrl: e.target.value })} />
          <input className={inputCls} placeholder="Google Maps embed URL (iframe src)" value={f.mapsEmbedUrl ?? ""} onChange={(e) => upd(i, { ...f, mapsEmbedUrl: e.target.value })} />
        </div>
      ))}
      <button onClick={() => onChange({ functions: [...section.functions, { id: uid(), name: "New function", date: "", time: "", venue: "", address: "" }] })} className="px-3 py-2 rounded bg-amber-500 text-slate-950 text-sm">+ Add function</button>
    </div>
  );
}

function TimelineEditor({ section, onChange }: { section: TimelineSectionData; onChange: (p: Partial<TimelineSectionData>) => void }) {
  const upd = (i: number, m: TimelineMilestone) => onChange({ milestones: section.milestones.map((x, j) => i === j ? m : x) });
  return (
    <div className="space-y-3">
      {section.milestones.map((m, i) => (
        <div key={m.id} className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex justify-between"><strong>{m.title || "Milestone"}</strong>
            <button onClick={() => onChange({ milestones: section.milestones.filter((_, j) => j !== i) })} className="text-red-400 text-xs">Remove</button>
          </div>
          <input className={inputCls} placeholder="Title" value={m.title} onChange={(e) => upd(i, { ...m, title: e.target.value })} />
          <input className={inputCls} placeholder="Date" value={m.date} onChange={(e) => upd(i, { ...m, date: e.target.value })} />
          <textarea className={inputCls} rows={2} placeholder="Description" value={m.description ?? ""} onChange={(e) => upd(i, { ...m, description: e.target.value })} />
          <ImageInput value={m.image} onChange={(v) => upd(i, { ...m, image: v })} />
        </div>
      ))}
      <button onClick={() => onChange({ milestones: [...section.milestones, { id: uid(), title: "New milestone", date: "" }] })} className="px-3 py-2 rounded bg-amber-500 text-slate-950 text-sm">+ Add milestone</button>
    </div>
  );
}

function GalleryEditor({ section, onChange }: { section: GallerySectionData; onChange: (p: Partial<GallerySectionData>) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Layout">
        <select className={inputCls} value={section.layout} onChange={(e) => onChange({ layout: e.target.value as "masonry" })}>
          {["masonry","grid","carousel","filmstrip"].map(l => <option key={l}>{l}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-3 gap-3">
        {section.items.map((it, i) => (
          <div key={it.id} className="relative">
            {it.kind === "image" ? <img src={it.src} className="w-full h-32 object-cover rounded-lg" /> : <video src={it.src} className="w-full h-32 object-cover rounded-lg" />}
            <button onClick={() => onChange({ items: section.items.filter((_, j) => j !== i) })} className="absolute top-1 right-1 px-2 py-0.5 rounded bg-red-600 text-xs">×</button>
          </div>
        ))}
      </div>
      <label className="px-3 py-2 rounded bg-amber-500 text-slate-950 text-sm cursor-pointer inline-block">+ Upload images
        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          const items: GalleryItem[] = await Promise.all(files.map(async f => ({ id: uid(), src: await fileToBase64(f), kind: f.type.startsWith("video") ? "video" : "image" })));
          onChange({ items: [...section.items, ...items] });
        }} />
      </label>
    </div>
  );
}

function VideoEditor({ section, onChange }: { section: VideoSectionData; onChange: (p: Partial<VideoSectionData>) => void }) {
  return (
    <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Source">
          <select className={inputCls} value={section.source} onChange={(e) => onChange({ source: e.target.value as "youtube" })}>
            <option value="youtube">YouTube</option><option value="vimeo">Vimeo</option><option value="mp4">MP4 URL</option>
          </select>
        </Field>
        <Field label="Display">
          <select className={inputCls} value={section.display} onChange={(e) => onChange({ display: e.target.value as "fullscreen" })}>
            <option value="fullscreen">Fullscreen</option><option value="card">Card</option><option value="background">Background</option>
          </select>
        </Field>
      </div>
      <Field label="URL"><input className={inputCls} value={section.url} onChange={(e) => onChange({ url: e.target.value })} /></Field>
      <Field label="Caption"><input className={inputCls} value={section.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value })} /></Field>
      <div className="flex gap-4 text-xs">
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!section.autoplay} onChange={(e) => onChange({ autoplay: e.target.checked })} /> Autoplay</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!section.loop} onChange={(e) => onChange({ loop: e.target.checked })} /> Loop</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!section.muted} onChange={(e) => onChange({ muted: e.target.checked })} /> Muted</label>
      </div>
    </div>
  );
}

function MusicEditor({ section, onChange }: { section: MusicSectionData; onChange: (p: Partial<MusicSectionData>) => void }) {
  return (
    <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg">
      <Field label="Audio URL (mp3)">
        <div className="flex gap-2 items-start">
          <input className={inputCls} placeholder="https://… or upload" value={section.url} onChange={(e) => onChange({ url: e.target.value })} />
          <label className="px-3 py-2.5 rounded-lg bg-slate-800 text-xs cursor-pointer whitespace-nowrap">
            Upload
            <input type="file" accept="audio/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) onChange({ url: await fileToBase64(f) }); }} />
          </label>
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Track title"><input className={inputCls} value={section.trackTitle ?? ""} onChange={(e) => onChange({ trackTitle: e.target.value })} /></Field>
        <Field label="Artist"><input className={inputCls} value={section.artist ?? ""} onChange={(e) => onChange({ artist: e.target.value })} /></Field>
      </div>
      <Field label="Cover art"><ImageInput value={section.coverArt} onChange={(v) => onChange({ coverArt: v })} /></Field>
      {section.url && <audio src={section.url} controls className="w-full" />}
      <div className="flex gap-4 text-xs">
        <label className="flex items-center gap-2"><input type="checkbox" checked={!!section.autoplay} onChange={(e) => onChange({ autoplay: e.target.checked })} /> Autoplay</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={section.loop !== false} onChange={(e) => onChange({ loop: e.target.checked })} /> Loop</label>
      </div>
    </div>
  );
}

function ContactsEditor({ section, onChange }: { section: ContactsSectionData; onChange: (p: Partial<ContactsSectionData>) => void }) {
  const upd = (i: number, c: Contact) => onChange({ contacts: section.contacts.map((x, j) => i === j ? c : x) });
  return (
    <div className="space-y-3">
      {section.contacts.map((c, i) => (
        <div key={c.id} className="p-3 rounded bg-slate-900 border border-slate-800 grid grid-cols-2 gap-2">
          <input className={inputCls} placeholder="Name" value={c.name} onChange={(e) => upd(i, { ...c, name: e.target.value })} />
          <input className={inputCls} placeholder="Role" value={c.role} onChange={(e) => upd(i, { ...c, role: e.target.value })} />
          <input className={inputCls} placeholder="Phone" value={c.phone ?? ""} onChange={(e) => upd(i, { ...c, phone: e.target.value })} />
          <input className={inputCls} placeholder="WhatsApp" value={c.whatsapp ?? ""} onChange={(e) => upd(i, { ...c, whatsapp: e.target.value })} />
          <input className={inputCls + " col-span-2"} placeholder="Email" value={c.email ?? ""} onChange={(e) => upd(i, { ...c, email: e.target.value })} />
          <button onClick={() => onChange({ contacts: section.contacts.filter((_, j) => j !== i) })} className="col-span-2 text-red-400 text-xs text-right">Remove</button>
        </div>
      ))}
      <button onClick={() => onChange({ contacts: [...section.contacts, { id: uid(), name: "New contact", role: "" }] })} className="px-3 py-2 rounded bg-amber-500 text-slate-950 text-sm">+ Add contact</button>
    </div>
  );
}

function ScratchCardEditor({ section, onChange }: { section: ScratchCardSectionData; onChange: (p: Partial<ScratchCardSectionData>) => void }) {
  const upd = (i: number, c: ScratchCard) => onChange({ cards: section.cards.map((x, j) => i === j ? c : x) });
  const remove = (i: number) => onChange({ cards: section.cards.filter((_, j) => j !== i) });
  const add = () => onChange({ cards: [...section.cards, { id: uid(), label: "Surprise", revealTitle: "Hidden message", revealMessage: "", coverColor: "#b08a4f", coverText: "SCRATCH HERE" }] });
  return (
    <div className="space-y-3 bg-slate-900/50 p-4 rounded-lg">
      <Field label="Prompt"><input className={inputCls} value={section.prompt ?? ""} onChange={(e) => onChange({ prompt: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Brush size (px)">
          <input type="number" min={8} max={80} className={inputCls} value={section.brushSize ?? 28} onChange={(e) => onChange({ brushSize: Number(e.target.value) || 28 })} />
        </Field>
        <Field label="Auto-reveal threshold (0–1)">
          <input type="number" step={0.05} min={0.1} max={1} className={inputCls} value={section.revealThreshold ?? 0.55} onChange={(e) => onChange({ revealThreshold: Number(e.target.value) || 0.55 })} />
        </Field>
      </div>
      <div className="space-y-3">
        {section.cards.map((c, i) => (
          <div key={c.id} className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <strong>{c.revealTitle || c.label || `Card ${i + 1}`}</strong>
              <button onClick={() => remove(i)} className="text-red-400 text-xs">Remove</button>
            </div>
            <input className={inputCls} placeholder="Label (corner badge)" value={c.label ?? ""} onChange={(e) => upd(i, { ...c, label: e.target.value })} />
            <input className={inputCls} placeholder="Reveal title" value={c.revealTitle ?? ""} onChange={(e) => upd(i, { ...c, revealTitle: e.target.value })} />
            <textarea className={inputCls} rows={2} placeholder="Reveal message" value={c.revealMessage ?? ""} onChange={(e) => upd(i, { ...c, revealMessage: e.target.value })} />
            <Field label="Reveal image (optional)"><ImageInput value={c.revealImage} onChange={(v) => upd(i, { ...c, revealImage: v })} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Cover color">
                <input type="color" className={inputCls + " h-11 p-1"} value={c.coverColor ?? "#b08a4f"} onChange={(e) => upd(i, { ...c, coverColor: e.target.value })} />
              </Field>
              <Field label="Cover text"><input className={inputCls} placeholder="SCRATCH HERE" value={c.coverText ?? ""} onChange={(e) => upd(i, { ...c, coverText: e.target.value })} /></Field>
            </div>
            <Field label="Cover image (overrides color)"><ImageInput value={c.coverImage} onChange={(v) => upd(i, { ...c, coverImage: v })} /></Field>
          </div>
        ))}
        <button onClick={add} className="px-3 py-2 rounded bg-amber-500 text-slate-950 text-sm">+ Add card</button>
      </div>
    </div>
  );
}

// ============ Theme Tab ============

function ThemeTab({ site }: { site: SiteState }) {
  const t = site.theme;
  const update = (patch: Partial<Theme>) => setState((s) => ({ ...s, theme: { ...s.theme, ...patch } }));
  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-lg font-semibold">Theme & Effects</h2>
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Preset</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.keys(THEME_PRESETS).map(name => (
            <button key={name} onClick={() => update({ preset: name, ...THEME_PRESETS[name] })} className={`p-3 rounded-lg text-xs text-left ${t.preset === name ? "bg-amber-500/20 border border-amber-500" : "bg-slate-900 border border-slate-800"}`}>
              <div className="flex gap-1 mb-2">
                {["primary","secondary","accent","background"].map(k => <span key={k} className="w-4 h-4 rounded" style={{ background: (THEME_PRESETS[name] as Record<string,string>)[k] }} />)}
              </div>
              {name}
            </button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {(["primary","secondary","accent","background","surface","text","muted"] as (keyof Theme)[]).map(k => (
          <Field key={k} label={k}>
            <input className={inputCls} value={String(t[k] ?? "")} onChange={(e) => update({ [k]: e.target.value } as Partial<Theme>)} />
          </Field>
        ))}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Typography</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.keys(FONT_PRESETS).map(name => (
            <button key={name} onClick={() => update({ fontPreset: name, headingFont: FONT_PRESETS[name].heading, bodyFont: FONT_PRESETS[name].body })} className={`p-3 rounded-lg text-sm text-left ${t.fontPreset === name ? "bg-amber-500/20 border border-amber-500" : "bg-slate-900 border border-slate-800"}`}>
              <span style={{ fontFamily: FONT_PRESETS[name].heading }}>{name}</span>
            </button>
          ))}
        </div>
      </div>
      <details className="bg-slate-900 rounded-lg p-4">
        <summary className="cursor-pointer text-sm font-medium">Default background</summary>
        <div className="mt-3"><BackgroundEditor bg={t.defaultBackground} onChange={(bg) => bg && update({ defaultBackground: bg })} /></div>
      </details>
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Cursor effect</p>
        <div className="grid grid-cols-4 gap-2">
          {(["none","petals","hearts","sparkles","fireflies","snow","confetti","glow"] as CursorEffect[]).map(e => (
            <button key={e} onClick={() => update({ cursorEffect: e })} className={`p-3 rounded-lg text-xs ${t.cursorEffect === e ? "bg-amber-500/20 border border-amber-500" : "bg-slate-900 border border-slate-800"}`}>{e}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Field label="Cursor color"><input className={inputCls} value={t.cursorColor ?? ""} onChange={(e) => update({ cursorColor: e.target.value })} /></Field>
          <Field label="Density"><input type="number" min={1} max={10} className={inputCls} value={t.cursorDensity ?? 3} onChange={(e) => update({ cursorDensity: Number(e.target.value) })} /></Field>
        </div>
      </div>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={t.smoothScroll} onChange={(e) => update({ smoothScroll: e.target.checked })} /> Smooth scroll (Lenis)</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={t.snapSections} onChange={(e) => update({ snapSections: e.target.checked })} /> Snap sections</label>
      </div>
    </div>
  );
}

// ============ Wishes Tab ============

type Wish = { id: string; guest_name: string; message: string; wish_type: string; created_at: string };

function WishesTab() {
  const site = useSite();
  const fetchWishes = useServerFn(listWishes);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const pw = getAdminPassword();
      if (!pw) throw new Error("Not signed in");
      const res = await fetchWishes({ data: { password: pw } });
      setWishes(res.wishes as Wish[]);
    } catch (e) { setErr((e as Error).message); }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a5" });
    const w = doc.internal.pageSize.getWidth();
    doc.setFont("times", "italic");
    doc.setFontSize(28);
    doc.text(site.meta.eventName || "Guest Book", w / 2, 100, { align: "center" });
    doc.setFontSize(12);
    doc.text("A book of wishes, advice, and prayers.", w / 2, 130, { align: "center" });
    wishes.forEach((wish) => {
      doc.addPage();
      doc.setFont("times", "bold"); doc.setFontSize(14);
      doc.text(wish.guest_name, 40, 60);
      doc.setFont("times", "italic"); doc.setFontSize(10);
      doc.text(`${wish.wish_type} · ${new Date(wish.created_at).toLocaleDateString()}`, 40, 78);
      doc.setFont("times", "normal"); doc.setFontSize(12);
      const lines = doc.splitTextToSize(wish.message, w - 80);
      doc.text(lines, 40, 110);
    });
    doc.save(`${(site.meta.eventName || "guest-book").replace(/\s+/g, "-")}.pdf`);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Wishes ({wishes.length})</h2>
        <div className="flex gap-2">
          <button onClick={load} className="px-3 py-2 rounded bg-slate-800 text-sm">Refresh</button>
          <button onClick={exportPdf} disabled={!wishes.length} className="px-3 py-2 rounded bg-amber-500 text-slate-950 text-sm disabled:opacity-50">Export PDF book</button>
        </div>
      </div>
      {loading && <p className="text-sm text-slate-400">Loading…</p>}
      {err && <p className="text-sm text-red-400">{err}</p>}
      <div className="space-y-3">
        {wishes.map((w) => (
          <div key={w.id} className="p-4 rounded-lg bg-slate-900 border border-slate-800">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span><strong className="text-amber-400">{w.guest_name}</strong> · {w.wish_type}</span>
              <span>{new Date(w.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap">{w.message}</p>
          </div>
        ))}
        {!loading && !wishes.length && <p className="text-sm text-slate-400">No wishes yet.</p>}
      </div>
    </div>
  );
}

// ============ Settings ============

function SettingsTab({ site }: { site: SiteState }) {
  const update = (patch: Partial<SiteState["meta"]>) => setState((s) => ({ ...s, meta: { ...s.meta, ...patch } }));
  return (
    <div className="space-y-4 max-w-xl">
      <h2 className="text-lg font-semibold">Settings</h2>
      <ValidatedInput label="Event type" value={site.meta.eventType} onChange={(val) => update({ eventType: val })} validator={[v.required("Event type"), v.maxLen("Event type", 80)]} />
      <ValidatedInput label="Event name" value={site.meta.eventName} onChange={(val) => update({ eventName: val })} validator={[v.required("Event name"), v.maxLen("Event name", 120)]} />
      <ValidatedInput label="Tagline" value={site.meta.tagline ?? ""} onChange={(val) => update({ tagline: val })} validator={v.maxLen("Tagline", 200)} hint="Optional — shown under the event name." />
      <p className="text-xs text-slate-400">Admin access is gated by the <code>ADMIN_PASSWORD</code> backend secret. It is never stored in the public site config.</p>

      <div className="flex gap-2 pt-4">
        <button onClick={() => {
          const blob = new Blob([JSON.stringify(site, null, 2)], { type: "application/json" });
          const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "event-backup.json"; a.click();
        }} className="px-3 py-2 rounded bg-slate-800 text-sm">Export config</button>
        <label className="px-3 py-2 rounded bg-slate-800 text-sm cursor-pointer">Import config
          <input type="file" accept="application/json" className="hidden" onChange={async (e) => {
            const f = e.target.files?.[0]; if (!f) return;
            const txt = await f.text();
            try { const parsed = JSON.parse(txt) as SiteState; setState(() => parsed); }
            catch { alert("Invalid file"); }
          }} />
        </label>
        <button onClick={() => { if (confirm("Reset everything?")) resetState(); }} className="px-3 py-2 rounded bg-red-600 text-sm ml-auto">Reset all</button>
      </div>
    </div>
  );
}
