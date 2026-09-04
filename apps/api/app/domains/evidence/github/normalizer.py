import json
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

def parse_iso8601(dt_str: Optional[str]) -> Optional[datetime]:
    if not dt_str:
        return None
    try:
        # Handles 2026-09-04T08:00:00Z format
        clean = dt_str.replace("Z", "+00:00")
        return datetime.fromisoformat(clean)
    except Exception:
        return None

@dataclass
class NormalizedRepo:
    external_repo_id: Optional[str]
    owner: str
    name: str
    full_name: str
    canonical_url: str
    default_branch: str
    is_fork: bool
    parent_full_name: Optional[str]
    parent_url: Optional[str]
    stars_count: int
    forks_count: int
    open_issues_count: int
    license_spdx: Optional[str]
    topics: List[str]
    repo_created_at: Optional[datetime]
    repo_updated_at: Optional[datetime]
    repo_pushed_at: Optional[datetime]

@dataclass
class NormalizedCommit:
    sha: str
    author_name: str
    author_email: str
    commit_date: datetime
    message: str
    additions: int = 0
    deletions: int = 0

@dataclass
class NormalizedContributor:
    username: Optional[str]
    external_user_id: Optional[int]
    commit_count: int

@dataclass
class NormalizedPR:
    pr_number: int
    title: str
    state: str
    author_username: str
    is_merged: bool
    merged_at: Optional[datetime]
    additions: int = 0
    deletions: int = 0
    changed_files: int = 0

@dataclass
class NormalizedLanguage:
    language: str
    byte_count: int
    percentage: float

@dataclass
class NormalizedDependency:
    ecosystem: str
    package_name: str
    declared_version: Optional[str]
    manifest_path: str


class GitHubNormalizer:
    """Normalizes raw GitHub REST responses into strongly-typed domain representations."""

    @staticmethod
    def normalize_repository(raw: Dict[str, Any]) -> NormalizedRepo:
        is_fork = bool(raw.get("fork", False))
        parent = raw.get("parent") or {}
        license_obj = raw.get("license") or {}

        return NormalizedRepo(
            external_repo_id=str(raw.get("id")) if raw.get("id") else None,
            owner=raw.get("owner", {}).get("login", ""),
            name=raw.get("name", ""),
            full_name=raw.get("full_name", ""),
            canonical_url=raw.get("html_url", f"https://github.com/{raw.get('full_name')}"),
            default_branch=raw.get("default_branch", "main"),
            is_fork=is_fork,
            parent_full_name=parent.get("full_name") if is_fork else None,
            parent_url=parent.get("html_url") if is_fork else None,
            stars_count=int(raw.get("stargazers_count", 0)),
            forks_count=int(raw.get("forks_count", 0)),
            open_issues_count=int(raw.get("open_issues_count", 0)),
            license_spdx=license_obj.get("spdx_id") or license_obj.get("name"),
            topics=list(raw.get("topics", [])),
            repo_created_at=parse_iso8601(raw.get("created_at")),
            repo_updated_at=parse_iso8601(raw.get("updated_at")),
            repo_pushed_at=parse_iso8601(raw.get("pushed_at"))
        )

    @staticmethod
    def normalize_languages(raw: Dict[str, int]) -> List[NormalizedLanguage]:
        total_bytes = sum(raw.values()) if raw else 0
        result = []
        for lang, byte_count in raw.items():
            pct = round((byte_count / total_bytes * 100.0), 2) if total_bytes > 0 else 0.0
            result.append(NormalizedLanguage(language=lang, byte_count=byte_count, percentage=pct))
        result.sort(key=lambda x: x.byte_count, reverse=True)
        return result

    @staticmethod
    def normalize_contributors(raw: List[Dict[str, Any]]) -> List[NormalizedContributor]:
        result = []
        for item in raw:
            if not isinstance(item, dict):
                continue
            username = item.get("login")
            uid = item.get("id")
            contributions = int(item.get("contributions", 0))
            result.append(NormalizedContributor(username=username, external_user_id=uid, commit_count=contributions))
        return result

    @staticmethod
    def normalize_commits(raw: List[Dict[str, Any]]) -> List[NormalizedCommit]:
        result = []
        for item in raw:
            if not isinstance(item, dict):
                continue
            sha = item.get("sha", "")
            commit_data = item.get("commit", {})
            author_info = commit_data.get("author") or {}
            msg = commit_data.get("message", "")
            date_str = author_info.get("date")
            c_date = parse_iso8601(date_str) or datetime.now(timezone.utc)

            stats = item.get("stats", {})
            additions = int(stats.get("additions", 0))
            deletions = int(stats.get("deletions", 0))

            result.append(NormalizedCommit(
                sha=sha,
                author_name=author_info.get("name", "Unknown"),
                author_email=author_info.get("email", ""),
                commit_date=c_date,
                message=msg,
                additions=additions,
                deletions=deletions
            ))
        return result

    @staticmethod
    def normalize_pull_requests(raw: List[Dict[str, Any]]) -> List[NormalizedPR]:
        result = []
        for item in raw:
            if not isinstance(item, dict):
                continue
            user_info = item.get("user") or {}
            is_merged = item.get("merged_at") is not None or bool(item.get("merged", False))

            result.append(NormalizedPR(
                pr_number=int(item.get("number", 0)),
                title=item.get("title", ""),
                state="merged" if is_merged else item.get("state", "open"),
                author_username=user_info.get("login", "Unknown"),
                is_merged=is_merged,
                merged_at=parse_iso8601(item.get("merged_at")),
                additions=int(item.get("additions", 0)),
                deletions=int(item.get("deletions", 0)),
                changed_files=int(item.get("changed_files", 0))
            ))
        return result

    @staticmethod
    def parse_dependencies(manifest_path: str, raw_content: str) -> List[NormalizedDependency]:
        """Statically parses package manifests without executing any untrusted code."""
        if not raw_content or not isinstance(raw_content, str):
            return []

        filename = manifest_path.lower()
        results: List[NormalizedDependency] = []

        if filename.endswith("package.json"):
            try:
                data = json.loads(raw_content)
                deps = data.get("dependencies", {})
                dev_deps = data.get("devDependencies", {})
                for pkg, ver in {**deps, **dev_deps}.items():
                    results.append(NormalizedDependency(
                        ecosystem="npm",
                        package_name=pkg,
                        declared_version=str(ver),
                        manifest_path=manifest_path
                    ))
            except Exception:
                pass

        elif filename.endswith("requirements.txt"):
            for line in raw_content.splitlines():
                line = line.strip()
                if not line or line.startswith("#") or line.startswith("-"):
                    continue
                match = re.match(r"^([a-zA-Z0-9_\-\.]+)(?:\[[^\]]*\])?(?:([=><~!^]+)(.+))?$", line)
                if match:
                    pkg = match.group(1)
                    ver = (match.group(2) or "") + (match.group(3) or "")
                    results.append(NormalizedDependency(
                        ecosystem="pip",
                        package_name=pkg,
                        declared_version=ver.strip() or None,
                        manifest_path=manifest_path
                    ))

        elif filename.endswith("pyproject.toml"):
            in_deps = False
            for line in raw_content.splitlines():
                line = line.strip()
                if line.startswith("[") and ("dependencies" in line.lower() or "poetry" in line.lower()):
                    in_deps = True
                    continue
                elif line.startswith("["):
                    in_deps = False
                    continue

                if in_deps and "=" in line:
                    parts = line.split("=", 1)
                    pkg = parts[0].strip().strip('"').strip("'")
                    ver = parts[1].strip().strip('"').strip("'")
                    if pkg and not pkg.startswith("#"):
                        results.append(NormalizedDependency(
                            ecosystem="pip",
                            package_name=pkg,
                            declared_version=ver,
                            manifest_path=manifest_path
                        ))

        return results

normalizer = GitHubNormalizer()
