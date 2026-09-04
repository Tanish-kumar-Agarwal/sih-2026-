"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  QrCode,
  Share2,
  Download,
  Copy,
  ExternalLink,
  Award,
  Sparkles,
  Lock,
  FileCheck2,
  Layers,
  Code2,
  GitBranch,
  Building2,
  GraduationCap,
  Calendar,
  Eye,
  EyeOff,
  Clock,
  ArrowUpRight,
  Database,
  Cpu,
  Zap,
  Target,
  Check,
  X
} from "lucide-react";
import { useDevPersona } from "@/hooks/useDevPersona";
import { useStudentCompetencies } from "@/hooks/useStudentCompetencies";

export default function StudentSkillPassportPage() {
  const router = useRouter();
  const { currentPersona } = useDevPersona();
  const { data: competenciesData } = useStudentCompetencies();

  const realCompetencies = competenciesData?.items || [];
  const compositeReadiness = realCompetencies.length > 0
    ? Math.round(realCompetencies.reduce((a, b) => a + b.score, 0) / realCompetencies.length)
    : (currentPersona?.id === "stu-rohit-kumar" ? 0 : 85);

  // State
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedRoleRubric, setSelectedRoleRubric] = useState("Razorpay Backend SDE");
  const [hideContact, setHideContact] = useState(false);
  const [hideCGPA, setHideCGPA] = useState(false);
  const [shareDuration, setShareDuration] = useState("7 Days");
  const [copiedLink, setCopiedLink] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopy = () => {
    setCopiedLink(true);
    navigator.clipboard?.writeText("https://skillsetu.in/verify/did:iitd:2027:aarav-sharma");
    showToast("Cryptographic passport URL copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Recruiter Fit Rubrics
  const recruiterRubrics: Record<string, { match: number; status: string; fitNote: string }> = {
    "Razorpay Backend SDE": {
      match: 94,
      status: "Eligible for Direct Fast-Track",
      fitNote: "Satisfies 100% of Python, PostgreSQL, and API Architecture requirements."
    },
    "Google Cloud Platform Engineer": {
      match: 88,
      status: "Near-Eligible (1 Project Gap)",
      fitNote: "Meets DSA & algorithmic criteria. Cloud container deployment needed for 95%+ match."
    },
    "CRED High-Scale Backend": {
      match: 86,
      status: "Near-Eligible (Caching Sprint Needed)",
      fitNote: "Demonstrated transaction ACID compliance. Caching layer verification recommended."
    },
    "Zomato Core Services Intern": {
      match: 91,
      status: "Shortlist Guaranteed",
      fitNote: "Prior internship evidence at Razorpay validates all minimum criteria."
    }
  };

  const currentRubric = recruiterRubrics[selectedRoleRubric] || recruiterRubrics["Razorpay Backend SDE"];

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

      {/* Share / Verification Modal */}
      {showShareModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(10px)",
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: "20px",
          }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            style={{
              background: "#14151a",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              padding: "28px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 24px 60px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldCheck style={{ width: "18px", height: "18px", color: "#34d399" }} />
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                  Share Verified Skill Passport
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            <p style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "6px" }}>
              Generate a tamper-proof cryptographic share link for recruiters and hiring managers.
            </p>

            {/* Passport URL Box */}
            <div
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                marginTop: "16px",
              }}
            >
              <span style={{ fontSize: "12px", color: "#60a5fa", fontFamily: "var(--font-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                https://skillsetu.in/verify/did:iitd:2027:aarav-sharma
              </span>
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  background: copiedLink ? "#10b981" : "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  flexShrink: 0,
                }}
              >
                {copiedLink ? <Check style={{ width: "13px", height: "13px" }} /> : <Copy style={{ width: "13px", height: "13px" }} />}
                <span>{copiedLink ? "Copied" : "Copy Link"}</span>
              </button>
            </div>

            {/* Granular Privacy Toggles */}
            <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Selective Disclosure & Privacy
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: "10px" }}>
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#ffffff" }}>Mask Contact Details (Email & Phone)</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Recruiters message you via SkillSetu portal</div>
                </div>
                <input
                  type="checkbox"
                  checked={hideContact}
                  onChange={(e) => setHideContact(e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#2563eb" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: "10px" }}>
                <div>
                  <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#ffffff" }}>Include Academic CGPA (8.92 / 10)</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Attested by IIT Delhi Registrar</div>
                </div>
                <input
                  type="checkbox"
                  checked={!hideCGPA}
                  onChange={(e) => setHideCGPA(!e.target.checked)}
                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#2563eb" }}
                />
              </div>
            </div>

            {/* Expiry Selection */}
            <div style={{ marginTop: "16px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                Link Expiry Window
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {["24 Hours", "7 Days", "30 Days", "Permanent"].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setShareDuration(dur)}
                    style={{
                      flex: 1,
                      padding: "6px 0",
                      borderRadius: "8px",
                      background: shareDuration === dur ? "rgba(37, 99, 235, 0.2)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${shareDuration === dur ? "#3b82f6" : "rgba(255,255,255,0.08)"}`,
                      color: shareDuration === dur ? "#60a5fa" : "#94a3b8",
                      fontSize: "11.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowShareModal(false);
                showToast(`Secure Share Link configured with ${shareDuration} validity!`);
              }}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: "10px",
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                marginTop: "20px",
              }}
            >
              Generate Shareable Cryptographic Credential
            </button>
          </div>
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
            <Link href="/student/assessments"><svg><use href="#i-clip"/></svg>Assessments & Labs</Link>
            <Link href="/student/opportunities"><svg><use href="#i-case"/></svg>Opportunities</Link>
            <Link href="/student/opportunities"><svg><use href="#i-book"/></svg>Internships</Link>
            <Link href="/student/passport" aria-current="page"><svg><use href="#i-id"/></svg>Skill passport</Link>
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
          {/* Top Bar */}
          <header className="topbar" style={{ background: "rgba(11, 12, 16, 0.85)", backdropFilter: "blur(16px)" }}>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/student/dashboard" style={{ color: "#94a3b8" }}>Student</Link>
              <svg><use href="#i-chev"/></svg>
              <span className="here" style={{ color: "#ffffff", fontWeight: 600 }}>Digital Skill Passport</span>
            </nav>

            <div className="topbar-right">
              <label className="search" style={{ position: "relative" }}>
                <svg><use href="#i-search"/></svg>
                <input
                  type="text"
                  placeholder="Search competencies, credential hashes..."
                  style={{ background: "none", border: "none", outline: "none", color: "inherit", width: "100%", fontSize: "13px" }}
                />
                <kbd>⌘K</kbd>
              </label>

              <button className="icon-btn" type="button" aria-label="Help" onClick={() => router.push("/about")}>
                <svg><use href="#i-help"/></svg>
              </button>

              <button className="icon-btn" type="button" aria-label="Notifications" onClick={() => showToast("DigiLocker ledger sync completed: 18 credentials validated")}>
                <svg><use href="#i-bell"/></svg>
                <span className="dot" aria-hidden="true" />
              </button>

              <Link href="/student/profile" className="avatar-sm" aria-label="Signed in as Aarav Sharma">
                AS
              </Link>
            </div>
          </header>

          <main style={{ padding: "80px 28px 60px", maxWidth: "1380px", margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

              {/* Master Header Row: Title & Action Bar */}
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
                      Digital Skill Passport
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
                      <ShieldCheck style={{ width: "12px", height: "12px" }} />
                      W3C Verifiable Credential · NCrF Aligned
                    </span>
                  </div>

                  <p style={{ fontSize: "13.5px", color: "#94a3b8", marginTop: "4px", margin: "4px 0 0" }}>
                    Cryptographically verified, portable proof-of-competence ledger issued by Indian Institute of Technology, Delhi.
                  </p>
                </div>

                {/* Top Action Tools */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      height: "38px",
                      padding: "0 14px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#f8fafc",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <Share2 style={{ width: "14px", height: "14px", color: "#60a5fa" }} />
                    <span>Share Passport</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast("Exporting ATS-Compliant PDF verified credential dossier...")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      height: "38px",
                      padding: "0 14px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#f8fafc",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <Download style={{ width: "14px", height: "14px" }} />
                    <span>Export ATS PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast("Syncing with DigiLocker National Gateway... Token ID: 9482-1092-4821")}
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
                    <Building2 style={{ width: "14px", height: "14px" }} />
                    <span>Push to DigiLocker</span>
                  </button>
                </div>
              </div>

              {/* MASTER HERO: Holographic Digital Passport ID Card (3D Metal Aesthetic) */}
              <div
                style={{
                  background: "linear-gradient(135deg, #161821 0%, #101217 50%, #0d0f14 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "24px",
                  padding: "32px",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Subtle Holographic Ambient Glows */}
                <div
                  style={{
                    position: "absolute",
                    top: "-80px",
                    right: "-80px",
                    width: "280px",
                    height: "280px",
                    background: "radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "-80px",
                    left: "20%",
                    width: "240px",
                    height: "240px",
                    background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />

                <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "28px", position: "relative", zIndex: 10 }}>
                  
                  {/* Left (8 cols): Student Identity & Holographic Metadata */}
                  <div style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "24px" }}>
                    
                    {/* Header Identity Row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                      <div
                        style={{
                          width: "68px",
                          height: "68px",
                          borderRadius: "18px",
                          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                          color: "#ffffff",
                          fontSize: "24px",
                          fontWeight: 800,
                          display: "grid",
                          placeItems: "center",
                          border: "2px solid rgba(255,255,255,0.2)",
                          boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)",
                          flexShrink: 0,
                        }}
                      >
                        {currentPersona ? `${currentPersona.firstName[0]}${currentPersona.lastName[0]}` : "AS"}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                            {currentPersona?.name?.toUpperCase() || "AARAV SHARMA"}
                          </h2>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399", background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.25)", padding: "2px 8px", borderRadius: "999px" }}>
                            ● ACTIVE CREDENTIAL
                          </span>
                        </div>
                        <div style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "4px" }}>
                          {currentPersona?.title || "B.Tech CSE"} · {currentPersona?.department || "Computer Science"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                          {currentPersona?.institution || "Indian Institute of Technology, Delhi"} · AISHE Code: <b>U-0109</b>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Grid (APAAR, NCrF, Issuance, Trust Score) */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "12px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: "16px",
                        padding: "14px 18px",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "10.5px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>APAAR / ABC ID</span>
                        <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                          9482-1092-4821
                        </div>
                        <span style={{ fontSize: "10px", color: "#34d399" }}>DigiLocker Verified</span>
                      </div>

                      <div>
                        <span style={{ fontSize: "10.5px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>NCrF Skill Level</span>
                        <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#60a5fa", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                          Level 6.0
                        </div>
                        <span style={{ fontSize: "10px", color: "#94a3b8" }}>Pre-Professional SDE</span>
                      </div>

                      <div>
                        <span style={{ fontSize: "10.5px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>Earned Credits</span>
                        <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                          148 + 18 Skill
                        </div>
                        <span style={{ fontSize: "10px", color: "#34d399" }}>8.92 / 10 CGPA</span>
                      </div>

                      <div>
                        <span style={{ fontSize: "10.5px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>Cryptographic Trust</span>
                        <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#34d399", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                          98.4%
                        </div>
                        <span style={{ fontSize: "10px", color: "#34d399" }}>0 Tamper Flags</span>
                      </div>
                    </div>

                    {/* Attestation Signature String */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", color: "#64748b", fontFamily: "var(--font-mono)" }}>
                      <Lock style={{ width: "12px", height: "12px", color: "#34d399" }} />
                      <span>Ledger Key: 0x8F9a42E8...91Cb4 · Issued by IIT Delhi Registrar (AICTE Reg: 1-49210)</span>
                    </div>

                  </div>

                  {/* Right (4 cols): Scannable QR Code & Instant Verification Portal */}
                  <div
                    style={{
                      gridColumn: "span 4",
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "20px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                      textAlign: "center",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Instant Recruiter Verification
                      </span>
                      
                      {/* Scannable SVG QR Code */}
                      <div
                        style={{
                          background: "#ffffff",
                          padding: "12px",
                          borderRadius: "14px",
                          margin: "12px auto",
                          width: "130px",
                          height: "130px",
                          display: "grid",
                          placeItems: "center",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                        }}
                      >
                        <svg width="106" height="106" viewBox="0 0 100 100" fill="#0b0c10">
                          {/* Corner Markers */}
                          <rect x="0" y="0" width="28" height="28" fill="#0b0c10" rx="3" />
                          <rect x="4" y="4" width="20" height="20" fill="#ffffff" rx="2" />
                          <rect x="8" y="8" width="12" height="12" fill="#0b0c10" rx="1" />

                          <rect x="72" y="0" width="28" height="28" fill="#0b0c10" rx="3" />
                          <rect x="76" y="4" width="20" height="20" fill="#ffffff" rx="2" />
                          <rect x="80" y="8" width="12" height="12" fill="#0b0c10" rx="1" />

                          <rect x="0" y="72" width="28" height="28" fill="#0b0c10" rx="3" />
                          <rect x="4" y="76" width="20" height="20" fill="#ffffff" rx="2" />
                          <rect x="8" y="80" width="12" height="12" fill="#0b0c10" rx="1" />

                          {/* Data Matrix Dots */}
                          <rect x="34" y="8" width="8" height="8" />
                          <rect x="46" y="4" width="8" height="8" />
                          <rect x="58" y="12" width="8" height="8" />
                          <rect x="34" y="24" width="8" height="8" />
                          <rect x="50" y="28" width="8" height="8" />
                          
                          <rect x="8" y="38" width="8" height="8" />
                          <rect x="24" y="44" width="8" height="8" />
                          <rect x="38" y="40" width="8" height="8" />
                          <rect x="52" y="44" width="8" height="8" />
                          <rect x="68" y="38" width="8" height="8" />
                          <rect x="82" y="44" width="8" height="8" />

                          <rect x="36" y="58" width="8" height="8" />
                          <rect x="48" y="64" width="8" height="8" />
                          <rect x="60" y="56" width="8" height="8" />

                          <rect x="74" y="74" width="8" height="8" />
                          <rect x="86" y="84" width="8" height="8" />
                          <rect x="42" y="80" width="8" height="8" />
                          <rect x="58" y="82" width="8" height="8" />
                        </svg>
                      </div>

                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        Scan to inspect cryptographic proof-of-work on public ledger
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#f8fafc",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginTop: "8px",
                      }}
                    >
                      <Copy style={{ width: "13px", height: "13px" }} />
                      <span>Copy DID Link</span>
                    </button>
                  </div>

                </div>
              </div>

              {/* TIER 2: Competency Hexagon Radar & Proof-of-Work Vault (7 cols + 5 cols) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "20px" }}>
                
                {/* LEFT (7 cols): 6-Pillar Competency Radar & Masteries */}
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
                    gap: "18px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Sparkles style={{ width: "16px", height: "16px", color: "#60a5fa" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          6-Pillar Competency Radar
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700, background: "rgba(16, 185, 129, 0.12)", padding: "2px 8px", borderRadius: "999px" }}>
                        {compositeReadiness}% Composite Readiness
                      </span>
                    </div>

                    {/* Dimension Progress Meters */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "18px" }}>
                      {[
                        {
                          pillar: "Technical Core Systems",
                          score: realCompetencies.filter(c => c.category?.toLowerCase().includes("software") || c.category?.toLowerCase().includes("core") || c.category?.toLowerCase().includes("diagnostics")).reduce((acc, c, _, arr) => acc + c.score / arr.length, 0) || (realCompetencies[0]?.score ?? (currentPersona?.id === "stu-rohit-kumar" ? 0 : 92)),
                          benchmark: 80,
                          proof: `${realCompetencies.length} Production Repos + Proctored Test`,
                          status: "mastered"
                        },
                        {
                          pillar: "Algorithmic & Domain Mastery",
                          score: realCompetencies.filter(c => c.category?.toLowerCase().includes("data") || c.category?.toLowerCase().includes("ai") || c.category?.toLowerCase().includes("pharmacology")).reduce((acc, c, _, arr) => acc + c.score / arr.length, 0) || (realCompetencies[1]?.score ?? (currentPersona?.id === "stu-rohit-kumar" ? 0 : 88)),
                          benchmark: 75,
                          proof: "Top 9% Proctored Evaluation",
                          status: "mastered"
                        },
                        {
                          pillar: "Database & Protocol Architecture",
                          score: realCompetencies.filter(c => c.category?.toLowerCase().includes("cloud") || c.category?.toLowerCase().includes("protocol") || c.category?.toLowerCase().includes("system")).reduce((acc, c, _, arr) => acc + c.score / arr.length, 0) || (realCompetencies[2]?.score ?? (currentPersona?.id === "stu-rohit-kumar" ? 0 : 85)),
                          benchmark: 75,
                          proof: "Schema & Transaction Audited",
                          status: "mastered"
                        },
                        {
                          pillar: "Real-World Project Proof",
                          score: realCompetencies.length > 0 ? 86 : (currentPersona?.id === "stu-rohit-kumar" ? 0 : 86),
                          benchmark: 70,
                          proof: `${realCompetencies.length > 0 ? '6' : '0'} Public GitHub Repositories`,
                          status: realCompetencies.length > 0 ? "mastered" : "gap"
                        },
                        {
                          pillar: "Professional Experience (Internships)",
                          score: realCompetencies.length > 0 ? 84 : (currentPersona?.id === "stu-rohit-kumar" ? 0 : 84),
                          benchmark: 70,
                          proof: realCompetencies.length > 0 ? "Industry Tenure Verified" : "Pending Tenure",
                          status: realCompetencies.length > 0 ? "mastered" : "gap"
                        },
                        {
                          pillar: "Cloud & DevOps Deployments",
                          score: realCompetencies.length > 0 ? 65 : (currentPersona?.id === "stu-rohit-kumar" ? 0 : 65),
                          benchmark: 75,
                          proof: "Containerized Microservices",
                          status: "gap"
                        },
                      ].map((p) => {
                        const roundScore = Math.round(p.score);
                        const isGap = roundScore < p.benchmark;
                        return (
                          <div key={p.pillar} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                              <span style={{ color: "#f8fafc", fontWeight: 500 }}>{p.pillar}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "11px", color: "#64748b" }}>{p.proof}</span>
                                <b style={{ color: isGap ? "#fbbf24" : "#ffffff", fontFamily: "var(--font-mono)" }}>
                                  {roundScore}%
                                </b>
                              </div>
                            </div>

                            <div style={{ position: "relative", height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "999px" }}>
                              <div
                                style={{
                                  width: `${roundScore}%`,
                                  height: "100%",
                                  background: isGap ? "#f59e0b" : "#3b82f6",
                                  borderRadius: "999px",
                                }}
                              />
                              <div
                                style={{
                                  position: "absolute",
                                  top: "-2px",
                                  left: `${p.benchmark}%`,
                                  width: "2px",
                                  height: "10px",
                                  background: "rgba(255, 255, 255, 0.4)",
                                  borderRadius: "1px",
                                }}
                                title={`Industry Benchmark: ${p.benchmark}%`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ fontSize: "12px", color: "#94a3b8", background: "rgba(255,255,255,0.03)", padding: "10px 14px", borderRadius: "10px" }}>
                    ⭐ <b>Passport Verification Guarantee:</b> 100% of competencies in this passport are mathematically proven via live code commits, proctored code executions, and faculty cryptographic signatures.
                  </div>
                </div>

                {/* RIGHT (5 cols): Cryptographic Proof-of-Work Vault */}
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
                        <FileCheck2 style={{ width: "16px", height: "16px", color: "#34d399" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Proof-of-Work Vault
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        Audit Trail
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                      
                      {/* Proof 1 */}
                      <div style={{ background: "rgba(255, 255, 255, 0.025)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", background: "rgba(59, 130, 246, 0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                            GITHUB REPO AUDIT
                          </span>
                          <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>SonarQube A</span>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", marginTop: "4px" }}>
                          e-commerce-microservices-backend
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>
                          142 commits · 94% test coverage · FastAPI & PostgreSQL
                        </div>
                      </div>

                      {/* Proof 2 */}
                      <div style={{ background: "rgba(255, 255, 255, 0.025)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399", background: "rgba(16, 185, 129, 0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                            PROCTORED EXAM
                          </span>
                          <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>Score 94%</span>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", marginTop: "4px" }}>
                          Advanced Python & Data Structures Assessment
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>
                          Ranked in top 2% of national university test-takers
                        </div>
                      </div>

                      {/* Proof 3 */}
                      <div style={{ background: "rgba(255, 255, 255, 0.025)", border: "1px solid rgba(255, 255, 255, 0.06)", borderRadius: "12px", padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa", background: "rgba(167, 139, 250, 0.12)", padding: "1px 6px", borderRadius: "4px" }}>
                            INDUSTRY TENURE
                          </span>
                          <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 600 }}>Verified HR</span>
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", marginTop: "4px" }}>
                          Razorpay Summer Internship (Backend)
                        </div>
                        <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>
                          8 weeks · Converted to PPO candidate · Letter of recommendation signed
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
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>Inspect Raw Cryptographic Signatures</span>
                    <ArrowUpRight style={{ width: "14px", height: "14px" }} />
                  </button>
                </div>

              </div>

              {/* TIER 3: National Credit Framework (NCrF) / ABC Wallet & Recruiter Trust Engine (2 Columns: 6 cols + 6 cols) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
                
                {/* NCrF Academic & Micro-Skill Credit Wallet */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "20px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <GraduationCap style={{ width: "18px", height: "18px", color: "#60a5fa" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          National Credit Framework (NCrF) Wallet
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#60a5fa", fontWeight: 600 }}>
                        NEP 2020 Aligned
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", margin: "16px 0" }}>
                      <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                        <b style={{ display: "block", fontSize: "20px", color: "#ffffff", fontFamily: "var(--font-mono)" }}>148</b>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>Academic Credits (IITD)</span>
                      </div>
                      <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                        <b style={{ display: "block", fontSize: "20px", color: "#34d399", fontFamily: "var(--font-mono)" }}>18</b>
                        <span style={{ fontSize: "11px", color: "#34d399" }}>NCVET Skill Credits</span>
                      </div>
                      <div style={{ background: "rgba(37, 99, 235, 0.1)", border: "1px solid rgba(37, 99, 235, 0.2)", padding: "12px", borderRadius: "12px", textAlign: "center" }}>
                        <b style={{ display: "block", fontSize: "20px", color: "#60a5fa", fontFamily: "var(--font-mono)" }}>Level 6.0</b>
                        <span style={{ fontSize: "11px", color: "#60a5fa" }}>Pre-Professional</span>
                      </div>
                    </div>

                    <div style={{ fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>
                      Credits are registered under <b>APAAR ID: 9482-1092-4821</b> in the Academic Bank of Credits (ABC) portal under the Ministry of Education, Government of India.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast("Opening DigiLocker ABC Credit Statement...")}
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
                    View National Credit Ledger Transcript
                  </button>
                </div>

                {/* Recruiter Role Rubric Simulator */}
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "20px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Target style={{ width: "17px", height: "17px", color: "#f59e0b" }} />
                        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em", margin: 0 }}>
                          Recruiter Role Rubric Simulator
                        </h2>
                      </div>
                      <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: 600 }}>
                        Live Match Test
                      </span>
                    </div>

                    <div style={{ marginTop: "14px" }}>
                      <label style={{ fontSize: "11px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                        Select Target Enterprise Rubric:
                      </label>
                      <select
                        value={selectedRoleRubric}
                        onChange={(e) => setSelectedRoleRubric(e.target.value)}
                        style={{
                          width: "100%",
                          background: "#18191f",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "10px",
                          color: "#ffffff",
                          padding: "8px 12px",
                          fontSize: "13px",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {Object.keys(recruiterRubrics).map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    {/* Simulation Result Card */}
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.025)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: "14px",
                        padding: "14px 16px",
                        marginTop: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#f8fafc" }}>
                          Match Score: <b style={{ color: "#34d399" }}>{currentRubric.match}%</b>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: currentRubric.match >= 90 ? "#34d399" : "#fbbf24" }}>
                          {currentRubric.status}
                        </span>
                      </div>
                      <p style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "6px", lineHeight: 1.45 }}>
                        {currentRubric.fitNote}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push("/student/opportunities")}
                    style={{
                      width: "100%",
                      padding: "9px",
                      borderRadius: "10px",
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <span>View Requisitions for this Rubric</span>
                    <ArrowUpRight style={{ width: "14px", height: "14px" }} />
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
