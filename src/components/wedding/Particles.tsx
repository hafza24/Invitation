import { useMemo } from "react";

export function Particles({ count = 30, color = "var(--gold)" }: { count?: number; color?: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 4,
        duration: 10 + Math.random() * 20,
        delay: Math.random() * 20,
        opacity: 0.3 + Math.random() * 0.5,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full animate-float-up"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: color,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
          }}
        />
      ))}
    </div>
  );
}
