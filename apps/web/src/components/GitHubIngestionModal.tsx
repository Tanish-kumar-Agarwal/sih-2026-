"use client";

import React, { useState } from "react";
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Code2,
  Layers,
  Terminal,
  X,
  ArrowRight,
  GitFork,
  PackageCheck,
  Check
} from "lucide-react";
import { apiClient, getActiveDevPersonaId } from "@/lib/apiClient";

interface LanguageDTO {
  language: string;
  byte_count: number;
  percentage: number;
}

interface DependencyDTO {
  ecosystem: string;
  package_name: string;
  declared_version?: string;
  manifest_path: string;
}

interface ContributorDTO {
  username?: string;
  commit_count: number;
  student_matched: boolean;
  match_confidence: string;
}

interface CommitDTO {
  sha: string;
  author_name: string;
  author_email: string;
  commit_date: string;
  message: string;
  additions: number;
  deletions: number;
  student_matched: boolean;
  match_confidence: string;
}

interface CodeAreaDTO {
  area_name: string;
  file_count: number;
  percentage: number;
}

interface SimilarityDTO {
  source_type: string;
  parent_repo_url?: string;
  divergence_level: string;
  ahead_by_commits: number;
  behind_by_commits: number;
  notes?: string;
}

interface RepositoryDTO {
  id: string;
  owner: string;
  name: string;
  full_name: string;
  canonical_url: string;
  default_branch: string;
  is_fork: boolean;
  parent_full_name?: string;
  parent_url?: string;
  stars_count: number;
  forks_count: number;
  open_issues_count: number;
  license_spdx?: string;
  topics: string[];
}

interface SnapshotDTO {
  id: string;
  repository_id: string;
  evidence_id: string;
  student_id: string;
  snapshot_timestamp: string;
  branch: string;
  head_commit_sha?: string;
  commit_count: number;
  student_commit_count: number;
  student_lines_added: number;
  student_lines_deleted: number;
  pr_count: number;
  student_pr_count: number;
  primary_language?: string;
  languages: LanguageDTO[];
  dependencies: DependencyDTO[];
  contributors: ContributorDTO[];
  recent_commits: CommitDTO[];
  code_areas: CodeAreaDTO[];
  similarity?: SimilarityDTO;
  summary?: string;
}

interface GitHubAnalysisResponseDTO {
  evidence_id: string;
  repository: RepositoryDTO;
  snapshot: SnapshotDTO;
  claims_count: number;
  processing_status: string;
  verification_status: string;
  message: string;
}

interface GitHubIngestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (response: GitHubAnalysisResponseDTO) => void;
}

const LANGUAGE_COLORS: Record<string, string> = {
  Python: "bg-blue-500",
  TypeScript: "bg-indigo-500",
  JavaScript: "bg-amber-400",
  HTML: "bg-orange-500",
  CSS: "bg-sky-400",
  Rust: "bg-red-500",
  Go: "bg-cyan-500",
  Java: "bg-rose-500",
  C: "bg-slate-400",
  "C++": "bg-pink-500",
  Shell: "bg-emerald-500",
};

export default function GitHubIngestionModal({
  isOpen,
  onClose,
  onSuccess,
}: GitHubIngestionModalProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<GitHubAnalysisResponseDTO | null>(null);

  if (!isOpen) return null;

  const handleSampleRepo = () => {
    setRepoUrl("https://github.com/octocat/Hello-World");
    setBranch("master");
    setErrorMsg(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setIsAnalyzing(true);
    setErrorMsg(null);
    setResult(null);
    setCurrentStep(1);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 600);

    try {
      const studentId = getActiveDevPersonaId();
      const response = await apiClient.post<GitHubAnalysisResponseDTO>("/github/analyze", {
        repo_url: repoUrl.trim(),
        branch: branch.trim() || undefined,
        student_id: studentId,
      });

      clearInterval(stepInterval);
      setCurrentStep(5);
      setResult(response);
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setErrorMsg(err.message || "Failed to analyze GitHub repository. Please verify the URL.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative border-b border-slate-800/80 px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
                  GitHub Repository Intelligence
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-normal border border-violet-500/30">
                    Phase 3 · Step 3
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Auditable git forensics: code areas, dependencies, attribution, & lineage.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isAnalyzing}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-rose-400" />
              <div>
                <p className="font-medium text-rose-200">Ingestion Error</p>
                <p className="mt-0.5 text-xs text-rose-300/90">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Ingestion Form */}
          {!result && (
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Public GitHub Repository URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/owner/repository"
                    disabled={isAnalyzing}
                    required
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                  />
                  <div className="absolute right-3 top-3 text-xs text-slate-500">
                    SSRF Protected
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Branch (Optional)
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="main or default"
                    disabled={isAnalyzing}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSampleRepo}
                    disabled={isAnalyzing}
                    className="w-full py-2 px-3 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Fill Public Sample Repo
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isAnalyzing || !repoUrl.trim()}
                  className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing Repository Intelligence...
                    </>
                  ) : (
                    <>
                      <Terminal className="w-4 h-4" />
                      Analyze & Ingest Repository
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Stepper Progress View */}
          {isAnalyzing && (
            <div className="p-5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Forensic Pipeline Execution
              </p>
              {[
                "1. Validating URL syntax & verifying SSRF boundary guards",
                "2. Querying GitHub API metadata, stars, forks, & licenses",
                "3. Ingesting language distributions & package manifests",
                "4. Performing deterministic author identity attribution",
                "5. Generating digital contribution claims & persistent snapshot",
              ].map((step, idx) => {
                const stepNum = idx + 1;
                const isDone = currentStep > stepNum;
                const isCurrent = currentStep === stepNum;
                return (
                  <div key={idx} className="flex items-center gap-2.5 text-xs">
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                        {stepNum}
                      </div>
                    )}
                    <span
                      className={
                        isDone
                          ? "text-slate-300"
                          : isCurrent
                          ? "text-violet-300 font-medium"
                          : "text-slate-600"
                      }
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Analysis Results View */}
          {result && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Top Summary Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-slate-950 border border-violet-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-base">
                      {result.repository.full_name}
                    </span>
                    <a
                      href={result.repository.canonical_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white inline-flex items-center"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Branch: <code className="text-violet-300">{result.snapshot.branch}</code> · SHA:{" "}
                    <code className="text-slate-300">{result.snapshot.head_commit_sha?.slice(0, 7) || "HEAD"}</code>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Ingested: {result.processing_status}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Verification: {result.verification_status}
                  </span>
                </div>
              </div>

              {/* Languages Bar */}
              {result.snapshot.languages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-slate-300">Language Distribution</span>
                    <span>Primary: {result.snapshot.primary_language || "N/A"}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex">
                    {result.snapshot.languages.map((l, i) => (
                      <div
                        key={i}
                        style={{ width: `${l.percentage}%` }}
                        className={`h-full ${LANGUAGE_COLORS[l.language] || "bg-slate-600"}`}
                        title={`${l.language}: ${l.percentage}%`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-xs text-slate-400">
                    {result.snapshot.languages.slice(0, 5).map((l, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            LANGUAGE_COLORS[l.language] || "bg-slate-600"
                          }`}
                        />
                        <span>{l.language}</span>
                        <span className="text-slate-500 font-mono">{l.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grid: Attribution & Divergence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Attribution Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
                      Attributed Commits
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                      {result.snapshot.student_commit_count} / {result.snapshot.commit_count}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Lines changed:{" "}
                    <span className="text-emerald-400 font-mono">
                      +{result.snapshot.student_lines_added}
                    </span>{" "}
                    /{" "}
                    <span className="text-rose-400 font-mono">
                      -{result.snapshot.student_lines_deleted}
                    </span>
                  </p>
                </div>

                {/* Lineage Card */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-1.5">
                      <GitFork className="w-3.5 h-3.5 text-amber-400" />
                      Lineage & Divergence
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                      {result.snapshot.similarity?.divergence_level || "ROOT"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">
                    {result.snapshot.similarity?.notes || "Original root repository (no upstream fork)."}
                  </p>
                </div>
              </div>

              {/* Code Areas */}
              {result.snapshot.code_areas.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-300">Architectural Code Areas</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {result.snapshot.code_areas.map((ca, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs flex items-center justify-between"
                      >
                        <span className="capitalize text-slate-300 font-mono">{ca.area_name}</span>
                        <span className="text-slate-500">{ca.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dependencies Ecosystem */}
              {result.snapshot.dependencies.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">Package Dependencies</span>
                    <span className="text-slate-500 font-mono">
                      {result.snapshot.dependencies.length} packages discovered
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-950/50 rounded-lg border border-slate-800/60">
                    {result.snapshot.dependencies.slice(0, 15).map((dep, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-800/70 border border-slate-700/60 text-[11px] text-slate-300 font-mono"
                      >
                        {dep.ecosystem}: <span className="text-violet-300">{dep.package_name}</span>
                        {dep.declared_version && (
                          <span className="text-slate-500 ml-1">{dep.declared_version}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setRepoUrl("");
                    setBranch("");
                  }}
                  className="py-2 px-4 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Analyze Another Repository
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-5 bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Done & View In Competency Center
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
