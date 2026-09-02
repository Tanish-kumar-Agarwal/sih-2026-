"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import StudentProfileView from "@/components/StudentProfileView";
import { getStudentProfile } from "@/data/studentsData";

export default function StudentProfilePage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "1";
  const student = getStudentProfile(id);

  return <StudentProfileView student={student} />;
}
