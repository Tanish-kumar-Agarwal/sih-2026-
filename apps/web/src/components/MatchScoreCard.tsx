"use client";

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ExternalLink, BookOpen, Layers, ShieldCheck } from 'lucide-react';

interface MatchItemProps {
  match: {
    opportunityId: string;
    opportunityTitle: string;
    companyName: string;
    companyLogo?: string;
    overallMatchScore: number;
    graphPathScore: number;
    vectorSimilarity: number;
    stipendOrSalary?: string;
    location?: string;
    workMode?: string;
    type?: string;
    matchedCompetencies: {
      name: string;
      studentProficiency: string;
      status: 'VERIFIED' | 'SELF_REPORTED' | 'MISSING';
    }[];
    missingCompetencies: string[];
    reasoning: string;
    gapRemediationPath: {
      step: number;
      action: string;
      resourceTitle: string;
      resourceType: string;
      estHours: number;
    }[];
  };
  onApply?: () => void;
}

export default function MatchScoreCard({ match, onApply }: MatchItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 70) return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-indigo-500/40 transition-all group">
      
      {/* Header Row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center font-bold text-lg text-indigo-300">
            {match.companyName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{match.companyName}</span>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-white/5 text-slate-300 rounded border border-white/10">{match.workMode || 'REMOTE'}</span>
              <span className="px-2 py-0.5 text-[10px] font-medium bg-indigo-500/10 text-indigo-300 rounded border border-indigo-500/20">{match.type || 'INTERNSHIP'}</span>
            </div>
            <h4 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mt-0.5">
              {match.opportunityTitle}
            </h4>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span>📍 {match.location || 'Bengaluru'}</span>
              <span>💰 {match.stipendOrSalary || '₹45,000/mo'}</span>
            </div>
          </div>
        </div>

        {/* Overall Match Badge */}
        <div className="flex flex-col items-end">
          <div className={`px-3 py-1.5 rounded-xl border text-sm font-bold flex items-center gap-1.5 ${getScoreColor(match.overallMatchScore)}`}>
            <Sparkles className="w-4 h-4" />
            <span>{match.overallMatchScore}% Match</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 font-mono">
            Graph: {match.graphPathScore}% | Semantic: {match.vectorSimilarity}%
          </span>
        </div>
      </div>

      {/* Verified Strengths Pill Matrix */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase">Verified Fit:</span>
        {match.matchedCompetencies.map((c, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {c.name}
          </span>
        ))}
        {match.missingCompetencies.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Gap: {match.missingCompetencies.join(', ')}
          </span>
        )}
      </div>

      {/* XAI Reasoning Preview */}
      <p className="mt-3 text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
        <strong className="text-indigo-300">AI Match Rationale: </strong>
        {match.reasoning}
      </p>

      {/* Expandable Gap Remediation Action Plan */}
      {showDetails && (
        <div className="mt-4 p-4 rounded-xl bg-[#090D18] border border-indigo-500/20 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Automated 100% Readiness Action Plan
            </h5>
            <span className="text-[10px] text-slate-400">Curated by SkillSetu AI</span>
          </div>

          <div className="space-y-2">
            {match.gapRemediationPath.map((step) => (
              <div key={step.step} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5 text-xs text-slate-200">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                  {step.step}
                </span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-100">{step.resourceTitle}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{step.action}</div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">~{step.estHours} hrs</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-between pt-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
        >
          {showDetails ? "Hide Remediation Plan" : "View Skill Gap Remediation"}
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={onApply}
            className="px-4 py-2 text-xs font-semibold text-white gradient-brand rounded-xl hover:opacity-95 transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
          >
            <span>Apply with Verified Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
