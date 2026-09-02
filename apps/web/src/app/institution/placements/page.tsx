"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Award, TrendingUp, Building, Users } from 'lucide-react';

export default function InstitutionPlacementsPage() {
  const placementStats = [
    { company: "NextGen AI Labs", hires: 14, role: "AI Platform Engineer", avgPackage: "₹24 LPA" },
    { company: "Cognitive Cloud", hires: 18, role: "Knowledge Graph Specialist", avgPackage: "₹22 LPA" },
    { company: "CyberDefense Networks", hires: 12, role: "Cloud Security Analyst", avgPackage: "₹18 LPA" }
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="institution" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Campus Placement & Industry Hiring Ledger
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified placement outcomes driven by AI graph matchmaking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Total Verified Placements</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">44 Offers</div>
              <p className="text-[11px] text-slate-400 mt-1">Across 12 Partner Enterprises</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Highest Package Offered</span>
              <div className="text-2xl font-black text-indigo-400 mt-1">₹36 LPA</div>
              <p className="text-[11px] text-indigo-300 mt-1">AI Systems Engineer</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-white/10">
              <span className="text-xs text-slate-400">Average Compensation</span>
              <div className="text-2xl font-black text-purple-400 mt-1">₹21.4 LPA</div>
              <p className="text-[11px] text-emerald-400 mt-1">+34% vs Non-Graph Cohorts</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Top Hiring Partners</h3>

            <div className="space-y-3">
              {placementStats.map((item, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs gap-3">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{item.company}</h4>
                    <span className="text-slate-400 text-[11px] mt-0.5 block">{item.role}</span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Offers Extended</span>
                      <span className="text-sm font-black text-slate-100">{item.hires} Students</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Average CTC</span>
                      <span className="text-sm font-black text-emerald-400">{item.avgPackage}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
