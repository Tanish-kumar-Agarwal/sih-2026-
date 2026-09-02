export interface StudentProfileData {
  id: string;
  name: string;
  avatar: string;
  degree: string;
  batch: string;
  university: string;
  location: string;
  rollNo: string;
  semester: string;
  available: boolean;
  availabilityText: string;
  institutionVerified: boolean;
  identityVerified: boolean;
  profileVerified: boolean;

  // Header Readiness Score
  readiness: number;
  readinessLabel: string;
  targetRole: string;
  rubricsCount: number;
  confidence: string;
  evidenceCoverage: number;
  trendDays: string;

  // Quick stats under buttons
  cgpa: number;
  verifiedSkillsCount: number;
  projectsCount: number;
  internshipsCount: number;
  certificationsCount: number;
  codingRating: string;

  // 1. Academic Intelligence
  academic: {
    cgpa: number;
    trajectory: number;
    trajectoryLabel: string;
    verifiedRange: string;
    backlogs: number;
    attendance: number;
  };

  // 2. Skill Intelligence
  skills: {
    verifiedSkills: number;
    avgCompetency: number;
    strongestSkills: string[];
    criticalGapsCount: number;
    gapsList: string;
    lastAssessed: string;
  };

  // 3. Digital Intelligence
  digital: {
    subtitle: string;
    leetcodeSolved: number;
    codeforcesRating: number;
    githubRepos: number;
    signalText: string;
    commits90Days: number;
    contestRankBest: string;
  };

  // 4. Experience Intelligence
  experience: {
    subtitle: string;
    projects: number;
    internships: number;
    hackathons: number;
    verifiedCount: number;
    latest: string;
    hackathonBest: string;
  };

  // 5. Credential Intelligence
  credential: {
    subtitle: string;
    certifications: number;
    assessments: number;
    coverage: number;
    confidence: string;
    ncvetAligned: string;
    expiringSoon: number;
  };

  // 6. Industry Readiness
  industryReadiness: {
    score: number;
    role: string;
    percentile: string;
    highlightText: string;
    gapHighlight: string;
    benchmark: string;
    radarScores: {
      dsa: number;
      systemDesign: number;
      fullStack: number;
      cloud: number;
      problemSolving: number;
    };
  };
}

export const studentsDatabase: StudentProfileData[] = [
  {
    id: "1",
    name: "Aarav Sharma",
    avatar: "AS",
    degree: "B.Tech Computer Science & Engineering",
    batch: "Class of 2027",
    university: "JECRC University",
    location: "Jaipur, Rajasthan",
    rollNo: "23ESKCS042",
    semester: "Semester 5 of 8",
    available: true,
    availabilityText: "Available for internship",
    institutionVerified: true,
    identityVerified: true,
    profileVerified: true,

    readiness: 91,
    readinessLabel: "INDUSTRY READY",
    targetRole: "Software engineer",
    rubricsCount: 6,
    confidence: "High confidence",
    evidenceCoverage: 94,
    trendDays: "+8% in 90 days",

    cgpa: 8.7,
    verifiedSkillsCount: 12,
    projectsCount: 4,
    internshipsCount: 2,
    certificationsCount: 8,
    codingRating: "1428 Codeforces",

    academic: {
      cgpa: 8.7,
      trajectory: 91,
      trajectoryLabel: "Improving",
      verifiedRange: "Sem 1 to 4",
      backlogs: 0,
      attendance: 92,
    },
    skills: {
      verifiedSkills: 12,
      avgCompetency: 87,
      strongestSkills: ["Python", "DSA", "React"],
      criticalGapsCount: 3,
      gapsList: "Cloud, testing, SQL",
      lastAssessed: "12 days ago",
    },
    digital: {
      subtitle: "Competitive programming and GitHub, combined",
      leetcodeSolved: 384,
      codeforcesRating: 1428,
      githubRepos: 42,
      signalText: "Strong problem-solving signal",
      commits90Days: 217,
      contestRankBest: "Top 9%",
    },
    experience: {
      subtitle: "Projects, internships, hackathons",
      projects: 4,
      internships: 2,
      hackathons: 3,
      verifiedCount: 4,
      latest: "SDE intern, Razorpay",
      hackathonBest: "SIH 2025 finalist",
    },
    credential: {
      subtitle: "Certifications, assessments, achievements",
      certifications: 8,
      assessments: 6,
      coverage: 94,
      confidence: "High credential confidence",
      ncvetAligned: "5 of 8",
      expiringSoon: 1,
    },
    industryReadiness: {
      score: 91,
      role: "Software engineer",
      percentile: "Top 6% of JECRC CSE 2027",
      highlightText: "Technical skills, project evidence, problem solving",
      gapHighlight: "Cloud computing 58, communication 74",
      benchmark: "Bar is 70",
      radarScores: {
        dsa: 92,
        systemDesign: 78,
        fullStack: 88,
        cloud: 58,
        problemSolving: 94,
      },
    },
  },
  {
    id: "2",
    name: "Kabir Singh",
    avatar: "KS",
    degree: "B.Tech Computer Science & Engineering",
    batch: "Class of 2026",
    university: "JECRC University",
    location: "Jaipur, Rajasthan",
    rollNo: "22ESKCS108",
    semester: "Semester 7 of 8",
    available: false,
    availabilityText: "Placed / Inactive for internship",
    institutionVerified: true,
    identityVerified: true,
    profileVerified: true,

    readiness: 90,
    readinessLabel: "INDUSTRY READY",
    targetRole: "DevOps & Cloud Engineer",
    rubricsCount: 6,
    confidence: "High confidence",
    evidenceCoverage: 96,
    trendDays: "+5% in 90 days",

    cgpa: 8.8,
    verifiedSkillsCount: 14,
    projectsCount: 5,
    internshipsCount: 3,
    certificationsCount: 7,
    codingRating: "1512 Codeforces",

    academic: {
      cgpa: 8.8,
      trajectory: 89,
      trajectoryLabel: "Consistent",
      verifiedRange: "Sem 1 to 6",
      backlogs: 0,
      attendance: 94,
    },
    skills: {
      verifiedSkills: 14,
      avgCompetency: 89,
      strongestSkills: ["Cloud", "DevOps", "Docker"],
      criticalGapsCount: 0,
      gapsList: "None",
      lastAssessed: "5 days ago",
    },
    digital: {
      subtitle: "Competitive programming and GitHub, combined",
      leetcodeSolved: 420,
      codeforcesRating: 1512,
      githubRepos: 51,
      signalText: "High infrastructure & automation signal",
      commits90Days: 310,
      contestRankBest: "Top 7%",
    },
    experience: {
      subtitle: "Projects, internships, hackathons",
      projects: 5,
      internships: 3,
      hackathons: 2,
      verifiedCount: 5,
      latest: "Cloud Intern, AWS",
      hackathonBest: "Smart City Hackathon 1st",
    },
    credential: {
      subtitle: "Certifications, assessments, achievements",
      certifications: 7,
      assessments: 8,
      coverage: 96,
      confidence: "Verified Cloud Practitioner",
      ncvetAligned: "6 of 7",
      expiringSoon: 0,
    },
    industryReadiness: {
      score: 90,
      role: "DevOps & Cloud Engineer",
      percentile: "Top 4% of JECRC CSE 2026",
      highlightText: "CI/CD pipelines, Kubernetes, Terraform",
      gapHighlight: "Advanced Security 64, Low-level 72",
      benchmark: "Bar is 70",
      radarScores: {
        dsa: 82,
        systemDesign: 90,
        fullStack: 80,
        cloud: 95,
        problemSolving: 88,
      },
    },
  },
  {
    id: "3",
    name: "Riya Mehta",
    avatar: "RM",
    degree: "B.Tech Information Technology",
    batch: "Class of 2027",
    university: "JECRC University",
    location: "Jaipur, Rajasthan",
    rollNo: "23ESKIT021",
    semester: "Semester 5 of 8",
    available: true,
    availabilityText: "Available for internship",
    institutionVerified: true,
    identityVerified: true,
    profileVerified: true,

    readiness: 89,
    readinessLabel: "INDUSTRY READY",
    targetRole: "Full Stack Engineer",
    rubricsCount: 6,
    confidence: "High confidence",
    evidenceCoverage: 92,
    trendDays: "+11% in 90 days",

    cgpa: 8.9,
    verifiedSkillsCount: 11,
    projectsCount: 6,
    internshipsCount: 2,
    certificationsCount: 6,
    codingRating: "1390 Codeforces",

    academic: {
      cgpa: 8.9,
      trajectory: 93,
      trajectoryLabel: "Improving",
      verifiedRange: "Sem 1 to 4",
      backlogs: 0,
      attendance: 95,
    },
    skills: {
      verifiedSkills: 11,
      avgCompetency: 88,
      strongestSkills: ["React", "Node.js", "TypeScript"],
      criticalGapsCount: 1,
      gapsList: "Kafka streaming",
      lastAssessed: "8 days ago",
    },
    digital: {
      subtitle: "Competitive programming and GitHub, combined",
      leetcodeSolved: 310,
      codeforcesRating: 1390,
      githubRepos: 38,
      signalText: "Strong frontend architecture signal",
      commits90Days: 195,
      contestRankBest: "Top 12%",
    },
    experience: {
      subtitle: "Projects, internships, hackathons",
      projects: 6,
      internships: 2,
      hackathons: 4,
      verifiedCount: 4,
      latest: "Frontend Intern, Swiggy",
      hackathonBest: "HackInIndia Winner",
    },
    credential: {
      subtitle: "Certifications, assessments, achievements",
      certifications: 6,
      assessments: 5,
      coverage: 92,
      confidence: "High credential confidence",
      ncvetAligned: "5 of 6",
      expiringSoon: 1,
    },
    industryReadiness: {
      score: 89,
      role: "Full Stack Engineer",
      percentile: "Top 5% of JECRC IT 2027",
      highlightText: "UI systems, GraphQL APIs, State architectures",
      gapHighlight: "Distributed caches 62, Microservices 68",
      benchmark: "Bar is 70",
      radarScores: {
        dsa: 84,
        systemDesign: 82,
        fullStack: 94,
        cloud: 72,
        problemSolving: 86,
      },
    },
  },
  {
    id: "4",
    name: "Sneha Patel",
    avatar: "SP",
    degree: "B.Tech Artificial Intelligence & Data Science",
    batch: "Class of 2027",
    university: "JECRC University",
    location: "Jaipur, Rajasthan",
    rollNo: "23ESKAI015",
    semester: "Semester 5 of 8",
    available: true,
    availabilityText: "Available for internship",
    institutionVerified: true,
    identityVerified: true,
    profileVerified: true,

    readiness: 88,
    readinessLabel: "INDUSTRY READY",
    targetRole: "Machine Learning Engineer",
    rubricsCount: 6,
    confidence: "High confidence",
    evidenceCoverage: 95,
    trendDays: "+14% in 90 days",

    cgpa: 9.4,
    verifiedSkillsCount: 13,
    projectsCount: 5,
    internshipsCount: 2,
    certificationsCount: 9,
    codingRating: "1350 Codeforces",

    academic: {
      cgpa: 9.4,
      trajectory: 96,
      trajectoryLabel: "Distinction",
      verifiedRange: "Sem 1 to 4",
      backlogs: 0,
      attendance: 98,
    },
    skills: {
      verifiedSkills: 13,
      avgCompetency: 86,
      strongestSkills: ["Python", "PyTorch", "SQL"],
      criticalGapsCount: 1,
      gapsList: "Distributed Model Serving",
      lastAssessed: "4 days ago",
    },
    digital: {
      subtitle: "Competitive programming and GitHub, combined",
      leetcodeSolved: 280,
      codeforcesRating: 1350,
      githubRepos: 29,
      signalText: "Superior statistical & modeling signal",
      commits90Days: 180,
      contestRankBest: "Top 14%",
    },
    experience: {
      subtitle: "Projects, internships, hackathons",
      projects: 5,
      internships: 2,
      hackathons: 3,
      verifiedCount: 5,
      latest: "ML Research Intern, Microsoft",
      hackathonBest: "SIH AI Track Finalist",
    },
    credential: {
      subtitle: "Certifications, assessments, achievements",
      certifications: 9,
      assessments: 7,
      coverage: 95,
      confidence: "Verified Deep Learning Specialization",
      ncvetAligned: "7 of 9",
      expiringSoon: 0,
    },
    industryReadiness: {
      score: 88,
      role: "Machine Learning Engineer",
      percentile: "Top 2% of JECRC AI 2027",
      highlightText: "Neural networks, PyTorch, Data pipeline ETL",
      gapHighlight: "TensorRT optimization 60, Kubernetes 66",
      benchmark: "Bar is 70",
      radarScores: {
        dsa: 80,
        systemDesign: 76,
        fullStack: 74,
        cloud: 79,
        problemSolving: 92,
      },
    },
  },
  {
    id: "5",
    name: "Ananya Iyer",
    avatar: "AI",
    degree: "B.Tech Artificial Intelligence & Data Science",
    batch: "Class of 2027",
    university: "JECRC University",
    location: "Jaipur, Rajasthan",
    rollNo: "23ESKAI033",
    semester: "Semester 5 of 8",
    available: true,
    availabilityText: "Available for internship",
    institutionVerified: true,
    identityVerified: true,
    profileVerified: true,

    readiness: 86,
    readinessLabel: "INDUSTRY READY",
    targetRole: "Data Engineer",
    rubricsCount: 6,
    confidence: "High confidence",
    evidenceCoverage: 91,
    trendDays: "+7% in 90 days",

    cgpa: 8.7,
    verifiedSkillsCount: 10,
    projectsCount: 4,
    internshipsCount: 1,
    certificationsCount: 6,
    codingRating: "1280 Codeforces",

    academic: {
      cgpa: 8.7,
      trajectory: 88,
      trajectoryLabel: "Steady",
      verifiedRange: "Sem 1 to 4",
      backlogs: 0,
      attendance: 91,
    },
    skills: {
      verifiedSkills: 10,
      avgCompetency: 84,
      strongestSkills: ["Python", "SQL", "Spark"],
      criticalGapsCount: 2,
      gapsList: "Airflow, Snowflake",
      lastAssessed: "15 days ago",
    },
    digital: {
      subtitle: "Competitive programming and GitHub, combined",
      leetcodeSolved: 240,
      codeforcesRating: 1280,
      githubRepos: 24,
      signalText: "Data modeling and query optimization signal",
      commits90Days: 142,
      contestRankBest: "Top 18%",
    },
    experience: {
      subtitle: "Projects, internships, hackathons",
      projects: 4,
      internships: 1,
      hackathons: 2,
      verifiedCount: 3,
      latest: "Data Engineering Intern, Flipkart",
      hackathonBest: "BigData Challenge 2nd",
    },
    credential: {
      subtitle: "Certifications, assessments, achievements",
      certifications: 6,
      assessments: 5,
      coverage: 91,
      confidence: "High credential confidence",
      ncvetAligned: "4 of 6",
      expiringSoon: 1,
    },
    industryReadiness: {
      score: 86,
      role: "Data Engineer",
      percentile: "Top 10% of JECRC AI 2027",
      highlightText: "Data warehousing, SQL indexing, Spark jobs",
      gapHighlight: "Distributed orchestration 62, streaming 68",
      benchmark: "Bar is 70",
      radarScores: {
        dsa: 76,
        systemDesign: 84,
        fullStack: 70,
        cloud: 78,
        problemSolving: 85,
      },
    },
  },
  {
    id: "6",
    name: "Dev Malhotra",
    avatar: "DM",
    degree: "B.Tech Computer Science & Engineering",
    batch: "Class of 2026",
    university: "JECRC University",
    location: "Jaipur, Rajasthan",
    rollNo: "22ESKCS077",
    semester: "Semester 7 of 8",
    available: false,
    availabilityText: "Not actively looking",
    institutionVerified: true,
    identityVerified: true,
    profileVerified: true,

    readiness: 84,
    readinessLabel: "INDUSTRY READY",
    targetRole: "Backend Java Engineer",
    rubricsCount: 6,
    confidence: "High confidence",
    evidenceCoverage: 89,
    trendDays: "+6% in 90 days",

    cgpa: 8.5,
    verifiedSkillsCount: 11,
    projectsCount: 3,
    internshipsCount: 2,
    certificationsCount: 5,
    codingRating: "1340 Codeforces",

    academic: {
      cgpa: 8.5,
      trajectory: 86,
      trajectoryLabel: "Consistent",
      verifiedRange: "Sem 1 to 6",
      backlogs: 0,
      attendance: 88,
    },
    skills: {
      verifiedSkills: 11,
      avgCompetency: 83,
      strongestSkills: ["Java", "Spring", "SQL"],
      criticalGapsCount: 2,
      gapsList: "Microservices, gRPC",
      lastAssessed: "10 days ago",
    },
    digital: {
      subtitle: "Competitive programming and GitHub, combined",
      leetcodeSolved: 290,
      codeforcesRating: 1340,
      githubRepos: 31,
      signalText: "Solid OOP and relational database signal",
      commits90Days: 130,
      contestRankBest: "Top 15%",
    },
    experience: {
      subtitle: "Projects, internships, hackathons",
      projects: 3,
      internships: 2,
      hackathons: 1,
      verifiedCount: 3,
      latest: "Backend Intern, Oracle",
      hackathonBest: "Java Developers Cup",
    },
    credential: {
      subtitle: "Certifications, assessments, achievements",
      certifications: 5,
      assessments: 4,
      coverage: 89,
      confidence: "Oracle Java SE Certified",
      ncvetAligned: "4 of 5",
      expiringSoon: 0,
    },
    industryReadiness: {
      score: 84,
      role: "Backend Java Engineer",
      percentile: "Top 12% of JECRC CSE 2026",
      highlightText: "Spring Boot, REST APIs, Hibernate/JPA",
      gapHighlight: "Async message queues 61, System scaling 69",
      benchmark: "Bar is 70",
      radarScores: {
        dsa: 81,
        systemDesign: 80,
        fullStack: 65,
        cloud: 71,
        problemSolving: 83,
      },
    },
  },
  {
    id: "7",
    name: "Vihaan Gupta",
    avatar: "VG",
    degree: "B.Tech Electronics & Communication",
    batch: "Class of 2026",
    university: "JECRC University",
    location: "Jaipur, Rajasthan",
    rollNo: "22ESKEC019",
    semester: "Semester 7 of 8",
    available: true,
    availabilityText: "Available for internship",
    institutionVerified: true,
    identityVerified: true,
    profileVerified: true,

    readiness: 83,
    readinessLabel: "INDUSTRY READY",
    targetRole: "Embedded & Firmware Engineer",
    rubricsCount: 6,
    confidence: "High confidence",
    evidenceCoverage: 88,
    trendDays: "+9% in 90 days",

    cgpa: 8.3,
    verifiedSkillsCount: 9,
    projectsCount: 4,
    internshipsCount: 1,
    certificationsCount: 5,
    codingRating: "1220 Codeforces",

    academic: {
      cgpa: 8.3,
      trajectory: 85,
      trajectoryLabel: "Consistent",
      verifiedRange: "Sem 1 to 6",
      backlogs: 0,
      attendance: 93,
    },
    skills: {
      verifiedSkills: 9,
      avgCompetency: 82,
      strongestSkills: ["C", "Embedded", "Python"],
      criticalGapsCount: 2,
      gapsList: "RTOS, CAN bus",
      lastAssessed: "7 days ago",
    },
    digital: {
      subtitle: "Competitive programming and GitHub, combined",
      leetcodeSolved: 195,
      codeforcesRating: 1220,
      githubRepos: 22,
      signalText: "Low-level system and hardware abstraction signal",
      commits90Days: 110,
      contestRankBest: "Top 21%",
    },
    experience: {
      subtitle: "Projects, internships, hackathons",
      projects: 4,
      internships: 1,
      hackathons: 2,
      verifiedCount: 3,
      latest: "Hardware Intern, Intel Labs",
      hackathonBest: "Embedded IoT Summit 2nd",
    },
    credential: {
      subtitle: "Certifications, assessments, achievements",
      certifications: 5,
      assessments: 4,
      coverage: 88,
      confidence: "ARM Architecture Verified",
      ncvetAligned: "3 of 5",
      expiringSoon: 0,
    },
    industryReadiness: {
      score: 83,
      role: "Embedded & Firmware Engineer",
      percentile: "Top 8% of JECRC ECE 2026",
      highlightText: "Microcontrollers, C/C++, Device drivers",
      gapHighlight: "Real-time kernels 59, High-speed interfaces 67",
      benchmark: "Bar is 70",
      radarScores: {
        dsa: 72,
        systemDesign: 78,
        fullStack: 55,
        cloud: 60,
        problemSolving: 82,
      },
    },
  },
  {
    id: "8",
    name: "Ishita Rao",
    avatar: "IR",
    degree: "B.Tech Computer Science & Engineering",
    batch: "Class of 2027",
    university: "JECRC University",
    location: "Jaipur, Rajasthan",
    rollNo: "23ESKCS088",
    semester: "Semester 5 of 8",
    available: true,
    availabilityText: "Available for internship",
    institutionVerified: true,
    identityVerified: true,
    profileVerified: true,

    readiness: 79,
    readinessLabel: "NEARLY READY",
    targetRole: "Full Stack Developer",
    rubricsCount: 6,
    confidence: "Medium confidence",
    evidenceCoverage: 84,
    trendDays: "+12% in 90 days",

    cgpa: 8.1,
    verifiedSkillsCount: 9,
    projectsCount: 3,
    internshipsCount: 1,
    certificationsCount: 4,
    codingRating: "1190 Codeforces",

    academic: {
      cgpa: 8.1,
      trajectory: 82,
      trajectoryLabel: "Improving",
      verifiedRange: "Sem 1 to 4",
      backlogs: 0,
      attendance: 90,
    },
    skills: {
      verifiedSkills: 9,
      avgCompetency: 78,
      strongestSkills: ["Python", "Node.js", "SQL"],
      criticalGapsCount: 3,
      gapsList: "Docker, TypeScript, Unit Testing",
      lastAssessed: "14 days ago",
    },
    digital: {
      subtitle: "Competitive programming and GitHub, combined",
      leetcodeSolved: 175,
      codeforcesRating: 1190,
      githubRepos: 19,
      signalText: "Growing problem-solving trajectory",
      commits90Days: 95,
      contestRankBest: "Top 25%",
    },
    experience: {
      subtitle: "Projects, internships, hackathons",
      projects: 3,
      internships: 1,
      hackathons: 2,
      verifiedCount: 2,
      latest: "Web Intern, Zomato",
      hackathonBest: "JECRC CodeFest Finalist",
    },
    credential: {
      subtitle: "Certifications, assessments, achievements",
      certifications: 4,
      assessments: 3,
      coverage: 84,
      confidence: "Verified Web Development",
      ncvetAligned: "3 of 4",
      expiringSoon: 1,
    },
    industryReadiness: {
      score: 79,
      role: "Full Stack Developer",
      percentile: "Top 22% of JECRC CSE 2027",
      highlightText: "REST APIs, Node.js, Relational DBs",
      gapHighlight: "Containerization 52, TypeScript strictness 58",
      benchmark: "Bar is 70",
      radarScores: {
        dsa: 70,
        systemDesign: 68,
        fullStack: 82,
        cloud: 56,
        problemSolving: 75,
      },
    },
  },
  {
    id: "9",
    name: "Tanvi Kulkarni",
    avatar: "TK",
    degree: "B.Tech Information Technology",
    batch: "Class of 2027",
    university: "JECRC University",
    location: "Jaipur, Rajasthan",
    rollNo: "23ESKIT064",
    semester: "Semester 5 of 8",
    available: true,
    availabilityText: "Available for internship",
    institutionVerified: false,
    identityVerified: true,
    profileVerified: false,

    readiness: 77,
    readinessLabel: "NEARLY READY",
    targetRole: "Frontend Engineer",
    rubricsCount: 6,
    confidence: "Medium confidence",
    evidenceCoverage: 80,
    trendDays: "+10% in 90 days",

    cgpa: 7.9,
    verifiedSkillsCount: 8,
    projectsCount: 3,
    internshipsCount: 1,
    certificationsCount: 4,
    codingRating: "1120 Codeforces",

    academic: {
      cgpa: 7.9,
      trajectory: 80,
      trajectoryLabel: "Improving",
      verifiedRange: "Sem 1 to 4",
      backlogs: 0,
      attendance: 87,
    },
    skills: {
      verifiedSkills: 8,
      avgCompetency: 76,
      strongestSkills: ["React", "JavaScript", "CSS"],
      criticalGapsCount: 3,
      gapsList: "State Machines, Next.js, Jest",
      lastAssessed: "18 days ago",
    },
    digital: {
      subtitle: "Competitive programming and GitHub, combined",
      leetcodeSolved: 140,
      codeforcesRating: 1120,
      githubRepos: 16,
      signalText: "Component design & UI styling signal",
      commits90Days: 88,
      contestRankBest: "Top 30%",
    },
    experience: {
      subtitle: "Projects, internships, hackathons",
      projects: 3,
      internships: 1,
      hackathons: 1,
      verifiedCount: 2,
      latest: "UI Intern, Freshworks",
      hackathonBest: "DesignHacks Top 10",
    },
    credential: {
      subtitle: "Certifications, assessments, achievements",
      certifications: 4,
      assessments: 3,
      coverage: 80,
      confidence: "Pending institutional signoff",
      ncvetAligned: "2 of 4",
      expiringSoon: 0,
    },
    industryReadiness: {
      score: 77,
      role: "Frontend Engineer",
      percentile: "Top 26% of JECRC IT 2027",
      highlightText: "Responsive layouts, React hooks, CSS animations",
      gapHighlight: "Testing suites 48, SSR frameworks 55",
      benchmark: "Bar is 70",
      radarScores: {
        dsa: 65,
        systemDesign: 62,
        fullStack: 78,
        cloud: 50,
        problemSolving: 70,
      },
    },
  },
  {
    id: "10",
    name: "Rohan Verma",
    avatar: "RV",
    degree: "B.Tech Information Technology",
    batch: "Class of 2026",
    university: "JECRC University",
    location: "Jaipur, Rajasthan",
    rollNo: "22ESKIT049",
    semester: "Semester 7 of 8",
    available: true,
    availabilityText: "Available for internship",
    institutionVerified: true,
    identityVerified: true,
    profileVerified: true,

    readiness: 75,
    readinessLabel: "NEARLY READY",
    targetRole: "Backend Engineer",
    rubricsCount: 6,
    confidence: "Medium confidence",
    evidenceCoverage: 81,
    trendDays: "+6% in 90 days",

    cgpa: 8.2,
    verifiedSkillsCount: 8,
    projectsCount: 3,
    internshipsCount: 1,
    certificationsCount: 4,
    codingRating: "1150 Codeforces",

    academic: {
      cgpa: 8.2,
      trajectory: 81,
      trajectoryLabel: "Steady",
      verifiedRange: "Sem 1 to 6",
      backlogs: 0,
      attendance: 89,
    },
    skills: {
      verifiedSkills: 8,
      avgCompetency: 74,
      strongestSkills: ["Python", "Node.js", "SQL"],
      criticalGapsCount: 4,
      gapsList: "Docker, Redis, Cloud, Testing",
      lastAssessed: "21 days ago",
    },
    digital: {
      subtitle: "Competitive programming and GitHub, combined",
      leetcodeSolved: 160,
      codeforcesRating: 1150,
      githubRepos: 18,
      signalText: "Basic web API development signal",
      commits90Days: 78,
      contestRankBest: "Top 28%",
    },
    experience: {
      subtitle: "Projects, internships, hackathons",
      projects: 3,
      internships: 1,
      hackathons: 1,
      verifiedCount: 2,
      latest: "Backend Trainee, Paytm",
      hackathonBest: "Rajasthan TechFest",
    },
    credential: {
      subtitle: "Certifications, assessments, achievements",
      certifications: 4,
      assessments: 3,
      coverage: 81,
      confidence: "Verified Developer",
      ncvetAligned: "3 of 4",
      expiringSoon: 1,
    },
    industryReadiness: {
      score: 75,
      role: "Backend Engineer",
      percentile: "Top 30% of JECRC IT 2026",
      highlightText: "Express.js, CRUD operations, PostgreSQL",
      gapHighlight: "Caching layers 48, Microservice architecture 54",
      benchmark: "Bar is 70",
      radarScores: {
        dsa: 68,
        systemDesign: 65,
        fullStack: 72,
        cloud: 52,
        problemSolving: 71,
      },
    },
  },
  {
    id: "11",
    name: "Aditya Nair",
    avatar: "AN",
    degree: "B.Tech Mechanical Engineering",
    batch: "Class of 2026",
    university: "JECRC University",
    location: "Jaipur, Rajasthan",
    rollNo: "22ESKME012",
    semester: "Semester 7 of 8",
    available: true,
    availabilityText: "Available for internship",
    institutionVerified: true,
    identityVerified: true,
    profileVerified: true,

    readiness: 71,
    readinessLabel: "NEARLY READY",
    targetRole: "CAD & Simulation Engineer",
    rubricsCount: 6,
    confidence: "Medium confidence",
    evidenceCoverage: 76,
    trendDays: "+5% in 90 days",

    cgpa: 8.0,
    verifiedSkillsCount: 7,
    projectsCount: 3,
    internshipsCount: 1,
    certificationsCount: 3,
    codingRating: "N/A (Hardware focus)",

    academic: {
      cgpa: 8.0,
      trajectory: 79,
      trajectoryLabel: "Consistent",
      verifiedRange: "Sem 1 to 6",
      backlogs: 0,
      attendance: 94,
    },
    skills: {
      verifiedSkills: 7,
      avgCompetency: 72,
      strongestSkills: ["CAD", "MATLAB", "Python"],
      criticalGapsCount: 4,
      gapsList: "FEA, ANSYS, GD&T, C++",
      lastAssessed: "25 days ago",
    },
    digital: {
      subtitle: "Technical simulations and engineering models",
      leetcodeSolved: 45,
      codeforcesRating: 980,
      githubRepos: 11,
      signalText: "Computational simulation & math modeling",
      commits90Days: 45,
      contestRankBest: "Top 45%",
    },
    experience: {
      subtitle: "Projects, internships, hackathons",
      projects: 3,
      internships: 1,
      hackathons: 1,
      verifiedCount: 2,
      latest: "Design Intern, Tata Motors",
      hackathonBest: "BAJA SAE India Participant",
    },
    credential: {
      subtitle: "Certifications, assessments, achievements",
      certifications: 3,
      assessments: 2,
      coverage: 76,
      confidence: "Autodesk Certified Associate",
      ncvetAligned: "2 of 3",
      expiringSoon: 0,
    },
    industryReadiness: {
      score: 71,
      role: "CAD & Simulation Engineer",
      percentile: "Top 15% of JECRC ME 2026",
      highlightText: "SolidWorks 3D Modeling, MATLAB Numerical Methods",
      gapHighlight: "Finite element analysis 52, Thermal modeling 56",
      benchmark: "Bar is 70",
      radarScores: {
        dsa: 55,
        systemDesign: 65,
        fullStack: 40,
        cloud: 45,
        problemSolving: 78,
      },
    },
  },
  {
    id: "12",
    name: "Meera Joshi",
    avatar: "MJ",
    degree: "B.Tech Electronics & Communication",
    batch: "Class of 2027",
    university: "JECRC University",
    location: "Jaipur, Rajasthan",
    rollNo: "23ESKEC054",
    semester: "Semester 5 of 8",
    available: false,
    availabilityText: "Not looking for internship",
    institutionVerified: false,
    identityVerified: true,
    profileVerified: false,

    readiness: 63,
    readinessLabel: "DEVELOPING",
    targetRole: "VLSI / Digital Design Engineer",
    rubricsCount: 6,
    confidence: "Baseline confidence",
    evidenceCoverage: 68,
    trendDays: "+4% in 90 days",

    cgpa: 7.4,
    verifiedSkillsCount: 6,
    projectsCount: 2,
    internshipsCount: 0,
    certificationsCount: 2,
    codingRating: "920 Codeforces",

    academic: {
      cgpa: 7.4,
      trajectory: 72,
      trajectoryLabel: "Developing",
      verifiedRange: "Sem 1 to 4",
      backlogs: 0,
      attendance: 84,
    },
    skills: {
      verifiedSkills: 6,
      avgCompetency: 64,
      strongestSkills: ["C", "VHDL"],
      criticalGapsCount: 5,
      gapsList: "Verilog, FPGA, Timing Analysis, Python, Linux",
      lastAssessed: "30 days ago",
    },
    digital: {
      subtitle: "Hardware description scripts and repository commits",
      leetcodeSolved: 50,
      codeforcesRating: 920,
      githubRepos: 8,
      signalText: "Fundamental digital circuit modeling",
      commits90Days: 32,
      contestRankBest: "Top 52%",
    },
    experience: {
      subtitle: "Projects, internships, hackathons",
      projects: 2,
      internships: 0,
      hackathons: 1,
      verifiedCount: 1,
      latest: "College Lab Assistant",
      hackathonBest: "Robotics Club Expo",
    },
    credential: {
      subtitle: "Certifications, assessments, achievements",
      certifications: 2,
      assessments: 2,
      coverage: 68,
      confidence: "Academic coursework verified",
      ncvetAligned: "1 of 2",
      expiringSoon: 0,
    },
    industryReadiness: {
      score: 63,
      role: "VLSI / Digital Design Engineer",
      percentile: "Top 45% of JECRC ECE 2027",
      highlightText: "Digital Logic Design, Boolean Minimization",
      gapHighlight: "Synthesis constraints 42, Static timing 46",
      benchmark: "Bar is 70",
      radarScores: {
        dsa: 52,
        systemDesign: 54,
        fullStack: 35,
        cloud: 30,
        problemSolving: 64,
      },
    },
  },
];

export function getStudentProfile(id: string): StudentProfileData {
  const found = studentsDatabase.find((s) => s.id === id);
  if (found) return found;

  // Generate sensible dynamic fallback if an unlisted ID is requested
  const numId = parseInt(id, 10) || 1;
  const initialA = String.fromCharCode(65 + (numId % 26));
  const initialB = String.fromCharCode(65 + ((numId * 3) % 26));

  return {
    id: id || "1",
    name: `Student #${id}`,
    avatar: `${initialA}${initialB}`,
    degree: "B.Tech Computer Science & Engineering",
    batch: "Class of 2027",
    university: "JECRC University",
    location: "Jaipur, Rajasthan",
    rollNo: `23ESKCS0${(numId % 90) + 10}`,
    semester: "Semester 5 of 8",
    available: numId % 2 === 1,
    availabilityText: numId % 2 === 1 ? "Available for internship" : "Not actively seeking",
    institutionVerified: true,
    identityVerified: true,
    profileVerified: true,

    readiness: Math.min(95, Math.max(60, 75 + (numId % 20))),
    readinessLabel: "INDUSTRY READY",
    targetRole: "Software engineer",
    rubricsCount: 6,
    confidence: "High confidence",
    evidenceCoverage: 90,
    trendDays: "+8% in 90 days",

    cgpa: 8.5,
    verifiedSkillsCount: 10,
    projectsCount: 4,
    internshipsCount: 2,
    certificationsCount: 6,
    codingRating: "1350 Codeforces",

    academic: {
      cgpa: 8.5,
      trajectory: 88,
      trajectoryLabel: "Improving",
      verifiedRange: "Sem 1 to 4",
      backlogs: 0,
      attendance: 92,
    },
    skills: {
      verifiedSkills: 10,
      avgCompetency: 84,
      strongestSkills: ["Python", "DSA", "React"],
      criticalGapsCount: 2,
      gapsList: "Cloud, System Design",
      lastAssessed: "10 days ago",
    },
    digital: {
      subtitle: "Competitive programming and GitHub, combined",
      leetcodeSolved: 260,
      codeforcesRating: 1350,
      githubRepos: 30,
      signalText: "Strong problem-solving signal",
      commits90Days: 160,
      contestRankBest: "Top 15%",
    },
    experience: {
      subtitle: "Projects, internships, hackathons",
      projects: 4,
      internships: 2,
      hackathons: 2,
      verifiedCount: 3,
      latest: "Software Engineering Intern",
      hackathonBest: "National Hackathon Finalist",
    },
    credential: {
      subtitle: "Certifications, assessments, achievements",
      certifications: 6,
      assessments: 5,
      coverage: 90,
      confidence: "High credential confidence",
      ncvetAligned: "4 of 6",
      expiringSoon: 1,
    },
    industryReadiness: {
      score: 85,
      role: "Software engineer",
      percentile: "Top 12% of JECRC CSE 2027",
      highlightText: "Technical skills, project evidence, problem solving",
      gapHighlight: "Cloud computing 60, communication 72",
      benchmark: "Bar is 70",
      radarScores: {
        dsa: 85,
        systemDesign: 76,
        fullStack: 82,
        cloud: 62,
        problemSolving: 88,
      },
    },
  };
}
