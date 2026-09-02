"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Building, Award, Sparkles } from 'lucide-react';

export default function FacultyCollaborationsPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="faculty" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Industry Sponsored R&D Collaborations
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Direct research grants and collaborative projects with corporate partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase">NextGen AI Labs</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">ACTIVE GRANT</span>
              </div>
              <h3 className="text-base font-bold text-slate-100">Graph Neural Retrieval Agents (GraphRAG)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Co-developing multi-hop knowledge graph retrieval algorithms with student research scholars.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase">Cognitive Cloud</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">ACTIVE GRANT</span>
              </div>
              <h3 className="text-base font-bold text-slate-100">Autonomous Microservice Telemetry</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time telemetry event bus processing for distributed cloud microservices.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
