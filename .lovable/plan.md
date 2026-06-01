This is a large scope. To ship production-quality work without breaking what already exists, I'll do it in 3 phases. Phase 1 is the critical bug fix (data persistence across browsers/devices) — everything else builds on it. I'd like your OK on the phasing before I start.

## Phase 1 — Critical: Global Persistence (Supabase = source of truth)

**The root cause of "data resets across browsers"**: `siteStore.ts` uses localStorage as the primary store. Different browsers = different stores.

Fix:
- New `site_config` table in Supabase (single-row, `id = 'default'`, `config jsonb`, `updated_at`). RLS: public read, authenticated write (admin gate via password stays on the server function side, same pattern as wishes).
- Server functions: `getSiteConfig` (public), `saveSiteConfig` (password-gated, mirrors `listWishes`).
- Rewrite `siteStore.ts`:
  - Loads from Supabase on mount (`getSiteConfig`).
  - Admin mutations call `saveSiteConfig` immediately (debounced 600ms, optimistic update + rollback on error).
  - localStorage kept only as offline cache / draft fallback, never authoritative.
  - Expose `{ status: 'loading' | 'ready' | 'saving' | 'error', lastSavedAt }` for UI.
- Public site (`/`) and `/admin` both read from the store → same data everywhere.
- Loading skeleton on first paint; save indicator + toast on admin.

## Phase 2 — UI/UX polish (cinematic, spacing, typography)

- Tighten section spacing globally (hero 100vh, profiles 70-80vh, content auto, 80px vertical padding standard).
- Typography scale tokens in `styles.css` (`--fs-hero`, `--fs-section`, etc.) + responsive `clamp()`.
- Hero: ambient particles already exist — add couple-name letter reveal + parallax mouse tilt.
- Profile sections: alternating left/right cinematic layouts with portrait + quote + traits.
- Timeline + Gallery + RSVP: keep current data shape, redesign presentation with GSAP scroll reveals already wired via `CinematicScene`.

## Phase 3 — Admin redesign + theme/animation presets

- Admin tabs: General / Bride / Groom / Timeline / Gallery / RSVP / Theme / Animations / Background / Contacts.
- Live preview pane (iframe to `/` with hot reload via realtime channel on `site_config`).
- Theme presets (Romantic / Luxury / Royal / Minimal / Modern / Custom) → one click swaps the theme block.
- Animation toggles wired to existing `CursorEffects` + `BackgroundLayer`.
- Realtime: subscribe to `site_config` so other open tabs (and the live preview) update instantly.

## What I will NOT change
- The cinematic scroll engine (`CinematicScene` + `SmoothScroll`) — already working.
- `wishes` table + server fn — already correct pattern.
- Supabase client files (auto-generated).

## Technical notes
- `site_config` as a single JSON blob is intentional — the whole config is small (<50KB), versioning is trivial, and it matches how `siteStore` already shapes state. Splitting into normalized tables would 10x the surface area for no gain at this scale.
- Public read uses `supabaseAdmin` inside a public server fn (no `requireSupabaseAuth`) — safer than opening anon SELECT on the table.
- Admin write reuses the `ADMIN_PASSWORD` env var already documented for `listWishes`.

**OK to proceed with Phase 1 now?** I'll ship it end-to-end (migration + server fns + store rewrite + admin save indicator) before touching Phase 2.