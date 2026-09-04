from dataclasses import dataclass
from typing import Optional, List

@dataclass
class IdentityAttribution:
    is_student: bool
    confidence: str  # 'HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'
    reason: str

class IdentityResolver:
    """
    Deterministic identity resolution engine for attributing Git commits and GitHub activity
    to a specific student without conflating identities or making baseless accusations.
    """

    @staticmethod
    def resolve_commit_identity(
        author_name: str,
        author_email: str,
        student_name: str,
        student_email: Optional[str] = None,
        student_github_handle: Optional[str] = None
    ) -> IdentityAttribution:
        clean_author_name = (author_name or "").strip().lower()
        clean_author_email = (author_email or "").strip().lower()
        clean_student_name = (student_name or "").strip().lower()
        clean_student_email = (student_email or "").strip().lower() if student_email else None
        clean_handle = (student_github_handle or "").strip().lower() if student_github_handle else None

        # Level 1: Exact Email Match -> HIGH Confidence
        if clean_student_email and clean_author_email and clean_author_email == clean_student_email:
            return IdentityAttribution(
                is_student=True,
                confidence="HIGH",
                reason=f"Exact author email match with student profile ('{clean_author_email}')."
            )

        # Level 2: GitHub handle match in email or author name -> HIGH Confidence
        if clean_handle:
            if clean_author_name == clean_handle or f"{clean_handle}@" in clean_author_email or clean_author_email.startswith(f"{clean_handle}+"):
                return IdentityAttribution(
                    is_student=True,
                    confidence="HIGH",
                    reason=f"Author identity matches linked student GitHub username ('{clean_handle}')."
                )

        # Level 3: Exact Normalized Name Match -> MEDIUM Confidence
        if clean_student_name and clean_author_name:
            if clean_author_name == clean_student_name:
                return IdentityAttribution(
                    is_student=True,
                    confidence="MEDIUM",
                    reason=f"Author display name ('{author_name}') matches registered student name ('{student_name}')."
                )

            # Check firstname + lastname token overlap
            student_tokens = set(clean_student_name.split())
            author_tokens = set(clean_author_name.split())
            if len(student_tokens) >= 2 and student_tokens.issubset(author_tokens):
                return IdentityAttribution(
                    is_student=True,
                    confidence="MEDIUM",
                    reason=f"Author name tokens contain full student name ('{student_name}')."
                )

        # Level 4: Partial / Weak similarity -> LOW Confidence
        if clean_student_name and clean_author_name:
            first_name = clean_student_name.split()[0]
            if len(first_name) >= 3 and first_name in clean_author_name.split():
                return IdentityAttribution(
                    is_student=False,
                    confidence="LOW",
                    reason="First name match alone is insufficient for reliable individual attribution."
                )

        # Level 5: No Match -> UNKNOWN
        return IdentityAttribution(
            is_student=False,
            confidence="UNKNOWN",
            reason="No verifiable identity link between commit author and student profile."
        )

    @staticmethod
    def resolve_contributor_identity(
        contributor_username: Optional[str],
        student_name: str,
        student_github_handle: Optional[str] = None
    ) -> IdentityAttribution:
        clean_user = (contributor_username or "").strip().lower()
        clean_handle = (student_github_handle or "").strip().lower() if student_github_handle else None
        clean_name = (student_name or "").strip().lower()

        if clean_handle and clean_user == clean_handle:
            return IdentityAttribution(
                is_student=True,
                confidence="HIGH",
                reason=f"Contributor username matches linked student GitHub handle ('{clean_handle}')."
            )

        # Check if contributor username contains student name tokens (e.g. "aaravsharma")
        compact_name = clean_name.replace(" ", "")
        if compact_name and (compact_name in clean_user or clean_user in compact_name):
            return IdentityAttribution(
                is_student=True,
                confidence="MEDIUM",
                reason=f"Contributor username ('{contributor_username}') closely resembles student name ('{student_name}')."
            )

        return IdentityAttribution(
            is_student=False,
            confidence="UNKNOWN",
            reason="Uncorrelated contributor identity."
        )

identity_resolver = IdentityResolver()
