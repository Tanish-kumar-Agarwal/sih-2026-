"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { BookOpen, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function InstitutionSkillsPage() {
  const gaps = [
    {
      skill: "Neo4j Graph Databases & GraphRAG",
      severity: "ACUTE DEFICIT",
      industryDemand: "92% of AI Job Blueprints",
      campusCurriculumCoverage: "15% (Only 1 elective)",
      recommendedAction: "Introduce 4-week Hands-on Graph DB Lab module in CS302 Database Systems."
    },
    {
      skill: "Kubernetes & Production Cloud Orchestration",
      severity: "MODERATE DEFICIT",
      industryDemand: "88% of DevOps Blueprints",
      campusCurriculumCoverage: "40% (Basic Docker covered)",
      recommendedAction: "Upgrade Cloud Computing Lab to incorporate Kubernetes cluster deployment."
    }
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="institution" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Curriculum Deficits & Syllabus Remediation Hub
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Actionable syllabus updates formulated by analyzing aggregated industry blueprints.
            </p>
          </div>

          <div className="space-y-4">
            {gaps.map((gap, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-100">{gap.skill}</h3>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                    {gap.severity}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/5">
                    <span className="text-slate-400 block font-medium">Industry Blueprint Requirement:</span>
                    <span className="font-bold text-indigo-400 mt-0.5 block">{gap.industryDemand}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <span className="text-slate-400 block font-medium">Current Syllabus Coverage:</span>
                    <span className="font-bold text-slate-300 mt-0.5 block">{gap.campusCurriculumCoverage}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2">
                  <BookOpen className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                  <div>
                    <strong>Dean Action Item: </strong>
                    {gap.recommendedAction}
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
