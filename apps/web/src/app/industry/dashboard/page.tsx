"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { Briefcase, Users, Layers, TrendingUp, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function IndustryDashboard() {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="industry" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Industry Partner Portal
              </span>
              <h1 className="text-2xl font-black text-slate-100 mt-1">
                Recruiter Talent & Blueprint Command
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                NextGen AI Labs • Active Requisitions: 3 • Verified Applicants: 48
              </p>
            </div>

            <Link
              href="/industry/talent"
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Search Verified Candidate Pool</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Total Graph Matches</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">84 Candidates</div>
              <p className="text-[11px] text-slate-400 mt-1">Over 80% Fit</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Active Requisitions</span>
              <div className="text-2xl font-black text-indigo-400 mt-1">3 Postings</div>
              <p className="text-[11px] text-indigo-300 mt-1">AI Engineering & DevOps</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Interviews Scheduled</span>
              <div className="text-2xl font-black text-purple-400 mt-1">12 Upcoming</div>
              <p className="text-[11px] text-purple-300 mt-1">Graph-Verified Finalists</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Offers Extended</span>
              <div className="text-2xl font-black text-pink-400 mt-1">4 Offers</div>
              <p className="text-[11px] text-emerald-400 mt-1">100% Acceptance Rate</p>
            </div>
          </div>

          {/* Top Matched Candidates Highlight */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                AI Top-Matched Verified Candidates
              </h3>
              <Link href="/industry/talent" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                <span>View candidate search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { name: "Aarav Sharma", inst: "IIT Delhi", role: "Full Stack AI Platform Engineer", fit: 92.5, skills: ["FastAPI", "React", "Neo4j", "Python"] },
                { name: "Ananya Verma", inst: "IIT Bombay", role: "Knowledge Graph Research Intern", fit: 96.0, skills: ["PyTorch", "Graph Neural Networks", "Python"] },
                { name: "Rohit Gupta", inst: "BITS Pilani", role: "DevOps & Cloud Security Specialist", fit: 81.2, skills: ["Docker", "Kubernetes", "Redis", "Go"] }
              ].map((c, i) => (
                <div key={i} className="flex flex-wrap items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-100">{c.name}</span>
                      <span className="text-[11px] text-indigo-300 font-medium">({c.inst})</span>
                      <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Faculty Verified
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Target Match: {c.role}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.skills.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-base font-black text-emerald-400">{c.fit}%</span>
                      <span className="text-[10px] text-slate-400 block font-mono">Graph Match</span>
                    </div>

                    <Link
                      href="/industry/talent"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
                    >
                      Inspect Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
