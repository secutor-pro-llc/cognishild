# COGNISHIELD API Documentation

## Base URL
```
/api/v1
```

## Authentication
Tous les endpoints requièrent un token Bearer dans le header :
```
Authorization: Bearer <your-token>
```

## Rate Limiting
- 100 requêtes par minute
- Header `X-RateLimit-Remaining` indique les requêtes restantes

---

## Endpoints

### GET /incidents

Liste tous les incidents actifs.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "INC-20260901-000187",
      "type": "Distributed Denial of Service",
      "subtype": "HTTP Layer 7 Flood",
      "severity": "CRITICAL",
      "confidence": 0.974,
      "status": "ACTIVE",
      "asset": "Public Web Portal",
      "start": "01/09/2026 00:25:08"
    }
  ],
  "timestamp": "2026-09-01T00:30:00Z"
}
```

---

### GET /incidents/:id

Récupère les détails complets d'un incident.

**Parameters:**
- `id` (path) - ID de l'incident (ex: INC-20260901-000187)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "INC-20260901-000187",
    "type": "Distributed Denial of Service",
    "subtype": "HTTP Layer 7 Flood",
    "asset": "Public Web Portal",
    "start": "01/09/2026 00:25:08",
    "confidenceFactors": [
      { "label": "Sensor confidence", "weight": 0.25, "value": 0.98 },
      { "label": "Indicator consistency", "weight": 0.2, "value": 0.98 }
    ],
    "evidenceFor": [
      "Augmentation brutale du taux de requêtes",
      "Répétition anormale des URI"
    ],
    "evidenceAgainst": [
      "Aucune saturation réseau observée"
    ],
    "hypotheses": [
      { "name": "HTTP Flood L7", "score": 97.4 },
      { "name": "Bot scraping massif", "score": 18.3 }
    ],
    "mitre": {
      "tactic": "TA0040",
      "tacticName": "Impact",
      "technique": "T1498",
      "techniqueName": "Network Denial of Service",
      "sub": "T1498.001",
      "subName": "Direct Network Flood"
    },
    "risk": {
      "threat": 0.92,
      "assetCrit": 0.78,
      "exposure": 0.95
    },
    "playbooks": [
      {
        "id": "PB-DDOS-01",
        "name": "Endiguement DDoS L7",
        "match": 96,
        "sim": {
          "success": 94,
          "collateral": "LOW",
          "interruption": "VERY LOW",
          "reversibility": "HIGH",
          "effectiveness": 96,
          "impact": "Stabilisation du trafic"
        }
      }
    ]
  },
  "timestamp": "2026-09-01T00:30:00Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Incident INC-9999999-999999 not found",
  "timestamp": "2026-09-01T00:30:00Z"
}
```

---

### POST /analyze/url

Analyse une URL pour détecter des menaces.

**Request Body:**
```json
{
  "url": "https://malicious-site.example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "URL",
    "value": "https://malicious-site.example.com",
    "reputation": 15,
    "threat": "MALICIOUS",
    "details": {
      "domain": "malicious-site.example.com",
      "ip": "192.168.1.100",
      "country": "RU",
      "asn": "AS12345",
      "ssl": false,
      "created": "2024-03-15"
    }
  },
  "timestamp": "2026-09-01T00:30:00Z"
}
```

**Threat Levels:**
- `CLEAN` - Réputation >= 60
- `SUSPICIOUS` - Réputation 30-59
- `MALICIOUS` - Réputation < 30

---

### POST /analyze/ip

Analyse une adresse IP pour détecter des menaces.

**Request Body:**
```json
{
  "ip": "192.168.1.100"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "IP",
    "value": "192.168.1.100",
    "reputation": 25,
    "threat": "MALICIOUS",
    "details": {
      "country": "CN",
      "city": "Beijing",
      "isp": "Unknown ISP",
      "asn": "AS67890",
      "org": "Unknown Organization",
      "abuseScore": 85,
      "openPorts": [22, 80, 443, 4444, 8888],
      "hostname": "host-123.example.com"
    }
  },
  "timestamp": "2026-09-01T00:30:00Z"
}
```

---

### POST /submit

Soumet un indicateur de compromission (IOC) pour analyse et corrélation.

**Request Body:**
```json
{
  "type": "URL",
  "value": "https://suspicious-domain.com"
}
```

**Supported Types:**
- `URL` - URL complète
- `IP` - Adresse IPv4
- `HASH` - Hash (MD5, SHA1, SHA256)
- `DOMAIN` - Nom de domaine
- `TEXT` - Texte libre

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "SUB-M1ABC2DEF",
    "status": "PENDING"
  },
  "timestamp": "2026-09-01T00:30:00Z"
}
```

**Status Flow:**
1. `PENDING` - Soumission reçue
2. `ANALYZED` - Analyse terminée (après ~1.5s)
3. `CORRELATED` - Corrélé avec incidents actifs (après ~3s)

---

### GET /health

Vérifie l'état de santé de l'API.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "OPERATIONAL",
    "version": "1.0.0",
    "mode": "PRODUCTION"
  },
  "timestamp": "2026-09-01T00:30:00Z"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Paramètres invalides |
| 401  | Unauthorized - Token manquant ou invalide |
| 404  | Not Found - Ressource inexistante |
| 429  | Too Many Requests - Rate limit dépassé |
| 500  | Internal Server Error |

---

## Examples

### cURL

**Lister les incidents:**
```bash
curl -X GET "https://api.cognishield.io/v1/incidents" \
  -H "Authorization: Bearer your-token"
```

**Analyser une URL:**
```bash
curl -X POST "https://api.cognishield.io/v1/analyze/url" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

**Soumettre un IOC:**
```bash
curl -X POST "https://api.cognishield.io/v1/submit" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"type": "IP", "value": "192.168.1.100"}'
```

### Python

```python
import requests

API_BASE = "https://api.cognishield.io/v1"
HEADERS = {
    "Authorization": "Bearer your-token",
    "Content-Type": "application/json"
}

# Lister les incidents
response = requests.get(f"{API_BASE}/incidents", headers=HEADERS)
incidents = response.json()["data"]

# Analyser une URL
response = requests.post(
    f"{API_BASE}/analyze/url",
    headers=HEADERS,
    json={"url": "https://example.com"}
)
analysis = response.json()["data"]

if analysis["threat"] == "MALICIOUS":
    print(f"⚠️  URL malveillante détectée: {analysis['value']}")
    print(f"Réputation: {analysis['reputation']}/100")

# Soumettre un IOC
response = requests.post(
    f"{API_BASE}/submit",
    headers=HEADERS,
    json={"type": "IP", "value": "192.168.1.100"}
)
submission = response.json()["data"]
print(f"IOC soumis: {submission['id']} - Status: {submission['status']}")
```

### JavaScript

```javascript
const API_BASE = "https://api.cognishield.io/v1";
const HEADERS = {
  "Authorization": "Bearer your-token",
  "Content-Type": "application/json"
};

// Analyser une IP
async function analyzeIP(ip) {
  const response = await fetch(`${API_BASE}/analyze/ip`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ ip })
  });
  
  const result = await response.json();
  
  if (result.success) {
    const { threat, reputation, details } = result.data;
    console.log(`IP: ${ip}`);
    console.log(`Threat: ${threat}`);
    console.log(`Reputation: ${reputation}/100`);
    console.log(`Country: ${details.country}`);
    console.log(`ISP: ${details.isp}`);
  }
  
  return result;
}

// Utiliser l'API
analyzeIP("192.168.1.100");
```

---

## Webhooks (Future)

Les webhooks permettront de recevoir des notifications en temps réel :

```json
{
  "event": "incident.created",
  "timestamp": "2026-09-01T00:30:00Z",
  "data": {
    "id": "INC-20260901-000187",
    "severity": "CRITICAL",
    "type": "Distributed Denial of Service"
  }
}
```

**Events disponibles:**
- `incident.created` - Nouvel incident détecté
- `incident.updated` - Incident mis à jour
- `incident.approved` - Approbation humaine reçue
- `incident.mitigated` - Incident mitigé
- `incident.closed` - Incident clos
- `ioc.correlated` - IOC corrélé avec un incident

---

## SDKs

### Installation

**Node.js:**
```bash
npm install @cognishield/sdk
```

**Python:**
```bash
pip install cognishield
```

### Usage

```javascript
// Node.js
const Cognishield = require('@cognishield/sdk');

const client = new Cognishield({
  apiKey: 'your-token',
  baseUrl: 'https://api.cognishield.io/v1'
});

// Lister les incidents
const incidents = await client.incidents.list();

// Analyser une URL
const analysis = await client.analyze.url('https://example.com');

// Soumettre un IOC
const submission = await client.submit('IP', '192.168.1.100');
```

---

## Support

- **Documentation**: https://docs.cognishield.io
- **Email**: support@cognishield.io
- **Status**: https://status.cognishield.io

---

**COGNISHIELD API v1.0** - Mode PRODUCTION
