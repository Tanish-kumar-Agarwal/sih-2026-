"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Users, Search, CheckCircle2 } from 'lucide-react';

export default function FacultyStudentsPage() {
  const mentees = [
    { name: "Aarav Sharma", project: "SkillSetu Graph Matcher", verifiedComps: 5, readiness: 89.4 },
    { name: "Meera Krishnan", project: "Stream Transformer", verifiedComps: 6, readiness: 88.6 },
    { name: "Siddharth Nair", project: "Edge IoT Gateway", verifiedComps: 4, readiness: 82.1 }
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="faculty" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Mentee Student Roster
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Track student project milestones, lab benchmarks, and verified competency development.
            </p>
          </div>

          <div className="space-y-3">
            {mentees.map((m, i) => (
              <div key={i} className="glass-panel p-4 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-100">{m.name}</h4>
                  <span className="text-slate-400 mt-0.5 block">Capstone: {m.project}</span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Verified Nodes</span>
                    <span className="font-bold text-emerald-400">{m.verifiedComps}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[10px] block">Readiness</span>
                    <span className="font-bold text-indigo-400">{m.readiness}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
