"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SkillNode {
  id: string;
  name: string;
  group: "prog" | "data" | "sys";
  groupName: string;
  gap: "none" | "small" | "moderate" | "large";
  gapWord: string;
  cur: string;
  req: string;
  pct: number;
  evText: string;
  evidence: [number, number, number, number]; // [projects, certs, assessments, github]
}

export default function StudentCompetencyCenterPage() {
  const router = useRouter();

  // Role and Search State
  const [selectedRole, setSelectedRole] = useState("Backend developer");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Skill map definition
  const skillsData: Record<string, SkillNode> = {
    python: {
      id: "python",
      name: "Python",
      group: "prog",
      groupName: "Programming",
      gap: "none",
      gapWord: "None",
      cur: "Advanced",
      req: "Advanced",
      pct: 94,
      evText: "3 projects, 1 certification, 128 LeetCode solves in Python.",
      evidence: [3, 1, 2, 6],
    },
    js: {
      id: "js",
      name: "JavaScript",
      group: "prog",
      groupName: "Programming",
      gap: "small",
      gapWord: "Small",
      cur: "Intermediate",
      req: "Intermediate",
      pct: 72,
      evText: "2 projects, no certification. Last assessed 40 days ago.",
      evidence: [2, 0, 1, 4],
    },
    dsa: {
      id: "dsa",
      name: "DSA",
      group: "prog",
      groupName: "Programming",
      gap: "none",
      gapWord: "None",
      cur: "Advanced",
      req: "Intermediate",
      pct: 90,
      evText: "Codeforces 1428, 384 problems solved, top 9% in a rated contest.",
      evidence: [0, 0, 2, 1],
    },
    sql: {
      id: "sql",
      name: "SQL",
      group: "data",
      groupName: "Data",
      gap: "none",
      gapWord: "None",
      cur: "Advanced",
      req: "Advanced",
      pct: 88,
      evText: "Assessment 88%, 2 projects with schema design, 1 internship task.",
      evidence: [2, 0, 1, 3],
    },
    pg: {
      id: "pg",
      name: "PostgreSQL",
      group: "data",
      groupName: "Data",
      gap: "small",
      gapWord: "Small",
      cur: "Intermediate",
      req: "Intermediate",
      pct: 70,
      evText: "1 project on PostgreSQL. No assessment yet.",
      evidence: [1, 0, 0, 1],
    },
    redis: {
      id: "redis",
      name: "Redis",
      group: "data",
      groupName: "Data",
      gap: "moderate",
      gapWord: "Moderate",
      cur: "Basic",
      req: "Intermediate",
      pct: 48,
      evText: "Used in 1 project as a cache. No assessment, no certification.",
      evidence: [1, 0, 0, 1],
    },
    api: {
      id: "api",
      name: "APIs",
      group: "sys",
      groupName: "Systems",
      gap: "none",
      gapWord: "None",
      cur: "Advanced",
      req: "Advanced",
      pct: 91,
      evText: "4 projects with public APIs, internship at Razorpay, assessment 91%.",
      evidence: [4, 0, 1, 5],
    },
    auth: {
      id: "auth",
      name: "Authentication",
      group: "sys",
      groupName: "Systems",
      gap: "small",
      gapWord: "Small",
      cur: "Intermediate",
      req: "Intermediate",
      pct: 74,
      evText: "JWT and OAuth in 2 projects. No security assessment.",
      evidence: [2, 0, 0, 2],
    },
    docker: {
      id: "docker",
      name: "Docker",
      group: "sys",
      groupName: "Systems",
      gap: "moderate",
      gapWord: "Moderate",
      cur: "Basic",
      req: "Intermediate",
      pct: 54,
      evText: "1 Dockerfile in a project repo. No deployment evidence, no certification.",
      evidence: [1, 0, 0, 2],
    },
    cloud: {
      id: "cloud",
      name: "Cloud",
      group: "sys",
      groupName: "Systems",
      gap: "large",
      gapWord: "Large",
      cur: "Basic",
      req: "Intermediate",
      pct: 62,
      evText: "AWS free-tier account linked. Nothing deployed yet.",
      evidence: [0, 0, 0, 0],
    },
  };

  const [selectedSkillId, setSelectedSkillId] = useState<string>("postgres" in skillsData ? "postgres" : "pg");
  const currentSkill = skillsData[selectedSkillId] || skillsData["docker"];

  // Tree wire rendering
  const treeRef = useRef<HTMLDivElement>(null);
  const [wirePaths, setWirePaths] = useState<{ d: string; on: boolean }[]>([]);

  const recalculateWires = () => {
    if (!treeRef.current) return;
    const tree = treeRef.current;
    const tRect = tree.getBoundingClientRect();

    const getCenter = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return {
        x: r.left - tRect.left + r.width / 2,
        top: r.top - tRect.top,
        bottom: r.bottom - tRect.top,
      };
    };

    const nodeElements = tree.querySelectorAll(".node");
    const byId: Record<string, HTMLElement> = {};
    nodeElements.forEach((node) => {
      const id = node.getAttribute("data-id");
      if (id) byId[id] = node as HTMLElement;
    });

    const paths: { d: string; on: boolean }[] = [];

    nodeElements.forEach((node) => {
      const pid = node.getAttribute("data-parent");
      if (!pid) return;
      const parent = pid === "__selected" ? byId[selectedSkillId] : byId[pid];
      if (!parent) return;

      const a = getCenter(parent);
      const b = getCenter(node as HTMLElement);
      const mid = a.bottom + (b.top - a.bottom) / 2;

      const nodeId = node.getAttribute("data-id");
      const isSelectedLeaf = nodeId === selectedSkillId;
      const isSelectedGroup = byId[selectedSkillId]?.getAttribute("data-parent") === nodeId;
      const isEvidenceLink = pid === "__selected" || pid === "evidence";

      const isOn = isSelectedLeaf || isSelectedGroup || isEvidenceLink;

      paths.push({
        d: `M${a.x} ${a.bottom} V${mid} H${b.x} V${b.top}`,
        on: Boolean(isOn),
      });
    });

    setWirePaths(paths);
  };

  useEffect(() => {
    recalculateWires();
    const handleResize = () => recalculateWires();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedSkillId]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <>
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
          <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></symbol>
          <symbol id="i-gauge" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16a8 8 0 1116 0"/><path d="M12 16l4-5"/><circle cx="12" cy="16" r="1"/></symbol>
          <symbol id="i-code" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/></symbol>
          <symbol id="i-award" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="9" r="5"/><path d="M9 13.5L8 21l4-2 4 2-1-7.5"/></symbol>
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
            <Link href="/student/competency" aria-current="page"><svg><use href="#i-spark"/></svg>My skills</Link>
            <Link href="/student/competency"><svg><use href="#i-clip"/></svg>Assessments</Link>
            <Link href="/student/opportunities"><svg><use href="#i-case"/></svg>Opportunities</Link>
            <Link href="/student/opportunities"><svg><use href="#i-book"/></svg>Internships</Link>
            <Link href="/student/profile"><svg><use href="#i-id"/></svg>Skill passport</Link>
            <div className="nav-label">Institution <svg style={{ width: "14px", height: "14px", transform: "rotate(-90deg)" }}><use href="#i-chev"/></svg></div>
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

        {/* Viewport Content */}
        <div>
          {/* Top Bar with Breadcrumb */}
          <header className="topbar">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/student/competency">My skills</Link>
              <svg><use href="#i-chev"/></svg>
              <span className="here">Competency center</span>
            </nav>
            <div className="topbar-right">
              <label className="search" style={{ position: "relative" }}>
                <svg><use href="#i-search"/></svg>
                <input
                  type="text"
                  placeholder="Search skills and roles"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: "none", border: "none", outline: "none", color: "inherit", width: "100%", fontSize: "13px" }}
                />
                <kbd>⌘K</kbd>
              </label>
              <button className="icon-btn" type="button" aria-label="Help" onClick={() => router.push("/about")}><svg><use href="#i-help"/></svg></button>
              <button className="icon-btn" type="button" aria-label="2 unread notifications" onClick={() => showToast("Assessment results for Python passed at 94%")}><svg><use href="#i-bell"/></svg><span className="dot" aria-hidden="true"></span></button>
              <Link href="/student/profile" className="avatar-sm" aria-label="Signed in as Aarav Sharma">AS</Link>
            </div>
          </header>

          <main>
            <div className="page">

              {/* Title Row */}
              <div className="title-row">
                <div>
                  <h1>Competency center</h1>
                  <p>What you can prove today, where the gaps are for the role you want, and what to do next.</p>
                </div>
                <div style={{ position: "relative" }}>
                  <button
                    className="select"
                    type="button"
                    aria-label="Target role"
                    onClick={() => setShowRoleMenu(!showRoleMenu)}
                  >
                    Target role: {selectedRole} <svg><use href="#i-chev"/></svg>
                  </button>
                  {showRoleMenu && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        marginTop: "6px",
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "14px",
                        padding: "6px",
                        zIndex: 40,
                        boxShadow: "var(--shadow-floating)",
                        width: "220px",
                      }}
                    >
                      <div style={{ fontSize: "11px", color: "var(--muted-foreground)", padding: "4px 8px" }}>
                        Switch Target Blueprint
                      </div>
                      {[
                        "Backend developer",
                        "AI Platform engineer",
                        "Fullstack engineer",
                        "DevOps Specialist"
                      ].map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role);
                            setShowRoleMenu(false);
                            showToast(`Target goal updated to ${role}`);
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            background: selectedRole === role ? "var(--accent)" : "none",
                            border: "none",
                            cursor: "pointer"
                          }}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 1: Competency Overview + Target Role Readiness */}
              <div className="grid-2">

                {/* Card 1: Overview */}
                <section className="plate card">
                  <div className="card-head">
                    <h3><svg><use href="#i-gauge"/></svg>Competency overview</h3>
                    <button className="seeall" type="button" onClick={() => showToast("Opening full competency matrix report...")}>Full report <span className="arr" aria-hidden="true">›</span></button>
                  </div>
                  <div className="inset auto overview">
                    <div>
                      <div className="ring-lg" role="img" aria-label="Overall competency 78 percent, industry ready">
                        <svg viewBox="0 0 168 168">
                          <circle className="track" cx="84" cy="84" r="74" fill="none" strokeWidth="10"/>
                          <circle className="fill" cx="84" cy="84" r="74" fill="none" strokeWidth="10" strokeDasharray="362.7 465"/>
                        </svg>
                        <div className="val">
                          <span className="k">Overall competency</span>
                          <span className="n num">78<small>%</small></span>
                          <span className="chip chip-ok"><span className="d" aria-hidden="true"></span><span>Industry ready</span></span>
                        </div>
                      </div>
                      <p className="summary">
                        <b>Strongest in Python, SQL and API design.</b> Cloud deployment, system design and security are where the next points come from.
                      </p>
                    </div>

                    <div className="dims" role="list" aria-label="Competency dimensions">
                      <div className="dim" role="listitem"><span className="k">Technical skills</span><span className="v num">82%</span><span className="b"><i style={{ width: "82%" }}></i><em style={{ left: "70%" }}></em></span></div>
                      <div className="dim" role="listitem"><span className="k">Domain skills</span><span className="v num">76%</span><span className="b"><i style={{ width: "76%" }}></i><em style={{ left: "70%" }}></em></span></div>
                      <div className="dim" role="listitem"><span className="k">Problem solving</span><span className="v num">88%</span><span className="b"><i style={{ width: "88%" }}></i><em style={{ left: "70%" }}></em></span></div>
                      <div className="dim" role="listitem"><span className="k">Communication</span><span className="v num">71%</span><span className="b"><i style={{ width: "71%" }}></i><em style={{ left: "70%" }}></em></span></div>
                      <div className="dim weak" role="listitem"><span className="k">Practical experience</span><span className="v num">65%</span><span className="b"><i style={{ width: "65%" }}></i><em style={{ left: "70%" }}></em></span></div>
                      <div className="dim" role="listitem"><span className="k">Industry readiness</span><span className="v num">78%</span><span className="b"><i style={{ width: "78%" }}></i><em style={{ left: "70%" }}></em></span></div>
                      <div className="dim" role="listitem"><span className="k">Evidence strength</span><span className="v num">74%</span><span className="b"><i style={{ width: "74%" }}></i><em style={{ left: "70%" }}></em></span></div>
                    </div>

                    <div className="overview-foot">
                      <span>The tick on each bar is the 70 the role asks for. One dimension is below it.</span>
                      <button className="btn btn-primary" type="button" style={{ height: "32px", fontSize: "13px" }} onClick={() => showToast("Launching Proctored Challenge Lab...")}>
                        <svg><use href="#i-clip"/></svg>Take an assessment
                      </button>
                    </div>
                  </div>
                </section>

                {/* Card 2: Role Readiness */}
                <section className="plate card">
                  <div className="card-head">
                    <h3><svg><use href="#i-case"/></svg>Target role readiness</h3>
                    <button className="seeall" type="button" onClick={() => router.push("/student/dashboard")}>Roadmap <span className="arr" aria-hidden="true">›</span></button>
                  </div>
                  <div className="inset auto" style={{ display: "flex", flexDirection: "column", paddingBottom: "8px" }}>
                    <div className="role-head">
                      <div className="ring" role="img" aria-label="Role readiness 78 percent">
                        <svg viewBox="0 0 84 84">
                          <circle className="track" cx="42" cy="42" r="36" fill="none" strokeWidth="6"/>
                          <circle className="fill" cx="42" cy="42" r="36" fill="none" strokeWidth="6" strokeDasharray="176.4 226.2"/>
                        </svg>
                        <div className="val num">78<small>%</small></div>
                      </div>
                      <div>
                        <div className="t">Backend developer</div>
                        <div className="s">Matched against 14 open roles at Razorpay, Zomato, CRED</div>
                      </div>
                    </div>

                    <div className="group-label">Core skills</div>
                    <div className="row"><span>Python</span><span className="lvl">advanced</span><span className="pct ok num">94% <svg><use href="#i-check"/></svg></span></div>
                    <div className="row"><span>SQL</span><span className="lvl">advanced</span><span className="pct ok num">88% <svg><use href="#i-check"/></svg></span></div>
                    <div className="row"><span>REST APIs</span><span className="lvl">advanced</span><span className="pct ok num">91% <svg><use href="#i-check"/></svg></span></div>

                    <div className="group-label">Development areas</div>
                    <div className="row"><span>Docker</span><span className="lvl">needs intermediate</span><span className="pct warn num">54%</span></div>
                    <div className="row"><span>Cloud</span><span className="lvl">needs intermediate</span><span className="pct warn num">62%</span></div>
                    <div className="row"><span>System design</span><span className="lvl">needs intermediate</span><span className="pct warn num">51%</span></div>

                    <div className="role-foot">
                      <span className="warn" style={{ fontWeight: 500 }}>3 gaps remain</span>
                      <button className="btn btn-secondary" type="button" onClick={() => router.push("/student/opportunities")}>View role requirements</button>
                    </div>
                  </div>
                </section>
              </div>

              {/* Row 2: Interactive Competency Map */}
              <section className="plate card">
                <div className="card-head">
                  <h3><svg><use href="#i-grid"/></svg>Competency map</h3>
                  <span className="muted" style={{ fontSize: "12px", paddingRight: "6px" }}>Select a skill to see its evidence and gap</span>
                </div>
                <div className="inset auto map">
                  <div className="tree" ref={treeRef} id="tree">
                    {/* SVG Connecting Wires */}
                    <svg className="wires" id="wires" aria-hidden="true">
                      {wirePaths.map((w, idx) => (
                        <path key={idx} d={w.d} className={w.on ? "on" : ""} />
                      ))}
                    </svg>

                    <div className="lvl-row">
                      <span className="node root" data-id="root">{selectedRole}</span>
                    </div>

                    <div className="lvl-row">
                      <span className="node group" data-id="prog" data-parent="root">Programming</span>
                      <span className="node group" data-id="data" data-parent="root">Data</span>
                      <span className="node group" data-id="sys" data-parent="root">Systems</span>
                    </div>

                    <div className="lvl-row leaves">
                      <div className="branch">
                        <button className="node leaf" type="button" data-id="python" data-parent="prog" aria-pressed={selectedSkillId === "python"} onClick={() => setSelectedSkillId("python")}><span className="d"></span>Python</button>
                        <button className="node leaf" type="button" data-id="js" data-parent="prog" data-gap="small" aria-pressed={selectedSkillId === "js"} onClick={() => setSelectedSkillId("js")}><span className="d"></span>JavaScript</button>
                        <button className="node leaf" type="button" data-id="dsa" data-parent="prog" aria-pressed={selectedSkillId === "dsa"} onClick={() => setSelectedSkillId("dsa")}><span className="d"></span>DSA</button>
                      </div>

                      <div className="branch">
                        <button className="node leaf" type="button" data-id="sql" data-parent="data" aria-pressed={selectedSkillId === "sql"} onClick={() => setSelectedSkillId("sql")}><span className="d"></span>SQL</button>
                        <button className="node leaf" type="button" data-id="pg" data-parent="data" data-gap="small" aria-pressed={selectedSkillId === "pg"} onClick={() => setSelectedSkillId("pg")}><span className="d"></span>PostgreSQL</button>
                        <button className="node leaf" type="button" data-id="redis" data-parent="data" data-gap="moderate" aria-pressed={selectedSkillId === "redis"} onClick={() => setSelectedSkillId("redis")}><span className="d"></span>Redis</button>
                      </div>

                      <div className="branch">
                        <button className="node leaf" type="button" data-id="api" data-parent="sys" aria-pressed={selectedSkillId === "api"} onClick={() => setSelectedSkillId("api")}><span className="d"></span>APIs</button>
                        <button className="node leaf" type="button" data-id="auth" data-parent="sys" data-gap="small" aria-pressed={selectedSkillId === "auth"} onClick={() => setSelectedSkillId("auth")}><span className="d"></span>Authentication</button>
                        <button className="node leaf" type="button" data-id="docker" data-parent="sys" data-gap="moderate" aria-pressed={selectedSkillId === "docker"} onClick={() => setSelectedSkillId("docker")}><span className="d"></span>Docker</button>
                        <button className="node leaf" type="button" data-id="cloud" data-parent="sys" data-gap="large" aria-pressed={selectedSkillId === "cloud"} onClick={() => setSelectedSkillId("cloud")}><span className="d"></span>Cloud</button>
                      </div>
                    </div>

                    <div className="lvl-row">
                      <span className="node evidence" data-id="evidence" data-parent="__selected">Evidence</span>
                    </div>

                    <div className="lvl-row" style={{ gap: "8px", flexWrap: "wrap" }}>
                      <span className="node src" data-id="s1" data-parent="evidence"><b>{currentSkill.evidence[0]}</b>&nbsp;project</span>
                      <span className="node src" data-id="s2" data-parent="evidence"><b>{currentSkill.evidence[1]}</b>&nbsp;certifications</span>
                      <span className="node src" data-id="s3" data-parent="evidence"><b>{currentSkill.evidence[2]}</b>&nbsp;assessments</span>
                      <span className="node src" data-id="s4" data-parent="evidence"><b>{currentSkill.evidence[3]}</b>&nbsp;GitHub repos</span>
                    </div>
                  </div>

                  {/* Aside Detail Panel */}
                  <aside className="detail" id="detail" aria-live="polite">
                    <div className="t">{currentSkill.name}</div>
                    <div className="s">{currentSkill.groupName}</div>
                    <dl>
                      <dt>Current</dt><dd>{currentSkill.cur}</dd>
                      <dt>Required</dt><dd>{currentSkill.req}</dd>
                      <dt>Verified</dt><dd className="num">{currentSkill.pct}%</dd>
                      <dt>Gap</dt><dd className={currentSkill.gap === "none" ? "ok" : currentSkill.gap === "small" ? "" : "warn"}>{currentSkill.gapWord}</dd>
                    </dl>
                    <p className="ev">{currentSkill.evText}</p>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => showToast(`Generating milestone path for ${currentSkill.name}...`)}
                    >
                      {currentSkill.gap === "none" ? `Keep ${currentSkill.name} current` : `Plan for ${currentSkill.name}`}
                    </button>
                  </aside>
                </div>
              </section>

              {/* Row 3: Recommended Next Steps */}
              <section className="plate card">
                <div className="card-head">
                  <h3><svg><use href="#i-trend"/></svg>Recommended next steps</h3>
                  <span className="muted" style={{ fontSize: "12px", paddingRight: "6px" }}>Ordered by how much each moves your readiness</span>
                </div>
                <div className="inset auto steps">
                  <button className="step" type="button" onClick={() => showToast("Opening Docker 25-minute assessment challenge...")}>
                    <svg><use href="#i-clip"/></svg>
                    <span>Take a skill assessment<small>Docker, 25 minutes</small></span>
                  </button>
                  <button className="step" type="button" onClick={() => router.push("/student/dashboard")}>
                    <svg><use href="#i-gauge"/></svg>
                    <span>Work on skill gaps<small>3 open for this role</small></span>
                  </button>
                  <button className="step" type="button" onClick={() => router.push("/student/profile")}>
                    <svg><use href="#i-code"/></svg>
                    <span>Build a project<small>Deploy one API to cloud</small></span>
                  </button>
                  <button className="step" type="button" onClick={() => showToast("Enrolling in AWS Cloud Practitioner track...")}>
                    <svg><use href="#i-award"/></svg>
                    <span>Earn a certification<small>AWS Cloud Practitioner</small></span>
                  </button>
                  <button className="step" type="button" onClick={() => showToast("Subscribing to weekly readiness digest...")}>
                    <svg><use href="#i-trend"/></svg>
                    <span>Track progress<small>Weekly readiness digest</small></span>
                  </button>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            padding: "12px 18px",
            color: "var(--foreground)",
            boxShadow: "var(--shadow-floating)",
            fontSize: "13px",
            fontWeight: 500,
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "var(--primary)" }} />
          <span>{toastMsg}</span>
        </div>
      )}
    </>
  );
}
