"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Network,
  Sparkles,
  FileCheck2,
  User,
  Users,
  Briefcase,
  Layers,
  Compass,
  GraduationCap,
  Building,
  TrendingUp,
  Award,
  BookOpen,
  Settings,
  Shield,
  FileText,
  Upload
} from 'lucide-react';

interface SidebarProps {
  role: 'student' | 'industry' | 'institution' | 'faculty' | 'admin';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const navigationConfig = {
    student: [
      { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
      { name: 'Competency Center', href: '/student/competency', icon: Network },
      { name: 'Upload Evidence', href: '/onboarding', icon: Upload },
      { name: 'Assessments & Labs', href: '/student/assessments', icon: FileCheck2 },
      { name: 'Skill Passport', href: '/student/passport', icon: Shield, highlight: true },
      { name: 'AI Matches', href: '/student/opportunities', icon: Sparkles },
      { name: 'Applications', href: '/student/applications', icon: Briefcase },
      { name: 'Portfolio & Profile', href: '/student/profile', icon: User },
    ],
    industry: [
      { name: 'Recruiter Hub', href: '/industry/dashboard', icon: LayoutDashboard },
      { name: 'Talent Discovery', href: '/industry/talent', icon: Users, highlight: true },
      { name: 'Active Requisitions', href: '/industry/opportunities', icon: Briefcase },
      { name: 'Role Blueprints', href: '/industry/blueprints', icon: Layers },
      { name: 'Match Analytics', href: '/industry/matching', icon: Compass },
    ],
    institution: [
      { name: 'Dean Dashboard', href: '/institution/dashboard', icon: LayoutDashboard },
      { name: 'Student Cohorts', href: '/institution/students', icon: GraduationCap },
      { name: 'Readiness Matrix', href: '/institution/readiness', icon: TrendingUp, highlight: true },
      { name: 'Curriculum Gaps', href: '/institution/skills', icon: BookOpen },
      { name: 'Placement Stats', href: '/institution/placements', icon: Award },
    ],
    faculty: [
      { name: 'Mentor Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
      { name: 'Student Roster', href: '/faculty/students', icon: Users },
      { name: 'Project & Evidence Queue', href: '/faculty/mentorship', icon: FileText, highlight: true },
      { name: 'Industry Collabs', href: '/faculty/collaborations', icon: Building },
    ],
    admin: [
      { name: 'Command Center', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'User Governance', href: '/admin/users', icon: Users },
      { name: 'Skill Taxonomy (Ontology)', href: '/admin/taxonomy', icon: Network, highlight: true },
      { name: 'System & Neo4j Health', href: '/admin/system', icon: Shield },
    ]
  };

  const navItems = navigationConfig[role] || navigationConfig.student;

  return (
    <aside className="w-64 border-r border-white/10 bg-[#0C101D]/60 backdrop-blur-lg flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {role.toUpperCase()} PORTAL
          </p>
          <div className="mt-1 text-xs text-slate-500 font-mono">
            {role === 'student' ? 'Learner Workspace' : `${role.charAt(0).toUpperCase() + role.slice(1)} Control Hub`}
          </div>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'} ${item.highlight && !isActive ? 'text-indigo-400' : ''}`} />
                <span>{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Graph Engine</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SYNCHRONIZED
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          PostgreSQL truth mirrored with Neo4j relationship intelligence.
        </p>
      </div>
    </aside>
  );
}
