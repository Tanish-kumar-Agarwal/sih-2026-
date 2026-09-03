"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StudentProfileView from "@/components/StudentProfileView";
import { useStudentProfile } from "@/hooks/useFoundationProfile";
import { getStudentProfile } from "@/data/studentsData";
import { AlertCircle } from "lucide-react";

function StudentProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "1";
  
  // Real PostgreSQL 16 Query via TanStack Query v5
  const { data: dbProfile, isLoading, error } = useStudentProfile();
  
  // Base visual template to preserve UI completeness
  const baseStudent = getStudentProfile(id);
  
  // Real database record merged over visual presentation template
  const student = dbProfile ? {
    ...baseStudent,
    name: `${dbProfile.first_name} ${dbProfile.last_name}`,
    university: dbProfile.institution_name,
    rollNo: dbProfile.enrollment_number || baseStudent.rollNo,
    readiness: Math.round(dbProfile.readiness_score || baseStudent.readiness),
    cgpa: dbProfile.cgpa || baseStudent.cgpa,
    skills: {
      ...baseStudent.skills,
      verifiedSkills: dbProfile.competencies?.filter(c => c.is_verified).length ?? baseStudent.skills.verifiedSkills,
      strongestSkills: dbProfile.competencies?.map(c => c.name) ?? baseStudent.skills.strongestSkills
    },
    experience: {
      ...baseStudent.experience,
      projects: dbProfile.projects?.length ?? baseStudent.experience.projects
    }
  } : baseStudent;

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0c10", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", fontWeight: 600 }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3b82f6", boxShadow: "0 0 10px #3b82f6" }} />
          <span>Loading verified profile from PostgreSQL 16...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0c10", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ background: "#141519", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "16px", padding: "24px", maxWidth: "480px", textAlign: "center" }}>
          <AlertCircle style={{ width: "32px", height: "32px", color: "#ef4444", margin: "0 auto 12px" }} />
          <h2 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: 0 }}>Backend Infrastructure Error</h2>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "8px 0 16px" }}>
            {error.message}
          </p>
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            Ensure FastAPI (port 8000) and PostgreSQL 16 (port 5432) are running.
          </div>
        </div>
      </div>
    );
  }

  return <StudentProfileView student={student} />;
}

export default function StudentProfilePage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", background: "#0b0c10", display: "flex", alignItems: "center", justifyContent: "center", color: "#60a5fa" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", fontWeight: 600 }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#3b82f6" }} />
            <span>Initializing...</span>
          </div>
        </div>
      }
    >
      <StudentProfileContent />
    </Suspense>
  );
}
