# SkillSetu Architectural Specification & System Design

## 1. Dual-Store Architectural Pattern

A core architectural tenet of SkillSetu is the separation between **Transactional Ground Truth** and **Relationship Intelligence**:

```
[ POSTGRESQL ]                          [ NEO4J ]
Source of Truth                          Relationship Intelligence
-------------------                      -------------------------
- Users & Passwords (Bcrypt)             - (:Student)-[:HAS_COMPETENCY]->(:Competency)
- Application Submissions                - (:Project)-[:DEMONSTRATES]->(:Competency)
- Interview Scheduling                   - (:Competency)-[:REQUIRED_FOR]->(:Opportunity)
- Audit Logs & ACID Transactions         - Multi-Hop Graph Path Traversals & GraphRAG
```

### Why Neo4j is NOT the primary transactional DB:
1. PostgreSQL handles strict relational constraints, user management, and transactional rollbacks with zero risk of graph corruption.
2. Neo4j executes sub-50ms Cypher queries over millions of multi-hop paths (`(Student)-[:COMPLETED]->(Project)-[:DEMONSTRATES]->(Competency)-[:REQUIRED_FOR]->(Opportunity)`), which would require 6-way SQL JOINs in relational databases.

---

## 2. Matchmaking Algorithm Math

The overall match score $S_{total}$ for candidate $C$ and opportunity $O$ is formulated as:

$$S_{total} = w_g \cdot S_{graph} + w_v \cdot S_{vector}$$

Where:
- $w_g = 0.70$ (Weight allocated to verified graph path coverage)
- $w_v = 0.30$ (Weight allocated to semantic vector cosine similarity)
- $S_{graph} = \frac{\sum_{k \in K_{matched}} W_k}{\sum_{k \in K_{required}} W_k} \times 100$
- $S_{vector} = \cos(\vec{E}_C, \vec{E}_O) \times 100$

---

## 3. Explainable AI (XAI) Pipeline

1. **Entity Extraction**: Ingest candidate text / resume / GitHub repo.
2. **Ontology Linking**: Map extracted tokens against normalized Neo4j competency nodes.
3. **Graph Traversal**: Compute path distance and verified trust score.
4. **Remediation Generation**: If $S_{total} < 100\%$, pinpoint missing graph nodes and generate ordered micro-course milestones.
