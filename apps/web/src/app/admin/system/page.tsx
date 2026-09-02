"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Shield, Activity, Database, Network, Server, CheckCircle2 } from 'lucide-react';

export default function AdminSystemPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Database & Infrastructure Telemetry
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live status of PostgreSQL source-of-truth, Neo4j graph cluster, and Redis cache.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* PostgreSQL */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 uppercase flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> PostgreSQL 16
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ground Truth Active
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between"><span className="text-slate-400">Total Entities:</span><span>28 Tables</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Read Latency:</span><span>1.2ms</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Transaction Status:</span><span className="text-emerald-400">ACID Compliant</span></div>
              </div>
            </div>

            {/* Neo4j */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1.5">
                  <Network className="w-4 h-4" /> Neo4j Graph DB
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Graph Engine Online
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between"><span className="text-slate-400">Active Nodes:</span><span>62,300</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Relationships:</span><span>128,450</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Cypher Match Latency:</span><span>38ms</span></div>
              </div>
            </div>

            {/* Redis & Celery */}
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase flex items-center gap-1.5">
                  <Server className="w-4 h-4" /> Redis & Workers
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Queue Ready
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between"><span className="text-slate-400">Embedding Worker:</span><span className="text-emerald-400">Idle / Ready</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Resume Parser:</span><span className="text-emerald-400">Active</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Cache Hit Rate:</span><span>94.2%</span></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
