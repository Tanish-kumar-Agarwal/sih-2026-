export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  topics: string[];
  estimatedHours: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  completed: boolean;
}

export interface YouTubeLecture {
  id: string;
  title: string;
  channel: string;
  duration: string;
  youtubeId: string; // Valid YouTube video ID for embed/direct watch
  views: string;
  topicsCovered: string[];
  recommendedBadge?: string;
}

export interface CourseOffering {
  id: string;
  title: string;
  provider: "NPTEL / Swayam" | "Coursera" | "edX" | "MIT OCW" | "Udemy" | "Linux Foundation" | "freeCodeCamp";
  isFree: boolean;
  financialAidAvailable?: boolean;
  priceTag: string; // "100% Free" | "Free Audit" | "₹499" | "Financial Aid Available"
  rating: number;
  reviewsCount: string;
  durationWeeks: number;
  certificateType: "Govt. of India (NCVET)" | "University Verified" | "Industry Standard" | "Completion Certificate";
  url: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ProjectSuggestion {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Production Capstone";
  summary: string;
  keyTechnologies: string[];
  starterRepoCmd: string;
  portfolioScoreGain: string;
  architectureHighlights: string[];
  deliverables: string[];
}

export interface MasterySkillItem {
  id: string;
  name: string;
  group: "prog" | "data" | "sys";
  groupName: string;
  category: string;
  iconType: string;
  status: "mastered" | "developing" | "gap";
  gapWord: string;
  currentLevel: "Basic" | "Intermediate" | "Advanced";
  requiredLevel: "Intermediate" | "Advanced";
  score: number;
  benchmark: number;
  verifiedEvidenceCount: {
    projects: number;
    certs: number;
    assessments: number;
    githubRepos: number;
  };
  hiringImpact: {
    targetCompanies: string[];
    matchScoreDelta: string;
    unlockedRoles: string;
    industryInsight: string;
  };
  roadmap: RoadmapMilestone[];
  youtubeLectures: YouTubeLecture[];
  courses: CourseOffering[];
  quiz: {
    quizTitle: string;
    pointsGain: number;
    estimatedMinutes: number;
    questions: QuizQuestion[];
  };
  projects: ProjectSuggestion[];
}

export const skillsMasteryCatalog: Record<string, MasterySkillItem> = {
  docker: {
    id: "docker",
    name: "Docker & Containerization",
    group: "sys",
    groupName: "Systems & Cloud",
    category: "DevOps & Infrastructure",
    iconType: "server",
    status: "gap",
    gapWord: "Critical Gap (-21%)",
    currentLevel: "Basic",
    requiredLevel: "Intermediate",
    score: 54,
    benchmark: 75,
    verifiedEvidenceCount: { projects: 1, certs: 0, assessments: 0, githubRepos: 2 },
    hiringImpact: {
      targetCompanies: ["Razorpay", "Zomato", "CRED", "Microsoft"],
      matchScoreDelta: "+16% Overall Match",
      unlockedRoles: "Backend Developer, Platform Engineer, SRE Intern",
      industryInsight: "Top 94% of backend requisitions require multi-stage Docker builds & Compose orchestration for production deployments."
    },
    roadmap: [
      {
        id: "m1",
        title: "Milestone 1: Container Architecture & Basic CLI",
        description: "Understand Linux cgroups, namespaces, image layers, and essential Docker daemon commands.",
        topics: ["Images vs Containers", "Layer Caching Mechanisms", "docker run, exec, logs, ps", "Port Mapping & Environment Variables"],
        estimatedHours: 4,
        difficulty: "Beginner",
        completed: true,
      },
      {
        id: "m2",
        title: "Milestone 2: Production Dockerfiles & Multi-Stage Builds",
        description: "Craft slim, secure production images using alpine bases, non-root users, and multi-stage compilation.",
        topics: ["Multi-stage Build Pipelines", "Minimizing Image Size (< 80MB)", ".dockerignore Optimization", "USER & Security Hardening"],
        estimatedHours: 6,
        difficulty: "Intermediate",
        completed: false,
      },
      {
        id: "m3",
        title: "Milestone 3: Docker Compose & Network Topologies",
        description: "Orchestrate multi-container backend environments with persistent volumes and bridge networks.",
        topics: ["Compose v2 Specifications", "Bridge vs Host Networks", "Named Volumes & Data Persistence", "Service Dependencies & Healthchecks"],
        estimatedHours: 8,
        difficulty: "Intermediate",
        completed: false,
      },
      {
        id: "m4",
        title: "Milestone 4: Cloud Registry & Deployment Capstone",
        description: "Push verified image manifests to AWS ECR/DockerHub and deploy into a container runner.",
        topics: ["GitHub Actions CI/CD to Docker Hub", "Image Vulnerability Scanning (Trivy)", "ECS/Fargate Deployment Manifests", "Graceful SIGTERM Handling"],
        estimatedHours: 10,
        difficulty: "Advanced",
        completed: false,
      },
    ],
    youtubeLectures: [
      {
        id: "yt_doc_1",
        title: "Docker Tutorial for Beginners [Full Course - Hands-On]",
        channel: "TechWorld with Nana",
        duration: "2h 45m",
        youtubeId: "3c-iBn73dDE",
        views: "5.8M views",
        recommendedBadge: "Top Pick for Beginners",
        topicsCovered: ["Architecture", "CLI commands", "Port mapping", "Docker Compose", "Volumes"],
      },
      {
        id: "yt_doc_2",
        title: "Docker Crash Course for Modern Backend Developers",
        channel: "freeCodeCamp.org",
        duration: "1h 55m",
        youtubeId: "pg19Z8LL06w",
        views: "2.1M views",
        recommendedBadge: "Deep Dive",
        topicsCovered: ["Multi-stage builds", "Node/Python containerization", "Environment files", "Production best practices"],
      },
      {
        id: "yt_doc_3",
        title: "Docker Networking & Storage Deep Dive",
        channel: "Hussein Nasser",
        duration: "48m",
        youtubeId: "bKFMS5C4CG0",
        views: "420K views",
        recommendedBadge: "Architecture Mastery",
        topicsCovered: ["Linux iptables & Bridge", "DNS resolution in Compose", "Volume drivers", "Host networking bottlenecks"],
      },
      {
        id: "yt_doc_4",
        title: "Docker in 100 Seconds + Practical Walkthrough",
        channel: "Fireship",
        duration: "12m",
        youtubeId: "Gjnup-PuquQ",
        views: "1.9M views",
        topicsCovered: ["Quick mental model", "Dockerfile directives", "Container lifecycle"],
      }
    ],
    courses: [
      {
        id: "c_doc_1",
        title: "Cloud Computing & Container Systems (CS60023)",
        provider: "NPTEL / Swayam",
        isFree: true,
        financialAidAvailable: false,
        priceTag: "100% Free (Govt. of India)",
        rating: 4.8,
        reviewsCount: "14.2k students",
        durationWeeks: 8,
        certificateType: "Govt. of India (NCVET)",
        url: "https://swayam.gov.in/explorer?searchText=cloud+container",
      },
      {
        id: "c_doc_2",
        title: "Docker & Kubernetes: The Complete Practical Guide",
        provider: "Udemy",
        isFree: false,
        priceTag: "₹499 (Sale)",
        rating: 4.8,
        reviewsCount: "94,200 reviews",
        durationWeeks: 6,
        certificateType: "Industry Standard",
        url: "https://www.udemy.com/topic/docker/",
      },
      {
        id: "c_doc_3",
        title: "Continuous Delivery & DevOps with Docker",
        provider: "Coursera",
        isFree: false,
        financialAidAvailable: true,
        priceTag: "Financial Aid Available (100% Off)",
        rating: 4.7,
        reviewsCount: "28,500 reviews",
        durationWeeks: 4,
        certificateType: "University Verified",
        url: "https://www.coursera.org/learn/uva-darden-continuous-delivery-devops",
      },
      {
        id: "c_doc_4",
        title: "Introduction to Containers, Kubernetes and OpenShift",
        provider: "edX",
        isFree: true,
        financialAidAvailable: true,
        priceTag: "Free Audit Available",
        rating: 4.6,
        reviewsCount: "18,400 students",
        durationWeeks: 5,
        certificateType: "Industry Standard",
        url: "https://www.edx.org/learn/docker",
      }
    ],
    quiz: {
      quizTitle: "Docker Architecture & Multi-Stage Build Evaluation",
      pointsGain: 4,
      estimatedMinutes: 8,
      questions: [
        {
          id: "q_doc_1",
          question: "Why should multi-stage builds be used when packaging a compiled backend language (e.g. Go, Rust, or TypeScript)?",
          options: [
            "To speed up container startup time by 10x automatically",
            "To isolate build dependencies in intermediate stages, keeping the final production image minimal and secure",
            "Because Docker Compose requires at least two FROM statements",
            "To prevent Docker from caching intermediate layers"
          ],
          correctIndex: 1,
          explanation: "Multi-stage builds allow you to use a heavy SDK/compiler image in stage 1, and copy only the final compiled binary or dist folder into a featherweight alpine/distroless base in stage 2, eliminating compilers and vulnerable tools from production."
        },
        {
          id: "q_doc_2",
          question: "Which directive in a Dockerfile sets the default executable and makes the container behave like a dedicated binary tool?",
          options: ["RUN", "CMD", "ENTRYPOINT", "EXPOSE"],
          correctIndex: 2,
          explanation: "ENTRYPOINT defines the root executable for the container, allowing parameters passed to 'docker run' to be appended directly as CLI arguments."
        },
        {
          id: "q_doc_3",
          question: "When connecting a FastAPI backend container to a PostgreSQL container using Docker Compose, what hostname should the backend use in its DB connection string?",
          options: [
            "localhost",
            "127.0.0.1",
            "The service name defined in docker-compose.yml (e.g., 'postgres_db')",
            "host.docker.internal"
          ],
          correctIndex: 2,
          explanation: "Docker Compose automatically spins up an isolated user-defined bridge network where each container can resolve other containers via their Compose service name using built-in internal DNS."
        },
        {
          id: "q_doc_4",
          question: "What is the primary difference between a Docker Volume and a Bind Mount?",
          options: [
            "Volumes are managed completely by Docker under /var/lib/docker/volumes/, while Bind Mounts rely directly on a specific host directory path",
            "Bind mounts are faster for all databases in production",
            "Volumes cannot be shared between multiple containers",
            "Bind mounts are automatically encrypted by Linux cgroups"
          ],
          correctIndex: 0,
          explanation: "Volumes are managed exclusively by Docker storage drivers and are portable across environments, whereas bind mounts directly reference host filesystems and can introduce OS-specific permission and path bugs."
        }
      ]
    },
    projects: [
      {
        id: "proj_doc_1",
        title: "Multi-Tier Microservice Orchestration with Docker Compose",
        level: "Intermediate",
        summary: "Architect and containerize a three-tier system: React frontend, Node/Python API gateway, and PostgreSQL database with Redis caching and healthcheck probes.",
        keyTechnologies: ["Docker", "Docker Compose", "PostgreSQL", "Redis", "Nginx"],
        starterRepoCmd: "git clone https://github.com/skillsetu-starter/docker-compose-multitier.git",
        portfolioScoreGain: "+12 Verified Points",
        architectureHighlights: [
          "Non-root USER directives and Alpine base images (<60MB)",
          "Custom bridge network with segregated database subnets",
          "Healthcheck configuration with interval and retry logic"
        ],
        deliverables: [
          "Dockerfile for API with multi-stage build",
          "docker-compose.yml with 4 interconnected services",
          "Live evidence screenshot and passing Trivy vulnerability audit report"
        ]
      },
      {
        id: "proj_doc_2",
        title: "Automated CI/CD Container Pipeline to GitHub Packages & ECR",
        level: "Production Capstone",
        summary: "Set up a complete GitHub Actions CI pipeline that lints Dockerfiles (Hadolint), runs unit tests inside a container, builds multi-arch images (AMD64/ARM64), and tags semantic releases.",
        keyTechnologies: ["GitHub Actions", "Docker Buildx", "AWS ECR", "Trivy Security"],
        starterRepoCmd: "git clone https://github.com/skillsetu-starter/container-cicd-pipeline.git",
        portfolioScoreGain: "+18 Verified Points",
        architectureHighlights: [
          "Docker Buildx with QEMU multi-architecture support",
          "Automated SBOM generation and CVE threshold gating",
          "Zero-downtime rolling deployment webhook trigger"
        ],
        deliverables: [
          ".github/workflows/docker-publish.yml workflow file",
          "Signed image digest manifest on GitHub Container Registry (ghcr.io)",
          "Recorded terminal asciinema proof-of-work"
        ]
      }
    ]
  },

  redis: {
    id: "redis",
    name: "Redis & In-Memory Caching",
    group: "data",
    groupName: "Data & Storage",
    category: "Databases & Storage",
    iconType: "database",
    status: "gap",
    gapWord: "Moderate Gap (-22%)",
    currentLevel: "Basic",
    requiredLevel: "Intermediate",
    score: 48,
    benchmark: 70,
    verifiedEvidenceCount: { projects: 1, certs: 0, assessments: 0, githubRepos: 1 },
    hiringImpact: {
      targetCompanies: ["Swiggy", "Blinkit", "PhonePe", "Flipkart"],
      matchScoreDelta: "+14% Overall Match",
      unlockedRoles: "High-Throughput Backend Dev, Distributed Systems Engineer",
      industryInsight: "Real-time ordering, session management, and rate limiting at top tech firms strictly test Redis data structures (Hashes, Sorted Sets, Streams)."
    },
    roadmap: [
      {
        id: "m_r1",
        title: "Milestone 1: Redis Data Structures & In-Memory Fundamentals",
        description: "Master Strings, Hashes, Lists, Sets, and Sorted Sets (ZSETs) with time complexity analysis.",
        topics: ["Key-Value Storage & TTL", "Hashes vs JSON blobs", "Sorted Sets for Leaderboards", "O(1) vs O(N) dangerous commands"],
        estimatedHours: 5,
        difficulty: "Beginner",
        completed: true,
      },
      {
        id: "m_r2",
        title: "Milestone 2: Caching Patterns & Eviction Policies",
        description: "Implement Cache-Aside, Write-Through, Write-Behind and mitigate cache stampede / avalanche.",
        topics: ["Cache-Aside Pattern", "LRU / LFU Eviction Algorithms", "Cache Penetration & Bloom Filters", "Cache Stampede (Mutual Locks / Jitter)"],
        estimatedHours: 6,
        difficulty: "Intermediate",
        completed: false,
      },
      {
        id: "m_r3",
        title: "Milestone 3: Redis Pub/Sub, Streams & Distributed Locks",
        description: "Build asynchronous messaging queues and implement Redlock distributed synchronization.",
        topics: ["Pub/Sub vs Redis Streams", "Consumer Groups & Message ACK", "Distributed Locking with Redlock", "Pipelining & Lua Scripting"],
        estimatedHours: 8,
        difficulty: "Intermediate",
        completed: false,
      },
      {
        id: "m_r4",
        title: "Milestone 4: Clustering, Persistence & High Availability",
        description: "Configure Redis Sentinel for auto-failover, RDB snapshots, and AOF append logs.",
        topics: ["RDB vs AOF Persistence", "Sentinel Master-Replica Failover", "Redis Cluster Sharding & Hash Slots", "Memory Sizing & Benchmarking"],
        estimatedHours: 8,
        difficulty: "Advanced",
        completed: false,
      }
    ],
    youtubeLectures: [
      {
        id: "yt_red_1",
        title: "Redis Full Course - Learn In-Memory Database in 2 Hours",
        channel: "freeCodeCamp.org",
        duration: "2h 10m",
        youtubeId: "jgpVdJB2sKQ",
        views: "1.4M views",
        recommendedBadge: "Comprehensive Guide",
        topicsCovered: ["Data structures", "CLI commands", "Persistence (RDB/AOF)", "NodeJS & Python integrations"],
      },
      {
        id: "yt_red_2",
        title: "Redis Crash Course - Why is it so fast?",
        channel: "Hussein Nasser",
        duration: "45m",
        youtubeId: "OqCK95AS-YE",
        views: "580K views",
        recommendedBadge: "System Architecture",
        topicsCovered: ["Single-threaded event loop (epoll)", "Memory vs Disk", "Pipelining benefits", "Lock-free concurrency"],
      },
      {
        id: "yt_red_3",
        title: "Redis System Design - Rate Limiting & Leaderboards",
        channel: "NeetCode",
        duration: "22m",
        youtubeId: "CRgpWeUcwk8",
        views: "420K views",
        recommendedBadge: "Interview Masterclass",
        topicsCovered: ["Sliding Window Rate Limiter", "ZADD & ZREVRANGE", "Token Bucket Algorithm"],
      }
    ],
    courses: [
      {
        id: "c_red_1",
        title: "Redis for High-Performance Backend Applications",
        provider: "Udemy",
        isFree: false,
        priceTag: "₹499 (Sale)",
        rating: 4.8,
        reviewsCount: "12,800 reviews",
        durationWeeks: 4,
        certificateType: "Industry Standard",
        url: "https://www.udemy.com/topic/redis/",
      },
      {
        id: "c_red_2",
        title: "Distributed Data Management & Caching",
        provider: "edX",
        isFree: true,
        financialAidAvailable: true,
        priceTag: "Free Audit Available",
        rating: 4.7,
        reviewsCount: "15,200 students",
        durationWeeks: 6,
        certificateType: "University Verified",
        url: "https://www.edx.org/learn/redis",
      },
      {
        id: "c_red_3",
        title: "Redis Certified Developer & Operator Program",
        provider: "Coursera",
        isFree: false,
        financialAidAvailable: true,
        priceTag: "Financial Aid Available (100% Off)",
        rating: 4.9,
        reviewsCount: "8,900 reviews",
        durationWeeks: 5,
        certificateType: "Industry Standard",
        url: "https://www.coursera.org",
      }
    ],
    quiz: {
      quizTitle: "Redis Data Structures & Concurrency Evaluation",
      pointsGain: 3,
      estimatedMinutes: 6,
      questions: [
        {
          id: "q_red_1",
          question: "Which Redis data structure is optimal for implementing an Olympic live leaderboard where millions of scores are dynamically updated and ranked in real-time?",
          options: [
            "Redis List (LPUSH / LRANGE)",
            "Redis Hash (HSET / HGETALL)",
            "Redis Sorted Set (ZADD / ZREVRANK)",
            "Redis Bitmaps"
          ],
          correctIndex: 2,
          explanation: "Sorted Sets (ZSET) maintain elements in logarithmic order (O(log N)) using a dual Hash and SkipList structure, allowing instantaneous rank lookups with ZREVRANK and top-K range extraction."
        },
        {
          id: "q_red_2",
          question: "What is a 'Cache Avalanche' and how is it primarily mitigated in production systems?",
          options: [
            "A hardware failure in RAM; mitigated by rebooting the Redis server",
            "A scenario where thousands of cached keys expire simultaneously, flooding the primary database; mitigated by adding random jitter to key TTLs",
            "When Redis runs out of memory; mitigated by deleting all keys",
            "When clients send malformed JSON"
          ],
          correctIndex: 1,
          explanation: "When keys share an identical expiration timestamp, they all expire together. Adding random jitter (e.g., base TTL + random 1-5 minutes) smooths out database queries over time."
        },
        {
          id: "q_red_3",
          question: "How does Redis execute transactions and atomic multi-key scripts without concurrency race conditions?",
          options: [
            "By locking the entire host operating system kernel",
            "Via Lua scripting executed synchronously inside Redis's single-threaded event loop",
            "By spawning a multi-threaded POSIX lock for every key",
            "Redis does not support atomic operations"
          ],
          correctIndex: 1,
          explanation: "Redis executes Lua scripts atomically inside its core event-driven loop; no other command can interrupt the script while it runs, guaranteeing transactional atomicity without distributed lock overhead."
        }
      ]
    },
    projects: [
      {
        id: "proj_red_1",
        title: "Distributed Token Bucket Rate Limiter with Redis & Express/FastAPI",
        level: "Intermediate",
        summary: "Develop an industrial API rate-limiting middleware that throttles unauthorized consumers to 100 req/min and premium clients to 5000 req/min using Redis atomic scripts.",
        keyTechnologies: ["Redis", "FastAPI / Node", "Lua Scripts", "Docker"],
        starterRepoCmd: "git clone https://github.com/skillsetu-starter/redis-rate-limiter.git",
        portfolioScoreGain: "+14 Verified Points",
        architectureHighlights: [
          "Atomic Lua script for sliding window counter calculation",
          "HTTP 429 response payload with Retry-After and X-RateLimit headers",
          "Benchmark test demonstrating 25,000 req/sec throughput with k6"
        ],
        deliverables: [
          "Rate limiter middleware library with unit test coverage",
          "k6 stress test script with p99 latency graphs (<2ms)",
          "Interactive documentation demo"
        ]
      }
    ]
  },

  cloud: {
    id: "cloud",
    name: "Cloud Architecture (AWS ECS/S3)",
    group: "sys",
    groupName: "Systems & Cloud",
    category: "DevOps & Infrastructure",
    iconType: "cloud",
    status: "gap",
    gapWord: "Critical Gap (-28%)",
    currentLevel: "Basic",
    requiredLevel: "Intermediate",
    score: 42,
    benchmark: 70,
    verifiedEvidenceCount: { projects: 0, certs: 0, assessments: 0, githubRepos: 0 },
    hiringImpact: {
      targetCompanies: ["AWS", "Freshworks", "Paytm", "Innovaccer"],
      matchScoreDelta: "+18% Overall Match",
      unlockedRoles: "Cloud Engineer, Backend Developer, SRE Associate",
      industryInsight: "Demonstrated deployment of containerized workloads to cloud compute (ECS/EKS) with secure IAM roles is mandatory for 80% of Tier-1 campus selections."
    },
    roadmap: [
      {
        id: "m_c1",
        title: "Milestone 1: IAM Least Privilege & Cloud Security Fundamentals",
        description: "Master IAM roles, policies, STS assume role, and VPC networking basics.",
        topics: ["IAM Policies vs Roles", "Root Account Hardening & MFA", "VPC, Subnets & Security Groups", "AWS CLI configuration"],
        estimatedHours: 6,
        difficulty: "Beginner",
        completed: false,
      },
      {
        id: "m_c2",
        title: "Milestone 2: S3 Object Storage & CDN Architecture",
        description: "Store, lifecycle, and securely deliver assets using S3 Presigned URLs and CloudFront.",
        topics: ["S3 Bucket Policies & CORS", "Presigned URLs for Secure Uploads", "S3 Intelligent Tiering & Lifecycle", "CloudFront CDN Caching"],
        estimatedHours: 6,
        difficulty: "Intermediate",
        completed: false,
      },
      {
        id: "m_c3",
        title: "Milestone 3: AWS ECS Fargate & Application Load Balancers",
        description: "Deploy serverless containerized tasks on ECS Fargate fronted by an ALB with SSL.",
        topics: ["ECS Task Definitions & Cluster", "Fargate Serverless vs EC2 launch types", "ALB Target Groups & Healthchecks", "AWS Secrets Manager & CloudWatch Logs"],
        estimatedHours: 10,
        difficulty: "Intermediate",
        completed: false,
      },
      {
        id: "m_c4",
        title: "Milestone 4: Infrastructure as Code (Terraform) Capstone",
        description: "Provision reproducible cloud environments using declarative Terraform modules.",
        topics: ["Terraform State & S3 Backend", "VPC & ECS Module Composition", "Terraform Plan / Apply automation", "Cost Estimation & Budget Alerts"],
        estimatedHours: 12,
        difficulty: "Advanced",
        completed: false,
      }
    ],
    youtubeLectures: [
      {
        id: "yt_cld_1",
        title: "AWS Certified Cloud Practitioner - Full Course 2024",
        channel: "freeCodeCamp.org",
        duration: "14h 20m",
        youtubeId: "SOTamWNgDKc",
        views: "3.9M views",
        recommendedBadge: "Industry Certification Ready",
        topicsCovered: ["VPC, EC2, S3, IAM", "Billing and Pricing Models", "Security and Compliance", "Architectural Best Practices"],
      },
      {
        id: "yt_cld_2",
        title: "AWS ECS Fargate & Docker Containers - Complete Guide",
        channel: "TechWorld with Nana",
        duration: "1h 12m",
        youtubeId: "o7s-eigaqHk",
        views: "890K views",
        recommendedBadge: "Hands-on Deployment",
        topicsCovered: ["ECR Push", "Task Definition JSON", "Fargate Service Setup", "Auto-scaling"],
      }
    ],
    courses: [
      {
        id: "c_cld_1",
        title: "AWS Fundamentals: Going Cloud-Native",
        provider: "Coursera",
        isFree: false,
        financialAidAvailable: true,
        priceTag: "Financial Aid Available (100% Off)",
        rating: 4.8,
        reviewsCount: "34,200 reviews",
        durationWeeks: 5,
        certificateType: "University Verified",
        url: "https://www.coursera.org/learn/aws-fundamentals-going-cloud-native",
      },
      {
        id: "c_cld_2",
        title: "Cloud Computing by IIT Kharagpur",
        provider: "NPTEL / Swayam",
        isFree: true,
        priceTag: "100% Free (Govt. of India)",
        rating: 4.9,
        reviewsCount: "22,400 students",
        durationWeeks: 12,
        certificateType: "Govt. of India (NCVET)",
        url: "https://swayam.gov.in/explorer?searchText=cloud+computing",
      }
    ],
    quiz: {
      quizTitle: "AWS Cloud Infrastructure & Container Hosting Quiz",
      pointsGain: 4,
      estimatedMinutes: 8,
      questions: [
        {
          id: "q_cld_1",
          question: "When deploying a container task on AWS ECS with the Fargate launch type, what server management responsibility remains with the developer?",
          options: [
            "Patching the underlying Linux OS kernel",
            "Configuring CPU/Memory allocations and Task Definition specs, with zero EC2 instance management",
            "Configuring physical BIOS firmware settings",
            "Managing physical data center power supply"
          ],
          correctIndex: 1,
          explanation: "Fargate is a serverless container engine where AWS provisions and scales the underlying compute nodes; the developer only specifies task resources (e.g. 0.5 vCPU, 1GB RAM) and container images."
        },
        {
          id: "q_cld_2",
          question: "How should an API server securely permit frontend clients to upload large 50MB files to Amazon S3 without routing the file traffic through the API server itself?",
          options: [
            "Hardcode AWS Admin IAM Secret Keys directly in the React frontend bundle",
            "Make the entire S3 bucket publicly writable to the internet",
            "Generate short-lived cryptographic S3 Presigned Upload URLs on the backend and pass them to the client",
            "Upload files via email to AWS support"
          ],
          correctIndex: 2,
          explanation: "Presigned URLs allow temporary, authenticated direct-to-S3 uploads with exact content-length and expiration constraints, relieving the API server of heavy file streaming burdens."
        }
      ]
    },
    projects: [
      {
        id: "proj_cld_1",
        title: "Automated Deployment of Containerized API to AWS ECS via GitHub Actions",
        level: "Intermediate",
        summary: "Provision an ECR repo, build and push an image with GitHub Actions, and update an ECS Fargate service running behind an Application Load Balancer with zero downtime.",
        keyTechnologies: ["AWS ECS Fargate", "AWS ECR", "GitHub Actions", "Terraform / CloudFormation"],
        starterRepoCmd: "git clone https://github.com/skillsetu-starter/aws-ecs-fargate-ci.git",
        portfolioScoreGain: "+20 Verified Points",
        architectureHighlights: [
          "OIDC authentication with AWS (no hardcoded secret keys in GitHub)",
          "Rolling updates with healthy threshold probes",
          "Automated CloudWatch Alarm rollbacks"
        ],
        deliverables: [
          "Terraform or CloudFormation template defining infrastructure",
          "Active public ALB URL endpoint demonstrating 200 OK status",
          "GitHub Actions execution logs URL"
        ]
      }
    ]
  },

  python: {
    id: "python",
    name: "Python & Core OOP Architecture",
    group: "prog",
    groupName: "Programming",
    category: "Languages & Paradigms",
    iconType: "code",
    status: "mastered",
    gapWord: "Exceeds Bar (+14%)",
    currentLevel: "Advanced",
    requiredLevel: "Advanced",
    score: 94,
    benchmark: 80,
    verifiedEvidenceCount: { projects: 3, certs: 1, assessments: 2, githubRepos: 6 },
    hiringImpact: {
      targetCompanies: ["Google", "Razorpay", "CRED", "Microsoft"],
      matchScoreDelta: "+12% Core Anchor",
      unlockedRoles: "Backend Developer, AI/ML Platform Engineer",
      industryInsight: "Your Python score is in the top 6% of institutional candidates. Maintaining quarterly verification guarantees recruiter visibility."
    },
    roadmap: [
      {
        id: "m_py1",
        title: "Milestone 1: Python Internals & Memory Model",
        description: "Deep dive into CPython execution, GIL, reference counting, and garbage collection.",
        topics: ["PyObject & Type Pointers", "Global Interpreter Lock (GIL)", "Generators & Iterators", "Decorators & Metaclasses"],
        estimatedHours: 6,
        difficulty: "Intermediate",
        completed: true,
      },
      {
        id: "m_py2",
        title: "Milestone 2: Concurrency with AsyncIO & Multiprocessing",
        description: "Event loops, coroutines, async context managers, and worker pools.",
        topics: ["AsyncIO Event Loop", "uvloop vs asyncio default", "CPU-bound vs I/O-bound scaling", "ProcessPoolExecutor"],
        estimatedHours: 8,
        difficulty: "Advanced",
        completed: true,
      },
      {
        id: "m_py3",
        title: "Milestone 3: High-Performance Frameworks (FastAPI & Pydantic V2)",
        description: "Build asynchronous microservices with automated OpenAPI documentation and validation.",
        topics: ["Pydantic V2 Rust Core", "Dependency Injection in FastAPI", "Middleware & Lifespan Handlers", "Pytest Asyncio & Mocking"],
        estimatedHours: 8,
        difficulty: "Advanced",
        completed: true,
      }
    ],
    youtubeLectures: [
      {
        id: "yt_py_1",
        title: "Python AsyncIO Tutorial - Mastery in 1 Hour",
        channel: "ArjanCodes",
        duration: "58m",
        youtubeId: "2IW-QT9dKQc",
        views: "420K views",
        recommendedBadge: "Advanced Engineering",
        topicsCovered: ["Event loops", "Async generators", "Concurrency pitfalls", "Task groups"],
      },
      {
        id: "yt_py_2",
        title: "FastAPI Complete Tutorial with Clean Architecture",
        channel: "freeCodeCamp.org",
        duration: "3h 40m",
        youtubeId: "0sOvCWFmrtA",
        views: "1.2M views",
        topicsCovered: ["SQLAlchemy 2.0 async", "Pydantic models", "JWT authentication", "Testing"],
      }
    ],
    courses: [
      {
        id: "c_py_1",
        title: "Programming, Data Structures And Algorithms Using Python",
        provider: "NPTEL / Swayam",
        isFree: true,
        priceTag: "100% Free (IIT Madras)",
        rating: 4.9,
        reviewsCount: "48,000 students",
        durationWeeks: 8,
        certificateType: "Govt. of India (NCVET)",
        url: "https://swayam.gov.in/explorer?searchText=python+madras",
      }
    ],
    quiz: {
      quizTitle: "Advanced Python Internals & Concurrency Challenge",
      pointsGain: 2,
      estimatedMinutes: 5,
      questions: [
        {
          id: "q_py_1",
          question: "Under standard CPython 3.11+, how does the Global Interpreter Lock (GIL) behave when an asynchronous task executes network I/O?",
          options: [
            "The GIL halts all operating system threads completely",
            "The GIL is released before initiating blocking network I/O or during system calls, allowing other threads to execute concurrently",
            "The GIL crashes unless multiprocessing is used",
            "The GIL runs in parallel on all CPU cores"
          ],
          correctIndex: 1,
          explanation: "CPython releases the GIL during blocking I/O system calls (like socket reads/writes and sleep), allowing other concurrent threads to progress seamlessly."
        }
      ]
    },
    projects: [
      {
        id: "proj_py_1",
        title: "High-Throughput Asynchronous Event Ingestion Engine",
        level: "Production Capstone",
        summary: "Build a production-grade FastAPI event engine streaming 10,000 requests/sec into an asynchronous pipeline with Pydantic validation.",
        keyTechnologies: ["Python 3.12", "FastAPI", "AsyncIO", "Redis"],
        starterRepoCmd: "git clone https://github.com/skillsetu-starter/async-event-engine.git",
        portfolioScoreGain: "+15 Verified Points",
        architectureHighlights: ["uvloop kernel bindings", "Zero-copy JSON serialization", "Pytest suite with 95% branch coverage"],
        deliverables: ["Modular codebase with Clean Architecture", "Load test report (wrk or Locust)", "Documentation with architecture diagram"]
      }
    ]
  },

  sql: {
    id: "sql",
    name: "SQL & Relational Query Optimization",
    group: "data",
    groupName: "Data & Storage",
    category: "Databases & Storage",
    iconType: "database",
    status: "mastered",
    gapWord: "Exceeds Bar (+13%)",
    currentLevel: "Advanced",
    requiredLevel: "Advanced",
    score: 88,
    benchmark: 75,
    verifiedEvidenceCount: { projects: 2, certs: 0, assessments: 1, githubRepos: 3 },
    hiringImpact: {
      targetCompanies: ["CRED", "Oracle", "Goldman Sachs", "Swiggy"],
      matchScoreDelta: "+10% Core Anchor",
      unlockedRoles: "Data Engineer, Backend Engineer",
      industryInsight: "Query execution plan analysis (EXPLAIN ANALYZE) and B-Tree indexing mastery are critical differentiators in tier-1 tech interviews."
    },
    roadmap: [
      {
        id: "m_s1",
        title: "Milestone 1: Indexing Internals & Query Plan Analysis",
        description: "Master B-Tree index structures, composite indexes, and EXPLAIN ANALYZE interpretation.",
        topics: ["B-Tree vs Hash vs GIN Indexes", "Sequential Scans vs Index Scans", "Covering Indexes & Index-Only Scans", "Join Algorithms (Nested Loop, Hash, Merge)"],
        estimatedHours: 6,
        difficulty: "Intermediate",
        completed: true,
      },
      {
        id: "m_s2",
        title: "Milestone 2: Window Functions & Advanced Aggregations",
        description: "Complex analytical queries with CTEs, PARTITION BY, and running averages.",
        topics: ["Common Table Expressions (CTEs)", "OVER (PARTITION BY ... ORDER BY ...)", "LEAD, LAG, DENSE_RANK", "Materialized Views & Refresh Strategies"],
        estimatedHours: 6,
        difficulty: "Advanced",
        completed: true,
      }
    ],
    youtubeLectures: [
      {
        id: "yt_sql_1",
        title: "Database Indexing Explained in Depth",
        channel: "Hussein Nasser",
        duration: "52m",
        youtubeId: "fsG1XaZEa78",
        views: "810K views",
        recommendedBadge: "Must Watch",
        topicsCovered: ["How B-Trees work", "Leaf pages", "Clustered vs Secondary indexes", "Index maintenance costs"],
      }
    ],
    courses: [
      {
        id: "c_sql_1",
        title: "Database Management System (DBMS)",
        provider: "NPTEL / Swayam",
        isFree: true,
        priceTag: "100% Free (IIT Kharagpur)",
        rating: 4.8,
        reviewsCount: "38,000 students",
        durationWeeks: 8,
        certificateType: "Govt. of India (NCVET)",
        url: "https://swayam.gov.in/explorer?searchText=dbms",
      }
    ],
    quiz: {
      quizTitle: "SQL Query Optimization & Indexing Mastery",
      pointsGain: 2,
      estimatedMinutes: 5,
      questions: [
        {
          id: "q_sql_1",
          question: "When evaluating an EXPLAIN ANALYZE plan, what does an 'Index-Only Scan' signify?",
          options: [
            "The query was forced to run without any indexes",
            "All columns required by the query were present directly in the B-Tree index leaf nodes, avoiding heap table fetches entirely",
            "The query failed due to a missing foreign key",
            "A full table scan was performed"
          ],
          correctIndex: 1,
          explanation: "In an Index-Only Scan, the database engine satisfies all projections and predicate evaluations directly from the index structure without reading the primary table heap pages."
        }
      ]
    },
    projects: [
      {
        id: "proj_sql_1",
        title: "E-Commerce Database Schema Design & 10M Row Index Tuning",
        level: "Intermediate",
        summary: "Seed a database with 10,000,000 synthetic orders, diagnose slow 1.8s queries using EXPLAIN ANALYZE, and optimize execution to under 12 milliseconds using composite B-Tree indexes and partial indexing.",
        keyTechnologies: ["PostgreSQL", "SQL", "Docker", "pg_stat_statements"],
        starterRepoCmd: "git clone https://github.com/skillsetu-starter/sql-optimization-lab.git",
        portfolioScoreGain: "+12 Verified Points",
        architectureHighlights: ["Composite index column ordering (equality first, range second)", "Partial index for soft-deleted rows", "Query latency dropped from 1820ms to 8ms"],
        deliverables: ["SQL benchmark comparison report with query execution graphs", "Reproducible Docker compose setup with 10M synthetic row generator", "Tuned schema DDL"]
      }
    ]
  },

  api: {
    id: "api",
    name: "REST & GraphQL API Architecture",
    group: "sys",
    groupName: "Systems & Cloud",
    category: "System Design",
    iconType: "server",
    status: "mastered",
    gapWord: "Exceeds Bar (+11%)",
    currentLevel: "Advanced",
    requiredLevel: "Advanced",
    score: 91,
    benchmark: 80,
    verifiedEvidenceCount: { projects: 4, certs: 0, assessments: 1, githubRepos: 5 },
    hiringImpact: {
      targetCompanies: ["Razorpay", "Postman", "Zomato", "Intuit"],
      matchScoreDelta: "+15% Core Anchor",
      unlockedRoles: "API Engineer, Backend Architect",
      industryInsight: "API contract safety, idempotency keys, and rate-limiting protocols are foundational skills tested in L4/L5 engineering rounds."
    },
    roadmap: [
      {
        id: "m_api1",
        title: "Milestone 1: RESTful Resource Modeling & Idempotency",
        description: "Master HTTP semantics, proper status codes, and distributed Idempotency Keys.",
        topics: ["Idempotency Keys with Redis", "ETags & Optimistic Concurrency", "HTTP 429, 503, 422 standard semantics", "RFC 7807 Problem Details"],
        estimatedHours: 6,
        difficulty: "Intermediate",
        completed: true,
      },
      {
        id: "m_api2",
        title: "Milestone 2: GraphQL Schema Design & N+1 Problem",
        description: "Build robust GraphQL schemas and solve the N+1 query problem with DataLoaders.",
        topics: ["GraphQL Schemas & Resolvers", "DataLoader Batching & Caching", "Cursor-based Pagination", "Federated Microservices"],
        estimatedHours: 8,
        difficulty: "Advanced",
        completed: true,
      }
    ],
    youtubeLectures: [
      {
        id: "yt_api_1",
        title: "REST API Design Best Practices from Industry",
        channel: "ByteByteGo",
        duration: "18m",
        youtubeId: "4vLxWqE94l4",
        views: "1.1M views",
        recommendedBadge: "Industry Best Practice",
        topicsCovered: ["API versioning", "Idempotency", "Pagination", "Security headers"],
      }
    ],
    courses: [
      {
        id: "c_api_1",
        title: "Designing RESTful APIs and Microservices",
        provider: "Coursera",
        isFree: false,
        financialAidAvailable: true,
        priceTag: "Financial Aid Available (100% Off)",
        rating: 4.8,
        reviewsCount: "16,500 reviews",
        durationWeeks: 4,
        certificateType: "University Verified",
        url: "https://www.coursera.org",
      }
    ],
    quiz: {
      quizTitle: "API Architecture & Idempotency Standards",
      pointsGain: 2,
      estimatedMinutes: 5,
      questions: [
        {
          id: "q_api_1",
          question: "Why should payment processing APIs utilize an 'Idempotency-Key' HTTP header on POST requests?",
          options: [
            "To encrypt credit card numbers in transit",
            "To ensure that network timeouts or accidental duplicate client clicks do not charge the customer more than once",
            "To convert HTTP requests to WebSockets",
            "Because REST guidelines forbid POST without headers"
          ],
          correctIndex: 1,
          explanation: "If a network disconnect occurs after the payment gateway processes the charge but before the client receives the 200 OK, the client can safely retry the POST request with the same Idempotency-Key. The server detects the key in cache and returns the cached result without re-billing."
        }
      ]
    },
    projects: [
      {
        id: "proj_api_1",
        title: "Fintech Grade Idempotent Payment Gateway API",
        level: "Production Capstone",
        summary: "Develop an idempotent billing API with distributed lock guards, RFC 7807 error envelopes, and automated OpenAPI 3.1 documentation.",
        keyTechnologies: ["FastAPI / Express", "Redis", "PostgreSQL", "OpenAPI"],
        starterRepoCmd: "git clone https://github.com/skillsetu-starter/idempotent-api.git",
        portfolioScoreGain: "+16 Verified Points",
        architectureHighlights: ["Double-submit prevention with distributed Redis lock", "Atomic ledger balance debit and credit", "Full Postman automated test collection"],
        deliverables: ["Swagger UI / OpenAPI documentation link", "Automated Newman test report", "Production Docker setup"]
      }
    ]
  }
};
