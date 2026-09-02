"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentDashboardPage() {
  const router = useRouter();

  // State management for interactive features
  const [selectedRole, setSelectedRole] = useState("Backend developer");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number; show: boolean }>({
    text: "",
    x: 0,
    y: 0,
    show: false,
  });

  // Action toast / feedback state
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Keyboard shortcut for Search (Cmd/Ctrl + K)
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

  const handleTooltip = (text: string, e: React.MouseEvent) => {
    setTooltip({ text, x: e.clientX, y: e.clientY, show: true });
  };

  const hideTooltip = () => {
    setTooltip((prev) => ({ ...prev, show: false }));
  };

  return (
    <>
      {/* SVG Icon Definitions */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <symbol
            id="i-grid"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </symbol>
          <symbol
            id="i-spark"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
            <path d="M19 17l.7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7z" />
          </symbol>
          <symbol
            id="i-clip"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="4" width="14" height="17" rx="2" />
            <path d="M9 4V3h6v1M9 12h6M9 16h4" />
          </symbol>
          <symbol
            id="i-case"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M3 12h18" />
          </symbol>
          <symbol
            id="i-book"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z" />
            <path d="M4 19.5A2.5 2.5 0 006.5 22H20" />
          </symbol>
          <symbol
            id="i-id"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="9" cy="11" r="2" />
            <path d="M6 16c.6-1.6 1.7-2.4 3-2.4s2.4.8 3 2.4M15 9h3M15 13h3" />
          </symbol>
          <symbol
            id="i-radio"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="2" />
            <path d="M8.5 8.5a5 5 0 000 7M15.5 8.5a5 5 0 010 7M5.6 5.6a9 9 0 000 12.8M18.4 5.6a9 9 0 010 12.8" />
          </symbol>
          <symbol
            id="i-user"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
          </symbol>
          <symbol
            id="i-trend"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 17l6-6 4 4 8-8" />
            <path d="M15 7h6v6" />
          </symbol>
          <symbol
            id="i-pie"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v9h9" />
            <path d="M21 12a9 9 0 11-9-9" />
          </symbol>
          <symbol
            id="i-gear"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
          </symbol>
          <symbol
            id="i-help"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.6-2.5 2-2.5 3.5M12 17h.01" />
          </symbol>
          <symbol
            id="i-building"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 21V5a2 2 0 012-2h8a2 2 0 012 2v16M16 9h3a1 1 0 011 1v11M8 7h4M8 11h4M8 15h4M4 21h17" />
          </symbol>
          <symbol
            id="i-search"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="M20 20l-4.3-4.3" />
          </symbol>
          <symbol
            id="i-bell"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z" />
            <path d="M10 21h4" />
          </symbol>
          <symbol
            id="i-chev"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 6l6 6-6 6" />
          </symbol>
          <symbol
            id="i-check"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5l4.5 4.5L19 7" />
          </symbol>
          <symbol
            id="i-shield"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z" />
            <path d="M9 12l2 2 4-4" />
          </symbol>
          <symbol
            id="i-folder"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </symbol>
          <symbol
            id="i-award"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="9" r="5" />
            <path d="M9 13.5L8 21l4-2 4 2-1-7.5" />
          </symbol>
          <symbol
            id="i-star"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z" />
          </symbol>
          <symbol
            id="i-gauge"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 16a8 8 0 1116 0" />
            <path d="M12 16l4-5" />
            <circle cx="12" cy="16" r="1" />
          </symbol>
        </defs>
      </svg>

      {/* Main Shell */}
      <div className="shell">
        {/* Left Rail Sidebar */}
        <aside className="rail" aria-label="Sidebar">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7l8-4 8 4-8 4z" />
                <path d="M4 12l8 4 8-4M4 17l8 4 8-4" />
              </svg>
            </span>
            SkillSetu
          </Link>

          <nav className="nav" aria-label="Student">
            <Link href="/student/dashboard" aria-current="page">
              <svg>
                <use href="#i-grid" />
              </svg>
              Dashboard
            </Link>
            <Link href="/student/competency">
              <svg>
                <use href="#i-spark" />
              </svg>
              My skills
            </Link>
            <Link href="/student/competency">
              <svg>
                <use href="#i-clip" />
              </svg>
              Assessments
            </Link>
            <Link href="/student/opportunities">
              <svg>
                <use href="#i-case" />
              </svg>
              Opportunities
            </Link>
            <Link href="/student/opportunities">
              <svg>
                <use href="#i-book" />
              </svg>
              Internships
            </Link>
            <Link href="/student/profile">
              <svg>
                <use href="#i-id" />
              </svg>
              Skill passport
            </Link>

            <div className="nav-label">
              Institution{" "}
              <svg style={{ width: "14px", height: "14px", transform: "rotate(-90deg)" }}>
                <use href="#i-chev" />
              </svg>
            </div>
            <Link href="/institution/dashboard">
              <svg>
                <use href="#i-radio" />
              </svg>
              Placement command center
            </Link>
            <Link href="/institution/students">
              <svg>
                <use href="#i-user" />
              </svg>
              Student intelligence
            </Link>
            <Link href="/institution/readiness">
              <svg>
                <use href="#i-trend" />
              </svg>
              Industry demand
            </Link>
            <Link href="/institution/placements">
              <svg>
                <use href="#i-pie" />
              </svg>
              Outcomes
            </Link>
          </nav>

          <nav className="nav rail-bottom" aria-label="Account">
            <Link href="/admin/system">
              <svg>
                <use href="#i-gear" />
              </svg>
              Settings
            </Link>
            <Link href="/about">
              <svg>
                <use href="#i-help" />
              </svg>
              Help
            </Link>
            <Link href="/institution/dashboard">
              <svg>
                <use href="#i-building" />
              </svg>
              Institution profile
            </Link>
          </nav>
        </aside>

        {/* Center Main Viewport */}
        <div>
          {/* Top Bar */}
          <header className="topbar">
            <nav className="crumbs" aria-label="Breadcrumb">
              <span className="here">Dashboard</span>
            </nav>
            <div className="topbar-right">
              <label className="search" style={{ position: "relative" }}>
                <svg>
                  <use href="#i-search" />
                </svg>
                <input
                  id="dashboard-search-input"
                  type="text"
                  placeholder="Search competencies, roles, drives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    color: "inherit",
                    width: "100%",
                    fontSize: "13px",
                  }}
                />
                <kbd>⌘K</kbd>
              </label>

              <button
                className="icon-btn"
                type="button"
                aria-label="Help"
                onClick={() => router.push("/about")}
                onMouseEnter={(e) => handleTooltip("SkillSetu Help & Docs", e)}
                onMouseLeave={hideTooltip}
              >
                <svg>
                  <use href="#i-help" />
                </svg>
              </button>

              <button
                className="icon-btn"
                type="button"
                aria-label="2 unread notifications"
                onClick={() => showToast("Razorpay interview confirmed for Sep 4 • Assessment scheduled")}
                onMouseEnter={(e) => handleTooltip("2 unread notifications", e)}
                onMouseLeave={hideTooltip}
              >
                <svg>
                  <use href="#i-bell" />
                </svg>
                <span className="dot" aria-hidden="true" />
              </button>

              <Link
                href="/student/profile"
                className="avatar-sm"
                aria-label="Signed in as Aarav Sharma"
                onMouseEnter={(e) => handleTooltip("Profile: Aarav Sharma (IIT Delhi)", e)}
                onMouseLeave={hideTooltip}
              >
                AS
              </Link>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main>
            <div className="page">
              {/* Title Row */}
              <div className="title-row">
                <div>
                  <h1>Good morning, Aarav</h1>
                  <p>
                    B.Tech CSE, third year, class of 2027.{" "}
                    <span className="goal relative">
                      Career goal:{" "}
                      <button
                        type="button"
                        onClick={() => setShowRoleMenu(!showRoleMenu)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          color: "var(--primary)",
                          fontWeight: 500,
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        {selectedRole}
                      </button>
                      {showRoleMenu && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
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
                            "DevOps Specialist",
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
                                cursor: "pointer",
                              }}
                            >
                              {role}
                            </button>
                          ))}
                        </div>
                      )}
                    </span>
                  </p>
                </div>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={() => router.push("/student/profile")}
                >
                  <svg>
                    <use href="#i-user" />
                  </svg>
                  Edit profile
                </button>
              </div>

              {/* Row 1: Career Readiness + Next Best Actions */}
              <div className="grid-2a">
                <section className="plate card">
                  <div className="card-head">
                    <h3>
                      <svg>
                        <use href="#i-gauge" />
                      </svg>
                      Career readiness
                    </h3>
                    <button
                      className="seeall"
                      type="button"
                      onClick={() => router.push("/student/competency")}
                    >
                      Full report <span className="arr" aria-hidden="true">›</span>
                    </button>
                  </div>
                  <div className="inset auto readiness2">
                    <div>
                      <div
                        className="ring-md"
                        role="img"
                        aria-label="Career readiness 78 percent, up 6.2 points this month"
                      >
                        <svg viewBox="0 0 132 132">
                          <circle className="track" cx="66" cy="66" r="58" fill="none" strokeWidth="9" />
                          <circle
                            className="fill"
                            cx="66"
                            cy="66"
                            r="58"
                            fill="none"
                            strokeWidth="9"
                            strokeDasharray="284.3 364.4"
                          />
                        </svg>
                        <div className="val">
                          <span className="n num">
                            78<small>%</small>
                          </span>
                          <span className="dl num">+6.2 this month</span>
                        </div>
                      </div>
                      <div className="ring-cap">
                        Status <b>Industry ready</b>
                      </div>
                    </div>
                    <div className="rd-side">
                      <div className="k">Target role</div>
                      <div className="t">{selectedRole}</div>
                      <div className="mini num">
                        <div>
                          <div className="v">82%</div>
                          <div className="l">Skills</div>
                        </div>
                        <div>
                          <div className="v warn">74%</div>
                          <div className="l">Evidence</div>
                        </div>
                        <div>
                          <div className="v warn">68%</div>
                          <div className="l">Experience</div>
                        </div>
                        <div>
                          <div className="v">86%</div>
                          <div className="l">Assessments</div>
                        </div>
                        <div>
                          <div className="v">94%</div>
                          <div className="l">Profile</div>
                        </div>
                      </div>
                      <p className="note">
                        You are <b>22 points</b> from the benchmark recruiters use for this role. Evidence and experience are the two dimensions holding the score down.
                      </p>
                    </div>
                    <div className="rd-foot">
                      <span>Benchmark 100 is the median of hired backend developers, class of 2026.</span>
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={() => router.push("/student/competency")}
                      >
                        Improve readiness
                      </button>
                    </div>
                  </div>
                </section>

                <section className="plate card">
                  <div className="card-head">
                    <h3>
                      <svg>
                        <use href="#i-spark" />
                      </svg>
                      Your next best actions
                    </h3>
                    <span className="muted" style={{ fontSize: "12px", paddingRight: "6px" }}>
                      Ranked by readiness gained per hour
                    </span>
                  </div>
                  <div className="inset auto actions3">
                    <div className="nba">
                      <span className="k">Close a skill gap</span>
                      <span className="t">Docker</span>
                      <span className="s">
                        Current <b>basic</b>, the role needs <b>intermediate</b>. A 6-hour path with one deployable project.
                      </span>
                      <span className="why">+4 readiness</span>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => {
                          showToast("Starting Docker 6-hour mastery path...");
                          router.push("/student/competency");
                        }}
                      >
                        Start the path
                      </button>
                    </div>
                    <div className="nba">
                      <span className="k">Strengthen evidence</span>
                      <span className="t">Add a verified backend project</span>
                      <span className="s">
                        You claim 6 projects but only <b>1</b> has verified backend evidence. Link a repo and a demo.
                      </span>
                      <span className="why">+3 readiness</span>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => router.push("/student/profile")}
                      >
                        Add evidence
                      </button>
                    </div>
                    <div className="nba">
                      <span className="k">Complete an assessment</span>
                      <span className="t">Backend development</span>
                      <span className="s">
                        <b>25 minutes</b>, proctored. Passing moves your assessment score and unlocks 4 shortlists.
                      </span>
                      <span className="why">+2 readiness</span>
                      <button
                        className="btn btn-secondary"
                        type="button"
                        onClick={() => {
                          showToast("Launching Backend Architectural Challenge...");
                          router.push("/student/competency");
                        }}
                      >
                        Start assessment
                      </button>
                    </div>
                  </div>
                </section>
              </div>

              {/* Row 2: Stat Strip (7 Metrics) */}
              <section className="plate stats seven" aria-label="Career snapshot">
                <div className="stat">
                  <svg>
                    <use href="#i-id" />
                  </svg>
                  <div>
                    <div className="k">Profile</div>
                    <div className="v num">94%</div>
                  </div>
                </div>
                <div className="stat">
                  <svg>
                    <use href="#i-shield" />
                  </svg>
                  <div>
                    <div className="k">Skills verified</div>
                    <div className="v num">18</div>
                  </div>
                </div>
                <div className="stat">
                  <svg>
                    <use href="#i-folder" />
                  </svg>
                  <div>
                    <div className="k">Projects</div>
                    <div className="v num">6</div>
                  </div>
                </div>
                <div className="stat">
                  <svg>
                    <use href="#i-case" />
                  </svg>
                  <div>
                    <div className="k">Internships</div>
                    <div className="v num">2</div>
                  </div>
                </div>
                <div className="stat">
                  <svg>
                    <use href="#i-award" />
                  </svg>
                  <div>
                    <div className="k">Certifications</div>
                    <div className="v num">8</div>
                  </div>
                </div>
                <div className="stat">
                  <svg>
                    <use href="#i-clip" />
                  </svg>
                  <div>
                    <div className="k">Assessments, avg</div>
                    <div className="v num">86%</div>
                  </div>
                </div>
                <div className="stat">
                  <svg>
                    <use href="#i-pie" />
                  </svg>
                  <div>
                    <div className="k">Evidence coverage</div>
                    <div className="v num">81%</div>
                  </div>
                </div>
              </section>

              {/* Row 3: Target Role Competencies, Biggest Skill Gaps, Opportunities */}
              <div className="grid-3">
                <section className="plate card">
                  <div className="card-head">
                    <h3>
                      <svg>
                        <use href="#i-case" />
                      </svg>
                      Target role competencies
                    </h3>
                    <button
                      className="seeall"
                      type="button"
                      onClick={() => router.push("/student/competency")}
                    >
                      Full map <span className="arr" aria-hidden="true">›</span>
                    </button>
                  </div>
                  <div className="inset h236">
                    <div className="dims tight" role="list" aria-label="Required competencies for backend developer">
                      <div className="dim" role="listitem">
                        <span className="k">Python</span>
                        <span className="v num">94%</span>
                        <span className="b">
                          <i style={{ width: "94%" }}></i>
                          <em style={{ left: "80%" }}></em>
                        </span>
                      </div>
                      <div className="dim" role="listitem">
                        <span className="k">SQL</span>
                        <span className="v num">88%</span>
                        <span className="b">
                          <i style={{ width: "88%" }}></i>
                          <em style={{ left: "80%" }}></em>
                        </span>
                      </div>
                      <div className="dim" role="listitem">
                        <span className="k">REST APIs</span>
                        <span className="v num">91%</span>
                        <span className="b">
                          <i style={{ width: "91%" }}></i>
                          <em style={{ left: "80%" }}></em>
                        </span>
                      </div>
                      <div className="dim" role="listitem">
                        <span className="k">Data structures</span>
                        <span className="v num">82%</span>
                        <span className="b">
                          <i style={{ width: "82%" }}></i>
                          <em style={{ left: "70%" }}></em>
                        </span>
                      </div>
                      <div className="dim weak" role="listitem">
                        <span className="k">Docker</span>
                        <span className="v num">54%</span>
                        <span className="b">
                          <i style={{ width: "54%" }}></i>
                          <em style={{ left: "70%" }}></em>
                        </span>
                      </div>
                      <div className="dim weak" role="listitem">
                        <span className="k">Cloud</span>
                        <span className="v num">42%</span>
                        <span className="b">
                          <i style={{ width: "42%" }}></i>
                          <em style={{ left: "70%" }}></em>
                        </span>
                      </div>
                      <div className="dim weak" role="listitem">
                        <span className="k">System design</span>
                        <span className="v num">51%</span>
                        <span className="b">
                          <i style={{ width: "51%" }}></i>
                          <em style={{ left: "60%" }}></em>
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="plate card">
                  <div className="card-head">
                    <h3>
                      <svg>
                        <use href="#i-trend" />
                      </svg>
                      Biggest skill gaps
                    </h3>
                    <button
                      className="seeall"
                      type="button"
                      onClick={() => router.push("/student/competency")}
                    >
                      Roadmap <span className="arr" aria-hidden="true">›</span>
                    </button>
                  </div>
                  <div className="inset h236" style={{ display: "flex", flexDirection: "column" }}>
                    <div className="gap">
                      <div>
                        <div className="t">
                          <span className="d"></span>Docker
                        </div>
                        <div className="s">
                          Required by <b>11 of 14</b> matched roles
                        </div>
                      </div>
                      <div className="lv">
                        <b>Basic</b>needs intermediate
                      </div>
                    </div>
                    <div className="gap">
                      <div>
                        <div className="t">
                          <span className="d"></span>AWS
                        </div>
                        <div className="s">
                          Required by <b>9 of 14</b> matched roles
                        </div>
                      </div>
                      <div className="lv">
                        <b>Beginner</b>needs intermediate
                      </div>
                    </div>
                    <div className="gap">
                      <div>
                        <div className="t">
                          <span className="d"></span>System design
                        </div>
                        <div className="s">
                          Required by <b>7 of 14</b>, mostly graduate roles
                        </div>
                      </div>
                      <div className="lv">
                        <b>Basic</b>needs intermediate
                      </div>
                    </div>
                    <div style={{ marginTop: "auto", padding: "8px 14px 4px", borderTop: "1px solid var(--border)" }}>
                      <button
                        className="btn btn-primary"
                        type="button"
                        style={{ height: "32px", fontSize: "13px", width: "100%" }}
                        onClick={() => router.push("/student/competency")}
                      >
                        Build my roadmap
                      </button>
                    </div>
                  </div>
                </section>

                <section className="plate card">
                  <div className="card-head">
                    <h3>
                      <svg>
                        <use href="#i-star" />
                      </svg>
                      Opportunities for you
                    </h3>
                    <button
                      className="seeall"
                      type="button"
                      onClick={() => router.push("/student/opportunities")}
                    >
                      All 14 <span className="arr" aria-hidden="true">›</span>
                    </button>
                  </div>
                  <div className="inset h236">
                    <div
                      className="opp"
                      onClick={() => router.push("/student/opportunities")}
                      onMouseEnter={(e) => handleTooltip("Closes in 5 days • 92% match", e)}
                      onMouseLeave={hideTooltip}
                    >
                      <div>
                        <div className="t">Backend engineering intern, Razorpay</div>
                        <div className="s">Remote, 6 months, closes in 5 days</div>
                      </div>
                      <div className="m num">
                        92%<small>match</small>
                      </div>
                    </div>
                    <div
                      className="opp"
                      onClick={() => router.push("/student/opportunities")}
                      onMouseEnter={(e) => handleTooltip("Closes 28 Oct • 87% match", e)}
                      onMouseLeave={hideTooltip}
                    >
                      <div>
                        <div className="t">Software engineering intern, Zomato</div>
                        <div className="s">Gurugram, 6 months, closes 28 Oct</div>
                      </div>
                      <div className="m num">
                        87%<small>match</small>
                      </div>
                    </div>
                    <div
                      className="opp"
                      onClick={() => router.push("/student/opportunities")}
                      onMouseEnter={(e) => handleTooltip("Missing Docker skill gap • 84% fit", e)}
                      onMouseLeave={hideTooltip}
                    >
                      <div>
                        <div className="t">Backend developer, graduate, CRED</div>
                        <div className="s">Bengaluru, full time, class of 2027</div>
                      </div>
                      <div className="m num warn">
                        84%<small>Docker gap</small>
                      </div>
                    </div>
                    <div
                      className="opp"
                      onClick={() => router.push("/student/opportunities")}
                      onMouseEnter={(e) => handleTooltip("Closes 3 Nov • 81% match", e)}
                      onMouseLeave={hideTooltip}
                    >
                      <div>
                        <div className="t">Platform intern, Freshworks</div>
                        <div className="s">Chennai, 6 months, closes 3 Nov</div>
                      </div>
                      <div className="m num">
                        81%<small>match</small>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Row 4: My Applications, Coming Up, Development Journey */}
              <div className="grid-3">
                <section className="plate card">
                  <div className="card-head">
                    <h3>
                      <svg>
                        <use href="#i-clip" />
                      </svg>
                      My applications
                    </h3>
                    <button
                      className="seeall"
                      type="button"
                      onClick={() => router.push("/student/applications")}
                    >
                      See all <span className="arr" aria-hidden="true">›</span>
                    </button>
                  </div>
                  <div className="inset h212">
                    <div
                      className="apps num"
                      role="img"
                      aria-label="Applications: 12 applied, 6 shortlisted, 4 assessments, 2 interviews, 1 offer"
                    >
                      <div className="st">
                        <div className="v">12</div>
                        <div className="l">Applied</div>
                      </div>
                      <div className="st">
                        <div className="v">6</div>
                        <div className="l">Shortlisted</div>
                      </div>
                      <div className="st">
                        <div className="v">4</div>
                        <div className="l">Assessments</div>
                      </div>
                      <div className="st">
                        <div className="v">2</div>
                        <div className="l">Interviews</div>
                      </div>
                      <div className="st win">
                        <div className="v">1</div>
                        <div className="l">Offer</div>
                      </div>
                    </div>
                    <div className="row">
                      <span>Razorpay, backend intern</span>
                      <span className="r">Interview, 4 Sep</span>
                    </div>
                    <div className="row">
                      <span>Zomato, SWE intern</span>
                      <span className="r">Assessment pending</span>
                    </div>
                    <div className="row">
                      <span>Groww, backend intern</span>
                      <span className="r ok">Offer received</span>
                    </div>
                  </div>
                </section>

                <section className="plate card">
                  <div className="card-head">
                    <h3>
                      <svg>
                        <use href="#i-bell" />
                      </svg>
                      Coming up
                    </h3>
                    <button
                      className="seeall"
                      type="button"
                      onClick={() => showToast("Opening interview & challenge schedule...")}
                    >
                      Calendar <span className="arr" aria-hidden="true">›</span>
                    </button>
                  </div>
                  <div className="inset h212">
                    <div className="drive" style={{ height: "52px" }}>
                      <div className="date">
                        <b>2</b>
                        <span>Today</span>
                      </div>
                      <div>
                        <div className="t">Backend development assessment</div>
                        <div className="s">2:00 pm, 25 minutes, proctored</div>
                      </div>
                      <div className="r">
                        <span className="warn">In 3 h</span>
                      </div>
                    </div>
                    <div className="drive" style={{ height: "52px" }}>
                      <div className="date">
                        <b>3</b>
                        <span>Sep</span>
                      </div>
                      <div>
                        <div className="t">Razorpay technical interview</div>
                        <div className="s">2:00 pm, 45 minutes, video</div>
                      </div>
                      <div className="r">
                        <small>Tomorrow</small>
                      </div>
                    </div>
                    <div className="drive" style={{ height: "52px" }}>
                      <div className="date">
                        <b>5</b>
                        <span>Sep</span>
                      </div>
                      <div>
                        <div className="t">Razorpay intern application closes</div>
                        <div className="s">11:59 pm. Profile evidence still 74%</div>
                      </div>
                      <div className="r">
                        <small>3 days</small>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="plate card">
                  <div className="card-head">
                    <h3>
                      <svg>
                        <use href="#i-book" />
                      </svg>
                      Development journey
                    </h3>
                    <button
                      className="seeall"
                      type="button"
                      onClick={() => router.push("/student/competency")}
                    >
                      Roadmap <span className="arr" aria-hidden="true">›</span>
                    </button>
                  </div>
                  <div className="inset h212">
                    <div className="row-sub">
                      Backend developer roadmap,{" "}
                      <b style={{ fontWeight: 500, color: "var(--foreground)" }}>68% complete</b>
                    </div>
                    <div className="jbar">
                      <i style={{ width: "68%" }}></i>
                    </div>
                    <div className="journey">
                      <div className="jstep done">
                        <span className="m">
                          <svg>
                            <use href="#i-check" />
                          </svg>
                        </span>
                        <span>Python, SQL, APIs, authentication</span>
                        <span className="r">4 done</span>
                      </div>
                      <div className="jstep now">
                        <span className="m"></span>
                        <span>Docker</span>
                        <span className="r">In progress, 3 of 6 h</span>
                      </div>
                      <div className="jstep todo">
                        <span className="m"></span>
                        <span>Cloud</span>
                        <span className="r">Next</span>
                      </div>
                      <div className="jstep todo">
                        <span className="m"></span>
                        <span>System design</span>
                        <span className="r">After cloud</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Row 5: Recent Achievements + Career Readiness Trend */}
              <div className="grid-2a">
                <section className="plate card">
                  <div className="card-head">
                    <h3>
                      <svg>
                        <use href="#i-award" />
                      </svg>
                      Recent achievements
                    </h3>
                    <button
                      className="seeall"
                      type="button"
                      onClick={() => router.push("/student/profile")}
                    >
                      All <span className="arr" aria-hidden="true">›</span>
                    </button>
                  </div>
                  <div className="inset h212">
                    <div className="ach">
                      <svg>
                        <use href="#i-check" />
                      </svg>
                      <span>
                        <b>Python assessment</b> passed at 91%
                      </span>
                      <span className="r">Yesterday</span>
                    </div>
                    <div className="ach">
                      <svg>
                        <use href="#i-star" />
                      </svg>
                      <span>
                        <b>SIH 2025 finalist</b> verified by the institution
                      </span>
                      <span className="r">28 Aug</span>
                    </div>
                    <div className="ach">
                      <svg>
                        <use href="#i-folder" />
                      </svg>
                      <span>
                        <b>Inventory API</b> project verified with a live demo
                      </span>
                      <span className="r">24 Aug</span>
                    </div>
                    <div className="ach">
                      <svg>
                        <use href="#i-trend" />
                      </svg>
                      <span>
                        Backend competency moved <b>basic to intermediate</b>
                      </span>
                      <span className="r">21 Aug</span>
                    </div>
                    <div className="ach">
                      <svg>
                        <use href="#i-case" />
                      </svg>
                      <span>
                        <b>Summer internship</b> at Razorpay confirmed complete
                      </span>
                      <span className="r">15 Aug</span>
                    </div>
                  </div>
                </section>

                <section className="plate card">
                  <div className="card-head">
                    <h3>
                      <svg>
                        <use href="#i-gauge" />
                      </svg>
                      Career readiness, 8 months
                    </h3>
                    <button
                      className="seeall"
                      type="button"
                      onClick={() => router.push("/student/competency")}
                    >
                      Details <span className="arr" aria-hidden="true">›</span>
                    </button>
                  </div>
                  <div className="inset h212">
                    <div className="row-sub">Readiness for backend developer, from 62% in January to 78% now.</div>
                    <div className="trend">
                      <svg
                        viewBox="0 0 320 120"
                        role="img"
                        aria-label="Career readiness rose from 62 percent in January to 78 percent in September"
                      >
                        <line className="gl" x1="28" y1="16" x2="312" y2="16" />
                        <line className="gl" x1="28" y1="50" x2="312" y2="50" />
                        <line className="gl" x1="28" y1="84" x2="312" y2="84" />
                        <text x="0" y="19">
                          85%
                        </text>
                        <text x="0" y="53">
                          70%
                        </text>
                        <text x="0" y="87">
                          55%
                        </text>
                        <path
                          className="ar"
                          d="M28 68 L68 66 L108 64.5 L148 59 L188 57 L228 52 L268 41.5 L312 32 L312 84 L28 84 Z"
                        />
                        <polyline
                          className="ln"
                          points="28,68 68,66 108,64.5 148,59 188,57 228,52 268,41.5 312,32"
                        />
                        <circle className="pt" cx="312" cy="32" r="4" />
                        <text x="28" y="104">
                          Jan
                        </text>
                        <text x="148" y="104">
                          May
                        </text>
                        <text x="296" y="104">
                          Sep
                        </text>
                      </svg>
                    </div>
                    <div className="row">
                      <span className="muted">Biggest jump</span>
                      <span className="r">July, internship evidence verified</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Floating Tooltip */}
      {tooltip.show && (
        <div
          className="tip show"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          {tooltip.text}
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
