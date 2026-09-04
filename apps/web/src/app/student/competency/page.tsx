"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Target,
  Layers,
  ChevronRight,
  Code2,
  Database,
  Server,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  FileCheck2,
  Award,
  ChevronDown,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  Zap,
  BookOpen,
  Cpu,
  Lock,
  Boxes,
  Plus,
  Compass,
  FileText,
  Upload
} from "lucide-react";
import SkillMasteryStudio from "@/components/SkillMasteryStudio";
import EvidenceUploadModal from "@/components/EvidenceUploadModal";
import GitHubIngestionModal from "@/components/GitHubIngestionModal";
import { useDevPersona } from "@/hooks/useDevPersona";
import {
  useStudentCompetencies,
  useStudentCompetencyDetail,
  useStudentCompetencyGraph,
  useDeriveCompetencies,
  useCanonicalRoles,
  useRoleRequirements,
} from "@/hooks/useStudentCompetencies";
import {
  useCompetencyEvidence,
  useTriggerEvidenceMapping,
  useVerifyEvidenceMapping,
} from "@/hooks/useCompetencyEvidence";
import {
  useStudentTargetReadiness,
  useRecalculateTargetReadiness,
} from "@/hooks/useReadiness";


interface SkillNode {
  id: string;
  name: string;
  group: "prog" | "data" | "sys";
  groupName: string;
  category: string;
  status: "mastered" | "developing" | "gap";
  gapWord: string;
  currentLevel: string;
  requiredLevel: string;
  score: number;
  benchmark: number;
  evText: string;
  evidence: {
    projects: number;
    certs: number;
    assessments: number;
    githubRepos: number;
  };
  recommendedAction: string;
  actionType: "assessment" | "project" | "cert" | "lab";
  actionGain: string;
}

export default function StudentCompetencyCenterPage() {
  const router = useRouter();

  // Role blueprints
  const roleBlueprints: Record<string, {
    score: number;
    hiringThreshold: number;
    delta: string;
    status: string;
    matchedRolesCount: number;
    companies: string;
  }> = {
    "Backend Developer": {
      score: 78,
      hiringThreshold: 80,
      delta: "2 points to tier-1 hiring bar",
      status: "Industry Ready",
      matchedRolesCount: 14,
      companies: "Razorpay, Zomato, CRED"
    },
    "AI Platform Engineer": {
      score: 74,
      hiringThreshold: 82,
      delta: "8 points to tier-1 hiring bar",
      status: "Nearly Ready",
      matchedRolesCount: 9,
      companies: "Microsoft, Flipkart, Sarvam AI"
    },
    "Fullstack Engineer": {
      score: 83,
      hiringThreshold: 78,
      delta: "+5 points above tier-1 bar",
      status: "Exceeds Bar",
      matchedRolesCount: 18,
      companies: "Swiggy, Groww, PhonePe"
    },
    "DevOps & Cloud Specialist": {
      score: 71,
      hiringThreshold: 82,
      delta: "11 points to tier-1 hiring bar",
      status: "Developing",
      matchedRolesCount: 8,
      companies: "AWS, Freshworks, Paytm"
    },
    "Ayurvedic Clinical Specialist": {
      score: 82,
      hiringThreshold: 75,
      delta: "+7 points above clinical accreditation bar",
      status: "Clinically Certified",
      matchedRolesCount: 11,
      companies: "Kottakkal Arya Vaidya Sala, Patanjali Research, CCRAS"
    },
    "Yoga Therapy Consultant": {
      score: 79,
      hiringThreshold: 75,
      delta: "+4 points above wellness threshold",
      status: "Industry Ready",
      matchedRolesCount: 7,
      companies: "SVYASA, Art of Living, Ministry of AYUSH"
    }
  };

  const { currentPersona } = useDevPersona();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: competenciesData, isLoading: isLoadingCompetencies, refetch: refetchCompetencies } = useStudentCompetencies({
    search: searchQuery || undefined,
  });
  const { data: rolesCatalog } = useCanonicalRoles();
  const deriveMutation = useDeriveCompetencies();

  const [selectedRole, setSelectedRole] = useState("role-backend-dev");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [domainFilter, setDomainFilter] = useState<"all" | "prog" | "data" | "sys">("all");
  const [activeViewMode, setActiveViewMode] = useState<"graph" | "matrix">("graph");
  const [primaryTab, setPrimaryTab] = useState<"graph" | "studio">("graph");
  const [studioSkillId, setStudioSkillId] = useState<string>("docker");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  const [selectedCompetencyId, setSelectedCompetencyId] = useState<string>("");
  const { data: competencyDetail } = useStudentCompetencyDetail(selectedCompetencyId || undefined);
  const { data: graphTopology } = useStudentCompetencyGraph();
  const { data: activeRoleDetail } = useRoleRequirements(selectedRole);
  const { data: evidenceProfile, isLoading: isEvidenceLoading } = useCompetencyEvidence(selectedCompetencyId || undefined);
  const verifyMappingMutation = useVerifyEvidenceMapping();
  const { data: targetReadiness, isLoading: isLoadingReadiness, refetch: refetchReadiness } = useStudentTargetReadiness(selectedRole, "ROLE");
  const recalcReadinessMutation = useRecalculateTargetReadiness();

  useEffect(() => {
    if (currentPersona?.department?.toLowerCase().includes("ayur") || currentPersona?.department?.toLowerCase().includes("ayush")) {
      setSelectedRole("role-ayurveda-specialist");
    } else {
      setSelectedRole("role-backend-dev");
    }
  }, [currentPersona?.id, currentPersona?.department]);

  useEffect(() => {
    if (competenciesData?.items && competenciesData.items.length > 0) {
      if (!selectedCompetencyId || !competenciesData.items.some(c => c.competency_id === selectedCompetencyId)) {
        setSelectedCompetencyId(competenciesData.items[0].competency_id);
      }
    }
  }, [competenciesData?.items, selectedCompetencyId]);

  // Derived role title from catalog
  const selectedRoleItem = rolesCatalog?.items?.find(r => r.id === selectedRole || r.slug === selectedRole || r.title === selectedRole);
  const currentRoleTitle = selectedRoleItem?.title || selectedRole;
  const currentRole = {
    score: targetReadiness ? Math.round(targetReadiness.readiness_score) : (roleBlueprints[selectedRole]?.score || 0),
    hiringThreshold: 80,
    delta: targetReadiness?.summary || roleBlueprints[selectedRole]?.delta || "Evaluated against canonical role rubric",
    status: targetReadiness ? targetReadiness.readiness_state.replace('_', ' ') : (roleBlueprints[selectedRole]?.status || "Blank Slate"),
    matchedRolesCount: rolesCatalog?.total || 5,
    companies: roleBlueprints[selectedRole]?.companies || "Razorpay, Zomato, CRED, CCRAS",
    confidence: targetReadiness?.confidence ?? 0,
    criticalBlockers: targetReadiness?.critical_blockers || [],
    strengths: targetReadiness?.strengths || [],
    gaps: targetReadiness?.gaps || [],
    isAssessed: targetReadiness ? targetReadiness.readiness_state !== "NOT_ASSESSED" : false
  };

  const availableRoles = (rolesCatalog?.items && rolesCatalog.items.length > 0)
    ? rolesCatalog.items
    : Object.keys(roleBlueprints).map(title => ({ id: title, title }));
  const currentRoleStatus = currentRole.status;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDerive = () => {
    deriveMutation.mutate(
      { include_projects: true },
      {
        onSuccess: (data) => {
          showToast(`Derived ${data.derived_count} new & updated ${data.updated_count} competencies from demonstrated skills`);
          refetchCompetencies();
        },
        onError: (err: any) => {
          showToast(`Derivation error: ${err?.message || "Failed to derive"}`);
        },
      }
    );
  };

  // Skill ontology dataset
  const skillsData: Record<string, SkillNode> = {
    python: {
      id: "python",
      name: "Python & Core OOP",
      group: "prog",
      groupName: "Programming",
      category: "Languages & Paradigms",
      status: "mastered",
      gapWord: "None",
      currentLevel: "Advanced",
      requiredLevel: "Advanced",
      score: 94,
      benchmark: 80,
      evText: "3 verified repositories, 1 certification, 128 LeetCode solves with Python.",
      evidence: { projects: 3, certs: 1, assessments: 2, githubRepos: 6 },
      recommendedAction: "Maintain mastery via quarterly benchmarking",
      actionType: "assessment",
      actionGain: "+1 readiness"
    },
    dsa: {
      id: "dsa",
      name: "Data Structures & Algorithms",
      group: "prog",
      groupName: "Programming",
      category: "Problem Solving",
      status: "mastered",
      gapWord: "None",
      currentLevel: "Advanced",
      requiredLevel: "Intermediate",
      score: 90,
      benchmark: 75,
      evText: "Codeforces 1428, 384 problems solved, top 9% in rated global contest.",
      evidence: { projects: 1, certs: 0, assessments: 2, githubRepos: 2 },
      recommendedAction: "Advanced Dynamic Programming Sprint",
      actionType: "lab",
      actionGain: "+2 readiness"
    },
    js: {
      id: "js",
      name: "TypeScript & Async JS",
      group: "prog",
      groupName: "Programming",
      category: "Languages & Paradigms",
      status: "developing",
      gapWord: "Small",
      currentLevel: "Intermediate",
      requiredLevel: "Intermediate",
      score: 72,
      benchmark: 75,
      evText: "2 projects in TypeScript, no formal assessment. Last tested 40 days ago.",
      evidence: { projects: 2, certs: 0, assessments: 1, githubRepos: 4 },
      recommendedAction: "Take Proctored TypeScript Architecture Test",
      actionType: "assessment",
      actionGain: "+2 readiness"
    },
    sql: {
      id: "sql",
      name: "SQL & Query Optimization",
      group: "data",
      groupName: "Data",
      category: "Databases & Storage",
      status: "mastered",
      gapWord: "None",
      currentLevel: "Advanced",
      requiredLevel: "Advanced",
      score: 88,
      benchmark: 75,
      evText: "Proctored assessment 88%, 2 production projects with indexing and schema design.",
      evidence: { projects: 2, certs: 0, assessments: 1, githubRepos: 3 },
      recommendedAction: "Distributed Relational Sharding Lab",
      actionType: "lab",
      actionGain: "+1 readiness"
    },
    pg: {
      id: "pg",
      name: "PostgreSQL & Transactions",
      group: "data",
      groupName: "Data",
      category: "Databases & Storage",
      status: "developing",
      gapWord: "Small",
      currentLevel: "Intermediate",
      requiredLevel: "Intermediate",
      score: 70,
      benchmark: 75,
      evText: "1 production project on PostgreSQL. ACID transaction evidence verified.",
      evidence: { projects: 1, certs: 0, assessments: 0, githubRepos: 1 },
      recommendedAction: "Link PostgreSQL Project Repo Evidence",
      actionType: "project",
      actionGain: "+3 readiness"
    },
    redis: {
      id: "redis",
      name: "Redis & In-Memory Caching",
      group: "data",
      groupName: "Data",
      category: "Databases & Storage",
      status: "gap",
      gapWord: "Moderate",
      currentLevel: "Basic",
      requiredLevel: "Intermediate",
      score: 48,
      benchmark: 70,
      evText: "Used in 1 project as basic cache. No pub/sub or clustering evidence.",
      evidence: { projects: 1, certs: 0, assessments: 0, githubRepos: 1 },
      recommendedAction: "Distributed Caching & Eviction Sprint",
      actionType: "lab",
      actionGain: "+3 readiness"
    },
    api: {
      id: "api",
      name: "REST & GraphQL API Architecture",
      group: "sys",
      groupName: "Systems",
      category: "System Design",
      status: "mastered",
      gapWord: "None",
      currentLevel: "Advanced",
      requiredLevel: "Advanced",
      score: 91,
      benchmark: 80,
      evText: "4 projects with public APIs, Razorpay internship evidence, assessment 91%.",
      evidence: { projects: 4, certs: 0, assessments: 1, githubRepos: 5 },
      recommendedAction: "GraphQL Federation & Gateway Architecture",
      actionType: "lab",
      actionGain: "+1 readiness"
    },
    auth: {
      id: "auth",
      name: "Authentication & OAuth 2.0 / JWT",
      group: "sys",
      groupName: "Systems",
      category: "Security & Identity",
      status: "developing",
      gapWord: "Small",
      currentLevel: "Intermediate",
      requiredLevel: "Intermediate",
      score: 74,
      benchmark: 75,
      evText: "JWT and OAuth implemented in 2 projects. No security audit assessment yet.",
      evidence: { projects: 2, certs: 0, assessments: 0, githubRepos: 2 },
      recommendedAction: "Web Security & RBAC Proctored Evaluation",
      actionType: "assessment",
      actionGain: "+2 readiness"
    },
    docker: {
      id: "docker",
      name: "Docker & Containerization",
      group: "sys",
      groupName: "Systems",
      category: "DevOps & Infrastructure",
      status: "gap",
      gapWord: "Critical",
      currentLevel: "Basic",
      requiredLevel: "Intermediate",
      score: 54,
      benchmark: 75,
      evText: "1 basic Dockerfile in project repo. No multi-stage build or deployment proof.",
      evidence: { projects: 1, certs: 0, assessments: 0, githubRepos: 2 },
      recommendedAction: "Launch 6-Hour Docker Containerization Sprint",
      actionType: "lab",
      actionGain: "+4 readiness"
    },
    cloud: {
      id: "cloud",
      name: "Cloud Architecture (AWS ECS/S3)",
      group: "sys",
      groupName: "Systems",
      category: "DevOps & Infrastructure",
      status: "gap",
      gapWord: "Critical",
      currentLevel: "Basic",
      requiredLevel: "Intermediate",
      score: 42,
      benchmark: 70,
      evText: "AWS free-tier account linked. No production services or IAM policies deployed.",
      evidence: { projects: 0, certs: 0, assessments: 0, githubRepos: 0 },
      recommendedAction: "Deploy Containerized Backend to AWS ECS",
      actionType: "project",
      actionGain: "+4 readiness"
    },
    nadi_pariksha: {
      id: "nadi_pariksha",
      name: "Nadi Pariksha Pulse Diagnostics",
      group: "prog",
      groupName: "Diagnostics",
      category: "Ayurvedic Diagnostics",
      status: "mastered",
      gapWord: "None",
      currentLevel: "Advanced",
      requiredLevel: "Advanced",
      score: 88,
      benchmark: 75,
      evText: "Clinical internship at CCRAS, 120+ patient pulse profiles analyzed.",
      evidence: { projects: 2, certs: 1, assessments: 2, githubRepos: 0 },
      recommendedAction: "Advanced Tri-dosha Pulse Rhythm Masterclass",
      actionType: "lab",
      actionGain: "+2 readiness"
    },
    panchakarma: {
      id: "panchakarma",
      name: "Panchakarma Protocol Planning",
      group: "sys",
      groupName: "Clinical Protocols",
      category: "Therapeutic Procedures",
      status: "mastered",
      gapWord: "None",
      currentLevel: "Advanced",
      requiredLevel: "Advanced",
      score: 85,
      benchmark: 75,
      evText: "Supervised clinical rotations, bio-purification protocol adherence.",
      evidence: { projects: 2, certs: 1, assessments: 1, githubRepos: 0 },
      recommendedAction: "Conduct Snehana-Swedana Clinical Case Study",
      actionType: "project",
      actionGain: "+3 readiness"
    },
    dravyaguna: {
      id: "dravyaguna",
      name: "Dravyaguna Pharmacology",
      group: "data",
      groupName: "Pharmacology",
      category: "Herbology & Formulations",
      status: "developing",
      gapWord: "Small",
      currentLevel: "Intermediate",
      requiredLevel: "Advanced",
      score: 74,
      benchmark: 80,
      evText: "Herbarium documentation and HPLC phyto-chemical analysis project.",
      evidence: { projects: 1, certs: 0, assessments: 1, githubRepos: 0 },
      recommendedAction: "Complete Polyherbal Synergism Proctored Exam",
      actionType: "assessment",
      actionGain: "+3 readiness"
    },
    yoga_therapy: {
      id: "yoga_therapy",
      name: "Yoga Therapy Clinical Prescription",
      group: "sys",
      groupName: "Holistic Therapy",
      category: "Mind-Body Medicine",
      status: "mastered",
      gapWord: "None",
      currentLevel: "Advanced",
      requiredLevel: "Intermediate",
      score: 82,
      benchmark: 70,
      evText: "Therapeutic yoga prescription for metabolic disorders cohort study.",
      evidence: { projects: 1, certs: 1, assessments: 1, githubRepos: 0 },
      recommendedAction: "Pranayama Biofeedback Clinical Evaluation",
      actionType: "lab",
      actionGain: "+1 readiness"
    }
  };

  const isAyush = Boolean(
    currentPersona?.department?.toLowerCase().includes("ayur") || 
    currentPersona?.department?.toLowerCase().includes("ayush")
  );

  const defaultSkillId = isAyush ? "nadi_pariksha" : "pg";
  const [selectedSkillId, setSelectedSkillId] = useState<string>(defaultSkillId);

  useEffect(() => {
    setSelectedSkillId(isAyush ? "nadi_pariksha" : "pg");
  }, [isAyush]);

  const currentSkill = skillsData[selectedSkillId] || skillsData[defaultSkillId] || Object.values(skillsData)[0];

  // Real Competencies from PostgreSQL
  const realCompetencies = competenciesData?.items || [];
  const selectedComp = realCompetencies.find(c => c.competency_id === selectedCompetencyId) || realCompetencies[0];

  const filteredCompetencies = realCompetencies.filter((comp) => {
    if (domainFilter === "all") return true;
    const cat = comp.category?.toLowerCase() || "";
    if (domainFilter === "prog") return cat.includes("software") || cat.includes("core") || cat.includes("diagnostics") || cat.includes("program");
    if (domainFilter === "data") return cat.includes("data") || cat.includes("ai") || cat.includes("pharmacology");
    if (domainFilter === "sys") return cat.includes("cloud") || cat.includes("system") || cat.includes("infrastructure") || cat.includes("protocol") || cat.includes("therapy");
    return true;
  });

  // Dynamically compute radar dimensions from real competencies
  const technicalScore = Math.round(
    realCompetencies.filter(c => c.category?.toLowerCase().includes("software") || c.category?.toLowerCase().includes("core") || c.category?.toLowerCase().includes("diagnostics"))
      .reduce((acc, c, _, arr) => acc + c.score / arr.length, 0)
  ) || (realCompetencies.length > 0 ? Math.round(realCompetencies[0].score) : 0);

  const architectureScore = Math.round(
    realCompetencies.filter(c => c.category?.toLowerCase().includes("cloud") || c.category?.toLowerCase().includes("system") || c.category?.toLowerCase().includes("architecture") || c.category?.toLowerCase().includes("protocol"))
      .reduce((acc, c, _, arr) => acc + c.score / arr.length, 0)
  ) || (realCompetencies.length > 1 ? Math.round(realCompetencies[1].score) : 0);

  const algorithmicScore = Math.round(
    realCompetencies.filter(c => c.category?.toLowerCase().includes("data") || c.category?.toLowerCase().includes("ai") || c.category?.toLowerCase().includes("pharmacology"))
      .reduce((acc, c, _, arr) => acc + c.score / arr.length, 0)
  ) || (realCompetencies.length > 2 ? Math.round(realCompetencies[2].score) : 0);

  const practicalScore = realCompetencies.length > 0 ? Math.round(realCompetencies.reduce((a, b) => a + (b.is_verified ? 88 : 65), 0) / realCompetencies.length) : 0;
  const reliabilityScore = realCompetencies.length > 0 ? Math.round(realCompetencies.reduce((a, b) => a + b.confidence_score * 100, 0) / realCompetencies.length) : 0;
  const compositeScore = realCompetencies.length > 0 ? Math.round(realCompetencies.reduce((a, b) => a + b.score, 0) / realCompetencies.length) : 0;

  const competencyDimensions = [
    { label: "Technical Core Skills", score: technicalScore, benchmark: 75, status: technicalScore >= 75 ? "mastered" : "gap" },
    { label: "Architecture & Systems", score: architectureScore, benchmark: 70, status: architectureScore >= 70 ? "mastered" : "gap" },
    { label: "Algorithmic & Domain Mastery", score: algorithmicScore, benchmark: 75, status: algorithmicScore >= 75 ? "mastered" : "gap" },
    { label: "Practical Repository Evidence", score: practicalScore, benchmark: 70, status: practicalScore >= 70 ? "mastered" : "gap" },
    { label: "Production Reliability & Security", score: reliabilityScore, benchmark: 75, status: reliabilityScore >= 75 ? "mastered" : "gap" },
    { label: "Industry Readiness Composite", score: compositeScore, benchmark: 70, status: compositeScore >= 70 ? "mastered" : "gap" },
  ];

  // SVG Gauge calculations
  const gaugeRadius = 52;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeScore = compositeScore > 0 ? compositeScore : currentRole.score;
  const gaugeOffset = gaugeCircumference - (gaugeScore / 100) * gaugeCircumference;

  return (
    <>
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            background: "#181a20",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "12px",
            padding: "12px 20px",
            fontSize: "13px",
            boxShadow: "0 14px 40px rgba(0,0,0,0.6)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <CheckCircle2 style={{ width: "16px", height: "16px", color: "#34d399", flexShrink: 0 }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Upload Evidence Modal */}
      <EvidenceUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          refetchCompetencies();
          showToast("Evidence artifact ingested, extracted, and persisted!");
        }}
      />

      {/* GitHub Repository Intelligence Modal */}
      <GitHubIngestionModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onSuccess={(res) => {
          refetchCompetencies();
          showToast(`Repository ${res.repository.full_name} analyzed! ${res.snapshot.student_commit_count} student commits attributed.`);
        }}
      />

      {/* SVG Icon Symbols */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <symbol id="i-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></symbol>
          <symbol id="i-spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7z"/></symbol>
          <symbol id="i-clip" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 12h6M9 16h4"/></symbol>
          <symbol id="i-case" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M3 12h18"/></symbol>
          <symbol id="i-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z"/><path d="M4 19.5A2.5 2.5 0 006.5 22H20"/></symbol>
          <symbol id="i-id" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M15 9h3M15 13h3"/></symbol>
          <symbol id="i-radio" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M8.5 8.5a5 5 0 000 7M15.5 8.5a5 5 0 010 7M5.6 5.6a9 9 0 000 12.8M18.4 5.6a9 9 0 010 12.8"/></symbol>
          <symbol id="i-user" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/></symbol>
          <symbol id="i-trend" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></symbol>
          <symbol id="i-pie" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v9h9"/><path d="M21 12a9 9 0 11-9-9"/></symbol>
          <symbol id="i-gear" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></symbol>
          <symbol id="i-help" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.6-2.5 2-2.5 3.5M12 17h.01"/></symbol>
          <symbol id="i-building" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21V5a2 2 0 012-2h8a2 2 0 012 2v16M16 9h3a1 1 0 011 1v11M8 7h4M8 11h4M8 15h4M4 21h17"/></symbol>
          <symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.3-4.3"/></symbol>
          <symbol id="i-bell" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z"/><path d="M10 21h4"/></symbol>
          <symbol id="i-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></symbol>
        </defs>
      </svg>

      <div className="shell" style={{ background: "#0b0c10" }}>
        {/* Left Rail Sidebar */}
        <aside className="rail" aria-label="Sidebar">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7l8-4 8 4-8 4z"/><path d="M4 12l8 4 8-4M4 17l8 4 8-4"/></svg>
            </span>
            SkillSetu
          </Link>

          <nav className="nav" aria-label="Student">
            <Link href="/student/dashboard"><svg><use href="#i-grid"/></svg>Dashboard</Link>
            <Link href="/student/competency" aria-current="page"><svg><use href="#i-spark"/></svg>Competency center</Link>
            <Link href="/student/assessments"><svg><use href="#i-clip"/></svg>Assessments & Labs</Link>
            <Link href="/student/opportunities"><svg><use href="#i-case"/></svg>Opportunities</Link>
            <Link href="/student/opportunities"><svg><use href="#i-book"/></svg>Internships</Link>
            <Link href="/student/passport"><svg><use href="#i-id"/></svg>Skill passport</Link>
            <Link href="/student/profile"><svg><use href="#i-user"/></svg>Student profile</Link>

            <div className="nav-label">
              Institution <svg style={{ width: "14px", height: "14px", transform: "rotate(-90deg)" }}><use href="#i-chev"/></svg>
            </div>
            <Link href="/institution/dashboard"><svg><use href="#i-radio"/></svg>Placement command center</Link>
            <Link href="/institution/students"><svg><use href="#i-user"/></svg>Student intelligence</Link>
            <Link href="/institution/readiness"><svg><use href="#i-trend"/></svg>Industry demand</Link>
            <Link href="/institution/placements"><svg><use href="#i-pie"/></svg>Outcomes</Link>
          </nav>

          <nav className="nav rail-bottom" aria-label="Account">
            <Link href="/admin/system"><svg><use href="#i-gear"/></svg>Settings</Link>
            <Link href="/about"><svg><use href="#i-help"/></svg>Help</Link>
            <Link href="/institution/dashboard"><svg><use href="#i-building"/></svg>Institution profile</Link>
          </nav>
        </aside>

        {/* Center Main Viewport */}
        <div>
          {/* Top Bar with Breadcrumb */}
          <header className="topbar" style={{ background: "rgba(11, 12, 16, 0.85)", backdropFilter: "blur(16px)" }}>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/student/dashboard">Student</Link>
              <svg><use href="#i-chev"/></svg>
              <span className="here" style={{ color: "#ffffff", fontWeight: 600 }}>Competency Intelligence & Knowledge Graph</span>
            </nav>

            <div className="topbar-right">
              <label className="search" style={{ position: "relative" }}>
                <svg><use href="#i-search"/></svg>
                <input
                  type="text"
                  placeholder="Search competencies, skills, ontologies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: "none", border: "none", outline: "none", color: "inherit", width: "100%", fontSize: "13px" }}
                />
                <kbd>⌘K</kbd>
              </label>

              <button className="icon-btn" type="button" aria-label="Help" onClick={() => router.push("/about")}>
                <svg><use href="#i-help"/></svg>
              </button>

              <button className="icon-btn" type="button" aria-label="Notifications" onClick={() => showToast(`Graph synchronized with ${competenciesData?.total ?? 0} verified competencies`)}>
                <svg><use href="#i-bell"/></svg>
                <span className="dot" aria-hidden="true" />
              </button>

              <Link href="/student/profile" className="avatar-sm" aria-label={`Signed in as ${currentPersona?.name || 'Aarav Sharma'}`}>
                {currentPersona ? `${currentPersona.firstName[0]}${currentPersona.lastName[0]}` : "AS"}
              </Link>
            </div>
          </header>

          <main style={{ padding: "80px 28px 60px", maxWidth: "1340px", margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

              {/* PRIMARY TOP VIEW SELECTOR */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                  background: "#121318",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "8px 12px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setPrimaryTab("graph")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 18px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      background: primaryTab === "graph" ? "#2563eb" : "transparent",
                      color: primaryTab === "graph" ? "#ffffff" : "#94a3b8",
                      boxShadow: primaryTab === "graph" ? "0 4px 14px rgba(37,99,235,0.35)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Boxes style={{ width: "15px", height: "15px" }} />
                    <span>🕸️ Neo4j Topology & Blueprint Gap Matrix</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrimaryTab("studio")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 18px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "none",
                      background: primaryTab === "studio" ? "#2563eb" : "transparent",
                      color: primaryTab === "studio" ? "#ffffff" : "#94a3b8",
                      boxShadow: primaryTab === "studio" ? "0 4px 14px rgba(37,99,235,0.35)" : "none",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Sparkles style={{ width: "15px", height: "15px", color: primaryTab === "studio" ? "#ffffff" : "#c084fc" }} />
                    <span>🚀 Skill Mastery Studio & Accelerated Roadmap</span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        background: primaryTab === "studio" ? "rgba(255,255,255,0.2)" : "rgba(16, 185, 129, 0.2)",
                        color: primaryTab === "studio" ? "#ffffff" : "#34d399",
                        padding: "1px 6px",
                        borderRadius: "999px",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                      }}
                    >
                      NEW
                    </span>
                  </button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ fontSize: "12px", color: "#64748b", paddingRight: "6px" }}>
                    {primaryTab === "graph"
                      ? "Diagnostic Topology & Role Blueprint Rubric"
                      : "YouTube Lectures, Online Courses, Topic Quizzes & Starter Repos"}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    id="upload-evidence-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "7px 15px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "1px solid rgba(99, 102, 241, 0.4)",
                      background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%)",
                      color: "#c7d2fe",
                      boxShadow: "0 2px 10px rgba(99, 102, 241, 0.2)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Upload style={{ width: "14px", height: "14px", color: "#818cf8" }} />
                    <span>Upload Evidence</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsGitHubModalOpen(true)}
                    id="analyze-github-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "7px 15px",
                      borderRadius: "10px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      border: "1px solid rgba(139, 92, 246, 0.4)",
                      background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)",
                      color: "#ddd6fe",
                      boxShadow: "0 2px 10px rgba(139, 92, 246, 0.2)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Code2 style={{ width: "14px", height: "14px", color: "#a78bfa" }} />
                    <span>Analyze GitHub Repo</span>
                  </button>
                </div>
              </div>


              {/* RENDER ACTIVE PRIMARY VIEW */}
              {primaryTab === "studio" ? (
                <SkillMasteryStudio
                  initialSkillId={studioSkillId}
                  onScoreUpdate={(skillId, newScore) => {
                    if (skillsData[skillId]) {
                      skillsData[skillId].score = newScore;
                      skillsData[skillId].status = newScore >= 80 ? "mastered" : newScore >= 65 ? "developing" : "gap";
                    }
                    showToast(`Graph synchronized: ${skillId} updated to ${newScore}%`);
                  }}
                  onBackToGraph={() => setPrimaryTab("graph")}
                />
              ) : (
                <>
              {/* Header Hero Banner with Role Blueprint Switcher */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "20px",
                  padding: "24px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "20px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", margin: 0 }}>
                      Competency Center & Ontology
                    </h1>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(59, 130, 246, 0.12)",
                        border: "1px solid rgba(59, 130, 246, 0.25)",
                        color: "#60a5fa",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        padding: "2px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      <GitBranch style={{ width: "12px", height: "12px" }} />
                      Neo4j Dynamic Graph Topology
                    </span>
                  </div>

                  <p style={{ fontSize: "13.5px", color: "#94a3b8", marginTop: "4px", margin: "4px 0 0" }}>
                    Verified proof-of-work, dynamic competency graph topology, and hiring distance vectors.
                  </p>
                </div>

                {/* Blueprint Selector & Action Tools */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  
                  {/* Role Blueprint Selector */}
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => setShowRoleMenu(!showRoleMenu)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        height: "38px",
                        padding: "0 14px",
                        borderRadius: "12px",
                        background: "#18191f",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "#f8fafc",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    >
                      <Target style={{ width: "15px", height: "15px", color: "#60a5fa" }} />
                      <span>Blueprint: <b>{selectedRole}</b></span>
                      <ChevronDown style={{ width: "14px", height: "14px", color: "#94a3b8" }} />
                    </button>

                    {showRoleMenu && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          marginTop: "6px",
                          background: "#1c1d23",
                          border: "1px solid rgba(255,255,255,0.14)",
                          borderRadius: "14px",
                          padding: "6px",
                          zIndex: 50,
                          boxShadow: "0 16px 36px rgba(0,0,0,0.6)",
                          width: "240px",
                        }}
                      >
                        <div style={{ fontSize: "11px", color: "#64748b", padding: "4px 10px", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>
                          Select Target Role
                        </div>
                        {availableRoles.map((role) => {
                          const roleKey = typeof role === 'string' ? role : role.id;
                          const roleTitle = typeof role === 'string' ? role : role.title;
                          const isSelected = selectedRole === roleKey || selectedRole === roleTitle;
                          return (
                            <button
                              key={roleKey}
                              type="button"
                              onClick={() => {
                                setSelectedRole(roleKey);
                                setShowRoleMenu(false);
                                showToast(`Graph recalculated for ${roleTitle} hiring rubric`);
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                                padding: "8px 10px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                background: isSelected ? "rgba(37, 99, 235, 0.2)" : "none",
                                color: isSelected ? "#60a5fa" : "#e2e8f0",
                                border: "none",
                                cursor: "pointer",
                                textAlign: "left",
                              }}
                            >
                              <span>{roleTitle}</span>
                              {isSelected && <CheckCircle2 style={{ width: "14px", height: "14px", color: "#60a5fa" }} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                    {/* Recalculate Target Readiness Button */}
                    <button
                      type="button"
                      onClick={() => {
                        recalcReadinessMutation.mutate(
                          { targetId: selectedRole, targetType: "ROLE" },
                          {
                            onSuccess: (data) => {
                              showToast(`Target readiness recalculated: ${data.readiness_score}% (${data.readiness_state})`);
                              refetchReadiness();
                            },
                            onError: (err: any) => {
                              showToast(`Recalculation error: ${err?.message || "Failed"}`);
                            }
                          }
                        );
                      }}
                      disabled={recalcReadinessMutation.isPending}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        height: "38px",
                        padding: "0 14px",
                        borderRadius: "12px",
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.35)",
                        color: "#6ee7b7",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: recalcReadinessMutation.isPending ? "wait" : "pointer",
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
                      }}
                    >
                      <RefreshCw style={{ width: "14px", height: "14px", animation: recalcReadinessMutation.isPending ? "spin 1s linear infinite" : "none" }} />
                      <span>{recalcReadinessMutation.isPending ? "Evaluating..." : "Recalculate Readiness"}</span>
                    </button>

                  {/* Derive Competencies from Projects Button */}
                  <button
                    type="button"
                    onClick={handleDerive}
                    disabled={deriveMutation.isPending}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      height: "38px",
                      padding: "0 14px",
                      borderRadius: "12px",
                      background: "rgba(37, 99, 235, 0.15)",
                      border: "1px solid rgba(59, 130, 246, 0.35)",
                      color: "#93c5fd",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: deriveMutation.isPending ? "wait" : "pointer",
                      boxShadow: "0 2px 8px rgba(37, 99, 235, 0.2)",
                    }}
                  >
                    <RefreshCw style={{ width: "14px", height: "14px", animation: deriveMutation.isPending ? "spin 1s linear infinite" : "none" }} />
                    <span>{deriveMutation.isPending ? "Deriving..." : "Derive Competencies"}</span>
                  </button>

                  {/* Add Evidence CTA */}
                  <button
                    type="button"
                    onClick={() => router.push("/student/profile")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      height: "38px",
                      padding: "0 14px",
                      borderRadius: "12px",
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                    }}
                  >
                    <Plus style={{ width: "15px", height: "15px" }} />
                    <span>Add Evidence Node</span>
                  </button>
                </div>
              </div>

              {/* Truthful Empty State Banner for students with 0 competencies (e.g. Rohit Kumar) */}
              {realCompetencies.length === 0 && (
                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                    borderRadius: "16px",
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <AlertCircle style={{ width: "24px", height: "24px", color: "#fbbf24", flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#f8fafc" }}>
                        Truthful Empty State: 0 Verified Competencies Baseline
                      </div>
                      <div style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "2px" }}>
                        Active Profile: <b>{currentPersona?.name || "Student"}</b> ({currentPersona?.department || "1st Year"}). No competencies have been derived yet from project repositories.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDerive}
                    disabled={deriveMutation.isPending}
                    style={{
                      background: "#f59e0b",
                      color: "#0f172a",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: "10px",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      cursor: deriveMutation.isPending ? "wait" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Zap style={{ width: "14px", height: "14px" }} />
                    <span>{deriveMutation.isPending ? "Deriving..." : "Derive Baseline Competencies"}</span>
                  </button>
                </div>
              )}

              {/* TIER 1: Competency Mastery & Hiring Distance Vector (12 Cols Bento) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "20px" }}>
                
                {/* LEFT (7 cols): Overall Competency & Radar Vector Command */}
                <div
                  style={{
                    gridColumn: "span 7",
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "20px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "20px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <ShieldCheck style={{ width: "16px", height: "16px", color: "#3b82f6" }} />
                        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Overall Competency Topology
                        </h2>
                      </div>

                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#34d399",
                          background: "rgba(16, 185, 129, 0.12)",
                          border: "1px solid rgba(16, 185, 129, 0.25)",
                          padding: "2px 8px",
                          borderRadius: "999px",
                        }}
                      >
                        ● {currentRoleStatus}
                      </span>
                    </div>

                    {/* Gauge + 6 Dual Benchmark Progress Bars */}
                    <div style={{ display: "flex", alignItems: "center", gap: "28px", marginTop: "20px", flexWrap: "wrap" }}>
                      
                      {/* Circular Gauge */}
                      <div style={{ position: "relative", width: "128px", height: "128px", flexShrink: 0 }}>
                        <svg width="128" height="128" viewBox="0 0 128 128" style={{ transform: "rotate(-90deg)" }}>
                          <circle
                            cx="64"
                            cy="64"
                            r={gaugeRadius}
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r={gaugeRadius}
                            stroke="#3b82f6"
                            strokeWidth="8"
                            strokeDasharray={gaugeCircumference}
                            strokeDashoffset={gaugeOffset}
                            strokeLinecap="round"
                            fill="none"
                          />
                        </svg>
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", lineHeight: 1, fontFamily: "var(--font-mono)" }}>
                            {gaugeScore}%
                          </div>
                          <div style={{ fontSize: "10.5px", fontWeight: 600, color: "#94a3b8", marginTop: "3px", textTransform: "uppercase" }}>
                            Readiness
                          </div>
                        </div>
                      </div>

                      {/* Dimension Dual Bars */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", minWidth: "220px" }}>
                        {competencyDimensions.map((dim) => {
                          const isGap = dim.status === "gap";
                          return (
                            <div key={dim.label} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px" }}>
                                <span style={{ color: "#94a3b8" }}>{dim.label}</span>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span style={{ fontSize: "10px", color: "#64748b" }}>Bar: {dim.benchmark}%</span>
                                  <b style={{ color: isGap ? "#fbbf24" : "#ffffff", fontFamily: "var(--font-mono)" }}>
                                    {dim.score}%
                                  </b>
                                </div>
                              </div>

                              <div style={{ position: "relative", height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "999px" }}>
                                <div
                                  style={{
                                    width: `${dim.score}%`,
                                    height: "100%",
                                    background: isGap ? "#f59e0b" : "#3b82f6",
                                    borderRadius: "999px",
                                  }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "-2px",
                                    left: `${dim.benchmark}%`,
                                    width: "2px",
                                    height: "9px",
                                    background: "rgba(255, 255, 255, 0.4)",
                                    borderRadius: "1px",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>

                  {/* Footer note */}
                  <div
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                      paddingTop: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      color: "#94a3b8",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <span>{realCompetencies.length > 0 ? `Authenticated across ${realCompetencies.length} PostgreSQL canonical competency nodes.` : "No competencies recorded yet for this profile."}</span>
                    <button
                      type="button"
                      onClick={() => showToast("Launching full 45-minute AI diagnostic test...")}
                      style={{
                        background: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Take Assessment
                    </button>
                  </div>
                </div>

                {/* RIGHT (5 cols): Target Role Hiring Distance Radar */}
                <div
                  style={{
                    gridColumn: "span 5",
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "20px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Target style={{ width: "16px", height: "16px", color: "#f59e0b" }} />
                        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Role Blueprint Gap Matrix
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        {currentRoleTitle}
                      </span>
                    </div>

                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                      Matched against {currentRole.matchedRolesCount} live requisitions at {currentRole.companies}.
                    </div>

                    {/* Explainability Summary */}
                    <div style={{ marginTop: "8px", fontSize: "11.5px", color: "#cbd5e1", lineHeight: 1.4, background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "8px", padding: "8px 10px" }}>
                      💡 {currentRole.delta}
                    </div>

                    {/* Critical Blockers Alert */}
                    {currentRole.criticalBlockers && currentRole.criticalBlockers.length > 0 && (
                      <div style={{ marginTop: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "10px", padding: "8px 10px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#f87171", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                          <AlertCircle style={{ width: "13px", height: "13px" }} />
                          <span>Mandatory Gating Blocker ({currentRole.criticalBlockers.length})</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#fca5a5", marginTop: "3px" }}>
                          {currentRole.criticalBlockers[0].reason}
                        </div>
                      </div>
                    )}

                    {/* Core Skills Verified (Green) */}
                    <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#34d399", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        ✓ Mastered Core Dimensions
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                        {currentRole.strengths && currentRole.strengths.length > 0 ? (
                          currentRole.strengths.slice(0, 3).map((st: any) => (
                            <div key={st.competency_id} style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "10px", padding: "8px 10px", textAlign: "center" }}>
                              <b style={{ display: "block", fontSize: "13px", color: "#34d399" }}>{st.student_score ? `${Math.round(st.student_score)}%` : "Mastered"}</b>
                              <span style={{ fontSize: "10.5px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                                {st.competency_name.split(" ")[0]}
                              </span>
                            </div>
                          ))
                        ) : realCompetencies.length > 0 ? (
                          realCompetencies.slice(0, 3).map((comp) => (
                            <div key={comp.id} style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "10px", padding: "8px 10px", textAlign: "center" }}>
                              <b style={{ display: "block", fontSize: "13px", color: "#34d399" }}>{comp.score}%</b>
                              <span style={{ fontSize: "10.5px", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                                {comp.competency_name.split(" ")[0]}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div style={{ gridColumn: "1 / -1", fontSize: "11.5px", color: "#64748b", textAlign: "center", padding: "6px" }}>
                            No competencies recorded yet
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gap Skills Priority (Amber) */}
                    <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#fbbf24", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        ⚡ Development Gap Dimensions
                      </div>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
                        {currentRole.gaps && currentRole.gaps.length > 0 ? (
                          currentRole.gaps.slice(0, 2).map((gap: any) => (
                            <div key={gap.competency_id} style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "10px", padding: "8px 10px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <b style={{ fontSize: "11px", color: gap.is_mandatory ? "#f87171" : "#fbbf24" }}>
                                  {gap.is_mandatory ? "REQUIRED" : "PREFERRED"}: {gap.required_proficiency}
                                </b>
                              </div>
                              <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {gap.competency_name}
                              </div>
                            </div>
                          ))
                        ) : activeRoleDetail?.requirements && activeRoleDetail.requirements.length > 0 ? (
                          activeRoleDetail.requirements.slice(0, 2).map((req) => (
                            <div key={req.id} style={{ background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "10px", padding: "8px 10px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <b style={{ fontSize: "11px", color: "#fbbf24" }}>Required: {req.required_proficiency}</b>
                              </div>
                              <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {req.competency_name}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={{ gridColumn: "1 / -1", fontSize: "11.5px", color: "#64748b", textAlign: "center", padding: "6px" }}>
                            Standard enterprise requirements
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setPrimaryTab("studio");
                      showToast(`Accelerated sprint loaded for ${currentRoleTitle}`);
                    }}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      color: "#f8fafc",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>Launch Accelerated Role Sprint</span>
                    <ArrowUpRight style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>

              </div>

              {/* TIER 2: Neo4j Topology Canvas & Deep Node Inspector (12 Cols Bento) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Domain & View Filter Controls */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Layers style={{ width: "16px", height: "16px", color: "#60a5fa" }} />
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                      Knowledge Topology & Evidence Matrix
                    </span>
                    <span style={{ fontSize: "11px", color: "#64748b", background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: "999px" }}>
                      {realCompetencies.length} Live Nodes
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    {/* Domain Filter Pills */}
                    <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", padding: "3px", borderRadius: "10px" }}>
                      {[
                        { id: "all", label: "All Ontologies" },
                        { id: "prog", label: "Software / Core" },
                        { id: "data", label: "Data & AI" },
                        { id: "sys", label: "Systems & Protocols" },
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDomainFilter(d.id as any)}
                          style={{
                            background: domainFilter === d.id ? "#2563eb" : "none",
                            color: domainFilter === d.id ? "#ffffff" : "#94a3b8",
                            border: "none",
                            padding: "4px 10px",
                            borderRadius: "7px",
                            fontSize: "12px",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>

                    {/* View Switcher */}
                    <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", padding: "3px", borderRadius: "10px" }}>
                      <button
                        type="button"
                        onClick={() => setActiveViewMode("graph")}
                        style={{
                          background: activeViewMode === "graph" ? "rgba(255,255,255,0.12)" : "none",
                          color: activeViewMode === "graph" ? "#ffffff" : "#94a3b8",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: "7px",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Topology
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveViewMode("matrix")}
                        style={{
                          background: activeViewMode === "matrix" ? "rgba(255,255,255,0.12)" : "none",
                          color: activeViewMode === "matrix" ? "#ffffff" : "#94a3b8",
                          border: "none",
                          padding: "4px 10px",
                          borderRadius: "7px",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Matrix
                      </button>
                    </div>

                  </div>
                </div>

                {/* Graph + Inspector Split (8 cols + 4 cols) */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "20px" }}>
                  
                  {/* LEFT (8 cols): Interactive Visual Topology Canvas */}
                  <div
                    style={{
                      gridColumn: "span 8",
                      background: "#0d0e13",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "16px",
                      padding: "24px",
                      position: "relative",
                      minHeight: "440px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      overflow: "hidden",
                    }}
                  >
                    {/* Background Grid Pattern */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                        opacity: 0.4,
                        pointerEvents: "none",
                      }}
                    />

                    {/* Root Blueprint Hub */}
                    <div style={{ textAlign: "center", position: "relative", zIndex: 10 }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                          border: "1.5px solid #3b82f6",
                          padding: "8px 20px",
                          borderRadius: "999px",
                          color: "#ffffff",
                          fontSize: "13px",
                          fontWeight: 700,
                          boxShadow: "0 0 20px rgba(59, 130, 246, 0.25)",
                        }}
                      >
                        <Cpu style={{ width: "15px", height: "15px", color: "#60a5fa" }} />
                        <span>{currentRoleTitle} (Canonical Blueprint Hub)</span>
                      </div>
                    </div>

                    {/* Mid Tier: Domain Hubs */}
                    <div style={{ display: "flex", justifyContent: "space-around", position: "relative", zIndex: 10, margin: "14px 0" }}>
                      {[
                        { name: "Software / Core Domain", color: "#60a5fa" },
                        { name: "Data & AI Domain", color: "#a78bfa" },
                        { name: "Systems & Clinical Protocols", color: "#34d399" },
                      ].map((dom) => (
                        <div
                          key={dom.name}
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            color: dom.color,
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                            padding: "4px 12px",
                            borderRadius: "6px",
                          }}
                        >
                          {dom.name}
                        </div>
                      ))}
                    </div>

                    {/* Interactive Leaf Nodes Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "10px", position: "relative", zIndex: 10 }}>
                      {filteredCompetencies.map((comp) => {
                        const isSelected = comp.competency_id === (selectedCompetencyId || selectedComp?.competency_id);
                        const isMastered = comp.score >= 80;
                        const isGap = comp.score < 65;

                        return (
                          <div
                            key={comp.id}
                            onClick={() => setSelectedCompetencyId(comp.competency_id)}
                            style={{
                              background: isSelected
                                ? "rgba(37, 99, 235, 0.25)"
                                : "rgba(255, 255, 255, 0.03)",
                              border: `1.5px solid ${
                                isSelected
                                  ? "#3b82f6"
                                  : isGap
                                  ? "rgba(245, 158, 11, 0.3)"
                                  : "rgba(255, 255, 255, 0.08)"
                              }`,
                              borderRadius: "12px",
                              padding: "10px 12px",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              boxShadow: isSelected ? "0 0 16px rgba(59, 130, 246, 0.3)" : "none",
                              transform: isSelected ? "scale(1.03)" : "scale(1)",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "999px",
                                  background: isMastered ? "#34d399" : isGap ? "#fbbf24" : "#60a5fa",
                                }}
                              />
                              <span style={{ fontSize: "11px", fontWeight: 700, color: "#f8fafc", fontFamily: "var(--font-mono)" }}>
                                {comp.score}%
                              </span>
                            </div>

                            <div style={{ fontSize: "12px", fontWeight: 600, color: "#ffffff", marginTop: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {comp.competency_name}
                            </div>

                            <div style={{ fontSize: "10px", color: isGap ? "#fbbf24" : "#94a3b8", marginTop: "2px" }}>
                              {comp.proficiency_level} · L{comp.proficiency_numeric}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Dynamic Evidence Node Branch */}
                    <div
                      style={{
                        marginTop: "16px",
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px dashed rgba(255, 255, 255, 0.12)",
                        borderRadius: "12px",
                        padding: "12px 16px",
                        position: "relative",
                        zIndex: 10,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "#60a5fa", fontWeight: 600 }}>
                          <GitBranch style={{ width: "13px", height: "13px" }} />
                          <span>Auditable Evidence Profile for {competencyDetail?.competency_name || selectedComp?.competency_name || "Competency"}:</span>
                        </div>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                          PostgreSQL Cryptographic Ledger
                        </span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginTop: "8px" }}>
                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "8px", fontSize: "11px", textAlign: "center" }}>
                          <b style={{ display: "block", color: "#ffffff", fontSize: "13px" }}>{evidenceProfile?.mapped_evidence_count ?? 0}</b>
                          <span style={{ color: "#94a3b8" }}>Mapped Evidence</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "8px", fontSize: "11px", textAlign: "center" }}>
                          <b style={{ display: "block", color: "#ffffff", fontSize: "13px" }}>{evidenceProfile?.verified_evidence_count ?? 0}</b>
                          <span style={{ color: "#94a3b8" }}>Verified Artifacts</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "8px", fontSize: "11px", textAlign: "center" }}>
                          <b style={{ display: "block", color: "#34d399", fontSize: "13px" }}>{evidenceProfile?.strongest_evidence ?? "MODERATE"}</b>
                          <span style={{ color: "#94a3b8" }}>Max Strength</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "8px", fontSize: "11px", textAlign: "center" }}>
                          <b style={{ display: "block", color: "#60a5fa", fontSize: "13px" }}>{evidenceProfile?.max_mapping_confidence ? `${Math.round(evidenceProfile.max_mapping_confidence * 100)}%` : "N/A"}</b>
                          <span style={{ color: "#94a3b8" }}>Mapping Conf.</span>
                        </div>
                      </div>

                      {/* Display Real Auditable Evidence Cards */}
                      {evidenceProfile?.evidence_items && evidenceProfile.evidence_items.length > 0 ? (
                        <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                          {evidenceProfile.evidence_items.map((item) => (
                            <div
                              key={item.mapping_id}
                              style={{
                                background: "rgba(255, 255, 255, 0.03)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                borderRadius: "8px",
                                padding: "8px 12px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px"
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#f8fafc" }}>
                                    {item.evidence_title}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                      background: "rgba(59, 130, 246, 0.15)",
                                      color: "#93c5fd",
                                      border: "1px solid rgba(59, 130, 246, 0.3)"
                                    }}
                                  >
                                    {item.source_type}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: "10px",
                                      padding: "1px 6px",
                                      borderRadius: "4px",
                                      background: "rgba(168, 85, 247, 0.15)",
                                      color: "#d8b4fe",
                                      border: "1px solid rgba(168, 85, 247, 0.3)"
                                    }}
                                  >
                                    {item.mapping_method}
                                  </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span
                                    style={{
                                      fontSize: "10.5px",
                                      fontWeight: 600,
                                      color: item.mapping_status === "CONFIRMED" ? "#34d399" : item.mapping_status === "REJECTED" ? "#ef4444" : "#fbbf24"
                                    }}
                                  >
                                    {item.mapping_status}
                                  </span>
                                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa" }}>
                                    {Math.round(item.confidence * 100)}% conf
                                  </span>
                                </div>
                              </div>
                              {item.confidence_reason && (
                                <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>
                                  {item.confidence_reason}
                                </div>
                              )}
                              {item.source_location && (
                                <div style={{ fontSize: "10px", color: "#64748b", fontFamily: "var(--font-mono)" }}>
                                  Source: {item.source_location}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ marginTop: "10px", fontSize: "11.5px", color: "#64748b", fontStyle: "italic", textAlign: "center" }}>
                          No direct evidence mapped to this competency yet. Upload an artifact or connect GitHub to discover technical claims.
                        </div>
                      )}
                    </div>

                  </div>

                  {/* RIGHT (4 cols): Deep Node Inspector Panel */}
                  <div
                    style={{
                      gridColumn: "span 4",
                      background: "#16171d",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "16px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "16px",
                    }}
                  >
                    <div>
                      {/* Node Header */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                        <div>
                          <span
                            style={{
                              fontSize: "10.5px",
                              color: "#60a5fa",
                              background: "rgba(59, 130, 246, 0.12)",
                              border: "1px solid rgba(59, 130, 246, 0.25)",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontWeight: 600,
                              textTransform: "uppercase",
                            }}
                          >
                            {competencyDetail?.category || selectedComp?.category || "Core Competency"}
                          </span>
                          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: "6px 0 2px" }}>
                            {competencyDetail?.competency_name || selectedComp?.competency_name || "Select Competency"}
                          </h3>
                          <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "var(--font-mono)" }}>
                            {competencyDetail?.competency_code || selectedComp?.competency_code}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-mono)" }}>
                            {competencyDetail?.score ?? selectedComp?.score ?? 0}%
                          </div>
                          <div style={{ fontSize: "10.5px", color: (competencyDetail?.score ?? selectedComp?.score ?? 0) >= 75 ? "#34d399" : "#fbbf24", fontWeight: 600 }}>
                            {(competencyDetail?.score ?? selectedComp?.score ?? 0) >= 75 ? "Mastered" : "Developing"}
                          </div>
                        </div>
                      </div>

                      {/* Level & Benchmark Comparison Box */}
                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.025)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          borderRadius: "12px",
                          padding: "12px 14px",
                          display: "grid",
                          gridTemplateColumns: "repeat(2, 1fr)",
                          gap: "10px",
                          marginTop: "14px",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>Current Level</div>
                          <b style={{ color: "#ffffff", fontSize: "13px" }}>
                            {competencyDetail?.proficiency_level || selectedComp?.proficiency_level || "Not Evaluated"}
                          </b>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>Target Role Requirement</div>
                          <b style={{ color: "#60a5fa", fontSize: "13px" }}>
                            {activeRoleDetail?.requirements?.find(r => r.competency_id === (selectedComp?.competency_id || selectedCompetencyId))?.required_proficiency || "Intermediate"}
                          </b>
                        </div>
                      </div>

                      {/* Supporting Canonical Skills */}
                      <div style={{ marginTop: "14px" }}>
                        <div style={{ fontSize: "11.5px", fontWeight: 600, color: "#cbd5e1" }}>
                          Supporting Canonical Skills ({competencyDetail?.supporting_skills?.length || selectedComp?.supporting_skills_count || 0})
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                          {competencyDetail?.supporting_skills && competencyDetail.supporting_skills.length > 0 ? (
                            competencyDetail.supporting_skills.map((s) => (
                              <span
                                key={s.id}
                                style={{
                                  fontSize: "11px",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  background: s.is_primary ? "rgba(59, 130, 246, 0.15)" : "rgba(255, 255, 255, 0.05)",
                                  border: `1px solid ${s.is_primary ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.08)"}`,
                                  color: s.is_primary ? "#93c5fd" : "#cbd5e1",
                                }}
                              >
                                {s.name}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: "11.5px", color: "#64748b" }}>Direct demonstrated competency</span>
                          )}
                        </div>
                      </div>

                      {/* Authoritative Mapped Evidence */}
                      <div style={{ marginTop: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11.5px", fontWeight: 600, color: "#cbd5e1" }}>
                            Authoritative Evidence Artifacts ({evidenceProfile?.mapped_evidence_count || 0})
                          </span>
                          {evidenceProfile?.verified_evidence_count ? (
                            <span style={{ fontSize: "10px", color: "#34d399", display: "flex", alignItems: "center", gap: "3px" }}>
                              <ShieldCheck style={{ width: "11px", height: "11px" }} />
                              {evidenceProfile.verified_evidence_count} Verified
                            </span>
                          ) : null}
                        </div>

                        <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          {evidenceProfile?.evidence_items && evidenceProfile.evidence_items.length > 0 ? (
                            evidenceProfile.evidence_items.slice(0, 3).map((item) => (
                              <div
                                key={item.mapping_id}
                                style={{
                                  background: "rgba(255, 255, 255, 0.03)",
                                  border: "1px solid rgba(255, 255, 255, 0.06)",
                                  borderRadius: "6px",
                                  padding: "6px 8px",
                                  fontSize: "11px",
                                }}
                              >
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                  <span style={{ fontWeight: 600, color: "#f1f5f9" }}>{item.evidence_title}</span>
                                  <span style={{ color: "#60a5fa", fontWeight: 700 }}>{Math.round(item.confidence * 100)}%</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px", color: "#94a3b8", fontSize: "10px" }}>
                                  <span>{item.source_type}</span>
                                  <span>·</span>
                                  <span>{item.mapping_method}</span>
                                  <span>·</span>
                                  <span style={{ color: item.mapping_status === "CONFIRMED" ? "#34d399" : "#fbbf24" }}>{item.mapping_status}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span style={{ fontSize: "11px", color: "#64748b" }}>No verified evidence records yet</span>
                          )}
                        </div>
                      </div>

                      {/* Prerequisite & Complementary Edges */}
                      {((competencyDetail?.prerequisites && competencyDetail.prerequisites.length > 0) || (competencyDetail?.complements && competencyDetail.complements.length > 0)) && (
                        <div style={{ marginTop: "12px" }}>
                          <div style={{ fontSize: "11px", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" }}>
                            Relational Topology Edges
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                            {competencyDetail?.prerequisites?.map(p => (
                              <div key={p.id} style={{ fontSize: "11.5px", color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
                                <span>↳ Prerequisite for:</span>
                                <b>{p.target_competency_name}</b>
                              </div>
                            ))}
                            {competencyDetail?.complements?.map(c => (
                              <div key={c.id} style={{ fontSize: "11.5px", color: "#34d399", display: "flex", alignItems: "center", gap: "4px" }}>
                                <span>↳ Complements:</span>
                                <b>{c.target_competency_name}</b>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actionable Next Step */}
                      <div
                        style={{
                          background: "rgba(37, 99, 235, 0.08)",
                          border: "1px solid rgba(37, 99, 235, 0.2)",
                          borderRadius: "12px",
                          padding: "12px",
                          marginTop: "14px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase" }}>
                            RECOMMENDED ACTION
                          </span>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399" }}>
                            +2 readiness
                          </span>
                        </div>
                        <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#f8fafc", marginTop: "3px" }}>
                          {competencyDetail?.is_verified ? "Maintain competency mastery via verified lab evidence" : "Submit project repository for proctored automated grading"}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setStudioSkillId(selectedCompetencyId || "docker");
                        setPrimaryTab("studio");
                      }}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "10px",
                        background: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                      }}
                    >
                      <span>Launch Roadmap & Studio for {currentSkill.name.split("&")[0]}</span>
                      <ArrowUpRight style={{ width: "15px", height: "15px" }} />
                    </button>
                  </div>

                </div>
              </div>

              {/* TIER 3: Strategic Next Vectors & Action Sandbox (4 Columns) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                
                {/* VECTOR 1 */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "16px",
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", background: "rgba(59, 130, 246, 0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                        ASSESSMENT
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399" }}>+4 pts</span>
                    </div>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff", marginTop: "6px" }}>
                      Docker Proctored Challenge
                    </div>
                    <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>
                      25 minutes · Multi-stage build & Docker Compose verification.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast("Starting Docker Proctored Challenge...")}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#f8fafc",
                      padding: "7px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    Launch Assessment →
                  </button>
                </div>

                {/* VECTOR 2 */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "16px",
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#fbbf24", background: "rgba(245, 158, 11, 0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                        CURRICULUM SPRINT
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399" }}>+3 pts</span>
                    </div>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff", marginTop: "6px" }}>
                      Distributed Caching with Redis
                    </div>
                    <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>
                      Interactive hands-on lab · Cache stampede & TTL strategies.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast("Opening Redis Interactive Lab Sandbox...")}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#f8fafc",
                      padding: "7px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    Start Lab Sandbox →
                  </button>
                </div>

                {/* VECTOR 3 */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "16px",
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399", background: "rgba(16, 185, 129, 0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                        REPO EVIDENCE
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399" }}>+3 pts</span>
                    </div>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff", marginTop: "6px" }}>
                      Deploy API to AWS ECS
                    </div>
                    <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>
                      Link repository with live demo URL to satisfy Cloud criteria.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push("/student/profile")}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#f8fafc",
                      padding: "7px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    Submit Repository →
                  </button>
                </div>

                {/* VECTOR 4 */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.07)",
                    borderRadius: "16px",
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa", background: "rgba(167, 139, 250, 0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                        CREDENTIAL
                      </span>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399" }}>+2 pts</span>
                    </div>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#ffffff", marginTop: "6px" }}>
                      AWS Cloud Practitioner
                    </div>
                    <p style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>
                      NCVET aligned · Recognized by Razorpay, Zomato, CRED.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast("Verifying credential via Digilocker API gateway...")}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#f8fafc",
                      padding: "7px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    Verify Credential →
                  </button>
                </div>

              </div>
              </>
              )}

            </div>
          </main>
        </div>
      </div>
    </>
  );
}
