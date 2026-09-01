import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Incident, Phase } from "../data/incidents";
import { NEUTRALIZATION, PHASES, PHASE_LABEL, SEVERITY_COLOR } from "../data/incidents";
import type { Runtime } from "../engine/useCIC";
import {
  Bar, Chip, confidenceOf, IcArrow, IcBranch, IcCheck, IcEye, IcGavel,
  IcPulse, IcQuestion, IcRadar, IcScale, ScrambleText, SectionTitle, TONE, riskOf,
} from "./ui";

const sevTone = (s: string) => (s === "CRITICAL" ? "crit" : s === "HIGH" ? "risk" : s === "MEDIUM" ? "warn" : "ana");

/* ---------------- header : fiche incident ---------------- */

function IncidentHeader({ inc, rt }: { inc: Incident; rt: Runtime }) {
  const { cls } = riskOf(inc);
  const conf = confidenceOf(inc);
  const meta: [string, ReactNode][] = [
    ["Type présumé", inc.type],
    ["Sous-type", inc.subtype],
    ["Actif concerné", inc.asset],
    ["Début", inc.start],
    ["Criticité", <Chip key="c" label={cls} tone={sevTone(cls)} />],
    ["Confiance", <span key="cf" className="mono text-ana font-semibold">{(conf * 100).toFixed(1)} %</span>],
    ["État", <Chip key="e" label={PHASE_LABEL[rt.phase]} tone="warn" />],
    ["Mode", <Chip key="m" label="PRODUCTION" tone="risk" />],
  ];
  return (
    <div className="panel panel-ticks p-4" style={{ ["--tick" as string]: SEVERITY_COLOR[cls] }}>
      <div className="flex items-start gap-3 flex-wrap">
        <Chip label={cls} tone={sevTone(cls)} solid />
        <div className="min-w-0">
          <ScrambleText text={inc.id} className="disp text-xl md:text-2xl font-bold tracking-[0.08em] text-ink" />
          <div className="text-[12.5px] text-dim mt-0.5">{inc.type} — <span className="text-ink">{inc.subtype}</span></div>
        </div>
        <div className="ml-auto text-right">
          <div className="mono text-[9px] tracking-[0.2em] text-faint">FICHE INCIDENT</div>
          <div className="mono text-[10px] text-dim mt-1">asset · <span className="text-ink">{inc.asset}</span></div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 mt-4 border-t border-line/60 pt-3">
        {meta.map(([k, v]) => (
          <div key={k}>
            <div className="mono text-[8.5px] tracking-[0.16em] text-faint uppercase">{k}</div>
            <div className="text-[12px] text-ink mt-0.5">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- évaluation cognitive ---------------- */

function ConfidenceDial({ value, tone }: { value: number; tone: string }) {
  const c = TONE[tone];
  const len = Math.PI * 44;
  const [off, setOff] = useState(len);
  useEffect(() => {
    const t = window.setTimeout(() => setOff(len * (1 - value / 100)), 120);
    return () => window.clearTimeout(t);
  }, [value, len]);
  return (
    <svg width="112" height="64" viewBox="0 0 112 64">
      <path d="M 12 58 A 44 44 0 0 1 100 58" fill="none" stroke="rgba(34,48,74,0.9)" strokeWidth="7" strokeLinecap="round" />
      <path
        d="M 12 58 A 44 44 0 0 1 100 58" fill="none" stroke={c} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={len} strokeDashoffset={off}
        style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.2,0.7,0.2,1)", filter: `drop-shadow(0 0 5px ${c}66)` }}
      />
    </svg>
  );
}

function Assessment({ inc, rt }: { inc: Incident; rt: Runtime }) {
  const conf = confidenceOf(inc);
  const confPct = conf * 100;
  const tone = confPct >= 90 ? "ok" : confPct >= 70 ? "ana" : confPct >= 40 ? "warn" : "crit";
  const h0 = inc.hypotheses[0];
  const hAlt = inc.hypotheses[inc.hypotheses.length - 1];
  const pb = inc.playbooks[rt.playbookIndex];
  const fields: { k: string; v: ReactNode }[] = [
    { k: "Primary hypothesis", v: <span className="text-ink font-semibold">{h0.name}</span> },
    { k: "Confidence", v: <span className="disp text-2xl font-bold tick-num" style={{ color: TONE[tone] }}>{confPct.toFixed(1)} %</span> },
    { k: "Counter hypothesis", v: <span className="text-warn">{hAlt.name} — {hAlt.score.toFixed(1)} %</span> },
    { k: "Recommended playbook", v: <span className="mono text-ai">{pb.id}</span> },
    { k: "Collateral risk", v: <Chip label={pb.sim.collateral} tone={pb.sim.collateral === "LOW" ? "ok" : pb.sim.collateral === "MEDIUM" ? "warn" : "crit"} /> },
  ];
  return (
    <div className="panel panel-ticks p-4 flex-1" style={{ ["--tick" as string]: TONE.ai }}>
      <SectionTitle tone="ai">Analyse cognitive</SectionTitle>
      <div className="flex gap-4 mt-3 items-center flex-wrap">
        <div className="relative shrink-0">
          <ConfidenceDial value={confPct} tone={tone} />
          <div className="absolute inset-x-0 bottom-0 text-center">
            <span className="mono text-[10px] font-semibold tick-num" style={{ color: TONE[tone] }}>{confPct.toFixed(1)}%</span>
          </div>
        </div>
        <div className="flex-1 min-w-[220px] grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
          {fields.map((f) => (
            <div key={f.k}>
              <div className="mono text-[8.5px] tracking-[0.16em] text-faint uppercase">{f.k}</div>
              <div className="text-[13px] mt-0.5">{f.v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 border-t border-line/60 pt-2.5 flex items-start gap-2">
        <IcBranch size={13} color={TONE.ai} />
        <p className="text-[10.5px] text-faint leading-relaxed">
          La première hypothèse n'est jamais une vérité : éléments contradictoires, hypothèses alternatives et risque
          d'erreur sont systématiquement confrontés avant toute recommandation.
        </p>
      </div>
    </div>
  );
}

/* ---------------- trafic live ---------------- */

function TrafficPanel({ inc, rt }: { inc: Incident; rt: Runtime }) {
  const data = rt.traffic;
  const maxV = inc.metric.attack[1] * 1.08;
  const W = 600, H = 130;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - Math.min(1, v / maxV) * (H - 8) - 2}`).join(" ");
  const last = data[data.length - 1];
  const normalMax = inc.metric.normal[1];
  const mitigated = ["MONITORING", "RECOVERED", "CLOSED"].includes(rt.phase);
  const attacking = ["DETECTED", "ANALYZING", "CONFIRMED", "PLAYBOOK_SELECTED", "WAITING_APPROVAL"].includes(rt.phase);
  const lineColor = mitigated ? TONE.ok : rt.phase === "MITIGATING" ? TONE.warn : TONE.crit;
  const fmtVal = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${Math.round(v)}`);
  return (
    <div className="panel p-4 w-[300px] shrink-0">
      <div className="flex items-center justify-between">
        <SectionTitle tone={mitigated ? "ok" : attacking ? "crit" : "warn"}>Télémétrie</SectionTitle>
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="disp text-xl font-bold tick-num" style={{ color: lineColor }}>{fmtVal(last)}</span>
        <span className="mono text-[9px] text-faint">{inc.metric.label}</span>
        {mitigated && <Chip label="▼ > 90 %" tone="ok" />}
        {rt.phase === "MITIGATING" && <Chip label="MITIGATION" tone="warn" />}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-1" style={{ height: 108 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`tg-${inc.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.28" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <line
          x1="0" x2={W} y1={H - (normalMax / maxV) * (H - 8) - 2} y2={H - (normalMax / maxV) * (H - 8) - 2}
          stroke={TONE.ok} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="4 5"
        />
        <polygon points={`0,${H} ${pts} ${W},${H}`} fill={`url(#tg-${inc.id})`} />
        <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="1.8" style={{ filter: `drop-shadow(0 0 4px ${lineColor}55)` }} />
        <circle cx={W} cy={H - Math.min(1, last / maxV) * (H - 8) - 2} r="3.2" fill={lineColor} className="led-fast" />
      </svg>
      <div className="mono text-[8.5px] text-faint flex justify-between mt-1">
        <span>fenêtre 64 s</span>
        <span>seuil nominal — —</span>
      </div>
    </div>
  );
}

/* ---------------- éléments concordants / contradictoires ---------------- */

function EvidenceBlock({ inc }: { inc: Incident }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="panel p-3.5">
        <SectionTitle tone="ok">Éléments concordants</SectionTitle>
        <ul className="mt-2.5 space-y-1.5">
          {inc.evidenceFor.map((e) => (
            <li key={e} className="flex gap-2 text-[12px] text-dim leading-snug">
              <span className="mono text-ok font-bold shrink-0">+</span>{e}
            </li>
          ))}
        </ul>
      </div>
      <div className="panel p-3.5">
        <SectionTitle tone="warn">Éléments contradictoires</SectionTitle>
        <ul className="mt-2.5 space-y-1.5">
          {inc.evidenceAgainst.map((e) => (
            <li key={e} className="flex gap-2 text-[12px] text-dim leading-snug">
              <span className="mono text-warn font-bold shrink-0">−</span>{e}
            </li>
          ))}
        </ul>
        <p className="mt-2.5 text-[10px] text-faint border-t border-line/60 pt-2">
          Chaque élément contradictoire est transmis au Counter Analyst avant recommandation.
        </p>
      </div>
    </div>
  );
}

/* ---------------- hypothèses concurrentes ---------------- */

function HypothesesPanel({ inc }: { inc: Incident }) {
  return (
    <div className="panel p-3.5">
      <div className="flex items-center justify-between gap-2">
        <SectionTitle tone="ana">Hypothèses concurrentes</SectionTitle>
      </div>
      <div className="mt-3 space-y-2.5">
        {inc.hypotheses.map((h, i) => {
          const c = i === 0 ? TONE.ana : i === 1 ? TONE.ai : TONE.sim;
          return (
            <div key={h.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] text-dim">{h.name}</span>
                <span className="mono text-[11px] tick-num font-semibold" style={{ color: c }}>{h.score.toFixed(1)} %</span>
              </div>
              <Bar value={h.score} color={c} h={4} />
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] text-faint">Les probabilités ne sont pas nécessairement exclusives — plusieurs scénarios peuvent coexister.</p>
    </div>
  );
}

/* ---------------- contre-analyse ---------------- */

function CounterAnalyst({ inc }: { inc: Incident }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="panel panel-ticks p-3.5" style={{ ["--tick" as string]: TONE.ai }}>
      <div className="flex items-center justify-between">
        <SectionTitle tone="ai">Counter Analyst</SectionTitle>
        <Chip label="READ ONLY" tone="ai" />
      </div>
      <p className="text-[10.5px] text-faint mt-2 mb-2.5">
        Agent indépendant — mission : chercher pourquoi l'analyse principale pourrait être fausse.
      </p>
      <div className="space-y-1.5">
        {inc.counter.map((c, i) => (
          <div key={c.q} className="border border-line/50" style={{ borderRadius: 2, background: open === i ? "rgba(177,140,255,0.05)" : "transparent" }}>
            <button
              onClick={() => setOpen(open === i ? -1 : i)}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-left cursor-pointer group"
            >
              <IcQuestion size={13} color={open === i ? TONE.ai : TONE.faint} />
              <span className={`text-[12px] flex-1 ${open === i ? "text-ink" : "text-dim"} group-hover:text-ink transition-colors`}>{c.q}</span>
              <span className={`transition-transform duration-200 ${open === i ? "rotate-90" : ""}`} style={{ display: "inline-flex" }}>
                <IcArrow size={11} color={TONE.faint} />
              </span>
            </button>
            {open === i && (
              <div className="px-2.5 pb-2.5 pl-8 slide-in">
                <p className="text-[11.5px] text-dim leading-relaxed border-l-2 pl-2.5" style={{ borderColor: `${TONE.ai}55` }}>{c.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- score de confiance ---------------- */

function ConfidencePanel({ inc }: { inc: Incident }) {
  const total = confidenceOf(inc) * 100;
  return (
    <div className="panel p-3.5">
      <SectionTitle tone="ana">Score de confiance — pondération</SectionTitle>
      <div className="mono text-[9.5px] text-faint mt-2.5 leading-relaxed">
        CONFIDENCE = 0.25·capteurs + 0.20·cohérence + 0.20·comportement<br />
        + 0.15·historique + 0.10·cross-source + 0.10·consensus IA
      </div>
      <div className="mt-3 space-y-2">
        {inc.confidenceFactors.map((f) => {
          const contrib = f.weight * f.value * 100;
          return (
            <div key={f.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-dim">{f.label}</span>
                <span className="mono text-[9.5px] text-faint tick-num">
                  ×{f.weight.toFixed(2)} · {(f.value * 100).toFixed(0)} % → <span className="text-ana font-semibold">+{contrib.toFixed(1)}</span>
                </span>
              </div>
              <Bar value={f.value * 100} color={TONE.ana} h={3} />
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-3 border-t border-line/60 pt-2.5">
        <span className="mono text-[10px] tracking-[0.14em] text-faint">SCORE GLOBAL</span>
        <span className="disp text-lg font-bold text-ana tick-num">{total.toFixed(1)} %</span>
      </div>
      <p className="mt-2 text-[10px] text-faint">Le score est calculé de façon déterministe — jamais issu directement d'un LLM.</p>
    </div>
  );
}

/* ---------------- machine à états + timeline ---------------- */

const phasePos = (p: Phase) => (p === "FALSE_POSITIVE" ? -1 : PHASES.indexOf(p));

function StateMachine({ phase }: { phase: Phase }) {
  const pos = phasePos(phase);
  return (
    <div className="panel p-3.5">
      <SectionTitle tone="warn">Machine à états</SectionTitle>
      <div className="mt-3 flex flex-wrap gap-1">
        {PHASES.map((p, i) => {
          const state = i < pos ? "done" : i === pos ? "now" : "todo";
          const c = state === "done" ? TONE.ok : state === "now" ? TONE.warn : "#3a4c6b";
          return (
            <span key={p} className="flex items-center">
              {i > 0 && <span className="w-2 h-px" style={{ background: i <= pos ? `${TONE.ok}55` : "rgba(90,115,160,0.2)" }} />}
              <span
                className={`mono px-1.5 py-[3px] border ${i === pos ? "node-active" : ""}`}
                style={{
                  fontSize: 8.5, letterSpacing: "0.06em", borderRadius: 2,
                  color: state === "todo" ? "#4a5d7d" : c,
                  borderColor: state === "todo" ? "rgba(90,115,160,0.18)" : `${c}66`,
                  background: state === "now" ? `${c}14` : "transparent",
                }}
              >
                {p}
              </span>
            </span>
          );
        })}
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <Chip label="FALSE_POSITIVE" tone="sim" />
        <span className="text-[10px] text-faint">état spécial — sortie possible depuis ANALYZING ou MONITORING</span>
      </div>
    </div>
  );
}

function Neutralization({ rt }: { rt: Runtime }) {
  const done = rt.neutralization.filter(Boolean).length;
  const active = ["MITIGATING", "MONITORING", "RECOVERED", "CLOSED"].includes(rt.phase);
  if (!active) return null;
  const status = rt.phase === "MITIGATING"
    ? { label: "MITIGATION IN PROGRESS", tone: "warn" }
    : done >= 5
      ? { label: "THREAT NEUTRALIZED", tone: "ok" }
      : { label: "THREAT CONTAINED", tone: "ana" };
  return (
    <div className="panel p-3.5" style={{ borderColor: `${TONE[status.tone]}44` }}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <SectionTitle tone={status.tone}>Validation de neutralisation</SectionTitle>
        <span className="disp text-[13px] font-bold tracking-[0.1em]" style={{ color: TONE[status.tone] }}>{status.label}</span>
      </div>
      <div className="mt-2.5 space-y-1.5">
        {NEUTRALIZATION.map((n, i) => (
          <div key={n} className="flex items-center gap-2">
            <span
              className="flex items-center justify-center shrink-0"
              style={{ width: 15, height: 15, border: `1px solid ${rt.neutralization[i] ? TONE.ok : "rgba(90,115,160,0.35)"}`, borderRadius: 2, background: rt.neutralization[i] ? `${TONE.ok}18` : "transparent" }}
            >
              {rt.neutralization[i] && <IcCheck size={9} color={TONE.ok} />}
            </span>
            <span className={`text-[11.5px] ${rt.neutralization[i] ? "text-dim" : "text-faint"}`}>{n}</span>
          </div>
        ))}
      </div>
      <p className="mt-2.5 text-[10px] text-faint">
        « THREAT NEUTRALIZED » exige 5/5 conditions — sinon « MITIGATION IN PROGRESS » ou « THREAT CONTAINED ».
        Jamais de passage direct MITIGATING → CLOSED.
      </p>
    </div>
  );
}

function Timeline({ rt }: { rt: Runtime }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [rt.timeline.length]);
  const toneColor: Record<string, string> = { sys: TONE.sim, ai: TONE.ai, good: TONE.ok, warn: TONE.warn, sim: TONE.ana };
  return (
    <div className="panel p-3.5">
      <SectionTitle tone="sim">Journal de l'incident</SectionTitle>
      <div ref={ref} className="mt-2.5 h-[218px] overflow-y-auto scroll-thin pr-1 space-y-[7px]">
        {rt.timeline.map((e, i) => (
          <div key={i} className="flex gap-2.5 items-start slide-in">
            <span className="mono text-[9.5px] text-faint tick-num shrink-0 mt-[1px]">{e.time}</span>
            <span className="w-[5px] h-[5px] mt-[5px] shrink-0" style={{ background: toneColor[e.tone], borderRadius: 1 }} />
            <span className="text-[11.5px] text-dim leading-snug">{e.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- stage central ---------------- */

export function CenterStage({
  inc, rt, onStart, onClose,
}: {
  inc: Incident;
  rt: Runtime;
  onStart: () => void;
  onClose: () => void;
}) {
  const canStart = ["DETECTED", "ANALYZING"].includes(rt.phase) && !rt.running;
  const startLabel = rt.phase === "DETECTED" ? "Initier l'analyse cognitive" : "Reprendre le pipeline cognitif";
  return (
    <div className="space-y-3 min-w-0">
      <IncidentHeader inc={inc} rt={rt} />

      <div className="flex gap-3 flex-wrap">
        <Assessment inc={inc} rt={rt} />
        <TrafficPanel inc={inc} rt={rt} />
      </div>

      <EvidenceBlock inc={inc} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <HypothesesPanel inc={inc} />
        <ConfidencePanel inc={inc} />
      </div>

      <CounterAnalyst inc={inc} />

      <StateMachine phase={rt.phase} />
      <Neutralization rt={rt} />

      <div className="flex items-center gap-2 flex-wrap">
        {canStart && (
          <button className="btn btn-ai flex items-center gap-2" onClick={onStart}>
            <IcRadar size={13} /> {startLabel}
          </button>
        )}
        {rt.running && (
          <button className="btn flex items-center gap-2" disabled>
            <IcRadar size={13} /> Pipeline en cours… ({Math.max(0, rt.pipelineIndex) + 1}/20)
          </button>
        )}
        {rt.phase === "WAITING_APPROVAL" && (
          <span className="btn flex items-center gap-2" style={{ cursor: "default", opacity: 0.7 }}>
            <IcGavel size={13} /> Décision requise → Human Approval Gate
          </span>
        )}
        {rt.phase === "RECOVERED" && (
          <button className="btn btn-ok flex items-center gap-2" onClick={onClose}><IcCheck size={13} /> Clore l'incident</button>
        )}
        {rt.phase === "CLOSED" && (
          <span className="mono text-[9.5px] tracking-[0.18em] text-faint">INCIDENT CLOS — SURVEILLANCE RENFORCÉE MAINTENUE 24 H</span>
        )}
        {rt.phase === "MITIGATING" && (
          <span className="btn flex items-center gap-2" style={{ cursor: "default", opacity: 0.7 }}>
            <IcPulse size={13} /> Exécution du playbook en cours…
          </span>
        )}
        {rt.phase === "MONITORING" && (
          <span className="btn flex items-center gap-2" style={{ cursor: "default", opacity: 0.7 }}>
            <IcEye size={13} /> Post-mitigation watch — vérification des conditions…
          </span>
        )}
        <span className="ml-auto flex items-center gap-2">
          <IcScale size={13} color={TONE.faint} />
          <span className="mono text-[9px] tracking-[0.16em] text-faint">DETECT → CHALLENGE → SIMULATE → AUTHORIZE → VERIFY</span>
        </span>
      </div>

      <Timeline rt={rt} />
    </div>
  );
}
