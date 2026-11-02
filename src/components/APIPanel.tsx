import { useState } from "react";
import { SectionTitle, TONE, Chip, IcArrow } from "./ui";
import { API_DOCS } from "../api";

export function APIPanel() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="panel panel-ticks p-3.5" style={{ ["--tick" as string]: TONE.ai }}>
      <div className="flex items-center justify-between">
        <SectionTitle tone="ai">REST API</SectionTitle>
        <Chip label="v1.0" tone="ai" />
      </div>

      <div className="mt-3 space-y-1.5">
        {API_DOCS.endpoints.slice(0, expanded ? undefined : 3).map((ep, i) => (
          <div
            key={i}
            className="border border-line/40 bg-bg2/40 p-2 hover:bg-bg2/60 transition-colors cursor-pointer"
            style={{ borderRadius: 2 }}
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-2">
              <span
                className="mono text-[8px] font-bold px-1.5 py-0.5"
                style={{
                  borderRadius: 2,
                  background: ep.method === "GET" ? `${TONE.ok}20` : `${TONE.risk}20`,
                  color: ep.method === "GET" ? TONE.ok : TONE.risk,
                  border: `1px solid ${ep.method === "GET" ? TONE.ok : TONE.risk}40`,
                }}
              >
                {ep.method}
              </span>
              <span className="mono text-[9px] text-ink flex-1">{ep.path}</span>
            </div>
            <div className="text-[9px] text-faint mt-1">{ep.description}</div>
          </div>
        ))}
      </div>

      {!expanded && API_DOCS.endpoints.length > 3 && (
        <button
          onClick={() => setExpanded(true)}
          className="mt-2 w-full flex items-center justify-center gap-1.5 text-[9px] text-ai hover:text-ai/80 transition-colors"
        >
          <span>Voir tous les endpoints ({API_DOCS.endpoints.length})</span>
          <IcArrow size={10} />
        </button>
      )}

      {expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="mt-2 w-full flex items-center justify-center gap-1.5 text-[9px] text-faint hover:text-ink transition-colors"
        >
          <span>Réduire</span>
        </button>
      )}

      <div className="mt-3 pt-2 border-t border-line/60 space-y-1">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-faint">Authentification</span>
          <span className="mono text-ink">Bearer token</span>
        </div>
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-faint">Rate limit</span>
          <span className="mono text-ink">100 req/min</span>
        </div>
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-faint">Mode</span>
          <span className="mono text-risk font-semibold">PRODUCTION</span>
        </div>
      </div>

      <p className="mt-2.5 text-[8px] text-faint leading-relaxed">
        API REST complète pour intégration avec SIEM, SOAR, et outils de sécurité. Documentation complète disponible sur /api/docs
      </p>
    </div>
  );
}
