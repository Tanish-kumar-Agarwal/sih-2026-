export const ROLES = ['student', 'industry', 'institution', 'faculty', 'admin'] as const;

export const COMPETENCY_CATEGORIES = [
  'Core Technical',
  'Applied Domain',
  'Architectural',
  'DevOps',
  'Soft Skill'
] as const;

export const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

export const OPPORTUNITY_TYPES = ['INTERNSHIP', 'FULL_TIME', 'PROJECT', 'APPRENTICESHIP'] as const;

export const WORK_MODES = ['REMOTE', 'HYBRID', 'ONSITE'] as const;

export const APPLICATION_STATUSES = [
  'SUBMITTED',
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEWING',
  'OFFERED',
  'REJECTED',
  'ACCEPTED'
] as const;
