import { useEffect, useRef } from "react";
import type { CursorEffect } from "@/lib/siteStore";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  hue?: number;
  rot?: number;
  vrot?: number;
}

export function CursorEffects({ effect, color = "rgba(255,210,120,0.9)", density = 3 }: { effect: CursorEffect; color?: string; density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (effect === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const parts: Particle[] = [];
    const mouse = { x: -100, y: -100, prev: { x: -100, y: -100 } };
    const onMove = (e: MouseEvent | TouchEvent) => {
      const p = "touches" in e ? e.touches[0] : (e as MouseEvent);
      if (!p) return;
      mouse.prev.x = mouse.x;
      mouse.prev.y = mouse.y;
      mouse.x = p.clientX * dpr;
      mouse.y = p.clientY * dpr;
      for (let i = 0; i < density; i++) spawn();
    };
    const spawn = () => {
      const base: Particle = {
        x: mouse.x + (Math.random() - 0.5) * 20 * dpr,
        y: mouse.y + (Math.random() - 0.5) * 20 * dpr,
        vx: (Math.random() - 0.5) * 2 * dpr,
        vy: (effect === "snow" ? Math.random() * 1.5 : -(Math.random() * 1.2 + 0.3)) * dpr,
        life: 0,
        max: 60 + Math.random() * 60,
        size: (effect === "petals" || effect === "hearts" || effect === "confetti" ? 8 : 3) + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.1,
        hue: 30 + Math.random() * 30,
      };
      parts.push(base);
      if (parts.length > 300) parts.splice(0, parts.length - 300);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });

    const drawPart = (p: Particle) => {
      const t = p.life / p.max;
      const alpha = 1 - t;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot ?? 0);
      ctx.shadowBlur = 12;
      ctx.shadowColor = color;
      ctx.fillStyle = color;
      const s = p.size * dpr;
      if (effect === "hearts") {
        ctx.beginPath();
        ctx.moveTo(0, s * 0.3);
        ctx.bezierCurveTo(s, -s * 0.5, s * 1.5, s * 0.5, 0, s * 1.4);
        ctx.bezierCurveTo(-s * 1.5, s * 0.5, -s, -s * 0.5, 0, s * 0.3);
        ctx.fill();
      } else if (effect === "petals") {
        ctx.beginPath();
        ctx.ellipse(0, 0, s, s * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (effect === "confetti") {
        ctx.fillStyle = `hsl(${p.hue},80%,60%)`;
        ctx.fillRect(-s / 2, -s / 4, s, s / 2);
      } else if (effect === "sparkles") {
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.2 * dpr;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += effect === "snow" || effect === "petals" || effect === "confetti" ? 0.02 * dpr : -0.01 * dpr;
        p.vx *= 0.99;
        p.rot = (p.rot ?? 0) + (p.vrot ?? 0);
        p.life++;
        if (p.life >= p.max) parts.splice(i, 1);
        else drawPart(p);
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
  }, [effect, color, density]);

  if (effect === "none") return null;
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[100]" />;
}
