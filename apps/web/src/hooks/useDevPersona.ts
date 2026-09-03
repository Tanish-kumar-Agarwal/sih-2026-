"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, getActiveDevPersonaId, setActiveDevPersonaId } from "@/lib/apiClient";

export interface DevPersona {
  id: string;
  role: "student" | "industry" | "institution" | "faculty" | "admin";
  name: string;
  title: string;
  institution: string;
  avatar: string;
  default_route: string;
  user_id?: string;
  student_id?: string;
  readiness_score?: number;
}

export function useDevPersonas() {
  return useQuery<DevPersona[]>({
    queryKey: ["dev-personas"],
    queryFn: () => apiClient.get<DevPersona[]>("/context/personas"),
  });
}

export function useCurrentDevPersona() {
  return useQuery<DevPersona>({
    queryKey: ["current-dev-persona"],
    queryFn: () => apiClient.get<DevPersona>("/context/current"),
  });
}

export function useDevPersona() {
  const { data: currentPersona, isLoading } = useCurrentDevPersona();
  const nameParts = (currentPersona?.name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return {
    currentPersona: currentPersona
      ? {
          ...currentPersona,
          firstName,
          lastName,
          department: currentPersona.title || "Computer Science",
        }
      : undefined,
    isLoading,
  };
}

export function useSwitchDevPersona() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (personaId: string) => {
      setActiveDevPersonaId(personaId);
      return apiClient.post<{ status: string; active_persona_id: string; persona: DevPersona }>(
        `/context/switch/${personaId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-dev-persona"] });
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });
      queryClient.invalidateQueries({ queryKey: ["student-competencies"] });
      queryClient.invalidateQueries({ queryKey: ["student-competency-graph"] });
      queryClient.invalidateQueries({ queryKey: ["health"] });
    },
  });
}
