"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Hash,
  Layers,
  FileCheck,
  Code2
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import GitHubIngestionModal from '@/components/GitHubIngestionModal';

interface ExtractionDTO {
  id: string;
  extractor_name: string;
  extractor_version?: string;
  extraction_status: string;
  page_count: number;
  raw_text?: string;
  observed_facts: Record<string, any>;
  extracted_metadata: Record<string, any>;
  error_message?: string;
}

interface ArtifactDTO {
  id: string;
  original_filename: string;
  file_size: number;
  sha256_checksum: string;
  mime_type: string;
  extractions: ExtractionDTO[];
}

interface UploadResponseDTO {
  id: string;
  title: string;
  evidence_type: string;
  evidence_strength: string;
  artifacts: ArtifactDTO[];
  verification_history?: any[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [evidenceData, setEvidenceData] = useState<UploadResponseDTO | null>(null);
  const [step, setStep] = useState(1);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  const handleUploadFile = async (file: File) => {
    setIsExtracting(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", `Academic Onboarding: ${file.name}`);
      formData.append("evidence_type", "DOCUMENT");
      formData.append("evidence_strength", "STRONG");
      formData.append("domain_code", "GENERAL");

      const response = await apiClient.upload<UploadResponseDTO>("/evidence/upload", formData);
      setEvidenceData(response);
      setStep(2);
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to process and extract evidence document.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
  };

  const handleSamplePdfUpload = () => {
    // Construct a deterministic minimal valid PDF in memory
    const samplePdfContent =
      "%PDF-1.4\n" +
      "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n" +
      "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n" +
      "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n" +
      "4 0 obj << /Length 124 >> stream\n" +
      "BT\n" +
      "/F1 14 Tf\n" +
      "50 720 Td\n" +
      "(Aarav Sharma - Academic Transcript - Python, FastAPI, Neo4j, Distributed Systems, Docker) Tj\n" +
      "ET\n" +
      "endstream\n" +
      "endobj\n" +
      "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n" +
      "xref\n" +
      "0 6\n" +
      "0000000000 65535 f \n" +
      "0000000010 00000 n \n" +
      "0000000060 00000 n \n" +
      "0000000117 00000 n \n" +
      "0000000244 00000 n \n" +
      "0000000418 00000 n \n" +
      "trailer << /Size 6 /Root 1 0 R >>\n" +
      "startxref\n" +
      "488\n" +
      "%%EOF\n";

    const blob = new Blob([samplePdfContent], { type: "application/pdf" });
    const file = new File([blob], "Aarav_Sharma_Academic_Transcript.pdf", { type: "application/pdf" });
    handleUploadFile(file);
  };

  const artifact = evidenceData?.artifacts?.[0];
  const extraction = artifact?.extractions?.[0];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col justify-center items-center px-4 py-12 bg-grid-pattern relative">
      <div className="w-full max-w-xl space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Competency Graph Bootstrapper</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Initialize Your Verified Profile</h2>
          <p className="text-xs text-slate-400">
            Upload your resume, transcript, or project documentation to extract factual competencies into your digital profile.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".pdf,.txt,.json,.md"
                className="hidden"
              />

              {/* Upload Zone */}
              <div
                onClick={() => !isExtracting && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!isExtracting && e.dataTransfer.files?.[0]) {
                    handleUploadFile(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${
                  isExtracting
                    ? "border-indigo-500/30 bg-indigo-950/20 cursor-wait"
                    : "border-indigo-500/40 bg-indigo-950/10 hover:bg-indigo-950/25"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  {isExtracting ? (
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-200 mt-3">
                  Upload Resume / Academic Transcript
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Supported formats: PDF, TXT, JSON, MD (Max 15MB). Automatic PyMuPDF parsing with SHA-256 fingerprinting.
                </p>

                {!isExtracting && (
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                    <span>Select file from computer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Quick Sample Button */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[11px] text-slate-400">Want to test with a validated sample?</span>
                <button
                  type="button"
                  disabled={isExtracting}
                  onClick={handleSamplePdfUpload}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Use Sample Academic PDF</span>
                </button>
              </div>

              {/* GitHub Alternative Card */}
              <div className="pt-2">
                <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      <Code2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200">Have Public Code on GitHub?</h5>
                      <p className="text-[11px] text-slate-400">Extract digital contribution evidence, languages, & dependencies directly.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGitHubModalOpen(true)}
                    id="onboarding-github-btn"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 transition-colors shrink-0 flex items-center gap-1 shadow"
                  >
                    <span>Analyze Repo</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {isExtracting && (
                <div className="p-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center gap-3 text-xs text-indigo-300">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400 shrink-0" />
                  <span>
                    Validating magic signature, calculating SHA-256 checksum, and extracting text via PyMuPDF...
                  </span>
                </div>
              )}

              {uploadError && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Extraction Failed</span>
                    <span>{uploadError}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Evidence Ingested & Extracted
                </h4>
                <span className="text-[10px] text-slate-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-emerald-400">
                  Status: {extraction?.extraction_status || "EXTRACTED"}
                </span>
              </div>

              {/* Artifact Metadata Card */}
              {artifact && (
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span className="truncate max-w-[280px]">{artifact.original_filename}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {(artifact.file_size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Hash className="w-3 h-3 text-slate-500" />
                    <span className="font-mono text-[10px] truncate" title={artifact.sha256_checksum}>
                      SHA-256: {artifact.sha256_checksum.slice(0, 16)}...{artifact.sha256_checksum.slice(-8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3 text-indigo-400" />
                      Extractor: <strong className="text-slate-300">{extraction?.extractor_name || "PyMuPDF"}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <FileCheck className="w-3 h-3 text-emerald-400" />
                      Pages: <strong className="text-slate-300">{extraction?.page_count ?? 1}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Extracted Text Preview */}
              {extraction?.raw_text && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Extracted Text Content
                  </span>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-[11px] text-slate-300 font-mono max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {extraction.raw_text.trim()}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setEvidenceData(null);
                  }}
                  className="w-1/3 py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-white/5 hover:bg-white/10 transition-all text-center"
                >
                  Upload Another
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/student/competency')}
                  className="w-2/3 py-2.5 rounded-xl font-bold text-xs text-white gradient-brand shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Go to Competencies</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <GitHubIngestionModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onSuccess={() => {
          router.push('/student/competency');
        }}
      />
    </div>
  );
}
