"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { FileCheck2, Clock, Calendar, Building, Sparkles } from 'lucide-react';

export default function StudentApplicationsPage() {
  const applications = [
    {
      id: "app-01",
      role: "Full Stack AI Platform Engineer",
      company: "NextGen AI Labs",
      status: "INTERVIEWING",
      matchScore: 91.5,
      date: "2026-09-01",
      notes: "Technical interview scheduled on 2026-09-05. Graph evidence verified by recruiter."
    },
    {
      id: "app-02",
      role: "Knowledge Graph & LLM Research Intern",
      company: "Cognitive Cloud",
      status: "REVIEWING",
      matchScore: 88.0,
      date: "2026-08-28",
      notes: "Application undergoing domain team review."
    }
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="student" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              My Opportunity Applications
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status of applications submitted with verified competency graph credentials.
            </p>
          </div>

          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{app.company}</span>
                    <span className="text-[10px] text-slate-400">Applied on {app.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">{app.role}</h3>
                  <p className="text-xs text-slate-400 mt-1">{app.notes}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Match Fit</span>
                    <span className="text-sm font-black text-emerald-400">{app.matchScore}%</span>
                  </div>

                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    app.status === 'INTERVIEWING' 
                      ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30' 
                      : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  }`}>
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
