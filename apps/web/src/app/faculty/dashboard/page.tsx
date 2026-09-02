"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { GraduationCap, CheckCircle2, Clock, Users, ArrowRight, FileText } from 'lucide-react';

export default function FacultyDashboard() {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="faculty" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Faculty Mentor Portal
              </span>
              <h1 className="text-2xl font-black text-slate-100 mt-1">
                Prof. Ramesh Chandra • CSE Department
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Indian Institute of Technology, Delhi • 24 Mentored Students • 3 Pending Verifications
              </p>
            </div>

            <Link
              href="/faculty/mentorship"
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-amber-600 hover:bg-amber-500 transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Review Evidence Queue</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Pending Project Approvals</span>
              <div className="text-2xl font-black text-amber-400 mt-1">3 Projects</div>
              <p className="text-[11px] text-slate-400 mt-1">Awaiting Code Review</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Verified Competencies Signed</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">112 Nodes</div>
              <p className="text-[11px] text-emerald-400 mt-1">Cryptographically Authenticated</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Industry Sponsored Projects</span>
              <div className="text-2xl font-black text-indigo-400 mt-1">2 Active R&D</div>
              <p className="text-[11px] text-indigo-300 mt-1">NextGen AI Labs & Cognitive Cloud</p>
            </div>
          </div>

          {/* Verification Queue Preview */}
          <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Urgent Evidence Verification Queue
              </h3>
              <Link href="/faculty/mentorship" className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1">
                <span>Open full queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { student: "Aarav Sharma", project: "Multi-hop Graph Matcher (Neo4j)", competency: "Neo4j Graph DB", repo: "github.com/aarav/graph-matcher" },
                { student: "Meera Krishnan", project: "Distributed Stream Transformer", competency: "Apache Kafka", repo: "github.com/meera/stream-flow" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{item.student}</span>
                      <span className="text-slate-400">— {item.project}</span>
                    </div>
                    <div className="text-[11px] text-amber-300 mt-1">Claimed Competency: {item.competency}</div>
                  </div>

                  <Link
                    href="/faculty/mentorship"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-colors"
                  >
                    Verify & Authenticate
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
