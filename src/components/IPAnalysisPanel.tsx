import { useState } from "react";
import { IcRadar, IcTarget, SectionTitle, TONE, Chip, Led } from "./ui";

interface IPAnalysis {
  ip: string;
  country: string;
  city: string;
  isp: string;
  asn: string;
  org: string;
  reputation: number;
  threat: "CLEAN" | "SUSPICIOUS" | "MALICIOUS";
  openPorts: number[];
  hostname: string;
  abuseScore: number;
  lastSeen: string;
  reports: number;
}

function analyzeIP(ip: string): IPAnalysis {
  const hash = ip.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  const rep = Math.abs(hash) % 100;
  const abuse = Math.abs(hash * 2) % 100;
  
  let threat: "CLEAN" | "SUSPICIOUS" | "MALICIOUS" = "CLEAN";
  if (rep < 30 || abuse > 70) threat = "MALICIOUS";
  else if (rep < 60 || abuse > 40) threat = "SUSPICIOUS";

  const ports = [22, 80, 443, 3389, 8080].filter(() => Math.random() > 0.5);
  if (threat === "MALICIOUS") ports.push(4444, 8888);

  return {
    ip,
    country: ["US", "DE", "FR", "RU", "CN", "BR", "IN"][Math.abs(hash) % 7],
    city: ["New York", "Berlin", "Paris", "Moscow", "Beijing", "São Paulo", "Mumbai"][Math.abs(hash) % 7],
    isp: ["AWS", "Google Cloud", "OVH", "Hetzner", "DigitalOcean"][Math.abs(hash) % 5],
    asn: `AS${10000 + Math.abs(hash) % 50000}`,
    org: ["Amazon", "Google", "OVH SAS", "Hetzner", "DigitalOcean"][Math.abs(hash) % 5],
    reputation: rep,
    threat,
    openPorts: ports,
    hostname: `host-${Math.abs(hash) % 1000}.example.com`,
    abuseScore: abuse,
    lastSeen: `${Math.abs(hash) % 24}h ago`,
    reports: Math.abs(hash) % 50,
  };
}

export function IPAnalysisPanel() {
  const [ip, setIp] = useState("");
  const [result, setResult] = useState<IPAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!ip.trim()) return;
    setAnalyzing(true);
    setTimeout(() => {
      setResult(analyzeIP(ip));
      setAnalyzing(false);
    }, 800);
  };

  const threatColor = result?.threat === "MALICIOUS" ? TONE.crit : result?.threat === "SUSPICIOUS" ? TONE.warn : TONE.ok;

  return (
    <div className="panel panel-ticks p-3.5" style={{ ["--tick" as string]: TONE.risk }}>
      <div className="flex items-center justify-between">
        <SectionTitle tone="risk">IP Analysis</SectionTitle>
        <div className="flex items-center gap-1.5">
          <Led tone="risk" />
          <span className="mono text-[8px] tracking-[0.14em] text-faint">ACTIVE</span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
          placeholder="192.168.1.1"
          className="flex-1 bg-bg2/60 border border-line/60 px-2.5 py-1.5 text-[11px] text-ink placeholder:text-faint focus:outline-none focus:border-risk/60"
          style={{ borderRadius: 2 }}
        />
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !ip.trim()}
          className="btn btn-crit flex items-center gap-1.5 px-3"
        >
          <IcRadar size={12} />
          {analyzing ? "…" : "Analyze"}
        </button>
      </div>

      {result && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono text-[9px] text-faint tracking-[0.14em]">MENACE</span>
            <Chip label={result.threat} tone={result.threat === "MALICIOUS" ? "crit" : result.threat === "SUSPICIOUS" ? "warn" : "ok"} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <span className="text-faint">Pays</span>
              <div className="text-ink">{result.country} · {result.city}</div>
            </div>
            <div>
              <span className="text-faint">ISP</span>
              <div className="text-ink">{result.isp}</div>
            </div>
            <div>
              <span className="text-faint">ASN</span>
              <div className="text-ink mono">{result.asn}</div>
            </div>
            <div>
              <span className="text-faint">Organisation</span>
              <div className="text-ink">{result.org}</div>
            </div>
            <div>
              <span className="text-faint">Hostname</span>
              <div className="text-ink mono text-[9px]">{result.hostname}</div>
            </div>
            <div>
              <span className="text-faint">Dernière activité</span>
              <div className="text-ink">{result.lastSeen}</div>
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

          <div>
            <span className="text-faint text-[9px]">Score d'abus</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-bg2 rounded" style={{ borderRadius: 1 }}>
                <div
                  className="h-full rounded transition-all"
                  style={{ width: `${result.abuseScore}%`, background: result.abuseScore > 70 ? TONE.crit : result.abuseScore > 40 ? TONE.warn : TONE.ok, borderRadius: 1 }}
                />
              </div>
              <span className="mono text-[10px] font-bold" style={{ color: result.abuseScore > 70 ? TONE.crit : result.abuseScore > 40 ? TONE.warn : TONE.ok }}>{result.abuseScore}/100</span>
            </div>
          </div>

          <div>
            <span className="text-faint text-[9px]">Ports ouverts ({result.openPorts.length})</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {result.openPorts.map((p, i) => (
                <span key={i} className="mono text-[9px] px-1.5 py-0.5 bg-risk/10 text-risk border border-risk/30" style={{ borderRadius: 2 }}>
                  {p}
                </span>
              ))}
            </div>
          </div>

          {result.reports > 0 && (
            <div className="flex items-center gap-2 text-[10px]">
              <IcTarget size={12} color={TONE.crit} />
              <span className="text-crit font-semibold">{result.reports} signalement{result.reports > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
