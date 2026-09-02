"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface StudentRecord {
  id: string;
  name: string;
  avatar: string;
  branch: string;
  batch: string;
  available: boolean;
  cgpa: number;
  status: "Verified" | "Pending";
  readiness: number;
  readinessLabel: string;
  skills: string[];
  gaps: string;
  gapType: "critical" | "none" | "open";
}

export default function InstitutionStudentIntelligencePage() {
  const router = useRouter();

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("readiness");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const studentsList: StudentRecord[] = [
    {
      id: "1",
      name: "Aarav Sharma",
      avatar: "AS",
      branch: "CSE",
      batch: "Class of 2027",
      available: true,
      cgpa: 9.2,
      status: "Verified",
      readiness: 91,
      readinessLabel: "Industry ready",
      skills: ["Python", "DSA", "React"],
      gaps: "3 critical",
      gapType: "critical",
    },
    {
      id: "2",
      name: "Kabir Singh",
      avatar: "KS",
      branch: "CSE",
      batch: "Class of 2026",
      available: false,
      cgpa: 8.8,
      status: "Verified",
      readiness: 90,
      readinessLabel: "Industry ready",
      skills: ["Cloud", "DevOps", "Docker"],
      gaps: "None",
      gapType: "none",
    },
    {
      id: "3",
      name: "Riya Mehta",
      avatar: "RM",
      branch: "IT",
      batch: "Class of 2027",
      available: true,
      cgpa: 8.9,
      status: "Verified",
      readiness: 89,
      readinessLabel: "Industry ready",
      skills: ["React", "Node.js", "TypeScript"],
      gaps: "1 open",
      gapType: "open",
    },
    {
      id: "4",
      name: "Sneha Patel",
      avatar: "SP",
      branch: "AI & DS",
      batch: "Class of 2027",
      available: true,
      cgpa: 9.4,
      status: "Verified",
      readiness: 88,
      readinessLabel: "Industry ready",
      skills: ["Python", "PyTorch", "SQL"],
      gaps: "1 open",
      gapType: "open",
    },
    {
      id: "5",
      name: "Ananya Iyer",
      avatar: "AI",
      branch: "AI & DS",
      batch: "Class of 2027",
      available: true,
      cgpa: 8.7,
      status: "Verified",
      readiness: 86,
      readinessLabel: "Industry ready",
      skills: ["Python", "SQL", "Spark"],
      gaps: "2 open",
      gapType: "open",
    },
    {
      id: "6",
      name: "Dev Malhotra",
      avatar: "DM",
      branch: "CSE",
      batch: "Class of 2026",
      available: false,
      cgpa: 8.5,
      status: "Verified",
      readiness: 84,
      readinessLabel: "Industry ready",
      skills: ["Java", "Spring", "SQL"],
      gaps: "2 open",
      gapType: "open",
    },
    {
      id: "7",
      name: "Vihaan Gupta",
      avatar: "VG",
      branch: "ECE",
      batch: "Class of 2026",
      available: true,
      cgpa: 8.3,
      status: "Verified",
      readiness: 83,
      readinessLabel: "Industry ready",
      skills: ["C", "Embedded", "Python"],
      gaps: "2 open",
      gapType: "open",
    },
    {
      id: "8",
      name: "Ishita Rao",
      avatar: "IR",
      branch: "CSE",
      batch: "Class of 2027",
      available: true,
      cgpa: 8.1,
      status: "Verified",
      readiness: 79,
      readinessLabel: "Nearly ready",
      skills: ["Python", "Node.js", "SQL"],
      gaps: "3 critical",
      gapType: "critical",
    },
    {
      id: "9",
      name: "Tanvi Kulkarni",
      avatar: "TK",
      branch: "IT",
      batch: "Class of 2027",
      available: true,
      cgpa: 7.9,
      status: "Pending",
      readiness: 77,
      readinessLabel: "Nearly ready",
      skills: ["React", "JavaScript", "CSS"],
      gaps: "3 critical",
      gapType: "critical",
    },
    {
      id: "10",
      name: "Rohan Verma",
      avatar: "RV",
      branch: "IT",
      batch: "Class of 2026",
      available: true,
      cgpa: 8.2,
      status: "Verified",
      readiness: 75,
      readinessLabel: "Nearly ready",
      skills: ["Python", "Node.js", "SQL"],
      gaps: "4 critical",
      gapType: "critical",
    },
    {
      id: "11",
      name: "Aditya Nair",
      avatar: "AN",
      branch: "ME",
      batch: "Class of 2026",
      available: true,
      cgpa: 8.0,
      status: "Verified",
      readiness: 71,
      readinessLabel: "Nearly ready",
      skills: ["CAD", "MATLAB", "Python"],
      gaps: "4 critical",
      gapType: "critical",
    },
    {
      id: "12",
      name: "Meera Joshi",
      avatar: "MJ",
      branch: "ECE",
      batch: "Class of 2027",
      available: false,
      cgpa: 7.4,
      status: "Pending",
      readiness: 63,
      readinessLabel: "Developing",
      skills: ["C", "VHDL"],
      gaps: "5 critical",
      gapType: "critical",
    },
  ];

  // Filtering Logic
  const filteredStudents = studentsList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.skills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === "Industry ready") return s.readiness >= 80;
    if (activeFilter === "Available for internship") return s.available;
    if (activeFilter === "Verified profile") return s.status === "Verified";
    if (activeFilter === "CGPA 8 and above") return s.cgpa >= 8.0;
    if (activeFilter === "No critical gaps") return s.gapType !== "critical";

    return true;
  });

  const toggleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter((item) => item !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
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
          <symbol id="i-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 010 7M21.5 20c0-2.6-1.6-4.4-4-5.1"/></symbol>
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
            <Link href="/student/competency"><svg><use href="#i-spark"/></svg>My skills</Link>
            <Link href="/student/competency"><svg><use href="#i-clip"/></svg>Assessments</Link>
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

        {/* Viewport Content */}
        <div>
          {/* Top Bar with Breadcrumbs */}
          <header className="topbar">
            <nav className="crumbs" aria-label="Breadcrumb">
              <Link href="/institution/dashboard">Institution</Link>
              <svg><use href="#i-chev"/></svg>
              <span className="here">Student intelligence</span>
            </nav>
            <div className="topbar-right">
              <label className="search" style={{ position: "relative" }}>
                <svg><use href="#i-search"/></svg>
                <input
                  type="text"
                  placeholder="Search students"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: "none", border: "none", outline: "none", color: "inherit", width: "100%", fontSize: "13px" }}
                />
                <kbd>⌘K</kbd>
              </label>
              <button className="icon-btn" type="button" aria-label="Help" onClick={() => router.push("/about")}><svg><use href="#i-help"/></svg></button>
              <button className="icon-btn" type="button" aria-label="Notifications" onClick={() => showToast("14 new verifications pending review")}><svg><use href="#i-bell"/></svg><span className="dot" aria-hidden="true"></span></button>
              <span className="avatar-sm" aria-label="Signed in as Institution Officer">AY</span>
            </div>
          </header>

          <main>
            <div className="page" style={{ maxWidth: "1240px" }}>
              {/* Title Row with Action CTA */}
              <div className="title-row">
                <div>
                  <h1 style={{ fontSize: "22px" }}>Student intelligence</h1>
                  <p style={{ fontSize: "13.5px", marginTop: "4px" }}>
                    Find, evaluate and shortlist verified students with evidence behind every number.
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => showToast(`Creating shortlist with ${selectedStudents.length > 0 ? selectedStudents.length : "selected"} students...`)}
                  style={{ gap: "8px", height: "38px", padding: "0 18px", fontSize: "13.5px" }}
                >
                  <svg style={{ width: "16px", height: "16px" }}><use href="#i-users"/></svg>
                  Create talent shortlist
                </button>
              </div>

              {/* Filter and Quick Action Bar */}
              <div className="filter-bar">
                <div className="filter-search">
                  <svg><use href="#i-search"/></svg>
                  <input
                    type="text"
                    placeholder="Search by name, skill or branch"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <span className="quick-label">Quick filters</span>

                {[
                  "Industry ready",
                  "Available for internship",
                  "Verified profile",
                  "CGPA 8 and above",
                  "No critical gaps",
                ].map((filter) => (
                  <button
                    key={filter}
                    className={`filter-pill ${activeFilter === filter ? "active" : ""}`}
                    type="button"
                    onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
                  >
                    {filter}
                  </button>
                ))}

                <button
                  className="sort-select"
                  type="button"
                  onClick={() => {
                    const next = sortBy === "readiness" ? "name" : "readiness";
                    setSortBy(next);
                    showToast(`Sorting by ${next}`);
                  }}
                >
                  <span>Sort: {sortBy}</span>
                  <svg style={{ width: "14px", height: "14px", transform: "rotate(90deg)" }}><use href="#i-chev"/></svg>
                </button>
              </div>

              {/* Directory Plate Card */}
              <div className="dir-plate">
                <div className="dir-head">
                  <h3>
                    <svg><use href="#i-user"/></svg>
                    Directory
                  </h3>
                  <span className="count">Showing {filteredStudents.length} of 318 students</span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="dir-table">
                    <thead>
                      <tr>
                        <th style={{ width: "36px", textAlign: "center" }}>
                          <button
                            type="button"
                            className={`custom-checkbox ${selectedStudents.length === filteredStudents.length && filteredStudents.length > 0 ? "checked" : ""}`}
                            onClick={toggleSelectAll}
                            aria-label="Select all students"
                          >
                            {selectedStudents.length === filteredStudents.length && filteredStudents.length > 0 && (
                              <svg><use href="#i-check"/></svg>
                            )}
                          </button>
                        </th>
                        <th>Student</th>
                        <th>Status</th>
                        <th>Readiness ↓</th>
                        <th>Verified skills</th>
                        <th>Gaps</th>
                        <th style={{ textAlign: "right" }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s) => {
                        const isSelected = selectedStudents.includes(s.id);
                        // Ring math
                        const radius = 11;
                        const circumference = 2 * Math.PI * radius;
                        const dashOffset = circumference - (s.readiness / 100) * circumference;

                        return (
                          <tr key={s.id} style={{ background: isSelected ? "var(--accent)" : "transparent" }}>
                            <td style={{ textAlign: "center" }}>
                              <button
                                type="button"
                                className={`custom-checkbox ${isSelected ? "checked" : ""}`}
                                onClick={() => toggleSelect(s.id)}
                                aria-label={`Select ${s.name}`}
                              >
                                {isSelected && <svg><use href="#i-check"/></svg>}
                              </button>
                            </td>

                            <td>
                              <div className="student-cell">
                                <div className="student-avatar">{s.avatar}</div>
                                <div className="student-meta">
                                  <div className="name">{s.name}</div>
                                  <div className="sub">
                                    {s.branch} · {s.batch}
                                    {s.available && <span> · Available</span>}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className={`chip ${s.status === "Verified" ? "chip-ok" : "chip-warn"}`}>
                                <span className="d" aria-hidden="true"></span>
                                <span>{s.status}</span>
                              </span>
                            </td>

                            <td>
                              <div className="mini-readiness">
                                <div className="mini-ring">
                                  <svg viewBox="0 0 28 28">
                                    <circle className="track" cx="14" cy="14" r={radius} fill="none" strokeWidth="2.5" />
                                    <circle
                                      className="fill"
                                      cx="14"
                                      cy="14"
                                      r={radius}
                                      fill="none"
                                      strokeWidth="2.5"
                                      strokeDasharray={`${circumference} ${circumference}`}
                                      strokeDashoffset={dashOffset}
                                    />
                                  </svg>
                                  <div className="val">{s.readiness}</div>
                                </div>
                                <div className="readiness-meta">
                                  <b>{s.readiness}%</b>
                                  <span>{s.readinessLabel}</span>
                                </div>
                              </div>
                            </td>

                            <td>
                              <div className="skill-tags">
                                {s.skills.map((sk) => (
                                  <span key={sk} className="skill-tag">
                                    {sk}
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td>
                              <span className={`gap-text ${s.gapType}`}>{s.gaps}</span>
                            </td>

                            <td style={{ textAlign: "right" }}>
                              <button
                                className="btn btn-secondary"
                                type="button"
                                style={{ height: "30px", fontSize: "12.5px", padding: "0 12px" }}
                                onClick={() => router.push("/student/profile")}
                              >
                                View profile
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                <div className="dir-foot">
                  <span>Showing 1 to {filteredStudents.length} of 318</span>
                  <div className="pagination">
                    <button className="page-btn active" type="button">1</button>
                    <button className="page-btn" type="button" onClick={() => showToast("Loading Page 2...")}>2</button>
                    <button className="page-btn" type="button" onClick={() => showToast("Loading Page 3...")}>3</button>
                    <span style={{ padding: "0 4px", color: "var(--muted-foreground)" }}>…</span>
                    <button className="page-btn" type="button" onClick={() => showToast("Loading Page 27...")}>27</button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Floating Multi-Select Action Bar */}
      {selectedStudents.length > 0 && (
        <div
          style={{
            position: "fixed",
            bottom: "28px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "999px",
            padding: "8px 20px 8px 16px",
            boxShadow: "var(--shadow-floating)",
            zIndex: 70,
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 500 }}>
            {selectedStudents.length} student{selectedStudents.length > 1 ? "s" : ""} selected
          </span>
          <button
            className="btn btn-primary"
            type="button"
            style={{ height: "30px", fontSize: "12px" }}
            onClick={() => showToast(`Added ${selectedStudents.length} students to Talent Shortlist`)}
          >
            Add to shortlist
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            style={{ height: "30px", fontSize: "12px" }}
            onClick={() => showToast("Exporting selected cohort to CSV...")}
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setSelectedStudents([])}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)", fontSize: "12px" }}
          >
            Clear
          </button>
        </div>
      )}

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
            zIndex: 80,
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
