import asyncio
import asyncpg
import json

async def run_negative_tests():
    conn = await asyncpg.connect('postgresql://skillsetu_user:skillsetu_password@127.0.0.1:5432/skillsetu_db')
    results = {}
    
    # 1. Duplicate skill slug
    try:
        await conn.execute("""
            INSERT INTO skills (id, name, slug, status, source_type)
            VALUES ('sk-dup-test', 'Duplicate Python OOP', 'python-oop', 'ACTIVE', 'SYSTEM');
        """)
        results['duplicate_skill_slug'] = {'passed': False, 'error': 'Allowed duplicate slug!'}
    except Exception as e:
        results['duplicate_skill_slug'] = {'passed': True, 'error_class': e.__class__.__name__, 'msg': str(e)}

    # 2. Duplicate competency slug
    try:
        await conn.execute("""
            INSERT INTO competencies (id, name, code, slug, status, source_type)
            VALUES ('comp-dup-test', 'Duplicate Python', 'COMP-PY-DUP', 'python-engineering', 'ACTIVE', 'SYSTEM');
        """)
        results['duplicate_competency_slug'] = {'passed': False, 'error': 'Allowed duplicate competency slug!'}
    except Exception as e:
        results['duplicate_competency_slug'] = {'passed': True, 'error_class': e.__class__.__name__, 'msg': str(e)}

    # 3. Duplicate mapping (same skill_id + competency_id in skill_competencies)
    try:
        await conn.execute("""
            INSERT INTO skill_competencies (id, skill_id, competency_id, relevance_weight, is_primary)
            VALUES ('scm-dup-test', 'sk-py-oop', 'comp-python', 1.0, True);
        """)
        results['duplicate_skill_competency_mapping'] = {'passed': False, 'error': 'Allowed duplicate skill-competency mapping!'}
    except Exception as e:
        results['duplicate_skill_competency_mapping'] = {'passed': True, 'error_class': e.__class__.__name__, 'msg': str(e)}

    # 4. Invalid foreign key (nonexistent competency)
    try:
        await conn.execute("""
            INSERT INTO skill_competencies (id, skill_id, competency_id, relevance_weight, is_primary)
            VALUES ('scm-fk-test', 'sk-py-oop', 'comp-nonexistent-123', 1.0, True);
        """)
        results['invalid_competency_fk'] = {'passed': False, 'error': 'Allowed nonexistent competency foreign key!'}
    except Exception as e:
        results['invalid_competency_fk'] = {'passed': True, 'error_class': e.__class__.__name__, 'msg': str(e)}

    # 5. Self-relationship in competency_relationships
    try:
        await conn.execute("""
            INSERT INTO competency_relationships (id, source_competency_id, target_competency_id, relationship_type, weight, status)
            VALUES ('crel-self-test', 'comp-python', 'comp-python', 'PREREQUISITE_FOR', 1.0, 'ACTIVE');
        """)
        results['self_competency_relationship'] = {'passed': False, 'error': 'Allowed self-referencing relationship!'}
    except Exception as e:
        results['self_competency_relationship'] = {'passed': True, 'error_class': e.__class__.__name__, 'msg': str(e)}

    # 6. Duplicate role competency requirement (same role_id + competency_id)
    try:
        await conn.execute("""
            INSERT INTO role_competency_requirements (id, role_id, competency_id, required_proficiency, requirement_type, weight)
            VALUES ('rcr-dup-test', 'role-backend-dev', 'comp-python', 'EXPERT', 'MUST_HAVE', 1.0);
        """)
        results['duplicate_role_competency_requirement'] = {'passed': False, 'error': 'Allowed duplicate role requirement!'}
    except Exception as e:
        results['duplicate_role_competency_requirement'] = {'passed': True, 'error_class': e.__class__.__name__, 'msg': str(e)}

    # 7. Duplicate domain code
    try:
        await conn.execute("""
            INSERT INTO domains (id, code, name, status)
            VALUES ('dom-dup-test', 'GENERAL', 'Duplicate General', 'ACTIVE');
        """)
        results['duplicate_domain_code'] = {'passed': False, 'error': 'Allowed duplicate domain code!'}
    except Exception as e:
        results['duplicate_domain_code'] = {'passed': True, 'error_class': e.__class__.__name__, 'msg': str(e)}

    with open("c:/Users/kukpo/OneDrive/Desktop/SIH26/scratch/negative_test_results.json", "w") as f:
        json.dump(results, f, indent=2, default=str)
    print("Negative testing completed. Results written to scratch/negative_test_results.json")
    await conn.close()

if __name__ == "__main__":
    asyncio.run(run_negative_tests())
