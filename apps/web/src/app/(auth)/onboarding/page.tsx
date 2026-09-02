"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Network, Upload, FileText, Sparkles, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const handleSimulateExtraction = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
      setExtractedSkills([
        "Python (Advanced)",
        "FastAPI Backend Architecture",
        "React & Next.js Ecosystem",
        "Neo4j Graph Databases & Cypher",
        "Docker Containerization"
      ]);
      setStep(2);
    }, 1500);
  };

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
            Upload your resume or GitHub link to automatically generate your initial Neo4j graph nodes.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              {/* Drag & Drop Upload Zone */}
              <div 
                onClick={handleSimulateExtraction}
                className="border-2 border-dashed border-indigo-500/40 rounded-2xl p-8 text-center bg-indigo-950/10 hover:bg-indigo-950/20 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-200 mt-3">
                  Upload Resume / Academic Transcript
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  PDF, DOCX, or JSON. SkillSetu AI will parse core competencies and projects.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
                  <span>Click to test sample extraction</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {isExtracting && (
                <div className="p-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center gap-3 text-xs text-indigo-300">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  <span>SkillSetu LLM Gateway parsing entities and calculating semantic embeddings...</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  5 Competencies Extracted & Mapped to Graph
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Confidence: 94%</span>
              </div>

              <div className="space-y-2">
                {extractedSkills.map((skill, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-200">
                    <span className="font-semibold">{skill}</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Graph Node Ready
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push('/student/dashboard')}
                className="w-full py-3 rounded-xl font-bold text-xs text-white gradient-brand shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-1.5 mt-4"
              >
                <span>Launch My Competency Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
