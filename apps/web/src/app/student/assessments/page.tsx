"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Target,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  FileCheck2,
  Award,
  ChevronDown,
  RefreshCw,
  GitBranch,
  Zap,
  BookOpen,
  Cpu,
  Lock,
  Boxes,
  Plus,
  Compass,
  FileText,
  Search,
  Flame,
  Play,
  Copy,
  Check,
  Code2,
  Terminal,
  ExternalLink,
  Mic,
  MicOff,
  Video,
  Eye,
  AlertTriangle,
  BarChart2,
  CheckCheck,
  X,
  Building,
  UserCheck
} from "lucide-react";
import {
  assessmentsCatalog,
  completedAssessmentsHistory,
  AssessmentItem,
  CompletedAssessmentRecord,
  AssessmentType
} from "@/data/assessmentsData";

export default function StudentAssessmentsPage() {
  const router = useRouter();

  // Filter & tab states
  const [filterType, setFilterType] = useState<"all" | AssessmentType | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Active Runner State
  const [activeTestForRunner, setActiveTestForRunner] = useState<AssessmentItem | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"python" | "typescript">("python");
  const [codeEditorContent, setCodeEditorContent] = useState<string>("");
  const [testCaseResults, setTestCaseResults] = useState<Array<{ id: string; status: "passed" | "failed"; time: string }> | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isTestSubmitted, setIsTestSubmitted] = useState(false);
  const [antiCheatFlags, setAntiCheatFlags] = useState(0);

  // Post-Mortem Report Modal State
  const [activePostMortem, setActivePostMortem] = useState<CompletedAssessmentRecord | null>(null);

  // AI Voice Mock State
  const [activeVoiceMock, setActiveVoiceMock] = useState<AssessmentItem | null>(null);
  const [voiceStep, setVoiceStep] = useState(1);
  const [isMicActive, setIsMicActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");

  // Daily Micro-drill state
  const [drillAnswered, setDrillAnswered] = useState(false);
  const [selectedDrillOption, setSelectedDrillOption] = useState<number | null>(null);

  // Copied hash state
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    showToast("Attestation SHA-256 copied to clipboard!");
    setTimeout(() => setCopiedHashId(null), 2500);
  };

  // Launch Assessment Runner
  const handleStartAssessment = (test: AssessmentItem) => {
    if (test.type === "ai_voice_mock") {
      setActiveVoiceMock(test);
      setVoiceStep(1);
      setVoiceTranscript("");
      return;
    }
    setActiveTestForRunner(test);
    setIsTestSubmitted(false);
    setTestCaseResults(null);
    setAntiCheatFlags(0);
    const initialCode = test.codingSpec?.starterCode?.python || `# Python Solution for ${test.title}\n\ndef solution():\n    pass\n`;
    setCodeEditorContent(initialCode);
  };

  // Run Test Cases Simulation
  const handleRunTests = () => {
    setIsTestRunning(true);
    setTimeout(() => {
      setIsTestRunning(false);
      setTestCaseResults([
        { id: "tc1", status: "passed", time: "4.2 ms" },
        { id: "tc2", status: "passed", time: "3.8 ms" },
        { id: "tc3", status: "passed", time: "5.1 ms" },
      ]);
      showToast("All test cases passed! Complexity verified O(1) amortized.");
    }, 900);
  };

  // Final Submit Test
  const handleSubmitFinalAssessment = () => {
    setIsTestSubmitted(true);
    showToast(`🎉 Assessment completed! +${activeTestForRunner?.pointsGain} Verified points added to Neo4j Competency Graph.`);
  };

  // Filter assessments list
  const filteredCatalog = assessmentsCatalog.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skillName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === "all") return true;
    if (filterType === "completed") return false;
    return item.type === filterType;
  });

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
            border: "1px solid rgba(59, 130, 246, 0.4)",
            borderRadius: "12px",
            padding: "14px 22px",
            fontSize: "13px",
            boxShadow: "0 16px 40px rgba(0,0,0,0.7)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeIn 0.2s ease-out"
          }}
        >
          <CheckCircle2 style={{ width: "18px", height: "18px", color: "#34d399", flexShrink: 0 }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* SVG Icons */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <symbol id="i-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></symbol>
          <symbol id="i-spark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7z"/></symbol>
          <symbol id="i-clip" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 12h6M9 16h4"/></symbol>
          <symbol id="i-case" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M3 12h18"/></symbol>
          <symbol id="i-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z"/><path d="M4 19.5A2.5 2.5 0 006.5 22H20"/></symbol>
          <symbol id="i-id" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M15 9h3M15 13h3"/></symbol>
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
            <Link href="/student/assessments" aria-current="page"><svg><use href="#i-clip"/></svg>Assessments & Labs</Link>
            <Link href="/student/opportunities"><svg><use href="#i-case"/></svg>Opportunities</Link>
            <Link href="/student/passport"><svg><use href="#i-id"/></svg>Skill passport</Link>
          </nav>

          <nav className="nav rail-bottom" aria-label="Account">
            <Link href="/admin/system"><svg><use href="#i-gear"/></svg>Settings</Link>
            <Link href="/about"><svg><use href="#i-help"/></svg>Help</Link>
          </nav>
        </aside>

        {/* Center Main Viewport */}
        <div>
          {/* Top Bar with Breadcrumb */}
          <header className="topbar" style={{ background: "rgba(11, 12, 16, 0.85)", backdropFilter: "blur(16px)" }}>
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/student/dashboard">Student</Link>
              <svg><use href="#i-chev"/></svg>
              <span className="here" style={{ color: "#ffffff", fontWeight: 600 }}>Assessments, Coding Labs & Proctored Arena</span>
            </nav>

            <div className="topbar-right">
              <label className="search" style={{ position: "relative" }}>
                <svg><use href="#i-search"/></svg>
                <input
                  type="text"
                  placeholder="Search challenges, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: "none", border: "none", outline: "none", color: "inherit", width: "100%", fontSize: "13px" }}
                />
                <kbd>⌘K</kbd>
              </label>

              <button className="icon-btn" type="button" aria-label="Help" onClick={() => router.push("/about")}>
                <svg><use href="#i-help"/></svg>
              </button>

              <button className="icon-btn" type="button" aria-label="Notifications" onClick={() => showToast("Anti-cheat proctoring engine active (Webcam/Audio attestation enabled)")}>
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

              {/* TOP HERO & STRATEGIC KPI STRIP */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(30, 41, 59, 0.45) 0%, rgba(15, 23, 42, 0.7) 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "20px",
                  padding: "26px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "20px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", margin: 0 }}>
                      Verified Assessment & Proctoring Arena
                    </h1>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#34d399",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: "999px"
                      }}
                    >
                      <ShieldCheck style={{ width: "12px", height: "12px" }} />
                      NCVET & NEP 2020 Attestation Engine
                    </span>
                  </div>
                  <p style={{ fontSize: "13.5px", color: "#94a3b8", marginTop: "6px", margin: "6px 0 0" }}>
                    Multi-modal evaluation: Company benchmarks, adaptive CAT diagnostics, live coding sandboxes, and AI technical interview mocks with tamper-proof cryptographic ledgers.
                  </p>
                </div>

                {/* KPI Metrics */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "10px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: "10.5px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Readiness Index</div>
                    <div style={{ fontSize: "19px", fontWeight: 800, color: "#34d399" }}>84%</div>
                  </div>

                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "10px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: "10.5px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Verified Tests</div>
                    <div style={{ fontSize: "19px", fontWeight: 800, color: "#ffffff" }}>7 / 10</div>
                  </div>

                  <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.25)", borderRadius: "14px", padding: "10px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: "10.5px", color: "#60a5fa", textTransform: "uppercase", fontWeight: 700 }}>National Rank</div>
                    <div style={{ fontSize: "19px", fontWeight: 800, color: "#60a5fa" }}>Top 5.4%</div>
                  </div>

                  <div style={{ background: "rgba(168, 85, 247, 0.08)", border: "1px solid rgba(168, 85, 247, 0.25)", borderRadius: "14px", padding: "10px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: "10.5px", color: "#c084fc", textTransform: "uppercase", fontWeight: 700 }}>NCrF Credits</div>
                    <div style={{ fontSize: "19px", fontWeight: 800, color: "#c084fc" }}>4.0 / 6.0</div>
                  </div>
                </div>
              </div>

              {/* SKILL DECAY ALERT & RECERTIFICATION BANNER */}
              <div
                style={{
                  background: "linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.08) 100%)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(245, 158, 11, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", flexShrink: 0 }}>
                    <AlertTriangle style={{ width: "20px", height: "20px" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#fef3c7" }}>
                      Skill Decay Warning: Redis In-Memory Concurrency Verification Expiring
                    </div>
                    <div style={{ fontSize: "12px", color: "#d97706", marginTop: "2px" }}>
                      Your test score was verified 120 days ago. Taking a 5-minute refresher drill prevents score decay on Tier-1 recruiter ledgers (Razorpay, Swiggy, Blinkit).
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const redisTest = assessmentsCatalog.find((t) => t.id === "asm_cat_redis");
                    if (redisTest) handleStartAssessment(redisTest);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 18px",
                    borderRadius: "10px",
                    background: "#f59e0b",
                    color: "#000000",
                    border: "none",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  <RefreshCw style={{ width: "14px", height: "14px" }} />
                  <span>Launch 5-Min Refresher Drill</span>
                </button>
              </div>

              {/* DAILY 3-MIN MICRO-DRILL WIDGET */}
              <div
                style={{
                  background: "#141519",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "18px",
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "16px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#f87171"
                    }}
                  >
                    <Flame style={{ width: "22px", height: "22px" }} />
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff" }}>
                        Daily Competency Micro-Drill
                      </span>
                      <span style={{ fontSize: "11px", color: "#f87171", background: "rgba(239, 68, 68, 0.12)", padding: "1px 6px", borderRadius: "999px", fontWeight: 700 }}>
                        🔥 8-Day Streak
                      </span>
                    </div>
                    <p style={{ fontSize: "12px", color: "#94a3b8", margin: "2px 0 0" }}>
                      Question: <i>Why does PostgreSQL default to READ COMMITTED isolation instead of SERIALIZABLE?</i>
                    </p>
                  </div>
                </div>

                {!drillAnswered ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {[
                      { idx: 1, label: "To maximize concurrency & avoid serialization aborts", correct: true },
                      { idx: 2, label: "Because SERIALIZABLE disables indexes", correct: false }
                    ].map((opt) => (
                      <button
                        key={opt.idx}
                        type="button"
                        onClick={() => {
                          setSelectedDrillOption(opt.idx);
                          setDrillAnswered(true);
                          showToast(opt.correct ? "✓ Correct! +1 Streak Point awarded." : "Incorrect! Review ACID isolation levels.");
                        }}
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.09)",
                          color: "#e2e8f0",
                          padding: "7px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer"
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: "12px", color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle2 style={{ width: "16px", height: "16px" }} />
                    <span>Streak maintained for today (+1 Competency Point)</span>
                  </div>
                )}
              </div>

              {/* FILTER TABS & SEARCH BAR */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
                <div style={{ display: "flex", gap: "6px", background: "rgba(255,255,255,0.03)", padding: "4px", borderRadius: "12px" }}>
                  {[
                    { id: "all", label: "All Formats" },
                    { id: "company_benchmark", label: "🏷️ Company Sponsored" },
                    { id: "adaptive_cat", label: "⚡ Adaptive CAT" },
                    { id: "coding_lab", label: "💻 Coding Labs" },
                    { id: "ai_voice_mock", label: "🎙️ AI Voice Mocks" },
                    { id: "completed", label: "📋 Completed Vault & Reports" }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterType(tab.id as any)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "9px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "none",
                        background: filterType === tab.id ? "#2563eb" : "transparent",
                        color: filterType === tab.id ? "#ffffff" : "#94a3b8",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Showing {filterType === "completed" ? completedAssessmentsHistory.length : filteredCatalog.length} challenges
                </span>
              </div>

              {/* CONTENT SECTION: ACTIVE CHALLENGES vs COMPLETED VAULT */}
              {filterType !== "completed" ? (
                /* ASSESSMENT CARDS GRID */
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "18px" }}>
                  {filteredCatalog.map((test) => {
                    const isCompany = test.type === "company_benchmark";
                    return (
                      <div
                        key={test.id}
                        style={{
                          background: "#141519",
                          border: isCompany ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "18px",
                          padding: "22px",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: "16px",
                          boxShadow: isCompany ? "0 8px 24px rgba(37,99,235,0.12)" : "none"
                        }}
                      >
                        <div>
                          {/* Card Header */}
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                {test.sponsorCompany && (
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 800,
                                      color: "#60a5fa",
                                      background: "rgba(37, 99, 235, 0.15)",
                                      border: "1px solid rgba(37, 99, 235, 0.3)",
                                      padding: "2px 8px",
                                      borderRadius: "6px"
                                    }}
                                  >
                                    🏢 {test.sponsorCompany.name} Benchmark
                                  </span>
                                )}

                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    color: test.difficulty === "Principal" ? "#c084fc" : test.difficulty === "Advanced" ? "#f59e0b" : "#34d399",
                                    background: "rgba(255,255,255,0.05)",
                                    padding: "2px 8px",
                                    borderRadius: "6px"
                                  }}
                                >
                                  {test.difficulty}
                                </span>

                                <span style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <Clock style={{ width: "12px", height: "12px" }} /> {test.durationMinutes} mins
                                </span>
                              </div>

                              <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: "8px 0 4px", lineHeight: 1.4 }}>
                                {test.title}
                              </h3>

                              <div style={{ fontSize: "12px", color: "#60a5fa", fontWeight: 600 }}>
                                Target Skill: {test.skillName}
                              </div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <span
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 800,
                                  color: "#34d399",
                                  background: "rgba(16, 185, 129, 0.12)",
                                  padding: "4px 8px",
                                  borderRadius: "8px",
                                  border: "1px solid rgba(16, 185, 129, 0.25)"
                                }}
                              >
                                +{test.pointsGain} Graph Pts
                              </span>
                            </div>
                          </div>

                          <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5, margin: "10px 0 0" }}>
                            {test.summary}
                          </p>

                          {/* Company hiring reward highlight */}
                          {test.sponsorCompany && (
                            <div
                              style={{
                                marginTop: "12px",
                                padding: "10px 12px",
                                borderRadius: "10px",
                                background: "rgba(37, 99, 235, 0.08)",
                                border: "1px solid rgba(59, 130, 246, 0.2)",
                                fontSize: "12px",
                                color: "#93c5fd",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                              }}
                            >
                              <Award style={{ width: "16px", height: "16px", color: "#fbbf24", flexShrink: 0 }} />
                              <span>
                                <b>Hiring Cutoff: {test.hiringThreshold}%</b> · {test.sponsorCompany.hiringReward}
                              </span>
                            </div>
                          )}

                          {/* Proctoring protocol info */}
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "12px", fontSize: "11px", color: "#64748b" }}>
                            <ShieldCheck style={{ width: "13px", height: "13px", color: "#10b981" }} />
                            <span>{test.proctoringLevel} · Anti-cheat full-screen lock</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <button
                          type="button"
                          onClick={() => handleStartAssessment(test)}
                          style={{
                            width: "100%",
                            padding: "11px",
                            borderRadius: "12px",
                            background: isCompany ? "#2563eb" : "rgba(255,255,255,0.06)",
                            border: isCompany ? "none" : "1px solid rgba(255,255,255,0.12)",
                            color: "#ffffff",
                            fontSize: "13px",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxShadow: isCompany ? "0 4px 14px rgba(37, 99, 235, 0.35)" : "none"
                          }}
                        >
                          <Play style={{ width: "14px", height: "14px" }} />
                          <span>Start Proctored Challenge</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* COMPLETED ASSESSMENTS VAULT TABLE */
                <div
                  style={{
                    background: "#141519",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "20px",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "18px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                        Cryptographically Verified Proof-of-Work Vault
                      </h3>
                      <p style={{ fontSize: "13px", color: "#94a3b8", margin: "4px 0 0" }}>
                        Attested assessment ledger records linked to your DigiLocker & Skill Passport. Click any assessment for deep post-mortem diagnostic review.
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "12px", color: "#34d399", background: "rgba(16, 185, 129, 0.1)", padding: "6px 12px", borderRadius: "10px", fontWeight: 700 }}>
                        ✓ 2 Official NCrF Credentials Minted
                      </span>
                    </div>
                  </div>

                  {/* History Cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {completedAssessmentsHistory.map((rec) => (
                      <div
                        key={rec.id}
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.07)",
                          borderRadius: "16px",
                          padding: "18px 20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "16px"
                        }}
                      >
                        <div style={{ flex: 1, minWidth: "280px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", background: "rgba(59, 130, 246, 0.12)", padding: "2px 8px", borderRadius: "6px" }}>
                              {rec.skillName}
                            </span>
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                              Verified on {rec.dateCompleted}
                            </span>
                          </div>

                          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: "6px 0 4px" }}>
                            {rec.title}
                          </h4>

                          <div style={{ fontSize: "12px", color: "#a78bfa" }}>
                            🏅 Award: {rec.badgeAwarded} · Unlocks: <b>{rec.companyUnlocked}</b>
                          </div>

                          {/* Attestation hash */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                            <code style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                              SHA-256: {rec.integrityHash.slice(0, 26)}...
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopyHash(rec.integrityHash, rec.id)}
                              style={{ background: "none", border: "none", color: copiedHashId === rec.id ? "#34d399" : "#94a3b8", cursor: "pointer", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
                            >
                              {copiedHashId === rec.id ? <Check style={{ width: "12px", height: "12px" }} /> : <Copy style={{ width: "12px", height: "12px" }} />}
                              <span>{copiedHashId === rec.id ? "Copied" : "Copy Hash"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Scores & Post-mortem button */}
                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "22px", fontWeight: 800, color: "#34d399", fontFamily: "monospace" }}>
                              {rec.score}%
                            </div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                              Top {100 - rec.percentile}% National
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActivePostMortem(rec)}
                            style={{
                              padding: "9px 16px",
                              borderRadius: "10px",
                              background: "rgba(37, 99, 235, 0.15)",
                              border: "1px solid rgba(59, 130, 246, 0.3)",
                              color: "#60a5fa",
                              fontSize: "12.5px",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}
                          >
                            <BarChart2 style={{ width: "14px", height: "14px" }} />
                            <span>View Deep Post-Mortem →</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>

      {/* LIVE CODING & ASSESSMENT RUNNER MODAL */}
      {activeTestForRunner && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.9)",
            backdropFilter: "blur(10px)",
            zIndex: 10000,
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Runner Top Bar */}
          <div
            style={{
              height: "56px",
              background: "#111216",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#60a5fa", background: "rgba(37, 99, 235, 0.2)", padding: "3px 8px", borderRadius: "6px" }}>
                LIVE PROCTORED SESSION
              </span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>
                {activeTestForRunner.title}
              </span>
            </div>

            {/* Anti-cheat Sentinel Status */}
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#34d399" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                <span>Webcam & Keystroke Monitor Active</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#94a3b8" }}>
                <Clock style={{ width: "14px", height: "14px" }} />
                <span style={{ fontFamily: "monospace", color: "#ffffff", fontWeight: 700 }}>38:14</span>
              </div>

              <button
                type="button"
                onClick={() => setActiveTestForRunner(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>
          </div>

          {/* Runner Body: Split View (Problem Statement vs Monaco Code Sandbox) */}
          {!isTestSubmitted ? (
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "440px 1fr", overflow: "hidden" }}>
              {/* Left Pane: Problem Description */}
              <div
                style={{
                  background: "#16171d",
                  borderRight: "1px solid rgba(255, 255, 255, 0.08)",
                  padding: "24px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase" }}>
                    Challenge Specification
                  </span>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: "4px 0 10px" }}>
                    Problem Statement
                  </h3>
                  <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {activeTestForRunner.codingSpec?.problemStatement || activeTestForRunner.summary}
                  </div>
                </div>

                {/* Test Cases Table */}
                {activeTestForRunner.codingSpec?.testCases && (
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                      Example Test Cases
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {activeTestForRunner.codingSpec.testCases.map((tc, idx) => (
                        <div key={tc.id} style={{ background: "rgba(0,0,0,0.3)", padding: "10px 12px", borderRadius: "8px", fontSize: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ color: "#60a5fa", fontWeight: 600 }}>Test Case {idx + 1} {tc.isHidden ? "(Hidden Test)" : ""}</div>
                          <div style={{ color: "#94a3b8", marginTop: "2px" }}>Input: <code style={{ color: "#f8fafc" }}>{tc.input}</code></div>
                          <div style={{ color: "#94a3b8" }}>Output: <code style={{ color: "#34d399" }}>{tc.expectedOutput}</code></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Pane: Code Sandbox & Terminal Output */}
              <div style={{ display: "flex", flexDirection: "column", background: "#0e0f14" }}>
                {/* Code Editor Header */}
                <div style={{ height: "44px", background: "#15161c", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Code2 style={{ width: "16px", height: "16px", color: "#60a5fa" }} />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        const lang = e.target.value as "python" | "typescript";
                        setSelectedLanguage(lang);
                        setCodeEditorContent(activeTestForRunner.codingSpec?.starterCode?.[lang] || "");
                      }}
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#ffffff", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}
                    >
                      <option value="python">Python 3.12 (CPython)</option>
                      <option value="typescript">TypeScript 5.4 (Node 20)</option>
                    </select>
                  </div>

                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Autosave enabled · Anti-paste sentinel active
                  </span>
                </div>

                {/* Editor Textarea */}
                <div style={{ flex: 1, padding: "16px", position: "relative" }}>
                  <textarea
                    value={codeEditorContent}
                    onChange={(e) => setCodeEditorContent(e.target.value)}
                    spellCheck={false}
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#e2e8f0",
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "13px",
                      lineHeight: 1.6,
                      resize: "none"
                    }}
                  />
                </div>

                {/* Console Output & Action Bar */}
                <div style={{ background: "#121318", borderTop: "1px solid rgba(255, 255, 255, 0.08)", padding: "14px 20px" }}>
                  {testCaseResults && (
                    <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                      {testCaseResults.map((r, i) => (
                        <span
                          key={r.id}
                          style={{
                            fontSize: "11.5px",
                            fontWeight: 700,
                            color: "#34d399",
                            background: "rgba(16, 185, 129, 0.12)",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            border: "1px solid rgba(16, 185, 129, 0.25)"
                          }}
                        >
                          ✓ Test {i + 1} Passed ({r.time})
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Target: <b style={{ color: "#60a5fa" }}>{activeTestForRunner.codingSpec?.timeComplexityOptimal || "O(1) optimal"}</b>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button
                        type="button"
                        onClick={handleRunTests}
                        disabled={isTestRunning}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "#e2e8f0",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        {isTestRunning ? "Executing Sandbox..." : "Run Test Cases"}
                      </button>

                      <button
                        type="button"
                        onClick={handleSubmitFinalAssessment}
                        style={{
                          padding: "8px 20px",
                          borderRadius: "8px",
                          background: "#2563eb",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)"
                        }}
                      >
                        Submit Final Assessment ✓
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Completed Screen inside Runner */
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
              <div style={{ textAlign: "center", maxWidth: "480px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", color: "#34d399", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                  <Award style={{ width: "32px", height: "32px" }} />
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  Assessment Successfully Attested!
                </h2>
                <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "6px" }}>
                  Your code passed 100% of test suites with optimal O(1) performance.
                </p>
                <div style={{ background: "rgba(37, 99, 235, 0.1)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "14px", padding: "16px", margin: "20px 0" }}>
                  <div style={{ fontSize: "12px", color: "#60a5fa", fontWeight: 700 }}>VERIFIED CREDENTIAL</div>
                  <div style={{ fontSize: "26px", fontWeight: 800, color: "#34d399", marginTop: "2px" }}>92% Score (Top 4.8%)</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                    +6 Competency Points synced with Neo4j Graph & Skill Passport.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTestForRunner(null)}
                  style={{ padding: "10px 24px", borderRadius: "10px", background: "#2563eb", color: "#ffffff", border: "none", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                >
                  Return to Assessment Hub
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DEEP POST-MORTEM DIAGNOSTIC MODAL */}
      {activePostMortem && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "#16171d",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "840px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "26px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)"
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399", textTransform: "uppercase" }}>
                  Verified Post-Mortem Audit · {activePostMortem.skillName}
                </span>
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", margin: "4px 0 2px" }}>
                  {activePostMortem.title}
                </h3>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Score: <b style={{ color: "#ffffff" }}>{activePostMortem.score}%</b> · Percentile: <b style={{ color: "#34d399" }}>Top {100 - activePostMortem.percentile}%</b> · Integrity: <b style={{ color: "#60a5fa" }}>{activePostMortem.postMortem.integrityScore}% Clean Attestation</b>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePostMortem(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            {/* Sub-Topic Precision Breakdown */}
            <div style={{ marginTop: "20px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "12px" }}>
                1. Topic-by-Topic Precision Analysis
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {activePostMortem.postMortem.subtopicBreakdown.map((sub) => (
                  <div key={sub.name} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", padding: "12px 14px", borderRadius: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", color: "#f8fafc", fontWeight: 600 }}>{sub.name}</span>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: sub.score >= 80 ? "#34d399" : "#fbbf24" }}>{sub.score}%</span>
                    </div>
                    <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ width: `${sub.score}%`, height: "100%", background: sub.score >= 80 ? "#10b981" : "#fbbf24", borderRadius: "999px" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px", fontSize: "11px", color: "#64748b" }}>
                      <span>Your time: {sub.timeSpentSec}s</span>
                      <span>National Median: {sub.benchmarkMedianSec}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Big-O Optimal vs Candidate Comparison */}
            <div style={{ marginTop: "22px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", marginBottom: "10px" }}>
                2. Optimal vs Student Architecture Comparison
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", padding: "14px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Your Solution</div>
                  <div style={{ fontSize: "12.5px", color: "#e2e8f0", marginTop: "4px" }}>{activePostMortem.postMortem.optimalCodeComparison.studentApproach}</div>
                  <div style={{ fontSize: "11.5px", color: "#60a5fa", marginTop: "6px" }}>
                    Time: {activePostMortem.postMortem.optimalCodeComparison.bigOTime.student}
                  </div>
                </div>

                <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "14px", borderRadius: "12px" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#34d399", textTransform: "uppercase" }}>Optimal Industry Standard</div>
                  <div style={{ fontSize: "12.5px", color: "#e2e8f0", marginTop: "4px" }}>{activePostMortem.postMortem.optimalCodeComparison.optimalApproach}</div>
                  <div style={{ fontSize: "11.5px", color: "#34d399", marginTop: "6px" }}>
                    Time: {activePostMortem.postMortem.optimalCodeComparison.bigOTime.optimal}
                  </div>
                </div>
              </div>

              {/* AI Evaluator Critique */}
              <div style={{ marginTop: "12px", background: "rgba(37, 99, 235, 0.08)", border: "1px solid rgba(59, 130, 246, 0.2)", padding: "12px 16px", borderRadius: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase" }}>AI Evaluator Notes</div>
                <div style={{ fontSize: "12.5px", color: "#cbd5e1", marginTop: "3px" }}>
                  {activePostMortem.postMortem.optimalCodeComparison.aiCritique}
                </div>
              </div>
            </div>

            {/* Cryptographic Ledger Proof */}
            <div style={{ marginTop: "22px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)", padding: "12px 16px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>Tamper-Evident SHA-256 Digest</div>
                <code style={{ fontSize: "11.5px", color: "#34d399", fontFamily: "monospace" }}>{activePostMortem.integrityHash}</code>
              </div>
              <button
                type="button"
                onClick={() => handleCopyHash(activePostMortem.integrityHash, "modal")}
                style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.06)", color: "#ffffff", border: "none", fontSize: "11.5px", cursor: "pointer" }}
              >
                Copy Hash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI VOICE MOCK INTERVIEW MODAL */}
      {activeVoiceMock && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
        >
          <div
            style={{
              background: "#16171d",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "640px",
              padding: "26px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa", textTransform: "uppercase" }}>AI Voice Technical Mock</span>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: "2px 0 0" }}>{activeVoiceMock.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveVoiceMock(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            <div style={{ marginTop: "20px", textAlign: "center" }}>
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background: isMicActive ? "rgba(239, 68, 68, 0.2)" : "rgba(168, 85, 247, 0.15)",
                  border: isMicActive ? "2px solid #ef4444" : "1px solid rgba(168, 85, 247, 0.3)",
                  color: isMicActive ? "#ef4444" : "#c084fc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  animation: isMicActive ? "pulse 1.5s infinite" : "none"
                }}
              >
                {isMicActive ? <Mic style={{ width: "32px", height: "32px" }} /> : <MicOff style={{ width: "32px", height: "32px" }} />}
              </div>

              <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Interviewer: "Suppose 100,000 customers click 'Buy Now' during a flash sale. How do you prevent inventory overselling?"
              </h4>
              <p style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "6px" }}>
                Click the microphone to answer verbally, or type your architectural trade-off below.
              </p>

              <textarea
                placeholder="Type your response: 'I would use Redis DECR to atomically decrement stock, paired with a Kafka queue for asynchronous checkout processing...'"
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                style={{
                  width: "100%",
                  height: "90px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  fontSize: "12.5px",
                  color: "#ffffff",
                  marginTop: "14px",
                  resize: "none",
                  outline: "none"
                }}
              />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginTop: "16px" }}>
                <button
                  type="button"
                  onClick={() => setIsMicActive(!isMicActive)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: "10px",
                    background: isMicActive ? "#ef4444" : "rgba(255,255,255,0.06)",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  {isMicActive ? <MicOff style={{ width: "14px", height: "14px" }} /> : <Mic style={{ width: "14px", height: "14px" }} />}
                  <span>{isMicActive ? "Mute Microphone" : "Speak into Mic"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast("AI evaluated: Strong understanding of atomic locks & queue decoupling. +5 Pts awarded!");
                    setActiveVoiceMock(null);
                  }}
                  style={{
                    padding: "9px 20px",
                    borderRadius: "10px",
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  Submit Verbal Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
