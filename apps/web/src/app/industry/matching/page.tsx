"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Compass, Sparkles, TrendingUp, Cpu, Award } from 'lucide-react';

export default function IndustryMatchingAnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="industry" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Matchmaking Engine & Algorithmic Analytics
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live telemetry of multi-hop graph path coverage and candidate fit distribution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs text-slate-400">Average Pipeline Match Fit</span>
              <div className="text-3xl font-black text-emerald-400">88.4%</div>
              <p className="text-[11px] text-slate-400">Verified Evidence Traversal</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs text-slate-400">Interview-to-Offer Conversion</span>
              <div className="text-3xl font-black text-indigo-400">76.2%</div>
              <p className="text-[11px] text-indigo-300">Vs 22% traditional ATS baseline</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-xs text-slate-400">Time-to-Hire Reduction</span>
              <div className="text-3xl font-black text-purple-400">-64%</div>
              <p className="text-[11px] text-purple-300">Automated competency verification</p>
            </div>
          </div>

          {/* Hiring Conversion by Match Tier */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Hire Conversion Rate by Match Tier</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-emerald-400">90% - 100% Graph Fit (High Match)</span>
                  <span className="font-bold text-slate-100">88.4% Conversion</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88.4%' }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-indigo-400">75% - 89% Graph Fit (Moderate Match)</span>
                  <span className="font-bold text-slate-100">64.2% Conversion</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '64.2%' }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-400">Below 75% Fit (Needs Upskilling)</span>
                  <span className="font-bold text-slate-100">22.0% Conversion</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full rounded-full" style={{ width: '22%' }} />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
