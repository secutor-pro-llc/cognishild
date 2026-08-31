import type { Incident } from "../data/incidents";
import type { AuditEntry, Runtime } from "../engine/useCIC";
import { Bar, Chip, IcCheck, IcFile, IcPulse, IcShield, SectionTitle, TONE } from "./ui";

const actorTone = (actor: string): string => {
  if (actor.startsWith("HUMAN")) return "warn";
  if (actor.includes("POLICY")) return "crit";
  if (actor.includes("COUNTER") || actor === "CIC") return "ai";
  if (actor.includes("SIMULATION")) return "sim";
  if (actor.includes("EVIDENCE")) return "ok";
  if (actor.includes("EXECUTION")) return "risk";
  if (actor.includes("DETECTION")) return "ana";
  return "sim";
};

export function AuditLog({ audit }: { audit: AuditEntry[] }) {
  return (
    <div className="panel panel-ticks p-3.5 h-full" style={{ ["--tick" as string]: TONE.ok }}>
      <div className="flex items-center justify-between">
        <SectionTitle tone="ok">Journal d'audit immuable</SectionTitle>
        <Chip label="APPEND ONLY" tone="ok" />
      </div>
      <div className="mt-2.5 h-[220px] overflow-y-auto scroll-thin pr-1 space-y-[3px]">
        {audit.map((e) => (
          <div key={e.id} className="slide-in flex items-baseline gap-2 border-b border-line/30 pb-[3px] flex-wrap">
            <span className="mono text-[9px] text-faint tick-num shrink-0">{e.time}</span>
            <span className="mono text-[9px] px-1 py-[1px] shrink-0" style={{ borderRadius: 2, color: TONE[actorTone(e.actor)], background: `${TONE[actorTone(e.actor)]}12`, border: `1px solid ${TONE[actorTone(e.actor)]}33` }}>
              {e.actor}
            </span>
            <span className="mono text-[9.5px] font-semibold text-ink shrink-0">{e.action}</span>
            <span className="mono text-[9px] text-dim truncate">{e.detail}</span>
            <span className="mono text-[8px] text-faint ml-auto shrink-0">{e.incident === "—" ? "SYSTEM" : e.incident.slice(-6)} · {e.mode}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScorePanel({ incidents, runtimes }: { incidents: Incident[]; runtimes: Record<string, Runtime> }) {
  const done = incidents.filter((i) => runtimes[i.id].score !== null);
  const latest = done[done.length - 1];
  if (!latest) {
    return (
      <div className="panel p-3.5 h-full flex flex-col">
        <SectionTitle tone="ai">Cognitive Response Score</SectionTitle>
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
          <IcPulse size={26} color={TONE.faint} />
          <p className="text-[11px] text-faint text-center leading-relaxed px-4">
            Aucun exercice terminé — le score est calculé après chaque rejeu Cyber Range
            (détection, classification, faux positifs, réponse, risque collatéral, récupération, preuves).
          </p>
          <div className="mono text-[9px] text-faint tracking-[0.2em]">EN ATTENTE D'EXERCICE</div>
        </div>
      </div>
    );
  }
  const rt = runtimes[latest.id];
  return (
    <div className="panel panel-ticks p-3.5 h-full" style={{ ["--tick" as string]: TONE.ai }}>
      <SectionTitle tone="ai">Cognitive Response Score</SectionTitle>
      <div className="flex items-center gap-4 mt-3">
        <div className="text-center shrink-0">
          <div className="disp text-4xl font-bold text-ai tick-num leading-none">{latest.baseScore}</div>
          <div className="mono text-[9px] text-faint mt-1 tracking-[0.2em]">/ 100</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {latest.subScores.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-[10px] text-dim w-[104px] shrink-0 truncate">{s.label}</span>
              <span className="flex-1"><Bar value={s.value} color={s.value >= 90 ? TONE.ok : TONE.ai} h={3} /></span>
              <span className="mono text-[9px] text-faint tick-num w-5 text-right">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2.5 border-t border-line/60 pt-2 flex items-center justify-between">
        <span className="mono text-[9px] text-faint">{latest.id}</span>
        <Chip label={rt.phase === "CLOSED" ? "EXERCICE CLOS" : "EXERCICE TERMINÉ"} tone="ai" />
      </div>
    </div>
  );
}

export function FinalStatus({ inc, rt, mode }: { inc: Incident; rt: Runtime; mode: string }) {
  const finished = ["RECOVERED", "CLOSED"].includes(rt.phase);
  return (
    <div className="panel p-3.5 h-full flex flex-col">
      <SectionTitle tone={finished ? "ok" : "sim"}>Statut final</SectionTitle>
      {finished ? (
        <div className="mt-3 flex-1">
          <div className="disp text-[13px] font-bold tracking-[0.08em] text-ok flex items-center gap-2">
            <IcShield size={15} color={TONE.ok} />
            {mode === "TRAINING" ? "TRAINING EXERCISE COMPLETED" : "INCIDENT CONTAINED"}
          </div>
          <p className="text-[11px] text-dim mt-2 leading-relaxed">
            {mode === "TRAINING"
              ? "Scénario de menace mitigé avec succès. Aucune infrastructure externe impactée."
              : "Service restauré. Surveillance renforcée active. Preuves préservées."}
          </p>
          <div className="mt-2.5 space-y-1 mono text-[10px]">
            <div className="flex justify-between"><span className="text-faint">Confidence</span><span className="text-ana">{(inc.confidenceFactors.reduce((s, f) => s + f.weight * f.value, 0) * 100).toFixed(1)} %</span></div>
            <div className="flex justify-between"><span className="text-faint">Response score</span><span className="text-ai">{inc.baseScore} / 100</span></div>
            <div className="flex justify-between"><span className="text-faint">Collateral risk</span><span className="text-ok">{inc.playbooks[rt.playbookIndex].sim.collateral}</span></div>
          </div>
          <div className="mt-3 space-y-1.5">
            {["Preuves scellées (forensic package)", "Aucune action externe non autorisée", "Clôture après fenêtre d'observation"].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <IcCheck size={10} color={TONE.ok} />
                <span className="text-[10.5px] text-dim">{s}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2.5 py-6">
          <IcFile size={24} color={TONE.faint} />
          <p className="text-[11px] text-faint text-center leading-relaxed px-3">
            Le statut final (mitigé / contenu / faux positif) n'est émis qu'après la fenêtre
            de surveillance post-mitigation — jamais avant.
          </p>
        </div>
      )}
    </div>
  );
}

export function Footer() {
  const steps = ["DETECT", "CHALLENGE", "UNDERSTAND", "SIMULATE", "AUTHORIZE", "RESPOND", "VERIFY", "PROVE"];
  return (
    <footer className="border-t border-line/70 mt-4">
      <div className="max-w-[1760px] mx-auto px-4 py-3.5 flex items-center gap-3 flex-wrap">
        <span className="mono text-[9px] tracking-[0.22em] text-faint">PRINCIPE DIRECTEUR</span>
        <div className="flex items-center gap-1 flex-wrap">
          {steps.map((s, i) => (
            <span key={s} className="flex items-center">
              <span className="disp text-[10px] font-semibold tracking-[0.18em]" style={{ color: i === 1 ? TONE.ai : i === 3 ? TONE.sim : i === 4 ? TONE.warn : i === 7 ? TONE.ok : TONE.dim }}>{s}</span>
              {i < steps.length - 1 && <span className="mx-1.5 text-faint text-[10px]">→</span>}
            </span>
          ))}
        </div>
        <span className="ml-auto mono text-[9px] text-faint">
          COGNISHIELD CIC v1.0 — défense & réponse sur autorisation — démo fonctionnelle
        </span>
      </div>
    </footer>
  );
}
