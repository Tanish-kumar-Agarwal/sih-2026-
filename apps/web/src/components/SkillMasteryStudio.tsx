"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  BookOpen,
  Code2,
  Play,
  Award,
  ChevronRight,
  Search,
  Flame,
  Star,
  Copy,
  Check,
  Zap,
  Layers,
  GraduationCap,
  MessageSquare,
  HelpCircle,
  X,
  UploadCloud,
  TrendingUp,
  ShieldCheck,
  Building,
  RefreshCw,
  FolderGit2
} from "lucide-react";
import {
  skillsMasteryCatalog,
  MasterySkillItem,
  RoadmapMilestone,
  CourseOffering,
  YouTubeLecture,
  ProjectSuggestion
} from "@/data/skillsMasteryData";

interface SkillMasteryStudioProps {
  initialSkillId?: string;
  onScoreUpdate?: (skillId: string, newScore: number) => void;
  onBackToGraph?: () => void;
}

export default function SkillMasteryStudio({
  initialSkillId = "docker",
  onScoreUpdate,
  onBackToGraph
}: SkillMasteryStudioProps) {
  // Active skill state
  const [activeSkillId, setActiveSkillId] = useState<string>(initialSkillId);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState<"all" | "mastered" | "developing" | "gap" | "prog" | "data" | "sys">("all");
  const [activeTab, setActiveTab] = useState<"roadmap" | "youtube" | "courses" | "quiz" | "projects">("roadmap");
  const [courseFilter, setCourseFilter] = useState<"all" | "free" | "paid">("all");

  // Dynamic state for skill scores and completed milestones
  const [skillsState, setSkillsState] = useState<Record<string, MasterySkillItem>>(skillsMasteryCatalog);
  const [copiedRepoId, setCopiedRepoId] = useState<string | null>(null);

  // Modals state
  const [activeVideoModal, setActiveVideoModal] = useState<YouTubeLecture | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);
  const [isSubmitProjectOpen, setIsSubmitProjectOpen] = useState(false);
  const [selectedProjectForSubmit, setSelectedProjectForSubmit] = useState<ProjectSuggestion | null>(null);
  const [submissionRepoUrl, setSubmissionRepoUrl] = useState("");
  const [submissionToast, setSubmissionToast] = useState<string | null>(null);

  // Quiz Runner State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);

  // AI Coach state
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Hello! I am your SkillSetu AI Competency Coach. Ask me anything about this skill, topic architectures, or interview questions!"
    }
  ]);

  const activeSkill = skillsState[activeSkillId] || skillsState["docker"];

  const showToast = (msg: string) => {
    setSubmissionToast(msg);
    setTimeout(() => setSubmissionToast(null), 3500);
  };

  // Filter skills list
  const filteredSkills = useMemo(() => {
    return Object.values(skillsState).filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterTag === "all") return true;
      if (filterTag === "mastered") return s.status === "mastered";
      if (filterTag === "developing") return s.status === "developing";
      if (filterTag === "gap") return s.status === "gap";
      if (filterTag === "prog") return s.group === "prog";
      if (filterTag === "data") return s.group === "data";
      if (filterTag === "sys") return s.group === "sys";
      return true;
    });
  }, [skillsState, searchQuery, filterTag]);

  // Overall metrics calculation
  const totalSkillsCount = Object.keys(skillsState).length;
  const masteredCount = Object.values(skillsState).filter((s) => s.status === "mastered").length;
  const gapCount = Object.values(skillsState).filter((s) => s.status === "gap").length;
  const avgScore = Math.round(
    Object.values(skillsState).reduce((acc, curr) => acc + curr.score, 0) / (totalSkillsCount || 1)
  );

  // Toggle roadmap milestone completion
  const handleToggleMilestone = (milestoneId: string) => {
    setSkillsState((prev) => {
      const current = prev[activeSkillId];
      if (!current) return prev;
      const updatedRoadmap = current.roadmap.map((m) => {
        if (m.id === milestoneId) {
          return { ...m, completed: !m.completed };
        }
        return m;
      });

      // Calculate score increment if completing
      const completedCount = updatedRoadmap.filter((m) => m.completed).length;
      const newScore = Math.min(99, Math.max(current.score, Math.round(50 + (completedCount / updatedRoadmap.length) * 45)));

      showToast(`Milestone updated! Competency score recalculated to ${newScore}%.`);
      if (onScoreUpdate) onScoreUpdate(activeSkillId, newScore);

      return {
        ...prev,
        [activeSkillId]: {
          ...current,
          score: newScore,
          status: newScore >= 80 ? "mastered" : newScore >= 65 ? "developing" : "gap",
          roadmap: updatedRoadmap
        }
      };
    });
  };

  // Copy repo command
  const handleCopyCmd = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedRepoId(id);
    showToast("Command copied to clipboard!");
    setTimeout(() => setCopiedRepoId(null), 2500);
  };

  // Start Quiz
  const handleOpenQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setIsQuizCompleted(false);
    setIsQuizModalOpen(true);
  };

  // Submit Answer in Quiz
  const handleSubmitQuizAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    const isCorrect = selectedOption === activeSkill.quiz.questions[currentQuestionIndex].correctIndex;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  // Next Question or Finish Quiz
  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < activeSkill.quiz.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setIsQuizCompleted(true);
    }
  };

  // Apply Quiz Points to Skill Score
  const handleApplyQuizScore = () => {
    const pointsGained = activeSkill.quiz.pointsGain;
    const newScore = Math.min(100, activeSkill.score + pointsGained);
    setSkillsState((prev) => ({
      ...prev,
      [activeSkillId]: {
        ...activeSkill,
        score: newScore,
        status: newScore >= 80 ? "mastered" : newScore >= 65 ? "developing" : "gap"
      }
    }));
    if (onScoreUpdate) onScoreUpdate(activeSkillId, newScore);
    setIsQuizModalOpen(false);
    showToast(`🎉 Verified +${pointsGained} Competency Points added to ${activeSkill.name}! Neo4j Graph updated.`);
  };

  // Submit Project Evidence
  const handleSubmitProjectEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionRepoUrl.trim()) return;
    setIsSubmitProjectOpen(false);
    showToast(`Evidence verified! ${selectedProjectForSubmit?.title} linked to Skill Passport.`);
    setSubmissionRepoUrl("");
    // Give project evidence bonus
    setSkillsState((prev) => {
      const current = prev[activeSkillId];
      const newScore = Math.min(100, current.score + 5);
      return {
        ...prev,
        [activeSkillId]: {
          ...current,
          score: newScore,
          status: newScore >= 80 ? "mastered" : newScore >= 65 ? "developing" : "gap",
          verifiedEvidenceCount: {
            ...current.verifiedEvidenceCount,
            projects: current.verifiedEvidenceCount.projects + 1,
            githubRepos: current.verifiedEvidenceCount.githubRepos + 1
          }
        }
      };
    });
  };

  // Send AI message
  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    const userMsg = aiQuestion;
    setAiChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setAiQuestion("");

    setTimeout(() => {
      let aiReply = `Regarding ${activeSkill.name}: In production and interviews, the key differentiator is understanding real-time trade-offs. For example, when using ${activeSkill.name.split(" ")[0]}, always ensure proper resource limits, graceful error degradation, and telemetry instrumentation. Review the project starter kit below to see industry-grade implementation!`;
      if (userMsg.toLowerCase().includes("interview") || userMsg.toLowerCase().includes("question")) {
        aiReply = `Common Tier-1 interview question for ${activeSkill.name}: "How would you handle high concurrency and zero-downtime deployments using this technology?" Top candidates mention automated healthchecks, connection pool tuning, and blue-green container rotation.`;
      }
      setAiChatMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
    }, 600);
  };

  // Filtered courses
  const filteredCourses = activeSkill.courses.filter((c) => {
    if (courseFilter === "free") return c.isFree || c.financialAidAvailable;
    if (courseFilter === "paid") return !c.isFree;
    return true;
  });

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {submissionToast && (
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
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeIn 0.2s ease-out"
          }}
        >
          <CheckCircle2 style={{ width: "18px", height: "18px", color: "#34d399", flexShrink: 0 }} />
          <span>{submissionToast}</span>
        </div>
      )}

      {/* TOP KPI & OVERVIEW BANNER */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(20, 24, 33, 0.9) 0%, rgba(13, 16, 23, 0.95) 100%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          padding: "24px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(168, 85, 247, 0.15)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                color: "#c084fc",
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "999px",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}
            >
              <Sparkles style={{ width: "12px", height: "12px" }} />
              SkillSetu Mastery Studio
            </span>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", margin: 0 }}>
              Skill Inventory & Accelerated Learning Roadmap
            </h1>
          </div>
          <p style={{ fontSize: "13.5px", color: "#94a3b8", marginTop: "6px", margin: "6px 0 0" }}>
            Select any skill possessed or required to access topic roadmaps, YouTube lecture deep-dives, free & paid courses, live quizzes, and portfolio starter repos.
          </p>
        </div>

        {/* Global Summary Metrics Ribbon */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "14px",
              padding: "10px 16px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600 }}>Total Skills</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff" }}>{totalSkillsCount}</div>
          </div>

          <div
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "14px",
              padding: "10px 16px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "11px", color: "#34d399", textTransform: "uppercase", fontWeight: 600 }}>Mastered</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#34d399" }}>{masteredCount}</div>
          </div>

          <div
            style={{
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              borderRadius: "14px",
              padding: "10px 16px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "11px", color: "#fbbf24", textTransform: "uppercase", fontWeight: 600 }}>Critical Gaps</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#fbbf24" }}>{gapCount}</div>
          </div>

          <div
            style={{
              background: "rgba(59, 130, 246, 0.08)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              borderRadius: "14px",
              padding: "10px 16px",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "11px", color: "#60a5fa", textTransform: "uppercase", fontWeight: 600 }}>Avg Score</div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#60a5fa" }}>{avgScore}%</div>
          </div>

          {onBackToGraph && (
            <button
              type="button"
              onClick={onBackToGraph}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: "44px",
                padding: "0 16px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#e2e8f0",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              <span>🕸️ View Neo4j Graph</span>
            </button>
          )}
        </div>
      </div>

      {/* TWO-COLUMN MASTER-DETAIL LAYOUT */}
      <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* LEFT COLUMN: Skills Inventory List & Search */}
        <div
          style={{
            background: "#141519",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "20px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px"
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative" }}>
            <Search
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "15px",
                height: "15px",
                color: "#64748b"
              }}
            />
            <input
              type="text"
              placeholder="Search skills, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "12px",
                padding: "10px 12px 10px 36px",
                color: "#f8fafc",
                fontSize: "13px",
                outline: "none"
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {[
              { id: "all", label: "All Skills" },
              { id: "gap", label: "Gaps (<75%)" },
              { id: "mastered", label: "Mastered" },
              { id: "prog", label: "Code" },
              { id: "data", label: "Data" },
              { id: "sys", label: "Cloud & Ops" }
            ].map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => setFilterTag(tag.id as any)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "8px",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: filterTag === tag.id ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.07)",
                  background: filterTag === tag.id ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.025)",
                  color: filterTag === tag.id ? "#60a5fa" : "#94a3b8"
                }}
              >
                {tag.label}
              </button>
            ))}
          </div>

          {/* Skills Scrollable List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "650px", overflowY: "auto", paddingRight: "4px" }}>
            {filteredSkills.map((s) => {
              const isSelected = s.id === activeSkillId;
              const isGap = s.status === "gap";
              const isMastered = s.status === "mastered";

              return (
                <div
                  key={s.id}
                  onClick={() => setActiveSkillId(s.id)}
                  style={{
                    background: isSelected ? "rgba(37, 99, 235, 0.12)" : "rgba(255,255,255,0.02)",
                    border: isSelected
                      ? "1px solid rgba(59, 130, 246, 0.5)"
                      : "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "14px",
                    padding: "14px",
                    cursor: "pointer",
                    transition: "all 0.15s ease-in-out",
                    position: "relative"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          padding: "1px 6px",
                          borderRadius: "4px",
                          background: isGap
                            ? "rgba(245, 158, 11, 0.15)"
                            : isMastered
                            ? "rgba(16, 185, 129, 0.15)"
                            : "rgba(59, 130, 246, 0.15)",
                          color: isGap ? "#fbbf24" : isMastered ? "#34d399" : "#60a5fa"
                        }}
                      >
                        {s.category}
                      </span>
                      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: "6px 0 2px" }}>
                        {s.name}
                      </h3>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        Level: <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{s.currentLevel}</span> · Target: <span style={{ color: "#60a5fa", fontWeight: 600 }}>{s.requiredLevel}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "16px",
                          fontWeight: 800,
                          color: isGap ? "#fbbf24" : isMastered ? "#34d399" : "#60a5fa",
                          fontFamily: "var(--font-mono, monospace)"
                        }}
                      >
                        {s.score}%
                      </span>
                      <div style={{ fontSize: "10px", color: "#64748b" }}>
                        Benchmark: {s.benchmark}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      height: "5px",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "999px",
                      marginTop: "10px",
                      overflow: "hidden"
                    }}
                  >
                    <div
                      style={{
                        width: `${s.score}%`,
                        height: "100%",
                        background: isGap ? "#fbbf24" : isMastered ? "#10b981" : "#3b82f6",
                        borderRadius: "999px"
                      }}
                    />
                  </div>

                  {/* Evidence summary */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", fontSize: "10.5px", color: "#94a3b8" }}>
                    <span>{s.verifiedEvidenceCount.projects} verified projects</span>
                    <span style={{ color: isGap ? "#fbbf24" : "#94a3b8" }}>{s.gapWord}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Skill Deep-Dive Studio */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* 1. Skill Hero Banner with Hiring ROI */}
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
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#60a5fa",
                      background: "rgba(59, 130, 246, 0.12)",
                      border: "1px solid rgba(59, 130, 246, 0.25)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      textTransform: "uppercase"
                    }}
                  >
                    {activeSkill.groupName} · {activeSkill.category}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: activeSkill.status === "gap" ? "#fbbf24" : "#34d399",
                      background: activeSkill.status === "gap" ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)",
                      padding: "2px 8px",
                      borderRadius: "6px"
                    }}
                  >
                    {activeSkill.status === "gap" ? "Gap: " + activeSkill.gapWord : "Mastered Status"}
                  </span>
                </div>

                <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", margin: "8px 0 4px" }}>
                  {activeSkill.name}
                </h2>

                <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
                  Current Level: <b style={{ color: "#ffffff" }}>{activeSkill.currentLevel}</b> | Target Role Bar: <b style={{ color: "#60a5fa" }}>{activeSkill.requiredLevel}</b> | Institutional Benchmark: <b>{activeSkill.benchmark}%</b>
                </p>
              </div>

              {/* Action Buttons in Hero */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleOpenQuiz}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 16px",
                    borderRadius: "12px",
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)"
                  }}
                >
                  <Zap style={{ width: "15px", height: "15px" }} />
                  <span>Take Topic Quiz (+{activeSkill.quiz.pointsGain} pts)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAiCoachOpen(true)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "9px 16px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#f8fafc",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  <MessageSquare style={{ width: "15px", height: "15px", color: "#a78bfa" }} />
                  <span>Ask AI Coach</span>
                </button>
              </div>
            </div>

            {/* Hiring ROI Callout Card */}
            <div
              style={{
                background: "linear-gradient(90deg, rgba(37, 99, 235, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "14px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "14px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(59, 130, 246, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#60a5fa",
                    flexShrink: 0
                  }}
                >
                  <TrendingUp style={{ width: "18px", height: "18px" }} />
                </div>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Hiring ROI & Opportunity Distance
                  </div>
                  <div style={{ fontSize: "13px", color: "#e2e8f0", marginTop: "2px" }}>
                    {activeSkill.hiringImpact.industryInsight}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "#34d399",
                    background: "rgba(16, 185, 129, 0.15)",
                    padding: "4px 10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(16, 185, 129, 0.3)"
                  }}
                >
                  {activeSkill.hiringImpact.matchScoreDelta}
                </span>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Unlocks: <b style={{ color: "#ffffff" }}>{activeSkill.hiringImpact.targetCompanies.join(", ")}</b>
                </span>
              </div>
            </div>

            {/* 5-Tab Navigation Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                paddingBottom: "10px",
                overflowX: "auto"
              }}
            >
              {[
                { id: "roadmap", label: "🗺️ Milestone Roadmap", count: `${activeSkill.roadmap.filter((m) => m.completed).length}/${activeSkill.roadmap.length}` },
                { id: "youtube", label: "📺 YouTube Lectures", count: activeSkill.youtubeLectures.length },
                { id: "courses", label: "🎓 Courses (Free & Paid)", count: activeSkill.courses.length },
                { id: "quiz", label: "⚡ Topic Quiz & Check", count: `${activeSkill.quiz.questions.length} Qs` },
                { id: "projects", label: "🛠️ Portfolio Projects", count: activeSkill.projects.length }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 14px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    background: activeTab === t.id ? "rgba(37, 99, 235, 0.2)" : "transparent",
                    color: activeTab === t.id ? "#60a5fa" : "#94a3b8",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>{t.label}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "1px 6px",
                      borderRadius: "999px",
                      background: activeTab === t.id ? "#2563eb" : "rgba(255,255,255,0.06)",
                      color: activeTab === t.id ? "#ffffff" : "#94a3b8"
                    }}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. TAB CONTENT AREA */}

          {/* TAB 1: MILESTONE ROADMAP */}
          {activeTab === "roadmap" && (
            <div
              style={{
                background: "#141519",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "20px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                    Step-by-Step Mastery Path: {activeSkill.name}
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "2px", margin: "2px 0 0" }}>
                    Complete each sequential milestone to elevate your proficiency score from {activeSkill.score}% to {activeSkill.benchmark + 10}%.
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "12px", color: "#60a5fa", fontWeight: 600 }}>
                    Total Estimated: {activeSkill.roadmap.reduce((a, c) => a + c.estimatedHours, 0)} Hours
                  </span>
                </div>
              </div>

              {/* Milestones Vertical Flow */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative" }}>
                {activeSkill.roadmap.map((m, idx) => (
                  <div
                    key={m.id}
                    style={{
                      background: m.completed ? "rgba(16, 185, 129, 0.04)" : "rgba(255, 255, 255, 0.02)",
                      border: m.completed ? "1px solid rgba(16, 185, 129, 0.25)" : "1px solid rgba(255, 255, 255, 0.07)",
                      borderRadius: "16px",
                      padding: "18px 20px",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "16px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                      <div
                        onClick={() => handleToggleMilestone(m.id)}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: m.completed ? "#10b981" : "rgba(255,255,255,0.08)",
                          border: m.completed ? "none" : "1px solid rgba(255,255,255,0.2)",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                          marginTop: "2px"
                        }}
                        title={m.completed ? "Mark incomplete" : "Mark milestone complete"}
                      >
                        {m.completed ? <Check style={{ width: "16px", height: "16px" }} /> : <span style={{ fontSize: "12px", fontWeight: 700 }}>{idx + 1}</span>}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: m.difficulty === "Beginner" ? "#34d399" : m.difficulty === "Intermediate" ? "#60a5fa" : "#c084fc",
                              background: "rgba(255,255,255,0.05)",
                              padding: "2px 8px",
                              borderRadius: "6px"
                            }}
                          >
                            {m.difficulty}
                          </span>
                          <span style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Clock style={{ width: "12px", height: "12px" }} /> ~{m.estimatedHours} hrs
                          </span>
                          {m.completed && (
                            <span style={{ fontSize: "11px", color: "#34d399", fontWeight: 700 }}>
                              ✓ Completed
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: "6px 0 4px" }}>
                          {m.title}
                        </h4>

                        <p style={{ fontSize: "12.5px", color: "#94a3b8", margin: "0 0 10px 0" }}>
                          {m.description}
                        </p>

                        {/* Topics Pill Cloud */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                          {m.topics.map((top) => (
                            <span
                              key={top}
                              style={{
                                fontSize: "11px",
                                color: "#cbd5e1",
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                padding: "3px 8px",
                                borderRadius: "6px"
                              }}
                            >
                              • {top}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleMilestone(m.id)}
                      style={{
                        padding: "7px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: m.completed ? "rgba(16, 185, 129, 0.15)" : "rgba(255,255,255,0.05)",
                        color: m.completed ? "#34d399" : "#e2e8f0",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {m.completed ? "Completed ✓" : "Mark as Done"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: YOUTUBE LECTURES & TOPIC VAULT */}
          {activeTab === "youtube" && (
            <div
              style={{
                background: "#141519",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "20px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                    Curated YouTube Deep Dives & Topic Lectures
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "2px", margin: "2px 0 0" }}>
                    Selected from elite instructors (freeCodeCamp, Hussein Nasser, TechWorld with Nana, NeetCode) without fluff.
                  </p>
                </div>
              </div>

              {/* Video Cards Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                {activeSkill.youtubeLectures.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.07)",
                      borderRadius: "16px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "14px"
                    }}
                  >
                    <div>
                      {/* Video Thumbnail Placeholder / Embed preview */}
                      <div
                        onClick={() => setActiveVideoModal(v)}
                        style={{
                          position: "relative",
                          width: "100%",
                          height: "160px",
                          borderRadius: "12px",
                          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                          overflow: "hidden",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid rgba(255,255,255,0.08)"
                        }}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                          alt={v.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }}
                          onError={(e) => {
                            // Fallback if image fails
                            (e.target as any).style.display = "none";
                          }}
                        />

                        {/* Play Button Overlay */}
                        <div
                          style={{
                            position: "absolute",
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: "rgba(37, 99, 235, 0.85)",
                            backdropFilter: "blur(4px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            boxShadow: "0 8px 20px rgba(0,0,0,0.5)"
                          }}
                        >
                          <Play style={{ width: "20px", height: "20px", marginLeft: "2px" }} />
                        </div>

                        {/* Duration badge */}
                        <span
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            background: "rgba(0,0,0,0.8)",
                            color: "#ffffff",
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "4px"
                          }}
                        >
                          {v.duration}
                        </span>

                        {v.recommendedBadge && (
                          <span
                            style={{
                              position: "absolute",
                              top: "10px",
                              left: "10px",
                              background: "#2563eb",
                              color: "#ffffff",
                              fontSize: "10.5px",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "4px"
                            }}
                          >
                            {v.recommendedBadge}
                          </span>
                        )}
                      </div>

                      <div style={{ marginTop: "12px" }}>
                        <div style={{ fontSize: "11px", color: "#60a5fa", fontWeight: 600 }}>
                          {v.channel} · <span style={{ color: "#94a3b8" }}>{v.views}</span>
                        </div>
                        <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#ffffff", margin: "4px 0 8px", lineHeight: 1.4 }}>
                          {v.title}
                        </h4>

                        {/* Covered topics */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {v.topicsCovered.map((t) => (
                            <span
                              key={t}
                              style={{
                                fontSize: "10.5px",
                                color: "#94a3b8",
                                background: "rgba(255,255,255,0.04)",
                                padding: "2px 6px",
                                borderRadius: "4px"
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveVideoModal(v)}
                      style={{
                        width: "100%",
                        padding: "9px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#f8fafc",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <Play style={{ width: "14px", height: "14px", color: "#60a5fa" }} />
                      <span>Watch in In-App Theater</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CURATED COURSES DIRECTORY */}
          {activeTab === "courses" && (
            <div
              style={{
                background: "#141519",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "20px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                    Certified Online Courses & University Syllabi
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "2px", margin: "2px 0 0" }}>
                    Verified pathways including free Govt. of India NPTEL/Swayam courses and industry certs.
                  </p>
                </div>

                {/* Free vs Paid Toggle */}
                <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", padding: "3px", borderRadius: "10px" }}>
                  {[
                    { id: "all", label: "All Offerings" },
                    { id: "free", label: "100% Free / Aid" },
                    { id: "paid", label: "Pro Certifications" }
                  ].map((cf) => (
                    <button
                      key={cf.id}
                      type="button"
                      onClick={() => setCourseFilter(cf.id as any)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "none",
                        background: courseFilter === cf.id ? "#2563eb" : "transparent",
                        color: courseFilter === cf.id ? "#ffffff" : "#94a3b8"
                      }}
                    >
                      {cf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Courses Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                {filteredCourses.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.07)",
                      borderRadius: "16px",
                      padding: "18px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "14px"
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: c.isFree ? "#34d399" : "#60a5fa",
                            background: c.isFree ? "rgba(16, 185, 129, 0.12)" : "rgba(59, 130, 246, 0.12)",
                            padding: "2px 8px",
                            borderRadius: "6px"
                          }}
                        >
                          {c.provider}
                        </span>

                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            color: c.isFree ? "#34d399" : "#fbbf24"
                          }}
                        >
                          {c.priceTag}
                        </span>
                      </div>

                      <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: "10px 0 6px", lineHeight: 1.4 }}>
                        {c.title}
                      </h4>

                      <div style={{ fontSize: "11.5px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "3px", color: "#fbbf24" }}>
                          <Star style={{ width: "13px", height: "13px", fill: "#fbbf24" }} />
                          {c.rating}
                        </span>
                        <span>{c.reviewsCount}</span>
                        <span>{c.durationWeeks} Weeks</span>
                      </div>

                      <div style={{ marginTop: "10px", fontSize: "11px", color: "#a78bfa", background: "rgba(167, 139, 250, 0.08)", padding: "4px 8px", borderRadius: "6px", display: "inline-block" }}>
                        Award: {c.certificateType}
                      </div>
                    </div>

                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        padding: "9px",
                        borderRadius: "10px",
                        background: "#2563eb",
                        color: "#ffffff",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        textDecoration: "none",
                        textAlign: "center"
                      }}
                    >
                      <span>Enroll / View Syllabus</span>
                      <ExternalLink style={{ width: "13px", height: "13px" }} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: INTERACTIVE TOPIC QUIZ */}
          {activeTab === "quiz" && (
            <div
              style={{
                background: "#141519",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "20px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                    Skill Assessment: {activeSkill.quiz.quizTitle}
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "2px", margin: "2px 0 0" }}>
                    Take this 4-question timed challenge to benchmark your real knowledge and earn verified Neo4j competency graph points.
                  </p>
                </div>

                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#34d399",
                    padding: "6px 14px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: 700
                  }}
                >
                  +{activeSkill.quiz.pointsGain} Verified Graph Points
                </div>
              </div>

              {/* Quiz Teaser Card */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)",
                  border: "1px solid rgba(59, 130, 246, 0.2)",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "20px"
                }}
              >
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                    Ready to prove mastery in {activeSkill.name}?
                  </div>
                  <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "4px" }}>
                    • {activeSkill.quiz.questions.length} Proctored Multiple Choice Questions
                    <br />
                    • Estimated completion time: {activeSkill.quiz.estimatedMinutes} minutes
                    <br />
                    • Instant rationale feedback and automatic SkillSetu ledger sync
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleOpenQuiz}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    borderRadius: "12px",
                    background: "#2563eb",
                    color: "#ffffff",
                    border: "none",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(37, 99, 235, 0.4)"
                  }}
                >
                  <Zap style={{ width: "16px", height: "16px" }} />
                  <span>Start Proctored Assessment Now</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: PORTFOLIO PROJECTS */}
          {activeTab === "projects" && (
            <div
              style={{
                background: "#141519",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "20px",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                    Industry-Grade Portfolio Projects & Starter Repos
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#94a3b8", marginTop: "2px", margin: "2px 0 0" }}>
                    Complete these real-world projects, submit your repository link, and our AI automated verifier will link proof to your Skill Passport.
                  </p>
                </div>
              </div>

              {/* Projects List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {activeSkill.projects.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid rgba(255, 255, 255, 0.07)",
                      borderRadius: "16px",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "14px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: p.level === "Production Capstone" ? "#c084fc" : "#60a5fa",
                              background: "rgba(255,255,255,0.05)",
                              padding: "2px 8px",
                              borderRadius: "6px"
                            }}
                          >
                            {p.level}
                          </span>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#34d399" }}>
                            {p.portfolioScoreGain}
                          </span>
                        </div>

                        <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: "6px 0 4px" }}>
                          {p.title}
                        </h4>

                        <p style={{ fontSize: "13px", color: "#94a3b8", margin: 0 }}>
                          {p.summary}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProjectForSubmit(p);
                          setIsSubmitProjectOpen(true);
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 16px",
                          borderRadius: "10px",
                          background: "#2563eb",
                          color: "#ffffff",
                          border: "none",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          cursor: "pointer"
                        }}
                      >
                        <UploadCloud style={{ width: "14px", height: "14px" }} />
                        <span>Submit Repo Evidence</span>
                      </button>
                    </div>

                    {/* Starter Repo Command */}
                    <div
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontFamily: "monospace",
                        fontSize: "12px",
                        color: "#93c5fd"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", textOverflow: "ellipsis" }}>
                        <FolderGit2 style={{ width: "15px", height: "15px", color: "#60a5fa", flexShrink: 0 }} />
                        <span>{p.starterRepoCmd}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCmd(p.starterRepoCmd, p.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: copiedRepoId === p.id ? "#34d399" : "#94a3b8",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px"
                        }}
                      >
                        {copiedRepoId === p.id ? <Check style={{ width: "14px", height: "14px" }} /> : <Copy style={{ width: "14px", height: "14px" }} />}
                        <span>{copiedRepoId === p.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Architecture Specs */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "4px" }}>
                      <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: "10px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase" }}>Architecture Highlights</div>
                        <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>
                          {p.architectureHighlights.map((a) => (
                            <li key={a}>{a}</li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: "10px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 700, color: "#34d399", textTransform: "uppercase" }}>Deliverables Checklist</div>
                        <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "12px", color: "#94a3b8", lineHeight: 1.5 }}>
                          {p.deliverables.map((d) => (
                            <li key={d}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* YOUTUBE EMBEDDED PLAYER MODAL */}
      {activeVideoModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
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
              maxWidth: "880px",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)"
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#60a5fa", fontWeight: 700, textTransform: "uppercase" }}>{activeVideoModal.channel}</span>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: "2px 0 0" }}>{activeVideoModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveVideoModal(null)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "6px" }}
              >
                <X style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            {/* Iframe */}
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.youtubeId}?autoplay=1`}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none"
                }}
              />
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#111216" }}>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                Duration: <b style={{ color: "#ffffff" }}>{activeVideoModal.duration}</b> · Topics: {activeVideoModal.topicsCovered.join(", ")}
              </div>
              <button
                type="button"
                onClick={() => {
                  showToast("Lecture progress saved! +1.5 hrs added to learning log.");
                  setActiveVideoModal(null);
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  background: "#10b981",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Mark as Watched (+1.5h Logged)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ RUNNER MODAL */}
      {isQuizModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
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
              maxWidth: "680px",
              padding: "24px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)"
            }}
          >
            {!isQuizCompleted ? (
              <div>
                {/* Quiz Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "14px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", textTransform: "uppercase" }}>
                      Proctored Assessment · {activeSkill.name}
                    </span>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: "4px 0 0" }}>
                      Question {currentQuestionIndex + 1} of {activeSkill.quiz.questions.length}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsQuizModalOpen(false)}
                    style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                  >
                    <X style={{ width: "20px", height: "20px" }} />
                  </button>
                </div>

                {/* Question Body */}
                <div style={{ marginTop: "20px" }}>
                  <p style={{ fontSize: "15px", fontWeight: 600, color: "#f8fafc", lineHeight: 1.5 }}>
                    {activeSkill.quiz.questions[currentQuestionIndex].question}
                  </p>

                  {/* Options */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "18px" }}>
                    {activeSkill.quiz.questions[currentQuestionIndex].options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === activeSkill.quiz.questions[currentQuestionIndex].correctIndex;
                      
                      let optBg = "rgba(255,255,255,0.03)";
                      let optBorder = "rgba(255,255,255,0.08)";
                      let optColor = "#e2e8f0";

                      if (isSelected) {
                        optBg = "rgba(37, 99, 235, 0.2)";
                        optBorder = "#3b82f6";
                        optColor = "#ffffff";
                      }
                      if (isAnswerSubmitted) {
                        if (isCorrect) {
                          optBg = "rgba(16, 185, 129, 0.2)";
                          optBorder = "#10b981";
                          optColor = "#34d399";
                        } else if (isSelected && !isCorrect) {
                          optBg = "rgba(239, 68, 68, 0.2)";
                          optBorder = "#ef4444";
                          optColor = "#fca5a5";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isAnswerSubmitted}
                          onClick={() => setSelectedOption(idx)}
                          style={{
                            background: optBg,
                            border: `1px solid ${optBorder}`,
                            color: optColor,
                            padding: "12px 16px",
                            borderRadius: "12px",
                            fontSize: "13.5px",
                            textAlign: "left",
                            cursor: isAnswerSubmitted ? "default" : "pointer",
                            transition: "all 0.15s ease"
                          }}
                        >
                          <span style={{ fontWeight: 700, marginRight: "8px" }}>
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation box after answer submission */}
                  {isAnswerSubmitted && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "14px",
                        borderRadius: "12px",
                        background: selectedOption === activeSkill.quiz.questions[currentQuestionIndex].correctIndex
                          ? "rgba(16, 185, 129, 0.1)"
                          : "rgba(239, 68, 68, 0.1)",
                        border: selectedOption === activeSkill.quiz.questions[currentQuestionIndex].correctIndex
                          ? "1px solid rgba(16, 185, 129, 0.3)"
                          : "1px solid rgba(239, 68, 68, 0.3)"
                      }}
                    >
                      <div style={{ fontSize: "12px", fontWeight: 700, color: selectedOption === activeSkill.quiz.questions[currentQuestionIndex].correctIndex ? "#34d399" : "#f87171" }}>
                        {selectedOption === activeSkill.quiz.questions[currentQuestionIndex].correctIndex ? "✓ Correct Answer!" : "✗ Incorrect"}
                      </div>
                      <p style={{ fontSize: "12.5px", color: "#cbd5e1", marginTop: "4px", margin: "4px 0 0", lineHeight: 1.4 }}>
                        {activeSkill.quiz.questions[currentQuestionIndex].explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                  {!isAnswerSubmitted ? (
                    <button
                      type="button"
                      disabled={selectedOption === null}
                      onClick={handleSubmitQuizAnswer}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "10px",
                        background: selectedOption === null ? "rgba(255,255,255,0.1)" : "#2563eb",
                        color: selectedOption === null ? "#64748b" : "#ffffff",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: selectedOption === null ? "not-allowed" : "pointer"
                      }}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "10px",
                        background: "#10b981",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      {currentQuestionIndex + 1 < activeSkill.quiz.questions.length ? "Next Question →" : "View Results →"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Summary Screen */
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    color: "#34d399",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px"
                  }}
                >
                  <Award style={{ width: "32px", height: "32px" }} />
                </div>

                <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", margin: 0 }}>
                  Assessment Completed!
                </h3>
                <p style={{ fontSize: "14px", color: "#94a3b8", marginTop: "6px" }}>
                  You answered <b style={{ color: "#ffffff" }}>{quizScore} of {activeSkill.quiz.questions.length}</b> questions correctly.
                </p>

                <div
                  style={{
                    background: "rgba(37, 99, 235, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: "14px",
                    padding: "16px",
                    margin: "20px auto",
                    maxWidth: "380px"
                  }}
                >
                  <div style={{ fontSize: "12px", color: "#60a5fa", fontWeight: 700, textTransform: "uppercase" }}>
                    Verified Score Increase
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#34d399", marginTop: "2px" }}>
                    +{activeSkill.quiz.pointsGain}% Competency Gain
                  </div>
                  <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                    New score for {activeSkill.name}: <b style={{ color: "#ffffff" }}>{activeSkill.score + activeSkill.quiz.pointsGain}%</b>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                  <button
                    type="button"
                    onClick={() => setIsQuizModalOpen(false)}
                    style={{
                      padding: "10px 18px",
                      borderRadius: "10px",
                      background: "rgba(255,255,255,0.06)",
                      color: "#e2e8f0",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyQuizScore}
                    style={{
                      padding: "10px 22px",
                      borderRadius: "10px",
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)"
                    }}
                  >
                    Sync Score to Neo4j Graph ✓
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI SKILL COACH MODAL */}
      {isAiCoachOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
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
              maxWidth: "600px",
              display: "flex",
              flexDirection: "column",
              height: "520px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)"
            }}
          >
            {/* Header */}
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(168, 85, 247, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c084fc" }}>
                  <Sparkles style={{ width: "16px", height: "16px" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                    AI Skill Coach · {activeSkill.name}
                  </h3>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                    RAG-indexed across top engineering rubrics
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAiCoachOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            {/* Chat message history */}
            <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
              {aiChatMessages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    background: m.sender === "user" ? "#2563eb" : "rgba(255,255,255,0.05)",
                    border: m.sender === "user" ? "none" : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    color: "#ffffff",
                    lineHeight: 1.4
                  }}
                >
                  {m.text}
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendAiMessage} style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder={`Ask a question about ${activeSkill.name}...`}
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  fontSize: "13px",
                  color: "#ffffff",
                  outline: "none"
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "0 18px",
                  borderRadius: "10px",
                  background: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT PROJECT REPO MODAL */}
      {isSubmitProjectOpen && selectedProjectForSubmit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
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
              maxWidth: "540px",
              padding: "24px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.8)"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Submit Evidence: {selectedProjectForSubmit.title}
              </h3>
              <button
                type="button"
                onClick={() => setIsSubmitProjectOpen(false)}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
              >
                <X style={{ width: "18px", height: "18px" }} />
              </button>
            </div>

            <form onSubmit={handleSubmitProjectEvidence} style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
              <p style={{ fontSize: "12.5px", color: "#94a3b8", margin: 0 }}>
                Provide your public GitHub repository URL containing the required deliverables. Our automated runner will index your commit history and link proof to your Skill Passport.
              </p>

              <div>
                <label style={{ display: "block", fontSize: "12px", color: "#cbd5e1", fontWeight: 600, marginBottom: "6px" }}>
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/username/my-project-repo"
                  value={submissionRepoUrl}
                  onChange={(e) => setSubmissionRepoUrl(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13px",
                    color: "#ffffff",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsSubmitProjectOpen(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.06)",
                    color: "#e2e8f0",
                    border: "none",
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
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
                  Verify & Link to Passport ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
