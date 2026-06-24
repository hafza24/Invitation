import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  Section,
  HeroSectionData,
  CountdownSectionData,
  ChapterSectionData,
  ProfilesSectionData,
  FunctionsSectionData,
  TimelineSectionData,
  GallerySectionData,
  VideoSectionData,
  MusicSectionData,
  WishesSectionData,
  ContactsSectionData,
  ScratchCardSectionData,
  ScratchCard,
} from "@/lib/siteStore";
import { Reveal, RevealText } from "./Reveal";
import { BackgroundLayer } from "./BackgroundLayer";
import { CinematicScene } from "./CinematicScene";
import type { BackgroundConfig } from "@/lib/siteStore";

function Wrap({
  bg,
  fallback,
  children,
  className = "",
  snap,
}: {
  bg?: BackgroundConfig;
  fallback?: BackgroundConfig;
  children: React.ReactNode;
  className?: string;
  snap?: boolean;
}) {
  return (
    <section
      className={`relative min-h-dvh w-full overflow-hidden flex items-center justify-center px-4 sm:px-6 py-20 sm:py-24 ${snap ? "snap-start" : ""} ${className}`}
    >
      <BackgroundLayer bg={bg} fallback={fallback} />
      <div className="relative z-10 w-full max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

// ============ HERO ============

function HeroBlock({ data, fallback }: { data: HeroSectionData; fallback?: BackgroundConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
      <BackgroundLayer bg={data.background} fallback={fallback} />
      <motion.div style={{ y, opacity }} className="relative z-10 text-center max-w-5xl">
        {data.eyebrow && (
          <Reveal anim="fade-down" duration={1}>
            <p
              className="text-xs sm:text-sm uppercase mb-8"
              style={{ letterSpacing: "0.4em", color: "var(--primary)", fontFamily: "var(--font-body)" }}
            >
              {data.eyebrow}
            </p>
          </Reveal>
        )}
        {data.tagline && (
          <Reveal anim="fade-up" delay={0.2}>
            <p className="text-base sm:text-lg opacity-80 mb-10" style={{ fontFamily: "var(--font-body)" }}>
              {data.tagline}
            </p>
          </Reveal>
        )}
        {data.mode === "couple" && data.bride && data.groom ? (
          <div className="space-y-2">
            <RevealText
              text={data.bride.name}
              mode="letter"
              delay={0.4}
              duration={1}
              className="block leading-[0.95]"
              style={{ fontSize: "clamp(2.75rem, 11vw, 9rem)" }}
            />
            <Reveal anim="fade-in" delay={1.6}>
              <div
                className="my-2 opacity-90"
                style={{ color: "var(--primary)", fontFamily: "'Great Vibes', cursive", fontSize: "clamp(1.75rem, 5vw, 3.5rem)" }}
                aria-hidden="true"
              >
                {data.separator || "&"}
              </div>
            </Reveal>
            <RevealText
              text={data.groom.name}
              mode="letter"
              delay={1.8}
              duration={1}
              className="block leading-[0.95]"
              style={{ fontSize: "clamp(2.75rem, 11vw, 9rem)" }}
            />
          </div>
        ) : (
          data.person && (
            <RevealText
              text={data.person.name}
              mode="letter"
              delay={0.4}
              duration={1}
              className="block leading-[0.95]"
              style={{ fontSize: "clamp(2.75rem, 11vw, 9rem)" }}
            />
          )
        )}
        {data.story && (
          <Reveal anim="fade-up" delay={2.5}>
            <p className="mt-12 max-w-2xl mx-auto opacity-80 text-base sm:text-lg italic" style={{ fontFamily: "var(--font-body)" }}>
              {data.story}
            </p>
          </Reveal>
        )}
        <Reveal anim="fade-up" delay={2.8}>
          <div className="mt-16 flex flex-col items-center gap-2 opacity-60">
            <span className="text-xs uppercase tracking-[0.3em]">Scroll</span>
            <motion.div className="w-px h-12" style={{ background: "var(--primary)" }} animate={{ scaleY: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
          </div>
        </Reveal>
      </motion.div>
    </section>
  );
}

// ============ COUNTDOWN ============

function CountdownBlock({ data, fallback }: { data: CountdownSectionData; fallback?: BackgroundConfig }) {
  const [t, setT] = useState(() => diff(new Date(data.date)));
  useEffect(() => {
    const id = setInterval(() => setT(diff(new Date(data.date))), 1000);
    return () => clearInterval(id);
  }, [data.date]);
  return (
    <Wrap bg={data.background} fallback={fallback}>
      <div className="text-center">
        {data.title && (
          <Reveal anim="fade-up">
            <h2 className="text-4xl sm:text-6xl mb-4" style={{ fontFamily: "var(--font-heading)" }}>{data.title}</h2>
          </Reveal>
        )}
        {data.label && (
          <Reveal anim="fade-up" delay={0.1}>
            <p className="opacity-70 mb-12">{data.label}</p>
          </Reveal>
        )}
        <Reveal anim="zoom-in" delay={0.2}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { v: t.days, l: "Days" },
              { v: t.hours, l: "Hours" },
              { v: t.minutes, l: "Minutes" },
              { v: t.seconds, l: "Seconds" },
            ].map((u) => (
              <div
                key={u.l}
                className="rounded-2xl p-6 sm:p-8 backdrop-blur"
                style={{
                  background: "color-mix(in oklab, var(--card) 70%, transparent)",
                  border: "1px solid color-mix(in oklab, var(--primary) 30%, transparent)",
                  boxShadow: "0 20px 60px -20px color-mix(in oklab, var(--primary) 40%, transparent)",
                }}
              >
                <div className="text-5xl sm:text-6xl tabular-nums" style={{ fontFamily: "var(--font-heading)", color: "var(--primary)" }}>
                  {String(u.v).padStart(2, "0")}
                </div>
                <div className="mt-2 text-xs uppercase opacity-70 tracking-[0.3em]">{u.l}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </Wrap>
  );
}

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms % 86400000) / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000),
    seconds: Math.floor((ms % 60000) / 1000),
  };
}

// ============ CHAPTER ============

function ChapterBlock({ data, fallback }: { data: ChapterSectionData; fallback?: BackgroundConfig }) {
  const isCenter = data.layout === "center" || data.layout === "fullbleed";
  return (
    <Wrap bg={data.background} fallback={fallback}>
      <div className={`grid ${data.image && !isCenter ? "md:grid-cols-2" : "grid-cols-1"} gap-12 items-center`}>
        {data.image && data.layout === "left" && (
          <Reveal anim="fade-left"><img src={data.image} alt={data.title || data.subtitle || ""} loading="lazy" className="rounded-2xl w-full" /></Reveal>
        )}
        <div className={isCenter ? "text-center max-w-3xl mx-auto" : ""}>
          {data.subtitle && (
            <Reveal anim="fade-up">
              <p className="text-xs uppercase tracking-[0.4em] mb-4" style={{ color: "var(--primary)" }}>{data.subtitle}</p>
            </Reveal>
          )}
          {data.title && (
            <Reveal anim={data.anim || "letter"} delay={0.1}>
              <h2 className="mb-6" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2.25rem, 6vw, 5rem)", lineHeight: 1.05 }}>
                {data.anim === "letter" || !data.anim ? <RevealText text={data.title} mode="letter" /> : data.title}
              </h2>
            </Reveal>
          )}
          {data.body && (
            <Reveal anim="fade-up" delay={0.4}>
              <p className="opacity-80 leading-relaxed" style={{ fontFamily: "var(--font-body)", fontSize: "clamp(1rem, 1.6vw, 1.25rem)" }}>{data.body}</p>
            </Reveal>
          )}
        </div>
        {data.image && data.layout === "right" && (
          <Reveal anim="fade-right"><img src={data.image} alt={data.title || data.subtitle || ""} loading="lazy" className="rounded-2xl w-full" /></Reveal>
        )}
        {data.image && isCenter && (
          <Reveal anim="zoom-in" delay={0.3}><img src={data.image} alt={data.title || data.subtitle || ""} loading="lazy" className="rounded-2xl w-full max-w-3xl mx-auto mt-8" /></Reveal>
        )}
      </div>
    </Wrap>
  );
}

// ============ PROFILES ============

function ProfilesBlock({ data, fallback }: { data: ProfilesSectionData; fallback?: BackgroundConfig }) {
  return (
    <Wrap bg={data.background} fallback={fallback}>
      {data.title && (
        <Reveal anim="fade-up"><h2 className="text-5xl sm:text-6xl text-center mb-16" style={{ fontFamily: "var(--font-heading)" }}>{data.title}</h2></Reveal>
      )}
      <div className={`grid gap-12 ${data.profiles.length > 1 ? "md:grid-cols-2" : "max-w-2xl mx-auto"}`}>
        {data.profiles.map((p, i) => (
          <Reveal key={i} anim={i % 2 === 0 ? "fade-right" : "fade-left"} delay={i * 0.15}>
            <div className="text-center">
              {p.photo && (
                <div className="mx-auto w-48 h-48 rounded-full overflow-hidden mb-6" style={{ border: "2px solid var(--primary)" }}>
                  <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                </div>
              )}
              <h3 className="text-4xl mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--primary)" }}>{p.name}</h3>
              {p.relation && <p className="opacity-70 italic mb-3">{p.relation}</p>}
              {p.description && <p className="opacity-80 leading-relaxed">{p.description}</p>}
              {p.personality && <p className="mt-4 text-sm opacity-70">{p.personality}</p>}
              {p.remark && <p className="mt-4 italic opacity-70">"{p.remark}"</p>}
            </div>
          </Reveal>
        ))}
      </div>
    </Wrap>
  );
}

// ============ FUNCTIONS ============

function FunctionsBlock({ data, fallback }: { data: FunctionsSectionData; fallback?: BackgroundConfig }) {
  return (
    <Wrap bg={data.background} fallback={fallback}>
      {data.title && (
        <Reveal anim="fade-up"><h2 className="text-5xl sm:text-6xl text-center mb-16" style={{ fontFamily: "var(--font-heading)" }}>{data.title}</h2></Reveal>
      )}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {data.functions.map((f, i) => (
          <Reveal key={f.id} anim="fade-up" delay={i * 0.12}>
            <div
              className="rounded-2xl overflow-hidden h-full flex flex-col"
              style={{
                background: "color-mix(in oklab, var(--card) 80%, transparent)",
                border: "1px solid color-mix(in oklab, var(--primary) 25%, transparent)",
                backdropFilter: "blur(10px)",
              }}
            >
              {f.cover && <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${f.cover})` }} />}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-3xl mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--primary)" }}>{f.name}</h3>
                <div className="space-y-1 text-sm opacity-80 mb-4">
                  {f.date && <p>📅 {f.date}{f.time ? ` · ${f.time}` : ""}</p>}
                  {f.venue && <p>📍 {f.venue}</p>}
                  {f.address && <p className="opacity-70">{f.address}</p>}
                  {f.dressCode && <p>👗 {f.dressCode}</p>}
                  {f.theme && <p className="italic">{f.theme}</p>}
                </div>
                {f.description && <p className="text-sm opacity-80 mb-4 flex-1">{f.description}</p>}
                {f.mapsEmbedUrl && (
                  <iframe src={f.mapsEmbedUrl} className="w-full h-40 rounded-lg mt-2" loading="lazy" />
                )}
                {f.mapsUrl && !f.mapsEmbedUrl && (
                  <a href={f.mapsUrl} target="_blank" rel="noreferrer" className="text-sm underline" style={{ color: "var(--primary)" }}>Open in Maps →</a>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Wrap>
  );
}

// ============ TIMELINE ============

function TimelineBlock({ data, fallback }: { data: TimelineSectionData; fallback?: BackgroundConfig }) {
  return (
    <Wrap bg={data.background} fallback={fallback}>
      {data.title && <Reveal anim="fade-up"><h2 className="text-5xl sm:text-6xl text-center mb-16" style={{ fontFamily: "var(--font-heading)" }}>{data.title}</h2></Reveal>}
      <div className="relative max-w-3xl mx-auto">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px" style={{ background: "color-mix(in oklab, var(--primary) 40%, transparent)" }} />
        <div className="space-y-12">
          {data.milestones.map((m, i) => (
            <Reveal key={m.id} anim={i % 2 === 0 ? "fade-right" : "fade-left"} delay={0.05}>
              <div className={`relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-8 ${i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"}`}>
                <div className={`absolute left-2 md:left-1/2 top-2 w-4 h-4 rounded-full -translate-x-1/2`} style={{ background: "var(--primary)", boxShadow: "0 0 20px var(--primary)" }} />
                <div className={i % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12"}>
                  <p className="text-xs uppercase tracking-[0.3em] opacity-60 mb-1">{m.date}</p>
                  <h3 className="text-2xl mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--primary)" }}>{m.title}</h3>
                  {m.description && <p className="opacity-80">{m.description}</p>}
                </div>
                {m.image && (
                  <div className={i % 2 === 0 ? "md:pl-12 mt-4 md:mt-0" : "md:pr-12 mt-4 md:mt-0"}>
                    <img src={m.image} alt={m.title} className="rounded-xl w-full" />
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Wrap>
  );
}

// ============ GALLERY ============

function GalleryBlock({ data, fallback }: { data: GallerySectionData; fallback?: BackgroundConfig }) {
  if (!data.items.length) return null;
  return (
    <Wrap bg={data.background} fallback={fallback}>
      {data.title && <Reveal anim="fade-up"><h2 className="text-5xl sm:text-6xl text-center mb-16" style={{ fontFamily: "var(--font-heading)" }}>{data.title}</h2></Reveal>}
      <div className={data.layout === "masonry" ? "columns-2 md:columns-3 gap-4 space-y-4" : "grid grid-cols-2 md:grid-cols-3 gap-4"}>
        {data.items.map((it, i) => (
          <Reveal key={it.id} anim="zoom-in" delay={i * 0.05}>
            <div className="overflow-hidden rounded-xl break-inside-avoid">
              {it.kind === "image" ? (
                <img src={it.src} alt={it.caption || ""} className="w-full h-auto" />
              ) : (
                <video src={it.src} controls className="w-full h-auto" />
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </Wrap>
  );
}

// ============ VIDEO ============

function VideoBlock({ data, fallback }: { data: VideoSectionData; fallback?: BackgroundConfig }) {
  const embed = (() => {
    if (data.source === "youtube") {
      const id = data.url.match(/(?:v=|youtu\.be\/)([^&?]+)/)?.[1] || data.url;
      return `https://www.youtube.com/embed/${id}?autoplay=${data.autoplay ? 1 : 0}&mute=${data.muted ? 1 : 0}&loop=${data.loop ? 1 : 0}`;
    }
    if (data.source === "vimeo") {
      const id = data.url.match(/vimeo\.com\/(\d+)/)?.[1] || data.url;
      return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  })();
  return (
    <Wrap bg={data.background} fallback={fallback}>
      {data.title && <Reveal anim="fade-up"><h2 className="text-5xl sm:text-6xl text-center mb-12" style={{ fontFamily: "var(--font-heading)" }}>{data.title}</h2></Reveal>}
      <Reveal anim="zoom-in">
        <div className="aspect-video rounded-2xl overflow-hidden" style={{ boxShadow: "0 30px 80px -20px rgba(0,0,0,0.5)" }}>
          {embed ? (
            <iframe src={embed} className="w-full h-full" allow="autoplay; encrypted-media" />
          ) : (
            <video src={data.url} controls={!data.autoplay} autoPlay={data.autoplay} loop={data.loop} muted={data.muted} className="w-full h-full object-cover" />
          )}
        </div>
        {data.caption && <p className="text-center mt-6 opacity-70 italic">{data.caption}</p>}
      </Reveal>
    </Wrap>
  );
}

// ============ WISHES ============

function WishesBlock({ data, fallback }: { data: WishesSectionData; fallback?: BackgroundConfig }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("wish");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from("wishes").insert({
      guest_name: name.trim().slice(0, 100),
      message: message.trim().slice(0, 2000),
      wish_type: type,
    });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSubmitted(true);
    setName("");
    setMessage("");
  };

  return (
    <Wrap bg={data.background} fallback={fallback}>
      <div className="max-w-2xl mx-auto text-center">
        {data.title && <Reveal anim="fade-up"><h2 className="text-5xl sm:text-6xl mb-4" style={{ fontFamily: "var(--font-heading)" }}>{data.title}</h2></Reveal>}
        {data.prompt && <Reveal anim="fade-up" delay={0.1}><p className="opacity-80 mb-10 italic">{data.prompt}</p></Reveal>}
        {submitted ? (
          <Reveal anim="zoom-in">
            <div className="p-10 rounded-2xl" style={{ background: "color-mix(in oklab, var(--primary) 15%, transparent)" }}>
              <p className="text-2xl mb-2" style={{ fontFamily: "var(--font-heading)" }}>Thank you 💛</p>
              <p className="opacity-80">Your words have been kept safe.</p>
              <button onClick={() => setSubmitted(false)} className="mt-6 text-sm underline opacity-70">Leave another</button>
            </div>
          </Reveal>
        ) : (
          <Reveal anim="fade-up" delay={0.2}>
            <form onSubmit={submit} className="space-y-4 text-left">
              <label className="block">
                <span className="block text-xs uppercase tracking-[0.25em] opacity-70 mb-1.5">Your name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sara Ahmed"
                  className="w-full p-4 rounded-lg bg-transparent min-h-11"
                  style={{ border: "1px solid color-mix(in oklab, var(--primary) 30%, transparent)" }}
                  maxLength={100}
                  required
                  autoComplete="name"
                />
              </label>
              <label className="block">
                <span className="block text-xs uppercase tracking-[0.25em] opacity-70 mb-1.5">Type</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full p-4 rounded-lg bg-transparent min-h-11"
                  style={{ border: "1px solid color-mix(in oklab, var(--primary) 30%, transparent)" }}
                >
                  <option value="wish">A wish</option>
                  <option value="advice">Advice</option>
                  <option value="dua">A dua / prayer</option>
                  <option value="message">A message</option>
                  <option value="remark">A remark</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-xs uppercase tracking-[0.25em] opacity-70 mb-1.5">Your words</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write from the heart…"
                  rows={5}
                  className="w-full p-4 rounded-lg bg-transparent"
                  style={{ border: "1px solid color-mix(in oklab, var(--primary) 30%, transparent)" }}
                  maxLength={2000}
                  required
                />
              </label>
              {error && <p role="alert" className="text-sm" style={{ color: "tomato" }}>{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full p-4 rounded-lg font-medium uppercase tracking-[0.2em] text-sm transition-opacity disabled:opacity-50 min-h-12"
                style={{ background: "var(--primary)", color: "var(--background)" }}
              >
                {submitting ? "Sending..." : "Send with love"}
              </button>
              <p className="text-xs opacity-60 text-center">Private — only seen by the hosts.</p>
            </form>
          </Reveal>
        )}
      </div>
    </Wrap>
  );
}

// ============ CONTACTS ============

function ContactsBlock({ data, fallback }: { data: ContactsSectionData; fallback?: BackgroundConfig }) {
  return (
    <Wrap bg={data.background} fallback={fallback}>
      {data.title && <Reveal anim="fade-up"><h2 className="text-5xl sm:text-6xl text-center mb-12" style={{ fontFamily: "var(--font-heading)" }}>{data.title}</h2></Reveal>}
      <div className="grid gap-6 md:grid-cols-2 max-w-3xl mx-auto">
        {data.contacts.map((c, i) => (
          <Reveal key={c.id} anim="fade-up" delay={i * 0.08}>
            <div
              className="p-6 rounded-2xl"
              style={{
                background: "color-mix(in oklab, var(--card) 80%, transparent)",
                border: "1px solid color-mix(in oklab, var(--primary) 25%, transparent)",
              }}
            >
              <p className="text-xs uppercase tracking-[0.3em] opacity-60 mb-1">{c.role}</p>
              <h3 className="text-2xl mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--primary)" }}>{c.name}</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="px-3 py-2 rounded-lg" style={{ background: "color-mix(in oklab, var(--primary) 15%, transparent)" }}>Call</a>
                )}
                {c.whatsapp && (
                  <a href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg" style={{ background: "color-mix(in oklab, var(--primary) 15%, transparent)" }}>WhatsApp</a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} className="px-3 py-2 rounded-lg" style={{ background: "color-mix(in oklab, var(--primary) 15%, transparent)" }}>Email</a>
                )}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Wrap>
  );
}

// ============ MUSIC ============

function MusicBlock({ data, fallback }: { data: MusicSectionData; fallback?: BackgroundConfig }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(!!data.autoplay);
  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { void a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); }
  };
  return (
    <Wrap bg={data.background} fallback={fallback}>
      <div className="max-w-2xl mx-auto text-center">
        {data.title && (
          <Reveal anim="fade-up">
            <h2 className="text-5xl sm:text-6xl mb-10" style={{ fontFamily: "var(--font-heading)" }}>{data.title}</h2>
          </Reveal>
        )}
        <Reveal anim="zoom-in" delay={0.1}>
          <div
            className="p-8 rounded-3xl backdrop-blur flex items-center gap-6"
            style={{
              background: "color-mix(in oklab, var(--card) 70%, transparent)",
              border: "1px solid color-mix(in oklab, var(--primary) 30%, transparent)",
              boxShadow: "0 30px 80px -20px color-mix(in oklab, var(--primary) 40%, transparent)",
            }}
          >
            {data.coverArt ? (
              <img src={data.coverArt} alt="" className="w-24 h-24 rounded-2xl object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "var(--primary)", color: "var(--background)" }}>♪</div>
            )}
            <div className="flex-1 text-left">
              {data.trackTitle && <p className="text-2xl" style={{ fontFamily: "var(--font-heading)" }}>{data.trackTitle}</p>}
              {data.artist && <p className="opacity-70 text-sm">{data.artist}</p>}
            </div>
            <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="w-14 h-14 rounded-full flex items-center justify-center text-2xl" style={{ background: "var(--primary)", color: "var(--background)" }}>
              {playing ? "❚❚" : "▶"}
            </button>
            <audio ref={audioRef} src={data.url} loop={data.loop} autoPlay={data.autoplay} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
          </div>
        </Reveal>
      </div>
    </Wrap>
  );
}

// ============ SCRATCH CARD ============

function ScratchCardItem({
  card,
  brushSize = 28,
  threshold = 0.55,
}: {
  card: ScratchCard;
  brushSize?: number;
  threshold?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const [revealed, setRevealed] = useState(false);

  const paintCover = () => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = wrap.getBoundingClientRect();
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const paint = () => {
      // Base color
      ctx.fillStyle = card.coverColor || "#b08a4f";
      ctx.fillRect(0, 0, width, height);
      // subtle gradient sheen
      const g = ctx.createLinearGradient(0, 0, width, height);
      g.addColorStop(0, "rgba(255,255,255,0.18)");
      g.addColorStop(0.5, "rgba(255,255,255,0)");
      g.addColorStop(1, "rgba(0,0,0,0.18)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
      if (card.coverText) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `600 ${Math.max(14, Math.min(width, height) * 0.09)}px var(--font-body, system-ui)`;
        ctx.fillText(card.coverText, width / 2, height / 2);
      }
      ctx.globalCompositeOperation = "destination-out";
    };
    if (card.coverImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        ctx.globalCompositeOperation = "destination-out";
      };
      img.onerror = paint;
      img.src = card.coverImage;
    } else {
      paint();
    }
  };

  useEffect(() => {
    paintCover();
    const onResize = () => {
      if (!revealed) paintCover();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.coverColor, card.coverImage, card.coverText]);

  const pointAt = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const scratch = (e: React.PointerEvent) => {
    if (!drawing.current || revealed) return;
    const ctx = canvasRef.current?.getContext("2d");
    const p = pointAt(e);
    if (!ctx || !p) return;
    ctx.beginPath();
    ctx.arc(p.x, p.y, brushSize, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkReveal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    const sampleW = 60;
    const sampleH = 60;
    const data = ctx.getImageData(0, 0, width, height).data;
    let cleared = 0;
    const step = Math.max(1, Math.floor((width * height) / (sampleW * sampleH)));
    let total = 0;
    for (let i = 3; i < data.length; i += 4 * step) {
      total++;
      if (data[i] === 0) cleared++;
    }
    if (cleared / total >= threshold) setRevealed(true);
  };

  return (
    <div
      ref={wrapRef}
      className="relative rounded-2xl overflow-hidden select-none"
      style={{
        aspectRatio: "4/3",
        background: "color-mix(in oklab, var(--card) 85%, transparent)",
        border: "1px solid color-mix(in oklab, var(--primary) 30%, transparent)",
        boxShadow: "0 20px 60px -20px color-mix(in oklab, var(--primary) 40%, transparent)",
      }}
    >
      {/* Reveal layer */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
        {card.revealImage && (
          <img src={card.revealImage} alt="" className="max-h-[60%] object-contain mb-3 rounded-lg" />
        )}
        {card.revealTitle && (
          <h3 className="text-3xl sm:text-4xl mb-2" style={{ fontFamily: "var(--font-heading)", color: "var(--primary)" }}>
            {card.revealTitle}
          </h3>
        )}
        {card.revealMessage && <p className="opacity-85 max-w-md">{card.revealMessage}</p>}
      </div>
      {/* Scratch canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 touch-none transition-opacity duration-500 ${revealed ? "opacity-0 pointer-events-none" : "cursor-grab active:cursor-grabbing"}`}
        onPointerDown={(e) => { (e.target as Element).setPointerCapture(e.pointerId); drawing.current = true; scratch(e); }}
        onPointerMove={scratch}
        onPointerUp={() => { drawing.current = false; checkReveal(); }}
        onPointerLeave={() => { drawing.current = false; }}
      />
      {card.label && (
        <span className="absolute top-3 left-3 text-xs uppercase tracking-[0.3em] opacity-80 px-2 py-1 rounded" style={{ background: "color-mix(in oklab, var(--background) 60%, transparent)" }}>
          {card.label}
        </span>
      )}
      {!revealed && (
        <button
          onClick={() => setRevealed(true)}
          className="absolute bottom-3 right-3 text-xs px-3 py-1.5 rounded-full"
          style={{ background: "color-mix(in oklab, var(--background) 70%, transparent)", color: "var(--text)" }}
        >
          Reveal
        </button>
      )}
    </div>
  );
}

function ScratchCardBlock({ data, fallback }: { data: ScratchCardSectionData; fallback?: BackgroundConfig }) {
  return (
    <Wrap bg={data.background} fallback={fallback}>
      <div className="text-center mb-12">
        {data.title && (
          <Reveal anim="fade-up">
            <h2 className="text-5xl sm:text-6xl mb-4" style={{ fontFamily: "var(--font-heading)" }}>{data.title}</h2>
          </Reveal>
        )}
        {data.prompt && (
          <Reveal anim="fade-up" delay={0.1}>
            <p className="opacity-80 italic max-w-2xl mx-auto">{data.prompt}</p>
          </Reveal>
        )}
      </div>
      <div className={`grid gap-6 ${data.cards.length === 1 ? "max-w-xl mx-auto" : "md:grid-cols-2 lg:grid-cols-3"}`}>
        {data.cards.map((c, i) => (
          <Reveal key={c.id} anim="zoom-in" delay={i * 0.1}>
            <ScratchCardItem card={c} brushSize={data.brushSize ?? 28} threshold={data.revealThreshold ?? 0.55} />
          </Reveal>
        ))}
      </div>
    </Wrap>
  );
}

// ============ DISPATCH ============

function renderBlock(section: Section, fallback?: BackgroundConfig) {
  switch (section.kind) {
    case "hero": return <HeroBlock data={section} fallback={fallback} />;
    case "countdown": return <CountdownBlock data={section} fallback={fallback} />;
    case "chapter": return <ChapterBlock data={section} fallback={fallback} />;
    case "profiles": return <ProfilesBlock data={section} fallback={fallback} />;
    case "functions": return <FunctionsBlock data={section} fallback={fallback} />;
    case "timeline": return <TimelineBlock data={section} fallback={fallback} />;
    case "gallery": return <GalleryBlock data={section} fallback={fallback} />;
    case "video": return <VideoBlock data={section} fallback={fallback} />;
    case "music": return <MusicBlock data={section} fallback={fallback} />;
    case "wishes": return <WishesBlock data={section} fallback={fallback} />;
    case "contacts": return <ContactsBlock data={section} fallback={fallback} />;
    case "scratchcard": return <ScratchCardBlock data={section} fallback={fallback} />;
    default: return null;
  }
}

export function SectionRenderer({
  section,
  fallback,
  first = false,
  last = false,
  cinematic = true,
}: {
  section: Section;
  fallback?: BackgroundConfig;
  first?: boolean;
  last?: boolean;
  cinematic?: boolean;
}) {
  if (!section.enabled) return null;
  const block = renderBlock(section, fallback);
  if (!block) return null;
  if (!cinematic) return <>{block}</>;
  // Hero already has its own parallax + min-h-screen; pin it short for a clean handoff.
  const length = section.kind === "hero" ? 1.4 : section.kind === "gallery" || section.kind === "timeline" ? 1.8 : 1.6;
  return (
    <CinematicScene length={length} first={first} last={last}>
      <div className="w-full h-full">{block}</div>
    </CinematicScene>
  );
}
