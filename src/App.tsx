import { useEffect, useState } from "react";
import { INCIDENTS } from "./data/incidents";
import { useCIC } from "./engine/useCIC";
import { PipelineStrip, TopBar } from "./components/TopBar";
import { AgentsPanel, IncidentQueue, Kpis } from "./components/LeftRail";
import { CenterStage } from "./components/CenterStage";
import { RightRail } from "./components/RightRail";
import { AuditLog, FinalStatus, Footer, ScorePanel } from "./components/BottomStrip";

export default function App() {
  const cic = useCIC();
  const [selectedId, setSelectedId] = useState(INCIDENTS[0].id);

  const inc = INCIDENTS.find((i) => i.id === selectedId) ?? INCIDENTS[0];
  const rt = cic.runtimes[inc.id];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= INCIDENTS.length) setSelectedId(INCIDENTS[n - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="bg-grid" aria-hidden />
      <div className="bg-noise" aria-hidden />
      <div className="scanline" aria-hidden />

      <TopBar mode={cic.mode} onMode={cic.setMode} />
      <PipelineStrip index={rt.pipelineIndex} phase={rt.phase} />

      <main className="max-w-[1760px] w-full mx-auto px-4 py-3 relative z-10 flex-1">
        <div className="grid grid-cols-12 gap-3 items-start">
          <aside className="col-span-12 md:col-span-6 lg:col-span-3 space-y-3 order-2 lg:order-1">
            <Kpis incidents={INCIDENTS} runtimes={cic.runtimes} />
            <IncidentQueue incidents={INCIDENTS} runtimes={cic.runtimes} selected={inc.id} onSelect={setSelectedId} />
            <AgentsPanel />
          </aside>

          <section className="col-span-12 lg:col-span-6 order-1 lg:order-2 min-w-0">
            <CenterStage
              inc={inc}
              rt={rt}
              mode={cic.mode}
              onStart={() => cic.startAnalysis(inc)}
              onClose={() => cic.closeIncident(inc.id)}
              onReplay={() => cic.replay(inc.id)}
            />
          </section>

          <aside className="col-span-12 md:col-span-6 lg:col-span-3 space-y-3 order-3">
            <RightRail
              inc={inc}
              rt={rt}
              mode={cic.mode}
              onApprove={(l) => cic.approve(inc.id, l)}
              onReject={() => cic.reject(inc.id)}
              onEscalate={() => cic.escalate(inc.id)}
              onModify={() => cic.modify(inc.id)}
              onSelectPlaybook={(i) => cic.selectPlaybook(inc.id, i)}
            />
          </aside>
        </div>

        <div className="grid grid-cols-12 gap-3 mt-3 items-stretch">
          <div className="col-span-12 lg:col-span-5"><AuditLog audit={cic.audit} /></div>
          <div className="col-span-12 md:col-span-6 lg:col-span-4"><ScorePanel incidents={INCIDENTS} runtimes={cic.runtimes} /></div>
          <div className="col-span-12 md:col-span-6 lg:col-span-3"><FinalStatus inc={inc} rt={rt} mode={cic.mode} /></div>
        </div>

        <p className="mono text-[9px] text-faint mt-3 text-center tracking-[0.14em]">
          RACCOURCIS : TOUCHES 1–4 — SÉLECTION D'INCIDENT · TOUS LES FLUX SONT SIMULÉS LOCALEMENT
        </p>
      </main>

      <Footer />
    </div>
  );
}
