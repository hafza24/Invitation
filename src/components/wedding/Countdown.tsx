import { useEffect, useState } from "react";

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export function Countdown({ date }: { date: string }) {
  const target = new Date(date);
  const [t, setT] = useState(() => diff(target));
  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [date]);
  const units = [
    { v: t.days, l: "Days" },
    { v: t.hours, l: "Hours" },
    { v: t.minutes, l: "Minutes" },
    { v: t.seconds, l: "Seconds" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
      {units.map((u) => (
        <div key={u.l} className="glass-gold rounded-xl p-6 sm:p-8 text-center shadow-gold">
          <div className="font-display text-5xl sm:text-6xl text-gradient-gold tabular-nums">
            {String(u.v).padStart(2, "0")}
          </div>
          <div className="mt-2 text-xs sm:text-sm uppercase tracking-[0.3em] text-muted-foreground">
            {u.l}
          </div>
        </div>
      ))}
    </div>
  );
}
