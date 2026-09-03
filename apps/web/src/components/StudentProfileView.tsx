"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Award,
  Code2,
  Briefcase,
  TrendingUp,
  Share2,
  Download,
  PlusCircle,
  Users,
  Eye,
  Check,
  ChevronRight,
  Search,
  HelpCircle,
  Bell,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { StudentProfileData } from "@/data/studentsData";

interface StudentProfileViewProps {
  student: StudentProfileData;
}

export default function StudentProfileView({ student }: StudentProfileViewProps) {
  const router = useRouter();
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      showToast("Verified profile URL copied to clipboard!");
    }
  };

  const handleDownloadDossier = () => {
    showToast(`Generating verified candidate dossier PDF for ${student.name}...`);
  };

  // SVG circular gauge calculation
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (student.readiness / 100) * circumference;

  // Radar chart polygon points calculation for Card 6
  // 5 axes: DSA (top), SystemDesign (top-right), Cloud (bottom-right), FullStack (bottom-left), ProblemSolving (top-left)
  const radarCenter = { x: 50, y: 50 };
  const maxR = 34;
  const angles = [-90, -18, 54, 126, 198]; // degrees for 5 vertices

  const scores = [
    (student.industryReadiness.radarScores.dsa / 100) * maxR,
    (student.industryReadiness.radarScores.systemDesign / 100) * maxR,
    (student.industryReadiness.radarScores.cloud / 100) * maxR,
    (student.industryReadiness.radarScores.fullStack / 100) * maxR,
    (student.industryReadiness.radarScores.problemSolving / 100) * maxR,
  ];

  const radarPolygonPoints = angles
    .map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      const x = radarCenter.x + scores[i] * Math.cos(rad);
      const y = radarCenter.y + scores[i] * Math.sin(rad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const outerWebPoints = angles
    .map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const x = radarCenter.x + maxR * Math.cos(rad);
      const y = radarCenter.y + maxR * Math.sin(rad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const midWebPoints = angles
    .map((deg) => {
      const rad = (deg * Math.PI) / 180;
      const x = radarCenter.x + (maxR * 0.6) * Math.cos(rad);
      const y = radarCenter.y + (maxR * 0.6) * Math.sin(rad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <>
      {/* Toast Alert */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            right: "28px",
            background: "#18191c",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: "12px",
            padding: "12px 20px",
            fontSize: "13px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.6)",
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

      {/* SVG Icon Symbols used across the shell */}
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

      <div className="shell">
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
            <Link href="/student/assessments"><svg><use href="#i-clip"/></svg>Assessments & Labs</Link>
            <Link href="/student/opportunities"><svg><use href="#i-case"/></svg>Opportunities</Link>
            <Link href="/student/opportunities"><svg><use href="#i-book"/></svg>Internships</Link>
            <Link href="/student/profile"><svg><use href="#i-id"/></svg>Skill passport</Link>

            <div className="nav-label">
              Institution <svg style={{ width: "14px", height: "14px", transform: "rotate(-90deg)" }}><use href="#i-chev"/></svg>
            </div>
            <Link href="/institution/dashboard"><svg><use href="#i-radio"/></svg>Placement command center</Link>
            <Link href="/institution/students" aria-current="page"><svg><use href="#i-user"/></svg>Student intelligence</Link>
            <Link href="/institution/readiness"><svg><use href="#i-trend"/></svg>Industry demand</Link>
            <Link href="/institution/placements"><svg><use href="#i-pie"/></svg>Outcomes</Link>
          </nav>

          <nav className="nav rail-bottom" aria-label="Account">
            <Link href="/admin/system"><svg><use href="#i-gear"/></svg>Settings</Link>
            <Link href="/about"><svg><use href="#i-help"/></svg>Help</Link>
            <Link href="/institution/dashboard"><svg><use href="#i-building"/></svg>Institution profile</Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div>
          {/* Top Bar with Breadcrumbs & Search */}
          <header className="topbar">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/institution/dashboard">Institution</Link>
              <svg><use href="#i-chev"/></svg>
              <Link href="/institution/students">Student intelligence</Link>
              <svg><use href="#i-chev"/></svg>
              <span className="here">{student.name}</span>
            </nav>

            <div className="topbar-right">
              <label className="search" style={{ position: "relative" }}>
                <svg><use href="#i-search"/></svg>
                <input
                  type="text"
                  placeholder="Search students"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      router.push("/institution/students");
                    }
                  }}
                  style={{ background: "none", border: "none", outline: "none", color: "inherit", width: "100%", fontSize: "13px" }}
                />
                <kbd>⌘K</kbd>
              </label>
              <button className="icon-btn" type="button" aria-label="Help" onClick={() => router.push("/about")}><svg><use href="#i-help"/></svg></button>
              <button className="icon-btn" type="button" aria-label="Notifications" onClick={() => showToast("No new alerts for this candidate")}><svg><use href="#i-bell"/></svg><span className="dot" aria-hidden="true"></span></button>
              <span className="avatar-sm" aria-label="Signed in as Institution Officer">AY</span>
            </div>
          </header>

          <main style={{ padding: "80px 28px 40px", maxWidth: "1280px", margin: "0 auto" }}>
            <div className="profile-shell">
              
              {/* Back to directory button */}
              <Link href="/institution/students" className="back-link">
                <ArrowLeft style={{ width: "14px", height: "14px" }} />
                <span>Back to directory</span>
              </Link>

              {/* Student Header Profile Card */}
              <div className="profile-card">
                
                {/* Left side: Avatar, Name, Degree, Verification pills */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  <div className="profile-avatar-wrap">
                    {student.avatar}
                    <div className="avatar-check-badge">
                      <Check style={{ width: "12px", height: "12px", strokeWidth: 3 }} />
                    </div>
                  </div>

                  <div className="profile-info">
                    <h1 className="profile-name">{student.name}</h1>
                    <div className="profile-sub">
                      {student.degree} &middot; {student.batch}
                    </div>
                    <div className="profile-meta">
                      {student.university} &middot; {student.location}
                    </div>
                    <div className="profile-meta">
                      Roll no. <b style={{ color: "#e2e8f0" }}>{student.rollNo}</b> &middot; {student.semester}
                    </div>

                    <div className={`avail-tag ${student.available ? "" : "unavailable"}`}>
                      <span className="avail-dot"></span>
                      <span>{student.availabilityText}</span>
                    </div>

                    <div className="verif-badges">
                      {student.institutionVerified && (
                        <span className="verif-pill">
                          <span className="verif-dot"></span>
                          Institution verified
                        </span>
                      )}
                      {student.identityVerified && (
                        <span className="verif-pill">
                          <span className="verif-dot"></span>
                          Identity verified
                        </span>
                      )}
                      {student.profileVerified && (
                        <span className="verif-pill">
                          <span className="verif-dot"></span>
                          Profile verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Readiness Radial Gauge & Trend */}
                <div className="readiness-box">
                  <div style={{ position: "relative", width: "70px", height: "70px", flexShrink: 0 }}>
                    <svg width="70" height="70" viewBox="0 0 70 70" style={{ transform: "rotate(-90deg)" }}>
                      <circle
                        cx="35"
                        cy="35"
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="35"
                        cy="35"
                        r={radius}
                        stroke="#296ff0"
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        fontSize: "17px",
                        fontWeight: 700,
                        color: "#ffffff",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {student.readiness}%
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "10.5px", fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8" }}>
                      {student.readinessLabel}
                    </span>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff" }}>
                      {student.targetRole}
                    </span>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Assessed against {student.rubricsCount} hiring rubrics
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
                      <span style={{ fontSize: "11.5px", color: "#34d399", fontWeight: 500 }}>
                        {student.confidence}
                      </span>
                      <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                        {student.evidenceCoverage}% evidence coverage
                      </span>
                    </div>

                    {/* Green trend sparkline curve */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                      <svg width="64" height="14" viewBox="0 0 64 14" fill="none" style={{ overflow: "visible" }}>
                        <path
                          d="M 2 11 Q 20 10 32 6 T 62 2"
                          stroke="#34d399"
                          strokeWidth="2"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                      <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>
                        {student.trendDays}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons Bar */}
              <div className="action-bar">
                <button
                  className="action-btn-primary"
                  type="button"
                  onClick={() => router.push(`/student/passport`)}
                >
                  <Eye style={{ width: "15px", height: "15px" }} />
                  <span>View skill passport</span>
                </button>

                <button
                  className="action-btn-secondary"
                  type="button"
                  onClick={() => showToast(`Added ${student.name} to cohort comparison matrix`)}
                >
                  <Users style={{ width: "15px", height: "15px" }} />
                  <span>Compare candidate</span>
                </button>

                <button
                  className="action-btn-secondary"
                  type="button"
                  onClick={handleCopyLink}
                >
                  <Share2 style={{ width: "15px", height: "15px" }} />
                  <span>Share profile</span>
                </button>

                <button
                  className="action-btn-secondary"
                  type="button"
                  onClick={handleDownloadDossier}
                >
                  <Download style={{ width: "15px", height: "15px" }} />
                  <span>Download report</span>
                </button>

                <button
                  className="action-btn-secondary"
                  type="button"
                  onClick={() => showToast(`Automated skill assessment dispatched to ${student.name}`)}
                >
                  <PlusCircle style={{ width: "15px", height: "15px" }} />
                  <span>Request assessment</span>
                </button>
              </div>

              {/* Under-action Horizontal Metric Bar */}
              <div className="stats-bar">
                <div>CGPA: <b>{student.cgpa}</b></div>
                <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
                <div>Verified skills: <b>{student.verifiedSkillsCount}</b></div>
                <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
                <div>Projects: <b>{student.projectsCount}</b></div>
                <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
                <div>Internships: <b>{student.internshipsCount}</b></div>
                <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
                <div>Certifications: <b>{student.certificationsCount}</b></div>
                <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
                <div>Coding rating: <b>{student.codingRating}</b></div>
                <span style={{ color: "rgba(255,255,255,0.15)" }}>|</span>
                <div>Evidence coverage: <b>{student.evidenceCoverage}%</b></div>
              </div>

              {/* Intelligence Overview Section Header */}
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "10px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>
                    Intelligence overview
                  </h2>
                  <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "2px" }}>
                    A verified, evidence-backed view of student capability and readiness.
                  </p>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                  From claims to evidence. From evidence to opportunity.
                </div>
              </div>

              {/* 6 Intelligence Overview Cards (3 columns x 2 rows) */}
              <div className="intel-grid">
                
                {/* CARD 1: Academic intelligence */}
                <div className="intel-card">
                  <div className="intel-card-head">
                    <div className="intel-card-title">
                      <GraduationCap />
                      <span>Academic intelligence</span>
                    </div>
                    <span className="intel-see-all" onClick={() => showToast("Opening detailed academic transcript")}>
                      See all &rsaquo;
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-end", gap: "28px" }}>
                    <div>
                      <div className="intel-metric-num">{student.academic.cgpa}</div>
                      <div className="intel-metric-sub">CGPA</div>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="intel-metric-num">{student.academic.trajectory}%</span>
                        <svg width="40" height="14" viewBox="0 0 40 14" fill="none">
                          <path d="M 2 12 Q 15 10 24 5 T 38 2" stroke="#34d399" strokeWidth="2" strokeLinecap="round" fill="none" />
                        </svg>
                      </div>
                      <div className="intel-metric-sub">
                        Trajectory <span style={{ color: "#34d399", fontWeight: 500 }}>{student.academic.trajectoryLabel}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "4px", fontSize: "12px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#34d399", fontWeight: 500 }}>
                      <span className="avail-dot"></span> Institution verified
                    </span>
                    <span style={{ color: "#94a3b8" }}>{student.academic.verifiedRange}</span>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>Backlogs</span>
                      <b style={{ color: "#f3f4f6" }}>{student.academic.backlogs}</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>Attendance</span>
                      <b style={{ color: "#f3f4f6" }}>{student.academic.attendance}%</b>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Skill intelligence */}
                <div className="intel-card">
                  <div className="intel-card-head">
                    <div className="intel-card-title">
                      <ShieldCheck />
                      <span>Skill intelligence</span>
                    </div>
                    <span className="intel-see-all" onClick={() => router.push("/student/competency")}>
                      See all &rsaquo;
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "flex-end", gap: "28px" }}>
                    <div>
                      <div className="intel-metric-num">{student.skills.verifiedSkills}</div>
                      <div className="intel-metric-sub">Verified skills</div>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="intel-metric-num">{student.skills.avgCompetency}%</span>
                        <svg width="40" height="14" viewBox="0 0 40 14" fill="none">
                          <path d="M 2 11 Q 14 9 24 5 T 38 2" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" fill="none" />
                        </svg>
                      </div>
                      <div className="intel-metric-sub">Average competency</div>
                    </div>
                  </div>

                  {/* Strongest tags */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", fontSize: "11.5px" }}>
                    <span style={{ color: "#94a3b8" }}>Strongest</span>
                    {student.skills.strongestSkills.map((sk) => (
                      <span
                        key={sk}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "999px",
                          padding: "2px 8px",
                          color: "#f1f5f9",
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: student.skills.criticalGapsCount > 0 ? "#fbbf24" : "#34d399", fontWeight: 500, fontSize: "12px" }}>
                        <span className="avail-dot" style={{ background: student.skills.criticalGapsCount > 0 ? "#fbbf24" : "#34d399" }}></span>
                        {student.skills.criticalGapsCount > 0 ? `${student.skills.criticalGapsCount} critical skill gaps` : "No critical skill gaps"}
                      </span>
                      <span style={{ color: "#94a3b8", fontSize: "11.5px" }}>{student.skills.gapsList}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>Last assessed</span>
                      <span style={{ color: "#e2e8f0" }}>{student.skills.lastAssessed}</span>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Digital intelligence */}
                <div className="intel-card">
                  <div className="intel-card-head">
                    <div className="intel-card-title">
                      <Code2 />
                      <span>Digital intelligence</span>
                    </div>
                    <span className="intel-see-all" onClick={() => showToast("Opening GitHub & LeetCode telemetry")}>
                      See all &rsaquo;
                    </span>
                  </div>

                  <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                    {student.digital.subtitle}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    <div>
                      <div className="intel-metric-num" style={{ fontSize: "22px" }}>{student.digital.leetcodeSolved}</div>
                      <div className="intel-metric-sub">LeetCode solved</div>
                    </div>
                    <div>
                      <div className="intel-metric-num" style={{ fontSize: "22px" }}>{student.digital.codeforcesRating}</div>
                      <div className="intel-metric-sub">Codeforces</div>
                    </div>
                    <div>
                      <div className="intel-metric-num" style={{ fontSize: "22px" }}>{student.digital.githubRepos}</div>
                      <div className="intel-metric-sub">GitHub repos</div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#34d399", fontWeight: 500, fontSize: "12px" }}>
                      <span className="avail-dot"></span>
                      {student.digital.signalText}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>Commits, last 90 days</span>
                      <b style={{ color: "#f3f4f6" }}>{student.digital.commits90Days}</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>Contest rank, best</span>
                      <b style={{ color: "#f3f4f6" }}>{student.digital.contestRankBest}</b>
                    </div>
                  </div>
                </div>

                {/* CARD 4: Experience intelligence */}
                <div className="intel-card">
                  <div className="intel-card-head">
                    <div className="intel-card-title">
                      <Briefcase />
                      <span>Experience intelligence</span>
                    </div>
                    <span className="intel-see-all" onClick={() => showToast("Viewing project & internship repository audits")}>
                      See all &rsaquo;
                    </span>
                  </div>

                  <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                    {student.experience.subtitle}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    <div>
                      <div className="intel-metric-num" style={{ fontSize: "22px" }}>{student.experience.projects}</div>
                      <div className="intel-metric-sub">Projects</div>
                    </div>
                    <div>
                      <div className="intel-metric-num" style={{ fontSize: "22px" }}>{student.experience.internships}</div>
                      <div className="intel-metric-sub">Internships</div>
                    </div>
                    <div>
                      <div className="intel-metric-num" style={{ fontSize: "22px" }}>{student.experience.hackathons}</div>
                      <div className="intel-metric-sub">Hackathons</div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#34d399", fontWeight: 500, fontSize: "12px" }}>
                      <span className="avail-dot"></span>
                      {student.experience.verifiedCount} verified experiences
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>Latest</span>
                      <span style={{ color: "#e2e8f0" }}>{student.experience.latest}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>Hackathon best</span>
                      <span style={{ color: "#e2e8f0" }}>{student.experience.hackathonBest}</span>
                    </div>
                  </div>
                </div>

                {/* CARD 5: Credential intelligence */}
                <div className="intel-card">
                  <div className="intel-card-head">
                    <div className="intel-card-title">
                      <Award />
                      <span>Credential intelligence</span>
                    </div>
                    <span className="intel-see-all" onClick={() => showToast("Viewing cryptographic credentials and NCVET ledger")}>
                      See all &rsaquo;
                    </span>
                  </div>

                  <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                    {student.credential.subtitle}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                    <div>
                      <div className="intel-metric-num" style={{ fontSize: "22px" }}>{student.credential.certifications}</div>
                      <div className="intel-metric-sub">Certifications</div>
                    </div>
                    <div>
                      <div className="intel-metric-num" style={{ fontSize: "22px" }}>{student.credential.assessments}</div>
                      <div className="intel-metric-sub">Assessments</div>
                    </div>
                    <div>
                      <div className="intel-metric-num" style={{ fontSize: "22px" }}>{student.credential.coverage}%</div>
                      <div className="intel-metric-sub">Coverage</div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#34d399", fontWeight: 500, fontSize: "12px" }}>
                      <span className="avail-dot"></span>
                      {student.credential.confidence}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>NCVET aligned</span>
                      <b style={{ color: "#f3f4f6" }}>{student.credential.ncvetAligned}</b>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#94a3b8" }}>Expiring soon</span>
                      <span style={{ color: "#f3f4f6" }}>{student.credential.expiringSoon}</span>
                    </div>
                  </div>
                </div>

                {/* CARD 6: Industry readiness */}
                <div className="intel-card">
                  <div className="intel-card-head">
                    <div className="intel-card-title">
                      <TrendingUp />
                      <span>Industry readiness</span>
                    </div>
                    <span className="intel-see-all" onClick={() => router.push("/institution/readiness")}>
                      See all &rsaquo;
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "999px",
                          border: "2.5px solid #2563eb",
                          display: "grid",
                          placeItems: "center",
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#ffffff",
                          flexShrink: 0,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {student.industryReadiness.score}%
                      </div>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                          {student.industryReadiness.role}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                          {student.industryReadiness.percentile}
                        </div>
                      </div>
                    </div>

                    {/* Glowing Blue Radar Pentagon Chart */}
                    <div style={{ position: "relative", width: "74px", height: "74px", flexShrink: 0 }}>
                      <svg width="74" height="74" viewBox="0 0 100 100">
                        {/* Outer and middle polygon grid webs */}
                        <polygon points={outerWebPoints} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
                        <polygon points={midWebPoints} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                        
                        {/* Axis lines */}
                        {angles.map((deg, i) => {
                          const rad = (deg * Math.PI) / 180;
                          const x = radarCenter.x + maxR * Math.cos(rad);
                          const y = radarCenter.y + maxR * Math.sin(rad);
                          return (
                            <line
                              key={i}
                              x1={radarCenter.x}
                              y1={radarCenter.y}
                              x2={x}
                              y2={y}
                              stroke="rgba(255,255,255,0.08)"
                              strokeWidth="1"
                            />
                          );
                        })}

                        {/* Filled Blue Competency Radar Area */}
                        <polygon
                          points={radarPolygonPoints}
                          fill="rgba(37, 99, 235, 0.35)"
                          stroke="#3b82f6"
                          strokeWidth="1.8"
                        />

                        {/* Node Dots */}
                        {angles.map((deg, i) => {
                          const rad = (deg * Math.PI) / 180;
                          const x = radarCenter.x + scores[i] * Math.cos(rad);
                          const y = radarCenter.y + scores[i] * Math.sin(rad);
                          return (
                            <circle
                              key={`dot-${i}`}
                              cx={x}
                              cy={y}
                              r="2.5"
                              fill="#60a5fa"
                              stroke="#1e3a8a"
                              strokeWidth="1"
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#34d399", fontWeight: 500 }}>
                      <span className="avail-dot"></span>
                      {student.industryReadiness.highlightText}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#fbbf24" }}>
                        <span className="avail-dot" style={{ background: "#fbbf24" }}></span>
                        {student.industryReadiness.gapHighlight}
                      </span>
                      <span style={{ color: "#94a3b8" }}>{student.industryReadiness.benchmark}</span>
                    </div>
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
