"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Network, 
  Sparkles, 
  UserCircle, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  ChevronDown,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [roleDropdown, setRoleDropdown] = useState(false);

  // Determine current active role from pathname
  const currentRole = pathname.startsWith('/student') ? 'Student'
    : pathname.startsWith('/industry') ? 'Industry'
    : pathname.startsWith('/institution') ? 'Institution'
    : pathname.startsWith('/faculty') ? 'Faculty'
    : pathname.startsWith('/admin') ? 'Admin'
    : 'Guest';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#090D16]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">Skill<span className="text-indigo-400">Setu</span></span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">SIH '26</span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 tracking-wide">AI Industry-Academia Bridge</p>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/" className={`hover:text-white transition-colors ${pathname === '/' ? 'text-indigo-400 font-semibold' : ''}`}>
            Home
          </Link>
          <Link href="/about" className={`hover:text-white transition-colors ${pathname === '/about' ? 'text-indigo-400 font-semibold' : ''}`}>
            Mission & Architecture
          </Link>
          <Link href="/opportunities" className={`hover:text-white transition-colors ${pathname === '/opportunities' ? 'text-indigo-400 font-semibold' : ''}`}>
            Explore Opportunities
          </Link>
        </nav>

        {/* Right Section: Role Portal Switcher & Auth */}
        <div className="flex items-center gap-3">
          
          {/* Quick Portal Switcher Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setRoleDropdown(!roleDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Portal: <strong className="text-indigo-300">{currentRole}</strong></span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {roleDropdown && (
              <div 
                className="absolute right-0 mt-2 w-56 glass-panel-glow rounded-xl p-2 shadow-2xl border border-white/15 z-50 animate-in fade-in zoom-in-95"
                onClick={() => setRoleDropdown(false)}
              >
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Switch Stakeholder Portal
                </div>
                <Link href="/student/dashboard" className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors">
                  <UserCircle className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="font-semibold">Student Portal</div>
                    <div className="text-[10px] text-slate-400">Competency Graph & Matcher</div>
                  </div>
                </Link>
                <Link href="/industry/dashboard" className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 transition-colors">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold">Industry Recruiter</div>
                    <div className="text-[10px] text-slate-400">Blueprints & Talent Search</div>
                  </div>
                </Link>
                <Link href="/institution/dashboard" className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-slate-200 hover:bg-purple-600/20 hover:text-purple-300 transition-colors">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-semibold">Institution / Dean</div>
                    <div className="text-[10px] text-slate-400">Readiness & Skill Gaps</div>
                  </div>
                </Link>
                <Link href="/faculty/dashboard" className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-slate-200 hover:bg-amber-600/20 hover:text-amber-300 transition-colors">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-semibold">Faculty Mentor</div>
                    <div className="text-[10px] text-slate-400">Evidence & Validation</div>
                  </div>
                </Link>
                <Link href="/admin/dashboard" className="flex items-center gap-2.5 px-2.5 py-2 text-xs rounded-lg text-slate-200 hover:bg-rose-600/20 hover:text-rose-300 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="font-semibold">System Admin</div>
                    <div className="text-[10px] text-slate-400">Ontology & Governance</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/student/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white gradient-brand rounded-lg shadow-md shadow-indigo-500/25 hover:opacity-95 transition-opacity"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
