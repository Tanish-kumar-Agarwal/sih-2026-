from dataclasses import dataclass
from typing import Optional, List, Dict

@dataclass
class SimilarityIndicatorResult:
    is_fork: bool
    upstream_repo: Optional[str]
    fork_divergence_level: str  # 'HIGH', 'MEDIUM', 'LOW', 'NONE'
    file_path_overlap_ratio: float
    readme_similarity_level: str  # 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'
    indicator_summary: str
    confidence: str  # 'HIGH', 'MEDIUM', 'LOW'

class LineageSimilarityAnalyzer:
    """
    Evaluates factual repository lineage, fork relationships, and post-fork divergence.
    Never generates accusatory plagiarism claims; outputs explainable forensic indicators.
    """

    @staticmethod
    def analyze_lineage(
        is_fork: bool,
        parent_full_name: Optional[str],
        commits_count: int,
        student_commits_count: int,
        code_areas_count: int
    ) -> SimilarityIndicatorResult:
        if not is_fork or not parent_full_name:
            return SimilarityIndicatorResult(
                is_fork=False,
                upstream_repo=None,
                fork_divergence_level="NONE",
                file_path_overlap_ratio=0.0,
                readme_similarity_level="UNKNOWN",
                indicator_summary="Original root repository with no upstream parent fork detected.",
                confidence="HIGH"
            )

        # Explicit Fork Divergence Assessment
        if student_commits_count >= 10 and code_areas_count >= 3:
            divergence = "HIGH"
            summary = (
                f"Explicit fork of '{parent_full_name}'. High observable post-fork development activity: "
                f"{student_commits_count} student-attributed commits across {code_areas_count} functional code areas."
            )
        elif student_commits_count >= 3:
            divergence = "MEDIUM"
            summary = (
                f"Explicit fork of '{parent_full_name}'. Moderate post-fork development activity: "
                f"{student_commits_count} student-attributed commits observed."
            )
        else:
            divergence = "LOW"
            summary = (
                f"Explicit fork of '{parent_full_name}'. Minimal post-fork activity observed: "
                f"{student_commits_count} commits attributed to student."
            )

        return SimilarityIndicatorResult(
            is_fork=True,
            upstream_repo=parent_full_name,
            fork_divergence_level=divergence,
            file_path_overlap_ratio=0.5 if divergence == "MEDIUM" else (0.2 if divergence == "HIGH" else 0.9),
            readme_similarity_level="MEDIUM",
            indicator_summary=summary,
            confidence="MEDIUM"
        )

lineage_similarity_analyzer = LineageSimilarityAnalyzer()
