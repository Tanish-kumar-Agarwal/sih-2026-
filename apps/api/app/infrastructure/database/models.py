import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Boolean, Text, Integer, Float, Date, DateTime,
    ForeignKey, Table, JSON
)
from sqlalchemy.orm import relationship
from app.infrastructure.database.session import Base

def gen_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class Role(Base):
    __tablename__ = "roles"
    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    users = relationship("User", back_populates="role")

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role_id = Column(String(50), ForeignKey("roles.id"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    role = relationship("Role", back_populates="users")
    student_profile = relationship("Student", back_populates="user", uselist=False)
    faculty_profile = relationship("Faculty", back_populates="user", uselist=False)
    industry_profile = relationship("IndustryUser", back_populates="user", uselist=False)

class Institution(Base):
    __tablename__ = "institutions"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    aishe_code = Column(String(50), nullable=True)
    type = Column(String(50), default="University")
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)
    accreditation = Column(String(100), nullable=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    departments = relationship("Department", back_populates="institution")
    students = relationship("Student", back_populates="institution")
    faculty = relationship("Faculty", back_populates="institution")

class Department(Base):
    __tablename__ = "departments"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False)
    name = Column(String(200), nullable=False)
    code = Column(String(50), nullable=False)
    hod_name = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    institution = relationship("Institution", back_populates="departments")
    students = relationship("Student", back_populates="department")

class Student(Base):
    __tablename__ = "students"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=True)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=True)
    enrollment_number = Column(String(100), unique=True, nullable=True)
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
    competencies = relationship("StudentCompetency", back_populates="student")
    projects = relationship("Project", back_populates="student")
    applications = relationship("Application", back_populates="student")

class Faculty(Base):
    __tablename__ = "faculty"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    institution_id = Column(String(36), ForeignKey("institutions.id"), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=True)
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

    industry_users = relationship("IndustryUser", back_populates="company")
    opportunities = relationship("Opportunity", back_populates="company")

class IndustryUser(Base):
    __tablename__ = "industry_users"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    designation = Column(String(100), nullable=True)
    department = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="industry_profile")
    company = relationship("Company", back_populates="industry_users")

class Competency(Base):
    __tablename__ = "competencies"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(150), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    category = Column(String(100), nullable=False)
    difficulty_level = Column(String(30), default="Intermediate")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    student_competencies = relationship("StudentCompetency", back_populates="competency")

class StudentCompetency(Base):
    __tablename__ = "student_competencies"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    competency_id = Column(String(36), ForeignKey("competencies.id"), nullable=False)
    proficiency_level = Column(String(30), default="Intermediate")
    score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.5)
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    student = relationship("Student", back_populates="competencies")
    competency = relationship("Competency", back_populates="student_competencies")

class Project(Base):
    __tablename__ = "projects"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    title = Column(String(200), nullable=False)
    summary = Column(Text, nullable=True)
    repo_url = Column(String(255), nullable=True)
    live_url = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    demonstrated_skills = Column(JSON, default=list) # List of skill names
    created_at = Column(DateTime(timezone=True), default=utc_now)

    student = relationship("Student", back_populates="projects")

class Opportunity(Base):
    __tablename__ = "opportunities"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    company_id = Column(String(36), ForeignKey("companies.id"), nullable=False)
    title = Column(String(200), nullable=False)
    type = Column(String(50), default="INTERNSHIP")
    stipend_or_salary = Column(String(100), nullable=True)
    location = Column(String(150), nullable=True)
    work_mode = Column(String(50), default="REMOTE")
    openings = Column(Integer, default=1)
    status = Column(String(50), default="ACTIVE")
    deadline = Column(DateTime(timezone=True), nullable=True)
    description = Column(Text, nullable=True)
    required_competencies = Column(JSON, default=list) # list of dicts: [{competencyId, name, importance, weight}]
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    company = relationship("Company", back_populates="opportunities")
    applications = relationship("Application", back_populates="opportunity")

class Application(Base):
    __tablename__ = "applications"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id"), nullable=False)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    status = Column(String(50), default="SUBMITTED")
    match_score = Column(Float, default=0.0)
    match_breakdown = Column(JSON, nullable=True)
    applied_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    opportunity = relationship("Opportunity", back_populates="applications")
    student = relationship("Student", back_populates="applications")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(100), nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
