"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Network, Database, BrainCircuit, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-12 flex-1 w-full space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            System Design & Architecture
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-100">
            The SkillSetu Technical Architecture
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Why we chose a Hybrid Relational (PostgreSQL) + Graph Intelligence (Neo4j) design for the Smart India Hackathon.
          </p>
        </div>

        {/* 3 Pillar Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">1. PostgreSQL (Ground Truth)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Stores raw transactional records, users, encrypted credentials, institutions, and evidence logs with full ACID compliance and relational integrity.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Network className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">2. Neo4j (Relationship Intelligence)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintains the multi-hop competency ontology: connects projects, verified certificates, prerequisite skills, and role requisitions for instant graph traversal.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-base">3. Explainable AI Matchmaker</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Merges graph coverage with semantic vector similarity and generates clear human-readable explanations and 3-step gap remediation paths.
            </p>
          </div>
        </div>

        {/* SIH Problem vs Solution Table */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-slate-100">SIH Core Challenge: Closing the Academia-Industry Gap</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-2">
              <h4 className="font-bold text-rose-300">Traditional System Pain Points</h4>
              <ul className="space-y-1.5 text-slate-300">
                <li>• Unverified static PDF resumes with buzzword stuffing.</li>
                <li>• Colleges unaware of actual real-time industry skill shifts.</li>
                <li>• Black-box keyword ATS filters rejecting capable talent.</li>
                <li>• Students left with rejection emails and zero guidance on how to improve.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
              <h4 className="font-bold text-emerald-300">SkillSetu Solution</h4>
              <ul className="space-y-1.5 text-slate-300">
                <li>• Multi-hop Graph verification backed by faculty approval and code repositories.</li>
                <li>• Dean & Institutional Readiness Matrix highlighting acute syllabus deficits.</li>
                <li>• Explainable AI match scores showing exact strengths and missing competencies.</li>
                <li>• Dynamic curated learning paths leading straight to 100% role readiness.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
