"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { CheckCircle2, XCircle, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

export default function FacultyMentorshipPage() {
  const [items, setItems] = useState([
    {
      id: "evi-001",
      student: "Aarav Sharma",
      projectTitle: "SkillSetu API Backend Gateway",
      competency: "FastAPI Backend Architecture",
      repo: "https://github.com/aarav/skillsetu-api",
      status: "PENDING",
      claimedScore: 90
    },
    {
      id: "evi-002",
      student: "Aarav Sharma",
      projectTitle: "Multi-hop Graph Matcher",
      competency: "Neo4j Graph Databases & Cypher",
      repo: "https://github.com/aarav/graph-matcher",
      status: "PENDING",
      claimedScore: 85
    }
  ]);

  const handleVerify = (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="faculty" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Student Project & Evidence Verification Ledger
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Validate codebase authenticity. Approved items convert self-reported nodes into Verified Graph Nodes.
            </p>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{item.student}</h3>
                    <div className="text-xs text-indigo-300 mt-0.5">Project: {item.projectTitle}</div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                    item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    item.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 text-xs text-slate-300 flex items-center justify-between">
                  <span>Target Competency Node: <strong>{item.competency}</strong></span>
                  <a href={item.repo} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold">
                    <span>Inspect GitHub Code</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {item.status === 'PENDING' && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleVerify(item.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Evidence</span>
                    </button>

                    <button
                      onClick={() => handleVerify(item.id, 'APPROVED')}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-500/20 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sign & Verify Node in Neo4j</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
