"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Award,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Target,
  Zap,
  ShieldCheck,
  Code2,
  Database,
  Server,
  Cloud,
  ChevronDown,
  Building2,
  FileCheck2,
  AlertCircle,
  Share2,
  Download,
  Plus
} from "lucide-react";

interface CompetencyItem {
  name: string;
  category: string;
  score: number;
  benchmark: number;
  status: "mastered" | "gap" | "developing";
  icon: React.ElementType;
}

interface OpportunityItem {
  id: string;
  company: string;
  logo: string;
  role: string;
  location: string;
  matchScore: number;
  stipend: string;
  deadline: string;
  matchingSkills: string[];
  missingSkill?: string;
}

export default function StudentDashboardPage() {
  const router = useRouter();

  // Target role configuration
  const rolesData: Record<string, {
    score: number;
    trend: string;
    benchmark: number;
    delta: string;
    skills: number;
    evidence: number;
    experience: number;
    assessments: number;
  }> = {
    "Backend Developer": {
      score: 78,
      trend: "+6.2%",
      benchmark: 80,
      delta: "2 points to hiring bar",
      skills: 82,
      evidence: 74,
      experience: 68,
      assessments: 86
    },
    "AI Platform Engineer": {
      score: 74,
      trend: "+8.5%",
      benchmark: 82,
      delta: "8 points to hiring bar",
      skills: 79,
      evidence: 71,
      experience: 64,
      assessments: 82
    },
    "Fullstack Engineer": {
      score: 83,
      trend: "+5.1%",
      benchmark: 78,
      delta: "+5 points above hiring bar",
      skills: 87,
      evidence: 80,
      experience: 72,
      assessments: 89
    },
    "DevOps & Cloud Specialist": {
      score: 71,
      trend: "+4.4%",
      benchmark: 82,
      delta: "11 points to hiring bar",
      skills: 75,
      evidence: 66,
      experience: 62,
      assessments: 80
    }
  };

  const [selectedRole, setSelectedRole] = useState("Backend Developer");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [skillFilter, setSkillFilter] = useState<"all" | "mastered" | "gaps">("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const currentRoleStats = rolesData[selectedRole] || rolesData["Backend Developer"];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.getElementById("dashboard-search-input");
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const competencies: CompetencyItem[] = [
    { name: "Python & Core OOP", category: "Languages", score: 94, benchmark: 80, status: "mastered", icon: Code2 },
    { name: "REST & GraphQL APIs", category: "Architecture", score: 91, benchmark: 80, status: "mastered", icon: Server },
    { name: "PostgreSQL & Query Optimization", category: "Databases", score: 88, benchmark: 75, status: "mastered", icon: Database },
    { name: "Docker & Containerization", category: "DevOps", score: 54, benchmark: 75, status: "gap", icon: Layers },
    { name: "Cloud AWS (ECS, S3, IAM)", category: "Infrastructure", score: 42, benchmark: 70, status: "gap", icon: Cloud },
    { name: "High-Scale System Design", category: "Systems", score: 51, benchmark: 70, status: "gap", icon: Target },
  ];

  const filteredCompetencies = competencies.filter((c) => {
    if (skillFilter === "mastered") return c.status === "mastered";
    if (skillFilter === "gaps") return c.status === "gap";
    return true;
  });

  const matchedOpportunities: OpportunityItem[] = [
    {
      id: "opp-1",
      company: "Razorpay",
      logo: "RZ",
      role: "Backend Engineering Intern",
      location: "Remote · 6 Months",
      matchScore: 92,
      stipend: "₹45,000 / mo",
      deadline: "Closes in 5 days",
      matchingSkills: ["Python", "PostgreSQL", "FastAPI"],
      missingSkill: "Docker intermediate"
    },
    {
      id: "opp-2",
      company: "Zomato",
      logo: "ZM",
      role: "Software Engineering Intern",
      location: "Gurugram · Hybrid",
      matchScore: 87,
      stipend: "₹50,000 / mo",
      deadline: "Closes in 12 days",
      matchingSkills: ["Python", "REST APIs", "SQL"],
      missingSkill: "AWS deployment"
    },
    {
      id: "opp-3",
      company: "CRED",
      logo: "CR",
      role: "Graduate Backend Developer",
      location: "Bengaluru · Full-time",
      matchScore: 84,
      stipend: "₹18-22 LPA",
      deadline: "Batch of 2027 priority",
      matchingSkills: ["Data structures", "OOP", "PostgreSQL"],
      missingSkill: "Distributed queues"
    },
    {
      id: "opp-4",
      company: "Freshworks",
      logo: "FW",
      role: "Platform Engineering Intern",
      location: "Chennai · 6 Months",
      matchScore: 81,
      stipend: "₹40,000 / mo",
      deadline: "Closes in 18 days",
      matchingSkills: ["Python", "APIs", "System architecture"],
      missingSkill: "Kubernetes basics"
    }
  ];

  // SVG Gauge calculations
  const gaugeRadius = 52;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference - (currentRoleStats.score / 100) * gaugeCircumference;

  return (
    <>
      {/* Toast Feedback */}
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
            <Link href="/student/dashboard" aria-current="page"><svg><use href="#i-grid"/></svg>Dashboard</Link>
            <Link href="/student/competency"><svg><use href="#i-spark"/></svg>Competency center</Link>
            <Link href="/student/competency"><svg><use href="#i-clip"/></svg>Assessments</Link>
            <Link href="/student/opportunities"><svg><use href="#i-case"/></svg>Opportunities</Link>
            <Link href="/student/opportunities"><svg><use href="#i-book"/></svg>Internships</Link>
            <Link href="/student/profile"><svg><use href="#i-id"/></svg>Skill passport</Link>

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
          {/* Top Bar */}
          <header className="topbar" style={{ background: "rgba(11, 12, 16, 0.85)", backdropFilter: "blur(16px)" }}>
            <nav className="crumbs" aria-label="Breadcrumb">
              <span className="here" style={{ color: "#ffffff", fontWeight: 600 }}>Student Command Center</span>
            </nav>

            <div className="topbar-right">
              <label className="search" style={{ position: "relative" }}>
                <svg><use href="#i-search"/></svg>
                <input
                  id="dashboard-search-input"
                  type="text"
                  placeholder="Search competencies, roles, drives..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      showToast("Searching platform for matching opportunities...");
                    }
                  }}
                  style={{ background: "none", border: "none", outline: "none", color: "inherit", width: "100%", fontSize: "13px" }}
                />
                <kbd>⌘K</kbd>
              </label>

              <button className="icon-btn" type="button" aria-label="Help" onClick={() => router.push("/about")}>
                <svg><use href="#i-help"/></svg>
              </button>

              <button className="icon-btn" type="button" aria-label="Notifications" onClick={() => showToast("Razorpay interview confirmed for Sep 4 · 2:00 PM")}>
                <svg><use href="#i-bell"/></svg>
                <span className="dot" aria-hidden="true" />
              </button>

              <Link href="/student/profile" className="avatar-sm" aria-label="Signed in as Aarav Sharma">
                AS
              </Link>
            </div>
          </header>

          <main style={{ padding: "80px 28px 60px", maxWidth: "1340px", margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

              {/* Top Hero Banner & Personalized Controls */}
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
                      Good morning, Aarav
                    </h1>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(16, 185, 129, 0.12)",
                        border: "1px solid rgba(16, 185, 129, 0.25)",
                        color: "#34d399",
                        fontSize: "11.5px",
                        fontWeight: 600,
                        padding: "2px 10px",
                        borderRadius: "999px",
                      }}
                    >
                      <span style={{ width: "6px", height: "6px", borderRadius: "999px", background: "#34d399" }}></span>
                      Active Candidate · IIT Delhi
                    </span>
                  </div>

                  <p style={{ fontSize: "13.5px", color: "#94a3b8", marginTop: "4px", margin: "4px 0 0" }}>
                    B.Tech Computer Science & Engineering · Class of 2027 · AISHE Code: U-0109
                  </p>
                </div>

                {/* Target Role Selector Chip & Actions */}
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
                        transition: "all 0.15s ease",
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
                          Target Hiring Blueprint
                        </div>
                        {Object.keys(rolesData).map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => {
                              setSelectedRole(role);
                              setShowRoleMenu(false);
                              showToast(`Active blueprint switched to ${role}`);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                              padding: "8px 10px",
                              borderRadius: "8px",
                              fontSize: "13px",
                              background: selectedRole === role ? "rgba(37, 99, 235, 0.2)" : "none",
                              color: selectedRole === role ? "#60a5fa" : "#e2e8f0",
                              border: "none",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <span>{role}</span>
                            {selectedRole === role && <CheckCircle2 style={{ width: "14px", height: "14px", color: "#60a5fa" }} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Top Action CTAs */}
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
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Plus style={{ width: "15px", height: "15px" }} />
                    <span>Add Evidence</span>
                  </button>
                </div>
              </div>

              {/* TIER 1: Executive Bento Grid (Career Readiness Command + High-Yield Actions) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "20px" }}>
                
                {/* HERO CARD (7 cols): Career Readiness Command Center */}
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
                  {/* Subtle ambient gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "300px",
                      height: "300px",
                      background: "radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(37, 99, 235, 0) 70%)",
                      pointerEvents: "none",
                    }}
                  />

                  <div>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#3b82f6" }}></span>
                        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Career Readiness Index
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push("/student/competency")}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#60a5fa",
                          fontSize: "12.5px",
                          fontWeight: 500,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          cursor: "pointer",
                        }}
                      >
                        Deep Diagnostics <ChevronRight style={{ width: "14px", height: "14px" }} />
                      </button>
                    </div>

                    {/* Readiness Gauge + Metrics Grid */}
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
                            {currentRoleStats.score}%
                          </div>
                          <div style={{ fontSize: "11px", fontWeight: 600, color: "#34d399", marginTop: "3px" }}>
                            {currentRoleStats.trend} mo
                          </div>
                        </div>
                      </div>

                      {/* 4 Dimension Bars */}
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px", minWidth: "220px" }}>
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                            <span style={{ color: "#94a3b8" }}>Technical Skills Mastery</span>
                            <b style={{ color: "#ffffff" }}>{currentRoleStats.skills}%</b>
                          </div>
                          <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                            <div style={{ width: `${currentRoleStats.skills}%`, height: "100%", background: "#3b82f6", borderRadius: "999px" }}></div>
                          </div>
                        </div>

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                            <span style={{ color: "#94a3b8" }}>Verified Project Repos</span>
                            <b style={{ color: "#fbbf24" }}>{currentRoleStats.evidence}% <span style={{ fontSize: "10px", fontWeight: 400 }}>(Gap)</span></b>
                          </div>
                          <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                            <div style={{ width: `${currentRoleStats.evidence}%`, height: "100%", background: "#fbbf24", borderRadius: "999px" }}></div>
                          </div>
                        </div>

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                            <span style={{ color: "#94a3b8" }}>Internship Experience</span>
                            <b style={{ color: "#fbbf24" }}>{currentRoleStats.experience}% <span style={{ fontSize: "10px", fontWeight: 400 }}>(Gap)</span></b>
                          </div>
                          <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                            <div style={{ width: `${currentRoleStats.experience}%`, height: "100%", background: "#fbbf24", borderRadius: "999px" }}></div>
                          </div>
                        </div>

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                            <span style={{ color: "#94a3b8" }}>Proctored Coding Tests</span>
                            <b style={{ color: "#ffffff" }}>{currentRoleStats.assessments}%</b>
                          </div>
                          <div style={{ height: "6px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                            <div style={{ width: `${currentRoleStats.assessments}%`, height: "100%", background: "#10b981", borderRadius: "999px" }}></div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Benchmark Intel Footer */}
                  <div
                    style={{
                      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                      paddingTop: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "12px",
                      fontSize: "12px",
                      color: "#94a3b8",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <AlertCircle style={{ width: "14px", height: "14px", color: "#fbbf24" }} />
                      <span>{currentRoleStats.delta} (Median of tier-1 hires: <b>{currentRoleStats.benchmark} pts</b>)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push("/student/competency")}
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "#f8fafc",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Boost Readiness →
                    </button>
                  </div>
                </div>

                {/* RIGHT CARD (5 cols): High-Yield Next Best Actions */}
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Zap style={{ width: "16px", height: "16px", color: "#f59e0b" }} />
                      <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                        High-Yield Actions
                      </h2>
                    </div>
                    <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                      Ranked by ROI / hr
                    </span>
                  </div>

                  {/* Action 1 */}
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.025)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "14px",
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#fbbf24", background: "rgba(245, 158, 11, 0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                          CRITICAL GAP
                        </span>
                        <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>+4 readiness</span>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
                        Docker & Containerization Sprint
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                        6-hour verified path with deployable image · Required by 11 roles
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        showToast("Launching Docker 6-Hour Mastery Track...");
                        router.push("/student/competency");
                      }}
                      style={{
                        background: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        padding: "7px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      Start Path
                    </button>
                  </div>

                  {/* Action 2 */}
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.025)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "14px",
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#60a5fa", background: "rgba(59, 130, 246, 0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                          EVIDENCE
                        </span>
                        <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>+3 readiness</span>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
                        Verify E-Commerce Backend Repo
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                        You claim 6 projects but only 1 has verified backend evidence.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push("/student/profile")}
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        color: "#f8fafc",
                        border: "1px solid rgba(255,255,255,0.12)",
                        padding: "7px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      Link Repo
                    </button>
                  </div>

                  {/* Action 3 */}
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.025)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: "14px",
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#10b981", background: "rgba(16, 185, 129, 0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                          ASSESSMENT
                        </span>
                        <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>+2 readiness</span>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc", marginTop: "2px" }}>
                        Backend Architecture Challenge
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                        25 min proctored challenge · Unlocks 4 partner shortlists
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        showToast("Launching Backend Architectural Challenge...");
                        router.push("/student/competency");
                      }}
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        color: "#f8fafc",
                        border: "1px solid rgba(255,255,255,0.12)",
                        padding: "7px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      Take Test
                    </button>
                  </div>

                </div>

              </div>

              {/* TIER 2: High-Density KPI Glass Ribbon */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "14px",
                }}
              >
                {[
                  { label: "Profile Score", val: "94%", sub: "IIT Delhi Verified", icon: ShieldCheck, color: "#34d399" },
                  { label: "Verified Skills", val: "18", sub: "Neo4j Synchronized", icon: Sparkles, color: "#60a5fa" },
                  { label: "Live Code Repos", val: "6", sub: "GitHub Audited", icon: Code2, color: "#a78bfa" },
                  { label: "Internships", val: "2", sub: "Razorpay, Swiggy", icon: Briefcase, color: "#38bdf8" },
                  { label: "Certifications", val: "8", sub: "NCVET Aligned", icon: Award, color: "#f59e0b" },
                  { label: "Evidence Coverage", val: "81%", sub: "High Confidence", icon: FileCheck2, color: "#10b981" },
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={idx}
                      style={{
                        background: "#141519",
                        border: "1px solid rgba(255, 255, 255, 0.07)",
                        borderRadius: "16px",
                        padding: "16px 18px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        transition: "transform 0.15s ease, border-color 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 500 }}>{kpi.label}</span>
                        <Icon style={{ width: "15px", height: "15px", color: kpi.color }} />
                      </div>
                      <div style={{ fontSize: "22px", fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-mono)", lineHeight: 1.1 }}>
                        {kpi.val}
                      </div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>
                        {kpi.sub}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* TIER 3: Bento 3-Column Core Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                
                {/* COLUMN 1: Target Role Competency Spectrum */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "20px",
                    padding: "22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div>
                    {/* Header + Filter Pills */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Code2 style={{ width: "16px", height: "16px", color: "#60a5fa" }} />
                        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Role Competencies
                        </h2>
                      </div>

                      <div style={{ display: "flex", gap: "4px" }}>
                        {(["all", "mastered", "gaps"] as const).map((f) => (
                          <button
                            key={f}
                            type="button"
                            onClick={() => setSkillFilter(f)}
                            style={{
                              background: skillFilter === f ? "#2563eb" : "rgba(255,255,255,0.05)",
                              color: skillFilter === f ? "#ffffff" : "#94a3b8",
                              border: "none",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 500,
                              cursor: "pointer",
                              textTransform: "capitalize",
                            }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Competency Item List */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                      {filteredCompetencies.map((comp) => {
                        const Icon = comp.icon;
                        const isGap = comp.status === "gap";
                        return (
                          <div key={comp.name} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12.5px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <Icon style={{ width: "13px", height: "13px", color: isGap ? "#fbbf24" : "#60a5fa" }} />
                                <span style={{ color: "#f8fafc", fontWeight: 500 }}>{comp.name}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "11.5px", color: "#64748b" }}>Bar: {comp.benchmark}%</span>
                                <b style={{ color: isGap ? "#fbbf24" : "#ffffff", fontFamily: "var(--font-mono)" }}>
                                  {comp.score}%
                                </b>
                              </div>
                            </div>

                            {/* Dual Bar (Student vs Benchmark) */}
                            <div style={{ position: "relative", height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "999px" }}>
                              <div
                                style={{
                                  width: `${comp.score}%`,
                                  height: "100%",
                                  background: isGap ? "#f59e0b" : "#3b82f6",
                                  borderRadius: "999px",
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  top: "-2px",
                                  left: `${comp.benchmark}%`,
                                  width: "2px",
                                  height: "9px",
                                  background: "rgba(255, 255, 255, 0.4)",
                                  borderRadius: "1px",
                                }}
                                title={`Industry bar: ${comp.benchmark}%`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/student/competency")}
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
                    <span>View 3D Competency Graph</span>
                    <ChevronRight style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>

                {/* COLUMN 2: AI Matched Opportunities Radar */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "20px",
                    padding: "22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Sparkles style={{ width: "16px", height: "16px", color: "#a78bfa" }} />
                        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Matched Opportunities
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        Neo4j AI Scored
                      </span>
                    </div>

                    {/* Matched Cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                      {matchedOpportunities.map((opp) => (
                        <div
                          key={opp.id}
                          onClick={() => router.push("/student/opportunities")}
                          style={{
                            background: "rgba(255, 255, 255, 0.025)",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                            borderRadius: "14px",
                            padding: "12px 14px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div
                                style={{
                                  width: "28px",
                                  height: "28px",
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
                                {opp.logo}
                              </div>
                              <div>
                                <div style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>
                                  {opp.role}
                                </div>
                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                                  {opp.company} · {opp.location}
                                </div>
                              </div>
                            </div>

                            <span
                              style={{
                                background: opp.matchScore >= 90 ? "rgba(16, 185, 129, 0.15)" : "rgba(37, 99, 235, 0.15)",
                                border: `1px solid ${opp.matchScore >= 90 ? "rgba(16, 185, 129, 0.3)" : "rgba(37, 99, 235, 0.3)"}`,
                                color: opp.matchScore >= 90 ? "#34d399" : "#60a5fa",
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "999px",
                              }}
                            >
                              {opp.matchScore}% Match
                            </span>
                          </div>

                          {/* Matching skills tag row */}
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                            {opp.matchingSkills.map((s) => (
                              <span
                                key={s}
                                style={{
                                  fontSize: "10px",
                                  color: "#94a3b8",
                                  background: "rgba(255,255,255,0.04)",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                }}
                              >
                                {s}
                              </span>
                            ))}
                            {opp.missingSkill && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  color: "#fbbf24",
                                  background: "rgba(245, 158, 11, 0.1)",
                                  padding: "1px 6px",
                                  borderRadius: "4px",
                                }}
                              >
                                Gap: {opp.missingSkill}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/student/opportunities")}
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
                    <span>View All 14 Recommendations</span>
                    <ChevronRight style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>

                {/* COLUMN 3: Active Application Pipeline & Interviews */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "20px",
                    padding: "22px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Building2 style={{ width: "16px", height: "16px", color: "#34d399" }} />
                        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Application Pipeline
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        1 Offer Received
                      </span>
                    </div>

                    {/* Funnel Stepper Pills */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 1fr)",
                        gap: "6px",
                        textAlign: "center",
                        marginTop: "16px",
                        padding: "10px",
                        background: "rgba(255, 255, 255, 0.02)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255, 255, 255, 0.05)",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-mono)" }}>12</div>
                        <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Applied</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#60a5fa", fontFamily: "var(--font-mono)" }}>6</div>
                        <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Shortlist</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#a78bfa", fontFamily: "var(--font-mono)" }}>4</div>
                        <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Tests</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#fbbf24", fontFamily: "var(--font-mono)" }}>2</div>
                        <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase" }}>Interviews</div>
                      </div>
                      <div>
                        <div style={{ fontSize: "16px", fontWeight: 700, color: "#34d399", fontFamily: "var(--font-mono)" }}>1</div>
                        <div style={{ fontSize: "10px", color: "#34d399", textTransform: "uppercase", fontWeight: 700 }}>Offer</div>
                      </div>
                    </div>

                    {/* Live Application Items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                      
                      <div
                        style={{
                          background: "rgba(16, 185, 129, 0.08)",
                          border: "1px solid rgba(16, 185, 129, 0.2)",
                          borderRadius: "12px",
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#34d399" }}>
                            Groww · Backend SDE Intern
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                            Offer Letter Verified · Ready for acceptance
                          </div>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399" }}>
                          Offer Ready
                        </span>
                      </div>

                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.025)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          borderRadius: "12px",
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#f8fafc" }}>
                            Razorpay · Technical Round
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                            Tomorrow at 2:00 PM · 45 mins
                          </div>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#60a5fa" }}>
                          Interview
                        </span>
                      </div>

                      <div
                        style={{
                          background: "rgba(255, 255, 255, 0.025)",
                          border: "1px solid rgba(255, 255, 255, 0.06)",
                          borderRadius: "12px",
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#f8fafc" }}>
                            Zomato · Take-Home Coding Challenge
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                            Deadline in 3 days · Proctored
                          </div>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#fbbf24" }}>
                          Pending
                        </span>
                      </div>

                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/student/applications")}
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
                    <span>Manage All 12 Applications</span>
                    <ChevronRight style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>

              </div>

              {/* TIER 4: Velocity Trajectory, Live Agenda & Verified Ledger (3 columns) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                
                {/* Trajectory Graph */}
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
                        <TrendingUp style={{ width: "16px", height: "16px", color: "#60a5fa" }} />
                        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          8-Month Growth Curve
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>
                        +16 pts overall
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                      Tracking progression from 62% in January to 78% today.
                    </p>

                    {/* Smooth SVG Area Chart */}
                    <div style={{ marginTop: "16px", position: "relative" }}>
                      <svg width="100%" height="90" viewBox="0 0 320 90" fill="none">
                        <defs>
                          <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Horizontal Grid lines */}
                        <line x1="0" y1="20" x2="320" y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                        <line x1="0" y1="50" x2="320" y2="50" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                        <line x1="0" y1="80" x2="320" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                        {/* Area */}
                        <path
                          d="M 10 70 Q 80 65 150 50 T 290 22 L 290 85 L 10 85 Z"
                          fill="url(#gradArea)"
                        />
                        {/* Line */}
                        <path
                          d="M 10 70 Q 80 65 150 50 T 290 22"
                          stroke="#3b82f6"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                        />
                        {/* Milestone points */}
                        <circle cx="10" cy="70" r="3.5" fill="#3b82f6" stroke="#0b0c10" strokeWidth="2" />
                        <circle cx="150" cy="50" r="3.5" fill="#3b82f6" stroke="#0b0c10" strokeWidth="2" />
                        <circle cx="290" cy="22" r="4.5" fill="#34d399" stroke="#0b0c10" strokeWidth="2" />
                      </svg>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
                        <span>Jan (62%)</span>
                        <span>May (70%)</span>
                        <span>Sep (78%)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: "11.5px", color: "#94a3b8", background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "8px" }}>
                    🚀 <b>Biggest jump:</b> +8 points in July upon verifying Razorpay summer internship.
                  </div>
                </div>

                {/* Agenda & Schedule */}
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
                        <Calendar style={{ width: "16px", height: "16px", color: "#f59e0b" }} />
                        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Action Agenda
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        Next 72 Hours
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "8px 0" }}>
                        <div style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "8px", flexShrink: 0 }}>
                          <b style={{ display: "block", fontSize: "14px", color: "#ffffff", lineHeight: 1 }}>2</b>
                          <span style={{ fontSize: "9.5px", color: "#94a3b8", textTransform: "uppercase" }}>Today</span>
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                            Backend Architecture Challenge
                          </div>
                          <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                            2:00 PM · 25 min proctored coding test
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "8px 0" }}>
                        <div style={{ textAlign: "center", background: "rgba(59, 130, 246, 0.15)", padding: "4px 8px", borderRadius: "8px", flexShrink: 0 }}>
                          <b style={{ display: "block", fontSize: "14px", color: "#60a5fa", lineHeight: 1 }}>3</b>
                          <span style={{ fontSize: "9.5px", color: "#60a5fa", textTransform: "uppercase" }}>Sep</span>
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                            Razorpay Technical Interview
                          </div>
                          <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                            Tomorrow at 2:00 PM · Google Meet
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "8px 0" }}>
                        <div style={{ textAlign: "center", background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: "8px", flexShrink: 0 }}>
                          <b style={{ display: "block", fontSize: "14px", color: "#ffffff", lineHeight: 1 }}>5</b>
                          <span style={{ fontSize: "9.5px", color: "#94a3b8", textTransform: "uppercase" }}>Sep</span>
                        </div>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                            Razorpay Application Window Closes
                          </div>
                          <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                            11:59 PM · Ensure portfolio links are live
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast("Syncing with Google Calendar...")}
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
                    Sync with Calendar
                  </button>
                </div>

                {/* Verified Achievements Feed */}
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
                        <Award style={{ width: "16px", height: "16px", color: "#10b981" }} />
                        <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Verified Achievements
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        Ledger Log
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <CheckCircle2 style={{ width: "15px", height: "15px", color: "#34d399", marginTop: "2px", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#f8fafc" }}>
                            Python Mastery Proctored Test: 94%
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>Yesterday · Cryptographically signed</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <CheckCircle2 style={{ width: "15px", height: "15px", color: "#34d399", marginTop: "2px", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#f8fafc" }}>
                            SIH 2025 Finalist Verified by Faculty
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>28 Aug · Linked to institutional ledger</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <CheckCircle2 style={{ width: "15px", height: "15px", color: "#34d399", marginTop: "2px", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#f8fafc" }}>
                            Summer Internship at Razorpay Confirmed
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>15 Aug · Work experience verified</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/student/profile")}
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
                    View Verified Ledger
                  </button>
                </div>

              </div>

            </div>
          </main>
        </div>
      </div>
    </>
  );
}
