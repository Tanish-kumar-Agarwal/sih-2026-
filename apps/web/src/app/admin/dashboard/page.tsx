"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { ShieldCheck, Network, Database, Users, Activity, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Platform Super Admin
              </span>
              <h1 className="text-2xl font-black text-slate-100 mt-1">
                Ecosystem Command & Ontology Governance
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring PostgreSQL ground truth, Neo4j graph cluster, and multi-tenant access.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Neo4j Cluster Healthy
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Total Registered Users</span>
              <div className="text-2xl font-black text-slate-100 mt-1">18,450</div>
              <p className="text-[11px] text-indigo-400 mt-1">Students, Faculty & Recruiters</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Graph Nodes in Neo4j</span>
              <div className="text-2xl font-black text-indigo-400 mt-1">62,300</div>
              <p className="text-[11px] text-emerald-400 mt-1">128k Relationships</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Registered Institutions</span>
              <div className="text-2xl font-black text-purple-400 mt-1">142 Unis</div>
              <p className="text-[11px] text-slate-400 mt-1">AISHE Verified</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Avg Match Computation</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">38ms</div>
              <p className="text-[11px] text-slate-400 mt-1">Sub-second graph walk</p>
            </div>
          </div>

          {/* Core Governance Quick Access */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Link href="/admin/taxonomy" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-rose-500/40 transition-all block group">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-3 group-hover:text-rose-300 transition-colors">
                Skill Taxonomy & Ontology Management
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Add, deprecate, or link competency relationships (PREREQUISITE_FOR, COMPLEMENTS).
              </p>
            </Link>

            <Link href="/admin/system" className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-indigo-500/40 transition-all block group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-3 group-hover:text-indigo-300 transition-colors">
                Database & Graph Cluster Telemetry
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Inspect PostgreSQL read/write latencies, Neo4j Cypher query memory, and audit trails.
              </p>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
