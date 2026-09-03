"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface StudentProfileAPI {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  institution_id?: string;
  institution_name: string;
  department_id?: string;
  department_name: string;
  enrollment_number?: string;
  current_year: number;
  graduation_year?: number;
  cgpa?: number;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  resume_url?: string;
  readiness_score: number;
  competencies: Array<{
    id: string;
    name: string;
    code: string;
    category: string;
    proficiency: string;
    score: number;
    confidence_score: number;
    is_verified: boolean;
    verified_at?: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    summary: string;
    repo_url?: string;
    live_url?: string;
    is_verified: boolean;
    demonstrated_skills: string[];
  }>;
  created_at?: string;
}

export function useStudentProfile() {
  return useQuery<StudentProfileAPI>({
    queryKey: ["student-profile"],
    queryFn: () => apiClient.get<StudentProfileAPI>("/students/me"),
  });
}

export function useSystemHealth() {
  return useQuery<{
    status: string;
    database_connected: boolean;
    database_engine: string;
    neo4j_connected: boolean;
    active_environment: string;
  }>({
    queryKey: ["health"],
    queryFn: () => apiClient.get("/health"),
  });
}
