import asyncio
import os
import sys
from datetime import datetime, timezone, date

# Ensure app package is on path
current_dir = os.path.dirname(os.path.abspath(__file__))
api_dir = os.path.abspath(os.path.join(current_dir, ".."))
if api_dir not in sys.path:
    sys.path.insert(0, api_dir)

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy import select, text
from app.config.settings import settings
from app.infrastructure.database.models import (
    Base, Role, User, Institution, Department, Student, Faculty,
    Company, IndustryUser, Domain, Category, Competency, Skill, SkillAlias,
    SkillCompetency, RolesCatalog, RoleCompetencyRequirement,
    CompetencyRelationship, StudentCompetency, Project, Opportunity,
    Evidence, EvidenceVerification
)
from app.security.auth import get_password_hash

async def seed_database():
    print("Connecting to PostgreSQL 16 for deterministic canonical seeding...")
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    engine = create_async_engine(db_url, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    async with async_session() as session:
        # ----------------------------------------------------------------------
        # 1. Seed Roles & Organizations
        # ----------------------------------------------------------------------
        print("1. Seeding system roles...")
        roles_data = [
            ("student", "Student", "Learner building verified competency profile and seeking opportunities"),
            ("industry", "Industry Recruiter", "Hiring manager/recruiter designing blueprints and hiring talent"),
            ("institution", "Institution Admin", "University/College admin monitoring student readiness"),
            ("faculty", "Faculty Mentor", "Professor/Mentor validating student projects and credentials"),
            ("admin", "Platform Admin", "Governs taxonomy, compliance, and platform operations"),
        ]
        for role_id, name, desc in roles_data:
            existing = await session.get(Role, role_id)
            if not existing:
                session.add(Role(id=role_id, name=name, description=desc))
        await session.flush()

        print("2. Seeding institutions & departments...")
        iit_delhi = await session.get(Institution, "inst-iit-delhi")
        if not iit_delhi:
            iit_delhi = Institution(
                id="inst-iit-delhi",
                name="Indian Institute of Technology, Delhi",
                code="IITD",
                type="Institute of National Importance",
                city="New Delhi",
                state="Delhi",
                website="https://home.iitd.ac.in",
                accreditation="NIRF Rank #2",
                is_verified=True
            )
            session.add(iit_delhi)
            await session.flush()

        cse_dept = await session.get(Department, "dept-iitd-cse")
        if not cse_dept:
            cse_dept = Department(
                id="dept-iitd-cse",
                institution_id="inst-iit-delhi",
                name="Department of Computer Science & Engineering",
                code="CSE",
                hod_name="Prof. Sanjiva Prasad"
            )
            session.add(cse_dept)
            await session.flush()

        nextgen = await session.get(Company, "cmp-nextgen-labs")
        if not nextgen:
            nextgen = Company(
                id="cmp-nextgen-labs",
                name="NextGen AI Labs",
                cin="U72900DL2024PTC123456",
                industry_type="Artificial Intelligence & Cloud",
                size_range="50-200",
                website="https://nextgen.ai",
                logo_url="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
                description="Engineering next-generation graph-augmented AI systems and microservices.",
                verified=True
            )
            session.add(nextgen)
            await session.flush()

        # ----------------------------------------------------------------------
        # 2. Seed Deterministic Personas
        # ----------------------------------------------------------------------
        print("3. Seeding development personas...")
        u_aarav = await session.get(User, "usr-aarav-sharma")
        if not u_aarav:
            u_aarav = User(
                id="usr-aarav-sharma",
                email="aarav.sharma@example.edu.in",
                hashed_password=get_password_hash("DevAaravPass123!"),
                role_id="student",
                first_name="Aarav",
                last_name="Sharma",
                phone="+91-9876543210",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60",
                is_active=True,
                is_verified=True
            )
            session.add(u_aarav)
            await session.flush()

        s_aarav = await session.get(Student, "stu-aarav-sharma")
        if not s_aarav:
            s_aarav = Student(
                id="stu-aarav-sharma",
                user_id="usr-aarav-sharma",
                institution_id="inst-iit-delhi",
                department_id="dept-iitd-cse",
                enrollment_number="IITD-CS-2023-042",
                current_year=3,
                graduation_year=2027,
                cgpa=8.92,
                bio="AI Systems engineer with experience building full-stack web applications, knowledge graphs, and scalable microservices.",
                github_url="https://github.com/aarav-sharma",
                linkedin_url="https://linkedin.com/in/aaravsharma",
                portfolio_url="https://aarav.dev",
                readiness_score=89.4
            )
            session.add(s_aarav)
            await session.flush()

        # Student Persona B: Priya Patel (AYUSH & Diagnostics)
        u_priya = await session.get(User, "usr-priya-patel")
        if not u_priya:
            u_priya = User(
                id="usr-priya-patel",
                email="priya.patel@ayush.gov.in",
                hashed_password=get_password_hash("DevPriyaPass123!"),
                role_id="student",
                first_name="Priya",
                last_name="Patel",
                is_active=True,
                is_verified=True
            )
            session.add(u_priya)
            await session.flush()

        s_priya = await session.get(Student, "stu-priya-patel")
        if not s_priya:
            s_priya = Student(
                id="stu-priya-patel",
                user_id="usr-priya-patel",
                institution_id="inst-iit-delhi",
                department_id="dept-iitd-cse",
                enrollment_number="NIA-AYU-2022-019",
                current_year=4,
                graduation_year=2026,
                cgpa=9.15,
                bio="Ayurvedic clinical researcher specializing in Nadi Pariksha pulse diagnostics, herbal dravyaguna pharmacology, and integrative holistic medicine.",
                github_url="https://github.com/priya-patel-ayush",
                linkedin_url="https://linkedin.com/in/priyapatel-ayush",
                portfolio_url="https://priyapatel.ayush.dev",
                readiness_score=92.1
            )
            session.add(s_priya)
            await session.flush()

        # Student Persona C: Rohit Kumar (First Year / Blank Slate with 0 Competencies)
        u_rohit = await session.get(User, "usr-rohit-kumar")
        if not u_rohit:
            u_rohit = User(
                id="usr-rohit-kumar",
                email="rohit.kumar@iitd.ac.in",
                hashed_password=get_password_hash("DevRohitPass123!"),
                role_id="student",
                first_name="Rohit",
                last_name="Kumar",
                is_active=True,
                is_verified=True
            )
            session.add(u_rohit)
            await session.flush()

        s_rohit = await session.get(Student, "stu-rohit-kumar")
        if not s_rohit:
            s_rohit = Student(
                id="stu-rohit-kumar",
                user_id="usr-rohit-kumar",
                institution_id="inst-iit-delhi",
                department_id="dept-iitd-cse",
                enrollment_number="IITD-CS-2026-901",
                current_year=1,
                graduation_year=2028,
                cgpa=8.0,
                bio="First year computer science undergraduate student exploring foundational programming, algorithms, and systems engineering.",
                github_url="https://github.com/rohit-kumar-dev",
                linkedin_url="https://linkedin.com/in/rohitkumar-student",
                portfolio_url=None,
                readiness_score=0.0
            )
            session.add(s_rohit)
            await session.flush()


        u_vikram = await session.get(User, "usr-vikram-malhotra")
        if not u_vikram:
            u_vikram = User(
                id="usr-vikram-malhotra",
                email="vikram@nextgen.ai",
                hashed_password=get_password_hash("DevVikramPass123!"),
                role_id="industry",
                first_name="Vikram",
                last_name="Malhotra",
                is_active=True,
                is_verified=True
            )
            session.add(u_vikram)
            await session.flush()

        ind_vikram = await session.get(IndustryUser, "ind-nextgen-recruiter")
        if not ind_vikram:
            session.add(IndustryUser(
                id="ind-nextgen-recruiter",
                user_id="usr-vikram-malhotra",
                company_id="cmp-nextgen-labs",
                designation="Head of Talent & Engineering",
                department="Global Recruitment"
            ))
            await session.flush()

        u_sk = await session.get(User, "usr-sk-gupta")
        if not u_sk:
            session.add(User(
                id="usr-sk-gupta",
                email="tpo@iitd.ac.in",
                hashed_password=get_password_hash("DevDeanPass123!"),
                role_id="institution",
                first_name="Prof. S. K.",
                last_name="Gupta",
                is_active=True,
                is_verified=True
            ))
            await session.flush()

        u_ramesh = await session.get(User, "usr-ramesh-chandra")
        if not u_ramesh:
            session.add(User(
                id="usr-ramesh-chandra",
                email="rchandra@iitd.ac.in",
                hashed_password=get_password_hash("DevProfPass123!"),
                role_id="faculty",
                first_name="Dr. Ramesh",
                last_name="Chandra",
                is_active=True,
                is_verified=True
            ))
            await session.flush()

        fac_ramesh = await session.get(Faculty, "fac-ramesh-chandra")
        if not fac_ramesh:
            session.add(Faculty(
                id="fac-ramesh-chandra",
                user_id="usr-ramesh-chandra",
                institution_id="inst-iit-delhi",
                department_id="dept-iitd-cse",
                designation="Associate Professor",
                specialization="Distributed Systems & Graph Database Architecture"
            ))
            await session.flush()

        u_admin = await session.get(User, "usr-super-admin")
        if not u_admin:
            session.add(User(
                id="usr-super-admin",
                email="admin@skillsetu.in",
                hashed_password=get_password_hash("DevAdminPass123!"),
                role_id="admin",
                first_name="Platform",
                last_name="Admin",
                is_active=True,
                is_verified=True
            ))
            await session.flush()

        # ----------------------------------------------------------------------
        # 3. Seed Canonical Domains & Categories (GENERAL + AYUSH)
        # ----------------------------------------------------------------------
        print("4. Seeding canonical domains...")
        domains_data = [
            ("dom-general", "GENERAL", "General Engineering, Technology & Applied Sciences",
             "Academic and industry competencies spanning software, data, cloud, architecture, and core engineering."),
            ("dom-ayush", "AYUSH", "Ayurveda, Yoga & Naturopathy, Unani, Siddha and Homoeopathy",
             "Traditional Indian medicine, clinical therapeutics, diagnostic protocols, and natural pharmacopeia aligned with National Commission standards.")
        ]
        for d_id, code, name, desc in domains_data:
            d = await session.get(Domain, d_id)
            if not d:
                session.add(Domain(id=d_id, code=code, name=name, description=desc, status="ACTIVE"))
            else:
                d.name = name
                d.description = desc
        await session.flush()

        print("5. Seeding canonical categories...")
        categories_data = [
            # GENERAL Domain Categories
            ("cat-swe", "dom-general", "CAT-SWE", "Software Engineering", "software-engineering",
             "Programming languages, software design patterns, fullstack frameworks, and code construction."),
            ("cat-data-ai", "dom-general", "CAT-DATA-AI", "Data & Artificial Intelligence", "data-artificial-intelligence",
             "Relational databases, property graph databases, query optimization, machine learning, and AI pipelines."),
            ("cat-cloud-devops", "dom-general", "CAT-CLOUD-DEVOPS", "Cloud & Infrastructure", "cloud-infrastructure",
             "Containerization, distributed systems, continuous deployment, and infrastructure orchestration."),
            # AYUSH Domain Categories
            ("cat-ayurveda", "dom-ayush", "CAT-AYURVEDA", "Ayurvedic Clinical Methods", "ayurvedic-clinical-methods",
             "Classical diagnostic protocols, Prakriti-Vikriti assessment, Nadi Pariksha, and formulation dynamics."),
            ("cat-yoga", "dom-ayush", "CAT-YOGA", "Yoga & Mind-Body Therapeutics", "yoga-mind-body-therapeutics",
             "Therapeutic asana mechanics, pranayama respiratory regulation, and psychosomatic wellness protocols."),
            ("cat-panchakarma", "dom-ayush", "CAT-PANCHAKARMA", "Panchakarma & Classical Therapies", "panchakarma-classical-therapies",
             "Classical bio-purification, preparatory snehana-swedana, and post-procedural dietary rehabilitation.")
        ]
        for c_id, dom_id, code, name, slug, desc in categories_data:
            c = await session.get(Category, c_id)
            if not c:
                session.add(Category(id=c_id, domain_id=dom_id, code=code, name=name, slug=slug, description=desc, status="ACTIVE"))
            else:
                c.domain_id = dom_id
                c.name = name
                c.slug = slug
                c.description = desc
        await session.flush()

        # ----------------------------------------------------------------------
        # 4. Seed Canonical Competencies
        # ----------------------------------------------------------------------
        print("6. Seeding canonical competencies...")
        comps_data = [
            # GENERAL Competencies
            ("comp-python", "dom-general", "cat-swe", "Python Engineering", "python-engineering", "COMP-PYTHON",
             "Core Technical", "Intermediate", "CPython runtime internals, OOP architecture, and asynchronous event loops.", "SYSTEM"),
            ("comp-fastapi", "dom-general", "cat-swe", "FastAPI Backend Architecture", "fastapi-backend-architecture", "COMP-FASTAPI",
             "Core Technical", "Intermediate", "High-performance asynchronous REST microservices and OpenAPI schemas.", "SYSTEM"),
            ("comp-react", "dom-general", "cat-swe", "React & Next.js Ecosystem", "react-nextjs-ecosystem", "COMP-REACT",
             "Core Technical", "Advanced", "Modern App Router, server-side rendering, and React state architectures.", "SYSTEM"),
            ("comp-neo4j", "dom-general", "cat-data-ai", "Neo4j Graph DB & Cypher", "neo4j-graph-db-cypher", "COMP-NEO4J",
             "Architectural", "Advanced", "Property graph ontology modeling, Cypher multi-hop traversals, and APOC algorithms.", "SYSTEM"),
            ("comp-postgres", "dom-general", "cat-data-ai", "PostgreSQL Architecture", "postgresql-architecture", "COMP-POSTGRES",
             "Architectural", "Intermediate", "ACID transactions, B-Tree index optimization, and relational constraints.", "SYSTEM"),
            ("comp-docker", "dom-general", "cat-cloud-devops", "Docker & Cloud Deployments", "docker-cloud-deployments", "COMP-DOCKER",
             "DevOps", "Intermediate", "Multi-stage container optimization, compose orchestration, and CI/CD deployment.", "SYSTEM"),
            ("comp-dist-sys", "dom-general", "cat-cloud-devops", "Distributed Systems Architecture", "distributed-systems-architecture", "COMP-DIST-SYS",
             "Architectural", "Advanced", "CAP theorem trade-offs, message brokering, idempotency, and partition tolerance.", "SYSTEM"),

            # AYUSH Competencies
            ("comp-nadi-pariksha", "dom-ayush", "cat-ayurveda", "Nadi Pariksha & Pulse Diagnostics", "nadi-pariksha-pulse-diagnostics", "COMP-NADI-PARIKSHA",
             "Clinical Diagnostics", "Advanced", "Radial pulse tactile sensing for Tridosha equilibrium evaluation and pre-pathological detection.", "AYUSH_MINISTRY"),
            ("comp-dravyaguna", "dom-ayush", "cat-ayurveda", "Dravyaguna & Ayurvedic Pharmacology", "dravyaguna-ayurvedic-pharmacology", "COMP-DRAVYAGUNA",
             "Pharmacology", "Intermediate", "Medicinal plant identification, Rasa-Panchaka analysis, and classical polyherbal formulations.", "AYUSH_MINISTRY"),
            ("comp-yoga-therapy", "dom-ayush", "cat-yoga", "Clinical Asana & Pranayama Protocols", "clinical-asana-pranayama-protocols", "COMP-YOGA-THERAPY",
             "Therapeutics", "Intermediate", "Prescriptive therapeutic yogic postures and controlled respiratory mechanics for lifestyle disorders.", "AYUSH_MINISTRY"),
            ("comp-panchakarma", "dom-ayush", "cat-panchakarma", "Panchakarma Protocol & Bio-Purification", "panchakarma-protocol-bio-purification", "COMP-PANCHAKARMA",
             "Therapeutics", "Advanced", "Purvakarma preparation, Pradhanakarma administration, and Paschatkarma dietary recuperation.", "AYUSH_MINISTRY")
        ]
        for cid, dom_id, cat_id, name, slug, code, cat_label, diff, desc, src in comps_data:
            c = await session.get(Competency, cid)
            if not c:
                c = Competency(
                    id=cid,
                    domain_id=dom_id,
                    category_id=cat_id,
                    name=name,
                    slug=slug,
                    code=code,
                    category=cat_label,
                    difficulty_level=diff,
                    description=desc,
                    status="ACTIVE",
                    source_type=src
                )
                session.add(c)
            else:
                c.domain_id = dom_id
                c.category_id = cat_id
                c.name = name
                c.slug = slug
                c.code = code
                c.category = cat_label
                c.difficulty_level = diff
                c.description = desc
                c.status = "ACTIVE"
                c.source_type = src
        await session.flush()

        # ----------------------------------------------------------------------
        # 5. Seed Canonical Skills & M:N Mappings
        # ----------------------------------------------------------------------
        print("7. Seeding canonical skills & skill_competencies...")
        skills_data = [
            # GENERAL Skills
            ("sk-py-oop", "dom-general", "comp-python", "Python OOP & Metaprogramming", "python-oop", "Class inheritance, magic methods, and metaclasses."),
            ("sk-async-io", "dom-general", "comp-python", "Asynchronous I/O & Event Loops", "async-io", "Non-blocking concurrency using asyncio and coroutines."),
            ("sk-fastapi-schemas", "dom-general", "comp-fastapi", "FastAPI Pydantic Schemas", "fastapi-schemas", "Request validation and response serialization."),
            ("sk-react-rsc", "dom-general", "comp-react", "React Server Components", "react-server-components", "Hybrid client-server streaming and layouts."),
            ("sk-cypher-traversal", "dom-general", "comp-neo4j", "Cypher Multi-Hop Querying", "cypher-traversals", "Graph pattern matching and relationship traversal."),
            ("sk-pg-indexing", "dom-general", "comp-postgres", "PostgreSQL Index Tuning", "relational-indexing", "B-Tree, GIN, and composite query optimization."),
            ("sk-docker-multistage", "dom-general", "comp-docker", "Multi-stage Docker Builds", "multistage-containers", "Lean, security-hardened container images."),
            ("sk-dist-consensus", "dom-general", "comp-dist-sys", "Distributed Consensus Protocols", "distributed-consensus", "Raft and Paxos state machine coordination."),

            # AYUSH Skills
            ("sk-pulse-rhythm", "dom-ayush", "comp-nadi-pariksha", "Pulse Rhythm Interpretation", "pulse-rhythm-interpretation", "Gati tactile rhythm reading at radial artery."),
            ("sk-dosha-imbalance", "dom-ayush", "comp-nadi-pariksha", "Dosha Imbalance Assessment", "dosha-imbalance-assessment", "Vata, Pitta, and Kapha sub-dosha imbalance identification."),
            ("sk-rasa-panchaka", "dom-ayush", "comp-dravyaguna", "Rasa-Guna-Virya Analysis", "rasa-guna-analysis", "Pharmacological pharmacodynamics of crude herbal drugs."),
            ("sk-herbal-poly", "dom-ayush", "comp-dravyaguna", "Polyherbal Formulation", "polyherbal-formulation", "Synergistic decoction, churnas, and asava formulation."),
            ("sk-pranayama-bio", "dom-ayush", "comp-yoga-therapy", "Pranayama Biofeedback Monitoring", "pranayama-biofeedback", "Autonomic nervous system stabilization through rhythmic respiration."),
            ("sk-asana-kinesiology", "dom-ayush", "comp-yoga-therapy", "Therapeutic Asana Alignment", "therapeutic-asana-alignment", "Biomechanics and posture modification for musculoskeletal rehab."),
            ("sk-snehana-admin", "dom-ayush", "comp-panchakarma", "Snehana Administration", "snehana-administration", "Internal and external oleation protocols."),
            ("sk-swedana-thermal", "dom-ayush", "comp-panchakarma", "Swedana Thermal Regulation", "swedana-thermal-regulation", "Controlled sudation and steam detoxification.")
        ]
        for sk_id, dom_id, comp_id, name, slug, desc in skills_data:
            sk = await session.get(Skill, sk_id)
            if not sk:
                sk = Skill(
                    id=sk_id,
                    domain_id=dom_id,
                    competency_id=comp_id,
                    name=name,
                    slug=slug,
                    description=desc,
                    status="ACTIVE"
                )
                session.add(sk)
            else:
                sk.domain_id = dom_id
                sk.competency_id = comp_id
                sk.name = name
                sk.slug = slug
                sk.description = desc
                sk.status = "ACTIVE"
        await session.flush()

        # Seed M:N mappings in skill_competencies
        skill_comp_mappings = [
            ("sk-py-oop", "comp-python", 1.0, True),
            ("sk-async-io", "comp-python", 0.95, True),
            ("sk-async-io", "comp-fastapi", 0.90, False),  # Cross-competency mapping!
            ("sk-fastapi-schemas", "comp-fastapi", 1.0, True),
            ("sk-react-rsc", "comp-react", 1.0, True),
            ("sk-cypher-traversal", "comp-neo4j", 1.0, True),
            ("sk-pg-indexing", "comp-postgres", 1.0, True),
            ("sk-docker-multistage", "comp-docker", 1.0, True),
            ("sk-dist-consensus", "comp-dist-sys", 1.0, True),
            ("sk-pulse-rhythm", "comp-nadi-pariksha", 1.0, True),
            ("sk-dosha-imbalance", "comp-nadi-pariksha", 1.0, True),
            ("sk-dosha-imbalance", "comp-panchakarma", 0.85, False),  # Cross-competency!
            ("sk-rasa-panchaka", "comp-dravyaguna", 1.0, True),
            ("sk-herbal-poly", "comp-dravyaguna", 1.0, True),
            ("sk-pranayama-bio", "comp-yoga-therapy", 1.0, True),
            ("sk-asana-kinesiology", "comp-yoga-therapy", 1.0, True),
            ("sk-snehana-admin", "comp-panchakarma", 1.0, True),
            ("sk-swedana-thermal", "comp-panchakarma", 1.0, True),
        ]
        for sk_id, comp_id, weight, is_pri in skill_comp_mappings:
            sc_map_id = f"scm-{sk_id}-{comp_id}"
            scm = await session.get(SkillCompetency, sc_map_id)
            if not scm:
                session.add(SkillCompetency(
                    id=sc_map_id,
                    skill_id=sk_id,
                    competency_id=comp_id,
                    relevance_weight=weight,
                    is_primary=is_pri
                ))
        await session.flush()

        # ----------------------------------------------------------------------
        # 5b. Seed Canonical Skill Aliases (Synonyms / Raw Mentions)
        # ----------------------------------------------------------------------
        print("7b. Seeding canonical skill_aliases...")
        from app.domains.competencies.normalization import normalize_skill_text
        aliases_data = [
            # React.js aliases
            ("al-react-1", "sk-react-rsc", "React", normalize_skill_text("React")),
            ("al-react-2", "sk-react-rsc", "ReactJS", normalize_skill_text("ReactJS")),
            ("al-react-3", "sk-react-rsc", "React JS", normalize_skill_text("React JS")),
            ("al-react-4", "sk-react-rsc", "react.js", normalize_skill_text("react.js")),
            # Python aliases
            ("al-py-1", "sk-py-oop", "Python", normalize_skill_text("Python")),
            ("al-py-2", "sk-py-oop", "Python 3", normalize_skill_text("Python 3")),
            ("al-py-3", "sk-py-oop", "Python OOP", normalize_skill_text("Python OOP")),
            ("al-py-4", "sk-async-io", "AsyncIO", normalize_skill_text("AsyncIO")),
            ("al-py-5", "sk-async-io", "Async IO", normalize_skill_text("Async IO")),
            # FastAPI aliases
            ("al-fa-1", "sk-fastapi-schemas", "FastAPI", normalize_skill_text("FastAPI")),
            ("al-fa-2", "sk-fastapi-schemas", "Fast API", normalize_skill_text("Fast API")),
            ("al-fa-3", "sk-fastapi-schemas", "FastAPI REST", normalize_skill_text("FastAPI REST")),
            # PostgreSQL aliases
            ("al-pg-1", "sk-pg-indexing", "Postgres", normalize_skill_text("Postgres")),
            ("al-pg-2", "sk-pg-indexing", "PostgreSQL", normalize_skill_text("PostgreSQL")),
            ("al-pg-3", "sk-pg-indexing", "Postgres DB", normalize_skill_text("Postgres DB")),
            # Docker aliases
            ("al-dk-1", "sk-docker-multistage", "Docker", normalize_skill_text("Docker")),
            ("al-dk-2", "sk-docker-multistage", "Docker Containers", normalize_skill_text("Docker Containers")),
            # AYUSH aliases
            ("al-np-1", "sk-pulse-rhythm", "Pulse Reading", normalize_skill_text("Pulse Reading")),
            ("al-np-2", "sk-pulse-rhythm", "Pulse Diagnostics", normalize_skill_text("Pulse Diagnostics")),
            ("al-np-3", "sk-pulse-rhythm", "Nadi Parikshan", normalize_skill_text("Nadi Parikshan")),
            ("al-np-4", "sk-pulse-rhythm", "Nadi Pariksha", normalize_skill_text("Nadi Pariksha")),
            ("al-di-1", "sk-dosha-imbalance", "Tridosha Assessment", normalize_skill_text("Tridosha Assessment")),
            ("al-di-2", "sk-dosha-imbalance", "Dosha Imbalance", normalize_skill_text("Dosha Imbalance")),
            ("al-dg-1", "sk-rasa-panchaka", "Ayurvedic Pharmacology", normalize_skill_text("Ayurvedic Pharmacology")),
            ("al-dg-2", "sk-rasa-panchaka", "Dravyaguna", normalize_skill_text("Dravyaguna")),
            ("al-pk-1", "sk-snehana-admin", "Panchakarma Snehana", normalize_skill_text("Panchakarma Snehana")),
            ("al-pk-2", "sk-swedana-thermal", "Panchakarma Swedana", normalize_skill_text("Panchakarma Swedana")),
            ("al-yo-1", "sk-pranayama-bio", "Pranayama Breathwork", normalize_skill_text("Pranayama Breathwork")),
            ("al-yo-2", "sk-asana-kinesiology", "Therapeutic Yoga", normalize_skill_text("Therapeutic Yoga"))
        ]
        for a_id, sk_id, a_name, norm_a in aliases_data:
            a = await session.get(SkillAlias, a_id)
            if not a:
                session.add(SkillAlias(
                    id=a_id,
                    skill_id=sk_id,
                    alias_name=a_name,
                    normalized_alias=norm_a,
                    source_type="SYSTEM",
                    status="ACTIVE"
                ))
            else:
                a.skill_id = sk_id
                a.alias_name = a_name
                a.normalized_alias = norm_a
                a.source_type = "SYSTEM"
                a.status = "ACTIVE"
        await session.flush()

        # ----------------------------------------------------------------------
        # 6. Seed Canonical Roles Catalog & Role Competency Requirements
        # ----------------------------------------------------------------------
        print("8. Seeding canonical roles catalog & role requirements...")
        roles_catalog_data = [
            ("role-backend-dev", "dom-general", "Backend Developer", "backend-developer", "ROLE-BACKEND-DEV",
             "GENERAL", "Designs, implements, and maintains scalable server-side systems, APIs, and persistent databases."),
            ("role-ai-platform-eng", "dom-general", "AI Platform Engineer", "ai-platform-engineer", "ROLE-AI-ENG",
             "GENERAL", "Bridges software engineering and machine learning by building knowledge graphs, inference APIs, and data pipelines."),
            ("role-fullstack-dev", "dom-general", "Fullstack Engineer", "fullstack-engineer", "ROLE-FULLSTACK-DEV",
             "GENERAL", "Builds end-to-end web applications with modern frontend architectures and high-performance backends."),
            ("role-ayurveda-specialist", "dom-ayush", "Ayurvedic Clinical Specialist", "ayurvedic-clinical-specialist", "ROLE-AYURVEDA-CLINICAL",
             "AYUSH", "Performs classical clinical assessments, Nadi Pariksha, and designs targeted therapeutic formulations."),
            ("role-yoga-consultant", "dom-ayush", "Yoga Therapy Consultant", "yoga-therapy-consultant", "ROLE-YOGA-CONSULTANT",
             "AYUSH", "Prescribes therapeutic yoga practices, respiratory mechanics, and lifestyle modulation for clinical wellness.")
        ]
        for r_id, dom_id, title, slug, code, dom_str, desc in roles_catalog_data:
            r = await session.get(RolesCatalog, r_id)
            if not r:
                r = RolesCatalog(
                    id=r_id,
                    domain_id=dom_id,
                    title=title,
                    slug=slug,
                    code=code,
                    domain=dom_str,
                    description=desc,
                    status="ACTIVE"
                )
                session.add(r)
            else:
                r.domain_id = dom_id
                r.title = title
                r.slug = slug
                r.code = code
                r.domain = dom_str
                r.description = desc
                r.status = "ACTIVE"
        await session.flush()

        role_requirements_data = [
            # Backend Developer Requirements
            ("rcr-be-py", "role-backend-dev", "comp-python", "ADVANCED", "MUST_HAVE", 1.0, "Core language mastery"),
            ("rcr-be-fastapi", "role-backend-dev", "comp-fastapi", "ADVANCED", "MUST_HAVE", 1.0, "API microservices framework"),
            ("rcr-be-pg", "role-backend-dev", "comp-postgres", "INTERMEDIATE", "MUST_HAVE", 0.9, "Relational modeling and transaction safety"),
            ("rcr-be-docker", "role-backend-dev", "comp-docker", "INTERMEDIATE", "SHOULD_HAVE", 0.7, "Containerized deployments"),
            ("rcr-be-dist", "role-backend-dev", "comp-dist-sys", "INTERMEDIATE", "OPTIONAL", 0.5, "High-scale partition handling"),

            # AI Platform Engineer Requirements
            ("rcr-ai-py", "role-ai-platform-eng", "comp-python", "ADVANCED", "MUST_HAVE", 1.0, "Pipeline engineering"),
            ("rcr-ai-neo4j", "role-ai-platform-eng", "comp-neo4j", "ADVANCED", "MUST_HAVE", 1.0, "Ontology and knowledge graph querying"),
            ("rcr-ai-fastapi", "role-ai-platform-eng", "comp-fastapi", "INTERMEDIATE", "SHOULD_HAVE", 0.8, "Inference serving"),

            # Ayurvedic Clinical Specialist Requirements
            ("rcr-ay-nadi", "role-ayurveda-specialist", "comp-nadi-pariksha", "ADVANCED", "MUST_HAVE", 1.0, "Primary diagnostic modality"),
            ("rcr-ay-dravya", "role-ayurveda-specialist", "comp-dravyaguna", "ADVANCED", "MUST_HAVE", 0.95, "Herbal pharmacology and interactions"),
            ("rcr-ay-pancha", "role-ayurveda-specialist", "comp-panchakarma", "INTERMEDIATE", "SHOULD_HAVE", 0.8, "Detoxification therapy supervision"),

            # Yoga Therapy Consultant Requirements
            ("rcr-yo-therapy", "role-yoga-consultant", "comp-yoga-therapy", "EXPERT", "MUST_HAVE", 1.0, "Prescriptive kinesiology and pranayama"),
            ("rcr-yo-nadi", "role-yoga-consultant", "comp-nadi-pariksha", "BEGINNER", "OPTIONAL", 0.5, "Diagnostic correlation")
        ]
        for rcr_id, r_id, c_id, prof, req_type, weight, notes in role_requirements_data:
            rcr = await session.get(RoleCompetencyRequirement, rcr_id)
            if not rcr:
                session.add(RoleCompetencyRequirement(
                    id=rcr_id,
                    role_id=r_id,
                    competency_id=c_id,
                    required_proficiency=prof,
                    requirement_type=req_type,
                    weight=weight,
                    notes=notes
                ))
            else:
                rcr.required_proficiency = prof
                rcr.requirement_type = req_type
                rcr.weight = weight
                rcr.notes = notes
        await session.flush()

        # ----------------------------------------------------------------------
        # 7. Seed Competency Relationships (Graph Edges)
        # ----------------------------------------------------------------------
        print("9. Seeding competency relationships...")
        relationships_data = [
            ("crel-py-fastapi", "comp-python", "comp-fastapi", "PREREQUISITE_FOR", 1.0),
            ("crel-fastapi-dist", "comp-fastapi", "comp-dist-sys", "PREREQUISITE_FOR", 0.85),
            ("crel-pg-fastapi", "comp-postgres", "comp-fastapi", "COMPLEMENTS", 0.90),
            ("crel-neo4j-dist", "comp-neo4j", "comp-dist-sys", "SPECIALIZATION_OF", 0.80),
            ("crel-nadi-pancha", "comp-nadi-pariksha", "comp-panchakarma", "PREREQUISITE_FOR", 0.95),
            ("crel-dravya-pancha", "comp-dravyaguna", "comp-panchakarma", "COMPLEMENTS", 0.90),
            ("crel-nadi-yoga", "comp-nadi-pariksha", "comp-yoga-therapy", "COMPLEMENTS", 0.70)
        ]
        for rel_id, src_id, tgt_id, rtype, weight in relationships_data:
            crel = await session.get(CompetencyRelationship, rel_id)
            if not crel:
                session.add(CompetencyRelationship(
                    id=rel_id,
                    source_competency_id=src_id,
                    target_competency_id=tgt_id,
                    relationship_type=rtype,
                    weight=weight,
                    status="ACTIVE"
                ))
            else:
                crel.relationship_type = rtype
                crel.weight = weight
                crel.status = "ACTIVE"
        await session.flush()

        # ----------------------------------------------------------------------
        # 8. Seed Student Competencies for Aarav Sharma (Preserved)
        # ----------------------------------------------------------------------
        print("10. Seeding student competencies for Aarav Sharma...")
        student_comps = [
            ("comp-python", "Advanced", 92.0, 0.95, True),
            ("comp-fastapi", "Intermediate", 85.0, 0.88, True),
            ("comp-react", "Advanced", 88.0, 0.90, True),
            ("comp-neo4j", "Intermediate", 78.0, 0.80, False),
            ("comp-docker", "Intermediate", 80.0, 0.85, True),
        ]
        for comp_id, prof, score, conf, verified in student_comps:
            sc_id = f"sc-{comp_id}-aarav"
            existing = await session.get(StudentCompetency, sc_id)
            if not existing:
                session.add(StudentCompetency(
                    id=sc_id,
                    student_id="stu-aarav-sharma",
                    competency_id=comp_id,
                    proficiency_level=prof,
                    score=score,
                    confidence_score=conf,
                    is_verified=verified,
                    verified_at=datetime.now(timezone.utc) if verified else None
                ))
        await session.flush()

        print("10b. Seeding student competencies for Priya Patel (AYUSH)...")
        priya_comps = [
            ("comp-nadi-pariksha", "Advanced", 91.0, 0.96, True),
            ("comp-dravyaguna", "Advanced", 87.0, 0.90, True),
            ("comp-panchakarma", "Intermediate", 82.0, 0.85, True),
        ]
        for comp_id, prof, score, conf, verified in priya_comps:
            sc_id = f"sc-{comp_id}-priya"
            existing = await session.get(StudentCompetency, sc_id)
            if not existing:
                session.add(StudentCompetency(
                    id=sc_id,
                    student_id="stu-priya-patel",
                    competency_id=comp_id,
                    proficiency_level=prof,
                    score=score,
                    confidence_score=conf,
                    is_verified=verified,
                    verified_at=datetime.now(timezone.utc) if verified else None
                ))
        await session.flush()


        # ----------------------------------------------------------------------
        # 9. Seed Projects, Live Opportunities & Evidence
        # ----------------------------------------------------------------------
        print("11. Seeding projects, opportunities, and evidence...")
        projects_data = [
            ("proj-1", "SkillSetu - Knowledge Graph & Matchmaking Engine",
             "Built hybrid Neo4j + PostgreSQL architecture for real-time competency-to-opportunity matching.",
             "https://github.com/aarav/skillsetu", "https://skillsetu.vercel.app", True, ["Python", "FastAPI", "Neo4j", "React"]),
            ("proj-2", "Cloud Distributed Log Aggregator",
             "High-throughput log pipeline processing 50k events/sec using Redis and FastAPI.",
             "https://github.com/aarav/log-stream", None, True, ["Python", "Docker", "FastAPI"])
        ]
        for pid, title, summary, repo, live, verified, skills in projects_data:
            existing = await session.get(Project, pid)
            if not existing:
                session.add(Project(
                    id=pid,
                    student_id="stu-aarav-sharma",
                    title=title,
                    summary=summary,
                    repo_url=repo,
                    live_url=live,
                    is_verified=verified,
                    demonstrated_skills=skills
                ))

        priya_proj = await session.get(Project, "proj-priya-1")
        if not priya_proj:
            session.add(Project(
                id="proj-priya-1",
                student_id="stu-priya-patel",
                title="Pulse Waveform Clinical Diagnostic Engine",
                summary="Digital interpretation of radial artery pulse patterns according to Ayurvedic clinical principles.",
                repo_url="https://github.com/priya-patel-ayush/nadi-pulse",
                live_url="https://nadi-diagnostics.ayush.org",
                is_verified=True,
                demonstrated_skills=["Pulse Reading", "Dravyaguna Herbology", "Herbal Formulation"]
            ))
        await session.flush()

        opp1 = await session.get(Opportunity, "opp-nextgen-001")
        if not opp1:
            session.add(Opportunity(
                id="opp-nextgen-001",
                company_id="cmp-nextgen-labs",
                title="Full Stack AI Platform Engineer",
                type="INTERNSHIP",
                stipend_or_salary="₹45,000 / month",
                location="Bengaluru (Hybrid)",
                work_mode="HYBRID",
                openings=3,
                status="ACTIVE",
                description="We are seeking a talented full-stack engineer with expertise in FastAPI, React/Next.js, and knowledge graph representations to build real-time AI portals.",
                required_competencies=[
                    {"name": "FastAPI", "importance": "MANDATORY", "weight": 1.0},
                    {"name": "React & Next.js", "importance": "MANDATORY", "weight": 0.95},
                    {"name": "Neo4j Graph DB", "importance": "PREFERRED", "weight": 0.8},
                    {"name": "Docker & DevOps", "importance": "BONUS", "weight": 0.6}
                ]
            ))
        await session.flush()

        evi1 = await session.get(Evidence, "evi-001")
        if not evi1:
            evi1 = Evidence(
                id="evi-001",
                student_id="stu-aarav-sharma",
                entity_type="PROJECT",
                entity_id="proj-1",
                title="SkillSetu Backend API Gateway Code Attestation",
                uri="https://github.com/aarav/skillsetu",
                sha256_hash="0x8f2a9c41d3e8b091f62e8412e84193b2a8f94101e479102cba8921df67184201",
                trust_score=0.95,
                verification_status="VERIFIED"
            )
            session.add(evi1)
            await session.flush()

            session.add(EvidenceVerification(
                id="eviv-001",
                evidence_id="evi-001",
                verifier_id="usr-ramesh-chandra",
                verifier_role="faculty",
                status="APPROVED",
                remarks="Verified repository architecture, async database sessions, and code quality tests.",
                attestation_digest="sig_ramesh_chandra_iitd_verified"
            ))

        await session.commit()
        print("SUCCESS! Deterministic canonical seeding completed cleanly into PostgreSQL 16.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_database())
