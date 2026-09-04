from typing import List, Dict, Any, Optional, Set, Tuple
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload

from app.infrastructure.database.models import (
    Evidence,
    EvidenceClaim,
    EvidenceExtraction,
    EvidenceArtifact,
    GitHubRepositorySnapshot,
    GitHubDependency,
    GitHubLanguage,
    GitHubCodeArea,
    GitHubCommit,
    Competency,
    Skill,
    SkillCompetency,
)
from app.domains.competencies.resolver import SkillResolutionEngine
from app.domains.competencies.taxonomy_constants import ResolutionStatus, MatchType
from app.domains.evidence.mapping.enums import MappingStatus, MappingMethod, EvidenceStrength

@dataclass
class ObservedEvidenceFact:
    raw_term: str
    source_location: str
    source_method: MappingMethod
    attribution_factor: float
    evidence_strength: EvidenceStrength
    source_claim_id: Optional[str] = None
    context_note: Optional[str] = None

@dataclass
class ResolvedCompetencyMapping:
    competency_id: str
    competency_name: str
    competency_slug: str
    competency_category: Optional[str]
    skill_id: Optional[str]
    skill_name: Optional[str]
    mapping_method: MappingMethod
    mapping_status: MappingStatus
    confidence: float
    confidence_reason: str
    evidence_strength: EvidenceStrength
    source_location: str
    source_claim_id: Optional[str]
    algorithm_version: str = "v1.0.0"

class EvidenceCompetencyMappingEngine:
    """
    Deterministic Evidence -> Competency Mapping Engine.
    Transforms documentary and GitHub evidence into canonical competency mappings.
    Follows strict precedence, explicit confidence formulas, and zero competency invention.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.resolver = SkillResolutionEngine(db)

    async def discover_facts(self, evidence: Evidence) -> List[ObservedEvidenceFact]:
        """
        Discovers observed technical and domain facts from all available evidence facets:
        - GitHub Snapshots (dependencies, languages, code areas)
        - Document extractions (PyMuPDF metadata, entities, keywords, skills)
        - Pre-existing structured EvidenceClaims
        - Evidence title and description
        """
        facts: List[ObservedEvidenceFact] = []
        seen_terms: Set[str] = set()

        # 1. Inspect GitHub snapshots
        stmt_gh = (
            select(GitHubRepositorySnapshot)
            .where(GitHubRepositorySnapshot.evidence_id == evidence.id)
            .options(
                selectinload(GitHubRepositorySnapshot.dependencies),
                selectinload(GitHubRepositorySnapshot.languages),
                selectinload(GitHubRepositorySnapshot.code_areas),
                selectinload(GitHubRepositorySnapshot.commits)
            )
        )
        res_gh = await self.db.execute(stmt_gh)
        gh_snapshots = res_gh.scalars().all()

        for snap in gh_snapshots:
            # Check student commit attribution ratio in snapshot
            student_commits = sum(1 for c in snap.commits if getattr(c, 'is_student_attributed', False))
            total_commits = len(snap.commits) if snap.commits else 1
            commit_ratio = student_commits / max(1, total_commits)
            attribution_factor = 0.95 if commit_ratio >= 0.3 else 0.75

            # Dependencies
            for dep in snap.dependencies:
                pkg_clean = dep.package_name.strip().lower()
                # strip scope if npm (e.g., @fastify/cors -> fastify, @types/react -> react)
                if pkg_clean.startswith("@") and "/" in pkg_clean:
                    pkg_clean = pkg_clean.split("/", 1)[1]
                if pkg_clean.startswith("types-") or pkg_clean.startswith("@types/"):
                    pkg_clean = pkg_clean.replace("types-", "")

                key = f"gh_dep:{pkg_clean}"
                if key not in seen_terms and len(pkg_clean) > 1:
                    seen_terms.add(key)
                    loc = f"{dep.manifest_path or 'manifest'}:{dep.package_name}"
                    ver = getattr(dep, 'declared_version', getattr(dep, 'version', None))
                    if ver:
                        loc += f"@{ver}"
                    facts.append(
                        ObservedEvidenceFact(
                            raw_term=pkg_clean,
                            source_location=loc,
                            source_method=MappingMethod.GITHUB_OBSERVATION,
                            attribution_factor=attribution_factor,
                            evidence_strength=EvidenceStrength.STRONG if commit_ratio >= 0.3 else EvidenceStrength.MODERATE,
                            context_note=f"GitHub {dep.ecosystem} dependency"
                        )
                    )

            # Languages
            for lang in snap.languages:
                lang_raw = getattr(lang, 'language', getattr(lang, 'language_name', ''))
                lang_clean = lang_raw.strip() if lang_raw else ""
                key = f"gh_lang:{lang_clean.lower()}"
                if key not in seen_terms and len(lang_clean) > 1:
                    seen_terms.add(key)
                    pct_str = f"{lang.percentage:.1f}%" if lang.percentage else "detected"
                    facts.append(
                        ObservedEvidenceFact(
                            raw_term=lang_clean,
                            source_location=f"GitHub language:{lang_clean} ({pct_str})",
                            source_method=MappingMethod.GITHUB_OBSERVATION,
                            attribution_factor=attribution_factor,
                            evidence_strength=EvidenceStrength.STRONG if (lang.percentage or 0) > 20.0 else EvidenceStrength.MODERATE,
                            context_note=f"GitHub repository primary language ({pct_str})"
                        )
                    )

        # 2. Inspect Extracted Documents (PyMuPDF artifacts)
        stmt_art = (
            select(EvidenceArtifact)
            .where(EvidenceArtifact.evidence_id == evidence.id)
            .options(selectinload(EvidenceArtifact.extractions))
        )
        res_art = await self.db.execute(stmt_art)
        artifacts = res_art.scalars().all()

        for art in artifacts:
            for ext in art.extractions:
                meta = ext.extracted_metadata or {}
                # Skills extracted by extractor
                extracted_skills = meta.get("skills", [])
                if isinstance(extracted_skills, list):
                    for sk in extracted_skills:
                        sk_str = str(sk).strip()
                        key = f"doc_sk:{sk_str.lower()}"
                        if key not in seen_terms and len(sk_str) > 1:
                            seen_terms.add(key)
                            facts.append(
                                ObservedEvidenceFact(
                                    raw_term=sk_str,
                                    source_location=f"{art.original_filename or 'document'}:extracted_skills",
                                    source_method=MappingMethod.DOCUMENT_EXTRACTION,
                                    attribution_factor=0.80,
                                    evidence_strength=EvidenceStrength.MODERATE,
                                    context_note="Extracted from documentary evidence artifact"
                                )
                            )

                # Keywords and entities
                keywords = meta.get("keywords", [])
                if isinstance(keywords, list):
                    for kw in keywords:
                        kw_str = str(kw).strip()
                        key = f"doc_kw:{kw_str.lower()}"
                        if key not in seen_terms and len(kw_str) > 2:
                            seen_terms.add(key)
                            facts.append(
                                ObservedEvidenceFact(
                                    raw_term=kw_str,
                                    source_location=f"{art.original_filename or 'document'}:keywords",
                                    source_method=MappingMethod.DOCUMENT_EXTRACTION,
                                    attribution_factor=0.70,
                                    evidence_strength=EvidenceStrength.WEAK,
                                    context_note="Keyword extracted from document text"
                                )
                            )

        # 3. Inspect Pre-existing EvidenceClaims
        stmt_claims = (
            select(EvidenceClaim)
            .where(EvidenceClaim.evidence_id == evidence.id)
            .where(EvidenceClaim.status == "ACTIVE")
        )
        res_claims = await self.db.execute(stmt_claims)
        claims = res_claims.scalars().all()

        for claim in claims:
            fact_str = claim.observed_fact.strip() if claim.observed_fact else ""
            if fact_str and len(fact_str) > 2:
                key = f"claim:{fact_str.lower()}"
                if key not in seen_terms:
                    seen_terms.add(key)
                    facts.append(
                        ObservedEvidenceFact(
                            raw_term=fact_str,
                            source_location=f"EvidenceClaim:{claim.claim_type}",
                            source_method=MappingMethod.RULE_BASED,
                            attribution_factor=claim.confidence or 0.85,
                            evidence_strength=EvidenceStrength.MODERATE,
                            source_claim_id=claim.id,
                            context_note=claim.claim_statement
                        )
                    )

        # 4. Fallback to title keywords if zero facts found
        if not facts and evidence.title:
            for token in evidence.title.split():
                clean_tok = token.strip(" ,.-_:;()[]{}")
                if len(clean_tok) >= 3 and clean_tok.lower() not in {"the", "and", "for", "with", "from", "project"}:
                    facts.append(
                        ObservedEvidenceFact(
                            raw_term=clean_tok,
                            source_location="evidence_title",
                            source_method=MappingMethod.RULE_BASED,
                            attribution_factor=0.60,
                            evidence_strength=EvidenceStrength.WEAK,
                            context_note=f"Mentioned in title: {evidence.title}"
                        )
                    )

        return facts

    async def map_facts_to_competencies(
        self,
        evidence: Evidence,
        facts: List[ObservedEvidenceFact]
    ) -> List[ResolvedCompetencyMapping]:
        """
        Maps observed facts to canonical Competencies via canonical Skills and SkillCompetency edges.
        Adheres to deterministic precedence:
        1. Exact canonical skill match
        2. Alias resolution
        3. SkillCompetency edge traversal (prefer primary)
        4. Calculation of confidence and explainable justification
        Zero hallucinated / invented competencies.
        """
        if not facts:
            return []

        # 1. Batch resolve all candidate terms via SkillResolutionEngine
        raw_inputs = [f.raw_term for f in facts]
        resolution_result = await self.resolver.resolve_batch(raw_inputs)
        resolved_items = resolution_result.get("items", [])

        # Filter out UNRESOLVED / NO_MATCH
        valid_resolutions: List[Tuple[ObservedEvidenceFact, Dict[str, Any]]] = []
        skill_ids: Set[str] = set()

        for fact, res in zip(facts, resolved_items):
            sk = res.get("skill") or res.get("canonical_skill")
            if res.get("status") == ResolutionStatus.RESOLVED.value and sk:
                valid_resolutions.append((fact, res))
                skill_ids.add(sk["id"])

        if not valid_resolutions:
            return []

        # 2. Bulk fetch SkillCompetency edges and direct Competency links
        stmt_sc = (
            select(SkillCompetency)
            .where(SkillCompetency.skill_id.in_(list(skill_ids)))
            .options(
                selectinload(SkillCompetency.competency).selectinload(Competency.category_rel)
            )
            .order_by(SkillCompetency.is_primary.desc(), SkillCompetency.relevance_weight.desc())
        )
        res_sc = await self.db.execute(stmt_sc)
        sc_links = res_sc.scalars().all()

        # Group competencies by skill_id
        competencies_by_skill: Dict[str, List[SkillCompetency]] = {}
        for sc in sc_links:
            if sc.competency and sc.competency.status == "ACTIVE":
                competencies_by_skill.setdefault(sc.skill_id, []).append(sc)

        # Also check direct legacy competency_id on Skill
        stmt_sk = select(Skill).where(Skill.id.in_(list(skill_ids)))
        res_sk = await self.db.execute(stmt_sk)
        skills_db = {s.id: s for s in res_sk.scalars().all()}

        # 3. Base Reliability of Evidence Source
        source_type = evidence.source_type or "OTHER"
        source_rel_map = {
            "REPOSITORY": 0.90,
            "ASSESSMENT": 0.90,
            "CERTIFICATION": 0.85,
            "INSTITUTION": 0.85,
            "EMPLOYER": 0.85,
            "EXPERIENCE": 0.80,
            "PROJECT": 0.80,
            "WORK_SAMPLE": 0.80,
            "DOCUMENT": 0.70,
            "URL": 0.65,
            "OTHER": 0.60
        }
        base_source_rel = source_rel_map.get(source_type.upper(), 0.70)

        # Method weight map
        method_weights = {
            MappingMethod.DIRECT_SKILL_MATCH: 0.95,
            MappingMethod.ALIAS_MATCH: 0.90,
            MappingMethod.GITHUB_OBSERVATION: 0.88,
            MappingMethod.DOCUMENT_EXTRACTION: 0.82,
            MappingMethod.HUMAN_VERIFIED: 1.0,
            MappingMethod.RULE_BASED: 0.75,
            MappingMethod.SEMANTIC_MATCH: 0.70,
            MappingMethod.SYSTEM_DERIVED: 0.70,
        }

        # 4. Assemble candidate mappings
        mappings_by_competency: Dict[str, ResolvedCompetencyMapping] = {}

        for fact, res in valid_resolutions:
            canonical_skill = res.get("skill") or res.get("canonical_skill")
            skill_id = canonical_skill["id"]
            skill_name = canonical_skill["name"]
            match_type = res.get("match_type")

            # Determine specific mapping method
            if fact.source_method == MappingMethod.GITHUB_OBSERVATION:
                mapping_method = MappingMethod.GITHUB_OBSERVATION
            elif fact.source_method == MappingMethod.DOCUMENT_EXTRACTION:
                mapping_method = MappingMethod.DOCUMENT_EXTRACTION
            elif match_type in (MatchType.ALIAS_EXACT.value, MatchType.ALIAS_NORMALIZED.value):
                mapping_method = MappingMethod.ALIAS_MATCH
            else:
                mapping_method = MappingMethod.DIRECT_SKILL_MATCH

            # Find matching competencies
            target_sc_list = competencies_by_skill.get(skill_id, [])
            candidate_comps: List[Tuple[Competency, float, bool]] = []

            for sc in target_sc_list:
                candidate_comps.append((sc.competency, sc.relevance_weight or 1.0, sc.is_primary))

            # Fallback to direct legacy competency if no SkillCompetency records
            if not candidate_comps and skill_id in skills_db:
                sk_obj = skills_db[skill_id]
                if sk_obj.competency_id:
                    c_stmt = select(Competency).where(Competency.id == sk_obj.competency_id).options(selectinload(Competency.category_rel))
                    c_res = await self.db.execute(c_stmt)
                    c_obj = c_res.scalar_one_or_none()
                    if c_obj and c_obj.status == "ACTIVE":
                        candidate_comps.append((c_obj, 1.0, True))

            # For each associated competency, generate or update mapping
            for comp, rel_weight, is_primary in candidate_comps:
                m_weight = method_weights.get(mapping_method, 0.80)
                raw_conf = base_source_rel * fact.attribution_factor * m_weight * min(1.0, rel_weight)
                computed_conf = round(min(0.99, max(0.15, raw_conf)), 2)

                cat_name = comp.category_rel.name if comp.category_rel else None

                # Build human-readable explanation
                reason_parts = [
                    f"Mapped from {fact.source_location} ({fact.context_note or 'observed'})",
                    f"via canonical skill '{skill_name}' ({mapping_method.value})",
                    f"to competency '{comp.name}'"
                ]
                if is_primary:
                    reason_parts.append("(Primary competency edge)")
                reason_str = " ".join(reason_parts) + f". Confidence: {computed_conf:.2f}."

                # Status is PROPOSED by default (human or automated verification will promote to CONFIRMED)
                status = MappingStatus.PROPOSED

                # If this competency was already mapped by an earlier fact, keep the one with higher confidence
                if comp.id in mappings_by_competency:
                    existing = mappings_by_competency[comp.id]
                    if computed_conf > existing.confidence:
                        mappings_by_competency[comp.id] = ResolvedCompetencyMapping(
                            competency_id=comp.id,
                            competency_name=comp.name,
                            competency_slug=comp.slug,
                            competency_category=cat_name,
                            skill_id=skill_id,
                            skill_name=skill_name,
                            mapping_method=mapping_method,
                            mapping_status=status,
                            confidence=computed_conf,
                            confidence_reason=reason_str,
                            evidence_strength=fact.evidence_strength,
                            source_location=fact.source_location,
                            source_claim_id=fact.source_claim_id,
                            algorithm_version="v1.0.0"
                        )
                else:
                    mappings_by_competency[comp.id] = ResolvedCompetencyMapping(
                        competency_id=comp.id,
                        competency_name=comp.name,
                        competency_slug=comp.slug,
                        competency_category=cat_name,
                        skill_id=skill_id,
                        skill_name=skill_name,
                        mapping_method=mapping_method,
                        mapping_status=status,
                        confidence=computed_conf,
                        confidence_reason=reason_str,
                        evidence_strength=fact.evidence_strength,
                        source_location=fact.source_location,
                        source_claim_id=fact.source_claim_id,
                        algorithm_version="v1.0.0"
                    )

        return list(mappings_by_competency.values())
