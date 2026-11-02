import { useState } from "react";
import { IcRadar, IcTarget, SectionTitle, TONE, Chip, Led } from "./ui";

interface URLAnalysis {
  url: string;
  domain: string;
  ip: string;
  country: string;
  asn: string;
  reputation: number;
  categories: string[];
  blacklist: string[];
  ssl: boolean;
  created: string;
  threat: "CLEAN" | "SUSPICIOUS" | "MALICIOUS";
}

function analyzeURL(url: string): URLAnalysis {
  const domain = url.replace(/^https?:\/\//, "").split("/")[0];
  const hash = domain.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  const rep = Math.abs(hash) % 100;
  
  const categories = ["Technology", "Business", "News"];
  const blacklist: string[] = [];
  
  let threat: "CLEAN" | "SUSPICIOUS" | "MALICIOUS" = "CLEAN";
  if (rep < 30) {
    threat = "MALICIOUS";
    blacklist.push("PhishingDB", "MalwareDomainList", "SpamHaus");
  } else if (rep < 60) {
    threat = "SUSPICIOUS";
    blacklist.push("SpamHaus");
  }

  return {
    url,
    domain,
    ip: `192.${Math.abs(hash) % 255}.${Math.abs(hash * 2) % 255}.${Math.abs(hash * 3) % 255}`,
    country: ["US", "DE", "FR", "RU", "CN"][Math.abs(hash) % 5],
    asn: `AS${10000 + Math.abs(hash) % 50000}`,
    reputation: rep,
    categories,
    blacklist,
    ssl: Math.random() > 0.3,
    created: `${2020 + Math.abs(hash) % 5}-${String((Math.abs(hash) % 12) + 1).padStart(2, "0")}-${String((Math.abs(hash) % 28) + 1).padStart(2, "0")}`,
    threat,
  };
}

export function URLAnalysisPanel() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<URLAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!url.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setResult(analyzeURL(url));
      setAnalyzing(false);
    }, 800);
  };

  const threatColor = result?.threat === "MALICIOUS" ? TONE.crit : result?.threat === "SUSPICIOUS" ? TONE.warn : TONE.ok;

  return (
    <div className="panel panel-ticks p-3.5" style={{ ["--tick" as string]: TONE.ana }}>
      <div className="flex items-center justify-between">
        <SectionTitle tone="ana">URL Analysis</SectionTitle>
        <div className="flex items-center gap-1.5">
          <Led tone="ana" />
          <span className="mono text-[8px] tracking-[0.14em] text-faint">ACTIVE</span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
          placeholder="https://example.com"
          className="flex-1 bg-bg2/60 border border-line/60 px-2.5 py-1.5 text-[11px] text-ink placeholder:text-faint focus:outline-none focus:border-ana/60"
          style={{ borderRadius: 2 }}
        />
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !url.trim()}
          className="btn btn-ai flex items-center gap-1.5 px-3"
        >
          <IcRadar size={12} />
          {analyzing ? "…" : "Analyze"}
        </button>
      </div>

      {result && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono text-[9px] text-faint tracking-[0.14em]">RÉPUTATION</span>
            <Chip label={result.threat} tone={result.threat === "MALICIOUS" ? "crit" : result.threat === "SUSPICIOUS" ? "warn" : "ok"} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-faint">Domaine</span>
              <div className="text-ink mono">{result.domain}</div>
            </div>
            <div>
              <span className="text-faint">IP</span>
              <div className="text-ink mono">{result.ip}</div>
            </div>
            <div>
              <span className="text-faint">Pays</span>
              <div className="text-ink">{result.country}</div>
            </div>
            <div>
              <span className="text-faint">ASN</span>
              <div className="text-ink mono">{result.asn}</div>
            </div>
            <div>
              <span className="text-faint">SSL</span>
              <div className={result.ssl ? "text-ok" : "text-crit"}>{result.ssl ? "✓ Valide" : "✗ Invalide"}</div>
            </div>
            <div>
              <span className="text-faint">Créé</span>
              <div className="text-ink mono">{result.created}</div>
            </div>
          </div>

          <div>
            <span className="text-faint text-[9px]">Réputation</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-bg2 rounded" style={{ borderRadius: 1 }}>
                <div
                  className="h-full rounded transition-all"
                  style={{ width: `${result.reputation}%`, background: threatColor, borderRadius: 1 }}
                />
              </div>
              <span className="mono text-[10px] font-bold" style={{ color: threatColor }}>{result.reputation}/100</span>
            </div>
          </div>

          {result.blacklist.length > 0 && (
            <div>
              <span className="text-faint text-[9px]">Listes noires ({result.blacklist.length})</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {result.blacklist.map((b, i) => (
                  <span key={i} className="mono text-[8px] px-1.5 py-0.5 bg-crit/20 text-crit border border-crit/40" style={{ borderRadius: 2 }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-faint text-[9px]">Catégories</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {result.categories.map((c, i) => (
                <span key={i} className="mono text-[8px] px-1.5 py-0.5 bg-ana/10 text-ana border border-ana/30" style={{ borderRadius: 2 }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
