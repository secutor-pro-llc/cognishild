# COGNISHIELD — Cognitive Incident Commander v1.0

Console de commandement cognitive pour la réponse aux incidents de cybersécurité en temps réel.

## 🎯 Fonctionnalités

### Pipeline Cognitif Complet (20 étapes)
Le pipeline s'exécute en temps réel quand vous cliquez sur "Initier l'analyse cognitive" :

1. **EVENT** - Détection de l'événement
2. **INGESTION** - Collecte des données
3. **NORMALISATION** - Formatage standardisé
4. **CORRELATION** - Croisement des sources
5. **CLASSIFICATION** - Catégorisation de la menace
6. **THREAT HYPOTHESES** - Génération d'hypothèses
7. **COUNTER-ANALYSIS** - Analyse contradictoire
8. **CONFIDENCE SCORING** - Calcul de confiance (6 facteurs pondérés)
9. **MITRE MAPPING** - Mapping ATT&CK
10. **ASSET CRITICALITY** - Évaluation de l'actif
11. **IMPACT ANALYSIS** - Analyse d'impact
12. **PLAYBOOK MATCHING** - Sélection des playbooks
13. **CONSEQUENCE MODELING** - Modélisation des conséquences
14. **COLLATERAL RISK** - Évaluation des risques collatéraux
15. **RECOMMENDATION** - Recommandation de réponse
16. **HUMAN APPROVAL** - Validation humaine (L1 + L2)
17. **EXECUTION** - Exécution du playbook
18. **POST-EXEC VALIDATION** - Validation post-exécution
19. **FORENSIC SNAPSHOT** - Capture forensique
20. **AUDIT** - Journalisation immuable

### Outils d'Analyse

#### 🔍 Analyse d'URL
- Vérification de réputation (0-100)
- Détection de menace (CLEAN / SUSPICIOUS / MALICIOUS)
- Informations WHOIS (domaine, IP, pays, ASN, date de création)
- Vérification SSL
- Listes noires (PhishingDB, MalwareDomainList, SpamHaus)
- Catégories de contenu

#### 🌐 Analyse d'IP
- Géolocalisation (pays, ville)
- Informations ISP/ASN/Organisation
- Score de réputation (0-100)
- Score d'abus (0-100)
- Ports ouverts détectés
- Nombre de signalements
- Détection de menace

#### 📤 Dépôt d'IOC
Soumettez des indicateurs de compromission pour analyse et corrélation :
- URL
- Adresse IP
- Hash (MD5, SHA1, SHA256)
- Domaine
- Texte libre

Statuts de traitement :
- **PENDING** - En attente d'analyse
- **ANALYZED** - Analysé
- **CORRELATED** - Corrélé avec incidents actifs

#### 🕵️ OnionSearch (Darknet Intel)
Recherche OSINT sur le darknet via proxy Tor :
- 5 moteurs de recherche .onion (darksearchio, onionland, notevil, darksearchenginer, ahmia)
- Résultats avec URLs .onion, titres, scores de pertinence
- Corrélation avec incidents actifs

### API REST

Endpoints disponibles :

```
GET  /api/v1/incidents          - Liste des incidents actifs
GET  /api/v1/incidents/:id      - Détails d'un incident
POST /api/v1/analyze/url        - Analyser une URL
POST /api/v1/analyze/ip         - Analyser une IP
POST /api/v1/submit             - Soumettre un IOC
GET  /api/v1/health             - Health check
```

**Authentification** : Bearer token  
**Rate limit** : 100 requêtes/minute  
**Mode** : PRODUCTION

### Incidents Configurés

4 incidents pré-configurés avec données réelles :

1. **INC-20260901-000187** - DDoS HTTP Layer 7 Flood (CRITICAL)
   - Actif : Public Web Portal
   - Confiance : 97.4%
   - Playbook recommandé : PB-DDOS-01

2. **INC-20260901-000172** - Credential Stuffing (HIGH)
   - Actif : Customer Identity Provider
   - Confiance : 84.2%
   - Playbook recommandé : PB-AUTH-03

3. **INC-20260901-000166** - C2 Beaconing (MEDIUM)
   - Actif : Internal Build Server
   - Confiance : 71.8%
   - Playbook recommandé : PB-EDR-02

4. **INC-20260901-000154** - Exfiltration de données (MEDIUM)
   - Actif : R&D File Share
   - Confiance : 63.5%
   - Playbook recommandé : PB-DLP-02

## 🔒 Sécurité

### Mode PRODUCTION
- **Double validation humaine obligatoire** (L1 + L2)
- **Aucune auto-exécution**
- **FAIL CLOSED** - Toute action non autorisée est refusée
- **Audit immuable** - Toutes les décisions sont journalisées

### Politique de sécurité
```
LLM → Recommandation structurée → Policy engine → Autorisation → Exécuteur déterministe
```

Le LLM ne dispose **jamais** de privilèges d'exécution directe.

## 🚀 Utilisation

### Démarrage
```bash
npm install
npm run dev
```

### Build production
```bash
npm run build
```

### Raccourcis clavier
- **Touches 1-4** : Sélection d'incident
- **Entrée** : Valider dans les champs de recherche

### Workflow typique

1. **Sélectionner un incident** dans la file (rail gauche)
2. **Cliquer "Initier l'analyse cognitive"** pour démarrer le pipeline
3. **Observer le pipeline** s'exécuter en temps réel (20 étapes)
4. **Atteindre le Human Approval Gate** (étape 16)
5. **Approuver L1** (SOC Analyst) puis **L2** (Incident Commander)
6. **Exécution automatique** du playbook recommandé
7. **Post-mitigation watch** (5 minutes de surveillance)
8. **Neutralisation confirmée** si 5/5 conditions satisfaites
9. **Clôture de l'incident** après fenêtre d'observation

## 📊 Métriques en temps réel

Chaque incident affiche une télémétrie live :
- **INC-000187** : req/s (36k-48k en attaque, 3.5k-5.2k nominal)
- **INC-000172** : tentatives/min (8.2k-11.5k en attaque, 400-900 nominal)
- **INC-000166** : beacons/min (90-160 en attaque, 2-9 nominal)
- **INC-000154** : Mo/s sortants (210-340 en attaque, 8-22 nominal)

## 🎨 Interface

### Palette fonctionnelle
- **VERT** : Stable / validé
- **BLEU** : Analyse
- **JAUNE** : Incertitude
- **ORANGE** : Risque élevé
- **ROUGE** : Critique
- **VIOLET** : IA / analyse cognitive
- **GRIS** : Simulation / modélisation

### Agents internes (13 agents)
- CIC Orchestrator (COORDINATE)
- Detection Analyst (READ ONLY)
- Threat Analyst (READ ONLY)
- Counter Analyst (READ ONLY)
- MITRE Mapper (READ ONLY)
- Risk Analyst (READ ONLY)
- Playbook Selector (RECOMMEND ONLY)
- Consequence Modeler (ESTIMATE ONLY)
- Policy Guard (ALLOW / DENY)
- Execution Engine (RESTRICTED)
- Evidence Agent (WRITE APPEND ONLY)
- Report Agent (WRITE APPEND ONLY)
- Darknet Intel Analyst (OSINT READ ONLY)

## 📦 Architecture technique

- **React 18** + **TypeScript**
- **Tailwind CSS 4** (palette fonctionnelle)
- **Vite** (build rapide)
- **Lucide React** (icônes)
- **Framer Motion** (animations)

### Structure
```
src/
├── api.ts                    # API REST simulée
├── App.tsx                   # Composant principal
├── components/
│   ├── TopBar.tsx           # Barre de commande
│   ├── LeftRail.tsx         # KPIs + file d'incidents + agents
│   ├── CenterStage.tsx      # Incident actif + pipeline
│   ├── RightRail.tsx        # Approbation + MITRE + playbooks
│   ├── BottomStrip.tsx      # Audit + score + statut final
│   ├── OnionSearchPanel.tsx # Recherche darknet
│   ├── URLAnalysisPanel.tsx # Analyse URL
│   ├── IPAnalysisPanel.tsx  # Analyse IP
│   ├── SubmissionPanel.tsx  # Dépôt d'IOC
│   ├── APIPanel.tsx         # Documentation API
│   └── ui.tsx               # Composants UI réutilisables
├── data/
│   └── incidents.ts         # Données des incidents
└── engine/
    └── useCIC.ts            # Moteur cognitif
```

## 🔗 Intégrations

### Sources OSINT
- **OnionSearch** (megadose/OnionSearch) - Recherche darknet
- Proxy Tor localhost:9050
- 5 moteurs .onion

### Capteurs
- SIEM
- EDR
- WAF
- CTI (Cyber Threat Intelligence)
- DARKNET_INTEL

## 📝 Licence

Projet de démonstration - Usage éducatif et défensif uniquement.

## 🎯 Principe directeur

**DETECT → CHALLENGE → UNDERSTAND → MODEL → AUTHORIZE → RESPOND → VERIFY → PROVE**

---

**COGNISHIELD CIC v1.0** - Console de commandement cognitive pour opérations réelles
