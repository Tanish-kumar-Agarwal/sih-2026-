"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { User, Github, Linkedin, Globe, CheckCircle2, Upload, Sparkles, Loader2, Award } from 'lucide-react';

export default function StudentProfilePage() {
  const [extracting, setExtracting] = useState(false);
  const [extractedSuccess, setExtractedSuccess] = useState(false);

  const handleSimulateResumeAI = () => {
    setExtracting(true);
    setTimeout(() => {
      setExtracting(false);
      setExtractedSuccess(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="student" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Candidate Profile & Evidence Vault
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified technical portfolio backing your dynamic Neo4j graph nodes.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Personal Bio & Institutional Badge */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 rounded-2xl gradient-brand flex items-center justify-center font-black text-2xl text-white mx-auto shadow-xl shadow-indigo-500/20">
                  AS
                </div>
                <h2 className="text-lg font-bold text-slate-100">Aarav Sharma</h2>
                <p className="text-xs text-indigo-400 font-semibold">Indian Institute of Technology, Delhi</p>
                <p className="text-xs text-slate-400">B.Tech Computer Science (2023 - 2027) • CGPA: 8.92</p>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2 text-xs">
                <a href="https://github.com/aarav-sharma" target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
                  <Github className="w-4 h-4 text-slate-400" />
                  <span>github.com/aarav-sharma</span>
                </a>
                <a href="https://linkedin.com/in/aaravsharma" target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
                  <Linkedin className="w-4 h-4 text-slate-400" />
                  <span>linkedin.com/in/aaravsharma</span>
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Institutional Identity Verified via AISHE Code: U-0109</span>
              </div>
            </div>

            {/* Right Column: AI Resume Parser & Projects Vault */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* AI Auto-Extraction Card */}
              <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-sm font-bold text-slate-100">AI Entity Extraction & Graph Synchronizer</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                    LLM Gateway Active
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Upload an updated PDF resume or paste project repositories. The AI extractor parses new competencies, creates Neo4j nodes, and synchronizes with the matching engine.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleSimulateResumeAI}
                    className="px-4 py-2 text-xs font-semibold text-white gradient-brand rounded-xl shadow-md hover:opacity-95 transition-opacity flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{extracting ? "Running AI Parsing Pipeline..." : "Upload & Sync New Resume"}</span>
                  </button>
                  {extracting && <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />}
                </div>

                {extractedSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Extracted 5 competencies and synchronized graph relationships with Neo4j.</span>
                  </div>
                )}
              </div>

              {/* Verified Project Repositories */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-slate-100">Verified Project Evidence</h3>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-100">SkillSetu AI Graph Matcher</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Faculty Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Hybrid Neo4j + PostgreSQL architecture for real-time competency-to-opportunity matchmaking.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["Python", "FastAPI", "Neo4j", "React"].map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
