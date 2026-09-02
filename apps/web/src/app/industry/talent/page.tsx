"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Users, Search, CheckCircle2, Sparkles, Filter, ExternalLink, ArrowRight } from 'lucide-react';

export default function IndustryTalentPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const candidates = [
    {
      id: "stu-aarav-sharma",
      name: "Aarav Sharma",
      institution: "IIT Delhi",
      department: "Computer Science",
      graduation_year: 2027,
      readiness_score: 89.4,
      verified_competencies: ["Python (Adv)", "FastAPI (Int)", "React (Adv)", "Docker (Int)"],
      featured_project: "SkillSetu AI Graph Engine",
      match_score_for_active_req: 92.5,
      verification_status: "FACULTY_VERIFIED"
    },
    {
      id: "stu-ananya-verma",
      name: "Ananya Verma",
      institution: "IIT Bombay",
      department: "Artificial Intelligence",
      graduation_year: 2026,
      readiness_score: 93.1,
      verified_competencies: ["PyTorch (Adv)", "Graph Neural Nets (Int)", "Python (Adv)", "LLMOps (Int)"],
      featured_project: "GraphRAG Medical Diagnoser",
      match_score_for_active_req: 96.0,
      verification_status: "FACULTY_VERIFIED"
    },
    {
      id: "stu-rohit-gupta",
      name: "Rohit Gupta",
      institution: "BITS Pilani",
      department: "Information Systems",
      graduation_year: 2027,
      readiness_score: 84.0,
      verified_competencies: ["Go (Int)", "PostgreSQL (Adv)", "Redis (Adv)", "Kubernetes (Int)"],
      featured_project: "High-Throughput Financial Orderbook",
      match_score_for_active_req: 81.2,
      verification_status: "FACULTY_VERIFIED"
    }
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="industry" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Verified Candidate Knowledge Graph Search
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Filter by verified code repositories, lab validations, and multi-hop graph match percentages.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by competency (e.g. Neo4j, PyTorch, FastAPI) or institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-4">
            {candidates.map((c) => (
              <div key={c.id} className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{c.name}</span>
                    <span className="text-xs text-indigo-300 font-medium">({c.institution} • Class of {c.graduation_year})</span>
                    <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {c.verification_status}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-300 mt-2">
                    <strong className="text-slate-400">Featured Project: </strong>
                    {c.featured_project}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.verified_competencies.map((comp, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-400">{c.match_score_for_active_req}%</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Graph Match</span>
                  </div>

                  <button className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-500/20">
                    Schedule Interview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
