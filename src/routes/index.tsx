import { createFileRoute } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { useSite } from "@/lib/siteStore";
import { Particles } from "@/components/wedding/Particles";
import { Countdown } from "@/components/wedding/Countdown";
import heroBgDefault from "@/assets/hero-bg.jpg";
import mehndiImg from "@/assets/mehndi.jpg";
import baratImg from "@/assets/barat.jpg";
import walimaImg from "@/assets/walima.jpg";
import rukhsatiDefault from "@/assets/rukhsati.jpg";

const DEFAULT_EVENT_IMAGES: Record<string, string> = {
  mehndi: mehndiImg,
  barat: baratImg,
  walima: walimaImg,
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wedding Invitation" },
      { name: "description", content: "An invitation to our wedding celebration." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: WeddingPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as const },
};

function Hero() {
  const site = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const title = site.wedding.tagline;
  return (
    <section ref={ref} className="relative h-screen overflow-hidden bg-gradient-hero">
      <motion.div style={{ scale, y }} className="absolute inset-0">
        <img src={site.wedding.heroImage || heroBgDefault} alt="" className="h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background" />
      </motion.div>
      <Particles count={40} />
      <motion.div style={{ opacity }} className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1.2 }}
          className="text-xs sm:text-sm uppercase tracking-[0.5em] text-gold-soft/80"
        >
          {site.wedding.dateLabel}
        </motion.p>
        <h1 className="mt-8 font-display text-4xl sm:text-6xl md:text-7xl text-ivory/90 font-light leading-tight max-w-4xl">
          {title.split("").map((c, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.6 + i * 0.04, duration: 0.8 }}
              className="inline-block"
            >
              {c === " " ? "\u00A0" : c}
            </motion.span>
          ))}
        </h1>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.8, duration: 1.2 }}
          className="mt-12 flex items-center gap-6"
        >
          <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-gold" />
          <span className="font-script text-5xl sm:text-7xl text-gradient-gold">
            {site.wedding.bride} & {site.wedding.groom}
          </span>
          <span className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-gold" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.4, duration: 1 }}
          className="mt-8 max-w-xl text-muted-foreground italic font-display text-lg"
        >
          {site.wedding.story}
        </motion.p>
      </motion.div>
    </section>
  );
}

function FamilySection() {
  const site = useSite();
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <motion.div {...fadeUp} className="max-w-5xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-gold mb-6">Bismillah</p>
        <h2 className="font-display text-4xl sm:text-5xl text-ivory/90 mb-4 font-light">
          Together with their families
        </h2>
        <p className="text-muted-foreground italic max-w-2xl mx-auto">{site.family.blessing}</p>
      </motion.div>
      <div className="mt-20 max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        {[
          { title: "The Bride", name: site.wedding.bride, label: "Daughter of", father: site.family.brideFather, mother: site.family.brideMother },
          { title: "The Groom", name: site.wedding.groom, label: "Son of", father: site.family.groomFather, mother: site.family.groomMother },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass-gold rounded-2xl p-10 text-center shadow-deep"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">{f.title}</p>
            <h3 className="font-script text-6xl text-gradient-gold mb-6">{f.name}</h3>
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-3">{f.label}</p>
            <p className="font-display text-xl text-ivory/90">{f.father}</p>
            <p className="font-display text-xl text-ivory/90 mt-1">& {f.mother}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function EventSection({ event, reverse }: { event: ReturnType<typeof useSite>["events"][number]; reverse?: boolean }) {
  const image = event.image || DEFAULT_EVENT_IMAGES[event.id] || mehndiImg;
  return (
    <section className="relative py-32 px-6 overflow-hidden bg-gradient-to-b from-transparent via-card/20 to-transparent">
      <Particles count={20} />
      <div className={`relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center ${reverse ? "md:[direction:rtl]" : ""}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-deep [direction:ltr]"
        >
          <img src={image} alt={event.name} loading="lazy" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </motion.div>
        <motion.div {...fadeUp} className="[direction:ltr]">
          <p className="text-xs uppercase tracking-[0.4em] text-gold">{event.day} · {event.date}</p>
          <h2 className="mt-4 font-display text-5xl sm:text-7xl text-ivory/95 font-light">{event.name}</h2>
          <p className="mt-6 text-lg text-muted-foreground font-display italic max-w-md">{event.description}</p>
          <div className="mt-8 space-y-3 text-sm">
            <Row label="Time" value={event.time} />
            <Row label="Venue" value={event.venue} />
            <Row label="Address" value={event.address} />
            <Row label="Theme" value={event.theme} />
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {event.activities.map((a) => (
              <span key={a} className="text-xs uppercase tracking-wider px-3 py-1.5 rounded-full glass text-ivory/80">
                {a}
              </span>
            ))}
          </div>
          {event.mapsUrl && (
            <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-10 inline-flex items-center gap-2 px-8 py-3 bg-gradient-gold text-primary-foreground rounded-full font-medium hover:shadow-gold transition-all hover:scale-105">
              View on Map →
            </a>
          )}
        </motion.div>
      </div>
      {event.mapsEmbedUrl && (
        <motion.div {...fadeUp} className="relative max-w-6xl mx-auto mt-16 rounded-2xl overflow-hidden shadow-deep border border-border [direction:ltr]">
          <iframe
            src={event.mapsEmbedUrl}
            title={`${event.name} location`}
            className="w-full h-[400px]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </motion.div>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 border-b border-border pb-3">
      <span className="w-20 text-xs uppercase tracking-widest text-gold shrink-0 pt-0.5">{label}</span>
      <span className="text-ivory/90">{value}</span>
    </div>
  );
}

function Rukhsati() {
  const site = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "20%"]);
  const lines = ["Every ending becomes a new beginning.", "Daughter today.", "Queen forever.", "Two souls.", "One journey."];
  return (
    <section ref={ref} className="relative h-[140vh] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        <img src={site.wedding.rukhsatiImage || rukhsatiDefault} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
      </motion.div>
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-6 text-center relative z-10">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-150px" }}
            transition={{ duration: 1.2, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={`font-display italic ${i === 0 ? "text-3xl sm:text-5xl text-gradient-gold mb-12" : "text-xl sm:text-2xl text-ivory/80 mb-3"}`}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </section>
  );
}

function Wishes() {
  const [wishes, setWishes] = useState<Array<{ name: string; message: string }>>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("wedding-wishes") || "[]"); } catch { return []; }
  });
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    const next = [{ name: name.trim().slice(0, 80), message: message.trim().slice(0, 300) }, ...wishes];
    setWishes(next);
    localStorage.setItem("wedding-wishes", JSON.stringify(next));
    setName(""); setMessage("");
  };
  return (
    <section className="relative py-32 px-6">
      <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center mb-16">
        <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Blessings</p>
        <h2 className="font-display text-5xl sm:text-6xl text-ivory/95 font-light">Leave a wish</h2>
      </motion.div>
      <form onSubmit={submit} className="max-w-2xl mx-auto glass-gold rounded-2xl p-8 space-y-4">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={80} className="w-full bg-transparent border-b border-border py-3 px-2 text-ivory placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your blessing for the couple…" rows={4} maxLength={300} className="w-full bg-transparent border-b border-border py-3 px-2 text-ivory placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors resize-none" />
        <button type="submit" className="w-full py-3 bg-gradient-gold text-primary-foreground rounded-full font-medium hover:shadow-gold transition-all">Send Wish</button>
      </form>
      {wishes.length > 0 && (
        <div className="mt-16 max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishes.map((w, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-6">
              <p className="text-ivory/85 italic font-display">"{w.message}"</p>
              <p className="mt-4 text-xs uppercase tracking-widest text-gold">— {w.name}</p>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

function RSVP() {
  const site = useSite();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", guests: "1", attending: "yes", event: "All", note: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const list = JSON.parse(localStorage.getItem("wedding-rsvps") || "[]");
    list.push({ ...form, at: new Date().toISOString() });
    localStorage.setItem("wedding-rsvps", JSON.stringify(list));
    setSubmitted(true);
  };
  if (submitted) {
    return (
      <section className="relative py-32 px-6 text-center">
        <Particles count={30} />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }} className="relative max-w-xl mx-auto glass-gold rounded-2xl p-12">
          <div className="text-5xl mb-4">✦</div>
          <h3 className="font-display text-4xl text-gradient-gold mb-3">Thank you</h3>
          <p className="text-muted-foreground italic">Your presence will make our day complete.</p>
        </motion.div>
      </section>
    );
  }
  return (
    <section id="rsvp" className="relative py-32 px-6">
      <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center mb-16">
        <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">Kindly Reply</p>
        <h2 className="font-display text-5xl sm:text-6xl text-ivory/95 font-light">RSVP</h2>
      </motion.div>
      <form onSubmit={submit} className="max-w-2xl mx-auto glass-gold rounded-2xl p-8 sm:p-10 space-y-5">
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" maxLength={100} className="w-full bg-transparent border-b border-border py-3 px-2 focus:outline-none focus:border-gold transition-colors" />
        <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" maxLength={30} className="w-full bg-transparent border-b border-border py-3 px-2 focus:outline-none focus:border-gold transition-colors" />
        <div className="grid sm:grid-cols-2 gap-5">
          <select value={form.attending} onChange={(e) => setForm({ ...form, attending: e.target.value })} className="bg-transparent border-b border-border py-3 px-2 focus:outline-none focus:border-gold">
            <option value="yes" className="bg-card">Joyfully attending</option>
            <option value="no" className="bg-card">Regretfully declining</option>
          </select>
          <input type="number" min="1" max="10" value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })} placeholder="Guests" className="bg-transparent border-b border-border py-3 px-2 focus:outline-none focus:border-gold" />
        </div>
        <select value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} className="w-full bg-transparent border-b border-border py-3 px-2 focus:outline-none focus:border-gold">
          <option className="bg-card">All Events</option>
          {site.events.map((ev) => (<option key={ev.id} className="bg-card">{ev.name}</option>))}
        </select>
        <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Note for the couple (optional)" rows={3} maxLength={500} className="w-full bg-transparent border-b border-border py-3 px-2 focus:outline-none focus:border-gold resize-none" />
        <button type="submit" className="w-full py-4 bg-gradient-gold text-primary-foreground rounded-full font-medium hover:shadow-gold transition-all hover:scale-[1.02]">Confirm Attendance</button>
      </form>
    </section>
  );
}

function Contacts() {
  const site = useSite();
  return (
    <section className="relative py-32 px-6">
      <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center mb-16">
        <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">In Touch</p>
        <h2 className="font-display text-5xl sm:text-6xl text-ivory/95 font-light">Contact</h2>
      </motion.div>
      <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
        {site.contacts.map((c) => (
          <motion.div key={c.label} {...fadeUp} className="glass-gold rounded-2xl p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-gold mb-3">{c.label}</p>
            <p className="font-display text-2xl text-ivory mb-6">{c.name}</p>
            <div className="flex flex-wrap gap-3">
              {c.phone && <a href={`tel:${c.phone}`} className="px-5 py-2 rounded-full glass text-sm hover:bg-gold/10 transition-colors">Call</a>}
              {c.whatsapp && <a href={`https://wa.me/${c.whatsapp.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full glass text-sm hover:bg-gold/10 transition-colors">WhatsApp</a>}
              {c.email && <a href={`mailto:${c.email}`} className="px-5 py-2 rounded-full glass text-sm hover:bg-gold/10 transition-colors">Email</a>}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CountdownSection() {
  const site = useSite();
  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-transparent via-card/30 to-transparent">
      <Particles count={20} />
      <motion.div {...fadeUp} className="relative text-center mb-16">
        <p className="text-xs uppercase tracking-[0.4em] text-gold mb-4">The Moment</p>
        <h2 className="font-display text-5xl sm:text-6xl text-ivory/95 font-light">Counting Down</h2>
        <p className="mt-4 text-muted-foreground italic">{site.wedding.dateLabel}</p>
      </motion.div>
      <Countdown date={site.wedding.date} />
    </section>
  );
}

function Footer() {
  const site = useSite();
  return (
    <footer className="relative py-20 px-6 text-center border-t border-border">
      <p className="font-script text-5xl text-gradient-gold">{site.wedding.bride} & {site.wedding.groom}</p>
      <p className="mt-4 text-xs uppercase tracking-[0.4em] text-muted-foreground">{site.wedding.dateLabel}</p>
      <p className="mt-8 text-xs text-muted-foreground/60">Made with love.</p>
    </footer>
  );
}

function WeddingPage() {
  const site = useSite();
  return (
    <main className="bg-background text-foreground">
      <Hero />
      <FamilySection />
      {site.events.map((ev, i) => (
        <EventSection key={ev.id} event={ev} reverse={i % 2 === 1} />
      ))}
      <Rukhsati />
      <CountdownSection />
      <Wishes />
      <RSVP />
      <Contacts />
      <Footer />
    </main>
  );
}
