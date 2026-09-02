# Smart India Hackathon (SIH 2026) — Submission & Evaluation Guide

## 🎯 Pitch Deck Structure (Recommended Slides)

### Slide 1: Title & Theme
- **Project Name**: SkillSetu — AI-Powered Competency Graph & Industry-Academia Bridge
- **Theme**: Smart Education / Student Innovation / Talent Systems

### Slide 2: The Core Problem
- 72% of college graduates are deemed unemployable despite high GPAs.
- Static resumes are plagued with keyword inflation.
- Universities lack real-time visibility into industry skill demands.

### Slide 3: Proposed Solution
- **Dynamic Competency Knowledge Graphs** replacing static resumes.
- **Explainable AI (XAI)** matching with personalized remediation paths.
- **Dean Curriculum Readiness Matrix** to detect and fix academic deficits.

### Slide 4: Technical Architecture & Novelty
- **Hybrid Data Layer**: PostgreSQL (Source of Truth) + Neo4j (Relationship Intelligence).
- **Explainable Match Pipeline**: Graph Traversal (70%) + Semantic Embeddings (30%).
- **Faculty Verification**: Cryptographic signing of student project evidence.

### Slide 5: Live Demo Flow for Judges
1. Open Landing page `http://localhost:3000` — Show SIH mission & interactive Neo4j visualizer.
2. Switch to **Student Portal** — Showcase verified graph nodes and AI match results with XAI breakdown.
3. Switch to **Industry Recruiter Hub** — Show blueprint designer and candidate search.
4. Switch to **Institution/Dean Matrix** — Show live curriculum skill gap alerts and placement outcomes.
5. Switch to **Faculty Mentor** — Approve pending project evidence and sign graph nodes.
6. Open **FastAPI Swagger Docs** (`/docs`) — Show robust modular domain endpoints.

---

## 💡 Anticipated Judge Q&A / Viva Prep

**Q1: Why not store everything in Neo4j?**  
*A: Financial records, user authentication, and critical audit logs require strict ACID guarantees and relational indexing that PostgreSQL excels at. Neo4j is dedicated to high-speed relationship traversals and graph algorithms.*

**Q2: How do you prevent students from gaming the system?**  
*A: Competencies are flagged as "Self-Reported" until substantiated by verified GitHub code repositories, automated timed challenges, or faculty mentor verification signatures.*

**Q3: How does this help university deans and government bodies?**  
*A: The Institutional Readiness Matrix gives live aggregated feedback on what technologies industry is actively hiring for, enabling universities to proactively update syllabi and boost placement rates.*
