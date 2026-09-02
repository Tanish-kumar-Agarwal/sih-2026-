"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Users, Shield, Search, CheckCircle2 } from 'lucide-react';

export default function AdminUsersPage() {
  const users = [
    { email: "aarav.sharma@example.edu.in", name: "Aarav Sharma", role: "STUDENT", org: "IIT Delhi", status: "ACTIVE" },
    { email: "r.chandra@cse.iitd.ac.in", name: "Prof. Ramesh Chandra", role: "FACULTY", org: "IIT Delhi", status: "ACTIVE" },
    { email: "recruiter@nextgenai.io", name: "Devika Roy", role: "INDUSTRY", org: "NextGen AI Labs", status: "ACTIVE" },
    { email: "dean.academics@iitd.ac.in", name: "Dr. K. Swaminathan", role: "INSTITUTION", org: "IIT Delhi", status: "ACTIVE" }
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Stakeholder User Governance & RBAC
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage multi-tenant permissions across Student, Industry, Faculty, and Institutional accounts.
            </p>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <div className="space-y-2">
              {users.map((u, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5 text-xs gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100">{u.name}</span>
                      <span className="text-[11px] text-slate-400">({u.email})</span>
                    </div>
                    <div className="text-[11px] text-indigo-300 mt-0.5">Affiliation: {u.org}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-slate-200 border border-white/10 font-mono">
                      {u.role}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {u.status}
                    </span>
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
