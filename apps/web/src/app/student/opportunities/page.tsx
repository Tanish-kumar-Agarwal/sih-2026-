"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Search,
  Filter,
  Briefcase,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Bookmark,
  BookmarkCheck,
  Send,
  Target,
  Zap,
  ChevronRight,
  ShieldCheck,
  Code2,
  Flame,
  Layers,
  ExternalLink,
  SlidersHorizontal,
  ChevronDown,
  FileCheck2,
  Calendar,
  X
} from "lucide-react";

interface CompetencyMatch {
  name: string;
  status: "strong" | "developing" | "missing";
  proficiency: string;
}

interface Opportunity {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  workMode: "Remote" | "Hybrid" | "Onsite";
  type: "Internship" | "Full-time";
  duration: string;
  stipendOrSalary: string;
  deadline: string;
  deadlineDays: number;
  matchScore: number;
  graphMatch: number;
  vectorMatch: number;
  eligibility: "eligible" | "near-eligible" | "not-eligible";
  reasoning: string;
  whyYouMatch: string;
  competencies: CompetencyMatch[];
  criticalGap?: {
    skill: string;
    gapText: string;
    actionText: string;
    actionLink: string;
    boost: string;
  };
  applicationStatus: "none" | "saved" | "applied" | "shortlisted" | "rejected";
  applicantsCount: number;
  hiringTier: "Tier 1 Enterprise" | "High-Growth Unicorn" | "AI Research Lab";
}

export default function OpportunityExplorerPage() {
  const router = useRouter();

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "eligible" | "almost-reach" | "applied" | "saved">("all");
  const [workModeFilter, setWorkModeFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedOppId, setSelectedOppId] = useState<string>("opp-1");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Comprehensive Opportunities Dataset
  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: "opp-1",
      title: "Backend Engineering Intern",
      company: "Razorpay",
      logo: "RZ",
      location: "Bengaluru · Hybrid",
      workMode: "Hybrid",
      type: "Internship",
      duration: "6 Months",
      stipendOrSalary: "₹45,000 / mo",
      deadline: "Closes in 3 days",
      deadlineDays: 3,
      matchScore: 94,
      graphMatch: 95,
      vectorMatch: 93,
      eligibility: "eligible",
      reasoning: "High graph traversal fit with Python 3.11, PostgreSQL, and REST API design.",
      whyYouMatch: "Your verified project 'e-commerce-microservices' and top 9% DSA rating directly satisfy Razorpay's Core FinTech rubric.",
      competencies: [
        { name: "Python Core", status: "strong", proficiency: "Advanced (94%)" },
        { name: "PostgreSQL & SQL", status: "strong", proficiency: "Advanced (88%)" },
        { name: "REST API Design", status: "strong", proficiency: "Advanced (91%)" },
        { name: "Redis Caching", status: "developing", proficiency: "Intermediate (70%)" },
        { name: "Docker & ECS", status: "missing", proficiency: "Basic (54%)" },
      ],
      criticalGap: {
        skill: "Docker Intermediate",
        gapText: "Razorpay requires Docker containerization for production deployment.",
        actionText: "Launch 6-Hour Docker Sprint",
        actionLink: "/student/competency",
        boost: "+4 readiness"
      },
      applicationStatus: "none",
      applicantsCount: 310,
      hiringTier: "High-Growth Unicorn"
    },
    {
      id: "opp-2",
      title: "Full Stack AI Platform Engineer",
      company: "Google Cloud",
      logo: "GC",
      location: "Bengaluru / Hyderabad",
      workMode: "Hybrid",
      type: "Full-time",
      duration: "Permanent",
      stipendOrSalary: "₹32 LPA",
      deadline: "Closes in 6 days",
      deadlineDays: 6,
      matchScore: 88,
      graphMatch: 89,
      vectorMatch: 87,
      eligibility: "near-eligible",
      reasoning: "Solid algorithms and Python background; lacks verified cloud deployment evidence.",
      whyYouMatch: "High semantic cosine match on Distributed Systems & LeetCode benchmark (Codeforces 1428).",
      competencies: [
        { name: "Data Structures & Algorithms", status: "strong", proficiency: "Advanced (90%)" },
        { name: "Python & TypeScript", status: "strong", proficiency: "Advanced (94%)" },
        { name: "FastAPI Backend", status: "strong", proficiency: "Advanced (91%)" },
        { name: "Kubernetes & Cloud Native", status: "missing", proficiency: "Basic (42%)" },
      ],
      criticalGap: {
        skill: "Cloud Deployment Proof",
        gapText: "Only 1 competency gap separates you from top 5% Google shortlist.",
        actionText: "Deploy API to AWS ECS / Cloud Run",
        actionLink: "/student/competency",
        boost: "+6 readiness"
      },
      applicationStatus: "none",
      applicantsCount: 240,
      hiringTier: "Tier 1 Enterprise"
    },
    {
      id: "opp-3",
      title: "Graduate Backend Developer",
      company: "CRED",
      logo: "CR",
      location: "Bengaluru · Onsite",
      workMode: "Onsite",
      type: "Full-time",
      duration: "Permanent",
      stipendOrSalary: "₹22 LPA",
      deadline: "Closes in 5 days",
      deadlineDays: 5,
      matchScore: 86,
      graphMatch: 88,
      vectorMatch: 84,
      eligibility: "near-eligible",
      reasoning: "Strong database schema optimization & OOP; needs distributed pub/sub evidence.",
      whyYouMatch: "Verified PostgreSQL transaction audit demonstrates mastery of high-throughput ledger operations.",
      competencies: [
        { name: "SQL & Transaction Isolation", status: "strong", proficiency: "Advanced (88%)" },
        { name: "Python OOP Architecture", status: "strong", proficiency: "Advanced (94%)" },
        { name: "Authentication (OAuth/JWT)", status: "developing", proficiency: "Intermediate (74%)" },
        { name: "Distributed Queues (Kafka/RabbitMQ)", status: "missing", proficiency: "Basic (48%)" },
      ],
      criticalGap: {
        skill: "Distributed Caching (Redis)",
        gapText: "Complete our interactive caching lab to unlock direct interview scheduling.",
        actionText: "Start Redis Hands-on Lab",
        actionLink: "/student/competency",
        boost: "+4 readiness"
      },
      applicationStatus: "none",
      applicantsCount: 165,
      hiringTier: "High-Growth Unicorn"
    },
    {
      id: "opp-4",
      title: "Software Engineering Intern",
      company: "Zomato",
      logo: "ZM",
      location: "Gurugram · Hybrid",
      workMode: "Hybrid",
      type: "Internship",
      duration: "6 Months",
      stipendOrSalary: "₹50,000 / mo",
      deadline: "Closes in 12 days",
      deadlineDays: 12,
      matchScore: 91,
      graphMatch: 92,
      vectorMatch: 89,
      eligibility: "eligible",
      reasoning: "Exceeds candidate threshold for backend API scalability and asynchronous pipelines.",
      whyYouMatch: "Razorpay summer internship verification and verified REST API test score (91%) fulfill all mandatory requisitions.",
      competencies: [
        { name: "Python Asynchronous APIs", status: "strong", proficiency: "Advanced (91%)" },
        { name: "Relational DB Architecture", status: "strong", proficiency: "Advanced (88%)" },
        { name: "Git Workflow & CI/CD", status: "developing", proficiency: "Intermediate (72%)" },
      ],
      applicationStatus: "applied",
      applicantsCount: 280,
      hiringTier: "High-Growth Unicorn"
    },
    {
      id: "opp-5",
      title: "AI Research & Knowledge Graph Intern",
      company: "Microsoft Research",
      logo: "MS",
      location: "Bengaluru / Hyderabad",
      workMode: "Hybrid",
      type: "Internship",
      duration: "6 Months",
      stipendOrSalary: "₹80,000 / mo",
      deadline: "Closes in 8 days",
      deadlineDays: 8,
      matchScore: 84,
      graphMatch: 87,
      vectorMatch: 81,
      eligibility: "near-eligible",
      reasoning: "Demonstrates graph knowledge; research paper or RAG prototype required.",
      whyYouMatch: "Neo4j graph ontology project at SkillSetu matched Microsoft's automated reasoning focus.",
      competencies: [
        { name: "Python Machine Learning", status: "strong", proficiency: "Advanced (94%)" },
        { name: "Knowledge Graphs (Neo4j)", status: "developing", proficiency: "Intermediate (70%)" },
        { name: "LLM Orchestration & RAG", status: "missing", proficiency: "Basic (50%)" },
      ],
      criticalGap: {
        skill: "RAG Pipeline Prototype",
        gapText: "Build and link a GraphRAG demo to qualify for Microsoft Research interview pool.",
        actionText: "Link GraphRAG Project Repo",
        actionLink: "/student/profile",
        boost: "+5 readiness"
      },
      applicationStatus: "saved",
      applicantsCount: 190,
      hiringTier: "AI Research Lab"
    },
    {
      id: "opp-6",
      title: "Platform Engineering Intern",
      company: "Freshworks",
      logo: "FW",
      location: "Chennai · Hybrid",
      workMode: "Hybrid",
      type: "Internship",
      duration: "6 Months",
      stipendOrSalary: "₹40,000 / mo",
      deadline: "Closes in 18 days",
      deadlineDays: 18,
      matchScore: 82,
      graphMatch: 83,
      vectorMatch: 80,
      eligibility: "eligible",
      reasoning: "Full coverage on Python, API architecture, and SQL database management.",
      whyYouMatch: "Meets 100% of minimum criteria for Freshworks enterprise cloud division.",
      competencies: [
        { name: "REST API Microservices", status: "strong", proficiency: "Advanced (91%)" },
        { name: "Database Query Optimization", status: "strong", proficiency: "Advanced (88%)" },
        { name: "Monitoring & Observability", status: "developing", proficiency: "Intermediate (68%)" },
      ],
      applicationStatus: "none",
      applicantsCount: 145,
      hiringTier: "Tier 1 Enterprise"
    }
  ]);

  // Handle Application Submit
  const handleApply = (id: string, company: string, title: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => (opp.id === id ? { ...opp, applicationStatus: "applied" } : opp))
    );
    showToast(`Application successfully submitted to ${company} for ${title} via Skill Passport!`);
  };

  // Handle Bookmark / Save Toggle
  const handleToggleSave = (id: string, company: string) => {
    setOpportunities((prev) =>
      prev.map((opp) => {
        if (opp.id === id) {
          const nextStatus = opp.applicationStatus === "saved" ? "none" : "saved";
          showToast(nextStatus === "saved" ? `Saved ${company} to your target watchlist.` : `Removed ${company} from saved list.`);
          return { ...opp, applicationStatus: nextStatus };
        }
        return opp;
      })
    );
  };

  // Filtered Opportunities List
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      // Search
      const matchesSearch =
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Tabs
      let matchesTab = true;
      if (selectedTab === "eligible") matchesTab = opp.eligibility === "eligible";
      else if (selectedTab === "almost-reach") matchesTab = opp.eligibility === "near-eligible";
      else if (selectedTab === "applied") matchesTab = opp.applicationStatus === "applied";
      else if (selectedTab === "saved") matchesTab = opp.applicationStatus === "saved";

      // Dropdowns
      let matchesWorkMode = true;
      if (workModeFilter !== "all") matchesWorkMode = opp.workMode.toLowerCase() === workModeFilter.toLowerCase();

      let matchesType = true;
      if (typeFilter !== "all") matchesType = opp.type.toLowerCase() === typeFilter.toLowerCase();

      return matchesSearch && matchesTab && matchesWorkMode && matchesType;
    });
  }, [opportunities, searchQuery, selectedTab, workModeFilter, typeFilter]);

  const selectedOpp = opportunities.find((o) => o.id === selectedOppId) || opportunities[0];

  // Almost Within Reach Opportunities for Highlight Bar
  const almostWithinReachList = opportunities.filter((o) => o.eligibility === "near-eligible");

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
            <Link href="/student/assessments"><svg><use href="#i-clip"/></svg>Assessments & Labs</Link>
            <Link href="/student/opportunities" aria-current="page"><svg><use href="#i-case"/></svg>Opportunities</Link>
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
              <Link href="/student/dashboard" style={{ color: "#94a3b8" }}>Student</Link>
              <svg><use href="#i-chev"/></svg>
              <span className="here" style={{ color: "#ffffff", fontWeight: 600 }}>Opportunity Explorer</span>
            </nav>

            <div className="topbar-right">
              <label className="search" style={{ position: "relative" }}>
                <svg><use href="#i-search"/></svg>
                <input
                  type="text"
                  placeholder="Search roles, companies, tech stacks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: "none", border: "none", outline: "none", color: "inherit", width: "100%", fontSize: "13px" }}
                />
                <kbd>⌘K</kbd>
              </label>

              <button className="icon-btn" type="button" aria-label="Help" onClick={() => router.push("/about")}>
                <svg><use href="#i-help"/></svg>
              </button>

              <button className="icon-btn" type="button" aria-label="Notifications" onClick={() => showToast("Razorpay interview scheduled for tomorrow at 2:00 PM")}>
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

              {/* Top Hero Banner */}
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
                      Opportunity Explorer
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
                      <Sparkles style={{ width: "12px", height: "12px" }} />
                      Neo4j 3-Hop Graph Matchmaking Active
                    </span>
                  </div>

                  <p style={{ fontSize: "13.5px", color: "#94a3b8", marginTop: "4px", margin: "4px 0 0" }}>
                    AI-curated requisitions aligned with Aarav Sharma's verified competency graph & hiring rubrics.
                  </p>
                </div>

                {/* Quick Stats Ribbon */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                  <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "8px 16px", textAlign: "center" }}>
                    <b style={{ display: "block", fontSize: "18px", color: "#ffffff", fontFamily: "var(--font-mono)" }}>14</b>
                    <span style={{ fontSize: "11px", color: "#94a3b8" }}>Matched Roles</span>
                  </div>
                  <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "12px", padding: "8px 16px", textAlign: "center" }}>
                    <b style={{ display: "block", fontSize: "18px", color: "#34d399", fontFamily: "var(--font-mono)" }}>8</b>
                    <span style={{ fontSize: "11px", color: "#34d399" }}>Fully Eligible</span>
                  </div>
                  <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", borderRadius: "12px", padding: "8px 16px", textAlign: "center" }}>
                    <b style={{ display: "block", fontSize: "18px", color: "#fbbf24", fontFamily: "var(--font-mono)" }}>4</b>
                    <span style={{ fontSize: "11px", color: "#fbbf24" }}>Almost Within Reach</span>
                  </div>
                  <div style={{ background: "rgba(37, 99, 235, 0.1)", border: "1px solid rgba(37, 99, 235, 0.2)", borderRadius: "12px", padding: "8px 16px", textAlign: "center" }}>
                    <b style={{ display: "block", fontSize: "18px", color: "#60a5fa", fontFamily: "var(--font-mono)" }}>2</b>
                    <span style={{ fontSize: "11px", color: "#60a5fa" }}>Active In-Flight</span>
                  </div>
                </div>
              </div>

              {/* FEATURE: "Almost Within Reach" Highlight Banner Shelf */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(217, 119, 6, 0.03) 100%)",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: "rgba(245, 158, 11, 0.15)",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      display: "grid",
                      placeItems: "center",
                      color: "#fbbf24",
                    }}
                  >
                    <Flame style={{ width: "20px", height: "20px" }} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff" }}>
                        Almost Within Reach — High Yield Opportunities
                      </span>
                      <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#fbbf24", background: "rgba(245, 158, 11, 0.15)", padding: "1px 6px", borderRadius: "4px" }}>
                        1–2 Gaps Away
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                      You match <b>86–88%</b> for Google Cloud SDE (₹32 LPA) & CRED (₹22 LPA). 1 targeted project sprint unlocks guaranteed shortlist.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTab("almost-reach")}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(245, 158, 11, 0.15)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    color: "#fbbf24",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  <span>Filter 4 Near-Eligible Roles</span>
                  <ChevronRight style={{ width: "14px", height: "14px" }} />
                </button>
              </div>

              {/* Filter Tabs & Search Controls */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "14px",
                  background: "#141519",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: "16px",
                  padding: "12px 18px",
                }}
              >
                {/* Tabs */}
                <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", padding: "3px", borderRadius: "10px" }}>
                  {[
                    { id: "all", label: `All (${opportunities.length})` },
                    { id: "eligible", label: "Eligible (100% Match)" },
                    { id: "almost-reach", label: "Almost Within Reach (4)" },
                    { id: "applied", label: "Applied (1)" },
                    { id: "saved", label: "Saved (1)" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedTab(tab.id as any)}
                      style={{
                        background: selectedTab === tab.id ? "#2563eb" : "none",
                        color: selectedTab === tab.id ? "#ffffff" : "#94a3b8",
                        border: "none",
                        padding: "5px 12px",
                        borderRadius: "7px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Dropdown Filters */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  
                  {/* Work Mode Dropdown */}
                  <select
                    value={workModeFilter}
                    onChange={(e) => setWorkModeFilter(e.target.value)}
                    style={{
                      background: "#18191f",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      color: "#f8fafc",
                      padding: "6px 10px",
                      fontSize: "12px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">All Work Modes</option>
                    <option value="remote">Remote Only</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>

                  {/* Role Type Dropdown */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{
                      background: "#18191f",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: "8px",
                      color: "#f8fafc",
                      padding: "6px 10px",
                      fontSize: "12px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="internship">Internships</option>
                    <option value="full-time">Full-time Roles</option>
                  </select>

                  {/* Clear filter indicator if active */}
                  {(searchQuery || selectedTab !== "all" || workModeFilter !== "all" || typeFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedTab("all");
                        setWorkModeFilter("all");
                        setTypeFilter("all");
                      }}
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "none",
                        color: "#94a3b8",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <X style={{ width: "13px", height: "13px" }} />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Master 2-Column Split: Opportunity Cards List (7 cols) + Deep Inspector Dossier (5 cols) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "20px" }}>
                
                {/* LEFT: Opportunity Cards Feed (7 Columns) */}
                <div style={{ gridColumn: "span 7", display: "flex", flexDirection: "column", gap: "14px" }}>
                  {filteredOpportunities.length === 0 ? (
                    <div style={{ background: "#141519", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "40px 20px", textAlign: "center" }}>
                      <AlertCircle style={{ width: "32px", height: "32px", color: "#94a3b8", margin: "0 auto 12px" }} />
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff" }}>No matching opportunities found</div>
                      <p style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "4px" }}>Try broadening your search query or reset your active filters.</p>
                    </div>
                  ) : (
                    filteredOpportunities.map((opp) => {
                      const isSelected = opp.id === selectedOppId;
                      const isEligible = opp.eligibility === "eligible";
                      const isNear = opp.eligibility === "near-eligible";

                      return (
                        <div
                          key={opp.id}
                          onClick={() => setSelectedOppId(opp.id)}
                          style={{
                            background: isSelected ? "#181a22" : "#141519",
                            border: `1.5px solid ${
                              isSelected
                                ? "#3b82f6"
                                : isNear
                                ? "rgba(245, 158, 11, 0.25)"
                                : "rgba(255, 255, 255, 0.08)"
                            }`,
                            borderRadius: "16px",
                            padding: "18px 20px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            position: "relative",
                            boxShadow: isSelected ? "0 8px 24px rgba(0,0,0,0.4)" : "none",
                          }}
                        >
                          {/* Top Row: Company Badge + Match Score */}
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                              <div
                                style={{
                                  width: "42px",
                                  height: "42px",
                                  borderRadius: "10px",
                                  background: "rgba(37, 99, 235, 0.15)",
                                  border: "1px solid rgba(37, 99, 235, 0.3)",
                                  display: "grid",
                                  placeItems: "center",
                                  fontSize: "14px",
                                  fontWeight: 800,
                                  color: "#60a5fa",
                                }}
                              >
                                {opp.logo}
                              </div>
                              <div>
                                <div style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>
                                  {opp.title}
                                </div>
                                <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                                  <span style={{ fontWeight: 600, color: "#cbd5e1" }}>{opp.company}</span>
                                  <span>·</span>
                                  <span>{opp.location}</span>
                                  <span>·</span>
                                  <span style={{ color: "#60a5fa" }}>{opp.type}</span>
                                </div>
                              </div>
                            </div>

                            {/* Match Score Gauge Pill */}
                            <div style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  background: opp.matchScore >= 90 ? "rgba(16, 185, 129, 0.15)" : "rgba(37, 99, 235, 0.15)",
                                  border: `1px solid ${opp.matchScore >= 90 ? "rgba(16, 185, 129, 0.3)" : "rgba(37, 99, 235, 0.3)"}`,
                                  color: opp.matchScore >= 90 ? "#34d399" : "#60a5fa",
                                  padding: "3px 10px",
                                  borderRadius: "999px",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                }}
                              >
                                <Sparkles style={{ width: "12px", height: "12px" }} />
                                <span>{opp.matchScore}% Match</span>
                              </div>
                              <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "3px" }}>
                                {opp.applicantsCount} candidates applied
                              </div>
                            </div>
                          </div>

                          {/* Middle Row: Compensation, Duration, Deadline */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              fontSize: "12px",
                              color: "#cbd5e1",
                              background: "rgba(255,255,255,0.025)",
                              padding: "8px 12px",
                              borderRadius: "10px",
                              flexWrap: "wrap",
                            }}
                          >
                            <div>
                              <span style={{ color: "#94a3b8" }}>Comp: </span>
                              <b style={{ color: "#34d399" }}>{opp.stipendOrSalary}</b>
                            </div>
                            <div>
                              <span style={{ color: "#94a3b8" }}>Duration: </span>
                              <b>{opp.duration}</b>
                            </div>
                            <div>
                              <span style={{ color: "#94a3b8" }}>Deadline: </span>
                              <b style={{ color: opp.deadlineDays <= 3 ? "#fbbf24" : "#ffffff" }}>{opp.deadline}</b>
                            </div>
                          </div>

                          {/* Competency Pill Tags */}
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            {opp.competencies.map((comp) => {
                              const isStrong = comp.status === "strong";
                              const isMissing = comp.status === "missing";
                              return (
                                <span
                                  key={comp.name}
                                  style={{
                                    fontSize: "11px",
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    fontWeight: 500,
                                    background: isStrong
                                      ? "rgba(16, 185, 129, 0.1)"
                                      : isMissing
                                      ? "rgba(245, 158, 11, 0.12)"
                                      : "rgba(59, 130, 246, 0.1)",
                                    border: `1px solid ${
                                      isStrong
                                        ? "rgba(16, 185, 129, 0.25)"
                                        : isMissing
                                        ? "rgba(245, 158, 11, 0.3)"
                                        : "rgba(59, 130, 246, 0.25)"
                                    }`,
                                    color: isStrong ? "#34d399" : isMissing ? "#fbbf24" : "#60a5fa",
                                  }}
                                >
                                  {isStrong ? "✓ " : isMissing ? "Gap: " : "~ "}
                                  {comp.name}
                                </span>
                              );
                            })}
                          </div>

                          {/* Footer: Eligibility Status + Quick CTAs */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              borderTop: "1px solid rgba(255,255,255,0.06)",
                              paddingTop: "10px",
                              marginTop: "2px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "11.5px",
                                fontWeight: 700,
                                color: isEligible ? "#34d399" : isNear ? "#fbbf24" : "#f43f5e",
                              }}
                            >
                              ● {isEligible ? "Eligible for Direct Shortlist" : isNear ? "Near-Eligible (1 Gap Away)" : "Not Eligible"}
                            </span>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }} onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleToggleSave(opp.id, opp.company)}
                                style={{
                                  background: opp.applicationStatus === "saved" ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.06)",
                                  border: "1px solid rgba(255,255,255,0.1)",
                                  color: opp.applicationStatus === "saved" ? "#60a5fa" : "#94a3b8",
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "8px",
                                  display: "grid",
                                  placeItems: "center",
                                  cursor: "pointer",
                                }}
                                title="Save to watchlist"
                              >
                                {opp.applicationStatus === "saved" ? <BookmarkCheck style={{ width: "15px", height: "15px" }} /> : <Bookmark style={{ width: "15px", height: "15px" }} />}
                              </button>

                              {opp.applicationStatus === "applied" ? (
                                <span
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    color: "#34d399",
                                    background: "rgba(16, 185, 129, 0.12)",
                                    border: "1px solid rgba(16, 185, 129, 0.25)",
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <CheckCircle2 style={{ width: "13px", height: "13px" }} />
                                  Applied
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleApply(opp.id, opp.company, opp.title)}
                                  style={{
                                    background: isEligible ? "#2563eb" : "rgba(255,255,255,0.08)",
                                    color: "#ffffff",
                                    border: isEligible ? "none" : "1px solid rgba(255,255,255,0.12)",
                                    padding: "6px 14px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    boxShadow: isEligible ? "0 2px 8px rgba(37, 99, 235, 0.3)" : "none",
                                  }}
                                >
                                  {isEligible ? "Apply with Skill Passport" : "Review Requisition"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* RIGHT: Deep Opportunity Dossier & "Why You Match" Inspector (5 Columns) */}
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
                    gap: "18px",
                    position: "sticky",
                    top: "90px",
                    maxHeight: "calc(100vh - 120px)",
                    overflowY: "auto",
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                      <div>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", background: "rgba(59, 130, 246, 0.12)", padding: "2px 8px", borderRadius: "6px", textTransform: "uppercase" }}>
                          {selectedOpp.hiringTier}
                        </span>
                        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: "6px 0 2px" }}>
                          {selectedOpp.title}
                        </h2>
                        <div style={{ fontSize: "12.5px", color: "#94a3b8" }}>
                          {selectedOpp.company} · {selectedOpp.location}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "24px", fontWeight: 800, color: selectedOpp.matchScore >= 90 ? "#34d399" : "#60a5fa", fontFamily: "var(--font-mono)" }}>
                          {selectedOpp.matchScore}%
                        </div>
                        <span style={{ fontSize: "10.5px", color: "#94a3b8" }}>AI Match Score</span>
                      </div>
                    </div>

                    {/* Match Telemetry Split (Graph vs Vector) */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "8px",
                        margin: "14px 0",
                        background: "rgba(255,255,255,0.025)",
                        padding: "10px",
                        borderRadius: "12px",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>Graph Path Traversal</span>
                        <b style={{ display: "block", fontSize: "14px", color: "#60a5fa" }}>{selectedOpp.graphMatch}% Fit</b>
                      </div>
                      <div>
                        <span style={{ fontSize: "11px", color: "#94a3b8" }}>Semantic Vector Cosine</span>
                        <b style={{ display: "block", fontSize: "14px", color: "#a78bfa" }}>{selectedOpp.vectorMatch}% Fit</b>
                      </div>
                    </div>

                    {/* FEATURE: "Why You Match" Evidence-Backed Explanation */}
                    <div style={{ marginTop: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: 700, color: "#ffffff", textTransform: "uppercase" }}>
                        <ShieldCheck style={{ width: "15px", height: "15px", color: "#34d399" }} />
                        <span>Why You Match (Evidence Proof)</span>
                      </div>
                      <p style={{ fontSize: "12.5px", color: "#cbd5e1", lineHeight: 1.55, background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "10px", marginTop: "6px" }}>
                        {selectedOpp.whyYouMatch}
                      </p>
                    </div>

                    {/* Skill Match Breakdown */}
                    <div style={{ marginTop: "14px" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#ffffff", textTransform: "uppercase", marginBottom: "8px" }}>
                        Competency Audit Checklist
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {selectedOpp.competencies.map((c) => (
                          <div
                            key={c.name}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              fontSize: "12px",
                              padding: "6px 10px",
                              background: "rgba(255,255,255,0.02)",
                              borderRadius: "6px",
                            }}
                          >
                            <span style={{ color: "#ffffff" }}>{c.name}</span>
                            <span style={{ fontSize: "11px", fontWeight: 600, color: c.status === "strong" ? "#34d399" : c.status === "missing" ? "#fbbf24" : "#60a5fa" }}>
                              {c.proficiency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FEATURE: Skill Gap -> Actionable Bridge */}
                    {selectedOpp.criticalGap && (
                      <div
                        style={{
                          background: "rgba(245, 158, 11, 0.08)",
                          border: "1px solid rgba(245, 158, 11, 0.25)",
                          borderRadius: "12px",
                          padding: "12px 14px",
                          marginTop: "16px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase" }}>
                            SKILL GAP BRIDGE
                          </span>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399" }}>
                            {selectedOpp.criticalGap.boost}
                          </span>
                        </div>
                        <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#ffffff", marginTop: "4px" }}>
                          {selectedOpp.criticalGap.gapText}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            showToast(`Opening remediation path for ${selectedOpp.criticalGap?.skill}...`);
                            router.push(selectedOpp.criticalGap?.actionLink || "/student/competency");
                          }}
                          style={{
                            background: "#f59e0b",
                            color: "#0b0c10",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "11.5px",
                            fontWeight: 700,
                            cursor: "pointer",
                            marginTop: "8px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>{selectedOpp.criticalGap.actionText}</span>
                          <ArrowUpRight style={{ width: "13px", height: "13px" }} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Inspector Footer Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "14px" }}>
                    {selectedOpp.applicationStatus === "applied" ? (
                      <div
                        style={{
                          background: "rgba(16, 185, 129, 0.12)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          color: "#34d399",
                          padding: "10px",
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: 700,
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <CheckCircle2 style={{ width: "16px", height: "16px" }} />
                        <span>Application Submitted · Shortlist in Review</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleApply(selectedOpp.id, selectedOpp.company, selectedOpp.title)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "10px",
                          background: "#2563eb",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "13.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <Send style={{ width: "15px", height: "15px" }} />
                        <span>Apply with Verified Skill Passport</span>
                      </button>
                    )}

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleSave(selectedOpp.id, selectedOpp.company)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#94a3b8",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        {selectedOpp.applicationStatus === "saved" ? "Remove from Saved" : "Save for Later"}
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Opening ${selectedOpp.company} official requisition details...`)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          borderRadius: "8px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "#94a3b8",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Share Opportunity
                      </button>
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
