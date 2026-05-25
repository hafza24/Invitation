import { motion, type Variants } from "framer-motion";
import { useMemo } from "react";
import type { RevealAnim } from "@/lib/siteStore";

const easeOut = [0.16, 1, 0.3, 1] as const;

const VARIANTS: Record<RevealAnim, Variants> = {
  "fade-up": { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } },
  "fade-in": { hidden: { opacity: 0 }, show: { opacity: 1 } },
  "fade-down": { hidden: { opacity: 0, y: -40 }, show: { opacity: 1, y: 0 } },
  "fade-left": { hidden: { opacity: 0, x: -60 }, show: { opacity: 1, x: 0 } },
  "fade-right": { hidden: { opacity: 0, x: 60 }, show: { opacity: 1, x: 0 } },
  "zoom-in": { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } },
  "zoom-out": { hidden: { opacity: 0, scale: 1.1 }, show: { opacity: 1, scale: 1 } },
  blur: { hidden: { opacity: 0, filter: "blur(20px)" }, show: { opacity: 1, filter: "blur(0px)" } },
  mask: { hidden: { opacity: 0, clipPath: "inset(0 100% 0 0)" }, show: { opacity: 1, clipPath: "inset(0 0 0 0)" } },
  cinematic: { hidden: { opacity: 0, y: 60, filter: "blur(12px)", scale: 0.98 }, show: { opacity: 1, y: 0, filter: "blur(0px)", scale: 1 } },
  letter: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  word: { hidden: { opacity: 0 }, show: { opacity: 1 } },
};

export function Reveal({
  children,
  anim = "fade-up",
  delay = 0,
  duration = 0.9,
  className,
  once = true,
  amount = 0.3,
}: {
  children: React.ReactNode;
  anim?: RevealAnim;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}) {
  const v = VARIANTS[anim];
  return (
    <motion.div
      className={className}
      variants={v}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

export function RevealText({
  text,
  mode = "letter",
  className,
  delay = 0,
  stagger = 0.04,
  duration = 0.8,
}: {
  text: string;
  mode?: "letter" | "word";
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
}) {
  const items = useMemo(() => (mode === "word" ? text.split(/(\s+)/) : Array.from(text)), [text, mode]);
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {items.map((c, i) => (
        <motion.span
          key={i}
          aria-hidden
          style={{ display: "inline-block", whiteSpace: "pre" }}
          variants={{
            hidden: { opacity: 0, y: "0.6em", filter: "blur(8px)" },
            show: { opacity: 1, y: 0, filter: "blur(0px)" },
          }}
          transition={{ duration, ease: easeOut }}
        >
          {c === " " ? "\u00A0" : c}
        </motion.span>
      ))}
    </motion.span>
  );
}
