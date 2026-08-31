import { useEffect, useState, type ReactNode } from "react";
import type { Incident } from "../data/incidents";
import { riskClass } from "../data/incidents";

export const TONE: Record<string, string> = {
  ok: "#3ddc97",
  ana: "#58a6ff",
  warn: "#f2cc60",
  risk: "#ff9040",
  crit: "#ff5c5c",
  ai: "#b18cff",
  sim: "#9aa7b8",
  dim: "#5c7091",
  ink: "#e6edf7",
};

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const fn = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return reduced;
}

const SCRAMBLE_CHARS = "ABCDEF0123456789#/<>×+=";

export function ScrambleText({ text, className, speed = 26 }: { text: string; className?: string; speed?: number }) {
  const reduced = usePrefersReducedMotion();
  const [out, setOut] = useState(text);
  useEffect(() => {
    if (reduced) { setOut(text); return; }
    let frame = 0;
    let raf = 0;
    let last = 0;
    const step = (ts: number) => {
      if (ts - last > speed) {
        last = ts;
        frame++;
        const resolved = Math.floor(frame / 2);
        if (resolved >= text.length) { setOut(text); return; }
        let s = "";
        for (let i = 0; i < text.length; i++) {
          s += i < resolved ? text[i] : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
        setOut(s);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text, reduced, speed]);
  return <span className={className}>{out}</span>;
}

export function SectionTitle({ children, tone = "ana" }: { children: ReactNode; tone?: string }) {
  return (
    <div className="sec-title">
      <span style={{ width: 7, height: 7, background: TONE[tone], display: "inline-block", clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />
      <span>{children}</span>
    </div>
  );
}

export function Bar({ value, color, h = 5 }: { value: number; color: string; h?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setW(value), 60);
    return () => window.clearTimeout(t);
  }, [value]);
  return (
    <div style={{ height: h, background: "rgba(34,48,74,0.7)", borderRadius: 1, overflow: "hidden" }}>
      <div className="bar-fill" style={{ width: `${Math.min(100, w)}%`, height: "100%", background: color, borderRadius: 1 }} />
    </div>
  );
}

export function Chip({ label, tone = "ana", solid = false }: { label: string; tone?: string; solid?: boolean }) {
  const c = TONE[tone] ?? TONE.ana;
  return (
    <span
      className="mono"
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.12em",
        padding: "2px 7px",
        border: `1px solid ${c}55`,
        color: solid ? "#0a0f1a" : c,
        background: solid ? c : `${c}14`,
        borderRadius: 2,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

export function Led({ tone = "ok", fast = false }: { tone?: string; fast?: boolean }) {
  return (
    <span
      className={fast ? "led-fast" : "led"}
      style={{
        width: 6, height: 6, borderRadius: "50%",
        background: TONE[tone], display: "inline-block",
        boxShadow: `0 0 8px ${TONE[tone]}`,
        flexShrink: 0,
      }}
    />
  );
}

/* ---------- computed incident helpers ---------- */

export const confidenceOf = (inc: Incident) =>
  inc.confidenceFactors.reduce((s, f) => s + f.weight * f.value, 0);

export const riskOf = (inc: Incident) => {
  const score = inc.risk.threat * inc.risk.assetCrit * inc.risk.exposure * confidenceOf(inc);
  return { score, cls: riskClass(score) };
};

export const fmtPct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)} %`;

/* ---------- custom inline SVG icons ---------- */

type IcProps = { size?: number; color?: string };
const base = (size: number, color: string) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none",
  stroke: color, strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
});

export const IcShield = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><path d="M12 2.5 20 6v6c0 5-3.4 8.6-8 9.9C7.4 20.6 4 17 4 12V6l8-3.5z" /><path d="m8.8 12 2.2 2.2 4.4-4.9" /></svg>
);
export const IcRadar = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><path d="M12 12 18.5 6" /><circle cx="14.8" cy="14.2" r="0.9" fill={color} stroke="none" /></svg>
);
export const IcBranch = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><circle cx="6" cy="5" r="2.2" /><circle cx="6" cy="19" r="2.2" /><circle cx="18" cy="12" r="2.2" /><path d="M6 7.2v9.6M8 6.2c5 1.5 7.8 3.4 7.9 5.8M8 17.8c5-1.5 7.8-3.4 7.9-5.8" /></svg>
);
export const IcScale = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><path d="M12 4v16M7 20h10" /><path d="M4 7h16" /><path d="m6.5 7-2.8 5.5a3 3 0 0 0 5.6 0L6.5 7zM17.5 7l-2.8 5.5a3 3 0 0 0 5.6 0L17.5 7z" /></svg>
);
export const IcBook = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17.5H7.5A2.5 2.5 0 0 0 5 22V4.5z" /><path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H19" /><path d="M10 7h5" /></svg>
);
export const IcFlask = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><path d="M10 2.5h4M11 2.5v6L5.5 18a2.4 2.4 0 0 0 2.1 3.5h8.8a2.4 2.4 0 0 0 2.1-3.5L13 8.5v-6" /><path d="M8 14.5h8" /></svg>
);
export const IcLock = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><rect x="5" y="10.5" width="14" height="10" rx="1.5" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15.5" r="1.6" /></svg>
);
export const IcFile = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><path d="M6 2.5h8L19 7.5v14H6v-19z" /><path d="M14 2.5v5h5" /><path d="M9 12h6M9 15.5h6" /></svg>
);
export const IcCheck = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><path d="m4.5 12.5 5 5 10-11" /></svg>
);
export const IcX = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><path d="m5.5 5.5 13 13M18.5 5.5l-13 13" /></svg>
);
export const IcQuestion = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><path d="M8.5 8.5a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.2-1.5 2.3" /><circle cx="12" cy="17.8" r="0.9" fill={color} stroke="none" /></svg>
);
export const IcPulse = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><path d="M2.5 12h4l2.5-6 4 12 2.5-6h6" /></svg>
);
export const IcTarget = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="1" fill={color} stroke="none" /><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" /></svg>
);
export const IcGavel = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><path d="m9 7 8 8M12.5 3.5 16 7l-5.5 5.5L7 9l5.5-5.5z" /><path d="m14.5 9.5 4-4M3 21h9M11.5 13.5 5 20" /></svg>
);
export const IcEye = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const IcArrow = ({ size = 16, color = "currentColor" }: IcProps) => (
  <svg {...base(size, color)}><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);
