export type AssessmentType = "company_benchmark" | "adaptive_cat" | "coding_lab" | "system_design" | "ai_voice_mock";
export type AssessmentDifficulty = "Beginner" | "Intermediate" | "Advanced" | "Principal";

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  explanation?: string;
}

export interface CodingChallengeSpec {
  problemStatement: string;
  starterCode: Record<string, string>; // language -> code
  testCases: TestCase[];
  timeComplexityOptimal: string;
  spaceComplexityOptimal: string;
}

export interface DiagnosticSubtopic {
  name: string;
  score: number; // percentage
  status: "mastered" | "developing" | "critical_gap";
  timeSpentSec: number;
  benchmarkMedianSec: number;
}

export interface PostMortemReport {
  overallScore: number;
  percentile: number;
  integrityScore: number; // 0-100%
  proctorAuditDigest: string; // SHA-256 hash
  ncrfCreditsEarned: number;
  timeSpentMinutes: number;
  subtopicBreakdown: DiagnosticSubtopic[];
  optimalCodeComparison: {
    studentApproach: string;
    optimalApproach: string;
    bigOTime: { student: string; optimal: string };
    bigOSpace: { student: string; optimal: string };
    aiCritique: string;
  };
}

export interface AssessmentItem {
  id: string;
  title: string;
  type: AssessmentType;
  difficulty: AssessmentDifficulty;
  durationMinutes: number;
  skillId: string;
  skillName: string;
  category: string;
  pointsGain: number; // Neo4j competency score delta
  hiringThreshold?: number; // e.g. 80
  sponsorCompany?: {
    name: string;
    logoColor: string;
    hiringReward: string;
  };
  summary: string;
  proctoringLevel: "Automated AI Proctoring" | "Dual-Camera Proctored" | "Light Anti-Cheat";
  codingSpec?: CodingChallengeSpec;
  sampleQuestionsCount?: number;
  isPopular?: boolean;
  decayWarningDays?: number; // if user took it > X days ago
  postMortemReport?: PostMortemReport;
}

export interface CompletedAssessmentRecord {
  id: string;
  assessmentId: string;
  title: string;
  type: AssessmentType;
  skillName: string;
  score: number;
  percentile: number;
  dateCompleted: string;
  proctorStatus: "100% Clean Attestation" | "Minor Tab Switch Flag" | "Verified Proctored";
  integrityHash: string;
  ncrfCredits: number;
  badgeAwarded: string;
  companyUnlocked?: string;
  postMortem: PostMortemReport;
}

export const assessmentsCatalog: AssessmentItem[] = [
  {
    id: "asm_razorpay_be",
    title: "Razorpay Backend Systems & Idempotency Benchmark",
    type: "company_benchmark",
    difficulty: "Advanced",
    durationMinutes: 45,
    skillId: "api",
    skillName: "REST & Distributed API Architecture",
    category: "High-Throughput Engineering",
    pointsGain: 6,
    hiringThreshold: 82,
    sponsorCompany: {
      name: "Razorpay",
      logoColor: "#0c2340",
      hiringReward: "Direct SDE-1 / Internship Interview Shortlist Token"
    },
    summary: "Implement an atomic, idempotent double-entry ledger endpoint in Python or TypeScript with distributed Redis lock protection and graceful timeout handling.",
    proctoringLevel: "Dual-Camera Proctored",
    sampleQuestionsCount: 3,
    isPopular: true,
    codingSpec: {
      problemStatement: `Design and implement an idempotent payment transaction processor function \`process_transaction(payload, idempotency_key)\`.
Your system must ensure that duplicate incoming requests with the same \`idempotency_key\` within a 120-second sliding window do not duplicate financial balances, but instead return the cached response with an HTTP 200 header \`X-Cache-Lookup: HIT\`.

Requirements:
1. Validate transaction schema (account_id, amount > 0, currency == 'INR').
2. Acquire atomic distributed lock to prevent concurrent race condition debits.
3. Commit transaction atomicity and return structured confirmation.`,
      starterCode: {
        python: `import time
from typing import Dict, Any

def process_transaction(payload: Dict[str, Any], idempotency_key: str, redis_mock: Dict[str, Any]) -> Dict[str, Any]:
    """
    Razorpay SDE Benchmark:
    Process an idempotent financial ledger transaction.
    """
    # 1. Check idempotency cache
    if idempotency_key in redis_mock:
        return {"status": "SUCCESS", "cached": True, "data": redis_mock[idempotency_key]}
        
    # TODO: Implement atomic balance verification and double-entry write
    account_id = payload.get("account_id")
    amount = payload.get("amount", 0)
    
    if amount <= 0:
        return {"status": "FAILED", "error": "INVALID_AMOUNT"}
        
    # Simulated atomic ledger entry
    result = {
        "transaction_id": f"txn_{int(time.time()*1000)}",
        "account_id": account_id,
        "amount": amount,
        "currency": "INR",
        "timestamp": int(time.time())
    }
    
    redis_mock[idempotency_key] = result
    return {"status": "SUCCESS", "cached": False, "data": result}
`,
        typescript: `interface TransactionPayload {
  account_id: string;
  amount: number;
  currency: string;
}

export function processTransaction(
  payload: TransactionPayload,
  idempotencyKey: string,
  cacheMock: Map<string, any>
): { status: string; cached: boolean; data?: any; error?: string } {
  // Check idempotency cache
  if (cacheMock.has(idempotencyKey)) {
    return { status: "SUCCESS", cached: true, data: cacheMock.get(idempotencyKey) };
  }
  
  if (payload.amount <= 0) {
    return { status: "FAILED", cached: false, error: "INVALID_AMOUNT" };
  }

  const result = {
    transaction_id: "txn_" + Date.now(),
    account_id: payload.account_id,
    amount: payload.amount,
    currency: "INR",
    timestamp: Date.now()
  };

  cacheMock.set(idempotencyKey, result);
  return { status: "SUCCESS", cached: false, data: result };
}
`
      },
      testCases: [
        {
          id: "tc1",
          input: "payload={'account_id':'acc_01','amount':500,'currency':'INR'}, key='idem_9981'",
          expectedOutput: "status='SUCCESS', cached=False",
          explanation: "First execution writes cleanly to balance."
        },
        {
          id: "tc2",
          input: "payload={'account_id':'acc_01','amount':500,'currency':'INR'}, key='idem_9981' (Repeated)",
          expectedOutput: "status='SUCCESS', cached=True",
          explanation: "Duplicate submit must return cached payload without double debiting."
        },
        {
          id: "tc3",
          input: "payload={'account_id':'acc_01','amount':-100,'currency':'INR'}, key='idem_neg'",
          expectedOutput: "status='FAILED', error='INVALID_AMOUNT'",
          isHidden: true,
          explanation: "Negative amounts must fail strict ledger validation."
        }
      ],
      timeComplexityOptimal: "O(1) amortized via Redis HSET",
      spaceComplexityOptimal: "O(1) with 120s TTL eviction"
    }
  },

  {
    id: "asm_cat_docker",
    title: "Docker & Container Architecture (Adaptive CAT)",
    type: "adaptive_cat",
    difficulty: "Intermediate",
    durationMinutes: 20,
    skillId: "docker",
    skillName: "Docker & Containerization",
    category: "DevOps & Cloud Systems",
    pointsGain: 5,
    summary: "12 adaptive questions scaling from fundamental cgroups/namespaces to multi-stage image optimization and Compose bridge routing.",
    proctoringLevel: "Automated AI Proctoring",
    sampleQuestionsCount: 12,
    isPopular: true
  },

  {
    id: "asm_google_dsa",
    title: "Google Algorithmic Sprint: Graph & Dynamic Programming",
    type: "company_benchmark",
    difficulty: "Principal",
    durationMinutes: 60,
    skillId: "dsa",
    skillName: "Data Structures & Algorithms",
    category: "Algorithmic Problem Solving",
    pointsGain: 8,
    hiringThreshold: 85,
    sponsorCompany: {
      name: "Google",
      logoColor: "#4285f4",
      hiringReward: "Fast-track consideration for Google Summer of Code / SWE 2026"
    },
    summary: "Two high-complexity algorithmic challenges: Minimum Spanning Tree routing with dynamic constraints and Topological Sort for asynchronous DAG task orchestration.",
    proctoringLevel: "Dual-Camera Proctored",
    sampleQuestionsCount: 2,
    isPopular: true
  },

  {
    id: "asm_cat_redis",
    title: "Redis In-Memory Concurrency & Eviction Diagnostic",
    type: "adaptive_cat",
    difficulty: "Intermediate",
    durationMinutes: 18,
    skillId: "redis",
    skillName: "Redis & In-Memory Caching",
    category: "Databases & Storage",
    pointsGain: 4,
    decayWarningDays: 120, // Decay alert trigger!
    summary: "Pinpoint your exact proficiency in ZSET leaderboards, sliding-window rate limiters, Cache Stampede mitigation, and Redlock distributed mutexes.",
    proctoringLevel: "Automated AI Proctoring",
    sampleQuestionsCount: 10
  },

  {
    id: "asm_voice_sysdesign",
    title: "AI Voice Mock Interview: Scalable Flash Sale Architecture",
    type: "ai_voice_mock",
    difficulty: "Advanced",
    durationMinutes: 15,
    skillId: "sysdesign",
    skillName: "System Design & Distributed Scaling",
    category: "Architectural Interview",
    pointsGain: 6,
    summary: "Simulated conversational technical screen with an AI Staff Engineer. Explain caching tiers, queue backpressure, and database sharding under 100k TPS.",
    proctoringLevel: "Automated AI Proctoring",
    sampleQuestionsCount: 4,
    isPopular: true
  },

  {
    id: "asm_cloud_aws",
    title: "AWS ECS Fargate & Cloud Security Lab",
    type: "coding_lab",
    difficulty: "Advanced",
    durationMinutes: 35,
    skillId: "cloud",
    skillName: "Cloud Architecture (AWS ECS/S3)",
    category: "DevOps & Infrastructure",
    pointsGain: 5,
    summary: "Configure Terraform / CloudFormation manifests for a zero-downtime container rollout behind an Application Load Balancer with strict IAM least privilege.",
    proctoringLevel: "Automated AI Proctoring",
    sampleQuestionsCount: 2
  }
];

export const completedAssessmentsHistory: CompletedAssessmentRecord[] = [
  {
    id: "comp_py_core",
    assessmentId: "asm_py_oop",
    title: "Python 3.12 Internals & AsyncIO Concurrency Benchmark",
    type: "adaptive_cat",
    skillName: "Python & Core OOP Architecture",
    score: 94,
    percentile: 96.2,
    dateCompleted: "Aug 24, 2026",
    proctorStatus: "100% Clean Attestation",
    integrityHash: "0x8f2a9c41d3e8b091f62e8412e84193b2a8f94101e479102cba8921df67184201",
    ncrfCredits: 2.0,
    badgeAwarded: "Python Concurrency Master (NSQF Level 7)",
    companyUnlocked: "CRED, Razorpay Tier-1 Shortlist",
    postMortem: {
      overallScore: 94,
      percentile: 96.2,
      integrityScore: 100,
      proctorAuditDigest: "0x8f2a9c41d3e8b091f62e8412e84193b2a8f94101e479102cba8921df67184201",
      ncrfCreditsEarned: 2.0,
      timeSpentMinutes: 18,
      subtopicBreakdown: [
        { name: "CPython Memory & GIL Behavior", score: 98, status: "mastered", timeSpentSec: 210, benchmarkMedianSec: 320 },
        { name: "AsyncIO Event Loop & uvloop", score: 92, status: "mastered", timeSpentSec: 240, benchmarkMedianSec: 280 },
        { name: "Generators & Metaclasses", score: 95, status: "mastered", timeSpentSec: 180, benchmarkMedianSec: 260 },
        { name: "Multiprocessing Memory Serialization", score: 91, status: "mastered", timeSpentSec: 230, benchmarkMedianSec: 240 }
      ],
      optimalCodeComparison: {
        studentApproach: "Used asyncio.gather with Semaphore(100) worker pools.",
        optimalApproach: "uvloop with TaskGroup and zero-copy orjson payload deserialization.",
        bigOTime: { student: "O(N)", optimal: "O(N) with 3.4x higher I/O throughput" },
        bigOSpace: { student: "O(M) memory buffer", optimal: "O(M) streaming generator" },
        aiCritique: "Exceptional mastery of asynchronous execution semantics. Code scored in top 3.8% nationally. Meets Razorpay Principal L5 criteria."
      }
    }
  },

  {
    id: "comp_sql_opt",
    assessmentId: "asm_sql_pro",
    title: "SQL Query Optimization & 10M Row Index Tuning",
    type: "coding_lab",
    skillName: "SQL & Relational Query Optimization",
    score: 88,
    percentile: 91.5,
    dateCompleted: "May 12, 2026",
    proctorStatus: "100% Clean Attestation",
    integrityHash: "0x4b711e99812df0814c1209b55217981ab23910c812ef64098214fa8172901234",
    ncrfCredits: 2.0,
    badgeAwarded: "Relational Optimization Specialist (NSQF Level 7)",
    companyUnlocked: "Swiggy, Oracle",
    postMortem: {
      overallScore: 88,
      percentile: 91.5,
      integrityScore: 100,
      proctorAuditDigest: "0x4b711e99812df0814c1209b55217981ab23910c812ef64098214fa8172901234",
      ncrfCreditsEarned: 2.0,
      timeSpentMinutes: 32,
      subtopicBreakdown: [
        { name: "B-Tree Leaf Node Layout & Clustered Indexes", score: 96, status: "mastered", timeSpentSec: 320, benchmarkMedianSec: 420 },
        { name: "Covering Indexes & Index-Only Scans", score: 92, status: "mastered", timeSpentSec: 290, benchmarkMedianSec: 360 },
        { name: "ACID Isolation Levels & Phantom Reads", score: 84, status: "mastered", timeSpentSec: 410, benchmarkMedianSec: 380 },
        { name: "Distributed Sharding & Partition Pruning", score: 72, status: "developing", timeSpentSec: 540, benchmarkMedianSec: 390 }
      ],
      optimalCodeComparison: {
        studentApproach: "Composite index on (status, created_at) with EXPLAIN ANALYZE.",
        optimalApproach: "Partial index WHERE status = 'PENDING' combined with INCLUDE (user_id).",
        bigOTime: { student: "O(log N) scan", optimal: "O(log K) partial index scan (3x smaller tree)" },
        bigOSpace: { student: "140 MB index size", optimal: "18 MB partial index size" },
        aiCritique: "Demonstrated strong query plan diagnostic ability. Upgrading to partial indexing will save substantial SSD I/O in write-heavy workloads."
      }
    }
  }
];
