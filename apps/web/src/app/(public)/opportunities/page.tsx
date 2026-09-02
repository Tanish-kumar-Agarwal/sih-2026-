"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { Briefcase, Search, Filter, Sparkles, MapPin, Building, ArrowRight } from 'lucide-react';

export default function PublicOpportunitiesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const sampleOpportunities = [
    {
      id: "opp-1",
      title: "Full Stack AI Platform Engineer",
      company: "NextGen AI Labs",
      type: "INTERNSHIP",
      location: "Bengaluru (Hybrid)",
      stipend: "₹45,000 / mo",
      skills: ["FastAPI", "React", "Neo4j", "Docker"]
    },
    {
      id: "opp-2",
      title: "Knowledge Graph & LLM Research Intern",
      company: "Cognitive Cloud",
      type: "INTERNSHIP",
      location: "Remote",
      stipend: "₹55,000 / mo",
      skills: ["Python", "Neo4j", "Applied ML", "RAG"]
    },
    {
      id: "opp-3",
      title: "DevOps & Cloud Security Specialist",
      company: "CyberDefense Networks",
      type: "FULL_TIME",
      location: "Hyderabad (Onsite)",
      stipend: "₹14 LPA",
      skills: ["Docker", "Kubernetes", "Linux", "Python"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full space-y-8">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-100">
            Industry Opportunities Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Discover active industry requisitions matched by verified competency blueprints.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role title, company, or competency (e.g. FastAPI, Neo4j)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <Link
            href="/student/opportunities"
            className="px-4 py-2.5 text-xs font-semibold text-white gradient-brand rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run AI Graph Matcher</span>
          </Link>
        </div>

        {/* Opportunities List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sampleOpportunities.map((opp) => (
            <div key={opp.id} className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">{opp.company}</span>
                  <span className="px-2 py-0.5 text-[10px] rounded bg-white/5 text-slate-300 border border-white/10">{opp.type}</span>
                </div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mt-1.5">
                  {opp.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                  <span>📍 {opp.location}</span>
                  <span>💰 {opp.stipend}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {opp.skills.map((skill, i) => (
                    <span key={i} className="px-2 py-0.5 text-[10px] rounded-md bg-white/5 text-slate-300 border border-white/5">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between">
                <Link
                  href="/student/opportunities"
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>View Graph Match</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
