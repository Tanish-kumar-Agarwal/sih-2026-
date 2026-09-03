"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Target,
  TrendingUp,
  Building2,
  Briefcase,
  Award,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Filter,
  Download,
  Calendar,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  Clock,
  Layers,
  GraduationCap,
  FileCheck2,
  ShieldCheck,
  Send,
  Zap,
  BookOpen,
  PieChart,
  Search
} from "lucide-react";

export default function PlacementCommandCenterPage() {
  const router = useRouter();

  // Filter & interaction states
  const [selectedBatch, setSelectedBatch] = useState("Class of 2026");
  const [activePipelineTab, setActivePipelineTab] = useState<"all" | "active" | "completed">("all");
  const [readinessFilter, setReadinessFilter] = useState<"all" | "ready" | "near" | "risk">("all");
  const [trendYear, setTrendYear] = useState<"2024" | "2025" | "2026">("2026");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Placement Readiness Cohort Data
  const readinessStats = {
    totalEligible: 1420,
    readyCount: 682,
    readyPct: 48.0,
    nearReadyCount: 518,
    nearReadyPct: 36.5,
    atRiskCount: 220,
    atRiskPct: 15.5,
    averageReadiness: 78.4,
  };

  // 2. Placement Funnel Stages
  const funnelStages = [
    { stage: "Eligible Cohort", count: 1420, pct: "100%", drop: "0%", color: "#60a5fa" },
    { stage: "Applied to Drives", count: 1180, pct: "83.1%", drop: "-16.9%", color: "#3b82f6" },
    { stage: "AI Shortlisted", count: 840, pct: "59.2%", drop: "-23.9%", color: "#8b5cf6" },
    { stage: "Interview Rounds", count: 510, pct: "35.9%", drop: "-23.3%", color: "#f59e0b" },
    { stage: "Offers Placed", count: 412, pct: "29.0%", drop: "Conversion target: 85%", color: "#10b981" },
  ];

  // 3. TPO Critical Actions & Alerts
  const tpoActions = [
    {
      id: "act-1",
      severity: "high",
      tag: "URGENT ACTION",
      title: "14 Student Evidence Verifications Pending",
      desc: "Faculty reviews needed for GitHub repos & NCVET certificates before tomorrow's Razorpay drive.",
      btnText: "Review Queue",
      action: () => {
        showToast("Opening verification queue for 14 candidates...");
        router.push("/institution/students");
      }
    },
    {
      id: "act-2",
      severity: "warning",
      tag: "DRIVE DEADLINE",
      title: "Razorpay Campus Requisitions Close in 36 Hours",
      desc: "42 eligible CSE students have not submitted applications yet. Automated broadcast recommended.",
      btnText: "Send Broadcast Ping",
      action: () => showToast("Push notifications & emails dispatched to 42 eligible CSE students!")
    },
    {
      id: "act-3",
      severity: "info",
      tag: "CURRICULUM RADAR",
      title: "Cloud & Docker Shortage in Pre-Placement Pool",
      desc: "Recruiters demand 88% containerization competency; cohort average is currently 52%.",
      btnText: "Launch Weekend Sprint",
      action: () => showToast("Weekend Docker & Kubernetes fast-track track opened to 340 students.")
    },
  ];

  // 4. Industry Demand vs Talent Supply
  const skillSupplyDemand = [
    { skill: "Cloud Architecture (AWS/GCP)", demand: 92, supply: 44, gap: -48, status: "Severe Shortage", color: "#f43f5e" },
    { skill: "Docker & Kubernetes DevOps", demand: 88, supply: 52, gap: -36, status: "High Shortage", color: "#f59e0b" },
    { skill: "Distributed System Design", demand: 85, supply: 54, gap: -31, status: "Moderate Shortage", color: "#f59e0b" },
    { skill: "Python & Core OOP", demand: 80, supply: 92, gap: 12, status: "Balanced Surplus", color: "#10b981" },
    { skill: "React & Modern Frontend", demand: 72, supply: 84, gap: 12, status: "Adequate Talent", color: "#10b981" },
  ];

  // 5. Department Readiness
  const departmentBreakdown = [
    { name: "Computer Science & Engineering", count: 420, readiness: 91.2, verifiedRate: 89.0, topMatch: "FinTech & Cloud (Razorpay, CRED)" },
    { name: "Information Technology", count: 340, readiness: 86.4, verifiedRate: 82.5, topMatch: "Fullstack & APIs (Swiggy, Freshworks)" },
    { name: "Artificial Intelligence & Data Science", count: 280, readiness: 88.5, verifiedRate: 85.0, topMatch: "ML & Data Engineering (Microsoft, Sarvam)" },
    { name: "Electronics & Communication", count: 220, readiness: 79.8, verifiedRate: 74.0, topMatch: "Embedded & IoT (Intel, Qualcomm)" },
    { name: "Mechanical Engineering", count: 160, readiness: 71.4, verifiedRate: 68.0, topMatch: "CAD/Simulation (Tata Motors, L&T)" },
  ];

  // 6. Recruitment Pipeline
  const pipelineDrives = [
    {
      id: "drive-1",
      company: "Google Cloud",
      logo: "GC",
      role: "Cloud Systems Engineer",
      openings: 12,
      applied: 240,
      shortlisted: 48,
      interviews: 18,
      offers: 8,
      ctc: "₹32 LPA",
      status: "Final Rounds",
      type: "active"
    },
    {
      id: "drive-2",
      company: "Razorpay",
      logo: "RZ",
      role: "Backend Software Engineer",
      openings: 18,
      applied: 310,
      shortlisted: 64,
      interviews: 26,
      offers: 14,
      ctc: "₹24 LPA",
      status: "Technical Round 2",
      type: "active"
    },
    {
      id: "drive-3",
      company: "Microsoft",
      logo: "MS",
      role: "AI & Data Platform Engineer",
      openings: 8,
      applied: 190,
      shortlisted: 36,
      interviews: 14,
      offers: 6,
      ctc: "₹36 LPA",
      status: "Leadership Review",
      type: "active"
    },
    {
      id: "drive-4",
      company: "Zomato",
      logo: "ZM",
      role: "Fullstack Product Engineer",
      openings: 15,
      applied: 280,
      shortlisted: 52,
      interviews: 22,
      offers: 12,
      ctc: "₹20 LPA",
      status: "Drive Completed",
      type: "completed"
    },
    {
      id: "drive-5",
      company: "CRED",
      logo: "CR",
      role: "High-Scale Backend Specialist",
      openings: 10,
      applied: 165,
      shortlisted: 28,
      interviews: 12,
      offers: 5,
      ctc: "₹22 LPA",
      status: "Interviews Today",
      type: "active"
    },
  ];

  const filteredPipeline = pipelineDrives.filter((d) => {
    if (activePipelineTab === "active") return d.type === "active";
    if (activePipelineTab === "completed") return d.type === "completed";
    return true;
  });

  // 7. Internship -> Placement Conversion (PPO Velocity)
  const internshipPPOStats = {
    totalInterns: 210,
    convertedPPO: 164,
    conversionRate: 78.1,
    inReview: 32,
    openPool: 14,
    topPartners: [
      { company: "Razorpay", rate: "94% PPO rate", interns: 18 },
      { company: "Swiggy", rate: "88% PPO rate", interns: 16 },
      { company: "Microsoft", rate: "85% PPO rate", interns: 12 },
      { company: "Freshworks", rate: "82% PPO rate", interns: 14 },
    ]
  };

  // 8. Curriculum - Industry Skill Gaps (Syllabus vs Recruiter Demands)
  const curriculumGaps = [
    {
      topic: "Distributed Knowledge Graphs (Neo4j)",
      industryDemand: 92,
      syllabusCoverage: 34,
      gapPts: 58,
      recommendation: "Introduce Neo4j Graph DB module in Semester 6 Advanced DBs"
    },
    {
      topic: "LLM Orchestration & RAG Pipelines",
      industryDemand: 95,
      syllabusCoverage: 40,
      gapPts: 55,
      recommendation: "Add LangChain & Vector Embeddings to AI curriculum elective"
    },
    {
      topic: "Kubernetes & Cloud Microservices",
      industryDemand: 88,
      syllabusCoverage: 45,
      gapPts: 43,
      recommendation: "Set up lab cluster for automated container deployment"
    },
  ];

  // 9. High-Potential Talent Pool (Near-Ready Candidates)
  const highPotentialTalent = [
    { id: "1", name: "Aarav Sharma", branch: "CSE '27", readiness: 78, gap: "Docker & AWS ECS", timeNeeded: "6 hrs sprint", status: "Near Ready" },
    { id: "9", name: "Tanvi Kulkarni", branch: "IT '27", readiness: 77, gap: "Next.js & Jest Testing", timeNeeded: "8 hrs sprint", status: "Near Ready" },
    { id: "10", name: "Rohan Verma", branch: "IT '26", readiness: 75, gap: "Redis Caching Layers", timeNeeded: "4 hrs sprint", status: "Near Ready" },
    { id: "11", name: "Aditya Nair", branch: "ME '26", readiness: 71, gap: "ANSYS Numerical Lab", timeNeeded: "12 hrs sprint", status: "Near Ready" },
  ];

  // 10. Placement Trends (Historical)
  const trendsHistory = {
    "2024": { placedRate: 72.4, avgPackage: "₹11.2 LPA", highestPackage: "₹28 LPA", totalPlaced: 320 },
    "2025": { placedRate: 79.8, avgPackage: "₹13.5 LPA", highestPackage: "₹34 LPA", totalPlaced: 374 },
    "2026": { placedRate: 84.6, avgPackage: "₹15.8 LPA", highestPackage: "₹36 LPA", totalPlaced: 412 },
  };

  const currentTrend = trendsHistory[trendYear];

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
            <Link href="/student/competency"><svg><use href="#i-spark"/></svg>Competency center</Link>
            <Link href="/student/competency"><svg><use href="#i-clip"/></svg>Assessments</Link>
            <Link href="/student/opportunities"><svg><use href="#i-case"/></svg>Opportunities</Link>
            <Link href="/student/opportunities"><svg><use href="#i-book"/></svg>Internships</Link>
            <Link href="/student/profile"><svg><use href="#i-id"/></svg>Skill passport</Link>

            <div className="nav-label">
              Institution <svg style={{ width: "14px", height: "14px", transform: "rotate(-90deg)" }}><use href="#i-chev"/></svg>
            </div>
            <Link href="/institution/dashboard" aria-current="page"><svg><use href="#i-radio"/></svg>Placement command center</Link>
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
          {/* Top Bar with Breadcrumbs & Quick Search */}
          <header className="topbar" style={{ background: "rgba(11, 12, 16, 0.85)", backdropFilter: "blur(16px)" }}>
            <nav className="crumbs" aria-label="Breadcrumb">
              <span style={{ color: "#94a3b8" }}>Institution</span>
              <svg><use href="#i-chev"/></svg>
              <span className="here" style={{ color: "#ffffff", fontWeight: 600 }}>Placement Command Center</span>
            </nav>

            <div className="topbar-right">
              <label className="search" style={{ position: "relative" }}>
                <svg><use href="#i-search"/></svg>
                <input
                  type="text"
                  placeholder="Search drives, companies, students..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      showToast("Searching placement database...");
                    }
                  }}
                  style={{ background: "none", border: "none", outline: "none", color: "inherit", width: "100%", fontSize: "13px" }}
                />
                <kbd>⌘K</kbd>
              </label>

              <button className="icon-btn" type="button" aria-label="Help" onClick={() => router.push("/about")}>
                <svg><use href="#i-help"/></svg>
              </button>

              <button className="icon-btn" type="button" aria-label="Notifications" onClick={() => showToast("TPO Notice: 14 student dossiers pending sign-off")}>
                <svg><use href="#i-bell"/></svg>
                <span className="dot" aria-hidden="true" />
              </button>

              <span className="avatar-sm" aria-label="Signed in as TPO Officer">
                AY
              </span>
            </div>
          </header>

          <main style={{ padding: "80px 28px 60px", maxWidth: "1380px", margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

              {/* Master Header Row: Title + Batch Filter & Export Tools */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(30, 41, 59, 0.45) 0%, rgba(15, 23, 42, 0.65) 100%)",
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
                      Placement Command Center
                    </h1>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(37, 99, 235, 0.15)",
                        border: "1px solid rgba(37, 99, 235, 0.3)",
                        color: "#60a5fa",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        padding: "2px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      <Zap style={{ width: "12px", height: "12px" }} />
                      AI Matchmaking Active · Live Campus Drives
                    </span>
                  </div>

                  <p style={{ fontSize: "13.5px", color: "#94a3b8", marginTop: "4px", margin: "4px 0 0" }}>
                    Indian Institute of Technology, Delhi · AISHE Code: U-0109 · Total Graduating Pool: 1,420 Students
                  </p>
                </div>

                {/* Cohort Selector & Export Tools */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", padding: "3px", borderRadius: "10px" }}>
                    {["Class of 2026", "Class of 2027"].map((batch) => (
                      <button
                        key={batch}
                        type="button"
                        onClick={() => {
                          setSelectedBatch(batch);
                          showToast(`Telemetry updated for ${batch}`);
                        }}
                        style={{
                          background: selectedBatch === batch ? "#2563eb" : "none",
                          color: selectedBatch === batch ? "#ffffff" : "#94a3b8",
                          border: "none",
                          padding: "5px 12px",
                          borderRadius: "7px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        {batch}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/institution/students")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      height: "38px",
                      padding: "0 14px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#e2e8f0",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <Users style={{ width: "14px", height: "14px" }} />
                    <span>Student Directory</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast("Exporting official AICTE / NAAC Placement Compliance Dossier (PDF)...")}
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
                    <Download style={{ width: "14px", height: "14px" }} />
                    <span>Export Placement Dossier</span>
                  </button>
                </div>
              </div>

              {/* FEATURE 1: Placement Readiness — Ready / Near-Ready / At-Risk Breakdown (4 Columns) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                
                {/* Card 1: Overall Average Readiness */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "16px",
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 500 }}>Overall Cohort Readiness</span>
                    <ShieldCheck style={{ width: "16px", height: "16px", color: "#3b82f6" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-mono)" }}>
                      {readinessStats.averageReadiness}%
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#34d399", fontWeight: 600, marginTop: "2px" }}>
                      +4.8% vs last month · Top 5% National AISHE
                    </div>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${readinessStats.averageReadiness}%`, height: "100%", background: "#3b82f6" }}></div>
                  </div>
                </div>

                {/* Card 2: Placement Ready */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    borderRadius: "16px",
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#10b981" }}></span>
                      <span style={{ fontSize: "12px", color: "#34d399", fontWeight: 600 }}>Placement Ready (≥80%)</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{readinessStats.readyPct}%</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-mono)" }}>
                      {readinessStats.readyCount}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>
                      Tier-1 enterprise verified & shortlist-ready
                    </div>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${readinessStats.readyPct}%`, height: "100%", background: "#10b981" }}></div>
                  </div>
                </div>

                {/* Card 3: Near-Ready (High Leverage) */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(245, 158, 11, 0.2)",
                    borderRadius: "16px",
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#f59e0b" }}></span>
                      <span style={{ fontSize: "12px", color: "#fbbf24", fontWeight: 600 }}>Near-Ready (65%–79%)</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{readinessStats.nearReadyPct}%</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-mono)" }}>
                      {readinessStats.nearReadyCount}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#fbbf24", fontWeight: 500, marginTop: "2px" }}>
                      86 students within 1 project gap of Ready
                    </div>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${readinessStats.nearReadyPct}%`, height: "100%", background: "#f59e0b" }}></div>
                  </div>
                </div>

                {/* Card 4: At-Risk */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(244, 63, 94, 0.2)",
                    borderRadius: "16px",
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#f43f5e" }}></span>
                      <span style={{ fontSize: "12px", color: "#fb7185", fontWeight: 600 }}>At-Risk (&lt;65%)</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>{readinessStats.atRiskPct}%</span>
                  </div>
                  <div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", fontFamily: "var(--font-mono)" }}>
                      {readinessStats.atRiskCount}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#fb7185", fontWeight: 500, marginTop: "2px" }}>
                      Targeted mentorship & bootcamp assigned
                    </div>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ width: `${readinessStats.atRiskPct}%`, height: "100%", background: "#f43f5e" }}></div>
                  </div>
                </div>

              </div>

              {/* FEATURE 2: Placement Funnel (Visual Conversion Progression) */}
              <div
                style={{
                  background: "#141519",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "20px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <BarChart3 style={{ width: "18px", height: "18px", color: "#3b82f6" }} />
                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                      Placement Funnel Velocity
                    </h2>
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Eligible: <b>1,420</b> → Offers Released: <b style={{ color: "#34d399" }}>412</b> (Active Season Target: 85%)
                  </div>
                </div>

                {/* Visual Funnel Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
                  {funnelStages.map((st, i) => (
                    <div
                      key={st.stage}
                      style={{
                        background: "rgba(255, 255, 255, 0.025)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: "14px",
                        padding: "14px 16px",
                        position: "relative",
                      }}
                    >
                      <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>
                        Stage {i + 1}
                      </div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
                        {st.stage}
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: 800, color: st.color, fontFamily: "var(--font-mono)", margin: "6px 0 2px" }}>
                        {st.count}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8" }}>
                        <span>{st.pct} of cohort</span>
                        <span style={{ color: i === 4 ? "#34d399" : "#fbbf24" }}>{st.drop}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TIER 2: TPO Action Center & Department Readiness (12 Cols Split: 5 cols + 7 cols) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "20px" }}>
                
                {/* FEATURE 3: TPO Action Center (Critical Actions & Alerts) - 5 cols */}
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
                        <AlertCircle style={{ width: "17px", height: "17px", color: "#f59e0b" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          TPO Action Center
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#fbbf24", fontWeight: 700, background: "rgba(245, 158, 11, 0.12)", padding: "2px 8px", borderRadius: "999px" }}>
                        3 Actions Required
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                      {tpoActions.map((act) => (
                        <div
                          key={act.id}
                          style={{
                            background: "rgba(255, 255, 255, 0.025)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            borderRadius: "14px",
                            padding: "12px 14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "10.5px", fontWeight: 700, color: act.severity === "high" ? "#f43f5e" : "#fbbf24", background: act.severity === "high" ? "rgba(244, 63, 94, 0.12)" : "rgba(245, 158, 11, 0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                              {act.tag}
                            </span>
                            <button
                              type="button"
                              onClick={act.action}
                              style={{
                                background: "#2563eb",
                                color: "#ffffff",
                                border: "none",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "11.5px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              {act.btnText}
                            </button>
                          </div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                            {act.title}
                          </div>
                          <div style={{ fontSize: "11.5px", color: "#94a3b8", lineHeight: 1.4 }}>
                            {act.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast("Auto-routing all pending TPO actions to faculty coordinators...")}
                    style={{
                      width: "100%",
                      padding: "9px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#94a3b8",
                      fontSize: "12.5px",
                      fontWeight: 500,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    Dispatch Action Digest to Faculty Mentors
                  </button>
                </div>

                {/* FEATURE 5: Department Readiness - 7 cols */}
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
                    gap: "14px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <GraduationCap style={{ width: "18px", height: "18px", color: "#60a5fa" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Department Readiness Matrix
                        </h2>
                      </div>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                        5 Engineering Departments
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                      {departmentBreakdown.map((dept) => (
                        <div
                          key={dept.name}
                          style={{
                            background: "rgba(255, 255, 255, 0.025)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            borderRadius: "12px",
                            padding: "10px 14px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "14px",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <span style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>
                                {dept.name}
                              </span>
                              <b style={{ fontSize: "13.5px", color: "#34d399", fontFamily: "var(--font-mono)" }}>
                                {dept.readiness}%
                              </b>
                            </div>
                            
                            <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", margin: "6px 0", overflow: "hidden" }}>
                              <div style={{ width: `${dept.readiness}%`, height: "100%", background: "#3b82f6" }}></div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8" }}>
                              <span>{dept.count} students · {dept.verifiedRate}% verified proof</span>
                              <span style={{ color: "#60a5fa" }}>Match: {dept.topMatch}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: "11.5px", color: "#94a3b8", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "8px" }}>
                    📊 <b>Top Department:</b> CSE leads with 91.2% readiness; ECE and ME have active skill remediation bootcamps.
                  </div>
                </div>

              </div>

              {/* TIER 3: Industry Demand vs Talent Supply & Curriculum Gaps (6 cols + 6 cols) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
                
                {/* FEATURE 4: Industry Demand vs Talent Supply */}
                <div
                  style={{
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
                        <Target style={{ width: "17px", height: "17px", color: "#a78bfa" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Industry Demand vs Talent Supply
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        Skill Shortage Audit
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                      {skillSupplyDemand.map((item) => (
                        <div
                          key={item.skill}
                          style={{
                            background: "rgba(255, 255, 255, 0.025)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            borderRadius: "12px",
                            padding: "10px 14px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                            <span style={{ color: "#f8fafc", fontWeight: 600 }}>{item.skill}</span>
                            <span style={{ color: item.gap < 0 ? "#fbbf24" : "#34d399", fontWeight: 700, fontSize: "11.5px" }}>
                              {item.status} ({item.gap > 0 ? `+${item.gap}%` : `${item.gap}%`})
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                                <div style={{ width: `${item.demand}%`, height: "100%", background: "#60a5fa" }}></div>
                              </div>
                              <span style={{ fontSize: "10px", color: "#64748b" }}>Recruiter Demand: {item.demand}%</span>
                            </div>

                            <div style={{ flex: 1 }}>
                              <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                                <div style={{ width: `${item.supply}%`, height: "100%", background: item.color }}></div>
                              </div>
                              <span style={{ fontSize: "10px", color: "#64748b" }}>Student Supply: {item.supply}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/institution/readiness")}
                    style={{
                      width: "100%",
                      padding: "9px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#94a3b8",
                      fontSize: "12.5px",
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>View Granular Skill Taxonomy & Heatmap</span>
                    <ChevronRight style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>

                {/* FEATURE 8: Curriculum–Industry Skill Gaps */}
                <div
                  style={{
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
                        <BookOpen style={{ width: "17px", height: "17px", color: "#f59e0b" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Curriculum vs Industry Skill Gaps
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#f59e0b", fontWeight: 600 }}>
                        Academic Council Advisory
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                      {curriculumGaps.map((cg) => (
                        <div
                          key={cg.topic}
                          style={{
                            background: "rgba(255, 255, 255, 0.025)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            borderRadius: "12px",
                            padding: "12px 14px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>
                              {cg.topic}
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#f43f5e", background: "rgba(244, 63, 94, 0.12)", padding: "1px 8px", borderRadius: "999px" }}>
                              {cg.gapPts} pt Discrepancy
                            </span>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                            <span>Industry Demand: <b style={{ color: "#60a5fa" }}>{cg.industryDemand}%</b></span>
                            <span>Syllabus Coverage: <b style={{ color: "#fbbf24" }}>{cg.syllabusCoverage}%</b></span>
                          </div>

                          <div style={{ fontSize: "11.5px", color: "#cbd5e1", background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "6px", marginTop: "6px" }}>
                            💡 <i>{cg.recommendation}</i>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast("Curriculum Advisory Memorandum PDF generated for Board of Studies")}
                    style={{
                      width: "100%",
                      padding: "9px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#94a3b8",
                      fontSize: "12.5px",
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>Download Curriculum Revision Proposal</span>
                    <Download style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>

              </div>

              {/* FEATURE 6: Recruitment Pipeline — Companies, Openings, Applications, Offers */}
              <div
                style={{
                  background: "#141519",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "20px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Building2 style={{ width: "18px", height: "18px", color: "#3b82f6" }} />
                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                      Recruitment Pipeline & Corporate Drives
                    </h2>
                  </div>

                  <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", padding: "3px", borderRadius: "10px" }}>
                    {[
                      { id: "all", label: "All Drives" },
                      { id: "active", label: "Active Rounds" },
                      { id: "completed", label: "Completed" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActivePipelineTab(tab.id as any)}
                        style={{
                          background: activePipelineTab === tab.id ? "#2563eb" : "none",
                          color: activePipelineTab === tab.id ? "#ffffff" : "#94a3b8",
                          border: "none",
                          padding: "4px 12px",
                          borderRadius: "7px",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table of Active Pipeline */}
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8", fontSize: "12px" }}>
                        <th style={{ padding: "10px 14px" }}>Company & Role</th>
                        <th style={{ padding: "10px 14px" }}>Openings</th>
                        <th style={{ padding: "10px 14px" }}>Applied</th>
                        <th style={{ padding: "10px 14px" }}>Shortlisted</th>
                        <th style={{ padding: "10px 14px" }}>Interviews</th>
                        <th style={{ padding: "10px 14px" }}>Offers Released</th>
                        <th style={{ padding: "10px 14px" }}>Average CTC</th>
                        <th style={{ padding: "10px 14px" }}>Stage Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPipeline.map((d) => (
                        <tr
                          key={d.id}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.04)",
                            transition: "background 0.15s ease",
                          }}
                        >
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "8px",
                                  background: "rgba(37, 99, 235, 0.15)",
                                  border: "1px solid rgba(37, 99, 235, 0.3)",
                                  display: "grid",
                                  placeItems: "center",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  color: "#60a5fa",
                                }}
                              >
                                {d.logo}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, color: "#ffffff" }}>{d.company}</div>
                                <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>{d.role}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{d.openings}</td>
                          <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)" }}>{d.applied}</td>
                          <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", color: "#60a5fa" }}>{d.shortlisted}</td>
                          <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", color: "#fbbf24" }}>{d.interviews}</td>
                          <td style={{ padding: "12px 14px", fontFamily: "var(--font-mono)", color: "#34d399", fontWeight: 700 }}>{d.offers}</td>
                          <td style={{ padding: "12px 14px", fontWeight: 600, color: "#34d399" }}>{d.ctc}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <span
                              style={{
                                fontSize: "11.5px",
                                fontWeight: 600,
                                color: d.type === "completed" ? "#94a3b8" : "#60a5fa",
                                background: d.type === "completed" ? "rgba(255,255,255,0.06)" : "rgba(37, 99, 235, 0.15)",
                                padding: "3px 10px",
                                borderRadius: "999px",
                              }}
                            >
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TIER 4: 3 Columns Split (Internship PPO, High-Potential Talent Pool, Placement Trends) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                
                {/* FEATURE 7: Internship → Placement Conversion (PPO Tracker) */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "20px",
                    padding: "22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Briefcase style={{ width: "16px", height: "16px", color: "#34d399" }} />
                        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Internship → PPO Conversion
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700 }}>
                        {internshipPPOStats.conversionRate}% Rate
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", margin: "14px 0" }}>
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px", borderRadius: "10px", textAlign: "center" }}>
                        <b style={{ display: "block", fontSize: "18px", color: "#ffffff", fontFamily: "var(--font-mono)" }}>
                          {internshipPPOStats.totalInterns}
                        </b>
                        <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>Total Interns</span>
                      </div>
                      <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "8px", borderRadius: "10px", textAlign: "center" }}>
                        <b style={{ display: "block", fontSize: "18px", color: "#34d399", fontFamily: "var(--font-mono)" }}>
                          {internshipPPOStats.convertedPPO}
                        </b>
                        <span style={{ fontSize: "10.5px", color: "#34d399" }}>PPOs Received</span>
                      </div>
                      <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", padding: "8px", borderRadius: "10px", textAlign: "center" }}>
                        <b style={{ display: "block", fontSize: "18px", color: "#fbbf24", fontFamily: "var(--font-mono)" }}>
                          {internshipPPOStats.inReview}
                        </b>
                        <span style={{ fontSize: "10.5px", color: "#fbbf24" }}>Under Review</span>
                      </div>
                    </div>

                    {/* Top PPO Partners */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>
                        Top PPO Converting Partners
                      </div>
                      {internshipPPOStats.topPartners.map((p) => (
                        <div
                          key={p.company}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            fontSize: "12px",
                            padding: "6px 10px",
                            background: "rgba(255,255,255,0.02)",
                            borderRadius: "8px",
                          }}
                        >
                          <span style={{ color: "#ffffff", fontWeight: 500 }}>{p.company}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ color: "#94a3b8", fontSize: "11px" }}>{p.interns} interns</span>
                            <b style={{ color: "#34d399" }}>{p.rate}</b>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast("Opening Full PPO Tracker Ledger...")}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#94a3b8",
                      fontSize: "12px",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    View All Partner Conversion Contracts
                  </button>
                </div>

                {/* FEATURE 9: High-Potential Talent Pool (Near-Ready Candidates) */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "20px",
                    padding: "22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Sparkles style={{ width: "16px", height: "16px", color: "#60a5fa" }} />
                        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          High-Potential Talent Pool
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#60a5fa", fontWeight: 600 }}>
                        Quick-Unlock Cohort
                      </span>
                    </div>

                    <div style={{ fontSize: "11.5px", color: "#94a3b8", margin: "4px 0 10px" }}>
                      Students scoring 70–79% who unlock 4+ shortlists with 1 targeted sprint.
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {highPotentialTalent.map((cand) => (
                        <div
                          key={cand.id}
                          onClick={() => router.push(`/institution/students/${cand.id}`)}
                          style={{
                            background: "rgba(255, 255, 255, 0.025)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            borderRadius: "10px",
                            padding: "8px 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "12.5px", fontWeight: 600, color: "#ffffff" }}>{cand.name}</span>
                              <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>· {cand.branch}</span>
                            </div>
                            <div style={{ fontSize: "10.5px", color: "#fbbf24", marginTop: "2px" }}>
                              Needs: {cand.gap} ({cand.timeNeeded})
                            </div>
                          </div>

                          <div style={{ textAlign: "right" }}>
                            <b style={{ display: "block", fontSize: "13px", color: "#60a5fa", fontFamily: "var(--font-mono)" }}>
                              {cand.readiness}%
                            </b>
                            <span style={{ fontSize: "10px", color: "#34d399" }}>Near Ready</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/institution/students")}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "#94a3b8",
                      fontSize: "12px",
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    View All 518 Near-Ready Students →
                  </button>
                </div>

                {/* FEATURE 10: Placement Trends & Historical Performance */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "20px",
                    padding: "22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "14px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <TrendingUp style={{ width: "16px", height: "16px", color: "#10b981" }} />
                        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Placement Rate & CTC Trends
                        </h2>
                      </div>

                      {/* Year Selector */}
                      <div style={{ display: "flex", gap: "3px", background: "rgba(255,255,255,0.04)", padding: "2px", borderRadius: "8px" }}>
                        {(["2024", "2025", "2026"] as const).map((yr) => (
                          <button
                            key={yr}
                            type="button"
                            onClick={() => setTrendYear(yr)}
                            style={{
                              background: trendYear === yr ? "#2563eb" : "none",
                              color: trendYear === yr ? "#ffffff" : "#94a3b8",
                              border: "none",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              cursor: "pointer",
                            }}
                          >
                            {yr}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", margin: "14px 0" }}>
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "10px" }}>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>Placement Rate</span>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#34d399", fontFamily: "var(--font-mono)" }}>
                          {currentTrend.placedRate}%
                        </div>
                        <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>{currentTrend.totalPlaced} Students Placed</span>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "10px" }}>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>Average Package</span>
                        <div style={{ fontSize: "22px", fontWeight: 800, color: "#60a5fa", fontFamily: "var(--font-mono)" }}>
                          {currentTrend.avgPackage}
                        </div>
                        <span style={{ fontSize: "10.5px", color: "#34d399" }}>Highest: {currentTrend.highestPackage}</span>
                      </div>
                    </div>

                    {/* Mini SVG Trend Line */}
                    <div style={{ position: "relative" }}>
                      <svg width="100%" height="45" viewBox="0 0 240 45" fill="none">
                        <path d="M 10 38 Q 80 30 140 22 T 230 8" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        <circle cx="10" cy="38" r="3" fill="#10b981" />
                        <circle cx="140" cy="22" r="3" fill="#10b981" />
                        <circle cx="230" cy="8" r="4" fill="#34d399" />
                      </svg>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#64748b" }}>
                        <span>2024 (72.4%)</span>
                        <span>2025 (79.8%)</span>
                        <span style={{ color: "#34d399" }}>2026 (84.6%)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: "11px", color: "#94a3b8", background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "8px", textAlign: "center" }}>
                    📈 +17% YoY increase in median package driven by verified graph matching.
                  </div>
                </div>

              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}
