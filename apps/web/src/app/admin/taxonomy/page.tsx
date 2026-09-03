"use client";

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Network, Plus, CheckCircle2, Layers, Search, RefreshCw, AlertCircle } from 'lucide-react';
import {
  useCompetenciesCatalog,
  useAddCompetency,
  useTaxonomyDomains,
  useTaxonomyCategories,
} from '@/hooks/useStudentCompetencies';

export default function AdminTaxonomyPage() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('Core Technical');
  const [search, setSearch] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const { data: catalogData, isLoading, refetch } = useCompetenciesCatalog({ search: search || undefined });
  const { data: domains } = useTaxonomyDomains();
  const { data: categories } = useTaxonomyCategories();
  const addMutation = useAddCompetency();

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    
    // Choose selected domain or default
    const domainId = domains?.[0]?.id || "dom-tech-eng";

    addMutation.mutate(
      {
        name,
        code,
        category,
        domain_code: "TECH",
        difficulty_level: "INTERMEDIATE",
      },
      {
        onSuccess: (res) => {
          setFeedbackMsg({ text: `Competency "${res.name}" registered successfully in PostgreSQL!` });
          setName('');
          setCode('');
          setTimeout(() => setFeedbackMsg(null), 3500);
        },
        onError: (err: any) => {
          setFeedbackMsg({ text: `Registration failed: ${err?.message || "Internal error"}`, isError: true });
          setTimeout(() => setFeedbackMsg(null), 4000);
        },
      }
    );
  };

  const activeCompetencies = catalogData?.items || [];

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

          {/* Feedback banner */}
          {feedbackMsg && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                feedbackMsg.isError
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              }`}
            >
              {feedbackMsg.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* Add New Node Form */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300">Add New Competency to PostgreSQL Taxonomy</h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <input
                type="text"
                placeholder="Competency Name (e.g. Graph Neural Networks)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
              <input
                type="text"
                placeholder="Node Code (e.g. COMP-GNN)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-[#131826] border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500"
              >
                {(categories && categories.length > 0 ? categories : ["Core Technical", "Applied Domain", "Architectural", "DevOps", "Clinical AYUSH"]).map((cat: any) => {
                  const catName = typeof cat === 'string' ? cat : (cat.name || cat.code || String(cat));
                  return (
                    <option key={catName} value={catName}>{catName}</option>
                  );
                })}
              </select>
              <button
                type="submit"
                disabled={addMutation.isPending}
                className="py-2 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors flex items-center justify-center gap-1 shadow-md shadow-rose-500/20 disabled:opacity-50"
              >
                {addMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>{addMutation.isPending ? "Registering..." : "Register Node"}</span>
              </button>
            </form>
          </div>

          {/* Taxonomy Table & Live Filter */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-100">
                Live PostgreSQL Competency Taxonomy ({catalogData?.total ?? activeCompetencies.length} Canonical Nodes)
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search canonical taxonomy..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-rose-500 w-48"
                  />
                </div>
                <button
                  onClick={() => refetch()}
                  title="Reload from PostgreSQL"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-white/5 border border-white/10 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-rose-400' : ''}`} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-slate-500">Loading live ontology taxonomy from PostgreSQL...</div>
              ) : activeCompetencies.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">No matching canonical competencies found in taxonomy.</div>
              ) : (
                activeCompetencies.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs gap-2">
                    <div>
                      <span className="font-bold text-slate-200">{c.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono ml-2">[{c.code}]</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300">{c.category || "General"}</span>
                      <span className="text-indigo-400 font-mono">Level {c.difficulty_level || 2}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

