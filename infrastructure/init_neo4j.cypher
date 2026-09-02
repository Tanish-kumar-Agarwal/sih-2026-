// ==============================================================================
// SkillSetu: Neo4j Graph Schema & Relationship Intelligence Engine
// Note: PostgreSQL is source of truth, Neo4j calculates relationship graph & matching
// ==============================================================================

// 1. Constraints & Indexes
CREATE CONSTRAINT unique_student_id IF NOT EXISTS FOR (s:Student) REQUIRE s.id IS UNIQUE;
CREATE CONSTRAINT unique_competency_code IF NOT EXISTS FOR (c:Competency) REQUIRE c.code IS UNIQUE;
CREATE CONSTRAINT unique_role_code IF NOT EXISTS FOR (r:Role) REQUIRE r.code IS UNIQUE;
CREATE CONSTRAINT unique_opportunity_id IF NOT EXISTS FOR (o:Opportunity) REQUIRE o.id IS UNIQUE;
CREATE CONSTRAINT unique_project_id IF NOT EXISTS FOR (p:Project) REQUIRE p.id IS UNIQUE;
CREATE CONSTRAINT unique_institution_code IF NOT EXISTS FOR (i:Institution) REQUIRE i.code IS UNIQUE;

CREATE INDEX idx_student_readiness IF NOT EXISTS FOR (s:Student) ON (s.readiness_score);
CREATE INDEX idx_competency_category IF NOT EXISTS FOR (c:Competency) ON (c.category);
CREATE INDEX idx_opportunity_status IF NOT EXISTS FOR (o:Opportunity) ON (o.status);

// 2. Seed Base Competency Taxonomy
MERGE (py:Competency {code: 'COMP-PYTHON', name: 'Python Engineering', category: 'Core Technical', level: 'Intermediate'})
MERGE (fastapi:Competency {code: 'COMP-FASTAPI', name: 'FastAPI Backend Architecture', category: 'Core Technical', level: 'Intermediate'})
MERGE (react:Competency {code: 'COMP-REACT', name: 'React & Next.js Ecosystem', category: 'Core Technical', level: 'Intermediate'})
MERGE (neo4j:Competency {code: 'COMP-NEO4J', name: 'Graph Databases & Cypher', category: 'Architectural', level: 'Advanced'})
MERGE (ml:Competency {code: 'COMP-ML-SYSTEMS', name: 'Applied ML & Neural Architectures', category: 'Applied Domain', level: 'Advanced'})
MERGE (dock:Competency {code: 'COMP-DOCKER', name: 'Containerization & Cloud Deployments', category: 'DevOps', level: 'Intermediate'})
MERGE (sql:Competency {code: 'COMP-POSTGRES', name: 'Relational DB Design & Optimization', category: 'Architectural', level: 'Intermediate'})
MERGE (nlp:Competency {code: 'COMP-LLM-OPS', name: 'LLM Orchestration & RAG', category: 'Applied Domain', level: 'Advanced'})
MERGE (soft:Competency {code: 'COMP-PROD-THINKING', name: 'Product Engineering & Problem Solving', category: 'Soft Skill', level: 'Intermediate'});

// Competency Graph Relationships
MERGE (py)-[:PREREQUISITE_FOR {weight: 0.9}]->(fastapi);
MERGE (py)-[:PREREQUISITE_FOR {weight: 0.95}]->(ml);
MERGE (ml)-[:PREREQUISITE_FOR {weight: 0.85}]->(nlp);
MERGE (sql)-[:COMPLEMENTS {weight: 0.8}]->(neo4j);
MERGE (fastapi)-[:COMPLEMENTS {weight: 0.85}]->(react);

// 3. Seed Industry Roles & Requirements
MERGE (be_eng:Role {code: 'ROLE-BACKEND-ENG', title: 'AI-First Backend Engineer', domain: 'Engineering'})
MERGE (fastapi)-[:REQUIRED_FOR {importance: 'MANDATORY', weight: 1.0}]->(be_eng)
MERGE (sql)-[:REQUIRED_FOR {importance: 'MANDATORY', weight: 0.9}]->(be_eng)
MERGE (neo4j)-[:REQUIRED_FOR {importance: 'PREFERRED', weight: 0.75}]->(be_eng)
MERGE (dock)-[:REQUIRED_FOR {importance: 'PREFERRED', weight: 0.7}]->(be_eng);

MERGE (ai_eng:Role {code: 'ROLE-AI-SYSTEMS', title: 'Generative AI & Graph Engineer', domain: 'AI & Data'})
MERGE (py)-[:REQUIRED_FOR {importance: 'MANDATORY', weight: 1.0}]->(ai_eng)
MERGE (nlp)-[:REQUIRED_FOR {importance: 'MANDATORY', weight: 0.95}]->(ai_eng)
MERGE (neo4j)-[:REQUIRED_FOR {importance: 'MANDATORY', weight: 0.85}]->(ai_eng);

// 4. Seed Opportunities
MERGE (opp1:Opportunity {id: 'opp-sih-001', title: 'Full Stack AI Platform Engineer', company: 'NextGen AI Labs', type: 'INTERNSHIP', status: 'ACTIVE'})
MERGE (fastapi)-[:REQUIRED_FOR {importance: 'MANDATORY', weight: 0.9}]->(opp1)
MERGE (react)-[:REQUIRED_FOR {importance: 'MANDATORY', weight: 0.9}]->(opp1)
MERGE (neo4j)-[:REQUIRED_FOR {importance: 'PREFERRED', weight: 0.8}]->(opp1)
MERGE (dock)-[:REQUIRED_FOR {importance: 'BONUS', weight: 0.6}]->(opp1);

MERGE (opp2:Opportunity {id: 'opp-sih-002', title: 'Knowledge Graph & LLM Research Intern', company: 'Cognitive Cloud', type: 'INTERNSHIP', status: 'ACTIVE'})
MERGE (neo4j)-[:REQUIRED_FOR {importance: 'MANDATORY', weight: 1.0}]->(opp2)
MERGE (nlp)-[:REQUIRED_FOR {importance: 'MANDATORY', weight: 0.95}]->(opp2)
MERGE (py)-[:REQUIRED_FOR {importance: 'MANDATORY', weight: 0.9}]->(opp2);

// 5. Seed Demonstration Graph (Student Project & Evidence Walk)
MERGE (inst:Institution {code: 'INST-IITD', name: 'Indian Institute of Technology, Delhi'})
MERGE (stu:Student {id: 'stu-aarav-sharma', name: 'Aarav Sharma', enrollment: '2023CS0192', readiness_score: 89.4})
MERGE (stu)-[:ENROLLED_IN]->(inst);

MERGE (stu)-[:HAS_COMPETENCY {proficiency: 'Advanced', score: 92.0, verified: true, verified_at: datetime()}]->(py);
MERGE (stu)-[:HAS_COMPETENCY {proficiency: 'Intermediate', score: 85.0, verified: true, verified_at: datetime()}]->(fastapi);
MERGE (stu)-[:HAS_COMPETENCY {proficiency: 'Intermediate', score: 88.0, verified: true, verified_at: datetime()}]->(react);
MERGE (stu)-[:HAS_COMPETENCY {proficiency: 'Intermediate', score: 78.0, verified: false, verified_at: null}]->(neo4j);

MERGE (proj:Project {id: 'proj-skillsetu', title: 'SkillSetu AI Graph Platform', repo: 'https://github.com/aarav/skillsetu', verified: true})
MERGE (stu)-[:COMPLETED]->(proj);
MERGE (proj)-[:DEMONSTRATES {confidence: 0.95}]->(fastapi);
MERGE (proj)-[:DEMONSTRATES {confidence: 0.90}]->(react);
MERGE (proj)-[:DEMONSTRATES {confidence: 0.85}]->(neo4j);

// Match relationship calculated dynamically
MERGE (stu)-[:MATCHED_TO {score: 91.5, graph_hops: 2, matched_at: datetime(), reasoning: 'Strong verification in FastAPI, React and Project Evidence with Neo4j'}]->(opp1);
