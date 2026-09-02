"use client";

import React from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import ReadinessMatrixChart from '@/components/ReadinessMatrixChart';

export default function InstitutionReadinessPage() {
  const readinessData = {
    institutionName: "Indian Institute of Technology, Delhi",
    overallCohortReadiness: 84.6,
    activeStudents: 1420,
    placedPercentage: 78.2,
    topInDemandGaps: [
      {
        competencyName: "Distributed Knowledge Graphs (Neo4j)",
        industryDemandScore: 92,
        studentMasteryScore: 54,
        gapScore: 38
      },
      {
        competencyName: "LLM Orchestration & Evaluation (RAG)",
        industryDemandScore: 95,
        studentMasteryScore: 62,
        gapScore: 33
      },
      {
        competencyName: "Kubernetes & Cloud Native DevOps",
        industryDemandScore: 88,
        studentMasteryScore: 60,
        gapScore: 28
      }
    ],
    departmentBreakdown: [
      { deptName: "Computer Science & Engineering", readinessScore: 91.2, verifiedRate: 89.0 },
      { deptName: "Information Technology", readinessScore: 86.4, verifiedRate: 82.5 },
      { deptName: "Artificial Intelligence & Data Science", readinessScore: 88.5, verifiedRate: 85.0 },
      { deptName: "Electronics & Electrical", readinessScore: 79.8, verifiedRate: 74.0 }
    ]
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="institution" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Curriculum Industry Readiness Matrix
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative analytics measuring institutional outcomes against real-time industry requisitions.
            </p>
          </div>

          <ReadinessMatrixChart data={readinessData} />
        </main>
      </div>
    </div>
  );
}
