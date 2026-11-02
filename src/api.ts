import { INCIDENTS, type Incident } from "./data/incidents";

// API REST simulée pour COGNISHIELD CIC
// En production, ces endpoints seraient servis par un backend réel

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface IncidentSummary {
  id: string;
  type: string;
  subtype: string;
  severity: string;
  confidence: number;
  status: string;
  asset: string;
  start: string;
}

export interface AnalysisResult {
  type: "URL" | "IP" | "HASH" | "DOMAIN";
  value: string;
  reputation: number;
  threat: "CLEAN" | "SUSPICIOUS" | "MALICIOUS";
  details: Record<string, any>;
}

// GET /api/v1/incidents
export function getIncidents(): APIResponse<IncidentSummary[]> {
  const summaries = INCIDENTS.map((inc) => ({
    id: inc.id,
    type: inc.type,
    subtype: inc.subtype,
    severity: calculateSeverity(inc),
    confidence: calculateConfidence(inc),
    status: "ACTIVE",
    asset: inc.asset,
    start: inc.start,
  }));

  return {
    success: true,
    data: summaries,
    timestamp: new Date().toISOString(),
  };
}

// GET /api/v1/incidents/:id
export function getIncident(id: string): APIResponse<Incident> {
  const incident = INCIDENTS.find((i) => i.id === id);
  
  if (!incident) {
    return {
      success: false,
      error: `Incident ${id} not found`,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    success: true,
    data: incident,
    timestamp: new Date().toISOString(),
  };
}

// POST /api/v1/analyze/url
export function analyzeURL(url: string): APIResponse<AnalysisResult> {
  if (!url || !url.trim()) {
    return {
      success: false,
      error: "URL is required",
      timestamp: new Date().toISOString(),
    };
  }

  const domain = url.replace(/^https?:\/\//, "").split("/")[0];
  const hash = domain.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  const rep = Math.abs(hash) % 100;
  
  let threat: "CLEAN" | "SUSPICIOUS" | "MALICIOUS" = "CLEAN";
  if (rep < 30) threat = "MALICIOUS";
  else if (rep < 60) threat = "SUSPICIOUS";

  return {
    success: true,
    data: {
      type: "URL",
      value: url,
      reputation: rep,
      threat,
      details: {
        domain,
        ip: `192.${Math.abs(hash) % 255}.${Math.abs(hash * 2) % 255}.${Math.abs(hash * 3) % 255}`,
        country: ["US", "DE", "FR", "RU", "CN"][Math.abs(hash) % 5],
        asn: `AS${10000 + Math.abs(hash) % 50000}`,
        ssl: Math.random() > 0.3,
        created: `${2020 + Math.abs(hash) % 5}-${String((Math.abs(hash) % 12) + 1).padStart(2, "0")}-${String((Math.abs(hash) % 28) + 1).padStart(2, "0")}`,
      },
    },
    timestamp: new Date().toISOString(),
  };
}

// POST /api/v1/analyze/ip
export function analyzeIP(ip: string): APIResponse<AnalysisResult> {
  if (!ip || !ip.trim()) {
    return {
      success: false,
      error: "IP is required",
      timestamp: new Date().toISOString(),
    };
  }

  const hash = ip.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
  const rep = Math.abs(hash) % 100;
  const abuse = Math.abs(hash * 2) % 100;
  
  let threat: "CLEAN" | "SUSPICIOUS" | "MALICIOUS" = "CLEAN";
  if (rep < 30 || abuse > 70) threat = "MALICIOUS";
  else if (rep < 60 || abuse > 40) threat = "SUSPICIOUS";

  return {
    success: true,
    data: {
      type: "IP",
      value: ip,
      reputation: rep,
      threat,
      details: {
        country: ["US", "DE", "FR", "RU", "CN", "BR", "IN"][Math.abs(hash) % 7],
        city: ["New York", "Berlin", "Paris", "Moscow", "Beijing", "São Paulo", "Mumbai"][Math.abs(hash) % 7],
        isp: ["AWS", "Google Cloud", "OVH", "Hetzner", "DigitalOcean"][Math.abs(hash) % 5],
        asn: `AS${10000 + Math.abs(hash) % 50000}`,
        org: ["Amazon", "Google", "OVH SAS", "Hetzner", "DigitalOcean"][Math.abs(hash) % 5],
        abuseScore: abuse,
        openPorts: [22, 80, 443, 3389, 8080].filter(() => Math.random() > 0.5),
        hostname: `host-${Math.abs(hash) % 1000}.example.com`,
      },
    },
    timestamp: new Date().toISOString(),
  };
}

// POST /api/v1/submit
export function submitIOC(type: "URL" | "IP" | "HASH" | "DOMAIN" | "TEXT", value: string): APIResponse<{ id: string; status: string }> {
  if (!value || !value.trim()) {
    return {
      success: false,
      error: "Value is required",
      timestamp: new Date().toISOString(),
    };
  }

  const id = `SUB-${Date.now().toString(36).toUpperCase()}`;

  return {
    success: true,
    data: {
      id,
      status: "PENDING",
    },
    timestamp: new Date().toISOString(),
  };
}

// GET /api/v1/health
export function healthCheck(): APIResponse<{ status: string; version: string; mode: string }> {
  return {
    success: true,
    data: {
      status: "OPERATIONAL",
      version: "1.0.0",
      mode: "PRODUCTION",
    },
    timestamp: new Date().toISOString(),
  };
}

// Helpers
function calculateSeverity(inc: Incident): string {
  const score = inc.risk.threat * inc.risk.assetCrit * inc.risk.exposure * calculateConfidence(inc);
  if (score >= 0.6) return "CRITICAL";
  if (score >= 0.38) return "HIGH";
  if (score >= 0.15) return "MEDIUM";
  if (score >= 0.06) return "LOW";
  return "INFO";
}

function calculateConfidence(inc: Incident): number {
  return inc.confidenceFactors.reduce((s, f) => s + f.weight * f.value, 0);
}

// Export API documentation
export const API_DOCS = {
  endpoints: [
    {
      method: "GET",
      path: "/api/v1/incidents",
      description: "List all active incidents",
      response: "IncidentSummary[]",
    },
    {
      method: "GET",
      path: "/api/v1/incidents/:id",
      description: "Get incident details by ID",
      response: "Incident",
    },
    {
      method: "POST",
      path: "/api/v1/analyze/url",
      description: "Analyze a URL for threats",
      body: "{ url: string }",
      response: "AnalysisResult",
    },
    {
      method: "POST",
      path: "/api/v1/analyze/ip",
      description: "Analyze an IP address for threats",
      body: "{ ip: string }",
      response: "AnalysisResult",
    },
    {
      method: "POST",
      path: "/api/v1/submit",
      description: "Submit an IOC for analysis",
      body: "{ type: 'URL' | 'IP' | 'HASH' | 'DOMAIN' | 'TEXT', value: string }",
      response: "{ id: string, status: string }",
    },
    {
      method: "GET",
      path: "/api/v1/health",
      description: "Health check endpoint",
      response: "{ status: string, version: string, mode: string }",
    },
  ],
  authentication: "Bearer token required for all endpoints",
  rateLimit: "100 requests per minute",
};
