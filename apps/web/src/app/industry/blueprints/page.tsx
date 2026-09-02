"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Layers, Plus, Sparkles, CheckCircle2, Sliders, ArrowRight } from 'lucide-react';

export default function IndustryBlueprintsPage() {
  const [roleTitle, setRoleTitle] = useState('AI Platform & Knowledge Graph Engineer');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "FastAPI Backend Architecture",
    "Neo4j Graph DB & Cypher",
    "React & Next.js Ecosystem",
    "Docker & Cloud Deployments"
  ]);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const availableSkills = [
    "Python Engineering",
    "FastAPI Backend Architecture",
    "React & Next.js Ecosystem",
    "Neo4j Graph DB & Cypher",
    "PyTorch & Deep Learning",
    "Docker & Cloud Deployments",
    "PostgreSQL Relational Architecture",
    "Kubernetes Microservices"
  ];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="industry" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Role Competency Blueprint Designer
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Define the multi-hop competency topology and importance weights for algorithmic matchmaking.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Target Role Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Select Required Competencies */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Select Competencies & Graph Criteria
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {availableSkills.map((skill, idx) => {
                  const isChecked = selectedSkills.includes(skill);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSkill(skill)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-300 shadow-sm'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-semibold">{skill}</span>
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Plus className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save & Publish Blueprint</span>
              </button>

              {savedSuccess && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" /> Blueprint registered in Neo4j Ontology.
                </span>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
