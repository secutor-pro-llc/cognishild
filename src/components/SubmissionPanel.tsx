import { useState } from "react";
import { IcFile, SectionTitle, TONE, Chip, Led, IcCheck } from "./ui";

interface Submission {
  id: string;
  type: "URL" | "IP" | "HASH" | "DOMAIN" | "TEXT";
  value: string;
  timestamp: string;
  status: "PENDING" | "ANALYZED" | "CORRELATED";
}

export function SubmissionPanel() {
  const [value, setValue] = useState("");
  const [type, setType] = useState<"URL" | "IP" | "HASH" | "DOMAIN" | "TEXT">("URL");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const detectType = (val: string): "URL" | "IP" | "HASH" | "DOMAIN" | "TEXT" => {
    if (/^https?:\/\//.test(val)) return "URL";
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(val)) return "IP";
    if (/^[a-fA-F0-9]{32,64}$/.test(val)) return "HASH";
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) return "DOMAIN";
    return "TEXT";
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    setSubmitting(true);
    
    const detectedType = detectType(value);
    setType(detectedType);

    setTimeout(() => {
      const newSubmission: Submission = {
        id: `SUB-${Date.now().toString(36).toUpperCase()}`,
        type: detectedType,
        value: value.trim(),
        timestamp: new Date().toISOString(),
        status: "PENDING",
      };
      
      setSubmissions(prev => [newSubmission, ...prev].slice(0, 5));
      setValue("");
      setSubmitting(false);

      // Simulate processing
      setTimeout(() => {
        setSubmissions(prev => prev.map(s => 
          s.id === newSubmission.id ? { ...s, status: "ANALYZED" } : s
        ));
      }, 1500);

      setTimeout(() => {
        setSubmissions(prev => prev.map(s => 
          s.id === newSubmission.id ? { ...s, status: "CORRELATED" } : s
        ));
      }, 3000);
    }, 500);
  };

  const typeColors = {
    URL: TONE.ana,
    IP: TONE.risk,
    HASH: TONE.ai,
    DOMAIN: TONE.warn,
    TEXT: TONE.sim,
  };

  const statusColors = {
    PENDING: TONE.warn,
    ANALYZED: TONE.ana,
    CORRELATED: TONE.ok,
  };

  return (
    <div className="panel panel-ticks p-3.5" style={{ ["--tick" as string]: TONE.ok }}>
      <div className="flex items-center justify-between">
        <SectionTitle tone="ok">Submission & Deposit</SectionTitle>
        <div className="flex items-center gap-1.5">
          <Led tone="ok" />
          <span className="mono text-[8px] tracking-[0.14em] text-faint">ACTIVE</span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <select
          value={type}
          onChange={(e) => setType(e.target.value as any)}
          className="bg-bg2/60 border border-line/60 px-2 py-1.5 text-[10px] text-ink focus:outline-none focus:border-ok/60"
          style={{ borderRadius: 2 }}
        >
          <option value="URL">URL</option>
          <option value="IP">IP</option>
          <option value="HASH">HASH</option>
          <option value="DOMAIN">DOMAIN</option>
          <option value="TEXT">TEXT</option>
        </select>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Soumettre un IOC…"
          className="flex-1 bg-bg2/60 border border-line/60 px-2.5 py-1.5 text-[11px] text-ink placeholder:text-faint focus:outline-none focus:border-ok/60"
          style={{ borderRadius: 2 }}
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !value.trim()}
          className="btn btn-ok flex items-center gap-1.5 px-3"
        >
          <IcFile size={12} />
          {submitting ? "…" : "Submit"}
        </button>
      </div>

      {submissions.length > 0 && (
        <div className="mt-3 space-y-1.5 max-h-[240px] overflow-y-auto scroll-thin">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="border border-line/40 bg-bg2/40 p-2"
              style={{ borderRadius: 2 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="mono text-[8px] text-faint">{sub.id}</span>
                    <Chip label={sub.type} tone={typeColors[sub.type] === TONE.ana ? "ana" : typeColors[sub.type] === TONE.risk ? "risk" : typeColors[sub.type] === TONE.ai ? "ai" : typeColors[sub.type] === TONE.warn ? "warn" : "sim"} />
                    <Chip label={sub.status} tone={statusColors[sub.status] === TONE.warn ? "warn" : statusColors[sub.status] === TONE.ana ? "ana" : "ok"} />
                  </div>
                  <div className="mono text-[10px] text-ink truncate">{sub.value}</div>
                  <div className="mono text-[8px] text-faint mt-0.5">
                    {new Date(sub.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                {sub.status === "CORRELATED" && (
                  <IcCheck size={14} color={TONE.ok} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2.5 text-[9px] text-faint leading-relaxed">
        Soumettez des IOC (URL, IP, hash, domaine, texte) pour analyse et corrélation avec les incidents actifs
      </p>
    </div>
  );
}
