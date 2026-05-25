import { createFileRoute, Link } from "@tanstack/react-router";
import { useSite, setState, seedSections, type SiteState } from "@/lib/siteStore";
import { useState } from "react";
import { SectionRenderer } from "@/components/site/Sections";
import { BackgroundLayer } from "@/components/site/BackgroundLayer";
import { CursorEffects } from "@/components/site/CursorEffects";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "An Invitation" },
      { name: "description", content: "A cinematic invitation experience." },
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
      <div className={site.theme.snapSections ? "snap-y snap-mandatory h-screen overflow-y-auto" : ""}>
        {site.sections.map((s) => (
          <SectionRenderer key={s.id} section={s} fallback={site.theme.defaultBackground} />
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
    <main className="min-h-screen relative flex items-center justify-center px-6 overflow-hidden" style={{ background: "oklch(0.13 0.02 270)", color: "oklch(0.96 0.02 90)" }}>
      <BackgroundLayer bg={{ type: "animated", variant: "particles", color: "rgba(255,210,120,0.6)" }} />
      <div className="relative z-10 max-w-xl w-full text-center">
        <Reveal anim="fade-down">
          <p className="text-xs uppercase tracking-[0.4em] mb-6" style={{ color: "oklch(0.82 0.13 85)" }}>Cinematic Invitations</p>
        </Reveal>
        <Reveal anim="fade-up" delay={0.1}>
          <h1 className="text-5xl sm:text-7xl mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Begin your story</h1>
        </Reveal>
        <Reveal anim="fade-up" delay={0.2}>
          <p className="opacity-80 mb-10">A platform for building luxury, scroll-controlled invitation experiences for any event.</p>
        </Reveal>
        <Reveal anim="fade-up" delay={0.3}>
          <div className="space-y-3 text-left">
            <select value={eventType} onChange={(e) => setEventType(e.target.value)} className="w-full p-4 rounded-lg bg-black/40 border border-white/20">
              {["Wedding","Nikah","Mehndi","Barat","Walima","Mayon","Engagement","Birthday","Anniversary","Graduation","Baby Shower","Aqiqah","Corporate Event","Award Ceremony","Farewell Party","Family Gathering","Cultural Event","Religious Celebration","Custom Event"].map(x => <option key={x}>{x}</option>)}
            </select>
            <input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder={`Event name (e.g. "Sara & Omar")`} className="w-full p-4 rounded-lg bg-black/40 border border-white/20" />
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 rounded-lg bg-black/40 border border-white/20" />
            <button onClick={begin} className="w-full p-4 rounded-lg font-medium uppercase tracking-[0.3em] text-sm" style={{ background: "oklch(0.82 0.13 85)", color: "oklch(0.13 0.02 270)" }}>
              Create the experience
            </button>
            <p className="text-xs opacity-60 text-center pt-2">You can edit everything later from <Link to="/admin" className="underline">/admin</Link></p>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
