import { createFileRoute, Link } from "@tanstack/react-router";
import { useSite, setState, seedSections, type SiteState } from "@/lib/siteStore";
import { useState } from "react";
import { SectionRenderer } from "@/components/site/Sections";
import { BackgroundLayer } from "@/components/site/BackgroundLayer";
import { CursorEffects } from "@/components/site/CursorEffects";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Reveal } from "@/components/site/Reveal";

const SITE_URL = "https://story-scroll-suite.lovable.app";
const TITLE = "Cinematic Invitations — Luxury Wedding & Event Invitation Websites";
const DESCRIPTION =
  "Build a luxury, scroll-controlled invitation website for weddings, nikahs, birthdays and more. Cinematic animations, RSVP, gallery, timeline — fully editable.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: SITE_URL + "/" },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Cinematic Invitations",
          description: DESCRIPTION,
          applicationCategory: "DesignApplication",
          operatingSystem: "Web",
          url: SITE_URL,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const site = useSite();
  if (!site.meta.configured || site.sections.length === 0) {
    return <FirstRun />;
  }
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: site.theme.background, color: site.theme.text, fontFamily: site.theme.bodyFont }}>
      <SmoothScroll enabled={site.theme.smoothScroll} />
      <CursorEffects effect={site.theme.cursorEffect} color={site.theme.cursorColor} density={site.theme.cursorDensity ?? 3} />
      <div>
        {site.sections.filter(s => s.enabled).map((s, i, arr) => (
          <SectionRenderer
            key={s.id}
            section={s}
            fallback={site.theme.defaultBackground}
            first={i === 0}
            last={i === arr.length - 1}
          />
        ))}
        <footer className="text-center py-12 opacity-50 text-xs">
          <p>{site.meta.eventName || site.meta.eventType}</p>
          <Link to="/admin" className="underline">Admin</Link>
        </footer>
      </div>
    </main>
  );
}

function FirstRun() {
  const [eventType, setEventType] = useState("Wedding");
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");

  const begin = () => {
    setState((s: SiteState) => ({
      ...s,
      meta: { ...s.meta, configured: true, eventType, eventName: eventName || `Our ${eventType}` },
      sections: seedSections({ eventType, eventName: eventName || `Our ${eventType}`, date: date || undefined }),
    }));
  };

  return (
    <main
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-6 py-10"
      style={{ background: "oklch(0.11 0.02 270)", color: "oklch(0.96 0.02 90)" }}
    >
      {/* Ambient aurora */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -inset-[20%] opacity-60 animate-aurora"
          style={{
            background:
              "radial-gradient(40% 30% at 30% 30%, oklch(0.45 0.18 50 / 0.45), transparent 60%), radial-gradient(35% 28% at 70% 65%, oklch(0.55 0.15 25 / 0.35), transparent 60%), radial-gradient(50% 40% at 50% 100%, oklch(0.82 0.13 85 / 0.18), transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <BackgroundLayer bg={{ type: "animated", variant: "particles", color: "rgba(255,210,120,0.55)" }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 50%, transparent 0%, oklch(0.09 0.02 270 / 0.6) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Left: brand copy */}
        <div className="text-center md:text-left">
          <Reveal anim="fade-down">
            <p
              className="text-[11px] uppercase mb-5 inline-flex items-center gap-2"
              style={{ letterSpacing: "0.45em", color: "oklch(0.85 0.12 85)" }}
            >
              <span className="inline-block h-px w-8" style={{ background: "oklch(0.82 0.13 85)" }} />
              Cinematic Invitations
            </p>
          </Reveal>
          <Reveal anim="fade-up" delay={0.1}>
            <h1
              className="text-5xl sm:text-6xl md:text-7xl leading-[1.02] mb-5"
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
            >
              Begin <em className="italic" style={{ color: "oklch(0.88 0.1 85)" }}>your</em> story.
            </h1>
          </Reveal>
          <Reveal anim="fade-up" delay={0.2}>
            <p className="opacity-75 max-w-md mx-auto md:mx-0 leading-relaxed">
              Build a luxury, scroll-controlled invitation experience for any occasion — designed to feel like a film, not a webpage.
            </p>
          </Reveal>
          <Reveal anim="fade-up" delay={0.3}>
            <div className="mt-8 hidden md:flex items-center gap-6 text-xs uppercase tracking-[0.3em] opacity-60">
              <span>Cinematic</span>
              <span className="h-px w-6" style={{ background: "currentColor" }} />
              <span>Editable</span>
              <span className="h-px w-6" style={{ background: "currentColor" }} />
              <span>Effortless</span>
            </div>
          </Reveal>
        </div>

        {/* Right: card */}
        <Reveal anim="fade-up" delay={0.25}>
          <div
            className="relative rounded-2xl p-6 sm:p-8 backdrop-blur-xl"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in oklab, white 6%, transparent), color-mix(in oklab, white 1%, transparent))",
              border: "1px solid color-mix(in oklab, oklch(0.82 0.13 85) 22%, transparent)",
              boxShadow:
                "0 30px 80px -30px rgba(0,0,0,0.7), inset 0 1px 0 color-mix(in oklab, white 8%, transparent)",
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.4em] opacity-60 mb-4">Create the experience</p>
            <div className="space-y-3">
              <label className="block">
                <span className="block text-xs opacity-70 mb-1.5">Event type</span>
                <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="field">
                  {["Wedding","Nikah","Mehndi","Barat","Walima","Mayon","Engagement","Birthday","Anniversary","Graduation","Baby Shower","Aqiqah","Corporate Event","Award Ceremony","Farewell Party","Family Gathering","Cultural Event","Religious Celebration","Custom Event"].map(x => <option key={x} className="bg-neutral-900">{x}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="block text-xs opacity-70 mb-1.5">Event name</span>
                <input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder={`e.g. "Sara & Omar"`} className="field" />
              </label>
              <label className="block">
                <span className="block text-xs opacity-70 mb-1.5">When</span>
                <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="field" />
              </label>
              <button onClick={begin} className="btn-gold mt-2">Create the experience</button>
              <p className="text-[11px] opacity-60 text-center pt-1">
                You can edit everything later from <Link to="/admin" className="underline underline-offset-2">/admin</Link>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
