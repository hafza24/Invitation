import { useEffect, useRef } from "react";
import type { BackgroundConfig } from "@/lib/siteStore";

export function BackgroundLayer({ bg, fallback }: { bg?: BackgroundConfig; fallback?: BackgroundConfig }) {
  const config = bg ?? fallback;
  if (!config) return null;

  if (config.type === "color") {
    return <div className="absolute inset-0 -z-10" style={{ background: config.color }} />;
  }
  if (config.type === "gradient") {
    const angle = config.angle ?? 135;
    return (
      <div
        className={`absolute inset-0 -z-10 ${config.animated ? "animate-gradient-shift bg-[length:300%_300%]" : ""}`}
        style={{ background: `linear-gradient(${angle}deg, ${config.from}, ${config.to})` }}
      />
    );
  }
  if (config.type === "image") {
    return (
      <>
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.url})` }}
        />
        <div className="absolute inset-0 -z-10 bg-black" style={{ opacity: config.overlay ?? 0.45 }} />
      </>
    );
  }
  if (config.type === "video") {
    return (
      <>
        <video
          className="absolute inset-0 -z-10 w-full h-full object-cover"
          src={config.url}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 -z-10 bg-black" style={{ opacity: config.overlay ?? 0.5 }} />
      </>
    );
  }
  if (config.type === "animated") {
    return <AnimatedBackground variant={config.variant} color={config.color} />;
  }
  return null;
}

function AnimatedBackground({ variant, color = "rgba(255,210,120,0.6)" }: { variant: string; color?: string }) {
  if (variant === "aurora") {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -inset-1/4 opacity-60 blur-3xl animate-aurora"
          style={{ background: `conic-gradient(from 0deg at 50% 50%, ${color}, transparent 30%, ${color} 60%, transparent 90%)` }} />
      </div>
    );
  }
  if (variant === "rays") {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-30 animate-spin-slow"
          style={{ background: `repeating-conic-gradient(${color} 0deg 6deg, transparent 6deg 24deg)` }} />
      </div>
    );
  }
  return <ParticleField variant={variant as "particles" | "stars" | "fireflies" | "petals"} color={color} />;
}

function ParticleField({ variant, color }: { variant: "particles" | "stars" | "fireflies" | "petals"; color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    const count = variant === "stars" ? 120 : 50;
    const parts = Array.from({ length: count }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 1 + Math.random() * (variant === "petals" ? 6 : 3),
      vx: (Math.random() - 0.5) * 0.3 * dpr,
      vy: -(0.2 + Math.random() * 0.6) * dpr,
      a: 0.2 + Math.random() * 0.8,
      twinkle: Math.random() * Math.PI * 2,
    }));
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        p.twinkle += 0.02;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width;
        if (p.x > canvas.width + 10) p.x = 0;
        const alpha = variant === "stars" ? p.a * (0.6 + 0.4 * Math.sin(p.twinkle)) : variant === "fireflies" ? p.a * (0.4 + 0.6 * Math.abs(Math.sin(p.twinkle))) : p.a;
        ctx.beginPath();
        ctx.fillStyle = color.replace(/[\d.]+\)$/, `${alpha})`);
        ctx.shadowBlur = variant === "fireflies" ? 18 : variant === "stars" ? 4 : 10;
        ctx.shadowColor = color;
        ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [variant, color]);
  return <canvas ref={canvasRef} className="absolute inset-0 -z-10 w-full h-full" />;
}
