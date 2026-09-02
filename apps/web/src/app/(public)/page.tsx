"use client";

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import GraphVisualizer from '@/components/GraphVisualizer';
import { 
  Network, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Layers, 
  TrendingUp, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  Cpu, 
  Database,
  BarChart3
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      {/* Hero Section with Ambient Glow */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden bg-grid-pattern">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Smart India Hackathon 2026 Innovation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Dynamic <span className="gradient-text">Competency Graph</span> & AI Industry-Academia Bridge
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminating skill mismatches and static resumes. SkillSetu connects students, institutions, and employers through verified knowledge graph walks, explainable AI matchmaking, and actionable curriculum readiness intelligence.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/student/dashboard"
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-white gradient-brand shadow-xl shadow-indigo-500/25 hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>Explore Student Graph Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/industry/dashboard"
              className="px-6 py-3.5 rounded-xl font-bold text-sm text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Recruiter Talent Discovery</span>
            </Link>
          </div>

          {/* Quick Stats Banner */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <div className="text-2xl sm:text-3xl font-black text-indigo-400">92.4%</div>
              <div className="text-xs text-slate-400 mt-1">Match Precision</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">5.8k+</div>
              <div className="text-xs text-slate-400 mt-1">Verified Credentials</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <div className="text-2xl sm:text-3xl font-black text-purple-400">3-Hop</div>
              <div className="text-xs text-slate-400 mt-1">Graph Traversal Depth</div>
            </div>
            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <div className="text-2xl sm:text-3xl font-black text-pink-400">100%</div>
              <div className="text-xs text-slate-400 mt-1">Explainable AI (XAI)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Graph Visualizer Interactive Showcase */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">
            <Network className="w-4 h-4" />
            <span>Relationship Intelligence Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-100">
            PostgreSQL as Ground Truth. Neo4j for Graph Intelligence.
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Explore how student project evidence, assessments, and verified skills traverse directly into high-fit industry opportunities.
          </p>
        </div>

        <GraphVisualizer />
      </section>

      {/* 5 Multi-Stakeholder Portals Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-100">
            Unified Ecosystem for Every Stakeholder
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Seamlessly integrating all four pillars of technical education and hiring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Student */}
          <Link href="/student/dashboard" className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-indigo-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-4 group-hover:text-indigo-300 transition-colors">
              Student Portal
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Build an authentic competency graph, get AI opportunity recommendations, and receive automated personalized remediation roadmaps.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-400">
              <span>Open Student Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Industry */}
          <Link href="/industry/dashboard" className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-4 group-hover:text-emerald-300 transition-colors">
              Industry Recruiter Hub
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Create competency blueprints, search candidates by verified project evidence, and view deep graph match explanations.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <span>Launch Recruiter Suite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Institution */}
          <Link href="/institution/dashboard" className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-4 group-hover:text-purple-300 transition-colors">
              Institution / Dean Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Monitor cohort readiness indices, spot real-time industry skill deficits, and dynamically align syllabus outcomes.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-400">
              <span>View Readiness Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Faculty */}
          <Link href="/faculty/dashboard" className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-4 group-hover:text-amber-300 transition-colors">
              Faculty Mentor Portal
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Authenticate student project submissions, certify laboratory benchmarks, and engage in industry-sponsored R&D projects.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400">
              <span>Open Mentorship Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Super Admin */}
          <Link href="/admin/dashboard" className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-rose-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-4 group-hover:text-rose-300 transition-colors">
              System & Ontology Admin
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Maintain global taxonomy, monitor Neo4j cluster health, and supervise enterprise compliance logs.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-rose-400">
              <span>Access Command Center</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* SIH 26 Innovation Box */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-[#0C101D] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>AI + Graph Advantage</span>
              </div>
              <h3 className="text-lg font-bold text-slate-100 mt-3">
                Zero Black-Box Decisions
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Unlike traditional ATS keyword counters, SkillSetu evaluates verified evidence graphs and returns human-interpretable reasoning for every candidate.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-indigo-400 font-mono">
              <span>FastAPI + Neo4j + Next.js</span>
              <span className="text-emerald-400">● LIVE MVP</span>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">SkillSetu</span>
            <span>— Smart India Hackathon (SIH 2026)</span>
          </div>
          <div className="text-slate-400">
            Built with Next.js 14, FastAPI, PostgreSQL & Neo4j Graph Intelligence.
          </div>
        </div>
      </footer>
    </div>
  );
}
