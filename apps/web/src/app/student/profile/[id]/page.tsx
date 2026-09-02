"use client";

import React from "react";
import { useParams } from "next/navigation";
import StudentProfileView from "@/components/StudentProfileView";
import { getStudentProfile } from "@/data/studentsData";

export default function StudentProfileDynamicPage() {
  const params = useParams();
  const studentId = typeof params?.id === "string" ? params.id : "1";
  const student = getStudentProfile(studentId);

  return <StudentProfileView student={student} />;
}
