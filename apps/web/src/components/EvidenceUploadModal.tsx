"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  X,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Hash,
  Layers,
  FileCheck,
  ArrowRight
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

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
  normalized_filename?: string;
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
  processing_status: string;
  verification_status: string;
  artifacts: ArtifactDTO[];
}

interface EvidenceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (evidence: UploadResponseDTO) => void;
}

export default function EvidenceUploadModal({ isOpen, onClose, onSuccess }: EvidenceUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [evidenceData, setEvidenceData] = useState<UploadResponseDTO | null>(null);

  if (!isOpen) return null;

  const handleUploadFile = async (file: File) => {
    setIsExtracting(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", `Academic Evidence: ${file.name}`);
      formData.append("evidence_type", "DOCUMENT");
      formData.append("evidence_strength", "STRONG");
      formData.append("domain_code", "GENERAL");

      const response = await apiClient.upload<UploadResponseDTO>("/evidence/upload", formData);
      setEvidenceData(response);
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Failed to process and extract document.");
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
    const file = new File([blob], "Academic_Transcript_Verified.pdf", { type: "application/pdf" });
    handleUploadFile(file);
  };

  const artifact = evidenceData?.artifacts?.[0];
  const extraction = artifact?.extractions?.[0];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#0f131f",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "20px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.8)",
          color: "#f1f5f9",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            background: "rgba(255, 255, 255, 0.02)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(99, 102, 241, 0.15)",
                color: "#818cf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Upload style={{ width: "18px", height: "18px" }} />
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "#f8fafc" }}>
                Upload & Ingest Evidence
              </h3>
              <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0, marginTop: "2px" }}>
                PyMuPDF & PlainText deterministic parsing with SHA-256 integrity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {!evidenceData ? (
            <>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".pdf,.txt,.json,.md"
                style={{ display: "none" }}
              />

              {/* Drag and Drop Zone */}
              <div
                onClick={() => !isExtracting && fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!isExtracting && e.dataTransfer.files?.[0]) {
                    handleUploadFile(e.dataTransfer.files[0]);
                  }
                }}
                style={{
                  border: "2px dashed rgba(99, 102, 241, 0.4)",
                  borderRadius: "16px",
                  padding: "32px 20px",
                  textAlign: "center",
                  background: isExtracting ? "rgba(49, 46, 129, 0.2)" : "rgba(49, 46, 129, 0.08)",
                  cursor: isExtracting ? "wait" : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: "rgba(99, 102, 241, 0.2)",
                    color: "#818cf8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  {isExtracting ? (
                    <Loader2 style={{ width: "24px", height: "24px", animation: "spin 1s linear infinite" }} />
                  ) : (
                    <Upload style={{ width: "24px", height: "24px" }} />
                  )}
                </div>

                <h4 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 6px", color: "#f1f5f9" }}>
                  Upload Resume, Certificate, or Transcript
                </h4>
                <p style={{ fontSize: "12px", color: "#94a3b8", margin: "0 0 12px", lineHeight: "1.4" }}>
                  PDF, TXT, JSON, or MD (Max 15MB). Automatic text extraction & SHA-256 fingerprinting.
                </p>

                {!isExtracting && (
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#818cf8", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    Select file from computer <ArrowRight style={{ width: "13px", height: "13px" }} />
                  </span>
                )}
              </div>

              {/* Sample PDF Trigger */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: "8px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <span style={{ fontSize: "12px", color: "#64748b" }}>Want to test with a verified sample?</span>
                <button
                  type="button"
                  disabled={isExtracting}
                  onClick={handleSamplePdfUpload}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#818cf8",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <FileText style={{ width: "14px", height: "14px" }} />
                  <span>Use Sample Academic PDF</span>
                </button>
              </div>

              {isExtracting && (
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "rgba(99, 102, 241, 0.1)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "12px",
                    color: "#a5b4fc",
                  }}
                >
                  <Loader2 style={{ width: "18px", height: "18px", animation: "spin 1s linear infinite", flexShrink: 0 }} />
                  <span>Validating magic signature, calculating SHA-256, and parsing text via PyMuPDF...</span>
                </div>
              )}

              {uploadError && (
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "rgba(244, 63, 94, 0.1)",
                    border: "1px solid rgba(244, 63, 94, 0.2)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    fontSize: "12px",
                    color: "#fda4af",
                  }}
                >
                  <AlertCircle style={{ width: "18px", height: "18px", color: "#f43f5e", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <strong style={{ display: "block", marginBottom: "2px" }}>Upload Failed</strong>
                    <span>{uploadError}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Success Banner */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: "12px",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#34d399", fontSize: "13px", fontWeight: 700 }}>
                  <CheckCircle2 style={{ width: "18px", height: "18px" }} />
                  <span>Evidence Ingested & Extracted</span>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    fontFamily: "monospace",
                    background: "rgba(16, 185, 129, 0.1)",
                    color: "#34d399",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                  }}
                >
                  Status: {extraction?.extraction_status || "COMPLETED"}
                </span>
              </div>

              {/* Artifact Metadata */}
              {artifact && (
                <div
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontWeight: 600 }}>
                    <span style={{ color: "#f1f5f9" }}>{artifact.original_filename}</span>
                    <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>
                      {(artifact.file_size / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "11px" }}>
                    <Hash style={{ width: "12px", height: "12px" }} />
                    <span style={{ fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      SHA-256: {artifact.sha256_checksum.slice(0, 16)}...{artifact.sha256_checksum.slice(-8)}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "4px", fontSize: "11px", color: "#94a3b8" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Layers style={{ width: "13px", height: "13px", color: "#818cf8" }} />
                      Extractor: <strong style={{ color: "#e2e8f0" }}>{extraction?.extractor_name || "PyMuPDF"}</strong>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <FileCheck style={{ width: "13px", height: "13px", color: "#34d399" }} />
                      Pages: <strong style={{ color: "#e2e8f0" }}>{extraction?.page_count ?? 1}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Extracted Text Content */}
              {extraction?.raw_text && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Extracted Text Content
                  </span>
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: "rgba(0, 0, 0, 0.4)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      fontSize: "11px",
                      color: "#cbd5e1",
                      fontFamily: "monospace",
                      maxHeight: "120px",
                      overflowY: "auto",
                      whiteSpace: "pre-wrap",
                      lineHeight: "1.5",
                    }}
                  >
                    {extraction.raw_text.trim()}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px", paddingTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setEvidenceData(null)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#cbd5e1",
                    cursor: "pointer",
                  }}
                >
                  Upload Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                    border: "none",
                    color: "#ffffff",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                  }}
                >
                  Done & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
