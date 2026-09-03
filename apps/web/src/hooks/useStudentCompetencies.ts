"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useDevPersona } from "./useDevPersona";

export interface StudentCompetencySummary {
  id: string;
  competency_id: string;
  competency_name: string;
  competency_code: string;
  competency_slug?: string;
  category?: string;
  domain_code?: string;
  difficulty_level: string;
  proficiency_level: string;
  proficiency_numeric: number;
  score: number;
  confidence_score: number;
  is_verified: boolean;
  verified_at?: string;
  supporting_skills_count: number;
  updated_at?: string;
}

export interface StudentCompetenciesPaginated {
  items: StudentCompetencySummary[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SupportingSkill {
  id: string;
  domain_id?: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  is_primary?: boolean;
  relevance_weight?: number;
}

export interface CompetencyRelationship {
  id: string;
  target_competency_id: string;
  target_competency_name: string;
  target_competency_code: string;
  relationship_type: string;
  weight: number;
}

export interface StudentCompetencyDetail extends StudentCompetencySummary {
  description?: string;
  supporting_skills: SupportingSkill[];
  prerequisites: CompetencyRelationship[];
  complements: CompetencyRelationship[];
  demonstrated_in_projects: string[];
}

export interface CompetencyGraphNode {
  id: string;
  label: string;
  name: string;
  type: "domain" | "competency" | "skill";
  category?: string;
  proficiency?: string;
  score?: number;
  is_verified?: boolean;
}

export interface CompetencyGraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: "BELONGS_TO" | "HAS_SKILL" | "PREREQUISITE_FOR" | "COMPLEMENTS" | string;
  weight: number;
}

export interface CompetencyGraphResponse {
  nodes: CompetencyGraphNode[];
  edges: CompetencyGraphEdge[];
  total_nodes: number;
  total_edges: number;
}

export interface DeriveCompetenciesResponse {
  student_id: string;
  derived_count: number;
  updated_count: number;
  total_competencies: number;
  competencies: StudentCompetencySummary[];
  unresolved_skills: string[];
}

export interface RoleRequirement {
  id: string;
  competency_id: string;
  competency_code: string;
  competency_name: string;
  competency_category?: string;
  required_proficiency: string;
  requirement_type: string;
  weight: number;
  notes?: string;
}

export interface RoleCatalogItem {
  id: string;
  title: string;
  slug: string;
  code: string;
  domain: string;
  domain_id?: string;
  description?: string;
  status: string;
  requirements: RoleRequirement[];
}

export function useStudentCompetencies(params?: {
  search?: string;
  domain?: string;
  category?: string;
  page?: number;
  page_size?: number;
}) {
  const { currentPersona } = useDevPersona();
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.domain) searchParams.set("domain", params.domain);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.page) searchParams.set("page", params.page.toString());
  if (params?.page_size) searchParams.set("page_size", params.page_size.toString());

  const queryString = searchParams.toString();
  const endpoint = `/students/me/competencies${queryString ? `?${queryString}` : ""}`;

  return useQuery<StudentCompetenciesPaginated>({
    queryKey: ["student-competencies", currentPersona?.id, params],
    queryFn: () => apiClient.get<StudentCompetenciesPaginated>(endpoint),
    enabled: currentPersona?.role === "student",
  });
}

export function useStudentCompetencyDetail(competencyIdOrSlug?: string) {
  const { currentPersona } = useDevPersona();

  return useQuery<StudentCompetencyDetail>({
    queryKey: ["student-competency-detail", currentPersona?.id, competencyIdOrSlug],
    queryFn: () => apiClient.get<StudentCompetencyDetail>(`/students/me/competencies/${competencyIdOrSlug}`),
    enabled: Boolean(competencyIdOrSlug && currentPersona?.role === "student"),
  });
}

export function useStudentCompetencyGraph() {
  const { currentPersona } = useDevPersona();

  return useQuery<CompetencyGraphResponse>({
    queryKey: ["student-competency-graph", currentPersona?.id],
    queryFn: () => apiClient.get<CompetencyGraphResponse>("/students/me/competency-graph"),
    enabled: currentPersona?.role === "student",
  });
}

export function useDeriveCompetencies() {
  const queryClient = useQueryClient();

  return useMutation<DeriveCompetenciesResponse, Error, { include_projects?: boolean }>({
    mutationFn: (payload = { include_projects: true }) =>
      apiClient.post<DeriveCompetenciesResponse>("/students/me/competencies/derive", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-competencies"] });
      queryClient.invalidateQueries({ queryKey: ["student-competency-graph"] });
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
    },
  });
}

export function useCanonicalRoles(domain?: string) {
  const endpoint = `/roles${domain ? `?domain=${encodeURIComponent(domain)}` : ""}`;
  return useQuery<{ items: RoleCatalogItem[]; total: number }>({
    queryKey: ["canonical-roles", domain],
    queryFn: () => apiClient.get<{ items: RoleCatalogItem[]; total: number }>(endpoint),
  });
}

export function useRoleRequirements(roleIdOrSlug?: string) {
  return useQuery<RoleCatalogItem>({
    queryKey: ["role-requirements", roleIdOrSlug],
    queryFn: () => apiClient.get<RoleCatalogItem>(`/roles/${roleIdOrSlug}/competencies`),
    enabled: Boolean(roleIdOrSlug),
  });
}

export interface CanonicalCompetencyItem {
  id: string;
  name: string;
  code: string;
  slug: string;
  category?: string;
  category_id?: string;
  domain_code?: string;
  difficulty_level: string;
  description?: string;
  supporting_skills_count?: number;
  relationships_count?: number;
  status: string;
}

export function useCompetenciesCatalog(params?: {
  search?: string;
  domain?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.domain) searchParams.set("domain", params.domain);
  if (params?.category) searchParams.set("category", params.category);
  if (params?.limit) searchParams.set("limit", params.limit.toString());
  if (params?.offset) searchParams.set("offset", params.offset.toString());

  const queryString = searchParams.toString();
  const endpoint = `/competencies${queryString ? `?${queryString}` : ""}`;

  return useQuery<{ items: CanonicalCompetencyItem[]; total: number; limit: number; offset: number }>({
    queryKey: ["competencies-catalog", params],
    queryFn: () => apiClient.get<{ items: CanonicalCompetencyItem[]; total: number; limit: number; offset: number }>(endpoint),
  });
}

export function useAddCompetency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; code: string; category?: string; domain_code?: string; difficulty_level?: string; description?: string }) =>
      apiClient.post<CanonicalCompetencyItem>("/competencies", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competencies-catalog"] });
      queryClient.invalidateQueries({ queryKey: ["student-competency-graph"] });
    },
  });
}

export function useTaxonomyDomains() {
  return useQuery<Array<{ id: string; name: string; code: string; description?: string }>>({
    queryKey: ["taxonomy-domains"],
    queryFn: () => apiClient.get<Array<{ id: string; name: string; code: string; description?: string }>>("/competencies/domains"),
  });
}

export function useTaxonomyCategories(domainCode?: string) {
  const endpoint = `/competencies/categories${domainCode ? `?domain=${encodeURIComponent(domainCode)}` : ""}`;
  return useQuery<Array<{ id: string; name: string; slug: string; domain_id?: string; domain_code?: string }>>({
    queryKey: ["taxonomy-categories", domainCode],
    queryFn: () => apiClient.get<Array<{ id: string; name: string; slug: string; domain_id?: string; domain_code?: string }>>(endpoint),
  });
}
