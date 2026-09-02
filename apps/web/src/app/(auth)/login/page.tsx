"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Network, Sparkles, ArrowRight, UserCircle, Briefcase, Building2, GraduationCap, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleQuickRoleLogin = (role: string) => {
    // Instant demo login for hackathon evaluators
    if (role === 'student') router.push('/student/dashboard');
    if (role === 'industry') router.push('/industry/dashboard');
    if (role === 'institution') router.push('/institution/dashboard');
    if (role === 'faculty') router.push('/faculty/dashboard');
    if (role === 'admin') router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col justify-center items-center px-4 py-12 bg-grid-pattern relative">
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Network className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Skill<span className="text-indigo-400">Setu</span></span>
          </Link>
          <h2 className="text-xl font-bold text-slate-100">Sign in to your Stakeholder Workspace</h2>
          <p className="text-xs text-slate-400">Access your verified competency graph and analytics.</p>
        </div>

        {/* Evaluator 1-Click Fast Login Showcase */}
        <div className="glass-panel-glow p-4 rounded-2xl border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> SIH 1-Click Instant Demo Login
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">No Passwords Needed</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickRoleLogin('student')}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-indigo-600/20 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              <UserCircle className="w-4 h-4 text-indigo-400" />
              <span>Student Persona</span>
            </button>

            <button
              onClick={() => handleQuickRoleLogin('industry')}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-emerald-600/20 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span>Industry Recruiter</span>
            </button>

            <button
              onClick={() => handleQuickRoleLogin('institution')}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-purple-600/20 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              <Building2 className="w-4 h-4 text-purple-400" />
              <span>Institution Dean</span>
            </button>

            <button
              onClick={() => handleQuickRoleLogin('faculty')}
              className="flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-amber-600/20 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Faculty Mentor</span>
            </button>
          </div>
        </div>

        {/* Standard Credentials Form */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); handleQuickRoleLogin('student'); }} className="space-y-3.5">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav.sharma@example.edu.in"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-white gradient-brand shadow-lg shadow-indigo-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Sign In with Credentials</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
