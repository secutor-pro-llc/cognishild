import type { Incident } from "../data/incidents";
import { FORENSIC_FILES, SEVERITY_COLOR } from "../data/incidents";
import { fakeSha256, type Runtime } from "../engine/useCIC";
import {
  Bar, Chip, confidenceOf, IcArrow, IcCheck, IcFile, IcFlask, IcGavel, IcLock,
  IcScale, IcTarget, IcX, SectionTitle, TONE, riskOf,
} from "./ui";

function MitrePanel({ inc }: { inc: Incident }) {
  return (
    <div className="panel p-3.5">
      <div className="flex items-center justify-between">
        <SectionTitle tone="risk">MITRE ATT&CK</SectionTitle>
        <IcTarget size={14} color={TONE.risk} />
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between border border-line/50 px-2.5 py-1.5" style={{ borderRadius: 2 }}>
          <span className="mono text-[10px] text-risk font-semibold">{inc.mitre.tactic}</span>
          <span className="text-[11.5px] text-dim">{inc.mitre.tacticName}</span>
        </div>
        <div className="flex items-center justify-between border border-line/50 px-2.5 py-1.5" style={{ borderRadius: 2 }}>
          <span className="mono text-[10px] text-ink font-semibold">{inc.mitre.technique}</span>
          <span className="text-[11.5px] text-dim">{inc.mitre.techniqueName}</span>
        </div>
        <div className="flex items-center justify-between border border-line/50 px-2.5 py-1.5" style={{ borderRadius: 2 }}>
          <span className="mono text-[10px] text-ana font-semibold">{inc.mitre.sub}</span>
          <span className="text-[11.5px] text-dim">{inc.mitre.subName}</span>
        </div>
      </div>
      <p className="mt-2.5 text-[10px] text-faint">Le mapping est une aide analytique — jamais une preuve d'attribution.</p>
    </div>
  );
}

function RiskPanel({ inc }: { inc: Incident }) {
  const { score, cls } = riskOf(inc);
  const conf = confidenceOf(inc);
  const rows = [
    ["THREAT", inc.risk.threat, TONE.crit],
    ["ASSET CRITICALITY", inc.risk.assetCrit, TONE.risk],
    ["EXPOSURE", inc.risk.exposure, TONE.warn],
    ["CONFIDENCE", conf, TONE.ana],
  ] as const;
  return (
    <div className="panel panel-ticks p-3.5" style={{ ["--tick" as string]: SEVERITY_COLOR[cls] }}>
      <SectionTitle tone={cls === "CRITICAL" ? "crit" : cls === "HIGH" ? "risk" : "warn"}>Modèle de risque</SectionTitle>
      <div className="mono text-[9.5px] text-faint mt-2.5">RISK = THREAT × ASSET × EXPOSURE × CONFIDENCE</div>
      <div className="mt-2 space-y-2">
        {rows.map(([k, v, c]) => (
          <div key={k}>
            <div className="flex justify-between mb-1">
              <span className="mono text-[9px] tracking-[0.12em] text-dim">{k}</span>
              <span className="mono text-[10px] tick-num" style={{ color: c }}>{v.toFixed(2)}</span>
            </div>
            <Bar value={v * 100} color={c} h={3} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3 border-t border-line/60 pt-2.5">
        <span className="mono text-[10px] text-faint tick-num">= {score.toFixed(3)}</span>
        <Chip label={cls} tone={cls === "CRITICAL" ? "crit" : cls === "HIGH" ? "risk" : cls === "MEDIUM" ? "warn" : "ana"} solid />
      </div>
    </div>
  );
}

function AssetPanel({ inc }: { inc: Incident }) {
  const global = Math.round(inc.risk.assetCrit * 100);
  return (
    <div className="panel p-3.5">
      <div className="flex items-center justify-between">
        <SectionTitle tone="risk">Asset Criticality</SectionTitle>
        <span className="disp text-xl font-bold tick-num text-risk">{global}<span className="text-[10px] text-faint">/100</span></span>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-[7px]">
        {inc.assetCriteria.map((c) => (
          <div key={c.label} className="flex items-center gap-2">
            <span className="text-[10.5px] text-dim w-[130px] shrink-0 truncate">{c.label}</span>
            <span className="flex-1"><Bar value={c.value} color={c.value >= 80 ? TONE.crit : c.value >= 60 ? TONE.risk : c.value >= 40 ? TONE.warn : TONE.ana} h={3} /></span>
            <span className="mono text-[9px] text-faint tick-num w-6 text-right">{c.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaybookPanel({ inc, rt, onSelect }: { inc: Incident; rt: Runtime; onSelect: (i: number) => void }) {
  const sel = inc.playbooks[rt.playbookIndex];
  const waiting = rt.phase === "WAITING_APPROVAL";
  return (
    <div className="panel panel-ticks p-3.5" style={{ ["--tick" as string]: TONE.ok }}>
      <SectionTitle tone="ok">Playbooks & modélisation</SectionTitle>
      <div className="mt-3 space-y-1.5">
        {inc.playbooks.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onSelect(i)}
            disabled={!waiting}
            className="row-hover w-full text-left border px-2.5 py-2 disabled:cursor-default"
            style={{
              borderColor: i === rt.playbookIndex ? `${TONE.ok}55` : "rgba(90,115,160,0.16)",
              background: i === rt.playbookIndex ? "rgba(61,220,151,0.06)" : "rgba(12,18,32,0.5)",
              borderRadius: 2,
              cursor: waiting ? "pointer" : "default",
              opacity: waiting ? 1 : 0.85,
            }}
          >
            <span className="flex items-center justify-between">
              <span className="mono text-[11px] font-semibold" style={{ color: i === rt.playbookIndex ? TONE.ok : "#c4d2e6" }}>{p.id}</span>
              <span className="flex items-center gap-1.5">
                {i === 0 && <Chip label="RECOMMANDÉ" tone="ok" />}
                <span className="mono text-[10px] tick-num text-dim">{p.match} %</span>
              </span>
            </span>
            <span className="flex items-center gap-2 mt-1.5">
              <span className="flex-1"><Bar value={p.match} color={i === rt.playbookIndex ? TONE.ok : TONE.sim} h={3} /></span>
            </span>
            <span className="block text-[10.5px] text-faint mt-1">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 border-t border-line/60 pt-2.5">
        <div className="flex items-center justify-between">
          <span className="mono text-[9px] tracking-[0.18em] text-faint">MODÉLISATION PRÉ-EXÉCUTION — {sel.id}</span>
          <Chip label="ESTIMATE ONLY" tone="sim" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2.5">
          {[
            ["Success probability", `${sel.sim.success} %`, TONE.ok],
            ["Estimated effectiveness", `${sel.sim.effectiveness} %`, TONE.ok],
            ["Collateral risk", sel.sim.collateral, sel.sim.collateral === "LOW" ? TONE.ok : sel.sim.collateral === "MEDIUM" ? TONE.warn : TONE.crit],
            ["Service interruption", sel.sim.interruption, sel.sim.interruption === "VERY LOW" || sel.sim.interruption === "LOW" ? TONE.ok : TONE.warn],
            ["Reversibility", sel.sim.reversibility, sel.sim.reversibility === "HIGH" ? TONE.ok : TONE.warn],
            ["Expected impact", sel.sim.impact, TONE.ana],
          ].map(([k, v, c]) => (
            <div key={k as string}>
              <div className="mono text-[8.5px] text-faint uppercase tracking-[0.1em]">{k}</div>
              <div className="text-[12px] font-semibold" style={{ color: c as string }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 border-t border-line/60 pt-2.5">
        <div className="mono text-[8.5px] tracking-[0.16em] text-faint mb-1.5">CHAÎNE DE DÉCISION — AUCUN PRIVILÈGE LLM</div>
        <div className="flex items-center flex-wrap gap-y-1">
          {["LLM", "Recommandation structurée", "Policy engine", "Autorisation", "Exécuteur déterministe"].map((s, i, arr) => (
            <span key={s} className="flex items-center">
              <span className="mono text-[9px] px-1.5 py-[2px] border border-line/60 text-dim" style={{ borderRadius: 2, color: i === 0 ? TONE.ai : i === 2 ? TONE.crit : i === 4 ? TONE.ok : undefined }}>{s}</span>
              {i < arr.length - 1 && <IcArrow size={9} color={TONE.faint} />}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApprovalGate({
  inc, rt, onApprove, onReject, onEscalate, onModify,
}: {
  inc: Incident; rt: Runtime;
  onApprove: (l: 1 | 2) => void; onReject: () => void; onEscalate: () => void; onModify: () => void;
}) {
  const conf = confidenceOf(inc);
  const pb = inc.playbooks[rt.playbookIndex];
  const active = rt.phase === "WAITING_APPROVAL";
  const granted = rt.l1 && rt.l2;
  const checks = ["Mode opérationnel", "Autorisation & RBAC", "Périmètre", "Classification actif", "Playbook autorisé", "Limites de commande"];
  return (
    <div className="panel panel-ticks p-3.5" style={{ ["--tick" as string]: granted ? TONE.ok : TONE.warn, borderColor: active ? `${TONE.warn}44` : undefined }}>
      <div className="flex items-center justify-between">
        <SectionTitle tone={granted ? "ok" : "warn"}>Human Approval Gate</SectionTitle>
        <IcGavel size={14} color={granted ? TONE.ok : TONE.warn} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
        <div><div className="mono text-[8.5px] text-faint uppercase tracking-[0.1em]">Incident</div><div className="mono text-[10.5px] text-ink">{inc.id}</div></div>
        <div><div className="mono text-[8.5px] text-faint uppercase tracking-[0.1em]">Playbook</div><div className="mono text-[10.5px] text-ok">{pb.id}</div></div>
        <div><div className="mono text-[8.5px] text-faint uppercase tracking-[0.1em]">Confidence</div><div className="mono text-[10.5px] text-ana">{(conf * 100).toFixed(1)} %</div></div>
        <div><div className="mono text-[8.5px] text-faint uppercase tracking-[0.1em]">Collateral risk</div><div className="mono text-[10.5px]" style={{ color: pb.sim.collateral === "LOW" ? TONE.ok : TONE.warn }}>{pb.sim.collateral}</div></div>
        <div className="col-span-2"><div className="mono text-[8.5px] text-faint uppercase tracking-[0.1em]">Expected impact</div><div className="text-[11.5px] text-dim">{pb.sim.impact}</div></div>
      </div>

      <div className="flex items-center gap-3 mt-3">
        {[["LEVEL 1", "SOC Analyst", rt.l1], ["LEVEL 2", "Incident Commander", rt.l2]].map(([l, r, ok]) => (
          <div key={l as string} className="flex items-center gap-2 border border-line/60 px-2 py-1.5 flex-1" style={{ borderRadius: 2, borderColor: ok ? `${TONE.ok}55` : undefined }}>
            <span className="flex items-center justify-center" style={{ width: 15, height: 15, border: `1px solid ${ok ? TONE.ok : "rgba(90,115,160,0.35)"}`, borderRadius: 2, background: ok ? `${TONE.ok}18` : "transparent" }}>
              {ok && <IcCheck size={9} color={TONE.ok} />}
            </span>
            <div>
              <div className="mono text-[8.5px] text-faint tracking-[0.12em]">{l}</div>
              <div className="text-[10.5px] text-dim">{r}</div>
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div className="grid grid-cols-2 gap-1.5 mt-3">
          <button className="btn btn-ok" disabled={rt.l1} onClick={() => onApprove(1)}>{rt.l1 ? "L1 approuvé" : "Approve L1"}</button>
          <button className="btn btn-ok" disabled={!rt.l1 || rt.l2} onClick={() => onApprove(2)}>{rt.l2 ? "L2 approuvé" : "Approve L2"}</button>
          <button className="btn btn-crit" onClick={onReject}>Reject</button>
          <button className="btn btn-warn" onClick={onModify}>Modify</button>
          <button className="btn btn-ai col-span-2" disabled={rt.escalated} onClick={onEscalate}>{rt.escalated ? "Escalade notifiée" : "Escalate"}</button>
        </div>
      )}

      {active && (
        <p className="mt-2.5 text-[10px] text-risk">
          Aucune auto-exécution : la double validation humaine (L1 + L2) est obligatoire avant tout impact sur un système réel.
        </p>
      )}
      {rt.rejected && active && (
        <div className="mt-2.5 border border-crit/50 bg-crit/10 px-2.5 py-2 flex items-center gap-2" style={{ borderRadius: 2 }}>
          <IcX size={12} color={TONE.crit} />
          <span className="mono text-[10px] text-crit font-semibold tracking-[0.1em]">DENY — FAIL CLOSED — aucune exécution</span>
        </div>
      )}
      {granted && (
        <div className="mt-2.5 border border-ok/50 bg-ok/10 px-2.5 py-2 flex items-center gap-2 stamp" style={{ borderRadius: 2 }}>
          <IcCheck size={12} color={TONE.ok} />
          <span className="mono text-[10px] text-ok font-semibold tracking-[0.1em]">AUTHORIZATION GRANTED — POLICY GUARD : ALLOW</span>
        </div>
      )}

      <div className="mt-3 border-t border-line/60 pt-2.5 grid grid-cols-2 gap-x-3 gap-y-1">
        {checks.map((c, i) => (
          <div key={c} className="flex items-center gap-1.5">
            <span className="mono text-[9px]" style={{ color: granted ? TONE.ok : TONE.faint }}>{granted ? "✓" : "·"}</span>
            <span className="mono text-[8.5px] text-faint tracking-[0.06em]">{String(i + 1).padStart(2, "0")} {c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ForensicPanel({ inc, rt }: { inc: Incident; rt: Runtime }) {
  const hash = fakeSha256(inc.id + ":manifest");
  return (
    <div className="panel p-3.5">
      <div className="flex items-center justify-between">
        <SectionTitle tone="ok">Forensic package</SectionTitle>
        {rt.sealed ? <IcFile size={14} color={TONE.ok} /> : <IcLock size={14} color={TONE.faint} />}
      </div>
      {rt.sealed ? (
        <div className="relative mt-3">
          <div className="mono text-[10px] text-dim leading-relaxed">
            <div className="text-ink font-semibold">{inc.id}/</div>
            {FORENSIC_FILES.map((f) => (
              <div key={f} className="pl-4 flex items-center gap-1.5">
                <span className="text-faint">├──</span>
                <span className={f === "manifest.sha256" ? "text-ok" : ""}>{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 border-t border-line/60 pt-2">
            <div className="mono text-[8.5px] text-faint tracking-[0.14em]">MANIFEST SHA-256</div>
            <div className="mono text-[9.5px] text-ok break-all mt-1">{hash}</div>
          </div>
          <div className="stamp absolute -top-1 -right-1 disp text-[11px] font-bold tracking-[0.2em] px-2 py-1 border-2 border-ok text-ok" style={{ background: "rgba(7,11,18,0.85)" }}>
            SEALED
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-[11px] text-faint leading-relaxed">
            Paquet en attente — scellage automatique après neutralisation confirmée. Chaque pièce horodatée,
            signée et <span className="text-dim">append-only</span>.
          </p>
          <div className="mono text-[9px] text-faint mt-2.5 space-y-1">
            <div>· SHA-256 + timestamp + source + capteur</div>
            <div>· event ID + analyste + décision IA</div>
            <div>· playbook + approbations + résultat</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RightRail({
  inc, rt, onApprove, onReject, onEscalate, onModify, onSelectPlaybook,
}: {
  inc: Incident; rt: Runtime;
  onApprove: (l: 1 | 2) => void; onReject: () => void; onEscalate: () => void; onModify: () => void;
  onSelectPlaybook: (i: number) => void;
}) {
  return (
    <div className="space-y-3 min-w-0">
      <ApprovalGate inc={inc} rt={rt} onApprove={onApprove} onReject={onReject} onEscalate={onEscalate} onModify={onModify} />
      <MitrePanel inc={inc} />
      <RiskPanel inc={inc} />
      <PlaybookPanel inc={inc} rt={rt} onSelect={onSelectPlaybook} />
      <AssetPanel inc={inc} />
      <ForensicPanel inc={inc} rt={rt} />
      <div className="panel p-3.5">
        <div className="flex items-center gap-2">
          <IcScale size={14} color={TONE.ai} />
          <span className="mono text-[9px] tracking-[0.16em] text-faint">POLICY GUARD — FAIL CLOSED</span>
        </div>
        <p className="text-[10.5px] text-faint mt-2 leading-relaxed">
          Sans validation complète : <span className="mono text-crit font-semibold">DENY</span>. Le moteur vérifie mode,
          autorisation, périmètre, classification, identité, RBAC, playbook autorisé et limites de commande.
        </p>
      </div>
      <div className="panel p-3.5" style={{ borderColor: `${TONE.ai}33` }}>
        <div className="flex items-center gap-2">
          <IcFlask size={14} color={TONE.ai} />
          <span className="mono text-[9px] tracking-[0.16em] text-faint">APPRENTISSAGE CONTRÔLÉ</span>
        </div>
        <p className="text-[10.5px] text-faint mt-2 leading-relaxed">
          Le système apprend des incidents clos (hypothèse confirmée, playbook efficace, fausse alerte, capteur fiable,
          correction humaine) — <span className="text-dim">jamais</span> d'apprentissage automatique direct sur une
          décision sensible sans validation.
        </p>
      </div>
    </div>
  );
}
