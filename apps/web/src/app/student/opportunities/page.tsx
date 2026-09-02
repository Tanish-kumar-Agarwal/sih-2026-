"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import MatchScoreCard from '@/components/MatchScoreCard';
import { Sparkles, Filter, CheckCircle2 } from 'lucide-react';

export default function StudentOpportunitiesPage() {
  const [appliedList, setAppliedList] = useState<string[]>([]);

  const matches = [
    {
      opportunityId: "opp-sih-001",
      opportunityTitle: "Full Stack AI Platform Engineer",
      companyName: "NextGen AI Labs",
      overallMatchScore: 91.5,
      graphPathScore: 92.0,
      vectorSimilarity: 88.5,
      stipendOrSalary: "₹45,000 / mo",
      location: "Bengaluru (Hybrid)",
      workMode: "HYBRID",
      type: "INTERNSHIP",
      matchedCompetencies: [
        { name: "Python Engineering", studentProficiency: "Advanced", status: "VERIFIED" as const },
        { name: "FastAPI Backend Architecture", studentProficiency: "Intermediate", status: "VERIFIED" as const },
        { name: "React & Next.js Ecosystem", studentProficiency: "Advanced", status: "VERIFIED" as const }
      ],
      missingCompetencies: ["Neo4j Graph DB & Cypher (Needs Verification)"],
      reasoning: "Candidate demonstrates verified project code matching the company's Next.js and FastAPI stack.",
      gapRemediationPath: [
        { step: 1, action: "Complete Cypher query challenge", resourceTitle: "Neo4j Graph Traversal Lab", resourceType: "HANDS_ON_LAB", estHours: 4 }
      ]
    },
    {
      opportunityId: "opp-sih-002",
      opportunityTitle: "Knowledge Graph & LLM Research Intern",
      company: "Cognitive Cloud",
      companyName: "Cognitive Cloud",
      overallMatchScore: 88.0,
      graphPathScore: 86.0,
      vectorSimilarity: 92.0,
      stipendOrSalary: "₹55,000 / mo",
      location: "Remote",
      workMode: "REMOTE",
      type: "INTERNSHIP",
      matchedCompetencies: [
        { name: "Python Engineering", studentProficiency: "Advanced", status: "VERIFIED" as const },
        { name: "Applied ML & Neural Architectures", studentProficiency: "Intermediate", status: "VERIFIED" as const }
      ],
      missingCompetencies: ["Graph Neural Networks (PyG/DGL)"],
      reasoning: "High semantic fit with research focus on AI agents. Recommended to expand Graph Neural Network knowledge.",
      gapRemediationPath: [
        { step: 1, action: "Read GraphRAG architectural benchmark paper", resourceTitle: "GraphRAG & Knowledge Graphs", resourceType: "RESEARCH_PAPER", estHours: 6 }
      ]
    },
    {
      opportunityId: "opp-sih-003",
      opportunityTitle: "DevOps & Cloud Security Specialist",
      companyName: "CyberDefense Networks",
      overallMatchScore: 78.5,
      graphPathScore: 75.0,
      vectorSimilarity: 82.0,
      stipendOrSalary: "₹14 LPA",
      location: "Hyderabad",
      workMode: "ONSITE",
      type: "FULL_TIME",
      matchedCompetencies: [
        { name: "Docker & Cloud Deployments", studentProficiency: "Intermediate", status: "VERIFIED" as const },
        { name: "Python Engineering", studentProficiency: "Advanced", status: "VERIFIED" as const }
      ],
      missingCompetencies: ["Kubernetes", "Linux Kernel Security"],
      reasoning: "Solid foundational DevOps skills. Recommended to gain hands-on Kubernetes orchestration experience.",
      gapRemediationPath: [
        { step: 1, action: "Deploy multi-node Kubernetes cluster on Minikube", resourceTitle: "K8s Microservices Lab", resourceType: "HANDS_ON_LAB", estHours: 10 }
      ]
    }
  ];

  const handleApply = (oppId: string) => {
    if (!appliedList.includes(oppId)) {
      setAppliedList([...appliedList, oppId]);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="student" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                AI-Powered Graph Match Opportunities
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Calculated using 3-hop Neo4j Cypher traversals + semantic embeddings.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-indigo-300 font-mono">
              Composite Formula: (Graph 70% + Vector 30%)
            </div>
          </div>

          <div className="space-y-4">
            {matches.map((match) => (
              <div key={match.opportunityId} className="relative">
                <MatchScoreCard
                  match={match}
                  onApply={() => handleApply(match.opportunityId)}
                />
                {appliedList.includes(match.opportunityId) && (
                  <div className="absolute top-4 right-4 bg-emerald-500/90 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Application Submitted via Graph</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
