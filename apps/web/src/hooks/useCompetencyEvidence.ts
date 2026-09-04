"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useDevPersona } from "./useDevPersona";

export interface CompetencyEvidenceItem {
  mapping_id: string;
  evidence_id: string;
  evidence_title: string;
  evidence_type: string;
  source_type: string;
  uri?: string;
  verification_status: string;
  mapping_status: "CANDIDATE" | "PROPOSED" | "CONFIRMED" | "REJECTED" | "SUPERSEDED";
  mapping_method: string;
  confidence: number;
  confidence_reason?: string;
  evidence_strength: "WEAK" | "MODERATE" | "STRONG" | "VERY_STRONG";
  source_location?: string;
  skill_name?: string;
  created_at: string;
}

export interface CompetencyEvidenceProfile {
  competency_id: string;
  competency_name: string;
  competency_slug: string;
  competency_category?: string;
  mapped_evidence_count: number;
  verified_evidence_count: number;
  strongest_evidence?: "WEAK" | "MODERATE" | "STRONG" | "VERY_STRONG";
  max_mapping_confidence: number;
  evidence_items: CompetencyEvidenceItem[];
}

export interface EvidenceCompetencyMapping {
  id: string;
  evidence_id: string;
  competency_id: string;
  competency_name: string;
  competency_slug: string;
  competency_category?: string;
  skill_id?: string;
  skill_name?: string;
  claim_id?: string;
  mapping_status: "CANDIDATE" | "PROPOSED" | "CONFIRMED" | "REJECTED" | "SUPERSEDED";
  mapping_method: string;
  confidence: number;
  confidence_reason?: string;
  evidence_strength: "WEAK" | "MODERATE" | "STRONG" | "VERY_STRONG";
  source_location?: string;
  algorithm_version: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_reason?: string;
  created_at: string;
  updated_at: string;
}

export function useCompetencyEvidence(competencyId?: string | null) {
  const { currentPersona } = useDevPersona();

  return useQuery<CompetencyEvidenceProfile>({
    queryKey: ["competency-evidence-profile", competencyId, currentPersona?.id],
    queryFn: async () => {
      if (!competencyId) return null as any;
      return await apiClient.get<CompetencyEvidenceProfile>(
        `/students/me/competencies/${competencyId}/evidence`,
        {
          headers: {
            "X-Dev-Persona-Id": currentPersona?.id || "stu-aarav-sharma",
          },
        }
      );
    },
    enabled: !!competencyId,
    staleTime: 30000,
  });
}

export function useStudentEvidenceMappings(mappingStatus?: string) {
  const { currentPersona } = useDevPersona();

  return useQuery<EvidenceCompetencyMapping[]>({
    queryKey: ["student-evidence-mappings", currentPersona?.id, mappingStatus],
    queryFn: async () => {
      const endpoint = mappingStatus
        ? `/students/me/evidence-mappings?mapping_status=${encodeURIComponent(mappingStatus)}`
        : "/students/me/evidence-mappings";
      return await apiClient.get<EvidenceCompetencyMapping[]>(endpoint, {
        headers: {
          "X-Dev-Persona-Id": currentPersona?.id || "stu-aarav-sharma",
        },
      });
    },
    staleTime: 30000,
  });
}

export function useTriggerEvidenceMapping() {
  const queryClient = useQueryClient();
  const { currentPersona } = useDevPersona();

  return useMutation({
    mutationFn: async (evidenceId: string) => {
      return await apiClient.post(
        `/evidence/${evidenceId}/map`,
        {},
        {
          headers: {
            "X-Dev-Persona-Id": currentPersona?.id || "stu-aarav-sharma",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competency-evidence-profile"] });
      queryClient.invalidateQueries({ queryKey: ["student-evidence-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["student-competencies"] });
    },
  });
}

export function useVerifyEvidenceMapping() {
  const queryClient = useQueryClient();
  const { currentPersona } = useDevPersona();

  return useMutation({
    mutationFn: async ({
      evidenceId,
      competencyId,
      status,
      reviewReason,
    }: {
      evidenceId: string;
      competencyId: string;
      status: "CONFIRMED" | "REJECTED" | "CANDIDATE";
      reviewReason: string;
    }) => {
      return await apiClient.post(
        `/evidence/${evidenceId}/mappings/${competencyId}/verify`,
        {
          status,
          review_reason: reviewReason,
        },
        {
          headers: {
            "X-Dev-Persona-Id": currentPersona?.id || "fac-ramesh-chandra",
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["competency-evidence-profile"] });
      queryClient.invalidateQueries({ queryKey: ["student-evidence-mappings"] });
      queryClient.invalidateQueries({ queryKey: ["student-competencies"] });
    },
  });
}
