import { useState } from "react";
import { IcRadar, IcTarget, SectionTitle, TONE, Chip, Led } from "./ui";

interface SearchResult {
  url: string;
  title: string;
  engine: string;
  timestamp: string;
  relevance: number;
}

const ENGINES = ["darksearchio", "onionland", "notevil", "darksearchenginer", "ahmia"];

// Simulation de résultats OSINT darknet
function generateResults(query: string): SearchResult[] {
  const baseResults: SearchResult[] = [
    {
      url: "http://breachdata7x3kzq.onion/search",
      title: "Database leak search - credentials dump",
      engine: "darksearchio",
      timestamp: "2026-09-01 00:12:34",
      relevance: 94,
    },
    {
      url: "http://combolist4j8x2m.onion/db/" + query.toLowerCase().replace(/\s+/g, "_"),
      title: "Combo list database - recent dumps",
      engine: "onionland",
      timestamp: "2026-09-01 00:11:58",
      relevance: 87,
    },
    {
      url: "http://exploitdb9x7k2p.onion/vuln/" + query.toLowerCase().slice(0, 8),
      title: "Exploit database - CVE references",
      engine: "notevil",
      timestamp: "2026-09-01 00:10:22",
      relevance: 76,
    },
    {
      url: "http://ransomware6x5k8m.onion/leak/" + query.toLowerCase().replace(/\s+/g, "-"),
      title: "Ransomware leak site - victim data",
      engine: "darksearchenginer",
      timestamp: "2026-09-01 00:09:45",
      relevance: 82,
    },
    {
      url: "http://marketplace3k8x2p.onion/listing/" + query.toLowerCase().slice(0, 6),
      title: "Marketplace listing - stolen data",
      engine: "ahmia",
      timestamp: "2026-09-01 00:08:17",
      relevance: 69,
    },
  ];

  // Filtrer selon la requête
  return baseResults.filter((r) => r.relevance > 60).slice(0, 4);
}

export function OnionSearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setSearched(false);

    // Simulation de latence réseau Tor
    setTimeout(() => {
      const res = generateResults(query);
      setResults(res);
      setSearching(false);
      setSearched(true);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="panel panel-ticks p-3.5" style={{ ["--tick" as string]: TONE.risk }}>
      <div className="flex items-center justify-between">
        <SectionTitle tone="risk">OnionSearch · Darknet Intel</SectionTitle>
        <div className="flex items-center gap-1.5">
          <Led tone="risk" fast />
          <span className="mono text-[8px] tracking-[0.14em] text-faint">TOR PROXY</span>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Recherche OSINT (domaine, hash, mot-clé)…"
          className="flex-1 bg-bg2/60 border border-line/60 px-2.5 py-1.5 text-[11px] text-ink placeholder:text-faint focus:outline-none focus:border-risk/60"
          style={{ borderRadius: 2 }}
        />
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="btn btn-crit flex items-center gap-1.5 px-3"
        >
          <IcRadar size={12} />
          {searching ? "…" : "Search"}
        </button>
      </div>

      {searching && (
        <div className="mt-3 text-center py-4">
          <div className="inline-block animate-spin" style={{ width: 20, height: 20, border: `2px solid ${TONE.risk}33`, borderTop: `2px solid ${TONE.risk}`, borderRadius: "50%" }} />
          <div className="mono text-[9px] text-faint mt-2 tracking-[0.14em]">REQUÊTE TOR EN COURS…</div>
        </div>
      )}

      {searched && !searching && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="mono text-[9px] text-faint tracking-[0.14em]">
              {results.length} RÉSULTAT{results.length > 1 ? "S" : ""} · {ENGINES.slice(0, 3).join(", ")}
            </span>
            <Chip label="OSINT" tone="risk" />
          </div>

          {results.length === 0 ? (
            <div className="text-center py-4">
              <IcTarget size={20} color={TONE.faint} />
              <div className="text-[10px] text-faint mt-2">Aucun résultat pertinent</div>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto scroll-thin">
              {results.map((r, i) => (
                <div
                  key={i}
                  className="border border-line/40 bg-bg2/40 p-2 hover:bg-bg2/60 transition-colors cursor-pointer"
                  style={{ borderRadius: 2 }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="mono text-[9px] text-risk truncate">{r.url}</div>
                      <div className="text-[10.5px] text-dim mt-0.5 truncate">{r.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="mono text-[8px] text-faint">{r.engine}</span>
                        <span className="mono text-[8px] text-faint">·</span>
                        <span className="mono text-[8px] text-faint">{r.timestamp}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="disp text-sm font-bold tick-num" style={{ color: r.relevance >= 80 ? TONE.crit : r.relevance >= 70 ? TONE.risk : TONE.warn }}>
                        {r.relevance}
                      </div>
                      <div className="mono text-[7px] text-faint">RELEVANCE</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="border-t border-line/60 pt-2 mt-2">
              <button className="btn btn-ai w-full flex items-center justify-center gap-2">
                <IcTarget size={11} />
                <span className="text-[9px]">CORRÉLER AVEC INCIDENTS ACTIFS</span>
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-2.5 pt-2 border-t border-line/60">
        <p className="text-[9px] text-faint leading-relaxed">
          Source OSINT darknet · proxy Tor localhost:9050 · moteurs : {ENGINES.join(", ")}
        </p>
        <p className="text-[8px] text-faint mt-1">
          Basé sur <a href="https://github.com/megadose/OnionSearch" target="_blank" rel="noopener noreferrer" className="text-risk hover:underline">megadose/OnionSearch</a> · usage autorisé uniquement pour renseignement défensif
        </p>
      </div>
    </div>
  );
}
