import { useCallback, useEffect, useRef, useState } from "react";
import { INCIDENTS, Incident, Phase, PIPELINE_STAGES } from "../data/incidents";

export interface TimelineEntry {
  time: string;
  text: string;
  tone: "sys" | "ai" | "good" | "warn" | "sim";
}

export interface AuditEntry {
  id: number;
  time: string;
  incident: string;
  actor: string;
  action: string;
  detail: string;
  mode: string;
}

export interface Runtime {
  epoch: number;
  phase: Phase;
  pipelineIndex: number;
  running: boolean;
  timeline: TimelineEntry[];
  l1: boolean;
  l2: boolean;
  rejected: boolean;
  escalated: boolean;
  playbookIndex: number;
  sealed: boolean;
  neutralization: boolean[];
  score: number | null;
  traffic: number[];
}

const nowTime = () => new Date().toTimeString().slice(0, 8);
const rnd = (min: number, max: number) => min + Math.random() * (max - min);

function nextTraffic(inc: Incident, phase: Phase, last: number): number {
  const [aMin, aMax] = inc.metric.attack;
  const [nMin, nMax] = inc.metric.normal;
  if (phase === "MITIGATING") {
    const target = (nMin + nMax) / 2;
    return Math.max(target * 0.75, last + (target - last) * 0.17);
  }
  if (phase === "MONITORING" || phase === "RECOVERED" || phase === "CLOSED" || phase === "FALSE_POSITIVE") {
    return last + (rnd(nMin, nMax) - last) * 0.55;
  }
  return last + (rnd(aMin, aMax) - last) * 0.35;
}

function seedTraffic(inc: Incident): number[] {
  const [aMin, aMax] = inc.metric.attack;
  const out: number[] = [];
  let v = rnd(aMin, aMax);
  for (let i = 0; i < 64; i++) {
    v = v + (rnd(aMin, aMax) - v) * 0.35;
    out.push(v);
  }
  return out;
}

function seedRuntime(inc: Incident): Runtime {
  return {
    epoch: 0,
    phase: inc.seedPhase as Phase,
    pipelineIndex: inc.seedPipelineIndex,
    running: false,
    timeline: inc.seedTimeline.map(([time, text, tone]) => ({ time, text, tone })),
    l1: inc.seedApprovals?.l1 ?? false,
    l2: inc.seedApprovals?.l2 ?? false,
    rejected: false,
    escalated: false,
    playbookIndex: 0,
    sealed: false,
    neutralization: [false, false, false, false, false],
    score: null,
    traffic: seedTraffic(inc),
  };
}

export function fakeSha256(seed: string): string {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let out = "";
  let x = h >>> 0;
  for (let i = 0; i < 64; i++) {
    x = (Math.imul(x, 1103515245) + 12345) >>> 0;
    out += (x & 15).toString(16);
  }
  return out;
}

const SEED_AUDIT: Omit<AuditEntry, "id">[] = [
  { time: "00:25:12", incident: "INC-20260901-000187", actor: "CIC", action: "ANALYSIS_STARTED", detail: "pipeline cognitif 20 stages — 12 agents mobilisés", mode: "PRODUCTION" },
  { time: "00:25:08", incident: "INC-20260901-000187", actor: "DETECTION_ANALYST", action: "INCIDENT_CREATED", detail: "corrélation WAF + LB + CDN — seuil req/s ×9", mode: "PRODUCTION" },
  { time: "00:15:06", incident: "INC-20260901-000172", actor: "POLICY_GUARD", action: "APPROVAL_GATE_ARMED", detail: "double validation requise (L1 + L2) — FAIL CLOSED", mode: "PRODUCTION" },
  { time: "00:15:05", incident: "INC-20260901-000172", actor: "CONSEQUENCE_MODELER", action: "MODELING_COMPLETED", detail: "PB-AUTH-03 — effectiveness 0.92 — collateral MEDIUM", mode: "PRODUCTION" },
  { time: "00:14:52", incident: "INC-20260901-000172", actor: "DETECTION_ANALYST", action: "INCIDENT_CREATED", detail: "IdP — 18 400 tentatives / 9 min — ratio échec 96 %", mode: "PRODUCTION" },
  { time: "00:05:01", incident: "—", actor: "POLICY_GUARD", action: "MODE_ARMED", detail: "PRODUCTION — double validation humaine obligatoire — aucune auto-exécution", mode: "PRODUCTION" },
  { time: "00:05:00", incident: "—", actor: "CIC", action: "SYSTEM_READY", detail: "Policy Guard armé — fail closed — LLM sans privilège d'exécution", mode: "PRODUCTION" },
];

export function useCIC() {
  const [runtimes, setRuntimes] = useState<Record<string, Runtime>>(() => {
    const m: Record<string, Runtime> = {};
    INCIDENTS.forEach((i) => { m[i.id] = seedRuntime(i); });
    return m;
  });
  const [audit, setAudit] = useState<AuditEntry[]>(() =>
    SEED_AUDIT.map((e, idx) => ({ ...e, id: 1000 - idx }))
  );

  const rtRef = useRef(runtimes);
  const timers = useRef<number[]>([]);
  const auditId = useRef(2000);

  useEffect(() => { rtRef.current = runtimes; }, [runtimes]);
  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);

  const after = useCallback((ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  const patch = useCallback((id: string, p: Partial<Runtime>) => {
    setRuntimes((prev) => ({ ...prev, [id]: { ...prev[id], ...p } }));
  }, []);

  const addTimeline = useCallback((id: string, text: string, tone: TimelineEntry["tone"], time?: string) => {
    setRuntimes((prev) => ({
      ...prev,
      [id]: { ...prev[id], timeline: [...prev[id].timeline, { time: time ?? nowTime(), text, tone }] },
    }));
  }, []);

  const pushAudit = useCallback((incident: string, actor: string, action: string, detail: string) => {
    setAudit((prev) => [
      { id: ++auditId.current, time: nowTime(), incident, actor, action, detail, mode: "PRODUCTION" },
      ...prev,
    ]);
  }, []);

  const guarded = useCallback((id: string, epoch: number, fn: () => void) => {
    const rt = rtRef.current[id];
    if (rt && rt.epoch === epoch) fn();
  }, []);

  /* ---------------- pipeline cognitif ---------------- */

  const startAnalysis = useCallback((inc: Incident) => {
    const rt = rtRef.current[inc.id];
    if (!rt || rt.running) return;
    if (!["DETECTED", "ANALYZING"].includes(rt.phase)) return;
    const epoch = rt.epoch;
    const from = Math.max(0, rt.pipelineIndex + 1);
    if (from >= PIPELINE_STAGES.length) return;

    patch(inc.id, { running: true, phase: "ANALYZING" });
    if (from === 0) {
      addTimeline(inc.id, "Analyse CIC démarrée — orchestrateur + 12 agents", "sys");
    } else {
      addTimeline(inc.id, `Reprise du pipeline cognitif — stage ${PIPELINE_STAGES[from]}`, "sys");
    }
    pushAudit(inc.id, "CIC", "ANALYSIS_STARTED", `pipeline cognitif — reprise au stage ${PIPELINE_STAGES[from]}`);

    const STEP = 300;
    for (let i = from; i < PIPELINE_STAGES.length; i++) {
      after((i - from) * STEP, () =>
        guarded(inc.id, epoch, () => patch(inc.id, { pipelineIndex: i }))
      );
    }

    const t = (stage: number) => Math.max(0, stage - from) * STEP + 150;
    const conf = (inc.confidenceFactors.reduce((s, f) => s + f.weight * f.value, 0) * 100).toFixed(1);
    const h0 = inc.hypotheses[0];
    const h1 = inc.hypotheses[inc.hypotheses.length - 1];
    const pb = inc.playbooks[0];

    if (5 >= from) after(t(5), () => guarded(inc.id, epoch, () => {
      addTimeline(inc.id, `Hypothèse principale : ${h0.name} — ${h0.score.toFixed(1)} %`, "ai");
      pushAudit(inc.id, "THREAT_ANALYST", "HYPOTHESIS_GENERATED", `${h0.name} — p=${(h0.score / 100).toFixed(3)}`);
    }));
    if (6 >= from) after(t(6), () => guarded(inc.id, epoch, () => {
      addTimeline(inc.id, `Contre-hypothèse : ${h1.name.toLowerCase()} — ${h1.score.toFixed(1)} %`, "ai");
      pushAudit(inc.id, "COUNTER_ANALYST", "CHALLENGE_RAISED", `${inc.evidenceAgainst.length} éléments contradictoires examinés`);
    }));
    if (7 >= from) after(t(7), () => guarded(inc.id, epoch, () =>
      pushAudit(inc.id, "CIC", "CONFIDENCE_SCORED", `confidence ${conf} % — pondération déterministe 6 facteurs`)));
    if (8 >= from) after(t(8), () => guarded(inc.id, epoch, () => {
      addTimeline(inc.id, `MITRE mapping : ${inc.mitre.tactic} / ${inc.mitre.technique}`, "ai");
      pushAudit(inc.id, "MITRE_MAPPER", "MITRE_MAPPING", `${inc.mitre.tactic} ${inc.mitre.tacticName} / ${inc.mitre.technique} / ${inc.mitre.sub}`);
    }));
    if (10 >= from) after(t(10), () => guarded(inc.id, epoch, () => {
      addTimeline(inc.id, "Incident confirmé — analyse d'impact terminée", "sys");
      setRuntimes((prev) => ({ ...prev, [inc.id]: { ...prev[inc.id], phase: "CONFIRMED" } }));
    }));
    if (11 >= from) after(t(11), () => guarded(inc.id, epoch, () => {
      addTimeline(inc.id, `${pb.id} sélectionné (match ${pb.match} %)`, "sim");
      pushAudit(inc.id, "PLAYBOOK_SELECTOR", "PLAYBOOK_MATCHED", inc.playbooks.map((p) => `${p.id} (${p.match} %)`).join(" > "));
      setRuntimes((prev) => ({ ...prev, [inc.id]: { ...prev[inc.id], phase: "PLAYBOOK_SELECTED" } }));
    }));
    if (12 >= from) after(t(12), () => guarded(inc.id, epoch, () => {
      addTimeline(inc.id, `Modélisation pré-exécution : efficacité ${pb.sim.effectiveness} % — risque collatéral ${pb.sim.collateral}`, "sim");
      pushAudit(inc.id, "CONSEQUENCE_MODELER", "MODELING_COMPLETED", `${pb.id} — ESTIMATE ONLY — aucune exécution à ce stade`);
    }));

    const total = (PIPELINE_STAGES.length - from) * STEP + 350;
    after(total, () => guarded(inc.id, epoch, () => {
      patch(inc.id, { running: false, phase: "WAITING_APPROVAL" });
      addTimeline(inc.id, "Human Approval Gate armé — double validation humaine obligatoire (L1 + L2)", "warn");
      pushAudit(inc.id, "POLICY_GUARD", "APPROVAL_GATE_ARMED", "RBAC + périmètre + limites de commande vérifiés — FAIL CLOSED");
    }));
  }, [after, addTimeline, guarded, patch, pushAudit]);

  /* ---------------- exécution réelle ---------------- */

  const execute = useCallback((id: string) => {
    const rt = rtRef.current[id];
    if (!rt || rt.phase !== "WAITING_APPROVAL") return;
    const epoch = rt.epoch;
    const inc = INCIDENTS.find((i) => i.id === id)!;
    const pb = inc.playbooks[rt.playbookIndex];
    patch(id, { phase: "MITIGATING" });
    addTimeline(id, `Playbook démarré — ${pb.id} — exécution autorisée sur systèmes réels`, "warn");
    pushAudit(id, "EXECUTION_ENGINE", "EXECUTION_START", `${pb.id} — deterministic executor — privilèges RESTRICTED`);

    after(6500, () => guarded(id, epoch, () => {
      addTimeline(id, "Mitigation terminée", "good");
      addTimeline(id, "Post-mitigation monitoring démarré — fenêtre d'observation 5 min", "sys");
      pushAudit(id, "CIC", "POST_MITIGATION_WATCH", "surveillance métriques + récidive + trafic légitime");
      patch(id, { phase: "MONITORING" });
      for (let k = 0; k < 5; k++) {
        after(1500 * (k + 1), () => guarded(id, epoch, () => {
          setRuntimes((prev) => {
            const cur = prev[id];
            const neu = [...cur.neutralization];
            neu[k] = true;
            return { ...prev, [id]: { ...cur, neutralization: neu } };
          });
        }));
      }
      after(1500 * 5 + 1000, () => guarded(id, epoch, () => {
        addTimeline(id, "Aucune récidive détectée pendant la fenêtre d'observation", "good");
        addTimeline(id, "Statut incident : RECOVERED", "good");
        addTimeline(id, "Paquet forensique scellé — manifest.sha256", "sys");
        pushAudit(id, "CIC", "THREAT_NEUTRALIZED", "5/5 conditions de neutralisation satisfaites");
        pushAudit(id, "EVIDENCE_AGENT", "FORENSIC_SEALED", `sha256:${fakeSha256(id + ":manifest").slice(0, 16)}… — append only`);
        patch(id, { phase: "RECOVERED", sealed: true, score: inc.baseScore });
      }));
    }));
  }, [after, addTimeline, guarded, patch, pushAudit]);

  /* ---------------- approbations humaines ---------------- */

  const approve = useCallback((id: string, level: 1 | 2) => {
    const rt = rtRef.current[id];
    if (!rt || rt.phase !== "WAITING_APPROVAL") return;
    const epoch = rt.epoch;
    if (level === 1 && !rt.l1) {
      patch(id, { l1: true, rejected: false });
      addTimeline(id, "Approbation L1 — SOC Analyst", "good");
      pushAudit(id, "HUMAN · SOC ANALYST", "APPROVAL_GRANTED", "LEVEL 1 — identité vérifiée — RBAC OK");
    }
    if (level === 2) {
      const cur = rtRef.current[id];
      if (!cur.l1) return;
      patch(id, { l2: true });
      addTimeline(id, "Approbation L2 — Incident Commander", "good");
      pushAudit(id, "HUMAN · INCIDENT COMMANDER", "APPROVAL_GRANTED", "LEVEL 2 — double validation complète");
      after(800, () => guarded(id, epoch, () => {
        pushAudit(id, "POLICY_GUARD", "AUTHORIZATION_GRANTED", "mode + autorisation + périmètre + criticité vérifiés — ALLOW");
        execute(id);
      }));
    }
  }, [addTimeline, after, execute, guarded, patch, pushAudit]);

  const reject = useCallback((id: string) => {
    const rt = rtRef.current[id];
    if (!rt || rt.phase !== "WAITING_APPROVAL") return;
    patch(id, { rejected: true });
    addTimeline(id, "Réponse rejetée par l'opérateur — FAIL CLOSED, aucune exécution", "warn");
    pushAudit(id, "HUMAN · SOC ANALYST", "RESPONSE_REJECTED", "DENY — fail closed — incident maintenu sous surveillance");
  }, [addTimeline, patch, pushAudit]);

  const escalate = useCallback((id: string) => {
    const rt = rtRef.current[id];
    if (!rt || rt.phase !== "WAITING_APPROVAL" || rt.escalated) return;
    patch(id, { escalated: true });
    addTimeline(id, "Escalade vers Incident Commander — astreinte notifiée", "warn");
    pushAudit(id, "CIC", "ESCALATION", "notification Incident Commander + canal crise");
  }, [addTimeline, patch, pushAudit]);

  const modify = useCallback((id: string) => {
    const rt = rtRef.current[id];
    const inc = INCIDENTS.find((i) => i.id === id)!;
    if (!rt || rt.phase !== "WAITING_APPROVAL") return;
    const next = (rt.playbookIndex + 1) % inc.playbooks.length;
    patch(id, { playbookIndex: next, l1: false, l2: false });
    addTimeline(id, `Playbook modifié par l'opérateur : ${inc.playbooks[next].id} — approbations réinitialisées`, "sim");
    pushAudit(id, "HUMAN · SOC ANALYST", "PLAYBOOK_MODIFIED", `${inc.playbooks[rt.playbookIndex].id} → ${inc.playbooks[next].id}`);
  }, [addTimeline, patch, pushAudit]);

  const selectPlaybook = useCallback((id: string, index: number) => {
    const rt = rtRef.current[id];
    const inc = INCIDENTS.find((i) => i.id === id)!;
    if (!rt || rt.phase !== "WAITING_APPROVAL") return;
    if (index === rt.playbookIndex || index >= inc.playbooks.length) return;
    patch(id, { playbookIndex: index, l1: false, l2: false });
    addTimeline(id, `Playbook sélectionné par l'opérateur : ${inc.playbooks[index].id} — approbations réinitialisées`, "sim");
    pushAudit(id, "HUMAN · SOC ANALYST", "PLAYBOOK_SELECTED", `${inc.playbooks[rt.playbookIndex].id} → ${inc.playbooks[index].id}`);
  }, [addTimeline, patch, pushAudit]);

  const closeIncident = useCallback((id: string) => {
    const rt = rtRef.current[id];
    if (!rt || rt.phase !== "RECOVERED") return;
    patch(id, { phase: "CLOSED" });
    addTimeline(id, "Incident clos — surveillance renforcée maintenue 24 h", "sys");
    pushAudit(id, "CIC", "INCIDENT_CLOSED", "clôture définitive après fenêtre d'observation");
  }, [addTimeline, patch, pushAudit]);

  /* ---------------- flux trafic live ---------------- */

  useEffect(() => {
    const iv = window.setInterval(() => {
      setRuntimes((prev) => {
        const next: Record<string, Runtime> = {};
        INCIDENTS.forEach((inc) => {
          const rt = prev[inc.id];
          const last = rt.traffic[rt.traffic.length - 1];
          next[inc.id] = { ...rt, traffic: [...rt.traffic.slice(1), nextTraffic(inc, rt.phase, last)] };
        });
        return next;
      });
    }, 650);
    return () => window.clearInterval(iv);
  }, []);

  return {
    runtimes, audit,
    startAnalysis, approve, reject, escalate, modify, selectPlaybook, closeIncident,
  };
}
