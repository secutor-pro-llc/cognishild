import type { ReactNode } from "react";
import type { Incident, Phase } from "../data/incidents";
import { AGENTS, PHASE_LABEL, SEVERITY_COLOR } from "../data/incidents";
import type { Runtime } from "../engine/useCIC";
import { Bar, Chip, confidenceOf, IcBranch, IcPulse, IcRadar, IcShield, SectionTitle, TONE, riskOf } from "./ui";

export function Kpis({ incidents, runtimes }: { incidents: Incident[]; runtimes: Record<string, Runtime> }) {
  const active = incidents.filter((i) => !["CLOSED"].includes(runtimes[i.id].phase)).length;
  const critical = incidents.filter((i) => riskOf(i).cls === "CRITICAL" && !["RECOVERED", "CLOSED"].includes(runtimes[i.id].phase)).length;
  const analyzing = incidents.filter((i) => ["ANALYZING", "CONFIRMED", "PLAYBOOK_SELECTED"].includes(runtimes[i.id].phase)).length;
  const waiting = incidents.filter((i) => runtimes[i.id].phase === "WAITING_APPROVAL").length;

  const items: { label: string; value: number; color: string; icon: ReactNode; pad: boolean }[] = [
    { label: "ACTIVE INCIDENTS", value: active, color: TONE.ana, icon: <IcPulse size={15} color={TONE.ana} />, pad: false },
    { label: "CRITICAL", value: critical, color: TONE.crit, icon: <IcShield size={15} color={TONE.crit} />, pad: true },
    { label: "UNDER ANALYSIS", value: analyzing, color: TONE.ai, icon: <IcRadar size={15} color={TONE.ai} />, pad: true },
    { label: "WAITING APPROVAL", value: waiting, color: TONE.warn, icon: <IcBranch size={15} color={TONE.warn} />, pad: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it) => (
        <div key={it.label} className="panel p-3 flex flex-col gap-1.5" style={{ ["--tick" as string]: it.color }}>
          <div className="flex items-center justify-between">
            <span className="mono text-[8.5px] tracking-[0.16em] text-faint">{it.label}</span>
            {it.icon}
          </div>
          <div className="disp text-3xl font-bold tick-num leading-none" style={{ color: it.color }}>
            {String(it.value).padStart(2, "0")}
          </div>
          <div className="h-[2px] w-8" style={{ background: `${it.color}55` }} />
        </div>
      ))}
    </div>
  );
}

const phaseTone = (p: Phase): string => {
  switch (p) {
    case "WAITING_APPROVAL": return "warn";
    case "MITIGATING": return "risk";
    case "MONITORING": return "ai";
    case "RECOVERED": return "ok";
    case "CLOSED": return "ok";
    case "ANALYZING": case "CONFIRMED": case "PLAYBOOK_SELECTED": return "ana";
    default: return "sim";
  }
};

export function IncidentQueue({
  incidents, runtimes, selected, onSelect,
}: {
  incidents: Incident[];
  runtimes: Record<string, Runtime>;
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="panel panel-ticks p-3" style={{ ["--tick" as string]: TONE.crit }}>
      <SectionTitle tone="crit">File d'incidents</SectionTitle>
      <div className="mt-3 space-y-2">
        {incidents.map((inc, idx) => {
          const rt = runtimes[inc.id];
          const sev = riskOf(inc).cls;
          const conf = confidenceOf(inc);
          const sel = selected === inc.id;
          return (
            <button
              key={inc.id}
              onClick={() => onSelect(inc.id)}
              className="row-hover w-full text-left border p-2.5 flex gap-2.5 cursor-pointer"
              style={{
                borderColor: sel ? `${SEVERITY_COLOR[sev]}66` : "rgba(90,115,160,0.16)",
                background: sel ? "rgba(88,166,255,0.06)" : "rgba(12,18,32,0.5)",
                borderRadius: 2,
              }}
            >
              <span className="w-[3px] shrink-0 self-stretch" style={{ background: SEVERITY_COLOR[sev] }} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="mono text-[10px] text-dim tick-num">#{String(idx + 1).padStart(2, "0")}</span>
                  <span className="mono text-[11px] font-semibold text-ink truncate">{inc.id}</span>
                </span>
                <span className="block text-[12px] text-dim mt-0.5 truncate">{inc.type}</span>
                <span className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Chip label={sev} tone={sev === "CRITICAL" ? "crit" : sev === "HIGH" ? "risk" : sev === "MEDIUM" ? "warn" : "ana"} />
                  <Chip label={PHASE_LABEL[rt.phase]} tone={phaseTone(rt.phase)} />
                </span>
                <span className="flex items-center gap-2 mt-2">
                  <span className="mono text-[9px] text-faint w-14 shrink-0">CONF {(conf * 100).toFixed(1)}%</span>
                  <span className="flex-1"><Bar value={conf * 100} color={SEVERITY_COLOR[sev]} h={3} /></span>
                </span>
                <span className="flex items-center justify-between mt-1.5">
                  <span className="mono text-[9px] text-faint">{inc.mitre.technique} · {inc.playbooks[rt.playbookIndex].id}</span>
                  <span className="mono text-[9px] text-faint">{inc.asset}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AgentsPanel() {
  const toneMap: Record<string, string> = { ai: "ai", ana: "ana", warn: "warn", ok: "ok", sim: "sim", crit: "crit", risk: "risk" };
  return (
    <div className="panel p-3">
      <SectionTitle tone="ai">Agents internes</SectionTitle>
      <div className="mt-3 space-y-[5px]">
        {AGENTS.map((a, i) => (
          <div key={a.name} className="row-hover flex items-center justify-between py-[3px] px-1.5 border border-transparent" style={{ borderRadius: 2 }}>
            <span className="flex items-center gap-2 min-w-0">
              <span className="mono text-[9px] text-faint tick-num w-4">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[11.5px] text-dim truncate">{a.name}</span>
            </span>
            <Chip label={a.priv} tone={toneMap[a.tone]} />
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-faint border-t border-line/60 pt-2">
        Séparation stricte des privilèges — le LLM ne dispose <span className="text-crit font-semibold">jamais</span> d'un
        privilège d'exécution directe.
      </p>
    </div>
  );
}
