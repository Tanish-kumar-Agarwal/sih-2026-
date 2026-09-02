"use client";

import React from 'react';
import { TrendingUp, AlertOctagon, CheckCircle, Award, ArrowUpRight } from 'lucide-react';

interface ReadinessProps {
  data: {
    institutionName: string;
    overallCohortReadiness: number;
    activeStudents: number;
    placedPercentage: number;
    topInDemandGaps: {
      competencyName: string;
      industryDemandScore: number;
      studentMasteryScore: number;
      gapScore: number;
    }[];
    departmentBreakdown: {
      deptName: string;
      readinessScore: number;
      verifiedRate: number;
    }[];
  };
}

export default function ReadinessMatrixChart({ data }: ReadinessProps) {
  return (
    <div className="space-y-6">
      
      {/* 4 Macro Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Cohort Industry Readiness</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">
            {data.overallCohortReadiness}%
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +5.4% from last semester
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Active Enrolled Learners</span>
          <div className="text-2xl font-black text-slate-100 mt-1">
            {data.activeStudents.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 4 Engineering Depts</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Placement Conversion Rate</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {data.placedPercentage}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">AI Verified Candidate Pool</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-medium">Verified Credentials</span>
          <div className="text-2xl font-black text-purple-400 mt-1">
            5,890
          </div>
          <p className="text-[11px] text-purple-300 mt-1">Faculty & Lab Authenticated</p>
        </div>
      </div>

      {/* Institutional Curriculum Skill Gap Heatmap */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Live Industry Demand vs. Curriculum Mastery Gap
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies acute technology deficits across current academic syllabus.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
            Active Deficit Alerts
          </span>
        </div>

        <div className="space-y-4">
          {data.topInDemandGaps.map((gap, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-200">{gap.competencyName}</span>
                <span className="text-rose-400 font-mono font-bold">
                  Deficit Gap: -{gap.gapScore}%
                </span>
              </div>

              {/* Progress bars showing Industry Demand vs Student Mastery */}
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Industry Market Demand:</span>
                  <span className="font-semibold text-indigo-400">{gap.industryDemandScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${gap.industryDemandScore}%` }} />
                </div>

                <div className="flex items-center justify-between text-slate-400 pt-1">
                  <span>Student Cohort Mastery:</span>
                  <span className="font-semibold text-emerald-400">{gap.studentMasteryScore}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${gap.studentMasteryScore}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Breakdown Matrix */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10">
        <h4 className="text-sm font-bold text-slate-100 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" />
          Departmental Talent Readiness Index
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.departmentBreakdown.map((dept, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-xs text-slate-100">{dept.deptName}</h5>
                <span className="text-[11px] text-slate-400">Verified Evidence: {dept.verifiedRate}%</span>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-indigo-400">{dept.readinessScore}%</span>
                <div className="text-[10px] text-slate-500 font-mono">Readiness</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
