export type UserRole = 'student' | 'industry' | 'institution' | 'faculty' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  institutionId?: string;
  institutionName?: string;
  departmentId?: string;
  departmentName?: string;
  enrollmentNumber?: string;
  currentYear: number;
  graduationYear?: number;
  cgpa?: number;
  bio?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  readinessScore: number;
  competencies: StudentCompetency[];
  projects: Project[];
}

export interface Competency {
  id: string;
  code: string;
  name: string;
  category: 'Core Technical' | 'Applied Domain' | 'Architectural' | 'DevOps' | 'Soft Skill';
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  description: string;
}

export interface StudentCompetency {
  id: string;
  competencyId: string;
  name: string;
  code: string;
  category: string;
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  score: number;
  confidenceScore: number;
  isVerified: boolean;
  verifiedAt?: string;
}

export interface Project {
  id: string;
  studentId: string;
  title: string;
  summary: string;
  repoUrl?: string;
  liveUrl?: string;
  isVerified: boolean;
  demonstratedSkills: string[];
}

export interface Opportunity {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  type: 'INTERNSHIP' | 'FULL_TIME' | 'PROJECT' | 'APPRENTICESHIP';
  stipendOrSalary: string;
  location: string;
  workMode: 'REMOTE' | 'HYBRID' | 'ONSITE';
  openings: number;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  deadline: string;
  description: string;
  requiredCompetencies: OpportunityCompetency[];
}

export interface OpportunityCompetency {
  competencyId: string;
  name: string;
  importance: 'MANDATORY' | 'PREFERRED' | 'BONUS';
  minProficiency: string;
  weight: number;
}

export interface MatchScoreResult {
  opportunityId: string;
  opportunityTitle: string;
  companyName: string;
  overallMatchScore: number; // 0 - 100
  graphPathScore: number;
  vectorSimilarity: number;
  matchedCompetencies: {
    name: string;
    studentProficiency: string;
    requiredProficiency: string;
    status: 'VERIFIED' | 'SELF_REPORTED' | 'MISSING';
    weight: number;
  }[];
  missingCompetencies: string[];
  reasoning: string;
  gapRemediationPath: {
    step: number;
    action: string;
    resourceTitle: string;
    resourceType: string;
    estHours: number;
  }[];
}

export interface InstitutionalReadiness {
  institutionId: string;
  institutionName: string;
  overallCohortReadiness: number;
  activeStudents: number;
  placedPercentage: number;
  verifiedCompetenciesCount: number;
  topInDemandGaps: {
    competencyName: string;
    industryDemandScore: number;
    studentMasteryScore: number;
    gapScore: number;
  }[];
  departmentBreakdown: {
    deptName: string;
    readinessScore: number;
    verifiedRate: number;
  }[];
}

export interface GraphNode {
  id: string;
  label: string;
  group: 'student' | 'competency' | 'project' | 'opportunity' | 'institution';
  score?: number;
  verified?: boolean;
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'HAS_COMPETENCY' | 'DEMONSTRATES' | 'REQUIRED_FOR' | 'PREREQUISITE_FOR' | 'MATCHED_TO';
  weight?: number;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
