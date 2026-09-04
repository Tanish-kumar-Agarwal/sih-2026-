from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class GitHubAnalyzeRequestDTO(BaseModel):
    repo_url: str = Field(..., description="Public GitHub repository URL (e.g. https://github.com/owner/repo)")
    student_id: Optional[str] = Field(None, description="ID of the student claiming repository contribution")
    branch: Optional[str] = Field(None, description="Target branch to inspect (defaults to repo default branch)")
    title: Optional[str] = Field(None, description="Optional custom title for the Evidence record")
    description: Optional[str] = Field(None, description="Optional custom description")

class GitHubLanguageDTO(BaseModel):
    language: str
    byte_count: int
    percentage: float

    class Config:
        from_attributes = True

class GitHubDependencyDTO(BaseModel):
    ecosystem: str
    package_name: str
    declared_version: Optional[str] = None
    manifest_path: str

    class Config:
        from_attributes = True

class GitHubContributorDTO(BaseModel):
    username: Optional[str]
    commit_count: int
    student_matched: bool
    match_confidence: str

    class Config:
        from_attributes = True

class GitHubCommitDTO(BaseModel):
    sha: str
    author_name: str
    author_email: str
    commit_date: datetime
    message: str
    additions: int = 0
    deletions: int = 0
    student_matched: bool
    match_confidence: str

    class Config:
        from_attributes = True

class GitHubPullRequestDTO(BaseModel):
    pr_number: int
    title: str
    state: str
    author_username: str
    is_merged: bool
    merged_at: Optional[datetime] = None
    additions: int = 0
    deletions: int = 0
    changed_files: int = 0
    student_matched: bool

    class Config:
        from_attributes = True

class GitHubCodeAreaDTO(BaseModel):
    area_name: str
    file_count: int
    percentage: float

    class Config:
        from_attributes = True

class GitHubSimilarityDTO(BaseModel):
    source_type: str
    parent_repo_url: Optional[str] = None
    divergence_level: str
    ahead_by_commits: int = 0
    behind_by_commits: int = 0
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class GitHubRepositoryDTO(BaseModel):
    id: str
    owner: str
    name: str
    full_name: str
    canonical_url: str
    default_branch: str
    is_fork: bool
    parent_full_name: Optional[str] = None
    parent_url: Optional[str] = None
    stars_count: int = 0
    forks_count: int = 0
    open_issues_count: int = 0
    license_spdx: Optional[str] = None
    topics: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True

class GitHubSnapshotDTO(BaseModel):
    id: str
    repository_id: str
    evidence_id: str
    student_id: str
    snapshot_timestamp: datetime
    branch: str
    head_commit_sha: Optional[str] = None
    commit_count: int = 0
    student_commit_count: int = 0
    student_lines_added: int = 0
    student_lines_deleted: int = 0
    pr_count: int = 0
    student_pr_count: int = 0
    primary_language: Optional[str] = None
    languages: List[GitHubLanguageDTO] = Field(default_factory=list)
    dependencies: List[GitHubDependencyDTO] = Field(default_factory=list)
    contributors: List[GitHubContributorDTO] = Field(default_factory=list)
    recent_commits: List[GitHubCommitDTO] = Field(default_factory=list)
    code_areas: List[GitHubCodeAreaDTO] = Field(default_factory=list)
    similarity: Optional[GitHubSimilarityDTO] = None
    summary: Optional[str] = None

    class Config:
        from_attributes = True

class GitHubAnalysisResponseDTO(BaseModel):
    evidence_id: str
    repository: GitHubRepositoryDTO
    snapshot: GitHubSnapshotDTO
    claims_count: int
    processing_status: str
    verification_status: str
    message: str
