import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Wraps a section to make it a full-screen "scene" that:
 *  - Enters: fades + un-blurs + scales from 1.04 → 1
 *  - Holds the viewport while you read
 *  - Exits: fades + blurs + scales to 0.96 as the next scene rises behind it
 *
 * Adjacent scenes overlap during the exit window for a clean dissolve.
 */
export function CinematicScene({
  children,
  length = 1.6,
  first = false,
  last = false,
}: {
  children: React.ReactNode;
  /** Total scroll length in viewport heights. Higher = slower scene. */
  length?: number;
  first?: boolean;
  last?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    gsap.set(inner, {
      opacity: first ? 1 : 0,
      filter: first ? "blur(0px)" : "blur(18px)",
      scale: first ? 1 : 1.04,
      transformOrigin: "50% 50%",
      willChange: "opacity, filter, transform",
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
      },
    });

    // Enter (0 → 22% of scene scroll)
    if (!first) {
      tl.fromTo(
        inner,
        { opacity: 0, filter: "blur(18px)", scale: 1.04, y: 30 },
        { opacity: 1, filter: "blur(0px)", scale: 1, y: 0, ease: "power2.out", duration: 0.22 },
        0,
      );
    } else {
      tl.to(inner, { opacity: 1, duration: 0.001 }, 0);
    }

    // Hold (22% → 70%)
    tl.to(inner, { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.48 }, 0.22);

    // Exit (70% → 100%)
    if (!last) {
      tl.to(
        inner,
        { opacity: 0, filter: "blur(16px)", scale: 0.96, y: -30, ease: "power2.in", duration: 0.3 },
        0.7,
      );
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = setTimeout(refresh, 250);

    return () => {
      window.removeEventListener("load", refresh);
      clearTimeout(t);
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [first, last]);

  return (
    <div
      ref={wrapRef}
      className="relative w-full"
      style={{ height: `${Math.max(1.1, length) * 100}vh` }}
    >
      <div
        ref={innerRef}
        className="sticky top-0 h-screen w-full flex items-stretch justify-stretch overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
}
