import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSite, setState, resetState, isAuthed, login, logout, type EventItem, type Contact } from "@/lib/siteStore";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · Wedding" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Tab = "wedding" | "family" | "events" | "contacts" | "theme" | "data";

function AdminPage() {
  const [authed, setAuthed] = useState(isAuthed());
  if (!authed) return <Login onOk={() => setAuthed(true)} />;
  return <Dashboard onLogout={() => { logout(); setAuthed(false); }} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (u === "admin" && login(p)) onOk();
    else setErr("Invalid credentials");
  };
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-hero p-6">
      <form onSubmit={submit} className="glass-gold rounded-2xl p-10 w-full max-w-md shadow-deep">
        <p className="text-xs uppercase tracking-[0.4em] text-gold text-center">Admin</p>
        <h1 className="font-display text-4xl text-ivory text-center mt-2 mb-8">Sign in</h1>
        <Input label="Username" value={u} onChange={setU} />
        <Input label="Password" type="password" value={p} onChange={setP} />
        {err && <p className="text-destructive text-sm mt-3">{err}</p>}
        <button className="w-full mt-6 py-3 bg-gradient-gold text-primary-foreground rounded-full font-medium hover:shadow-gold transition-all">Enter</button>
        <p className="text-xs text-muted-foreground mt-4 text-center">Default: admin / admin123</p>
      </form>
    </main>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("wedding");
  const tabs: { id: Tab; label: string }[] = [
    { id: "wedding", label: "Wedding" },
    { id: "family", label: "Family" },
    { id: "events", label: "Events" },
    { id: "contacts", label: "Contacts" },
    { id: "theme", label: "Theme & Colors" },
    { id: "data", label: "Data" },
  ];
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 md:min-h-screen border-b md:border-b-0 md:border-r border-border p-6 glass">
        <p className="font-script text-3xl text-gradient-gold">Admin</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Wedding Panel</p>
        <nav className="mt-8 flex md:flex-col gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-left px-4 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${tab === t.id ? "bg-gold/15 text-gold" : "text-muted-foreground hover:text-ivory hover:bg-secondary/50"}`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="mt-8 space-y-2">
          <a href="/" target="_blank" className="block text-xs text-muted-foreground hover:text-gold">↗ View site</a>
          <button onClick={onLogout} className="text-xs text-muted-foreground hover:text-destructive">Sign out</button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-12 max-w-5xl">
        {tab === "wedding" && <WeddingTab />}
        {tab === "family" && <FamilyTab />}
        {tab === "events" && <EventsTab />}
        {tab === "contacts" && <ContactsTab />}
        {tab === "theme" && <ThemeTab />}
        {tab === "data" && <DataTab />}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-3xl text-ivory mb-6">{title}</h2>
      <div className="glass-gold rounded-2xl p-6 sm:p-8 space-y-5">{children}</div>
    </section>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-gold">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-transparent border-b border-border py-2 px-1 text-ivory focus:outline-none focus:border-gold transition-colors"
      />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-gold">{label}</span>
      <textarea
        value={value}
        rows={3}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-transparent border border-border rounded-lg p-3 text-ivory focus:outline-none focus:border-gold transition-colors resize-none"
      />
    </label>
  );
}

function ImageField({ label, value, onChange }: { label: string; value?: string; onChange: (v: string | undefined) => void }) {
  const onFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1_500_000) {
      alert("Image too large. Use under 1.5 MB or paste a URL.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };
  return (
    <div>
      <span className="text-xs uppercase tracking-widest text-gold">{label}</span>
      <div className="mt-2 flex flex-col sm:flex-row gap-3 items-start">
        {value && <img src={value} alt="" className="h-20 w-20 object-cover rounded-lg border border-border" />}
        <div className="flex-1 space-y-2 w-full">
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value || undefined)}
            placeholder="Paste image URL"
            className="w-full bg-transparent border-b border-border py-2 px-1 text-ivory focus:outline-none focus:border-gold text-sm"
          />
          <div className="flex gap-2">
            <label className="text-xs px-3 py-1.5 rounded-full glass cursor-pointer hover:bg-gold/10">
              Upload file
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            {value && <button onClick={() => onChange(undefined)} className="text-xs px-3 py-1.5 rounded-full glass hover:bg-destructive/20">Remove</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function WeddingTab() {
  const s = useSite();
  const upd = (k: keyof typeof s.wedding) => (v: string) => setState((p) => ({ ...p, wedding: { ...p.wedding, [k]: v } }));
  const updImg = (k: "heroImage" | "rukhsatiImage") => (v: string | undefined) => setState((p) => ({ ...p, wedding: { ...p.wedding, [k]: v } }));
  return (
    <Section title="Wedding Information">
      <div className="grid sm:grid-cols-2 gap-5">
        <Input label="Bride Name" value={s.wedding.bride} onChange={upd("bride")} />
        <Input label="Groom Name" value={s.wedding.groom} onChange={upd("groom")} />
      </div>
      <Input label="Tagline / Hero Heading" value={s.wedding.tagline} onChange={upd("tagline")} />
      <div className="grid sm:grid-cols-2 gap-5">
        <Input label="Date (ISO, e.g. 2026-08-14T18:00:00)" value={s.wedding.date} onChange={upd("date")} />
        <Input label="Date Label (shown on site)" value={s.wedding.dateLabel} onChange={upd("dateLabel")} />
      </div>
      <Textarea label="Story / Subheading" value={s.wedding.story} onChange={upd("story")} />
      <ImageField label="Hero Background Image" value={s.wedding.heroImage} onChange={updImg("heroImage")} />
      <ImageField label="Rukhsati Section Image" value={s.wedding.rukhsatiImage} onChange={updImg("rukhsatiImage")} />
    </Section>
  );
}

function FamilyTab() {
  const s = useSite();
  const upd = (k: keyof typeof s.family) => (v: string) => setState((p) => ({ ...p, family: { ...p.family, [k]: v } }));
  return (
    <Section title="Family Information">
      <div className="grid sm:grid-cols-2 gap-5">
        <Input label="Bride's Father" value={s.family.brideFather} onChange={upd("brideFather")} />
        <Input label="Bride's Mother" value={s.family.brideMother} onChange={upd("brideMother")} />
        <Input label="Groom's Father" value={s.family.groomFather} onChange={upd("groomFather")} />
        <Input label="Groom's Mother" value={s.family.groomMother} onChange={upd("groomMother")} />
      </div>
      <Textarea label="Blessing Message" value={s.family.blessing} onChange={upd("blessing")} />
    </Section>
  );
}

function EventsTab() {
  const s = useSite();
  const updateEvent = (idx: number, patch: Partial<EventItem>) =>
    setState((p) => ({ ...p, events: p.events.map((e, i) => (i === idx ? { ...e, ...patch } : e)) }));
  const remove = (idx: number) => setState((p) => ({ ...p, events: p.events.filter((_, i) => i !== idx) }));
  const add = () =>
    setState((p) => ({
      ...p,
      events: [
        ...p.events,
        {
          id: `event-${Date.now()}`,
          name: "New Event",
          date: "",
          day: "",
          time: "",
          venue: "",
          address: "",
          mapsUrl: "",
          mapsEmbedUrl: "",
          description: "",
          theme: "",
          activities: [],
        },
      ],
    }));
  const move = (idx: number, dir: -1 | 1) =>
    setState((p) => {
      const events = [...p.events];
      const j = idx + dir;
      if (j < 0 || j >= events.length) return p;
      [events[idx], events[j]] = [events[j], events[idx]];
      return { ...p, events };
    });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl text-ivory">Events</h2>
        <button onClick={add} className="px-5 py-2 rounded-full bg-gradient-gold text-primary-foreground text-sm font-medium">+ Add Event</button>
      </div>
      <div className="space-y-6">
        {s.events.map((ev, i) => (
          <div key={ev.id} className="glass-gold rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <Input label="Event Name" value={ev.name} onChange={(v) => updateEvent(i, { name: v })} />
              <div className="flex gap-1 pt-6 shrink-0">
                <button onClick={() => move(i, -1)} className="text-xs px-2 py-1 rounded glass hover:bg-gold/10" title="Move up">↑</button>
                <button onClick={() => move(i, 1)} className="text-xs px-2 py-1 rounded glass hover:bg-gold/10" title="Move down">↓</button>
                <button onClick={() => remove(i)} className="text-xs px-2 py-1 rounded glass hover:bg-destructive/20" title="Delete">✕</button>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              <Input label="Date" value={ev.date} onChange={(v) => updateEvent(i, { date: v })} />
              <Input label="Day" value={ev.day} onChange={(v) => updateEvent(i, { day: v })} />
              <Input label="Time" value={ev.time} onChange={(v) => updateEvent(i, { time: v })} />
            </div>
            <Input label="Venue" value={ev.venue} onChange={(v) => updateEvent(i, { venue: v })} />
            <Input label="Address" value={ev.address} onChange={(v) => updateEvent(i, { address: v })} />
            <Input label="Google Maps URL (button link)" value={ev.mapsUrl} onChange={(v) => updateEvent(i, { mapsUrl: v })} placeholder="https://maps.google.com/..." />
            <Textarea label="Google Maps Embed URL (iframe src — Maps → Share → Embed a map → copy the src)" value={ev.mapsEmbedUrl || ""} onChange={(v) => updateEvent(i, { mapsEmbedUrl: v })} />
            <Textarea label="Description" value={ev.description} onChange={(v) => updateEvent(i, { description: v })} />
            <Input label="Theme Colors / Mood" value={ev.theme} onChange={(v) => updateEvent(i, { theme: v })} />
            <Input label="Activities (comma separated)" value={ev.activities.join(", ")} onChange={(v) => updateEvent(i, { activities: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
            <ImageField label="Event Image" value={ev.image} onChange={(v) => updateEvent(i, { image: v })} />
          </div>
        ))}
      </div>
    </>
  );
}

function ContactsTab() {
  const s = useSite();
  const update = (idx: number, patch: Partial<Contact>) =>
    setState((p) => ({ ...p, contacts: p.contacts.map((c, i) => (i === idx ? { ...c, ...patch } : c)) }));
  const remove = (idx: number) => setState((p) => ({ ...p, contacts: p.contacts.filter((_, i) => i !== idx) }));
  const add = () => setState((p) => ({ ...p, contacts: [...p.contacts, { label: "New Contact", name: "", phone: "", whatsapp: "", email: "" }] }));
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-3xl text-ivory">Contacts</h2>
        <button onClick={add} className="px-5 py-2 rounded-full bg-gradient-gold text-primary-foreground text-sm font-medium">+ Add Contact</button>
      </div>
      <div className="space-y-6">
        {s.contacts.map((c, i) => (
          <div key={i} className="glass-gold rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="flex justify-between gap-4">
              <Input label="Label (e.g. Bride's Side)" value={c.label} onChange={(v) => update(i, { label: v })} />
              <button onClick={() => remove(i)} className="text-xs px-3 py-1.5 rounded-full glass hover:bg-destructive/20 self-end">Remove</button>
            </div>
            <Input label="Name" value={c.name} onChange={(v) => update(i, { name: v })} />
            <div className="grid sm:grid-cols-3 gap-5">
              <Input label="Phone" value={c.phone} onChange={(v) => update(i, { phone: v })} />
              <Input label="WhatsApp" value={c.whatsapp} onChange={(v) => update(i, { whatsapp: v })} />
              <Input label="Email" value={c.email || ""} onChange={(v) => update(i, { email: v })} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ThemeTab() {
  const s = useSite();
  const upd = (k: keyof typeof s.theme) => (v: string) => setState((p) => ({ ...p, theme: { ...p.theme, [k]: v } }));
  const swatches: Array<{ key: keyof typeof s.theme; label: string; hint: string }> = [
    { key: "background", label: "Background", hint: "Page background" },
    { key: "gold", label: "Gold (Primary Accent)", hint: "Headings, buttons, lines" },
    { key: "goldSoft", label: "Soft Gold", hint: "Subtle highlights" },
    { key: "ivory", label: "Ivory (Foreground)", hint: "Main text color" },
    { key: "marigold", label: "Marigold", hint: "Mehndi section accents" },
    { key: "barat", label: "Barat Red", hint: "Barat section accents" },
  ];
  return (
    <Section title="Theme & Colors">
      <p className="text-sm text-muted-foreground -mt-2">
        Use any CSS color (hex like <code className="text-gold">#d4af37</code>, or <code className="text-gold">oklch(0.82 0.13 85)</code>). Changes apply live.
      </p>
      <div className="grid sm:grid-cols-2 gap-5">
        {swatches.map((sw) => (
          <div key={sw.key} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg border border-border shrink-0" style={{ background: s.theme[sw.key] }} />
              <div className="flex-1">
                <Input label={sw.label} value={s.theme[sw.key]} onChange={upd(sw.key)} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground pl-13">{sw.hint}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function DataTab() {
  const exportData = () => {
    const blob = new Blob([localStorage.getItem("wedding-site-state-v1") || "{}"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "wedding-site-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const importData = (file: File | undefined) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(String(r.result));
        setState(() => parsed);
        alert("Imported.");
      } catch {
        alert("Invalid file.");
      }
    };
    r.readAsText(file);
  };
  const rsvps: any[] = JSON.parse(typeof window !== "undefined" ? localStorage.getItem("wedding-rsvps") || "[]" : "[]");
  const wishes: any[] = JSON.parse(typeof window !== "undefined" ? localStorage.getItem("wedding-wishes") || "[]" : "[]");
  const exportCSV = () => {
    const rows = [["Name", "Phone", "Attending", "Guests", "Event", "Note", "At"], ...rsvps.map((r) => [r.name, r.phone, r.attending, r.guests, r.event, r.note, r.at])];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "rsvps.csv"; a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <>
      <Section title="RSVPs & Wishes">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass rounded-xl p-5">
            <p className="text-xs uppercase tracking-widest text-gold">RSVPs</p>
            <p className="font-display text-4xl text-ivory mt-2">{rsvps.length}</p>
            <button onClick={exportCSV} className="mt-3 text-xs px-3 py-1.5 rounded-full glass hover:bg-gold/10">Export CSV</button>
          </div>
          <div className="glass rounded-xl p-5">
            <p className="text-xs uppercase tracking-widest text-gold">Wishes</p>
            <p className="font-display text-4xl text-ivory mt-2">{wishes.length}</p>
          </div>
        </div>
      </Section>
      <Section title="Backup & Reset">
        <div className="flex flex-wrap gap-3">
          <button onClick={exportData} className="px-5 py-2 rounded-full glass text-sm hover:bg-gold/10">Export site JSON</button>
          <label className="px-5 py-2 rounded-full glass text-sm hover:bg-gold/10 cursor-pointer">
            Import JSON
            <input type="file" accept="application/json" className="hidden" onChange={(e) => importData(e.target.files?.[0])} />
          </label>
          <button
            onClick={() => { if (confirm("Reset all site content to defaults?")) resetState(); }}
            className="px-5 py-2 rounded-full glass text-sm hover:bg-destructive/20"
          >
            Reset to defaults
          </button>
        </div>
      </Section>
    </>
  );
}
