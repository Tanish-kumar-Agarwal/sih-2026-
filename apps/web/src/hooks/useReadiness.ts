import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export interface CompetencyReference {
  id: string;
  name: string;
  code: string;
  category?: string;
}

export interface StudentCompetencyState {
  id: string;
  student_id: string;
  competency_id: string;
  competency?: CompetencyReference;
  proficiency_level: 'FOUNDATIONAL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  proficiency_score: number;
  confidence: number;
  state: 'NOT_ASSESSED' | 'DEVELOPING' | 'EMERGING' | 'ESTABLISHED';
  evidence_count: number;
  verified_evidence_count: number;
  evidence_strength?: 'NONE' | 'WEAK' | 'MODERATE' | 'STRONG' | 'VERY_STRONG';
  assessment_signal?: number;
  experience_signal?: number;
  is_verified: boolean;
  algorithm_version: string;
  taxonomy_version: string;
  provenance: Record<string, any>;
  last_evaluated_at?: string;
  updated_at?: string;
}

export interface StudentCompetencyStateListResponse {
  student_id: string;
  total: number;
  items: StudentCompetencyState[];
}

export interface RequirementEvaluationItem {
  competency_id: string;
  competency_name: string;
  requirement_type: 'MUST_HAVE' | 'SHOULD_HAVE' | 'OPTIONAL';
  required_proficiency: string;
  student_proficiency?: string;
  student_score: number;
  score_gap: number;
  coverage_status: 'MISSING' | 'INSUFFICIENT' | 'PARTIAL' | 'MEETS' | 'EXCEEDS';
  is_satisfied: boolean;
  is_critical_blocker: boolean;
  blocker_reason?: string;
}

export interface CriticalBlockerItem {
  competency_id: string;
  competency_name: string;
  required_proficiency: string;
  student_proficiency?: string;
  score_gap: number;
  level_gap: number;
  reason: string;
  severity: string;
}

export interface StudentReadinessState {
  id: string;
  student_id: string;
  target_type: 'ROLE' | 'OPPORTUNITY' | 'BLUEPRINT';
  target_id: string;
  target_title?: string;
  readiness_state: 'NOT_ASSESSED' | 'DEVELOPING' | 'EMERGING' | 'NEAR_READY' | 'READY';
  readiness_score: number;
  confidence: number;
  missing_competencies_count: number;
  satisfied_competencies_count: number;
  total_required_count: number;
  algorithm_version: string;
  summary?: string;
  strengths?: Array<Record<string, any>>;
  gaps?: Array<Record<string, any>>;
  critical_blockers?: CriticalBlockerItem[];
  requirements?: RequirementEvaluationItem[];
  provenance: Record<string, any>;
  calculated_at: string;
  updated_at?: string;
}

export interface StudentReadinessStateListResponse {
  student_id: string;
  total: number;
  items: StudentReadinessState[];
}

export function useStudentCompetencyStates(limit: number = 50, offset: number = 0) {
  return useQuery<StudentCompetencyStateListResponse>({
    queryKey: ['student-competency-states', limit, offset],
    queryFn: () => apiClient.get<StudentCompetencyStateListResponse>(
      `/students/me/competency-states?limit=${limit}&offset=${offset}`
    ),
    staleTime: 30000,
  });
}

export function useStudentCompetencyState(competencyId?: string) {
  return useQuery<StudentCompetencyState>({
    queryKey: ['student-competency-state', competencyId],
    queryFn: () => {
      if (!competencyId) throw new Error('competencyId required');
      return apiClient.get<StudentCompetencyState>(
        `/students/me/competency-states/${competencyId}`
      );
    },
    enabled: Boolean(competencyId),
    staleTime: 30000,
  });
}

export function useStudentReadinessStates(targetType?: string) {
  return useQuery<StudentReadinessStateListResponse>({
    queryKey: ['student-readiness-states', targetType],
    queryFn: () => {
      const url = targetType
        ? `/students/me/readiness-states?target_type=${targetType}`
        : '/students/me/readiness-states';
      return apiClient.get<StudentReadinessStateListResponse>(url);
    },
    staleTime: 30000,
  });
}

export function useStudentTargetReadiness(targetId?: string, targetType: string = 'ROLE') {
  return useQuery<StudentReadinessState>({
    queryKey: ['student-target-readiness', targetId, targetType],
    queryFn: () => {
      if (!targetId) throw new Error('targetId required');
      return apiClient.get<StudentReadinessState>(
        `/students/me/readiness-states/${targetId}?target_type=${targetType}`
      );
    },
    enabled: Boolean(targetId),
    staleTime: 30000,
  });
}

export function useRecalculateCompetencyState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (competencyId: string) =>
      apiClient.post<StudentCompetencyState>(
        `/students/me/competency-states/${competencyId}/recalculate`,
        {}
      ),
    onSuccess: (_, competencyId) => {
      queryClient.invalidateQueries({ queryKey: ['student-competency-states'] });
      queryClient.invalidateQueries({ queryKey: ['student-competency-state', competencyId] });
    },
  });
}

export function useRecalculateAllCompetencies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient.post<StudentCompetencyStateListResponse>(
        '/students/me/competency-states/recalculate',
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-competency-states'] });
    },
  });
}

export function useRecalculateTargetReadiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ targetId, targetType = 'ROLE' }: { targetId: string; targetType?: string }) =>
      apiClient.post<StudentReadinessState>(
        `/students/me/readiness-states/${targetId}/recalculate?target_type=${targetType}`,
        {}
      ),
    onSuccess: (_, { targetId, targetType = 'ROLE' }) => {
      queryClient.invalidateQueries({ queryKey: ['student-readiness-states'] });
      queryClient.invalidateQueries({ queryKey: ['student-target-readiness', targetId, targetType] });
    },
  });
}

