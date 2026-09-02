"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { Briefcase, Plus, Users, Sparkles } from 'lucide-react';

export default function IndustryOpportunitiesPage() {
  const opps = [
    {
      id: "opp-1",
      title: "Full Stack AI Platform Engineer",
      type: "INTERNSHIP",
      stipend: "₹45,000 / mo",
      applicants: 18,
      topFit: 92.5,
      status: "ACTIVE"
    },
    {
      id: "opp-2",
      title: "Knowledge Graph & LLM Research Intern",
      type: "INTERNSHIP",
      stipend: "₹55,000 / mo",
      applicants: 24,
      topFit: 96.0,
      status: "ACTIVE"
    },
    {
      id: "opp-3",
      title: "DevOps & Cloud Security Specialist",
      type: "FULL_TIME",
      stipend: "₹14 LPA",
      applicants: 9,
      topFit: 81.2,
      status: "ACTIVE"
    }
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="industry" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-100">
                Active Requisitions & Role Postings
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage live opportunities and review graph-matched candidate pipelines.
              </p>
            </div>

            <Link
              href="/industry/blueprints"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Requisition Blueprint</span>
            </Link>
          </div>

          <div className="space-y-4">
            {opps.map((o) => (
              <div key={o.id} className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">{o.status}</span>
                    <span className="text-xs text-slate-400">{o.type} • {o.stipend}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1">{o.title}</h3>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Verified Applicants</span>
                    <span className="text-sm font-black text-slate-100">{o.applicants} Students</span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Top Match Score</span>
                    <span className="text-sm font-black text-emerald-400">{o.topFit}%</span>
                  </div>

                  <Link
                    href="/industry/talent"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    View Pipeline
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
