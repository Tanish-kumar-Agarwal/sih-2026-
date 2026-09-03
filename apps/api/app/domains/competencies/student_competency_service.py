import math
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.repositories.student_repo import StudentRepository
from app.infrastructure.database.repositories.competency_repo import CompetencyRepository
from app.domains.competencies.proficiency_engine import CompetencyProficiencyAggregator
from app.domains.competencies.taxonomy_constants import (
    ProficiencyLevel, PROFICIENCY_NUMERIC_MAP, score_to_proficiency
)
from app.domains.competencies.schemas import (
    StudentCompetencySummaryDTO, StudentCompetencyDetailDTO,
    StudentCompetenciesPaginatedDTO, StudentCompetencyDeriveResponseDTO,
    CompetencyGraphNodeDTO, CompetencyGraphEdgeDTO, CompetencyGraphResponseDTO,
    SkillDTO, CompetencyRelationshipDTO
)

class StudentCompetencyService:
    async def _resolve_student_id(self, repo: StudentRepository, identifier: str) -> str:
        """Resolve identifier (student_id or user_id) to canonical student_id or raise 404."""
        student_id = await repo.resolve_student_id(identifier)
        if not student_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student profile not found for identifier '{identifier}'."
            )
        return student_id

    async def get_student_competencies(
        self,
        db: AsyncSession,
        persona_identifier: str,
        search: Optional[str] = None,
        domain_code: Optional[str] = None,
        category: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> StudentCompetenciesPaginatedDTO:
        repo = StudentRepository(db)
        student_id = await self._resolve_student_id(repo, persona_identifier)

        offset = max(0, (page - 1) * page_size)
        limit = min(100, max(1, page_size))

        records, total = await repo.get_student_competencies(
            student_id=student_id,
            search=search,
            domain_code=domain_code,
            category=category,
            offset=offset,
            limit=limit
        )

        items = []
        for sc in records:
            c = sc.competency
            try:
                prof_enum = ProficiencyLevel(sc.proficiency_level.upper())
                num_level = PROFICIENCY_NUMERIC_MAP[prof_enum]
            except (ValueError, KeyError, AttributeError):
                num_level = 3

            items.append(StudentCompetencySummaryDTO(
                id=sc.id,
                competency_id=c.id,
                competency_name=c.name,
                competency_code=c.code,
                competency_slug=c.slug,
                category=c.category_rel.name if c.category_rel else c.category,
                domain_code=c.domain_rel.code if c.domain_rel else None,
                difficulty_level=c.difficulty_level,
                proficiency_level=sc.proficiency_level,
                proficiency_numeric=num_level,
                score=round(sc.score, 2),
                confidence_score=round(sc.confidence_score, 2),
                is_verified=sc.is_verified,
                verified_at=sc.verified_at.isoformat() if sc.verified_at else None,
                supporting_skills_count=len(c.skill_mappings) if c.skill_mappings else 0,
                updated_at=sc.updated_at.isoformat() if sc.updated_at else None
            ))

        total_pages = math.ceil(total / limit) if total > 0 else 1

        return StudentCompetenciesPaginatedDTO(
            items=items,
            total=total,
            page=page,
            page_size=limit,
            total_pages=total_pages
        )

    async def get_student_competency_detail(
        self,
        db: AsyncSession,
        persona_identifier: str,
        competency_id_or_slug: str
    ) -> StudentCompetencyDetailDTO:
        repo = StudentRepository(db)
        student_id = await self._resolve_student_id(repo, persona_identifier)

        sc = await repo.get_student_competency_by_id_or_slug(student_id, competency_id_or_slug)
        if not sc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Student does not possess competency '{competency_id_or_slug}' or competency does not exist."
            )

        c = sc.competency
        try:
            prof_enum = ProficiencyLevel(sc.proficiency_level.upper())
            num_level = PROFICIENCY_NUMERIC_MAP[prof_enum]
        except (ValueError, KeyError, AttributeError):
            num_level = 3

        supporting_skills = []
        if c.skill_mappings:
            for scm in c.skill_mappings:
                s = scm.skill
                if s and s.status == "ACTIVE":
                    supporting_skills.append(SkillDTO(
                        id=s.id,
                        domain_id=s.domain_id,
                        name=s.name,
                        slug=s.slug,
                        description=s.description,
                        status=s.status,
                        is_primary=scm.is_primary,
                        relevance_weight=scm.relevance_weight
                    ))

        prereqs = []
        complements = []
        for rel in (c.outgoing_relationships or []):
            if rel.status == "ACTIVE" and rel.target_competency:
                dto = CompetencyRelationshipDTO(
                    id=rel.id,
                    target_competency_id=rel.target_competency.id,
                    target_competency_name=rel.target_competency.name,
                    target_competency_code=rel.target_competency.code,
                    relationship_type=rel.relationship_type,
                    weight=rel.weight or 1.0
                )
                if rel.relationship_type == "PREREQUISITE_FOR":
                    prereqs.append(dto)
                elif rel.relationship_type == "COMPLEMENTS":
                    complements.append(dto)

        # Demonstrated in student projects
        project_skills = await repo.get_student_demonstrated_skills(student_id)
        demonstrated_projects = []
        skill_names_lower = {s.name.lower() for s in supporting_skills}
        for ps in project_skills:
            if ps["skill"].lower() in skill_names_lower or c.name.lower() in ps["skill"].lower():
                if ps["project_title"] not in demonstrated_projects:
                    demonstrated_projects.append(ps["project_title"])

        return StudentCompetencyDetailDTO(
            id=sc.id,
            competency_id=c.id,
            competency_name=c.name,
            competency_code=c.code,
            competency_slug=c.slug,
            category=c.category_rel.name if c.category_rel else c.category,
            domain_code=c.domain_rel.code if c.domain_rel else None,
            difficulty_level=c.difficulty_level,
            proficiency_level=sc.proficiency_level,
            proficiency_numeric=num_level,
            score=round(sc.score, 2),
            confidence_score=round(sc.confidence_score, 2),
            is_verified=sc.is_verified,
            verified_at=sc.verified_at.isoformat() if sc.verified_at else None,
            supporting_skills_count=len(supporting_skills),
            updated_at=sc.updated_at.isoformat() if sc.updated_at else None,
            description=c.description,
            supporting_skills=supporting_skills,
            prerequisites=prereqs,
            complements=complements,
            demonstrated_in_projects=demonstrated_projects
        )

    async def derive_student_competencies(
        self,
        db: AsyncSession,
        persona_identifier: str,
        explicit_skills: Optional[List[Dict[str, Any]]] = None,
        include_projects: bool = True
    ) -> StudentCompetencyDeriveResponseDTO:
        repo = StudentRepository(db)
        student_id = await self._resolve_student_id(repo, persona_identifier)

        collected_inputs: List[Dict[str, Any]] = []
        if explicit_skills:
            collected_inputs.extend(explicit_skills)

        if include_projects:
            project_skills = await repo.get_student_demonstrated_skills(student_id)
            collected_inputs.extend(project_skills)

        if not collected_inputs:
            # Truthful empty derivation: nothing to derive
            records, total = await repo.get_student_competencies(student_id=student_id, limit=100)
            return StudentCompetencyDeriveResponseDTO(
                student_id=student_id,
                derived_count=0,
                updated_count=0,
                total_competencies=total,
                competencies=[],
                unresolved_skills=[]
            )

        aggregator = CompetencyProficiencyAggregator(db)
        agg_result = await aggregator.aggregate_skills_to_competencies(collected_inputs)

        derived_count = 0
        updated_count = 0

        for comp_data in agg_result["competencies"]:
            c_id = comp_data["competency_id"]
            p_level = comp_data["proficiency_level"]
            score = comp_data["aggregated_score"]
            is_ver = (comp_data["dominant_source"] == "VERIFIED_EVIDENCE")
            conf = 0.95 if is_ver else 0.80

            _, is_new = await repo.upsert_student_competency(
                student_id=student_id,
                competency_id=c_id,
                proficiency_level=p_level,
                score=score,
                confidence_score=conf,
                is_verified=is_ver
            )
            if is_new:
                derived_count += 1
            else:
                updated_count += 1

        # Fetch refreshed competencies
        refreshed_list = await self.get_student_competencies(db, student_id, page_size=100)

        return StudentCompetencyDeriveResponseDTO(
            student_id=student_id,
            derived_count=derived_count,
            updated_count=updated_count,
            total_competencies=refreshed_list.total,
            competencies=refreshed_list.items,
            unresolved_skills=agg_result.get("unresolved_skills", [])
        )

    async def get_student_competency_graph(
        self,
        db: AsyncSession,
        persona_identifier: str
    ) -> CompetencyGraphResponseDTO:
        repo = StudentRepository(db)
        student_id = await self._resolve_student_id(repo, persona_identifier)

        records, _ = await repo.get_student_competencies(student_id=student_id, limit=100)
        
        nodes: Dict[str, CompetencyGraphNodeDTO] = {}
        edges: List[CompetencyGraphEdgeDTO] = []
        comp_ids: set = set()

        for sc in records:
            c = sc.competency
            comp_ids.add(c.id)

            # 1. Competency Node
            nodes[c.id] = CompetencyGraphNodeDTO(
                id=c.id,
                label=c.code,
                name=c.name,
                type="competency",
                category=c.category,
                proficiency=sc.proficiency_level,
                score=round(sc.score, 2),
                is_verified=sc.is_verified
            )

            # 2. Domain Node & Edge
            if c.domain_rel:
                d = c.domain_rel
                if d.id not in nodes:
                    nodes[d.id] = CompetencyGraphNodeDTO(
                        id=d.id,
                        label=d.code,
                        name=d.name,
                        type="domain"
                    )
                edges.append(CompetencyGraphEdgeDTO(
                    id=f"edge-{c.id}-{d.id}",
                    source=c.id,
                    target=d.id,
                    relationship="BELONGS_TO",
                    weight=1.0
                ))

            # 3. Supporting Skills Nodes & Edges
            if c.skill_mappings:
                for scm in c.skill_mappings:
                    s = scm.skill
                    if s and s.status == "ACTIVE":
                        if s.id not in nodes:
                            nodes[s.id] = CompetencyGraphNodeDTO(
                                id=s.id,
                                label=s.slug,
                                name=s.name,
                                type="skill"
                            )
                        edges.append(CompetencyGraphEdgeDTO(
                            id=f"edge-{s.id}-{c.id}",
                            source=s.id,
                            target=c.id,
                            relationship="HAS_SKILL",
                            weight=scm.relevance_weight or 1.0
                        ))

        # 4. Inter-Competency Graph Edges from Step 1
        comp_repo = CompetencyRepository(db)
        all_edges = await comp_repo.get_all_relationships()
        for rel in all_edges:
            if rel.source_competency_id in comp_ids and rel.target_competency_id in comp_ids:
                edges.append(CompetencyGraphEdgeDTO(
                    id=rel.id,
                    source=rel.source_competency_id,
                    target=rel.target_competency_id,
                    relationship=rel.relationship_type,
                    weight=rel.weight or 1.0
                ))

        node_list = list(nodes.values())
        return CompetencyGraphResponseDTO(
            nodes=node_list,
            edges=edges,
            total_nodes=len(node_list),
            total_edges=len(edges)
        )

student_competency_service = StudentCompetencyService()
