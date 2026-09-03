from typing import List, Dict, Any, Optional, Set
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.repositories.competency_repo import CompetencyRepository
from app.domains.competencies.normalization import normalize_skill_text
from app.domains.competencies.taxonomy_constants import ResolutionStatus, MatchType

class SkillResolutionEngine:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = CompetencyRepository(db)

    async def resolve_one(self, raw_input: str) -> Dict[str, Any]:
        """Resolve a single raw skill input string."""
        results = await self.resolve_batch([raw_input])
        return results["items"][0]

    async def resolve_batch(self, raw_inputs: List[str]) -> Dict[str, Any]:
        """
        Batch resolve an array of raw skill strings efficiently in a single query pass.
        Zero N+1 database queries.
        Preserves input order.
        """
        if not raw_inputs:
            return {
                "items": [],
                "total": 0,
                "resolved_count": 0,
                "unresolved_count": 0,
                "ambiguous_count": 0
            }

        # 1. Normalize all inputs and collect search keys
        normalized_map: Dict[int, Dict[str, Any]] = {}
        all_ids: Set[str] = set()
        all_slugs: Set[str] = set()
        all_norm_keys: Set[str] = set()
        all_raw_trimmed: Set[str] = set()

        for idx, inp in enumerate(raw_inputs):
            norm_key = normalize_skill_text(inp)
            raw_str = inp.strip() if isinstance(inp, str) else ""
            normalized_map[idx] = {
                "original": inp,
                "raw_str": raw_str,
                "norm_key": norm_key
            }
            if raw_str:
                all_ids.add(raw_str)
                all_slugs.add(raw_str.lower())
                all_raw_trimmed.add(raw_str)
            if norm_key:
                all_slugs.add(norm_key)
                all_norm_keys.add(norm_key)

        # 2. Bulk query canonical skills and aliases (2 queries max, regardless of batch size)
        matched_skills = await self.repo.find_skills_by_identifiers_or_keys(
            ids=list(all_ids),
            slugs=list(all_slugs),
            names=list(all_norm_keys)
        )

        matched_aliases = await self.repo.find_aliases_by_keys(
            raw_aliases=list(all_raw_trimmed),
            normalized_aliases=list(all_norm_keys)
        )

        # 3. Build fast lookup dictionaries
        # Skills indexed by id, slug, and normalized name
        skills_by_id: Dict[str, Any] = {s.id: s for s in matched_skills}
        skills_by_slug: Dict[str, Any] = {s.slug.lower(): s for s in matched_skills}
        skills_by_norm_name: Dict[str, List[Any]] = {}
        for s in matched_skills:
            key = normalize_skill_text(s.name)
            skills_by_norm_name.setdefault(key, []).append(s)

        # Aliases indexed by exact raw alias and normalized alias
        aliases_by_exact: Dict[str, List[Any]] = {}
        aliases_by_norm: Dict[str, List[Any]] = {}
        for a in matched_aliases:
            aliases_by_exact.setdefault(a.alias_name.lower(), []).append(a)
            aliases_by_norm.setdefault(a.normalized_alias, []).append(a)

        # 4. Resolve each input in order following strict precedence
        resolved_items = []
        resolved_count = 0
        unresolved_count = 0
        ambiguous_count = 0

        for idx in range(len(raw_inputs)):
            info = normalized_map[idx]
            original = info["original"]
            raw_str = info["raw_str"]
            norm_key = info["norm_key"]

            if not raw_str or not norm_key:
                resolved_items.append({
                    "input": original,
                    "normalized_input": "",
                    "status": ResolutionStatus.UNRESOLVED.value,
                    "match_type": MatchType.UNRESOLVED.value,
                    "skill": None
                })
                unresolved_count += 1
                continue

            # Candidate collector for ambiguity detection
            matched_skill = None
            match_type = None

            # a. Exact Canonical ID match
            if raw_str in skills_by_id:
                matched_skill = skills_by_id[raw_str]
                match_type = MatchType.CANONICAL_EXACT

            # b. Exact Canonical Slug match
            elif raw_str.lower() in skills_by_slug:
                matched_skill = skills_by_slug[raw_str.lower()]
                match_type = MatchType.CANONICAL_SLUG
            elif norm_key in skills_by_slug:
                matched_skill = skills_by_slug[norm_key]
                match_type = MatchType.CANONICAL_SLUG

            # c. Normalized Canonical Name match
            elif norm_key in skills_by_norm_name:
                candidates = skills_by_norm_name[norm_key]
                if len(candidates) == 1:
                    matched_skill = candidates[0]
                    match_type = MatchType.CANONICAL_NORMALIZED
                else:
                    # Ambiguous canonical match
                    resolved_items.append({
                        "input": original,
                        "normalized_input": norm_key,
                        "status": ResolutionStatus.AMBIGUOUS.value,
                        "match_type": MatchType.UNRESOLVED.value,
                        "candidates": [
                            {"id": c.id, "name": c.name, "slug": c.slug} for c in candidates
                        ],
                        "skill": None
                    })
                    ambiguous_count += 1
                    continue

            # d. Exact Alias match
            elif raw_str.lower() in aliases_by_exact:
                candidates = aliases_by_exact[raw_str.lower()]
                distinct_skills = {a.skill_id: a.skill for a in candidates if a.skill}
                if len(distinct_skills) == 1:
                    matched_skill = next(iter(distinct_skills.values()))
                    match_type = MatchType.ALIAS_EXACT
                else:
                    resolved_items.append({
                        "input": original,
                        "normalized_input": norm_key,
                        "status": ResolutionStatus.AMBIGUOUS.value,
                        "match_type": MatchType.UNRESOLVED.value,
                        "candidates": [
                            {"id": s.id, "name": s.name, "slug": s.slug} for s in distinct_skills.values()
                        ],
                        "skill": None
                    })
                    ambiguous_count += 1
                    continue

            # e. Normalized Alias match
            elif norm_key in aliases_by_norm:
                candidates = aliases_by_norm[norm_key]
                distinct_skills = {a.skill_id: a.skill for a in candidates if a.skill}
                if len(distinct_skills) == 1:
                    matched_skill = next(iter(distinct_skills.values()))
                    match_type = MatchType.ALIAS_NORMALIZED
                else:
                    resolved_items.append({
                        "input": original,
                        "normalized_input": norm_key,
                        "status": ResolutionStatus.AMBIGUOUS.value,
                        "match_type": MatchType.UNRESOLVED.value,
                        "candidates": [
                            {"id": s.id, "name": s.name, "slug": s.slug} for s in distinct_skills.values()
                        ],
                        "skill": None
                    })
                    ambiguous_count += 1
                    continue

            # f. Resolution evaluation
            if matched_skill and match_type:
                resolved_items.append({
                    "input": original,
                    "normalized_input": norm_key,
                    "status": ResolutionStatus.RESOLVED.value,
                    "match_type": match_type.value,
                    "skill": {
                        "id": matched_skill.id,
                        "name": matched_skill.name,
                        "slug": matched_skill.slug,
                        "domain_id": matched_skill.domain_id,
                        "domain_code": matched_skill.domain_rel.code if matched_skill.domain_rel else None,
                        "status": matched_skill.status
                    }
                })
                resolved_count += 1
            else:
                resolved_items.append({
                    "input": original,
                    "normalized_input": norm_key,
                    "status": ResolutionStatus.UNRESOLVED.value,
                    "match_type": MatchType.UNRESOLVED.value,
                    "skill": None
                })
                unresolved_count += 1

        return {
            "items": resolved_items,
            "total": len(resolved_items),
            "resolved_count": resolved_count,
            "unresolved_count": unresolved_count,
            "ambiguous_count": ambiguous_count
        }
