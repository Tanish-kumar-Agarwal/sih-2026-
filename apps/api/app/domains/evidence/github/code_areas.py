from typing import Dict, List, Set

CODE_AREA_RULES = {
    "backend": [
        "backend/", "server/", "services/", "controllers/", "routes/",
        "models/", "repositories/", "handlers/", "src/server/", "apps/api/"
    ],
    "frontend": [
        "frontend/", "client/", "web/", "ui/", "components/", "pages/",
        "views/", "app/", "src/components/", "apps/web/"
    ],
    "database": [
        "db/", "database/", "migrations/", "alembic/", "prisma/",
        "schema/", "entities/", "sql/", "seeds/"
    ],
    "api": [
        "api/", "graphql/", "openapi/", "swagger/", "endpoints/", "routes/v1/"
    ],
    "tests": [
        "tests/", "test/", "spec/", "__tests__/", "testing/", "e2e/"
    ],
    "documentation": [
        "docs/", "doc/", "documentation/", "README", "CONTRIBUTING", "LICENSE"
    ],
    "infrastructure": [
        "docker/", "k8s/", "terraform/", "ansible/", "helm/", "deploy/", "infra/"
    ],
    "ci_cd": [
        ".github/workflows", ".gitlab-ci", "jenkinsfile", ".circleci", ".actions"
    ],
}

FILE_EXTENSION_HINTS = {
    "tests": [".test.ts", ".test.js", ".test.tsx", ".spec.ts", ".spec.js", "_test.py", "test_"],
    "frontend": [".tsx", ".jsx", ".vue", ".svelte", ".css", ".scss", ".tailwind"],
    "database": [".sql", ".cypher", ".prisma", ".migration.ts"],
    "documentation": [".md", ".rst", ".adoc"],
    "infrastructure": ["dockerfile", "docker-compose", ".tf", ".yaml", ".yml"],
}

class CodeAreaAnalyzer:
    """Classifies repository file paths and commit changes into functional architectural areas."""

    @staticmethod
    def classify_file_path(path: str) -> str:
        clean = path.replace("\\", "/").lower()

        # 1. Check folder rules
        for area, patterns in CODE_AREA_RULES.items():
            for p in patterns:
                if p.lower() in clean:
                    return area

        # 2. Check extension hints
        for area, hints in FILE_EXTENSION_HINTS.items():
            for h in hints:
                if clean.endswith(h) or h in clean.split("/")[-1]:
                    return area

        # 3. Fallback based on programming language extension
        if clean.endswith((".py", ".go", ".rs", ".java", ".cpp", ".c", ".cs", ".php", ".rb")):
            return "backend"
        if clean.endswith((".ts", ".js")):
            return "frontend"

        return "other"

    @classmethod
    def aggregate_areas_from_commits(cls, commits: List[Dict]) -> Dict[str, Dict[str, int]]:
        """
        Aggregates code areas from a collection of commits.
        Returns: { area_name: { "files_count": X, "commits_count": Y, "student_commits_count": Z } }
        """
        areas_stats: Dict[str, Dict[str, int]] = {}

        for c in commits:
            is_student = c.get("is_student_attributed", False)
            # In GitHub commit items, changed files may be listed or inferred from messages/areas
            msg = (c.get("message") or "").lower()
            detected_area = "backend"

            # Check if commit message explicitly references areas
            for area in CODE_AREA_RULES.keys():
                if area in msg:
                    detected_area = area
                    break

            if detected_area not in areas_stats:
                areas_stats[detected_area] = {"files_count": 0, "commits_count": 0, "student_commits_count": 0}

            areas_stats[detected_area]["commits_count"] += 1
            if is_student:
                areas_stats[detected_area]["student_commits_count"] += 1

        return areas_stats

code_area_analyzer = CodeAreaAnalyzer()
