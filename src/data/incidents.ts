export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface PlaybookSim {
  success: number; // %
  collateral: "LOW" | "MEDIUM" | "HIGH";
  interruption: "VERY LOW" | "LOW" | "MEDIUM" | "HIGH";
  reversibility: "HIGH" | "MEDIUM" | "LOW";
  effectiveness: number; // %
  impact: string;
}

export interface Playbook {
  id: string;
  name: string;
  match: number; // %
  sim: PlaybookSim;
}

export interface Incident {
  id: string;
  type: string;
  subtype: string;
  asset: string;
  start: string;
  confidenceFactors: { label: string; weight: number; value: number }[];
  evidenceFor: string[];
  evidenceAgainst: string[];
  hypotheses: { name: string; score: number }[];
  counter: { q: string; a: string }[];
  mitre: {
    tactic: string;
    tacticName: string;
    technique: string;
    techniqueName: string;
    sub: string;
    subName: string;
  };
  risk: { threat: number; assetCrit: number; exposure: number };
  assetCriteria: { label: string; value: number }[];
  playbooks: Playbook[];
  metric: { label: string; attack: [number, number]; normal: [number, number] };
  baseScore: number;
  subScores: { label: string; value: number }[];
  seedPhase: string;
  seedPipelineIndex: number;
  seedTimeline: [string, string, "sys" | "ai" | "good" | "warn" | "sim"][];
  seedApprovals?: { l1: boolean; l2: boolean };
}

export const CONFIDENCE_LABEL = (c: number): { label: string; tone: string } => {
  if (c >= 90) return { label: "VERY HIGH", tone: "ok" };
  if (c >= 70) return { label: "HIGH", tone: "ana" };
  if (c >= 40) return { label: "MEDIUM", tone: "warn" };
  return { label: "LOW", tone: "crit" };
};

export const riskClass = (score: number): Severity => {
  if (score >= 0.6) return "CRITICAL";
  if (score >= 0.38) return "HIGH";
  if (score >= 0.15) return "MEDIUM";
  if (score >= 0.06) return "LOW";
  return "INFO";
};

export const SEVERITY_COLOR: Record<Severity, string> = {
  CRITICAL: "#ff5c5c",
  HIGH: "#ff9040",
  MEDIUM: "#f2cc60",
  LOW: "#58a6ff",
  INFO: "#9aa7b8",
};

export const PIPELINE_STAGES = [
  "EVENT", "INGESTION", "NORMALISATION", "CORRELATION", "CLASSIFICATION",
  "THREAT HYPOTHESES", "COUNTER-ANALYSIS", "CONFIDENCE SCORING", "MITRE MAPPING",
  "ASSET CRITICALITY", "IMPACT ANALYSIS", "PLAYBOOK MATCHING", "CONSEQUENCE MODELING",
  "COLLATERAL RISK", "RECOMMENDATION", "HUMAN APPROVAL", "EXECUTION",
  "POST-EXEC VALIDATION", "FORENSIC SNAPSHOT", "AUDIT",
];

export const PHASES = [
  "NEW", "DETECTED", "ANALYZING", "CONFIRMED", "PLAYBOOK_SELECTED",
  "WAITING_APPROVAL", "MITIGATING", "MONITORING", "RECOVERED", "CLOSED",
] as const;

export type Phase = (typeof PHASES)[number] | "FALSE_POSITIVE";

export const PHASE_LABEL: Record<string, string> = {
  NEW: "NEW",
  DETECTED: "DETECTED",
  ANALYZING: "UNDER ANALYSIS",
  CONFIRMED: "CONFIRMED",
  PLAYBOOK_SELECTED: "PLAYBOOK SELECTED",
  WAITING_APPROVAL: "WAITING APPROVAL",
  MITIGATING: "MITIGATING",
  MONITORING: "POST-MITIGATION WATCH",
  RECOVERED: "RECOVERED",
  CLOSED: "CLOSED",
  FALSE_POSITIVE: "FALSE POSITIVE",
};

export const NEUTRALIZATION = [
  "Trafic d'attaque réduit de plus de 90 %",
  "Disponibilité du service supérieure à 99 %",
  "Latence revenue à la normale",
  "Aucun IOC critique actif",
  "Aucune récidive pendant la fenêtre d'observation",
];

export const AGENTS = [
  { name: "CIC Orchestrator", priv: "COORDINATE", tone: "ai" },
  { name: "Detection Analyst", priv: "READ ONLY", tone: "ana" },
  { name: "Threat Analyst", priv: "READ ONLY", tone: "ana" },
  { name: "Counter Analyst", priv: "READ ONLY", tone: "ai" },
  { name: "MITRE Mapper", priv: "READ ONLY", tone: "ana" },
  { name: "Risk Analyst", priv: "READ ONLY", tone: "warn" },
  { name: "Playbook Selector", priv: "RECOMMEND ONLY", tone: "ok" },
  { name: "Consequence Modeler", priv: "ESTIMATE ONLY", tone: "sim" },
  { name: "Policy Guard", priv: "ALLOW / DENY", tone: "crit" },
  { name: "Execution Engine", priv: "RESTRICTED", tone: "risk" },
  { name: "Evidence Agent", priv: "WRITE APPEND ONLY", tone: "ok" },
  { name: "Report Agent", priv: "WRITE APPEND ONLY", tone: "sim" },
];

export const FORENSIC_FILES = [
  "incident.json", "timeline.json", "indicators.json", "mitre.json",
  "decisions.json", "playbook.json", "approvals.json",
  "metrics_before.json", "metrics_after.json", "manifest.sha256",
];

const F = (label: string, weight: number, value: number) => ({ label, weight, value });

export const INCIDENTS: Incident[] = [
  {
    id: "INC-20260901-000187",
    type: "Distributed Denial of Service",
    subtype: "HTTP Layer 7 Flood",
    asset: "Public Web Portal",
    start: "01/09/2026 00:25:08",
    confidenceFactors: [
      F("Sensor confidence", 0.25, 0.98),
      F("Indicator consistency", 0.2, 0.98),
      F("Behavioral match", 0.2, 0.97),
      F("Historical similarity", 0.15, 0.96),
      F("Cross-source confirmation", 0.1, 0.99),
      F("AI consensus", 0.1, 0.96),
    ],
    evidenceFor: [
      "Augmentation brutale du taux de requêtes",
      "Répétition anormale des URI",
      "Distribution atypique des User-Agent",
      "Fréquence élevée par session",
      "Comportement synchronisé de plusieurs sources",
    ],
    evidenceAgainst: [
      "Aucune saturation réseau observée",
      "Certaines signatures ressemblent à du trafic légitime",
    ],
    hypotheses: [
      { name: "HTTP Flood L7", score: 97.4 },
      { name: "Bot scraping massif", score: 18.3 },
      { name: "Pic légitime de trafic", score: 11.1 },
      { name: "Erreur applicative interne", score: 4.8 },
    ],
    counter: [
      { q: "Existe-t-il une explication légitime ?", a: "Aucune campagne marketing ni lancement produit actif. Le CMS n'a publié aucun contenu viral dans les 6 dernières heures." },
      { q: "Les données sont-elles suffisantes ?", a: "Oui — 5 capteurs concordants (WAF, LB, APM, SIEM, CDN) sur une fenêtre de 14 minutes." },
      { q: "Les capteurs sont-ils fiables ?", a: "Aucune anomalie de collecte détectée ; horloges NTP synchronisées, taux de perte des sondes < 0,1 %." },
      { q: "Un changement applicatif peut-il expliquer le phénomène ?", a: "Dernier déploiement à J-3 sans modification des routes impactées. Aucune corrélation avec les URI visés." },
      { q: "L'incident pourrait-il provenir d'une panne interne ?", a: "Les temps de réponse backend restent nominaux côté interne ; la dégradation est proportionnelle au trafic externe uniquement." },
      { q: "Le playbook recommandé pourrait-il aggraver la situation ?", a: "PB-DDOS-01 applique un rate-limit progressif avec whitelist CDN : risque de blocage légitime estimé < 2 %. Réversible en < 60 s." },
    ],
    mitre: {
      tactic: "TA0040", tacticName: "Impact",
      technique: "T1498", techniqueName: "Network Denial of Service",
      sub: "T1498.001", subName: "Direct Network Flood",
    },
    risk: { threat: 0.92, assetCrit: 0.78, exposure: 0.95 },
    assetCriteria: [
      { label: "Importance métier", value: 88 },
      { label: "Exposition Internet", value: 97 },
      { label: "Données sensibles", value: 52 },
      { label: "Nombre d'utilisateurs", value: 91 },
      { label: "Dépendances", value: 74 },
      { label: "Impact réputationnel", value: 85 },
      { label: "Impact financier", value: 82 },
      { label: "Impact opérationnel", value: 70 },
      { label: "Impact réglementaire", value: 41 },
    ],
    playbooks: [
      { id: "PB-DDOS-01", name: "Endiguement DDoS L7", match: 96, sim: { success: 94, collateral: "LOW", interruption: "VERY LOW", reversibility: "HIGH", effectiveness: 96, impact: "Stabilisation du trafic" } },
      { id: "PB-WAF-02", name: "Durcissement WAF", match: 88, sim: { success: 90, collateral: "MEDIUM", interruption: "LOW", reversibility: "HIGH", effectiveness: 87, impact: "Filtrage signature + rate-limit" } },
      { id: "PB-BOT-07", name: "Contrôle de botnet", match: 64, sim: { success: 71, collateral: "MEDIUM", interruption: "LOW", reversibility: "MEDIUM", effectiveness: 68, impact: "Challenge JS des sessions" } },
      { id: "PB-NETWORK-04", name: "Isolation réseau", match: 42, sim: { success: 88, collateral: "HIGH", interruption: "HIGH", reversibility: "MEDIUM", effectiveness: 91, impact: "Coupure du flux entrant" } },
    ],
    metric: { label: "req/s", attack: [36000, 48000], normal: [3500, 5200] },
    baseScore: 94,
    subScores: [
      { label: "Detection", value: 96 }, { label: "Classification", value: 95 },
      { label: "Faux positifs", value: 91 }, { label: "Response", value: 94 },
      { label: "Risque collatéral", value: 97 }, { label: "Recovery", value: 92 },
      { label: "Evidence", value: 93 },
    ],
    seedPhase: "ANALYZING",
    seedPipelineIndex: 5,
    seedTimeline: [
      ["00:25:08", "Incident détecté — HTTP L7 Flood suspecté sur Public Web Portal", "sys"],
      ["00:25:12", "Analyse CIC démarrée (orchestrateur + 11 agents)", "sys"],
      ["00:25:15", "Hypothèse principale : HTTP L7 Flood — 97.4 %", "ai"],
      ["00:25:17", "Contre-hypothèse : pic légitime de trafic — 11.1 %", "ai"],
    ],
  },
  {
    id: "INC-20260901-000172",
    type: "Attaque sur les identités",
    subtype: "Credential Stuffing",
    asset: "Customer Identity Provider",
    start: "01/09/2026 00:14:52",
    confidenceFactors: [
      F("Sensor confidence", 0.25, 0.88),
      F("Indicator consistency", 0.2, 0.85),
      F("Behavioral match", 0.2, 0.86),
      F("Historical similarity", 0.15, 0.78),
      F("Cross-source confirmation", 0.1, 0.82),
      F("AI consensus", 0.1, 0.81),
    ],
    evidenceFor: [
      "Volume de connexions échouées ×22 sur /login",
      "Paires identifiant/mot de passe uniques à fort taux d'échec",
      "Rotation rapide d'adresses IP résidentielles (proxy mesh)",
      "User-Agents légitimes mais empreintes TLS homogènes",
      "Corrélation CTI : combo-lists publiées il y a 72 h",
    ],
    evidenceAgainst: [
      "Quelques utilisateurs légitimes en erreur après migration SSO",
      "Aucun compte privilégié ciblé à ce stade",
    ],
    hypotheses: [
      { name: "Credential stuffing", score: 84.2 },
      { name: "Brute force distribué", score: 32.6 },
      { name: "Fuite de tokens / API keys", score: 12.4 },
      { name: "Test d'intrusion interne", score: 6.9 },
    ],
    counter: [
      { q: "Existe-t-il une explication légitime ?", a: "La migration SSO de J-2 explique une partie des échecs, mais pas le ratio 96 % d'échec sur des comptes inactifs depuis > 90 jours." },
      { q: "Les données sont-elles suffisantes ?", a: "IdP + WAF + EDR postes internes convergent. Fenêtre d'observation : 9 minutes, 18 400 tentatives." },
      { q: "Un changement applicatif peut-il expliquer le phénomène ?", a: "Oui, partiellement (SSO). L'écart résuel reste 14× au-dessus du bruit de migration." },
      { q: "Le playbook recommandé pourrait-il aggraver la situation ?", a: "PB-AUTH-03 active MFA forcé + throttling : friction temporaire pour 3–5 % d'utilisateurs légitimes, réversible par exception IP/segment." },
    ],
    mitre: {
      tactic: "TA0006", tacticName: "Credential Access",
      technique: "T1110", techniqueName: "Brute Force",
      sub: "T1110.004", subName: "Credential Stuffing",
    },
    risk: { threat: 0.8, assetCrit: 0.86, exposure: 0.72 },
    assetCriteria: [
      { label: "Importance métier", value: 93 },
      { label: "Exposition Internet", value: 88 },
      { label: "Données sensibles", value: 90 },
      { label: "Nombre d'utilisateurs", value: 96 },
      { label: "Dépendances", value: 89 },
      { label: "Impact réputationnel", value: 84 },
      { label: "Impact financier", value: 78 },
      { label: "Impact opérationnel", value: 66 },
      { label: "Impact réglementaire", value: 88 },
    ],
    playbooks: [
      { id: "PB-AUTH-03", name: "Contre-mesures authentification", match: 91, sim: { success: 89, collateral: "MEDIUM", interruption: "LOW", reversibility: "HIGH", effectiveness: 92, impact: "MFA forcé + throttling" } },
      { id: "PB-WAF-02", name: "Durcissement WAF", match: 74, sim: { success: 82, collateral: "MEDIUM", interruption: "LOW", reversibility: "HIGH", effectiveness: 78, impact: "Bloquage empreintes TLS" } },
      { id: "PB-IAM-05", name: "Verrouillage IAM", match: 69, sim: { success: 85, collateral: "MEDIUM", interruption: "MEDIUM", reversibility: "MEDIUM", effectiveness: 84, impact: "Suspension sessions à risque" } },
      { id: "PB-NETWORK-04", name: "Isolation réseau", match: 31, sim: { success: 88, collateral: "HIGH", interruption: "HIGH", reversibility: "MEDIUM", effectiveness: 90, impact: "Coupure du flux entrant" } },
    ],
    metric: { label: "tentatives/min", attack: [8200, 11500], normal: [400, 900] },
    baseScore: 88,
    subScores: [
      { label: "Detection", value: 90 }, { label: "Classification", value: 89 },
      { label: "Faux positifs", value: 84 }, { label: "Response", value: 88 },
      { label: "Risque collatéral", value: 90 }, { label: "Recovery", value: 87 },
      { label: "Evidence", value: 91 },
    ],
    seedPhase: "WAITING_APPROVAL",
    seedPipelineIndex: 14,
    seedTimeline: [
      ["00:14:52", "Incident détecté — Credential Stuffing suspecté sur IdP", "sys"],
      ["00:14:55", "Analyse CIC démarrée", "sys"],
      ["00:14:59", "Hypothèse principale : Credential Stuffing — 84.2 %", "ai"],
      ["00:15:02", "MITRE mapping : TA0006 / T1110.004", "ai"],
      ["00:15:04", "PB-AUTH-03 sélectionné (match 91 %)", "sim"],
      ["00:15:05", "Modélisation pré-exécution : efficacité 92 % — risque collatéral MEDIUM", "sim"],
      ["00:15:06", "Human Approval Gate armé — double validation requise", "warn"],
    ],
    seedApprovals: { l1: false, l2: false },
  },
  {
    id: "INC-20260901-000166",
    type: "Activité furtive interne",
    subtype: "C2 Beaconing suspecté",
    asset: "Internal Build Server",
    start: "01/09/2026 00:41:10",
    confidenceFactors: [
      F("Sensor confidence", 0.25, 0.74),
      F("Indicator consistency", 0.2, 0.72),
      F("Behavioral match", 0.2, 0.75),
      F("Historical similarity", 0.15, 0.62),
      F("Cross-source confirmation", 0.1, 0.68),
      F("AI consensus", 0.1, 0.78),
    ],
    evidenceFor: [
      "Requêtes DNS sortantes périodiques (jitter < 4 %) vers un domaine DGA",
      "Domaine créé il y a 11 jours, réputation inconnue",
      "Processus parent inhabituel (msbuild.exe → powershell)",
      "Volume sortant faible mais constant, 24 h/24",
    ],
    evidenceAgainst: [
      "Le serveur exécute des jobs CI légitimes vers des registres externes",
      "Aucun IOC connu associé au domaine dans les feeds CTI",
      "Certificat TLS du domaine valide et correctement chaîné",
    ],
    hypotheses: [
      { name: "C2 beaconing", score: 71.8 },
      { name: "Mouvement latéral", score: 55.3 },
      { name: "Tâche planifiée légitime", score: 24.7 },
      { name: "Agent de sauvegarde mal configuré", score: 19.2 },
    ],
    counter: [
      { q: "Existe-t-il une explication légitime ?", a: "Les jobs CI produisent du trafic périodique, mais jamais vers des domaines DGA avec un jitter aussi faible. À vérifier auprès de l'équipe DevOps." },
      { q: "Les capteurs sont-ils fiables ?", a: "L'EDR rapporte la chaîne de processus complète ; le capteur DNS interne confirme la périodicité. Confiance capteurs : 0.74." },
      { q: "Les données sont-elles suffisantes ?", a: "Non — 2 h d'observation seulement. Une fenêtre de 12 h renforcerait la distinction beaconing / tâche planifiée." },
      { q: "Le playbook recommandé pourrait-il aggraver la situation ?", a: "PB-EDR-02 isole l'hôte : interruption du pipeline CI (impact interne uniquement). Réversible en 5 min. Recommandé seulement si la confiance dépasse 80 %." },
    ],
    mitre: {
      tactic: "TA0011", tacticName: "Command and Control",
      technique: "T1071", techniqueName: "Application Layer Protocol",
      sub: "T1071.001", subName: "Web Protocols",
    },
    risk: { threat: 0.85, assetCrit: 0.72, exposure: 0.6 },
    assetCriteria: [
      { label: "Importance métier", value: 76 },
      { label: "Exposition Internet", value: 22 },
      { label: "Données sensibles", value: 81 },
      { label: "Nombre d'utilisateurs", value: 38 },
      { label: "Dépendances", value: 84 },
      { label: "Impact réputationnel", value: 57 },
      { label: "Impact financier", value: 63 },
      { label: "Impact opérationnel", value: 79 },
      { label: "Impact réglementaire", value: 49 },
    ],
    playbooks: [
      { id: "PB-EDR-02", name: "Isolation EDR d'hôte", match: 82, sim: { success: 91, collateral: "LOW", interruption: "MEDIUM", reversibility: "HIGH", effectiveness: 93, impact: "Isolement de l'hôte CI" } },
      { id: "PB-NETWORK-04", name: "Isolation réseau", match: 77, sim: { success: 89, collateral: "MEDIUM", interruption: "MEDIUM", reversibility: "HIGH", effectiveness: 88, impact: "Segmentation VLAN build" } },
      { id: "PB-DNS-01", name: "Filtrage DNS", match: 58, sim: { success: 84, collateral: "LOW", interruption: "VERY LOW", reversibility: "HIGH", effectiveness: 79, impact: "Sinkhole du domaine DGA" } },
    ],
    metric: { label: "beacons/min", attack: [90, 160], normal: [2, 9] },
    baseScore: 86,
    subScores: [
      { label: "Detection", value: 84 }, { label: "Classification", value: 82 },
      { label: "Faux positifs", value: 88 }, { label: "Response", value: 86 },
      { label: "Risque collatéral", value: 92 }, { label: "Recovery", value: 85 },
      { label: "Evidence", value: 89 },
    ],
    seedPhase: "ANALYZING",
    seedPipelineIndex: 2,
    seedTimeline: [
      ["00:41:10", "Incident détecté — beaconing DNS suspecté sur BUILD-SRV-04", "sys"],
      ["00:41:13", "Analyse CIC démarrée — corrélation EDR + DNS en cours", "sys"],
    ],
  },
  {
    id: "INC-20260901-000154",
    type: "Transfert sortant anormal",
    subtype: "Exfiltration potentielle",
    asset: "R&D File Share",
    start: "01/09/2026 01:02:47",
    confidenceFactors: [
      F("Sensor confidence", 0.25, 0.66),
      F("Indicator consistency", 0.2, 0.62),
      F("Behavioral match", 0.2, 0.68),
      F("Historical similarity", 0.15, 0.55),
      F("Cross-source confirmation", 0.1, 0.6),
      F("AI consensus", 0.1, 0.675),
    ],
    evidenceFor: [
      "Volume sortant 12× la médiane nocturne vers un stockage cloud personnel",
      "Fichiers archivés et chiffrés avant transfert",
      "Session initiée depuis un compte service hors horaires ouvrés",
    ],
    evidenceAgainst: [
      "Un job de sauvegarde cloud a été planifié la veille (ticket ITSM #48812)",
      "Le compte service possède un mandat légitime de réplication",
      "Aucune lecture anormale de fichiers sensibles détectée en amont",
    ],
    hypotheses: [
      { name: "Exfiltration de données", score: 63.5 },
      { name: "Sauvegarde cloud planifiée", score: 28.8 },
      { name: "Réplication légitime hors spec", score: 22.1 },
      { name: "Mise à jour malware", score: 9.4 },
    ],
    counter: [
      { q: "Existe-t-il une explication légitime ?", a: "Oui — le ticket ITSM #48812 documente une sauvegarde. Cependant la destination (cloud personnel) ne figure pas dans la procédure validée." },
      { q: "Les données sont-elles suffisantes ?", a: "Partiellement. Le DLP n'a pas inspecté le contenu (chiffrement préalable). Lever l'ambiguïté nécessite un échange avec le propriétaire du compte." },
      { q: "Y a-t-il une anomalie de collecte ?", a: "Non, le proxy et le CASB rapportent des vues cohérentes du même flux." },
      { q: "Le playbook recommandé pourrait-il aggraver la situation ?", a: "PB-DLP-02 suspend le transfert : si la sauvegarde est légitime, impact mineur (reprise du job). Réversible immédiatement." },
    ],
    mitre: {
      tactic: "TA0010", tacticName: "Exfiltration",
      technique: "T1048", techniqueName: "Exfiltration Over Alternative Protocol",
      sub: "T1048.002", subName: "Exfiltration Over Asymmetric Non-C2 Protocol",
    },
    risk: { threat: 0.6, assetCrit: 0.71, exposure: 0.42 },
    assetCriteria: [
      { label: "Importance métier", value: 74 },
      { label: "Exposition Internet", value: 18 },
      { label: "Données sensibles", value: 92 },
      { label: "Nombre d'utilisateurs", value: 41 },
      { label: "Dépendances", value: 58 },
      { label: "Impact réputationnel", value: 69 },
      { label: "Impact financier", value: 72 },
      { label: "Impact opérationnel", value: 47 },
      { label: "Impact réglementaire", value: 83 },
    ],
    playbooks: [
      { id: "PB-DLP-02", name: "Blocage DLP", match: 71, sim: { success: 86, collateral: "LOW", interruption: "VERY LOW", reversibility: "HIGH", effectiveness: 83, impact: "Suspension du transfert sortant" } },
      { id: "PB-NETWORK-04", name: "Isolation réseau", match: 66, sim: { success: 89, collateral: "MEDIUM", interruption: "MEDIUM", reversibility: "HIGH", effectiveness: 87, impact: "Coupure du segment R&D" } },
      { id: "PB-CLOUD-03", name: "Confinement cloud", match: 49, sim: { success: 80, collateral: "MEDIUM", interruption: "LOW", reversibility: "MEDIUM", effectiveness: 74, impact: "Révocation tokens + gel bucket" } },
    ],
    metric: { label: "Mo/s sortants", attack: [210, 340], normal: [8, 22] },
    baseScore: 82,
    subScores: [
      { label: "Detection", value: 81 }, { label: "Classification", value: 78 },
      { label: "Faux positifs", value: 86 }, { label: "Response", value: 82 },
      { label: "Risque collatéral", value: 88 }, { label: "Recovery", value: 84 },
      { label: "Evidence", value: 85 },
    ],
    seedPhase: "DETECTED",
    seedPipelineIndex: -1,
    seedTimeline: [
      ["01:02:47", "Incident détecté — volume sortant anormal depuis R&D File Share", "sys"],
    ],
  },
];
