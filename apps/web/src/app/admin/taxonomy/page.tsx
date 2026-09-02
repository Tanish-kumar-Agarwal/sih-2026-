"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Network, Plus, CheckCircle2, Layers } from 'lucide-react';

export default function AdminTaxonomyPage() {
  const [competencies, setCompetencies] = useState([
    { code: "COMP-PYTHON", name: "Python Engineering", category: "Core Technical", level: "Intermediate", links: 4 },
    { code: "COMP-FASTAPI", name: "FastAPI Backend Architecture", category: "Core Technical", level: "Intermediate", links: 3 },
    { code: "COMP-REACT", name: "React & Next.js Ecosystem", category: "Core Technical", level: "Advanced", links: 3 },
    { code: "COMP-NEO4J", name: "Neo4j Graph DB & Cypher", category: "Architectural", level: "Advanced", links: 5 },
    { code: "COMP-DOCKER", name: "Docker & Cloud Deployments", category: "DevOps", level: "Intermediate", links: 3 },
    { code: "COMP-ML-SYSTEMS", name: "Applied ML & Neural Architectures", category: "Applied Domain", level: "Advanced", links: 4 }
  ]);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Core Technical');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    setCompetencies([
      { code, name, category, level: "Intermediate", links: 1 },
      ...competencies
    ]);
    setName('');
    setCode('');
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar role="admin" />

        <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-black text-slate-100">
              Global Competency Ontology & Taxonomy Manager
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Governs skill nodes, prerequisite dependencies, and industry difficulty classifications.
            </p>
          </div>

          {/* Add New Node Form */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300">Add New Competency to Neo4j Ontology</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                placeholder="Competency Name (e.g. Graph Neural Networks)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
              <input
                type="text"
                placeholder="Node Code (e.g. COMP-GNN)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#131826] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option>Core Technical</option>
                <option>Applied Domain</option>
                <option>Architectural</option>
                <option>DevOps</option>
                <option>Soft Skill</option>
              </select>
              <button
                type="submit"
                className="py-2 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center justify-center gap-1 shadow-md shadow-rose-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Register Node</span>
              </button>
            </form>
          </div>

          {/* Taxonomy Table */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-slate-100">Live Neo4j Competency Taxonomy ({competencies.length} Active Nodes)</h3>
            <div className="space-y-2">
              {competencies.map((c, i) => (
                <div key={i} className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs gap-2">
                  <div>
                    <span className="font-bold text-slate-200">{c.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono ml-2">[{c.code}]</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">{c.category}</span>
                    <span className="text-indigo-400 font-mono">{c.links} Graph Links</span>
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
