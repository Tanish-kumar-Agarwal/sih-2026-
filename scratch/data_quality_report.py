import asyncio
import asyncpg
import json

async def run_data_quality_report():
    conn = await asyncpg.connect('postgresql://skillsetu_user:skillsetu_password@127.0.0.1:5432/skillsetu_db')
    
    # 1. Canonical skills count
    skills_count = await conn.fetchval("SELECT count(*) FROM skills WHERE status = 'ACTIVE';")
    
    # 2. Aliases count
    aliases_count = await conn.fetchval("SELECT count(*) FROM skill_aliases WHERE status = 'ACTIVE';")
    
    # 3. Skills without mappings in skill_competencies
    unmapped_skills = await conn.fetchval("""
        SELECT count(*) FROM skills s
        LEFT JOIN skill_competencies sc ON s.id = sc.skill_id
        WHERE s.status = 'ACTIVE' AND sc.id IS NULL;
    """)
    
    # 4. Competencies without skills
    empty_comps = await conn.fetchval("""
        SELECT count(*) FROM competencies c
        LEFT JOIN skill_competencies sc ON c.id = sc.competency_id
        WHERE c.status = 'ACTIVE' AND sc.id IS NULL;
    """)
    
    # 5. Aliases with duplicate normalized forms
    dup_norm_aliases = await conn.fetchval("""
        SELECT count(*) FROM (
            SELECT normalized_alias FROM skill_aliases
            GROUP BY normalized_alias HAVING count(*) > 1
        ) sub;
    """)
    
    # 6. Orphan mappings (referencing nonexistent skills or competencies)
    orphan_mappings = await conn.fetchval("""
        SELECT count(*) FROM skill_competencies sc
        LEFT JOIN skills s ON sc.skill_id = s.id
        LEFT JOIN competencies c ON sc.competency_id = c.id
        WHERE s.id IS NULL OR c.id IS NULL;
    """)
    
    # 7. Deprecated aliases
    deprecated_aliases = await conn.fetchval("SELECT count(*) FROM skill_aliases WHERE status = 'DEPRECATED';")

    report = {
        "canonical_skills_count": skills_count,
        "active_aliases_count": aliases_count,
        "skills_without_competency_mappings": unmapped_skills,
        "competencies_without_skills": empty_comps,
        "duplicate_normalized_aliases": dup_norm_aliases,
        "orphan_mappings": orphan_mappings,
        "deprecated_aliases": deprecated_aliases
    }

    with open("c:/Users/kukpo/OneDrive/Desktop/SIH26/scratch/step2_data_quality.json", "w") as f:
        json.dump(report, f, indent=2)
        
    print(json.dumps(report, indent=2))
    await conn.close()

if __name__ == "__main__":
    asyncio.run(run_data_quality_report())
