# 🌉 SkillSetu - AI-Powered Competency Graph & Opportunity Matchmaking Platform
> **Smart India Hackathon (SIH 2026)** — Dynamic Industry-Academia Bridging Ecosystem

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/Truth%20DB-PostgreSQL-336791?style=flat&logo=postgresql)](https://postgresql.org)
[![Neo4j](https://img.shields.io/badge/Graph%20Engine-Neo4j%205-008CC1?style=flat&logo=neo4j)](https://neo4j.com)
[![Explainable AI](https://img.shields.io/badge/AI-Explainable%20Matching-6366F1?style=flat)](https://ai.google.dev)

---

## 📌 Problem Statement & Hackathon Vision
In the current higher-education and technical hiring landscape:
1. **Unverified Resumes & Skill Inflation**: Static PDF resumes stuffed with keywords overwhelm recruiters.
2. **Institutional Blindspots**: Colleges and Universities have no real-time data on emerging industry skill demands and syllabus deficits.
3. **Black-Box ATS Filtering**: Traditional applicant tracking systems discard talented students without actionable feedback.

### 💡 The SkillSetu Solution
**SkillSetu** replaces static resumes with **Dynamic Knowledge Graphs**.
- **PostgreSQL as Ground Truth**: Guarantees ACID compliance, security, and transactional records.
- **Neo4j for Relationship Intelligence**: Multi-hop path graph walks (`Student -> Project -> Competency -> Opportunity`) compute precise fit and explainable match rationale.
- **5 Tailored Stakeholder Portals**: Dedicated workspaces for **Students**, **Industry Recruiters**, **Deans/Institutions**, **Faculty Mentors**, and **Super Admins**.

---

## 🏛️ System Architecture

```
                               ┌────────────────────────┐
                               │   Next.js 14 Web App   │
                               │  (5 Role-Based Portals) │
                               └───────────┬────────────┘
                                           │ (REST / JSON)
                               ┌───────────▼────────────┐
                               │   FastAPI Gateway v1   │
                               │ (DDD Modular Domains)  │
                               └─────┬──────┬─────┬─────┘
                                     │      │     │
                 ┌───────────────────┘      │     └───────────────────┐
                 ▼                          ▼                         ▼
      ┌──────────────────────┐   ┌──────────────────────┐  ┌──────────────────────┐
      │ PostgreSQL 16 (Truth)│   │ Neo4j 5 (Graph Traversal)│  │ LLM & Embedder (AI)  │
      │ 28 Entities & ACID   │   │ Cypher Path Matcher  │  │ XAI Explanations &   │
      │ Transaction History  │   │ Competency Ontology  │  │ Resume Extraction    │
      └──────────────────────┘   └──────────────────────┘  └──────────────────────┘
```

---

## 📂 Project Structure

```
skillsetu/
│
├── apps/
│   ├── web/                     # Next.js 14 App Router Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (public)/    # Landing, About, Public Requisitions
│   │   │   │   ├── (auth)/      # Login, Register, AI Onboarding
│   │   │   │   ├── student/     # Student Dashboard, Graph, Matches, Evidence
│   │   │   │   ├── industry/    # Recruiter Dashboard, Talent Discovery, Blueprints
│   │   │   │   ├── institution/ # Dean Dashboard, Cohort Readiness, Skill Gaps
│   │   │   │   ├── faculty/     # Mentor Dashboard, Evidence Verification Queue
│   │   │   │   └── admin/       # Command Center, Ontology Governance, Telemetry
│   │   │   ├── components/      # GraphVisualizer, MatchScoreCard, Navbar, Sidebar
│   │   │   └── lib/             # API Client & fallbacks
│   │   └── package.json
│   │
│   └── api/                     # FastAPI Asynchronous Python Backend
│       ├── app/
│       │   ├── api/v1/          # Endpoints (auth, students, matching, analytics)
│       │   ├── domains/         # Domain-Driven services (identity, matching, readiness)
│       │   ├── ai/              # Gateway, Prompts, Extraction, Embeddings, Explanations
│       │   ├── infrastructure/  # PostgreSQL, Neo4j, Redis, Storage
│       │   ├── workers/         # Async background worker tasks
│       │   └── config/          # Environment settings
│       ├── tests/               # Pytest test suite
│       └── requirements.txt
│
├── packages/
│   ├── types/                   # Unified TypeScript Interfaces
│   ├── schemas/                 # Shared Constants and Schemas
│   └── ui/                      # Design Tokens and Theme Config
│
├── infrastructure/
│   ├── init_postgres.sql        # Complete PostgreSQL 28-table schema
│   └── init_neo4j.cypher        # Neo4j Cypher constraints & ontology seed
│
├── docs/                        # Architecture & SIH Evaluation Docs
├── docker-compose.yml           # Full production multi-container orchestration
├── .env.example
└── README.md
```

---

## 🚀 Quickstart & Setup Guide

### Option 1: Docker Compose (All-in-One)
```bash
# Start PostgreSQL, Neo4j, Redis, FastAPI Backend, and Next.js Frontend
docker-compose up --build
```
- **Web App**: `http://localhost:3000`
- **FastAPI Docs (Swagger)**: `http://localhost:8000/docs`
- **Neo4j Browser**: `http://localhost:7474` (Credentials: `neo4j` / `skillsetu_graph_pass`)

### Option 2: Local Development

#### 1. Backend (FastAPI)
```bash
cd apps/api
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend (Next.js)
```bash
cd apps/web
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🌟 Key Features for SIH 2026 Evaluation

1. **Interactive Neo4j Graph Visualizer**: Live rendering of multi-hop paths connecting candidates to opportunity blueprints.
2. **Explainable AI (XAI)**: No black-box rejection — every match provides detailed reasoning and a 3-step personalized remediation roadmap.
3. **Faculty Verification Signature**: Projects and code repositories can be signed by university faculty mentors to convert self-reported skills into cryptographically verified credentials.
4. **Dean Curriculum Readiness Matrix**: Automatically alerts university leadership to critical technology deficits across current semester syllabi.
5. **Instant 1-Click Role Switcher**: Switch on-the-fly between Student, Recruiter, Dean, Faculty, and Admin personas in the navigation bar.

---

## 📜 License
Developed for the **Smart India Hackathon (SIH 2026)**. Licensed under the MIT License.
