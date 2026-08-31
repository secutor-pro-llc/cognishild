import { useEffect, useState } from "react";
import type { Mode, Phase } from "../data/incidents";
import { PIPELINE_STAGES } from "../data/incidents";
import { Chip, Led, ScrambleText, TONE } from "./ui";

function useClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const fmt = () => setT(new Date().toLocaleTimeString("en-GB", { timeZone: "UTC", hour12: false }));
    fmt();
    const iv = window.setInterval(fmt, 1000);
    return () => window.clearInterval(iv);
  }, []);
  return t;
}

const STAGE_TONE = (i: number) =>
  i <= 4 ? TONE.ana : i <= 8 ? TONE.ai : i <= 13 ? TONE.sim : i === 14 ? TONE.ana : i === 15 ? TONE.warn : i === 16 ? TONE.risk : TONE.ok;

export function PipelineStrip({ index, phase }: { index: number; phase: Phase }) {
  const done = phase === "RECOVERED" || phase === "CLOSED" || phase === "MONITORING" || phase === "MITIGATING";
  return (
    <div className="border-y border-line/60 bg-bg1/70 backdrop-blur-sm overflow-x-auto scroll-thin">
      <div className="flex items-center gap-0 px-4 py-2 min-w-max">
        <span className="mono text-[9px] tracking-[0.2em] text-faint mr-3 shrink-0">PIPELINE COGNITIF</span>
        {PIPELINE_STAGES.map((s, i) => {
          const state = done || i < index ? "done" : i === index ? "active" : "todo";
          const c = STAGE_TONE(i);
          return (
            <div key={s} className="flex items-center shrink-0">
              {i > 0 && <span className="h-px w-3" style={{ background: state !== "todo" ? `${c}66` : "rgba(90,115,160,0.2)" }} />}
              <div
                className={`flex items-center gap-1.5 px-2 py-[3px] border ${i === index && !done ? "node-active" : ""}`}
                style={{
                  borderColor: state === "todo" ? "rgba(90,115,160,0.18)" : `${c}55`,
                  background: state === "active" ? `${c}16` : "transparent",
                  borderRadius: 2,
                }}
              >
                <span
                  className="mono"
                  style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: state === "done" ? c : state === "active" ? c : "rgba(90,115,160,0.35)",
                    boxShadow: state === "active" ? `0 0 7px ${c}` : "none",
                  }}
                />
                <span
                  className="mono"
                  style={{
                    fontSize: 9, letterSpacing: "0.08em",
                    color: state === "todo" ? "#4a5d7d" : state === "active" ? c : "#7488a8",
                  }}
                >
                  {s}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TopBar({ mode, onMode }: { mode: Mode; onMode: (m: Mode) => void }) {
  const clock = useClock();
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg0/85 backdrop-blur-md">
      <div className="max-w-[1760px] mx-auto px-4 py-2.5 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <svg width="34" height="34" viewBox="0 0 32 32" fill="none" aria-hidden>
            <path d="M16 2 28 7v9c0 7.5-5.2 12.6-12 14C9.2 28.6 4 23.5 4 16V7l12-5z" fill="#0C1220" stroke="#B18CFF" strokeWidth="1.6" />
            <path d="M16 2 28 7v9c0 7.5-5.2 12.6-12 14" stroke="#58A6FF" strokeWidth="1.6" opacity="0.6" />
            <path d="m10 16 4 4 8-9" stroke="#3DDC97" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <ScrambleText text="COGNISHIELD" className="disp text-lg font-bold tracking-[0.24em] leading-none text-ink" />
            <div className="mono text-[9px] tracking-[0.34em] text-faint mt-1">COGNITIVE INCIDENT COMMANDER</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 ml-4">
          {[["SIEM", "ok"], ["EDR", "ok"], ["WAF", "warn"], ["CTI", "ok"]].map(([n, t]) => (
            <span key={n} className="flex items-center gap-1.5">
              <Led tone={t} />
              <span className="mono text-[9px] tracking-[0.18em] text-dim">{n}</span>
            </span>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3 flex-wrap">
          <div className="text-right">
            <div className="mono text-sm font-semibold text-ink tick-num leading-none">{clock}<span className="text-faint text-[9px] ml-1">UTC</span></div>
            <div className="mono text-[9px] text-faint tracking-[0.2em] mt-0.5">CIC v1.0 · FAIL CLOSED</div>
          </div>
          <div className="flex border border-line rounded-[2px] overflow-hidden">
            {(["TRAINING", "PRODUCTION"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => onMode(m)}
                className="mono text-[10px] font-semibold tracking-[0.16em] px-3 py-2 transition-colors cursor-pointer"
                style={{
                  background: mode === m ? (m === "TRAINING" ? "rgba(177,140,255,0.16)" : "rgba(255,144,64,0.16)") : "transparent",
                  color: mode === m ? (m === "TRAINING" ? TONE.ai : TONE.risk) : "#5c7091",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mode === "TRAINING" ? (
        <div className="border-t border-ai/25 bg-ai/8">
          <div className="max-w-[1760px] mx-auto px-4 py-1.5 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-2">
              <Led tone="ai" fast />
              <span className="disp text-[10px] font-semibold tracking-[0.24em] text-ai">CYBER RANGE — TRAINING MODE</span>
            </span>
            <span className="mono text-[9px] tracking-[0.18em] text-dim">
              SIMULATED TARGET · SIMULATED TRAFFIC · SIMULATED MITIGATION
            </span>
            <Chip label="SIMULATION — NO EXTERNAL ACTION" tone="sim" />
          </div>
        </div>
      ) : (
        <div className="border-t border-risk/30 bg-risk/8">
          <div className="max-w-[1760px] mx-auto px-4 py-1.5 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-2">
              <Led tone="risk" fast />
              <span className="disp text-[10px] font-semibold tracking-[0.24em] text-risk">PRODUCTION MODE</span>
            </span>
            <span className="mono text-[9px] tracking-[0.18em] text-dim">
              OBSERVE · ANALYZE · RECOMMEND · WAIT FOR AUTHORIZATION — toute action réelle exige une autorisation conforme
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
