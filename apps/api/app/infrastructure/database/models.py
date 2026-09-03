import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, Text, Integer, Float, Date, DateTime,
    ForeignKey, Table, JSON, UniqueConstraint, Index, CheckConstraint
)
from sqlalchemy.orm import relationship
from app.infrastructure.database.session import Base

def gen_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

# ------------------------------------------------------------------------------
# 1. Identity & RBAC Models
# ------------------------------------------------------------------------------

class Role(Base):
    __tablename__ = "roles"
    id = Column(String(50), primary_key=True)  # 'student', 'industry', 'institution', 'faculty', 'admin'
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    users = relationship("User", back_populates="role")

class Permission(Base):
    __tablename__ = "permissions"
    id = Column(String(100), primary_key=True)
    name = Column(String(150), nullable=False)
    module = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role_id = Column(String(50), ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    role = relationship("Role", back_populates="users")
    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    faculty_profile = relationship("Faculty", back_populates="user", uselist=False, cascade="all, delete-orphan")
    industry_profile = relationship("IndustryUser", back_populates="user", uselist=False, cascade="all, delete-orphan")

# ------------------------------------------------------------------------------
# 2. Institutional Hierarchy
# ------------------------------------------------------------------------------

class Institution(Base):
    __tablename__ = "institutions"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    aishe_code = Column(String(50), nullable=True)
    type = Column(String(50), default="University")
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)
    accreditation = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    departments = relationship("Department", back_populates="institution", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="institution")
    faculty = relationship("Faculty", back_populates="institution")

class Department(Base):
    __tablename__ = "departments"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(50), nullable=False)
    hod_name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    institution = relationship("Institution", back_populates="departments")
    students = relationship("Student", back_populates="department")

    __table_args__ = (
        UniqueConstraint('institution_id', 'code', name='uq_department_institution_code'),
    )

# ------------------------------------------------------------------------------
# 3. Stakeholder Profiles
# ------------------------------------------------------------------------------

class Student(Base):
    __tablename__ = "students"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="SET NULL"), nullable=True, index=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    enrollment_number = Column(String(100), unique=True, nullable=True, index=True)
    current_year = Column(Integer, default=1)
    graduation_year = Column(Integer, nullable=True)
    cgpa = Column(Float, nullable=True)
    bio = Column(Text, nullable=True)
    github_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    portfolio_url = Column(String(255), nullable=True)
    resume_url = Column(Text, nullable=True)
    readiness_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="student_profile")
    institution = relationship("Institution", back_populates="students")
    department = relationship("Department", back_populates="students")
    competencies = relationship("StudentCompetency", back_populates="student", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="student", cascade="all, delete-orphan")
    internships = relationship("Internship", back_populates="student", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="student", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="student", cascade="all, delete-orphan")
    assessment_results = relationship("AssessmentResult", back_populates="student", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")

class Faculty(Base):
    __tablename__ = "faculty"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    institution_id = Column(String(36), ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id = Column(String(36), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    designation = Column(String(100), nullable=True)
    specialization = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="faculty_profile")
    institution = relationship("Institution", back_populates="faculty")

class Company(Base):
    __tablename__ = "companies"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    cin = Column(String(50), nullable=True)
    industry_type = Column(String(100), nullable=True)
    size_range = Column(String(50), nullable=True)
    website = Column(String(255), nullable=True)
    logo_url = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    industry_users = relationship("IndustryUser", back_populates="company", cascade="all, delete-orphan")
    opportunities = relationship("Opportunity", back_populates="company", cascade="all, delete-orphan")
    blueprints = relationship("OpportunityBlueprint", back_populates="company", cascade="all, delete-orphan")

class IndustryUser(Base):
    __tablename__ = "industry_users"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    designation = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="industry_profile")
    company = relationship("Company", back_populates="industry_users")

# ------------------------------------------------------------------------------
# 4. Competency Ontology & Taxonomy
# ------------------------------------------------------------------------------

class Domain(Base):
    __tablename__ = "domains"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    code = Column(String(50), unique=True, nullable=False, index=True)  # 'GENERAL', 'AYUSH'
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="ACTIVE", nullable=False)  # ACTIVE, DEPRECATED
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    categories = relationship("Category", back_populates="domain", cascade="all, delete-orphan")
    competencies = relationship("Competency", back_populates="domain_rel")
    skills = relationship("Skill", back_populates="domain_rel")
    roles = relationship("RolesCatalog", back_populates="domain_rel")

class Category(Base):
    __tablename__ = "categories"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    domain_id = Column(String(36), ForeignKey("domains.id", ondelete="CASCADE"), nullable=False, index=True)
    code = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="ACTIVE", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    domain = relationship("Domain", back_populates="categories")
    competencies = relationship("Competency", back_populates="category_rel", cascade="all, delete-orphan")

class RolesCatalog(Base):
    __tablename__ = "roles_catalog"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    domain_id = Column(String(36), ForeignKey("domains.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(150), unique=True, nullable=False)
    slug = Column(String(150), unique=True, nullable=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    domain = Column(String(100), nullable=False)  # Preserved string
    description = Column(Text, nullable=True)
    status = Column(String(20), default="ACTIVE", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    domain_rel = relationship("Domain", back_populates="roles")
    competency_requirements = relationship("RoleCompetencyRequirement", back_populates="role", cascade="all, delete-orphan")

class Competency(Base):
    __tablename__ = "competencies"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    domain_id = Column(String(36), ForeignKey("domains.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id = Column(String(36), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(150), unique=True, nullable=False)
    slug = Column(String(150), unique=True, nullable=True, index=True)
    code = Column(String(50), unique=True, nullable=False)
    category = Column(String(100), nullable=True)  # Preserved category label for backward compatibility
    difficulty_level = Column(String(30), default="Intermediate")  # Beginner, Intermediate, Advanced, Expert
    description = Column(Text, nullable=True)
    status = Column(String(20), default="ACTIVE", nullable=False)
    source_type = Column(String(50), default="SYSTEM", nullable=False)  # SYSTEM, NCVET, AYUSH_MINISTRY, etc.
    source_reference = Column(String(255), nullable=True)
    embedding_vector = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    domain_rel = relationship("Domain", back_populates="competencies")
    category_rel = relationship("Category", back_populates="competencies")
    skills_legacy = relationship("Skill", back_populates="competency", foreign_keys="[Skill.competency_id]")
    skills = relationship("Skill", secondary="skill_competencies", back_populates="competencies", overlaps="competency,skills_legacy")
    skill_mappings = relationship("SkillCompetency", back_populates="competency", cascade="all, delete-orphan", overlaps="competencies,skills")
    student_competencies = relationship("StudentCompetency", back_populates="competency", cascade="all, delete-orphan")
    role_requirements = relationship("RoleCompetencyRequirement", back_populates="competency", cascade="all, delete-orphan")
    assessments = relationship("CompetencyAssessment", back_populates="competency", cascade="all, delete-orphan")
    learning_resources = relationship("LearningResource", back_populates="competency", cascade="all, delete-orphan")
    outgoing_relationships = relationship("CompetencyRelationship", foreign_keys="[CompetencyRelationship.source_competency_id]", back_populates="source_competency", cascade="all, delete-orphan")
    incoming_relationships = relationship("CompetencyRelationship", foreign_keys="[CompetencyRelationship.target_competency_id]", back_populates="target_competency", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    domain_id = Column(String(36), ForeignKey("domains.id", ondelete="SET NULL"), nullable=True, index=True)
    competency_id = Column(String(36), ForeignKey("competencies.id", ondelete="SET NULL"), nullable=True, index=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="ACTIVE", nullable=False)
    source_type = Column(String(50), default="SYSTEM", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    domain_rel = relationship("Domain", back_populates="skills")
    competency = relationship("Competency", back_populates="skills_legacy", foreign_keys=[competency_id])
    competencies = relationship("Competency", secondary="skill_competencies", back_populates="skills", overlaps="competency,skills_legacy")
    competency_mappings = relationship("SkillCompetency", back_populates="skill", cascade="all, delete-orphan", overlaps="competencies,skills")
    aliases = relationship("SkillAlias", back_populates="skill", cascade="all, delete-orphan")

class SkillAlias(Base):
    __tablename__ = "skill_aliases"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    alias_name = Column(String(150), nullable=False, index=True)
    normalized_alias = Column(String(150), nullable=False, index=True)
    source_type = Column(String(50), default="SYSTEM", nullable=False)
    status = Column(String(20), default="ACTIVE", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    skill = relationship("Skill", back_populates="aliases")

    __table_args__ = (
        UniqueConstraint('normalized_alias', name='uq_skill_alias_normalized'),
    )

class SkillCompetency(Base):
    __tablename__ = "skill_competencies"
    id = Column(String(64), primary_key=True, default=gen_uuid)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    competency_id = Column(String(36), ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False, index=True)
    relevance_weight = Column(Float, default=1.0)
    is_primary = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    skill = relationship("Skill", back_populates="competency_mappings", overlaps="competencies,skills")
    competency = relationship("Competency", back_populates="skill_mappings", overlaps="competencies,skills")

    __table_args__ = (
        UniqueConstraint('skill_id', 'competency_id', name='uq_skill_competency'),
    )

class RoleCompetencyRequirement(Base):
    __tablename__ = "role_competency_requirements"
    id = Column(String(64), primary_key=True, default=gen_uuid)
    role_id = Column(String(36), ForeignKey("roles_catalog.id", ondelete="CASCADE"), nullable=False, index=True)
    competency_id = Column(String(36), ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False, index=True)
    required_proficiency = Column(String(30), default="INTERMEDIATE", nullable=False)  # FOUNDATIONAL, BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    requirement_type = Column(String(30), default="MUST_HAVE", nullable=False)  # MUST_HAVE, SHOULD_HAVE, OPTIONAL
    weight = Column(Float, default=1.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    role = relationship("RolesCatalog", back_populates="competency_requirements")
    competency = relationship("Competency", back_populates="role_requirements")

    __table_args__ = (
        UniqueConstraint('role_id', 'competency_id', name='uq_role_competency_requirement'),
    )

class CompetencyRelationship(Base):
    __tablename__ = "competency_relationships"
    id = Column(String(64), primary_key=True, default=gen_uuid)
    source_competency_id = Column(String(36), ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False, index=True)
    target_competency_id = Column(String(36), ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(50), nullable=False)  # PREREQUISITE_FOR, SPECIALIZATION_OF, COMPLEMENTS, DERIVED_FROM
    weight = Column(Float, default=1.0)
    status = Column(String(20), default="ACTIVE", nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    source_competency = relationship("Competency", foreign_keys=[source_competency_id], back_populates="outgoing_relationships")
    target_competency = relationship("Competency", foreign_keys=[target_competency_id], back_populates="incoming_relationships")

    __table_args__ = (
        UniqueConstraint('source_competency_id', 'target_competency_id', 'relationship_type', name='uq_competency_relationship'),
        CheckConstraint('source_competency_id != target_competency_id', name='chk_no_self_competency_relationship'),
    )

# ------------------------------------------------------------------------------
# 5. Student Competency, Evidence & Assessment Models
# ------------------------------------------------------------------------------

class StudentCompetency(Base):
    __tablename__ = "student_competencies"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    competency_id = Column(String(36), ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False, index=True)
    proficiency_level = Column(String(30), default="Intermediate")
    score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.5)
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    student = relationship("Student", back_populates="competencies")
    competency = relationship("Competency", back_populates="student_competencies")

    __table_args__ = (
        UniqueConstraint('student_id', 'competency_id', name='uq_student_competency'),
    )

class CompetencyAssessment(Base):
    __tablename__ = "competency_assessments"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    competency_id = Column(String(36), ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, default=30)
    passing_score = Column(Float, default=70.0)
    questions = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    competency = relationship("Competency", back_populates="assessments")
    results = relationship("AssessmentResult", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentResult(Base):
    __tablename__ = "assessment_results"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    assessment_id = Column(String(36), ForeignKey("competency_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, nullable=False)
    passed = Column(Boolean, nullable=False)
    integrity_score = Column(Float, default=1.0)
    integrity_hash = Column(String(128), nullable=True)
    post_mortem_data = Column(JSON, nullable=True)
    completed_at = Column(DateTime(timezone=True), default=utc_now)

    assessment = relationship("CompetencyAssessment", back_populates="results")
    student = relationship("Student", back_populates="assessment_results")

class Project(Base):
    __tablename__ = "projects"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    summary = Column(Text, nullable=True)
    repo_url = Column(String(255), nullable=True)
    live_url = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    demonstrated_skills = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    student = relationship("Student", back_populates="projects")

class Internship(Base):
    __tablename__ = "internships"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    company_name = Column(String(200), nullable=False)
    role = Column(String(150), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_verified = Column(Boolean, default=False)
    certificate_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    student = relationship("Student", back_populates="internships")

class Certification(Base):
    __tablename__ = "certifications"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    issuing_organization = Column(String(200), nullable=False)
    issue_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=True)
    credential_id = Column(String(100), nullable=True)
    credential_url = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    student = relationship("Student", back_populates="certifications")

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False)  # 'PROJECT', 'ASSESSMENT', 'INTERNSHIP', 'CERTIFICATION'
    entity_id = Column(String(36), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    uri = Column(Text, nullable=True)
    sha256_hash = Column(String(128), nullable=True)
    trust_score = Column(Float, default=0.5)
    verification_status = Column(String(50), default="PENDING")  # 'PENDING', 'VERIFIED', 'REJECTED'
    created_at = Column(DateTime(timezone=True), default=utc_now)

    student = relationship("Student", back_populates="evidence_items")
    verifications = relationship("EvidenceVerification", back_populates="evidence", cascade="all, delete-orphan")

class EvidenceVerification(Base):
    __tablename__ = "evidence_verifications"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    evidence_id = Column(String(36), ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False, index=True)
    verifier_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    verifier_role = Column(String(50), nullable=False)  # 'faculty', 'industry', 'system'
    status = Column(String(50), nullable=False)  # 'APPROVED', 'REJECTED', 'IN_REVIEW'
    remarks = Column(Text, nullable=True)
    attestation_digest = Column(String(128), nullable=True)
    verified_at = Column(DateTime(timezone=True), default=utc_now)

    evidence = relationship("Evidence", back_populates="verifications")

# ------------------------------------------------------------------------------
# 6. Opportunities & Industry Blueprints
# ------------------------------------------------------------------------------

class Opportunity(Base):
    __tablename__ = "opportunities"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    type = Column(String(50), default="INTERNSHIP")  # 'INTERNSHIP', 'FULL_TIME', 'PROJECT'
    stipend_or_salary = Column(String(100), nullable=True)
    location = Column(String(150), nullable=True)
    work_mode = Column(String(50), default="REMOTE")  # 'REMOTE', 'HYBRID', 'ONSITE'
    openings = Column(Integer, default=1)
    status = Column(String(50), default="ACTIVE")  # 'ACTIVE', 'PAUSED', 'CLOSED'
    deadline = Column(DateTime(timezone=True), nullable=True)
    description = Column(Text, nullable=True)
    required_competencies = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    company = relationship("Company", back_populates="opportunities")
    applications = relationship("Application", back_populates="opportunity", cascade="all, delete-orphan")
    blueprints = relationship("OpportunityBlueprint", back_populates="opportunity", cascade="all, delete-orphan")

class OpportunityBlueprint(Base):
    __tablename__ = "opportunity_blueprints"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=True, index=True)
    role_title = Column(String(150), nullable=False)
    version = Column(Integer, default=1)
    status = Column(String(50), default="ACTIVE")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    company = relationship("Company", back_populates="blueprints")
    opportunity = relationship("Opportunity", back_populates="blueprints")
    competency_weights = relationship("OpportunityCompetency", back_populates="blueprint", cascade="all, delete-orphan")

class OpportunityCompetency(Base):
    __tablename__ = "opportunity_competencies"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    blueprint_id = Column(String(36), ForeignKey("opportunity_blueprints.id", ondelete="CASCADE"), nullable=False, index=True)
    competency_id = Column(String(36), ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False, index=True)
    importance = Column(String(30), default="MANDATORY")  # 'MANDATORY', 'PREFERRED', 'BONUS'
    min_proficiency = Column(String(30), default="Intermediate")
    weight = Column(Float, default=1.0)

    blueprint = relationship("OpportunityBlueprint", back_populates="competency_weights")

# ------------------------------------------------------------------------------
# 7. Applications, Placement & Outcomes
# ------------------------------------------------------------------------------

class Application(Base):
    __tablename__ = "applications"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="SUBMITTED")  # 'SUBMITTED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'ACCEPTED'
    match_score = Column(Float, default=0.0)
    match_breakdown = Column(JSON, nullable=True)
    applied_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    opportunity = relationship("Opportunity", back_populates="applications")
    student = relationship("Student", back_populates="applications")
    events = relationship("ApplicationEvent", back_populates="application", cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="application", cascade="all, delete-orphan")
    placement = relationship("Placement", back_populates="application", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('opportunity_id', 'student_id', name='uq_opportunity_student_application'),
    )

class ApplicationEvent(Base):
    __tablename__ = "application_events"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    from_status = Column(String(50), nullable=True)
    to_status = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    application = relationship("Application", back_populates="events")

class Interview(Base):
    __tablename__ = "interviews"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    mode = Column(String(50), default="VIRTUAL")
    meeting_url = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    status = Column(String(50), default="SCHEDULED")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    application = relationship("Application", back_populates="interviews")

class Placement(Base):
    __tablename__ = "placements"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False)
    package_offered = Column(String(100), nullable=True)
    offer_letter_url = Column(Text, nullable=True)
    accepted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    application = relationship("Application", back_populates="placement")

# ------------------------------------------------------------------------------
# 8. Learning Resources & Roadmaps
# ------------------------------------------------------------------------------

class LearningResource(Base):
    __tablename__ = "learning_resources"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    competency_id = Column(String(36), ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    type = Column(String(50), default="VIDEO")  # 'VIDEO', 'COURSE', 'DOCUMENTATION', 'LAB'
    url = Column(Text, nullable=False)
    provider = Column(String(100), nullable=True)  # 'freeCodeCamp', 'NPTEL', 'Coursera', 'Official'
    duration_hours = Column(Float, nullable=True)
    is_free = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    competency = relationship("Competency", back_populates="learning_resources")

# ------------------------------------------------------------------------------
# 9. Audit Logs
# ------------------------------------------------------------------------------

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False, index=True)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, index=True)
